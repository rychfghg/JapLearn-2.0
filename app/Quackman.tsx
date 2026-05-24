import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, Modal, Animated, Easing } from 'react-native';
import { stylesQuackman } from '../styles/stylesQuackman';
import { stylesClass } from '../styles/stylesClass';
import BackIcon from '../assets/svg/back-icon.svg';
import CustomButton from '../components/CustomButton';
import expoconfig from '../expoconfig';
import { router } from 'expo-router';
import { Audio } from 'expo-av';

const allRomaji = [
    'a', 'i', 'u', 'e', 'o', 'ka', 'ki', 'ku', 'ke', 'ko', 'sa', 'shi', 'su', 'se', 'so', 'ta', 'chi', 'tsu', 'te', 'to',
    'na', 'ni', 'nu', 'ne', 'no', 'ha', 'hi', 'fu', 'he', 'ho', 'ma', 'mi', 'mu', 'me', 'mo', 'ya', 'yu', 'yo', 'ra', 'ri',
    'ru', 're', 'ro', 'wa', 'wo', 'n', 'ga', 'gi', 'gu', 'ge', 'go', 'za', 'ji', 'zu', 'ze', 'zo', 'da', 'ji', 'zu', 'de',
    'do', 'ba', 'bi', 'bu', 'be', 'bo', 'pa', 'pi', 'pu', 'pe', 'po'
];

const Quackman = ({ navigation }) => {
    const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
    const [data, setData] = useState([]);
    const [romajiGrid, setRomajiGrid] = useState([]);
    const [inputRomaji, setInputRomaji] = useState([]);
    const [currentHint, setCurrentHint] = useState('');
    const [wordLength, setWordLength] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);
    const [introModalVisible, setIntroModalVisible] = useState(true);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [attempts, setAttempts] = useState([null, null, null]);
    const [gameOver, setGameOver] = useState(false);
    const [characterImage, setCharacterImage] = useState(require('../assets/Idle_TrapDoor.png'));
    const [userInteracted, setUserInteracted] = useState(false); // Track if the user interacted

    // Angel animation states
    const [showAngel, setShowAngel] = useState(false);
    const angelPosition = useState(new Animated.Value(300))[0]; // Start from below the screen

    const [isLoading, setIsLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const fadeAnim = new Animated.Value(1);
    const [sound, setSound] = useState();
    const [correctSound, setCorrectSound] = useState();
    const [incorrectSound, setIncorrectSound] = useState();

    // Background music
    const [bgMusic, setBgMusic] = useState();

    useEffect(() => {
        const simulateProgress = () => {
            if (progress >= 100) {
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }).start(() => {
                    setIsLoading(false);
                });
                return;
            }
    
            const randomDelay = Math.random() * 1000 + 500;
            const randomIncrement = Math.min(100 - progress, Math.random() * 10 + 5);
            setTimeout(() => {
                setProgress((prev) => Math.min(100, prev + randomIncrement));
                simulateProgress();
            }, randomDelay);
        };
    
        simulateProgress();
    }, [progress]);
    

    useEffect(() => {
        const loadSounds = async () => {
            const { sound: quackmanSound } = await Audio.Sound.createAsync(
                require('../assets/audio/sfx/quackmanselect.mp3')
            );
            const { sound: correctSfx } = await Audio.Sound.createAsync(
                require('../assets/audio/sfx/correct_sfx.mp3')
            );
            const { sound: incorrectSfx } = await Audio.Sound.createAsync(
                require('../assets/audio/sfx/incorrect_sfx.mp3')
            );

            setSound(quackmanSound);
            setCorrectSound(correctSfx);
            setIncorrectSound(incorrectSfx);
        };

        const loadBackgroundMusic = async () => {
            const { sound: backgroundMusic } = await Audio.Sound.createAsync(
                require('../assets/audio/sfx/quackmanbg.mp3'),
                { isLooping: true } // Loop the background music
            );
            await backgroundMusic.setVolumeAsync(0.1); // Set the volume to 20%
            setBgMusic(backgroundMusic);
        };

        loadSounds();
        loadBackgroundMusic();

        return () => {
            if (sound) sound.unloadAsync();
            if (correctSound) correctSound.unloadAsync();
            if (incorrectSound) incorrectSound.unloadAsync();
            if (bgMusic) bgMusic.unloadAsync();
        };
    }, []);

    const playSound = async () => {
        const { sound } = await Audio.Sound.createAsync(
            require('../assets/audio/sfx/quackmanselect.mp3')
        );
        setSound(sound);
        await sound.playAsync();
    };

    const handleUserInteraction = async () => {
        setUserInteracted(true); // Mark the user as interacted
        if (bgMusic) {
            try {
                await bgMusic.playAsync(); // Play background music
            } catch (error) {
                console.error("Failed to play background music after user interaction:", error);
            }
        }
    };

    useEffect(() => {
        const simulateProgress = () => {
            if (progress >= 100) {
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }).start(() => {
                    setIsLoading(false);
                });
                return;
            }

            const randomDelay = Math.random() * 1000 + 500;
            const randomIncrement = Math.min(100 - progress, Math.random() * 10 + 5);
            const delayMultiplier = [45, 75].includes(progress) ? 2000 : randomDelay;

            setTimeout(() => {
                setProgress((prev) => Math.min(100, prev + randomIncrement));
                simulateProgress();
            }, delayMultiplier);
        };

        simulateProgress();
    }, [progress]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${expoconfig.API_URL}/api/quackmancontent`);
                const json = await response.json();
                if (json.length > 0) {
                    const transformedData = json.map((item) => ({
                        hint: item.description,
                        word: syllabifyWord(item.romajiWord),
                    }));
                    setData(transformedData);
                    loadWord(0);
                } else {
                    console.error("No content received from the backend.");
                }
            } catch (error) {
                console.error("Failed to fetch data:", error);
            }
        };

        fetchData();
    }, []);

    const syllabifyWord = (word) => {
        let syllables = [];
        let i = 0;
        while (i < word.length) {
            let found = false;
            for (let len = 2; len > 0; len--) {
                let sub = word.slice(i, i + len);
                if (allRomaji.includes(sub)) {
                    syllables.push(sub);
                    i += len;
                    found = true;
                    break;
                }
            }
            if (!found) {
                console.error(`Invalid syllable in word '${word}' at position ${i}`);
                return [];
            }
        }
        return syllables;
    };

    useEffect(() => {
        if (data.length > 0) {
            loadWord(currentWordIndex);
        }
    }, [currentWordIndex, data]);

    const loadWord = (index) => {
        if (index < data.length) {
            const selectedData = data[index];
            const { hint, word } = selectedData;

            setCurrentHint(hint);
            setWordLength(word.length);
            const grid = fillGrid(word, allRomaji, 12);
            setRomajiGrid(grid);
            setInputRomaji([]);
            setAttempts([null, null, null]);
            setCharacterImage(require('../assets/Idle_TrapDoor.png'));
        }
    };

    const fillGrid = (syllables, allSyllables, gridSize) => {
        const filledGrid = [...syllables];

        while (filledGrid.length < gridSize) {
            const randomIndex = Math.floor(Math.random() * allSyllables.length);
            const randomRomaji = allSyllables[randomIndex];
            if (!filledGrid.includes(randomRomaji)) {
                filledGrid.push(randomRomaji);
            }
        }

        for (let i = filledGrid.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [filledGrid[i], filledGrid[j]] = [filledGrid[j], filledGrid[i]];
        }

        return filledGrid;
    };

    const handleAttemptsExhausted = () => {
        setCharacterImage(require('../assets/Fallin_TrapDoor.png'));
        setTimeout(() => {
            setCharacterImage(require('../assets/Trapdoor.png'));
            triggerAngelAnimation();
        }, 2000);
    };

    const triggerAngelAnimation = () => {
        setShowAngel(true);
        Animated.timing(angelPosition, {
            toValue: -700, // Move the angel upwards
            duration: 4000,
            easing: Easing.out(Easing.ease), // Smooth easing function
            useNativeDriver: true, // Use native driver for better performance
        }).start(() => {
            setShowAngel(false); // Hide angel after animation
            angelPosition.setValue(300); // Reset position for reuse
            setCharacterImage(require('../assets/Idle_TrapDoor.png')); // Reset to idle image
            moveToNextWord(); // Proceed to the next question
        });
    };

    const toggleRomaji = (char) => {
        playSound();
        setInputRomaji((prevInput) => {
            let newInput;
            if (prevInput.includes(char)) {
                newInput = prevInput.filter((c) => c !== char);
            } else {
                newInput = prevInput.length < wordLength ? [...prevInput, char] : prevInput;
            }

            if (newInput.length === wordLength) {
                setModalVisible(true);
            }

            return newInput;
        });
    };

    const handleConfirm = () => {
        const selectedData = data[currentWordIndex];
        const { word } = selectedData;

        if (inputRomaji.join('') === word.join('')) {
            correctSound.playAsync();

            // Set the character to the jumping animation
            setCorrectAnswersCount((prevCount) => prevCount + 1);
            setCharacterImage(require('../assets/Jumping_Animation.gif'));

            // Wait for the animation duration (e.g., 2 seconds)
            setTimeout(() => {
                setCharacterImage(require('../assets/Idle_TrapDoor.png')); // Reset to the idle character
                moveToNextWord(); // Proceed to the next question
            }, 2000); // Duration of the animation in milliseconds
        } else {
            incorrectSound.playAsync();
            setAttempts((prevAttempts) => {
                const updatedAttempts = [...prevAttempts];
                const nextAttemptIndex = prevAttempts.findIndex((attempt) => attempt === null);
                if (nextAttemptIndex !== -1) {
                    updatedAttempts[nextAttemptIndex] = false;
                }
                if (updatedAttempts.filter((attempt) => attempt === false).length === 3) {
                    handleAttemptsExhausted();
                }
                return updatedAttempts;
            });
        }

        setModalVisible(false);
        setInputRomaji([]); // Reset the input field
    };

    const moveToNextWord = () => {
        if (currentWordIndex + 1 === data.length) {
            setGameOver(true);
        } else {
            setCurrentWordIndex(currentWordIndex + 1);
            setAttempts([null, null, null]); // Reset the attempts
        }
    };

    const handleCancel = () => {
        setModalVisible(false);
    };

    const handleBackPress = async () => {
        setGameOver(false);
        if (bgMusic) {
            try {
                await bgMusic.stopAsync(); // Stop the background music
                await bgMusic.unloadAsync(); // Unload the background music to free resources
            } catch (error) {
                console.error("Error stopping background music:", error);
            }
        }
        router.push('/Exercises'); // Navigate back to the exercises page
    };
    
    const handleRetry = async () => {
        setGameOver(false);
        setCurrentWordIndex(0);
        setAttempts([null, null, null]);
        if (bgMusic) {
            try {
                await bgMusic.stopAsync(); // Stop the music
                await bgMusic.playAsync(); // Restart the music
            } catch (error) {
                console.error("Error restarting background music:", error);
            }
        }
    };
    

    const renderIntroModal = () => (
        <Modal
            visible={introModalVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setIntroModalVisible(false)}
        >
            <View style={stylesQuackman.introModalBackground}>
                <View style={stylesQuackman.introModalContainer}>
                    <TouchableOpacity
                        style={stylesQuackman.closeButton}
                        onPress={() => setIntroModalVisible(false)}
                    >
                        <Text style={stylesQuackman.closeButtonText}>X</Text>
                    </TouchableOpacity>
                    <View style={stylesQuackman.modalContentContainer}>
                        <View style={stylesQuackman.modalTextContent}>
                            <Text style={stylesQuackman.introTitle}>Welcome to Quackman</Text>
                            <Text style={stylesQuackman.introText}>
                                Translate the English definition into romaji by selecting the correct syllables from the grid below. Enjoy playing!
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );

    if (isLoading || !userInteracted) {
        return (
            <TouchableOpacity
                style={[stylesQuackman.loadingContainer]}
                onPress={handleUserInteraction}
                disabled={progress < 100}
            >
                <Image
                    source={require('../assets/quackman_loadingscreen.png')}
                    style={stylesQuackman.loadingBackgroundImage}
                />
                <View style={stylesQuackman.loadingContent}>
                    <Image source={require('../assets/flipload.gif')} style={stylesQuackman.Quacklogo} />
                    <View style={stylesQuackman.progressBarContainer}>
                        <Animated.View
                            style={[
                                stylesQuackman.progressBar,
                                { width: `${progress}%` }, // Update the width dynamically
                            ]}
                        />
                    </View>
                    {progress < 100 ? (
                        <Text style={stylesQuackman.loadingText}>
                            {Math.round(progress)}%
                        </Text>
                    ) : (
                        <Text style={stylesQuackman.loadingText}>Tap to Start</Text>
                    )}
                </View>
            </TouchableOpacity>
        );
    }
    

    if (gameOver) {
        return (
            <View style={[stylesQuackman.gameOverContainer]}>
                <Text style={stylesQuackman.gameOverText}>Game Over!</Text>
                <Text style={stylesQuackman.scoreText}>
                You answered {correctAnswersCount} question{correctAnswersCount === 1 ? '' : 's'}.
                </Text>
                <View style={stylesQuackman.buttonRow}>
                    <TouchableOpacity
                        style={stylesQuackman.retryButton}
                        onPress={handleRetry}
                    >
                        <Text style={stylesQuackman.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={stylesQuackman.backButton}
                        onPress={handleBackPress}
                    >
                        <Text style={stylesQuackman.backButtonText}>Back</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
    

    return (
        <View style={{ flex: 1 }}>
            {renderIntroModal()}
            <View style={stylesClass.header}>
                <TouchableOpacity onPress={handleBackPress}>
                    <View style={stylesClass.backButtonContainer}>
                        <BackIcon width={20} height={20} fill={'white'} />
                    </View>
                </TouchableOpacity>
            </View>

            <View style={stylesQuackman.progressContainer}>
                <View style={stylesQuackman.progress}>
                    <Text style={stylesQuackman.progressText}>{currentWordIndex + 1}/{data.length}</Text>
                </View>
            </View>

            <View style={stylesQuackman.menuContainer}>
                <View style={stylesQuackman.centeredContainer}>
                    <Text style={stylesQuackman.textStyle}>Quackman</Text>
                    <Image source={characterImage} style={stylesQuackman.Quacklogo} />
                </View>
            </View>

            <View style={stylesQuackman.attemptsContainer}>
                {attempts.map((attempt, index) => (
                    <View key={index} style={[stylesQuackman.attempt, attempt === false && stylesQuackman.attemptWrong, attempt === true && stylesQuackman.attemptCorrect]}></View>
                ))}
            </View>

            <View style={stylesQuackman.charGridContainer}>
                <View style={stylesQuackman.charGrid}>
                    {romajiGrid.map((char, index) => (
                        <TouchableOpacity key={index} style={[stylesQuackman.charCell, inputRomaji.includes(char) && stylesQuackman.charCellSelected]} onPress={() => toggleRomaji(char)}>
                            <Text style={stylesQuackman.charText}>{char}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={stylesQuackman.hintInputContainer}>
                <View style={stylesQuackman.hintContainer}>
                    <Text style={stylesQuackman.hintText}>
                        {currentHint}
                    </Text>
                </View>
                <View style={stylesQuackman.inputContainer}>
                    {Array.from({ length: wordLength }, (_, index) => (
                        <View key={index} style={[stylesQuackman.inputCell]}>
                            <Text style={stylesQuackman.inputText}>{inputRomaji[index]}</Text>
                        </View>
                    ))}
                </View>
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={stylesQuackman.modalContainer}>
                    <View style={stylesQuackman.modalContent}>
                        <Text style={stylesQuackman.modalText}>Are you sure you want to submit?</Text>
                        <View style={stylesQuackman.modalButtons}>
                            <CustomButton style={stylesQuackman.modButton} title="Cancel" onPress={handleCancel} />
                            <CustomButton style={stylesQuackman.modButton} title="Confirm" onPress={handleConfirm} />
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Angel Animation */}
            {showAngel && (
                <Animated.View
                    style={[
                        stylesQuackman.angelContainer,
                        { transform: [{ translateY: angelPosition }] },
                    ]}
                >
                    <Image
                        source={require('../assets/Angel.png')}
                        style={stylesQuackman.angelImage}
                    />
                </Animated.View>
            )}
        </View>
    );
};

export default Quackman;
