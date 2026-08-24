import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  ImageBackground,
  Linking,
  Modal,
  Pressable,
  SafeAreaView,
  Text,
  View,
} from 'react-native';
import BackIcon from '../assets/svg/back-icon.svg';
import styles from '../styles/stylesQuackTalkPracticeRoom';

type PracticeRoomProps = {
  variant: 'conversation' | 'speaking';
};

type Language = 'ja' | 'en';
type RecorderState = 'ready' | 'requesting' | 'recording' | 'recorded' | 'denied' | 'error';

const sumiSmile = require('../assets/img/Sumi_PoseB_WinterUni_Smile.png');
const sumiBlink = require('../assets/img/Sumi_PoseB_WinterUni_EyesClosed_Smile.png');

const roomContent = {
  conversation: {
    eyebrow: 'SUMI CONVERSATION',
    title: 'Talk with Sumi',
    promptLabel: 'CONVERSATION PROMPT',
    promptTitle: 'Your next speaking situation will appear here.',
    promptNote: 'Guided questions will begin when the conversation service is connected.',
    background: require('../assets/img/background/classroom a st2 day.png'),
    accent: '#7552C8',
    accentSoft: '#F0E7FA',
  },
  speaking: {
    eyebrow: 'SUMI SPEAKING STUDIO',
    title: 'Voice Practice',
    promptLabel: 'PRACTICE PROMPT',
    promptTitle: 'Your next pronunciation activity will appear here.',
    promptNote: 'Practice phrases will begin when the listening service is connected.',
    background: require('../assets/img/background/school a auditorium inuse.png'),
    accent: '#D84F83',
    accentSoft: '#FCE9F1',
  },
} as const;

export default function QuackTalkPracticeRoom({ variant }: PracticeRoomProps) {
  const content = roomContent[variant];
  const recordingRef = useRef<Audio.Recording | null>(null);
  const blinkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [recorderState, setRecorderState] = useState<RecorderState>('ready');
  const [language, setLanguage] = useState<Language>('ja');
  const [tutorialVisible, setTutorialVisible] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);

  const releaseRecording = async () => {
    const recording = recordingRef.current;
    recordingRef.current = null;

    if (recording) {
      await recording.stopAndUnloadAsync().catch(() => undefined);
    }
  };

  useEffect(() => {
    let active = true;

    const scheduleBlink = () => {
      blinkTimerRef.current = setTimeout(() => {
        if (!active) return;

        setIsBlinking(true);
        blinkTimerRef.current = setTimeout(() => {
          if (!active) return;

          setIsBlinking(false);
          scheduleBlink();
        }, 150);
      }, 3600);
    };

    scheduleBlink();

    return () => {
      active = false;

      if (blinkTimerRef.current) {
        clearTimeout(blinkTimerRef.current);
      }

      void releaseRecording();
    };
  }, []);

  const startRecording = async () => {
    if (recorderState === 'recording' || recorderState === 'requesting') return;

    setRecorderState('requesting');

    try {
      const permission = await Audio.requestPermissionsAsync();

      if (!permission.granted) {
        setRecorderState('denied');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
      });

      const result = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );

      recordingRef.current = result.recording;
      setRecorderState('recording');
    } catch (error) {
      console.warn('Unable to start microphone recording.', error);
      setRecorderState('error');
    }
  };

  const stopRecording = async () => {
    await releaseRecording();

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
    }).catch(() => undefined);

    setRecorderState('recorded');
  };

  const leaveRoom = async () => {
    await releaseRecording();
    router.replace('/QuackTalk');
  };

  const openSupport = async () => {
    const subject = encodeURIComponent(`JapLearn ${content.title} support`);
    const body = encodeURIComponent(
      `Hello JapLearn Support,\n\nI found a problem in ${content.title}.\n\nDevice/browser:\nWhat happened:\nSteps to reproduce:\n`,
    );

    await Linking.openURL(
      `mailto:japlearn.official@gmail.com?subject=${subject}&body=${body}`,
    );
  };

  const statusCopy = recorderState === 'recording'
    ? 'Listening now — tap again to stop.'
    : recorderState === 'requesting'
      ? 'Requesting microphone access…'
      : recorderState === 'recorded'
        ? 'Microphone test captured. Evaluation is coming soon.'
        : recorderState === 'denied'
          ? 'Microphone access is disabled in your device settings.'
          : recorderState === 'error'
            ? 'The microphone could not start. Check your device permission.'
            : 'Tap the microphone when you are ready.';

  const tutorialSteps = variant === 'conversation'
    ? [
        ['1', 'Check the prompt', 'Read the speaking situation shown below Sumi.'],
        ['2', 'Listen to Sumi', 'Sumi will speak the question in your selected language.'],
        ['3', 'Answer naturally', 'Tap the microphone, speak in Japanese, then tap again to stop.'],
      ]
    : [
        ['1', 'Check the activity', 'The pronunciation task will appear below Sumi.'],
        ['2', 'Listen first', 'Hear the model in Japanese or use English guidance.'],
        ['3', 'Record your voice', 'Tap the microphone, practice, then tap again to stop.'],
      ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground source={content.background} style={styles.background} resizeMode="cover">
        <View style={styles.sceneTint} />

        <View style={styles.header}>
          <Pressable onPress={() => void leaveRoom()} style={styles.headerButton}>
            <BackIcon width={18} height={18} fill="#47295A" />
          </Pressable>

          <View style={styles.headerCopy}>
            <Text style={[styles.headerEyebrow, { color: content.accent }]}>{content.eyebrow}</Text>
            <Text style={styles.headerTitle}>{content.title}</Text>
          </View>

          <Pressable
            accessibilityLabel={`How ${content.title} works`}
            onPress={() => setTutorialVisible(true)}
            style={[styles.headerButton, { backgroundColor: content.accentSoft }]}
          >
            <Ionicons name="help" size={22} color={content.accent} />
          </Pressable>
        </View>

        <View style={styles.stage}>
          <View style={styles.stageHalo} />
          <View style={styles.coachStatus}>
            <View style={styles.onlineDot} />
            <Text style={styles.coachStatusText}>SUMI · READY TO PRACTICE</Text>
          </View>

          <Image
            source={isBlinking ? sumiBlink : sumiSmile}
            style={styles.sumi}
            resizeMode="contain"
            fadeDuration={0}
          />
          <View style={styles.floorShadow} />
          <View style={styles.floorLine} />

          <View style={styles.controlPanel}>
            <View style={styles.promptRow}>
              <View style={[styles.promptIcon, { backgroundColor: content.accentSoft }]}> 
                <Ionicons
                  name={variant === 'conversation' ? 'chatbubbles-outline' : 'school-outline'}
                  size={22}
                  color={content.accent}
                />
              </View>
              <View style={styles.promptCopy}>
                <Text style={[styles.promptLabel, { color: content.accent }]}>{content.promptLabel}</Text>
                <Text style={styles.promptTitle}>{content.promptTitle}</Text>
                <Text style={styles.promptNote}>{content.promptNote}</Text>
              </View>
            </View>

            <View style={styles.languageRow}>
              <Text style={styles.languageLabel}>SUMI'S LANGUAGE</Text>
              <View style={styles.languageSelector}>
                <Pressable
                  onPress={() => setLanguage('ja')}
                  style={[
                    styles.languageChoice,
                    language === 'ja' && { backgroundColor: content.accent },
                  ]}
                >
                  <Text style={[styles.languageChoiceText, language === 'ja' && styles.languageChoiceTextActive]}>
                    日本語
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setLanguage('en')}
                  style={[
                    styles.languageChoice,
                    language === 'en' && { backgroundColor: content.accent },
                  ]}
                >
                  <Text style={[styles.languageChoiceText, language === 'en' && styles.languageChoiceTextActive]}>
                    English
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.microphoneArea}>
              <Pressable
                accessibilityLabel={recorderState === 'recording' ? 'Stop recording' : 'Start recording'}
                onPress={recorderState === 'recording' ? stopRecording : startRecording}
                style={({ pressed }) => [
                  styles.microphoneButton,
                  {
                    backgroundColor: recorderState === 'recording' ? '#E34F6C' : content.accent,
                  },
                  pressed && styles.microphonePressed,
                ]}
              >
                <Ionicons
                  name={recorderState === 'recording' ? 'stop' : 'mic'}
                  size={33}
                  color="#FFFFFF"
                />
              </Pressable>
              <Text style={styles.microphoneStatus}>{statusCopy}</Text>
            </View>

            <View style={styles.secondaryActions}>
              <Pressable
                onPress={() => router.push('/QuackTalkFeedback')}
                style={styles.secondaryButton}
              >
                <Ionicons name="analytics-outline" size={18} color="#7552C8" />
                <Text style={styles.secondaryButtonText}>Feedback</Text>
              </Pressable>
              <Pressable onPress={() => void openSupport()} style={styles.secondaryButton}>
                <Ionicons name="bug-outline" size={18} color="#D84F83" />
                <Text style={styles.secondaryButtonText}>Report a problem</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <Modal
          visible={tutorialVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setTutorialVisible(false)}
        >
          <View style={styles.tutorialShade}>
            <View style={styles.tutorialCard}>
              <View style={styles.tutorialHeader}>
                <View style={[styles.tutorialIcon, { backgroundColor: content.accentSoft }]}> 
                  <Ionicons name="sparkles-outline" size={23} color={content.accent} />
                </View>
                <View style={styles.tutorialHeaderCopy}>
                  <Text style={[styles.tutorialKicker, { color: content.accent }]}>QUICK GUIDE</Text>
                  <Text style={styles.tutorialTitle}>{content.title}</Text>
                </View>
                <Pressable onPress={() => setTutorialVisible(false)} style={styles.tutorialClose}>
                  <Ionicons name="close" size={20} color="#695C6E" />
                </Pressable>
              </View>

              {tutorialSteps.map(([step, title, copy]) => (
                <View key={step} style={styles.tutorialStep}>
                  <View style={[styles.tutorialStepNumber, { backgroundColor: content.accent }]}> 
                    <Text style={styles.tutorialStepNumberText}>{step}</Text>
                  </View>
                  <View style={styles.tutorialStepCopy}>
                    <Text style={styles.tutorialStepTitle}>{title}</Text>
                    <Text style={styles.tutorialStepText}>{copy}</Text>
                  </View>
                </View>
              ))}

              <View style={styles.tutorialNotice}>
                <Ionicons name="construct-outline" size={18} color="#A06D1E" />
                <Text style={styles.tutorialNoticeText}>
                  Microphone testing works now. Sumi's spoken prompts and AI evaluation are coming soon.
                </Text>
              </View>

              <Pressable
                onPress={() => setTutorialVisible(false)}
                style={[styles.tutorialDone, { backgroundColor: content.accent }]}
              >
                <Text style={styles.tutorialDoneText}>Start exploring</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </ImageBackground>
    </SafeAreaView>
  );
}
