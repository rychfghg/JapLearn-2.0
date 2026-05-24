import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Modal } from 'react-native';
import { Audio } from 'expo-av';
import CustomButton from '../components/CustomButton';
import styles from '../styles/stylesLessonKanaGame';

const duplicateAndShuffle = (arr) => {
    if (!arr) return [];
    const duplicated = arr.reduce((acc, item) => acc.concat([item, {...item}]), []);
    for (let i = duplicated.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [duplicated[i], duplicated[j]] = [duplicated[j], duplicated[i]];
    }
    return duplicated;
};

const LessonKanaGame = ({ data }) => {
    const [cards, setCards] = useState(() => duplicateAndShuffle(data.characters));
    const [selectedIndices, setSelectedIndices] = useState([]);
    const [matchedIndices, setMatchedIndices] = useState([]);
    const [gameCompleted, setGameCompleted] = useState(false);
    const [showTutorial, setShowTutorial] = useState(true);  // Control visibility of the tutorial
    const [correctSound, setCorrectSound] = useState(null);
    const [incorrectSound, setIncorrectSound] = useState(null);
    const [isSoundReady, setIsSoundReady] = useState(false);

    useEffect(() => {
        async function preloadSounds() {
            const { sound: correctSound } = await Audio.Sound.createAsync(require('../assets/audio/sfx/correct_sfx.mp3'));
            const { sound: incorrectSound } = await Audio.Sound.createAsync(require('../assets/audio/sfx/incorrect_sfx.mp3'));
            setCorrectSound(correctSound);
            setIncorrectSound(incorrectSound);
            setIsSoundReady(true);
        }
        preloadSounds();

        return () => {
            correctSound?.unloadAsync();
            incorrectSound?.unloadAsync();
        };
    }, []);

    const playSound = async (sound) => {
        if (isSoundReady && sound) {
            await sound.replayAsync();
        }
    };

    const handlePressCard = async (index) => {
        const alreadySelected = selectedIndices.includes(index);
        const newSelectedIndices = alreadySelected ? selectedIndices : [...selectedIndices, index];
        setSelectedIndices(newSelectedIndices);

        if (newSelectedIndices.length === 2) {
            const match = cards[newSelectedIndices[0]].roman === cards[newSelectedIndices[1]].roman;
            setTimeout(() => setSelectedIndices([]), 1000);
            if (match) {
                await playSound(correctSound);
                setMatchedIndices([...matchedIndices, ...newSelectedIndices]);
                if (matchedIndices.length + 2 === cards.length) {
                    setGameCompleted(true);
                }
            } else {
                await playSound(incorrectSound);
            }
        }
    };

    return (
        <View style={styles.container}>
            <Modal
                animationType="slide"
                transparent={true}
                visible={showTutorial}
                onRequestClose={() => setShowTutorial(false)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>Here's how to play the game:</Text>
                        <Text style={styles.modalText}>Match each kana with its corresponding romaji.</Text>
                        <CustomButton
                            title="Got it!"
                            onPress={() => setShowTutorial(false)}
                            buttonStyle={styles.modalButton}
                            textStyle={styles.modalButtonText}
                        />
                    </View>
                </View>
            </Modal>
            <View style={styles.cardContainer}>
                {cards.map((card, index) => (
                    <TouchableOpacity key={index} style={styles.card} onPress={() => handlePressCard(index)} disabled={matchedIndices.includes(index)}>
                        {selectedIndices.includes(index) || matchedIndices.includes(index) ? <Text style={styles.cardText}>{card.kana}</Text> : <Image source={require('../assets/img/card_back.png')} style={styles.cardImage} />}
                    </TouchableOpacity>
                ))}
            </View>
            <Modal animationType="fade" transparent={true} visible={gameCompleted} onRequestClose={() => setGameCompleted(false)}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>Congratulations! You've matched all the cards!</Text>
                        <CustomButton
                            title="Retry"
                            onPress={() => {
                                setMatchedIndices([]);
                                setCards(duplicateAndShuffle(data.characters));
                                setGameCompleted(false);
                                setShowTutorial(true); // Reset tutorial as well for new game starts
                            }}
                            buttonStyle={styles.modalButton}
                            textStyle={styles.modalButtonText}
                        />
                        <CustomButton
                            title="Continue"
                            onPress={() => {}}
                            buttonStyle={styles.modalButton}
                            textStyle={styles.modalButtonText}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default LessonKanaGame;
