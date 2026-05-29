import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Image,
  Animated,
  Modal,
} from 'react-native';

import { router } from 'expo-router';
import BackIcon from '../assets/svg/back-icon.svg';
import styles from '../styles/stylesQuackResponseTimed';

import bgGym from '../assets/img/background/school a gym s1st2 day.png';
import bgHallway from '../assets/img/background/school a hallway st2 day.png';
import bgClassroom from '../assets/img/background/classroom a st2 day.png';

import sumiSmile from '../assets/img/Sumi_PoseB_WinterUni_Smile.png';
import sumiOpen from '../assets/img/Sumi_PoseB_WinterUni_Open.png';
import sumiFrown from '../assets/img/Sumi_PoseB_WinterUni_Frown.png';

import boySmile from '../assets/img/Sprite Male Dark Hair Smi01.png';
import boyTalk from '../assets/img/Sprite Male Dark Hair Ann01.png';
import boySad from '../assets/img/Sprite Male Dark Hair Sad01.png';

const rounds = [
  {
    background: bgGym,
    npc: 'Sumi',
    sprite: sumiOpen,
    jp: '今日の体育、楽しみ？',
    romaji: 'Kyou no taiiku, tanoshimi?',
    english: 'Are you excited for PE today?',
    choices: [
      { jp: 'うん！', romaji: 'Un!', correct: true },
      { jp: 'いただきます', romaji: 'Itadakimasu', correct: false },
      { jp: 'さようなら', romaji: 'Sayounara', correct: false },
      { jp: 'おやすみ', romaji: 'Oyasumi', correct: false },
    ],
  },

  {
    background: bgHallway,
    npc: 'Professor',
    sprite: boyTalk,
    jp: '宿題は終わりましたか？',
    romaji: 'Shukudai wa owarimashita ka?',
    english: 'Did you finish the homework?',
    choices: [
      { jp: 'はい、終わりました。', romaji: 'Hai, owarimashita.', correct: true },
      { jp: 'おはよう！', romaji: 'Ohayou!', correct: false },
      { jp: 'いただきます', romaji: 'Itadakimasu', correct: false },
      { jp: 'こんばんは', romaji: 'Konbanwa', correct: false },
    ],
  },

  {
    background: bgClassroom,
    npc: 'Sumi',
    sprite: sumiSmile,
    jp: 'ありがとう！',
    romaji: 'Arigatou!',
    english: 'Thank you!',
    choices: [
      { jp: 'どういたしまして', romaji: 'Douitashimashite', correct: true },
      { jp: 'ごめんね', romaji: 'Gomen ne', correct: false },
      { jp: 'さようなら', romaji: 'Sayounara', correct: false },
      { jp: 'はい', romaji: 'Hai', correct: false },
    ],
  },

  {
    background: bgGym,
    npc: 'Professor',
    sprite: boyTalk,
    jp: '遅れないでください。',
    romaji: 'Okurenaide kudasai.',
    english: 'Please don’t be late.',
    choices: [
      { jp: 'すみません！', romaji: 'Sumimasen!', correct: true },
      { jp: 'おやすみ', romaji: 'Oyasumi', correct: false },
      { jp: 'こんにちは', romaji: 'Konnichiwa', correct: false },
      { jp: 'ありがとう', romaji: 'Arigatou', correct: false },
    ],
  },

  {
    background: bgHallway,
    npc: 'Sumi',
    sprite: sumiOpen,
    jp: 'また明日ね！',
    romaji: 'Mata ashita ne!',
    english: 'See you tomorrow!',
    choices: [
      { jp: 'またね！', romaji: 'Mata ne!', correct: true },
      { jp: 'いただきます', romaji: 'Itadakimasu', correct: false },
      { jp: 'ごめんなさい', romaji: 'Gomennasai', correct: false },
      { jp: 'おはよう', romaji: 'Ohayou', correct: false },
    ],
  },
];

const QuackResponseTimed = () => {
  const [roundIndex, setRoundIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [finished, setFinished] = useState(false);

  const current = rounds[roundIndex];

  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (result || finished) return;

    if (timeLeft <= 0) {
      handleTimeout();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, result]);

  const nextRound = () => {
    if (roundIndex >= rounds.length - 1) {
      setFinished(true);
      return;
    }

    setRoundIndex((prev) => prev + 1);
    setTimeLeft(5);
    setResult(null);
  };

  const handleChoice = (choice: any) => {
    const correct = choice.correct;

    if (correct) {
      setScore((prev) => prev + 1);
      setCombo((prev) => prev + 1);

      setResult({
        type: 'correct',
        text: 'FAST RESPONSE!',
      });
    } else {
      setCombo(0);

      setResult({
        type: 'wrong',
        text: 'Wrong expression!',
      });
    }
  };

  const handleTimeout = () => {
    setCombo(0);

    setResult({
      type: 'timeout',
      text: 'TIME UP!',
    });
  };

  return (
    <ImageBackground
      source={current.background}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      <View style={styles.header}>
      <TouchableOpacity
  onPress={() => {
    setFinished(false);
    setResult(null);
    setRoundIndex(0);
    setTimeLeft(5);
    setScore(0);
    setCombo(0);

    router.replace('/QuackResponse');
  }}
>
          <View style={styles.backButtonContainer}>
            <BackIcon width={22} height={22} fill="white" />
          </View>
        </TouchableOpacity>

        <View style={styles.headerTitleBox}>
          <Text style={styles.headerMini}>2.2 TIMED CHALLENGE</Text>
          <Text style={styles.headerTitle}>Quick Response</Text>
        </View>

        <Image
          source={require('../assets/talk.png')}
          style={styles.headerDuck}
        />
      </View>

      <View style={styles.topHud}>
        <View style={styles.hudBox}>
          <Text style={styles.hudLabel}>Score</Text>
          <Text style={styles.hudValue}>{score}</Text>
        </View>

        <View style={styles.hudBox}>
          <Text style={styles.hudLabel}>Combo</Text>
          <Text style={styles.hudValue}>{combo}x</Text>
        </View>

        <View style={styles.hudBox}>
          <Text style={styles.hudLabel}>Round</Text>
          <Text style={styles.hudValue}>
            {roundIndex + 1}/5
          </Text>
        </View>
      </View>

      <View style={styles.timerBarBg}>
        <View
          style={[
            styles.timerBar,
            {
              width: `${(timeLeft / 5) * 100}%`,
            },
          ]}
        />
      </View>

      <Text style={styles.timerText}>{timeLeft}</Text>

      <Animated.Image
        source={current.sprite}
        style={[
          styles.character,
          {
            transform: [{ translateY: floatAnim }],
          },
        ]}
      />

      <View style={styles.dialogueBox}>
        <Text style={styles.speaker}>{current.npc}</Text>

        <Text style={styles.jp}>{current.jp}</Text>
        <Text style={styles.romaji}>{current.romaji}</Text>
        <Text style={styles.english}>{current.english}</Text>
      </View>

      {!result && (
        <View style={styles.choiceContainer}>
          {current.choices.map((choice) => (
            <TouchableOpacity
              key={choice.jp}
              style={styles.choiceButton}
              activeOpacity={0.85}
              onPress={() => handleChoice(choice)}
            >
              <Text style={styles.choiceJP}>{choice.jp}</Text>
              <Text style={styles.choiceRomaji}>
                {choice.romaji}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {result && (
        <View style={styles.resultContainer}>
          <Text
            style={[
              styles.resultText,
              result.type === 'correct'
                ? styles.correct
                : styles.wrong,
            ]}
          >
            {result.text}
          </Text>

          <TouchableOpacity
            style={styles.nextButton}
            onPress={nextRound}
          >
            <Text style={styles.nextButtonText}>
              Continue
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={finished} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.resultTitle}>
              Challenge Complete!
            </Text>

            <Text style={styles.finalScore}>
              Final Score: {score}/5
            </Text>

            <TouchableOpacity
              style={styles.finishButton}
              onPress={() => {
  setFinished(false);
  setResult(null);
  setRoundIndex(0);
  setTimeLeft(5);
  setScore(0);
  setCombo(0);

  router.replace('/QuackResponse');
}}
            >
              <Text style={styles.finishText}>
                Back to Menu
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
};

export default QuackResponseTimed;