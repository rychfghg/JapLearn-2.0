import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  ImageBackground,
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

type RecorderState = 'ready' | 'requesting' | 'recording' | 'recorded' | 'denied' | 'error';

const roomContent = {
  conversation: {
    eyebrow: 'GUIDED CONVERSATION',
    title: 'Talk with Sumi',
    badge: 'QUESTION ROOM',
    heading: 'Sumi’s guided questions',
    description: 'This room is ready for controlled Japanese conversations. Questions will appear once the conversation service is connected.',
    note: 'No question is loaded yet. Your microphone can still be tested below.',
    background: require('../assets/img/background/clubroom a st2 day.png'),
    accent: '#7552C8',
  },
  speaking: {
    eyebrow: 'SPEAKING STUDIO',
    title: 'Voice Practice',
    badge: 'OPEN PRACTICE',
    heading: 'Practice your Japanese voice',
    description: 'Use this room to test your microphone. Guided phrases and pronunciation analysis will be added with the listening service.',
    note: 'No practice phrase is assigned yet. Recording works, but it is not analyzed or scored.',
    background: require('../assets/img/background/house a day.png'),
    accent: '#D84F83',
  },
} as const;

export default function QuackTalkPracticeRoom({ variant }: PracticeRoomProps) {
  const content = roomContent[variant];
  const recordingRef = useRef<Audio.Recording | null>(null);
  const [recorderState, setRecorderState] = useState<RecorderState>('ready');

  const releaseRecording = async () => {
    const recording = recordingRef.current;
    recordingRef.current = null;

    if (!recording) return;

    await recording.stopAndUnloadAsync().catch(() => undefined);
  };

  useEffect(() => {
    return () => {
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

  const statusCopy = recorderState === 'recording'
    ? 'Listening to your voice…'
    : recorderState === 'requesting'
      ? 'Requesting microphone access…'
      : recorderState === 'recorded'
        ? 'Recording captured locally. AI feedback is not connected yet.'
        : recorderState === 'denied'
          ? 'Microphone permission was denied. Enable it in your device settings.'
          : recorderState === 'error'
            ? 'The microphone could not start. Check your browser or device permission.'
            : 'Tap the microphone when you are ready.';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={content.background}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.sceneShade} />

        <View style={styles.topBar}>
          <Pressable onPress={() => void leaveRoom()} style={styles.backButton}>
            <BackIcon width={18} height={18} fill="#47295A" />
          </Pressable>

          <View style={styles.brand}>
            <Ionicons name="mic-outline" size={16} color={content.accent} />
            <View>
              <Text style={styles.brandEyebrow}>{content.eyebrow}</Text>
              <Text style={styles.brandTitle}>{content.title}</Text>
            </View>
          </View>

          <View style={[styles.roomBadge, { backgroundColor: `${content.accent}16` }]}>
            <View style={[styles.roomBadgeDot, { backgroundColor: content.accent }]} />
            <Text style={[styles.roomBadgeText, { color: content.accent }]}>SOON</Text>
          </View>
        </View>

        <View style={styles.roomStage}>
          <View style={styles.windowGlow} />
          <View style={styles.coachTag}>
            <View style={styles.coachOnline} />
            <Text style={styles.coachTagText}>SUMI’S SPEAKING ROOM</Text>
          </View>

          <Image
            source={require('../assets/img/Sumi_PoseB_WinterUni_Smile.png')}
            style={styles.sumi}
            resizeMode="contain"
          />
          <View style={styles.characterShadow} />

          <View style={styles.infoPanel}>
            <View style={styles.infoTopRow}>
              <View style={[styles.infoIcon, { backgroundColor: `${content.accent}16` }]}>
                <Ionicons
                  name={variant === 'conversation' ? 'chatbubbles-outline' : 'mic-outline'}
                  size={22}
                  color={content.accent}
                />
              </View>
              <View style={styles.infoTitleCopy}>
                <Text style={[styles.infoKicker, { color: content.accent }]}>{content.badge}</Text>
                <Text style={styles.infoTitle}>{content.heading}</Text>
              </View>
            </View>

            <Text style={styles.infoDescription}>{content.description}</Text>

            <View style={styles.availabilityNote}>
              <Ionicons name="sparkles-outline" size={17} color="#D88727" />
              <Text style={styles.availabilityText}>{content.note}</Text>
            </View>

            <View style={styles.microphoneArea}>
              <Pressable
                onPress={recorderState === 'recording' ? stopRecording : startRecording}
                style={({ pressed }) => [
                  styles.microphoneButton,
                  { backgroundColor: recorderState === 'recording' ? '#E54F6D' : content.accent },
                  pressed && styles.microphonePressed,
                ]}
              >
                <Ionicons
                  name={recorderState === 'recording' ? 'stop' : 'mic'}
                  size={30}
                  color="#FFFFFF"
                />
              </Pressable>

              <Text style={styles.microphoneStatus}>{statusCopy}</Text>
              <Text style={styles.privacyText}>Recordings are not uploaded or scored yet.</Text>
            </View>

            <Pressable
              style={styles.progressLink}
              onPress={() => router.push('/QuackProgress')}
            >
              <Ionicons name="analytics-outline" size={17} color="#7552C8" />
              <Text style={styles.progressLinkText}>Open QuackProgress</Text>
              <Ionicons name="arrow-forward" size={16} color="#7552C8" />
            </Pressable>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}
