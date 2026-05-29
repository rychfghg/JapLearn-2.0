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
  title: 'School Hallway',
  question: 'Your teacher passes by you in the morning. What should you say?',
  correctChoice: 'おはようございます',
  correctRomaji: 'ohayou gozaimasu',
  choices: [
    { jp: 'ありがとう', romaji: 'arigatou' },
    { jp: 'すみません', romaji: 'sumimasen' },
    { jp: 'おはようございます', romaji: 'ohayou gozaimasu' },
    { jp: 'じゃあね', romaji: 'jaa ne' },
  ],
};

const QuackSituateRecognition = () => {
  const [selectedChoice, setSelectedChoice] = useState<any>(null);
  const [character, setCharacter] = useState(duckIdle);
  const [message, setMessage] = useState('Watch the animated scene and choose the best expression.');
  const [resultVisible, setResultVisible] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [effectImage, setEffectImage] = useState<any>(null);

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

  const handleBackPress = () => {
    if (resultVisible) {
      setResultVisible(false);
      return;
    }

    router.push('/QuackSituate');
  };

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const showEffect = (image: any) => {
    setEffectImage(image);
    effectAnim.setValue(0);

    Animated.timing(effectAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start(() => setEffectImage(null));
  };

  const handleSelectChoice = (choice: any) => {
    setSelectedChoice(choice);
    setCharacter(duckTalk);
    setMessage(`Selected: ${choice.romaji}`);
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
      setMessage('Correct! This is the polite morning greeting.');
      showEffect(CheckImage);
    } else {
      setCharacter(duckSad);
      setMessage('Not quite. Think about greeting a teacher in the morning.');
      showEffect(WrongImage);
      shake();
    }

    setResultVisible(true);
  };

  const handleRetry = () => {
    setSelectedChoice(null);
    setCharacter(duckIdle);
    setMessage('Watch the animated scene and choose the best expression.');
    setResultVisible(false);
    setIsCorrect(false);
  };

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
              activeOpacity={0.88}
              onPress={() => handleSelectChoice(choice)}
              style={[
                stylesRecognition.choiceButton,
                selectedChoice?.jp === choice.jp && stylesRecognition.choiceSelected,
              ]}
            >
              <Text style={stylesRecognition.choiceJP}>{choice.jp}</Text>
              <Text style={stylesRecognition.choiceRomaji}>{choice.romaji}</Text>
            </TouchableOpacity>
          ))}
        </View>

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
          visible={resultVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setResultVisible(false)}
        >
          <View style={stylesRecognition.modalOverlay}>
            <View style={stylesRecognition.modalCard}>
              <TouchableOpacity
                style={stylesRecognition.modalCloseButton}
                onPress={() => setResultVisible(false)}
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
                  ? 'Good job! This expression is appropriate when greeting your teacher in the morning.'
                  : 'The situation is a morning greeting with a teacher, so use the polite greeting.'}
              </Text>

              <TouchableOpacity
                style={stylesRecognition.modalButton}
                onPress={isCorrect ? () => router.push('/QuackSituate') : handleRetry}
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