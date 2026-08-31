import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  Modal,
  PanResponder,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import QuackSituateExit from '../components/QuackSituateExit';
import expoconfig from '../expoconfig';
import { loadBundledSound } from '../utils/nativeAudio';

type Choice = {
  japanese: string;
  romaji: string;
};

type Moment = {
  id: string;
  level: number;
  setNumber: number;
  topic: string;
  location: string;
  sceneKey: string;
  imageUrl?: string;
  imageAlt?: string;
  audioUrl?: string;
  scenario: string;
  hint: string;
  correctAnswer: string;
  explanation: string;
  choices: Choice[];
};

type TargetPosition = 'top' | 'bottom';

const fallbackGestures = [
  require('../assets/quacksituate/gestures/gesture-wave.png'),
  require('../assets/quacksituate/gestures/gesture-bow.png'),
];

const mediaUrl = (url?: string) => {
  if (!url) return '';
  return url.startsWith('http') ? url : `${expoconfig.API_URL}${url}`;
};

const getAnswer = (moment: Moment): Choice => {
  return moment.choices?.find(choice => choice.japanese === moment.correctAnswer) || {
    japanese: moment.correctAnswer,
    romaji: moment.correctAnswer,
  };
};

function DraggablePhrase({
  label,
  disabled,
  onDrop,
}: {
  label: string;
  disabled: boolean;
  onDrop: (position: TargetPosition) => void;
}) {
  const position = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(1)).current;

  const reset = useCallback(() => {
    Animated.parallel([
      Animated.spring(position, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
  }, [position, scale]);

  const responder = useMemo(() => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: (_, gesture) => {
        return !disabled && Math.abs(gesture.dy) > 4;
      },
      onPanResponderGrant: () => {
        Animated.spring(scale, {
          toValue: 1.08,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderMove: Animated.event(
        [null, { dx: position.x, dy: position.y }],
        { useNativeDriver: false },
      ),
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy < -70) {
          onDrop('top');
        } else if (gesture.dy > 70) {
          onDrop('bottom');
        }

        reset();
      },
      onPanResponderTerminate: reset,
    });
  }, [disabled, onDrop, position, reset, scale]);

  return (
    <Animated.View
      {...responder.panHandlers}
      style={[
        styles.draggablePhrase,
        {
          transform: [
            { translateX: position.x },
            { translateY: position.y },
            { scale },
          ],
        },
      ]}
    >
      <Text style={styles.draggableText}>{label}</Text>
      <Ionicons name="apps" size={16} color="#E2D8FF" />
    </Animated.View>
  );
}

export default function QuackSituateMatching() {
  const params = useLocalSearchParams<{ level?: string; set?: string }>();
  const level = Math.min(3, Math.max(1, Number(params.level) || 1));
  const setNumber = Math.max(1, Number(params.set) || 1);

  const [moments, setMoments] = useState<Moment[]>([]);
  const [momentIndex, setMomentIndex] = useState(0);
  const [correctPosition, setCorrectPosition] = useState<TargetPosition>('top');
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [wrongMoments, setWrongMoments] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showExit, setShowExit] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const music = useRef<Audio.Sound | null>(null);
  const momentAudio = useRef<Audio.Sound | null>(null);
  const correctSound = useRef<Audio.Sound | null>(null);
  const incorrectSound = useRef<Audio.Sound | null>(null);

  const current = moments[momentIndex];
  const distractor = moments.length > 1
    ? moments[(momentIndex + 1) % moments.length]
    : current;
  const currentAnswer = current ? getAnswer(current) : null;
  const distractorAnswer = distractor ? getAnswer(distractor) : null;
  const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
  const score = Math.max(0, moments.length * 20 - mistakes * 5);

  const stopAudio = useCallback(async (unload = false) => {
    const sounds = [
      music.current,
      momentAudio.current,
      correctSound.current,
      incorrectSound.current,
    ];

    await Promise.all(
      sounds.map(async sound => {
        if (!sound) return;

        try {
          await sound.stopAsync();
          if (unload) await sound.unloadAsync();
        } catch {}
      }),
    );

    if (unload) {
      music.current = null;
      momentAudio.current = null;
      correctSound.current = null;
      incorrectSound.current = null;
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      return () => {
        void stopAudio(true);
      };
    }, [stopAudio]),
  );

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const response = await fetch(
          `${expoconfig.API_URL}/api/situational/questions?gameType=EXPRESSION_MATCH`,
        );

        if (!response.ok) {
          throw new Error('Expression Match could not load.');
        }

        const all: Moment[] = await response.json();
        const selected = all
          .filter(item => item.level === level && item.setNumber === setNumber)
          .slice(0, 5);

        if (active) {
          setMoments(selected);
        }

        const loaded = await Promise.all([
          loadBundledSound(
            require('../assets/audio/sfx/quiz.mp3'),
            {
              isLooping: true,
              volume: 0.08,
              shouldPlay: true,
            },
          ),
          loadBundledSound(require('../assets/audio/sfx/correct_sfx.mp3')),
          loadBundledSound(require('../assets/audio/sfx/incorrect_sfx.mp3')),
        ]);

        music.current = loaded[0].sound;
        correctSound.current = loaded[1].sound;
        incorrectSound.current = loaded[2].sound;
      } catch {
        if (active) {
          setMoments([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
      void stopAudio(true);
    };
  }, [level, setNumber, stopAudio]);

  useEffect(() => {
    setCorrectPosition(Math.random() > 0.5 ? 'top' : 'bottom');
    setShowHint(false);
    setLocked(false);
  }, [current?.id]);

  const playMomentAudio = async () => {
    if (!current?.audioUrl) return;

    try {
      await momentAudio.current?.unloadAsync();
      const loaded = await Audio.Sound.createAsync(
        { uri: mediaUrl(current.audioUrl) },
        {
          shouldPlay: true,
          volume: 1,
        },
      );

      momentAudio.current = loaded.sound;
    } catch {}
  };

  const choose = useCallback(async (position: TargetPosition) => {
    if (!current || locked) return;

    setLocked(true);

    if (position === correctPosition) {
      setFeedback('correct');
      await correctSound.current?.replayAsync();
      return;
    }

    setMistakes(value => value + 1);
    setWrongMoments(items => {
      return items.includes(current.id) ? items : [...items, current.id];
    });
    setFeedback('incorrect');
    await incorrectSound.current?.replayAsync();
  }, [correctPosition, current, locked]);

  const continueAfterFeedback = () => {
    const isCorrect = feedback === 'correct';
    setFeedback(null);

    if (!isCorrect) {
      setLocked(false);
      return;
    }

    if (momentIndex + 1 >= moments.length) {
      setShowResult(true);
      return;
    }

    setMomentIndex(index => index + 1);
  };

  const saveAndLeave = async () => {
    setSaving(true);

    try {
      const stored = await AsyncStorage.getItem('user');
      const user = stored ? JSON.parse(stored) : {};

      await fetch(`${expoconfig.API_URL}/api/situational/attempts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          name: [user.fname, user.lname].filter(Boolean).join(' '),
          gameType: 'EXPRESSION_MATCH',
          difficulty: level === 3 ? 'HARD' : level === 2 ? 'INTERMEDIATE' : 'STARTER',
          level,
          setNumber,
          topic: moments[0]?.topic,
          score,
          totalQuestions: moments.length,
          correctAnswers: Math.max(0, moments.length - wrongMoments.length),
          completed: true,
        }),
      });

      await stopAudio(true);
      setIsExiting(true);
    } finally {
      setSaving(false);
    }
  };

  const confirmExit = async () => {
    await stopAudio(true);
    setShowExit(false);
    setIsExiting(true);
  };

  if (isExiting) {
    return (
      <QuackSituateExit
        color="#7652E8"
        icon="hand-left-outline"
        title="Expression Match saved"
        subtitle="Your latest gesture result is ready in QuackProgress."
        status="RETURNING TO CHALLENGES"
        onComplete={() => router.replace('/QuackSituateMatchingLevels')}
      />
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator size="large" color="#7652E8" />
        <Text style={styles.loadingText}>Preparing gesture pairs…</Text>
      </SafeAreaView>
    );
  }

  if (!current || !distractor || !currentAnswer || !distractorAnswer) {
    return (
      <SafeAreaView style={styles.loading}>
        <Ionicons name="images-outline" size={38} color="#7652E8" />
        <Text style={styles.emptyTitle}>This challenge is being prepared</Text>
        <Text style={styles.emptyText}>
          Publish at least two Expression Match moments for this difficulty in Admin.
        </Text>
        <Pressable
          style={styles.primaryButton}
          onPress={() => router.replace('/QuackSituateMatchingLevels')}
        >
          <Text style={styles.primaryButtonText}>RETURN TO CHALLENGES</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const correctImage = current.imageUrl
    ? { uri: mediaUrl(current.imageUrl) }
    : fallbackGestures[momentIndex % fallbackGestures.length];
  const distractorImage = distractor.imageUrl
    ? { uri: mediaUrl(distractor.imageUrl) }
    : fallbackGestures[(momentIndex + 1) % fallbackGestures.length];
  const topTarget = correctPosition === 'top'
    ? { image: correctImage, answer: currentAnswer }
    : { image: distractorImage, answer: distractorAnswer };
  const bottomTarget = correctPosition === 'bottom'
    ? { image: correctImage, answer: currentAnswer }
    : { image: distractorImage, answer: distractorAnswer };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.stage}>
        <View style={styles.topBar}>
          <Pressable style={styles.roundButton} onPress={() => setShowExit(true)}>
            <Ionicons name="pause" size={22} color="#FFFFFF" />
          </Pressable>

          <View style={styles.progressArea}>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${((momentIndex + 1) / moments.length) * 100}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {momentIndex + 1}/{moments.length}
            </Text>
          </View>

          <View style={styles.stars}>
            {[1, 2, 3].map(star => (
              <Ionicons
                key={star}
                name={star <= stars ? 'star' : 'star-outline'}
                size={20}
                color={star <= stars ? '#FFD65A' : '#9781D8'}
              />
            ))}
          </View>
        </View>

        <View style={styles.instructionArea}>
          <Text style={styles.kicker}>
            {level === 1 ? 'EASY' : level === 2 ? 'MEDIUM' : 'HARD'} · {current.location || current.topic}
          </Text>
          <Text style={styles.instruction}>
            Move the phrase to the correct gesture
          </Text>
        </View>

        <View style={styles.targetCard}>
          <Image source={topTarget.image} style={styles.targetImage} resizeMode="cover" />
          <View style={styles.imageShade} />
          <View style={styles.targetLabel}>
            <Text style={styles.targetJapanese}>{topTarget.answer.japanese}</Text>
          </View>
        </View>

        <View style={styles.dragZone}>
          <DraggablePhrase
            key={current.id}
            label={currentAnswer.romaji}
            disabled={locked}
            onDrop={choose}
          />

          <Pressable
            disabled={!current.audioUrl}
            style={[
              styles.audioButton,
              !current.audioUrl && styles.audioButtonDisabled,
            ]}
            onPress={playMomentAudio}
          >
            <Ionicons
              name={current.audioUrl ? 'volume-high' : 'volume-mute'}
              size={23}
              color="#FFFFFF"
            />
          </Pressable>
        </View>

        <View style={styles.targetCard}>
          <Image source={bottomTarget.image} style={styles.targetImage} resizeMode="cover" />
          <View style={styles.imageShade} />
          <View style={styles.targetLabel}>
            <Text style={styles.targetJapanese}>{bottomTarget.answer.japanese}</Text>
          </View>
        </View>

        <View style={styles.footerControls}>
          <Pressable
            style={styles.hintButton}
            onPress={() => setShowHint(value => !value)}
          >
            <Ionicons name="bulb-outline" size={19} color="#7652E8" />
            <Text style={styles.hintButtonText}>Hint</Text>
          </Pressable>

          <Text style={styles.dragInstruction}>DRAG UP OR DOWN</Text>

          <Pressable style={styles.helpButton} onPress={() => setShowHelp(true)}>
            <Ionicons name="information-circle-outline" size={22} color="#7652E8" />
          </Pressable>
        </View>

        {showHint ? (
          <View style={styles.hintCard}>
            <Text style={styles.hintText}>{current.hint}</Text>
          </View>
        ) : null}
      </View>

      <Modal visible={feedback !== null} transparent animationType="fade">
        <View style={styles.modalShade}>
          <View style={styles.feedbackCard}>
            <View
              style={[
                styles.feedbackIcon,
                feedback === 'correct' ? styles.correctIcon : styles.incorrectIcon,
              ]}
            >
              <Ionicons
                name={feedback === 'correct' ? 'checkmark' : 'refresh'}
                size={31}
                color="#FFFFFF"
              />
            </View>
            <Text style={styles.feedbackKicker}>
              {feedback === 'correct' ? 'GESTURE MATCHED' : 'LOOK AGAIN'}
            </Text>
            <Text style={styles.feedbackTitle}>
              {feedback === 'correct' ? current.correctAnswer : 'That gesture expresses another phrase.'}
            </Text>
            <Text style={styles.feedbackText}>{current.explanation}</Text>
            <Pressable style={styles.primaryButton} onPress={continueAfterFeedback}>
              <Text style={styles.primaryButtonText}>
                {feedback === 'correct' ? 'NEXT GESTURE' : 'TRY AGAIN'}
              </Text>
              <Ionicons name="arrow-forward" size={19} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={showHelp} transparent animationType="fade">
        <View style={styles.modalShade}>
          <View style={styles.feedbackCard}>
            <View style={styles.feedbackIcon}>
              <Ionicons name="hand-left-outline" size={29} color="#FFFFFF" />
            </View>
            <Text style={styles.feedbackKicker}>HOW TO PLAY</Text>
            <Text style={styles.feedbackTitle}>One phrase. Two gestures.</Text>
            <Text style={styles.feedbackText}>
              Listen to the Japanese audio, then drag the single phrase tile upward or downward to its matching gesture. Images and audio published in Admin are used automatically.
            </Text>
            <Pressable style={styles.primaryButton} onPress={() => setShowHelp(false)}>
              <Text style={styles.primaryButtonText}>CONTINUE</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={showResult} transparent animationType="fade">
        <View style={styles.modalShade}>
          <View style={styles.feedbackCard}>
            <View style={[styles.feedbackIcon, styles.correctIcon]}>
              <Ionicons name="trophy" size={30} color="#FFFFFF" />
            </View>
            <Text style={styles.feedbackKicker}>EXPRESSION MATCH COMPLETE</Text>
            <Text style={styles.feedbackTitle}>{score} points</Text>
            <View style={styles.resultStars}>
              {[1, 2, 3].map(star => (
                <Ionicons
                  key={star}
                  name={star <= stars ? 'star' : 'star-outline'}
                  size={31}
                  color="#F4B52E"
                />
              ))}
            </View>
            <Text style={styles.feedbackText}>
              {moments.length - wrongMoments.length} of {moments.length} gestures matched without a retry. This result updates QuackProgress and teacher reports.
            </Text>
            <Pressable
              disabled={saving}
              style={styles.primaryButton}
              onPress={saveAndLeave}
            >
              <Text style={styles.primaryButtonText}>
                {saving ? 'SAVING…' : 'SAVE & RETURN'}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={showExit} transparent animationType="fade">
        <View style={styles.modalShade}>
          <View style={styles.feedbackCard}>
            <View style={styles.feedbackIcon}>
              <Ionicons name="pause" size={29} color="#FFFFFF" />
            </View>
            <Text style={styles.feedbackKicker}>LEAVE THIS CHALLENGE?</Text>
            <Text style={styles.feedbackTitle}>Pause Expression Match</Text>
            <Text style={styles.feedbackText}>
              This unfinished challenge will not be recorded. You can return and start it again anytime.
            </Text>
            <View style={styles.exitRow}>
              <Pressable
                style={styles.secondaryButton}
                onPress={() => setShowExit(false)}
              >
                <Text style={styles.secondaryButtonText}>KEEP PLAYING</Text>
              </Pressable>
              <Pressable style={styles.primaryButtonSmall} onPress={confirmExit}>
                <Text style={styles.primaryButtonText}>LEAVE</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#2D176C' },
  stage: { flex: 1, backgroundColor: '#4C28C8', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 28, backgroundColor: '#F8F4FF' },
  loadingText: { fontFamily: 'Jua', fontSize: 17, color: '#4A2A58' },
  emptyTitle: { fontFamily: 'Jua', fontSize: 25, color: '#432750', textAlign: 'center' },
  emptyText: { fontSize: 14, lineHeight: 21, color: '#7B6D82', textAlign: 'center', maxWidth: 380 },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 50 },
  roundButton: { width: 46, height: 46, borderRadius: 17, backgroundColor: 'rgba(42,21,103,.72)', alignItems: 'center', justifyContent: 'center' },
  progressArea: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressTrack: { flex: 1, height: 7, borderRadius: 7, backgroundColor: 'rgba(255,255,255,.22)', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 7, backgroundColor: '#FFD65A' },
  progressText: { fontFamily: 'Jua', fontSize: 12, color: '#FFFFFF' },
  stars: { flexDirection: 'row', gap: 1 },
  instructionArea: { alignItems: 'center', marginTop: 5, marginBottom: 7 },
  kicker: { fontSize: 9, fontWeight: '900', letterSpacing: 1.2, color: '#D9CFFF' },
  instruction: { fontFamily: 'Jua', fontSize: 18, color: '#FFFFFF', textAlign: 'center', marginTop: 2 },
  targetCard: { flex: 1, minHeight: 155, maxHeight: 245, borderRadius: 26, overflow: 'hidden', borderWidth: 1.5, borderColor: 'rgba(255,255,255,.38)', backgroundColor: '#32196F', shadowColor: '#170B41', shadowOpacity: 0.28, shadowRadius: 13, elevation: 6 },
  targetImage: { width: '100%', height: '100%' },
  imageShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(43,20,90,.08)' },
  targetLabel: { position: 'absolute', alignSelf: 'center', bottom: 9, minWidth: 100, maxWidth: '86%', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 14, backgroundColor: 'rgba(56,29,124,.88)', borderWidth: 1, borderColor: 'rgba(255,255,255,.25)' },
  targetJapanese: { fontFamily: 'Jua', fontSize: 16, color: '#FFFFFF', textAlign: 'center' },
  dragZone: { minHeight: 74, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 13, zIndex: 10 },
  draggablePhrase: { minWidth: 145, maxWidth: '70%', minHeight: 48, paddingHorizontal: 18, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,.32)', backgroundColor: '#6C45D8', flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', shadowColor: '#180C40', shadowOpacity: 0.35, shadowRadius: 10, elevation: 8 },
  draggableText: { flexShrink: 1, fontFamily: 'Jua', fontSize: 17, color: '#FFFFFF', textAlign: 'center' },
  audioButton: { width: 47, height: 47, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: '#7652E8', shadowColor: '#190D42', shadowOpacity: 0.25, shadowRadius: 8, elevation: 5 },
  audioButtonDisabled: { backgroundColor: '#806FAF', opacity: 0.72 },
  footerControls: { minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hintButton: { minWidth: 78, minHeight: 39, paddingHorizontal: 12, borderRadius: 14, backgroundColor: '#FFFFFF', flexDirection: 'row', gap: 5, alignItems: 'center', justifyContent: 'center' },
  hintButtonText: { fontSize: 11, fontWeight: '900', color: '#7652E8' },
  dragInstruction: { fontSize: 9, fontWeight: '900', letterSpacing: 1.1, color: '#D8CCFF' },
  helpButton: { width: 39, height: 39, borderRadius: 14, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  hintCard: { position: 'absolute', left: 20, right: 20, bottom: 58, padding: 12, borderRadius: 16, backgroundColor: '#FFF6D9', zIndex: 20 },
  hintText: { fontSize: 12, lineHeight: 17, color: '#705522', textAlign: 'center' },
  modalShade: { flex: 1, backgroundColor: 'rgba(25,12,55,.66)', alignItems: 'center', justifyContent: 'center', padding: 22 },
  feedbackCard: { width: '100%', maxWidth: 430, borderRadius: 29, backgroundColor: '#FFFDF9', padding: 24, alignItems: 'center', shadowColor: '#190D31', shadowOpacity: 0.28, shadowRadius: 22, elevation: 10 },
  feedbackIcon: { width: 60, height: 60, borderRadius: 20, backgroundColor: '#7652E8', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  correctIcon: { backgroundColor: '#62B53A' },
  incorrectIcon: { backgroundColor: '#E06B70' },
  feedbackKicker: { fontSize: 10, fontWeight: '900', letterSpacing: 1.3, color: '#62A936', textAlign: 'center' },
  feedbackTitle: { fontFamily: 'Jua', fontSize: 25, lineHeight: 31, color: '#432750', textAlign: 'center', marginTop: 5 },
  feedbackText: { marginTop: 10, fontSize: 14, lineHeight: 21, color: '#76697B', textAlign: 'center' },
  primaryButton: { width: '100%', minHeight: 54, borderRadius: 18, backgroundColor: '#7652E8', marginTop: 21, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  primaryButtonSmall: { flex: 1, minHeight: 50, borderRadius: 16, backgroundColor: '#7652E8', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900', letterSpacing: 0.7, textAlign: 'center' },
  secondaryButton: { flex: 1, minHeight: 50, borderRadius: 16, backgroundColor: '#F0EAF5', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  secondaryButtonText: { color: '#563963', fontSize: 11, fontWeight: '900', textAlign: 'center' },
  exitRow: { width: '100%', flexDirection: 'row', gap: 10, marginTop: 21 },
  resultStars: { flexDirection: 'row', gap: 6, marginTop: 12 },
});
