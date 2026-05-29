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
import styles from '../styles/stylesQuackTalkConversation';

import bgClassroom from '../assets/img/background/classroom a st2 day.png';

import sumiOpen from '../assets/img/Sumi_PoseB_WinterUni_Open.png';
import sumiBlush from '../assets/img/Sumi_PoseB_WinterUni_Smile_Blush.png';
import sumiClosed from '../assets/img/Sumi_PoseB_WinterUni_EyesClosed_Smile.png';
import sumiSad from '../assets/img/Sumi_PoseB_WinterUni_Frown.png';

const speakingStages = [
  {
    title: 'Self Introduction',
    scene: 'Sumi asks you to introduce yourself.',
    sumiJP: 'はじめまして。お名前は？',
    sumiRomaji: 'Hajimemashite. Onamae wa?',
    sumiEnglish: 'Nice to meet you. What is your name?',
    expectedJP: '私はレイです',
    expectedRomaji: 'Watashi wa Rei desu',
    fakeRecognized: '私はレイです',
    feedback: 'Good! You introduced yourself clearly.',
  },
  {
    title: 'Asking Directions',
    scene: 'You need help finding the classroom.',
    sumiJP: 'どこへ行きたいですか？',
    sumiRomaji: 'Doko e ikitai desu ka?',
    sumiEnglish: 'Where do you want to go?',
    expectedJP: '教室はどこですか',
    expectedRomaji: 'Kyoushitsu wa doko desu ka',
    fakeRecognized: '教室はどこですか',
    feedback: 'Nice! This is a useful direction question.',
  },
  {
    title: 'Thanking Someone',
    scene: 'Sumi helps you find the room.',
    sumiJP: 'ここが教室です。',
    sumiRomaji: 'Koko ga kyoushitsu desu.',
    sumiEnglish: 'This is the classroom.',
    expectedJP: 'ありがとうございます',
    expectedRomaji: 'Arigatou gozaimasu',
    fakeRecognized: 'ありがとうございます',
    feedback: 'Excellent! That is polite and natural.',
  },
];

const QuackTalkConversation = () => {
  const [stageIndex, setStageIndex] = useState(0);
  const [mode, setMode] = useState<'prompt' | 'listening' | 'feedback'>('prompt');
  const [recognizedText, setRecognizedText] = useState('');
  const [completedCount, setCompletedCount] = useState(0);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [sumiSprite, setSumiSprite] = useState(sumiOpen);

  const floatAnim = useRef(new Animated.Value(0)).current;
  const micPulse = useRef(new Animated.Value(1)).current;
  const listenRing = useRef(new Animated.Value(1)).current;

  const current = speakingStages[stageIndex];

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -4, duration: 900, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (mode !== 'listening') return;

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(micPulse, { toValue: 1.12, duration: 480, useNativeDriver: true }),
        Animated.timing(micPulse, { toValue: 1, duration: 480, useNativeDriver: true }),
      ])
    );

    const ring = Animated.loop(
      Animated.sequence([
        Animated.timing(listenRing, { toValue: 1.28, duration: 650, useNativeDriver: true }),
        Animated.timing(listenRing, { toValue: 1, duration: 650, useNativeDriver: true }),
      ])
    );

    pulse.start();
    ring.start();

    return () => {
      pulse.stop();
      ring.stop();
    };
  }, [mode]);

  const startSpeaking = () => {
    setMode('listening');
    setRecognizedText('');
    setSumiSprite(sumiBlush);

    setTimeout(() => {
      setRecognizedText(current.fakeRecognized);
      setCompletedCount((prev) => prev + 1);
      setSumiSprite(sumiClosed);
      setMode('feedback');
    }, 1600);
  };

  const nextStage = () => {
    if (stageIndex >= speakingStages.length - 1) {
      setFinished(true);
      return;
    }

    setStageIndex((prev) => prev + 1);
    setRecognizedText('');
    setMode('prompt');
    setSumiSprite(sumiOpen);
    micPulse.setValue(1);
    listenRing.setValue(1);
  };

  const backToMenu = () => {
    setFinished(false);
    setMode('prompt');
    setRecognizedText('');
    router.replace('/QuackTalk');
  };

  return (
    <ImageBackground source={bgClassroom} style={styles.background} resizeMode="cover">
      <View style={styles.overlay} />

      <View style={styles.header}>
        <TouchableOpacity onPress={backToMenu}>
          <View style={styles.backButton}>
            <BackIcon width={22} height={22} fill="white" />
          </View>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerMini}>CONTROLLED SPEAKING</Text>
          <Text style={styles.headerTitle}>QuackTalk</Text>
        </View>

        <View style={styles.stageBadge}>
          <Text style={styles.stageBadgeText}>{stageIndex + 1}/{speakingStages.length}</Text>
        </View>
      </View>

      <View style={styles.scoreRow}>
        <View style={styles.scoreCard}>
          <Text style={styles.scoreValue}>{completedCount}</Text>
          <Text style={styles.scoreLabel}>Done</Text>
        </View>

        <View style={styles.scoreCard}>
          <Text style={styles.scoreValue}>{mistakeCount}</Text>
          <Text style={styles.scoreLabel}>Mistakes</Text>
        </View>
      </View>

      <Animated.View style={[styles.characterArea, { transform: [{ translateY: floatAnim }] }]}>
        <View style={styles.characterShadow} />
        <Image source={sumiSprite} style={styles.sumiSprite} />
      </Animated.View>

      <View style={styles.promptPanel}>
        <View style={styles.topPromptRow}>
          <View>
            <Text style={styles.promptTitle}>{current.title}</Text>
            <Text style={styles.sceneText}>{current.scene}</Text>
          </View>
          <Text style={styles.promptBadge}>VOICE</Text>
        </View>

        <View style={styles.sumiBubble}>
          <Text style={styles.sumiName}>Sumi</Text>
          <Text style={styles.sumiJP}>{current.sumiJP}</Text>
          <Text style={styles.sumiRomaji}>{current.sumiRomaji}</Text>
          <Text style={styles.sumiEnglish}>{current.sumiEnglish}</Text>
        </View>

        <View style={styles.expectedBox}>
          <Text style={styles.expectedLabel}>Speak this response</Text>
          <Text style={styles.expectedJP}>{current.expectedJP}</Text>
          <Text style={styles.expectedRomaji}>{current.expectedRomaji}</Text>
        </View>

        {mode === 'prompt' && (
          <TouchableOpacity activeOpacity={0.85} style={styles.micArea} onPress={startSpeaking}>
            <Animated.View style={[styles.micButton, { transform: [{ scale: micPulse }] }]}>
              <Text style={styles.micText}>TALK</Text>
            </Animated.View>
            <Text style={styles.micHint}>Tap to simulate speaking</Text>
          </TouchableOpacity>
        )}

        {mode === 'listening' && (
          <View style={styles.listeningBox}>
            <Animated.View style={[styles.listeningRing, { transform: [{ scale: listenRing }] }]} />
            <View style={styles.listeningDot}>
              <Text style={styles.listeningMicText}>REC</Text>
            </View>
            <Text style={styles.listeningText}>Listening...</Text>
            <Text style={styles.listeningSub}>Say the guided Japanese response</Text>
          </View>
        )}

        {mode === 'feedback' && (
          <View style={styles.feedbackBox}>
            <Text style={styles.feedbackLabel}>Recognized Speech</Text>
            <Text style={styles.recognizedText}>{recognizedText}</Text>
            <Text style={styles.feedbackText}>{current.feedback}</Text>

            <TouchableOpacity style={styles.nextButton} onPress={nextStage}>
              <Text style={styles.nextButtonText}>
                {stageIndex >= speakingStages.length - 1 ? 'Finish' : 'Next Prompt'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Modal visible={finished} transparent animationType="fade" onRequestClose={backToMenu}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Image source={sumiClosed} style={styles.modalSumi} />
            <Text style={styles.modalTitle}>Speaking Complete!</Text>
            <Text style={styles.modalStats}>Completed: {completedCount}/{speakingStages.length}</Text>
            <Text style={styles.modalDesc}>
              Your controlled speaking practice progress has been recorded.
            </Text>

            <TouchableOpacity style={styles.modalButton} onPress={backToMenu}>
              <Text style={styles.modalButtonText}>Back to Menu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
};

export default QuackTalkConversation;