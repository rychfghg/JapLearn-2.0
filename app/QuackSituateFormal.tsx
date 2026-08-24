import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  ImageBackground,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import QuackSituateExit from '../components/QuackSituateExit';
import SmoothSprite from '../components/SmoothSprite';
import { POLITENESS_SCENARIOS } from '../data/politenessScenarios';
import expoconfig from '../expoconfig';

const scenes = [
  require('../assets/img/background/school a hallway st2 day.png'),
  require('../assets/img/background/classroom a st2 day.png'),
  require('../assets/img/background/clubroom a st2 day.png'),
  require('../assets/img/background/train_scene day.png'),
  require('../assets/img/background/student council room a st2 evening.png'),
];

const people = {
  male: {
    neutral: require('../assets/img/Sprite Male Dark Hair Neu01.png'),
    speaking: require('../assets/img/Sprite Male Dark Hair Smi02.png'),
    speakingAlt: require('../assets/img/Sprite Male Dark Hair Smi02.png'),
    blink: require('../assets/img/Sprite Male Dark Hair Ann01.png'),
    correct: require('../assets/img/Sprite Male Dark Hair Smi01.png'),
    wrong: require('../assets/img/Sprite Male Dark Hair Sad01.png'),
  },
  female: {
    neutral: require('../assets/img/Sumi_PoseB_WinterUni_Smile.png'),
    speaking: require('../assets/img/Sumi_PoseB_WinterUni_Open.png'),
    speakingAlt: require('../assets/img/Sumi_PoseB_WinterUni_EyesClosed_Open.png'),
    blink: require('../assets/img/Sumi_PoseB_WinterUni_EyesClosed_Smile.png'),
    correct: require('../assets/img/Sumi_PoseB_WinterUni_Smile_Blush.png'),
    wrong: require('../assets/img/Sumi_PoseB_WinterUni_Frown.png'),
  },
};

const npcRomaji = [
  'Ohayou gozaimasu.',
  'Kochira no hon desu ne.',
  'Dou shimashita ka.',
  'Fukuro wa goriyou desu ka.',
  'Tsugi no densha wa sanbansen desu.',
  'Repooto o misete kudasai.',
  'Kyou mo ganbarimashou.',
  'Nanmei-sama desu ka.',
  'Kore, douzo.',
  'Shoushou omachi kudasai.',
  'Ashita wa kuji ni kite kudasai.',
  'Kono basu wa eki ni ikimasu ka.',
  'Haitte mo ii desu ka.',
  'Hokenshou o onegaishimasu.',
  'Raishuu, mendan o shimashou.',
  'Onamae o onegai itashimasu.',
  'Kono shiryou o kakunin shite moraemasu ka.',
  'Oryouri wa ikaga desu ka.',
  'Kekka wa gojitsu gorenraku shimasu.',
  'Oheya made goannai itashimasu.',
  'Gohappyou, omoshirokatta desu.',
  'Yotei o henkou dekimasu ka.',
  'Nochihodo watashi no heya ni kite kudasai.',
  'Tanaka-sensei wa irasshaimasu ka.',
  'Goshitsumon wa arimasu ka.',
  'Jushou omedetou gozaimasu.',
  'Douzo, oagari kudasai.',
  'Nankai desu ka.',
  'Kochira de wa shashin o goenryo kudasai.',
  'Honjitsu no mensetsu wa ijou desu.',
];

const npcVoices = [
  require('../assets/audio/politeness/npc-01.mp3'),
  require('../assets/audio/politeness/npc-02.mp3'),
  require('../assets/audio/politeness/npc-03.mp3'),
  require('../assets/audio/politeness/npc-04.mp3'),
  require('../assets/audio/politeness/npc-05.mp3'),
  require('../assets/audio/politeness/npc-06.mp3'),
  require('../assets/audio/politeness/npc-07.mp3'),
  require('../assets/audio/politeness/npc-08.mp3'),
  require('../assets/audio/politeness/npc-09.mp3'),
  require('../assets/audio/politeness/npc-10.mp3'),
  require('../assets/audio/politeness/npc-11.mp3'),
  require('../assets/audio/politeness/npc-12.mp3'),
  require('../assets/audio/politeness/npc-13.mp3'),
  require('../assets/audio/politeness/npc-14.mp3'),
  require('../assets/audio/politeness/npc-15.mp3'),
  require('../assets/audio/politeness/npc-16.mp3'),
  require('../assets/audio/politeness/npc-17.mp3'),
  require('../assets/audio/politeness/npc-18.mp3'),
  require('../assets/audio/politeness/npc-19.mp3'),
  require('../assets/audio/politeness/npc-20.mp3'),
  require('../assets/audio/politeness/npc-21.mp3'),
  require('../assets/audio/politeness/npc-22.mp3'),
  require('../assets/audio/politeness/npc-23.mp3'),
  require('../assets/audio/politeness/npc-24.mp3'),
  require('../assets/audio/politeness/npc-25.mp3'),
  require('../assets/audio/politeness/npc-26.mp3'),
  require('../assets/audio/politeness/npc-27.mp3'),
  require('../assets/audio/politeness/npc-28.mp3'),
  require('../assets/audio/politeness/npc-29.mp3'),
  require('../assets/audio/politeness/npc-30.mp3'),
];

type StoryPhase = 'speaking' | 'choosing' | 'reaction';

export default function QuackSituateFormal() {
  const params = useLocalSearchParams<{
    level?: string;
    resumeIndex?: string;
    resumeScore?: string;
  }>();
  const level = Math.min(3, Math.max(1, Number(params.level) || 1)) as 1 | 2 | 3;
  const questions = useMemo(
    () => POLITENESS_SCENARIOS.filter((question) => question.level === level),
    [level],
  );

  const [index, setIndex] = useState(
    Math.min(
      Math.max(questions.length - 1, 0),
      Math.max(0, Number(params.resumeIndex) || 0),
    ),
  );
  const [score, setScore] = useState(
    Math.max(0, Number(params.resumeScore) || 0),
  );
  const [phase, setPhase] = useState<StoryPhase>('speaking');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showExit, setShowExit] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [npcFrame, setNpcFrame] = useState(0);
  const sound = useRef<Audio.Sound | null>(null);
  const fallbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const question = questions[index];
  const selectedChoice = selectedIndex === null ? null : question.choices[selectedIndex];
  const answeredCorrectly = selectedChoice?.correct === true;

  const stopSound = async () => {
    if (fallbackTimer.current) {
      clearTimeout(fallbackTimer.current);
      fallbackTimer.current = null;
    }

    if (!sound.current) return;

    try {
      await sound.current.stopAsync();
      await sound.current.unloadAsync();
    } catch {}

    sound.current = null;
  };

  const revealChoices = () => {
    setPhase((current) => current === 'speaking' ? 'choosing' : current);
  };

  const playNpc = async () => {
    await stopSound();
    setPhase('speaking');
    setNpcFrame(0);

    const speechStartedAt = Date.now();
    const minimumSpeakingTime = question.gender === 'female'
      ? 2400
      : 1800;

    const finishSpeaking = () => {
      const elapsed = Date.now() - speechStartedAt;
      const remaining = Math.max(0, minimumSpeakingTime - elapsed);

      if (fallbackTimer.current) {
        clearTimeout(fallbackTimer.current);
      }

      fallbackTimer.current = setTimeout(revealChoices, remaining);
    };

    fallbackTimer.current = setTimeout(revealChoices, 4200);

    try {
      const loaded = await Audio.Sound.createAsync(
        npcVoices[question.id - 1],
        {
          shouldPlay: true,
          volume: 1,
        },
        (status) => {
          if (status.isLoaded && status.didJustFinish) {
            finishSpeaking();
          }
        },
      );

      sound.current = loaded.sound;
    } catch {
      finishSpeaking();
    }
  };

  useEffect(() => {
    void playNpc();

    return () => {
      void stopSound();
    };
  }, [index]);

  useEffect(() => {
    setNpcFrame(0);

    if (phase === 'speaking') {
      const speakingTimer = setInterval(() => {
        setNpcFrame((current) => (current + 1) % 4);
      }, 280);

      return () => clearInterval(speakingTimer);
    }

    if (phase === 'choosing') {
      let blinkCloseTimer: ReturnType<typeof setTimeout> | null = null;
      const blinkTimer = setInterval(() => {
        setNpcFrame(1);
        blinkCloseTimer = setTimeout(() => setNpcFrame(0), 140);
      }, 2400);

      return () => {
        clearInterval(blinkTimer);
        if (blinkCloseTimer) clearTimeout(blinkCloseTimer);
      };
    }
  }, [phase, index, question.gender]);

  const selectResponse = async (choiceIndex: number) => {
    if (phase !== 'choosing') return;

    await stopSound();
    setSelectedIndex(choiceIndex);
    setPhase('reaction');

    const correct = question.choices[choiceIndex].correct;

    if (correct) {
      setScore((current) => current + 1);
    }

    try {
      const loaded = await Audio.Sound.createAsync(
        correct
          ? require('../assets/audio/sfx/correct_sfx.mp3')
          : require('../assets/audio/sfx/incorrect_sfx.mp3'),
        {
          shouldPlay: true,
        },
      );

      sound.current = loaded.sound;
    } catch {}
  };

  const saveAttempt = async (
    finalScore: number,
    completed: boolean,
    resumeIndex: number,
  ) => {
    try {
      const storedUser = JSON.parse((await AsyncStorage.getItem('user')) || '{}');

      await fetch(`${expoconfig.API_URL}/api/situational/attempts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: storedUser.email,
          name: `${storedUser.fname || ''} ${storedUser.lname || ''}`.trim(),
          gameType: 'POLITENESS',
          difficulty: ['', 'EASY', 'MEDIUM', 'HARD'][level],
          score: finalScore * 10,
          totalQuestions: questions.length,
          correctAnswers: finalScore,
          completed,
          level,
          setNumber: resumeIndex,
          topic: questions[0]?.location || 'Politeness and social tone',
        }),
      });
    } catch {}
  };

  const continueStory = async () => {
    await stopSound();

    if (index < questions.length - 1) {
      setSelectedIndex(null);
      setPhase('speaking');
      setIndex((current) => current + 1);
      return;
    }

    await saveAttempt(score, true, questions.length);
    setShowComplete(true);
  };

  const leaveGame = async (saveResume = true) => {
    await stopSound();

    if (saveResume && !showComplete) {
      await saveAttempt(score, false, index);
    }

    setShowExit(false);
    setShowComplete(false);
    setLeaving(true);
  };

  const characterMood = phase === 'reaction'
    ? answeredCorrectly
      ? 'correct'
      : 'wrong'
    : phase === 'speaking'
      ? 'speaking'
      : 'neutral';

  const activeCharacterFrame = phase === 'speaking'
    ? npcFrame === 1
      ? 'speaking'
      : npcFrame === 3
        ? 'speakingAlt'
        : 'neutral'
    : phase === 'choosing' && npcFrame === 1
      ? 'blink'
      : characterMood;

  const characterFrames = [
    'neutral',
    'speaking',
    'speakingAlt',
    'blink',
    'correct',
    'wrong',
  ] as const;

  const reactionTitle = answeredCorrectly
    ? 'That response feels respectful.'
    : 'That tone feels uncomfortable here.';

  const reactionText = answeredCorrectly
    ? question.explanation
    : `That answer sounds ${selectedChoice?.tone.toLowerCase()}. ${question.explanation}`;

  if (leaving) {
    return (
      <QuackSituateExit
        color="#8423D9"
        icon="people-outline"
        title="Politeness practice closed"
        subtitle="Your tone journey is ready whenever you want to continue."
        status="CLOSING THE TONE QUEST"
        onComplete={() => router.replace('/QuackSituateFormalLevels')}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={scenes[index % scenes.length]}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.backgroundShade} />

        <View style={styles.topBar}>
          <Pressable style={styles.topButton} onPress={() => setShowExit(true)}>
            <Ionicons name="arrow-back" size={24} color="#432750" />
          </Pressable>

          <View style={styles.progressBlock}>
            <Text style={styles.progressLabel}>TONE QUEST · LEVEL {level}</Text>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${((index + 1) / questions.length) * 100}%`,
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.counter}>
            <Text style={styles.counterText}>{index + 1}/{questions.length}</Text>
          </View>
        </View>

        <View style={styles.promptCard}>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={14} color="#65A936" />
            <Text style={styles.locationText}>{question.location}</Text>
          </View>
          <Text style={styles.promptLabel}>YOUR ROLE IN THIS MOMENT</Text>
          <Text style={styles.promptText}>{question.prompt}</Text>
        </View>

        <View style={styles.characterGround} />
        <View pointerEvents="none" style={styles.characterStage}>
          <SmoothSprite
            frames={characterFrames.map((frame) => people[question.gender][frame])}
            activeIndex={characterFrames.indexOf(activeCharacterFrame)}
            style={styles.characterFrame}
            resizeMode="contain"
            transitionDuration={75}
          />
        </View>

        <View style={styles.storyPanel}>
          <View style={styles.speakerRow}>
            <View>
              <Text style={styles.speakerLabel}>{question.speaker}</Text>
              <Text style={styles.speakerStatus}>
                {phase === 'speaking'
                  ? 'SPEAKING'
                  : phase === 'choosing'
                    ? 'WAITING FOR YOUR RESPONSE'
                    : 'REACTING TO YOUR TONE'}
              </Text>
            </View>
            <Pressable style={styles.voiceButton} onPress={playNpc}>
              <Ionicons name="volume-high" size={20} color="#8423D9" />
            </Pressable>
          </View>

          {phase !== 'reaction' ? (
            <>
              <Text style={styles.npcJapanese}>{question.npcLine}</Text>
              <Text style={styles.npcRomaji}>{npcRomaji[question.id - 1]}</Text>
              <Text style={styles.translation}>{question.translation}</Text>
            </>
          ) : (
            <View style={styles.reactionCopy}>
              <Text
                style={[
                  styles.reactionTitle,
                  !answeredCorrectly && styles.reactionTitleWrong,
                ]}
              >
                {reactionTitle}
              </Text>
              <Text style={styles.reactionText}>{reactionText}</Text>
              {!answeredCorrectly && (
                <View style={styles.betterAnswer}>
                  <Text style={styles.betterAnswerLabel}>A BETTER RESPONSE</Text>
                  <Text style={styles.betterAnswerJapanese}>
                    {question.choices.find((choice) => choice.correct)?.jp}
                  </Text>
                  <Text style={styles.betterAnswerRomaji}>
                    {question.choices.find((choice) => choice.correct)?.romaji}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {phase === 'speaking' && (
          <View style={styles.listeningPill}>
            <View style={styles.listeningDot} />
            <Text style={styles.listeningText}>Listen to the speaker first...</Text>
          </View>
        )}

        {phase === 'choosing' && (
          <View style={styles.choiceDrawer}>
            <View style={styles.drawerHandle} />
            <View style={styles.choiceHeadingRow}>
              <View>
                <Text style={styles.choiceKicker}>CHOOSE YOUR RESPONSE</Text>
                <Text style={styles.choiceTitle}>What would you say?</Text>
              </View>
              <Pressable
                style={styles.hintButton}
                onPress={() => setShowHint(true)}
              >
                <Ionicons name="bulb-outline" size={21} color="#D88727" />
              </Pressable>
            </View>

            <ScrollView
              style={styles.choiceScroll}
              contentContainerStyle={styles.choiceList}
              showsVerticalScrollIndicator={false}
            >
              {question.choices.map((choice, choiceIndex) => (
                <Pressable
                  key={`${question.id}-${choice.jp}`}
                  style={({ pressed }) => [
                    styles.choiceButton,
                    pressed && styles.choiceButtonPressed,
                  ]}
                  onPress={() => void selectResponse(choiceIndex)}
                >
                  <View style={styles.choiceLetter}>
                    <Text style={styles.choiceLetterText}>
                      {String.fromCharCode(65 + choiceIndex)}
                    </Text>
                  </View>
                  <View style={styles.choiceCopy}>
                    <Text style={styles.choiceJapanese}>{choice.jp}</Text>
                    <Text style={styles.choiceRomaji}>{choice.romaji}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={19} color="#9B8CA0" />
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {phase === 'reaction' && (
          <Pressable style={styles.continueButton} onPress={() => void continueStory()}>
            <Text style={styles.continueText}>
              {index === questions.length - 1 ? 'FINISH THIS LEVEL' : 'CONTINUE THE STORY'}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </Pressable>
        )}
      </ImageBackground>

      <Modal visible={showComplete} transparent animationType="fade">
        <View style={styles.modalShade}>
          <View style={styles.modalCard}>
            <View style={styles.trophyIcon}>
              <Ionicons name="ribbon" size={38} color="#FFFFFF" />
            </View>
            <Text style={styles.modalKicker}>LEVEL {level} COMPLETE</Text>
            <Text style={styles.modalTitle}>Courtesy story cleared</Text>
            <Text style={styles.finalScore}>{score}/{questions.length}</Text>
            <Text style={styles.modalText}>
              Your tone choices were saved to communication progress.
            </Text>
            <Pressable style={styles.modalPrimary} onPress={() => void leaveGame(false)}>
              <Text style={styles.modalPrimaryText}>RETURN TO TONE TRAILS</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showExit}
        transparent
        animationType="fade"
        onRequestClose={() => setShowExit(false)}
      >
        <View style={styles.modalShade}>
          <View style={styles.modalCard}>
            <View style={styles.exitIcon}>
              <Ionicons name="flag-outline" size={31} color="#8423D9" />
            </View>
            <Text style={styles.modalKicker}>LEAVE THIS STORY?</Text>
            <Text style={styles.modalTitle}>End the current tone quest?</Text>
            <Text style={styles.modalText}>
              This unfinished level will not be submitted as a completed score.
            </Text>
            <Pressable style={styles.modalPrimary} onPress={() => setShowExit(false)}>
              <Text style={styles.modalPrimaryText}>CONTINUE THE STORY</Text>
            </Pressable>
            <Pressable style={styles.modalSecondary} onPress={() => void leaveGame()}>
              <Text style={styles.modalSecondaryText}>Exit this level</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showHint}
        transparent
        animationType="fade"
        onRequestClose={() => setShowHint(false)}
      >
        <View style={styles.modalShade}>
          <View style={styles.hintModalCard}>
            <View style={styles.hintModalIcon}>
              <Ionicons name="bulb-outline" size={31} color="#D88727" />
            </View>
            <Text style={styles.modalKicker}>TONE HINT</Text>
            <Text style={styles.modalTitle}>Notice the relationship</Text>
            <Text style={styles.modalText}>{question.hint}</Text>
            <Pressable style={styles.modalPrimary} onPress={() => setShowHint(false)}>
              <Text style={styles.modalPrimaryText}>BACK TO THE STORY</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#24142D',
  },
  background: {
    flex: 1,
  },
  backgroundShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(30, 16, 37, 0.20)',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingHorizontal: 17,
    paddingTop: 12,
  },
  topButton: {
    width: 50,
    height: 50,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.96)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBlock: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.94)',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  progressLabel: {
    color: '#65A936',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  progressTrack: {
    height: 6,
    borderRadius: 6,
    backgroundColor: '#E7DFE9',
    overflow: 'hidden',
    marginTop: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
    backgroundColor: '#8423D9',
  },
  counter: {
    minWidth: 50,
    height: 50,
    borderRadius: 18,
    backgroundColor: '#8423D9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterText: {
    color: '#FFFFFF',
    fontFamily: 'Jua',
    fontSize: 14,
  },
  promptCard: {
    marginHorizontal: 17,
    marginTop: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(55, 31, 67, 0.94)',
    paddingHorizontal: 16,
    paddingVertical: 13,
    zIndex: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  locationText: {
    color: '#D7F1C4',
    fontSize: 9,
    fontWeight: '800',
  },
  promptLabel: {
    color: '#B6E697',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginTop: 7,
  },
  promptText: {
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 3,
  },
  characterStage: {
    position: 'absolute',
    left: '8%',
    right: '8%',
    bottom: 146,
    width: '84%',
    height: '61%',
  },
  characterFrame: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  characterGround: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 151,
    width: '48%',
    height: 28,
    borderRadius: 999,
    backgroundColor: 'rgba(48, 28, 58, 0.22)',
    transform: [{ scaleY: 0.45 }],
  },
  storyPanel: {
    position: 'absolute',
    left: 17,
    right: 17,
    bottom: 24,
    minHeight: 132,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.75)',
    padding: 16,
    shadowColor: '#27142F',
    shadowOpacity: 0.24,
    shadowRadius: 18,
    elevation: 8,
  },
  speakerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  speakerLabel: {
    color: '#432750',
    fontFamily: 'Jua',
    fontSize: 17,
  },
  speakerStatus: {
    color: '#65A936',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1.1,
    marginTop: 1,
  },
  voiceButton: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: '#F1E5FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  npcJapanese: {
    color: '#3F2649',
    fontSize: 22,
    marginTop: 10,
  },
  npcRomaji: {
    color: '#8423D9',
    fontSize: 11,
    marginTop: 3,
  },
  translation: {
    color: '#8A7C8D',
    fontSize: 10,
    marginTop: 2,
  },
  listeningPill: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 172,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(42,24,51,0.88)',
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  listeningDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#76CC46',
  },
  listeningText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  choiceDrawer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '54%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: '#FBF8FC',
    paddingHorizontal: 17,
    paddingTop: 9,
    paddingBottom: 18,
    shadowColor: '#281531',
    shadowOpacity: 0.24,
    shadowRadius: 22,
    elevation: 12,
  },
  drawerHandle: {
    alignSelf: 'center',
    width: 42,
    height: 5,
    borderRadius: 5,
    backgroundColor: '#D8CFDA',
  },
  choiceHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 10,
    marginTop: 10,
  },
  choiceKicker: {
    color: '#65A936',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  choiceTitle: {
    color: '#432750',
    fontFamily: 'Jua',
    fontSize: 22,
  },
  hintButton: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: '#FFF3DD',
    borderWidth: 1,
    borderColor: '#F0D29A',
  },
  choiceScroll: {
    marginTop: 10,
  },
  choiceList: {
    gap: 8,
    paddingBottom: 4,
  },
  choiceButton: {
    minHeight: 66,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5D8E9',
    paddingHorizontal: 11,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
  },
  choiceButtonPressed: {
    borderColor: '#8423D9',
    backgroundColor: '#F7EFFD',
    transform: [{ scale: 0.99 }],
  },
  choiceLetter: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#F0E3F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  choiceLetterText: {
    color: '#77408A',
    fontFamily: 'Jua',
    fontSize: 16,
  },
  choiceCopy: {
    flex: 1,
  },
  choiceJapanese: {
    color: '#40254A',
    fontSize: 16,
  },
  choiceRomaji: {
    color: '#8C7D90',
    fontSize: 10,
    marginTop: 2,
  },
  reactionCopy: {
    marginTop: 10,
  },
  reactionTitle: {
    color: '#55A42C',
    fontFamily: 'Jua',
    fontSize: 20,
  },
  reactionTitleWrong: {
    color: '#D65570',
  },
  reactionText: {
    color: '#776979',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
  },
  betterAnswer: {
    borderRadius: 14,
    backgroundColor: '#F1F8EC',
    paddingHorizontal: 11,
    paddingVertical: 8,
    marginTop: 8,
  },
  betterAnswerLabel: {
    color: '#65A936',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1,
  },
  betterAnswerJapanese: {
    color: '#40254A',
    fontSize: 15,
    marginTop: 2,
  },
  betterAnswerRomaji: {
    color: '#847688',
    fontSize: 9,
  },
  continueButton: {
    position: 'absolute',
    right: 17,
    bottom: 174,
    height: 51,
    borderRadius: 17,
    backgroundColor: '#8423D9',
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#32183D',
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 6,
  },
  continueText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.7,
  },
  modalShade: {
    flex: 1,
    backgroundColor: 'rgba(37,20,45,0.68)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 22,
  },
  modalCard: {
    width: '100%',
    maxWidth: 430,
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
    padding: 25,
    alignItems: 'center',
  },
  hintModalCard: {
    width: '100%',
    maxWidth: 410,
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
    padding: 25,
    alignItems: 'center',
  },
  hintModalIcon: {
    width: 66,
    height: 66,
    borderRadius: 22,
    backgroundColor: '#FFF3DD',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },
  trophyIcon: {
    width: 70,
    height: 70,
    borderRadius: 23,
    backgroundColor: '#65A936',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  exitIcon: {
    width: 64,
    height: 64,
    borderRadius: 21,
    backgroundColor: '#F0E4FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modalKicker: {
    color: '#65A936',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  modalTitle: {
    color: '#432750',
    fontFamily: 'Jua',
    fontSize: 27,
    textAlign: 'center',
    marginTop: 5,
  },
  finalScore: {
    color: '#8423D9',
    fontFamily: 'Jua',
    fontSize: 48,
    marginTop: 8,
  },
  modalText: {
    color: '#7E7182',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 8,
  },
  modalPrimary: {
    width: '100%',
    height: 54,
    borderRadius: 17,
    backgroundColor: '#8423D9',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 19,
  },
  modalPrimaryText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.7,
  },
  modalSecondary: {
    width: '100%',
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 7,
  },
  modalSecondaryText: {
    color: '#6D5774',
    fontSize: 11,
    fontWeight: '800',
  },
});
