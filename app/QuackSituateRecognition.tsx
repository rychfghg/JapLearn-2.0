import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { router } from 'expo-router';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
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
const plankProp = require('../assets/quacksituate/pirate-rescue/plank-prop.png');
const pirate = require('../assets/quacksituate/pirate-rescue/pirate-neutral.png');
const piratePush = require('../assets/quacksituate/pirate-rescue/pirate-push.png');
const pirateLaugh = require('../assets/quacksituate/pirate-rescue/pirate-laugh.png');
const pirateTauntOpen = require('../assets/quacksituate/pirate-rescue/pirate-taunt-open.png');
const tiedAhiru = require('../assets/quacksituate/pirate-rescue/tied-ahiru-worried.png');
const tiedAhiruHelp = require('../assets/quacksituate/pirate-rescue/tied-ahiru-help.png');
const tiedAhiruEdge = require('../assets/quacksituate/pirate-rescue/tied-ahiru-edge.png');
const angelAhiru = require('../assets/Angel.png');
const happyAhiru = require('../assets/hello.png');
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
  contactDistance = 44,
}: {
  action: 'idle' | 'laugh' | 'push';
  style: any;
  actionKey?: number;
  onImpact?: () => void;
  contactDistance?: number;
}) {
  const lunge = useRef(new Animated.Value(0)).current;
  const motion = useRef(new Animated.Value(0)).current;
  const [frameName, setFrameName] = useState<'neutral' | 'push' | 'laugh' | 'taunt'>('neutral');

  useEffect(() => {
    lunge.stopAnimation();
    motion.stopAnimation();
    lunge.setValue(0);
    motion.setValue(0);
    setFrameName(action === 'laugh' ? 'laugh' : action === 'push' ? 'push' : 'neutral');

    let impactTimer: ReturnType<typeof setTimeout> | undefined;
    let laughTimer: ReturnType<typeof setTimeout> | undefined;
    let resetTimer: ReturnType<typeof setTimeout> | undefined;
    const sequence = action === 'push'
      ? Animated.sequence([
          Animated.timing(motion, { toValue: -1, duration: 150, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(lunge, { toValue: 1, duration: 235, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
          Animated.delay(180),
          Animated.timing(lunge, { toValue: 0, duration: 310, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.timing(motion, { toValue: 0, duration: 120, useNativeDriver: true }),
        ])
      : action === 'laugh'
        ? Animated.sequence([
            Animated.timing(motion, { toValue: 1, duration: 150, useNativeDriver: true }),
            Animated.timing(motion, { toValue: 0, duration: 150, useNativeDriver: true }),
            Animated.timing(motion, { toValue: 1, duration: 150, useNativeDriver: true }),
            Animated.timing(motion, { toValue: 0, duration: 150, useNativeDriver: true }),
          ])
        : Animated.sequence([
            Animated.delay(700),
            Animated.timing(motion, { toValue: 0.55, duration: 160, useNativeDriver: true }),
            Animated.timing(motion, { toValue: 0, duration: 160, useNativeDriver: true }),
          ]);

    if (action === 'push' && onImpact) {
      impactTimer = setTimeout(onImpact, 375);
      laughTimer = setTimeout(() => setFrameName('taunt'), 610);
      resetTimer = setTimeout(() => setFrameName('laugh'), 790);
    }
    sequence.start(({ finished }) => {
      if (finished && action === 'idle') setFrameName('neutral');
    });
    return () => {
      sequence.stop();
      if (impactTimer) clearTimeout(impactTimer);
      if (laughTimer) clearTimeout(laughTimer);
      if (resetTimer) clearTimeout(resetTimer);
    };
  }, [action, actionKey, lunge, motion, onImpact]);

  const translateX = lunge.interpolate({ inputRange: [0, 1], outputRange: [0, contactDistance] });
  const translateY = motion.interpolate({ inputRange: [-1, 0, 1], outputRange: [2, 0, -5] });
  const rotate = motion.interpolate({ inputRange: [-1, 0, 1], outputRange: ['-4deg', '0deg', '3deg'] });
  const frameSource = frameName === 'push'
    ? piratePush
    : frameName === 'laugh'
      ? pirateLaugh
      : frameName === 'taunt'
        ? pirateTauntOpen
        : pirate;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        style,
        {
          transform: [
            { translateX },
            { translateY },
            { rotate },
          ],
        },
      ]}
    >
      <Animated.Image source={frameSource} resizeMode="contain" style={styles.pirateFrame} />
    </Animated.View>
  );
}

function AhiruActor({ source, style, pushX, tilt, hit, fall }: {
  source: any;
  style: any;
  pushX: Animated.AnimatedInterpolation<number>;
  tilt: Animated.AnimatedInterpolation<string>;
  hit: Animated.Value;
  fall: Animated.Value;
}) {
  const shakeX = hit.interpolate({ inputRange: [0, 0.35, 0.7, 1], outputRange: [0, 9, -7, 0] });
  const shakeScale = hit.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0.92, 1] });
  return (
    <Animated.Image
      source={source}
      style={[
        style,
        {
          transform: [
            { translateX: Animated.add(pushX, shakeX) },
            { rotate: tilt },
            { scale: shakeScale },
            { translateY: fall.interpolate({ inputRange: [0, 0.18, 1], outputRange: [0, -12, 300] }) },
            { rotate: fall.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '28deg'] }) },
          ],
          opacity: fall.interpolate({ inputRange: [0, 0.72, 1], outputRange: [1, 1, 0] }),
        },
      ]}
      resizeMode="contain"
    />
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
  const [stageWidth, setStageWidth] = useState(360);
  const push = useRef(new Animated.Value(0)).current;
  const oceanSway = useRef(new Animated.Value(0)).current;
  const hit = useRef(new Animated.Value(0)).current;
  const fall = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(push, {
      toValue: Math.min(1, danger),
      duration: 620,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [danger, push]);

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

  const playImpact = useCallback(() => {
    hit.setValue(0);
    Animated.sequence([
      Animated.timing(hit, { toValue: 1, duration: 105, useNativeDriver: true }),
      Animated.timing(hit, { toValue: 0, duration: 230, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [hit]);

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

  // Discrete danger targets keep Ahiru completely visible until the final fall.
  const ahiruTravel = Math.min(82, Math.max(42, stageWidth * 0.2));
  const ahiruX = push.interpolate({
    inputRange: [0, 1],
    outputRange: [0, ahiruTravel],
  });
  const ahiruTilt = push.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '8deg'],
  });
  const seaY = oceanSway.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -4],
  });
  const ahiruSource = mode === 'failed' || danger >= 0.72
    ? tiedAhiruEdge
    : danger >= 0.3
      ? tiedAhiruHelp
      : tiedAhiru;

  return (
    <View
      style={styles.rescueStage}
      onLayout={(event) => setStageWidth(event.nativeEvent.layout.width)}
    >
      <Image source={pirateDeck} style={styles.rescueEnvironment} resizeMode="cover" />
      <Animated.View style={[styles.seaGlint, { transform: [{ translateY: seaY }] }]} />
      <View style={styles.plankRig}>
        <Image source={plankProp} style={styles.plankProp} resizeMode="contain" />
        <PirateActor
          action={mode === 'failed' ? 'push' : pirateAction}
          style={styles.rescuePirate}
          actionKey={actionKey}
          onImpact={pirateAction === 'push' || mode === 'failed' ? playImpact : undefined}
          contactDistance={Math.min(54, Math.max(36, stageWidth * 0.105))}
        />
        <AhiruActor
          source={ahiruSource}
          style={styles.rescueAhiru}
          pushX={ahiruX}
          tilt={ahiruTilt}
          hit={hit}
          fall={fall}
        />
      </View>
      <View style={styles.edgeMarker}>
        <Ionicons name="warning" size={12} color="#FFF" />
        <Text style={styles.edgeMarkerText}>PLANK EDGE</Text>
      </View>
      <View style={styles.rescueMeter}>
        <View style={styles.rescueMeterSafe} />
        <View style={styles.rescueMeterRisk} />
        <Animated.View
          style={[
            styles.rescueMeterToken,
            {
              transform: [{
                translateX: push.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, Math.max(90, stageWidth - 105)],
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
            />
            <View style={[styles.reactionTag, correct ? styles.reactionTagGood : styles.reactionTagWrong]}>
              <Text style={styles.reactionTagText}>
                {correct ? '+100 · PIRATE BLOCKED' : failed ? 'THE FINAL PUSH!' : 'PIRATE PUSHED AHIRU'}
              </Text>
            </View>
            <View style={styles.reactionDialogue}>
              <Text style={styles.reactionDialogueSpeaker}>{correct ? 'AHIRU' : 'PHRASE PIRATE'}</Text>
              <Text style={styles.reactionDialogueText}>
                {correct ? 'やった！ たすかった！' : failed ? 'ハハハ！ これで終わりだ！' : 'ハハハ！ もう一歩だ！'}
              </Text>
            </View>
          </View>
          <View style={styles.reactionCopy}>
            <Text style={[styles.modalEyebrow, !correct && styles.wrongEyebrow]}>
              {correct ? 'AHIRU IS SAFER' : failed ? 'RESCUE FAILED' : 'PIRATE’S PUSH'}
            </Text>
            <Text style={styles.modalTitle}>
              {correct ? 'That phrase fits!' : failed ? 'The plank gave way!' : 'Not the safest reply'}
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
                {failed ? 'SEE WHAT HAPPENED' : 'CONTINUE RESCUE'}
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
  const angelRise = useRef(new Animated.Value(240)).current;
  const angelOpacity = useRef(new Animated.Value(0)).current;
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
          setPhase('quiz');
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
    const narration = 'Dark clouds gather above the Sea of Words as Ahiru’s tiny boat drifts off course. A shadowy pirate ship cuts through the mist and pulls Ahiru aboard. On its storm-worn deck, the Phrase Pirate binds Ahiru at the start of a plank hanging over the waves. Each unnatural reply will let the pirate push Ahiru closer to the edge—but every natural Japanese phrase will stop the next shove.';
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
    if (phase !== 'gameover') return;
    angelRise.setValue(260);
    angelOpacity.setValue(0);
    Animated.sequence([
      Animated.delay(1550),
      Animated.parallel([
        Animated.timing(angelRise, {
          toValue: 20,
          duration: 1050,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(angelOpacity, { toValue: 1, duration: 420, useNativeDriver: true }),
      ]),
      Animated.delay(850),
      Animated.parallel([
        Animated.timing(angelRise, { toValue: -180, duration: 1200, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        Animated.timing(angelOpacity, { toValue: 0, duration: 900, useNativeDriver: true }),
      ]),
    ]).start();
    void playSfx(require('../assets/audio/sfx/incorrect.mp3'));
  }, [angelOpacity, angelRise, phase]);

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
  const phaseTotal = isHard ? 10 : 15;
  const phaseNumber = isHard ? index - 14 : index + 1;
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
          score: correctCount * 100,
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
        subtitle="Your place is saved. Return anytime to continue saving Ahiru."
        status="ROLLING UP THE RESCUE MAP"
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
        <View style={styles.storyBadge}><Ionicons name="boat-outline" size={15} color="#7B45D1" /><Text style={styles.storyBadgeText}>AHIRU RESCUE · PHRASE OR PLANK!</Text></View>

        {introStep === 1 && (
          <>
            <View style={styles.introStageWrap}><RescueStage danger={0.08} mode="intro" pirateAction="idle" /></View>
            <View style={[styles.characterDialogue, styles.ahiruDialogue]}>
              <Text style={styles.dialogueSpeaker}>AHIRU</Text>
              <Text style={styles.dialogueJapanese}>たすけて！ 海に落ちちゃう！</Text>
            </View>
          </>
        )}

        {introStep === 2 && (
          <>
            <View style={styles.introStageWrap}><RescueStage danger={0.28} mode="intro" pirateAction="laugh" /></View>
            <View style={[styles.characterDialogue, styles.pirateDialogue]}>
              <Text style={styles.dialogueSpeaker}>THE PHRASE PIRATE</Text>
              <Text style={styles.dialogueJapanese}>ハハハ！ まちがえたら一歩だ！</Text>
            </View>
          </>
        )}

        {introStep === 3 && (
          <>
            <View style={styles.introStageWrap}><RescueStage danger={0.36} mode="intro" pirateAction="push" actionKey={introStep} /></View>
            <View style={styles.storyPanel}>
              <Text style={styles.storyEyebrow}>HOW THE RESCUE WORKS</Text>
              <Text style={styles.storyTitle}>Three steps. One rescue.</Text>
              <View style={styles.rescueSteps}>
                <View style={styles.rescueStep}><Text style={styles.rescueStepNumber}>1</Text><Text style={styles.rescueStepText}>READ THE SCENE</Text></View>
                <View style={styles.rescueStep}><Text style={styles.rescueStepNumber}>2</Text><Text style={styles.rescueStepText}>PICK NATURALLY</Text></View>
                <View style={styles.rescueStep}><Text style={styles.rescueStepNumber}>3</Text><Text style={styles.rescueStepText}>SAVE AHIRU</Text></View>
              </View>
              <Text style={styles.storyBody}>Read the relationship, choose the natural phrase, and stop each pirate shove before Ahiru reaches the sea.</Text>
              <View style={styles.storyRules}><View style={styles.storyRule}><Ionicons name="heart" size={17} color="#65A936" /><Text style={styles.storyRuleText}>6 Starter lives</Text></View><View style={styles.storyRule}><Ionicons name="flame" size={17} color="#E58B2A" /><Text style={styles.storyRuleText}>3 Hard lives</Text></View></View>
              <Pressable style={styles.primaryButton} onPress={() => setPhase('quiz')}><Text style={styles.primaryButtonText}>{index > 0 ? 'CONTINUE RESCUE' : 'BEGIN THE RESCUE'}</Text><Ionicons name="arrow-forward" size={18} color="#FFF" /></Pressable>
            </View>
          </>
        )}

        {introStep === 0 && (
          <View style={styles.narrationPanel}>
            <Text style={styles.narrationEyebrow}>PROLOGUE · THE PHRASE PIRATE</Text>
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
        <View style={styles.gameOverStage}><RescueStage danger={1} mode="failed" pirateAction="push" actionKey={index + 1000} falling /></View>
        <Animated.Image
          source={angelAhiru}
          style={[styles.gameOverAngel, { opacity: angelOpacity, transform: [{ translateY: angelRise }] }]}
          resizeMode="contain"
        />
        <View style={styles.storyPanel}>
          <Text style={styles.storyEyebrow}>SPLASH! · RESCUE FAILED</Text>
          <Text style={styles.storyTitle}>Ahiru needs another hero.</Text>
          <Text style={styles.storyBody}>Review the social clues and try again. This unfinished run was not submitted.</Text>
          <Pressable style={styles.primaryButton} onPress={() => void resetGame()}><Text style={styles.primaryButtonText}>TRY AGAIN</Text><Ionicons name="refresh" size={18} color="#FFF" /></Pressable>
          <Pressable style={styles.modalSecondary} onPress={() => setIsExiting(true)}><Text style={styles.modalSecondaryText}>Return to QuackSituate</Text></Pressable>
        </View>
      </ImageBackground>
    );
  }

  return (
    <View style={styles.screen}>
      <Image source={pirateDeck} style={styles.quizEnvironment} resizeMode="cover" />
      <View pointerEvents="none" style={styles.quizEnvironmentTint} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <Pressable style={styles.backButton} onPress={() => setExitVisible(true)}><BackIcon width={19} height={19} fill="#462A5E" /></Pressable>
          <View style={styles.brandBlock}><Text style={styles.brandEyebrow}>AHIRU RESCUE</Text><Text style={styles.brandTitle}>Phrase or Plank!</Text></View>
          <View style={styles.missionBadge}><Ionicons name="boat" size={17} color="#FFF" /><Text style={styles.missionNumber}>{String(index + 1).padStart(2, '0')}</Text></View>
        </View>

        <View style={styles.statusRow}><View style={[styles.levelPill, isHard && styles.hardPill]}><Ionicons name={isHard ? 'flame' : 'leaf'} size={13} color={isHard ? '#D87D19' : '#65A936'} /><Text style={[styles.levelPillText, isHard && styles.hardPillText]}>{isHard ? 'HARD DECK' : 'STARTER DECK'}</Text></View><Text style={styles.phaseText}>{phaseNumber} / {phaseTotal}</Text><View style={styles.scorePill}><Ionicons name="star" size={14} color="#E29A17" /><Text style={styles.scoreText}>{correctCount * 100}</Text></View></View>
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
        <View style={styles.introCopy}><Text style={styles.introTitle}>Choose the phrase. Save Ahiru.</Text><Text style={styles.introText}>Use the relationship and scene clues before the pirate moves the plank.</Text></View>

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
      <Modal transparent visible={completeVisible} animationType="fade"><View style={styles.modalShade}><View style={styles.modalCard}><Image source={happyAhiru} style={styles.feedbackMascot} resizeMode="contain" /><Text style={styles.modalEyebrow}>AHIRU RESCUED!</Text><Text style={styles.modalTitle}>Phrase or Plank complete</Text><Text style={styles.finalScore}>{correctCount * 100}</Text><Text style={styles.finalScoreLabel}>points · {correctCount}/{questions.length} correct</Text><Text style={styles.modalBody}>{saving ? 'Saving your rescue report...' : 'Recorded in QuackProgress and available to your teacher.'}</Text><Pressable disabled={saving} style={styles.primaryButton} onPress={() => { setCompleteVisible(false); setIsExiting(true); }}><Text style={styles.primaryButtonText}>VIEW RESCUE REPORT</Text><Ionicons name="arrow-forward" size={18} color="#FFF" /></Pressable></View></View></Modal>
      <Modal transparent visible={exitVisible} animationType="fade" onRequestClose={() => setExitVisible(false)}><View style={styles.modalShade}><View style={styles.modalCard}><View style={styles.modalIconSoft}><Ionicons name="bookmark-outline" size={28} color="#8423D9" /></View><Text style={styles.modalEyebrow}>PAUSE THE RESCUE?</Text><Text style={styles.modalTitle}>Your place will be saved</Text><Text style={styles.modalBody}>Continue later from this exact trial with the same score and remaining chances.</Text><Pressable style={styles.primaryButton} onPress={() => { setExitVisible(false); setIsExiting(true); }}><Text style={styles.primaryButtonText}>SAVE & EXIT</Text></Pressable><Pressable style={styles.modalSecondary} onPress={() => setExitVisible(false)}><Text style={styles.modalSecondaryText}>Keep rescuing Ahiru</Text></Pressable></View></View></Modal>
    </View>
  );
}
