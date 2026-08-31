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
              <Ionicons name="compass-outline" size={24} color="#8527DF" />
              <View style={styles.guideDot} />
            </Pressable>
          </View>

          <View style={styles.mapIntroduction}>
            <Text style={styles.mapIntroductionKicker}>CHOOSE YOUR NEXT DESTINATION</Text>
            <Text style={styles.mapIntroductionText}>Follow the trail from familiar moments to nuanced Japanese.</Text>
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
                      <Text style={[styles.stopStatus, { color: locked ? '#918994' : item.color }]}>
                        {locked ? 'LOCKED' : completed ? 'REPLAY' : index === 0 ? 'START' : 'OPEN'}
                      </Text>
                    </View>
                    <Pressable disabled={locked} onPress={() => openLevel(item.level)} style={[styles.destination, locked && styles.destinationLocked]}>
                      <View style={[styles.destinationIcon, { backgroundColor: locked ? '#CBC5CD' : item.color }]}>
                        <Ionicons name={locked ? 'lock-closed' : completed ? 'checkmark' : item.icon} size={27} color="#FFFFFF" />
                      </View>
                      <View style={styles.destinationCopy}>
                        <Text style={[styles.areaTitle, locked && styles.lockedText]}>{item.area}</Text>
                        <Text style={styles.areaSubtitle}>{item.subtitle}</Text>
                        <View style={styles.destinationMeta}>
                          <Ionicons name="images-outline" size={13} color={locked ? '#938B96' : item.color} />
                          <Text style={styles.momentCount}>{contentCounts[item.level] || 0} PUBLISHED MOMENTS</Text>
                        </View>
                      </View>
                      <View style={[styles.goButton, { backgroundColor: locked ? '#DDD8DF' : item.color }]}>
                        <Ionicons name={locked ? 'lock-closed-outline' : 'arrow-forward'} size={19} color="#FFFFFF" />
                      </View>
                    </Pressable>
                    <View style={[styles.mapNode, item.side === 'right' ? styles.nodeLeft : styles.nodeRight, { backgroundColor: locked ? '#BDB5C1' : item.color }]}>
                      <Text style={styles.mapNodeNumber}>{item.level}</Text>
                    </View>
                    <Text style={styles.pathInstruction}>
                      {locked ? 'Clear the destination before this one to continue.' : completed ? 'Cleared before · replay whenever you want.' : 'Tap this destination to begin.'}
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
              <View style={styles.guideHeader}>
                <View style={styles.tutorialIcon}><Ionicons name="compass-outline" size={27} color="#FFFFFF" /></View>
                <View style={styles.guideHeaderCopy}>
                  <Text style={styles.tutorialKicker}>TRAIL GUIDE</Text>
                  <Text style={styles.tutorialTitle}>Your Expression Match route</Text>
                </View>
              </View>
              <View style={styles.guideStats}>
                <View style={styles.guideStat}><Text style={styles.guideStatValue}>{attempts}</Text><Text style={styles.guideStatLabel}>PLAYS</Text></View>
                <View style={styles.guideStatDivider} />
                <View style={styles.guideStat}><Text style={styles.guideStatValue}>{averageAccuracy}%</Text><Text style={styles.guideStatLabel}>AVERAGE</Text></View>
                <View style={styles.guideStatDivider} />
                <View style={styles.guideStat}><Text style={styles.guideStatValue}>{bestAccuracy}%</Text><Text style={styles.guideStatLabel}>BEST</Text></View>
              </View>
              <View style={styles.routeSummary}>
                <View style={styles.routeSummaryTop}><Text style={styles.routeSummaryTitle}>ROUTE PROGRESS</Text><Text style={styles.routeSummaryValue}>{unlocked} OF 3 OPEN</Text></View>
                <View style={styles.routeSummaryTrack}><View style={[styles.routeSummaryFill, { width: `${(unlocked / 3) * 100}%` }]} /></View>
              </View>
              <View style={styles.guideSteps}>
                <View style={styles.guideStep}><View style={styles.guideStepNumber}><Text style={styles.guideStepNumberText}>1</Text></View><View style={styles.guideStepCopy}><Text style={styles.guideStepTitle}>Read both moments</Text><Text style={styles.guideStepText}>Notice the relationship, location, and social tone shown in each picture.</Text></View></View>
                <View style={styles.guideStep}><View style={styles.guideStepNumber}><Text style={styles.guideStepNumberText}>2</Text></View><View style={styles.guideStepCopy}><Text style={styles.guideStepTitle}>Match the expression</Text><Text style={styles.guideStepText}>Drag the Japanese phrase to the situation where it sounds natural.</Text></View></View>
                <View style={styles.guideStep}><View style={styles.guideStepNumber}><Text style={styles.guideStepNumberText}>3</Text></View><View style={styles.guideStepCopy}><Text style={styles.guideStepTitle}>Learn and replay</Text><Text style={styles.guideStepText}>Review the explanation, improve your average, and replay any open trail.</Text></View></View>
              </View>
              <Pressable style={styles.tutorialButton} onPress={() => setShowTutorial(false)}>
                <Text style={styles.tutorialButtonText}>RETURN TO THE TRAIL</Text>
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
  guideDot: { position: 'absolute', top: 8, right: 8, width: 9, height: 9, borderRadius: 5, backgroundColor: '#65A936', borderWidth: 2, borderColor: '#FFFFFF' },
  brandCopy: { flex: 1 },
  eyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5, color: '#65A936' },
  title: { fontFamily: 'Jua', fontSize: 27, color: '#40254E' },
  mapIntroduction: { marginTop: 24, marginBottom: 2, alignItems: 'center', paddingHorizontal: 28 },
  mapIntroductionKicker: { fontSize: 9, fontWeight: '900', letterSpacing: 1.25, color: '#65A936' },
  mapIntroductionText: { marginTop: 5, maxWidth: 340, textAlign: 'center', fontSize: 12, lineHeight: 18, color: '#796D7E' },
  heroIcon: { width: 50, height: 50, borderRadius: 17, backgroundColor: '#8527DF', alignItems: 'center', justifyContent: 'center' },
  heroCopy: { flex: 1, marginLeft: 13 },
  heroKicker: { color: '#B9ED8C', fontSize: 9, fontWeight: '900', letterSpacing: 1.1 },
  heroTitle: { marginTop: 2, fontFamily: 'Jua', fontSize: 21, color: '#FFFFFF' },
  heroText: { marginTop: 2, fontSize: 10, lineHeight: 15, color: '#E8DDEB' },
  routeCount: { width: 48, height: 58, borderRadius: 16, backgroundColor: 'rgba(255,255,255,.12)', alignItems: 'center', justifyContent: 'center' },
  routeCountValue: { fontFamily: 'Jua', fontSize: 23, color: '#FFFFFF' },
  routeCountLabel: { fontSize: 8, fontWeight: '900', letterSpacing: 0.8, color: '#C9F0A7' },
  loader: { marginTop: 70 },
  map: { position: 'relative', width: '100%', maxWidth: 530, minHeight: 670, alignSelf: 'center', paddingTop: 27, paddingBottom: 65 },
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
  stopStatus: { fontSize: 8.5, fontWeight: '900', letterSpacing: 0.9 },
  destinationMeta: { marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 5 },
  pathInstruction: { marginTop: 8, paddingHorizontal: 15, fontSize: 9.5, lineHeight: 14, color: '#877A8B' },
  finishMarker: { position: 'absolute', bottom: 13, left: '50%', marginLeft: -24, width: 48, height: 48, borderRadius: 24, backgroundColor: '#4A275B', alignItems: 'center', justifyContent: 'center', borderWidth: 5, borderColor: '#FFFFFF' },
  finishText: { position: 'absolute', bottom: -10, width: '100%', textAlign: 'center', fontSize: 8, fontWeight: '900', letterSpacing: 1, color: '#6F6075' },
  modalShade: { flex: 1, backgroundColor: 'rgba(35,18,44,.6)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  tutorialCard: { width: '100%', maxWidth: 430, maxHeight: '92%', borderRadius: 30, backgroundColor: '#FFFDF9', padding: 22 },
  guideHeader: { flexDirection: 'row', alignItems: 'center' },
  guideHeaderCopy: { flex: 1, marginLeft: 13 },
  tutorialIcon: { width: 54, height: 54, borderRadius: 19, backgroundColor: '#8527DF', alignItems: 'center', justifyContent: 'center' },
  tutorialKicker: { fontSize: 10, fontWeight: '900', letterSpacing: 1.2, color: '#65A936' },
  tutorialTitle: { fontFamily: 'Jua', fontSize: 21, lineHeight: 25, color: '#432750', marginTop: 3 },
  tutorialText: { marginTop: 10, color: '#776A7C', fontSize: 14, lineHeight: 22, textAlign: 'center' },
  tutorialButton: { width: '100%', marginTop: 22, minHeight: 54, borderRadius: 18, backgroundColor: '#8527DF', alignItems: 'center', justifyContent: 'center' },
  tutorialButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900', letterSpacing: 0.8 },
  guideStats: { marginTop: 18, minHeight: 72, borderRadius: 21, backgroundColor: '#4A275B', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 },
  guideStat: { flex: 1, alignItems: 'center' },
  guideStatValue: { fontFamily: 'Jua', fontSize: 21, color: '#FFFFFF' },
  guideStatLabel: { marginTop: 1, fontSize: 7.5, fontWeight: '900', letterSpacing: 0.8, color: '#CFF1B1' },
  guideStatDivider: { width: 1, height: 34, backgroundColor: 'rgba(255,255,255,.2)' },
  routeSummary: { marginTop: 12, borderRadius: 17, padding: 12, backgroundColor: '#F3ECFB' },
  routeSummaryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  routeSummaryTitle: { fontSize: 8, fontWeight: '900', letterSpacing: 0.9, color: '#7652E8' },
  routeSummaryValue: { fontSize: 8, fontWeight: '900', color: '#5C426B' },
  routeSummaryTrack: { marginTop: 8, height: 7, borderRadius: 7, overflow: 'hidden', backgroundColor: '#DDD0EB' },
  routeSummaryFill: { height: '100%', borderRadius: 7, backgroundColor: '#65A936' },
  guideSteps: { marginTop: 13, gap: 9 },
  guideStep: { flexDirection: 'row', alignItems: 'flex-start' },
  guideStepNumber: { width: 30, height: 30, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EEE5FA' },
  guideStepNumberText: { fontFamily: 'Jua', fontSize: 14, color: '#7652E8' },
  guideStepCopy: { flex: 1, marginLeft: 10 },
  guideStepTitle: { fontFamily: 'Jua', fontSize: 14, color: '#432750' },
  guideStepText: { marginTop: 2, fontSize: 10.5, lineHeight: 15, color: '#776B7B' },
});
