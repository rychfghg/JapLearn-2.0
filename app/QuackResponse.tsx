import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Animated,
  ImageBackground,
} from 'react-native';
import { router } from 'expo-router';
import BackIcon from '../assets/svg/back-icon.svg';
import styles from '../styles/stylesQuackResponse';

const QuackResponse = () => {
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setLoaded(true);
          return 100;
        }

        return prev + 10;
      });
    }, 110);

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
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
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 850,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 850,
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => clearInterval(interval);
  }, []);

  if (!loaded) {
    return (
      <View style={styles.loadingContainer}>
        <Image
          source={require('../assets/quackman_loadingscreen.png')}
          style={styles.loadingBackground}
        />

        <Animated.Image
          source={require('../assets/flipload.gif')}
          style={[
            styles.loadingDuck,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        />

        <Text style={styles.loadingTitle}>QuackResponse</Text>

        <View style={styles.loadingBarOuter}>
          <View style={[styles.loadingBarInner, { width: `${progress}%` }]} />
        </View>

        <Text style={styles.loadingPercent}>{progress}%</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require('../assets/forest2.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/Exercises')}>
          <View style={styles.backButtonContainer}>
            <BackIcon width={22} height={22} fill="white" />
          </View>
        </TouchableOpacity>

        <View style={styles.headerTitleBox}>
          <Text style={styles.headerSmall}>RESPONSE TRAINING</Text>
          <Text style={styles.headerTitle}>QuackResponse</Text>
        </View>

        <Image
          source={require('../assets/talk.png')}
          style={styles.headerDuck}
        />
      </View>

      <View style={styles.stage}>
        <Text style={styles.stageTitle}>Choose a Mission</Text>
        <Text style={styles.stageSubtitle}>
          Train fast, natural Japanese responses.
        </Text>

        <Animated.Image
          source={require('../assets/Idle_TrapDoor.png')}
          style={[
            styles.centerDuck,
            {
              transform: [{ translateY: floatAnim }],
            },
          ]}
        />

        <View style={styles.pathLine} />

        <TouchableOpacity
          activeOpacity={0.9}
          style={[styles.missionNode, styles.nodeOne]}
          onPress={() => router.push('/QuackResponseGuided')}
        >
          <View style={styles.nodeCircleActive}>
            <Text style={styles.nodeNumber}>2.1</Text>
          </View>
          <Text style={styles.nodeTitle}>Guided Response</Text>
          <Text style={styles.nodeDesc}>Beginner scenarios</Text>
          <Text style={styles.nodeStatusReady}>PLAY</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.9}
          style={[styles.missionNode, styles.nodeTwo]}
          onPress={() => router.push('/QuackResponseTimed')}
        >
          <View style={styles.nodeCircleTimer}>
            <Text style={styles.nodeNumber}>2.2</Text>
          </View>
          <Text style={styles.nodeTitle}>Timed Challenge</Text>
          <Text style={styles.nodeDesc}>Answer quickly</Text>
          <Text style={styles.nodeStatusTimer}>SPEED</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.9}
          style={[styles.missionNode, styles.nodeThree]}
          onPress={() => router.push('/QuackResponseMultiStep')}
        >
          <View style={styles.nodeCircleLocked}>
            <Text style={styles.nodeNumber}>2.3</Text>
          </View>
          <Text style={styles.nodeTitle}>Multi-Step</Text>
          <Text style={styles.nodeDesc}>Conversation chain</Text>
          <Text style={styles.nodeStatusLocked}>SOON</Text>
        </TouchableOpacity>

        <View style={styles.coachBubble}>
          <Text style={styles.coachName}>Ahiru Coach</Text>
          <Text style={styles.coachText}>
            Start with 2.1, then challenge your speed in 2.2.
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
};

export default QuackResponse;