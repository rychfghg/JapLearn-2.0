import { SafeAreaView, TouchableOpacity, Text, View, ImageBackground, Modal, Animated } from 'react-native';
import React, { useState, useEffect, useRef, useContext } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
const Background = require('../assets/quackslate-twilight-workshop-v4.png');
import BackIcon from '../assets/svg/back-icon.svg';
import styles from '../styles/stylesMenu';
import stylesSlate from '../styles/StylesSlate';
import { stylesEdit } from '../styles/stylesEdit';
import expoconfig from '../expoconfig';
import { Image } from 'react-native';
import { Audio } from 'expo-av';  // Import expo-av to play audio
import { AuthContext } from '../context/AuthContext';

type SlateContent = {
    englishWord: string;
    translatedWord: string;
    options: string[];
    correctAnswer: string;
    wrongAnswer?: string;
    explanation?: string;
};

const Quackslate = () => {
    const { gameCode, mode } = useLocalSearchParams();
    const isSystemMode = mode === 'system';
    const [shuffledButtons, setShuffledButtons] = useState<string[]>([]);
    const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
    const [timer, setTimer] = useState(10);
    const [content, setContent] = useState<SlateContent[]>([]);
    const [currentIndex, setCurrentIndex] = useState<number | null>(0);
    const [japaneseText, setJapaneseText] = useState('');
    const [englishText, setEnglishText] = useState('');
    const [correctAnswer, setCorrectAnswer] = useState('');
    const [answerExplanation, setAnswerExplanation] = useState('');
    const [isGameFinished, setIsGameFinished] = useState(false);
    const [isWaitingForNext, setIsWaitingForNext] = useState(false);
    const [isAnswerModalVisible, setIsAnswerModalVisible] = useState(false);
    const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
    const [score, setScore] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [isLastQuestionAnswered, setIsLastQuestionAnswered] = useState(false);
    const pollingInterval = useRef<ReturnType<typeof setInterval> | null>(null);
    const completionTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const nextQuestionTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hasExited = useRef(false);
    const router = useRouter();
    const isMounted = useRef(true);
    const [opacity] = useState(new Animated.Value(1)); // Start opacity at 1 (visible)
    const colorAnimation = useState(new Animated.Value(0))[0]; // 0 for normal, 1 for warning (red/orange)
    const answerSound = useRef(new Audio.Sound());
    const backgroundMusic = useRef(new Audio.Sound());
    const correctGif = require('../assets/gif/correct.gif');
    const incorrectGif = require('../assets/gif/wrong.gif');
    const image = isAnswerCorrect ? correctGif : incorrectGif;
    const { user } = useContext(AuthContext); 
    const [classCode, setClassCode] = useState(null);
    

    const fetchClassCodeByEmail = async (email: string) => {
        try {
            const response = await fetch(`${expoconfig.API_URL}/api/users/${email}/classCode`);
            if (!response.ok) {
                console.error('Failed to fetch classCode:', await response.text());
                return null;
            }
            const data = await response.json();
            return data.classCode; // Extract the classCode from the response
        } catch (error) {
            console.error('Error fetching classCode:', error);
            return null;
        }
    };

    useEffect(() => {
        const playBackgroundMusic = async () => {
            try {
                await backgroundMusic.current.loadAsync(require('../assets/audio/sfx/quiz.mp3')); // Path to quiz.mp3
                if (hasExited.current) {
                    await backgroundMusic.current.unloadAsync();
                    return;
                }
                await backgroundMusic.current.setVolumeAsync(0.1); // Set the volume to low
                await backgroundMusic.current.setIsLoopingAsync(true);
                await backgroundMusic.current.playAsync(); // Play the background music
                console.log("Background music started...");
            } catch (error) {
                console.error("Error loading or playing background music:", error);
            }
        };
    
        playBackgroundMusic();
    
        return () => {
            // Unload the music when the component unmounts to stop it
            void backgroundMusic.current.stopAsync().catch(() => undefined);
            void backgroundMusic.current.unloadAsync().catch(() => undefined);
            console.log("Background music stopped.");
        };
    }, []);
    


// Define your sound object

const playAnswerSound = async (isCorrect: boolean) => {
  const soundSource = isCorrect
    ? require('../assets/audio/sfx/correct.mp3') // Correct answer sound
    : require('../assets/audio/sfx/incorrect.mp3'); // Incorrect answer sound

  try {
    await answerSound.current.unloadAsync();
    if (hasExited.current) return;
    await answerSound.current.loadAsync(soundSource);

    // Set the volume to a low level (0.1 is a low volume, you can adjust this)
    await answerSound.current.setVolumeAsync(0.1);

    if (!hasExited.current) await answerSound.current.playAsync();
  } catch (error) {
    console.error('Error playing sound:', error);
  }
};


  useEffect(() => {
    if (isAnswerModalVisible && !hasExited.current) {
      playAnswerSound(isAnswerCorrect); // Play sound when modal is shown
    }
  }, [isAnswerModalVisible, isAnswerCorrect]);

    useEffect(() => {
        // Handle color change when the timer gets low (3 seconds or below)
        if (timer <= 3) {
          Animated.timing(colorAnimation, {
            toValue: 1, // Transition to warning color
            duration: 500, // Duration for the transition
            useNativeDriver: false,
          }).start();
        } else {
          Animated.timing(colorAnimation, {
            toValue: 0, // Transition back to normal color
            duration: 500, // Duration for the transition
            useNativeDriver: false,
          }).start();
        }
      }, [timer]);

      const timerColor = colorAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: ['black', 'red'], // Change color to orange when timer is low
      });


    const stopGame = () => {
        hasExited.current = true;
        isMounted.current = false;
        clearPolling();
        if (completionTimeout.current) clearTimeout(completionTimeout.current);
        if (nextQuestionTimeout.current) clearTimeout(nextQuestionTimeout.current);
        completionTimeout.current = null;
        nextQuestionTimeout.current = null;
        setIsAnswerModalVisible(false);
        setIsGameFinished(false);
        setIsWaitingForNext(true);
        setIsLastQuestionAnswered(false);
        setCurrentIndex(null);
        setTimer(0);
        void answerSound.current.stopAsync().catch(() => undefined);
        void answerSound.current.unloadAsync().catch(() => undefined);
        void backgroundMusic.current.stopAsync().catch(() => undefined);
        void backgroundMusic.current.unloadAsync().catch(() => undefined);
    };

    const handleBackPress = () => {
        console.log("Stopping QuackSlate and returning to its menu...");
        stopGame();
        router.replace('/QuackslateMenu');
    };
    
    

    const clearPolling = () => {
        if (pollingInterval.current) {
            clearInterval(pollingInterval.current);
            pollingInterval.current = null;
            console.log('Polling stopped.');
        }
    };

    const clearTimer = () => {
        if (isMounted.current) {
            setTimer(0); // Reset the timer to zero
            console.log("Timer cleared.");
        }
    };

    // Fetch content from API
    const fetchContent = async () => {
        try {
            if (isGameFinished || currentIndex === null) {
                console.log("Game finished or navigating back. Skipping content fetch.");
                return; // Prevent fetch when navigating away or game is finished
            }
    
            const response = await fetch(isSystemMode
                ? `${expoconfig.API_URL}/api/quackslate/question-bank/system?limit=10`
                : `${expoconfig.API_URL}/api/quackslateContent/getByGameCode/${gameCode}`);
            if (response.ok) {
                const rawData = await response.json();
                const data: SlateContent[] = isSystemMode ? rawData.map((item: any) => ({
                    englishWord: item.prompt,
                    translatedWord: item.translation,
                    options: item.options,
                    correctAnswer: item.correctAnswer,
                    explanation: item.explanation,
                    wrongAnswer: ''
                })) : rawData;
                setContent(data);
                console.log("Content fetched:", data);
    
                if (currentIndex === 0 && data.length > 0) {
                    loadNextQuestion(0, data);
                }
            } else {
                console.error("Failed to fetch content.");
            }
        } catch (error) {
            console.error("Error fetching content:", error);
        }
    };
    

    // Load next question based on the current index
    const loadNextQuestion = (index: number, data: SlateContent[] = content) => {
        if (isGameFinished || index === null || !isMounted.current) {
            console.log("Skipping question load: Game finished or no valid index.");
            return; // Prevent execution if navigation has occurred
        }
    
        if (!data[index]) {
            console.log("No content available for index:", index);
            return;
        }
    
        const currentContent = data[index];
        setJapaneseText(currentContent.englishWord);
        setEnglishText(currentContent.translatedWord);
        setCorrectAnswer(currentContent.correctAnswer);
        setAnswerExplanation(currentContent.explanation || 'Review the word order and try the sentence again.');
    
        // Default wrongAnswer to an empty string if it's null or undefined
        const wrongAnswer = currentContent.wrongAnswer || ''; 
    
        // Split wrongAnswer into separate words and add them to the options only if it's not an empty string
        let allOptions = [...currentContent.options];
    
        if (wrongAnswer) {
            const wrongAnswerWords = wrongAnswer.split(' '); // Split the wrongAnswer by spaces
            allOptions = [...allOptions, ...wrongAnswerWords]; // Add the split words to options
        }
    
        shuffleButtons(allOptions); // Shuffle the options including the wrong answer words
    
        resetTimer();
        setSelectedAnswers([]); // Reset selected answers
        setIsWaitingForNext(false);
        setIsAnswerModalVisible(false); // Ensure modal is hidden
    
        console.log("Loaded content for index:", index, currentContent);
    };
    

    const pollForNextQuestion = async () => {
        try {
            if (isSystemMode || !gameCode || isWaitingForNext || isGameFinished) {
                console.log("Polling skipped. Either the quiz is finished, waiting for next question, or gameCode is missing.");
                return; // Skip polling if the quiz is finished or in waiting state
            }

            const url = `${expoconfig.API_URL}/api/quackslateLevels/getCurrentQuestionIndex/${gameCode}`;
            console.log("Polling for next question from URL:", url);

            const response = await fetch(url);

            if (!response.ok) {
                console.error(`Error polling next question index: ${response.status} ${response.statusText}`);
                return;
            }

            const data = await response.json();
            console.log("Polled currentQuestionIndex:", data.currentQuestionIndex);

            // Check if the current index has changed
            if (currentIndex !== null && data.currentQuestionIndex > currentIndex) {
                setCurrentIndex(data.currentQuestionIndex); // Update the currentIndex
                console.log("New index received. Current index updated:", data.currentQuestionIndex);
                loadNextQuestion(data.currentQuestionIndex); // Load the new question content
            }
        } catch (error) {
            console.error("Error polling for the next question:", error);
        }
    };

    useEffect(() => {
        if (currentIndex !== null && !isGameFinished) {
            // Ensure the first question loads only if content is available
            if (currentIndex === 0 && content.length > 0) {
                loadNextQuestion(0, content);
            } else if (currentIndex > 0) {
                loadNextQuestion(currentIndex, content);
            }
        } else {
            console.log("Skipping loadNextQuestion: Returning to menu or game finished.");
        }
    }, [currentIndex]);

    useEffect(() => {
        isMounted.current = true;
        hasExited.current = false;
    
        return () => {
            isMounted.current = false;
            hasExited.current = true;
            clearPolling();
            if (completionTimeout.current) clearTimeout(completionTimeout.current);
            if (nextQuestionTimeout.current) clearTimeout(nextQuestionTimeout.current);
            clearTimer();
            setIsAnswerModalVisible(false); // Ensure no modal visibility issues
            // Do not reset `isGameFinished` here
            setIsWaitingForNext(false);
            setSelectedAnswers([]);
            console.log("Component unmounted. Cleanup complete.");
        };
    }, []);
    
    

    useEffect(() => {
        fetchContent(); // Fetch content when component mounts

        // Start polling for the next question every 3 seconds
        if (!isSystemMode) pollingInterval.current = setInterval(pollForNextQuestion, 3000);

        return () => {
            // Cleanup logic on unmount
            clearPolling();
            clearTimer();
            setIsAnswerModalVisible(false);
            setIsGameFinished(false);
            setIsWaitingForNext(false);
            setIsLastQuestionAnswered(false);
            setTimer(0);
            setScore(0);
            setSelectedAnswers([]);
            setCurrentIndex(0);
        };
    }, []);

    useEffect(() => {
        if (isGameFinished) {
            clearPolling(); // Stop polling when the game finishes
            clearTimer(); // Clear the timer
        }
    }, [isGameFinished]);

    const handleGameButtonPress = (button: string) => {
        if (selectedAnswers.length < shuffledButtons.length && !selectedAnswers.includes(button) && !isWaitingForNext) {
            setSelectedAnswers([...selectedAnswers, button]);
        }
    };

    const handleSubmit = () => {
        if (isGameFinished || isWaitingForNext || !isMounted.current || currentIndex === null) {
            return;
        }
    
        const correctAnswerArray = correctAnswer.split(' ').map((word) => word.trim().toLowerCase());
        const selectedAnswersArray = selectedAnswers.map((word) => word.trim().toLowerCase());
    
        const isAnswerCorrect =
            selectedAnswersArray.length === correctAnswerArray.length &&
            selectedAnswersArray.every((word, index) => word === correctAnswerArray[index]);
    
        setIsAnswerCorrect(isAnswerCorrect);
    
        // Calculate new score
        const newScore = isAnswerCorrect ? score + 1 : score;
        setScore(newScore);
    
        if (currentIndex === content.length - 1 && isMounted.current) {
            setIsLastQuestionAnswered(true);
            setIsAnswerModalVisible(true);
            setIsWaitingForNext(true);
    
            completionTimeout.current = setTimeout(async () => {
                if (isMounted.current && !hasExited.current) {
                    setIsAnswerModalVisible(false);
                    setIsGameFinished(true);
                    
                    // Save the new score directly instead of relying on state
                    if (!user) return;
                    const scoreData = {
                        gameCode,
                        classCode: await fetchClassCodeByEmail(user.email),
                        name: `${user.fname} ${user.lname}`,
                        email: user.email,
                        date: new Date().toISOString().split('T')[0],
                        score: newScore  // Use the calculated score instead of the state
                    };
    
                    try {
                        const response = await fetch(`${expoconfig.API_URL}/api/scores/save`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(scoreData)
                        });
                        if (!response.ok) {
                            throw new Error('Failed to save score');
                        }
                        console.log('Score saved successfully:', newScore);
                    } catch (error) {
                        console.error('Error saving score:', error);
                    }
    
                    setIsLastQuestionAnswered(false);
                }
            }, 3000);
        } else if (isMounted.current && !isGameFinished && isSystemMode) {
            setIsWaitingForNext(true);
            setTimer(0);
            setIsAnswerModalVisible(true);
            nextQuestionTimeout.current = setTimeout(() => {
                if (!isMounted.current || hasExited.current) return;
                const nextIndex = currentIndex + 1;
                setCurrentIndex(nextIndex);
                loadNextQuestion(nextIndex, content);
            }, 1200);
        } else if (isMounted.current && !isGameFinished) {
            setIsWaitingForNext(true);
            setTimer(0);
            setIsAnswerModalVisible(true);
        }
    };
    


    useEffect(() => {
        if (isWaitingForNext || isGameFinished || !isMounted.current) {
            console.log("Timer logic skipped: waiting for next or game finished.");
            return; // Prevent execution
        }
    
        if (timer > 0) {
            const countdown = setTimeout(() => {
                if (isMounted.current) {
                    setTimer((prevTimer) => prevTimer - 1);
                }
            }, 1000);
    
            return () => clearTimeout(countdown);
        } else {
            if (!isGameFinished && isMounted.current) {
                console.log("Timer hit zero, submitting answer...");
                handleSubmit(); // Only submit if game is still active
            }
        }
    }, [timer, isWaitingForNext, isGameFinished]);
    
    

    const resetTimer = () => setTimer(10);

    const shuffleButtons = (buttons: string[]) => {
        const shuffled = [...buttons];

        // Fisher-Yates gives every tile position an equal chance and does not
        // mutate the options received from the backend.
        for (let index = shuffled.length - 1; index > 0; index -= 1) {
            const randomIndex = Math.floor(Math.random() * (index + 1));
            [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
        }

        // A valid shuffle can occasionally return the original order. Rotate
        // once so the choices are visibly rearranged whenever possible.
        const unchanged = shuffled.length > 1 && shuffled.every((button, index) => button === buttons[index]);
        if (unchanged) shuffled.push(shuffled.shift() as string);

        setShuffledButtons(shuffled);
    };

    useEffect(() => {
        console.log("Timer:", timer);
        console.log("isGameFinished:", isGameFinished);
        console.log("isAnswerModalVisible:", isAnswerModalVisible);
        console.log("currentIndex:", currentIndex);
        console.log("content:", content);
    }, [timer, isGameFinished, isAnswerModalVisible, currentIndex, content]);

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ImageBackground source={Background} style={{ flex: 1 }} resizeMode="cover">
                <View style={stylesSlate.gameScreen}>
                    <View style={stylesSlate.gameHeader}>
                        <TouchableOpacity onPress={handleBackPress}>
                            <View style={stylesEdit.backButtonContainer}>
                                <BackIcon width={20} height={20} fill={'white'} />
                            </View>
                        </TouchableOpacity>
                        <View style={stylesSlate.roundPill}>
                            <Text style={stylesSlate.roundEyebrow}>QUACKSLATE</Text>
                            <Text style={stylesSlate.roundText}>{(currentIndex ?? 0) + 1} / {content.length || 1}</Text>
                        </View>
                        <View style={stylesSlate.timerContainer}>
                            <Animated.Text style={[stylesSlate.timerText, { color: timerColor }]}>{timer}s</Animated.Text>
                        </View>
                    </View>

                    <View style={stylesSlate.challengeCard}>
                        <Text style={stylesSlate.challengeLabel}>SENTENCE BLUEPRINT</Text>
                        <Text style={stylesSlate.challengeInstruction}>Build this sentence in Japanese</Text>
                        <Text style={stylesSlate.japaneseText}>{japaneseText}</Text>
                    </View>

                    <View style={stylesSlate.selectedAnswersContainer}>
                        {selectedAnswers.length === 0 && <Text style={stylesSlate.answerPlaceholder}>Tap the word tiles in the correct order</Text>}
                        {selectedAnswers.map((answer, index) => (
                            <View key={index} style={stylesSlate.selectedTextBox}>
                                <Text style={stylesSlate.selectedText}>{answer}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={stylesSlate.buttonContainer}>
                        {shuffledButtons.map((button, index) => (
                            <TouchableOpacity
                                key={index}
                                style={stylesSlate.gameButton}
                                onPress={() => handleGameButtonPress(button)}
                                disabled={isWaitingForNext}
                            >
                                <Text style={stylesSlate.gameButtonText}>{button}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={stylesSlate.submitResetContainer}>
                        <TouchableOpacity style={stylesSlate.submitButton} onPress={handleSubmit} disabled={isWaitingForNext}>
                            <Text style={stylesSlate.submitButtonText}>Check sentence</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={stylesSlate.resetButton}
                            onPress={() => {
                                setSelectedAnswers([]); // Clear the selected answers
                                console.log("Answers have been reset.");
                            }}
                        >
                            <Text style={stylesSlate.resetButtonText}>Clear tiles</Text>
                        </TouchableOpacity>
                        </View>
                                    <Modal
                animationType="slide"
                transparent={true}
                visible={isAnswerModalVisible}
                onRequestClose={() => setIsAnswerModalVisible(false)}
                >
                <View style={stylesSlate.modalContainer}>
                    <View style={stylesSlate.modalView}>
                    <View style={[stylesSlate.feedbackAccent, isAnswerCorrect ? stylesSlate.feedbackAccentCorrect : stylesSlate.feedbackAccentWrong]} />
                    <View style={stylesSlate.modalContent}>
                        {/* Display the appropriate GIF */}
                        <Image
                        source={image}
                        style={stylesSlate.modalImage} // Adjust your styles as needed
                        resizeMode="contain"
                        />
                        <Text style={stylesSlate.modalTitle}>
                        {isAnswerCorrect ? 'Sentence complete!' : 'Not quite yet'}
                        </Text>
                    </View>
                    <Text style={stylesSlate.modalText}>
                        Correct sentence: {englishText}
                    </Text>
                    <Text style={stylesSlate.modalExplanation}>{answerExplanation}</Text>
                    <Text style={stylesSlate.modalWaiting}>{isLastQuestionAnswered ? 'Final question completed' : isSystemMode ? 'Preparing the next challenge...' : 'Waiting for your teacher...'}</Text>
                    </View>
                </View>
                </Modal>


                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={isGameFinished}
                        onRequestClose={() => !isGameFinished}
                    >
                        <View style={stylesSlate.modalContainer}>
                            <View style={stylesSlate.modalView}>
                                <View style={stylesSlate.completionMark}><Text style={stylesSlate.completionMarkText}>✓</Text></View>
                                <Text style={stylesSlate.completionEyebrow}>QUACKSLATE COMPLETE</Text>
                                <Text style={stylesSlate.modalTitle}>Sentence workshop cleared!</Text>
                                <Text style={stylesSlate.modalText}>
                                    Your score is: {score}/{content.length}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => {
                                        console.log("Navigating back to QuackslateMenu and cleaning up states...");
                                        stopGame();
                                        router.replace('/QuackslateMenu'); // Replace to prevent back navigation
                                    }}
                                    style={stylesSlate.modalButton}
                                >
                                    <Text style={stylesSlate.modalButtonText}>Return to Menu</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                </View>
            </ImageBackground>
        </SafeAreaView>
    );
};

export default Quackslate;
