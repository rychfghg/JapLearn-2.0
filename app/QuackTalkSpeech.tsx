import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Image,
  Animated,
  Modal,
  ScrollView,
} from 'react-native';

import { router } from 'expo-router';
import BackIcon from '../assets/svg/back-icon.svg';
import styles from '../styles/stylesQuackTalkSpeech';

import bgClassroom from '../assets/img/background/classroom a st2 day.png';

import sumiOpen from '../assets/img/Sumi_PoseB_WinterUni_Open.png';
import sumiBlush from '../assets/img/Sumi_PoseB_WinterUni_Smile_Blush.png';
import sumiClosed from '../assets/img/Sumi_PoseB_WinterUni_EyesClosed_Smile.png';
import sumiFrown from '../assets/img/Sumi_PoseB_WinterUni_Frown.png';

const speechTasks = [
  {
    title: 'Introduce Yourself',
    prompt: 'Introduce yourself politely in Japanese.',
    guideJP: '私はレイです。よろしくお願いします。',
    guideRomaji: 'Watashi wa Rei desu. Yoroshiku onegaishimasu.',
    guideEnglish: 'I am Rey. Nice to meet you.',
    recognized: '私はレイです。よろしくおねがいします。',
    score: 86,
    pronunciationIssues: [
      {
        word: 'よろしく',
        issue: 'Slightly weak “ro” sound.',
        tip: 'Say “yo-ro-shi-ku” clearly, with each syllable separated.',
      },
      {
        word: 'お願いします',
        issue: 'Ending was too soft.',
        tip: 'Try finishing “masu” clearly but not too strongly.',
      },
    ],
    grammarNotes: [
      'Good polite self-introduction.',
      '「よろしくお願いします」 is natural when meeting someone.',
    ],
  },
  {
    title: 'Ask for Directions',
    prompt: 'Ask where the classroom is.',
    guideJP: '教室はどこですか。',
    guideRomaji: 'Kyoushitsu wa doko desu ka.',
    guideEnglish: 'Where is the classroom?',
    recognized: 'きょうしつはどこですか。',
    score: 78,
    pronunciationIssues: [
      {
        word: '教室',
        issue: 'Long vowel sounded short.',
        tip: 'Hold “kyou” slightly longer: kyou-shi-tsu.',
      },
      {
        word: 'どこ',
        issue: 'Good pronunciation.',
        tip: 'Keep the same clear “do-ko” sound.',
      },
    ],
    grammarNotes: [
      'Correct question pattern: place + は + どこですか.',
      'Use 「ですか」 for polite questions.',
    ],
  },
  {
    title: 'Thank Someone',
    prompt: 'Thank Sumi politely.',
    guideJP: 'ありがとうございます。',
    guideRomaji: 'Arigatou gozaimasu.',
    guideEnglish: 'Thank you very much.',
    recognized: 'ありがとうございます。',
    score: 94,
    pronunciationIssues: [
      {
        word: 'ありがとう',
        issue: 'Very clear.',
        tip: 'Good rhythm: a-ri-ga-tou.',
      },
      {
        word: 'ございます',
        issue: 'Good polite ending.',
        tip: 'Keep “go-za-i-ma-su” smooth.',
      },
    ],
    grammarNotes: [
      'Excellent polite expression.',
      'Use this with teachers, staff, or people you are not close with.',
    ],
  },
];

const QuackTalkSpeech = () => {
  const [taskIndex, setTaskIndex] = useState(0);
  const [mode, setMode] = useState<'prompt' | 'listening' | 'analysis'>('prompt');
  const [finished, setFinished] = useState(false);
  const [sumiSprite, setSumiSprite] = useState(sumiOpen);
  const [completed, setCompleted] = useState(0);

  const floatAnim = useRef(new Animated.Value(0)).current;
  const micPulse = useRef(new Animated.Value(1)).current;

  const current = speechTasks[taskIndex];

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -5,
          duration: 850,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 850,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (mode !== 'listening') return;

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(micPulse, {
          toValue: 1.15,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.timing(micPulse, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();
    return () => pulse.stop();
  }, [mode]);

  const startRecognition = () => {
    setMode('listening');
    setSumiSprite(sumiBlush);

    setTimeout(() => {
      setMode('analysis');
      setSumiSprite(current.score >= 80 ? sumiClosed : sumiFrown);
      setCompleted((prev) => prev + 1);
    }, 1800);
  };

  const nextTask = () => {
    if (taskIndex >= speechTasks.length - 1) {
      setFinished(true);
      return;
    }

    setTaskIndex((prev) => prev + 1);
    setMode('prompt');
    setSumiSprite(sumiOpen);
    micPulse.setValue(1);
  };

  const backToMenu = () => {
    setFinished(false);
    setMode('prompt');
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
          <Text style={styles.headerMini}>4.2 SPEECH RECOGNITION</Text>
          <Text style={styles.headerTitle}>Speech Assist</Text>
        </View>

        <View style={styles.stageBadge}>
          <Text style={styles.stageBadgeText}>{taskIndex + 1}/3</Text>
        </View>
      </View>

      <Animated.View style={[styles.sumiArea, { transform: [{ translateY: floatAnim }] }]}>
        <View style={styles.shadow} />
        <Image source={sumiSprite} style={styles.sumiSprite} />
      </Animated.View>

      <View style={styles.panel}>
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.taskTitle}>{current.title}</Text>
            <Text style={styles.taskPrompt}>{current.prompt}</Text>
          </View>

          <View style={styles.scorePill}>
            <Text style={styles.scorePillText}>
              {mode === 'analysis' ? `${current.score}%` : 'READY'}
            </Text>
          </View>
        </View>

        <View style={styles.guideBox}>
          <Text style={styles.guideLabel}>Guided Response</Text>
          <Text style={styles.guideJP}>{current.guideJP}</Text>
          <Text style={styles.guideRomaji}>{current.guideRomaji}</Text>
          <Text style={styles.guideEnglish}>{current.guideEnglish}</Text>
        </View>

        {mode === 'prompt' && (
          <View style={styles.micSection}>
            <TouchableOpacity activeOpacity={0.85} onPress={startRecognition}>
              <Animated.View style={[styles.micButton, { transform: [{ scale: micPulse }] }]}>
                <Text style={styles.micText}>TALK</Text>
              </Animated.View>
            </TouchableOpacity>

            <Text style={styles.helperText}>
              Tap and say the guided Japanese response.
            </Text>
          </View>
        )}

        {mode === 'listening' && (
          <View style={styles.listeningBox}>
            <Animated.View style={[styles.recordCircle, { transform: [{ scale: micPulse }] }]}>
              <Text style={styles.recordText}>REC</Text>
            </Animated.View>

            <Text style={styles.listeningText}>Listening...</Text>
            <Text style={styles.helperText}>Speech recognition is simulated for now.</Text>
          </View>
        )}

        {mode === 'analysis' && (
          <ScrollView style={styles.analysisScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.recognizedBox}>
              <Text style={styles.analysisLabel}>Recognized Speech</Text>
              <Text style={styles.recognizedText}>{current.recognized}</Text>
            </View>

            <View style={styles.analysisBox}>
              <Text style={styles.analysisTitle}>Pronunciation Guidance</Text>

              {current.pronunciationIssues.map((item) => (
                <View key={item.word} style={styles.issueCard}>
                  <Text style={styles.issueWord}>{item.word}</Text>
                  <Text style={styles.issueText}>{item.issue}</Text>
                  <Text style={styles.issueTip}>{item.tip}</Text>
                </View>
              ))}
            </View>

            <View style={styles.analysisBox}>
              <Text style={styles.analysisTitle}>Translation / Grammar Notes</Text>

              {current.grammarNotes.map((note) => (
                <Text key={note} style={styles.noteText}>• {note}</Text>
              ))}
            </View>

            <TouchableOpacity style={styles.nextButton} onPress={nextTask}>
              <Text style={styles.nextButtonText}>
                {taskIndex >= speechTasks.length - 1 ? 'Finish' : 'Next Practice'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>

      <Modal visible={finished} transparent animationType="fade" onRequestClose={backToMenu}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Image source={sumiClosed} style={styles.modalSumi} />

            <Text style={styles.modalTitle}>Speech Practice Complete!</Text>
            <Text style={styles.modalStats}>Completed: {completed}/3</Text>
            <Text style={styles.modalDesc}>
              Pronunciation guidance, recognized speech, and practice results are ready to save later.
            </Text>

            <TouchableOpacity style={styles.modalButton} onPress={backToMenu}>
              <Text style={styles.modalButtonText}>Back to QuackTalk</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
};

export default QuackTalkSpeech;