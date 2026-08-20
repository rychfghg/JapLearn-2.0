import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import expoconfig from '../expoconfig';

const levels = [
  { level: 1, sets: 3, title: 'First Encounters', topic: 'Greetings, thanks, and farewells', color: '#6CB33F', side: 'left' },
  { level: 2, sets: 3, title: 'Daily Moments', topic: 'School, meals, and home routines', color: '#E38B25', side: 'right' },
  { level: 3, sets: 3, title: 'Social Streets', topic: 'Introductions, work, and travel', color: '#8A20E8', side: 'left' },
  { level: 4, sets: 5, title: 'Nuance Garden', topic: 'Intermediate social situations', color: '#D65083', side: 'right' },
  { level: 5, sets: 10, title: 'Master Summit', topic: 'Hard mixed-context trials', color: '#55318C', side: 'left' },
] as const;

export default function QuackSituateMatchingLevels() {
  const [unlocked, setUnlocked] = useState(1);
  const [completedSets, setCompletedSets] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('user').then(async value => {
      try {
        const email = value ? JSON.parse(value).email : '';
        const response = await fetch(`${expoconfig.API_URL}/api/situational/expression-match/progress?email=${encodeURIComponent(email)}`);
        if (response.ok) {
          const data = await response.json();
          setUnlocked(data.unlockedLevel || 1);
          setCompletedSets(data.completedSets || []);
        }
      } finally {
        setLoading(false);
      }
    });
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <ImageBackground
        source={require('../assets/quacksituate/quacksituate-menu-background-v3.png')}
        style={styles.background}
        imageStyle={styles.backgroundImage}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.topBar}>
            <Pressable style={styles.backButton} onPress={() => router.replace('/QuackSituate')}>
              <Ionicons name="arrow-back" size={23} color="#442454" />
            </Pressable>
            <View style={styles.brandCopy}>
              <Text style={styles.eyebrow}>EXPRESSION MATCH</Text>
              <Text style={styles.title}>Journey map</Text>
            </View>
            <Pressable
              style={styles.mapIcon}
              onPress={() => setShowTutorial(true)}
            >
              <Ionicons name="help" size={24} color="#8A20E8" />
            </Pressable>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#8A20E8" style={styles.loader} />
          ) : (
            <View style={styles.map}>
              <Svg pointerEvents="none" style={StyleSheet.absoluteFill} viewBox="0 0 400 850" preserveAspectRatio="none">
                <Path
                  d="M 46 94 C 175 94, 225 261, 354 261 S 175 428, 46 428 S 225 595, 354 595 S 175 762, 46 762"
                  stroke="#6B422D"
                  strokeWidth="18"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.24"
                />
                <Path
                  d="M 46 94 C 175 94, 225 261, 354 261 S 175 428, 46 428 S 225 595, 354 595 S 175 762, 46 762"
                  stroke="#C89B72"
                  strokeWidth="11"
                  strokeLinecap="round"
                  fill="none"
                />
                <Path
                  d="M 46 94 C 175 94, 225 261, 354 261 S 175 428, 46 428 S 225 595, 354 595 S 175 762, 46 762"
                  stroke="#F6DFC2"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="5 12"
                  fill="none"
                />
              </Svg>

              {levels.map(item => {
                const locked = item.level > unlocked;
                const completed = Array.from({ length: item.sets }, (_, index) =>
                  completedSets.includes(`${item.level}-${index + 1}`),
                ).filter(Boolean).length;
                const isLeft = item.side === 'left';

                return (
                  <View key={item.level} style={[styles.stopRow, isLeft ? styles.stopLeft : styles.stopRight]}>
                    <View style={[styles.levelNode, { backgroundColor: locked ? '#B8AFBC' : item.color }]}>
                      <Ionicons name={locked ? 'lock-closed' : completed === item.sets ? 'trophy' : 'flag'} size={20} color="#FFF" />
                      <Text style={styles.levelNumber}>{item.level}</Text>
                    </View>

                    <View style={styles.nodeBridge}>
                      <View style={styles.nodeBridgeCore} />
                    </View>

                    <View style={[styles.levelCard, { borderColor: locked ? '#DED7E1' : `${item.color}55` }, locked && styles.lockedCard]}>
                      <View style={styles.cardTop}>
                        <View>
                          <Text style={[styles.levelLabel, { color: locked ? '#8D858F' : item.color }]}>LEVEL {item.level}</Text>
                          <Text style={styles.levelTitle}>{item.title}</Text>
                        </View>
                        <Text style={styles.setCount}>{completed}/{item.sets}</Text>
                      </View>
                      <Text style={styles.levelTopic}>{item.topic}</Text>

                      <View style={styles.setTrail}>
                        {Array.from({ length: item.sets }, (_, index) => {
                          const done = completedSets.includes(`${item.level}-${index + 1}`);
                          return (
                            <Pressable
                              key={index}
                              disabled={locked}
                              onPress={() => router.push({ pathname: '/QuackSituateMatching', params: { level: String(item.level), set: String(index + 1) } })}
                              style={[
                                styles.setNode,
                                { borderColor: locked ? '#CAC3CC' : item.color },
                                done && { backgroundColor: item.color },
                              ]}
                            >
                              <Text style={[styles.setNodeText, done && styles.setNodeTextDone]}>{index + 1}</Text>
                            </Pressable>
                          );
                        })}
                      </View>

                      {locked && <Text style={styles.lockText}>Clear the previous destination to unlock</Text>}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>

        <Modal
          visible={showTutorial}
          transparent
          animationType="fade"
          onRequestClose={() => setShowTutorial(false)}
        >
          <View style={styles.modalShade}>
            <View style={styles.tutorialCard}>
              <View style={styles.tutorialIcon}>
                <Ionicons name="git-compare" size={27} color="#FFFFFF" />
              </View>
              <Text style={styles.tutorialKicker}>HOW EXPRESSION MATCH WORKS</Text>
              <Text style={styles.tutorialTitle}>Connect every scene</Text>
              <Text style={styles.tutorialText}>
                Drag a rope from each Japanese expression to the scene where it naturally belongs.
                Complete every connection before checking your answer.
              </Text>
              <Pressable
                style={styles.tutorialButton}
                onPress={() => setShowTutorial(false)}
              >
                <Text style={styles.tutorialButtonText}>START THE TRAIL</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAF7FC' },
  background: { flex: 1 },
  backgroundImage: { opacity: 0.13 },
  content: { padding: 18, paddingBottom: 56 },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 13, marginBottom: 16 },
  backButton: { width: 52, height: 52, borderRadius: 18, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#35203F', shadowOpacity: 0.12, shadowRadius: 12 },
  brandCopy: { flex: 1 },
  eyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5, color: '#65A936' },
  title: { fontFamily: 'Jua', fontSize: 28, color: '#40254E' },
  mapIcon: { width: 52, height: 52, borderRadius: 18, backgroundColor: '#F1E4FC', alignItems: 'center', justifyContent: 'center' },
  loader: { marginTop: 60 },
  map: { minHeight: 850, width: '100%', maxWidth: 520, alignSelf: 'center', paddingVertical: 14 },
  stopRow: { position: 'relative', minHeight: 160, width: '100%', paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 7 },
  stopLeft: { justifyContent: 'flex-start' },
  stopRight: { justifyContent: 'flex-start', flexDirection: 'row-reverse' },
  levelNode: { width: 64, height: 64, borderRadius: 32, borderWidth: 6, borderColor: '#FFF', alignItems: 'center', justifyContent: 'center', zIndex: 4, shadowColor: '#422451', shadowOpacity: 0.22, shadowRadius: 11, elevation: 5 },
  levelNumber: { position: 'absolute', bottom: 5, right: 8, fontFamily: 'Jua', color: '#FFF', fontSize: 12 },
  nodeBridge: { width: 20, height: 16, marginHorizontal: -3, zIndex: 2, backgroundColor: '#C89B72', borderTopWidth: 3, borderBottomWidth: 3, borderColor: '#8B6046', justifyContent: 'center' },
  nodeBridgeCore: { height: 2, backgroundColor: '#F6DFC2', opacity: 0.9 },
  levelCard: { width: '72%', minHeight: 126, backgroundColor: 'rgba(255,255,255,.97)', borderRadius: 25, padding: 17, borderWidth: 1.5, shadowColor: '#422451', shadowOpacity: 0.11, shadowRadius: 15, shadowOffset: { width: 0, height: 7 }, elevation: 3 },
  lockedCard: { opacity: 0.72 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  levelLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1.3 },
  levelTitle: { fontFamily: 'Jua', fontSize: 21, color: '#442651', marginTop: 2 },
  setCount: { fontFamily: 'Jua', fontSize: 14, color: '#77687D', backgroundColor: '#F5EFF7', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 11 },
  levelTopic: { fontSize: 11, color: '#827587', marginTop: 3 },
  setTrail: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 14 },
  setNode: { width: 36, height: 36, borderRadius: 13, borderWidth: 2, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center' },
  setNodeText: { fontFamily: 'Jua', fontSize: 12, color: '#4B3157' },
  setNodeTextDone: { color: '#FFF' },
  lockText: { fontSize: 9, color: '#8C838E', marginTop: 10 },
  modalShade: {
    flex: 1,
    backgroundColor: 'rgba(35, 18, 44, 0.58)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  tutorialCard: {
    width: '100%',
    maxWidth: 430,
    borderRadius: 30,
    backgroundColor: '#FFFDF9',
    padding: 26,
    alignItems: 'center',
    shadowColor: '#291533',
    shadowOpacity: 0.25,
    shadowRadius: 22,
  },
  tutorialIcon: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: '#8A20E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  tutorialKicker: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: '#65A936',
  },
  tutorialTitle: {
    fontFamily: 'Jua',
    fontSize: 27,
    color: '#432750',
    marginTop: 7,
  },
  tutorialText: {
    marginTop: 10,
    color: '#776A7C',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  tutorialButton: {
    width: '100%',
    marginTop: 22,
    minHeight: 54,
    borderRadius: 18,
    backgroundColor: '#8A20E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tutorialButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
});
