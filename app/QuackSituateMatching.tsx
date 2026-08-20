import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Image, ImageBackground, Modal, PanResponder, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import expoconfig from '../expoconfig';

type Choice = { japanese: string; romaji: string };
type Pair = {
  id: string;
  level: number;
  setNumber: number;
  topic: string;
  sceneKey: string;
  scenario: string;
  correctAnswer: string;
  explanation: string;
  choices: Choice[];
};

const sceneImages: Record<string, any> = {
  school: require('../assets/img/background/school a hallway st2 day.png'),
  classroom: require('../assets/img/background/classroom a st2 day.png'),
  station: require('../assets/img/background/train_scene day.png'),
  office: require('../assets/img/background/student council room a st2 evening.png'),
  meal: require('../assets/img/background/kitchen dining day.png'),
  home: require('../assets/img/background/house a day.png'),
};
const ropeColors = ['#D95476', '#7652BA', '#3197A3', '#E08A2C', '#729A43'];
const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

type DragSocketProps = {
  color: string;
  connected: boolean;
  startX: number;
  startY: number;
  onStart: () => void;
  onMove: (x: number, y: number) => void;
  onRelease: (x: number, y: number) => void;
};

function DragSocket({ color, connected, startX, startY, onStart, onMove, onRelease }: DragSocketProps) {
  const responder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onStartShouldSetPanResponderCapture: () => true,
    onMoveShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponderCapture: () => true,
    onShouldBlockNativeResponder: () => true,
    onPanResponderGrant: onStart,
    onPanResponderMove: (_, gesture) => onMove(startX + gesture.dx, startY + gesture.dy),
    onPanResponderRelease: (_, gesture) => onRelease(startX + gesture.dx, startY + gesture.dy),
    onPanResponderTerminate: (_, gesture) => onRelease(startX + gesture.dx, startY + gesture.dy),
  }), [onMove, onRelease, onStart, startX, startY]);

  return (
    <View
      {...responder.panHandlers}
      hitSlop={14}
      style={[styles.leftSocket, styles.dragSurface, { borderColor: color }, connected && { backgroundColor: color }]}
    >
      <View style={[styles.socketCore, { backgroundColor: color }]} />
    </View>
  );
}

export default function QuackSituateMatching() {
  const params = useLocalSearchParams<{ level?: string; set?: string }>();
  const level = Math.max(1, Number(params.level) || 1);
  const setNumber = Math.max(1, Number(params.set) || 1);
  const { width } = useWindowDimensions();
  const compact = width < 430;

  const [pairs, setPairs] = useState<Pair[]>([]);
  const [scenes, setScenes] = useState<Pair[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [matches, setMatches] = useState<Record<number, number>>({});
  const [dragRope, setDragRope] = useState<{ expressionIndex: number; x: number; y: number } | null>(null);
  const [incorrectLinks, setIncorrectLinks] = useState<number[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [showExit, setShowExit] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [saving, setSaving] = useState(false);

  const music = useRef<Audio.Sound | null>(null);
  const correctSound = useRef<Audio.Sound | null>(null);
  const incorrectSound = useRef<Audio.Sound | null>(null);

  const stopAudio = useCallback(async (unload = false) => {
    const sounds = [music.current, correctSound.current, incorrectSound.current];
    await Promise.all(sounds.map(async sound => {
      if (!sound) return;
      try {
        await sound.stopAsync();
        if (unload) await sound.unloadAsync();
      } catch {}
    }));
    if (unload) {
      music.current = null;
      correctSound.current = null;
      incorrectSound.current = null;
    }
  }, []);

  useFocusEffect(useCallback(() => () => { void stopAudio(true); }, [stopAudio]));

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await fetch(`${expoconfig.API_URL}/api/situational/questions?gameType=EXPRESSION_MATCH`);
        if (!response.ok) throw new Error('Expression Match could not load.');
        const all: Pair[] = await response.json();
        const current = all.filter(item => item.level === level && item.setNumber === setNumber);
        if (active) {
          setPairs(current);
          setScenes(shuffle(current));
        }
        const loaded = await Promise.all([
          Audio.Sound.createAsync(require('../assets/audio/sfx/quiz.mp3'), { isLooping: true, volume: 0.13, shouldPlay: true }),
          Audio.Sound.createAsync(require('../assets/audio/sfx/correct_sfx.mp3')),
          Audio.Sound.createAsync(require('../assets/audio/sfx/incorrect_sfx.mp3')),
        ]);
        music.current = loaded[0].sound;
        correctSound.current = loaded[1].sound;
        incorrectSound.current = loaded[2].sound;
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
      void stopAudio(true);
    };
  }, [level, setNumber, stopAudio]);

  const makeConnection = (sceneIndex: number) => {
    if (selected === null) return;
    setMatches(current => {
      const next = { ...current };
      Object.keys(next).forEach(key => {
        if (next[Number(key)] === sceneIndex) delete next[Number(key)];
      });
      next[selected] = sceneIndex;
      return next;
    });
    setIncorrectLinks(current => current.filter(index => index !== selected));
    setSelected(null);
  };

  const connectDraggedRope = (expressionIndex: number, x: number, y: number, boardWidth: number, cardHeight: number) => {
    setDragRope(null);
    const firstCenter = 112 + (cardHeight - 28) / 2;
    const sceneIndex = Math.round((y - firstCenter) / cardHeight);
    const reachedSceneColumn = x >= boardWidth * 0.56;
    if (!reachedSceneColumn || sceneIndex < 0 || sceneIndex >= scenes.length) return;

    setMatches(current => {
      const next = { ...current };
      Object.keys(next).forEach(key => {
        if (next[Number(key)] === sceneIndex) delete next[Number(key)];
      });
      next[expressionIndex] = sceneIndex;
      return next;
    });
    setIncorrectLinks(current => current.filter(index => index !== expressionIndex));
    setSelected(null);
  };

  const checkMatches = async () => {
    if (Object.keys(matches).length < pairs.length) return;
    const wrong = pairs.map((pair, index) => pair.id === scenes[matches[index]]?.id ? -1 : index).filter(index => index >= 0);
    if (wrong.length) {
      setMistakes(value => value + wrong.length);
      setIncorrectLinks(wrong);
      setShowReview(true);
      await incorrectSound.current?.replayAsync();
      return;
    }
    setIncorrectLinks([]);
    await correctSound.current?.replayAsync();
    setShowResult(true);
  };

  const score = Math.max(0, pairs.length * 20 - mistakes * 5);
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
          topic: pairs[0]?.topic,
          score,
          totalQuestions: pairs.length,
          correctAnswers: pairs.length,
          completed: true,
        }),
      });
      await stopAudio(true);
      router.replace('/QuackSituateMatchingLevels');
    } finally {
      setSaving(false);
    }
  };

  const confirmExit = async () => {
    await stopAudio(true);
    setShowExit(false);
    router.replace('/QuackSituateMatchingLevels');
  };

  const resetBoard = () => {
    setMatches({});
    setSelected(null);
    setIncorrectLinks([]);
    setMistakes(0);
    setScenes(shuffle(pairs));
  };

  const cardHeight = compact ? 132 : 128;
  const boardWidth = Math.min(760, width - 22);
  const ropePaths = useMemo(() => Object.entries(matches).map(([left, right]) => ({
    left: Number(left),
    right,
    color: ropeColors[Number(left) % ropeColors.length],
  })), [matches]);

  if (loading) {
    return <SafeAreaView style={styles.loading}><ActivityIndicator size="large" color="#8A20E8" /><Text style={styles.loadingText}>Preparing the matching trail…</Text></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ImageBackground source={require('../assets/quacksituate/quacksituate-menu-background-v3.png')} style={styles.background} imageStyle={styles.backgroundImage}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} scrollEnabled={!dragRope}>
          <View style={styles.topBar}>
            <Pressable style={styles.iconButton} onPress={() => setShowExit(true)}>
              <Ionicons name="arrow-back" size={24} color="#442454" />
            </Pressable>
            <View style={styles.headerCopy}>
              <Text style={styles.headerKicker}>ROPE QUEST · {pairs[0]?.topic || 'EXPRESSION MATCH'}</Text>
              <Text style={styles.headerTitle}>Expression Match</Text>
              <Text style={styles.headerSubtitle}>Build every connection, then check your board.</Text>
            </View>
            <Pressable style={styles.helpButton} onPress={() => setShowHelp(true)}>
              <Ionicons name="help-circle" size={26} color="#8A20E8" />
            </Pressable>
          </View>

          <View style={styles.statusRow}>
            <View style={styles.levelBadge}><Text style={styles.levelLabel}>LEVEL</Text><Text style={styles.levelValue}>{level}</Text><Text style={styles.levelSet}>SET {setNumber}</Text></View>
            <View style={styles.missionStatus}><View style={styles.statusDot} /><View><Text style={styles.statusKicker}>MATCHING BOARD</Text><Text style={styles.statusText}>{Object.keys(matches).length} of {pairs.length} ropes placed</Text></View></View>
            <View style={styles.scoreBadge}><Ionicons name="star" size={18} color="#D99A2B" /><Text style={styles.scoreText}>{score}</Text></View>
          </View>

          <View style={[styles.board, { width: boardWidth, minHeight: pairs.length * cardHeight + 84 }]}>
            <View style={styles.boardHeader}>
              <View><Text style={styles.boardKicker}>CONNECT THE MOMENT</Text><Text style={styles.boardTitle}>Phrase to scene</Text></View>
              <Ionicons name="git-compare" size={25} color="#8A20E8" />
            </View>
            <View style={styles.columnLabels}><Text style={styles.columnLabel}>EXPRESSIONS</Text><Text style={styles.columnLabel}>SCENES</Text></View>

            <Svg pointerEvents="none" style={StyleSheet.absoluteFill} width={boardWidth} height={pairs.length * cardHeight + 84}>
              {ropePaths.map(path => {
                const startY = 112 + path.left * cardHeight + (cardHeight - 28) / 2;
                const endY = 112 + path.right * cardHeight + (cardHeight - 28) / 2;
                const rope = `M ${boardWidth * 0.395} ${startY} C ${boardWidth * 0.48} ${startY}, ${boardWidth * 0.52} ${endY}, ${boardWidth * 0.605} ${endY}`;
                return (
                  <React.Fragment key={path.left}>
                    <Path d={rope} stroke="#4A2C42" strokeWidth="10" strokeLinecap="round" fill="none" opacity="0.16" />
                    <Path d={rope} stroke={path.color} strokeWidth="7" strokeLinecap="round" fill="none" />
                    <Path d={rope} stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="5 9" fill="none" opacity="0.5" />
                  </React.Fragment>
                );
              })}
              {dragRope && (() => {
                const startX = boardWidth * 0.395;
                const startY = 112 + dragRope.expressionIndex * cardHeight + (cardHeight - 28) / 2;
                const controlX = Math.max(startX + 22, (startX + dragRope.x) / 2);
                const liveRope = `M ${startX} ${startY} C ${controlX} ${startY}, ${controlX} ${dragRope.y}, ${dragRope.x} ${dragRope.y}`;
                return (
                  <React.Fragment>
                    <Path d={liveRope} stroke="#4A2C42" strokeWidth="11" strokeLinecap="round" fill="none" opacity="0.18" />
                    <Path d={liveRope} stroke={ropeColors[dragRope.expressionIndex % ropeColors.length]} strokeWidth="8" strokeLinecap="round" fill="none" />
                    <Path d={liveRope} stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="5 9" fill="none" opacity="0.55" />
                  </React.Fragment>
                );
              })()}
            </Svg>

            <View style={styles.columns}>
              <View style={styles.column}>
                {pairs.map((pair, index) => {
                  const connected = matches[index] !== undefined;
                  const wrong = incorrectLinks.includes(index);
                  return (
                    <Pressable
                      key={pair.id}
                      onPress={() => setSelected(index)}
                      style={[
                        styles.phraseCard,
                        { height: cardHeight - 28 },
                        selected === index && styles.selectedCard,
                        connected && { borderColor: ropeColors[index % ropeColors.length] },
                        wrong && styles.wrongCard,
                      ]}
                    >
                      <View style={[styles.numberBadge, { backgroundColor: ropeColors[index % ropeColors.length] }]}><Text style={styles.numberText}>{index + 1}</Text></View>
                      <Text numberOfLines={2} adjustsFontSizeToFit style={styles.japanese}>{pair.correctAnswer}</Text>
                      <Text numberOfLines={1} style={styles.romaji}>{pair.choices?.[0]?.romaji}</Text>
                      <Text style={styles.tapLabel}>{connected ? 'Tap to reconnect' : selected === index ? 'Choose a scene' : 'Tap to connect'}</Text>
                      <DragSocket
                        color={ropeColors[index % ropeColors.length]}
                        connected={connected}
                        startX={boardWidth * 0.395}
                        startY={112 + index * cardHeight + (cardHeight - 28) / 2}
                        onStart={() => {
                          setSelected(index);
                          setDragRope({ expressionIndex: index, x: boardWidth * 0.395, y: 112 + index * cardHeight + (cardHeight - 28) / 2 });
                        }}
                        onMove={(x, y) => setDragRope({ expressionIndex: index, x, y })}
                        onRelease={(x, y) => connectDraggedRope(index, x, y, boardWidth, cardHeight)}
                      />
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.column}>
                {scenes.map((scene, index) => {
                  const occupied = Object.values(matches).includes(index);
                  return (
                    <Pressable key={scene.id} onPress={() => makeConnection(index)} style={[styles.sceneCard, { height: cardHeight - 28 }, occupied && styles.sceneOccupied]}>
                      <Image source={sceneImages[scene.sceneKey] || sceneImages.school} style={styles.sceneImage} resizeMode="cover" />
                      <View style={styles.sceneShade} />
                      <View style={styles.sceneLetter}><Text style={styles.sceneLetterText}>{String.fromCharCode(65 + index)}</Text></View>
                      <View style={styles.sceneCaption}><Text numberOfLines={3} style={styles.sceneText}>{scene.scenario}</Text></View>
                      <View style={styles.rightSocket} />
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>

          <View style={styles.bottomActions}>
            <Pressable style={styles.resetButton} onPress={resetBoard}><Ionicons name="refresh" size={21} color="#D65373" /><Text style={styles.resetText}>Reset</Text></Pressable>
            <Pressable disabled={Object.keys(matches).length < pairs.length} style={[styles.checkButton, Object.keys(matches).length < pairs.length && styles.checkDisabled]} onPress={checkMatches}>
              <Ionicons name="checkmark-circle" size={22} color="#FFF" />
              <View><Text style={styles.checkText}>CHECK MATCHES</Text><Text style={styles.checkSubtext}>{Object.keys(matches).length < pairs.length ? `${pairs.length - Object.keys(matches).length} rope${pairs.length - Object.keys(matches).length === 1 ? '' : 's'} remaining` : 'Board ready'}</Text></View>
            </Pressable>
          </View>
        </ScrollView>
      </ImageBackground>

      <Modal visible={showHelp} transparent animationType="fade" onRequestClose={() => setShowHelp(false)}>
        <View style={styles.modalShade}><View style={styles.modalCard}><View style={styles.modalIcon}><Ionicons name="git-compare" size={31} color="#FFF" /></View><Text style={styles.modalKicker}>HOW TO PLAY</Text><Text style={styles.modalTitle}>Build the whole rope board</Text><Text style={styles.modalText}>1. Hold the colored rope socket beside an expression.{`\n`}2. Drag the live rope to any scene and release it.{`\n`}3. Drag again whenever you want to reconnect it.{`\n`}4. Connect everything before checking.{`\n\n`}You can also tap a phrase and then a scene.</Text><Pressable style={styles.modalPrimary} onPress={() => setShowHelp(false)}><Text style={styles.modalPrimaryText}>Got it</Text></Pressable></View></View>
      </Modal>

      <Modal visible={showExit} transparent animationType="fade" onRequestClose={() => setShowExit(false)}>
        <View style={styles.modalShade}><View style={styles.modalCard}><View style={[styles.modalIcon, styles.exitIcon]}><Ionicons name="pause" size={31} color="#FFF" /></View><Text style={styles.modalKicker}>MISSION PAUSED</Text><Text style={styles.modalTitle}>Leave this matching set?</Text><Text style={styles.modalText}>Your unfinished ropes will not be saved. The game music will stop immediately when you exit.</Text><Pressable style={styles.modalPrimary} onPress={() => setShowExit(false)}><Text style={styles.modalPrimaryText}>Continue matching</Text></Pressable><Pressable style={styles.modalSecondary} onPress={confirmExit}><Text style={styles.modalSecondaryText}>Exit to level map</Text></Pressable></View></View>
      </Modal>

      <Modal visible={showReview} transparent animationType="fade" onRequestClose={() => setShowReview(false)}>
        <View style={styles.modalShade}><View style={styles.modalCard}><View style={[styles.modalIcon, styles.reviewIcon]}><Ionicons name="trail-sign" size={31} color="#FFF" /></View><Text style={styles.modalKicker}>ROPE CHECK</Text><Text style={styles.modalTitle}>A few ropes need another look</Text><Text style={styles.modalText}>The incorrect phrase cards are marked in rose. Close this message, tap each marked phrase, and reconnect it to another scene.</Text><Pressable style={styles.modalPrimary} onPress={() => setShowReview(false)}><Text style={styles.modalPrimaryText}>Repair my ropes</Text></Pressable></View></View>
      </Modal>

      <Modal visible={showResult} transparent animationType="fade">
        <View style={styles.modalShade}><View style={styles.modalCard}><View style={styles.modalIcon}><Ionicons name="trophy" size={34} color="#FFF" /></View><Text style={styles.modalKicker}>SET CLEARED</Text><Text style={styles.modalTitle}>Every phrase found its moment!</Text><Text style={styles.resultScore}>{score} points</Text><Text style={styles.modalText}>Your result will update Expression Match mastery, QuackProgress analytics, and your teacher’s record.</Text><Pressable disabled={saving} style={styles.modalPrimary} onPress={saveAndLeave}><Text style={styles.modalPrimaryText}>{saving ? 'Saving progress…' : 'Continue journey'}</Text></Pressable></View></View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAF7FC' },
  background: { flex: 1 },
  backgroundImage: { opacity: 0.12 },
  scroll: { padding: 11, paddingBottom: 44, alignItems: 'center' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAF7FC' },
  loadingText: { fontFamily: 'Jua', fontSize: 17, color: '#4B2D59', marginTop: 14 },
  topBar: { width: '100%', maxWidth: 760, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,.95)', borderRadius: 25, padding: 11, borderWidth: 1, borderColor: '#E9DDEB' },
  iconButton: { width: 53, height: 53, borderRadius: 18, backgroundColor: '#F7F1F9', alignItems: 'center', justifyContent: 'center' },
  headerCopy: { flex: 1 },
  headerKicker: { fontSize: 8, fontWeight: '900', letterSpacing: 1.2, color: '#65A936' },
  headerTitle: { fontFamily: 'Jua', fontSize: 25, color: '#42264F' },
  headerSubtitle: { fontSize: 10, color: '#837687' },
  helpButton: { width: 49, height: 49, borderRadius: 17, backgroundColor: '#F1E3FC', alignItems: 'center', justifyContent: 'center' },
  statusRow: { width: '100%', maxWidth: 760, flexDirection: 'row', gap: 8, marginVertical: 11, alignItems: 'stretch' },
  levelBadge: { width: 65, borderRadius: 19, backgroundColor: '#552E68', alignItems: 'center', justifyContent: 'center', padding: 7 },
  levelLabel: { fontSize: 7, fontWeight: '900', color: '#DDBEF1', letterSpacing: 1 },
  levelValue: { fontFamily: 'Jua', fontSize: 23, color: '#FFF' },
  levelSet: { fontSize: 8, color: '#FFF' },
  missionStatus: { flex: 1, borderRadius: 19, backgroundColor: '#FFF', flexDirection: 'row', gap: 9, alignItems: 'center', paddingHorizontal: 13 },
  statusDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#65A936' },
  statusKicker: { fontSize: 8, fontWeight: '900', color: '#8A20E8', letterSpacing: 1 },
  statusText: { fontFamily: 'Jua', fontSize: 13, color: '#4A3056' },
  scoreBadge: { minWidth: 68, borderRadius: 19, backgroundColor: '#FFF4D9', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 5 },
  scoreText: { fontFamily: 'Jua', fontSize: 19, color: '#5C3B61' },
  board: { backgroundColor: 'rgba(255,252,248,.98)', borderRadius: 30, padding: 12, borderWidth: 1, borderColor: '#E7D9E8', overflow: 'hidden', shadowColor: '#3C2346', shadowOpacity: 0.09, shadowRadius: 16 },
  boardHeader: { height: 47, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 7 },
  boardKicker: { fontSize: 8, fontWeight: '900', letterSpacing: 1.2, color: '#65A936' },
  boardTitle: { fontFamily: 'Jua', fontSize: 19, color: '#482B54' },
  columnLabels: { height: 40, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: '8%', alignItems: 'center' },
  columnLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 1.1, color: '#75647C' },
  columns: { flexDirection: 'row', justifyContent: 'space-between', gap: '23%' },
  column: { width: '38.5%', gap: 28 },
  phraseCard: { backgroundColor: '#FFF', borderRadius: 22, borderWidth: 2, borderColor: '#EBDDEA', padding: 10, justifyContent: 'center', alignItems: 'center', shadowColor: '#482A54', shadowOpacity: 0.06, shadowRadius: 8 },
  selectedCard: { borderColor: '#8A20E8', backgroundColor: '#F8EEFF', transform: [{ scale: 1.025 }] },
  wrongCard: { borderColor: '#D95372', backgroundColor: '#FFF1F4' },
  numberBadge: { position: 'absolute', left: 7, top: 7, width: 25, height: 25, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  numberText: { fontFamily: 'Jua', fontSize: 12, color: '#FFF' },
  japanese: { fontSize: 18, lineHeight: 25, color: '#3D2845', textAlign: 'center', fontWeight: '600', maxWidth: '94%' },
  romaji: { fontSize: 11, color: '#756978', marginTop: 4 },
  tapLabel: { position: 'absolute', bottom: 7, fontSize: 8, fontWeight: '800', color: '#9B8DA0', letterSpacing: 0.4 },
  leftSocket: { position: 'absolute', right: -13, width: 26, height: 26, borderRadius: 13, borderWidth: 4, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', zIndex: 8 },
  dragSurface: { cursor: 'grab', touchAction: 'none', userSelect: 'none' } as any,
  socketCore: { width: 7, height: 7, borderRadius: 4 },
  sceneCard: { borderRadius: 22, overflow: 'hidden', backgroundColor: '#DDD', justifyContent: 'flex-end', borderWidth: 2, borderColor: '#DCD4E6', shadowColor: '#482A54', shadowOpacity: 0.08, shadowRadius: 8 },
  sceneOccupied: { borderColor: '#65A936' },
  sceneImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  sceneShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(27,16,35,.12)' },
  sceneLetter: { position: 'absolute', left: 7, top: 7, width: 29, height: 29, borderRadius: 15, backgroundColor: '#6653A5', alignItems: 'center', justifyContent: 'center' },
  sceneLetterText: { fontFamily: 'Jua', fontSize: 15, color: '#FFF' },
  sceneCaption: { backgroundColor: 'rgba(255,255,255,.95)', minHeight: 45, justifyContent: 'center', padding: 6 },
  sceneText: { fontSize: 9, lineHeight: 12, color: '#3C303F', textAlign: 'center' },
  rightSocket: { position: 'absolute', left: -10, top: '44%', width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFF', borderWidth: 4, borderColor: '#7767B2' },
  bottomActions: { width: '100%', maxWidth: 760, flexDirection: 'row', gap: 10, marginTop: 13 },
  resetButton: { width: 96, borderRadius: 18, backgroundColor: '#FFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderWidth: 1, borderColor: '#E9DDEB' },
  resetText: { fontFamily: 'Jua', fontSize: 14, color: '#D65373' },
  checkButton: { flex: 1, minHeight: 61, borderRadius: 18, backgroundColor: '#8A20E8', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, shadowColor: '#8A20E8', shadowOpacity: 0.24, shadowRadius: 12 },
  checkDisabled: { backgroundColor: '#BDB3C3', shadowOpacity: 0 },
  checkText: { fontFamily: 'Jua', fontSize: 15, color: '#FFF' },
  checkSubtext: { fontSize: 9, color: '#F4E9FA' },
  modalShade: { flex: 1, backgroundColor: 'rgba(38,20,46,.62)', alignItems: 'center', justifyContent: 'center', padding: 23 },
  modalCard: { width: '100%', maxWidth: 420, borderRadius: 31, backgroundColor: '#FFF', padding: 25, alignItems: 'center' },
  modalIcon: { width: 68, height: 68, borderRadius: 23, backgroundColor: '#8A20E8', alignItems: 'center', justifyContent: 'center' },
  exitIcon: { backgroundColor: '#D88727' },
  reviewIcon: { backgroundColor: '#D95372' },
  modalKicker: { fontSize: 10, fontWeight: '900', letterSpacing: 1.4, color: '#65A936', marginTop: 16 },
  modalTitle: { fontFamily: 'Jua', fontSize: 25, color: '#42264F', textAlign: 'center', marginTop: 5 },
  modalText: { fontSize: 13, lineHeight: 21, color: '#786D7C', textAlign: 'center', marginVertical: 13 },
  resultScore: { fontFamily: 'Jua', fontSize: 22, color: '#D88727', marginTop: 8 },
  modalPrimary: { width: '100%', borderRadius: 17, backgroundColor: '#8A20E8', padding: 15, alignItems: 'center', marginTop: 4 },
  modalPrimaryText: { fontFamily: 'Jua', fontSize: 15, color: '#FFF' },
  modalSecondary: { width: '100%', padding: 14, alignItems: 'center', marginTop: 4 },
  modalSecondaryText: { fontFamily: 'Jua', fontSize: 14, color: '#D65373' },
});
