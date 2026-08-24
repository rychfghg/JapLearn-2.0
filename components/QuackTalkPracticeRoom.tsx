import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  ImageBackground,
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
  const [tutorialVisible, setTutorialVisible] = useState(false);

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

          {variant === 'conversation' ? (
            <Pressable
              accessibilityLabel="How Talk with Sumi works"
              onPress={() => setTutorialVisible(true)}
              style={styles.helpButton}
            >
              <Ionicons name="help" size={22} color={content.accent} />
            </Pressable>
          ) : (
            <View style={[styles.roomBadge, { backgroundColor: `${content.accent}16` }]}> 
              <View style={[styles.roomBadgeDot, { backgroundColor: content.accent }]} />
              <Text style={[styles.roomBadgeText, { color: content.accent }]}>SOON</Text>
            </View>
          )}
        </View>

        {variant === 'conversation' ? (
          <View style={styles.conversationStage}>
            <View style={styles.conversationGlow} />

            <View style={styles.promptCard}>
              <View style={styles.promptIcon}>
                <Ionicons name="sparkles" size={15} color="#7552C8" />
              </View>
              <View style={styles.promptCopy}>
                <Text style={styles.promptLabel}>CONVERSATION PROMPT</Text>
                <Text style={styles.promptText}>Your conversation situation will appear here.</Text>
              </View>
              <View style={styles.soonPill}>
                <Text style={styles.soonPillText}>SOON</Text>
              </View>
            </View>

            <View style={styles.sumiBubble}>
              <Text style={styles.bubbleSpeaker}>SUMI</Text>
              <Text style={styles.bubbleText}>My question will appear here when guided conversations are ready.</Text>
              <View style={styles.bubbleTail} />
            </View>

            <Image
              source={require('../assets/img/Sumi_PoseB_WinterUni_Smile.png')}
              style={styles.conversationSumi}
              resizeMode="contain"
            />
            <View style={styles.conversationShadow} />

            <View style={styles.micDock}>
              <Pressable
                accessibilityLabel={recorderState === 'recording' ? 'Stop recording' : 'Start recording'}
                onPress={recorderState === 'recording' ? stopRecording : startRecording}
                style={({ pressed }) => [
                  styles.conversationMic,
                  { backgroundColor: recorderState === 'recording' ? '#E54F6D' : content.accent },
                  pressed && styles.microphonePressed,
                ]}
              >
                <Ionicons
                  name={recorderState === 'recording' ? 'stop' : 'mic'}
                  size={31}
                  color="#FFFFFF"
                />
              </Pressable>
              <Text style={styles.conversationMicStatus}>{statusCopy}</Text>
            </View>
          </View>
        ) : (
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
        )}

        <Modal
          visible={tutorialVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setTutorialVisible(false)}
        >
          <View style={styles.tutorialShade}>
            <View style={styles.tutorialCard}>
              <View style={styles.tutorialHeader}>
                <View style={styles.tutorialHeaderIcon}>
                  <Ionicons name="chatbubbles-outline" size={23} color="#7552C8" />
                </View>
                <View style={styles.tutorialHeaderCopy}>
                  <Text style={styles.tutorialKicker}>HOW IT WORKS</Text>
                  <Text style={styles.tutorialTitle}>Talk with Sumi</Text>
                </View>
                <Pressable onPress={() => setTutorialVisible(false)} style={styles.tutorialClose}>
                  <Ionicons name="close" size={20} color="#695C6E" />
                </Pressable>
              </View>

              {[
                ['1', 'Read the prompt', 'The conversation situation will appear above Sumi.'],
                ['2', 'Listen to Sumi', 'Her question will be shown inside the conversation bubble.'],
                ['3', 'Tap the microphone', 'Answer naturally in Japanese, then tap again to stop.'],
              ].map(([step, title, copy]) => (
                <View key={step} style={styles.tutorialStep}>
                  <View style={styles.tutorialStepNumber}>
                    <Text style={styles.tutorialStepNumberText}>{step}</Text>
                  </View>
                  <View style={styles.tutorialStepCopy}>
                    <Text style={styles.tutorialStepTitle}>{title}</Text>
                    <Text style={styles.tutorialStepText}>{copy}</Text>
                  </View>
                </View>
              ))}

              <View style={styles.tutorialNotice}>
                <Ionicons name="construct-outline" size={17} color="#A06D1E" />
                <Text style={styles.tutorialNoticeText}>
                  Guided questions and AI evaluation are coming soon. Microphone testing works now.
                </Text>
              </View>

              <Pressable onPress={() => setTutorialVisible(false)} style={styles.tutorialDone}>
                <Text style={styles.tutorialDoneText}>Got it</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </ImageBackground>
    </SafeAreaView>
  );
}
