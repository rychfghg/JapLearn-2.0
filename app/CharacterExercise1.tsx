import { View, TouchableOpacity, Text, Image, Pressable } from 'react-native';
import { styles } from "../styles/stylesCharacterExercise";
import BackIcon from '../assets/svg/back-icon.svg';
import cardBackImage from '../assets/img/card_back.png';
import { useRouter } from 'expo-router';
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext'; // Import AuthContext
import expoconfig from '../expoconfig';

// Fisher-Yates shuffle algorithm
const shuffleArray = (array) => {
    let shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
};

const CharacterExercise1 = () => {
    const { user } = useContext(AuthContext); // Get the user object (which includes email)
    const router = useRouter();
    const characters = [
        { romaji: "a", hiragana: "あ" },
        { romaji: "i", hiragana: "い" },
        { romaji: "u", hiragana: "う" },
        { romaji: "e", hiragana: "え" },
        { romaji: "o", hiragana: "お" },
        { romaji: "ka", hiragana: "か" },
        { romaji: "ki", hiragana: "き" },
        { romaji: "ku", hiragana: "く" },
        { romaji: "ke", hiragana: "け" },
        { romaji: "ko", hiragana: "こ" },
        { romaji: "sa", hiragana: "さ" },
        { romaji: "shi", hiragana: "し" },
        { romaji: "su", hiragana: "す" },
        { romaji: "se", hiragana: "せ" },
        { romaji: "so", hiragana: "そ" }
    ];

    const [currentSetIndex, setCurrentSetIndex] = useState(0);
    const [flippedCard, setFlippedCard] = useState(null);
    const [matchedPairs, setMatchedPairs] = useState([]);
    const [message, setMessage] = useState('');
    const [cards, setCards] = useState([]);
    const [gameState, setGameState] = useState('preview'); // 'preview' or 'active'
    const [cardOpacities, setCardOpacities] = useState([]); // Store opacity for each card

    // Split characters into sets of 8
    const sets = [];
    for (let i = 0; i < characters.length; i += 8) {
        sets.push(characters.slice(i, i + 8));
    }

    // Shuffle cards and set the current cards for the match game
    const prepareMatchGame = (setIndex) => {
        const currentSet = sets[setIndex];
        const shuffledSet = shuffleArray([...currentSet.map(c => ({ ...c }))]);
        setCards(shuffledSet);
        setFlippedCard(null);
        setMatchedPairs([]);
        setCardOpacities(shuffledSet.map(() => 1)); // Set opacity of all cards to 1 initially
        setGameState('preview'); // Start in preview state

        // Set a timeout to flip cards back after 5 seconds and start the game
        setTimeout(() => {
            setGameState('active');
        }, 5000);
    };

    const currentSet = sets[currentSetIndex];
    const currentRomaji = currentSet[matchedPairs.length]?.romaji;

    const handleCardFlip = (index) => {
        if (gameState !== 'active') return; // Ignore taps if game is not active

        const card = cards[index];
        if (matchedPairs.includes(index) || flippedCard === index) {
            return;
        }

        setFlippedCard(index);

        // Delay the card flip to show the card briefly before checking for a match
        setTimeout(() => {
            if (card.romaji === currentRomaji) {
                setMatchedPairs(prev => [...prev, index]);

                setTimeout(() => {
                    setFlippedCard(null);

                    // Gradually reduce opacity of matched cards
                    setCardOpacities((prevOpacities) =>
                        prevOpacities.map((opacity, i) =>
                            i === index ? 0 : opacity // Set matched card's opacity to 0
                        )
                    );

                    if (matchedPairs.length + 1 === cards.length) {
                        setTimeout(() => {
                            const nextSetIndex = currentSetIndex + 1;
                            if (nextSetIndex < sets.length) {
                                setCurrentSetIndex(nextSetIndex);
                            } else {
                                setMessage('Exercise completed!');
                            }
                        }, 1000);
                    }
                }, 0);
            } else {
                setTimeout(() => {
                    setFlippedCard(null); // Flip the card back after 1 second if not a match
                }, 250);
            }
        }, 500); // Delay the flip by 1 second to slow down the card reveal
    };

    const handleBackPress = () => {
        router.back();
    };

    const handleCompleteExercise = async () => {
        if (user && user.email) {
            try {
                // Fetch the current progress for the user
                const response = await fetch(`${expoconfig.API_URL}/api/progress/${user.email}`);
                
                if (response.ok) {
                    const progress = await response.json();
    
                    // Check if hiragana1 is already true
                    if (progress.hiragana1) {
                        console.log("Progress already completed for hiragana1. Skipping update.");
                        router.push("/HiraganaMenu");
                        return; // Exit if already true
                    }
    
                    // If not true, update progress
                    const updateResponse = await fetch(
                        `${expoconfig.API_URL}/api/progress/${user.email}`,
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ email: user.email }) // Send the email in the body
                        }
                    );
    
                    if (updateResponse.ok) {
                        console.log("Progress saved successfully!");
                    } else {
                        const error = await updateResponse.json();
                        console.log(error.message || "An error occurred while updating progress.");
                    }
                } else {
                    console.log("Failed to fetch user progress.");
                }
            } catch (error) {
                console.log(`Error: ${error.message}`);
            }
        } else {
            console.error('No user email found.');
        }
    
        // Navigate to the Hiragana menu
        router.push("/HiraganaMenu");
    };

    const handleRestart = () => {
        setCurrentSetIndex(0);
        setFlippedCard(null);
        setMatchedPairs([]);
        setMessage('');
        prepareMatchGame(0);
    };

    useEffect(() => {
        prepareMatchGame(currentSetIndex);
    }, [currentSetIndex]);

    return (
        <View style={{ flex: 1 }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBackPress}>
                    <View style={styles.backButtonContainer}>
                        <BackIcon width={20} height={20} fill={'white'} />
                    </View>
                </TouchableOpacity>
            </View>
            <View style={styles.matchGame}>
                <Text style={styles.matchGameText}>
                    {gameState === 'preview'
                        ? 'Memorize the placement!'
                        : currentRomaji
                        ? `Match the card for romaji: ${currentRomaji}`
                        : ''}
                </Text>
                <View style={styles.cardsContainer}>
                    {cards.map((card, index) => {
                        const isCardFlipped =
                            gameState === 'preview' ||
                            flippedCard === index ||
                            matchedPairs.includes(index);
                        const isCardMatched = matchedPairs.includes(index);
                        const cardOpacity = cardOpacities[index]; // Get the opacity of each card

                        const cardStyle = {
                            ...styles.card,
                            opacity: cardOpacity,
                        };

                        return (
                            <TouchableOpacity
                                key={index}
                                style={cardStyle}
                                onPress={() => handleCardFlip(index)}
                                disabled={gameState !== 'active' || isCardMatched}
                            >
                                {isCardFlipped ? (
                                    <Text style={styles.cardText}>{card.hiragana}</Text>
                                ) : (
                                    <Image source={cardBackImage} style={styles.cardImage} />
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
                {message && (
                    <View style={styles.messageContainer}>
                    <Text style={styles.message}>{message}</Text>
                    <Pressable style={styles.nextButton} onPress={handleCompleteExercise}>
                        <Text style={styles.nextButtonText}>Done</Text>
                    </Pressable>
                </View>
                
                )}
            </View>
        </View>
    );
};

export default CharacterExercise1;
