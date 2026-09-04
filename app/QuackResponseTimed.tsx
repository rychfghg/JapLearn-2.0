import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { router } from 'expo-router';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
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
import { AuthContext } from '../context/AuthContext';
import { loadBundledSound, stopAndUnloadSound } from '../utils/nativeAudio';
import expoconfig from '../expoconfig';

// Local best-score key for Response Rush, mirroring the pattern the
// Quack-a-Mole high score already uses. This screen has no backend model
// yet (see the note above), so QuackResponse's unlock check and
// QuackProgress's score display both read this same key.
export const RESPONSE_RUSH_BEST_SCORE_KEY = 'response_rush_best_score';
const RESPONSE_RUSH_RESUME_KEY = 'response_rush_resume_v1';

// ---------------------------------------------------------------------------
// Response Rush — a six-scene, twenty-decision "first weeks in Japan"
// interactive novel: the ward office, a phone contract, a bank account, a
// convenience-store errand, the train, and a part-time job interview.
//
// How this plays, by design:
//  - NARRATION (English scene-setting) is reader-paced — tap to continue.
//  - DIALOGUE / REACTION (a sprite actually speaking) is NOT reader-paced.
//    The moment one of these becomes current, its voice clip starts playing
//    automatically, the speaking character's mouth/blink animation runs for
//    exactly as long as the clip plays, and the story advances itself the
//    instant the line finishes — no tap, no manual audio button. That's the
//    literal ask: "as long as it turns to that sprite, the audio will
//    speak, the sprite will open the mouth and blink and speaks," and the
//    player never manually continues or manually replays it.
//  - The one exception is the feedback pop-up after a REACTION: that is
//    substantive reading content (why a response works or doesn't, plus a
//    better example), not story pacing, so it still waits for you to tap
//    "Continue the story" — auto-dismissing an explanation would work
//    against the whole point of a learning game.
//  - CHOICE nodes are, obviously, still the player's move.
//
// This is still hard-coded on purpose (dialogue, branching, feedback text,
// audio and music mapping all live in this file). A later request will
// move this content into MongoDB and feed it through the admin site,
// mirroring Reply Coach (QuackResponseGuided). SCENES below is written as
// plain content data specifically so that move is a data export, not a
// rewrite.
//
// AUDIO — read this before touching the clip lookups below.
// Every voiced line in this screen (125 total: scene openings, the spoken
// setup for each decision, every answer reaction, and every timeout) has
// its own Japanese neural-voice clip. Sumi consistently uses Nanami and
// Haru consistently uses Keita. Files are bundled under
// assets/audio/response-rush/<node id>.mp3 and map 1:1 to the Japanese text
// shown on screen. Missing mappings never fall back to unrelated dialogue.
//
// MUSIC. Response Rush owns one bundled background track and guards its
// asynchronous creation so route/state transitions cannot start duplicate
// loops. Real correct/incorrect stingers (assets/audio/sfx/correct_sfx.mp3 /
// incorrect_sfx.mp3, already bundled and used by the Politeness game) fire
// the instant a REACTION lands, layered under a full-screen tint and a
// check/× badge, and the scene bed ducks under dialogue audio instead of
// just switching between two flat "calm/tense" loops.
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
  englishMeaning?: string;
};

type DecisionSpec = {
  id: string;
  prompt: string;
  hint: string;
  playerCharacter: CharacterKey;
  playerExpression: string;
  companionExpression?: string;
  // The other party actually speaks this line first — voiced, mouth-synced —
  // and the CHOICE screen only opens once it finishes. This is what makes
  // every decision a real back-and-forth instead of a silent question.
  setup?: Line;
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
  culturalNotes: string[];
};

// ---------------------------------------------------------------------------
// Runtime story graph (built from SCENES at the bottom of this file)
// ---------------------------------------------------------------------------

type StoryNode = {
  id: string;
  sceneId: string;
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
  englishMeaning?: string;
};

type SavedRushState = {
  nodeId: string;
  currentNodeId?: string;
  answers: AnswerRecord[];
  timeLeft: number;
  savedAt: string;
  bestPercentage?: number;
};

const CHOICE_SECONDS = 20;
const GOOD_TIERS: Evaluation[] = ['BEST', 'ACCEPTABLE'];

const choiceEnglishMeaning: Record<string, string> = {
  n_ward_greeting_reply_a: 'Nice to meet you. I look forward to working with you.',
  n_ward_greeting_reply_b: 'Hello. Please help me.',
  n_ward_greeting_reply_c: 'Oh, thanks / hello.',
  n_ward_greeting_reply_d: 'Give me the card. Hurry.',
  n_ward_purpose_reply_a: 'I came to register my residence card.',
  n_ward_purpose_reply_b: 'I would like to register my address.',
  n_ward_purpose_reply_c: 'It is about the card…',
  n_ward_purpose_reply_d: 'I want to get the card quickly.',
  n_ward_understanding_reply_a: 'Excuse me, could you say that again?',
  n_ward_understanding_reply_b: 'Excuse me, I do not understand.',
  n_ward_understanding_reply_c: 'Oh, yes, yes.',
  n_ward_understanding_reply_d: 'Could you speak in English?',
  n_phone_plan_reply_a: 'I would like to apply for a prepaid SIM plan.',
  n_phone_plan_reply_b: 'I would like to sign a mobile-phone contract.',
  n_phone_plan_reply_c: 'Um, something for a phone… a SIM, maybe…',
  n_phone_plan_reply_d: 'Give me the cheapest one.',
  n_phone_id_reply_a: 'Yes, here they are. Please.',
  n_phone_id_reply_b: 'Yes, I have them.',
  n_phone_id_reply_c: '(Silently hands over the card.)',
  n_phone_id_reply_d: 'Why do you need the card?',
  n_phone_fee_reply_a: 'Excuse me, could you tell me the price?',
  n_phone_fee_reply_b: 'Please say that again.',
  n_phone_fee_reply_c: 'Yes, that is fine. (Still not fully understanding.)',
  n_phone_fee_reply_d: 'Any price is fine—just finish quickly.',
  n_bank_purpose_reply_a: 'I would like to open an account.',
  n_bank_purpose_reply_b: 'I would like to ask about an account.',
  n_bank_purpose_reply_c: 'An account… please.',
  n_bank_purpose_reply_d: 'Make me an account, right now.',
  n_bank_documents_reply_a: 'I do not have a My Number Card. Will that be all right?',
  n_bank_documents_reply_b: 'I may be missing one item.',
  n_bank_documents_reply_c: 'Um, it is probably fine.',
  n_bank_documents_reply_d: 'Is that absolutely necessary?',
  n_bank_callback_reply_a: 'Yes, this address is correct.',
  n_bank_callback_reply_b: 'I think it is probably correct.',
  n_bank_callback_reply_c: '(Without checking carefully.) Yes, yes.',
  n_bank_callback_reply_d: 'You do not need to check that. Move on.',
  n_conbini_bag_reply_a: 'No bag, thank you. I brought one.',
  n_conbini_bag_reply_b: 'I do not need one.',
  n_conbini_bag_reply_c: '(Silently shakes head.)',
  n_conbini_bag_reply_d: 'Do not need it.',
  n_conbini_payment_reply_a: 'Can I use an IC card?',
  n_conbini_payment_reply_b: 'Is paying by card okay?',
  n_conbini_payment_reply_c: 'Is this okay? (Only shows the card.)',
  n_conbini_payment_reply_d: 'It normally works, right?',
  n_conbini_receipt_reply_a: 'Yes, please.',
  n_conbini_receipt_reply_b: 'Please give it to me.',
  n_conbini_receipt_reply_c: 'Oh, um… I guess I need it.',
  n_conbini_receipt_reply_d: 'I do not care about that.',
  n_conbini_directions_reply_a: 'Excuse me, which way is the station?',
  n_conbini_directions_reply_b: 'Where is the station?',
  n_conbini_directions_reply_c: 'Um… the station?',
  n_conbini_directions_reply_d: 'Station—where?',
  n_train_pass_reply_a: 'A commuter pass to Shibuya, please.',
  n_train_pass_reply_b: 'A ticket to Shibuya, please.',
  n_train_pass_reply_c: 'Um… I want to buy this. (Points at the screen.)',
  n_train_pass_reply_d: 'Make the commuter pass quickly.',
  n_train_studentId_reply_a: 'Excuse me, I did not bring it today. The regular fare is fine.',
  n_train_studentId_reply_b: 'I do not have it.',
  n_train_studentId_reply_c: 'Um… maybe I do not have it.',
  n_train_studentId_reply_d: 'Is that absolutely necessary?',
  n_train_wrongPlatform_reply_a: 'Excuse me, I took the train in the wrong direction. How can I get back to Shibuya?',
  n_train_wrongPlatform_reply_b: 'I went the wrong way.',
  n_train_wrongPlatform_reply_c: 'Um… I think I am lost.',
  n_train_wrongPlatform_reply_d: 'Isn’t this train strange?',
  n_interview_introduce_reply_a: 'Nice to meet you. My name is ___. I sincerely look forward to working with you.',
  n_interview_introduce_reply_b: 'Nice to meet you. I am ___. I look forward to working with you.',
  n_interview_introduce_reply_c: 'I am ___.',
  n_interview_introduce_reply_d: '___. Nice to meet you.',
  n_interview_availability_reply_a: 'I can work weekday evenings and all day on weekends.',
  n_interview_availability_reply_b: 'I can work on weekends.',
  n_interview_availability_reply_c: 'Um, anytime is fine—probably.',
  n_interview_availability_reply_d: 'I do not know yet. I will contact you later.',
  n_interview_whyHere_reply_a: 'I like this café’s atmosphere, and I want to improve my Japanese through customer service.',
  n_interview_whyHere_reply_b: 'Because I need money.',
  n_interview_whyHere_reply_c: 'Hmm, no particular reason.',
  n_interview_whyHere_reply_d: 'Because there was nowhere else to apply.',
  n_interview_clarify_reply_a: 'Excuse me, could you explain what “every other week” means?',
  n_interview_clarify_reply_b: 'Please say that again.',
  n_interview_clarify_reply_c: 'Oh, yes, it is fine. (Still not understanding.)',
  n_interview_clarify_reply_d: 'Japanese is far too difficult.',
};

const backgrounds: Record<string, any> = {
  cityGate: require('../assets/img/background/city a s1st2 day.png'),
  cityEvening: require('../assets/img/background/city a s1st2 nightlights.png'),
  shopFront: require('../assets/img/background/city a s3st2 day.png'),
  counterRoom: require('../assets/img/background/school a hallway st2 day.png'),
  train: require('../assets/img/background/train_scene day.png'),
  interviewRoom: require('../assets/img/background/clubroom a st2 day.png'),
  wardOffice: require('../assets/img/background/student council room a st2 evening.png'),
  phoneStore: require('../assets/img/background/school a hallway st2 day.png'),
  bankOffice: require('../assets/img/background/clubroom a st2 day.png'),
  storeInterior: require('../assets/img/background/kitchen dining evening2.png'),
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

// One bundled music bed, owned by this screen. Keeping a single track avoids
// two loops racing during rapid dialogue/choice transitions.
const responseRushBgm = require('../assets/audio/sfx/quiz.mp3');
const stingers: Record<'good' | 'bad', any> = {
  good: require('../assets/audio/sfx/correct_sfx.mp3'),
  bad: require('../assets/audio/sfx/incorrect_sfx.mp3'),
};
const flashIcons: Record<'good' | 'bad', any> = {
  good: require('../assets/check.png'),
  bad: require('../assets/wrong.png'),
};

// Exact-line voiced audio, one clip per spoken node, generated to match
// this screen's actual Japanese text word-for-word (not a reused,
// unrelated pool) — see the AUDIO note above for how these were made.
const audioOverrides: Record<string, any> = {
  n_ward_opening: require('../assets/audio/response-rush/n_ward_opening.mp3'),
  n_ward_greeting_setup: require('../assets/audio/response-rush/n_ward_greeting_setup.mp3'),
  n_ward_greeting_react_a: require('../assets/audio/response-rush/n_ward_greeting_react_a.mp3'),
  n_ward_greeting_react_b: require('../assets/audio/response-rush/n_ward_greeting_react_b.mp3'),
  n_ward_greeting_react_c: require('../assets/audio/response-rush/n_ward_greeting_react_c.mp3'),
  n_ward_greeting_react_d: require('../assets/audio/response-rush/n_ward_greeting_react_d.mp3'),
  n_ward_greeting_react_timeout: require('../assets/audio/response-rush/n_ward_greeting_react_timeout.mp3'),
  n_ward_purpose_setup: require('../assets/audio/response-rush/n_ward_purpose_setup.mp3'),
  n_ward_purpose_react_a: require('../assets/audio/response-rush/n_ward_purpose_react_a.mp3'),
  n_ward_purpose_react_b: require('../assets/audio/response-rush/n_ward_purpose_react_b.mp3'),
  n_ward_purpose_react_c: require('../assets/audio/response-rush/n_ward_purpose_react_c.mp3'),
  n_ward_purpose_react_d: require('../assets/audio/response-rush/n_ward_purpose_react_d.mp3'),
  n_ward_purpose_react_timeout: require('../assets/audio/response-rush/n_ward_purpose_react_timeout.mp3'),
  n_ward_understanding_setup: require('../assets/audio/response-rush/n_ward_understanding_setup.mp3'),
  n_ward_understanding_react_a: require('../assets/audio/response-rush/n_ward_understanding_react_a.mp3'),
  n_ward_understanding_react_b: require('../assets/audio/response-rush/n_ward_understanding_react_b.mp3'),
  n_ward_understanding_react_c: require('../assets/audio/response-rush/n_ward_understanding_react_c.mp3'),
  n_ward_understanding_react_d: require('../assets/audio/response-rush/n_ward_understanding_react_d.mp3'),
  n_ward_understanding_react_timeout: require('../assets/audio/response-rush/n_ward_understanding_react_timeout.mp3'),
  n_phone_opening: require('../assets/audio/response-rush/n_phone_opening.mp3'),
  n_phone_plan_setup: require('../assets/audio/response-rush/n_phone_plan_setup.mp3'),
  n_phone_plan_react_a: require('../assets/audio/response-rush/n_phone_plan_react_a.mp3'),
  n_phone_plan_react_b: require('../assets/audio/response-rush/n_phone_plan_react_b.mp3'),
  n_phone_plan_react_c: require('../assets/audio/response-rush/n_phone_plan_react_c.mp3'),
  n_phone_plan_react_d: require('../assets/audio/response-rush/n_phone_plan_react_d.mp3'),
  n_phone_plan_react_timeout: require('../assets/audio/response-rush/n_phone_plan_react_timeout.mp3'),
  n_phone_id_setup: require('../assets/audio/response-rush/n_phone_id_setup.mp3'),
  n_phone_id_react_a: require('../assets/audio/response-rush/n_phone_id_react_a.mp3'),
  n_phone_id_react_b: require('../assets/audio/response-rush/n_phone_id_react_b.mp3'),
  n_phone_id_react_c: require('../assets/audio/response-rush/n_phone_id_react_c.mp3'),
  n_phone_id_react_d: require('../assets/audio/response-rush/n_phone_id_react_d.mp3'),
  n_phone_id_react_timeout: require('../assets/audio/response-rush/n_phone_id_react_timeout.mp3'),
  n_phone_fee_setup: require('../assets/audio/response-rush/n_phone_fee_setup.mp3'),
  n_phone_fee_react_a: require('../assets/audio/response-rush/n_phone_fee_react_a.mp3'),
  n_phone_fee_react_b: require('../assets/audio/response-rush/n_phone_fee_react_b.mp3'),
  n_phone_fee_react_c: require('../assets/audio/response-rush/n_phone_fee_react_c.mp3'),
  n_phone_fee_react_d: require('../assets/audio/response-rush/n_phone_fee_react_d.mp3'),
  n_phone_fee_react_timeout: require('../assets/audio/response-rush/n_phone_fee_react_timeout.mp3'),
  n_bank_opening: require('../assets/audio/response-rush/n_bank_opening.mp3'),
  n_bank_purpose_setup: require('../assets/audio/response-rush/n_bank_purpose_setup.mp3'),
  n_bank_purpose_react_a: require('../assets/audio/response-rush/n_bank_purpose_react_a.mp3'),
  n_bank_purpose_react_b: require('../assets/audio/response-rush/n_bank_purpose_react_b.mp3'),
  n_bank_purpose_react_c: require('../assets/audio/response-rush/n_bank_purpose_react_c.mp3'),
  n_bank_purpose_react_d: require('../assets/audio/response-rush/n_bank_purpose_react_d.mp3'),
  n_bank_purpose_react_timeout: require('../assets/audio/response-rush/n_bank_purpose_react_timeout.mp3'),
  n_bank_documents_setup: require('../assets/audio/response-rush/n_bank_documents_setup.mp3'),
  n_bank_documents_react_a: require('../assets/audio/response-rush/n_bank_documents_react_a.mp3'),
  n_bank_documents_react_b: require('../assets/audio/response-rush/n_bank_documents_react_b.mp3'),
  n_bank_documents_react_c: require('../assets/audio/response-rush/n_bank_documents_react_c.mp3'),
  n_bank_documents_react_d: require('../assets/audio/response-rush/n_bank_documents_react_d.mp3'),
  n_bank_documents_react_timeout: require('../assets/audio/response-rush/n_bank_documents_react_timeout.mp3'),
  n_bank_callback_setup: require('../assets/audio/response-rush/n_bank_callback_setup.mp3'),
  n_bank_callback_react_a: require('../assets/audio/response-rush/n_bank_callback_react_a.mp3'),
  n_bank_callback_react_b: require('../assets/audio/response-rush/n_bank_callback_react_b.mp3'),
  n_bank_callback_react_c: require('../assets/audio/response-rush/n_bank_callback_react_c.mp3'),
  n_bank_callback_react_d: require('../assets/audio/response-rush/n_bank_callback_react_d.mp3'),
  n_bank_callback_react_timeout: require('../assets/audio/response-rush/n_bank_callback_react_timeout.mp3'),
  n_conbini_opening: require('../assets/audio/response-rush/n_conbini_opening.mp3'),
  n_conbini_bag_setup: require('../assets/audio/response-rush/n_conbini_bag_setup.mp3'),
  n_conbini_bag_react_a: require('../assets/audio/response-rush/n_conbini_bag_react_a.mp3'),
  n_conbini_bag_react_b: require('../assets/audio/response-rush/n_conbini_bag_react_b.mp3'),
  n_conbini_bag_react_c: require('../assets/audio/response-rush/n_conbini_bag_react_c.mp3'),
  n_conbini_bag_react_d: require('../assets/audio/response-rush/n_conbini_bag_react_d.mp3'),
  n_conbini_bag_react_timeout: require('../assets/audio/response-rush/n_conbini_bag_react_timeout.mp3'),
  n_conbini_payment_setup: require('../assets/audio/response-rush/n_conbini_payment_setup.mp3'),
  n_conbini_payment_react_a: require('../assets/audio/response-rush/n_conbini_payment_react_a.mp3'),
  n_conbini_payment_react_b: require('../assets/audio/response-rush/n_conbini_payment_react_b.mp3'),
  n_conbini_payment_react_c: require('../assets/audio/response-rush/n_conbini_payment_react_c.mp3'),
  n_conbini_payment_react_d: require('../assets/audio/response-rush/n_conbini_payment_react_d.mp3'),
  n_conbini_payment_react_timeout: require('../assets/audio/response-rush/n_conbini_payment_react_timeout.mp3'),
  n_conbini_receipt_setup: require('../assets/audio/response-rush/n_conbini_receipt_setup.mp3'),
  n_conbini_receipt_react_a: require('../assets/audio/response-rush/n_conbini_receipt_react_a.mp3'),
  n_conbini_receipt_react_b: require('../assets/audio/response-rush/n_conbini_receipt_react_b.mp3'),
  n_conbini_receipt_react_c: require('../assets/audio/response-rush/n_conbini_receipt_react_c.mp3'),
  n_conbini_receipt_react_d: require('../assets/audio/response-rush/n_conbini_receipt_react_d.mp3'),
  n_conbini_receipt_react_timeout: require('../assets/audio/response-rush/n_conbini_receipt_react_timeout.mp3'),
  n_conbini_directions_setup: require('../assets/audio/response-rush/n_conbini_directions_setup.mp3'),
  n_conbini_directions_react_a: require('../assets/audio/response-rush/n_conbini_directions_react_a.mp3'),
  n_conbini_directions_react_b: require('../assets/audio/response-rush/n_conbini_directions_react_b.mp3'),
  n_conbini_directions_react_c: require('../assets/audio/response-rush/n_conbini_directions_react_c.mp3'),
  n_conbini_directions_react_d: require('../assets/audio/response-rush/n_conbini_directions_react_d.mp3'),
  n_conbini_directions_react_timeout: require('../assets/audio/response-rush/n_conbini_directions_react_timeout.mp3'),
  n_train_opening: require('../assets/audio/response-rush/n_train_opening.mp3'),
  n_train_pass_setup: require('../assets/audio/response-rush/n_train_pass_setup.mp3'),
  n_train_pass_react_a: require('../assets/audio/response-rush/n_train_pass_react_a.mp3'),
  n_train_pass_react_b: require('../assets/audio/response-rush/n_train_pass_react_b.mp3'),
  n_train_pass_react_c: require('../assets/audio/response-rush/n_train_pass_react_c.mp3'),
  n_train_pass_react_d: require('../assets/audio/response-rush/n_train_pass_react_d.mp3'),
  n_train_pass_react_timeout: require('../assets/audio/response-rush/n_train_pass_react_timeout.mp3'),
  n_train_studentId_setup: require('../assets/audio/response-rush/n_train_studentId_setup.mp3'),
  n_train_studentId_react_a: require('../assets/audio/response-rush/n_train_studentId_react_a.mp3'),
  n_train_studentId_react_b: require('../assets/audio/response-rush/n_train_studentId_react_b.mp3'),
  n_train_studentId_react_c: require('../assets/audio/response-rush/n_train_studentId_react_c.mp3'),
  n_train_studentId_react_d: require('../assets/audio/response-rush/n_train_studentId_react_d.mp3'),
  n_train_studentId_react_timeout: require('../assets/audio/response-rush/n_train_studentId_react_timeout.mp3'),
  n_train_wrongPlatform_setup: require('../assets/audio/response-rush/n_train_wrongPlatform_setup.mp3'),
  n_train_wrongPlatform_react_a: require('../assets/audio/response-rush/n_train_wrongPlatform_react_a.mp3'),
  n_train_wrongPlatform_react_b: require('../assets/audio/response-rush/n_train_wrongPlatform_react_b.mp3'),
  n_train_wrongPlatform_react_c: require('../assets/audio/response-rush/n_train_wrongPlatform_react_c.mp3'),
  n_train_wrongPlatform_react_d: require('../assets/audio/response-rush/n_train_wrongPlatform_react_d.mp3'),
  n_train_wrongPlatform_react_timeout: require('../assets/audio/response-rush/n_train_wrongPlatform_react_timeout.mp3'),
  n_interview_opening: require('../assets/audio/response-rush/n_interview_opening.mp3'),
  n_interview_introduce_setup: require('../assets/audio/response-rush/n_interview_introduce_setup.mp3'),
  n_interview_introduce_react_a: require('../assets/audio/response-rush/n_interview_introduce_react_a.mp3'),
  n_interview_introduce_react_b: require('../assets/audio/response-rush/n_interview_introduce_react_b.mp3'),
  n_interview_introduce_react_c: require('../assets/audio/response-rush/n_interview_introduce_react_c.mp3'),
  n_interview_introduce_react_d: require('../assets/audio/response-rush/n_interview_introduce_react_d.mp3'),
  n_interview_introduce_react_timeout: require('../assets/audio/response-rush/n_interview_introduce_react_timeout.mp3'),
  n_interview_availability_setup: require('../assets/audio/response-rush/n_interview_availability_setup.mp3'),
  n_interview_availability_react_a: require('../assets/audio/response-rush/n_interview_availability_react_a.mp3'),
  n_interview_availability_react_b: require('../assets/audio/response-rush/n_interview_availability_react_b.mp3'),
  n_interview_availability_react_c: require('../assets/audio/response-rush/n_interview_availability_react_c.mp3'),
  n_interview_availability_react_d: require('../assets/audio/response-rush/n_interview_availability_react_d.mp3'),
  n_interview_availability_react_timeout: require('../assets/audio/response-rush/n_interview_availability_react_timeout.mp3'),
  n_interview_whyHere_setup: require('../assets/audio/response-rush/n_interview_whyHere_setup.mp3'),
  n_interview_whyHere_react_a: require('../assets/audio/response-rush/n_interview_whyHere_react_a.mp3'),
  n_interview_whyHere_react_b: require('../assets/audio/response-rush/n_interview_whyHere_react_b.mp3'),
  n_interview_whyHere_react_c: require('../assets/audio/response-rush/n_interview_whyHere_react_c.mp3'),
  n_interview_whyHere_react_d: require('../assets/audio/response-rush/n_interview_whyHere_react_d.mp3'),
  n_interview_whyHere_react_timeout: require('../assets/audio/response-rush/n_interview_whyHere_react_timeout.mp3'),
  n_interview_clarify_setup: require('../assets/audio/response-rush/n_interview_clarify_setup.mp3'),
  n_interview_clarify_react_a: require('../assets/audio/response-rush/n_interview_clarify_react_a.mp3'),
  n_interview_clarify_react_b: require('../assets/audio/response-rush/n_interview_clarify_react_b.mp3'),
  n_interview_clarify_react_c: require('../assets/audio/response-rush/n_interview_clarify_react_c.mp3'),
  n_interview_clarify_react_d: require('../assets/audio/response-rush/n_interview_clarify_react_d.mp3'),
  n_interview_clarify_react_timeout: require('../assets/audio/response-rush/n_interview_clarify_react_timeout.mp3'),
  n_ward_greeting_reply_a: require('../assets/audio/response-rush/n_ward_greeting_reply_a.mp3'),
  n_ward_greeting_reply_b: require('../assets/audio/response-rush/n_ward_greeting_reply_b.mp3'),
  n_ward_greeting_reply_c: require('../assets/audio/response-rush/n_ward_greeting_reply_c.mp3'),
  n_ward_greeting_reply_d: require('../assets/audio/response-rush/n_ward_greeting_reply_d.mp3'),
  n_ward_purpose_reply_a: require('../assets/audio/response-rush/n_ward_purpose_reply_a.mp3'),
  n_ward_purpose_reply_b: require('../assets/audio/response-rush/n_ward_purpose_reply_b.mp3'),
  n_ward_purpose_reply_c: require('../assets/audio/response-rush/n_ward_purpose_reply_c.mp3'),
  n_ward_purpose_reply_d: require('../assets/audio/response-rush/n_ward_purpose_reply_d.mp3'),
  n_ward_understanding_reply_a: require('../assets/audio/response-rush/n_ward_understanding_reply_a.mp3'),
  n_ward_understanding_reply_b: require('../assets/audio/response-rush/n_ward_understanding_reply_b.mp3'),
  n_ward_understanding_reply_c: require('../assets/audio/response-rush/n_ward_understanding_reply_c.mp3'),
  n_ward_understanding_reply_d: require('../assets/audio/response-rush/n_ward_understanding_reply_d.mp3'),
  n_phone_plan_reply_a: require('../assets/audio/response-rush/n_phone_plan_reply_a.mp3'),
  n_phone_plan_reply_b: require('../assets/audio/response-rush/n_phone_plan_reply_b.mp3'),
  n_phone_plan_reply_c: require('../assets/audio/response-rush/n_phone_plan_reply_c.mp3'),
  n_phone_plan_reply_d: require('../assets/audio/response-rush/n_phone_plan_reply_d.mp3'),
  n_phone_id_reply_a: require('../assets/audio/response-rush/n_phone_id_reply_a.mp3'),
  n_phone_id_reply_b: require('../assets/audio/response-rush/n_phone_id_reply_b.mp3'),
  n_phone_id_reply_c: require('../assets/audio/response-rush/n_phone_id_reply_c.mp3'),
  n_phone_id_reply_d: require('../assets/audio/response-rush/n_phone_id_reply_d.mp3'),
  n_phone_fee_reply_a: require('../assets/audio/response-rush/n_phone_fee_reply_a.mp3'),
  n_phone_fee_reply_b: require('../assets/audio/response-rush/n_phone_fee_reply_b.mp3'),
  n_phone_fee_reply_c: require('../assets/audio/response-rush/n_phone_fee_reply_c.mp3'),
  n_phone_fee_reply_d: require('../assets/audio/response-rush/n_phone_fee_reply_d.mp3'),
  n_bank_purpose_reply_a: require('../assets/audio/response-rush/n_bank_purpose_reply_a.mp3'),
  n_bank_purpose_reply_b: require('../assets/audio/response-rush/n_bank_purpose_reply_b.mp3'),
  n_bank_purpose_reply_c: require('../assets/audio/response-rush/n_bank_purpose_reply_c.mp3'),
  n_bank_purpose_reply_d: require('../assets/audio/response-rush/n_bank_purpose_reply_d.mp3'),
  n_bank_documents_reply_a: require('../assets/audio/response-rush/n_bank_documents_reply_a.mp3'),
  n_bank_documents_reply_b: require('../assets/audio/response-rush/n_bank_documents_reply_b.mp3'),
  n_bank_documents_reply_c: require('../assets/audio/response-rush/n_bank_documents_reply_c.mp3'),
  n_bank_documents_reply_d: require('../assets/audio/response-rush/n_bank_documents_reply_d.mp3'),
  n_bank_callback_reply_a: require('../assets/audio/response-rush/n_bank_callback_reply_a.mp3'),
  n_bank_callback_reply_b: require('../assets/audio/response-rush/n_bank_callback_reply_b.mp3'),
  n_bank_callback_reply_c: require('../assets/audio/response-rush/n_bank_callback_reply_c.mp3'),
  n_bank_callback_reply_d: require('../assets/audio/response-rush/n_bank_callback_reply_d.mp3'),
  n_conbini_bag_reply_a: require('../assets/audio/response-rush/n_conbini_bag_reply_a.mp3'),
  n_conbini_bag_reply_b: require('../assets/audio/response-rush/n_conbini_bag_reply_b.mp3'),
  n_conbini_bag_reply_c: require('../assets/audio/response-rush/n_conbini_bag_reply_c.mp3'),
  n_conbini_bag_reply_d: require('../assets/audio/response-rush/n_conbini_bag_reply_d.mp3'),
  n_conbini_payment_reply_a: require('../assets/audio/response-rush/n_conbini_payment_reply_a.mp3'),
  n_conbini_payment_reply_b: require('../assets/audio/response-rush/n_conbini_payment_reply_b.mp3'),
  n_conbini_payment_reply_c: require('../assets/audio/response-rush/n_conbini_payment_reply_c.mp3'),
  n_conbini_payment_reply_d: require('../assets/audio/response-rush/n_conbini_payment_reply_d.mp3'),
  n_conbini_receipt_reply_a: require('../assets/audio/response-rush/n_conbini_receipt_reply_a.mp3'),
  n_conbini_receipt_reply_b: require('../assets/audio/response-rush/n_conbini_receipt_reply_b.mp3'),
  n_conbini_receipt_reply_c: require('../assets/audio/response-rush/n_conbini_receipt_reply_c.mp3'),
  n_conbini_receipt_reply_d: require('../assets/audio/response-rush/n_conbini_receipt_reply_d.mp3'),
  n_conbini_directions_reply_a: require('../assets/audio/response-rush/n_conbini_directions_reply_a.mp3'),
  n_conbini_directions_reply_b: require('../assets/audio/response-rush/n_conbini_directions_reply_b.mp3'),
  n_conbini_directions_reply_c: require('../assets/audio/response-rush/n_conbini_directions_reply_c.mp3'),
  n_conbini_directions_reply_d: require('../assets/audio/response-rush/n_conbini_directions_reply_d.mp3'),
  n_train_pass_reply_a: require('../assets/audio/response-rush/n_train_pass_reply_a.mp3'),
  n_train_pass_reply_b: require('../assets/audio/response-rush/n_train_pass_reply_b.mp3'),
  n_train_pass_reply_c: require('../assets/audio/response-rush/n_train_pass_reply_c.mp3'),
  n_train_pass_reply_d: require('../assets/audio/response-rush/n_train_pass_reply_d.mp3'),
  n_train_studentId_reply_a: require('../assets/audio/response-rush/n_train_studentId_reply_a.mp3'),
  n_train_studentId_reply_b: require('../assets/audio/response-rush/n_train_studentId_reply_b.mp3'),
  n_train_studentId_reply_c: require('../assets/audio/response-rush/n_train_studentId_reply_c.mp3'),
  n_train_studentId_reply_d: require('../assets/audio/response-rush/n_train_studentId_reply_d.mp3'),
  n_train_wrongPlatform_reply_a: require('../assets/audio/response-rush/n_train_wrongPlatform_reply_a.mp3'),
  n_train_wrongPlatform_reply_b: require('../assets/audio/response-rush/n_train_wrongPlatform_reply_b.mp3'),
  n_train_wrongPlatform_reply_c: require('../assets/audio/response-rush/n_train_wrongPlatform_reply_c.mp3'),
  n_train_wrongPlatform_reply_d: require('../assets/audio/response-rush/n_train_wrongPlatform_reply_d.mp3'),
  n_interview_introduce_reply_a: require('../assets/audio/response-rush/n_interview_introduce_reply_a.mp3'),
  n_interview_introduce_reply_b: require('../assets/audio/response-rush/n_interview_introduce_reply_b.mp3'),
  n_interview_introduce_reply_c: require('../assets/audio/response-rush/n_interview_introduce_reply_c.mp3'),
  n_interview_introduce_reply_d: require('../assets/audio/response-rush/n_interview_introduce_reply_d.mp3'),
  n_interview_availability_reply_a: require('../assets/audio/response-rush/n_interview_availability_reply_a.mp3'),
  n_interview_availability_reply_b: require('../assets/audio/response-rush/n_interview_availability_reply_b.mp3'),
  n_interview_availability_reply_c: require('../assets/audio/response-rush/n_interview_availability_reply_c.mp3'),
  n_interview_availability_reply_d: require('../assets/audio/response-rush/n_interview_availability_reply_d.mp3'),
  n_interview_whyHere_reply_a: require('../assets/audio/response-rush/n_interview_whyHere_reply_a.mp3'),
  n_interview_whyHere_reply_b: require('../assets/audio/response-rush/n_interview_whyHere_reply_b.mp3'),
  n_interview_whyHere_reply_c: require('../assets/audio/response-rush/n_interview_whyHere_reply_c.mp3'),
  n_interview_whyHere_reply_d: require('../assets/audio/response-rush/n_interview_whyHere_reply_d.mp3'),
  n_interview_clarify_reply_a: require('../assets/audio/response-rush/n_interview_clarify_reply_a.mp3'),
  n_interview_clarify_reply_b: require('../assets/audio/response-rush/n_interview_clarify_reply_b.mp3'),
  n_interview_clarify_reply_c: require('../assets/audio/response-rush/n_interview_clarify_reply_c.mp3'),
  n_interview_clarify_reply_d: require('../assets/audio/response-rush/n_interview_clarify_reply_d.mp3'),

};

const evaluationTheme: Record<Evaluation, { label: string; color: string; icon: any }> = {
  BEST: { label: 'Best response', color: '#62B83C', icon: 'checkmark-circle' },
  ACCEPTABLE: { label: 'Acceptable', color: '#5086D8', icon: 'thumbs-up' },
  AWKWARD: { label: 'Awkward', color: '#D89525', icon: 'help-circle' },
  IMPOLITE: { label: 'Impolite', color: '#D4635D', icon: 'alert-circle' },
  RUDE: { label: 'Rude / offensive', color: '#B83B55', icon: 'close-circle' },
  TIMEOUT: { label: 'Time ran out', color: '#8A8A8A', icon: 'time' },
};
const characterAccent: Record<CharacterKey, string> = { SUMI: '#C6478B', HARU: '#2F6FA8' };

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
// errands, twenty decisions total (3+3+3+4+3+4), plus a short list of
// cultural notes per scene that surface at random, roughly half the time,
// once the scene's opening narration is read.
// ---------------------------------------------------------------------------

const SCENES: SceneSpec[] = [
  {
    id: 'ward',
    title: 'Ward Office · Day 6 in Japan',
    background: 'wardOffice',
    narration: 'You arrived in Japan six days ago to study and work part-time. New residents must register at the local ward office within 14 days to receive their Residence Card. Sumi, a classmate, offered to walk you there for your first visit.',
    opening: { character: 'SUMI', expression: 'SMILE', japanese: '大丈夫？初めての区役所だから、私がついていくね。', romaji: 'Daijoubu? Hajimete no kuyakusho dakara, watashi ga tsuiteiku ne.', speakerLabel: 'Sumi' },
    culturalNotes: [
      'The 14-day registration window is a real legal deadline in Japan — missing it can complicate visa renewals later, which is why Sumi treats this errand as urgent, not optional.',
      'Ward offices (kuyakusho) are organized by neighborhood, not by nationality — everyone living in that ward uses the same counters, so patience during busy hours is a shared, ordinary experience, not something unique to newcomers.',
    ],
    decisions: [
      {
        id: 'greeting',
        prompt: 'Your number is called. You step up to the counter — how do you greet the clerk?',
        hint: 'This is a first meeting in an official, formal setting — greet the way you would greet a stranger, not a classmate.',
        playerCharacter: 'HARU',
        playerExpression: 'NEUTRAL',
        setup: { character: 'HARU', expression: 'NEUTRAL', japanese: '次の方、どうぞ。', romaji: 'Tsugi no kata, douzo.', speakerLabel: 'Ward Clerk' },
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
        setup: { character: 'HARU', expression: 'NEUTRAL', japanese: '本日はどのようなご用件でしょうか？', romaji: 'Honjitsu wa dono you na goyouken deshou ka?', speakerLabel: 'Ward Clerk' },
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
        setup: { character: 'HARU', expression: 'NEUTRAL', japanese: 'パスポートと、在留資格認定証明書はお持ちですか？', romaji: 'Pasupooto to, zairyuu shikaku nintei shoumeisho wa omochi desu ka?', speakerLabel: 'Ward Clerk' },
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
    background: 'phoneStore',
    narration: 'Receipt in hand, you and Sumi head to a phone shop to set up a SIM plan — you\'ll need a Japanese number for the part-time job you\'re about to apply for.',
    opening: { character: 'SUMI', expression: 'ENCOURAGING', japanese: 'ここ、学生プランが安いよ。がんばって！', romaji: 'Koko, gakusei puran ga yasui yo. Ganbatte!', speakerLabel: 'Sumi' },
    culturalNotes: [
      'Prepaid SIM plans are popular with new residents specifically because most postpaid contracts require a Japanese bank account and a longer residency history — the "student plan" Sumi mentions is a common workaround.',
      'Staff in Japanese retail settings almost always confirm details back to you before proceeding ("kashikomarimashita" + a repeat-back) — it can feel slow at first, but it is standard practice to avoid mistakes, not a sign something is wrong.',
    ],
    decisions: [
      {
        id: 'plan',
        prompt: 'A staff member greets you at the counter. What do you say you need?',
        hint: 'Be specific about the product — a prepaid SIM plan — rather than a vague "phone thing."',
        playerCharacter: 'HARU',
        playerExpression: 'NEUTRAL',
        setup: { character: 'HARU', expression: 'NEUTRAL', japanese: 'いらっしゃいませ。本日はどのようなご用件でしょうか？', romaji: "Irasshaimase. Honjitsu wa dono you na goyouken deshou ka?", speakerLabel: 'Shop Staff' },
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
        setup: { character: 'HARU', expression: 'NEUTRAL', japanese: '在留カードと学生証を見せていただけますか？', romaji: 'Zairyuu kaado to gakuseishou wo misete itadakemasu ka?', speakerLabel: 'Shop Staff' },
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
        setup: { character: 'HARU', expression: 'NEUTRAL', japanese: '途中で解約された場合、少額の解約金がかかりますが、よろしいでしょうか？', romaji: 'Tochuu de kaiyaku sareta baai, shougaku no kaiyakukin ga kakarimasu ga, yoroshii deshou ka?', speakerLabel: 'Shop Staff' },
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
    background: 'bankOffice',
    narration: 'With a phone number secured, next is a bank account — most part-time jobs pay wages by direct deposit, so this step can\'t wait.',
    opening: { character: 'SUMI', expression: 'NEUTRAL', japanese: '銀行の窓口、ちょっと緊張するよね。落ち着いていこう。', romaji: 'Ginkou no madoguchi, chotto kinchou suru yo ne. Ochitsuite ikou.', speakerLabel: 'Sumi' },
    culturalNotes: [
      'A personal seal (hanko) still shows up on some Japanese paperwork, but most banks now accept a signature from foreign residents — it\'s worth asking rather than assuming you need to buy one immediately.',
      'The My Number card (mainanbaa kaado) is Japan\'s national ID number system — new residents get a number automatically, but the physical card itself has to be applied for separately, which is why it\'s common not to have it yet.',
    ],
    decisions: [
      {
        id: 'purpose',
        prompt: 'A bank clerk calls you over. How do you state why you\'re here?',
        hint: '"Kouza wo hirakitai" (I\'d like to open an account) is the standard, direct phrase for this errand.',
        playerCharacter: 'HARU',
        playerExpression: 'NEUTRAL',
        setup: { character: 'HARU', expression: 'NEUTRAL', japanese: '次にお待ちのお客様、どうぞ。', romaji: 'Tsugi ni omachi no okyakusama, douzo.', speakerLabel: 'Bank Clerk' },
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
        setup: { character: 'HARU', expression: 'NEUTRAL', japanese: '在留カード、マイナンバーカード、それとご印鑑かご署名、三点ともお持ちでしょうか？', romaji: 'Zairyuu kaado, Mai Nanbaa Kaado, sore to goinkan ka gosho mei, santen tomo omochi deshou ka?', speakerLabel: 'Bank Clerk' },
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
        setup: { character: 'HARU', expression: 'NEUTRAL', japanese: 'キャッシュカードは一週間ほどで郵送します。こちらのご住所でお間違いないですか？', romaji: 'Kyasshu kaado wa isshuukan hodo de yuusou shimasu. Kochira no gojuusho de omachigai nai desu ka?', speakerLabel: 'Bank Clerk' },
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
    background: 'storeInterior',
    narration: 'Evening now — a quick stop at the convenience store on the way home for dinner and a few things for tomorrow\'s job interview.',
    opening: { character: 'SUMI', expression: 'SMILE', japanese: 'コンビニに着いたね。買い物の会話も練習してみよう。', romaji: 'Konbini ni tsuita ne. Kaimono no kaiwa mo renshuu shite miyou.', speakerLabel: 'Sumi' },
    culturalNotes: [
      'Declining a bag ("daijoubu desu") has become increasingly common since Japan introduced a mandatory plastic bag charge in 2020 — it\'s not seen as unusual or overly frugal, just routine.',
      'IC cards (Suica, Pasmo, and similar) work at the vast majority of convenience stores nationwide, but a few small or rural locations still don\'t accept them, which is why confirming first is a genuinely useful habit, not overcaution.',
    ],
    decisions: [
      {
        id: 'bag',
        prompt: '"Would you like a bag?" the cashier asks. You brought your own.',
        hint: 'A short, polite refusal — "daijoubu desu" — is all you need here.',
        playerCharacter: 'HARU',
        playerExpression: 'NEUTRAL',
        setup: { character: 'HARU', expression: 'NEUTRAL', japanese: '袋、お付けしますか？', romaji: 'Fukuro, otsuke shimasu ka?', speakerLabel: 'Cashier' },
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
        setup: { character: 'HARU', expression: 'NEUTRAL', japanese: 'お会計、こちらでよろしいでしょうか？', romaji: 'Okaikei, kochira de yoroshii deshou ka?', speakerLabel: 'Cashier' },
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
        setup: { character: 'HARU', expression: 'NEUTRAL', japanese: 'レシートは、ご利用になりますか？', romaji: 'Reshiito wa, goriyou ni narimasu ka?', speakerLabel: 'Cashier' },
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
        setup: { character: 'HARU', expression: 'NEUTRAL', japanese: 'あ、はい、なんでしょう？', romaji: 'A, hai, nandeshou?', speakerLabel: 'Passerby' },
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
    culturalNotes: [
      '"Teiki" (commuter pass) discounts in Japan are usually tied to a fixed route between two stations, not unlimited travel anywhere — that\'s why the clerk needs your exact destination, not just "a pass."',
      'Boarding the wrong direction is common enough that most stations have a straightforward fix — cross to the opposite platform at the next stop — so it\'s treated as routine, not something to be embarrassed about asking staff for help with.',
    ],
    decisions: [
      {
        id: 'pass',
        prompt: 'At the ticket counter, how do you ask for a commuter pass to your job\'s station?',
        hint: '"Teikiken" is the word for commuter pass — name your destination station too.',
        playerCharacter: 'HARU',
        playerExpression: 'NEUTRAL',
        setup: { character: 'HARU', expression: 'NEUTRAL', japanese: '次のお客様、どうぞ。', romaji: 'Tsugi no okyakusama, douzo.', speakerLabel: 'Station Clerk' },
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
        setup: { character: 'HARU', expression: 'NEUTRAL', japanese: '学割にはご学生証が必要ですが、お持ちですか？', romaji: 'Gakuwari ni wa gogakuseishou ga hitsuyou desu ga, omochi desu ka?', speakerLabel: 'Station Clerk' },
        choices: [
          { id: 'a', japanese: 'すみません、今日は持ってきていません。通常料金で大丈夫です。', romaji: 'Sumimasen, kyou wa motte kite imasen. Tsuujou ryoukin de daijoubu desu.', evaluation: 'BEST', points: 3, feedbackTitle: 'States the situation and a solution', feedbackWhy: 'Explaining you don\'t have it today and offering to pay full price keeps things moving without confusion.', reaction: { character: 'HARU', expression: 'SMILE', japanese: 'かしこまりました。それでは通常料金でご案内します。', romaji: 'Kashikomarimashita. Sore dewa tsuujou ryoukin de goannai shimasu.' } },
          { id: 'b', japanese: '持っていません。', romaji: 'Motte imasen.', evaluation: 'ACCEPTABLE', points: 2, feedbackTitle: 'True, but leaves the next step open', feedbackWhy: 'This answers the question, but doesn\'t say what you\'d like to do instead — the clerk has to ask.', betterExample: { japanese: 'すみません、今日は持ってきていません。通常料金で大丈夫です。', romaji: 'Sumimasen, kyou wa motte kite imasen. Tsuujou ryoukin de daijoubu desu.', note: 'Offering the next step yourself saves a round of back-and-forth.' }, reaction: { character: 'HARU', expression: 'NEUTRAL', japanese: 'では、通常料金でよろしいでしょうか？', romaji: 'Dewa, tsuujou ryoukin de yoroshii deshou ka?' } },
          { id: 'c', japanese: 'えっと……ないかも。', romaji: 'Etto…… nai kamo.', evaluation: 'AWKWARD', points: 1, feedbackTitle: '"Maybe not" is hard to act on', feedbackWhy: '"Maybe I don\'t have it" leaves the clerk unsure whether to wait while you check your bag or move on.', betterExample: { japanese: 'すみません、今日は持ってきていません。', romaji: 'Sumimasen, kyou wa motte kite imasen.', note: 'A clear answer either way keeps the line moving.' }, reaction: { character: 'SUMI', expression: 'WORRIED', japanese: '学生証、持ってきた？', romaji: 'Gakuseishou, motte kita?' } },
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
        setup: { character: 'HARU', expression: 'NEUTRAL', japanese: '駅員です。どうされましたか？', romaji: 'Ekiin desu. Dou saremashita ka?', speakerLabel: 'Station Staff' },
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
    opening: { character: 'SUMI', expression: 'ENCOURAGING', japanese: 'いよいよ面接だね。落ち着いて、丁寧に答えれば大丈夫。', romaji: 'Iyoiyo mensetsu da ne. Ochitsuite, teinei ni kotaereba daijoubu.', speakerLabel: 'Sumi' },
    culturalNotes: [
      'The humble self-introduction pattern "〜と申します" isn\'t just formality for its own sake — using it signals to a Japanese interviewer that you understand workplace register, which matters more in hiring decisions than perfect grammar elsewhere.',
      'Biweekly or rotating shift schedules ("kakushuu") are common in Japanese part-time retail and food service jobs specifically to spread closing duties fairly across staff — asking about it upfront is standard, not overly cautious.',
    ],
    decisions: [
      {
        id: 'introduce',
        prompt: '"Please introduce yourself," the manager says.',
        hint: 'The humble self-introduction pattern is "〜と申します" — more formal than "desu" for this kind of setting.',
        playerCharacter: 'HARU',
        playerExpression: 'NEUTRAL',
        setup: { character: 'HARU', expression: 'NEUTRAL', japanese: 'では、自己紹介をお願いします。', romaji: 'Dewa, jikoshoukai wo onegaishimasu.', speakerLabel: 'Manager Haru' },
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
        setup: { character: 'HARU', expression: 'NEUTRAL', japanese: '何曜日の何時ごろ働けますか？', romaji: 'Nan youbi no nanji goro hatarakemasu ka?', speakerLabel: 'Manager Haru' },
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
        setup: { character: 'HARU', expression: 'NEUTRAL', japanese: '当店で働きたいと思った理由を教えてください。', romaji: 'Touten de hatarakitai to omotta riyuu wo oshiete kudasai.', speakerLabel: 'Manager Haru' },
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
        setup: { character: 'HARU', expression: 'NEUTRAL', japanese: 'クローズのシフトは、隔週で交代していただきます。', romaji: 'Kuroozu no shifuto wa, kakushuu de koutai shite itadakimasu.', speakerLabel: 'Manager Haru' },
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
  const decisionSetupId = (sceneId: string, decisionId: string) => `n_${sceneId}_${decisionId}_setup`;
  const decisionReactId = (sceneId: string, decisionId: string, choiceId: string) => `n_${sceneId}_${decisionId}_react_${choiceId}`;
  const decisionReplyId = (sceneId: string, decisionId: string, choiceId: string) => `n_${sceneId}_${decisionId}_reply_${choiceId}`;
  const decisionTimeoutId = (sceneId: string, decisionId: string) => `n_${sceneId}_${decisionId}_react_timeout`;
  const sceneNarrationId = (sceneId: string) => `n_${sceneId}_narration`;
  const sceneOpeningId = (sceneId: string) => `n_${sceneId}_opening`;
  // The node that actually starts a decision: its spoken setup line when it
  // has one, otherwise the choice screen directly.
  const decisionEntryId = (sceneId: string, decision: DecisionSpec) =>
    decision.setup ? decisionSetupId(sceneId, decision.id) : decisionChoiceId(sceneId, decision.id);

  scenes.forEach((scene, sceneIndex) => {
    const nextScene = scenes[sceneIndex + 1];
    const firstDecision = scene.decisions[0];
    const afterOpeningId = firstDecision ? decisionEntryId(scene.id, firstDecision) : 'n_ending';

    built.push({
      id: sceneNarrationId(scene.id),
      sceneId: scene.id,
      type: 'NARRATION',
      title: scene.title,
      text: scene.narration,
      backgroundKey: scene.background,
      nextNodeId: scene.opening ? sceneOpeningId(scene.id) : afterOpeningId,
    });

    if (scene.opening) {
      built.push({
        id: sceneOpeningId(scene.id),
        sceneId: scene.id,
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
        ? decisionEntryId(scene.id, nextDecision)
        : nextScene
          ? sceneNarrationId(nextScene.id)
          : 'n_ending';

      totalChoices += 1;

      if (decision.setup) {
        built.push({
          id: decisionSetupId(scene.id, decision.id),
          sceneId: scene.id,
          type: 'DIALOGUE',
          speaker: decision.setup.speakerLabel ?? (decision.setup.character === 'SUMI' ? 'Sumi' : 'Haru'),
          characterKey: decision.setup.character,
          expressionKey: decision.setup.expression,
          characterPosition: 'CENTER',
          backgroundKey: scene.background,
          spritesVisible: true,
          japanese: decision.setup.japanese,
          romaji: decision.setup.romaji,
          nextNodeId: decisionChoiceId(scene.id, decision.id),
        });
      }

      built.push({
        id: decisionChoiceId(scene.id, decision.id),
        sceneId: scene.id,
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
          englishMeaning: choiceEnglishMeaning[decisionReplyId(scene.id, decision.id, choice.id)],
          nextNodeId: decisionReplyId(scene.id, decision.id, choice.id),
        })),
      });

      decision.choices.forEach((choice) => {
        // The learner's selected line is spoken before the NPC reacts. We use
        // the opposite on-screen actor as the learner avatar so a line is
        // never spoken and answered by the same sprite/voice.
        const replyCharacter: CharacterKey = choice.reaction.character === 'HARU' ? 'SUMI' : 'HARU';
        built.push({
          id: decisionReplyId(scene.id, decision.id, choice.id),
          sceneId: scene.id,
          type: 'DIALOGUE',
          speaker: 'Your reply',
          characterKey: replyCharacter,
          expressionKey: GOOD_TIERS.includes(choice.evaluation) ? 'SMILE' : 'NEUTRAL',
          characterPosition: replyCharacter === 'SUMI' ? 'RIGHT' : 'LEFT',
          backgroundKey: scene.background,
          spritesVisible: true,
          japanese: choice.japanese,
          romaji: choice.romaji,
          nextNodeId: decisionReactId(scene.id, decision.id, choice.id),
        });

        built.push({
          id: decisionReactId(scene.id, decision.id, choice.id),
          sceneId: scene.id,
          type: 'REACTION',
          speaker: choice.reaction.character === 'SUMI' ? 'Sumi' : 'Haru',
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
        sceneId: scene.id,
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
    sceneId: scenes[scenes.length - 1]?.id ?? 'interview',
    type: 'ENDING',
    title: 'First Weeks, Handled',
    text: 'Residence card filed, phone active, bank account open, groceries in the fridge, commute figured out, and a part-time job waiting to hear back. Sumi grins as you both head home. "See? You\'re basically a local now," she says. Not bad for one very long day.',
    backgroundKey: 'interviewRoom',
  });

  return { nodes: built, startId: sceneNarrationId(scenes[0].id), totalChoices };
}

const { nodes, startId: START_NODE_ID, totalChoices: TOTAL_CHOICES } = buildStory(SCENES);
const nodeMap = new Map(nodes.map((node) => [node.id, node]));
const sceneMap = new Map(SCENES.map((scene) => [scene.id, scene]));
const CHAPTER_TITLE = 'Response Rush · Your First Weeks in Japan';

// Never substitute a line from another game. A missing clip becomes silence
// plus timed progression, making content errors obvious without speaking the
// wrong Japanese sentence.
const resolveAudio = (nodeId: string) => audioOverrides[nodeId];

type SpriteActorProps = {
  characterKey: CharacterKey;
  expressionKey?: string;
  positionStyle: any;
  speaking: boolean;
  reacting: boolean;
};

// Blink / mouth-flicker treatment, entirely from existing sprite assets: a
// resting character periodically crossfades to a blink-like frame, a
// speaking character crossfades to its "mouth open" frame in a tighter,
// faster loop timed to actual speech, and a reaction node gets a one-shot
// pop the instant its expression changes. Nothing here is a manual,
// hand-authored motion — it is all driven by the same expression sprites
// already bundled for Reply Coach.
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
        Animated.delay(speaking ? 220 : 2200),
        Animated.timing(expressionOpacity, { toValue: 1, duration: speaking ? 85 : 70, useNativeDriver: true }),
        Animated.delay(speaking ? 130 : 100),
        Animated.timing(expressionOpacity, { toValue: 0, duration: speaking ? 95 : 90, useNativeDriver: true }),
        Animated.delay(speaking ? 150 : 700),
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

// A small three-dot "speaking" indicator, shown in place of any manual
// continue/audio controls while a sprite's line is auto-playing.
function SpeakingIndicator({ color }: { color: string }) {
  const dots = [useRef(new Animated.Value(0.3)).current, useRef(new Animated.Value(0.3)).current, useRef(new Animated.Value(0.3)).current];
  useEffect(() => {
    const loops = dots.map((dot, index) => Animated.loop(
      Animated.sequence([
        Animated.delay(index * 140),
        Animated.timing(dot, { toValue: 1, duration: 260, useNativeDriver: true }),
        Animated.timing(dot, { toValue: 0.3, duration: 260, useNativeDriver: true }),
        Animated.delay((2 - index) * 140),
      ]),
    ));
    loops.forEach((loop) => loop.start());
    return () => loops.forEach((loop) => loop.stop());
  }, []);
  return (
    <View style={rushStyles.speakingRow}>
      {dots.map((dot, index) => (
        <Animated.View key={index} style={[rushStyles.speakingDot, { backgroundColor: color, opacity: dot }]} />
      ))}
      <Text style={[rushStyles.speakingLabel, { color }]}>speaking…</Text>
    </View>
  );
}

export default function QuackResponseTimed() {
  const { user } = useContext(AuthContext);
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
  const [isSpriteSpeaking, setIsSpriteSpeaking] = useState(false);
  const [flashTier, setFlashTier] = useState<'good' | 'bad' | null>(null);
  const [culturalVisible, setCulturalVisible] = useState(false);
  const [culturalText, setCulturalText] = useState('');
  const [resumeReady, setResumeReady] = useState(false);

  const fade = useRef(new Animated.Value(0)).current;
  const flashOpacity = useRef(new Animated.Value(0)).current;
  const badgeScale = useRef(new Animated.Value(0.4)).current;
  const backgroundMusic = useRef<Audio.Sound | null>(null);
  const backgroundMusicKey = useRef('');
  const musicGeneration = useRef(0);
  const voiceSound = useRef<Audio.Sound | null>(null);
  const stingerSound = useRef<Audio.Sound | null>(null);
  const pendingAfterCultural = useRef<string | null>(null);
  const shownCulturalScenes = useRef<Set<string>>(new Set());
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const voiceGeneration = useRef(0);
  const scoreSaved = useRef(false);
  const restoredChoiceTime = useRef<number | null>(null);
  const activeChoiceNode = useRef('');

  const resumeKey = user?.email
    ? `${RESPONSE_RUSH_RESUME_KEY}:${user.email.toLowerCase()}`
    : null;

  const currentNode = nodeMap.get(nodeId);
  const progress = Math.min(1, answers.length / Math.max(1, TOTAL_CHOICES));
  const totalPoints = answers.reduce((sum, answer) => sum + answer.points, 0);
  const maxPoints = TOTAL_CHOICES * 3;
  const lastAnswer = answers[answers.length - 1];
  const scorePercent = maxPoints ? Math.round((totalPoints / maxPoints) * 100) : 0;

  // The backend is authoritative so the same account resumes on another
  // device. The local copy is retained only as an offline cache.
  useEffect(() => {
    let active = true;
    const restore = async () => {
      if (!resumeKey) {
        if (active) setResumeReady(true);
        return;
      }
      try {
        const response = await fetch(
          `${expoconfig.API_URL}/api/response-rush/progress?email=${encodeURIComponent(user!.email)}`,
        );
        let saved: SavedRushState | null = response.ok && response.status !== 204
          ? await response.json()
          : null;
        if (!saved) {
          const raw = await AsyncStorage.getItem(resumeKey);
          saved = raw ? JSON.parse(raw) as SavedRushState : null;
        }
        if (!saved || !active) return;
        saved.nodeId = saved.nodeId || saved.currentNodeId || '';
        if (!nodeMap.has(saved.nodeId) || !Array.isArray(saved.answers)) {
          await AsyncStorage.removeItem(resumeKey);
          return;
        }
        const savedNode = nodeMap.get(saved.nodeId);
        if (savedNode?.type === 'ENDING') {
          await AsyncStorage.removeItem(resumeKey);
          return;
        }
        setNodeId(saved.nodeId);
        setAnswers(saved.answers);
        restoredChoiceTime.current = Math.max(1, Math.min(CHOICE_SECONDS, Number(saved.timeLeft) || CHOICE_SECONDS));
      } catch {
        await AsyncStorage.removeItem(resumeKey).catch(() => undefined);
      } finally {
        if (active) setResumeReady(true);
      }
    };
    void restore();
    return () => { active = false; };
  }, [resumeKey, user?.email]);

  useEffect(() => {
    if (!resumeReady || !resumeKey || currentNode?.type === 'ENDING') return;
    const snapshot: SavedRushState = {
      nodeId,
      answers,
      timeLeft,
      savedAt: new Date().toISOString(),
      bestPercentage: answers.length
        ? Math.round((totalPoints / (answers.length * 3)) * 100)
        : 0,
    };
    void AsyncStorage.setItem(resumeKey, JSON.stringify(snapshot));
    if (!user?.email) return;
    const sync = setTimeout(() => {
      void fetch(`${expoconfig.API_URL}/api/response-rush/progress?email=${encodeURIComponent(user.email)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...snapshot, currentNodeId: snapshot.nodeId, completed: false }),
      }).catch(() => undefined);
    }, 650);
    return () => clearTimeout(sync);
  }, [answers, currentNode?.type, nodeId, resumeKey, resumeReady, timeLeft, totalPoints, user?.email]);

  // Only Response Rush writes this game id. QuackProgress can therefore
  // aggregate it without changing Reply Coach or any other QuackResponse mode.
  useEffect(() => {
    if (currentNode?.type !== 'ENDING' || !user?.email || scoreSaved.current) return;
    scoreSaved.current = true;
    const today = new Date().toISOString().slice(0, 10);
    const correctAnswers = answers.filter((answer) => GOOD_TIERS.includes(answer.evaluation)).length;
    void fetch(`${expoconfig.API_URL}/api/scores/high-score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `${user.fname ?? ''} ${user.lname ?? ''}`.trim(),
        email: user.email,
        date: today,
        game: 'QUACKRESPONSE_RUSH',
        mode: 'RESPONSE_RUSH',
        score: totalPoints,
        maxScore: maxPoints,
        correctAnswers,
        totalQuestions: TOTAL_CHOICES,
        completed: true,
      }),
    }).catch(() => undefined);
    if (resumeKey) void AsyncStorage.removeItem(resumeKey);
    void fetch(`${expoconfig.API_URL}/api/response-rush/progress?email=${encodeURIComponent(user.email)}`, {
      method: 'DELETE',
    }).catch(() => undefined);
  }, [answers, currentNode?.type, maxPoints, resumeKey, totalPoints, user]);

  // Keep the existing local best as an offline cache. The same percentage is
  // also included in the backend progress snapshot above for cross-device unlocks.
  useEffect(() => {
    if (!user?.email || answers.length === 0) return;
    const attemptMax = (currentNode?.id === 'n_ending' ? TOTAL_CHOICES : answers.length) * 3;
    const attemptPercent = attemptMax ? Math.round((totalPoints / attemptMax) * 100) : 0;
    const key = `${RESPONSE_RUSH_BEST_SCORE_KEY}:${user.email.toLowerCase()}`;
    AsyncStorage.getItem(key)
      .then((stored) => {
        const previous = Number(stored) || 0;
        if (attemptPercent > previous) return AsyncStorage.setItem(key, String(attemptPercent));
        return undefined;
      })
      .catch(() => undefined);
  }, [answers.length, totalPoints, currentNode?.id, user?.email]);

  useEffect(() => () => {
    musicGeneration.current += 1;
    const music = backgroundMusic.current;
    backgroundMusic.current = null;
    if (music) void music.stopAsync().finally(() => music.unloadAsync());
    void stopAndUnloadSound(voiceSound.current);
    voiceSound.current = null;
    void stopAndUnloadSound(stingerSound.current);
    stingerSound.current = null;
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
  }, []);

  // Opening the exit confirmation pauses the game. Confirming Exit keeps it
  // stopped while the transition runs: countdown, delayed advancement,
  // dialogue, stingers, and both music beds are all cancelled here.
  useEffect(() => {
    if (!exitVisible && !exiting) return;
    musicGeneration.current += 1;
    voiceGeneration.current += 1;
    if (advanceTimer.current) {
      clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
    const music = backgroundMusic.current;
    backgroundMusic.current = null;
    backgroundMusicKey.current = '';
    const voice = voiceSound.current;
    voiceSound.current = null;
    const stinger = stingerSound.current;
    stingerSound.current = null;
    setIsSpriteSpeaking(false);
    void stopAndUnloadSound(music);
    void stopAndUnloadSound(voice);
    void stopAndUnloadSound(stinger);
  }, [exitVisible, exiting]);

  // Scene music, ducked under dialogue audio instead of a flat on/off toggle.
  useEffect(() => {
    if (exitVisible || exiting) return;
    const generation = ++musicGeneration.current;
    const trackKey = 'response-rush';
    const duckedVolume = isSpriteSpeaking ? 0.045 : currentNode?.type === 'CHOICE' ? 0.14 : 0.1;
    const syncMusic = async () => {
      try {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: false, shouldDuckAndroid: true });
        if (backgroundMusicKey.current === trackKey && backgroundMusic.current) {
          await backgroundMusic.current.setVolumeAsync(duckedVolume).catch(() => undefined);
          return;
        }
        const previous = backgroundMusic.current;
        backgroundMusic.current = null;
        backgroundMusicKey.current = '';
        if (previous) {
          await previous.stopAsync().catch(() => undefined);
          await previous.unloadAsync().catch(() => undefined);
        }
        const { sound } = await Audio.Sound.createAsync(responseRushBgm, { isLooping: true, volume: duckedVolume, shouldPlay: true });
        if (generation !== musicGeneration.current) {
          await sound.stopAsync().catch(() => undefined);
          await sound.unloadAsync().catch(() => undefined);
          return;
        }
        backgroundMusic.current = sound;
        backgroundMusicKey.current = trackKey;
      } catch {
        // A missing/undecodable track should never block play.
      }
    };
    void syncMusic();
  }, [currentNode?.type, exitVisible, exiting, isSpriteSpeaking]);

  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, { toValue: 1, duration: 260, useNativeDriver: true }).start();
  }, [nodeId]);

  // Reader-paced typewriter for NARRATION only.
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

  // Countdown, active only on an unanswered CHOICE node.
  useEffect(() => {
    setHintVisible(false);
    if (!resumeReady || exitVisible || exiting) return;
    if (!currentNode || currentNode.type !== 'CHOICE') {
      setTimeLeft(CHOICE_SECONDS);
      activeChoiceNode.current = '';
      return;
    }
    if (activeChoiceNode.current !== currentNode.id) {
      activeChoiceNode.current = currentNode.id;
      setTimeLeft(restoredChoiceTime.current ?? CHOICE_SECONDS);
      restoredChoiceTime.current = null;
    }
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
  }, [currentNode?.id, exitVisible, exiting, resumeReady]);

  // Correct/incorrect flash + stinger the instant a REACTION lands.
  useEffect(() => {
    if (!currentNode || currentNode.type !== 'REACTION' || !lastAnswer) {
      setFlashTier(null);
      return;
    }
    const tier: 'good' | 'bad' = GOOD_TIERS.includes(lastAnswer.evaluation) ? 'good' : 'bad';
    setFlashTier(tier);
    flashOpacity.setValue(0);
    badgeScale.setValue(0.4);
    Animated.sequence([
      Animated.timing(flashOpacity, { toValue: 1, duration: 130, useNativeDriver: true }),
      Animated.timing(flashOpacity, { toValue: 0, duration: 480, useNativeDriver: true }),
    ]).start(() => setFlashTier(null));
    Animated.spring(badgeScale, { toValue: 1, friction: 5, tension: 120, useNativeDriver: true }).start();
    void stopAndUnloadSound(stingerSound.current);
    stingerSound.current = null;
    let createdStinger: Audio.Sound | null = null;
    Audio.Sound.createAsync(stingers[tier], { shouldPlay: true, volume: 0.8 })
      .then(({ sound }) => {
        createdStinger = sound;
        stingerSound.current = sound;
      })
      .catch(() => undefined);
    return () => {
      if (stingerSound.current === createdStinger) stingerSound.current = null;
      if (createdStinger) void stopAndUnloadSound(createdStinger);
    };
  }, [currentNode?.id]);

  // The core auto-play engine: whenever a DIALOGUE or REACTION node becomes
  // current, its voice line starts immediately, the sprite's mouth runs for
  // the duration, and the story (or the feedback pop-up, for a REACTION)
  // advances the instant the line ends — no tap required. A short
  // reading-time fallback covers the rare case audio fails to load, so the
  // story can never stall.
  useEffect(() => {
    advanceTimer.current && clearTimeout(advanceTimer.current);
    if (!resumeReady || exitVisible || exiting || !currentNode || (currentNode.type !== 'DIALOGUE' && currentNode.type !== 'REACTION')) {
      setIsSpriteSpeaking(false);
      return;
    }

    const generation = ++voiceGeneration.current;
    const node = currentNode;
    const textLength = (node.japanese?.length ?? 0) + (node.romaji?.length ?? 0);
    const fallbackMs = Math.min(6500, Math.max(1700, textLength * 55));

    const finishAndAdvance = () => {
      if (generation !== voiceGeneration.current) return;
      setIsSpriteSpeaking(false);
      if (node.type === 'DIALOGUE' && node.nextNodeId) {
        setNodeId(node.nextNodeId);
      } else if (node.type === 'REACTION') {
        setFeedbackVisible(true);
      }
    };

    const play = async () => {
      const source = resolveAudio(node.id);
      setIsSpriteSpeaking(true);
      if (!source) {
        advanceTimer.current = setTimeout(finishAndAdvance, fallbackMs);
        return;
      }
      try {
        await stopAndUnloadSound(voiceSound.current);
        voiceSound.current = null;
        const { sound } = await loadBundledSound(source, { shouldPlay: true, volume: 1 }, (status) => {
          if (generation !== voiceGeneration.current) return;
          if (status.isLoaded && status.didJustFinish) {
            if (advanceTimer.current) clearTimeout(advanceTimer.current);
            advanceTimer.current = setTimeout(finishAndAdvance, 220);
          }
        });
        if (generation !== voiceGeneration.current) {
          await sound.unloadAsync();
          return;
        }
        voiceSound.current = sound;
        // Safety net in case onPlaybackStatusUpdate never fires.
        advanceTimer.current = setTimeout(finishAndAdvance, fallbackMs + 2500);
      } catch {
        advanceTimer.current = setTimeout(finishAndAdvance, fallbackMs);
      }
    };

    void play();

    return () => {
      voiceGeneration.current += 1;
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  }, [currentNode?.id, exitVisible, exiting, resumeReady]);

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
      englishMeaning: choice.englishMeaning,
    };
    setAnswers((prev) => [...prev, record]);
    setNodeId(choice.nextNodeId);
  };

  const navigateOnwards = (targetId: string) => {
    const scene = currentNode ? sceneMap.get(currentNode.sceneId) : undefined;
    if (
      currentNode?.type === 'NARRATION'
      && scene
      && scene.culturalNotes.length
      && !shownCulturalScenes.current.has(scene.id)
      && Math.random() < 0.5
    ) {
      shownCulturalScenes.current.add(scene.id);
      const note = scene.culturalNotes[Math.floor(Math.random() * scene.culturalNotes.length)];
      setCulturalText(note);
      pendingAfterCultural.current = targetId;
      setCulturalVisible(true);
      return;
    }
    setNodeId(targetId);
  };

  const dismissCultural = () => {
    setCulturalVisible(false);
    const next = pendingAfterCultural.current;
    pendingAfterCultural.current = null;
    if (next) setNodeId(next);
  };

  const continueAfterFeedback = () => {
    const node = currentNode;
    setFeedbackVisible(false);
    if (!node?.mergeNodeId) return;
    setNodeId(node.mergeNodeId);
  };

  const advanceNarration = () => {
    if (!currentNode || currentNode.type !== 'NARRATION') return;
    if (!narrationFinished) {
      setTypedNarration(currentNode.text ?? '');
      setNarrationFinished(true);
      return;
    }
    if (currentNode.nextNodeId) navigateOnwards(currentNode.nextNodeId);
  };

  const viewResults = () => setResultsVisible(true);

  const restart = () => {
    setResultsVisible(false);
    setReviewVisible(false);
    setFeedbackVisible(false);
    setCulturalVisible(false);
    shownCulturalScenes.current.clear();
    scoreSaved.current = false;
    setAnswers([]);
    setNodeId(START_NODE_ID);
    setTimeLeft(CHOICE_SECONDS);
    if (resumeKey) void AsyncStorage.removeItem(resumeKey);
    if (user?.email) {
      void fetch(`${expoconfig.API_URL}/api/response-rush/progress?email=${encodeURIComponent(user.email)}`, {
        method: 'DELETE',
      }).catch(() => undefined);
    }
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
  const isDialogue = currentNode.type === 'DIALOGUE';
  const isEnding = currentNode.type === 'ENDING';
  const timerRatio = timeLeft / CHOICE_SECONDS;
  const timerDanger = timeLeft <= 6;
  const speakerAccent = currentNode.characterKey ? characterAccent[currentNode.characterKey] : '#8423D9';

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
                  speaking={(isDialogue || isReaction) && isSpriteSpeaking}
                  reacting={isReaction}
                />
              ) : null}
            </View>
          )}

          {isNarration ? (
            <Pressable style={rushStyles.narrationWrap} onPress={advanceNarration}>
              <View style={rushStyles.narrationPage}>
                <View style={rushStyles.narrationSpine} />
                <View style={rushStyles.narrationHeaderRow}>
                  <View style={rushStyles.narrationLocationChip}>
                    <Ionicons name="location-outline" size={13} color="#F4E8FF" />
                    <Text style={rushStyles.narrationLocationText} numberOfLines={1}>{currentNode.title}</Text>
                  </View>
                </View>
                <Text style={rushStyles.narrationBody} maxFontSizeMultiplier={1.08}>{typedNarration}</Text>
                <View style={rushStyles.narrationFooterRow}>
                  <Text style={rushStyles.narrationFooterText}>{narrationFinished ? 'Tap to continue' : 'Tap to reveal'}</Text>
                  <Ionicons name={narrationFinished ? 'chevron-forward' : 'ellipsis-horizontal'} size={16} color="#F4E8FF" />
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
              <Pressable style={styles.primaryButton} onPress={viewResults}>
                <Text style={styles.primaryButtonText}>View my results</Text>
              </Pressable>
            </View>
          ) : (
            // DIALOGUE and REACTION: fully automatic. No press handler — the
            // bubble just displays what's already auto-playing.
            <View style={[rushStyles.vnBubbleWrap, currentNode.characterKey === 'HARU' ? rushStyles.vnBubbleLeftAlign : rushStyles.vnBubbleRightAlign]}>
              <View style={[rushStyles.vnBubble, { borderColor: speakerAccent }]}>
                <View style={[rushStyles.vnBubbleTail, { borderTopColor: speakerAccent }, currentNode.characterKey === 'HARU' ? rushStyles.vnTailLeft : rushStyles.vnTailRight]} />
                <View style={rushStyles.vnSpeakerRow}>
                  <View style={[rushStyles.vnSpeakerDot, { backgroundColor: speakerAccent }]} />
                  <Text style={[rushStyles.vnSpeakerName, { color: speakerAccent }]}>{currentNode.speaker}</Text>
                  {isReaction && (
                    <View style={[rushStyles.reactionTag, { backgroundColor: `${speakerAccent}1F` }]}>
                      <Text style={[rushStyles.reactionTagText, { color: speakerAccent }]}>REACTING</Text>
                    </View>
                  )}
                </View>
                {Boolean(currentNode.japanese) && (
                  <Text style={rushStyles.vnJapanese} numberOfLines={3} adjustsFontSizeToFit minimumFontScale={0.72} maxFontSizeMultiplier={1.1}>
                    {currentNode.japanese}
                  </Text>
                )}
                {Boolean(currentNode.romaji) && (
                  <Text style={rushStyles.vnRomaji} numberOfLines={2} maxFontSizeMultiplier={1.05}>{currentNode.romaji}</Text>
                )}
                <View style={rushStyles.vnFooterRow}>
                  {isSpriteSpeaking ? (
                    <SpeakingIndicator color={speakerAccent} />
                  ) : (
                    <Text style={[rushStyles.vnSettling, { color: speakerAccent }]}>···</Text>
                  )}
                </View>
              </View>
            </View>
          )}
        </Animated.View>

        {/* Correct / incorrect flash + badge */}
        {flashTier && (
          <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: flashTier === 'good' ? '#3FBE5A' : '#D4453F', opacity: flashOpacity },
              ]}
            />
            <View style={rushStyles.flashBadgeWrap}>
              <Animated.View style={[rushStyles.flashBadge, { transform: [{ scale: badgeScale }], backgroundColor: flashTier === 'good' ? '#2E9E48' : '#B8342F' }]}>
                <Image source={flashIcons[flashTier]} style={rushStyles.flashBadgeIcon} resizeMode="contain" />
              </Animated.View>
            </View>
          </View>
        )}
      </SafeAreaView>

      {/* Exit confirmation */}
      <Modal visible={exitVisible} transparent animationType="fade" onRequestClose={() => setExitVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.exitCard}>
            <Ionicons name="bookmark-outline" size={38} color="#8423D9" />
            <Text style={styles.exitTitle}>Leave Response Rush?</Text>
            <Text style={styles.exitText}>Your exact place and current score are saved. Continue this rush whenever you return.</Text>
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

      {/* Random cultural-context pop-up */}
      <Modal visible={culturalVisible} transparent animationType="fade" onRequestClose={() => undefined}>
        <View style={styles.modalBackdrop}>
          <View style={rushStyles.culturalCard}>
            <View style={rushStyles.culturalIcon}>
              <Ionicons name="sparkles" size={26} color="#2E9E48" />
            </View>
            <Text style={rushStyles.culturalEyebrow}>WHY THIS MATTERS IN JAPAN</Text>
            <Text style={rushStyles.culturalText}>{culturalText}</Text>
            <Pressable style={styles.primaryButton} onPress={dismissCultural}>
              <Text style={styles.primaryButtonText}>Got it</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Per-choice feedback pop-up: why good/bad + a better example */}
      <Modal visible={feedbackVisible} transparent animationType="fade" onRequestClose={() => undefined}>
        <View style={styles.modalBackdrop}>
          <View style={rushStyles.feedbackCard}>
            {lastAnswer && (
              <>
                <View style={[rushStyles.feedbackRibbon, { backgroundColor: evaluationTheme[lastAnswer.evaluation].color }]} />
                <View style={[styles.feedbackIcon, { backgroundColor: `${evaluationTheme[lastAnswer.evaluation].color}18` }]}>
                  <Ionicons name={evaluationTheme[lastAnswer.evaluation].icon} size={34} color={evaluationTheme[lastAnswer.evaluation].color} />
                </View>
                <Text style={[styles.feedbackEyebrow, { color: evaluationTheme[lastAnswer.evaluation].color }]}>
                  {evaluationTheme[lastAnswer.evaluation].label.toUpperCase()}
                </Text>
                <Text style={styles.feedbackReaction}>{lastAnswer.feedbackTitle}</Text>
                {lastAnswer.selectedJapanese !== '—' && (
                  <View style={rushStyles.answerMeaningCard}>
                    <View style={rushStyles.answerMeaningHeader}>
                      <View style={[rushStyles.answerMeaningIcon, { backgroundColor: `${evaluationTheme[lastAnswer.evaluation].color}18` }]}>
                        <Ionicons name="language-outline" size={18} color={evaluationTheme[lastAnswer.evaluation].color} />
                      </View>
                      <Text style={rushStyles.answerMeaningLabel}>YOUR RESPONSE</Text>
                    </View>
                    <Text style={rushStyles.answerMeaningJapanese}>{lastAnswer.selectedJapanese}</Text>
                    <View style={rushStyles.translationDivider} />
                    <Text style={rushStyles.translationLabel}>ENGLISH MEANING</Text>
                    <Text style={rushStyles.translationText}>{lastAnswer.englishMeaning || 'Meaning unavailable for this response.'}</Text>
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
                    <View style={rushStyles.exampleQuoteBar} />
                    <View style={{ flex: 1 }}>
                      <Text style={rushStyles.exampleLabel}>A BETTER EXAMPLE</Text>
                      <Text style={rushStyles.exampleJapanese}>{lastAnswer.betterExample.japanese}</Text>
                      <Text style={rushStyles.exampleRomaji}>{lastAnswer.betterExample.romaji}</Text>
                      <Text style={rushStyles.exampleNote}>{lastAnswer.betterExample.note}</Text>
                    </View>
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
                  {answer.englishMeaning ? <Text style={rushStyles.reviewTranslation}>{answer.englishMeaning}</Text> : null}
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

  // Narration — a bottom "storybook page" panel, distinct from the
  // dialogue bubble: full width, a colored spine on the left edge, a
  // location chip instead of a plain icon+label row.
  narrationWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  narrationPage: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(24,13,40,0.95)',
    paddingVertical: 22,
    paddingLeft: 24,
    paddingRight: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  narrationSpine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
    backgroundColor: '#8423D9',
  },
  narrationHeaderRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  narrationLocationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    maxWidth: '100%',
  },
  narrationLocationText: {
    color: '#F4E8FF',
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  narrationBody: {
    color: '#FFFFFF',
    fontSize: 15.5,
    lineHeight: 23,
  },
  narrationFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    marginTop: 12,
  },
  narrationFooterText: {
    color: '#F4E8FF',
    fontSize: 12,
    fontWeight: '600',
  },

  // Dialogue / reaction — a floating chat-style bubble, accent-colored per
  // speaker, anchored toward the side the sprite stands on, with a live
  // "speaking…" indicator instead of any manual controls.
  vnBubbleWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 26,
    paddingHorizontal: 20,
  },
  vnBubbleLeftAlign: { alignItems: 'flex-start' },
  vnBubbleRightAlign: { alignItems: 'flex-end' },
  vnBubble: {
    maxWidth: '92%',
    minWidth: '70%',
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderRadius: 20,
    borderWidth: 2,
    paddingVertical: 16,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  vnBubbleTail: {
    position: 'absolute',
    top: -10,
    width: 0,
    height: 0,
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    transform: [{ rotate: '180deg' }],
  },
  vnTailLeft: { left: 26 },
  vnTailRight: { right: 26 },
  vnSpeakerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  vnSpeakerDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 7,
  },
  vnSpeakerName: {
    fontSize: 12.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  vnJapanese: {
    fontSize: 19,
    fontWeight: '700',
    color: '#221033',
    marginTop: 2,
  },
  vnRomaji: {
    fontSize: 13.5,
    color: '#6B5A78',
    marginTop: 3,
  },
  vnFooterRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  vnSettling: {
    fontSize: 16,
    fontWeight: '800',
  },
  speakingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  speakingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  speakingLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 3,
  },

  reactionTag: {
    marginLeft: 8,
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  reactionTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.4,
  },

  // Correct / incorrect flash overlay
  flashBadgeWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flashBadge: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  flashBadgeIcon: {
    width: 46,
    height: 46,
    tintColor: '#FFFFFF',
  },

  // Cultural note pop-up
  culturalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(46,158,72,0.18)',
    shadowColor: '#1B5E2E',
    shadowOpacity: 0.22,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  culturalIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(46,158,72,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(46,158,72,0.22)',
  },
  culturalEyebrow: {
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: '#2E9E48',
    marginBottom: 10,
  },
  culturalText: {
    fontSize: 14.5,
    lineHeight: 22,
    color: '#3A2E48',
    textAlign: 'center',
    marginBottom: 18,
  },

  // Feedback pop-up redesign
  feedbackCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 22,
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#2A1640',
    shadowOpacity: 0.28,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 14 },
    elevation: 12,
  },
  feedbackRibbon: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 7,
  },
  answerMeaningCard: {
    width: '100%',
    backgroundColor: '#FAF7FD',
    borderWidth: 1,
    borderColor: '#E8DDF1',
    borderRadius: 18,
    padding: 15,
    marginTop: 12,
    marginBottom: 12,
  },
  answerMeaningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 9,
  },
  answerMeaningIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  answerMeaningLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#755F82',
  },
  answerMeaningJapanese: {
    fontSize: 19,
    lineHeight: 27,
    fontWeight: '800',
    color: '#351A4A',
  },
  translationDivider: {
    height: 1,
    backgroundColor: '#E8DDF1',
    marginVertical: 11,
  },
  translationLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#8423D9',
    marginBottom: 4,
  },
  translationText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#51405E',
  },
  reviewTranslation: {
    fontSize: 13,
    lineHeight: 19,
    color: '#6F5B7D',
    fontStyle: 'italic',
    marginTop: 3,
    marginBottom: 8,
  },
  exampleBox: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#F2ECFB',
    borderRadius: 14,
    padding: 14,
    marginTop: 4,
    marginBottom: 14,
  },
  exampleQuoteBar: {
    width: 4,
    borderRadius: 2,
    backgroundColor: '#8423D9',
    marginRight: 12,
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
