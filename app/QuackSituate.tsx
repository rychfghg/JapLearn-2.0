
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Animated,
  ImageBackground,
  ScrollView,
} from 'react-native';

import { router } from 'expo-router';
import BackIcon from '../assets/svg/back-icon.svg';
import styles from '../styles/stylesQuackSituate';

const QuackSituate = () => {
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const floatAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.8)).current;

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
    }, 120);

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -12,
          duration: 700,
          useNativeDriver: true,
        }),

        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),

        Animated.timing(glowAnim, {
          toValue: 0.7,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => clearInterval(interval);
  }, []);

  if (!loaded) {
    return (
      <View style={styles.loadingContainer}>
        <Animated.Image
          source={require('../assets/flipload.gif')}
          style={[
            styles.loadingDuck,
            {
              transform: [{ scale: glowAnim }],
            },
          ]}
        />

        <View style={styles.loadingBarBackground}>
          <View
            style={[
              styles.loadingBarFill,
              {
                width: `${progress}%`,
              },
            ]}
          />
        </View>

        <Text style={styles.loadingText}>
          Loading...
        </Text>

        <Text style={styles.loadingPercent}>
          {progress}%
        </Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require('../assets/background.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push('/Exercises')}
        >
          <View style={styles.backButtonContainer}>
            <BackIcon width={22} height={22} fill="white" />
          </View>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          QuackSituate
        </Text>

        <Image
          source={require('../assets/hello.png')}
          style={styles.headerDuck}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.menuContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* TOP CHARACTER */}
        <View style={styles.heroSection}>
          <Animated.View
            style={[
              styles.glowCircle,
              {
                opacity: glowAnim,
                transform: [{ scale: glowAnim }],
              },
            ]}
          />

          <Animated.Image
            source={require('../assets/APPLOGO.png')}
            style={[
              styles.character,
              {
                transform: [{ translateY: floatAnim }],
              },
            ]}
          />

          <Text style={styles.title}>
            Interactive Japanese
          </Text>

          <Text style={styles.title2}>
            Communication Adventure
          </Text>

          <Text style={styles.subtitle}>
            Practice real-life Japanese situations through
            immersive mini-games.
          </Text>
        </View>

        {/* GAME CARDS */}

        {/* RECOGNITION */}
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.gameCard}
          onPress={() =>
            router.push('/QuackSituateRecognition')
          }
        >
          <View style={styles.cardGlow1} />
          <View style={styles.cardGlow2} />

          <View style={styles.cardContent}>
            <View style={styles.iconContainer}>
              <Image
                source={require('../assets/hello.png')}
                style={styles.gameDuck}
              />
            </View>

            <View style={styles.gameInfo}>
              <Text style={styles.gameTitle}>
                Situational Recognition
              </Text>

              <Text style={styles.gameDesc}>
                Watch animated scenes and identify the
                appropriate Japanese expression.
              </Text>

              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  Anime Scenario
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* MATCHING */}
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.gameCard}
          onPress={() =>
            router.push('/QuackSituateMatching')
          }
        >
          <View style={styles.cardGlow1} />
          <View style={styles.cardGlow2} />

          <View style={styles.cardContent}>
            <View style={styles.iconContainer}>
              <Image
                source={require('../assets/talk.png')}
                style={styles.gameDuck}
              />
            </View>

            <View style={styles.gameInfo}>
              <Text style={styles.gameTitle}>
                Expression Matching
              </Text>

              <Text style={styles.gameDesc}>
                Connect Japanese expressions with the
                correct real-life situation.
              </Text>

              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  Rope Puzzle
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* FORMAL */}
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.gameCard}
          onPress={() =>
            router.push('/QuackSituateFormal')
          }
        >
          <View style={styles.cardGlow1} />
          <View style={styles.cardGlow2} />

          <View style={styles.cardContent}>
            <View style={styles.iconContainer}>
              <Image
                source={require('../assets/thinking.png')}
                style={styles.gameDuck}
              />
            </View>

            <View style={styles.gameInfo}>
              <Text style={styles.gameTitle}>
                Formal vs Informal
              </Text>

              <Text style={styles.gameDesc}>
                Choose the correct politeness level
                depending on social situations.
              </Text>

              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  Social Logic
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
};

export default QuackSituate;
