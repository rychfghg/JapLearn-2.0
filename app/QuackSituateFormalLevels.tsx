import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  ImageBackground,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { POLITENESS_LEVELS } from '../data/politenessScenarios';
import expoconfig from '../expoconfig';

type Attempt = {
  id: string;
  completed: boolean;
  correctAnswers: number;
  level: number;
  setNumber: number;
  score: number;
};

type PublishedQuestion = {
  active: boolean;
  level: number;
};

export default function QuackSituateFormalLevels() {
  const { user } = useContext(AuthContext);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [publishedLevels, setPublishedLevels] = useState<Set<number> | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    if (!user?.email) return;

    fetch(
      `${expoconfig.API_URL}/api/situational/attempts?email=${encodeURIComponent(user.email)}&gameType=POLITENESS`,
    )
      .then((response) => response.ok ? response.json() : [])
      .then((records: Attempt[]) => setAttempts(records))
      .catch(() => setAttempts([]));
  }, [user?.email]);

  useEffect(() => {
    fetch(
      `${expoconfig.API_URL}/api/situational/questions?gameType=POLITENESS&activeOnly=false`,
    )
      .then((response) => response.ok ? response.json() : [])
      .then((questions: PublishedQuestion[]) => {
        if (!questions.length) {
          setPublishedLevels(null);
          return;
        }

        setPublishedLevels(
          new Set(
            questions
              .filter((question) => question.active)
              .map((question) => question.level || 1),
          ),
        );
      })
      .catch(() => setPublishedLevels(null));
  }, []);

  const completedLevels = useMemo(
    () => new Set(
      attempts
        .filter((attempt) => attempt.completed && attempt.level > 0)
        .map((attempt) => attempt.level),
    ),
    [attempts],
  );

  const unlockedLevel = completedLevels.has(1)
    ? completedLevels.has(2)
      ? 3
      : 2
    : 1;

  const resumeForLevel = (level: number) => attempts.find(
    (attempt) => !attempt.completed && attempt.level === level,
  );

  const openLevel = (level: number) => {
    const unpublished = publishedLevels !== null && !publishedLevels.has(level);

    if (level > unlockedLevel || unpublished) return;

    const resume = completedLevels.has(level)
      ? undefined
      : resumeForLevel(level);

    router.push({
      pathname: '/QuackSituateFormal',
      params: {
        level: String(level),
        resumeIndex: String(resume?.setNumber || 0),
        resumeScore: String(resume?.correctAnswers || 0),
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={require('../assets/quacksituate/quacksituate-menu-background-v3.png')}
        style={styles.background}
        imageStyle={styles.backgroundImage}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <Pressable style={styles.iconButton} onPress={() => router.replace('/QuackSituate')}>
              <Ionicons name="arrow-back" size={24} color="#452452" />
            </Pressable>

            <View style={styles.brand}>
              <Text style={styles.kicker}>TONE QUEST</Text>
              <Text style={styles.title}>Politeness journey</Text>
            </View>

            <Pressable style={styles.helpButton} onPress={() => setShowTutorial(true)}>
              <Ionicons name="help" size={24} color="#8423D9" />
            </Pressable>
          </View>

          <View style={styles.map}>
            <View style={styles.mapRope} />

            {POLITENESS_LEVELS.map((item, index) => {
              const locked = item.level > unlockedLevel;
              const unpublished = publishedLevels !== null && !publishedLevels.has(item.level);
              const unavailable = locked || unpublished;
              const completed = completedLevels.has(item.level);
              const resume = resumeForLevel(item.level);

              return (
                <View
                  key={item.level}
                  style={[
                    styles.stageRow,
                    index % 2 === 1 && styles.stageRowRight,
                  ]}
                >
                  <View
                    style={[
                      styles.stageNode,
                      {
                        backgroundColor: unavailable ? '#BDB4C0' : item.color,
                      },
                    ]}
                  >
                    <Ionicons
                      name={unavailable ? 'lock-closed' : completed ? 'checkmark' : item.icon as any}
                      size={24}
                      color="#FFFFFF"
                    />
                  </View>

                  <Pressable
                    disabled={unavailable}
                    style={({ pressed }) => [
                      styles.stageCard,
                      unavailable && styles.stageCardLocked,
                      pressed && !unavailable && styles.stageCardPressed,
                    ]}
                    onPress={() => openLevel(item.level)}
                  >
                    <View
                      pointerEvents="none"
                      style={[
                        styles.japaneseMotif,
                        {
                          backgroundColor: unavailable
                            ? 'rgba(157,147,160,0.08)'
                            : `${item.color}12`,
                        },
                      ]}
                    >
                      {index === 0 && (
                        <>
                          <View style={[styles.sakuraPetal, styles.sakuraPetalOne]} />
                          <View style={[styles.sakuraPetal, styles.sakuraPetalTwo]} />
                          <View style={[styles.sakuraPetal, styles.sakuraPetalThree]} />
                        </>
                      )}

                      {index === 1 && (
                        <View style={styles.toriiMotif}>
                          <View style={styles.toriiRoof} />
                          <View style={styles.toriiBeam} />
                          <View style={styles.toriiPillarLeft} />
                          <View style={styles.toriiPillarRight} />
                        </View>
                      )}

                      {index === 2 && (
                        <>
                          <View style={styles.summitBack} />
                          <View style={styles.summitFront} />
                          <View style={styles.summitSun} />
                        </>
                      )}

                      <Text
                        style={[
                          styles.japaneseMotifCharacter,
                          {
                            color: unavailable
                              ? 'rgba(141,131,143,0.18)'
                              : `${item.color}35`,
                          },
                        ]}
                      >
                        {index === 0 ? '礼' : index === 1 ? '縁' : '敬'}
                      </Text>
                    </View>

                    <View style={styles.stageTopRow}>
                      <View
                        style={[
                          styles.levelTag,
                          {
                            backgroundColor: unavailable ? '#EEE9EF' : `${item.color}18`,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.levelTagText,
                            {
                              color: unavailable ? '#8D838F' : item.color,
                            },
                          ]}
                        >
                          LEVEL {item.level} · {item.difficulty}
                        </Text>
                      </View>
                      <Ionicons
                        name={unavailable ? 'lock-closed-outline' : 'arrow-forward-circle'}
                        size={25}
                        color={unavailable ? '#A99FAB' : item.color}
                      />
                    </View>

                    <Text style={[styles.stageTitle, unavailable && styles.mutedText]}>
                      {item.name}
                    </Text>
                    <Text style={[styles.stageDescription, unavailable && styles.mutedText]}>
                      {index === 0
                        ? 'Everyday greetings and respectful courtesy'
                        : index === 1
                          ? 'School, service, and workplace relationships'
                          : 'Formal, honorific, and humble language'}
                    </Text>

                    <View style={styles.stageFooter}>
                      <Text style={[styles.momentCount, unavailable && styles.mutedText]}>
                        {item.count} story moments
                      </Text>
                      <Text
                        style={[
                          styles.stageState,
                          {
                            color: unavailable ? '#8D838F' : item.color,
                          },
                        ]}
                      >
                        {unpublished
                          ? 'UNPUBLISHED'
                          : locked
                            ? 'LOCKED'
                          : completed
                            ? 'REPLAY'
                            : resume
                              ? `CONTINUE ${resume.setNumber + 1}/${item.count}`
                              : 'START'}
                      </Text>
                    </View>
                  </Pressable>
                </View>
              );
            })}
          </View>
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
                <Ionicons name="chatbubbles" size={30} color="#8423D9" />
              </View>
              <Text style={styles.tutorialKicker}>HOW TONE QUEST WORKS</Text>
              <Text style={styles.tutorialTitle}>Listen before you answer</Text>
              <Text style={styles.tutorialText}>
                Read the situation, listen to the NPC, then choose the response that fits your relationship and setting. The NPC reacts to your tone and explains a better response when needed.
              </Text>
              <View style={styles.tutorialSteps}>
                <Text>1 · Listen to the full Japanese line</Text>
                <Text>2 · Open the hint only when needed</Text>
                <Text>3 · Complete each level to unlock the next</Text>
              </View>
              <Pressable style={styles.tutorialButton} onPress={() => setShowTutorial(false)}>
                <Text style={styles.tutorialButtonText}>UNDERSTOOD</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF7FC',
  },
  background: {
    flex: 1,
  },
  backgroundImage: {
    opacity: 0.1,
  },
  content: {
    padding: 19,
    paddingBottom: 45,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },
  iconButton: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  helpButton: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: '#F0E4FA',
    borderWidth: 1,
    borderColor: '#DEC8EF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    flex: 1,
  },
  kicker: {
    color: '#65A936',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  title: {
    color: '#432750',
    fontFamily: 'Jua',
    fontSize: 27,
  },
  map: {
    position: 'relative',
    alignItems: 'center',
    paddingTop: 54,
    paddingBottom: 18,
  },
  mapRope: {
    position: 'absolute',
    left: '50%',
    marginLeft: -6,
    top: 46,
    bottom: 54,
    width: 12,
    borderRadius: 10,
    backgroundColor: '#C59BE5',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#71349D',
    shadowOpacity: 0.22,
    shadowRadius: 7,
    elevation: 2,
  },
  stageRow: {
    width: '100%',
    minHeight: 218,
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
    marginBottom: 18,
  },
  stageRowRight: {
    alignItems: 'center',
  },
  stageNode: {
    position: 'absolute',
    top: 0,
    left: '50%',
    marginLeft: -34,
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 7,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 6,
    shadowColor: '#4E295E',
    shadowOpacity: 0.26,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 7,
  },
  stageCard: {
    width: '92%',
    minHeight: 174,
    marginTop: 34,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderWidth: 2,
    borderColor: '#DFCEE8',
    paddingHorizontal: 18,
    paddingTop: 39,
    paddingBottom: 17,
    shadowColor: '#462652',
    shadowOpacity: 0.14,
    shadowRadius: 15,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 6,
  },
  stageCardLocked: {
    backgroundColor: 'rgba(247,244,248,0.98)',
    borderColor: '#DED7E0',
  },
  stageCardPressed: {
    transform: [{ scale: 0.975 }],
    opacity: 0.92,
  },
  japaneseMotif: {
    position: 'absolute',
    right: -13,
    top: 20,
    width: 132,
    height: 132,
    borderRadius: 66,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  japaneseMotifCharacter: {
    position: 'absolute',
    fontFamily: 'Jua',
    fontSize: 76,
    lineHeight: 88,
  },
  sakuraPetal: {
    position: 'absolute',
    width: 17,
    height: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(216,79,131,0.19)',
    zIndex: 2,
  },
  sakuraPetalOne: {
    right: 18,
    top: 21,
    transform: [{ rotate: '28deg' }],
  },
  sakuraPetalTwo: {
    left: 17,
    bottom: 27,
    transform: [{ rotate: '-34deg' }],
  },
  sakuraPetalThree: {
    right: 24,
    bottom: 18,
    transform: [{ rotate: '66deg' }],
  },
  toriiMotif: {
    position: 'absolute',
    width: 92,
    height: 82,
    opacity: 0.34,
  },
  toriiRoof: {
    position: 'absolute',
    top: 12,
    left: 3,
    width: 86,
    height: 8,
    borderRadius: 5,
    backgroundColor: '#D88727',
    transform: [{ rotate: '-2deg' }],
  },
  toriiBeam: {
    position: 'absolute',
    top: 26,
    left: 12,
    width: 68,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D88727',
  },
  toriiPillarLeft: {
    position: 'absolute',
    top: 20,
    left: 23,
    width: 7,
    height: 58,
    borderRadius: 4,
    backgroundColor: '#D88727',
    transform: [{ rotate: '3deg' }],
  },
  toriiPillarRight: {
    position: 'absolute',
    top: 20,
    right: 23,
    width: 7,
    height: 58,
    borderRadius: 4,
    backgroundColor: '#D88727',
    transform: [{ rotate: '-3deg' }],
  },
  summitBack: {
    position: 'absolute',
    left: 17,
    bottom: 28,
    width: 92,
    height: 52,
    borderRadius: 46,
    backgroundColor: 'rgba(132,35,217,0.11)',
    transform: [{ rotate: '-10deg' }],
  },
  summitFront: {
    position: 'absolute',
    right: -3,
    bottom: 15,
    width: 96,
    height: 48,
    borderRadius: 48,
    backgroundColor: 'rgba(101,169,54,0.10)',
    transform: [{ rotate: '12deg' }],
  },
  summitSun: {
    position: 'absolute',
    right: 21,
    top: 17,
    width: 29,
    height: 29,
    borderRadius: 15,
    backgroundColor: 'rgba(216,135,39,0.18)',
  },
  stageTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  levelTag: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  levelTagText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },
  stageTitle: {
    color: '#432750',
    fontFamily: 'Jua',
    fontSize: 25,
    textAlign: 'center',
    marginTop: 11,
    zIndex: 2,
  },
  stageDescription: {
    color: '#827585',
    fontSize: 10,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 4,
    zIndex: 2,
  },
  stageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EEE7EF',
    marginTop: 13,
    paddingTop: 11,
    zIndex: 2,
  },
  momentCount: {
    color: '#8B7E8E',
    fontSize: 8,
    fontWeight: '700',
  },
  stageState: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.9,
  },
  mutedText: {
    color: '#A59CA7',
  },
  modalShade: {
    flex: 1,
    backgroundColor: 'rgba(42,23,51,0.66)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 22,
  },
  tutorialCard: {
    width: '100%',
    maxWidth: 430,
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
    padding: 25,
    alignItems: 'center',
  },
  tutorialIcon: {
    width: 66,
    height: 66,
    borderRadius: 22,
    backgroundColor: '#F0E4FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },
  tutorialKicker: {
    color: '#65A936',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  tutorialTitle: {
    color: '#432750',
    fontFamily: 'Jua',
    fontSize: 27,
    textAlign: 'center',
    marginTop: 4,
  },
  tutorialText: {
    color: '#7E7182',
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 8,
  },
  tutorialSteps: {
    width: '100%',
    gap: 8,
    borderRadius: 18,
    backgroundColor: '#F8F3FA',
    padding: 15,
    marginTop: 16,
  },
  tutorialButton: {
    width: '100%',
    height: 53,
    borderRadius: 17,
    backgroundColor: '#8423D9',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 17,
  },
  tutorialButtonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
});
