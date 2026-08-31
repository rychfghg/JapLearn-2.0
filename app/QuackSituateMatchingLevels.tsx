import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import expoconfig from '../expoconfig';

const difficulties = [
  {
    level: 1,
    title: 'Easy',
    subtitle: 'Clear everyday situations and familiar responses',
    detail: '20 situations',
    icon: 'hand-left-outline' as const,
    color: '#6CB33F',
    tint: '#EFF8E9',
  },
  {
    level: 2,
    title: 'Medium',
    subtitle: 'School, work, service, and social situations',
    detail: '20 situations',
    icon: 'people-outline' as const,
    color: '#E38B25',
    tint: '#FFF4E5',
  },
  {
    level: 3,
    title: 'Hard',
    subtitle: 'Formal, nuanced, and context-sensitive situations',
    detail: '20 situations',
    icon: 'trophy-outline' as const,
    color: '#8A20E8',
    tint: '#F3E9FC',
  },
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
        const response = await fetch(
          `${expoconfig.API_URL}/api/situational/expression-match/progress?email=${encodeURIComponent(email)}`,
        );

        if (response.ok) {
          const data = await response.json();
          setUnlocked(Math.min(3, data.unlockedLevel || 1));
          setCompletedSets(data.completedSets || []);
        }
      } finally {
        setLoading(false);
      }
    });
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.background}>
        <View pointerEvents="none" style={styles.topGlow} />
        <View pointerEvents="none" style={styles.bottomGlow} />
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <Pressable
              style={styles.backButton}
              onPress={() => router.replace('/QuackSituate')}
            >
              <Ionicons name="arrow-back" size={23} color="#442454" />
            </Pressable>

            <View style={styles.brandCopy}>
              <Text style={styles.eyebrow}>EXPRESSION MATCH</Text>
              <Text style={styles.title}>Expression Journey</Text>
            </View>

            <Pressable
              style={styles.helpButton}
              onPress={() => setShowTutorial(true)}
            >
              <Ionicons name="information-circle-outline" size={26} color="#8A20E8" />
            </Pressable>
          </View>

          <Text style={styles.intro}>
            Follow the situation trail. Match each Japanese phrase to the scene where it belongs.
          </Text>

          {loading ? (
            <ActivityIndicator
              size="large"
              color="#8A20E8"
              style={styles.loader}
            />
          ) : (
            <View style={styles.journey}>
              <View style={styles.trailLine} />
              <View style={[styles.trailTurn, styles.trailTurnTop]} />
              <View style={[styles.trailTurn, styles.trailTurnBottom]} />

              {difficulties.map((item, index) => {
                const locked = item.level > unlocked;
                const completed = completedSets.some(key => key.startsWith(`${item.level}-`));

                return (
                  <View
                    key={item.title}
                    style={[
                      styles.difficultyRow,
                      index === 1 && styles.difficultyRowMiddle,
                    ]}
                  >
                    <View
                      style={[
                        styles.node,
                        {
                          backgroundColor: locked ? '#BDB5C1' : item.color,
                        },
                      ]}
                    >
                      <Ionicons
                        name={locked ? 'lock-closed' : completed ? 'checkmark' : item.icon}
                        size={24}
                        color="#FFFFFF"
                      />
                    </View>

                    <Pressable
                      disabled={locked}
                      onPress={() => {
                        router.push({
                          pathname: '/QuackSituateMatching',
                          params: {
                            level: String(item.level),
                            set: '1',
                          },
                        });
                      }}
                      style={[
                        styles.difficultyCard,
                        {
                          borderColor: locked ? '#DDD7E0' : `${item.color}55`,
                          backgroundColor: locked ? '#F3F0F4' : '#FFFFFF',
                        },
                      ]}
                    >
                      <View style={styles.cardHeader}>
                        <View
                          style={[
                            styles.iconTile,
                            {
                              backgroundColor: locked ? '#E7E2E8' : item.tint,
                            },
                          ]}
                        >
                          <Ionicons
                            name={locked ? 'lock-closed-outline' : item.icon}
                            size={25}
                            color={locked ? '#A69EA9' : item.color}
                          />
                        </View>

                        <View style={styles.cardCopy}>
                          <Text
                            style={[
                              styles.difficultyTitle,
                              locked && styles.lockedText,
                            ]}
                          >
                            {item.title}
                          </Text>
                          <Text style={styles.difficultySubtitle}>
                            {item.subtitle}
                          </Text>
                        </View>

                        <View
                          style={[
                            styles.actionButton,
                            {
                              backgroundColor: locked ? '#D9D3DB' : item.color,
                            },
                          ]}
                        >
                          <Ionicons
                            name={locked ? 'lock-closed' : 'arrow-forward'}
                            size={20}
                            color="#FFFFFF"
                          />
                        </View>
                      </View>

                      <View style={styles.cardFooter}>
                        <Text style={styles.detail}>{item.detail}</Text>
                        <Text
                          style={[
                            styles.status,
                            {
                              color: locked ? '#908792' : item.color,
                            },
                          ]}
                        >
                          {locked ? 'LOCKED' : completed ? 'REPLAY' : index === 0 ? 'START' : 'UNLOCKED'}
                        </Text>
                      </View>
                    </Pressable>
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
                <Ionicons name="hand-left-outline" size={28} color="#FFFFFF" />
              </View>
              <Text style={styles.tutorialKicker}>HOW TO PLAY</Text>
              <Text style={styles.tutorialTitle}>Match phrase and situation</Text>
              <Text style={styles.tutorialText}>
                Read the two situations, listen to the Japanese phrase, and drag it to the scene where it naturally belongs. Each 20-situation journey unlocks the next difficulty.
              </Text>
              <Pressable
                style={styles.tutorialButton}
                onPress={() => setShowTutorial(false)}
              >
                <Text style={styles.tutorialButtonText}>GOT IT</Text>
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
  topGlow: { position: 'absolute', width: 360, height: 360, borderRadius: 180, right: -130, top: -120, backgroundColor: '#EAD9FF' },
  bottomGlow: { position: 'absolute', width: 310, height: 310, borderRadius: 155, left: -160, bottom: -85, backgroundColor: '#E9F6DF' },
  content: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 52 },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  backButton: { width: 52, height: 52, borderRadius: 18, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#35203F', shadowOpacity: 0.12, shadowRadius: 12 },
  brandCopy: { flex: 1 },
  eyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5, color: '#65A936' },
  title: { fontFamily: 'Jua', fontSize: 25, color: '#40254E' },
  helpButton: { width: 52, height: 52, borderRadius: 18, backgroundColor: '#F1E4FC', alignItems: 'center', justifyContent: 'center' },
  intro: { marginTop: 18, marginBottom: 22, padding: 15, borderRadius: 18, backgroundColor: 'rgba(255,255,255,.84)', borderWidth: 1, borderColor: '#EADFF1', fontSize: 13, lineHeight: 20, color: '#6D5D74' },
  loader: { marginTop: 60 },
  journey: { position: 'relative', width: '100%', maxWidth: 520, alignSelf: 'center', gap: 25, paddingVertical: 10 },
  trailLine: { position: 'absolute', left: 30, top: 42, bottom: 42, width: 7, borderRadius: 7, backgroundColor: '#CCB5DF' },
  trailTurn: { position: 'absolute', left: 30, width: 35, height: 7, borderRadius: 7, backgroundColor: '#CCB5DF' },
  trailTurnTop: { top: '31%' },
  trailTurnBottom: { top: '66%' },
  difficultyRow: { flexDirection: 'row', alignItems: 'center' },
  difficultyRowMiddle: { marginLeft: 25 },
  node: { width: 60, height: 60, borderRadius: 30, borderWidth: 6, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', zIndex: 2, shadowColor: '#422451', shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },
  difficultyCard: { flex: 1, minHeight: 142, marginLeft: 12, borderRadius: 25, borderWidth: 1.5, padding: 16, shadowColor: '#422451', shadowOpacity: 0.14, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 4 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  iconTile: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  cardCopy: { flex: 1, marginLeft: 12 },
  difficultyTitle: { fontFamily: 'Jua', fontSize: 23, color: '#442651' },
  lockedText: { color: '#928A95' },
  difficultySubtitle: { marginTop: 2, fontSize: 11, lineHeight: 16, color: '#827587' },
  actionButton: { width: 39, height: 39, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  cardFooter: { marginTop: 15, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#EEE8F0', flexDirection: 'row', justifyContent: 'space-between' },
  detail: { fontSize: 10, color: '#887C8C' },
  status: { fontSize: 10, fontWeight: '900', letterSpacing: 0.9 },
  modalShade: { flex: 1, backgroundColor: 'rgba(35,18,44,.58)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  tutorialCard: { width: '100%', maxWidth: 430, borderRadius: 30, backgroundColor: '#FFFDF9', padding: 26, alignItems: 'center' },
  tutorialIcon: { width: 58, height: 58, borderRadius: 20, backgroundColor: '#8A20E8', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  tutorialKicker: { fontSize: 10, fontWeight: '900', letterSpacing: 1.2, color: '#65A936' },
  tutorialTitle: { fontFamily: 'Jua', fontSize: 26, color: '#432750', marginTop: 7, textAlign: 'center' },
  tutorialText: { marginTop: 10, color: '#776A7C', fontSize: 14, lineHeight: 22, textAlign: 'center' },
  tutorialButton: { width: '100%', marginTop: 22, minHeight: 54, borderRadius: 18, backgroundColor: '#8A20E8', alignItems: 'center', justifyContent: 'center' },
  tutorialButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900', letterSpacing: 0.8 },
});
