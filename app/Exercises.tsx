import { View, Pressable, ScrollView, Text, Modal, SafeAreaView, Image, ImageBackground } from 'react-native';
import React, { useContext, useState, useCallback, useEffect } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import styles from '../styles/stylesExercises';
import BackIcon from '../assets/svg/back-icon.svg';
import { AuthContext } from '../context/AuthContext';
import StudentBottomNav from '../components/StudentBottomNav';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { preloadExerciseCovers } from '../utils/gameAssetPreloader';

const activities = [
  { key: 'KANA', title: 'Quack-a-Mole', subtitle: 'Match kana before time runs out.', description: 'Test your recognition of Hiragana and Katakana characters.', icon: 'hammer-outline', color: '#8423D9', tint: '#F0E4FA', cardColor: '#24123F', mode: 'CHARACTERS', tag: 'KANA HUNT', image: require('../assets/exercise-covers/quack-a-mole-official-v2.png') },
  { key: 'WORDS', title: 'Quackman', subtitle: 'Solve clues and protect Ahiru.', description: 'Strengthen your understanding of basic Japanese vocabulary.', icon: 'key-outline', color: '#65A936', tint: '#ECF7E4', cardColor: '#061D47', mode: 'WORDS', tag: 'WORD SURVIVAL', image: require('../assets/exercise-covers/quackman-official-v2.png') },
  { key: 'GRAMMAR', title: 'QuackSlate', subtitle: 'Build Japanese sentences in order.', description: 'Join a teacher-hosted grammar session or build sentences in system practice.', icon: 'create-outline', color: '#E18A27', tint: '#FFF2DF', cardColor: '#180917', mode: 'GRAMMAR', tag: 'SENTENCE QUEST', image: require('../assets/exercise-covers/quackslate-official-v2.png') },
  { key: 'SITUATIONAL', title: 'QuackSituate', subtitle: 'Choose naturally in real-life scenes.', description: 'Practice Japanese communication in everyday situations.', icon: 'map-outline', color: '#347FC4', tint: '#E5F2FC', cardColor: '#17275C', mode: 'SITUATIONAL', tag: 'STORY CHALLENGE', image: require('../assets/exercise-covers/quacksituate-official-v2.png') },
  { key: 'INTERACTIVE RESPONSE', title: 'QuackResponse', subtitle: 'Think fast and choose your reply.', description: 'Practice selecting appropriate responses in Japanese.', icon: 'chatbubbles-outline', color: '#D65686', tint: '#FCE8F0', cardColor: '#5A2455', mode: 'RESPONSE', tag: 'RESPONSE RALLY', image: require('../assets/exercise-covers/quackresponse-official-v3-dialogue.png') },
] as const;

const mascotGuides = [
  { image: require('../assets/idle.png'), label: 'Ready to practice?', text: "Choose any exercise below and turn today's lesson into a skill." },
  { image: require('../assets/hello.png'), label: 'Start with Characters', text: 'Warm up with Hiragana and Katakana recognition.' },
  { image: require('../assets/talk.png'), label: 'Build useful Japanese', text: 'Words and Grammar help you create clearer sentences.' },
  { image: require('../assets/thinking.png'), label: 'Think in real situations', text: 'Situational and Response activities train better choices.' },
  { image: require('../assets/Surprised.png'), label: 'Speak with confidence!', text: 'Finish with QuackTalk for guided conversation practice.' },
] as const;

const Exercises = () => {
  const { user } = useContext(AuthContext);
  const router = useRouter();

  const [refreshKey, setRefreshKey] = useState(0);
  const [infoActivity, setInfoActivity] = useState<(typeof activities)[number] | null>(null);
  const [mascotGuide, setMascotGuide] = useState(0);
  const [darkMode, setDarkMode] = useState(false);

  useFocusEffect(useCallback(() => {
    AsyncStorage.getItem('profileDarkMode').then((value) => setDarkMode(value === 'true'));
  }, []));

  useEffect(() => {
    preloadExerciseCovers();

    const mascotTimer = setInterval(() => {
      setMascotGuide((current) => (current + 1) % mascotGuides.length);
    }, 2600);
    return () => clearInterval(mascotTimer);
  }, []);

  const handleBackPress = () => {
    router.push('/Menu');
  };

  const handleButtonPress = (buttonTitle: (typeof activities)[number]['key']) => {
    console.log(`${buttonTitle} button pressed`);

    switch (buttonTitle) {
      case 'KANA':
        router.push('/Quackamole');
        break;
      case 'WORDS':
        router.push('/Quackman');
        break;
      case 'GRAMMAR':
        router.push('/QuackslateMenu');
        break;
      case 'SITUATIONAL':
      router.push('/QuackSituate');
      break;
      case 'INTERACTIVE RESPONSE':
        //alert('QuackResponse module coming soon!');
        router.push('/QuackResponse');
        break;
      default:
        console.log('Unknown button pressed');
    }
  };

  useFocusEffect(
    useCallback(() => {
      console.log('Exercises page refreshed!');
      setRefreshKey(prevKey => prevKey + 1);
    }, [])
  );

  return (
    <SafeAreaView style={[styles.safeArea, darkMode && styles.darkPage]}>
      <View style={[styles.container, darkMode && styles.darkPage]}>
        <ScrollView style={styles.scrollView} key={refreshKey} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
              <View style={styles.headerWordmark}><Ionicons name="game-controller" size={15} color="#8423D9" /><Text style={styles.headerWordmarkText}>JAPLEARN ARCADE</Text></View>
              <View style={styles.headerIcon}><Ionicons name="trophy-outline" size={22} color="#8423D9" /></View>
            </View>
            <View style={styles.heroBody}>
              <View style={styles.heroCopy}>
                <Text style={styles.heroEyebrow}>LET&apos;S PLAY</Text>
                <Text style={styles.headerTitle}>{mascotGuides[mascotGuide].label}</Text>
                <Text style={styles.headerSubtitle}>{mascotGuides[mascotGuide].text}</Text>
                <View style={styles.dialogueSteps}>
                  {mascotGuides.map((_, index) => (
                    <Pressable key={index} onPress={() => setMascotGuide(index)} style={[styles.dialogueStep, index === mascotGuide && styles.dialogueStepActive]} />
                  ))}
                </View>
              </View>
              <View style={styles.mascotStage}>
                <View style={styles.mascotSun} />
                <View style={styles.mascotGround} />
                <Image source={mascotGuides[mascotGuide].image} style={styles.mascotImage} resizeMode="contain" fadeDuration={0} />
              </View>
            </View>
          </View>

          <View style={[styles.contentBody, darkMode && styles.darkPage]}>
            <View style={styles.sectionHeading}>
              <View>
                <Text style={[styles.sectionTitle, darkMode && styles.darkTitle]}>Choose your challenge</Text>
                <Text style={[styles.sectionSubtitle, darkMode && styles.darkMuted]}>Play, practice, and earn experience.</Text>
              </View>
              <View style={styles.activityCount}><Text style={styles.activityCountText}>5 EXERCISES</Text></View>
            </View>

            <View style={styles.activityGrid}>
              {activities.map((activity) => (
                <Pressable
                  key={activity.key}
                  onPress={() => handleButtonPress(activity.key)}
                  style={({ pressed }) => [styles.activityCard, { backgroundColor: activity.cardColor }, pressed && styles.cardPressed]}
                >
                  <Image source={activity.image} style={styles.cardCoverAsset} resizeMode="cover" fadeDuration={0} />
                  <View style={styles.cardCover}>
                    <View style={styles.cardShade} />
                    <View style={styles.cardTopRow}>
                      <View style={styles.cardTag}><Ionicons name={activity.icon} size={13} color={activity.color} /><Text style={[styles.cardTagText, { color: activity.color }]}>{activity.tag}</Text></View>
                      <Pressable hitSlop={9} style={styles.infoButton} onPress={(e) => { e.stopPropagation(); setInfoActivity(activity); }}><Ionicons name="information-circle-outline" size={21} color="#FFFFFF" /></Pressable>
                    </View>
                    <View style={styles.cardCopy}>
                      <Text style={styles.activityTitle}>{activity.title}</Text>
                      <Text style={styles.activitySubtitle}>{activity.subtitle}</Text>
                    </View>
                    <View style={styles.activityFooter}>
                      <View><Text style={styles.playOverline}>PLAY NOW</Text><Text style={styles.playLabel}>{activity.mode}</Text></View>
                      <View style={styles.smallPlay}><Ionicons name="play" size={16} color={activity.color} /></View>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>

            <View style={[styles.tipCard, darkMode && styles.darkTip]}>
              <View style={styles.tipIcon}><Ionicons name="fitness-outline" size={20} color="#A66A12" /></View>
              <View style={styles.tipCopy}><Text style={styles.tipLabel}>Practice makes progress</Text><Text style={styles.tipText}>Short, focused sessions help Japanese skills stick.</Text></View>
            </View>
          </View>
        </ScrollView>

        <Modal visible={!!infoActivity} transparent animationType="fade" onRequestClose={() => setInfoActivity(null)}>
          <Pressable style={styles.modalBackdrop} onPress={() => setInfoActivity(null)}>
            <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
              {infoActivity && <>
                <View style={[styles.modalIcon, { backgroundColor: infoActivity.tint }]}><Ionicons name={infoActivity.icon} size={29} color={infoActivity.color} /></View>
                <Text style={styles.modalEyebrow}>ABOUT THIS ACTIVITY</Text>
                <Text style={styles.modalTitle}>{infoActivity.title}</Text>
                <Text style={styles.modalText}>{infoActivity.description}</Text>
                <Pressable style={[styles.modalButton, { backgroundColor: infoActivity.color }]} onPress={() => setInfoActivity(null)}><Text style={styles.modalButtonText}>Got it</Text></Pressable>
              </>}
            </Pressable>
          </Pressable>
        </Modal>
        <StudentBottomNav active="play" />
      </View>
    </SafeAreaView>
  );
};

export default Exercises;
