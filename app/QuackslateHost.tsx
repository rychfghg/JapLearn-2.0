import { SafeAreaView, TouchableOpacity, Text, View, Pressable, ImageBackground, Modal } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Profile from '../assets/svg/user_pf.svg';
import Background from '../assets/img/MenuBackground.png';
import BackIcon from '../assets/svg/back-icon.svg';
import styles from '../styles/stylesMenu';
import stylesSlate from '../styles/StylesSlate';
import { stylesEdit } from '../styles/stylesEdit';
import expoconfig from '../expoconfig';

const QuackslateHost = () => {
    const { gameCode, classCode, title } = useLocalSearchParams();
    const [content, setContent] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [updatedEnglishWord, setUpdatedEnglishWord] = useState('');
    const [englishText, setEnglishText] = useState('');
    const [correctAnswer, setCorrectAnswer] = useState('');
    const [wrongAnswer, setWrongAnswer] = useState(''); // Add state for wrong answers
    const [isGameFinished, setIsGameFinished] = useState(false);
    const router = useRouter();

    const handleBackPress = () => {
        router.back();
    };

    const fetchContent = async () => {
        try {
            const response = await fetch(`${expoconfig.API_URL}/api/quackslateContent/getAllQuackslateContent`);
            if (response.ok) {
                const data = await response.json();
                setContent(data);
                loadNextQuestion(0, data);
            } else {
                console.error('Failed to fetch content');
            }
        } catch (error) {
            console.error('Error fetching content:', error);
        }
    };

    const loadNextQuestion = (index, data = content) => {
        const currentContent = data[index];
        if (currentContent) {
            setUpdatedEnglishWord(currentContent.englishWord);
            setEnglishText(currentContent.translatedWord);
            setCorrectAnswer(currentContent.correctAnswer);
            setWrongAnswer(currentContent.wrongAnswer || ''); // Ensure wrongAnswer is always a string
            console.log("Current question:", currentContent);
        } else {
            setIsGameFinished(true);
        }
    };

    // Update current question index in backend
    const updateCurrentQuestionIndexInBackend = async (index) => {
        try {
            const response = await fetch(`${expoconfig.API_URL}/api/quackslateLevels/setCurrentQuestionIndex/${gameCode}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentQuestionIndex: index }), // Send the updated index
            });

            if (!response.ok) {
                console.error(`Failed to update current question index: ${response.status}`);
            } else {
                const result = await response.json();
                console.log("Successfully updated index:", result);
                setCurrentIndex(index); // Update local state with new index
            }
        } catch (error) {
            console.error("Error updating current question index:", error);
        }
    };

    const handleNextQuestion = () => {
        const nextIndex = currentIndex + 1;
        if (nextIndex < content.length) {
            loadNextQuestion(nextIndex);
            updateCurrentQuestionIndexInBackend(nextIndex); // Update index on the backend
        } else {
            setIsGameFinished(true); // End the game if no more questions
        }
    };

    useEffect(() => {
        fetchContent();
        // Log the gameCode in the console when the component mounts or gameCode changes
        console.log("Game Code:", gameCode);
    }, [gameCode]);

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
                        
                    </View>

                    <View style={stylesSlate.centeredContainer}>
                        <Text style={stylesSlate.gameCodeTextHost}>Game Code: {gameCode}</Text>
                        <Text style={stylesSlate.titleText}>{title}</Text>
                    </View>

                    <View style={stylesSlate.centeredContainer}>
                        <Text style={stylesSlate.japaneseText}>{updatedEnglishWord}</Text>
                        <Text style={stylesSlate.englishText}>{englishText}</Text>
                    </View>

                    <View style={stylesSlate.selectedAnswersContainer}>
                        {correctAnswer.split(' ').map((answer, index) => (
                            <View key={index} style={stylesSlate.selectedTextBox}>
                                <Text style={stylesSlate.selectedText}>{answer}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Handle null or undefined wrongAnswer */}
                    <View style={stylesSlate.selectedAnswersContainer}>
                        {wrongAnswer && wrongAnswer.split(' ').map((answer, index) => (
                            <View key={index} style={stylesSlate.selectedTextBox}>
                                <Text style={stylesSlate.selectedText}>{answer}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={stylesSlate.submitResetContainer}>
                        <TouchableOpacity style={stylesSlate.submitButton} onPress={handleNextQuestion}>
                            <Text style={stylesSlate.submitButtonText}>
                                {currentIndex < content.length - 1 ? 'Next Question' : 'End Quiz'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Modal for Game Finished */}
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={isGameFinished}
                        onRequestClose={() => setIsGameFinished(false)}
                    >
                        <View style={stylesSlate.modalContainer}>
                            <View style={stylesSlate.modalView}>
                                <Text style={stylesSlate.modalTitle}>Quiz Complete</Text>
                                <Text style={stylesSlate.modalText}>You have finished all questions!</Text>
                                <TouchableOpacity
                                    onPress={() => {
                                        setIsGameFinished(false);
                                        router.push(`/QuackslateLevels?classCode=${classCode}`);
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

export default QuackslateHost;
