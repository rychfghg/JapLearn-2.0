import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { router } from 'expo-router';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  ImageBackground,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import expoconfig from '../expoconfig';
import styles from '../styles/stylesQuackResponseGuided';
import QuackSituateExit from '../components/QuackSituateExit';

type Evaluation = 'BEST' | 'ACCEPTABLE' | 'AWKWARD' | 'IMPOLITE' | 'RUDE';
type ChoiceOption = {
  id: string;
  text: string;
  japanese: string;
  romaji: string;
  evaluation: Evaluation;
  points: number;
  explanation: string;
  culturalNote: string;
  reactionText: string;
  reactionCharacterKey: string;
  reactionExpressionKey: string;
  nextNodeId: string;
};
type StoryNode = {
  id: string;
  type: 'NARRATION' | 'DIALOGUE' | 'CHOICE' | 'REACTION' | 'CULTURAL_NOTE' | 'ENDING';
  title?: string;
  text?: string;
  japanese?: string;
  romaji?: string;
  speaker?: string;
  characterKey?: string;
  expressionKey?: string;
  secondaryCharacterKey?: string;
  secondaryExpressionKey?: string;
  backgroundKey?: string;
  audioUrl?: string;
  bgmUrl?: string;
  bgmEnabled?: boolean;
  bgmVolume?: number;
  bgmFadeMs?: number;
  hint?: string;
  hintPenalty?: number;
  characterPosition?: CharacterPosition;
  secondaryCharacterPosition?: CharacterPosition;
  spritesVisible?: boolean;
  tapToContinue?: boolean;
  shuffleChoices?: boolean;
  nextNodeId?: string;
  choices?: ChoiceOption[];
};
type Chapter = {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  learningObjectives: string[];
  startNodeId: string;
  order: number;
  bgmUrl?: string;
  bgmEnabled?: boolean;
  bgmVolume?: number;
  bgmFadeMs?: number;
  nodes: StoryNode[];
};
type CharacterPosition = 'LEFT' | 'CENTER_LEFT' | 'CENTER' | 'CENTER_RIGHT' | 'RIGHT';
type AnswerRecord = {
  nodeId: string;
  prompt: string;
  selectedText: string;
  selectedJapanese: string;
  bestResponse: string;
  evaluation: Evaluation;
  points: number;
  explanation: string;
  culturalNote: string;
};
type Attempt = {
  id: string;
  chapterId: string;
  chapterTitle: string;
  attemptNumber: number;
  currentNodeId: string;
  status: 'IN_PROGRESS' | 'COMPLETED';
  score: number;
  maximumScore: number;
  finalPercentage: number;
  bestCount: number;
  acceptableCount: number;
  awkwardCount: number;
  impoliteCount: number;
  rudeCount: number;
  answers: AnswerRecord[];
};

const backgrounds: Record<string, any> = {
  station: require('../assets/img/background/city a s1st2 day.png'),
  'station-night': require('../assets/img/background/city a s1st2 nightlights.png'),
  train: require('../assets/img/background/train_scene day.png'),
  temple: require('../assets/img/background/park s1 day2.png'),
  shop: require('../assets/img/background/city a s3st2 day.png'),
  restaurant: require('../assets/img/background/kitchen dining day.png'),
  hallway: require('../assets/img/background/school a hallway st2 day.png'),
  home: require('../assets/img/background/apartment a living room day.png'),
  neighborhood: require('../assets/img/background/outskirts road a day2.png'),
};

const sprites: Record<string, Record<string, any>> = {
  SUMI: {
    NEUTRAL: require('../assets/img/Sumi_PoseB_WinterUni_Smile.png'),
    SPEAKING: require('../assets/img/Sumi_PoseB_WinterUni_Open.png'),
    SMILE: require('../assets/img/Sumi_PoseB_WinterUni_Smile_Blush.png'),
    CORRECT: require('../assets/img/Sumi_PoseB_WinterUni_EyesClosed_Smile.png'),
    WRONG: require('../assets/img/Sumi_PoseB_WinterUni_Frown.png'),
    HAPPY: require('../assets/img/Sumi_PoseB_WinterUni_Smile_Blush.png'),
    SURPRISED: require('../assets/img/Sumi_PoseB_WinterUni_Open_Blush.png'),
    CONFUSED: require('../assets/img/Sumi_PoseB_WinterUni_Frown_Blush.png'),
    WORRIED: require('../assets/img/Sumi_PoseB_WinterUni_Frown.png'),
    SAD: require('../assets/img/Sumi_PoseB_WinterUni_EyesClosed_Frown.png'),
    EMBARRASSED: require('../assets/img/Sumi_PoseB_WinterUni_EyesClosed_Smile_Blush.png'),
    ANNOYED: require('../assets/img/Sumi_PoseB_WinterUni_Frown_Blush.png'),
    ANGRY: require('../assets/img/Sumi_PoseB_WinterUni_EyesClosed_Frown_Blush.png'),
    SERIOUS: require('../assets/img/Sumi_PoseB_WinterUni_Frown.png'),
  },
  HARU: {
    NEUTRAL: require('../assets/img/Sprite Male Dark Hair Neu01.png'),
    SPEAKING: require('../assets/img/Sprite Male Dark Hair Smi02.png'),
    SMILE: require('../assets/img/Sprite Male Dark Hair Smi01.png'),
    CORRECT: require('../assets/img/Sprite Male Dark Hair Smi01.png'),
    WRONG: require('../assets/img/Sprite Male Dark Hair Sad01.png'),
    HAPPY: require('../assets/img/Sprite Male Dark Hair Smi01.png'),
    SURPRISED: require('../assets/img/Sprite Male Dark Hair Apo01.png'),
    CONFUSED: require('../assets/img/Sprite Male Dark Hair Con01.png'),
    WORRIED: require('../assets/img/Sprite Male Dark Hair Sad01.png'),
    SAD: require('../assets/img/Sprite Male Dark Hair Sad01.png'),
    EMBARRASSED: require('../assets/img/Sprite Male Dark Hair Sly01.png'),
    ANNOYED: require('../assets/img/Sprite Male Dark Hair Ann01.png'),
    ANGRY: require('../assets/img/Sprite Male Dark Hair Ang01.png'),
    SERIOUS: require('../assets/img/Sprite Male Dark Hair Neu01.png'),
  },
};

const bundledBgm: Record<string, any> = {
  calm: require('../assets/audio/sfx/quiz.mp3'),
  busy: require('../assets/audio/sfx/quackmanbg.mp3'),
  ending: require('../assets/audio/sfx/quiz.mp3'),
};

const evaluationTheme: Record<Evaluation, { label: string; color: string; icon: any }> = {
  BEST: { label: 'Best response', color: '#62B83C', icon: 'checkmark-circle' },
  ACCEPTABLE: { label: 'Acceptable', color: '#5086D8', icon: 'thumbs-up' },
  AWKWARD: { label: 'Awkward', color: '#D89525', icon: 'help-circle' },
  IMPOLITE: { label: 'Impolite', color: '#D4635D', icon: 'alert-circle' },
  RUDE: { label: 'Rude / offensive', color: '#B83B55', icon: 'close-circle' },
};

const shuffle = <T,>(items: T[]) => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[target]] = [copy[target], copy[index]];
  }
  return copy;
};

const positionStyleFor = (position?: CharacterPosition, fallback?: any) => {
  switch (position) {
    case 'LEFT': return styles.spriteLeft;
    case 'CENTER_LEFT': return styles.spriteCenterLeft;
    case 'CENTER': return styles.spriteCenter;
    case 'CENTER_RIGHT': return styles.spriteCenterRight;
    case 'RIGHT': return styles.spriteRight;
    default: return fallback ?? styles.spriteCenter;
  }
};

const choicePositionStyleFor = (position?: CharacterPosition, fallback?: any) => {
  switch (position) {
    case 'LEFT': return styles.choicePositionLeft;
    case 'CENTER_LEFT': return styles.choicePositionCenterLeft;
    case 'CENTER': return styles.choicePositionCenter;
    case 'CENTER_RIGHT': return styles.choicePositionCenterRight;
    case 'RIGHT': return styles.choicePositionRight;
    default: return fallback ?? styles.choicePositionCenter;
  }
};

type SpriteActorProps = {
  characterKey: string;
  expressionKey?: string;
  positionStyle: any;
  speaking: boolean;
};

function SpriteActor({
  characterKey,
  expressionKey = 'NEUTRAL',
  positionStyle,
  speaking,
}: SpriteActorProps) {
  const expressionOpacity = useRef(new Animated.Value(0)).current;
  const bodyScale = useRef(new Animated.Value(1)).current;
  const neutralSource = sprites[characterKey]?.NEUTRAL;
  const expressionSource = sprites[characterKey]?.[expressionKey] ?? neutralSource;
  const motionSource = characterKey === 'SUMI'
    ? sprites.SUMI.SPEAKING
    : sprites.HARU.SPEAKING;
  const restingMotionSource = characterKey === 'SUMI'
    ? sprites.SUMI.CORRECT
    : sprites.HARU.SMILE;
  const canUseRestingMotion = ['NEUTRAL', 'SMILE', 'HAPPY', 'CORRECT'].includes(expressionKey);

  useEffect(() => {
    expressionOpacity.stopAnimation();
    expressionOpacity.setValue(0);

    const expressionLoop = Animated.loop(
      Animated.sequence([
        Animated.delay(speaking ? 280 : 2500),
        Animated.timing(expressionOpacity, {
          toValue: 1,
          duration: speaking ? 90 : 70,
          useNativeDriver: true,
        }),
        Animated.delay(speaking ? 150 : 100),
        Animated.timing(expressionOpacity, {
          toValue: 0,
          duration: speaking ? 110 : 90,
          useNativeDriver: true,
        }),
        Animated.delay(speaking ? 180 : 800),
      ]),
    );

    const breathingLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(bodyScale, {
          toValue: 1.008,
          duration: 1300,
          useNativeDriver: true,
        }),
        Animated.timing(bodyScale, {
          toValue: 1,
          duration: 1300,
          useNativeDriver: true,
        }),
      ]),
    );

    expressionLoop.start();
    breathingLoop.start();

    return () => {
      expressionLoop.stop();
      breathingLoop.stop();
    };
  }, [characterKey, expressionKey, speaking]);

  return (
    <Animated.View
      style={[
        styles.spriteActor,
        positionStyle,
        { transform: [{ scale: bodyScale }] },
      ]}
    >
      <Image
        source={expressionSource}
        style={styles.spriteLayer}
        resizeMode="contain"
        fadeDuration={0}
      />
      <Animated.Image
        source={speaking
          ? motionSource
          : canUseRestingMotion
            ? restingMotionSource ?? neutralSource
            : expressionSource}
        style={[styles.spriteLayer, { opacity: expressionOpacity }]}
        resizeMode="contain"
        fadeDuration={0}
      />
    </Animated.View>
  );
}

export default function ReplyCoachStory() {
  const { user } = useContext(AuthContext);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [nodeId, setNodeId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedChoice, setSelectedChoice] = useState<ChoiceOption | null>(null);
  const [correctionVisible, setCorrectionVisible] = useState(false);
  const [exitVisible, setExitVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [reviewVisible, setReviewVisible] = useState(false);
  const [resultsVisible, setResultsVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [typedNarration, setTypedNarration] = useState('');
  const [narrationFinished, setNarrationFinished] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const fade = useRef(new Animated.Value(0)).current;
  const backgroundMusic = useRef<Audio.Sound | null>(null);
  const backgroundMusicKey = useRef('');
  const musicGeneration = useRef(0);

  const nodes = useMemo(
    () => new Map((chapter?.nodes ?? []).map((node) => [node.id, node])),
    [chapter],
  );
  const currentNode = nodes.get(nodeId);
  const choiceOrder = useMemo(() => {
    const choices = currentNode?.choices ?? [];
    return currentNode?.shuffleChoices ? shuffle(choices) : choices;
  }, [currentNode?.id]);
  const progress = chapter
    ? Math.min(1, (attempt?.answers.length ?? 0) / Math.max(1, chapter.nodes.filter((node) => node.type === 'CHOICE').length))
    : 0;
  const studentName = user?.fname?.trim() || 'friend';
  const latestAnswer = attempt?.answers?.[attempt.answers.length - 1];

  const leaveStory = () => {
    if (exiting) return;
    setExitVisible(false);
    setExiting(true);
  };

  useEffect(() => {
    void loadStory();
  }, [user?.email]);

  useEffect(() => () => {
    musicGeneration.current += 1;
    const sound = backgroundMusic.current;
    backgroundMusic.current = null;
    backgroundMusicKey.current = '';
    if (sound) void sound.stopAsync().finally(() => sound.unloadAsync());
  }, []);

  useEffect(() => {
    if (!chapter || !currentNode) return;
    const enabled = currentNode.bgmEnabled ?? chapter.bgmEnabled ?? true;
    const configuredUrl = currentNode.bgmUrl || chapter.bgmUrl || 'bundled:calm';
    const targetVolume = Math.max(0, Math.min(0.35, currentNode.bgmVolume ?? chapter.bgmVolume ?? 0.1));
    const fadeMs = Math.max(0, currentNode.bgmFadeMs ?? chapter.bgmFadeMs ?? 700);
    const resolvedUrl = configuredUrl.startsWith('/api/')
      ? `${expoconfig.API_URL}${configuredUrl}`
      : configuredUrl;
    const trackKey = enabled ? resolvedUrl : 'disabled';
    const generation = ++musicGeneration.current;

    const fadeVolume = async (sound: Audio.Sound, from: number, to: number) => {
      const steps = fadeMs === 0 ? 1 : 8;
      for (let step = 1; step <= steps; step += 1) {
        if (generation !== musicGeneration.current) return;
        const volume = from + ((to - from) * step) / steps;
        await sound.setVolumeAsync(volume).catch(() => undefined);
        if (fadeMs > 0) await new Promise((resolve) => setTimeout(resolve, fadeMs / steps));
      }
    };

    const syncMusic = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        });

        if (backgroundMusicKey.current === trackKey && backgroundMusic.current) {
          await backgroundMusic.current.setVolumeAsync(targetVolume);
          const status = await backgroundMusic.current.getStatusAsync();
          if (status.isLoaded && !status.isPlaying) await backgroundMusic.current.playAsync();
          return;
        }

        const previous = backgroundMusic.current;
        backgroundMusic.current = null;
        backgroundMusicKey.current = '';
        if (previous) {
          await fadeVolume(previous, targetVolume, 0);
          await previous.stopAsync().catch(() => undefined);
          await previous.unloadAsync().catch(() => undefined);
        }
        if (!enabled || generation !== musicGeneration.current) return;

        const source = resolvedUrl.startsWith('bundled:')
          ? bundledBgm[resolvedUrl.slice('bundled:'.length)] ?? bundledBgm.calm
          : { uri: resolvedUrl };
        const { sound } = await Audio.Sound.createAsync(source, {
          isLooping: true,
          volume: fadeMs > 0 ? 0 : targetVolume,
          shouldPlay: true,
        });
        if (generation !== musicGeneration.current) {
          await sound.unloadAsync();
          return;
        }
        backgroundMusic.current = sound;
        backgroundMusicKey.current = trackKey;
        if (fadeMs > 0) await fadeVolume(sound, 0, targetVolume);
      } catch {
        // A failed remote scene track falls back on the next interaction without blocking play.
      }
    };

    void syncMusic();
  }, [chapter?.id, currentNode?.id, currentNode?.bgmUrl, currentNode?.bgmEnabled]);

  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, {
      toValue: 1,
      duration: 260,
      useNativeDriver: true,
    }).start();
  }, [nodeId]);

  useEffect(() => {
    if (!currentNode || (currentNode.type !== 'NARRATION' && currentNode.type !== 'CULTURAL_NOTE')) {
      setTypedNarration('');
      setNarrationFinished(false);
      return;
    }

    const fullText = currentNode.text ?? '';
    let cursor = 0;
    setTypedNarration('');
    setNarrationFinished(false);
    const timer = setInterval(() => {
      cursor = Math.min(cursor + 2, fullText.length);
      setTypedNarration(fullText.slice(0, cursor));
      if (cursor >= fullText.length) {
        clearInterval(timer);
        setNarrationFinished(true);
      }
    }, 24);

    return () => clearInterval(timer);
  }, [currentNode?.id]);

  useEffect(() => {
    setHintVisible(false);
    setHintUsed(false);
  }, [currentNode?.id]);

  const requestJson = async (path: string, options?: RequestInit) => {
    const response = await fetch(`${expoconfig.API_URL}${path}`, options);
    if (!response.ok) throw new Error(`Reply Coach returned ${response.status}.`);
    return response.json();
  };

  const loadStory = async () => {
    setLoading(true);
    setError('');
    try {
      const chapters = (await requestJson('/api/reply-coach/chapters')) as Chapter[];
      if (!chapters.length) throw new Error('No published Reply Coach chapter is available yet.');
      const selectedChapter = chapters[0];
      const newAttempt = (await requestJson('/api/reply-coach/attempts/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user?.email,
          name: `${user?.fname ?? ''} ${user?.lname ?? ''}`.trim(),
          chapterId: selectedChapter.id,
        }),
      })) as Attempt;
      setChapter(selectedChapter);
      setAttempt(newAttempt);
      setNodeId(newAttempt.currentNodeId || selectedChapter.startNodeId);
      await AsyncStorage.setItem('replyCoachLastAttempt', newAttempt.id);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Reply Coach could not load.');
    } finally {
      setLoading(false);
    }
  };

  const moveTo = async (next?: string) => {
    if (!next || !attempt) return;
    if (backgroundMusic.current) void backgroundMusic.current.playAsync().catch(() => undefined);
    setSelectedChoice(null);
    setNodeId(next);
    setAttempt((current) => current ? { ...current, currentNodeId: next } : current);
    try {
      await requestJson(`/api/reply-coach/attempts/${attempt.id}/progress`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentNodeId: next }),
      });
    } catch {
      // The on-device state remains playable; the next interaction retries persistence.
    }
  };

  const choose = async (choice: ChoiceOption) => {
    if (!attempt || !currentNode || saving) return;
    if (backgroundMusic.current) void backgroundMusic.current.playAsync().catch(() => undefined);
    setSaving(true);
    try {
      const response = await requestJson(`/api/reply-coach/attempts/${attempt.id}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodeId: currentNode.id,
          choiceId: choice.id,
          hintUsed: String(hintUsed),
        }),
      });
      setAttempt(response.attempt);
      setSelectedChoice(response.choice);
      setNodeId(response.choice.nextNodeId);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Your response could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const finish = async () => {
    if (!attempt || saving) return;
    setSaving(true);
    try {
      const completed = await requestJson(`/api/reply-coach/attempts/${attempt.id}/complete`, {
        method: 'POST',
      });
      setAttempt(completed);
      setResultsVisible(true);
      await AsyncStorage.removeItem('replyCoachLastAttempt');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Results could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const replay = async () => {
    setResultsVisible(false);
    setReviewVisible(false);
    setChapter(null);
    setAttempt(null);
    setNodeId('');
    await loadStory();
  };

  const continueAfterCorrection = async () => {
    setCorrectionVisible(false);
    await moveTo(currentNode?.nextNodeId);
  };

  const advanceNarration = () => {
    if (!narrationFinished) {
      setTypedNarration(currentNode?.text ?? '');
      setNarrationFinished(true);
      return;
    }
    void moveTo(currentNode?.nextNodeId);
  };

  const background = backgrounds[currentNode?.backgroundKey ?? 'station'] ?? backgrounds.station;
  const displayedCharacter = currentNode?.characterKey || currentNode?.secondaryCharacterKey;
  const displayedExpression = currentNode?.characterKey
    ? currentNode.expressionKey
    : currentNode?.secondaryExpressionKey;
  const displayedSprite = displayedCharacter
    ? sprites[displayedCharacter]?.[displayedExpression ?? 'NEUTRAL']
    : null;
  const primaryChoiceCharacter = currentNode?.characterKey;
  const secondaryChoiceCharacter = currentNode?.secondaryCharacterKey
    || (primaryChoiceCharacter === 'SUMI' ? 'HARU' : 'SUMI');
  const isNarration = currentNode?.type === 'NARRATION' || currentNode?.type === 'CULTURAL_NOTE';
  const isReaction = currentNode?.type === 'REACTION';
  const reactionEvaluation = selectedChoice?.evaluation ?? latestAnswer?.evaluation;
  const reactionExplanation = selectedChoice?.explanation ?? latestAnswer?.explanation;
  const reactionCulture = selectedChoice?.culturalNote ?? latestAnswer?.culturalNote;

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#8423D9" />
      </View>
    );
  }

  if (exiting) {
    return (
      <QuackSituateExit
        color="#8423D9"
        icon="bookmark-outline"
        title="Reply Coach paused"
        subtitle="Your chapter progress is saved and ready whenever you return."
        status="SAVING YOUR PLACE"
        onComplete={() => router.replace({ pathname: '/QuackResponse', params: { skipLoading: '1' } })}
      />
    );
  }

  if (!chapter || !attempt || !currentNode) {
    return (
      <View style={styles.loadingScreen}>
        <Ionicons name="cloud-offline-outline" size={44} color="#8423D9" />
        <Text style={styles.loadingTitle}>Reply Coach is resting</Text>
        <Text style={styles.loadingText}>{error || 'The story could not be opened.'}</Text>
        <Pressable style={styles.primaryButton} onPress={loadStory}>
          <Text style={styles.primaryButtonText}>Try again</Text>
        </Pressable>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.textButton}>Return to mission map</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ImageBackground
      source={background}
      style={styles.background}
      imageStyle={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.backgroundShade} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable style={styles.iconButton} onPress={() => setExitVisible(true)}>
            <Ionicons name="arrow-back" size={24} color="#351A4A" />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.headerEyebrow}>REPLY COACH · CHAPTER {chapter.order ?? 1}</Text>
            <Text style={styles.headerTitle} numberOfLines={1}>{chapter.title}</Text>
          </View>
          <Pressable style={styles.iconButton} onPress={() => setReviewVisible(true)}>
            <Ionicons name="journal-outline" size={23} color="#8423D9" />
          </Pressable>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.max(2, progress * 100)}%` }]} />
        </View>

        <Animated.View style={[styles.storyStage, { opacity: fade }]}>
          {currentNode.spritesVisible && !isNarration && (
            <View style={styles.spriteStage} pointerEvents="none">
              {currentNode.type === 'CHOICE' ? (
                <>
                  {secondaryChoiceCharacter && sprites[secondaryChoiceCharacter] && (
                    <SpriteActor
                      characterKey={secondaryChoiceCharacter}
                      expressionKey={currentNode.secondaryExpressionKey}
                      positionStyle={choicePositionStyleFor(
                        currentNode.secondaryCharacterPosition,
                        styles.choiceSpriteLeft,
                      )}
                      speaking={false}
                    />
                  )}
                  {primaryChoiceCharacter && sprites[primaryChoiceCharacter] && (
                    <SpriteActor
                      characterKey={primaryChoiceCharacter}
                      expressionKey={currentNode.expressionKey}
                      positionStyle={choicePositionStyleFor(
                        currentNode.characterPosition,
                        styles.choiceSpriteRight,
                      )}
                      speaking={false}
                    />
                  )}
                </>
              ) : displayedCharacter && displayedSprite ? (
                <SpriteActor
                  characterKey={displayedCharacter}
                  expressionKey={displayedExpression}
                  positionStyle={positionStyleFor(
                    currentNode.characterPosition,
                    displayedCharacter === 'HARU' ? styles.soloSpriteLeft : styles.soloSpriteRight,
                  )}
                  speaking={currentNode.type !== 'CHOICE'}
                />
              ) : null}
            </View>
          )}
          {currentNode.spritesVisible && !isNarration && currentNode.type !== 'CHOICE' && (
            <View style={styles.stageForeground} pointerEvents="none">
              <View style={styles.stageForegroundLine} />
              <Text style={styles.stageForegroundText}>REPLY COACH STORY</Text>
            </View>
          )}

          {isNarration ? (
            <Pressable style={styles.narrationWrap} onPress={advanceNarration}>
              <View style={styles.narrationCard}>
                <View style={styles.narrationLocation}>
                  <Ionicons name="location-outline" size={15} color="#B9F28E" />
                  <Text style={styles.narrationLocationText}>{currentNode.title}</Text>
                </View>
                <View style={styles.narrationRule} />
                <Text style={styles.narrationEyebrow}>
                  {currentNode.type === 'CULTURAL_NOTE' ? 'A MOMENT TO REMEMBER' : 'YOUR STORY CONTINUES'}
                </Text>
                <Text style={styles.narrationText} maxFontSizeMultiplier={1.08}>
                  {typedNarration}
                </Text>
                <View style={styles.continueRow}>
                  <Text style={styles.continueText}>Tap to continue</Text>
                  <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
                </View>
              </View>
            </Pressable>
          ) : currentNode.type === 'CHOICE' ? (
            <View style={styles.decisionPanel}>
              <View style={styles.drawerHandle} />
              <View style={styles.decisionHeading}>
                <View style={styles.decisionIcon}>
                  <Ionicons name="chatbubbles-outline" size={21} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.decisionEyebrow}>YOUR TURN</Text>
                  <Text style={styles.decisionTitle}>{currentNode.title || 'What would you say?'}</Text>
                </View>
                <Pressable
                  style={styles.hintButton}
                  onPress={() => {
                    setHintUsed(true);
                    setHintVisible(true);
                  }}
                >
                  <Ionicons name="bulb-outline" size={18} color="#D58A1E" />
                  <Text style={styles.hintButtonText}>Hint</Text>
                </Pressable>
              </View>
              <Text style={styles.decisionPrompt}>{currentNode.text}</Text>
              <View style={styles.choiceList}>
                {choiceOrder.map((choice, index) => (
                  <Pressable
                    key={choice.id}
                    disabled={saving}
                    style={({ pressed }) => [styles.choiceButton, pressed && styles.choicePressed]}
                    onPress={() => choose(choice)}
                  >
                    <View style={styles.choiceLetter}>
                      <Text style={styles.choiceLetterText}>{String.fromCharCode(65 + index)}</Text>
                    </View>
                    <View style={styles.choiceCopy}>
                      <Text style={styles.choiceJapanese}>{choice.japanese}</Text>
                      <Text style={styles.choiceRomaji}>{choice.romaji}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={19} color="#A58CAF" />
                  </Pressable>
                ))}
              </View>
            </View>
          ) : currentNode.type === 'ENDING' ? (
            <View style={styles.endingCard}>
              <Ionicons name="ribbon-outline" size={48} color="#8423D9" />
              <Text style={styles.endingEyebrow}>JOURNEY COMPLETE</Text>
              <Text style={styles.endingTitle}>{currentNode.title}</Text>
              <Text style={styles.endingText}>{currentNode.text}</Text>
              <Pressable style={styles.primaryButton} onPress={finish} disabled={saving}>
                <Text style={styles.primaryButtonText}>{saving ? 'Saving...' : 'View my results'}</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={[
                styles.speechBubbleArea,
                styles.speechBubbleCentered,
              ]}
              onPress={() => isReaction ? setCorrectionVisible(true) : moveTo(currentNode.nextNodeId)}
            >
              <View style={styles.speechBubble}>
                <View
                  style={[
                    styles.speechTail,
                    displayedCharacter === 'HARU' ? styles.speechTailLeft : styles.speechTailRight,
                  ]}
                />
                <View style={styles.speakerRow}>
                  <View style={styles.speakerDot} />
                  <Text style={styles.speakerName}>{currentNode.speaker || currentNode.title}</Text>
                  <Text style={styles.nodeType}>{currentNode.type}</Text>
                </View>
                {Boolean(currentNode.japanese) && (
                  <Text
                    style={styles.dialogueJapanese}
                    numberOfLines={3}
                    adjustsFontSizeToFit
                    minimumFontScale={0.72}
                    maxFontSizeMultiplier={1.1}
                  >
                    {currentNode.japanese}
                  </Text>
                )}
                {Boolean(currentNode.romaji) && (
                  <Text style={styles.dialogueRomaji} numberOfLines={2} maxFontSizeMultiplier={1.05}>
                    {currentNode.romaji}
                  </Text>
                )}
                {isReaction && <Text style={styles.reactionAddress}>{studentName}</Text>}
                <View style={styles.continueRowDark}>
                  <Text style={styles.continueTextDark}>Tap to continue</Text>
                  <Ionicons name="chevron-forward" size={18} color="#8423D9" />
                </View>
              </View>
            </Pressable>
          )}
        </Animated.View>
      </SafeAreaView>

      <Modal visible={exitVisible} transparent animationType="fade" onRequestClose={() => setExitVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.exitCard}>
            <Ionicons name="bookmark-outline" size={38} color="#8423D9" />
            <Text style={styles.exitTitle}>Save your place?</Text>
            <Text style={styles.exitText}>Your story progress is already saved. You can continue from this exact moment later.</Text>
            <Pressable style={styles.primaryButton} onPress={leaveStory}>
              <Text style={styles.primaryButtonText}>Bookmark and return</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={() => setExitVisible(false)}>
              <Text style={styles.secondaryButtonText}>Continue playing</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={hintVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setHintVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.hintCard}>
            <View style={styles.hintIcon}>
              <Ionicons name="bulb-outline" size={30} color="#D58A1E" />
            </View>
            <Text style={styles.hintEyebrow}>CONVERSATION CLUE</Text>
            <Text style={styles.hintTitle}>Notice the relationship</Text>
            <Text style={styles.hintText}>
              {currentNode.hint || 'Think about who is speaking, where the conversation happens, and how polite the reply should be.'}
            </Text>
            {Boolean(currentNode.hintPenalty) && (
              <Text style={styles.hintPenalty}>Using this hint adjusts the decision score by {currentNode.hintPenalty} point.</Text>
            )}
            <Pressable style={styles.primaryButton} onPress={() => setHintVisible(false)}>
              <Text style={styles.primaryButtonText}>Return to the scene</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={correctionVisible}
        transparent
        animationType="fade"
        onRequestClose={() => undefined}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.feedbackCard}>
            {reactionEvaluation && (
              <>
                <View
                  style={[
                    styles.feedbackIcon,
                    { backgroundColor: `${evaluationTheme[reactionEvaluation].color}18` },
                  ]}
                >
                  <Ionicons
                    name={evaluationTheme[reactionEvaluation].icon}
                    size={34}
                    color={evaluationTheme[reactionEvaluation].color}
                  />
                </View>
                <Text
                  style={[
                    styles.feedbackEyebrow,
                    { color: evaluationTheme[reactionEvaluation].color },
                  ]}
                >
                  {evaluationTheme[reactionEvaluation].label.toUpperCase()}
                </Text>
              </>
            )}
            <Text style={styles.feedbackReaction}>
              {reactionEvaluation === 'BEST'
                ? 'That response fits this moment naturally.'
                : reactionEvaluation === 'ACCEPTABLE'
                  ? 'Your reply works, but it can sound more natural.'
                  : reactionEvaluation === 'AWKWARD'
                    ? 'Let’s adjust this reply so it fits the situation.'
                    : 'Let’s review how this reply may be understood.'}
            </Text>
            {latestAnswer && (
              <View style={styles.answerComparison}>
                <View style={styles.answerComparisonColumn}>
                  <Text style={styles.answerComparisonLabel}>YOUR REPLY</Text>
                  <Text style={styles.answerComparisonValue}>{latestAnswer.selectedJapanese}</Text>
                </View>
                {latestAnswer.evaluation !== 'BEST' && (
                  <View style={styles.answerComparisonColumn}>
                    <Text style={styles.answerComparisonLabel}>BEST REPLY</Text>
                    <Text style={styles.answerComparisonValue}>{latestAnswer.bestResponse}</Text>
                  </View>
                )}
              </View>
            )}
            <View style={styles.explanationBox}>
              <Text style={styles.explanationLabel}>
                {reactionEvaluation === 'BEST' ? 'WHY THIS WORKS' : 'WHY THIS NEEDS ADJUSTMENT'}
              </Text>
              <Text style={styles.explanationText}>{reactionExplanation}</Text>
            </View>
            {Boolean(reactionCulture) && (
              <View style={styles.cultureBox}>
                <Ionicons name="leaf-outline" size={19} color="#5CAA38" />
                <Text style={styles.cultureText}>{reactionCulture}</Text>
              </View>
            )}
            <Pressable style={styles.primaryButton} onPress={continueAfterCorrection}>
              <Text style={styles.primaryButtonText}>Continue the story</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={resultsVisible} transparent animationType="slide" onRequestClose={() => undefined}>
        <View style={styles.resultsPage}>
          <SafeAreaView style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.resultsContent}>
              <View style={styles.resultMedal}>
                <Ionicons name="ribbon" size={46} color="#FFFFFF" />
              </View>
              <Text style={styles.resultsEyebrow}>REPLY COACH COMPLETE</Text>
              <Text style={styles.resultsTitle}>{chapter.title}</Text>
              <Text style={styles.resultsScore}>{attempt.finalPercentage}%</Text>
              <Text style={styles.resultsRating}>
                {attempt.finalPercentage >= 90 ? 'Excellent cultural awareness' : attempt.finalPercentage >= 75 ? 'Good — keep refining your replies' : 'Review recommended'}
              </Text>
              <View style={styles.resultGrid}>
                {[
                  ['Best', attempt.bestCount, '#62B83C'],
                  ['Acceptable', attempt.acceptableCount, '#5086D8'],
                  ['Awkward', attempt.awkwardCount, '#D89525'],
                  ['Impolite / rude', attempt.impoliteCount + attempt.rudeCount, '#D4635D'],
                ].map(([label, value, color]) => (
                  <View key={String(label)} style={styles.resultTile}>
                    <View style={[styles.resultDot, { backgroundColor: String(color) }]} />
                    <Text style={styles.resultValue}>{String(value)}</Text>
                    <Text style={styles.resultLabel}>{String(label)}</Text>
                  </View>
                ))}
              </View>
              <Pressable style={styles.primaryButton} onPress={() => setReviewVisible(true)}>
                <Ionicons name="reader-outline" size={19} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>Review my decisions</Text>
              </Pressable>
              <Pressable style={styles.secondaryButton} onPress={replay}>
                <Text style={styles.secondaryButtonText}>Replay chapter</Text>
              </Pressable>
              <Pressable style={styles.textButtonWrap} onPress={() => router.replace('/QuackResponse')}>
                <Text style={styles.textButton}>Return to Reply Coach</Text>
              </Pressable>
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>

      <Modal visible={reviewVisible} animationType="slide" onRequestClose={() => setReviewVisible(false)}>
        <SafeAreaView style={styles.reviewPage}>
          <View style={styles.reviewHeader}>
            <Pressable style={styles.iconButton} onPress={() => setReviewVisible(false)}>
              <Ionicons name="arrow-back" size={23} color="#351A4A" />
            </Pressable>
            <View>
              <Text style={styles.reviewEyebrow}>DECISION JOURNAL</Text>
              <Text style={styles.reviewTitle}>Review your replies</Text>
            </View>
          </View>
          <ScrollView contentContainerStyle={styles.reviewContent}>
            {!attempt.answers.length ? (
              <View style={styles.emptyReview}>
                <Ionicons name="book-outline" size={40} color="#B99EC7" />
                <Text style={styles.emptyReviewTitle}>Your journal is waiting</Text>
                <Text style={styles.emptyReviewText}>Completed decisions will appear here with explanations and cultural notes.</Text>
              </View>
            ) : attempt.answers.map((answer, index) => {
              const theme = evaluationTheme[answer.evaluation];
              return (
                <View key={`${answer.nodeId}-${index}`} style={styles.reviewCard}>
                  <View style={styles.reviewCardTop}>
                    <Text style={styles.reviewNumber}>DECISION {String(index + 1).padStart(2, '0')}</Text>
                    <Text style={[styles.reviewEvaluation, { color: theme.color }]}>{theme.label}</Text>
                  </View>
                  <Text style={styles.reviewPrompt}>{answer.prompt}</Text>
                  <Text style={styles.reviewSelected}>{answer.selectedJapanese}</Text>
                  {answer.evaluation !== 'BEST' && (
                    <View style={styles.bestAnswerBox}>
                      <Text style={styles.bestAnswerLabel}>BEST RESPONSE</Text>
                      <Text style={styles.bestAnswerText}>{answer.bestResponse}</Text>
                    </View>
                  )}
                  <Text style={styles.reviewExplanation}>{answer.explanation}</Text>
                  {Boolean(answer.culturalNote) && <Text style={styles.reviewCulture}>文化 · {answer.culturalNote}</Text>}
                </View>
              );
            })}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </ImageBackground>
  );
}
