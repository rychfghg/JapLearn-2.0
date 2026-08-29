import {
  View,
  Pressable,
  Modal,
  Animated,
  Text,
  TouchableWithoutFeedback,
  ScrollView,
  SafeAreaView,
  Image,
} from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import styles from '../styles/stylesLearnMenu';
import BackIcon from '../assets/svg/back-icon.svg';
import ImageButton from '../components/ImageButton';
import { Easing } from 'react-native-reanimated';
import expoconfig from '../expoconfig'; // Assuming you have this config for API URLs
import { AuthContext } from '../context/AuthContext';
import StudentBottomNav from '../components/StudentBottomNav';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const learnMascotGuides = [
  { image: require('../assets/idle.png'), label: 'Ready to learn?', text: 'Follow the learning map and build your Japanese one step at a time.' },
  { image: require('../assets/hello.png'), label: 'Begin with Kana', text: 'Start by mastering Hiragana and Katakana characters.' },
  { image: require('../assets/talk.png'), label: 'Grow your vocabulary', text: 'Unlock Words and learn expressions you can use every day.' },
  { image: require('../assets/thinking.png'), label: 'Connect your ideas', text: 'Grammar helps you turn familiar words into clear sentences.' },
  { image: require('../assets/Surprised.png'), label: 'Complete the path!', text: 'Reach each milestone to unlock the next learning challenge.' },
] as const;

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
  const [tipVisible, setTipVisible] = useState(true);
  const [mascotGuide, setMascotGuide] = useState(0);
  const [classLessons, setClassLessons] = useState<any[]>([]);
  const darkMode = false;

  useEffect(() => {
    const loadClassLessons = async () => {
      const classCode = await AsyncStorage.getItem('classCode');
      if (!classCode) return;
      try {
        const response = await fetch(`${expoconfig.API_URL}/api/lesson/getLessonByClass/${encodeURIComponent(classCode)}`);
        if (response.ok) setClassLessons(await response.json());
      } catch (error) {
        console.log('Could not load teacher lessons:', error);
      }
    };
    loadClassLessons();
  }, [user?.email]);

  useEffect(() => {
    const mascotTimer = setInterval(() => {
      setMascotGuide((current) => (current + 1) % learnMascotGuides.length);
    }, 2600);
    return () => clearInterval(mascotTimer);
  }, []);
  

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
    if (!user?.email) return;
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

      // Unlock Grammar after all three Words collections are complete.
      if (data.vocab1 && data.vocab2 && data.vocab3) {
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
      await new Promise<void>((resolve) => {
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
      if (!user?.email) return;
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

  const handleButtonPress = (buttonTitle: 'KANA' | 'WORDS' | 'GRAMMAR') => {
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

  const openClassLesson = (lesson: any) => {
    const type = String(lesson.lesson_type || '').toUpperCase();
    if (type === 'KANA') router.push('/KanaMenu');
    else if (type === 'GRAMMAR') router.push('/Content3');
    else router.push('/WordsMenu');
  };

  return (
    <SafeAreaView style={[styles.safeArea, darkMode && styles.darkPage]}>
      <View style={[styles.container, darkMode && styles.darkPage]}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={[styles.headerShell, darkMode && styles.darkPage]}>
            <View style={[styles.header, darkMode && styles.darkHeader]}>
              <View style={styles.heroCircle} />
              <View style={styles.heroCloudOne} />
              <View style={styles.heroCloudTwo} />
              <View style={styles.heroFuji} />
              <View style={styles.heroFujiSnow} />
              <View style={styles.headerTopRow}>
                <Pressable onPress={handleBackPress} style={({ pressed }) => [styles.backButtonContainer, pressed && styles.pressed]}>
                  <BackIcon width={18} height={18} fill={'#462A5E'} />
                </Pressable>
                <View style={styles.headerWordmark}><Ionicons name="book" size={15} color="#8423D9" /><Text style={styles.headerWordmarkText}>JAPLEARN JOURNEY</Text></View>
                <View style={styles.headerIcon}>
                  <Ionicons name="book" size={22} color="#8423D9" />
                </View>
              </View>
              <View style={styles.heroBody}>
                <View style={styles.heroCopy}>
                  <Text style={styles.heroEyebrow}>LET’S LEARN</Text>
                  <Text style={styles.headerTitle}>{learnMascotGuides[mascotGuide].label}</Text>
                  <Text style={styles.headerSubtitle}>{learnMascotGuides[mascotGuide].text}</Text>
                  <View style={styles.dialogueSteps}>
                    {learnMascotGuides.map((_, index) => (
                      <Pressable key={index} onPress={() => setMascotGuide(index)} style={[styles.dialogueStep, index === mascotGuide && styles.dialogueStepActive]} />
                    ))}
                  </View>
                </View>
                <View style={styles.mascotStage}>
                  <View style={styles.mascotSun} />
                  <View style={styles.mascotGround} />
                  <Image source={learnMascotGuides[mascotGuide].image} style={styles.mascotImage} resizeMode="contain" fadeDuration={0} />
                </View>
              </View>
            </View>
          </View>
          <View style={[styles.contentBody, darkMode && styles.darkPage]}>
          <View style={styles.sectionHeading}>
            <View>
              <Text style={[styles.sectionTitle, darkMode && styles.darkTitle]}>Your lessons</Text>
              <Text style={[styles.sectionSubtitle, darkMode && styles.darkMuted]}>Complete each path to unlock the next.</Text>
            </View>
            <View style={styles.pathCount}><Text style={styles.pathCountText}>3 PATHS</Text></View>
          </View>

          <View style={styles.mapContainer}>
          {/* KANA Button */}
          <View style={styles.mapStep}>
            <View style={styles.mapRail}>
              <View style={[styles.mapNode, styles.mapNodePurple]}><Ionicons name="flag" size={17} color="#FFFFFF" /></View>
              <View style={[styles.mapLine, styles.mapLineUnlocked]} />
            </View>
            <View style={styles.mapCardWrap}>
              <Text style={styles.milestoneLabel}>START HERE</Text>
              <ImageButton
                title="KANA"
                subtitle="Introduction to KANA"
                onPress={() => handleButtonPress('KANA')}
                imageSource={require('../assets/img/kana_button.png')}
                infoContent="This lesson introduces you to the KANA characters."
                variant="learn"
                lessonNumber="01"
                iconName="language-outline"
                accentColor="#8423D9"
                darkMode={darkMode}
              />
            </View>
          </View>

          {/* WORDS Button - Locked until Hiragana and Katakana lessons are completed */}
          <View style={styles.mapStep}>
            <View style={styles.mapRail}>
              <View style={[styles.mapNode, (hiraganaComplete && katakanaComplete) ? styles.mapNodeGreen : styles.mapNodeLocked]}>
                <Ionicons name={(hiraganaComplete && katakanaComplete) ? 'checkmark' : 'lock-closed'} size={17} color="#FFFFFF" />
              </View>
              <View style={[styles.mapLine, isGrammarUnlocked ? styles.mapLineUnlocked : styles.mapLineLocked]} />
            </View>
            <View style={styles.mapCardWrap}>
              <Text style={[(hiraganaComplete && katakanaComplete) ? styles.milestoneLabelGreen : styles.milestoneLabelLocked]}>{(hiraganaComplete && katakanaComplete) ? 'NEXT MILESTONE' : 'LOCKED MILESTONE'}</Text>
              <ImageButton
                title="WORDS"
                subtitle="Learn basic words"
                onPress={() => handleButtonPress('WORDS')}
                imageSource={require('../assets/img/words_button.png')}
                infoContent="This lesson helps you learn basic Japanese words."
                buttonStyle={!(hiraganaComplete && katakanaComplete) ? styles.disabledButton : null}
                textStyle={!(hiraganaComplete && katakanaComplete) ? styles.disabledText : null}
                disabled={!(hiraganaComplete && katakanaComplete)}
                variant="learn"
                lessonNumber="02"
                iconName="chatbubbles-outline"
                accentColor="#6DBB3A"
                darkMode={darkMode}
              />
            </View>
          </View>

          {/* GRAMMAR Button - Locked until vocab1 and vocab2 are completed */}
          <View style={styles.mapStep}>
            <View style={styles.mapRail}>
              <View style={[styles.mapNode, isGrammarUnlocked ? styles.mapNodeOrange : styles.mapNodeLocked]}>
                <Ionicons name={isGrammarUnlocked ? 'star' : 'lock-closed'} size={17} color="#FFFFFF" />
              </View>
            </View>
            <View style={styles.mapCardWrap}>
              <Text style={isGrammarUnlocked ? styles.milestoneLabelOrange : styles.milestoneLabelLocked}>{isGrammarUnlocked ? 'FINAL MILESTONE' : 'LOCKED MILESTONE'}</Text>
              <ImageButton
                title="GRAMMAR"
                subtitle="Understand basic grammar"
                onPress={() => handleButtonPress('GRAMMAR')}
                imageSource={require('../assets/img/grammar_button.png')}
                infoContent="This lesson covers basic Japanese grammar."
                buttonStyle={!isGrammarUnlocked ? styles.disabledButton : null}
                textStyle={!isGrammarUnlocked ? styles.disabledText : null}
                disabled={!isGrammarUnlocked}
                variant="learn"
                lessonNumber="03"
                iconName="reader-outline"
                accentColor="#E8912D"
                darkMode={darkMode}
              />
            </View>
          </View>
          </View>

          {classLessons.length > 0 && (
            <View style={styles.classLessonSection}>
              <View style={styles.sectionHeading}>
                <View><Text style={[styles.sectionTitle, darkMode && styles.darkTitle]}>From your teacher</Text><Text style={[styles.sectionSubtitle, darkMode && styles.darkMuted]}>Additional milestones created for your class.</Text></View>
                <View style={styles.pathCount}><Text style={styles.pathCountText}>{classLessons.length} ADDED</Text></View>
              </View>
              {classLessons.map((lesson, index) => (
                <View style={styles.mapStep} key={lesson.id || index}>
                  <View style={styles.mapRail}><View style={[styles.mapNode, styles.mapNodeOrange]}><Ionicons name="school" size={17} color="#FFFFFF" /></View>{index < classLessons.length - 1 && <View style={[styles.mapLine, styles.mapLineUnlocked]} />}</View>
                  <View style={styles.mapCardWrap}>
                    <Text style={styles.milestoneLabelOrange}>TEACHER MILESTONE</Text>
                    <ImageButton title={lesson.lesson_title || lesson.lessonTitle || 'Class lesson'} subtitle={`${lesson.lesson_type || 'ENRICHMENT'} · Added by your teacher`} onPress={() => openClassLesson(lesson)} imageSource={require('../assets/img/grammar_button.png')} infoContent="An additional lesson assigned to your class by your teacher." variant="learn" lessonNumber={String(index + 4).padStart(2, '0')} iconName="school-outline" accentColor="#E8912D" darkMode={darkMode} />
                  </View>
                </View>
              ))}
            </View>
          )}

          {tipVisible && (
            <View style={[styles.tipCard, darkMode && styles.darkTip]}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Dismiss learning tip"
                hitSlop={10}
                style={({ pressed }) => [styles.tipClose, pressed && styles.pressed]}
                onPress={() => setTipVisible(false)}
              >
                <Ionicons name="close" size={17} color="#8B621C" />
              </Pressable>
              <View style={styles.tipIcon}><Ionicons name="bulb-outline" size={20} color="#A66A12" /></View>
              <View style={styles.tipCopy}>
                <Text style={styles.tipLabel}>Learning tip</Text>
                <Text style={styles.tipText}>Master Kana first—it makes every word and grammar lesson easier.</Text>
              </View>
            </View>
          )}
          </View>
        </ScrollView>

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
        <StudentBottomNav active="learn" />
      </View>
    </SafeAreaView>
  );
};

export default LearnMenu;
