import {
  View,
  Pressable,
  ImageBackground,
  Modal,
  Animated,
  Text,
  TouchableWithoutFeedback,
} from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import styles from '../styles/stylesLearnMenu';
import BackIcon from '../assets/svg/back-icon.svg';
import ImageButton from '../components/ImageButton';
import { Easing } from 'react-native-reanimated';
import expoconfig from '../expoconfig'; // Assuming you have this config for API URLs
import { AuthContext } from '../context/AuthContext';

const LearnMenu = () => {
  const { fromContent3 } = useLocalSearchParams(); // Query param to check if routed from Content3
  const router = useRouter();

  const { user } = useContext(AuthContext);
  const [isBadgeVisible, setBadgeVisible] = useState(false);
  const [sentenceCompleted, setSentenceCompleted] = useState(false); // Track sentence completion status
  const [badgeScale] = useState(new Animated.Value(0)); // Badge scale animation
  const [badgeSpin] = useState(new Animated.Value(0)); // Badge spin animation
  const [messageOpacity] = useState(new Animated.Value(0)); // Opacity for message

  // Track completion status for unlocking buttons
  const [hiraganaComplete, setHiraganaComplete] = useState(false);
  const [katakanaComplete, setKatakanaComplete] = useState(false);
  const [isGrammarUnlocked, setIsGrammarUnlocked] = useState(false);
  

  // Check progress on component mount
  useEffect(() => {
    checkProgress(); // Always check progress when the component loads
  }, []);

  // Check progress only when the `fromContent3` param is true to trigger the badge
  useEffect(() => {
    if (fromContent3 === 'true' && sentenceCompleted && !isBadgeVisible) {
      // Only trigger badge modal if coming from Content3 and sentence is complete
      if (sentenceCompleted && !isBadgeVisible) {
        triggerBadgeModal(); // Trigger the modal only if sentence is complete
      }
    }
  }, [fromContent3, sentenceCompleted]);  // Check changes in `fromContent3` or `sentenceCompleted`
  
  const checkProgress = async () => {
    try {
      const response = await fetch(`${expoconfig.API_URL}/api/progress/${user.email}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      console.log('User Progress Data:', data);

      // Check if "sentence" is true and "badge3" is false, then trigger badge modal
      if (data.sentence && !data.badge3) {
        setSentenceCompleted(true); // Only mark as complete if the sentence is true and badge3 is false
      }

      // Check completion of hiragana and katakana levels
      if (data.hiragana1 && data.hiragana2 && data.hiragana3) {
        setHiraganaComplete(true);
      }

      if (data.katakana1 && data.katakana2 && data.katakana3) {
        setKatakanaComplete(true);
      }

      // Check if vocab1 and vocab2 are completed for unlocking Grammar
      if (data.vocab1 && data.vocab2) {
        setIsGrammarUnlocked(true);
      }
    } catch (error) {
      console.log("Error checking progress: ", error);
    }
  };

  const triggerBadgeModal = () => {
    setBadgeVisible(true);
    animateBadge();
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
    ]).start();
  };

  const handleBadgeDismiss = async () => {
    try {
      // Run dismiss animations for the badge
      await new Promise((resolve) => {
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
        ]).start(() => resolve()); // Resolve when animations are complete
      });
  
      // After animations are done, update the backend
      const response = await fetch(`${expoconfig.API_URL}/api/progress/${user.email}/updateField?field=badge3&value=true`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      const data = await response.json();
  
      // Check if the backend update was successful
      if (response.ok && data.success) {
        console.log('Badge3 updated successfully.');
      } else {
        console.log('Failed to update badge3:', data);
      }
  
      // Set the sentenceCompleted state to true to prevent badge re-trigger
      setSentenceCompleted(true);
  
      // Now hide the badge modal
      setBadgeVisible(false);
    } catch (error) {
      console.log('Error dismissing badge:', error);
    }
  };
  
  

  const handleBackPress = () => {
    router.push('/Menu');
  };

  const handleButtonPress = (buttonTitle) => {
    switch (buttonTitle) {
      case 'KANA':
        router.push('/KanaMenu');
        break;
      case 'WORDS':
        router.push('/WordsMenu');
        break;
      case 'GRAMMAR':
        router.push('/Content3');
        break;
      default:
        console.log(`${buttonTitle} button pressed`);
    }
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
          {/* KANA Button */}
          <ImageButton
            title="KANA"
            subtitle="Introduction to KANA"
            onPress={() => handleButtonPress('KANA')}
            imageSource={require('../assets/img/kana_button.png')}
            infoContent="This lesson introduces you to the KANA characters."
          />

          {/* WORDS Button - Locked until Hiragana and Katakana lessons are completed */}
          <ImageButton
            title="WORDS"
            subtitle="Learn basic words"
            onPress={() => handleButtonPress('WORDS')}
            imageSource={require('../assets/img/words_button.png')}
            infoContent="This lesson helps you learn basic Japanese words."
            buttonStyle={!(hiraganaComplete && katakanaComplete) ? styles.disabledButton : null}
            textStyle={!(hiraganaComplete && katakanaComplete) ? styles.disabledText : null}
            disabled={!(hiraganaComplete && katakanaComplete)}
          />

          {/* GRAMMAR Button - Locked until vocab1 and vocab2 are completed */}
          <ImageButton
            title="GRAMMAR"
            subtitle="Understand basic grammar"
            onPress={() => handleButtonPress('GRAMMAR')}
            imageSource={require('../assets/img/grammar_button.png')}
            infoContent="This lesson covers basic Japanese grammar."
            buttonStyle={!isGrammarUnlocked ? styles.disabledButton : null}
            textStyle={!isGrammarUnlocked ? styles.disabledText : null}
            disabled={!isGrammarUnlocked}
          />
        </View>

        {/* Badge Modal */}
        {isBadgeVisible && (
          <Modal transparent={true} animationType="none" visible={isBadgeVisible}>
            <TouchableWithoutFeedback onPress={handleBadgeDismiss}>
              <View style={styles.awardModalContainer}>
                <Animated.View
                  style={[styles.backdropLight, { transform: [{ scale: badgeScale }] }]}/>
                <Animated.Image
                  source={require('../assets/sentence_badge.png')}
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
                  Congratulations on mastering the Sentence Lesson!
                </Animated.Text>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        )}
      </View>
    </ImageBackground>
  );
};

export default LearnMenu;
