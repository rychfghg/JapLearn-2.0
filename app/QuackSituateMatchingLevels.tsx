import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import expoconfig from '../expoconfig';

const difficulties = [
  { level: 1, title: 'Easy', area: 'Everyday Garden', subtitle: 'Familiar greetings and daily moments', icon: 'leaf-outline' as const, color: '#66B73D', tint: '#EAF7E2', side: 'left' as const },
  { level: 2, title: 'Medium', area: 'Social Crossing', subtitle: 'School, workplace, and service encounters', icon: 'people-outline' as const, color: '#E78B22', tint: '#FFF0D9', side: 'right' as const },
  { level: 3, title: 'Hard', area: 'Context Summit', subtitle: 'Nuanced and formal Japanese situations', icon: 'trophy-outline' as const, color: '#8527DF', tint: '#F0E4FC', side: 'left' as const },
] as const;

export default function QuackSituateMatchingLevels() {
  const [unlocked, setUnlocked] = useState(1);
  const [completedSets, setCompletedSets] = useState<string[]>([]);
  const [contentCounts, setContentCounts] = useState<Record<number, number>>({ 1: 0, 2: 0, 3: 0 });
  const [attempts, setAttempts] = useState(0);
  const [averageAccuracy, setAverageAccuracy] = useState(0);
  const [bestAccuracy, setBestAccuracy] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('user').then(async value => {
      try {
        const email = value ? JSON.parse(value).email : '';
        const [progressResponse, contentResponse] = await Promise.all([
          fetch(`${expoconfig.API_URL}/api/situational/expression-match/progress?email=${encodeURIComponent(email)}`),
          fetch(`${expoconfig.API_URL}/api/situational/questions?gameType=EXPRESSION_MATCH`),
        ]);
        if (progressResponse.ok) {
          const data = await progressResponse.json();
          setUnlocked(Math.min(3, data.unlockedLevel || 1));
          setCompletedSets(data.completedSets || []);
          setAttempts(data.attempts || 0);
          setAverageAccuracy(data.averageAccuracy || 0);
          setBestAccuracy(data.bestAccuracy || 0);
        }
        if (contentResponse.ok) {
          const records = await contentResponse.json();
          const nextCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0 };
          records.forEach((item: any) => {
            const choices = Array.isArray(item.choices) ? item.choices : [];
            const complete = item.scenario && item.secondaryScenario && item.imageUrl
              && item.secondaryImageUrl && choices.some((choice: any) => choice.japanese === item.correctAnswer);
            if (complete && nextCounts[item.level] !== undefined) nextCounts[item.level] += 1;
          });
          setContentCounts(nextCounts);
        }
      } finally {
        setLoading(false);
      }
    });
  }, []);

  const openLevel = (level: number) => {
    router.push({ pathname: '/QuackSituateMatching', params: { level: String(level), set: '1' } });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.background}>
        <View pointerEvents="none" style={styles.sunGlow} />
        <View pointerEvents="none" style={styles.hillOne} />
        <View pointerEvents="none" style={styles.hillTwo} />

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.topBar}>
            <Pressable style={styles.topButton} onPress={() => router.replace('/QuackSituate')}>
              <Ionicons name="arrow-back" size={23} color="#442454" />
            </Pressable>
            <View style={styles.brandCopy}>
              <Text style={styles.eyebrow}>EXPRESSION MATCH</Text>
              <Text style={styles.title}>Situation Trail</Text>
            </View>
            <Pressable style={[styles.topButton, styles.helpButton]} onPress={() => setShowTutorial(true)}>
              <Ionicons name="map-outline" size={24} color="#8527DF" />
            </Pressable>
          </View>

          <View style={styles.heroCard}>
            <View style={styles.heroIcon}>
              <Ionicons name="git-compare-outline" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.heroCopy}>
              <Text style={styles.heroKicker}>YOUR ROUTE</Text>
              <Text style={styles.heroTitle}>Match the moment</Text>
              <Text style={styles.heroText}>{attempts} plays · {averageAccuracy}% average · {bestAccuracy}% best</Text>
            </View>
            <View style={styles.routeCount}>
              <Text style={styles.routeCountValue}>{unlocked}</Text>
              <Text style={styles.routeCountLabel}>OPEN</Text>
            </View>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#8527DF" style={styles.loader} />
          ) : (
            <View style={styles.map}>
              <View pointerEvents="none" style={styles.routeLine} />
              {difficulties.map((item, index) => {
                const locked = item.level > unlocked;
                const completed = completedSets.some(key => key.startsWith(`${item.level}-`));
                return (
                  <View key={item.level} style={[styles.stop, item.side === 'right' ? styles.stopRight : styles.stopLeft]}>
                    <View style={styles.stopLabelRow}>
                      <View style={[styles.levelPill, { backgroundColor: locked ? '#E7E2E8' : item.tint }]}>
                        <Text style={[styles.levelPillText, { color: locked ? '#918994' : item.color }]}>{item.title.toUpperCase()}</Text>
                      </View>
                      <Text style={styles.momentCount}>{contentCounts[item.level] || 0} MOMENTS</Text>
                    </View>
                    <Pressable disabled={locked} onPress={() => openLevel(item.level)} style={[styles.destination, locked && styles.destinationLocked]}>
                      <View style={[styles.destinationIcon, { backgroundColor: locked ? '#CBC5CD' : item.color }]}>
                        <Ionicons name={locked ? 'lock-closed' : completed ? 'checkmark' : item.icon} size={27} color="#FFFFFF" />
                      </View>
                      <View style={styles.destinationCopy}>
                        <Text style={[styles.areaTitle, locked && styles.lockedText]}>{item.area}</Text>
                        <Text style={styles.areaSubtitle}>{item.subtitle}</Text>
                      </View>
                      <View style={[styles.goButton, { backgroundColor: locked ? '#DDD8DF' : item.color }]}>
                        <Ionicons name={locked ? 'lock-closed-outline' : 'arrow-forward'} size={19} color="#FFFFFF" />
                      </View>
                    </Pressable>
                    <View style={[styles.mapNode, item.side === 'right' ? styles.nodeLeft : styles.nodeRight, { backgroundColor: locked ? '#BDB5C1' : item.color }]}>
                      <Text style={styles.mapNodeNumber}>{item.level}</Text>
                    </View>
                    <Text style={[styles.stopStatus, { color: locked ? '#918994' : item.color }]}>
                      {locked ? 'FINISH THE PREVIOUS TRAIL' : completed ? 'CLEARED · PLAY AGAIN' : index === 0 ? 'START HERE' : 'NEW TRAIL OPEN'}
                    </Text>
                  </View>
                );
              })}
              <View style={styles.finishMarker}><Ionicons name="flag" size={23} color="#FFFFFF" /></View>
              <Text style={styles.finishText}>TRAIL COMPLETE</Text>
            </View>
          )}
        </ScrollView>

        <Modal visible={showTutorial} transparent animationType="fade" onRequestClose={() => setShowTutorial(false)}>
          <View style={styles.modalShade}>
            <View style={styles.tutorialCard}>
              <View style={styles.tutorialIcon}><Ionicons name="map-outline" size={29} color="#FFFFFF" /></View>
              <Text style={styles.tutorialKicker}>TRAIL GUIDE</Text>
              <Text style={styles.tutorialTitle}>Match phrase and situation</Text>
              <Text style={styles.tutorialText}>Drag one Japanese phrase to the picture where it naturally belongs. Every published Admin moment appears in its difficulty, and every trail can be replayed whenever you want.</Text>
              <Pressable style={styles.tutorialButton} onPress={() => setShowTutorial(false)}>
                <Text style={styles.tutorialButtonText}>EXPLORE THE TRAIL</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FBF8FF' },
  background: { flex: 1, overflow: 'hidden', backgroundColor: '#FBF8FF' },
  sunGlow: { position: 'absolute', width: 330, height: 330, borderRadius: 165, right: -135, top: -95, backgroundColor: '#EBD9FD' },
  hillOne: { position: 'absolute', width: 430, height: 240, borderRadius: 220, left: -210, bottom: 130, backgroundColor: '#EDF7E6', transform: [{ rotate: '-10deg' }] },
  hillTwo: { position: 'absolute', width: 390, height: 230, borderRadius: 210, right: -210, bottom: -70, backgroundColor: '#F4EAFB', transform: [{ rotate: '12deg' }] },
  content: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 48 },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  topButton: { width: 52, height: 52, borderRadius: 18, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#35203F', shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 4 },
  helpButton: { backgroundColor: '#F1E4FC' },
  brandCopy: { flex: 1 },
  eyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5, color: '#65A936' },
  title: { fontFamily: 'Jua', fontSize: 27, color: '#40254E' },
  heroCard: { marginTop: 20, minHeight: 106, borderRadius: 27, padding: 17, flexDirection: 'row', alignItems: 'center', backgroundColor: '#4A275B', shadowColor: '#2E173A', shadowOpacity: 0.18, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 5 },
  heroIcon: { width: 50, height: 50, borderRadius: 17, backgroundColor: '#8527DF', alignItems: 'center', justifyContent: 'center' },
  heroCopy: { flex: 1, marginLeft: 13 },
  heroKicker: { color: '#B9ED8C', fontSize: 9, fontWeight: '900', letterSpacing: 1.1 },
  heroTitle: { marginTop: 2, fontFamily: 'Jua', fontSize: 21, color: '#FFFFFF' },
  heroText: { marginTop: 2, fontSize: 10, lineHeight: 15, color: '#E8DDEB' },
  routeCount: { width: 48, height: 58, borderRadius: 16, backgroundColor: 'rgba(255,255,255,.12)', alignItems: 'center', justifyContent: 'center' },
  routeCountValue: { fontFamily: 'Jua', fontSize: 23, color: '#FFFFFF' },
  routeCountLabel: { fontSize: 8, fontWeight: '900', letterSpacing: 0.8, color: '#C9F0A7' },
  loader: { marginTop: 70 },
  map: { position: 'relative', width: '100%', maxWidth: 530, minHeight: 670, alignSelf: 'center', paddingTop: 36, paddingBottom: 65 },
  routeLine: { position: 'absolute', left: '50%', top: 58, bottom: 50, width: 7, marginLeft: -3.5, borderRadius: 8, backgroundColor: '#D7C5E5' },
  stop: { position: 'relative', width: '86%', marginBottom: 46 },
  stopLeft: { alignSelf: 'flex-start' },
  stopRight: { alignSelf: 'flex-end' },
  stopLabelRow: { marginBottom: 8, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  levelPill: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  levelPillText: { fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  momentCount: { fontSize: 9, fontWeight: '800', letterSpacing: 0.8, color: '#8B7D90' },
  destination: { minHeight: 126, borderRadius: 27, padding: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E8DDED', shadowColor: '#3C2148', shadowOpacity: 0.13, shadowRadius: 15, shadowOffset: { width: 0, height: 8 }, elevation: 4 },
  destinationLocked: { backgroundColor: '#F1EEF2', borderColor: '#DDD7E0' },
  destinationIcon: { width: 54, height: 54, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  destinationCopy: { flex: 1, marginHorizontal: 13 },
  areaTitle: { fontFamily: 'Jua', fontSize: 21, color: '#432750' },
  areaSubtitle: { marginTop: 4, fontSize: 10.5, lineHeight: 16, color: '#7F7184' },
  lockedText: { color: '#938B96' },
  goButton: { width: 39, height: 39, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  mapNode: { position: 'absolute', top: 73, width: 48, height: 48, borderRadius: 24, borderWidth: 5, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#3C2148', shadowOpacity: 0.18, shadowRadius: 9, elevation: 6 },
  nodeLeft: { left: -25 },
  nodeRight: { right: -25 },
  mapNodeNumber: { fontFamily: 'Jua', fontSize: 18, color: '#FFFFFF' },
  stopStatus: { marginTop: 8, paddingHorizontal: 15, fontSize: 9, fontWeight: '900', letterSpacing: 0.8 },
  finishMarker: { position: 'absolute', bottom: 13, left: '50%', marginLeft: -24, width: 48, height: 48, borderRadius: 24, backgroundColor: '#4A275B', alignItems: 'center', justifyContent: 'center', borderWidth: 5, borderColor: '#FFFFFF' },
  finishText: { position: 'absolute', bottom: -10, width: '100%', textAlign: 'center', fontSize: 8, fontWeight: '900', letterSpacing: 1, color: '#6F6075' },
  modalShade: { flex: 1, backgroundColor: 'rgba(35,18,44,.6)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  tutorialCard: { width: '100%', maxWidth: 430, borderRadius: 30, backgroundColor: '#FFFDF9', padding: 26, alignItems: 'center' },
  tutorialIcon: { width: 60, height: 60, borderRadius: 21, backgroundColor: '#8527DF', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  tutorialKicker: { fontSize: 10, fontWeight: '900', letterSpacing: 1.2, color: '#65A936' },
  tutorialTitle: { fontFamily: 'Jua', fontSize: 25, color: '#432750', marginTop: 7, textAlign: 'center' },
  tutorialText: { marginTop: 10, color: '#776A7C', fontSize: 14, lineHeight: 22, textAlign: 'center' },
  tutorialButton: { width: '100%', marginTop: 22, minHeight: 54, borderRadius: 18, backgroundColor: '#8527DF', alignItems: 'center', justifyContent: 'center' },
  tutorialButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900', letterSpacing: 0.8 },
});
