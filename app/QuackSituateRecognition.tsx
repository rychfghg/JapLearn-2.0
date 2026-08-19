import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Animated,
  ImageBackground,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import BackIcon from '../assets/svg/back-icon.svg';
import AhiruMissionExit from '../components/AhiruMissionExit';
import { stylesRecognition } from '../styles/stylesQuackSituateRecognition';

import background from '../assets/background.png';
import duckIdle from '../assets/idle.png';
import duckTalk from '../assets/talk.png';
import duckHappy from '../assets/hello.png';
import duckThinking from '../assets/thinking.png';
import duckSad from '../assets/Crying.png';
import CheckImage from '../assets/check.png';
import WrongImage from '../assets/wrong.png';

const scenarioGif =
  'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExOWZqcTBmaWRqN2dwN2RqcTVob3E4ZjlsYThjaGlpeTBqemtyMW9kaiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/fg5A4osUhTM0e0g1Xt/giphy.gif';

const scenario = {
  title: '📍 School Hallway',
  question: 'Your teacher passes by you in the morning. What should you say?',
  correctChoice: 'おはようございます',
  correctRomaji: 'ohayou gozaimasu',
  choices: [
    {
      jp: 'ありがとう',
      romaji: 'arigatou',
      hint: 'This is used when someone helps you or gives you something.',
    },
    {
      jp: 'すみません',
      romaji: 'sumimasen',
      hint: 'This is often used to apologize or politely get attention.',
    },
    {
      jp: 'おはようございます',
      romaji: 'ohayou gozaimasu',
      hint: 'This is a polite expression often heard early in the day.',
    },
    {
      jp: 'じゃあね',
      romaji: 'jaa ne',
      hint: 'This is casual and is usually said when leaving someone.',
    },
  ],
};

const QuackSituateRecognition = () => {
  const [selectedChoice, setSelectedChoice] = useState<any>(null);
  const [character, setCharacter] = useState(duckIdle);
  const [message, setMessage] = useState('Watch the scene. What would you say to your teacher?');
  const [resultVisible, setResultVisible] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);
  const [hintChoice, setHintChoice] = useState<any>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [effectImage, setEffectImage] = useState<any>(null);
  const [isExiting, setIsExiting] = useState(false);

  const floatAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.7)).current;
  const effectAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -7,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1100,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.65,
          duration: 1100,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const closeAllPopups = () => {
    setResultVisible(false);
    setHintVisible(false);
    setHintChoice(null);
  };

  const handleBackPress = () => {
    if (hintVisible || resultVisible) {
      closeAllPopups();
      return;
    }

    setIsExiting(true);
  };

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -5, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const showEffect = (image: any) => {
    setEffectImage(image);
    effectAnim.setValue(0);

    Animated.timing(effectAnim, {
      toValue: 1,
      duration: 850,
      useNativeDriver: true,
    }).start(() => setEffectImage(null));
  };

  const handleSelectChoice = (choice: any) => {
    setSelectedChoice(choice);
    setCharacter(duckTalk);

    if (choice.jp === scenario.correctChoice) {
      setMessage('That sounds polite for this situation. Submit when ready!');
    } else {
      setMessage('Think about the time of day and who you are speaking to.');
    }
  };

  const openHint = (choice: any) => {
    setHintChoice(choice);
    setHintVisible(true);
    setCharacter(duckThinking);
    setMessage('Hints guide you, but they will not directly give the answer.');
  };

  const handleSubmit = () => {
    if (!selectedChoice) {
      setCharacter(duckThinking);
      setMessage('Choose one expression first.');
      shake();
      return;
    }

    const correct = selectedChoice.jp === scenario.correctChoice;
    setIsCorrect(correct);

    if (correct) {
      setCharacter(duckHappy);
      setMessage('Correct! You used the polite morning greeting.');
      showEffect(CheckImage);
    } else {
      setCharacter(duckSad);
      setMessage('Not quite. Look again at the time and the person in the scene.');
      showEffect(WrongImage);
      shake();
    }

    setResultVisible(true);
  };

  const handleRetry = () => {
    setSelectedChoice(null);
    setCharacter(duckIdle);
    setMessage('Watch the scene. What would you say to your teacher?');
    setResultVisible(false);
    setHintVisible(false);
    setHintChoice(null);
    setIsCorrect(false);
  };

  const handleResultButtonPress = () => {
    closeAllPopups();

    if (isCorrect) {
      setIsExiting(true);
      return;
    }

    handleRetry();
  };

  if (isExiting) return <AhiruMissionExit color="#65A936" tint="#EAF5E3" icon="eye-outline" eyebrow="RECOGNITION COMPLETE" title="Sharp eyes, great choice!" message="You practiced reading a real situation and choosing the expression that fits naturally." footer="Every moment you notice builds fluency." mascot={duckHappy} onComplete={() => router.push({ pathname: '/QuackSituate', params: { skipLoading: '1' } })} />;

  return (
    <View style={stylesRecognition.container}>
      <ImageBackground source={background} style={stylesRecognition.background} resizeMode="cover">
        <View style={stylesRecognition.overlay} />

        <TouchableOpacity style={stylesRecognition.backButton} onPress={handleBackPress}>
          <BackIcon width={20} height={20} fill="white" />
        </TouchableOpacity>

        <View style={stylesRecognition.topBoard}>
          <Text style={stylesRecognition.levelText}>Situational Recognition</Text>
          <Text style={stylesRecognition.titleText}>Scenario Response</Text>
        </View>

        <View style={stylesRecognition.progressWrap}>
          <Text style={stylesRecognition.progressText}>Scenario 1 / 3 • Beginner Greetings</Text>
          <View style={stylesRecognition.progressTrack}>
            <View style={stylesRecognition.progressFill} />
          </View>
        </View>

        <View style={stylesRecognition.scenarioCard}>
          <View style={stylesRecognition.scenarioHeaderRow}>
            <Text style={stylesRecognition.scenarioTitle}>{scenario.title}</Text>
            <View style={stylesRecognition.liveBadge}>
              <Text style={stylesRecognition.liveBadgeText}>SCENE</Text>
            </View>
          </View>

          <Image source={{ uri: scenarioGif }} style={stylesRecognition.scenarioGif} />

          <View style={stylesRecognition.questionBox}>
            <Text style={stylesRecognition.questionText}>{scenario.question}</Text>
          </View>
        </View>

        <View style={stylesRecognition.answerLabel}>
          <Text style={stylesRecognition.answerLabelText}>Choose your response</Text>
        </View>

        <View style={stylesRecognition.choiceGrid}>
          {scenario.choices.map((choice) => (
            <TouchableOpacity
              key={choice.jp}
              activeOpacity={0.9}
              onPress={() => handleSelectChoice(choice)}
              style={[
                stylesRecognition.choiceButton,
                selectedChoice?.jp === choice.jp && stylesRecognition.choiceSelected,
              ]}
            >
              <View style={stylesRecognition.choiceTopRow}>
                <TouchableOpacity
                  style={stylesRecognition.hintButton}
                  onPress={() => openHint(choice)}
                >
                  <Text style={stylesRecognition.hintText}>💡</Text>
                </TouchableOpacity>
              </View>

              <Text style={stylesRecognition.choiceJP}>{choice.jp}</Text>
              <Text style={stylesRecognition.choiceRomaji}>{choice.romaji}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={stylesRecognition.guideArea}>
          <Animated.View
            style={[
              stylesRecognition.duckGlow,
              {
                opacity: glowAnim,
                transform: [{ scale: glowAnim }],
              },
            ]}
          />

          <Animated.Image
            source={character}
            style={[
              stylesRecognition.characterImage,
              {
                transform: [
                  { translateY: floatAnim },
                  { translateX: shakeAnim },
                ],
              },
            ]}
          />

          <View style={stylesRecognition.dialogueContainer}>
            <Text style={stylesRecognition.dialogueText}>{message}</Text>
          </View>
        </View>

        <TouchableOpacity style={stylesRecognition.submitButton} onPress={handleSubmit}>
          <Text style={stylesRecognition.submitButtonText}>Submit</Text>
        </TouchableOpacity>

        {effectImage && (
          <Animated.Image
            source={effectImage}
            style={[
              stylesRecognition.effectImage,
              {
                opacity: effectAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0],
                }),
                transform: [
                  {
                    translateY: effectAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -45],
                    }),
                  },
                  {
                    scale: effectAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1.4],
                    }),
                  },
                ],
              },
            ]}
          />
        )}

        <Modal
          visible={hintVisible}
          transparent
          animationType="fade"
          onRequestClose={closeAllPopups}
        >
          <View style={stylesRecognition.modalOverlay}>
            <View style={stylesRecognition.modalCard}>
              <TouchableOpacity
                style={stylesRecognition.modalCloseButton}
                onPress={closeAllPopups}
              >
                <Text style={stylesRecognition.modalCloseText}>X</Text>
              </TouchableOpacity>

              <Text style={stylesRecognition.modalTitle}>Hint 💡</Text>

              <Text style={stylesRecognition.modalJP}>{hintChoice?.jp}</Text>
              <Text style={stylesRecognition.modalRomaji}>{hintChoice?.romaji}</Text>

              <Text style={stylesRecognition.modalText}>{hintChoice?.hint}</Text>

              <TouchableOpacity
                style={stylesRecognition.modalButton}
                onPress={closeAllPopups}
              >
                <Text style={stylesRecognition.modalButtonText}>Got it</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal
          visible={resultVisible}
          transparent
          animationType="slide"
          onRequestClose={closeAllPopups}
        >
          <View style={stylesRecognition.modalOverlay}>
            <View style={stylesRecognition.modalCard}>
              <TouchableOpacity
                style={stylesRecognition.modalCloseButton}
                onPress={closeAllPopups}
              >
                <Text style={stylesRecognition.modalCloseText}>X</Text>
              </TouchableOpacity>

              <Text style={stylesRecognition.modalTitle}>
                {isCorrect ? 'Correct!' : 'Try Again!'}
              </Text>

              <Text style={stylesRecognition.modalJP}>{scenario.correctChoice}</Text>
              <Text style={stylesRecognition.modalRomaji}>{scenario.correctRomaji}</Text>

              <Text style={stylesRecognition.modalText}>
                {isCorrect
                  ? 'Good job! This is appropriate when greeting your teacher in the morning.'
                  : 'The situation is a morning greeting with a teacher. Use a polite greeting.'}
              </Text>

              {isCorrect && (
                <Text style={stylesRecognition.modalReward}>
                  ⭐ +10 XP{'\n'}Politeness +1
                </Text>
              )}

              <TouchableOpacity
                style={stylesRecognition.modalButton}
                onPress={handleResultButtonPress}
              >
                <Text style={stylesRecognition.modalButtonText}>
                  {isCorrect ? 'Back' : 'Retry'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ImageBackground>
    </View>
  );
};

export default QuackSituateRecognition;
