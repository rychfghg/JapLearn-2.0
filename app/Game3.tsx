import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ImageBackground, TouchableOpacity, Dimensions } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { styles } from '../styles/game3Styles';

const { width, height } = Dimensions.get('window');

// Function to shuffle an array
const shuffleArray = (array) => {
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
};

// Define custom animations for curtains
const slideOutLeft = {
  from: { translateX: 0 },
  to: { translateX: -width },
};

const slideOutRight = {
  from: { translateX: 0 },
  to: { translateX: width },
};

// Define subtle up and down animation for names
const floatAnimation = {
  0: { translateY: 0 },
  0.5: { translateY: -5 },
  1: { translateY: 0 },
};

// Adjusted jump attack animation to reach the enemy's position
const jumpAttackAnimation = {
  0: { translateX: 0, translateY: 0 },
  0.3: { translateX: width * 0.4, translateY: -height * 0.2 },
  0.6: { translateX: width * 0.7, translateY: 0 },
  1: { translateX: 0, translateY: 0 },
};

// Define dash attack animation for enemy to reach player's position
const dashAttackAnimation = {
  0: { translateX: 0 },
  0.5: { translateX: -(width * 0.7) },
  1: { translateX: 0 },
};

// Define red blink animation using opacity for damage effect
const redBlinkAnimation = {
  0: { opacity: 1 },
  0.5: { opacity: 0.01 },
  1: { opacity: 1 },
};

const Game3 = ({ onGameOver }) => {
  const questions = [
    {
      question: "Which particle makes the sentence possessive?",
      choices: ["no", "wa", "mo", "ga"],
      correctAnswer: "no",
    },
    {
      question: "This particle is a topic marker particle.",
      choices: ["desu", "no", "wa", "mo"],
      correctAnswer: "wa",
    },
    {
      question: "Makes the sentence polite.",
      choices: ["ni", "desu", "mo", "ka"],
      correctAnswer: "desu",
    },
    {
      question: "It is the question particle.",
      choices: ["ka", "ga", "o", "no"],
      correctAnswer: "ka",
    },
    {
      question: 'Means "too" or "also" in English',
      choices: ["no", "ni", "mo", "o"],
      correctAnswer: "mo",
    },
    {
      question: "Teacher of CIT\n\nCIT __ sensei",
      choices: ["no", "wa", "mo", "ga"],
      correctAnswer: "no",
    },
    {
      question: "I will go too\n\nWatashi __ ikimasu",
      choices: ["ni", "desu", "mo", "ka"],
      correctAnswer: "mo",
    },
  ];

  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [enemyHealth, setEnemyHealth] = useState(100); // Enemy health now just visual feedback
  const [playerHealth, setPlayerHealth] = useState(100);
  const [showCurtain, setShowCurtain] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [choicePositions, setChoicePositions] = useState(Array(questions[0].choices.length).fill('original'));
  const [gameOver, setGameOver] = useState(false);
  const [gameOverText, setGameOverText] = useState('');
  const [isAttacking, setIsAttacking] = useState(false);

  const enemyRef = useRef(null);
  const playerRef = useRef(null);
  const attackEffectRef = useRef(null);

  useEffect(() => {
      // Shuffle questions when the component mounts
      const randomizedQuestions = shuffleArray(questions);
      setShuffledQuestions(randomizedQuestions);
      setTimeout(() => setShowCurtain(false), 3500);
    }, []);

  const handleAnswer = (choice) => {
    setSelectedAnswer(choice); // Store the selected choice
  };

  const handleAttack = () => {
    if (isAttacking) return; // Prevent spamming attack button
    setIsAttacking(true);

    const currentQuestion = shuffledQuestions[currentQuestionIndex];
    if (selectedAnswer === currentQuestion.correctAnswer) {
      // Trigger player attack animation
      playerRef.current?.animate(jumpAttackAnimation, 700);
      enemyRef.current?.animate(redBlinkAnimation, 200);

      // Reduce enemy health
      const newEnemyHealth = Math.max(enemyHealth - 30, 0);
      setEnemyHealth(newEnemyHealth);

      // Wait for animations to complete before proceeding
      setTimeout(() => {
        if (newEnemyHealth === 0) {
          endGame("Enemy defeated! You win!");
          setSelectedAnswer(null);
        } else if (currentQuestionIndex < shuffledQuestions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setSelectedAnswer(null); // Clear the selected answer
          setChoicePositions(Array(questions[currentQuestionIndex + 1].choices.length).fill('original'));
        }
        setIsAttacking(false);
      }, 800); // Adjust delay to match animation duration
    } else {
      // If the answer is incorrect, handle damage and check for game over
      const newPlayerHealth = Math.max(playerHealth - 30, 0);
      setPlayerHealth(newPlayerHealth);
      enemyRef.current?.animate(dashAttackAnimation, 500);
      playerRef.current?.animate(redBlinkAnimation, 200);

      setTimeout(() => {
        if (newPlayerHealth === 0) {
          endGame("You were defeated!");
          setSelectedAnswer(null);
        } else if (currentQuestionIndex < shuffledQuestions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setSelectedAnswer(null); // Clear the selected answer
          setChoicePositions(Array(questions[currentQuestionIndex + 1].choices.length).fill('original'));
        }
        setIsAttacking(false);
      }, 800); // Adjust delay to match animation duration
    }
  };

  const handleRetry = () => {
    // Reset game state for retry
    setShuffledQuestions(shuffleArray(questions));
    setCurrentQuestionIndex(0);
    setEnemyHealth(100);
    setPlayerHealth(100);
    setSelectedAnswer(null);
    setGameOver(false);
    setGameOverText('');
  };

  const endGame = (message) => {
    setSelectedAnswer(null);
    setGameOver(true);
    setGameOverText(message);
  };

  const handleProceed = () => {
    if (onGameOver) {
      onGameOver(); // Notify parent component
    }
  };

  const customMoveAnimation = {
    0: { opacity: 1, translateX: 0, translateY: 0 },
    1: { 
      opacity: 1, 
      translateX: (width / 2) - 600,
      translateY: (height / 2) - 400,
    },
  };

  const currentQuestion = shuffledQuestions[currentQuestionIndex];

  if (shuffledQuestions.length === 0) {
    return null; // Prevent rendering until questions are shuffled
  }

  return (
    <ImageBackground source={require('../assets/fightbg.png')} style={styles.background}>
      <View style={styles.container}>
        {!gameOver && <Text style={styles.question}>{currentQuestion.question}</Text>}

         {/* Selected Choice Display */}
         {selectedAnswer && (
          <View style={styles.selectedAnswerContainer}>
            <Text style={styles.selectedAnswerText}>{selectedAnswer}</Text>
          </View>
        )}

         {/* Choices */}
         <View style={styles.choiceContainer}>
          {currentQuestion.choices.map((choice, index) => (
            <TouchableOpacity
              key={index}
              style={styles.choice}
              onPress={() => handleAnswer(choice)}
            >
              <Text style={styles.choiceText}>{choice}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.bottomButton} onPress={handleAttack} disabled={gameOver || isAttacking || !selectedAnswer}>
          <Text style={styles.bottomButtonText}>Attack!</Text>
        </TouchableOpacity>

        <View style={styles.battleContainer}>
          {/* Player Character and Name */}
          <View style={styles.characterContainer}>
            <Animatable.Text
              animation={floatAnimation}
              iterationCount="infinite"
              duration={2000}
              style={styles.characterName}
            >
              Ahiru-san
            </Animatable.Text>
            <Animatable.Image
              ref={playerRef}
              source={require('../assets/samurai.png')}
              style={styles.playerImage}
              animation="fadeIn"
              duration={500}
            />
            <View style={styles.playerHPContainer}>
              <View style={[styles.playerHPFill, { width: `${playerHealth}%` }]} />
            </View>
          </View>

          {/* Enemy Character and Name */}
          <View style={styles.characterContainer}>
            <Animatable.Text
              animation={floatAnimation}
              iterationCount="infinite"
              duration={2000}
              style={styles.characterName}
            >
              Enemy
            </Animatable.Text>
            <Animatable.Image
              ref={enemyRef}
              source={require('../assets/enemy.png')}
              style={styles.enemyImage}
              animation="fadeIn"
              duration={500}
            />
            <View style={styles.enemyHPContainer}>
              <View style={[styles.enemyHPFill, { width: `${enemyHealth}%` }]} />
            </View>
          </View>
        </View>

        <Animatable.Image
          ref={attackEffectRef}
          source={require('../assets/hello.png')}
          style={styles.attackEffect}
          duration={500}
        />

        {showCurtain && (
          <View style={styles.curtainContainer}>
            <Animatable.View
              animation={slideOutLeft}
              duration={3500}
              delay={2000}
              style={styles.curtainLeft}
            />
            <Animatable.View
              animation={slideOutRight}
              duration={3500}
              delay={2000}
              style={styles.curtainRight}
            />
            <Animatable.Text animation="fadeOut" duration={2500} delay={2000} style={styles.curtainText}>
              Good Luck!
            </Animatable.Text>
          </View>
        )}

{gameOver && (
          <View style={styles.overlay}>
            <Text style={styles.gameOverText}>{gameOverText}</Text>
            {gameOverText === "You were defeated!" ? (
              <TouchableOpacity style={styles.proceedButton} onPress={handleRetry}>
                <Text style={styles.proceedButtonText}>Retry</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.proceedButton} onPress={onGameOver}>
                <Text style={styles.proceedButtonText}>Proceed</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </ImageBackground>
  );
};

export default Game3;
