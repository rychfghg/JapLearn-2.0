import React, { useState, useEffect } from 'react';
import { View, Text, Image, ImageBackground, TouchableOpacity, Modal, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

type QuackmanQuestion = { hint: string; word: string[] };

const Quackman = () => {
    const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
    const [data, setData] = useState<QuackmanQuestion[]>([]);
    const [romajiGrid, setRomajiGrid] = useState<string[]>([]);
    const [inputRomaji, setInputRomaji] = useState<string[]>([]);
    const [selectedTileIndexes, setSelectedTileIndexes] = useState<number[]>([]);
    const [currentHint, setCurrentHint] = useState('');
    const [wordLength, setWordLength] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);
    const [introModalVisible, setIntroModalVisible] = useState(true);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [attempts, setAttempts] = useState<Array<boolean | null>>([null, null, null]);
    const [gameOver, setGameOver] = useState(false);
    const [roundTransitioning, setRoundTransitioning] = useState(false);
    const [exitConfirmVisible, setExitConfirmVisible] = useState(false);
    const [characterImage, setCharacterImage] = useState(require('../assets/Idle_TrapDoor.png'));
    const [userInteracted, setUserInteracted] = useState(false); // Track if the user interacted

    // Angel animation states
    const [showAngel, setShowAngel] = useState(false);
    const angelPosition = useState(new Animated.Value(300))[0]; // Start from below the screen

    const [isLoading, setIsLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const fadeAnim = new Animated.Value(1);
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [correctSound, setCorrectSound] = useState<Audio.Sound | null>(null);
    const [incorrectSound, setIncorrectSound] = useState<Audio.Sound | null>(null);
    const [angelSound, setAngelSound] = useState<Audio.Sound | null>(null);

    // Background music
    const [bgMusic, setBgMusic] = useState<Audio.Sound | null>(null);

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
            const { sound: angelSfx } = await Audio.Sound.createAsync(
                require('../assets/audio/sfx/incorrect.mp3'),
                { volume: 0.48 }
            );

            setSound(quackmanSound);
            setCorrectSound(correctSfx);
            setIncorrectSound(incorrectSfx);
            setAngelSound(angelSfx);
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
            if (angelSound) angelSound.unloadAsync();
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
                    const transformedData = json.map((item: { description: string; romajiWord: string }) => ({
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

    const syllabifyWord = (word: string) => {
        let syllables: string[] = [];
        const normalizedWord = word.toLowerCase().replace(/[^a-z]/g, '');
        const longestRomaji = Math.max(...allRomaji.map((romaji) => romaji.length));
        let i = 0;
        while (i < normalizedWord.length) {
            let found = false;
            for (let len = longestRomaji; len > 0; len--) {
                let sub = normalizedWord.slice(i, i + len);
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

    const loadWord = (index: number) => {
        if (index < data.length) {
            const selectedData = data[index];
            const { hint, word } = selectedData;

            if (!word.length) {
                console.error(`Quackman round ${index + 1} has no playable romaji syllables.`);
                setCurrentHint('This word could not be prepared. Moving to the next challenge.');
                setWordLength(0);
                setRomajiGrid([]);
                setInputRomaji([]);
                setSelectedTileIndexes([]);
                setTimeout(() => moveToNextWord(), 0);
                return;
            }

            setCurrentHint(hint);
            setWordLength(word.length);
            const grid = fillGrid(word, allRomaji, 12);
            setRomajiGrid(grid);
            setInputRomaji([]);
            setSelectedTileIndexes([]);
            setAttempts([null, null, null]);
            setRoundTransitioning(false);
            setCharacterImage(require('../assets/Idle_TrapDoor.png'));
        }
    };

    const fillGrid = (syllables: string[], allSyllables: string[], gridSize: number) => {
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
        angelSound?.stopAsync().then(() => angelSound.replayAsync()).catch(() => undefined);
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

    const toggleRomaji = (char: string, tileIndex: number) => {
        if (roundTransitioning || modalVisible || showAngel) return;
        playSound();
        setSelectedTileIndexes((previousIndexes) => {
            const alreadySelected = previousIndexes.includes(tileIndex);
            const nextIndexes = alreadySelected
                ? previousIndexes.filter((index) => index !== tileIndex)
                : previousIndexes.length < wordLength
                    ? [...previousIndexes, tileIndex]
                    : previousIndexes;
            const nextInput = nextIndexes.map((index) => romajiGrid[index]);
            setInputRomaji(nextInput);
            if (!alreadySelected && nextInput.length === wordLength) setModalVisible(true);
            return nextIndexes;
        });
    };

    const handleConfirm = () => {
        const selectedData = data[currentWordIndex];
        const { word } = selectedData;

        if (inputRomaji.join('') === word.join('')) {
            setRoundTransitioning(true);
            correctSound?.playAsync();

            // Set the character to the jumping animation
            setCorrectAnswersCount((prevCount) => prevCount + 1);
            setCharacterImage(require('../assets/Jumping_Animation.gif'));

            // Wait for the animation duration (e.g., 2 seconds)
            setTimeout(() => {
                setCharacterImage(require('../assets/Idle_TrapDoor.png')); // Reset to the idle character
                moveToNextWord(); // Proceed to the next question
            }, 2000); // Duration of the animation in milliseconds
        } else {
            incorrectSound?.playAsync();
            setAttempts((prevAttempts) => {
                const updatedAttempts = [...prevAttempts];
                const nextAttemptIndex = prevAttempts.findIndex((attempt) => attempt === null);
                if (nextAttemptIndex !== -1) {
                    updatedAttempts[nextAttemptIndex] = false;
                }
                if (updatedAttempts.filter((attempt) => attempt === false).length === 3) {
                    setRoundTransitioning(true);
                    handleAttemptsExhausted();
                }
                return updatedAttempts;
            });
        }

        setModalVisible(false);
        setInputRomaji([]); // Reset the input field
        setSelectedTileIndexes([]);
    };

    const moveToNextWord = () => {
        setCurrentWordIndex((previousIndex) => {
            if (previousIndex + 1 >= data.length) {
                setGameOver(true);
                setRoundTransitioning(false);
                return previousIndex;
            }
            return previousIndex + 1;
        });
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

    const requestExit = () => setExitConfirmVisible(true);
    const cancelExit = () => setExitConfirmVisible(false);
    const confirmExit = () => { setExitConfirmVisible(false); handleBackPress(); };

    const renderExitModal = () => (
        <Modal
            visible={exitConfirmVisible}
            transparent
            animationType="fade"
            presentationStyle="overFullScreen"
            statusBarTranslucent
            navigationBarTranslucent
            hardwareAccelerated
            onRequestClose={cancelExit}
        >
            <View style={stylesQuackman.exitOverlay}>
                <View style={stylesQuackman.exitCard}>
                    <View style={stylesQuackman.exitIcon}><Ionicons name="cloud-outline" size={28} color="#7140C6" /></View>
                    <Text style={stylesQuackman.exitTitle}>Leave the word trial?</Text>
                    <Text style={stylesQuackman.exitMessage}>Your current word and selected syllables will be cleared.</Text>
                    <TouchableOpacity style={stylesQuackman.continueButton} onPress={cancelExit}><Text style={stylesQuackman.continueButtonText}>CONTINUE TRIAL</Text></TouchableOpacity>
                    <TouchableOpacity style={stylesQuackman.leaveButton} onPress={confirmExit}><Text style={stylesQuackman.leaveButtonText}>Exit to Exercises</Text></TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
    
    const handleRetry = async () => {
        setGameOver(false);
        setCurrentWordIndex(0);
        setAttempts([null, null, null]);
        setInputRomaji([]);
        setSelectedTileIndexes([]);
        setRoundTransitioning(false);
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
            presentationStyle="overFullScreen"
            statusBarTranslucent
            navigationBarTranslucent
            hardwareAccelerated
            onRequestClose={() => setIntroModalVisible(false)}
        >
            <View style={stylesQuackman.introModalBackground}>
                <View style={stylesQuackman.introModalContainer}>
                    <View style={stylesQuackman.modalContentContainer}>
                        <View style={stylesQuackman.modalTextContent}>
                            <View style={stylesQuackman.introIcon}><Ionicons name="shield-checkmark-outline" size={31} color="#7140C6" /></View>
                            <Text style={stylesQuackman.introKicker}>AHIRU'S SKY TRIAL</Text>
                            <Text style={stylesQuackman.introTitle}>Survive the word gate</Text>
                            <Text style={stylesQuackman.introText}>
                                Read the clue and build its Japanese romaji word. You have three chances before Ahiru falls through the gate.
                            </Text>
                            <View style={stylesQuackman.introRules}><View style={stylesQuackman.introRule}><Ionicons name="grid-outline" size={18} color="#7140C6" /><Text style={stylesQuackman.introRuleText}>Select syllables</Text></View><View style={stylesQuackman.introRule}><Ionicons name="heart-outline" size={18} color="#D9576C" /><Text style={stylesQuackman.introRuleText}>Three chances</Text></View></View>
                            <TouchableOpacity style={stylesQuackman.introStart} onPress={() => setIntroModalVisible(false)}><Text style={stylesQuackman.introStartText}>BEGIN THE TRIAL</Text><Ionicons name="arrow-forward" size={18} color="#FFF" /></TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );

    if (isLoading || !userInteracted) {
        return (
            <TouchableOpacity
                style={stylesQuackman.loadingContainer}
                onPress={handleUserInteraction}
                disabled={progress < 100}
            >
                <Image source={require('../assets/quackman/quackman-sky-temple.png')} style={stylesQuackman.loadingBackgroundImage} resizeMode="cover" />
                <View style={stylesQuackman.loadingShade} />
                {renderExitModal()}
                <TouchableOpacity
                    style={stylesQuackman.loadingBackButton}
                    onPress={(event) => {
                        event.stopPropagation();
                        requestExit();
                    }}
                >
                    <Ionicons name="arrow-back" size={23} color="#432653" />
                </TouchableOpacity>
                <View style={stylesQuackman.loadingContent}>
                    <View style={stylesQuackman.loadingBadge}><Ionicons name="text-outline" size={14} color="#7140C6" /><Text style={stylesQuackman.loadingBadgeText}>JAPLEARN WORD SURVIVAL</Text></View>
                    <View style={stylesQuackman.loadingPortal}><Image source={require('../assets/Idle_TrapDoor.png')} style={stylesQuackman.loadingMascot} /></View>
                    <Text style={stylesQuackman.loadingGameTitle}>QUACKMAN</Text><Text style={stylesQuackman.loadingSubtitle}>Opening the sky word gate...</Text>
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
                            PREPARING TRIAL - {Math.round(progress)}%
                        </Text>
                    ) : (
                        <Text style={stylesQuackman.loadingText}>TAP TO ENTER</Text>
                    )}
                </View>
            </TouchableOpacity>
        );
    }
    

    if (gameOver) {
        return (
            <ImageBackground
                source={require('../assets/quackman/quackman-sky-temple.png')}
                style={stylesQuackman.gameOverContainer}
                resizeMode="cover"
            >
                <View style={stylesQuackman.screenShade} />
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
            </ImageBackground>
        );
    }
    

    return (
        <ImageBackground source={require('../assets/quackman/quackman-sky-temple.png')} style={stylesQuackman.gameScreen} resizeMode="cover">
            <View style={stylesQuackman.screenShade} />
            {renderIntroModal()}
            {renderExitModal()}
            <View style={stylesQuackman.gameHeader}>
                <TouchableOpacity onPress={requestExit} style={stylesQuackman.headerButton}><Ionicons name="arrow-back" size={22} color="#432653" /></TouchableOpacity>
                <View style={stylesQuackman.modePill}><Ionicons name="text-outline" size={14} color="#7140C6" /><Text style={stylesQuackman.modeText}>WORD SURVIVAL</Text></View>
                <View style={stylesQuackman.roundPill}><Text style={stylesQuackman.roundText}>{currentWordIndex + 1}/{data.length}</Text></View>
            </View>

            <View style={[stylesQuackman.menuContainer,stylesQuackman.refinedStage]}>
                <View style={stylesQuackman.centeredContainer}>
                    <Text style={stylesQuackman.textStyle}>AHIRU'S WORD GATE</Text>
                    <Image source={characterImage} style={[stylesQuackman.Quacklogo,stylesQuackman.refinedMascot]} />
                </View>
            </View>

            <View style={[stylesQuackman.attemptsContainer,stylesQuackman.refinedAttempts]}>
                {attempts.map((attempt, index) => (
                    <View key={index} style={[stylesQuackman.attempt, attempt === false && stylesQuackman.attemptWrong, attempt === true && stylesQuackman.attemptCorrect]}></View>
                ))}
            </View>

            <View style={[stylesQuackman.charGridContainer,stylesQuackman.refinedGridContainer]}>
                <View style={[stylesQuackman.charGrid,stylesQuackman.refinedGrid]}>
                    {romajiGrid.map((char, index) => (
                        <TouchableOpacity key={`${currentWordIndex}-${index}-${char}`} disabled={roundTransitioning} style={[stylesQuackman.charCell,stylesQuackman.refinedTile, selectedTileIndexes.includes(index) && stylesQuackman.charCellSelected, roundTransitioning && { opacity: 0.68 }]} onPress={() => toggleRomaji(char, index)}>
                            <Text style={stylesQuackman.charText}>{char}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={[stylesQuackman.hintInputContainer,stylesQuackman.refinedHintPanel]}>
                <Text style={[stylesQuackman.clueLabel,stylesQuackman.readableClueLabel]}>WORD CLUE</Text><View style={stylesQuackman.clueRow}><View style={stylesQuackman.clueIcon}><Ionicons name="bulb-outline" size={19} color="#D58A1E"/></View><View style={stylesQuackman.clueTextWrap}><Text style={[stylesQuackman.clueTitle,stylesQuackman.readableClueTitle]}>Build the Japanese word</Text><View style={stylesQuackman.hintContainer}>
                    <Text style={[stylesQuackman.hintText,stylesQuackman.readableHint]}>
                        {currentHint}
                    </Text>
                    </View>
                </View></View>
                <Text style={stylesQuackman.answerLabel}>YOUR ROMAJI</Text>
                <View style={[stylesQuackman.inputContainer,stylesQuackman.refinedInputs]}>
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
                presentationStyle="overFullScreen"
                statusBarTranslucent
                navigationBarTranslucent
                hardwareAccelerated
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={stylesQuackman.modalContainer}>
                    <View style={stylesQuackman.modalContent}>
                        <View style={stylesQuackman.submitIcon}><Ionicons name="sparkles" size={26} color="#7140C6" /></View><Text style={stylesQuackman.modalKicker}>WORD READY</Text><Text style={stylesQuackman.modalText}>Lock in this romaji word?</Text><Text style={stylesQuackman.modalWord}>{inputRomaji.join(' / ')}</Text>
                        <View style={stylesQuackman.modalButtons}>
                            <CustomButton buttonStyle={stylesQuackman.cancelSubmit} textStyle={stylesQuackman.cancelSubmitText} title="EDIT" onPress={handleCancel} />
                            <CustomButton buttonStyle={stylesQuackman.modButton} textStyle={stylesQuackman.confirmSubmitText} title="SUBMIT" onPress={handleConfirm} />
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Angel Animation */}
            {showAngel && (
                <Animated.View
                    style={[
                        stylesQuackman.angelContainer,stylesQuackman.centeredAngel,
                        { transform: [{ translateY: angelPosition }] },
                    ]}
                >
                    <View style={stylesQuackman.angelGlow}/>
                    <Image
                        source={require('../assets/Angel.png')}
                        style={stylesQuackman.angelImage}
                    />
                </Animated.View>
            )}
        </ImageBackground>
    );
};

export default Quackman;


