import { SafeAreaView, TouchableOpacity, Text, View, Pressable, ImageBackground, Modal, Animated } from 'react-native';
import React, { useState, useEffect, useRef, useContext } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Profile from '../assets/svg/user_pf.svg';
import Background from '../assets/img/MenuBackground.png';
import BackIcon from '../assets/svg/back-icon.svg';
import styles from '../styles/stylesMenu';
import stylesSlate from '../styles/StylesSlate';
import { stylesEdit } from '../styles/stylesEdit';
import expoconfig from '../expoconfig';
import { Image } from 'react-native';
import { Audio } from 'expo-av';  // Import expo-av to play audio
import { AuthContext } from '../context/AuthContext';
import Sound from 'react-native-sound';

const Quackslate = () => {
    const { gameCode } = useLocalSearchParams();
    const [shuffledButtons, setShuffledButtons] = useState([]);
    const [selectedAnswers, setSelectedAnswers] = useState([]);
    const [timer, setTimer] = useState(10);
    const [content, setContent] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [japaneseText, setJapaneseText] = useState('');
    const [englishText, setEnglishText] = useState('');
    const [correctAnswer, setCorrectAnswer] = useState('');
    const [isGameFinished, setIsGameFinished] = useState(false);
    const [isWaitingForNext, setIsWaitingForNext] = useState(false);
    const [isAnswerModalVisible, setIsAnswerModalVisible] = useState(false);
    const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
    const [score, setScore] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [isLastQuestionAnswered, setIsLastQuestionAnswered] = useState(false);
    const pollingInterval = useRef(null);
    const router = useRouter();
    const isMounted = useRef(true);
    const [opacity] = useState(new Animated.Value(1)); // Start opacity at 1 (visible)
    const colorAnimation = useState(new Animated.Value(0))[0]; // 0 for normal, 1 for warning (red/orange)
    let sound = new Audio.Sound();
    const backgroundMusic = useRef(new Audio.Sound());
    const correctGif = require('../assets/gif/correct.gif');
    const incorrectGif = require('../assets/gif/wrong.gif');
    const image = isAnswerCorrect ? correctGif : incorrectGif;
    const { user } = useContext(AuthContext); 
    const [classCode, setClassCode] = useState(null);
    

    const fetchClassCodeByEmail = async (email) => {
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
            backgroundMusic.current.unloadAsync();
            console.log("Background music stopped.");
        };
    }, []);
    


// Define your sound object

const playAnswerSound = async (isCorrect: boolean) => {
  const soundSource = isCorrect
    ? require('../assets/audio/sfx/correct.mp3') // Correct answer sound
    : require('../assets/audio/sfx/incorrect.mp3'); // Incorrect answer sound

  try {
    await sound.unloadAsync(); // Unload any previous sounds
    await sound.loadAsync(soundSource); // Load the new sound

    // Set the volume to a low level (0.1 is a low volume, you can adjust this)
    await sound.setVolumeAsync(0.1);

    await sound.playAsync(); // Play the sound
  } catch (error) {
    console.error('Error playing sound:', error);
  }
};


  useEffect(() => {
    if (isAnswerModalVisible) {
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


    const handleBackPress = () => {
        console.log("Navigating back to QuackslateMenu...");
        clearPolling();
        clearTimer();
    
        // Ensure modals are hidden but retain other states as they are
        setIsAnswerModalVisible(false);
    
        // IMPORTANT: Do NOT reset `isGameFinished` or other key states here
        router.push('/QuackslateMenu');
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
    
            const response = await fetch(`${expoconfig.API_URL}/api/quackslateContent/getAllQuackslateContent`);
            if (response.ok) {
                const data = await response.json();
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
    const loadNextQuestion = (index, data = content) => {
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
            if (!gameCode || isWaitingForNext || isGameFinished) {
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
            if (data.currentQuestionIndex > currentIndex) {
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
    
        return () => {
            isMounted.current = false;
            clearPolling();
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
        pollingInterval.current = setInterval(pollForNextQuestion, 3000);

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

    const handleGameButtonPress = (button) => {
        if (selectedAnswers.length < 4 && !selectedAnswers.includes(button) && !isWaitingForNext) {
            setSelectedAnswers([...selectedAnswers, button]);
        }
    };

    const handleSubmit = () => {
        if (isGameFinished || isWaitingForNext || !isMounted.current) {
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
    
            setTimeout(async () => {
                if (isMounted.current) {
                    setIsAnswerModalVisible(false);
                    setIsGameFinished(true);
                    
                    // Save the new score directly instead of relying on state
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

    const shuffleButtons = (buttons) => {
        const shuffled = buttons.sort(() => Math.random() - 0.5);
        setShuffledButtons(shuffled);
    };

    const formatTime = (time) => `Timer: 0:${time < 10 ? `0${time}` : time}`;

    useEffect(() => {
        console.log("Timer:", timer);
        console.log("isGameFinished:", isGameFinished);
        console.log("isAnswerModalVisible:", isAnswerModalVisible);
        console.log("currentIndex:", currentIndex);
        console.log("content:", content);
    }, [timer, isGameFinished, isAnswerModalVisible, currentIndex, content]);

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ImageBackground source={Background} style={styles.backgroundImage}>
                <View style={styles.container}>
                    <View style={[styles.header, { padding: 20 }]}>
                        <TouchableOpacity onPress={handleBackPress}>
                            <View style={stylesEdit.backButtonContainer}>
                                <BackIcon width={20} height={20} fill={'white'} />
                            </View>
                        </TouchableOpacity>
                        <View style={styles.leftContainer}></View>
                        <View style={styles.rightContainer}>
                            <Pressable onPress={() => router.push('/Profile')}>
                                <Profile width={65} height={65} />
                            </Pressable>
                        </View>
                    </View>

                    <View style={stylesSlate.timerContainer}>
          <Animated.Text style={[stylesSlate.timerText, { color: timerColor }]}>
            {formatTime(timer)}
          </Animated.Text>
        </View>

                    <View style={stylesSlate.centeredContainer}>
                        <Text style={stylesSlate.japaneseText}>{japaneseText}</Text>
                        <Text style={stylesSlate.englishText}>{englishText}</Text>
                    </View>

                    <View style={stylesSlate.selectedAnswersContainer}>
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
                            <Text style={stylesSlate.submitButtonText}>Submit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={stylesSlate.resetButton}
                            onPress={() => {
                                setSelectedAnswers([]); // Clear the selected answers
                                console.log("Answers have been reset.");
                            }}
                        >
                            <Text style={stylesSlate.resetButtonText}>Reset</Text>
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
                    <View style={stylesSlate.modalContent}>
                        {/* Display the appropriate GIF */}
                        <Image
                        source={image}
                        style={stylesSlate.modalImage} // Adjust your styles as needed
                        resizeMode="contain"
                        />
                        <Text style={stylesSlate.modalTitle}>
                        {isAnswerCorrect ? 'Correct Answer!' : 'Incorrect Answer!'}
                        </Text>
                    </View>
                    <Text style={stylesSlate.modalText}>
                        {isLastQuestionAnswered
                        ? 'This was the last question!'
                        : 'Waiting for the next question...'}
                    </Text>
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
                                <Text style={stylesSlate.modalTitle}>Quiz Complete</Text>
                                <Text style={stylesSlate.modalText}>
                                    Your score is: {score}/{content.length}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => {
                                        console.log("Navigating back to QuackslateMenu and cleaning up states...");
                                        clearPolling(); // Stop polling
                                        clearTimer(); // Stop and reset the timer
                                        setIsAnswerModalVisible(false); // Ensure answer modal is hidden
                                        setIsGameFinished(false); // Ensure the "Quiz Complete" modal is dismissed
                                        setCurrentIndex(null); // Reset index
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
