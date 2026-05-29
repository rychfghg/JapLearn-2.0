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
import styles from '../styles/stylesQuackResponseGuided';

import bgClassroom from '../assets/img/background/classroom a st2 day.png';
import bgHallway from '../assets/img/background/school a hallway st2 day.png';
import bgGym from '../assets/img/background/school a gym s1st2 day.png';
import bgStairs from '../assets/img/background/school a stairs st2 day.png';
import bgClubroom from '../assets/img/background/clubroom a st2 day.png';

import sumiSmile from '../assets/img/Sumi_PoseB_WinterUni_Smile.png';
import sumiOpen from '../assets/img/Sumi_PoseB_WinterUni_Open.png';
import sumiFrown from '../assets/img/Sumi_PoseB_WinterUni_Frown.png';
import sumiBlush from '../assets/img/Sumi_PoseB_WinterUni_Smile_Blush.png';
import sumiClosedSmile from '../assets/img/Sumi_PoseB_WinterUni_EyesClosed_Smile.png';

import boyNeutral from '../assets/img/Sprite Male Dark Hair Neu01.png';
import boyOpen from '../assets/img/Sprite Male Dark Hair Ann01.png';
import boySmile from '../assets/img/Sprite Male Dark Hair Smi01.png';
import boyFrown from '../assets/img/Sprite Male Dark Hair Sad01.png';

const scenarios = [
  {
    title: 'Morning Classroom',
    location: 'Classroom',
    background: bgClassroom,
    prompt: 'Tanaka-sensei enters the classroom. What should you say?',
    correctAnswer: 'おはようございます',
    npcReplyCorrect: 'Good! That is polite and appropriate for a teacher.',
    npcReplyWrong: 'Not quite. Since this is a teacher, use a polite greeting.',
    steps: [
      {
        speaker: 'Narration',
        line: 'The morning class is about to begin. Your classmates are already inside.',
        jp: '',
        romaji: '',
        focus: 'both',
        sumi: sumiSmile,
        boy: boyNeutral,
      },
      {
        speaker: 'Sumi',
        line: 'Look, Tanaka-sensei is entering the classroom.',
        jp: '田中先生が来ました。',
        romaji: 'Tanaka-sensei ga kimashita.',
        focus: 'sumi',
        sumi: sumiOpen,
        boy: boyNeutral,
      },
      {
        speaker: 'Classmate',
        line: 'We should greet the teacher properly.',
        jp: 'ちゃんとあいさつしよう。',
        romaji: 'Chanto aisatsu shiyou.',
        focus: 'boy',
        sumi: sumiSmile,
        boy: boyOpen,
      },
    ],
    choices: [
      { jp: 'おはようございます', romaji: 'ohayou gozaimasu', correct: true },
      { jp: 'じゃあね', romaji: 'jaa ne', correct: false },
      { jp: 'ありがとう', romaji: 'arigatou', correct: false },
      { jp: 'いただきます', romaji: 'itadakimasu', correct: false },
    ],
  },
  {
    title: 'Hallway Apology',
    location: 'School Hallway',
    background: bgHallway,
    prompt: 'You bump into a classmate lightly. What should you say?',
    correctAnswer: 'すみません',
    npcReplyCorrect: 'Nice! That apology fits the situation naturally.',
    npcReplyWrong: 'That does not fit. You need an apology expression here.',
    steps: [
      {
        speaker: 'Narration',
        line: 'The hallway is busy between classes. You accidentally bump into someone.',
        jp: '',
        romaji: '',
        focus: 'both',
        sumi: sumiSmile,
        boy: boyNeutral,
      },
      {
        speaker: 'Classmate',
        line: 'Oh! Are you okay?',
        jp: 'あっ！大丈夫？',
        romaji: 'Ah! Daijoubu?',
        focus: 'boy',
        sumi: sumiSmile,
        boy: boyOpen,
      },
    ],
    choices: [
      { jp: 'すみません', romaji: 'sumimasen', correct: true },
      { jp: 'いただきます', romaji: 'itadakimasu', correct: false },
      { jp: 'おはよう', romaji: 'ohayou', correct: false },
      { jp: 'またね', romaji: 'mata ne', correct: false },
    ],
  },
  {
    title: 'Gym Encouragement',
    location: 'Gym',
    background: bgGym,
    prompt: 'Sumi says she is nervous before PE. What is a good response?',
    correctAnswer: 'がんばって',
    npcReplyCorrect: 'Great! That encourages your friend.',
    npcReplyWrong: 'Not quite. Choose an expression that encourages someone.',
    steps: [
      {
        speaker: 'Narration',
        line: 'In the gym, students are preparing for the activity.',
        jp: '',
        romaji: '',
        focus: 'both',
        sumi: sumiFrown,
        boy: boyNeutral,
      },
      {
        speaker: 'Sumi',
        line: 'I am a little nervous.',
        jp: 'ちょっと緊張してる。',
        romaji: 'Chotto kinchou shiteru.',
        focus: 'sumi',
        sumi: sumiFrown,
        boy: boyNeutral,
      },
    ],
    choices: [
      { jp: 'がんばって', romaji: 'ganbatte', correct: true },
      { jp: 'さようなら', romaji: 'sayounara', correct: false },
      { jp: 'ごちそうさま', romaji: 'gochisousama', correct: false },
      { jp: 'おやすみ', romaji: 'oyasumi', correct: false },
    ],
  },
  {
    title: 'Stairs Thanking',
    location: 'School Stairs',
    background: bgStairs,
    prompt: 'Your classmate helps you pick up your notebook. What should you say?',
    correctAnswer: 'ありがとう',
    npcReplyCorrect: 'Correct! You thanked them naturally.',
    npcReplyWrong: 'Not quite. This situation needs a thanking expression.',
    steps: [
      {
        speaker: 'Narration',
        line: 'Near the stairs, you drop your notebook. Your classmate picks it up for you.',
        jp: '',
        romaji: '',
        focus: 'both',
        sumi: sumiSmile,
        boy: boySmile,
      },
      {
        speaker: 'Classmate',
        line: 'Here you go.',
        jp: 'はい、どうぞ。',
        romaji: 'Hai, douzo.',
        focus: 'boy',
        sumi: sumiSmile,
        boy: boyOpen,
      },
    ],
    choices: [
      { jp: 'ありがとう', romaji: 'arigatou', correct: true },
      { jp: 'ごめんね', romaji: 'gomen ne', correct: false },
      { jp: 'こんばんは', romaji: 'konbanwa', correct: false },
      { jp: 'いただきます', romaji: 'itadakimasu', correct: false },
    ],
  },
  {
    title: 'Clubroom Parting',
    location: 'Clubroom',
    background: bgClubroom,
    prompt: 'Club activity is finished. Sumi says she will see you tomorrow. What should you say?',
    correctAnswer: 'また明日',
    npcReplyCorrect: 'Nice! That is a natural parting response.',
    npcReplyWrong: 'Not quite. This is a goodbye / see-you-later situation.',
    steps: [
      {
        speaker: 'Narration',
        line: 'Club practice ends. Everyone starts packing their things.',
        jp: '',
        romaji: '',
        focus: 'both',
        sumi: sumiSmile,
        boy: boyNeutral,
      },
      {
        speaker: 'Sumi',
        line: 'Let’s meet again tomorrow.',
        jp: 'また明日会おうね。',
        romaji: 'Mata ashita aou ne.',
        focus: 'sumi',
        sumi: sumiOpen,
        boy: boyNeutral,
      },
    ],
    choices: [
      { jp: 'また明日', romaji: 'mata ashita', correct: true },
      { jp: 'いただきます', romaji: 'itadakimasu', correct: false },
      { jp: 'おはようございます', romaji: 'ohayou gozaimasu', correct: false },
      { jp: 'すみません', romaji: 'sumimasen', correct: false },
    ],
  },
];

const QuackResponseGuided = () => {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [showChoices, setShowChoices] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [resultVisible, setResultVisible] = useState(false);
  const [resultText, setResultText] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const zoomAnim = useRef(new Animated.Value(1)).current;
  const sumiFloat = useRef(new Animated.Value(0)).current;
  const boyFloat = useRef(new Animated.Value(0)).current;
  const choiceAnim = useRef(new Animated.Value(0)).current;

  const currentScenario = scenarios[scenarioIndex];
  const current = currentScenario.steps[step];

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(sumiFloat, { toValue: -8, duration: 800, useNativeDriver: true }),
        Animated.timing(sumiFloat, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(boyFloat, { toValue: -6, duration: 850, useNativeDriver: true }),
        Animated.timing(boyFloat, { toValue: 0, duration: 850, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    const focus = current.focus;
    let scale = 1;

    if (focus === 'sumi' || focus === 'boy') {
      scale = 1.18;
    }

    Animated.timing(zoomAnim, {
      toValue: scale,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [step, scenarioIndex]);

  const openChoices = () => {
    Animated.sequence([
      Animated.timing(zoomAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(choiceAnim, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start(() => setShowChoices(true));
  };

  const nextDialogue = () => {
    if (showChoices || resultVisible || finished) return;

    if (step < currentScenario.steps.length - 1) {
      setStep(step + 1);
      return;
    }

    openChoices();
  };

  const handleChoice = (choice: any) => {
    setSelected(choice);
    setIsCorrect(choice.correct);

    if (choice.correct) {
      setCorrectCount((prev) => prev + 1);
      setResultText(currentScenario.npcReplyCorrect);
    } else {
      setMistakeCount((prev) => prev + 1);
      setResultText(currentScenario.npcReplyWrong);
    }

    setResultVisible(true);
  };

  const nextScenario = () => {
    setResultVisible(false);
    setSelected(null);
    setShowChoices(false);
    choiceAnim.setValue(0);
    zoomAnim.setValue(1);

    if (scenarioIndex >= scenarios.length - 1) {
      setFinished(true);
      return;
    }

    setScenarioIndex((prev) => prev + 1);
    setStep(0);
  };

  const resetAll = () => {
    setScenarioIndex(0);
    setStep(0);
    setShowChoices(false);
    setSelected(null);
    setResultVisible(false);
    setResultText('');
    setIsCorrect(false);
    setCorrectCount(0);
    setMistakeCount(0);
    setFinished(false);
    choiceAnim.setValue(0);
    zoomAnim.setValue(1);
  };

  const backToMenu = () => {
    setResultVisible(false);
    setFinished(false);
    router.replace('/QuackResponse');
  };

  const sumiSprite =
    resultVisible && isCorrect ? sumiClosedSmile :
    resultVisible && !isCorrect ? sumiFrown :
    current.sumi;

  const boySprite =
    resultVisible && isCorrect ? boySmile :
    resultVisible && !isCorrect ? boyFrown :
    current.boy;

  return (
    <ImageBackground source={currentScenario.background} style={styles.background} resizeMode="cover">
      <View style={styles.overlay} />

      <View style={styles.header}>
        <TouchableOpacity onPress={backToMenu}>
          <View style={styles.backButtonContainer}>
            <BackIcon width={22} height={22} fill="white" />
          </View>
        </TouchableOpacity>

        <View style={styles.headerTitleBox}>
          <Text style={styles.headerSmall}>2.1 GUIDED RESPONSE</Text>
          <Text style={styles.headerTitle}>Scenario {scenarioIndex + 1}/5</Text>
        </View>

        <Image source={require('../assets/talk.png')} style={styles.headerDuck} />
      </View>

      <View style={styles.scoreHud}>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>Correct</Text>
          <Text style={styles.scoreValue}>{correctCount}</Text>
        </View>

        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>Mistakes</Text>
          <Text style={styles.scoreValue}>{mistakeCount}</Text>
        </View>
      </View>

      <TouchableOpacity activeOpacity={1} style={styles.stage} onPress={nextDialogue}>
        <View style={styles.locationPill}>
          <Text style={styles.locationText}>{currentScenario.location}</Text>
        </View>

        <Animated.View style={[styles.characterScene, { transform: [{ scale: zoomAnim }] }]}>
          <Animated.Image source={boySprite} style={[styles.boySprite, { transform: [{ translateY: boyFloat }] }]} />
          <Animated.Image source={sumiSprite} style={[styles.sumiSprite, { transform: [{ translateY: sumiFloat }] }]} />
        </Animated.View>

        {!showChoices && (
          <View style={styles.dialogueBox}>
            <Text style={styles.speakerName}>{current.speaker}</Text>

            {current.jp !== '' && (
              <>
                <Text style={styles.jpLine}>{current.jp}</Text>
                <Text style={styles.romajiLine}>{current.romaji}</Text>
              </>
            )}

            <Text style={styles.dialogueText}>{current.line}</Text>
            <Text style={styles.tapHint}>Tap to continue</Text>
          </View>
        )}

        {showChoices && (
          <Animated.View
            style={[
              styles.choicePanel,
              {
                opacity: choiceAnim,
                transform: [{ scale: choiceAnim }],
              },
            ]}
          >
            <Text style={styles.choiceTitle}>{currentScenario.title}</Text>
            <Text style={styles.choicePrompt}>{currentScenario.prompt}</Text>

            <View style={styles.choiceGrid}>
              {currentScenario.choices.map((choice) => (
                <TouchableOpacity
                  key={choice.jp}
                  activeOpacity={0.9}
                  style={[
                    styles.choiceButton,
                    selected?.jp === choice.jp && styles.choiceSelected,
                  ]}
                  onPress={() => handleChoice(choice)}
                >
                  <Text style={styles.choiceJP}>{choice.jp}</Text>
                  <Text style={styles.choiceRomaji}>{choice.romaji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        )}
      </TouchableOpacity>

      <Modal visible={resultVisible} transparent animationType="fade" onRequestClose={() => setResultVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setResultVisible(false)}>
              <Text style={styles.closeText}>X</Text>
            </TouchableOpacity>

            <Image
              source={isCorrect ? sumiClosedSmile : sumiFrown}
              style={styles.modalNpc}
            />

            <Text style={styles.resultTitle}>{isCorrect ? 'Good Response!' : 'Not Quite'}</Text>
            <Text style={styles.resultText}>{resultText}</Text>

            <View style={styles.answerBox}>
              <Text style={styles.answerLabel}>Best Response</Text>
              <Text style={styles.answerJP}>{currentScenario.correctAnswer}</Text>
            </View>

            <TouchableOpacity style={styles.modalButton} onPress={nextScenario}>
              <Text style={styles.modalButtonText}>
                {scenarioIndex >= scenarios.length - 1 ? 'View Results' : 'Next Scenario'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={finished} transparent animationType="fade" onRequestClose={() => setFinished(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <TouchableOpacity style={styles.closeButton} onPress={backToMenu}>
              <Text style={styles.closeText}>X</Text>
            </TouchableOpacity>

            <Text style={styles.resultTitle}>Guided Complete!</Text>
            <Text style={styles.resultText}>Correct: {correctCount}/5</Text>
            <Text style={styles.resultText}>Mistakes: {mistakeCount}</Text>

            <TouchableOpacity style={styles.modalButton} onPress={resetAll}>
              <Text style={styles.modalButtonText}>Retry</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalButton} onPress={backToMenu}>
              <Text style={styles.modalButtonText}>Back to Menu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
};

export default QuackResponseGuided;