import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Image,
  Animated,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import BackIcon from '../assets/svg/back-icon.svg';
import styles from '../styles/stylesQuackSituateFormal';

import background from '../assets/background.png';
import duckIdle from '../assets/idle.png';
import duckHappy from '../assets/hello.png';
import duckThinking from '../assets/thinking.png';
import duckTalk from '../assets/talk.png';
import duckSad from '../assets/Crying.png';

import professorNeutral from '../assets/img/Sprite Male Dark Hair Neu01.png';
import professorHappy from '../assets/img/Sprite Male Dark Hair Smi01.png';
import professorAngry from '../assets/img/Sprite Male Dark Hair Ang01.png';

const scenario = {
  chapter: 'DAY 1 — PROFESSOR’S OFFICE',
  npcLine: 'You missed class yesterday. What would you like to say?',
  duckThought: 'This is my professor... I need to choose the respectful response.',
  choices: [
    {
      jp: 'すみませんでした',
      romaji: 'sumimasen deshita',
      correct: true,
    },
    {
      jp: 'ごめんね',
      romaji: 'gomen ne',
      correct: false,
    },
  ],
};

const QuackSituateFormal = () => {
  const [selected, setSelected] = useState<any>(null);
  const [character, setCharacter] = useState(duckIdle);
  const [professorSprite, setProfessorSprite] = useState(professorNeutral);
  const [respect, setRespect] = useState(50);
  const [message, setMessage] = useState('Choose the best response to Professor Tanaka.');
  const [resultVisible, setResultVisible] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const floatAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const bubbleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -8, duration: 750, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 750, useNativeDriver: true }),
      ])
    ).start();

    Animated.timing(bubbleAnim, {
      toValue: 1,
      duration: 450,
      useNativeDriver: true,
    }).start();
  }, []);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const pulse = () => {
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.04, duration: 120, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
  };

  const handleSelect = (choice: any) => {
    setSelected(choice);
    setCharacter(duckTalk);
    setMessage(`You chose: ${choice.romaji}`);
    pulse();
  };

  const handleSubmit = () => {
    if (!selected) {
      setCharacter(duckThinking);
      setMessage('Pick one response first.');
      shake();
      return;
    }

    if (selected.correct) {
      setIsCorrect(true);
      setRespect(100);
      setProfessorSprite(professorHappy);
      setCharacter(duckHappy);
      setMessage('Great! Professor Tanaka accepts your respectful response.');
    } else {
      setIsCorrect(false);
      setRespect(20);
      setProfessorSprite(professorAngry);
      setCharacter(duckSad);
      setMessage('Oh no! That sounded too casual for a professor.');
      shake();
    }

    setResultVisible(true);
  };

  const resetGame = () => {
    setSelected(null);
    setCharacter(duckIdle);
    setProfessorSprite(professorNeutral);
    setRespect(50);
    setMessage('Choose the best response to Professor Tanaka.');
    setResultVisible(false);
    setIsCorrect(false);
  };

  return (
    <ImageBackground source={background} style={styles.background} resizeMode="cover">
      <View style={styles.overlay} />

      <TouchableOpacity style={styles.backButton} onPress={() => router.push('/QuackSituate')}>
        <BackIcon width={20} height={20} fill="white" />
      </TouchableOpacity>

      <View style={styles.headerBoard}>
        <Text style={styles.chapterText}>{scenario.chapter}</Text>
        <Text style={styles.headerTitle}>Respect Battle</Text>
      </View>

      <View style={styles.respectPanel}>
        <Text style={styles.respectLabel}>Professor Respect</Text>
        <View style={styles.respectBar}>
          <View style={[styles.respectFill, { width: `${respect}%` }]} />
        </View>
        <Text style={styles.respectValue}>{respect}%</Text>
      </View>

      <View style={styles.scenePanel}>
        <Image source={professorSprite} style={styles.professorSprite} />

        <Animated.View
          style={[
            styles.professorBubble,
            {
              opacity: bubbleAnim,
              transform: [{ scale: bubbleAnim }],
            },
          ]}
        >
          <Text style={styles.speakerName}>Professor Tanaka</Text>
          <Text style={styles.professorText}>{scenario.npcLine}</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.duckWrap,
            {
              transform: [{ translateY: floatAnim }, { translateX: shakeAnim }],
            },
          ]}
        >
          <View style={styles.duckGlow} />
          <Image source={character} style={styles.duckImage} />
        </Animated.View>

        <View style={styles.duckBubble}>
          <Text style={styles.duckName}>Ahiru-san</Text>
          <Text style={styles.duckText}>{scenario.duckThought}</Text>
        </View>
      </View>

      <View style={styles.choiceContainer}>
        {scenario.choices.map((choice) => (
          <Animated.View
            key={choice.jp}
            style={selected?.jp === choice.jp ? { transform: [{ scale: pulseAnim }] } : null}
          >
            <TouchableOpacity
              activeOpacity={0.9}
              style={[
                styles.choiceCard,
                selected?.jp === choice.jp && styles.selectedChoice,
              ]}
              onPress={() => handleSelect(choice)}
            >
              <Text style={styles.choiceJP}>{choice.jp}</Text>
              <Text style={styles.choiceRomaji}>{choice.romaji}</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      <View style={styles.dialogueBox}>
        <Text style={styles.dialogueText}>{message}</Text>
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Respond</Text>
      </TouchableOpacity>

      <Modal visible={resultVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setResultVisible(false)}>
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>
              {isCorrect ? 'Respect Up!' : 'Too Casual!'}
            </Text>

            <Text style={styles.modalRank}>
              {isCorrect ? '+50 Respect' : '-30 Respect'}
            </Text>

            <Text style={styles.modalText}>
              {isCorrect
                ? 'That response was appropriate for speaking to a professor.'
                : 'This response sounds casual. Choose a more respectful expression.'}
            </Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={isCorrect ? () => router.push('/QuackSituate') : resetGame}
            >
              <Text style={styles.modalButtonText}>{isCorrect ? 'Back' : 'Try Again'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
};

export default QuackSituateFormal;