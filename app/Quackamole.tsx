import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Image, ImageBackground, Modal, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useRouter } from 'expo-router';
// Use the bundled PNG on every platform. The SVG component does not render
// reliably in mobile Safari, which left only the romaji labels above empty holes.
const Mole = ({ width, height }: { width: number; height: number }) => (
  <Image
    source={require('../assets/svg/Mole.png')}
    style={{ width, height }}
    resizeMode="contain"
    fadeDuration={0}
  />
);
import expoconfig from '../expoconfig';
import { styles } from '../styles/stylesMole';
import { AuthContext } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

type GamePhase = 'loading' | 'tutorial' | 'ready' | 'playing' | 'result';
type HoleValue = string | null;

const HOLE_COUNT = 9;
const ROUND_SECONDS = 30;
const FALLBACK = [
  { kana: '\u3042', romaji: 'a' }, { kana: '\u3044', romaji: 'i' }, { kana: '\u3046', romaji: 'u' },
  { kana: '\u3048', romaji: 'e' }, { kana: '\u304a', romaji: 'o' }, { kana: '\u304b', romaji: 'ka' },
  { kana: '\u304d', romaji: 'ki' }, { kana: '\u304f', romaji: 'ku' }, { kana: '\u3051', romaji: 'ke' },
];

const repairJapanese = (value: string) => {
  if (!/[\u00c2-\u00ef]/.test(value)) return value;
  try {
    return decodeURIComponent(Array.from(value).map((character) => `%${character.charCodeAt(0).toString(16).padStart(2, '0')}`).join(''));
  } catch {
    return value;
  }
};

const tutorial = [
  { image: require('../assets/hello.png'), label: 'WELCOME TO QUACK-A-MOLE', title: 'Find the matching sound', text: 'A Japanese character appears at the top. Look for the mole holding its matching romaji.' },
  { image: require('../assets/thinking.png'), label: 'WATCH THE GARDEN', title: 'Moles appear quickly', text: 'Several moles may pop up, but only one carries the correct answer. Read before you tap.' },
  { image: require('../assets/talk.png'), label: 'AIM FOR ACCURACY', title: 'Tap the correct mole', text: 'A correct hit earns a point and moves to the next kana. Three misses skip the current character.' },
];

export default function Quackamole() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const [phase, setPhase] = useState<GamePhase>('loading');
  const [loading, setLoading] = useState(8);
  const [tutorialIndex, setTutorialIndex] = useState(0);
  const [pairs, setPairs] = useState(FALLBACK);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [holes, setHoles] = useState<HoleValue[]>(Array(HOLE_COUNT).fill(null));
  const [seconds, setSeconds] = useState(ROUND_SECONDS);
  const [score, setScore] = useState(0);
  const [totalWhacks, setTotalWhacks] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [locked, setLocked] = useState(false);
  const [hammerHole, setHammerHole] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  const [musicMuted, setMusicMuted] = useState(false);
  const [effectsMuted, setEffectsMuted] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [newBest, setNewBest] = useState(false);
  const [exitConfirmVisible, setExitConfirmVisible] = useState(false);
  const popAnimations = useMemo(() => Array.from({ length: HOLE_COUNT }, () => new Animated.Value(1)), []);
  const shine = useRef(new Animated.Value(-1)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const hammerSwing = useRef(new Animated.Value(0)).current;
  const spawnTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const clockTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const soundRef = useRef<Audio.Sound | null>(null);
  const musicRef = useRef<Audio.Sound | null>(null);
  const mounted = useRef(true);
  const completedRound = useRef(false);
  const savedRound = useRef(false);

  const clearGameTimers = () => {
    if (spawnTimer.current) clearInterval(spawnTimer.current);
    if (clockTimer.current) clearInterval(clockTimer.current);
    hideTimers.current.forEach(clearTimeout);
    spawnTimer.current = null; clockTimer.current = null; hideTimers.current = [];
  };

  useEffect(() => {
    mounted.current = true;
    const loadingTimer = setInterval(() => setLoading((value) => Math.min(100, value + 8)), 90);
    const shineLoop = Animated.loop(Animated.timing(shine, { toValue: 1, duration: 1550, useNativeDriver: true }));
    const pulseLoop = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1.06, duration: 850, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1, duration: 850, useNativeDriver: true }),
    ]));
    shineLoop.start(); pulseLoop.start();
    return () => {
      mounted.current = false; clearInterval(loadingTimer); clearGameTimers(); shineLoop.stop(); pulseLoop.stop();
      soundRef.current?.stopAsync().catch(() => undefined); soundRef.current?.unloadAsync().catch(() => undefined);
      musicRef.current?.stopAsync().catch(() => undefined); musicRef.current?.unloadAsync().catch(() => undefined);
    };
  }, []);

  useEffect(() => {
    if (!user?.email) return;
    const storageKey = `quackamole_high_score:${user.email.toLowerCase()}`;
    AsyncStorage.getItem(storageKey).then((value) => value && setHighScore(Number(value) || 0));
    fetch(`${expoconfig.API_URL}/api/scores/high-score?email=${encodeURIComponent(user.email)}&game=QUACKAMOLE`)
      .then((response) => response.status === 204 ? null : response.json())
      .then((record) => record && setHighScore((current) => Math.max(current, record.score || 0)))
      .catch(() => undefined);
  }, [user?.email]);

  useEffect(() => {
    const controlMusic = async () => {
      try {
        if (!musicRef.current) {
          const created = await Audio.Sound.createAsync(require('../assets/audio/sfx/quackmanbg.mp3'), { isLooping: true, volume: 0.22 });
          musicRef.current = created.sound;
        }
        if (phase === 'playing' && !paused && !musicMuted) await musicRef.current.playAsync();
        else await musicRef.current.pauseAsync();
      } catch { /* Audio availability must never block the game. */ }
    };
    controlMusic();
  }, [phase, paused, musicMuted]);

  useEffect(() => {
    if (phase !== 'result' || !completedRound.current || savedRound.current || !user?.email) return;
    savedRound.current = true;
    const wasNewBest = score > highScore;
    setNewBest(wasNewBest);
    const best = Math.max(score, highScore);
    setHighScore(best);
    AsyncStorage.setItem(`quackamole_high_score:${user.email.toLowerCase()}`, String(best));
    fetch(`${expoconfig.API_URL}/api/scores/high-score`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: `${user.fname} ${user.lname}`.trim(), email: user.email, game: 'QUACKAMOLE', date: new Date().toISOString(), score }),
    }).then((response) => { if (!response.ok) throw new Error(`Score save failed: ${response.status}`); return response.json(); }).then((record) => setHighScore((current) => Math.max(current, record.score || 0))).catch((error) => console.warn(error.message));
  }, [phase]);

  useEffect(() => { if (loading >= 100 && phase === 'loading') setTimeout(() => mounted.current && setPhase('tutorial'), 220); }, [loading, phase]);

  useEffect(() => {
    fetch(`${expoconfig.API_URL}/api/quackamolecontent`)
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => {
        const kana = data.flatMap((item: { kana?: string[] }) => item.kana || []);
        const romaji = data.flatMap((item: { romaji?: string[] }) => item.romaji || []);
        const loadedPairs = kana.map((character: string, index: number) => ({ kana: repairJapanese(character), romaji: romaji[index] })).filter((item: { kana: string; romaji?: string }) => item.romaji && /[\u3040-\u30ff]/.test(item.kana));
        if (loadedPairs.length) setPairs(loadedPairs);
      }).catch(() => undefined);
  }, []);

  const playWhack = async () => {
    if (effectsMuted) return;
    try {
      if (!soundRef.current) soundRef.current = (await Audio.Sound.createAsync(require('../assets/audio/sfx/whack.mp3'))).sound;
      await soundRef.current.replayAsync();
    } catch { /* Game stays playable when audio is unavailable. */ }
  };

  const hideHole = (index: number) => {
    Animated.timing(popAnimations[index], { toValue: 1, duration: 180, useNativeDriver: true }).start();
    setHoles((values) => values.map((value, position) => position === index ? null : value));
  };

  const spawnMoles = () => {
    if (!mounted.current || locked) return;
    hideTimers.current.forEach(clearTimeout); hideTimers.current = [];
    const correct = pairs[currentIndex]?.romaji;
    if (!correct) return;
    const count = 3;
    const indexes = [...Array(HOLE_COUNT).keys()].sort(() => Math.random() - .5).slice(0, count);
    const answerIndex = indexes[Math.floor(Math.random() * indexes.length)];
    const next = Array<HoleValue>(HOLE_COUNT).fill(null);
    indexes.forEach((holeIndex) => {
      const distractors = pairs.filter((item) => item.romaji !== correct);
      next[holeIndex] = holeIndex === answerIndex ? correct : distractors[Math.floor(Math.random() * distractors.length)]?.romaji || 'no';
      popAnimations[holeIndex].setValue(1);
      Animated.spring(popAnimations[holeIndex], { toValue: 0, friction: 6, tension: 90, useNativeDriver: true }).start();
      hideTimers.current.push(setTimeout(() => hideHole(holeIndex), 1350));
    });
    setHoles(next);
  };

  useEffect(() => {
    if (phase !== 'playing' || paused) return;
    clearGameTimers(); spawnMoles();
    spawnTimer.current = setInterval(spawnMoles, 1750);
    clockTimer.current = setInterval(() => setSeconds((value) => value <= 1 ? 0 : value - 1), 1000);
    return clearGameTimers;
  }, [phase, paused, currentIndex, pairs]);

  useEffect(() => {
    if (phase === 'playing' && (seconds === 0 || currentIndex >= pairs.length)) {
      completedRound.current = true; clearGameTimers(); setHoles(Array(HOLE_COUNT).fill(null)); setPhase('result');
    }
  }, [seconds, currentIndex, phase, pairs.length]);

  const startGame = () => {
    clearGameTimers(); setCurrentIndex(0); setScore(0); setTotalWhacks(0); setAttempts(0); setSeconds(ROUND_SECONDS);
    completedRound.current = false; savedRound.current = false;
    setPaused(false); setMenuOpen(false); setNewBest(false);
    setFeedback('idle'); setLocked(false); setHoles(Array(HOLE_COUNT).fill(null)); setPhase('playing');
  };

  const whack = (index: number) => {
    if (paused || locked || !holes[index]) return;
    setLocked(true); setHammerHole(index); setTotalWhacks((value)=>value+1); playWhack();
    hammerSwing.setValue(0);
    Animated.sequence([
      Animated.timing(hammerSwing,{toValue:1,duration:145,useNativeDriver:true}),
      Animated.timing(hammerSwing,{toValue:2,duration:150,useNativeDriver:true}),
    ]).start(()=>setHammerHole(null));
    const correct = holes[index] === pairs[currentIndex]?.romaji;
    setFeedback(correct ? 'correct' : 'wrong'); hideHole(index);
    if (correct) { setScore((value) => value + 1); setAttempts(0); }
    else setAttempts((value) => value + 1);
    const shouldAdvance = correct || attempts + 1 >= 3;
    hideTimers.current.push(setTimeout(() => {
      if (shouldAdvance) { setCurrentIndex((value) => value + 1); setAttempts(0); }
      setFeedback('idle'); setLocked(false);
    }, 520));
  };

  const leave = () => { completedRound.current = false; clearGameTimers(); router.replace('/Exercises'); };
  const confirmExit = () => {
    setPaused(true);
    setMenuOpen(false);
    setExitConfirmVisible(true);
  };
  const continueGame = () => { setExitConfirmVisible(false); setPaused(false); };
  const exitGame = () => { setExitConfirmVisible(false); leave(); };
  const openSettings = () => { setPaused(true); setMenuOpen(true); };
  const resumeGame = () => { setMenuOpen(false); setPaused(false); };

  const exitDialog = <Modal visible={exitConfirmVisible} transparent animationType="fade" onRequestClose={continueGame}><View style={styles.exitOverlay}><View style={styles.exitCard}><View style={styles.exitIcon}><Ionicons name="flag-outline" size={28} color="#7B35C8"/></View><Text style={styles.exitTitle}>Leave Quack-a-Mole?</Text><Text style={styles.exitMessage}>Do you want to leave this activity?</Text><Pressable style={styles.continueButton} onPress={continueGame}><Ionicons name="play" size={17} color="#FFF"/><Text style={styles.continueButtonText}>CONTINUE</Text></Pressable><Pressable style={styles.endButton} onPress={exitGame}><Text style={styles.endButtonText}>Exit activity</Text></Pressable></View></View></Modal>;

  const gameMenu = <><Pressable style={styles.confirmBackButton} onPress={confirmExit}><Ionicons name="arrow-back" size={22} color="#432653"/></Pressable><Pressable style={styles.floatingMenuButton} onPress={openSettings}><Ionicons name="ellipsis-horizontal" size={24} color="#432653"/></Pressable><Modal visible={menuOpen} transparent animationType="fade" onRequestClose={resumeGame}><View style={styles.menuOverlay}><View style={styles.menuCard}><Text style={styles.menuKicker}>QUACK-A-MOLE</Text><View style={styles.menuHeading}><Text style={styles.menuTitle}>Game paused</Text><View style={styles.bestBadge}><Ionicons name="trophy" size={17} color="#D59A2A"/><Text style={styles.bestValue}>{highScore}</Text><Text style={styles.bestLabel}>BEST</Text></View></View><Pressable style={styles.menuRow} onPress={()=>setMusicMuted(value=>!value)}><Ionicons name="musical-notes" size={21} color="#6F38B7"/><View style={styles.menuCopy}><Text style={styles.menuRowTitle}>Background music</Text><Text style={styles.menuRowText}>{musicMuted?'Muted':'On during gameplay'}</Text></View><Ionicons name={musicMuted?'volume-mute':'volume-high'} size={22} color="#75657D"/></Pressable><Pressable style={styles.menuRow} onPress={()=>setEffectsMuted(value=>!value)}><Ionicons name="hammer-outline" size={21} color="#6F38B7"/><View style={styles.menuCopy}><Text style={styles.menuRowTitle}>Game sounds</Text><Text style={styles.menuRowText}>{effectsMuted?'Muted':'Whack effects on'}</Text></View><Ionicons name={effectsMuted?'volume-mute':'volume-medium'} size={22} color="#75657D"/></Pressable><Pressable style={styles.menuRow} onPress={startGame}><Ionicons name="refresh" size={21} color="#6F38B7"/><View style={styles.menuCopy}><Text style={styles.menuRowTitle}>Restart round</Text><Text style={styles.menuRowText}>Start again from zero</Text></View></Pressable><Pressable style={styles.resumeButton} onPress={resumeGame}><Ionicons name="play" size={18} color="#FFF"/><Text style={styles.resumeText}>RESUME GAME</Text></Pressable><Pressable style={styles.menuExit} onPress={()=>{setMenuOpen(false);confirmExit();}}><Text style={styles.menuExitText}>Exit to Exercises</Text></Pressable></View></View></Modal><Modal visible={exitConfirmVisible} transparent animationType="fade" onRequestClose={continueGame}><View style={styles.exitOverlay}><View style={styles.exitCard}><View style={styles.exitIcon}><Ionicons name="flag-outline" size={28} color="#7B35C8"/></View><Text style={styles.exitTitle}>Leave Quack-a-Mole?</Text><Text style={styles.exitMessage}>This round is still in progress. Your current score will not be saved if you leave now.</Text><Pressable style={styles.continueButton} onPress={continueGame}><Ionicons name="play" size={17} color="#FFF"/><Text style={styles.continueButtonText}>CONTINUE PLAYING</Text></Pressable><Pressable style={styles.endButton} onPress={exitGame}><Text style={styles.endButtonText}>Leave this round</Text></Pressable></View></View></Modal></>;

  if (phase === 'loading') return <ImageBackground source={require('../assets/quackamole/quackamole-arena.png')} style={styles.moleLoadingScreen} resizeMode="cover"><View style={styles.moleLoadingShade}/><View style={styles.moleLoadingContent}><View style={styles.moleLoadingBadge}><Ionicons name="hammer-outline" size={14} color="#6F38B7"/><Text style={styles.moleLoadingBadgeText}>JAPLEARN KANA HUNT</Text></View><Animated.View style={[styles.moleLoadingPortal,{transform:[{scale:pulse}]}]}><View style={styles.moleLoadingHole}/><Mole width={122} height={155}/><Image source={require('../assets/hammer.png')} style={styles.moleLoadingHammer}/></Animated.View><Text style={styles.moleLoadingTitle}>QUACK-A-MOLE</Text><Text style={styles.moleLoadingSubtitle}>Preparing the kana garden...</Text><View style={styles.moleLoadingTrack}><View style={[styles.moleLoadingFill,{width:`${loading}%`}]}/></View><Text style={styles.moleLoadingStatus}>{loading<100?`PREPARING GAME - ${loading}%`:'READY TO PLAY'}</Text></View></ImageBackground>;

  if (phase === 'tutorial') {
    const step = tutorial[tutorialIndex];
    return <ImageBackground source={require('../assets/quackamole/quackamole-arena.png')} style={styles.tutorialBackground} resizeMode="cover">{exitDialog}<View style={styles.tutorialShade}/><Pressable style={styles.tutorialBack} onPress={confirmExit}><Ionicons name="arrow-back" size={22} color="#432653"/></Pressable><View style={styles.tutorialCard}><View style={styles.tutorialHeader}><View style={styles.tutorialMode}><Ionicons name="school-outline" size={14} color="#6F38B7"/><Text style={styles.tutorialModeText}>AHIRU TRAINING</Text></View><View style={styles.tutorialStep}><Text style={styles.tutorialStepText}>STEP {tutorialIndex+1} / {tutorial.length}</Text></View></View><View style={styles.tutorialStage}><View style={styles.tutorialHalo}/><Animated.Image source={step.image} style={[styles.tutorialMascot,{transform:[{scale:pulse}]}]} resizeMode="contain"/><View style={styles.sampleTarget}><Text style={styles.sampleTargetLabel}>TARGET</Text><Text style={styles.sampleTargetKana}>{'\u3042'}</Text></View><View style={styles.sampleHole}/>{tutorialIndex>=1&&<View style={styles.sampleMole}><Text style={styles.sampleAnswer}>a</Text><Mole width={85} height={112}/></View>}{tutorialIndex===2&&<Image source={require('../assets/hammer.png')} style={styles.sampleHammer}/>}<View style={styles.tutorialPath}><View style={[styles.tutorialPathNode,styles.tutorialPathActive]}><Text style={styles.tutorialPathText}>{'\u3042'}</Text></View><Ionicons name="arrow-forward" size={16} color="#9A86A5"/><View style={[styles.tutorialPathNode,tutorialIndex>=1&&styles.tutorialPathActive]}><Text style={styles.tutorialPathText}>{'\u3042'}</Text></View><Ionicons name="arrow-forward" size={16} color="#9A86A5"/><View style={[styles.tutorialPathNode,tutorialIndex===2&&styles.tutorialPathActive]}><Ionicons name="hammer" size={15} color="#6F38B7"/></View></View></View><Text style={styles.tutorialLabel}>{step.label}</Text><Text style={styles.tutorialTitle}>{step.title}</Text><Text style={styles.tutorialText}>{step.text}</Text><View style={styles.tutorialDots}>{tutorial.map((_,i)=><View key={i} style={[styles.tutorialDot,i===tutorialIndex&&styles.tutorialDotActive]}/>)}</View><Pressable style={styles.tutorialButton} onPress={()=>tutorialIndex<tutorial.length-1?setTutorialIndex((value)=>value+1):setPhase('ready')}><Text style={styles.tutorialButtonText}>{tutorialIndex<tutorial.length-1?'SHOW ME THE NEXT STEP':'ENTER THE GARDEN'}</Text><Ionicons name="arrow-forward" size={20} color="#FFF"/></Pressable></View></ImageBackground>;
  }

  if (phase === 'ready') return <ImageBackground source={require('../assets/quackamole/quackamole-arena.png')} style={styles.tutorialBackground} resizeMode="cover">{exitDialog}<View style={styles.readyShade}/><Pressable style={styles.tutorialBack} onPress={confirmExit}><Ionicons name="arrow-back" size={22} color="#432653"/></Pressable><View style={styles.readyCard}><View style={styles.readyIcon}><Ionicons name="hammer-outline" size={35} color="#6F38B7"/></View><Text style={styles.readyKicker}>GARDEN CHALLENGE</Text><Text style={styles.readyTitle}>Ready to start?</Text><Text style={styles.readyText}>Match as many kana as you can before the 30-second timer ends.</Text><View style={styles.readyRules}><View style={styles.readyRule}><Ionicons name="time-outline" size={20} color="#6F38B7"/><Text style={styles.readyRuleValue}>30 sec</Text><Text style={styles.readyRuleLabel}>Time limit</Text></View><View style={styles.readyDivider}/><View style={styles.readyRule}><Ionicons name="heart-outline" size={20} color="#65A936"/><Text style={styles.readyRuleValue}>3 tries</Text><Text style={styles.readyRuleLabel}>Per kana</Text></View></View><View style={styles.readyAhiru}><Image source={require('../assets/hello.png')} style={styles.readyMascot}/><View style={styles.readyBubble}><Text style={styles.readyBubbleText}>Watch the kana, find its sound, and tap the matching mole!</Text></View></View><Pressable style={styles.readyButton} onPress={startGame}><Text style={styles.readyButtonText}>START QUACK-A-MOLE</Text><Ionicons name="play" size={19} color="#FFF"/></Pressable></View></ImageBackground>;

  if (phase === 'result') { const accuracy=totalWhacks?Math.round((score/totalWhacks)*100):0; const rank=accuracy>=90?'S':accuracy>=75?'A':accuracy>=55?'B':'C'; return <ImageBackground source={require('../assets/quackamole/quackamole-arena.png')} style={styles.tutorialBackground} resizeMode="cover">{exitDialog}<View style={styles.readyShade}/><View style={styles.resultCard}><View style={styles.resultBurstOne}/><View style={styles.resultBurstTwo}/><View style={styles.resultTop}><View><Text style={styles.resultEyebrow}>QUACK-A-MOLE RESULTS</Text><Text style={styles.resultTitle}>Round complete!</Text></View><View style={styles.rankBadge}><Text style={styles.rankLabel}>RANK</Text><Text style={styles.rankValue}>{rank}</Text></View></View><View style={styles.resultHero}><View style={styles.resultTrophy}><Ionicons name="trophy" size={34} color="#D59A2A"/></View><View><Text style={styles.resultScore}>{score}</Text><Text style={styles.resultLabel}>kana matched</Text></View><Image source={score>0?require('../assets/hello.png'):require('../assets/thinking.png')} style={styles.resultMascot}/></View><View style={styles.resultStats}><View style={styles.resultStat}><Ionicons name="checkmark-circle" size={19} color="#65A936"/><Text style={styles.resultStatValue}>{accuracy}%</Text><Text style={styles.resultStatLabel}>Accuracy</Text></View><View style={styles.resultDivider}/><View style={styles.resultStat}><Ionicons name="hammer" size={19} color="#6F38B7"/><Text style={styles.resultStatValue}>{totalWhacks}</Text><Text style={styles.resultStatLabel}>Whacks</Text></View><View style={styles.resultDivider}/><View style={styles.resultStat}><Ionicons name="time" size={19} color="#D88727"/><Text style={styles.resultStatValue}>30s</Text><Text style={styles.resultStatLabel}>Round</Text></View></View><View style={styles.resultMessage}><Ionicons name="sparkles" size={17} color="#6F38B7"/><Text style={styles.resultMessageText}>{accuracy>=75?'Sharp eyes! Your kana recognition is getting faster.':'Good practice! Replay and aim for a cleaner streak.'}</Text></View><Pressable style={styles.readyButton} onPress={startGame}><Text style={styles.readyButtonText}>PLAY AGAIN</Text><Ionicons name="refresh" size={19} color="#FFF"/></Pressable><Pressable style={styles.resultExit} onPress={leave}><Text style={styles.resultExitText}>Return to Exercises</Text></Pressable></View></ImageBackground>; }

  return <ImageBackground source={require('../assets/quackamole/quackamole-arena.png')} style={styles.gameBackground} resizeMode="cover">{gameMenu}<View style={styles.gameShade}/><View style={styles.gameHeader}><Pressable style={styles.gameBackHidden} onPress={confirmExit}><Ionicons name="arrow-back" size={22} color="#432653"/></Pressable><View style={styles.scorePill}><Ionicons name="star" size={17} color="#D99B2B"/><Text style={styles.scoreValue}>{score}</Text></View><View style={[styles.timerPill,seconds<=8&&styles.timerDanger]}><Ionicons name="time-outline" size={18} color={seconds<=8?'#D5526B':'#6F38B7'}/><Text style={[styles.timerValue,seconds<=8&&styles.timerValueDanger]}>{seconds}s</Text></View></View><View style={[styles.targetCard,styles.compactTargetCard]}><View style={styles.targetTopRow}><View style={styles.targetModePill}><Ionicons name="hammer-outline" size={13} color="#6F38B7"/><Text style={styles.targetModeText}>KANA HUNT</Text></View><Text style={styles.targetProgress}>{Math.min(currentIndex+1,pairs.length)} / {pairs.length}</Text></View><View style={[styles.targetMissionRow,styles.centeredMission,styles.compactMission]}><View style={[styles.targetBadge,styles.compactTargetBadge]}><View style={styles.targetBadgeGlow}/><Text style={[styles.targetKana,styles.compactTargetKana]}>{pairs[currentIndex]?.kana||'—'}</Text></View><Text style={styles.targetLabel}>FIND THIS SOUND</Text><Text style={styles.centeredPrompt}>Choose its matching romaji below</Text></View><View style={styles.targetProgressTrack}><View style={[styles.targetProgressFill,{width:`${Math.min(100,((currentIndex+1)/Math.max(1,pairs.length))*100)}%`}]}/></View></View><View style={styles.holesGrid}>{holes.map((value,index)=><Pressable key={index} style={styles.hole} onPress={()=>whack(index)} disabled={!value||locked}><View style={styles.moleClip}><View style={styles.holeShadow}/>{value&&<Animated.View style={[styles.mole,{transform:[{translateY:popAnimations[index].interpolate({inputRange:[0,1],outputRange:[0,78]})}]}]}><Mole width={82} height={108}/></Animated.View>}</View>{value&&<Animated.View pointerEvents="none" style={[styles.answerBubble,styles.compactRomajiTag,{opacity:popAnimations[index].interpolate({inputRange:[0,.55,1],outputRange:[1,1,0]})}]}><Text numberOfLines={1} adjustsFontSizeToFit style={[styles.answerText,styles.compactRomajiText]}>{value}</Text></Animated.View>}{hammerHole===index&&<Animated.View pointerEvents="none" style={[styles.hammerEffect,{opacity:hammerSwing.interpolate({inputRange:[0,.15,1.8,2],outputRange:[0,1,1,0]}),transform:[{translateY:hammerSwing.interpolate({inputRange:[0,1,2],outputRange:[-35,8,2]})},{rotate:hammerSwing.interpolate({inputRange:[0,1,2],outputRange:['-55deg','-12deg','-20deg']})},{scale:hammerSwing.interpolate({inputRange:[0,1,2],outputRange:[.82,1.05,.95]})}]}]}><Image source={require('../assets/hammer.png')} style={styles.hammerImage}/><Image source={require('../assets/whack.png')} style={styles.impactImage}/></Animated.View>}</Pressable>)}</View>{feedback!=='idle'&&<View style={[styles.feedbackToast,feedback==='correct'?styles.feedbackCorrect:styles.feedbackWrong]}><Ionicons name={feedback==='correct'?'checkmark-circle':'close-circle'} size={21} color={feedback==='correct'?'#5FA53A':'#D5526B'}/><Text style={[styles.feedbackText,{color:feedback==='correct'?'#5FA53A':'#D5526B'}]}>{feedback==='correct'?'Great match!':'Try another mole!'}</Text></View>}</ImageBackground>;
}











