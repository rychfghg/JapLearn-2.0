import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Image,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import BackIcon from '../assets/svg/back-icon.svg';
import styles from '../styles/stylesQuackTalk';

import background from '../assets/img/background/relaxing area day.png';

import sumiSmile from '../assets/img/Sumi_PoseB_WinterUni_Smile.png';
import sumiOpen from '../assets/img/Sumi_PoseB_WinterUni_Open.png';
import sumiClosedSmile from '../assets/img/Sumi_PoseB_WinterUni_EyesClosed_Smile.png';
import sumiBlush from '../assets/img/Sumi_PoseB_WinterUni_Smile_Blush.png';

const QuackTalk = () => {
  const [sumiSprite, setSumiSprite] = useState(sumiSmile);
  const [message, setMessage] = useState(
    'Choose a speaking mission. I will guide your Japanese conversation practice.'
  );

  const floatAnim = useRef(new Animated.Value(0)).current;
  const startPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const spriteLoop = setInterval(() => {
      setSumiSprite((prev) => {
        if (prev === sumiSmile) return sumiOpen;
        if (prev === sumiOpen) return sumiClosedSmile;
        return sumiSmile;
      });
    }, 850);

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -7,
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

    Animated.loop(
      Animated.sequence([
        Animated.timing(startPulse, {
          toValue: 1.04,
          duration: 850,
          useNativeDriver: true,
        }),
        Animated.timing(startPulse, {
          toValue: 1,
          duration: 850,
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => clearInterval(spriteLoop);
  }, []);

  const handleStart = () => {
    setSumiSprite(sumiBlush);
    setMessage('Opening Controlled Conversation...');
    setTimeout(() => router.push('/QuackTalkConversation'), 250);
  };

  return (
    <ImageBackground source={background} style={styles.background} resizeMode="cover">
      <View style={styles.dimOverlay} />
      <View style={styles.bottomGradient} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/Exercises')}>
          <View style={styles.backButton}>
            <BackIcon width={22} height={22} fill="white" />
          </View>
        </TouchableOpacity>

        <View style={styles.headerTextBox}>
          <Text style={styles.headerLabel}>SPEAKING PRACTICE</Text>
          <Text style={styles.headerTitle}>QuackTalk</Text>
        </View>

        <View style={styles.levelBadge}>
          <Text style={styles.levelBadgeText}>LV 1</Text>
        </View>
      </View>

      <View style={styles.stage}>
        <View style={styles.glassTitle}>
          <Text style={styles.titleMini}>VOICE TRAINING LOBBY</Text>
          <Text style={styles.titleText}>Practice Japanese Speaking</Text>
        </View>

        <Animated.Image
          source={sumiSprite}
          style={[
            styles.sumiSprite,
            { transform: [{ translateY: floatAnim }] },
          ]}
        />

        <View style={styles.dialogueBox}>
          <Text style={styles.speakerName}>Sumi Coach</Text>
          <Text style={styles.dialogueText}>{message}</Text>
        </View>

        <View style={styles.missionDock}>
          <Animated.View style={{ transform: [{ scale: startPulse }] }}>
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.mainMissionButton}
              onPress={handleStart}
            >
              <View style={styles.missionCode}>
                <Text style={styles.missionCodeText}>4.1</Text>
              </View>

              <View style={styles.mainMissionTextBox}>
                <Text style={styles.mainMissionTitle}>Controlled Conversation</Text>
                <Text style={styles.mainMissionDesc}>
                  Guided speaking scene with visual prompts.
                </Text>
              </View>

              <View style={styles.playButton}>
                <Text style={styles.playButtonText}>START</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.sideMissionRow}>
<TouchableOpacity
  activeOpacity={0.9}
  style={styles.sideMission}
  onPress={() => {
    setSumiSprite(sumiBlush);
    setMessage('Opening Speech Recognition Assist...');
    setTimeout(() => router.push('/QuackTalkSpeech'), 250);
  }}
>
              <Text style={styles.sideMissionCode}>4.2</Text>
              <Text style={styles.sideMissionTitle}>Pronunciation Assist</Text>
              <Text style={styles.sideMissionStatus}>Open</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.sideMission}
onPress={() => {
  setSumiSprite(sumiBlush);
  setMessage('Opening Conversation Feedback Report...');
  setTimeout(() => router.push('/QuackTalkFeedback'), 250);
}}
            >
              <Text style={styles.sideMissionCode}>4.3</Text>
              <Text style={styles.sideMissionTitle}>Feedback Review</Text>
              <Text style={styles.sideMissionStatus}>Locked</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

export default QuackTalk;