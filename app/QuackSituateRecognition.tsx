import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { router } from 'expo-router';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import BackIcon from '../assets/svg/back-icon.svg';
import QuackSituateExit from '../components/QuackSituateExit';
import { AuthContext } from '../context/AuthContext';
import expoconfig from '../expoconfig';
import { stylesRecognition as styles } from '../styles/stylesQuackSituateRecognition';

type Choice = { japanese: string; romaji: string };
type Question = {
  id: string;
  difficulty: 'STARTER' | 'HARD';
  order: number;
  location: string;
  sceneKey: string;
  imageUrl?: string;
  imageAlt?: string;
  scenario: string;
  hint: string;
  choices: Choice[];
  correctAnswer: string;
  explanation: string;
};

const pirateDeck = require('../assets/quacksituate/pirate-rescue/pirate-ship-deck.png');
const rescueOcean = require('../assets/quacksituate/pirate-rescue/rescue-ocean-mountains.png');
const rescueShip = require('../assets/quacksituate/pirate-rescue/ship-foreground.png');
const pirate = require('../assets/quacksituate/pirate-rescue/pirate-idle-cage-drop.png');
const pirateBlink = require('../assets/quacksituate/pirate-rescue/pirate-blink-cage-drop.png');
const pirateAngry = require('../assets/quacksituate/pirate-rescue/pirate-angry-cage-drop.png');
const pirateLaugh = require('../assets/quacksituate/pirate-rescue/pirate-laugh.png');
const cageAhiruIdle = require('../assets/quacksituate/pirate-rescue/cage-ahiru-idle.png');
const cageAhiruBlink = require('../assets/quacksituate/pirate-rescue/cage-ahiru-blink.png');
const cageAhiruCry = require('../assets/quacksituate/pirate-rescue/cage-ahiru-cry.png');
const cageAhiruSmile = require('../assets/quacksituate/pirate-rescue/cage-ahiru-smile.png');
const rescueSeaLayer = require('../assets/quacksituate/pirate-rescue/rescue-sea-layer.png');
const piratePortPlatform = require('../assets/quacksituate/pirate-rescue/pirate-port-platform.png');
const cageRopeBreaking = require('../assets/quacksituate/pirate-rescue/cage-rope-breaking.png');
const pirateAngel = require('../assets/quacksituate/pirate-rescue/pirate-angel-victory.png');
const angelAhiru = require('../assets/Angel.png');
const happyAhiru = require('../assets/hello.png');
const idleAhiru = require('../assets/idle.png');
const POINTS_PER_CORRECT_ANSWER = 10;
const sceneImages: Record<string, any> = {
  school: require('../assets/quacksituate/recognition-school-hallway-v2.png'),
  classroom: require('../assets/img/background/classroom a st2 day.png'),
  station: require('../assets/img/background/train_scene day.png'),
  office: require('../assets/content/office.png'),
  meal: require('../assets/img/background/school a s5st2 day.png'),
  home: require('../assets/words3_image/house.png'),
};
const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

function PirateActor({
  action,
  style,
  actionKey = 0,
  onImpact,
}: {
  action: 'idle' | 'laugh' | 'push';
  style: any;
  actionKey?: number;
  onImpact?: () => void;
}) {
  const [frameName, setFrameName] = useState<'neutral' | 'blink' | 'angry' | 'laugh'>('neutral');

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    if (action === 'push') {
      setFrameName('angry');
      if (onImpact) timers.push(setTimeout(onImpact, 360));
      timers.push(setTimeout(() => setFrameName('laugh'), 520));
      timers.push(setTimeout(() => setFrameName('neutral'), 980));
    } else if (action === 'laugh') {
      setFrameName('laugh');
      timers.push(setTimeout(() => setFrameName('blink'), 520));
      timers.push(setTimeout(() => setFrameName('laugh'), 720));
      timers.push(setTimeout(() => setFrameName('neutral'), 1280));
    } else {
      setFrameName('neutral');
      timers.push(setTimeout(() => setFrameName('blink'), 1750));
      timers.push(setTimeout(() => setFrameName('neutral'), 1980));
    }
    return () => {
      timers.forEach(clearTimeout);
    };
  }, [action, actionKey, onImpact]);

  const frameSource = frameName === 'blink'
    ? pirateBlink
    : frameName === 'angry'
      ? pirateAngry
      : frameName === 'laugh'
        ? pirateLaugh
      : pirate;

  return (
    <View pointerEvents="none" style={style}>
      <Animated.Image source={frameSource} resizeMode="contain" style={styles.pirateFrame} />
    </View>
  );
}

function CageActor({ mood, style, dropY, fall }: {
  mood: 'idle' | 'smile' | 'cry';
  style: any;
  dropY: Animated.AnimatedInterpolation<number>;
  fall: Animated.Value;
}) {
  const [frameSource, setFrameSource] = useState(cageAhiruIdle);

  useEffect(() => {
    const baseSource = mood === 'smile'
      ? cageAhiruSmile
      : mood === 'cry'
        ? cageAhiruCry
        : cageAhiruIdle;
    setFrameSource(baseSource);
    const reactionTimer = setTimeout(
      () => setFrameSource(cageAhiruBlink),
      mood === 'cry' ? 760 : 1850,
    );
    const restoreTimer = setTimeout(
      () => setFrameSource(baseSource),
      mood === 'cry' ? 970 : 2050,
    );
    return () => {
      clearTimeout(reactionTimer);
      clearTimeout(restoreTimer);
    };
  }, [mood]);

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [
            { translateY: Animated.add(dropY, fall.interpolate({ inputRange: [0, 0.18, 1], outputRange: [0, -10, 360] })) },
          ],
          opacity: fall.interpolate({ inputRange: [0, 0.72, 1], outputRange: [1, 1, 0] }),
        },
      ]}
    >
      <Animated.Image source={frameSource} style={styles.cageSprite} resizeMode="contain" />
    </Animated.View>
  );
}

function RescueEnvironment() {
  return (
    <>
      <Image source={rescueOcean} style={styles.rescueEnvironment} resizeMode="cover" />
      <Image source={rescueShip} style={styles.rescueShipForeground} resizeMode="contain" />
      <Image source={rescueSeaLayer} style={styles.rescueSeaAsset} resizeMode="stretch" />
    </>
  );
}

function RescueStage({
  danger,
  mode = 'live',
  pirateAction = 'idle',
  actionKey = 0,
  falling = false,
}: {
  danger: number;
  mode?: 'intro' | 'live' | 'failed';
  pirateAction?: 'idle' | 'laugh' | 'push';
  actionKey?: number;
  falling?: boolean;
}) {
  const [stageHeight, setStageHeight] = useState(320);
  const drop = useRef(new Animated.Value(0)).current;
  const ropeDrop = useRef(new Animated.Value(0)).current;
  const oceanSway = useRef(new Animated.Value(0)).current;
  const fall = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const nextDanger = Math.min(1, danger);
    Animated.parallel([
      Animated.timing(drop, {
        toValue: nextDanger,
        duration: 620,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(ropeDrop, {
        toValue: nextDanger,
        duration: 620,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
  }, [danger, drop, ropeDrop]);

  useEffect(() => {
    if (!falling) {
      fall.setValue(0);
      return;
    }
    Animated.sequence([
      Animated.delay(680),
      Animated.timing(fall, {
        toValue: 1,
        duration: 720,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fall, falling]);

  useEffect(() => {
    const sea = Animated.loop(
      Animated.sequence([
        Animated.timing(oceanSway, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          isInteraction: false,
          useNativeDriver: true,
        }),
        Animated.timing(oceanSway, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          isInteraction: false,
          useNativeDriver: true,
        }),
      ]),
    );
    sea.start();
    return () => {
      sea.stop();
    };
  }, [oceanSway]);

  // Keep the cage visible while each lost life lowers it toward the water.
  const cageTravel = Math.min(118, Math.max(72, stageHeight * 0.32));
  const ropeBaseHeight = Math.max(42, stageHeight * 0.13);
  const cageY = drop.interpolate({
    inputRange: [0, 1],
    outputRange: [0, cageTravel],
  });
  const ropeHeight = ropeDrop.interpolate({
    inputRange: [0, 1],
    outputRange: [ropeBaseHeight, ropeBaseHeight + cageTravel],
  });
  const seaY = oceanSway.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -4],
  });
  const cageMood = mode === 'failed' || danger >= 0.5
    ? 'cry'
    : pirateAction === 'idle' && danger < 0.18
      ? 'smile'
      : 'idle';

  return (
    <View
      style={styles.rescueStage}
      onLayout={(event) => setStageHeight(event.nativeEvent.layout.height)}
    >
      <RescueEnvironment />
      <Animated.View style={[styles.seaGlint, { transform: [{ translateY: seaY }] }]} />
      <View style={styles.rescueMechanism}>
        <Image source={piratePortPlatform} style={styles.portPlatformSprite} resizeMode="contain" />
        <PirateActor
          action={mode === 'failed' ? 'laugh' : pirateAction}
          style={styles.rescuePirate}
          actionKey={actionKey}
        />
        <View style={styles.pulleyBeam} />
        {!falling && (
          <Animated.View
            pointerEvents="none"
            style={[styles.dynamicCageRope, { height: ropeHeight }]}
          >
            <View style={styles.ropeHighlight} />
          </Animated.View>
        )}
        {falling && (
          <Animated.Image
            source={cageRopeBreaking}
            style={[
              styles.breakingRopeSprite,
              { opacity: fall.interpolate({ inputRange: [0, 0.18, 0.7, 1], outputRange: [0, 1, 0.7, 0] }) },
            ]}
            resizeMode="contain"
          />
        )}
        <CageActor
          mood={cageMood}
          style={styles.rescueCage}
          dropY={cageY}
          fall={fall}
        />
      </View>
      <View style={styles.edgeMarker}>
        <Ionicons name="water" size={12} color="#FFF" />
        <Text style={styles.edgeMarkerText}>SEA BELOW</Text>
      </View>
      <View style={styles.dropMeter}>
        <View style={styles.dropMeterSafe} />
        <View style={styles.dropMeterRisk} />
        <Animated.View
          style={[
            styles.rescueMeterToken,
            {
              transform: [{
                translateY: drop.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 72],
                }),
              }],
            },
          ]}
        >
          <Ionicons name="paw" size={12} color="#FFF" />
        </Animated.View>
      </View>
    </View>
  );
}

function RescueAftermathStage({ actionKey }: { actionKey: number }) {
  return (
    <View style={styles.rescueStage}>
      <RescueEnvironment />
      <View style={styles.rescueMechanism}>
        <Image source={piratePortPlatform} style={styles.portPlatformSprite} resizeMode="contain" />
        <PirateActor
          action="laugh"
          style={styles.rescuePirate}
          actionKey={actionKey}
        />
      </View>
      <View style={styles.aftermathWaterline}>
        <Ionicons name="water" size={13} color="#FFFFFF" />
        <Text style={styles.aftermathWaterlineText}>THE CAGE HAS FALLEN</Text>
      </View>
    </View>
  );
}

function VictoryRescueStage() {
  const angelRise = useRef(new Animated.Value(116)).current;
  const [ahiruFrame, setAhiruFrame] = useState(happyAhiru);

  useEffect(() => {
    const frameTimer = setInterval(() => {
      setAhiruFrame((current: any) => current === happyAhiru ? idleAhiru : happyAhiru);
    }, 850);
    Animated.sequence([
      Animated.delay(450),
      Animated.timing(angelRise, {
        toValue: -24,
        duration: 5000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
    return () => clearInterval(frameTimer);
  }, [angelRise]);

  return (
    <View style={styles.victoryRescueStage}>
      <Image source={rescueOcean} style={styles.victoryEnvironment} resizeMode="cover" />
      <View style={styles.victoryShade} />
      <Image source={piratePortPlatform} style={styles.victoryPlatform} resizeMode="contain" />
      <Image source={ahiruFrame} style={styles.victoryAhiru} resizeMode="contain" />
      <View style={styles.victoryAngelWindow}>
        <Animated.Image
          source={pirateAngel}
          style={[styles.victoryPirateAngel, { transform: [{ translateY: angelRise }] }]}
          resizeMode="cover"
        />
      </View>
      <View style={styles.victorySceneBadge}>
        <Ionicons name="boat-outline" size={13} color="#FFFFFF" />
        <Text style={styles.victorySceneBadgeText}>AHIRU IS SAFE</Text>
      </View>
    </View>
  );
}

function ReactionModal({ visible, correct, failed, danger, actionKey, selected, question, onContinue }: {
  visible: boolean;
  correct: boolean;
  failed: boolean;
  danger: number;
  actionKey: number;
  selected: Choice | null;
  question: Question;
  onContinue: () => void;
}) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.reactionShade}>
        <View style={styles.reactionCard}>
          <View style={styles.reactionScene}>
            <RescueStage
              danger={danger}
              mode={failed ? 'failed' : 'live'}
              pirateAction={correct ? 'idle' : 'push'}
              actionKey={actionKey}
              falling={failed}
            />
            <View style={[styles.reactionTag, correct ? styles.reactionTagGood : styles.reactionTagWrong]}>
              <Text style={styles.reactionTagText}>
                {correct ? '+100 · CAGE HELD' : failed ? 'THE ROPE BROKE!' : 'CAGE LOWERED'}
              </Text>
            </View>
          </View>
          <View style={styles.reactionCopy}>
            <Text style={[styles.modalEyebrow, !correct && styles.wrongEyebrow]}>
              {correct ? 'AHIRU IS SAFER' : failed ? 'RESCUE FAILED' : 'ONE LEVEL LOWER'}
            </Text>
            <Text style={styles.modalTitle}>
              {correct ? 'That phrase fits!' : failed ? 'The rescue line has given way.' : 'Ahiru is one step closer to the waves.'}
            </Text>
            {!correct && (
              <>
                <View style={styles.answerReview}>
                  <Text style={styles.answerReviewLabel}>YOU CHOSE</Text>
                  <Text style={styles.answerReviewValue}>{selected?.japanese}</Text>
                  <Text style={styles.answerReviewLabel}>BEST PHRASE</Text>
                  <Text style={styles.correctJapanese}>{question.correctAnswer}</Text>
                  <Text style={styles.correctRomaji}>
                    {question.choices.find((item) => item.japanese === question.correctAnswer)?.romaji}
                  </Text>
                </View>
                <View style={styles.explanationBox}>
                  <Ionicons name="compass-outline" size={18} color="#65A936" />
                  <Text style={styles.modalBody}>{question.explanation}</Text>
                </View>
              </>
            )}
            {correct && (
              <Text style={styles.modalBody}>
                The pirate grumbles while Ahiru celebrates your natural Japanese.
              </Text>
            )}
            <Pressable style={styles.primaryButton} onPress={onContinue}>
              <Text style={styles.primaryButtonText}>
                {failed ? 'FOLLOW AHIRU' : 'CONTINUE RESCUE'}
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function QuackSituateRecognition() {
  const { user } = useContext(AuthContext);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<Choice | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [easyMistakes, setEasyMistakes] = useState(0);
  const [hardMistakes, setHardMistakes] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [phase, setPhase] = useState<'intro' | 'quiz' | 'gameover'>('intro');
  const [introStep, setIntroStep] = useState(0);
  const [briefingStep, setBriefingStep] = useState(0);
  const [typedNarration, setTypedNarration] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hintVisible, setHintVisible] = useState(false);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [levelVisible, setLevelVisible] = useState(false);
  const [completeVisible, setCompleteVisible] = useState(false);
  const [exitVisible, setExitVisible] = useState(false);
  const [lastCorrect, setLastCorrect] = useState(false);
  const [lastFailed, setLastFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const musicRef = useRef<Audio.Sound | null>(null);
  const sfxRef = useRef<Audio.Sound | null>(null);
  const feedbackSfxTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const remoteSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const angelRise = useRef(new Animated.Value(0)).current;
  const [gameOverStageHeight, setGameOverStageHeight] = useState(0);
  const storageKey = `ahiru-rescue:${String(user?.email || 'guest').toLowerCase()}`;

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);

    const restore = async () => {
      try {
        const response = await fetch(
          `${expoconfig.API_URL}/api/situational/questions?gameType=RECOGNITION&activeOnly=true`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error('questions');
        const data: Question[] = await response.json();
        const ordered = [...data]
          .sort((a, b) => a.order - b.order)
          .map((item) => ({ ...item, choices: shuffle(item.choices) }));
        if (!mounted) return;
        setQuestions(ordered);
        setError(ordered.length ? '' : 'No published rescue missions were found.');

        const localValue = await AsyncStorage.getItem(storageKey);
        let run = localValue ? JSON.parse(localValue) : null;
        if (user?.email) {
          try {
            const runResponse = await fetch(
              `${expoconfig.API_URL}/api/situational/runs/current?email=${encodeURIComponent(user.email)}&gameType=RECOGNITION`,
              { signal: controller.signal },
            );
            if (runResponse.ok && runResponse.status !== 204) {
              run = await runResponse.json();
            }
          } catch {
            // Offline/local fallback intentionally retained.
          }
        }
        if (run && ordered.length) {
          const restoredIndex = Number(run.questionIndex ?? run.index) || 0;
          setIndex(Math.min(restoredIndex, ordered.length - 1));
          setCorrectCount(Number(run.correctCount) || 0);
          setEasyMistakes(Number(run.easyMistakes) || 0);
          setHardMistakes(Number(run.hardMistakes) || 0);
          setHintsUsed(Number(run.hintsUsed) || 0);
          // Always present the story prologue and tutorial when the mission is opened.
          // The run itself remains restored, so BEGIN/CONTINUE still resumes the exact trial.
          setIntroStep(0);
          setTypedNarration('');
          setPhase('intro');
        }
      } catch {
        if (mounted) setError('The rescue missions took too long to load. Please try again.');
      } finally {
        clearTimeout(timeout);
        if (mounted) setLoading(false);
      }
    };
    void restore();
    return () => {
      mounted = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [storageKey, user?.email]);

  useEffect(() => {
    let cancelled = false;
    Audio.Sound.createAsync(
      require('../assets/audio/sfx/quackmanbg.mp3'),
      { isLooping: true, volume: 0.14, shouldPlay: true },
    ).then(({ sound }) => {
      if (cancelled) void sound.unloadAsync();
      else musicRef.current = sound;
    }).catch(() => undefined);
    return () => {
      cancelled = true;
      const sound = musicRef.current;
      musicRef.current = null;
      if (sound) void sound.stopAsync().finally(() => sound.unloadAsync());
    };
  }, []);

  useEffect(() => () => {
    feedbackSfxTimers.current.forEach(clearTimeout);
    feedbackSfxTimers.current = [];
  }, []);

  useEffect(() => {
    if (phase !== 'intro') return;
    if (introStep === 1) void playSfx(require('../assets/audio/sfx/incorrect_sfx.mp3'));
    if (introStep === 2) void playSfx(require('../assets/audio/sfx/quackmanselect.mp3'));
    if (introStep === 3) {
      feedbackSfxTimers.current.push(setTimeout(() => {
        void playSfx(require('../assets/audio/sfx/whack.mp3'));
      }, 370));
    }
  }, [introStep, phase]);

  useEffect(() => {
    const narration = 'Across the Sea of Words, a pirate monster has captured Ahiru and locked the little bird inside a hanging cage. From a small port above the waves, the pirate controls the rope. Every unnatural reply lowers the cage toward the sea, while every natural Japanese phrase keeps Ahiru safe. Choose carefully before the final rope gives way.';
    if (phase !== 'intro' || introStep !== 0) return;
    setTypedNarration('');
    let position = 0;
    const timer = setInterval(() => {
      position += 1;
      setTypedNarration(narration.slice(0, position));
      if (position >= narration.length) clearInterval(timer);
    }, 19);
    return () => clearInterval(timer);
  }, [introStep, phase]);

  useEffect(() => {
    if (phase !== 'gameover' || gameOverStageHeight <= 0) return;
    angelRise.setValue(0);
    Animated.sequence([
      Animated.delay(650),
      Animated.timing(angelRise, {
        // The sprite begins below this container and leaves through its top.
        toValue: -(gameOverStageHeight + 220),
        duration: 8200,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
    ]).start();
    void playSfx(require('../assets/audio/sfx/incorrect.mp3'));
  }, [angelRise, gameOverStageHeight, phase]);

  useEffect(() => {
    if (!questions.length || phase !== 'quiz') return;
    const run = {
      index,
      questionIndex: index,
      correctCount,
      easyMistakes,
      hardMistakes,
      hintsUsed,
    };
    void AsyncStorage.setItem(storageKey, JSON.stringify(run));
    if (!user?.email) return;
    if (remoteSaveTimer.current) clearTimeout(remoteSaveTimer.current);
    remoteSaveTimer.current = setTimeout(() => {
      void fetch(`${expoconfig.API_URL}/api/situational/runs/current`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...run,
          email: user.email,
          gameType: 'RECOGNITION',
        }),
      }).catch(() => undefined);
    }, 450);
    return () => {
      if (remoteSaveTimer.current) clearTimeout(remoteSaveTimer.current);
    };
  }, [index, correctCount, easyMistakes, hardMistakes, hintsUsed, phase, questions.length, storageKey, user?.email]);

  const question = questions[index];
  const isHard = question?.difficulty === 'HARD';
  const mistakes = isHard ? hardMistakes : easyMistakes;
  const maxMistakes = isHard ? 3 : 6;
  const chances = Math.max(0, maxMistakes - mistakes);
  const danger = maxMistakes ? mistakes / maxMistakes : 0;
  const progress = questions.length ? ((index + 1) / questions.length) * 100 : 0;
  const score = correctCount * POINTS_PER_CORRECT_ANSWER;
  const maximumScore = questions.length * POINTS_PER_CORRECT_ANSWER;
  const phaseTotal = isHard ? 10 : 15;
  const phaseNumber = isHard ? index - 14 : index + 1;
  const briefing = [
    {
      icon: 'scan-outline' as const,
      eyebrow: 'STEP 1 OF 3 · ASSESS',
      title: 'Read the social setting.',
      body: 'Check the location, relationship, and speaker. These clues reveal the politeness the moment needs.',
    },
    {
      icon: 'chatbubbles-outline' as const,
      eyebrow: 'STEP 2 OF 3 · RESPOND',
      title: 'Choose the natural reply.',
      body: 'Compare each Japanese phrase. Select the response that sounds natural for both the situation and the listener.',
    },
    {
      icon: 'lock-closed-outline' as const,
      eyebrow: 'STEP 3 OF 3 · SECURE',
      title: 'Hold the rescue line.',
      body: 'A natural reply keeps the cage steady. A mistake extends the rope and lowers Ahiru one level toward the sea.',
    },
  ][briefingStep];
  const sceneImage = useMemo(() => {
    if (question?.imageUrl) {
      return {
        uri: question.imageUrl.startsWith('http')
          ? question.imageUrl
          : `${expoconfig.API_URL}${question.imageUrl}`,
      };
    }
    return sceneImages[question?.sceneKey] || sceneImages.school;
  }, [question?.imageUrl, question?.sceneKey]);

  const playSfx = async (source: any) => {
    try {
      if (sfxRef.current) await sfxRef.current.unloadAsync();
      const { sound } = await Audio.Sound.createAsync(source, { volume: 0.55, shouldPlay: true });
      sfxRef.current = sound;
    } catch {}
  };

  const submit = () => {
    if (!selected || !question) return;
    const correct = selected.japanese === question.correctAnswer;
    const nextMistakes = mistakes + (correct ? 0 : 1);
    setLastCorrect(correct);
    setLastFailed(!correct && nextMistakes >= maxMistakes);
    if (correct) {
      setCorrectCount((value) => value + 1);
      void playSfx(require('../assets/audio/sfx/correct_sfx.mp3'));
    } else {
      if (isHard) setHardMistakes(nextMistakes);
      else setEasyMistakes(nextMistakes);
      feedbackSfxTimers.current.push(setTimeout(() => {
        void playSfx(require('../assets/audio/sfx/whack.mp3'));
      }, 370));
      feedbackSfxTimers.current.push(setTimeout(() => {
        void playSfx(require('../assets/audio/sfx/quackmanselect.mp3'));
      }, 760));
    }
    setFeedbackVisible(true);
  };

  const saveAttempt = async () => {
    if (!user?.email) return;
    setSaving(true);
    try {
      await fetch(`${expoconfig.API_URL}/api/situational/attempts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          name: `${user.fname || ''} ${user.lname || ''}`.trim(),
          gameType: 'RECOGNITION',
          difficulty: 'STARTER_AND_HARD',
          score,
          maxScore: maximumScore,
          totalQuestions: questions.length,
          correctAnswers: correctCount,
          completed: true,
        }),
      });
      await AsyncStorage.removeItem(storageKey);
      await fetch(
        `${expoconfig.API_URL}/api/situational/runs/current?email=${encodeURIComponent(user.email)}&gameType=RECOGNITION`,
        { method: 'DELETE' },
      ).catch(() => undefined);
    } finally {
      setSaving(false);
    }
  };

  const continueAfterFeedback = () => {
    setFeedbackVisible(false);
    setSelected(null);
    if (lastFailed) {
      setPhase('gameover');
      return;
    }
    if (index === 14 && questions.length > 15) {
      setLevelVisible(true);
      return;
    }
    if (index >= questions.length - 1) {
      void saveAttempt().finally(() => setCompleteVisible(true));
      return;
    }
    setIndex((value) => value + 1);
  };

  const resetGame = async () => {
    await AsyncStorage.removeItem(storageKey);
    if (user?.email) {
      await fetch(
        `${expoconfig.API_URL}/api/situational/runs/current?email=${encodeURIComponent(user.email)}&gameType=RECOGNITION`,
        { method: 'DELETE' },
      ).catch(() => undefined);
    }
    setIndex(0);
    setCorrectCount(0);
    setEasyMistakes(0);
    setHardMistakes(0);
    setHintsUsed(0);
    setSelected(null);
    setPhase('quiz');
  };

  if (isExiting) {
    return (
      <QuackSituateExit
        color="#7B45D1"
        icon="boat-outline"
        title="Rescue paused"
        subtitle="Your mission marker is secure. Ahiru will be waiting at this exact trial."
        status="SECURING YOUR MISSION"
        onComplete={() => router.replace({ pathname: '/QuackSituate', params: { skipLoading: '1' } })}
      />
    );
  }
  if (loading) {
    return <View style={styles.centerState}><ActivityIndicator size="large" color="#8423D9" /><Text style={styles.stateTitle}>Preparing Ahiru’s rescue...</Text></View>;
  }
  if (!question) {
    return <View style={styles.centerState}><Ionicons name="cloud-offline-outline" size={38} color="#8423D9" /><Text style={styles.stateTitle}>Rescue missions could not load</Text><Text style={styles.stateText}>{error}</Text><Pressable style={styles.primaryButton} onPress={() => router.back()}><Text style={styles.primaryButtonText}>Return</Text></Pressable></View>;
  }

  if (phase === 'intro') {
    return (
      <Pressable style={styles.storyScreen} onPress={() => introStep < 3 && setIntroStep((value) => value + 1)}>
        <Image source={pirateDeck} style={styles.storyFullBackground} resizeMode="cover" />
        <View style={introStep === 0 ? styles.storyShade : styles.storyDarkShade} />
        <Pressable style={styles.storyBack} onPress={() => router.back()}><BackIcon width={22} height={22} fill="#432653" /></Pressable>
        <View style={styles.storyBadge}><Ionicons name="lock-closed-outline" size={15} color="#7B45D1" /><Text style={styles.storyBadgeText}>AHIRU RESCUE · CAGE DROP</Text></View>

        {introStep === 1 && (
          <>
            <View style={styles.introStageWrap}><RescueStage danger={0.08} mode="intro" pirateAction="idle" /></View>
            <View style={[styles.characterDialogue, styles.ahiruDialogue]}>
              <Text style={styles.dialogueSpeaker}>AHIRU</Text>
              <Text style={styles.dialogueJapanese}>たすけて！ おりが海に落ちちゃう！</Text>
              <Text style={styles.dialogueRomaji}>Tasukete! Ori ga umi ni ochichau!</Text>
            </View>
          </>
        )}

        {introStep === 2 && (
          <>
            <View style={styles.introStageWrap}><RescueStage danger={0.28} mode="intro" pirateAction="laugh" /></View>
            <View style={[styles.characterDialogue, styles.pirateDialogue]}>
              <Text style={styles.dialogueSpeaker}>PIRATE MONSTER</Text>
              <Text style={styles.dialogueJapanese}>ハハハ！ まちがえたら、おりを下げるぞ！</Text>
              <Text style={styles.dialogueRomaji}>Hahaha! Machigaetara, ori o sageru zo!</Text>
            </View>
          </>
        )}

        {introStep === 3 && (
          <>
            <View style={styles.introStageWrap}><RescueStage danger={0.36} mode="intro" pirateAction="push" actionKey={introStep} /></View>
            <View style={[styles.storyPanel, styles.briefingPanel]}>
              <View style={styles.tutorialHeading}>
                <View style={styles.tutorialIconPurple}>
                  <Ionicons name={briefing.icon} size={22} color="#FFFFFF" />
                </View>
                <View style={styles.tutorialHeadingCopy}>
                  <Text style={styles.storyEyebrowAccent}>RESCUE BRIEFING</Text>
                  <Text style={styles.briefingTitle}>{briefing.title}</Text>
                </View>
              </View>
              <View style={styles.briefingProgress}>
                {[0, 1, 2].map((step) => (
                  <View
                    key={step}
                    style={[
                      styles.briefingProgressStep,
                      step <= briefingStep && styles.briefingProgressStepActive,
                    ]}
                  >
                    <Ionicons
                      name={step < briefingStep ? 'checkmark' : step === 0 ? 'scan-outline' : step === 1 ? 'chatbubbles-outline' : 'lock-closed-outline'}
                      size={13}
                      color={step <= briefingStep ? '#FFFFFF' : '#9A8DA0'}
                    />
                    <Text style={[
                      styles.briefingProgressStepText,
                      step <= briefingStep && styles.briefingProgressStepTextActive,
                    ]}>
                      0{step + 1}
                    </Text>
                  </View>
                ))}
              </View>
              <Text style={styles.briefingStepLabel}>{briefing.eyebrow}</Text>
              <Text style={styles.briefingBody}>{briefing.body}</Text>
              {briefingStep === 2 && (
                <View style={styles.storyRules}>
                  <View style={[styles.storyRule, styles.briefingRule]}><Ionicons name="heart" size={17} color="#84D943" /><Text style={styles.briefingRuleText}>6 Starter lives</Text></View>
                  <View style={[styles.storyRule, styles.briefingRule]}><Ionicons name="flame" size={17} color="#E58B2A" /><Text style={styles.briefingRuleText}>3 Hard lives</Text></View>
                </View>
              )}
              <Pressable
                style={styles.primaryButton}
                onPress={() => {
                  if (briefingStep < 2) {
                    setBriefingStep((value) => value + 1);
                    return;
                  }
                  setPhase('quiz');
                }}
              >
                <Text style={styles.primaryButtonText}>
                  {briefingStep < 2 ? 'NEXT BRIEFING STEP' : index > 0 ? 'CONTINUE THE MISSION' : 'BEGIN THE RESCUE'}
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#FFF" />
              </Pressable>
            </View>
          </>
        )}

        {introStep === 0 && (
          <View style={styles.narrationPanel}>
            <Text style={styles.narrationEyebrow}>PROLOGUE · THE HANGING CAGE</Text>
            <Text style={styles.narrationText}>{typedNarration}</Text>
            <Text style={styles.narrationContinue}>Tap to continue  ›</Text>
          </View>
        )}
        {introStep > 0 && introStep < 3 && <Text style={styles.sceneTap}>Tap to continue  ›</Text>}
      </Pressable>
    );
  }

  if (phase === 'gameover') {
    return (
      <ImageBackground source={pirateDeck} style={styles.storyScreen} resizeMode="cover">
        <View style={styles.storyDarkShade} />
        <View
          style={styles.gameOverStage}
          onLayout={(event) => setGameOverStageHeight(event.nativeEvent.layout.height)}
        >
          <RescueAftermathStage actionKey={index + 1000} />
          <Animated.Image
            source={angelAhiru}
            style={[styles.gameOverAngel, { transform: [{ translateY: angelRise }] }]}
            resizeMode="contain"
          />
        </View>
        <View style={[styles.storyPanel, styles.failurePanel]}>
          <View style={styles.failureHeading}>
            <View style={styles.failureSeal}>
              <Ionicons name="shield-outline" size={23} color="#FFFFFF" />
            </View>
            <View style={styles.endingHeaderCopy}>
              <Text style={styles.failureEyebrow}>RESCUE REPORT</Text>
              <Text style={styles.endingTitle}>Ahiru is counting on you.</Text>
            </View>
          </View>

          <View style={styles.failureStatusCard}>
            <View style={styles.failureStatusMarker} />
            <View style={styles.failureStatusCopy}>
              <Text style={styles.failureStatusLabel}>MISSION STATUS</Text>
              <Text style={styles.failureStatusTitle}>Rescue incomplete</Text>
              <Text style={styles.failureStatusText}>
                Regroup, read the situation carefully, and return with a stronger reply.
              </Text>
            </View>
          </View>

          <Text style={styles.failureChecklistLabel}>YOUR NEXT-ATTEMPT CHECKLIST</Text>
          <View style={styles.failureChecklist}>
            <View style={styles.failureChecklistItem}>
              <Ionicons name="person-outline" size={15} color="#8423D9" />
              <Text style={styles.failureChecklistText}>Speaker</Text>
            </View>
            <View style={styles.failureChecklistItem}>
              <Ionicons name="location-outline" size={15} color="#8423D9" />
              <Text style={styles.failureChecklistText}>Setting</Text>
            </View>
            <View style={styles.failureChecklistItem}>
              <Ionicons name="chatbubble-ellipses-outline" size={15} color="#8423D9" />
              <Text style={styles.failureChecklistText}>Tone</Text>
            </View>
          </View>

          <Pressable style={styles.primaryButton} onPress={() => void resetGame()}>
            <Text style={styles.primaryButtonText}>BEGIN A NEW RESCUE</Text>
            <Ionicons name="refresh" size={18} color="#FFF" />
          </Pressable>
          <Pressable style={styles.failureSecondaryButton} onPress={() => setIsExiting(true)}>
            <Ionicons name="map-outline" size={16} color="#75428D" />
            <Text style={styles.modalSecondaryText}>Return to mission map</Text>
          </Pressable>
        </View>
      </ImageBackground>
    );
  }

  return (
    <View style={styles.screen}>
      <View pointerEvents="none" style={styles.quizThemeBackground}>
        <View style={styles.quizThemeOrbLarge} />
        <View style={styles.quizThemeOrbSmall} />
        <View style={styles.quizThemeWave} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <Pressable style={styles.backButton} onPress={() => setExitVisible(true)}><BackIcon width={19} height={19} fill="#462A5E" /></Pressable>
          <View style={styles.brandBlock}>
            <Text style={styles.brandEyebrow}>AHIRU RESCUE</Text>
            <Text style={styles.brandTitle}>Cage Drop</Text>
            <View style={styles.headerMissionMeta}>
              <View style={[styles.levelPill, isHard && styles.hardPill]}>
                <Ionicons name={isHard ? 'flame' : 'leaf'} size={12} color={isHard ? '#D87D19' : '#65A936'} />
                <Text style={[styles.levelPillText, isHard && styles.hardPillText]}>
                  {isHard ? 'HARD DECK' : 'STARTER DECK'}
                </Text>
              </View>
              <Text style={styles.phaseText}>{phaseNumber} / {phaseTotal}</Text>
            </View>
          </View>
          <View style={styles.missionScoreBadge}>
            <Ionicons name="star" size={16} color="#FFD86A" />
            <Text style={styles.missionScoreValue}>{score}</Text>
            <Text style={styles.missionScoreLabel}>SCORE</Text>
          </View>
        </View>
        <View style={styles.quizLivesCard}>
          <View>
            <Text style={styles.quizLivesEyebrow}>RESCUE LIVES</Text>
            <Text style={styles.quizLivesText}>{chances} {chances === 1 ? 'chance remains' : 'chances remain'}</Text>
          </View>
          <View style={styles.lifeIcons}>
            {Array.from({ length: maxMistakes }).map((_, lifeIndex) => (
              <Ionicons
                key={lifeIndex}
                name={lifeIndex < chances ? 'heart' : 'heart-dislike'}
                size={17}
                color={lifeIndex < chances ? '#D94C66' : '#C9BECF'}
              />
            ))}
          </View>
        </View>
        <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress}%` }]} /></View>
        <View style={styles.introCopy}><Text style={styles.introTitle}>Choose the phrase. Hold the cage.</Text><Text style={styles.introText}>Use the relationship and scene clues before the pirate lowers Ahiru toward the sea.</Text></View>

        <View style={styles.sceneCard}>
          <View style={styles.sceneMedia}><Image source={sceneImage} style={styles.sceneBackdrop} resizeMode="cover" blurRadius={10} /><View style={styles.sceneBackdropTint} /><Image source={sceneImage} style={styles.scenePicture} resizeMode="contain" /><View style={styles.locationPill}><Ionicons name="location" size={14} color="#FFF" /><Text style={styles.locationText}>{question.location}</Text></View></View>
          <View style={styles.scenarioCopy}><View style={styles.scenarioHeading}><View style={styles.scenarioMarker}><Ionicons name="chatbubble-ellipses" size={14} color="#65A936" /></View><Text style={styles.scenarioLabel}>WHAT WOULD YOU SAY?</Text></View><Text style={styles.scenarioText}>{question.scenario}</Text></View>
        </View>

        <View style={styles.answerHeader}><View><Text style={styles.answerTitle}>Choose your response</Text><Text style={styles.answerSubtitle}>One phrase keeps Ahiru safe</Text></View><Pressable style={styles.hintButton} onPress={() => { setHintsUsed((value) => value + 1); setHintVisible(true); }}><Ionicons name="bulb-outline" size={20} color="#8423D9" /><Text style={styles.hintButtonText}>Hint</Text></Pressable></View>
        <View style={styles.choices}>{question.choices.map((choice, choiceIndex) => { const active = selected?.japanese === choice.japanese; return <Pressable key={`${choice.japanese}-${choiceIndex}`} style={[styles.choiceCard, active && styles.choiceCardActive]} onPress={() => setSelected(choice)}><View style={[styles.choiceMarker, active && styles.choiceMarkerActive]}><Text style={[styles.choiceMarkerText, active && styles.choiceMarkerTextActive]}>{String.fromCharCode(65 + choiceIndex)}</Text></View><View style={styles.choiceCopy}><Text style={styles.choiceJapanese}>{choice.japanese}</Text><Text style={styles.choiceRomaji}>{choice.romaji}</Text></View><Ionicons name={active ? 'checkmark-circle' : 'ellipse-outline'} size={23} color={active ? '#A95BE8' : '#D7CBDB'} /></Pressable>; })}</View>
        <Pressable disabled={!selected} style={[styles.submitButton, !selected && styles.submitButtonDisabled]} onPress={submit}><Text style={styles.submitText}>LOCK IN PHRASE</Text><Ionicons name="arrow-forward" size={19} color="#FFF" /></Pressable>
      </ScrollView>

      <Modal transparent visible={hintVisible} animationType="fade" onRequestClose={() => setHintVisible(false)}><View style={styles.modalShade}><View style={styles.modalCard}><View style={styles.modalIconSoft}><Ionicons name="bulb-outline" size={29} color="#D88B19" /></View><Text style={styles.modalEyebrow}>RESCUE HINT</Text><Text style={styles.modalTitle}>Read the social clue</Text><Text style={styles.modalBody}>{question.hint}</Text><Pressable style={styles.modalSecondary} onPress={() => setHintVisible(false)}><Text style={styles.modalSecondaryText}>Back to the rescue</Text></Pressable></View></View></Modal>
      <ReactionModal
        visible={feedbackVisible}
        correct={lastCorrect}
        failed={lastFailed}
        danger={lastCorrect ? danger : Math.min(1, danger + (1 / maxMistakes))}
        actionKey={index + mistakes * 100}
        selected={selected}
        question={question}
        onContinue={continueAfterFeedback}
      />
      <Modal transparent visible={levelVisible} animationType="fade"><View style={styles.modalShade}><View style={styles.levelCard}><View style={styles.hardIcon}><Ionicons name="flame" size={34} color="#FFF" /></View><Text style={styles.levelEyebrow}>STARTER DECK CLEARED</Text><Text style={styles.levelTitle}>The pirate raises the stakes</Text><Text style={styles.levelBody}>Hard mode gives only three chances. Read every social cue closely.</Text><View style={styles.levelStats}><Text>15 trials cleared</Text><Text>{correctCount} correct</Text></View><Pressable style={styles.primaryButton} onPress={() => { setLevelVisible(false); setIndex(15); }}><Text style={styles.primaryButtonText}>BEGIN HARD RESCUE</Text><Ionicons name="flame" size={18} color="#FFF" /></Pressable></View></View></Modal>
      <Modal transparent visible={completeVisible} animationType="fade"><View style={styles.modalShade}><View style={[styles.modalCard, styles.successCard]}><VictoryRescueStage /><View style={styles.successRibbon}><Ionicons name="shield-checkmark" size={14} color="#FFFFFF" /><Text style={styles.successRibbonText}>RESCUE COMPLETE</Text></View><Text style={styles.modalTitle}>Ahiru is safely back on deck!</Text><View style={styles.scoreMedallion}><Text style={styles.finalScore}>{score}</Text><Text style={styles.scoreMedallionLabel}>OF {maximumScore} POINTS</Text></View><View style={styles.successStats}><View style={styles.successStat}><Text style={styles.successStatValue}>{correctCount}</Text><Text style={styles.successStatLabel}>NATURAL PHRASES</Text></View><View style={styles.successStatDivider} /><View style={styles.successStat}><Text style={styles.successStatValue}>{questions.length}</Text><Text style={styles.successStatLabel}>TOTAL TRIALS</Text></View></View><Text style={styles.modalBody}>{saving ? 'Securing your rescue record...' : 'Your result is now reflected in QuackProgress and your teacher’s report.'}</Text><Pressable disabled={saving} style={styles.primaryButton} onPress={() => { setCompleteVisible(false); setIsExiting(true); }}><Text style={styles.primaryButtonText}>CONTINUE TO YOUR REPORT</Text><Ionicons name="arrow-forward" size={18} color="#FFF" /></Pressable></View></View></Modal>
      <Modal transparent visible={exitVisible} animationType="fade" onRequestClose={() => setExitVisible(false)}><View style={styles.modalShade}><View style={styles.modalCard}><View style={[styles.modalIconSoft, styles.pauseIcon]}><Ionicons name="bookmark-outline" size={28} color="#8423D9" /></View><Text style={styles.modalEyebrow}>PAUSE THIS MISSION?</Text><Text style={styles.modalTitle}>Save your progress for later.</Text><Text style={styles.modalBody}>Your current trial, score, and remaining lives will be restored when you return.</Text><Pressable style={styles.primaryButton} onPress={() => { setExitVisible(false); setIsExiting(true); }}><Text style={styles.primaryButtonText}>SAVE &amp; RETURN</Text></Pressable><Pressable style={styles.modalSecondary} onPress={() => setExitVisible(false)}><Text style={styles.modalSecondaryText}>Continue playing</Text></Pressable></View></View></Modal>
    </View>
  );
}
