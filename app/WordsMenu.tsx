import React, { useContext, useEffect, useState, useRef } from 'react';
import { View, Pressable, ImageBackground, Modal, Animated, Text, Button, TouchableWithoutFeedback } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import styles from '../styles/stylesLearnMenu';
import BackIcon from '../assets/svg/back-icon.svg';
import ImageButton from '../components/ImageButton';
import { AuthContext } from '../context/AuthContext';
import expoconfig from '../expoconfig';
import { Easing } from 'react-native-reanimated';

const WordsMenu = () => {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const { fromWords } = useLocalSearchParams();
  const badgeCheckCompleted = useRef(false);

  const badgeScale = useRef(new Animated.Value(0)).current;
  const badgeSpin = useRef(new Animated.Value(0)).current;
  const messageOpacity = useRef(new Animated.Value(0)).current;
  const backdropScale = useRef(new Animated.Value(0)).current; // Added backdrop animation

  const [isBadgeVisible, setBadgeVisible] = useState(false);
  const [wordLessons, setWordLessons] = useState([]);
  const [classCode, setClassCode] = useState('');

  const [completedLessons, setCompletedLessons] = useState({
    vocab1: false,
    vocab2: false,
  });

  const fetchProgress = async () => {
    if (!user?.email) return;
    try {
      const response = await fetch(`${expoconfig.API_URL}/api/progress/${user.email}`);
      const data = await response.json();
      setCompletedLessons({
        vocab1: data.vocab1,
        vocab2: data.vocab2,
      });
    } catch (error) {
      console.log('Error fetching progress:', error);
    }
  };

  const handleBackPress = () => {
    router.push("/LearnMenu");
  };

  const fetchUserClassCode = async () => {
    try {
      const response = await fetch(`${expoconfig.API_URL}/api/students/getStudentByEmail?email=${user.email}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      const responseData = await response.json();
      setClassCode(responseData.classCode);
    } catch (error) {
      console.log("Error fetching user class code: ", error);
    }
  };

  const fetchWordLesson = async () => {
    try {
      const response = await fetch(`${expoconfig.API_URL}/api/lesson/getLessonByClass/${classCode}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      const responseData = await response.json();
      setWordLessons(responseData);
      console.log(responseData);
      
    } catch (error) {
      console.log("Error fetching word lessons: ", error);
    }
  };

  const checkBadgeConditions = async () => {
    if (badgeCheckCompleted.current || !fromWords || fromWords !== 'true') return;

    try {
      const response = await fetch(`${expoconfig.API_URL}/api/progress/${user.email}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      const progress = await response.json();

      if (progress.vocab1 && progress.vocab2 && !progress.badge2) {
        setBadgeVisible(true);
        animateBadge();
        updateBadgeStatusOnBackend();
      }
    } catch (error) {
      console.log("Error checking badge conditions: ", error);
    }
  };

  const animateBadge = () => {
    Animated.parallel([
      Animated.timing(badgeScale, {
        toValue: 1,
        duration: 2000,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.timing(badgeSpin, {
        toValue: 1,
        duration: 4000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(messageOpacity, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(backdropScale, {
        toValue: 1,
        duration: 2000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }), // Animate backdrop scale
    ]).start();
  };

  const updateBadgeStatusOnBackend = async () => {
    try {
      await fetch(`${expoconfig.API_URL}/api/progress/${user.email}/updateField?field=badge2&value=true`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.log("Error updating badge status: ", error);
    }
  };

  useEffect(() => {
    if (user?.email) {
      fetchUserClassCode();
      fetchProgress();
    }
  }, [user]);

  useEffect(() => {
    if (classCode) {
      fetchWordLesson();
    }
  }, [classCode]);

  useEffect(() => {
    checkBadgeConditions();
  }, [fromWords]);

  const handleBadgeDismiss = () => {
    Animated.parallel([
      Animated.timing(badgeScale, {
        toValue: 0,
        duration: 1000,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.timing(badgeSpin, {
        toValue: 0,
        duration: 1000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(messageOpacity, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(backdropScale, {
        toValue: 0,
        duration: 1000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }), // Shrink backdrop along with badge
    ]).start(() => setBadgeVisible(false));
  };

  return (
    <ImageBackground
      source={require('../assets/img/MenuBackground.png')}
      style={styles.background}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={handleBackPress}>
            <View style={styles.backButtonContainer}>
              <BackIcon width={20} height={20} fill={'white'} />
            </View>
          </Pressable>
        </View>
        <View style={styles.menuContainer}>
            <ImageButton
              title={'Vocabulary I'}
              infoContent='This lesson introduces the first set of japanese words.'
              subtitle={'1st set of vocabulary'}
              onPress={() => router.push(`/Words1`)}
              imageSource={require('../assets/img/kana_button.png')}
            />
            <ImageButton
          title={'Vocabulary II'}
          infoContent="This lesson introduces the next set of Japanese words."
          subtitle={'2nd set of vocabulary'}
          onPress={() => completedLessons.vocab1 && router.push(`/Words2`)}
          imageSource={require('../assets/img/kana_button.png')}
          buttonStyle={!completedLessons.vocab1 ? [styles.disabledButton] : null}
          textStyle={!completedLessons.vocab1 ? [styles.disabledText] : null}
          disabled={!completedLessons.vocab1}
        />
            <ImageButton
          title={'Vocabulary Practice'}
          infoContent="Practice what you've learned."
          subtitle={'Practice your vocabulary'}
          onPress={() => completedLessons.vocab1 && completedLessons.vocab2 && router.push(`/WordsPractice`)}
          imageSource={require('../assets/img/kana_button.png')}
          buttonStyle={!(completedLessons.vocab1 && completedLessons.vocab2) ? [styles.disabledButton] : null}
          textStyle={!(completedLessons.vocab1 && completedLessons.vocab2) ? [styles.disabledText] : null}
          disabled={!(completedLessons.vocab1 && completedLessons.vocab2)}
        />
        </View>

        {isBadgeVisible && (
          <Modal transparent={true} animationType="none" visible={isBadgeVisible}>
            <TouchableWithoutFeedback onPress={handleBadgeDismiss}>
              <View style={[styles.awardModalContainer, { backgroundColor: 'rgba(0, 0, 0, 0.8)' }]}>
                {/* Animated backdrop */}
                <Animated.View
                  style={[
                    styles.backdropLight,
                    {
                      transform: [{ scale: backdropScale }]
                    },
                  ]}
                />
                {/* Animated badge */}
                <Animated.Image
                  source={require('../assets/word_badge.png')}
                  style={[
                    styles.awardBadge,
                    {
                      transform: [
                        { scale: badgeScale },
                        {
                          rotateY: badgeSpin.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '360deg'],
                          }),
                        },
                      ],
                    },
                  ]}
                />
                <Animated.Text
                  style={[styles.congratsMessage, { opacity: messageOpacity }]}
                >
                  Congratulations on completing the Vocabulary Lessons!
                </Animated.Text>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        )}
      </View>
    </ImageBackground>
  );
};

export default WordsMenu;
