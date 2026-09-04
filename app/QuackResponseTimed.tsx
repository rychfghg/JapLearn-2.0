import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
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

import AhiruMissionExit from '../components/AhiruMissionExit';
import styles from '../styles/stylesQuackResponseGuided';

// ---------------------------------------------------------------------------
// Response Rush — "new to Japan" residence card registration scenario.
//
// Everything below is hard-coded on purpose: dialogue, branching, feedback
// text and the audio lookup all live in this file for now. A later request
// will move this content into MongoDB and feed it through the admin site,
// mirroring how Reply Coach (QuackResponseGuided) is served from the
// backend today. Keep that migration in mind — the shapes below
// (Chapter/StoryNode/ChoiceOption) intentionally mirror Reply Coach's
// backend DTOs so porting this into the same admin schema later is a
// straight data move, not a rewrite.
// ---------------------------------------------------------------------------

type Evaluation = 'BEST' | 'ACCEPTABLE' | 'AWKWARD' | 'IMPOLITE' | 'RUDE' | 'TIMEOUT';
type CharacterKey = 'SUMI' | 'HARU';
type CharacterPosition = 'LEFT' | 'CENTER_LEFT' | 'CENTER' | 'CENTER_RIGHT' | 'RIGHT';

type ChoiceOption = {
  id: string;
  japanese: string;
  romaji: string;
  evaluation: Evaluation;
  points: number;
  feedbackTitle: string;
  feedbackWhy: string;
  betterExample?: { japanese: string; romaji: string; note: string };
  audioKey?: string;
  nextNodeId: string;
};

type StoryNode = {
  id: string;
  type: 'NARRATION' | 'DIALOGUE' | 'CHOICE' | 'ENDING';
  title?: string;
  text?: string;
  speaker?: string;
  characterKey?: CharacterKey;
  expressionKey?: string;
  secondaryCharacterKey?: CharacterKey;
  secondaryExpressionKey?: string;
  characterPosition?: CharacterPosition;
  secondaryCharacterPosition?: CharacterPosition;
  japanese?: string;
  romaji?: string;
  backgroundKey?: string;
  audioKey?: string;
  spritesVisible?: boolean;
  prompt?: string;
  timeoutFeedback?: { title: string; why: string };
  mergeNodeId?: string;
  nextNodeId?: string;
  choices?: ChoiceOption[];
};

type AnswerRecord = {
  nodeId: string;
  prompt: string;
  selectedJapanese: string;
  evaluation: Evaluation;
  points: number;
  feedbackTitle: string;
  feedbackWhy: string;
};

const CHOICE_SECONDS = 20;

const backgrounds: Record<string, any> = {
  cityGate: require('../assets/img/background/city a s1st2 day.png'),
  wardOffice: require('../assets/img/background/student council room a st2 evening.png'),
  hallway: require('../assets/img/background/school a hallway st2 day.png'),
};

const sprites: Record<CharacterKey, Record<string, any>> = {
  SUMI: {
    NEUTRAL: require('../assets/img/Sumi_PoseB_WinterUni_Smile.png'),
    SPEAKING: require('../assets/img/Sumi_PoseB_WinterUni_Open.png'),
    SMILE: require('../assets/img/Sumi_PoseB_WinterUni_Smile_Blush.png'),
    ENCOURAGING: require('../assets/img/Sumi_PoseB_WinterUni_EyesClosed_Smile.png'),
    WORRIED: require('../assets/img/Sumi_PoseB_WinterUni_Frown.png'),
    SURPRISED: require('../assets/img/Sumi_PoseB_WinterUni_Open_Blush.png'),
  },
  HARU: {
    NEUTRAL: require('../assets/img/Sprite Male Dark Hair Neu01.png'),
    SPEAKING: require('../assets/img/Sprite Male Dark Hair Smi02.png'),
    SMILE: require('../assets/img/Sprite Male Dark Hair Smi01.png'),
    SERIOUS: require('../assets/img/Sprite Male Dark Hair Neu01.png'),
    CONFUSED: require('../assets/img/Sprite Male Dark Hair Con01.png'),
  },
};

const bundledBgm: Record<string, any> = {
  calm: require('../assets/audio/sfx/quiz.mp3'),
  tense: require('../assets/audio/sfx/quackmanbg.mp3'),
};

// Dialogue / choice voice clips, keyed by node id or "<nodeId>:<choiceId>".
// Left empty on purpose: generating the real Sumi/Haru voice lines for this
// scenario needs the same Azure Neural TTS pipeline documented in
// assets/audio/SUMI_VOICE_PROFILE.md, which this build environment cannot
// reach. The playback plumbing below is fully wired — drop MP3 files into
// assets/audio/response-rush/ and add their `require(...)` here (or plug in
// backend audioUrl values during the MongoDB migration) and every bubble in
// this screen starts speaking with zero further code changes.
const audioClips: Record<string, any> = {
  // 'n_sumi_outside': require('../assets/audio/response-rush/sumi-outside.mp3'),
};

const evaluationTheme: Record<Evaluation, { label: string; color: string; icon: any }> = {
  BEST: { label: 'Best response', color: '#62B83C', icon: 'checkmark-circle' },
  ACCEPTABLE: { label: 'Acceptable', color: '#5086D8', icon: 'thumbs-up' },
  AWKWARD: { label: 'Awkward', color: '#D89525', icon: 'help-circle' },
  IMPOLITE: { label: 'Impolite', color: '#D4635D', icon: 'alert-circle' },
  RUDE: { label: 'Rude / offensive', color: '#B83B55', icon: 'close-circle' },
  TIMEOUT: { label: 'Time ran out', color: '#8A8A8A', icon: 'time' },
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

// ---------------------------------------------------------------------------
// Story graph — three branching-and-merging decision points inside one
// continuous scene (arriving outside the ward office -> the registration
// counter -> the ending), so the scenario stays specific and non-repetitive
// rather than looping generic small talk.
// ---------------------------------------------------------------------------

const nodes: StoryNode[] = [
  {
    id: 'n_intro',
    type: 'NARRATION',
    title: 'Ward Office · Day 6 in Japan',
    text: "You arrived in Japan six days ago to study and work part-time. New residents must register at the local ward office within 14 days to receive their Residence Card. Sumi, a classmate, offered to walk you there for your first visit.",
    backgroundKey: 'cityGate',
    nextNodeId: 'n_sumi_outside',
  },
  {
    id: 'n_sumi_outside',
    type: 'DIALOGUE',
    speaker: 'Sumi',
    characterKey: 'SUMI',
    expressionKey: 'SMILE',
    characterPosition: 'CENTER',
    backgroundKey: 'cityGate',
    spritesVisible: true,
    japanese: '大丈夫？初めての区役所だから、私がついていくね。',
    romaji: 'Daijoubu? Hajimete no kuyakusho dakara, watashi ga tsuiteiku ne.',
    audioKey: 'n_sumi_outside',
    nextNodeId: 'n_enter_office',
  },
  {
    id: 'n_enter_office',
    type: 'NARRATION',
    title: 'Inside the Ward Office',
    text: 'The lobby hums quietly — rows of numbered counters, a ticket machine, a soft chime every few minutes. A staff member behind Counter 3 calls the next number.',
    backgroundKey: 'wardOffice',
    nextNodeId: 'n_haru_call',
  },
  {
    id: 'n_haru_call',
    type: 'DIALOGUE',
    speaker: 'Haru (Ward Office Clerk)',
    characterKey: 'HARU',
    expressionKey: 'NEUTRAL',
    characterPosition: 'CENTER',
    backgroundKey: 'wardOffice',
    spritesVisible: true,
    japanese: '番号47番の方、こちらへどうぞ。',
    romaji: 'Bangou yon-juu-nana-ban no kata, kochira e douzo.',
    audioKey: 'n_haru_call',
    nextNodeId: 'n_choice_greeting',
  },

  // --- Decision 1: how do you greet the clerk? -----------------------------
  {
    id: 'n_choice_greeting',
    type: 'CHOICE',
    title: 'Your number is called',
    prompt: 'You step up to the counter. How do you greet the clerk?',
    speaker: 'You',
    characterKey: 'HARU',
    expressionKey: 'NEUTRAL',
    characterPosition: 'RIGHT',
    secondaryCharacterKey: 'SUMI',
    secondaryExpressionKey: 'ENCOURAGING',
    secondaryCharacterPosition: 'LEFT',
    backgroundKey: 'wardOffice',
    spritesVisible: true,
    mergeNodeId: 'n_purpose_narration',
    timeoutFeedback: {
      title: 'The moment passed',
      why: "You hesitated too long and the clerk moved on without a greeting. In face-to-face situations, even a short, imperfect greeting lands better than silence — a delayed reply can read as confusion or rudeness.",
    },
    choices: [
      {
        id: 'greet_best',
        japanese: 'はじめまして。よろしくお願いします。',
        romaji: 'Hajimemashite. Yoroshiku onegaishimasu.',
        evaluation: 'BEST',
        points: 3,
        feedbackTitle: 'A confident, formal opening',
        feedbackWhy: '"Hajimemashite" (nice to meet you) plus "yoroshiku onegaishimasu" is the standard formal opening for a first interaction with a stranger in an official setting. It signals respect without sounding stiff.',
        nextNodeId: 'n_purpose_narration',
      },
      {
        id: 'greet_ok',
        japanese: 'こんにちは。お願いします。',
        romaji: 'Konnichiwa. Onegaishimasu.',
        evaluation: 'ACCEPTABLE',
        points: 2,
        feedbackTitle: 'Friendly, but a little informal',
        feedbackWhy: '"Konnichiwa" is a fine everyday greeting, but it is closer to how you would greet a classmate than a government clerk on your first official visit. It won\'t cause a problem, just a slightly casual first impression.',
        betterExample: { japanese: 'はじめまして。よろしくお願いします。', romaji: 'Hajimemashite. Yoroshiku onegaishimasu.', note: 'Save "konnichiwa" for people you already know; use "hajimemashite" the first time you meet someone in a formal context.' },
        nextNodeId: 'n_purpose_narration',
      },
      {
        id: 'greet_awkward',
        japanese: 'あ、どうも。',
        romaji: 'A, doumo.',
        evaluation: 'AWKWARD',
        points: 1,
        feedbackTitle: 'Too vague for this moment',
        feedbackWhy: '"Doumo" on its own is a mumbled, catch-all word Japanese speakers use with people they already know well. At a counter, it can come across as unprepared or unsure of yourself, which slows the clerk down.',
        betterExample: { japanese: 'はじめまして。よろしくお願いします。', romaji: 'Hajimemashite. Yoroshiku onegaishimasu.', note: 'A full, clear greeting takes the same amount of time to say and sets a much better tone.' },
        nextNodeId: 'n_purpose_narration',
      },
      {
        id: 'greet_rude',
        japanese: 'カード、ください。早く。',
        romaji: 'Kaado, kudasai. Hayaku.',
        evaluation: 'RUDE',
        points: 0,
        feedbackTitle: 'Skips the greeting and demands speed',
        feedbackWhy: 'Opening with a demand — and adding "hayaku" (quickly) — skips the social greeting entirely and pressures the clerk. In Japan, official interactions almost always open with a greeting first, even when you\'re in a hurry.',
        betterExample: { japanese: 'はじめまして。よろしくお願いします。', romaji: 'Hajimemashite. Yoroshiku onegaishimasu.', note: 'Greet first, state your business after — patience at the counter is expected, even during busy hours.' },
        nextNodeId: 'n_purpose_narration',
      },
    ],
  },

  // --- Merge point -----------------------------------------------------------
  {
    id: 'n_purpose_narration',
    type: 'NARRATION',
    title: 'Counter 3',
    text: 'The clerk nods and pulls up a blank form. "What brings you in today?" they ask, pen ready.',
    backgroundKey: 'wardOffice',
    nextNodeId: 'n_choice_purpose',
  },

  // --- Decision 2: stating your purpose -------------------------------------
  {
    id: 'n_choice_purpose',
    type: 'CHOICE',
    title: 'Stating your business',
    prompt: 'How do you explain why you are here?',
    speaker: 'You',
    characterKey: 'HARU',
    expressionKey: 'NEUTRAL',
    characterPosition: 'RIGHT',
    secondaryCharacterKey: 'SUMI',
    secondaryExpressionKey: 'NEUTRAL',
    secondaryCharacterPosition: 'LEFT',
    backgroundKey: 'wardOffice',
    spritesVisible: true,
    mergeNodeId: 'n_review_docs',
    timeoutFeedback: {
      title: 'The clerk waited, then asked again',
      why: 'Twenty seconds passed without an answer. A pause is fine while you think, but staying silent too long at a counter usually prompts the staff to repeat the question — it does not move things forward.',
    },
    choices: [
      {
        id: 'purpose_best',
        japanese: '在留カードの登録に来ました。',
        romaji: 'Zairyuu kaado no touroku ni kimashita.',
        evaluation: 'BEST',
        points: 3,
        feedbackTitle: 'Exact, correct terminology',
        feedbackWhy: '"Zairyuu kaado" (residence card) is the precise legal term the office uses. Naming it directly means the clerk can pull the right form immediately, no guessing involved.',
        nextNodeId: 'n_review_docs',
      },
      {
        id: 'purpose_ok',
        japanese: '住所登録をしたいです。',
        romaji: 'Juusho touroku wo shitai desu.',
        evaluation: 'ACCEPTABLE',
        points: 2,
        feedbackTitle: 'Close, but not quite the term',
        feedbackWhy: '"Address registration" is part of the same process, so the clerk understands you — but it is not the specific form name, so they will likely ask one clarifying question before continuing.',
        betterExample: { japanese: '在留カードの登録に来ました。', romaji: 'Zairyuu kaado no touroku ni kimashita.', note: 'Naming the card directly skips the follow-up question entirely.' },
        nextNodeId: 'n_review_docs',
      },
      {
        id: 'purpose_awkward',
        japanese: 'カードのことです…',
        romaji: 'Kaado no koto desu…',
        evaluation: 'AWKWARD',
        points: 1,
        feedbackTitle: 'Too vague to act on',
        feedbackWhy: '"It\'s about a card…" could mean several different services this office handles. The clerk now has to ask several follow-up questions just to find out what you need.',
        betterExample: { japanese: '在留カードの登録に来ました。', romaji: 'Zairyuu kaado no touroku ni kimashita.', note: 'A specific, complete sentence is faster for both of you.' },
        nextNodeId: 'n_review_docs',
      },
      {
        id: 'purpose_impolite',
        japanese: '早くカードもらいたいんだけど。',
        romaji: 'Hayaku kaado moraitai n da kedo.',
        evaluation: 'IMPOLITE',
        points: 0,
        feedbackTitle: 'Tone reads as pushy',
        feedbackWhy: '"...n da kedo" is casual, assertive phrasing you\'d use with a close friend, not a stranger behind a counter. Paired with "hayaku" (quickly), it comes across as impatient toward someone who is trying to help you.',
        betterExample: { japanese: '在留カードの登録に来ました。', romaji: 'Zairyuu kaado no touroku ni kimashita.', note: 'Plain, polite "-masu" form keeps the same meaning without the pressure.' },
        nextNodeId: 'n_review_docs',
      },
    ],
  },

  // --- Merge point -----------------------------------------------------------
  {
    id: 'n_review_docs',
    type: 'DIALOGUE',
    speaker: 'Haru (Ward Office Clerk)',
    characterKey: 'HARU',
    expressionKey: 'SERIOUS',
    characterPosition: 'CENTER',
    backgroundKey: 'wardOffice',
    spritesVisible: true,
    japanese: 'パスポートと在留資格認定証明書をお持ちですか？',
    romaji: 'Pasupooto to zairyuu shikaku nintei shoumeisho wo omochi desu ka?',
    audioKey: 'n_review_docs',
    nextNodeId: 'n_choice_understanding',
  },

  // --- Decision 3: you don't recognize a document name ----------------------
  {
    id: 'n_choice_understanding',
    type: 'CHOICE',
    title: 'An unfamiliar term',
    prompt: 'You don\'t recognize one of the document names the clerk just used. What do you do?',
    speaker: 'You',
    characterKey: 'HARU',
    expressionKey: 'CONFUSED',
    characterPosition: 'RIGHT',
    secondaryCharacterKey: 'SUMI',
    secondaryExpressionKey: 'NEUTRAL',
    secondaryCharacterPosition: 'LEFT',
    backgroundKey: 'wardOffice',
    spritesVisible: true,
    mergeNodeId: 'n_ending',
    timeoutFeedback: {
      title: 'You froze on the unfamiliar word',
      why: 'When a word is unfamiliar, staying silent leaves the clerk guessing whether you understood at all. Asking for clarification — even simply — keeps the conversation moving and avoids a missed document later.',
    },
    choices: [
      {
        id: 'understand_best',
        japanese: 'すみません、もう一度お願いできますか？',
        romaji: 'Sumimasen, mou ichido onegai dekimasu ka?',
        evaluation: 'BEST',
        points: 3,
        feedbackTitle: 'The go-to clarification phrase',
        feedbackWhy: '"Could you say that once more, please?" is polite, direct, and completely normal to ask — even fluent speakers use it. The clerk repeats slowly, and you get the term correctly instead of guessing.',
        nextNodeId: 'n_ending',
      },
      {
        id: 'understand_ok',
        japanese: 'すみません、わかりません。',
        romaji: 'Sumimasen, wakarimasen.',
        evaluation: 'ACCEPTABLE',
        points: 2,
        feedbackTitle: 'Honest, if a little broad',
        feedbackWhy: '"I don\'t understand" is polite and honest, but it doesn\'t tell the clerk *what* to repeat or explain — so they may over-simplify or re-explain the whole thing instead of just the one term.',
        betterExample: { japanese: 'すみません、もう一度お願いできますか？', romaji: 'Sumimasen, mou ichido onegai dekimasu ka?', note: 'Asking them to repeat is more specific and usually faster.' },
        nextNodeId: 'n_ending',
      },
      {
        id: 'understand_awkward',
        japanese: 'あ、はい、はい。',
        romaji: 'A, hai, hai.',
        evaluation: 'AWKWARD',
        points: 1,
        feedbackTitle: 'Nodding along is risky here',
        feedbackWhy: 'Saying "yes, yes" without actually understanding risks agreeing to bring a document you don\'t have — which usually means a second trip to the office once the mistake is discovered.',
        betterExample: { japanese: 'すみません、もう一度お願いできますか？', romaji: 'Sumimasen, mou ichido onegai dekimasu ka?', note: 'A quick clarification now is much cheaper than a repeat visit later.' },
        nextNodeId: 'n_ending',
      },
      {
        id: 'understand_impolite',
        japanese: '英語で話してもらえますか？',
        romaji: 'Eigo de hanashite moraemasu ka?',
        evaluation: 'IMPOLITE',
        points: 1,
        feedbackTitle: 'A reasonable ask, with a catch',
        feedbackWhy: 'Asking politely for English isn\'t rude by itself, but many smaller ward offices have no English-speaking staff on hand, so this can put the clerk in an awkward spot. Asking them to slow down in Japanese first is usually more effective.',
        betterExample: { japanese: 'すみません、もう一度お願いできますか？', romaji: 'Sumimasen, mou ichido onegai dekimasu ka?', note: 'Try this first — it works whether or not English is available.' },
        nextNodeId: 'n_ending',
      },
    ],
  },

  {
    id: 'n_ending',
    type: 'ENDING',
    title: 'Registration Complete',
    text: 'With Sumi translating a couple of last terms, you hand over your passport and paperwork. Haru stamps the application and slides a receipt across the counter. "Come back in about two weeks to collect your card," he says, with a small, approving nod. Your first official errand in Japan — done.',
    backgroundKey: 'wardOffice',
  },
];

const nodeMap = new Map(nodes.map((node) => [node.id, node]));
const CHAPTER_TITLE = 'Response Rush · Residence Card Registration';
const START_NODE_ID = 'n_intro';

type SpriteActorProps = {
  characterKey: CharacterKey;
  expressionKey?: string;
  positionStyle: any;
  speaking: boolean;
};

function SpriteActor({ characterKey, expressionKey = 'NEUTRAL', positionStyle, speaking }: SpriteActorProps) {
  const bodyScale = useRef(new Animated.Value(1)).current;
  const source = sprites[characterKey]?.[expressionKey] ?? sprites[characterKey]?.NEUTRAL;
  const speakingSource = sprites[characterKey]?.SPEAKING ?? source;

  useEffect(() => {
    const breathingLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(bodyScale, { toValue: 1.008, duration: 1300, useNativeDriver: true }),
        Animated.timing(bodyScale, { toValue: 1, duration: 1300, useNativeDriver: true }),
      ]),
    );
    breathingLoop.start();
    return () => breathingLoop.stop();
  }, [characterKey, expressionKey]);

  return (
    <Animated.View style={[styles.spriteActor, positionStyle, { transform: [{ scale: bodyScale }] }]}>
      <Image
        source={speaking ? speakingSource : source}
        style={styles.spriteLayer}
        resizeMode="contain"
        fadeDuration={0}
      />
    </Animated.View>
  );
}

export default function QuackResponseTimed() {
  const [nodeId, setNodeId] = useState(START_NODE_ID);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [feedback, setFeedback] = useState<{
    prompt: string;
    selectedJapanese: string;
    evaluation: Evaluation;
    title: string;
    why: string;
    example?: { japanese: string; romaji: string; note: string };
  } | null>(null);
  const [timeLeft, setTimeLeft] = useState(CHOICE_SECONDS);
  const [exitVisible, setExitVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [reviewVisible, setReviewVisible] = useState(false);
  const [resultsVisible, setResultsVisible] = useState(false);
  const [typedNarration, setTypedNarration] = useState('');
  const [narrationFinished, setNarrationFinished] = useState(false);
  const [playingAudioKey, setPlayingAudioKey] = useState<string | null>(null);

  const fade = useRef(new Animated.Value(0)).current;
  const backgroundMusic = useRef<Audio.Sound | null>(null);
  const backgroundMusicKey = useRef('');
  const voiceSound = useRef<Audio.Sound | null>(null);

  const currentNode = nodeMap.get(nodeId);
  const totalChoiceNodes = useMemo(() => nodes.filter((node) => node.type === 'CHOICE').length, []);
  const progress = Math.min(1, answers.length / Math.max(1, totalChoiceNodes));
  const totalPoints = answers.reduce((sum, answer) => sum + answer.points, 0);
  const maxPoints = totalChoiceNodes * 3;

  useEffect(() => () => {
    const sound = backgroundMusic.current;
    backgroundMusic.current = null;
    if (sound) void sound.stopAsync().finally(() => sound.unloadAsync());
    const voice = voiceSound.current;
    voiceSound.current = null;
    if (voice) void voice.unloadAsync();
  }, []);

  // Ambient scene music: calm while reading/talking, a touch more tense
  // once the countdown is actually running on a choice.
  useEffect(() => {
    const trackKey = currentNode?.type === 'CHOICE' && !feedback ? 'tense' : 'calm';
    const syncMusic = async () => {
      try {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: false, shouldDuckAndroid: true });
        if (backgroundMusicKey.current === trackKey && backgroundMusic.current) return;
        const previous = backgroundMusic.current;
        backgroundMusic.current = null;
        backgroundMusicKey.current = '';
        if (previous) {
          await previous.stopAsync().catch(() => undefined);
          await previous.unloadAsync().catch(() => undefined);
        }
        const { sound } = await Audio.Sound.createAsync(bundledBgm[trackKey], {
          isLooping: true,
          volume: 0.12,
          shouldPlay: true,
        });
        backgroundMusic.current = sound;
        backgroundMusicKey.current = trackKey;
      } catch {
        // A missing/undecodable track should never block play.
      }
    };
    void syncMusic();
  }, [currentNode?.type, Boolean(feedback)]);

  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, { toValue: 1, duration: 260, useNativeDriver: true }).start();
  }, [nodeId]);

  // Typewriter effect for narration text.
  useEffect(() => {
    if (!currentNode || currentNode.type !== 'NARRATION') {
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
    }, 22);
    return () => clearInterval(timer);
  }, [currentNode?.id]);

  // 20-second countdown, active only while sitting on an unanswered CHOICE node.
  useEffect(() => {
    if (!currentNode || currentNode.type !== 'CHOICE' || feedback) {
      setTimeLeft(CHOICE_SECONDS);
      return;
    }
    setTimeLeft(CHOICE_SECONDS);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimeout(currentNode);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [currentNode?.id, Boolean(feedback)]);

  const playVoice = async (key?: string) => {
    if (!key) return;
    const source = audioClips[key];
    if (!source) {
      // No recorded clip yet for this line — surface a brief, honest state
      // instead of silently failing, so it never looks like a broken button.
      setPlayingAudioKey(`missing:${key}`);
      setTimeout(() => setPlayingAudioKey((current) => (current === `missing:${key}` ? null : current)), 900);
      return;
    }
    try {
      if (voiceSound.current) {
        await voiceSound.current.stopAsync().catch(() => undefined);
        await voiceSound.current.unloadAsync().catch(() => undefined);
        voiceSound.current = null;
      }
      setPlayingAudioKey(key);
      const { sound } = await Audio.Sound.createAsync(source, { shouldPlay: true, volume: 1 });
      voiceSound.current = sound;
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlayingAudioKey((current) => (current === key ? null : current));
        }
      });
    } catch {
      setPlayingAudioKey(null);
    }
  };

  const handleTimeout = (node: StoryNode) => {
    if (feedback) return;
    if (backgroundMusic.current) void backgroundMusic.current.playAsync().catch(() => undefined);
    const info = node.timeoutFeedback ?? {
      title: 'Time ran out',
      why: 'Twenty seconds passed with no answer. In a real conversation, a long silence usually reads as confusion — even an imperfect answer keeps things moving better than none at all.',
    };
    const record: AnswerRecord = {
      nodeId: node.id,
      prompt: node.prompt ?? '',
      selectedJapanese: '—',
      evaluation: 'TIMEOUT',
      points: 0,
      feedbackTitle: info.title,
      feedbackWhy: info.why,
    };
    setAnswers((prev) => [...prev, record]);
    setFeedback({
      prompt: node.prompt ?? '',
      selectedJapanese: '—',
      evaluation: 'TIMEOUT',
      title: info.title,
      why: info.why,
    });
  };

  const choose = (node: StoryNode, choice: ChoiceOption) => {
    if (feedback) return;
    if (backgroundMusic.current) void backgroundMusic.current.playAsync().catch(() => undefined);
    const record: AnswerRecord = {
      nodeId: node.id,
      prompt: node.prompt ?? '',
      selectedJapanese: choice.japanese,
      evaluation: choice.evaluation,
      points: choice.points,
      feedbackTitle: choice.feedbackTitle,
      feedbackWhy: choice.feedbackWhy,
    };
    setAnswers((prev) => [...prev, record]);
    setFeedback({
      prompt: node.prompt ?? '',
      selectedJapanese: choice.japanese,
      evaluation: choice.evaluation,
      title: choice.feedbackTitle,
      why: choice.feedbackWhy,
      example: choice.betterExample,
    });
    void playVoice(choice.audioKey ?? `${node.id}:${choice.id}`);
  };

  const continueAfterFeedback = () => {
    const node = currentNode;
    setFeedback(null);
    if (!node) return;
    const next = node.mergeNodeId ?? node.nextNodeId;
    if (next) setNodeId(next);
  };

  const advance = () => {
    if (!currentNode) return;
    if (currentNode.type === 'NARRATION' && !narrationFinished) {
      setTypedNarration(currentNode.text ?? '');
      setNarrationFinished(true);
      return;
    }
    if (currentNode.type === 'ENDING') {
      setResultsVisible(true);
      return;
    }
    if (currentNode.nextNodeId) setNodeId(currentNode.nextNodeId);
  };

  const restart = () => {
    setResultsVisible(false);
    setReviewVisible(false);
    setAnswers([]);
    setFeedback(null);
    setNodeId(START_NODE_ID);
  };

  if (exiting) {
    return (
      <AhiruMissionExit
        color="#E58B2A"
        tint="#FFF0DE"
        icon="timer-outline"
        eyebrow="RESPONSE RUSH SAVED"
        title="Fast thinking!"
        message="Your Response Rush scenario ends here for now. Every quick, real choice strengthens your Japanese instincts."
        footer="Speed grows when accurate responses become familiar."
        mascot={require('../assets/Surprised.png')}
        onComplete={() => router.replace({ pathname: '/QuackResponse', params: { skipLoading: '1' } })}
      />
    );
  }

  if (!currentNode) return null;

  const background = backgrounds[currentNode.backgroundKey ?? 'wardOffice'] ?? backgrounds.wardOffice;
  const isNarration = currentNode.type === 'NARRATION';
  const isChoice = currentNode.type === 'CHOICE';
  const isEnding = currentNode.type === 'ENDING';
  const timerRatio = timeLeft / CHOICE_SECONDS;
  const timerDanger = timeLeft <= 6;

  return (
    <ImageBackground source={background} style={styles.background} imageStyle={styles.backgroundImage} resizeMode="cover">
      <View style={styles.backgroundShade} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable style={styles.iconButton} onPress={() => setExitVisible(true)}>
            <Ionicons name="arrow-back" size={24} color="#351A4A" />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.headerEyebrow}>RESPONSE RUSH · {CHOICE_SECONDS}s PER CHOICE</Text>
            <Text style={styles.headerTitle} numberOfLines={1}>{CHAPTER_TITLE}</Text>
          </View>
          <Pressable style={styles.iconButton} onPress={() => setReviewVisible(true)}>
            <Ionicons name="journal-outline" size={23} color="#8423D9" />
          </Pressable>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.max(2, progress * 100)}%` }]} />
        </View>

        {isChoice && !feedback && (
          <View style={rushStyles.timerRow}>
            <View style={rushStyles.timerBarBg}>
              <View
                style={[
                  rushStyles.timerBarFill,
                  { width: `${timerRatio * 100}%`, backgroundColor: timerDanger ? '#D4635D' : '#62B83C' },
                ]}
              />
            </View>
            <View style={[rushStyles.timerBadge, timerDanger && rushStyles.timerBadgeDanger]}>
              <Ionicons name="time" size={14} color="#FFFFFF" />
              <Text style={rushStyles.timerBadgeText}>{timeLeft}s</Text>
            </View>
          </View>
        )}

        <Animated.View style={[styles.storyStage, { opacity: fade }]}>
          {currentNode.spritesVisible && (
            <View style={styles.spriteStage} pointerEvents="none">
              {isChoice ? (
                <>
                  {currentNode.secondaryCharacterKey && (
                    <SpriteActor
                      characterKey={currentNode.secondaryCharacterKey}
                      expressionKey={currentNode.secondaryExpressionKey}
                      positionStyle={choicePositionStyleFor(currentNode.secondaryCharacterPosition, styles.choiceSpriteLeft)}
                      speaking={false}
                    />
                  )}
                  {currentNode.characterKey && (
                    <SpriteActor
                      characterKey={currentNode.characterKey}
                      expressionKey={currentNode.expressionKey}
                      positionStyle={choicePositionStyleFor(currentNode.characterPosition, styles.choiceSpriteRight)}
                      speaking={false}
                    />
                  )}
                </>
              ) : currentNode.characterKey ? (
                <SpriteActor
                  characterKey={currentNode.characterKey}
                  expressionKey={currentNode.expressionKey}
                  positionStyle={positionStyleFor(
                    currentNode.characterPosition,
                    currentNode.characterKey === 'HARU' ? styles.soloSpriteLeft : styles.soloSpriteRight,
                  )}
                  speaking={currentNode.type === 'DIALOGUE'}
                />
              ) : null}
            </View>
          )}

          {isNarration ? (
            <Pressable style={styles.narrationWrap} onPress={advance}>
              <View style={styles.narrationCard}>
                <View style={styles.narrationLocation}>
                  <Ionicons name="location-outline" size={15} color="#B9F28E" />
                  <Text style={styles.narrationLocationText}>{currentNode.title}</Text>
                </View>
                <View style={styles.narrationRule} />
                <Text style={styles.narrationEyebrow}>YOUR STORY CONTINUES</Text>
                <Text style={styles.narrationText} maxFontSizeMultiplier={1.08}>{typedNarration}</Text>
                <View style={styles.continueRow}>
                  <Text style={styles.continueText}>Tap to continue</Text>
                  <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
                </View>
              </View>
            </Pressable>
          ) : isChoice ? (
            <View style={styles.decisionPanel}>
              <View style={styles.drawerHandle} />
              <View style={styles.decisionHeading}>
                <View style={styles.decisionIcon}>
                  <Ionicons name="chatbubbles-outline" size={21} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.decisionEyebrow}>YOUR TURN · {timeLeft}s LEFT</Text>
                  <Text style={styles.decisionTitle}>{currentNode.title}</Text>
                </View>
              </View>
              <Text style={styles.decisionPrompt}>{currentNode.prompt}</Text>
              <View style={styles.choiceList}>
                {(currentNode.choices ?? []).map((choice, index) => (
                  <Pressable
                    key={choice.id}
                    disabled={Boolean(feedback)}
                    style={({ pressed }) => [styles.choiceButton, pressed && styles.choicePressed]}
                    onPress={() => choose(currentNode, choice)}
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
          ) : isEnding ? (
            <View style={styles.endingCard}>
              <Ionicons name="ribbon-outline" size={48} color="#8423D9" />
              <Text style={styles.endingEyebrow}>SCENARIO COMPLETE</Text>
              <Text style={styles.endingTitle}>{currentNode.title}</Text>
              <Text style={styles.endingText}>{currentNode.text}</Text>
              <Pressable style={styles.primaryButton} onPress={advance}>
                <Text style={styles.primaryButtonText}>View my results</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable style={[styles.speechBubbleArea, styles.speechBubbleCentered]} onPress={advance}>
              <View style={styles.speechBubble}>
                <View style={[styles.speechTail, currentNode.characterKey === 'HARU' ? styles.speechTailLeft : styles.speechTailRight]} />
                <View style={styles.speakerRow}>
                  <View style={styles.speakerDot} />
                  <Text style={styles.speakerName}>{currentNode.speaker}</Text>
                  <Pressable
                    hitSlop={10}
                    style={rushStyles.audioButton}
                    onPress={(event) => {
                      event.stopPropagation();
                      void playVoice(currentNode.audioKey ?? currentNode.id);
                    }}
                  >
                    <Ionicons
                      name={playingAudioKey === (currentNode.audioKey ?? currentNode.id) ? 'volume-high' : 'volume-medium-outline'}
                      size={16}
                      color="#8423D9"
                    />
                  </Pressable>
                </View>
                {playingAudioKey === `missing:${currentNode.audioKey ?? currentNode.id}` && (
                  <Text style={rushStyles.audioComingSoon}>Voiceover coming soon</Text>
                )}
                {Boolean(currentNode.japanese) && (
                  <Text style={styles.dialogueJapanese} numberOfLines={3} adjustsFontSizeToFit minimumFontScale={0.72} maxFontSizeMultiplier={1.1}>
                    {currentNode.japanese}
                  </Text>
                )}
                {Boolean(currentNode.romaji) && (
                  <Text style={styles.dialogueRomaji} numberOfLines={2} maxFontSizeMultiplier={1.05}>{currentNode.romaji}</Text>
                )}
                <View style={styles.continueRowDark}>
                  <Text style={styles.continueTextDark}>Tap to continue</Text>
                  <Ionicons name="chevron-forward" size={18} color="#8423D9" />
                </View>
              </View>
            </Pressable>
          )}
        </Animated.View>
      </SafeAreaView>

      {/* Exit confirmation */}
      <Modal visible={exitVisible} transparent animationType="fade" onRequestClose={() => setExitVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.exitCard}>
            <Ionicons name="bookmark-outline" size={38} color="#8423D9" />
            <Text style={styles.exitTitle}>Leave Response Rush?</Text>
            <Text style={styles.exitText}>You can start this scenario again anytime from the level map.</Text>
            <Pressable style={styles.primaryButton} onPress={() => { setExitVisible(false); setExiting(true); }}>
              <Text style={styles.primaryButtonText}>Exit to map</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={() => setExitVisible(false)}>
              <Text style={styles.secondaryButtonText}>Keep going</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Per-choice feedback pop-up: why good/bad + a better example */}
      <Modal visible={Boolean(feedback)} transparent animationType="fade" onRequestClose={() => undefined}>
        <View style={styles.modalBackdrop}>
          <View style={styles.feedbackCard}>
            {feedback && (
              <>
                <View style={[styles.feedbackIcon, { backgroundColor: `${evaluationTheme[feedback.evaluation].color}18` }]}>
                  <Ionicons name={evaluationTheme[feedback.evaluation].icon} size={34} color={evaluationTheme[feedback.evaluation].color} />
                </View>
                <Text style={[styles.feedbackEyebrow, { color: evaluationTheme[feedback.evaluation].color }]}>
                  {evaluationTheme[feedback.evaluation].label.toUpperCase()}
                </Text>
                <Text style={styles.feedbackReaction}>{feedback.title}</Text>
                {feedback.selectedJapanese !== '—' && (
                  <View style={styles.answerComparison}>
                    <View style={styles.answerComparisonColumn}>
                      <Text style={styles.answerComparisonLabel}>YOU SAID</Text>
                      <Text style={styles.answerComparisonValue}>{feedback.selectedJapanese}</Text>
                    </View>
                  </View>
                )}
                <View style={styles.explanationBox}>
                  <Text style={styles.explanationLabel}>
                    {feedback.evaluation === 'BEST' ? 'WHY THIS WORKS' : 'WHY THIS NEEDS ADJUSTMENT'}
                  </Text>
                  <Text style={styles.explanationText}>{feedback.why}</Text>
                </View>
                {feedback.example && (
                  <View style={rushStyles.exampleBox}>
                    <Text style={rushStyles.exampleLabel}>A BETTER EXAMPLE</Text>
                    <Text style={rushStyles.exampleJapanese}>{feedback.example.japanese}</Text>
                    <Text style={rushStyles.exampleRomaji}>{feedback.example.romaji}</Text>
                    <Text style={rushStyles.exampleNote}>{feedback.example.note}</Text>
                  </View>
                )}
                <Pressable style={styles.primaryButton} onPress={continueAfterFeedback}>
                  <Text style={styles.primaryButtonText}>Continue the story</Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Results */}
      <Modal visible={resultsVisible} transparent animationType="slide" onRequestClose={() => undefined}>
        <View style={styles.resultsPage}>
          <SafeAreaView style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.resultsContent}>
              <View style={styles.resultMedal}>
                <Ionicons name="ribbon" size={46} color="#FFFFFF" />
              </View>
              <Text style={styles.resultsEyebrow}>RESPONSE RUSH COMPLETE</Text>
              <Text style={styles.resultsTitle}>{CHAPTER_TITLE}</Text>
              <Text style={styles.resultsScore}>{maxPoints ? Math.round((totalPoints / maxPoints) * 100) : 0}%</Text>
              <Text style={styles.resultsRating}>
                {totalPoints >= maxPoints * 0.9 ? 'Excellent — fast and culturally on point' : totalPoints >= maxPoints * 0.6 ? 'Good — keep sharpening your timing' : 'Review recommended'}
              </Text>
              <View style={styles.resultGrid}>
                {(['BEST', 'ACCEPTABLE', 'AWKWARD', 'IMPOLITE', 'RUDE', 'TIMEOUT'] as Evaluation[]).map((evaluation) => {
                  const count = answers.filter((answer) => answer.evaluation === evaluation).length;
                  if (!count) return null;
                  return (
                    <View key={evaluation} style={styles.resultTile}>
                      <View style={[styles.resultDot, { backgroundColor: evaluationTheme[evaluation].color }]} />
                      <Text style={styles.resultValue}>{count}</Text>
                      <Text style={styles.resultLabel}>{evaluationTheme[evaluation].label}</Text>
                    </View>
                  );
                })}
              </View>
              <Pressable style={styles.primaryButton} onPress={() => setReviewVisible(true)}>
                <Ionicons name="reader-outline" size={19} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>Review my decisions</Text>
              </Pressable>
              <Pressable style={styles.secondaryButton} onPress={restart}>
                <Text style={styles.secondaryButtonText}>Replay scenario</Text>
              </Pressable>
              <Pressable style={styles.textButtonWrap} onPress={() => { setResultsVisible(false); setExiting(true); }}>
                <Text style={styles.textButton}>Return to mission map</Text>
              </Pressable>
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>

      {/* Review journal */}
      <Modal visible={reviewVisible} animationType="slide" onRequestClose={() => setReviewVisible(false)}>
        <SafeAreaView style={styles.reviewPage}>
          <View style={styles.reviewHeader}>
            <Pressable style={styles.iconButton} onPress={() => setReviewVisible(false)}>
              <Ionicons name="arrow-back" size={23} color="#351A4A" />
            </Pressable>
            <View>
              <Text style={styles.reviewEyebrow}>DECISION JOURNAL</Text>
              <Text style={styles.reviewTitle}>Review your responses</Text>
            </View>
          </View>
          <ScrollView contentContainerStyle={styles.reviewContent}>
            {!answers.length ? (
              <View style={styles.emptyReview}>
                <Ionicons name="book-outline" size={40} color="#B99EC7" />
                <Text style={styles.emptyReviewTitle}>Your journal is waiting</Text>
                <Text style={styles.emptyReviewText}>Completed decisions will appear here with explanations.</Text>
              </View>
            ) : answers.map((answer, index) => {
              const theme = evaluationTheme[answer.evaluation];
              return (
                <View key={`${answer.nodeId}-${index}`} style={styles.reviewCard}>
                  <View style={styles.reviewCardTop}>
                    <Text style={styles.reviewNumber}>DECISION {String(index + 1).padStart(2, '0')}</Text>
                    <Text style={[styles.reviewEvaluation, { color: theme.color }]}>{theme.label}</Text>
                  </View>
                  <Text style={styles.reviewPrompt}>{answer.prompt}</Text>
                  <Text style={styles.reviewSelected}>{answer.selectedJapanese}</Text>
                  <Text style={styles.reviewExplanation}>{answer.feedbackWhy}</Text>
                </View>
              );
            })}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </ImageBackground>
  );
}

const rushStyles = StyleSheet.create({
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginTop: 10,
    gap: 10,
  },
  timerBarBg: {
    flex: 1,
    height: 8,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.35)',
    overflow: 'hidden',
  },
  timerBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#62B83C',
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  timerBadgeDanger: {
    backgroundColor: '#D4635D',
  },
  timerBadgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  audioButton: {
    marginLeft: 'auto',
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(132,35,217,0.1)',
  },
  audioComingSoon: {
    fontSize: 11,
    color: '#A58CAF',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  exampleBox: {
    width: '100%',
    backgroundColor: '#F2ECFB',
    borderRadius: 14,
    padding: 14,
    marginTop: 4,
    marginBottom: 14,
  },
  exampleLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8423D9',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  exampleJapanese: {
    fontSize: 17,
    fontWeight: '700',
    color: '#351A4A',
  },
  exampleRomaji: {
    fontSize: 13,
    color: '#6B5A78',
    marginBottom: 6,
  },
  exampleNote: {
    fontSize: 12.5,
    color: '#4B3A57',
    lineHeight: 17,
  },
});
