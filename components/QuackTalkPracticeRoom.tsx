import { Ionicons } from '@expo/vector-icons';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { router } from 'expo-router';
import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
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
import { SUMI_VOICE_PROFILE } from '../config/sumiVoiceProfile';
import { AuthContext } from '../context/AuthContext';
import expoconfig from '../expoconfig';
import styles from '../styles/stylesQuackTalkPracticeRoom';
import SmoothSprite from './SmoothSprite';

type PracticeRoomProps = {
  variant: 'conversation' | 'speaking';
};

type Language = 'ja' | 'en';
type RecorderState = 'ready' | 'requesting' | 'recording' | 'recorded' | 'denied' | 'error';

const sumiSmile = require('../assets/img/Sumi_PoseB_WinterUni_Smile.png');
const sumiBlink = require('../assets/img/Sumi_PoseB_WinterUni_EyesClosed_Smile.png');
const sumiSpeaking = require('../assets/img/Sumi_PoseB_WinterUni_Open.png');
const sumiSpeakingBlink = require('../assets/img/Sumi_PoseB_WinterUni_EyesClosed_Open.png');
const sumiListening = require('../assets/img/Sumi_PoseB_WinterUni_Smile_Blush.png');
const sumiListeningBlink = require('../assets/img/Sumi_PoseB_WinterUni_EyesClosed_Smile_Blush.png');

const sumiRoomFrames = [
  sumiSmile,
  sumiBlink,
  sumiSpeaking,
  sumiSpeakingBlink,
  sumiListening,
  sumiListeningBlink,
] as const;

const roomContent = {
  conversation: {
    eyebrow: 'CONVERSATION LOUNGE',
    title: 'Talk with Sumi',
    background: require('../assets/quacktalk/talk-with-sumi-lounge-v1.png'),
    accent: '#7552C8',
    accentSoft: '#F0E7FA',
    glow: '#C6A8FF',
    backdrop: '#251A35',
    activity: 'OPEN CONVERSATION',
    ready: 'A calm space for everyday Japanese',
  },
  speaking: {
    eyebrow: 'VOICE STUDIO',
    title: 'Guided Phrase',
    background: require('../assets/quacktalk/guided-phrase-studio-v1.png'),
    accent: '#D84F83',
    accentSoft: '#FCE9F1',
    glow: '#FFAAC8',
    backdrop: '#171934',
    activity: 'LISTEN & REPEAT',
    ready: 'Hear the rhythm, then make it yours',
  },
} as const;

export default function QuackTalkPracticeRoom({ variant }: PracticeRoomProps) {
  const content = roomContent[variant];
  const { user } = useContext(AuthContext);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const voiceRef = useRef<Audio.Sound | null>(null);
  const blinkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speakingFrameRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [recorderState, setRecorderState] = useState<RecorderState>('ready');
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [language, setLanguage] = useState<Language>('ja');
  const [tutorialVisible, setTutorialVisible] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [isSumiSpeaking, setIsSumiSpeaking] = useState(false);
  const [speakingMouthOpen, setSpeakingMouthOpen] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'offline'>('idle');
  const ambientPulse = useRef(new Animated.Value(0)).current;
  const waveMotion = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const ambientLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(ambientPulse, {
          toValue: 1,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(ambientPulse, {
          toValue: 0,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    const waveLoop = Animated.loop(
      Animated.timing(waveMotion, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    ambientLoop.start();
    waveLoop.start();

    return () => {
      ambientLoop.stop();
      waveLoop.stop();
    };
  }, [ambientPulse, waveMotion]);

  const stopRecordingTimer = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  };

  const releaseRecording = async () => {
    const recording = recordingRef.current;
    recordingRef.current = null;

    if (recording) {
      await recording.stopAndUnloadAsync().catch(() => undefined);
    }
  };

  const stopSumiVoice = async () => {
    if (speakingFrameRef.current) {
      clearInterval(speakingFrameRef.current);
      speakingFrameRef.current = null;
    }

    const sound = voiceRef.current;
    voiceRef.current = null;
    setIsSumiSpeaking(false);
    setSpeakingMouthOpen(false);

    if (sound) {
      await sound.stopAsync().catch(() => undefined);
      await sound.unloadAsync().catch(() => undefined);
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

      stopRecordingTimer();
      void stopSumiVoice();
      void releaseRecording();
    };
  }, []);

  const startRecording = async () => {
    if (recorderState === 'recording' || recorderState === 'requesting') return;

    await stopSumiVoice();
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
      setRecordingSeconds(0);
      stopRecordingTimer();
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((seconds) => seconds + 1);
      }, 1000);
      setRecorderState('recording');
    } catch (error) {
      console.warn('Unable to start microphone recording.', error);
      setRecorderState('error');
    }
  };

  const stopRecording = async () => {
    const completedSeconds = Math.max(recordingSeconds, 1);
    stopRecordingTimer();
    await releaseRecording();

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
    }).catch(() => undefined);

    setRecorderState('recorded');
    setSaveState('saving');

    if (!user?.email) {
      setSaveState('offline');
      return;
    }

    try {
      const response = await fetch(`${expoconfig.API_URL}/api/quackTalkSessions/record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          name: `${user.fname ?? ''} ${user.lname ?? ''}`.trim(),
          roomType: variant === 'conversation' ? 'TALK_WITH_SUMI' : 'GUIDED_PHRASE',
          language: language === 'ja' ? 'JAPANESE' : 'ENGLISH',
          durationSeconds: completedSeconds,
          completed: true,
          evaluated: false,
        }),
      });

      setSaveState(response.ok ? 'saved' : 'offline');
    } catch {
      setSaveState('offline');
    }
  };

  const leaveRoom = async () => {
    stopRecordingTimer();
    await stopSumiVoice();
    await releaseRecording();
    router.replace('/QuackTalk');
  };

  const selectLanguage = async (nextLanguage: Language) => {
    setLanguage(nextLanguage);
    await stopSumiVoice();

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
      });

      const result = await Audio.Sound.createAsync(
        SUMI_VOICE_PROFILE.clips[variant][nextLanguage],
        { shouldPlay: true, volume: 1 },
      );

      voiceRef.current = result.sound;
      setIsSumiSpeaking(true);
      setSpeakingMouthOpen(true);
      speakingFrameRef.current = setInterval(() => {
        setSpeakingMouthOpen((open) => !open);
      }, 170);

      result.sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
        if (status.isLoaded && status.didJustFinish) {
          void stopSumiVoice();
        }
      });
    } catch (error) {
      console.warn('Unable to play Sumi voice recording.', error);
      await stopSumiVoice();
    }
  };

  useEffect(() => {
    const welcomeTimer = setTimeout(() => {
      void selectLanguage('ja');
    }, 550);

    return () => {
      clearTimeout(welcomeTimer);
    };
  }, [variant]);

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
        ? saveState === 'saved'
          ? 'Practice saved. Voice evaluation is coming soon.'
          : saveState === 'saving'
            ? 'Saving this practice session…'
            : 'Practice captured. Evaluation is coming soon.'
        : recorderState === 'denied'
          ? 'Microphone access is disabled in your device settings.'
          : recorderState === 'error'
            ? 'The microphone could not start. Check your device permission.'
            : 'Tap the microphone when you are ready.';

  const timerText = `${String(Math.floor(recordingSeconds / 60)).padStart(2, '0')}:${String(
    recordingSeconds % 60,
  ).padStart(2, '0')}`;

  const tutorialSteps = variant === 'conversation'
    ? [
        ['1', 'Choose a language', 'Select Japanese or English for Sumi’s spoken guidance.'],
        ['2', 'Listen to Sumi', 'Sumi will speak the conversation prompt aloud.'],
        ['3', 'Answer naturally', 'Tap the microphone, speak in Japanese, then tap again to stop.'],
      ]
    : [
        ['1', 'Choose a language', 'Select Japanese or English for Sumi’s spoken guidance.'],
        ['2', 'Listen first', 'Sumi will speak the practice activity aloud.'],
        ['3', 'Record your voice', 'Tap the microphone, practice, then tap again to stop.'],
      ];

  const sumiFrameIndex = isSumiSpeaking
    ? isBlinking
      ? speakingMouthOpen
        ? 3
        : 1
      : speakingMouthOpen
        ? 2
        : 0
    : recorderState === 'recording'
      ? isBlinking
        ? 5
        : 4
      : isBlinking
        ? 1
        : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={content.background}
        style={[styles.background, { backgroundColor: content.backdrop }]}
        imageStyle={styles.backgroundArtwork}
        resizeMode="contain"
      >
        <View style={[styles.sceneTint, variant === 'speaking' && styles.studioTint]} />
        <Animated.View
          pointerEvents="none"
          style={[
            styles.ambientOrb,
            {
              backgroundColor: content.glow,
              opacity: ambientPulse.interpolate({ inputRange: [0, 1], outputRange: [0.12, 0.28] }),
              transform: [{ scale: ambientPulse.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.08] }) }],
            },
          ]}
        />

        <View style={styles.header}>
          <Pressable onPress={() => void leaveRoom()} style={styles.headerButton}>
            <BackIcon width={18} height={18} fill="#47295A" />
          </Pressable>

          <View style={[styles.headerMark, { backgroundColor: content.accentSoft }]}> 
            <Ionicons
              name={variant === 'conversation' ? 'chatbubbles' : 'mic'}
              size={19}
              color={content.accent}
            />
          </View>

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
          <Animated.View
            style={[
              styles.stageHalo,
              {
                borderColor: content.glow,
                transform: [{ scale: ambientPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] }) }],
              },
            ]}
          />
          <View style={styles.coachStatus}>
            <View style={[styles.onlineDot, isSumiSpeaking && { backgroundColor: content.accent }]} />
            <View>
              <Text style={styles.coachStatusText}>
                {isSumiSpeaking
                  ? 'SUMI IS SPEAKING'
                  : recorderState === 'recording'
                    ? 'SUMI IS LISTENING'
                    : content.activity}
              </Text>
              <Text style={styles.coachStatusSubtext}>{content.ready}</Text>
            </View>
          </View>

          <View style={styles.soundscape}>
            {[0, 1, 2, 3, 4].map((bar) => (
              <Animated.View
                key={bar}
                style={[
                  styles.soundBar,
                  {
                    backgroundColor: content.glow,
                    transform: [{
                      scaleY: waveMotion.interpolate({
                        inputRange: [0, (bar + 1) / 6, 1],
                        outputRange: [0.45, isSumiSpeaking || recorderState === 'recording' ? 1.5 : 0.65, 0.45],
                      }),
                    }],
                  },
                ]}
              />
            ))}
          </View>

          <SmoothSprite
            frames={sumiRoomFrames}
            activeIndex={sumiFrameIndex}
            style={styles.sumi}
            resizeMode="contain"
            transitionDuration={75}
          />
          <View style={[styles.floorShadow, { backgroundColor: `${content.accent}38` }]} />
          <View style={[styles.floorLine, { backgroundColor: `${content.glow}66` }]} />

          <View style={styles.controlPanel}>
            <View style={styles.voiceToolsRow}>
              <View style={styles.voiceLabelGroup}>
                <Pressable
                  accessibilityLabel="Replay Sumi's spoken notice"
                  onPress={() => void selectLanguage(language)}
                  style={[styles.voiceReplay, { backgroundColor: content.accentSoft }]}
                >
                  <Ionicons
                    name={isSumiSpeaking ? 'volume-high' : 'volume-medium-outline'}
                    size={18}
                    color={content.accent}
                  />
                </Pressable>
                <View>
                  <Text style={styles.languageLabel}>SUMI'S VOICE</Text>
                  <Text style={styles.voiceProfileLabel}>BILINGUAL COACH</Text>
                </View>
              </View>
              <View style={styles.timerPill}>
                <View
                  style={[
                    styles.timerDot,
                    recorderState === 'recording' && styles.timerDotActive,
                  ]}
                />
                <Text style={styles.timerText}>{timerText}</Text>
              </View>
              <View style={styles.languageSelector}>
                <Pressable
                  onPress={() => void selectLanguage('ja')}
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
                  onPress={() => void selectLanguage('en')}
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
              <View style={[styles.micOrbit, { borderColor: `${content.accent}22` }]} />
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
                onPress={() => router.push({
                  pathname: '/QuackTalkFeedback',
                  params: { returnTo: variant },
                })}
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
