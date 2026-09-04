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
import { loadBundledSound, stopAndUnloadSound } from '../utils/nativeAudio';

// ---------------------------------------------------------------------------
// Response Rush — "new to Japan" residence card registration scenario.
//
// Everything below is hard-coded on purpose (dialogue, branching, feedback
// text, audio mapping). A later request will move this content into
// MongoDB and feed it through the admin site, mirroring Reply Coach
// (QuackResponseGuided). The Chapter/StoryNode/ChoiceOption shapes below
// intentionally mirror Reply Coach's backend DTOs so that migration is a
// straight data move.
//
// AUDIO — read this before touching the clip lookups below.
// This build environment has no network path to the neural voice service
// (Azure ja-JP-NanamiNeural / en-US-JennyNeural) documented in
// assets/audio/SUMI_VOICE_PROFILE.md, and cannot regenerate the offline
// espeak-ng samples that were already rejected as too robotic. What it DOES
// have is the same real, bundled voice-actor pool the Politeness game
// (QuackSituateFormal.tsx) already ships at assets/audio/politeness/
// (npc-01.mp3 … npc-30.mp3) — 16 female clips and 14 male clips. Politeness
// does not dub its 30 scenarios word-for-word either; it plays a matching
// real voice per line as "flavor" audio, keyed by gender. Response Rush now
// does the exact same thing: every Sumi line pulls the next clip from the
// female pool, every Haru line pulls the next clip from the male pool, via
// the same loadBundledSound/stopAndUnloadSound helper Politeness uses. That
// means every dialogue and reaction bubble below has real, working audio
// today — it is a shared voice pool rather than a bespoke recording of
// these exact sentences. When exact-match clips for these lines exist
// (recorded, or generated through a pipeline this sandbox can reach), swap
// the `audioClips` entry for that node id to the new require(...) and
// nothing else needs to change.
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
  nextNodeId: string; // -> a REACTION node
};

type StoryNode = {
  id: string;
  type: 'NARRATION' | 'DIALOGUE' | 'CHOICE' | 'REACTION' | 'ENDING';
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
  spritesVisible?: boolean;
  prompt?: string;
  timeoutReactionNodeId?: string;
  mergeNodeId?: string; // REACTION nodes only: where the story continues after the feedback pop-up
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
  betterExample?: { japanese: string; romaji: string; note: string };
};

const CHOICE_SECONDS = 20;

const backgrounds: Record<string, any> = {
  cityGate: require('../assets/img/background/city a s1st2 day.png'),
  wardOffice: require('../assets/img/background/student council room a st2 evening.png'),
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
    ANNOYED: require('../assets/img/Sprite Male Dark Hair Ann01.png'),
  },
};

const bundledBgm: Record<string, any> = {
  calm: require('../assets/audio/sfx/quiz.mp3'),
  tense: require('../assets/audio/sfx/quackmanbg.mp3'),
};

// The same real, bundled voice-actor pool the Politeness game uses,
// split by the gender each clip was recorded as (see the AUDIO note above).
const femaleVoicePool: any[] = [
  require('../assets/audio/politeness/npc-02.mp3'),
  require('../assets/audio/politeness/npc-03.mp3'),
  require('../assets/audio/politeness/npc-05.mp3'),
  require('../assets/audio/politeness/npc-07.mp3'),
  require('../assets/audio/politeness/npc-09.mp3'),
  require('../assets/audio/politeness/npc-11.mp3'),
  require('../assets/audio/politeness/npc-13.mp3'),
  require('../assets/audio/politeness/npc-14.mp3'),
  require('../assets/audio/politeness/npc-16.mp3'),
  require('../assets/audio/politeness/npc-18.mp3'),
  require('../assets/audio/politeness/npc-20.mp3'),
  require('../assets/audio/politeness/npc-22.mp3'),
  require('../assets/audio/politeness/npc-24.mp3'),
  require('../assets/audio/politeness/npc-26.mp3'),
  require('../assets/audio/politeness/npc-28.mp3'),
  require('../assets/audio/politeness/npc-30.mp3'),
];
const maleVoicePool: any[] = [
  require('../assets/audio/politeness/npc-01.mp3'),
  require('../assets/audio/politeness/npc-04.mp3'),
  require('../assets/audio/politeness/npc-06.mp3'),
  require('../assets/audio/politeness/npc-08.mp3'),
  require('../assets/audio/politeness/npc-10.mp3'),
  require('../assets/audio/politeness/npc-12.mp3'),
  require('../assets/audio/politeness/npc-15.mp3'),
  require('../assets/audio/politeness/npc-17.mp3'),
  require('../assets/audio/politeness/npc-19.mp3'),
  require('../assets/audio/politeness/npc-21.mp3'),
  require('../assets/audio/politeness/npc-23.mp3'),
  require('../assets/audio/politeness/npc-25.mp3'),
  require('../assets/audio/politeness/npc-27.mp3'),
  require('../assets/audio/politeness/npc-29.mp3'),
];

// One fixed pool slot per voiced node id, assigned in story order so the
// same line always plays the same clip on replay.
const audioClips: Record<string, any> = {
  n_sumi_outside: femaleVoicePool[0],
  n_haru_call: maleVoicePool[0],
  n_review_docs: maleVoicePool[1],
  n_react_greeting_timeout: maleVoicePool[2],
  n_react_greet_best: maleVoicePool[3],
  n_react_greet_ok: maleVoicePool[4],
  n_react_greet_awkward: maleVoicePool[5],
  n_react_greet_rude: maleVoicePool[6],
  n_react_purpose_timeout: maleVoicePool[7],
  n_react_purpose_best: maleVoicePool[8],
  n_react_purpose_ok: maleVoicePool[9],
  n_react_purpose_awkward: maleVoicePool[10],
  n_react_purpose_impolite: maleVoicePool[11],
  n_react_understand_timeout: maleVoicePool[12],
  n_react_understand_best: maleVoicePool[13],
  n_react_understand_ok: femaleVoicePool[1],
  n_react_understand_awkward: femaleVoicePool[2],
  n_react_understand_impolite: femaleVoicePool[3],
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
// Story graph: NARRATION / DIALOGUE lead into a CHOICE. Every choice routes
// to its own REACTION node first — the clerk (or Sumi) visibly reacts in a
// speech bubble with a matching sprite expression, exactly like Reply
// Coach's REACTION nodes — and only THEN does tapping it open the pop-up
// with the full why-this-works / why-this-doesn't explanation and a better
// example. All four reactions per decision converge on the same
// mergeNodeId, so the graph branches on your choice and merges back into
// one continuous scene, three times, without ever repeating a beat.
// ---------------------------------------------------------------------------

const nodes: StoryNode[] = [
  {
    id: 'n_intro',
    type: 'NARRATION',
    title: 'Ward Office · Day 6 in Japan',
    text: 'You arrived in Japan six days ago to study and work part-time. New residents must register at the local ward office within 14 days to receive their Residence Card. Sumi, a classmate, offered to walk you there for your first visit.',
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
    nextNodeId: 'n_choice_greeting',
  },

  // --- Decision 1: how do you greet the clerk? -----------------------------
  {
    id: 'n_choice_greeting',
    type: 'CHOICE',
    title: 'Your number is called',
    prompt: 'You step up to the counter. How do you greet the clerk?',
    characterKey: 'HARU',
    expressionKey: 'NEUTRAL',
    characterPosition: 'RIGHT',
    secondaryCharacterKey: 'SUMI',
    secondaryExpressionKey: 'ENCOURAGING',
    secondaryCharacterPosition: 'LEFT',
    backgroundKey: 'wardOffice',
    spritesVisible: true,
    timeoutReactionNodeId: 'n_react_greeting_timeout',
    choices: [
      {
        id: 'greet_best',
        japanese: 'はじめまして。よろしくお願いします。',
        romaji: 'Hajimemashite. Yoroshiku onegaishimasu.',
        evaluation: 'BEST',
        points: 3,
        feedbackTitle: 'A confident, formal opening',
        feedbackWhy: '"Hajimemashite" (nice to meet you) plus "yoroshiku onegaishimasu" is the standard formal opening for a first interaction with a stranger in an official setting. It signals respect without sounding stiff.',
        nextNodeId: 'n_react_greet_best',
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
        nextNodeId: 'n_react_greet_ok',
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
        nextNodeId: 'n_react_greet_awkward',
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
        nextNodeId: 'n_react_greet_rude',
      },
    ],
  },

  {
    id: 'n_react_greeting_timeout',
    type: 'REACTION',
    speaker: 'Haru (Ward Office Clerk)',
    characterKey: 'HARU',
    expressionKey: 'CONFUSED',
    characterPosition: 'CENTER',
    backgroundKey: 'wardOffice',
    spritesVisible: true,
    japanese: '……あの、大丈夫ですか？',
    romaji: '……Ano, daijoubu desu ka?',
    mergeNodeId: 'n_purpose_narration',
  },
  {
    id: 'n_react_greet_best',
    type: 'REACTION',
    speaker: 'Haru (Ward Office Clerk)',
    characterKey: 'HARU',
    expressionKey: 'SMILE',
    characterPosition: 'CENTER',
    backgroundKey: 'wardOffice',
    spritesVisible: true,
    japanese: 'はじめまして。こちらこそよろしくお願いします。',
    romaji: 'Hajimemashite. Kochira koso yoroshiku onegaishimasu.',
    mergeNodeId: 'n_purpose_narration',
  },
  {
    id: 'n_react_greet_ok',
    type: 'REACTION',
    speaker: 'Haru (Ward Office Clerk)',
    characterKey: 'HARU',
    expressionKey: 'NEUTRAL',
    characterPosition: 'CENTER',
    backgroundKey: 'wardOffice',
    spritesVisible: true,
    japanese: 'はい、どうぞ。',
    romaji: 'Hai, douzo.',
    mergeNodeId: 'n_purpose_narration',
  },
  {
    id: 'n_react_greet_awkward',
    type: 'REACTION',
    speaker: 'Haru (Ward Office Clerk)',
    characterKey: 'HARU',
    expressionKey: 'CONFUSED',
    characterPosition: 'CENTER',
    backgroundKey: 'wardOffice',
    spritesVisible: true,
    japanese: 'え、あ……はい。',
    romaji: 'E, a…… hai.',
    mergeNodeId: 'n_purpose_narration',
  },
  {
    id: 'n_react_greet_rude',
    type: 'REACTION',
    speaker: 'Haru (Ward Office Clerk)',
    characterKey: 'HARU',
    expressionKey: 'ANNOYED',
    characterPosition: 'CENTER',
    backgroundKey: 'wardOffice',
    spritesVisible: true,
    japanese: '……順番にご案内いたしますので。',
    romaji: '……Junban ni goannai itashimasu node.',
    mergeNodeId: 'n_purpose_narration',
  },

  // --- Merge point -----------------------------------------------------------
  {
    id: 'n_purpose_narration',
    type: 'NARRATION',
    title: 'Counter 3',
    text: 'The clerk pulls up a blank form and picks up a pen. "So, what brings you in today?" he asks.',
    backgroundKey: 'wardOffice',
    nextNodeId: 'n_choice_purpose',
  },

  // --- Decision 2: stating your purpose -------------------------------------
  {
    id: 'n_choice_purpose',
    type: 'CHOICE',
    title: 'Stating your business',
    prompt: 'How do you explain why you are here?',
    characterKey: 'HARU',
    expressionKey: 'NEUTRAL',
    characterPosition: 'RIGHT',
    secondaryCharacterKey: 'SUMI',
    secondaryExpressionKey: 'NEUTRAL',
    secondaryCharacterPosition: 'LEFT',
    backgroundKey: 'wardOffice',
    spritesVisible: true,
    timeoutReactionNodeId: 'n_react_purpose_timeout',
    choices: [
      {
        id: 'purpose_best',
        japanese: '在留カードの登録に来ました。',
        romaji: 'Zairyuu kaado no touroku ni kimashita.',
        evaluation: 'BEST',
        points: 3,
        feedbackTitle: 'Exact, correct terminology',
        feedbackWhy: '"Zairyuu kaado" (residence card) is the precise legal term the office uses. Naming it directly means the clerk can pull the right form immediately, no guessing involved.',
        nextNodeId: 'n_react_purpose_best',
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
        nextNodeId: 'n_react_purpose_ok',
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
        nextNodeId: 'n_react_purpose_awkward',
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
        nextNodeId: 'n_react_purpose_impolite',
      },
    ],
  },

  {
    id: 'n_react_purpose_timeout',
    type: 'REACTION',
    speaker: 'Haru (Ward Office Clerk)',
    characterKey: 'HARU',
    expressionKey: 'CONFUSED',
    characterPosition: 'CENTER',
    backgroundKey: 'wardOffice',
    spritesVisible: true,
    japanese: 'えっと……もう一度お伺いしても？',
    romaji: 'Etto…… mou ichido oukagai shite mo?',
    mergeNodeId: 'n_review_docs',
  },
  {
    id: 'n_react_purpose_best',
    type: 'REACTION',
    speaker: 'Haru (Ward Office Clerk)',
    characterKey: 'HARU',
    expressionKey: 'SMILE',
    characterPosition: 'CENTER',
    backgroundKey: 'wardOffice',
    spritesVisible: true,
    japanese: 'かしこまりました。こちらの用紙にご記入ください。',
    romaji: 'Kashikomarimashita. Kochira no youshi ni gokinyuu kudasai.',
    mergeNodeId: 'n_review_docs',
  },
  {
    id: 'n_react_purpose_ok',
    type: 'REACTION',
    speaker: 'Haru (Ward Office Clerk)',
    characterKey: 'HARU',
    expressionKey: 'NEUTRAL',
    characterPosition: 'CENTER',
    backgroundKey: 'wardOffice',
    spritesVisible: true,
    japanese: '住所登録……在留カードのことですね？',
    romaji: 'Juusho touroku…… zairyuu kaado no koto desu ne?',
    mergeNodeId: 'n_review_docs',
  },
  {
    id: 'n_react_purpose_awkward',
    type: 'REACTION',
    speaker: 'Haru (Ward Office Clerk)',
    characterKey: 'HARU',
    expressionKey: 'CONFUSED',
    characterPosition: 'CENTER',
    backgroundKey: 'wardOffice',
    spritesVisible: true,
    japanese: 'カード……と言いますと？',
    romaji: 'Kaado…… to iimasu to?',
    mergeNodeId: 'n_review_docs',
  },
  {
    id: 'n_react_purpose_impolite',
    type: 'REACTION',
    speaker: 'Haru (Ward Office Clerk)',
    characterKey: 'HARU',
    expressionKey: 'ANNOYED',
    characterPosition: 'CENTER',
    backgroundKey: 'wardOffice',
    spritesVisible: true,
    japanese: '順番にご案内しますので、少々お待ちください。',
    romaji: 'Junban ni goannai shimasu node, shoushou omachi kudasai.',
    mergeNodeId: 'n_review_docs',
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
    nextNodeId: 'n_choice_understanding',
  },

  // --- Decision 3: you don't recognize a document name ----------------------
  {
    id: 'n_choice_understanding',
    type: 'CHOICE',
    title: 'An unfamiliar term',
    prompt: 'You don\'t recognize one of the document names the clerk just used. What do you do?',
    characterKey: 'HARU',
    expressionKey: 'CONFUSED',
    characterPosition: 'RIGHT',
    secondaryCharacterKey: 'SUMI',
    secondaryExpressionKey: 'NEUTRAL',
    secondaryCharacterPosition: 'LEFT',
    backgroundKey: 'wardOffice',
    spritesVisible: true,
    timeoutReactionNodeId: 'n_react_understand_timeout',
    choices: [
      {
        id: 'understand_best',
        japanese: 'すみません、もう一度お願いできますか？',
        romaji: 'Sumimasen, mou ichido onegai dekimasu ka?',
        evaluation: 'BEST',
        points: 3,
        feedbackTitle: 'The go-to clarification phrase',
        feedbackWhy: '"Could you say that once more, please?" is polite, direct, and completely normal to ask — even fluent speakers use it. The clerk repeats slowly, and you get the term correctly instead of guessing.',
        nextNodeId: 'n_react_understand_best',
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
        nextNodeId: 'n_react_understand_ok',
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
        nextNodeId: 'n_react_understand_awkward',
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
        nextNodeId: 'n_react_understand_impolite',
      },
    ],
  },

  {
    id: 'n_react_understand_timeout',
    type: 'REACTION',
    speaker: 'Haru (Ward Office Clerk)',
    characterKey: 'HARU',
    expressionKey: 'CONFUSED',
    characterPosition: 'CENTER',
    backgroundKey: 'wardOffice',
    spritesVisible: true,
    japanese: '……大丈夫ですか？お困りでしたら、ゆっくりで結構ですよ。',
    romaji: '……Daijoubu desu ka? Okomari deshitara, yukkuri de kekkou desu yo.',
    mergeNodeId: 'n_ending',
  },
  {
    id: 'n_react_understand_best',
    type: 'REACTION',
    speaker: 'Haru (Ward Office Clerk)',
    characterKey: 'HARU',
    expressionKey: 'SMILE',
    characterPosition: 'CENTER',
    backgroundKey: 'wardOffice',
    spritesVisible: true,
    japanese: 'はい、もちろんです。ゆっくりご説明しますね。',
    romaji: 'Hai, mochiron desu. Yukkuri gosetsumei shimasu ne.',
    mergeNodeId: 'n_ending',
  },
  {
    id: 'n_react_understand_ok',
    type: 'REACTION',
    speaker: 'Haru (Ward Office Clerk)',
    characterKey: 'HARU',
    expressionKey: 'NEUTRAL',
    characterPosition: 'CENTER',
    backgroundKey: 'wardOffice',
    spritesVisible: true,
    japanese: 'わかりました。もう一度ご説明しますね。',
    romaji: 'Wakarimashita. Mou ichido gosetsumei shimasu ne.',
    mergeNodeId: 'n_ending',
  },
  {
    id: 'n_react_understand_awkward',
    type: 'REACTION',
    speaker: 'Sumi',
    characterKey: 'SUMI',
    expressionKey: 'WORRIED',
    characterPosition: 'CENTER',
    backgroundKey: 'wardOffice',
    spritesVisible: true,
    japanese: 'ねえ、本当に大丈夫？もう一度聞いてみようよ。',
    romaji: 'Nee, hontou ni daijoubu? Mou ichido kiite miyou yo.',
    mergeNodeId: 'n_ending',
  },
  {
    id: 'n_react_understand_impolite',
    type: 'REACTION',
    speaker: 'Haru (Ward Office Clerk)',
    characterKey: 'HARU',
    expressionKey: 'CONFUSED',
    characterPosition: 'CENTER',
    backgroundKey: 'wardOffice',
    spritesVisible: true,
    japanese: 'すみません、英語は少しだけです……日本語でゆっくり話しますね。',
    romaji: 'Sumimasen, eigo wa sukoshi dake desu…… nihongo de yukkuri hanashimasu ne.',
    mergeNodeId: 'n_ending',
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
  reacting: boolean;
};

function SpriteActor({ characterKey, expressionKey = 'NEUTRAL', positionStyle, speaking, reacting }: SpriteActorProps) {
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

  // A one-shot "reaction" pop so a wrong/awkward choice visibly registers
  // on the character the instant the reaction node appears.
  useEffect(() => {
    if (!reacting) return;
    bodyScale.setValue(1);
    Animated.sequence([
      Animated.timing(bodyScale, { toValue: 1.12, duration: 140, useNativeDriver: true }),
      Animated.spring(bodyScale, { toValue: 1, friction: 4, tension: 90, useNativeDriver: true }),
    ]).start();
  }, [reacting]);

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
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState(CHOICE_SECONDS);
  const [timedOut, setTimedOut] = useState(false);
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
  const lastAnswer = answers[answers.length - 1];

  useEffect(() => () => {
    const music = backgroundMusic.current;
    backgroundMusic.current = null;
    if (music) void music.stopAsync().finally(() => music.unloadAsync());
    void stopAndUnloadSound(voiceSound.current);
    voiceSound.current = null;
  }, []);

  // Ambient scene music: calm while reading/talking, a touch tenser while a
  // countdown is actually running on a choice.
  useEffect(() => {
    const trackKey = currentNode?.type === 'CHOICE' && !timedOut ? 'tense' : 'calm';
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
        const { sound } = await Audio.Sound.createAsync(bundledBgm[trackKey], { isLooping: true, volume: 0.12, shouldPlay: true });
        backgroundMusic.current = sound;
        backgroundMusicKey.current = trackKey;
      } catch {
        // A missing/undecodable track should never block play.
      }
    };
    void syncMusic();
  }, [currentNode?.type, timedOut]);

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
    setTimedOut(false);
    if (!currentNode || currentNode.type !== 'CHOICE') {
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
  }, [currentNode?.id]);

  const playVoice = async (key?: string) => {
    if (!key) return;
    const source = audioClips[key];
    if (!source) return;
    try {
      await stopAndUnloadSound(voiceSound.current);
      voiceSound.current = null;
      setPlayingAudioKey(key);
      const { sound } = await loadBundledSound(source, { shouldPlay: true, volume: 1 }, (status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlayingAudioKey((current) => (current === key ? null : current));
        }
      });
      voiceSound.current = sound;
    } catch {
      setPlayingAudioKey(null);
    }
  };

  const handleTimeout = (node: StoryNode) => {
    setTimedOut(true);
    const record: AnswerRecord = {
      nodeId: node.id,
      prompt: node.prompt ?? '',
      selectedJapanese: '—',
      evaluation: 'TIMEOUT',
      points: 0,
      feedbackTitle: 'Time ran out',
      feedbackWhy: 'Twenty seconds passed with no answer. In a real conversation, a long silence usually reads as confusion — even an imperfect answer keeps things moving better than none at all.',
    };
    setAnswers((prev) => [...prev, record]);
    if (node.timeoutReactionNodeId) setNodeId(node.timeoutReactionNodeId);
  };

  const choose = (choice: ChoiceOption) => {
    if (!currentNode) return;
    const record: AnswerRecord = {
      nodeId: currentNode.id,
      prompt: currentNode.prompt ?? '',
      selectedJapanese: choice.japanese,
      evaluation: choice.evaluation,
      points: choice.points,
      feedbackTitle: choice.feedbackTitle,
      feedbackWhy: choice.feedbackWhy,
      betterExample: choice.betterExample,
    };
    setAnswers((prev) => [...prev, record]);
    setNodeId(choice.nextNodeId);
  };

  const continueAfterFeedback = () => {
    const node = currentNode;
    setFeedbackVisible(false);
    if (!node?.mergeNodeId) return;
    setNodeId(node.mergeNodeId);
  };

  const advance = () => {
    if (!currentNode) return;
    if (currentNode.type === 'NARRATION' && !narrationFinished) {
      setTypedNarration(currentNode.text ?? '');
      setNarrationFinished(true);
      return;
    }
    if (currentNode.type === 'DIALOGUE' && currentNode.nextNodeId) {
      setNodeId(currentNode.nextNodeId);
      return;
    }
    if (currentNode.type === 'NARRATION' && currentNode.nextNodeId) {
      setNodeId(currentNode.nextNodeId);
      return;
    }
    if (currentNode.type === 'REACTION') {
      setFeedbackVisible(true);
      return;
    }
    if (currentNode.type === 'ENDING') {
      setResultsVisible(true);
    }
  };

  const restart = () => {
    setResultsVisible(false);
    setReviewVisible(false);
    setFeedbackVisible(false);
    setAnswers([]);
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
  const isReaction = currentNode.type === 'REACTION';
  const isEnding = currentNode.type === 'ENDING';
  const timerRatio = timeLeft / CHOICE_SECONDS;
  const timerDanger = timeLeft <= 6;
  const activeAudioKey = currentNode.id;

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

        {isChoice && (
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
                      reacting={false}
                    />
                  )}
                  {currentNode.characterKey && (
                    <SpriteActor
                      characterKey={currentNode.characterKey}
                      expressionKey={currentNode.expressionKey}
                      positionStyle={choicePositionStyleFor(currentNode.characterPosition, styles.choiceSpriteRight)}
                      speaking={false}
                      reacting={false}
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
                  reacting={isReaction}
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
            // DIALOGUE and REACTION share the same speech-bubble presentation.
            // A REACTION bubble opens the feedback pop-up; a DIALOGUE bubble
            // just advances the story.
            <Pressable style={[styles.speechBubbleArea, styles.speechBubbleCentered]} onPress={advance}>
              <View style={styles.speechBubble}>
                <View style={[styles.speechTail, currentNode.characterKey === 'HARU' ? styles.speechTailLeft : styles.speechTailRight]} />
                <View style={styles.speakerRow}>
                  <View style={styles.speakerDot} />
                  <Text style={styles.speakerName}>{currentNode.speaker}</Text>
                  {isReaction && (
                    <View style={rushStyles.reactionTag}>
                      <Text style={rushStyles.reactionTagText}>REACTING</Text>
                    </View>
                  )}
                  <Pressable
                    hitSlop={10}
                    style={rushStyles.audioButton}
                    onPress={(event) => {
                      event.stopPropagation();
                      void playVoice(activeAudioKey);
                    }}
                  >
                    <Ionicons
                      name={playingAudioKey === activeAudioKey ? 'volume-high' : 'volume-medium-outline'}
                      size={16}
                      color="#8423D9"
                    />
                  </Pressable>
                </View>
                {Boolean(currentNode.japanese) && (
                  <Text style={styles.dialogueJapanese} numberOfLines={3} adjustsFontSizeToFit minimumFontScale={0.72} maxFontSizeMultiplier={1.1}>
                    {currentNode.japanese}
                  </Text>
                )}
                {Boolean(currentNode.romaji) && (
                  <Text style={styles.dialogueRomaji} numberOfLines={2} maxFontSizeMultiplier={1.05}>{currentNode.romaji}</Text>
                )}
                <View style={styles.continueRowDark}>
                  <Text style={styles.continueTextDark}>{isReaction ? 'Tap to see why' : 'Tap to continue'}</Text>
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
      <Modal visible={feedbackVisible} transparent animationType="fade" onRequestClose={() => undefined}>
        <View style={styles.modalBackdrop}>
          <View style={styles.feedbackCard}>
            {lastAnswer && (
              <>
                <View style={[styles.feedbackIcon, { backgroundColor: `${evaluationTheme[lastAnswer.evaluation].color}18` }]}>
                  <Ionicons name={evaluationTheme[lastAnswer.evaluation].icon} size={34} color={evaluationTheme[lastAnswer.evaluation].color} />
                </View>
                <Text style={[styles.feedbackEyebrow, { color: evaluationTheme[lastAnswer.evaluation].color }]}>
                  {evaluationTheme[lastAnswer.evaluation].label.toUpperCase()}
                </Text>
                <Text style={styles.feedbackReaction}>{lastAnswer.feedbackTitle}</Text>
                {lastAnswer.selectedJapanese !== '—' && (
                  <View style={styles.answerComparison}>
                    <View style={styles.answerComparisonColumn}>
                      <Text style={styles.answerComparisonLabel}>YOU SAID</Text>
                      <Text style={styles.answerComparisonValue}>{lastAnswer.selectedJapanese}</Text>
                    </View>
                  </View>
                )}
                <View style={styles.explanationBox}>
                  <Text style={styles.explanationLabel}>
                    {lastAnswer.evaluation === 'BEST' ? 'WHY THIS WORKS' : 'WHY THIS NEEDS ADJUSTMENT'}
                  </Text>
                  <Text style={styles.explanationText}>{lastAnswer.feedbackWhy}</Text>
                </View>
                {lastAnswer.betterExample && (
                  <View style={rushStyles.exampleBox}>
                    <Text style={rushStyles.exampleLabel}>A BETTER EXAMPLE</Text>
                    <Text style={rushStyles.exampleJapanese}>{lastAnswer.betterExample.japanese}</Text>
                    <Text style={rushStyles.exampleRomaji}>{lastAnswer.betterExample.romaji}</Text>
                    <Text style={rushStyles.exampleNote}>{lastAnswer.betterExample.note}</Text>
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
  reactionTag: {
    marginLeft: 8,
    backgroundColor: 'rgba(212,99,93,0.12)',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  reactionTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#B83B55',
    letterSpacing: 0.4,
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
