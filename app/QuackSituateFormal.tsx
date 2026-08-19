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
import AhiruMissionExit from '../components/AhiruMissionExit';
import styles from '../styles/stylesQuackSituateFormal';

import background from '../assets/forest.jpg';

import duckIdle from '../assets/idle.png';
import duckHappy from '../assets/hello.png';
import duckThinking from '../assets/thinking.png';
import duckTalk from '../assets/talk.png';
import duckSad from '../assets/Crying.png';

import professorNeutral from '../assets/img/Sprite Male Dark Hair Neu01.png';
import professorHappy from '../assets/img/Sprite Male Dark Hair Smi01.png';
import professorAngry from '../assets/img/Sprite Male Dark Hair Ang01.png';

const scenario = {
  chapter: 'Situational Politeness',
  place: '📍 Professor’s Office',
  npcName: 'Professor Tanaka',
  npcLine: 'You missed class yesterday. What would you like to say?',
  question: 'Choose the best Japanese response for this situation.',
  hint: 'Think about who you are speaking to. Is this someone close, or someone you should speak to respectfully?',
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
  const [npcSprite, setNpcSprite] = useState(professorNeutral);
  const [message, setMessage] = useState('Read the situation and choose the best response.');
  const [hintVisible, setHintVisible] = useState(false);
  const [resultVisible, setResultVisible] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const duckFloat = useRef(new Animated.Value(0)).current;
  const npcFloat = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const bubbleAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.7)).current;
  const fireflyAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(duckFloat, { toValue: -8, duration: 750, useNativeDriver: true }),
        Animated.timing(duckFloat, { toValue: 0, duration: 750, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(npcFloat, { toValue: -5, duration: 950, useNativeDriver: true }),
        Animated.timing(npcFloat, { toValue: 0, duration: 950, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.65, duration: 1000, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(fireflyAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(fireflyAnim, { toValue: 0.35, duration: 900, useNativeDriver: true }),
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
      Animated.timing(shakeAnim, { toValue: -5, duration: 50, useNativeDriver: true }),
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
      setNpcSprite(professorHappy);
      setCharacter(duckHappy);
      setMessage('Great! That response fits the situation.');
    } else {
      setIsCorrect(false);
      setNpcSprite(professorAngry);
      setCharacter(duckSad);
      setMessage('That sounds too casual for this situation.');
      shake();
    }

    setResultVisible(true);
  };

  const resetGame = () => {
    setSelected(null);
    setCharacter(duckIdle);
    setNpcSprite(professorNeutral);
    setMessage('Read the situation and choose the best response.');
    setHintVisible(false);
    setResultVisible(false);
    setIsCorrect(false);
  };

  const goBack = () => {
    setHintVisible(false);
    setResultVisible(false);
    setIsExiting(true);
  };

  if (isExiting) return <AhiruMissionExit color="#8423D9" tint="#F0E4FA" icon="people-outline" eyebrow="TONE QUEST CLOSED" title="A thoughtful farewell" message="You practiced choosing respectful Japanese for the person, place, and moment." footer="The right tone turns words into good communication." mascot={duckTalk} onComplete={() => router.push({ pathname: '/QuackSituate', params: { skipLoading: '1' } })} />;

  return (
    <ImageBackground source={background} style={styles.background} resizeMode="cover">
      <View style={styles.overlay} />

      <TouchableOpacity style={styles.backButton} onPress={goBack}>
        <BackIcon width={20} height={20} fill="white" />
      </TouchableOpacity>

      <View style={styles.headerBoard}>
        <Text style={styles.chapterText}>{scenario.chapter}</Text>
        <Text style={styles.headerTitle}>Choose the Right Response</Text>
      </View>

      <View style={styles.sceneCard}>
        <Animated.View style={[styles.fireflyOne, { opacity: fireflyAnim }]} />
        <Animated.View style={[styles.fireflyTwo, { opacity: fireflyAnim }]} />
        <Animated.View style={[styles.fireflyThree, { opacity: fireflyAnim }]} />

        <Text style={styles.placeText}>{scenario.place}</Text>

        <Animated.View
          style={[
            styles.npcBubble,
            {
              opacity: bubbleAnim,
              transform: [{ scale: bubbleAnim }],
            },
          ]}
        >
          <Text style={styles.speakerName}>{scenario.npcName}</Text>
          <Text style={styles.npcText}>{scenario.npcLine}</Text>
        </Animated.View>

        <Animated.Image
          source={npcSprite}
          style={[styles.npcSprite, { transform: [{ translateY: npcFloat }] }]}
        />

        <Animated.View
          style={[
            styles.duckWrap,
            {
              transform: [{ translateY: duckFloat }, { translateX: shakeAnim }],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.duckGlow,
              {
                opacity: glowAnim,
                transform: [{ scale: glowAnim }],
              },
            ]}
          />
          <Image source={character} style={styles.duckImage} />
        </Animated.View>

        <View style={styles.duckBubble}>
          <Text style={styles.duckName}>Quacky</Text>
          <Text style={styles.duckText}>{scenario.question}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.hintButton} onPress={() => setHintVisible(true)}>
        <Text style={styles.hintButtonText}>💡 Need a hint?</Text>
      </TouchableOpacity>

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
              <Text style={styles.choiceMeaning}>{choice.meaning}</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      <View style={styles.dialogueBox}>
        <Text style={styles.dialogueText}>{message}</Text>
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>

      <Modal visible={hintVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setHintVisible(false)}>
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>

            <Image source={duckThinking} style={styles.modalDuck} />
            <Text style={styles.modalTitle}>Hint 💡</Text>
            <Text style={styles.modalText}>{scenario.hint}</Text>

            <TouchableOpacity style={styles.modalButton} onPress={() => setHintVisible(false)}>
              <Text style={styles.modalButtonText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={resultVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setResultVisible(false)}>
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>

            <Image source={isCorrect ? duckHappy : duckThinking} style={styles.modalDuck} />

            <Text style={styles.modalTitle}>
              {isCorrect ? 'Good Response!' : 'Try Again!'}
            </Text>

            <Text style={styles.modalText}>
              {isCorrect
                ? 'Correct! This response is suitable for talking to your professor.'
                : 'This answer does not fit the relationship in the situation. Think about who you are talking to.'}
            </Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={isCorrect ? goBack : resetGame}
            >
              <Text style={styles.modalButtonText}>
                {isCorrect ? 'Back' : 'Try Again'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
};

export default QuackSituateFormal;
