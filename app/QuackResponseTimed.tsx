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
// Response Rush — a six-scene, twenty-decision "first weeks in Japan"
// interactive novel: the ward office, a phone contract, a bank account, a
// convenience-store errand, the train, and a part-time job interview.
//
// This is still hard-coded on purpose (dialogue, branching, feedback text,
// audio mapping all live in this file). A later request will move this
// content into MongoDB and feed it through the admin site, mirroring Reply
// Coach (QuackResponseGuided). To make that migration a straight data move
// instead of a rewrite, the content itself lives as plain SCENES data below
// — a list of scenes, each a list of decisions, each a list of choices —
// and a small builder turns that into the same NARRATION/DIALOGUE/CHOICE/
// REACTION/ENDING node graph Reply Coach's backend already speaks. Adding a
// 21st decision later means adding one object to SCENES, not touching the
// player.
//
// AUDIO — read this before touching the clip lookups below.
// This build environment has no network path to the neural voice service
// (Azure ja-JP-NanamiNeural / en-US-JennyNeural) documented in
// assets/audio/SUMI_VOICE_PROFILE.md, and the offline espeak-ng samples
// generated as a fallback were already rejected as too robotic. What this
// screen uses instead is the same real, bundled voice-actor pool the
// Politeness game (QuackSituateFormal.tsx) already ships at
// assets/audio/politeness/ (npc-01.mp3 … npc-30.mp3 — 16 female clips, 14
// male). Politeness does not dub its 30 scenarios word-for-word either; it
// plays a matching real voice per line as "flavor" audio, keyed by gender.
// Response Rush does the same thing, through the same loadBundledSound /
// stopAndUnloadSound helper Politeness uses: every Sumi line pulls the next
// clip from the female pool, every Haru line pulls the next clip from the
// male pool, cycling and repeating once the ~15/~14 real clips run out
// across this screen's 60+ voiced lines. Every bubble below has real,
// working audio today. When exact-match recordings for these lines exist,
// replace the pool lookup for that node id in `audioOverrides` with the new
// require(...) and nothing else changes.
// ---------------------------------------------------------------------------

type Evaluation = 'BEST' | 'ACCEPTABLE' | 'AWKWARD' | 'IMPOLITE' | 'RUDE' | 'TIMEOUT';
type CharacterKey = 'SUMI' | 'HARU';
type CharacterPosition = 'LEFT' | 'CENTER_LEFT' | 'CENTER' | 'CENTER_RIGHT' | 'RIGHT';

type Line = { character: CharacterKey; expression: string; japanese: string; romaji: string; speakerLabel?: string };

type ChoiceSpec = {
  id: string;
  japanese: string;
  romaji: string;
  evaluation: Evaluation;
  points: number;
  feedbackTitle: string;
  feedbackWhy: string;
  betterExample?: { japanese: string; romaji: string; note: string };
  reaction: Line;
};

type DecisionSpec = {
  id: string;
  prompt: string;
  hint: string;
  playerCharacter: CharacterKey; // who you are responding to
  playerExpression: string;
  companionExpression?: string; // Sumi's expression while she watches, when she isn't the one you're answering
  choices: ChoiceSpec[];
  timeout: Line;
};

type SceneSpec = {
  id: string;
  title: string;
  background: keyof typeof backgrounds;
  narration: string;
  opening?: Line;
  decisions: DecisionSpec[];
};

// ---------------------------------------------------------------------------
// Runtime story graph (built from SCENES at the bottom of this file)
// ---------------------------------------------------------------------------

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
  hint?: string;
  timeoutReactionNodeId?: string;
  mergeNodeId?: string;
  nextNodeId?: string;
  choices?: RuntimeChoice[];
};

type RuntimeChoice = ChoiceSpec & { nextNodeId: string };

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
  cityEvening: require('../assets/img/background/city a s1st2 nightlights.png'),
  shopFront: require('../assets/img/background/city a s3st2 day.png'),
  wardOffice: require('../assets/img/background/student council room a st2 evening.png'),
  counterRoom: require('../assets/img/background/school a hallway st2 day.png'),
  train: require('../assets/img/background/train_scene day.png'),
  interviewRoom: require('../assets/img/background/clubroom a st2 day.png'),
};

const sprites: Record<CharacterKey, Record<string, any>> = {
  SUMI: {
    NEUTRAL: require('../assets/img/Sumi_PoseB_WinterUni_Smile.png'),
    SPEAKING: require('../assets/img/Sumi_PoseB_WinterUni_Open.png'),
    SMILE: require('../assets/img/Sumi_PoseB_WinterUni_Smile_Blush.png'),
    ENCOURAGING: require('../assets/img/Sumi_PoseB_WinterUni_EyesClosed_Smile.png'),
    HAPPY_BLINK: require('../assets/img/Sumi_PoseB_WinterUni_EyesClosed_Smile_Blush.png'),
    WORRIED: require('../assets/img/Sumi_PoseB_WinterUni_Frown.png'),
    WORRIED_BLINK: require('../assets/img/Sumi_PoseB_WinterUni_EyesClosed_Frown.png'),
    SURPRISED: require('../assets/img/Sumi_PoseB_WinterUni_Open_Blush.png'),
  },
  HARU: {
    NEUTRAL: require('../assets/img/Sprite Male Dark Hair Neu01.png'),
    SPEAKING: require('../assets/img/Sprite Male Dark Hair Smi02.png'),
    SMILE: require('../assets/img/Sprite Male Dark Hair Smi01.png'),
    SERIOUS: require('../assets/img/Sprite Male Dark Hair Neu01.png'),
    CONFUSED: require('../assets/img/Sprite Male Dark Hair Con01.png'),
    ANNOYED: require('../assets/img/Sprite Male Dark Hair Ann01.png'),
    SURPRISED: require('../assets/img/Sprite Male Dark Hair Apo01.png'),
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

// Per-node overrides once exact-match recordings exist, e.g.
// n_scn_ward_greeting_choice: require('../assets/audio/response-rush/ward-greeting.mp3'),
const audioOverrides: Record<string, any> = {};

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
// SCENES — the actual content. Six real, non-repeating "new to Japan"
// errands, twenty decisions total (3+3+3+4+3+4). Every decision branches
// four ways and merges back into the same next beat, so the story never
// dead-ends and never loops the same exchange twice.
// ---------------------------------------------------------------------------

const SCENES: SceneSpec[] = [
  {
    id: 'ward',
    title: 'Ward Office · Day 6 in Japan',
    background: 'cityGate',
    narration: 'You arrived in Japan six days ago to study and work part-time. New residents must register at the local ward office within 14 days to receive their Residence Card. Sumi, a classmate, offered to walk you there for your first visit.',
    opening: { character: 'SUMI', expression: 'SMILE', japanese: '大丈夫？初めての区役所だから、私がついていくね。', romaji: 'Daijoubu? Hajimete no kuyakusho dakara, watashi ga tsuiteiku ne.', speakerLabel: 'Sumi' },
    decisions: [
      {
        id: 'greeting',
        prompt: 'Your number is called. You step up to the counter — how do you greet the clerk?',
        hint: 'This is a first meeting in an official, formal setting — greet the way you would greet a stranger, not a classmate.',
        playerCharacter: 'HARU',
        playerExpression: 'NEUTRAL',
        choices: [
          { id: 'a', japanese: 'はじめまして。よろしくお願いします。', romaji: 'Hajimemashite. Yoroshiku onegaishimasu.', evaluation: 'BEST', points: 3, feedbackTitle: 'A confident, formal opening', feedbackWhy: '"Hajimemashite" plus "yoroshiku onegaishimasu" is the standard formal opening for meeting a stranger in an official setting.', reaction: { character: 'HARU', expression: 'SMILE', japanese: 'はじめまして。こちらこそよろしくお願いします。', romaji: 'Hajimemashite. Kochira koso yoroshiku onegaishimasu.' } },
          { id: 'b', japanese: 'こんにちは。お願いします。', romaji: 'Konnichiwa. Onegaishimasu.', evaluation: 'ACCEPTABLE', points: 2, feedbackTitle: 'Friendly, but a little informal', feedbackWhy: '"Konnichiwa" is fine day-to-day, but it reads closer to greeting a classmate than a clerk on a first official visit.', betterExample: { japanese: 'はじめまして。よろしくお願いします。', romaji: 'Hajimemashite. Yoroshiku onegaishimasu.', note: 'Save "konnichiwa" for people you already know.' }, reaction: { character: 'HARU', expression: 'NEUTRAL', japanese: 'はい、どうぞ。', romaji: 'Hai, douzo.' } },
          { id: 'c', japanese: 'あ、どうも。', romaji: 'A, doumo.', evaluation: 'AWKWARD', points: 1, feedbackTitle: 'Too vague for this moment', feedbackWhy: '"Doumo" alone is a mumbled catch-all for people you already know well — at a counter it reads as unprepared.', betterExample: { japanese: 'はじめまして。よろしくお願いします。', romaji: 'Hajimemashite. Yoroshiku onegaishimasu.', note: 'A full, clear greeting takes the same breath and sets a much better tone.' }, reaction: { character: 'HARU', expression: 'CONFUSED', japanese: 'え、あ……はい。', romaji: 'E, a…… hai.' } },
          { id: 'd', japanese: 'カード、ください。早く。', romaji: 'Kaado, kudasai. Hayaku.', evaluation: 'RUDE', points: 0, feedbackTitle: 'Skips the greeting and demands speed', feedbackWhy: 'Opening with a demand and "hayaku" (quickly) skips the social greeting entirely and pressures the clerk.', betterExample: { japanese: 'はじめまして。よろしくお願いします。', romaji: 'Hajimemashite. Yoroshiku onegaishimasu.', note: 'Greet first, state your business after.' }, reaction: { character: 'HARU', expression: 'ANNOYED', japanese: '……順番にご案内いたしますので。', romaji: '……Junban ni goannai itashimasu node.' } },
        ],
        timeout: { character: 'HARU', expression: 'CONFUSED', japanese: '……あの、大丈夫ですか？', romaji: '……Ano, daijoubu desu ka?' },
      },
      {
        id: 'purpose',
        prompt: '"So, what brings you in today?" the clerk asks, pen ready.',
        hint: 'Name the exact document you need — "zairyuu kaado" (residence card) — rather than describing it vaguely.',
        playerCharacter: 'HARU',
        playerExpression: 'NEUTRAL',
        choices: [
          { id: 'a', japanese: '在留カードの登録に来ました。', romaji: 'Zairyuu kaado no touroku ni kimashita.', evaluation: 'BEST', points: 3, feedbackTitle: 'Exact, correct terminology', feedbackWhy: '"Zairyuu kaado" is the precise legal term — naming it directly means the clerk pulls the right form immediately.', reaction: { character: 'HARU', expression: 'SMILE', japanese: 'かしこまりました。こちらの用紙にご記入ください。', romaji: 'Kashikomarimashita. Kochira no youshi ni gokinyuu kudasai.' } },
          { id: 'b', japanese: '住所登録をしたいです。', romaji: 'Juusho touroku wo shitai desu.', evaluation: 'ACCEPTABLE', points: 2, feedbackTitle: 'Close, but not quite the term', feedbackWhy: '"Address registration" is part of the same process, so you\'re understood — but expect one clarifying question.', betterExample: { japanese: '在留カードの登録に来ました。', romaji: 'Zairyuu kaado no touroku ni kimashita.', note: 'Naming the card directly skips the follow-up question.' }, reaction: { character: 'HARU', expression: 'NEUTRAL', japanese: '住所登録……在留カードのことですね？', romaji: 'Juusho touroku…… zairyuu kaado no koto desu ne?' } },
          { id: 'c', japanese: 'カードのことです…', romaji: 'Kaado no koto desu…', evaluation: 'AWKWARD', points: 1, feedbackTitle: 'Too vague to act on', feedbackWhy: '"It\'s about a card…" could mean several services — the clerk now has to ask several follow-ups.', betterExample: { japanese: '在留カードの登録に来ました。', romaji: 'Zairyuu kaado no touroku ni kimashita.', note: 'A specific, complete sentence is faster for both of you.' }, reaction: { character: 'HARU', expression: 'CONFUSED', japanese: 'カード……と言いますと？', romaji: 'Kaado…… to iimasu to?' } },
          { id: 'd', japanese: '早くカードもらいたいんだけど。', romaji: 'Hayaku kaado moraitai n da kedo.', evaluation: 'IMPOLITE', points: 0, feedbackTitle: 'Tone reads as pushy', feedbackWhy: '"...n da kedo" plus "hayaku" is casual, assertive phrasing for a close friend, not a stranger behind a counter.', betterExample: { japanese: '在留カードの登録に来ました。', romaji: 'Zairyuu kaado no touroku ni kimashita.', note: 'Plain, polite -masu form keeps the meaning without the pressure.' }, reaction: { character: 'HARU', expression: 'ANNOYED', japanese: '順番にご案内しますので、少々お待ちください。', romaji: 'Junban ni goannai shimasu node, shoushou omachi kudasai.' } },
        ],
        timeout: { character: 'HARU', expression: 'CONFUSED', japanese: 'えっと……もう一度お伺いしても？', romaji: 'Etto…… mou ichido oukagai shite mo?' },
      },
      {
        id: 'understanding',
        prompt: '"Do you have your passport and Certificate of Eligibility?" You don\'t recognize that second document name — what do you do?',
        hint: 'When a word is unfamiliar, ask the person to repeat it rather than guessing or nodding along.',
        playerCharacter: 'HARU',
        playerExpression: 'CONFUSED',
        companionExpression: 'NEUTRAL',
        choices: [
          { id: 'a', japanese: 'すみません、もう一度お願いできますか？', romaji: 'Sumimasen, mou ichido onegai dekimasu ka?', evaluation: 'BEST', points: 3, feedbackTitle: 'The go-to clarification phrase', feedbackWhy: 'Polite, direct, and completely normal — even fluent speakers use it. The clerk repeats slowly.', reaction: { character: 'HARU', expression: 'SMILE', japanese: 'はい、もちろんです。ゆっくりご説明しますね。', romaji: 'Hai, mochiron desu. Yukkuri gosetsumei shimasu ne.' } },
          { id: 'b', japanese: 'すみません、わかりません。', romaji: 'Sumimasen, wakarimasen.', evaluation: 'ACCEPTABLE', points: 2, feedbackTitle: 'Honest, if a little broad', feedbackWhy: 'Polite and honest, but doesn\'t say *what* to repeat, so the clerk may over-simplify the whole explanation.', betterExample: { japanese: 'すみません、もう一度お願いできますか？', romaji: 'Sumimasen, mou ichido onegai dekimasu ka?', note: 'Asking them to repeat is more specific and usually faster.' }, reaction: { character: 'HARU', expression: 'NEUTRAL', japanese: 'わかりました。もう一度ご説明しますね。', romaji: 'Wakarimashita. Mou ichido gosetsumei shimasu ne.' } },
          { id: 'c', japanese: 'あ、はい、はい。', romaji: 'A, hai, hai.', evaluation: 'AWKWARD', points: 1, feedbackTitle: 'Nodding along is risky here', feedbackWhy: 'Agreeing without understanding risks missing a required document — usually a wasted second trip.', betterExample: { japanese: 'すみません、もう一度お願いできますか？', romaji: 'Sumimasen, mou ichido onegai dekimasu ka?', note: 'A quick clarification now is cheaper than a repeat visit later.' }, reaction: { character: 'SUMI', expression: 'WORRIED', japanese: 'ねえ、本当に大丈夫？もう一度聞いてみようよ。', romaji: 'Nee, hontou ni daijoubu? Mou ichido kiite miyou yo.' } },
          { id: 'd', japanese: '英語で話してもらえますか？', romaji: 'Eigo de hanashite moraemasu ka?', evaluation: 'IMPOLITE', points: 1, feedbackTitle: 'A reasonable ask, with a catch', feedbackWhy: 'Not rude by itself, but many ward offices have no English-speaking staff — this can put the clerk in an awkward spot.', betterExample: { japanese: 'すみません、もう一度お願いできますか？', romaji: 'Sumimasen, mou ichido onegai dekimasu ka?', note: 'Try this first — it works whether or not English is available.' }, reaction: { character: 'HARU', expression: 'CONFUSED', japanese: 'すみません、英語は少しだけです……日本語でゆっくり話しますね。', romaji: 'Sumimasen, eigo wa sukoshi dake desu…… nihongo de yukkuri hanashimasu ne.' } },
        ],
        timeout: { character: 'HARU', expression: 'CONFUSED', japanese: '……大丈夫ですか？ゆっくりで結構ですよ。', romaji: '……Daijoubu desu ka? Yukkuri de kekkou desu yo.' },
      },
    ],
  },

  {
    id: 'phone',
    title: 'Denki Town · Mobile Plan',
    background: 'shopFront',
    narration: 'Receipt in hand, you and Sumi head to a phone shop to set up a SIM plan — you\'ll need a Japanese number for the part-time job you\'re about to apply for.',
    opening: { character: 'SUMI', expression: 'ENCOURAGING', japanese: 'ここ、学生プランが安いよ。がんばって！', romaji: 'Koko, gakusei puran ga yasui yo. Ganbatte!', speakerLabel: 'Sumi' },
    decisions: [
      {
        id: 'plan',
        prompt: 'A staff member greets you at the counter. What do you say you need?',
        hint: 'Be specific about the product — a prepaid SIM plan — rather than a vague "phone thing."',
        playerCharacter: 'HARU',
        playerExpression: 'NEUTRAL',
        choices: [
          { id: 'a', japanese: 'プリペイドSIMのプランを申し込みたいです。', romaji: 'Puripeido SIM no puran wo moushikomitai desu.', evaluation: 'BEST', points: 3, feedbackTitle: 'Names the exact product', feedbackWhy: 'Naming "prepaid SIM plan" directly lets the staff pull up the right options immediately.', reaction: { character: 'HARU', expression: 'SMILE', japanese: 'かしこまりました。学生証はお持ちですか？', romaji: 'Kashikomarimashita. Gakuseishou wa omochi desu ka?' } },
          { id: 'b', japanese: '携帯電話の契約をしたいです。', romaji: 'Keitai denwa no keiyaku wo shitai desu.', evaluation: 'ACCEPTABLE', points: 2, feedbackTitle: 'Understood, but broader than needed', feedbackWhy: '"Mobile phone contract" is correct but general — the staff will need to ask which type of plan you want.', betterExample: { japanese: 'プリペイドSIMのプランを申し込みたいです。', romaji: 'Puripeido SIM no puran wo moushikomitai desu.', note: 'Naming the plan type skips a follow-up question.' }, reaction: { character: 'HARU', expression: 'NEUTRAL', japanese: 'どのようなプランをお探しですか？', romaji: 'Dono you na puran wo osagashi desu ka?' } },
          { id: 'c', japanese: 'あの、電話の…SIM？みたいな…', romaji: 'Ano, denwa no… SIM? mitai na…', evaluation: 'AWKWARD', points: 1, feedbackTitle: 'Trailing off makes it hard to help', feedbackWhy: 'Starting and not finishing the sentence leaves the staff guessing what you actually need.', betterExample: { japanese: 'プリペイドSIMのプランを申し込みたいです。', romaji: 'Puripeido SIM no puran wo moushikomitai desu.', note: 'A complete sentence, even a short one, is much clearer.' }, reaction: { character: 'HARU', expression: 'CONFUSED', japanese: 'えっと……SIMカードのことでしょうか？', romaji: 'Etto…… SIM kaado no koto deshou ka?' } },
          { id: 'd', japanese: '一番安いのちょうだい。', romaji: 'Ichiban yasui no choudai.', evaluation: 'RUDE', points: 0, feedbackTitle: '"Choudai" is for close friends only', feedbackWhy: '"Choudai" ("gimme") is casual, child-like phrasing — jarring toward staff you\'ve just met.', betterExample: { japanese: 'プリペイドSIMのプランを申し込みたいです。', romaji: 'Puripeido SIM no puran wo moushikomitai desu.', note: 'You can still ask about the cheapest option — just phrase it politely afterward.' }, reaction: { character: 'HARU', expression: 'ANNOYED', japanese: '……かしこまりました。プランをご案内します。', romaji: '……Kashikomarimashita. Puran wo goannai shimasu.' } },
        ],
        timeout: { character: 'HARU', expression: 'CONFUSED', japanese: 'お決まりになりましたら、お呼びくださいね。', romaji: 'Okimari ni narimashitara, oyobi kudasai ne.' },
      },
      {
        id: 'id',
        prompt: '"Could I see your Residence Card and student ID?" the staff asks.',
        hint: 'Hand items over with a short polite phrase, not silently.',
        playerCharacter: 'HARU',
        playerExpression: 'NEUTRAL',
        choices: [
          { id: 'a', japanese: 'はい、こちらです。どうぞ。', romaji: 'Hai, kochira desu. Douzo.', evaluation: 'BEST', points: 3, feedbackTitle: 'Clear and courteous handover', feedbackWhy: '"Kochira desu, douzo" is the natural, polite way to hand something across a counter.', reaction: { character: 'HARU', expression: 'SMILE', japanese: 'ありがとうございます。少々お待ちください。', romaji: 'Arigatou gozaimasu. Shoushou omachi kudasai.' } },
          { id: 'b', japanese: 'はい、あります。', romaji: 'Hai, arimasu.', evaluation: 'ACCEPTABLE', points: 2, feedbackTitle: 'Correct, but doesn\'t offer them', feedbackWhy: 'Confirms you have the documents, but you still need a beat to actually hand them over — a small delay.', betterExample: { japanese: 'はい、こちらです。どうぞ。', romaji: 'Hai, kochira desu. Douzo.', note: 'Pairing the confirmation with the handover phrase is smoother.' }, reaction: { character: 'HARU', expression: 'NEUTRAL', japanese: 'では、見せていただけますか？', romaji: 'Dewa, misete itadakemasu ka?' } },
          { id: 'c', japanese: '（無言でカードを渡す）', romaji: '(mugon de kaado wo watasu)', evaluation: 'AWKWARD', points: 1, feedbackTitle: 'Silence reads as curt', feedbackWhy: 'Handing something over with no words at all can feel abrupt, even if it isn\'t meant that way.', betterExample: { japanese: 'はい、こちらです。どうぞ。', romaji: 'Hai, kochira desu. Douzo.', note: 'A short phrase costs nothing and reads as far more polite.' }, reaction: { character: 'HARU', expression: 'CONFUSED', japanese: '……ありがとうございます。', romaji: '……Arigatou gozaimasu.' } },
          { id: 'd', japanese: 'なんでカードが必要なの？', romaji: 'Nande kaado ga hitsuyou na no?', evaluation: 'IMPOLITE', points: 1, feedbackTitle: 'A fair question, blunt delivery', feedbackWhy: 'Asking why is reasonable, but plain-form "nande...no?" toward staff sounds like you\'re challenging them.', betterExample: { japanese: 'どうしてカードが必要ですか？', romaji: 'Doushite kaado ga hitsuyou desu ka?', note: 'Same question, polite form — sounds curious, not confrontational.' }, reaction: { character: 'HARU', expression: 'ANNOYED', japanese: '本人確認のためです。ご協力お願いします。', romaji: 'Honnin kakunin no tame desu. Gokyouryoku onegaishimasu.' } },
        ],
        timeout: { character: 'HARU', expression: 'CONFUSED', japanese: 'お急ぎでなければ、ごゆっくりどうぞ。', romaji: 'Oisogi de nakereba, goyukkuri douzo.' },
      },
      {
        id: 'fee',
        prompt: '"There\'s a small cancellation fee if you end the plan early — is that alright?" You didn\'t quite catch the amount.',
        hint: 'Ask specifically about the number you missed, not the whole sentence again.',
        playerCharacter: 'HARU',
        playerExpression: 'CONFUSED',
        companionExpression: 'NEUTRAL',
        choices: [
          { id: 'a', japanese: 'すみません、金額を教えていただけますか？', romaji: 'Sumimasen, kingaku wo oshiete itadakemasu ka?', evaluation: 'BEST', points: 3, feedbackTitle: 'Targets exactly what you missed', feedbackWhy: 'Asking specifically for the amount gets you the one detail you need without re-explaining everything.', reaction: { character: 'HARU', expression: 'SMILE', japanese: 'はい、三千円です。', romaji: 'Hai, sanzen-en desu.' } },
          { id: 'b', japanese: 'もう一度お願いします。', romaji: 'Mou ichido onegaishimasu.', evaluation: 'ACCEPTABLE', points: 2, feedbackTitle: 'Works, but repeats everything', feedbackWhy: 'You\'ll get the full explanation again, including the parts you already understood.', betterExample: { japanese: 'すみません、金額を教えていただけますか？', romaji: 'Sumimasen, kingaku wo oshiete itadakemasu ka?', note: 'Naming the specific detail is faster.' }, reaction: { character: 'HARU', expression: 'NEUTRAL', japanese: 'かしこまりました。もう一度ご説明しますね。', romaji: 'Kashikomarimashita. Mou ichido gosetsumei shimasu ne.' } },
          { id: 'c', japanese: 'はい、大丈夫です（よくわからないまま）', romaji: 'Hai, daijoubu desu (yoku wakaranai mama)', evaluation: 'AWKWARD', points: 1, feedbackTitle: 'Agreeing to an unknown fee', feedbackWhy: 'Saying yes without knowing the amount means you could be surprised by the fee later.', betterExample: { japanese: 'すみません、金額を教えていただけますか？', romaji: 'Sumimasen, kingaku wo oshiete itadakemasu ka?', note: 'Confirm the number before agreeing to anything financial.' }, reaction: { character: 'SUMI', expression: 'WORRIED', japanese: 'え、金額聞いた？大事なところだよ。', romaji: 'E, kingaku kiita? Daiji na tokoro da yo.' } },
          { id: 'd', japanese: 'いくらでもいいよ、早く終わらせて。', romaji: 'Ikura demo ii yo, hayaku owarasete.', evaluation: 'IMPOLITE', points: 0, feedbackTitle: 'Dismissive about your own contract', feedbackWhy: 'Brushing off contract terms — and rushing the staff — reads as careless and a little rude toward someone doing their job.', betterExample: { japanese: 'すみません、金額を教えていただけますか？', romaji: 'Sumimasen, kingaku wo oshiete itadakemasu ka?', note: 'It only takes a moment to ask, and it protects you later.' }, reaction: { character: 'HARU', expression: 'ANNOYED', japanese: '……大切な内容ですので、ご確認をお願いします。', romaji: '……Taisetsu na naiyou desu node, gokakunin wo onegaishimasu.' } },
        ],
        timeout: { character: 'HARU', expression: 'CONFUSED', japanese: 'ご不明な点があれば、いつでもどうぞ。', romaji: 'Gofumei na ten ga areba, itsudemo douzo.' },
      },
    ],
  },

  {
    id: 'bank',
    title: 'Sakura Bank · Opening an Account',
    background: 'counterRoom',
    narration: 'With a phone number secured, next is a bank account — most part-time jobs pay wages by direct deposit, so this step can\'t wait.',
    opening: { character: 'SUMI', expression: 'NEUTRAL', japanese: '銀行の窓口、ちょっと緊張するよね。落ち着いていこう。', romaji: 'Ginkou no madoguchi, chotto kinchou suru yo ne. Ochitsuite ikou.', speakerLabel: 'Sumi' },
    decisions: [
      {
        id: 'purpose',
        prompt: 'A bank clerk calls you over. How do you state why you\'re here?',
        hint: '"Kouza wo hirakitai" (I\'d like to open an account) is the standard, direct phrase for this errand.',
        playerCharacter: 'HARU',
        playerExpression: 'NEUTRAL',
        choices: [
          { id: 'a', japanese: '口座を開きたいのですが。', romaji: 'Kouza wo hirakitai no desu ga.', evaluation: 'BEST', points: 3, feedbackTitle: 'Clear, standard request', feedbackWhy: 'This is the exact phrase bank staff expect — direct, polite, no ambiguity.', reaction: { character: 'HARU', expression: 'SMILE', japanese: 'かしこまりました。こちらの用紙にご記入ください。', romaji: 'Kashikomarimashita. Kochira no youshi ni gokinyuu kudasai.' } },
          { id: 'b', japanese: '口座のことでお聞きしたいです。', romaji: 'Kouza no koto de okikishitai desu.', evaluation: 'ACCEPTABLE', points: 2, feedbackTitle: 'Understood but a bit indirect', feedbackWhy: '"I\'d like to ask about an account" is polite, but doesn\'t say you want to *open* one — the clerk will ask a follow-up.', betterExample: { japanese: '口座を開きたいのですが。', romaji: 'Kouza wo hirakitai no desu ga.', note: 'Stating the action (open) directly is quicker.' }, reaction: { character: 'HARU', expression: 'NEUTRAL', japanese: 'どのようなご用件でしょうか？', romaji: 'Dono you na goyouken deshou ka?' } },
          { id: 'c', japanese: '口座…お願いします。', romaji: 'Kouza… onegaishimasu.', evaluation: 'AWKWARD', points: 1, feedbackTitle: 'Missing the verb leaves it unclear', feedbackWhy: 'Without a verb, the clerk doesn\'t know if you want to open, close, or ask about an account.', betterExample: { japanese: '口座を開きたいのですが。', romaji: 'Kouza wo hirakitai no desu ga.', note: 'Adding "hirakitai" (want to open) makes the request complete.' }, reaction: { character: 'HARU', expression: 'CONFUSED', japanese: '口座を……開設ということでよろしいですか？', romaji: 'Kouza wo…… kaisetsu to iu koto de yoroshii desu ka?' } },
          { id: 'd', japanese: '口座作ってよ、すぐ。', romaji: 'Kouza tsukutte yo, sugu.', evaluation: 'RUDE', points: 0, feedbackTitle: 'Command form toward a stranger', feedbackWhy: 'Plain command form ("tsukutte yo") plus "sugu" (right now) is the kind of tone reserved for close friends, not bank staff.', betterExample: { japanese: '口座を開きたいのですが。', romaji: 'Kouza wo hirakitai no desu ga.', note: 'The polite request form gets the same result without the friction.' }, reaction: { character: 'HARU', expression: 'ANNOYED', japanese: '……手続きにはお時間をいただきます。', romaji: '……Tetsuzuki ni wa ojikan wo itadakimasu.' } },
        ],
        timeout: { character: 'HARU', expression: 'CONFUSED', japanese: 'ご用件がまとまりましたら、教えてくださいね。', romaji: 'Goyouken ga matomarimashitara, oshiete kudasai ne.' },
      },
      {
        id: 'documents',
        prompt: '"We\'ll need your Residence Card, My Number card, and a personal seal or signature — do you have all three?" You only brought two.',
        hint: 'Say plainly which one you\'re missing rather than a vague "I don\'t have it."',
        playerCharacter: 'HARU',
        playerExpression: 'NEUTRAL',
        choices: [
          { id: 'a', japanese: 'マイナンバーカードは持っていないのですが、大丈夫でしょうか？', romaji: 'Mai Nanbaa Kaado wa motte inai no desu ga, daijoubu deshou ka?', evaluation: 'BEST', points: 3, feedbackTitle: 'Names exactly what\'s missing', feedbackWhy: 'Naming the specific missing document lets the clerk immediately tell you the alternative, instead of guessing.', reaction: { character: 'HARU', expression: 'SMILE', japanese: '大丈夫ですよ。通知カードでも結構です。', romaji: 'Daijoubu desu yo. Tsuuchi kaado demo kekkou desu.' } },
          { id: 'b', japanese: 'ひとつ足りないかもしれません。', romaji: 'Hitotsu tarinai kamoshiremasen.', evaluation: 'ACCEPTABLE', points: 2, feedbackTitle: 'Honest, but not specific', feedbackWhy: '"I might be missing one" is polite but the clerk still has to ask which document.', betterExample: { japanese: 'マイナンバーカードは持っていないのですが。', romaji: 'Mai Nanbaa Kaado wa motte inai no desu ga.', note: 'Naming the document saves a round of questions.' }, reaction: { character: 'HARU', expression: 'NEUTRAL', japanese: 'どちらが足りないでしょうか？', romaji: 'Dochira ga tarinai deshou ka?' } },
          { id: 'c', japanese: 'えっと、たぶん平気です。', romaji: 'Etto, tabun heiki desu.', evaluation: 'AWKWARD', points: 1, feedbackTitle: '"Probably fine" isn\'t reassuring', feedbackWhy: 'For an official document check, "probably fine" invites the clerk to double-check everything themselves, which takes longer.', betterExample: { japanese: 'マイナンバーカードは持っていないのですが。', romaji: 'Mai Nanbaa Kaado wa motte inai no desu ga.', note: 'A direct answer — even a "no" — moves things forward faster.' }, reaction: { character: 'HARU', expression: 'CONFUSED', japanese: '一度、確認させていただけますか？', romaji: 'Ichido, kakunin sasete itadakemasu ka?' } },
          { id: 'd', japanese: 'それ、絶対に必要なんですか？', romaji: 'Sore, zettai ni hitsuyou nan desu ka?', evaluation: 'IMPOLITE', points: 1, feedbackTitle: 'Reads as pushing back on the rule', feedbackWhy: 'Questioning whether the requirement is "really" necessary can come across as arguing with the clerk rather than asking a genuine question.', betterExample: { japanese: 'マイナンバーカードは持っていないのですが、大丈夫でしょうか？', romaji: 'Mai Nanbaa Kaado wa motte inai no desu ga, daijoubu deshou ka?', note: 'Framing it as your own situation, not a challenge to the rule, lands much better.' }, reaction: { character: 'HARU', expression: 'ANNOYED', japanese: '規定でございますので、ご了承ください。', romaji: 'Kitei de gozaimasu node, goryoushou kudasai.' } },
        ],
        timeout: { character: 'HARU', expression: 'CONFUSED', japanese: '書類のことで、何かご不安でも？', romaji: 'Shorui no koto de, nanika gofuan demo?' },
      },
      {
        id: 'callback',
        prompt: '"We\'ll mail your cash card in about a week — is this address correct?" the clerk asks, showing you the form.',
        hint: 'Check it carefully before answering — confirming a wrong address politely is better than agreeing too fast.',
        playerCharacter: 'HARU',
        playerExpression: 'NEUTRAL',
        companionExpression: 'ENCOURAGING',
        choices: [
          { id: 'a', japanese: 'はい、こちらの住所で合っています。', romaji: 'Hai, kochira no juusho de atte imasu.', evaluation: 'BEST', points: 3, feedbackTitle: 'A clear, confirmed answer', feedbackWhy: 'Directly confirming the address is correct closes this step cleanly.', reaction: { character: 'HARU', expression: 'SMILE', japanese: 'ありがとうございます。それでは手続きを進めますね。', romaji: 'Arigatou gozaimasu. Sore dewa tetsuzuki wo susumemasu ne.' } },
          { id: 'b', japanese: 'たぶん合っていると思います。', romaji: 'Tabun atte iru to omoimasu.', evaluation: 'ACCEPTABLE', points: 2, feedbackTitle: 'Understandable, but uncertain', feedbackWhy: '"I think it\'s probably right" for something that decides where your card gets mailed invites one more check from the clerk.', betterExample: { japanese: 'はい、こちらの住所で合っています。', romaji: 'Hai, kochira no juusho de atte imasu.', note: 'A confirmed yes is worth the extra second of double-checking the form first.' }, reaction: { character: 'HARU', expression: 'NEUTRAL', japanese: 'もう一度、ご確認いただけますか？', romaji: 'Mou ichido, gokakunin itadakemasu ka?' } },
          { id: 'c', japanese: '（よく見ずに）はい、はい。', romaji: '(yoku mizu ni) Hai, hai.', evaluation: 'AWKWARD', points: 1, feedbackTitle: 'Agreeing without actually checking', feedbackWhy: 'Nodding along without reading the address risks your cash card being mailed to the wrong place.', betterExample: { japanese: 'はい、こちらの住所で合っています。', romaji: 'Hai, kochira no juusho de atte imasu.', note: 'Take the extra moment to actually read it first — it\'s your mail.' }, reaction: { character: 'SUMI', expression: 'WORRIED', japanese: 'ちゃんと見た？住所、大事だよ。', romaji: 'Chanto mita? Juusho, daiji da yo.' } },
          { id: 'd', japanese: 'そんなの見なくていいから、次に進めて。', romaji: 'Sonna no minakute ii kara, tsugi ni susumete.', evaluation: 'IMPOLITE', points: 0, feedbackTitle: 'Dismissing an important check', feedbackWhy: 'Telling the clerk to skip a verification step — and to hurry — is both risky for you and abrupt toward them.', betterExample: { japanese: 'はい、こちらの住所で合っています。', romaji: 'Hai, kochira no juusho de atte imasu.', note: 'A quick, genuine confirmation is faster than it feels.' }, reaction: { character: 'HARU', expression: 'ANNOYED', japanese: '……大切な確認ですので、少々お待ちください。', romaji: '……Taisetsu na kakunin desu node, shoushou omachi kudasai.' } },
        ],
        timeout: { character: 'HARU', expression: 'CONFUSED', japanese: '住所の確認、お願いできますか？', romaji: 'Juusho no kakunin, onegai dekimasu ka?' },
      },
    ],
  },

  {
    id: 'conbini',
    title: 'Convenience Store · Evening Errand',
    background: 'cityEvening',
    narration: 'Evening now — a quick stop at the convenience store on the way home for dinner and a few things for tomorrow\'s job interview.',
    decisions: [
      {
        id: 'bag',
        prompt: '"Would you like a bag?" the cashier asks. You brought your own.',
        hint: 'A short, polite refusal — "daijoubu desu" — is all you need here.',
        playerCharacter: 'HARU',
        playerExpression: 'NEUTRAL',
        choices: [
          { id: 'a', japanese: '大丈夫です、袋は持っています。', romaji: 'Daijoubu desu, fukuro wa motte imasu.', evaluation: 'BEST', points: 3, feedbackTitle: 'Polite and complete', feedbackWhy: 'Declining politely and briefly explaining why is natural, everyday convenience-store Japanese.', reaction: { character: 'HARU', expression: 'SMILE', japanese: 'かしこまりました。', romaji: 'Kashikomarimashita.' } },
          { id: 'b', japanese: 'いらないです。', romaji: 'Iranai desu.', evaluation: 'ACCEPTABLE', points: 2, feedbackTitle: 'Understood, a little blunt', feedbackWhy: '"Don\'t need it" is clear and not rude, just slightly flatter than adding "daijoubu desu."', betterExample: { japanese: '大丈夫です、袋は持っています。', romaji: 'Daijoubu desu, fukuro wa motte imasu.', note: 'A softer opener keeps the same meaning, warmer tone.' }, reaction: { character: 'HARU', expression: 'NEUTRAL', japanese: 'かしこまりました。', romaji: 'Kashikomarimashita.' } },
          { id: 'c', japanese: '……（黙って首を振る）', romaji: '(damatte kubi wo furu)', evaluation: 'AWKWARD', points: 1, feedbackTitle: 'A silent gesture can be missed', feedbackWhy: 'A headshake alone works in person but can be missed in a busy store, or read as unengaged.', betterExample: { japanese: '大丈夫です、袋は持っています。', romaji: 'Daijoubu desu, fukuro wa motte imasu.', note: 'A short word alongside the gesture removes any doubt.' }, reaction: { character: 'HARU', expression: 'CONFUSED', japanese: '袋、よろしいですか？', romaji: 'Fukuro, yoroshii desu ka?' } },
          { id: 'd', japanese: 'いらない。', romaji: 'Iranai.', evaluation: 'IMPOLITE', points: 1, feedbackTitle: 'Plain form to a stranger', feedbackWhy: 'Dropping "desu" entirely toward store staff is more abrupt than most convenience-store exchanges call for.', betterExample: { japanese: '大丈夫です、袋は持っています。', romaji: 'Daijoubu desu, fukuro wa motte imasu.', note: 'Adding "desu" costs nothing and reads much more natural.' }, reaction: { character: 'HARU', expression: 'ANNOYED', japanese: '……かしこまりました。', romaji: '……Kashikomarimashita.' } },
        ],
        timeout: { character: 'HARU', expression: 'CONFUSED', japanese: '袋、いかがなさいますか？', romaji: 'Fukuro, ikaga nasaimasu ka?' },
      },
      {
        id: 'payment',
        prompt: 'At the register you want to ask if they accept IC card payment before you tap.',
        hint: 'Ask before tapping, not after — "tsukaemasu ka" (can I use...) is the standard way to check.',
        playerCharacter: 'HARU',
        playerExpression: 'NEUTRAL',
        choices: [
          { id: 'a', japanese: 'ICカードは使えますか？', romaji: 'IC kaado wa tsukaemasu ka?', evaluation: 'BEST', points: 3, feedbackTitle: 'The exact phrase for this', feedbackWhy: '"Can I use an IC card?" is precisely how this question is asked at any register in Japan.', reaction: { character: 'HARU', expression: 'SMILE', japanese: 'はい、ご利用いただけます。', romaji: 'Hai, goriyou itadakemasu.' } },
          { id: 'b', japanese: 'カードでいいですか？', romaji: 'Kaado de ii desu ka?', evaluation: 'ACCEPTABLE', points: 2, feedbackTitle: 'Understood, but ambiguous card type', feedbackWhy: '"Is a card okay?" works, but "card" could mean credit, debit, or IC — staff may ask which.', betterExample: { japanese: 'ICカードは使えますか？', romaji: 'IC kaado wa tsukaemasu ka?', note: 'Naming the card type avoids the follow-up question.' }, reaction: { character: 'HARU', expression: 'NEUTRAL', japanese: 'どちらのカードでしょうか？', romaji: 'Dochira no kaado deshou ka?' } },
          { id: 'c', japanese: 'これ、大丈夫？（カードを見せるだけ）', romaji: 'Kore, daijoubu? (kaado wo miseru dake)', evaluation: 'AWKWARD', points: 1, feedbackTitle: 'Silently holding up a card is unclear', feedbackWhy: 'Showing the card without naming what you\'re asking can be misread as just showing ID.', betterExample: { japanese: 'ICカードは使えますか？', romaji: 'IC kaado wa tsukaemasu ka?', note: 'A short spoken question is faster than gesturing and waiting.' }, reaction: { character: 'HARU', expression: 'CONFUSED', japanese: 'そちら、交通系ICカードですか？', romaji: 'Sochira, koutsuukei IC kaado desu ka?' } },
          { id: 'd', japanese: '普通、使えるでしょ？', romaji: 'Futsuu, tsukaeru desho?', evaluation: 'IMPOLITE', points: 1, feedbackTitle: 'Assumes the answer, sounds impatient', feedbackWhy: '"It normally works, right?" leans on the staff to agree rather than genuinely asking.', betterExample: { japanese: 'ICカードは使えますか？', romaji: 'IC kaado wa tsukaemasu ka?', note: 'A plain, genuine question is quicker and friendlier than a leading one.' }, reaction: { character: 'HARU', expression: 'ANNOYED', japanese: '店舗によって異なりますので、ご確認くださいませ。', romaji: 'Tenpo ni yotte kotonarimasu node, gokakunin kudasaimase.' } },
        ],
        timeout: { character: 'HARU', expression: 'CONFUSED', japanese: 'お支払い方法は、いかがなさいますか？', romaji: 'Oshiharai houhou wa, ikaga nasaimasu ka?' },
      },
      {
        id: 'receipt',
        prompt: '"Would you like the receipt?" the cashier asks as they finish bagging your items.',
        hint: 'Either answer is fine here — this is about picking a natural, complete phrase, not a right-or-wrong fact.',
        playerCharacter: 'HARU',
        playerExpression: 'NEUTRAL',
        choices: [
          { id: 'a', japanese: 'はい、お願いします。', romaji: 'Hai, onegaishimasu.', evaluation: 'BEST', points: 3, feedbackTitle: 'Clean, standard, and complete', feedbackWhy: 'This is the natural, complete way to say "yes, please" for a small request like this.', reaction: { character: 'HARU', expression: 'SMILE', japanese: 'かしこまりました。ありがとうございました。', romaji: 'Kashikomarimashita. Arigatou gozaimashita.' } },
          { id: 'b', japanese: 'ください。', romaji: 'Kudasai.', evaluation: 'ACCEPTABLE', points: 2, feedbackTitle: 'Understood, missing the "yes"', feedbackWhy: '"Please" alone works, but pairing it with "hai" up front sounds a touch more complete and natural.', betterExample: { japanese: 'はい、お願いします。', romaji: 'Hai, onegaishimasu.', note: 'A tiny addition that makes the exchange feel warmer.' }, reaction: { character: 'HARU', expression: 'NEUTRAL', japanese: 'かしこまりました。', romaji: 'Kashikomarimashita.' } },
          { id: 'c', japanese: 'あ、えっと……いる、かな。', romaji: 'A, etto…… iru, kana.', evaluation: 'AWKWARD', points: 1, feedbackTitle: 'Hesitation over a simple choice', feedbackWhy: 'Long hesitation over a yes/no question holds up the line behind you unnecessarily.', betterExample: { japanese: 'はい、お願いします。', romaji: 'Hai, onegaishimasu.', note: 'A quick, confident answer keeps things moving.' }, reaction: { character: 'HARU', expression: 'CONFUSED', japanese: 'レシート、いかがいたしましょうか？', romaji: 'Reshiito, ikaga itashimashou ka?' } },
          { id: 'd', japanese: 'そんなのどうでもいいよ。', romaji: 'Sonna no dou demo ii yo.', evaluation: 'IMPOLITE', points: 1, feedbackTitle: 'Dismissive toward a routine question', feedbackWhy: '"I don\'t care either way" said flatly can land as dismissive, even for a small, routine question.', betterExample: { japanese: 'いいえ、大丈夫です。', romaji: 'Iie, daijoubu desu.', note: 'Declining politely takes the same effort and sounds much better.' }, reaction: { character: 'HARU', expression: 'ANNOYED', japanese: '……では、こちらで処分いたしますね。', romaji: '……Dewa, kochira de shobun itashimasu ne.' } },
        ],
        timeout: { character: 'HARU', expression: 'CONFUSED', japanese: 'レシート、お付けしてもよろしいですか？', romaji: 'Reshiito, otsuke shite mo yoroshii desu ka?' },
      },
      {
        id: 'directions',
        prompt: 'Bags in hand, you ask a passerby near the store for directions to the nearest station.',
        hint: 'Open with "sumimasen" — it means both "excuse me" and "sorry" and is how every stranger interaction starts in Japan.',
        playerCharacter: 'SUMI',
        playerExpression: 'NEUTRAL',
        choices: [
          { id: 'a', japanese: 'すみません、駅はどちらですか？', romaji: 'Sumimasen, eki wa dochira desu ka?', evaluation: 'BEST', points: 3, feedbackTitle: 'The natural way to ask a stranger', feedbackWhy: '"Sumimasen" to open, then a clear question — this is exactly how you approach a stranger for directions.', reaction: { character: 'SUMI', expression: 'ENCOURAGING', japanese: 'いいね、それで完璧！', romaji: 'Ii ne, sore de kanpeki!' } },
          { id: 'b', japanese: '駅はどこですか？', romaji: 'Eki wa doko desu ka?', evaluation: 'ACCEPTABLE', points: 2, feedbackTitle: 'Clear, but skips the opener', feedbackWhy: 'The question itself is fine — missing "sumimasen" just makes the approach feel a little sudden.', betterExample: { japanese: 'すみません、駅はどちらですか？', romaji: 'Sumimasen, eki wa dochira desu ka?', note: '"Sumimasen" softens the interruption before you ask.' }, reaction: { character: 'SUMI', expression: 'SMILE', japanese: '惜しい！「すみません」を付けるといいよ。', romaji: 'Oshii! "Sumimasen" wo tsukeru to ii yo.' } },
          { id: 'c', japanese: 'あの……駅？', romaji: 'Ano…… eki?', evaluation: 'AWKWARD', points: 1, feedbackTitle: 'Just the word "station" is unclear', feedbackWhy: 'Saying only "station?" leaves the stranger unsure whether you\'re asking directions, confirming something, or lost.', betterExample: { japanese: 'すみません、駅はどちらですか？', romaji: 'Sumimasen, eki wa dochira desu ka?', note: 'A full question is much easier for a stranger to answer quickly.' }, reaction: { character: 'SUMI', expression: 'WORRIED', japanese: 'もう少しちゃんと聞いたほうがいいかも。', romaji: 'Mou sukoshi chanto kiita hou ga ii kamo.' } },
          { id: 'd', japanese: '駅どこ。', romaji: 'Eki doko.', evaluation: 'IMPOLITE', points: 1, feedbackTitle: 'Too clipped for a stranger', feedbackWhy: 'Dropping "wa," "desu," and "ka" entirely makes this sound like a demand rather than a question.', betterExample: { japanese: 'すみません、駅はどちらですか？', romaji: 'Sumimasen, eki wa dochira desu ka?', note: 'The full polite form is barely longer and lands much better.' }, reaction: { character: 'SUMI', expression: 'WORRIED', japanese: 'ちょっと、ぶっきらぼうすぎない？', romaji: 'Chotto, bukkirabou sugi nai?' } },
        ],
        timeout: { character: 'SUMI', expression: 'WORRIED', japanese: '道、聞いてみる？時間かかっちゃうよ。', romaji: 'Michi, kiite miru? Jikan kacchau yo.' },
      },
    ],
  },

  {
    id: 'train',
    title: 'JR Station · Commuter Pass',
    background: 'train',
    narration: 'Following the directions, you reach the station to buy a commuter pass for your new part-time job\'s commute.',
    opening: { character: 'SUMI', expression: 'NEUTRAL', japanese: '定期券、学生なら安くなるはずだよ。', romaji: 'Teikiken, gakusei nara yasuku naru hazu da yo.', speakerLabel: 'Sumi' },
    decisions: [
      {
        id: 'pass',
        prompt: 'At the ticket counter, how do you ask for a commuter pass to your job\'s station?',
        hint: '"Teikiken" is the word for commuter pass — name your destination station too.',
        playerCharacter: 'HARU',
        playerExpression: 'NEUTRAL',
        choices: [
          { id: 'a', japanese: '渋谷までの定期券をお願いします。', romaji: 'Shibuya made no teikiken wo onegaishimasu.', evaluation: 'BEST', points: 3, feedbackTitle: 'Destination plus the right word', feedbackWhy: 'Naming both the destination and "teikiken" gives the clerk everything needed in one sentence.', reaction: { character: 'HARU', expression: 'SMILE', japanese: 'かしこまりました。学生証をお願いします。', romaji: 'Kashikomarimashita. Gakuseishou wo onegaishimasu.' } },
          { id: 'b', japanese: 'チケット、渋谷までください。', romaji: 'Chiketto, Shibuya made kudasai.', evaluation: 'ACCEPTABLE', points: 2, feedbackTitle: 'Understood, but not the pass', feedbackWhy: '"Chiketto" sounds like a single ticket, not a commuter pass — the clerk will likely double-check what you want.', betterExample: { japanese: '渋谷までの定期券をお願いします。', romaji: 'Shibuya made no teikiken wo onegaishimasu.', note: '"Teikiken" specifically means the pass you\'re after.' }, reaction: { character: 'HARU', expression: 'NEUTRAL', japanese: '定期券でよろしいですか、それとも切符ですか？', romaji: 'Teikiken de yoroshii desu ka, soretomo kippu desu ka?' } },
          { id: 'c', japanese: 'あの……これ、買いたいです（画面を指す）', romaji: 'Ano…… kore, kaitai desu (gamen wo sasu)', evaluation: 'AWKWARD', points: 1, feedbackTitle: 'Pointing without naming it', feedbackWhy: 'Pointing at a screen works in person, but naming what you want out loud avoids any mix-up.', betterExample: { japanese: '渋谷までの定期券をお願いします。', romaji: 'Shibuya made no teikiken wo onegaishimasu.', note: 'Say it, don\'t just point — it\'s one clear sentence.' }, reaction: { character: 'HARU', expression: 'CONFUSED', japanese: 'こちらの定期券のことでしょうか？', romaji: 'Kochira no teikiken no koto deshou ka?' } },
          { id: 'd', japanese: '定期、はやく作って。', romaji: 'Teiki, hayaku tsukutte.', evaluation: 'RUDE', points: 0, feedbackTitle: 'Command form, no destination', feedbackWhy: 'Plain command form plus "hayaku" (hurry) is abrupt — and you never even said which station.', betterExample: { japanese: '渋谷までの定期券をお願いします。', romaji: 'Shibuya made no teikiken wo onegaishimasu.', note: 'Polite request form, with the destination, gets this done faster overall.' }, reaction: { character: 'HARU', expression: 'ANNOYED', japanese: '……行き先を教えていただけますか？', romaji: '……Yukisaki wo oshiete itadakemasu ka?' } },
        ],
        timeout: { character: 'HARU', expression: 'CONFUSED', japanese: 'ご希望の区間、お決まりですか？', romaji: 'Gokibou no kukan, okimari desu ka?' },
      },
      {
        id: 'studentId',
        prompt: '"Do you have a student ID for the discount?" the clerk asks.',
        hint: 'If you don\'t have it on you, say so plainly and ask what happens next — don\'t just apologize and stop talking.',
        playerCharacter: 'HARU',
        playerExpression: 'NEUTRAL',
        companionExpression: 'WORRIED',
        choices: [
          { id: 'a', japanese: 'すみません、今日は持ってきていません。通常料金で大丈夫です。', romaji: 'Sumimasen, kyou wa motte kite imasen. Tsuujou ryoukin de daijoubu desu.', evaluation: 'BEST', points: 3, feedbackTitle: 'States the situation and a solution', feedbackWhy: 'Explaining you don\'t have it today and offering to pay full price keeps things moving without confusion.', reaction: { character: 'HARU', expression: 'SMILE', japanese: 'かしこまりました。それでは通常料金でご案内します。', romaji: 'Kashikomarimashita. Sore dewa tsuujou ryoukin de goannai shimasu.' } },
          { id: 'b', japanese: '持っていません。', romaji: 'Motte imasen.', evaluation: 'ACCEPTABLE', points: 2, feedbackTitle: 'True, but leaves the next step open', feedbackWhy: 'This answers the question, but doesn\'t say what you\'d like to do instead — the clerk has to ask.', betterExample: { japanese: 'すみません、今日は持ってきていません。通常料金で大丈夫です。', romaji: 'Sumimasen, kyou wa motte kite imasen. Tsuujou ryoukin de daijoubu desu.', note: 'Offering the next step yourself saves a round of back-and-forth.' }, reaction: { character: 'HARU', expression: 'NEUTRAL', japanese: 'では、通常料金でよろしいでしょうか？', romaji: 'Dewa, tsuujou ryoukin de yoroshii deshou ka?' } },
          { id: 'c', japanese: 'えっと……ないかも。', romaji: 'Etto…… nai kamo.', evaluation: 'AWKWARD', points: 1, feedbackTitle: '"Maybe not" is hard to act on', feedbackWhy: '"Maybe I don\'t have it" leaves the clerk unsure whether to wait while you check your bag or move on.', betterExample: { japanese: 'すみません、今日は持ってきていません。', romaji: 'Sumimasen, kyou wa motte kite imasen.', note: 'A clear answer either way keeps the line moving.' }, reaction: { character: 'SUMI', expression: 'WORRIED', japanese: '学生証、持ってきた？' , romaji: 'Gakuseishou, motte kita?' } },
          { id: 'd', japanese: 'それ、絶対必要なんですか？', romaji: 'Sore, zettai hitsuyou nan desu ka?', evaluation: 'IMPOLITE', points: 1, feedbackTitle: 'Sounds like arguing the rule', feedbackWhy: 'Questioning whether ID is "really" required can come across as pushing back rather than genuinely asking.', betterExample: { japanese: 'すみません、今日は持ってきていません。通常料金で大丈夫です。', romaji: 'Sumimasen, kyou wa motte kite imasen. Tsuujou ryoukin de daijoubu desu.', note: 'Owning the situation moves things forward faster than questioning the policy.' }, reaction: { character: 'HARU', expression: 'ANNOYED', japanese: '学割の規定でございますので。', romaji: 'Gakuwari no kitei de gozaimasu node.' } },
        ],
        timeout: { character: 'HARU', expression: 'CONFUSED', japanese: '学生証は、お持ちでしょうか？', romaji: 'Gakuseishou wa, omochi deshou ka?' },
      },
      {
        id: 'wrongPlatform',
        prompt: 'Pass in hand, you board and realize — one stop later — you\'re going the wrong direction. You ask a station staff member for help.',
        hint: 'A short apology plus a clear explanation of the mistake works better than just looking confused.',
        playerCharacter: 'HARU',
        playerExpression: 'CONFUSED',
        companionExpression: 'WORRIED',
        choices: [
          { id: 'a', japanese: 'すみません、反対方向に乗ってしまいました。渋谷はどう戻ればいいですか？', romaji: 'Sumimasen, hantai houkou ni notte shimaimashita. Shibuya wa dou modoreba ii desu ka?', evaluation: 'BEST', points: 3, feedbackTitle: 'Explains the mistake and asks a clear question', feedbackWhy: 'Naming exactly what happened and what you need lets the staff answer immediately, with no guessing.', reaction: { character: 'HARU', expression: 'SMILE', japanese: '大丈夫ですよ。次の駅で反対のホームに移ってください。', romaji: 'Daijoubu desu yo. Tsugi no eki de hantai no hoomu ni utsutte kudasai.' } },
          { id: 'b', japanese: '道、間違えました。', romaji: 'Michi, machigaemashita.', evaluation: 'ACCEPTABLE', points: 2, feedbackTitle: 'Honest, but not specific enough', feedbackWhy: '"I made a mistake" is true but vague on a train line — the staff will need to ask what exactly went wrong.', betterExample: { japanese: 'すみません、反対方向に乗ってしまいました。渋谷はどう戻ればいいですか？', romaji: 'Sumimasen, hantai houkou ni notte shimaimashita. Shibuya wa dou modoreba ii desu ka?', note: 'Naming the direction and your destination gets a faster, exact answer.' }, reaction: { character: 'HARU', expression: 'NEUTRAL', japanese: 'どちらまで行かれたいですか？', romaji: 'Dochira made ikaretai desu ka?' } },
          { id: 'c', japanese: 'あの……道に迷いました、たぶん。', romaji: 'Ano…… michi ni mayoimashita, tabun.', evaluation: 'AWKWARD', points: 1, feedbackTitle: '"Lost, maybe" slows the help down', feedbackWhy: 'Hedging with "tabun" (maybe) about being lost makes it unclear whether you actually need help right now.', betterExample: { japanese: 'すみません、反対方向に乗ってしまいました。', romaji: 'Sumimasen, hantai houkou ni notte shimaimashita.', note: 'Stating it plainly gets you faster, more confident directions.' }, reaction: { character: 'SUMI', expression: 'WORRIED', japanese: '大丈夫？ちゃんと聞こう？', romaji: 'Daijoubu? Chanto kikou?' } },
          { id: 'd', japanese: 'この電車、変じゃないですか？', romaji: 'Kono densha, hen janai desu ka?', evaluation: 'IMPOLITE', points: 1, feedbackTitle: 'Implies the train is at fault', feedbackWhy: '"Isn\'t this train weird?" shifts blame onto the train (and implicitly the staff) rather than explaining your own mistake.', betterExample: { japanese: 'すみません、反対方向に乗ってしまいました。', romaji: 'Sumimasen, hantai houkou ni notte shimaimashita.', note: 'Owning the mix-up gets you clear help faster than questioning the train.' }, reaction: { character: 'HARU', expression: 'ANNOYED', japanese: '……行き先を教えていただけますか？', romaji: '……Yukisaki wo oshiete itadakemasu ka?' } },
        ],
        timeout: { character: 'HARU', expression: 'CONFUSED', japanese: 'お困りのようですが、大丈夫ですか？', romaji: 'Okomari no you desu ga, daijoubu desu ka?' },
      },
    ],
  },

  {
    id: 'interview',
    title: 'Cafe Sunlight · Part-Time Job Interview',
    background: 'interviewRoom',
    narration: 'Back on track and right on time — your part-time job interview at a neighborhood cafe. Sumi waits outside while you go in.',
    opening: { character: 'HARU', expression: 'NEUTRAL', japanese: 'どうぞ、お座りください。今日はよろしくお願いします。', romaji: 'Douzo, osuwari kudasai. Kyou wa yoroshiku onegaishimasu.', speakerLabel: 'Manager Haru' },
    decisions: [
      {
        id: 'introduce',
        prompt: '"Please introduce yourself," the manager says.',
        hint: 'The humble self-introduction pattern is "〜と申します" — more formal than "desu" for this kind of setting.',
        playerCharacter: 'HARU',
        playerExpression: 'NEUTRAL',
        choices: [
          { id: 'a', japanese: 'はじめまして、〇〇と申します。よろしくお願いいたします。', romaji: 'Hajimemashite, ___ to moushimasu. Yoroshiku onegai itashimasu.', evaluation: 'BEST', points: 3, feedbackTitle: 'The textbook interview opener', feedbackWhy: 'The humble "to moushimasu" plus the extra-formal "itashimasu" is exactly the register expected in a job interview.', reaction: { character: 'HARU', expression: 'SMILE', japanese: 'こちらこそ、よろしくお願いします。', romaji: 'Kochira koso, yoroshiku onegaishimasu.' } },
          { id: 'b', japanese: 'はじめまして、〇〇です。よろしくお願いします。', romaji: 'Hajimemashite, ___ desu. Yoroshiku onegaishimasu.', evaluation: 'ACCEPTABLE', points: 2, feedbackTitle: 'Polite, one register down', feedbackWhy: '"Desu" instead of the humble "moushimasu" is perfectly polite — just slightly less formal than a job interview typically calls for.', betterExample: { japanese: 'はじめまして、〇〇と申します。', romaji: 'Hajimemashite, ___ to moushimasu.', note: 'The humble form signals you understand interview etiquette.' }, reaction: { character: 'HARU', expression: 'NEUTRAL', japanese: 'よろしくお願いします。では、始めましょう。', romaji: 'Yoroshiku onegaishimasu. Dewa, hajimemashou.' } },
          { id: 'c', japanese: '〇〇です。', romaji: '___ desu.', evaluation: 'AWKWARD', points: 1, feedbackTitle: 'Correct, but very bare for an interview', feedbackWhy: 'Just stating your name is technically an answer, but skips the greeting entirely, which feels abrupt for an interview.', betterExample: { japanese: 'はじめまして、〇〇と申します。よろしくお願いいたします。', romaji: 'Hajimemashite, ___ to moushimasu. Yoroshiku onegai itashimasu.', note: 'A full introduction shows you\'re taking the interview seriously.' }, reaction: { character: 'HARU', expression: 'CONFUSED', japanese: 'あ……えっと、よろしくお願いします。', romaji: 'A…… etto, yoroshiku onegaishimasu.' } },
          { id: 'd', japanese: '〇〇。よろしく。', romaji: '___. Yoroshiku.', evaluation: 'IMPOLITE', points: 0, feedbackTitle: 'Far too casual for this room', feedbackWhy: 'Dropping every polite marker makes this sound like introducing yourself to a classmate, not a hiring manager.', betterExample: { japanese: 'はじめまして、〇〇と申します。よろしくお願いいたします。', romaji: 'Hajimemashite, ___ to moushimasu. Yoroshiku onegai itashimasu.', note: 'Interviews call for the most formal register you have.' }, reaction: { character: 'HARU', expression: 'ANNOYED', japanese: '……では、面接を始めますね。', romaji: '……Dewa, mensetsu wo hajimemasu ne.' } },
        ],
        timeout: { character: 'HARU', expression: 'CONFUSED', japanese: '緊張しなくて大丈夫ですよ。準備はいいですか？', romaji: 'Kinchou shinakute daijoubu desu yo. Junbi wa ii desu ka?' },
      },
      {
        id: 'availability',
        prompt: '"What days and hours can you work?" the manager asks.',
        hint: 'Give specific days and times — a vague "whenever" is harder for a manager to schedule around.',
        playerCharacter: 'HARU',
        playerExpression: 'NEUTRAL',
        choices: [
          { id: 'a', japanese: '平日の夕方と週末は終日働けます。', romaji: 'Heijitsu no yuugata to shuumatsu wa shuujitsu hatarakemasu.', evaluation: 'BEST', points: 3, feedbackTitle: 'Specific and schedulable', feedbackWhy: 'Naming exact days and times gives the manager everything needed to build a shift schedule around you.', reaction: { character: 'HARU', expression: 'SMILE', japanese: 'それは助かります。シフトの相談をしましょう。', romaji: 'Sore wa tasukarimasu. Shifuto no soudan wo shimashou.' } },
          { id: 'b', japanese: '週末なら働けます。', romaji: 'Shuumatsu nara hatarakemasu.', evaluation: 'ACCEPTABLE', points: 2, feedbackTitle: 'Clear, but narrower than needed', feedbackWhy: 'This answers the question, but a manager will likely ask about weekdays too before deciding.', betterExample: { japanese: '平日の夕方と週末は終日働けます。', romaji: 'Heijitsu no yuugata to shuumatsu wa shuujitsu hatarakemasu.', note: 'Covering both weekday and weekend availability up front saves a follow-up question.' }, reaction: { character: 'HARU', expression: 'NEUTRAL', japanese: '平日はいかがですか？', romaji: 'Heijitsu wa ikaga desu ka?' } },
          { id: 'c', japanese: 'えっと、いつでも大丈夫です、たぶん。', romaji: 'Etto, itsudemo daijoubu desu, tabun.', evaluation: 'AWKWARD', points: 1, feedbackTitle: '"Whenever, maybe" is hard to schedule', feedbackWhy: 'It sounds accommodating, but "maybe anytime" gives the manager nothing concrete to build a shift around.', betterExample: { japanese: '平日の夕方と週末は終日働けます。', romaji: 'Heijitsu no yuugata to shuumatsu wa shuujitsu hatarakemasu.', note: 'Specific times are easier for both of you than open-ended flexibility.' }, reaction: { character: 'HARU', expression: 'CONFUSED', japanese: '具体的に、何曜日がよろしいですか？', romaji: 'Gutaiteki ni, nan youbi ga yoroshii desu ka?' } },
          { id: 'd', japanese: 'それはまだ分からないです、後で連絡します。', romaji: 'Sore wa mada wakaranai desu, ato de renraku shimasu.', evaluation: 'IMPOLITE', points: 1, feedbackTitle: 'Deflecting a basic interview question', feedbackWhy: 'Coming to a job interview without any idea of your own availability, and pushing the answer to later, reads as unprepared.', betterExample: { japanese: '平日の夕方と週末は終日働けます。', romaji: 'Heijitsu no yuugata to shuumatsu wa shuujitsu hatarakemasu.', note: 'Knowing your own schedule going in is part of interview preparation.' }, reaction: { character: 'HARU', expression: 'ANNOYED', japanese: '……そうですか。では次の質問に移りますね。', romaji: '……Sou desu ka. Dewa tsugi no shitsumon ni utsurimasu ne.' } },
        ],
        timeout: { character: 'HARU', expression: 'CONFUSED', japanese: 'ゆっくりで大丈夫ですよ。シフトのご希望は？', romaji: 'Yukkuri de daijoubu desu yo. Shifuto no gokibou wa?' },
      },
      {
        id: 'whyHere',
        prompt: '"Why do you want to work here specifically?" the manager asks.',
        hint: 'A specific, honest reason lands better than a generic one — mention something real about the shop or the practice you want.',
        playerCharacter: 'HARU',
        playerExpression: 'NEUTRAL',
        choices: [
          { id: 'a', japanese: 'このカフェの雰囲気が好きで、接客を通して日本語も上達させたいです。', romaji: 'Kono kafe no fun\'iki ga suki de, sekkyaku wo tooshite nihongo mo joutatsu sasetai desu.', evaluation: 'BEST', points: 3, feedbackTitle: 'Specific and genuine', feedbackWhy: 'Naming what you like about this specific cafe, plus a real personal goal, shows you thought about the answer rather than reciting one.', reaction: { character: 'HARU', expression: 'SMILE', japanese: 'いいですね、その気持ち、大事にしてください。', romaji: 'Ii desu ne, sono kimochi, taisetsu ni shite kudasai.' } },
          { id: 'b', japanese: 'お金が必要だからです。', romaji: 'Okane ga hitsuyou dakara desu.', evaluation: 'ACCEPTABLE', points: 2, feedbackTitle: 'Honest, but very transactional', feedbackWhy: 'It\'s a real reason and not impolite, but it says nothing about this specific job — most managers want to hear at least one more sentence.', betterExample: { japanese: 'このカフェの雰囲気が好きで、接客を通して日本語も上達させたいです。', romaji: 'Kono kafe no fun\'iki ga suki de, sekkyaku wo tooshite nihongo mo joutatsu sasetai desu.', note: 'Adding a specific, personal reason rounds out the answer.' }, reaction: { character: 'HARU', expression: 'NEUTRAL', japanese: 'なるほど。ほかに理由はありますか？', romaji: 'Naruhodo. Hoka ni riyuu wa arimasu ka?' } },
          { id: 'c', japanese: 'うーん、特にないです。', romaji: 'Uun, tokuni nai desu.', evaluation: 'AWKWARD', points: 1, feedbackTitle: '"No particular reason" undersells you', feedbackWhy: 'Saying you have no real reason for this specific job can read as low motivation, even if that\'s not what you meant.', betterExample: { japanese: 'このカフェの雰囲気が好きで、接客を通して日本語も上達させたいです。', romaji: 'Kono kafe no fun\'iki ga suki de, sekkyaku wo tooshite nihongo mo joutatsu sasetai desu.', note: 'Even one specific detail is much stronger than "no reason."' }, reaction: { character: 'HARU', expression: 'CONFUSED', japanese: 'そうですか……何か興味を持ったきっかけは？', romaji: 'Sou desu ka…… nanika kyoumi wo motta kikkake wa?' } },
          { id: 'd', japanese: '他に応募するところがなかったので。', romaji: 'Hoka ni oubo suru tokoro ga nakatta node.', evaluation: 'IMPOLITE', points: 1, feedbackTitle: 'Implies this was a last resort', feedbackWhy: '"There was nowhere else to apply" tells the manager this job wasn\'t really your choice, which isn\'t a great look in an interview.', betterExample: { japanese: 'このカフェの雰囲気が好きで、接客を通して日本語も上達させたいです。', romaji: 'Kono kafe no fun\'iki ga suki de, sekkyaku wo tooshite nihongo mo joutatsu sasetai desu.', note: 'Even a small genuine reason reads far better than "no other options."' }, reaction: { character: 'HARU', expression: 'ANNOYED', japanese: '……分かりました。次に進みましょう。', romaji: '……Wakarimashita. Tsugi ni susumimashou.' } },
        ],
        timeout: { character: 'HARU', expression: 'CONFUSED', japanese: 'ゆっくり考えていただいて大丈夫ですよ。', romaji: 'Yukkuri kangaete itadaite daijoubu desu yo.' },
      },
      {
        id: 'clarify',
        prompt: '"We rotate closing shifts on a biweekly basis" — you didn\'t catch that last word.',
        hint: 'Ask specifically about the word you missed, the same way you did at the ward office earlier today.',
        playerCharacter: 'HARU',
        playerExpression: 'CONFUSED',
        choices: [
          { id: 'a', japanese: 'すみません、「隔週」の意味を教えていただけますか？', romaji: 'Sumimasen, "kakushuu" no imi wo oshiete itadakemasu ka?', evaluation: 'BEST', points: 3, feedbackTitle: 'Names the exact word you missed', feedbackWhy: 'Pointing at the specific unfamiliar word gets you a precise, fast explanation instead of the whole sentence repeated.', reaction: { character: 'HARU', expression: 'SMILE', japanese: 'あ、一週おきという意味です。', romaji: 'A, isshuu oki to iu imi desu.' } },
          { id: 'b', japanese: 'もう一度お願いします。', romaji: 'Mou ichido onegaishimasu.', evaluation: 'ACCEPTABLE', points: 2, feedbackTitle: 'Works, but repeats the whole thing', feedbackWhy: 'You\'ll get the entire sentence again, including the parts you already understood.', betterExample: { japanese: 'すみません、「隔週」の意味を教えていただけますか？', romaji: 'Sumimasen, "kakushuu" no imi wo oshiete itadakemasu ka?', note: 'Naming the specific word is faster for an interview setting.' }, reaction: { character: 'HARU', expression: 'NEUTRAL', japanese: 'かしこまりました。もう一度お伝えしますね。', romaji: 'Kashikomarimashita. Mou ichido otsutae shimasu ne.' } },
          { id: 'c', japanese: 'あ、はい、大丈夫です（分からないまま）', romaji: 'A, hai, daijoubu desu (wakaranai mama)', evaluation: 'AWKWARD', points: 1, feedbackTitle: 'Agreeing to a schedule term you don\'t know', feedbackWhy: 'Nodding along to a shift rule you didn\'t understand could mean surprises on your actual work schedule later.', betterExample: { japanese: 'すみません、「隔週」の意味を教えていただけますか？', romaji: 'Sumimasen, "kakushuu" no imi wo oshiete itadakemasu ka?', note: 'It\'s always worth clarifying schedule terms before agreeing to them.' }, reaction: { character: 'HARU', expression: 'CONFUSED', japanese: '大丈夫ですか？何かご不明な点は？', romaji: 'Daijoubu desu ka? Nanika gofumei na ten wa?' } },
          { id: 'd', japanese: '日本語、難しすぎます。', romaji: 'Nihongo, muzukashi sugimasu.', evaluation: 'IMPOLITE', points: 1, feedbackTitle: 'Comments on the language, not the word', feedbackWhy: '"Japanese is too hard" is an understandable feeling, but as a direct reply it can come across as a complaint rather than a request for help.', betterExample: { japanese: 'すみません、「隔週」の意味を教えていただけますか？', romaji: 'Sumimasen, "kakushuu" no imi wo oshiete itadakemasu ka?', note: 'Naming the one word you need helps far more than commenting on the difficulty.' }, reaction: { character: 'HARU', expression: 'ANNOYED', japanese: '……ゆっくり説明しますね。', romaji: '……Yukkuri setsumei shimasu ne.' } },
        ],
        timeout: { character: 'HARU', expression: 'CONFUSED', japanese: '今のところ、大丈夫でしたか？', romaji: 'Ima no tokoro, daijoubu deshita ka?' },
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Builder: turns SCENES into the flat StoryNode graph the player renders.
// ---------------------------------------------------------------------------

function buildStory(scenes: SceneSpec[]): { nodes: StoryNode[]; startId: string; totalChoices: number } {
  const built: StoryNode[] = [];
  let totalChoices = 0;

  const decisionChoiceId = (sceneId: string, decisionId: string) => `n_${sceneId}_${decisionId}_choice`;
  const decisionReactId = (sceneId: string, decisionId: string, choiceId: string) => `n_${sceneId}_${decisionId}_react_${choiceId}`;
  const decisionTimeoutId = (sceneId: string, decisionId: string) => `n_${sceneId}_${decisionId}_react_timeout`;
  const sceneNarrationId = (sceneId: string) => `n_${sceneId}_narration`;
  const sceneOpeningId = (sceneId: string) => `n_${sceneId}_opening`;

  scenes.forEach((scene, sceneIndex) => {
    const nextScene = scenes[sceneIndex + 1];
    const firstDecision = scene.decisions[0];
    const afterOpeningId = firstDecision ? decisionChoiceId(scene.id, firstDecision.id) : 'n_ending';

    built.push({
      id: sceneNarrationId(scene.id),
      type: 'NARRATION',
      title: scene.title,
      text: scene.narration,
      backgroundKey: scene.background,
      nextNodeId: scene.opening ? sceneOpeningId(scene.id) : afterOpeningId,
    });

    if (scene.opening) {
      built.push({
        id: sceneOpeningId(scene.id),
        type: 'DIALOGUE',
        speaker: scene.opening.speakerLabel ?? (scene.opening.character === 'SUMI' ? 'Sumi' : 'Haru'),
        characterKey: scene.opening.character,
        expressionKey: scene.opening.expression,
        characterPosition: 'CENTER',
        backgroundKey: scene.background,
        spritesVisible: true,
        japanese: scene.opening.japanese,
        romaji: scene.opening.romaji,
        nextNodeId: afterOpeningId,
      });
    }

    scene.decisions.forEach((decision, decisionIndex) => {
      const nextDecision = scene.decisions[decisionIndex + 1];
      const mergeTarget = nextDecision
        ? decisionChoiceId(scene.id, nextDecision.id)
        : nextScene
          ? sceneNarrationId(nextScene.id)
          : 'n_ending';

      totalChoices += 1;

      built.push({
        id: decisionChoiceId(scene.id, decision.id),
        type: 'CHOICE',
        title: `${scene.title.split('·')[0].trim()} · Decision`,
        prompt: decision.prompt,
        hint: decision.hint,
        characterKey: decision.playerCharacter,
        expressionKey: decision.playerExpression,
        characterPosition: 'RIGHT',
        secondaryCharacterKey: decision.playerCharacter === 'SUMI' ? 'HARU' : 'SUMI',
        secondaryExpressionKey: decision.companionExpression ?? 'NEUTRAL',
        secondaryCharacterPosition: 'LEFT',
        backgroundKey: scene.background,
        spritesVisible: true,
        timeoutReactionNodeId: decisionTimeoutId(scene.id, decision.id),
        choices: decision.choices.map((choice) => ({
          ...choice,
          nextNodeId: decisionReactId(scene.id, decision.id, choice.id),
        })),
      });

      decision.choices.forEach((choice) => {
        built.push({
          id: decisionReactId(scene.id, decision.id, choice.id),
          type: 'REACTION',
          speaker: choice.reaction.character === 'SUMI' ? 'Sumi' : (decision.playerCharacter === 'HARU' ? scene.opening?.speakerLabel?.startsWith('Manager') ? 'Manager Haru' : 'Haru' : 'Haru'),
          characterKey: choice.reaction.character,
          expressionKey: choice.reaction.expression,
          characterPosition: 'CENTER',
          backgroundKey: scene.background,
          spritesVisible: true,
          japanese: choice.reaction.japanese,
          romaji: choice.reaction.romaji,
          mergeNodeId: mergeTarget,
        });
      });

      built.push({
        id: decisionTimeoutId(scene.id, decision.id),
        type: 'REACTION',
        speaker: decision.timeout.character === 'SUMI' ? 'Sumi' : 'Haru',
        characterKey: decision.timeout.character,
        expressionKey: decision.timeout.expression,
        characterPosition: 'CENTER',
        backgroundKey: scene.background,
        spritesVisible: true,
        japanese: decision.timeout.japanese,
        romaji: decision.timeout.romaji,
        mergeNodeId: mergeTarget,
      });
    });
  });

  built.push({
    id: 'n_ending',
    type: 'ENDING',
    title: 'First Weeks, Handled',
    text: 'Residence card filed, phone active, bank account open, groceries in the fridge, commute figured out, and a part-time job waiting to hear back. Sumi grins as you both head home. "See? You\'re basically a local now," she says. Not bad for one very long day.',
    backgroundKey: 'interviewRoom',
  });

  return { nodes: built, startId: sceneNarrationId(scenes[0].id), totalChoices };
}

const { nodes, startId: START_NODE_ID, totalChoices: TOTAL_CHOICES } = buildStory(SCENES);
const nodeMap = new Map(nodes.map((node) => [node.id, node]));
const CHAPTER_TITLE = 'Response Rush · Your First Weeks in Japan';

const resolveAudio = (() => {
  let femaleCursor = 0;
  let maleCursor = 0;
  const resolved: Record<string, any> = {};
  return (nodeId: string, characterKey?: CharacterKey) => {
    if (resolved[nodeId]) return resolved[nodeId];
    if (audioOverrides[nodeId]) {
      resolved[nodeId] = audioOverrides[nodeId];
      return resolved[nodeId];
    }
    if (!characterKey) return undefined;
    if (characterKey === 'SUMI') {
      const clip = femaleVoicePool[femaleCursor % femaleVoicePool.length];
      femaleCursor += 1;
      resolved[nodeId] = clip;
      return clip;
    }
    const clip = maleVoicePool[maleCursor % maleVoicePool.length];
    maleCursor += 1;
    resolved[nodeId] = clip;
    return clip;
  };
})();
// Pre-resolve every voiced node once, in story order, so playback is instant.
nodes.forEach((node) => {
  if ((node.type === 'DIALOGUE' || node.type === 'REACTION') && node.characterKey) {
    resolveAudio(node.id, node.characterKey);
  }
});

type SpriteActorProps = {
  characterKey: CharacterKey;
  expressionKey?: string;
  positionStyle: any;
  speaking: boolean;
  reacting: boolean;
};

// Restores Reply Coach's blink / mouth-flicker treatment: a resting
// character periodically crossfades to a blink-like frame, a speaking
// character crossfades to its "mouth open" frame, and — new for Response
// Rush — a reaction node gets a one-shot pop so the change of expression
// visibly registers the instant it appears.
function SpriteActor({ characterKey, expressionKey = 'NEUTRAL', positionStyle, speaking, reacting }: SpriteActorProps) {
  const expressionOpacity = useRef(new Animated.Value(0)).current;
  const bodyScale = useRef(new Animated.Value(1)).current;
  const neutralSource = sprites[characterKey]?.NEUTRAL;
  const expressionSource = sprites[characterKey]?.[expressionKey] ?? neutralSource;
  const motionSource = characterKey === 'SUMI' ? sprites.SUMI.SPEAKING : sprites.HARU.SPEAKING;
  const restingMotionSource = characterKey === 'SUMI'
    ? (sprites.SUMI.HAPPY_BLINK ?? sprites.SUMI.SMILE)
    : sprites.HARU.SMILE;
  const canUseRestingMotion = ['NEUTRAL', 'SMILE', 'SERIOUS'].includes(expressionKey);

  useEffect(() => {
    expressionOpacity.stopAnimation();
    expressionOpacity.setValue(0);

    const expressionLoop = Animated.loop(
      Animated.sequence([
        Animated.delay(speaking ? 280 : 2200),
        Animated.timing(expressionOpacity, { toValue: 1, duration: speaking ? 90 : 70, useNativeDriver: true }),
        Animated.delay(speaking ? 150 : 100),
        Animated.timing(expressionOpacity, { toValue: 0, duration: speaking ? 110 : 90, useNativeDriver: true }),
        Animated.delay(speaking ? 180 : 700),
      ]),
    );

    const breathingLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(bodyScale, { toValue: 1.008, duration: 1300, useNativeDriver: true }),
        Animated.timing(bodyScale, { toValue: 1, duration: 1300, useNativeDriver: true }),
      ]),
    );

    expressionLoop.start();
    breathingLoop.start();

    return () => {
      expressionLoop.stop();
      breathingLoop.stop();
    };
  }, [characterKey, expressionKey, speaking]);

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
      <Image source={expressionSource} style={styles.spriteLayer} resizeMode="contain" fadeDuration={0} />
      <Animated.Image
        source={speaking ? motionSource : canUseRestingMotion ? (restingMotionSource ?? neutralSource) : expressionSource}
        style={[styles.spriteLayer, { opacity: expressionOpacity }]}
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
  const [hintVisible, setHintVisible] = useState(false);
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
  const progress = Math.min(1, answers.length / Math.max(1, TOTAL_CHOICES));
  const totalPoints = answers.reduce((sum, answer) => sum + answer.points, 0);
  const maxPoints = TOTAL_CHOICES * 3;
  const lastAnswer = answers[answers.length - 1];

  useEffect(() => () => {
    const music = backgroundMusic.current;
    backgroundMusic.current = null;
    if (music) void music.stopAsync().finally(() => music.unloadAsync());
    void stopAndUnloadSound(voiceSound.current);
    voiceSound.current = null;
  }, []);

  useEffect(() => {
    const trackKey = currentNode?.type === 'CHOICE' ? 'tense' : 'calm';
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
  }, [currentNode?.type]);

  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, { toValue: 1, duration: 260, useNativeDriver: true }).start();
  }, [nodeId]);

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

  useEffect(() => {
    setHintVisible(false);
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
    const source = audioOverrides[key] ?? resolveAudio(key, nodeMap.get(key)?.characterKey);
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

  const choose = (choice: RuntimeChoice) => {
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
    if ((currentNode.type === 'DIALOGUE' || currentNode.type === 'NARRATION') && currentNode.nextNodeId) {
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
            <Text style={styles.headerEyebrow}>RESPONSE RUSH · {CHOICE_SECONDS}s PER CHOICE · {answers.length}/{TOTAL_CHOICES}</Text>
            <Text style={styles.headerTitle} numberOfLines={1}>{currentNode.title?.split('·')[0]?.trim() || CHAPTER_TITLE}</Text>
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
                  <Text style={styles.decisionTitle}>Decision {answers.length + 1} of {TOTAL_CHOICES}</Text>
                </View>
                <Pressable style={styles.hintButton} onPress={() => setHintVisible(true)}>
                  <Ionicons name="bulb-outline" size={18} color="#D58A1E" />
                  <Text style={styles.hintButtonText}>Hint</Text>
                </Pressable>
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

      {/* Hint */}
      <Modal visible={hintVisible} transparent animationType="fade" onRequestClose={() => setHintVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.hintCard}>
            <View style={styles.hintIcon}>
              <Ionicons name="bulb-outline" size={30} color="#D58A1E" />
            </View>
            <Text style={styles.hintEyebrow}>QUICK CLUE</Text>
            <Text style={styles.hintTitle}>Think about the setting</Text>
            <Text style={styles.hintText}>{currentNode.hint || 'Think about who is speaking, where this is happening, and how formal the reply should be.'}</Text>
            <Pressable style={styles.primaryButton} onPress={() => setHintVisible(false)}>
              <Text style={styles.primaryButtonText}>Back to the counter</Text>
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
