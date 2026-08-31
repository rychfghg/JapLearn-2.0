import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  ImageBackground,
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

type Choice = { japanese: string; romaji: string };
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

const fallbackScenes: Record<string, any> = {
  school: require('../assets/img/background/school a hallway st2 day.png'),
  classroom: require('../assets/img/background/classroom a st2 day.png'),
  station: require('../assets/img/background/train_scene day.png'),
  office: require('../assets/img/background/student council room a st2 evening.png'),
  meal: require('../assets/img/background/kitchen dining day.png'),
  home: require('../assets/img/background/house a day.png'),
};
const ahiruGestures = [
  require('../assets/hello.png'),
  require('../assets/idle.png'),
  require('../assets/talk.png'),
];
const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);
const mediaUrl = (url?: string) => !url ? '' : url.startsWith('http') ? url : `${expoconfig.API_URL}${url}`;

function PhraseChip({ choice, disabled, onDrop }: { choice: Choice; disabled: boolean; onDrop: (choice: Choice) => void }) {
  const position = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(1)).current;
  const reset = useCallback(() => {
    Animated.parallel([
      Animated.spring(position, { toValue: { x: 0, y: 0 }, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
    ]).start();
  }, [position, scale]);
  const responder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => !disabled,
    onMoveShouldSetPanResponder: (_, gesture) => !disabled && (Math.abs(gesture.dx) > 4 || Math.abs(gesture.dy) > 4),
    onPanResponderGrant: () => Animated.spring(scale, { toValue: 1.08, useNativeDriver: true }).start(),
    onPanResponderMove: Animated.event([null, { dx: position.x, dy: position.y }], { useNativeDriver: false }),
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dy < -70) onDrop(choice);
      reset();
    },
    onPanResponderTerminate: reset,
  }), [choice, disabled, onDrop, position, reset, scale]);

  return (
    <Animated.View
      {...responder.panHandlers}
      style={[styles.phraseChip, { transform: [{ translateX: position.x }, { translateY: position.y }, { scale }] }]}
    >
      <Pressable disabled={disabled} onPress={() => onDrop(choice)} style={styles.phraseChipPressable}>
        <Text style={styles.phraseJapanese}>{choice.japanese}</Text>
        <Ionicons name="apps" size={15} color="#D7C9FF" />
      </Pressable>
    </Animated.View>
  );
}

export default function QuackSituateMatching() {
  const params = useLocalSearchParams<{ level?: string; set?: string }>();
  const level = Math.max(1, Number(params.level) || 1);
  const setNumber = Math.max(1, Number(params.set) || 1);
  const [moments, setMoments] = useState<Moment[]>([]);
  const [momentIndex, setMomentIndex] = useState(0);
  const [options, setOptions] = useState<Choice[]>([]);
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
  const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
  const score = Math.max(0, moments.length * 20 - mistakes * 5);

  const stopAudio = useCallback(async (unload = false) => {
    await Promise.all([music.current, momentAudio.current, correctSound.current, incorrectSound.current].map(async sound => {
      if (!sound) return;
      try {
        await sound.stopAsync();
        if (unload) await sound.unloadAsync();
      } catch {}
    }));
    if (unload) {
      music.current = null;
      momentAudio.current = null;
      correctSound.current = null;
      incorrectSound.current = null;
    }
  }, []);

  useFocusEffect(useCallback(() => () => { void stopAudio(true); }, [stopAudio]));

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const response = await fetch(`${expoconfig.API_URL}/api/situational/questions?gameType=EXPRESSION_MATCH`);
        if (!response.ok) throw new Error('Expression Match could not load.');
        const all: Moment[] = await response.json();
        const selected = all.filter(item => item.level === level && item.setNumber === setNumber);
        if (active) setMoments(selected);
        const loaded = await Promise.all([
          loadBundledSound(require('../assets/audio/sfx/quiz.mp3'), { isLooping: true, volume: 0.1, shouldPlay: true }),
          loadBundledSound(require('../assets/audio/sfx/correct_sfx.mp3')),
          loadBundledSound(require('../assets/audio/sfx/incorrect_sfx.mp3')),
        ]);
        music.current = loaded[0].sound;
        correctSound.current = loaded[1].sound;
        incorrectSound.current = loaded[2].sound;
      } catch {
        if (active) setMoments([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
      void stopAudio(true);
    };
  }, [level, setNumber, stopAudio]);

  useEffect(() => {
    if (!current) return;
    const pool = moments.map(moment => {
      const found = moment.choices?.find(choice => choice.japanese === moment.correctAnswer);
      return found || { japanese: moment.correctAnswer, romaji: moment.correctAnswer };
    }).filter((choice, index, items) => items.findIndex(item => item.japanese === choice.japanese) === index);
    const correct = current.choices?.find(choice => choice.japanese === current.correctAnswer) || {
      japanese: current.correctAnswer,
      romaji: current.correctAnswer,
    };
    const distractors = shuffle(pool.filter(choice => choice.japanese !== current.correctAnswer)).slice(0, 3);
    setOptions(shuffle([correct, ...distractors]));
    setShowHint(false);
    setLocked(false);
  }, [current, moments]);

  const playMomentAudio = async () => {
    if (!current?.audioUrl) return;
    try {
      await momentAudio.current?.unloadAsync();
      const loaded = await Audio.Sound.createAsync({ uri: mediaUrl(current.audioUrl) }, { shouldPlay: true, volume: 1 });
      momentAudio.current = loaded.sound;
    } catch {}
  };

  const choose = useCallback(async (choice: Choice) => {
    if (!current || locked) return;
    setLocked(true);
    if (choice.japanese === current.correctAnswer) {
      setFeedback('correct');
      await correctSound.current?.replayAsync();
      return;
    }
    setMistakes(value => value + 1);
    setWrongMoments(items => items.includes(current.id) ? items : [...items, current.id]);
    setFeedback('incorrect');
    await incorrectSound.current?.replayAsync();
  }, [current, locked]);

  const continueAfterFeedback = () => {
    const correct = feedback === 'correct';
    setFeedback(null);
    if (!correct) {
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          name: [user.fname, user.lname].filter(Boolean).join(' '),
          gameType: 'EXPRESSION_MATCH',
          difficulty: level === 5 ? 'HARD' : level >= 3 ? 'INTERMEDIATE' : 'STARTER',
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
    return <QuackSituateExit color="#7652E8" icon="hand-left-outline" title="Gesture trail saved" subtitle="Your Expression Match result is ready in QuackProgress." status="RETURNING TO THE GESTURE MAP" onComplete={() => router.replace('/QuackSituateMatchingLevels')} />;
  }
  if (loading) {
    return <SafeAreaView style={styles.loading}><ActivityIndicator size="large" color="#7652E8" /><Text style={styles.loadingText}>Preparing gesture moments…</Text></SafeAreaView>;
  }
  if (!current) {
    return (
      <SafeAreaView style={styles.loading}>
        <Ionicons name="images-outline" size={38} color="#7652E8" />
        <Text style={styles.emptyTitle}>This set is being prepared</Text>
        <Text style={styles.emptyText}>Publish Expression Match moments for Level {level}, Set {setNumber} in Admin.</Text>
        <Pressable style={styles.primaryButton} onPress={() => router.replace('/QuackSituateMatchingLevels')}><Text style={styles.primaryButtonText}>RETURN TO MAP</Text></Pressable>
      </SafeAreaView>
    );
  }

  const remoteScene = current.imageUrl ? { uri: mediaUrl(current.imageUrl) } : fallbackScenes[current.sceneKey] || fallbackScenes.school;
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.stage}>
        <ImageBackground source={require('../assets/quacksituate/quacksituate-menu-background-v3.png')} style={StyleSheet.absoluteFill} imageStyle={styles.pageBackground} />
        <View style={styles.topBar}>
          <Pressable style={styles.roundButton} onPress={() => setShowExit(true)}><Ionicons name="arrow-back" size={23} color="#FFFFFF" /></Pressable>
          <View style={styles.progressArea}>
            <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${((momentIndex + 1) / moments.length) * 100}%` }]} /></View>
            <Text style={styles.progressText}>{momentIndex + 1}/{moments.length}</Text>
          </View>
          <View style={styles.stars}>{[1, 2, 3].map(star => <Ionicons key={star} name={star <= stars ? 'star' : 'star-outline'} size={20} color={star <= stars ? '#FFD65A' : '#9781D8'} />)}</View>
        </View>

        <View style={styles.heading}>
          <Text style={styles.kicker}>GESTURE MOMENT · {current.location || current.topic}</Text>
          <Text style={styles.instruction}>Move the phrase to the matching moment</Text>
        </View>

        <View style={styles.sceneCard}>
          <Image source={remoteScene} style={styles.sceneImage} resizeMode="cover" />
          <View style={styles.sceneShade} />
          <Image source={ahiruGestures[momentIndex % ahiruGestures.length]} style={styles.ahiru} resizeMode="contain" />
          <View style={styles.locationPill}><Ionicons name="location" size={15} color="#FFFFFF" /><Text style={styles.locationText}>{current.location || 'Japanese moment'}</Text></View>
          {current.audioUrl ? <Pressable style={styles.audioButton} onPress={playMomentAudio}><Ionicons name="volume-high" size={24} color="#FFFFFF" /></Pressable> : null}
        </View>

        <View style={styles.promptCard}>
          <View style={styles.promptIcon}><Ionicons name="chatbubble-ellipses" size={20} color="#7652E8" /></View>
          <Text style={styles.prompt}>{current.scenario}</Text>
          <Pressable style={styles.hintButton} onPress={() => setShowHint(value => !value)}><Ionicons name="bulb-outline" size={17} color="#7652E8" /><Text style={styles.hintButtonText}>Hint</Text></Pressable>
        </View>
        {showHint ? <View style={styles.hintCard}><Text style={styles.hintText}>{current.hint}</Text></View> : null}
        <View style={styles.dropGuide}><Ionicons name="arrow-up" size={16} color="#D8CCFF" /><Text style={styles.dropGuideText}>DRAG UP TO MATCH · OR TAP A PHRASE</Text></View>
        <View style={styles.phraseTray}>{options.map(choice => <PhraseChip key={`${current.id}-${choice.japanese}`} choice={choice} disabled={locked} onDrop={choose} />)}</View>
        <Pressable style={styles.helpButton} onPress={() => setShowHelp(true)}><Ionicons name="help" size={20} color="#7652E8" /></Pressable>
      </View>

      <Modal visible={feedback !== null} transparent animationType="fade">
        <View style={styles.modalShade}><View style={styles.feedbackCard}>
          <View style={[styles.feedbackIcon, feedback === 'correct' ? styles.correctIcon : styles.incorrectIcon]}><Ionicons name={feedback === 'correct' ? 'checkmark' : 'refresh'} size={31} color="#FFFFFF" /></View>
          <Text style={styles.feedbackKicker}>{feedback === 'correct' ? 'NATURAL MATCH' : 'TRY THE MOMENT AGAIN'}</Text>
          <Text style={styles.feedbackTitle}>{feedback === 'correct' ? current.correctAnswer : 'That phrase fits another scene.'}</Text>
          <Text style={styles.feedbackText}>{current.explanation}</Text>
          <Pressable style={styles.primaryButton} onPress={continueAfterFeedback}><Text style={styles.primaryButtonText}>{feedback === 'correct' ? 'NEXT MOMENT' : 'TRY AGAIN'}</Text><Ionicons name="arrow-forward" size={19} color="#FFFFFF" /></Pressable>
        </View></View>
      </Modal>

      <Modal visible={showHelp} transparent animationType="fade">
        <View style={styles.modalShade}><View style={styles.feedbackCard}>
          <View style={styles.feedbackIcon}><Ionicons name="hand-left" size={29} color="#FFFFFF" /></View>
          <Text style={styles.feedbackKicker}>HOW TO PLAY</Text><Text style={styles.feedbackTitle}>Read, listen, and match</Text>
          <Text style={styles.feedbackText}>Study Ahiru’s gesture and the situation. Drag a Japanese phrase upward onto the scene, or tap it. New pictures, hints, audio, and moments can be published from Admin.</Text>
          <Pressable style={styles.primaryButton} onPress={() => setShowHelp(false)}><Text style={styles.primaryButtonText}>CONTINUE</Text></Pressable>
        </View></View>
      </Modal>

      <Modal visible={showResult} transparent animationType="fade">
        <View style={styles.modalShade}><View style={styles.feedbackCard}>
          <View style={[styles.feedbackIcon, styles.correctIcon]}><Ionicons name="trophy" size={30} color="#FFFFFF" /></View>
          <Text style={styles.feedbackKicker}>GESTURE TRAIL COMPLETE</Text><Text style={styles.feedbackTitle}>{score} points</Text>
          <View style={styles.resultStars}>{[1, 2, 3].map(star => <Ionicons key={star} name={star <= stars ? 'star' : 'star-outline'} size={31} color="#F4B52E" />)}</View>
          <Text style={styles.feedbackText}>{moments.length - wrongMoments.length} of {moments.length} moments matched without a retry. This result updates QuackProgress and teacher reports.</Text>
          <Pressable disabled={saving} style={styles.primaryButton} onPress={saveAndLeave}><Text style={styles.primaryButtonText}>{saving ? 'SAVING…' : 'SAVE & RETURN TO MAP'}</Text></Pressable>
        </View></View>
      </Modal>

      <Modal visible={showExit} transparent animationType="fade">
        <View style={styles.modalShade}><View style={styles.feedbackCard}>
          <View style={styles.feedbackIcon}><Ionicons name="pause" size={29} color="#FFFFFF" /></View>
          <Text style={styles.feedbackKicker}>LEAVE THIS SET?</Text><Text style={styles.feedbackTitle}>Pause the gesture trail</Text>
          <Text style={styles.feedbackText}>This unfinished set will not be recorded. You can return and start it again anytime.</Text>
          <View style={styles.exitRow}><Pressable style={styles.secondaryButton} onPress={() => setShowExit(false)}><Text style={styles.secondaryButtonText}>KEEP PLAYING</Text></Pressable><Pressable style={styles.primaryButtonSmall} onPress={confirmExit}><Text style={styles.primaryButtonText}>LEAVE SET</Text></Pressable></View>
        </View></View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#2D176C' },
  stage: { flex: 1, backgroundColor: '#4D2BC8', paddingHorizontal: 18, paddingTop: 8, paddingBottom: 18 },
  pageBackground: { opacity: 0.07, resizeMode: 'cover' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 28, backgroundColor: '#F8F4FF' },
  loadingText: { fontFamily: 'Jua', fontSize: 17, color: '#4A2A58' },
  emptyTitle: { fontFamily: 'Jua', fontSize: 25, color: '#432750', textAlign: 'center' },
  emptyText: { fontSize: 14, lineHeight: 21, color: '#7B6D82', textAlign: 'center', maxWidth: 380 },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 54 },
  roundButton: { width: 48, height: 48, borderRadius: 17, backgroundColor: 'rgba(42,21,103,.72)', alignItems: 'center', justifyContent: 'center' },
  progressArea: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 9 },
  progressTrack: { flex: 1, height: 7, borderRadius: 7, backgroundColor: 'rgba(255,255,255,.2)', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 7, backgroundColor: '#FFD65A' },
  progressText: { fontFamily: 'Jua', fontSize: 12, color: '#FFFFFF' },
  stars: { flexDirection: 'row', gap: 1 },
  heading: { alignItems: 'center', marginTop: 7, marginBottom: 9 },
  kicker: { fontSize: 9, fontWeight: '900', letterSpacing: 1.3, color: '#CFC3FF' },
  instruction: { fontFamily: 'Jua', fontSize: 20, lineHeight: 25, color: '#FFFFFF', textAlign: 'center', marginTop: 3 },
  sceneCard: { flex: 1, minHeight: 190, maxHeight: 320, borderRadius: 28, overflow: 'hidden', borderWidth: 2, borderColor: 'rgba(255,255,255,.38)', backgroundColor: '#3A227A', shadowColor: '#160B40', shadowOpacity: 0.3, shadowRadius: 16, elevation: 7 },
  sceneImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  sceneShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(43,20,90,.18)' },
  ahiru: { position: 'absolute', alignSelf: 'center', bottom: -4, width: '48%', height: '84%' },
  locationPill: { position: 'absolute', left: 13, top: 13, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(45,24,92,.82)', paddingHorizontal: 11, paddingVertical: 7, borderRadius: 14 },
  locationText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  audioButton: { position: 'absolute', right: 13, bottom: 13, width: 47, height: 47, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#7652E8' },
  promptCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFFFFF', marginTop: 10, padding: 12, borderRadius: 20 },
  promptIcon: { width: 39, height: 39, borderRadius: 13, backgroundColor: '#EEE8FF', alignItems: 'center', justifyContent: 'center' },
  prompt: { flex: 1, fontFamily: 'Jua', fontSize: 15, lineHeight: 19, color: '#432650' },
  hintButton: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F2ECFF', paddingHorizontal: 9, paddingVertical: 8, borderRadius: 12 },
  hintButtonText: { fontSize: 11, fontWeight: '900', color: '#7652E8' },
  hintCard: { marginTop: 7, padding: 10, borderRadius: 14, backgroundColor: '#FFF6D9' },
  hintText: { fontSize: 12, lineHeight: 17, color: '#705522', textAlign: 'center' },
  dropGuide: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 9 },
  dropGuideText: { color: '#D8CCFF', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  phraseTray: { minHeight: 102, marginTop: 7, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignContent: 'center', gap: 8 },
  phraseChip: { minWidth: '42%', maxWidth: '48%', zIndex: 8 },
  phraseChipPressable: { minHeight: 46, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,.25)', backgroundColor: 'rgba(67,34,156,.94)', paddingHorizontal: 12, paddingVertical: 7, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6, shadowColor: '#170B41', shadowOpacity: 0.25, shadowRadius: 8, elevation: 5 },
  phraseJapanese: { flexShrink: 1, fontFamily: 'Jua', fontSize: 15, color: '#FFFFFF', textAlign: 'center' },
  helpButton: { position: 'absolute', right: 18, top: 67, width: 39, height: 39, borderRadius: 14, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
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
