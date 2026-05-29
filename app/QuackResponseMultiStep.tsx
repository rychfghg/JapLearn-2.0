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
import styles from '../styles/stylesQuackResponseMultiStep';

import classroomBg from '../assets/img/background/classroom a st2 day.png';

import sumiSmile from '../assets/img/Sumi_PoseB_WinterUni_Smile.png';
import sumiOpen from '../assets/img/Sumi_PoseB_WinterUni_Open.png';
import sumiFrown from '../assets/img/Sumi_PoseB_WinterUni_Frown.png';
import sumiClosedSmile from '../assets/img/Sumi_PoseB_WinterUni_EyesClosed_Smile.png';

import boyNeutral from '../assets/img/Sprite Male Dark Hair Neu01.png';
import boySmile from '../assets/img/Sprite Male Dark Hair Smi01.png';
import boyTalk from '../assets/img/Sprite Male Dark Hair Ann01.png';
import boySad from '../assets/img/Sprite Male Dark Hair Sad01.png';

const story = [
  {
    kind: 'narration',
    speaker: 'Narration',
    text: 'Morning sunlight fills the classroom. Students are chatting quietly before class begins.',
    focus: 'both',
  },
  {
    kind: 'dialogue',
    speaker: 'Yuki',
    jp: 'おはよう！今日は早いね。',
    romaji: 'Ohayou! Kyou wa hayai ne.',
    english: 'Good morning! You’re early today.',
    focus: 'sumi',
    sumi: sumiOpen,
    boy: boyNeutral,
  },
  {
    kind: 'choice',
    speaker: 'Your Response',
    prompt: 'How will you respond to Yuki?',
    focus: 'both',
    choices: [
      {
        jp: 'おはよう！',
        romaji: 'Ohayou!',
        correct: true,
        intent: 'Greeting',
        replySpeaker: 'Yuki',
        replyJP: '元気そうだね！',
        replyRomaji: 'Genki sou da ne!',
        replyEnglish: 'You seem energetic!',
      },
      {
        jp: '昨日あまり寝てない。',
        romaji: 'Kinou amari nete nai.',
        correct: true,
        intent: 'Sharing condition',
        replySpeaker: 'Yuki',
        replyJP: '大丈夫？無理しないでね。',
        replyRomaji: 'Daijoubu? Muri shinai de ne.',
        replyEnglish: 'Are you okay? Don’t push yourself.',
      },
      {
        jp: 'ちょっと疲れてる。',
        romaji: 'Chotto tsukareteru.',
        correct: true,
        intent: 'Sharing feeling',
        replySpeaker: 'Yuki',
        replyJP: 'そっか。今日はゆっくりしよう。',
        replyRomaji: 'Sokka. Kyou wa yukkuri shiyou.',
        replyEnglish: 'I see. Let’s take it easy today.',
      },
      {
        jp: '・・・',
        romaji: '...',
        correct: false,
        intent: 'No response',
        replySpeaker: 'Yuki',
        replyJP: 'まだ眠いの？',
        replyRomaji: 'Mada nemui no?',
        replyEnglish: 'Still sleepy?',
      },
    ],
  },
  {
    kind: 'narration',
    speaker: 'Narration',
    text: 'The classroom door slides open. Professor Saito enters while holding attendance papers.',
    focus: 'boy',
  },
  {
    kind: 'dialogue',
    speaker: 'Professor Saito',
    jp: 'みなさん、おはようございます。',
    romaji: 'Minasan, ohayou gozaimasu.',
    english: 'Good morning, everyone.',
    focus: 'boy',
    sumi: sumiSmile,
    boy: boyTalk,
  },
  {
    kind: 'dialogue',
    speaker: 'Professor Saito',
    jp: '「ありがとうございます」はどんな時に使いますか？',
    romaji: '“Arigatou gozaimasu” wa donna toki ni tsukaimasu ka?',
    english: 'When do we use “arigatou gozaimasu”?',
    focus: 'boy',
    sumi: sumiSmile,
    boy: boyTalk,
  },
  {
    kind: 'choice',
    speaker: 'Your Response',
    prompt: 'Answer Professor Saito’s question.',
    focus: 'both',
    choices: [
      {
        jp: '感謝するとき。',
        romaji: 'Kansha suru toki.',
        correct: true,
        intent: 'Thanking',
        replySpeaker: 'Professor Saito',
        replyJP: '正解です。とても自然な答えですね。',
        replyRomaji: 'Seikai desu. Totemo shizen na kotae desu ne.',
        replyEnglish: 'Correct. That is a very natural answer.',
      },
      {
        jp: '謝るとき。',
        romaji: 'Ayamaru toki.',
        correct: false,
        intent: 'Apologizing',
        replySpeaker: 'Professor Saito',
        replyJP: 'それは「すみません」ですね。',
        replyRomaji: 'Sore wa “sumimasen” desu ne.',
        replyEnglish: 'That would be “sumimasen.”',
      },
      {
        jp: '別れるとき。',
        romaji: 'Wakareru toki.',
        correct: false,
        intent: 'Parting',
        replySpeaker: 'Professor Saito',
        replyJP: '別れる時は「さようなら」を使います。',
        replyRomaji: 'Wakareru toki wa “sayounara” wo tsukaimasu.',
        replyEnglish: 'When parting, we use “sayounara.”',
      },
      {
        jp: '・・・',
        romaji: '...',
        correct: false,
        intent: 'No response',
        replySpeaker: 'Professor Saito',
        replyJP: '答えがありませんね。次は頑張りましょう。',
        replyRomaji: 'Kotae ga arimasen ne. Tsugi wa ganbarimashou.',
        replyEnglish: 'No answer. Let’s try again next time.',
      },
    ],
  },
  {
    kind: 'dialogue',
    speaker: 'Yuki',
    jp: 'あとで話そうね。',
    romaji: 'Ato de hanasou ne.',
    english: 'Let’s talk later.',
    focus: 'sumi',
    sumi: sumiClosedSmile,
    boy: boyNeutral,
  },
  {
    kind: 'dialogue',
    speaker: 'Professor Saito',
    jp: 'では、授業を始めます。',
    romaji: 'Dewa, jugyou wo hajimemasu.',
    english: 'Now, let’s begin class.',
    focus: 'boy',
    sumi: sumiSmile,
    boy: boyTalk,
  },
];

const QuackResponseMultiStep = () => {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [reply, setReply] = useState<any>(null);
  const [finished, setFinished] = useState(false);

  const panelAnim = useRef(new Animated.Value(0)).current;
  const zoomAnim = useRef(new Animated.Value(1)).current;
  const sumiFloat = useRef(new Animated.Value(0)).current;
  const boyFloat = useRef(new Animated.Value(0)).current;

  const current = story[index];

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(sumiFloat, { toValue: -7, duration: 850, useNativeDriver: true }),
        Animated.timing(sumiFloat, { toValue: 0, duration: 850, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(boyFloat, { toValue: -5, duration: 900, useNativeDriver: true }),
        Animated.timing(boyFloat, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    panelAnim.setValue(0);

    Animated.timing(panelAnim, {
      toValue: 1,
      duration: 280,
      useNativeDriver: true,
    }).start();

    Animated.spring(zoomAnim, {
      toValue: current.focus === 'both' ? 1 : 1.12,
      useNativeDriver: true,
    }).start();
  }, [index]);

  const goNext = () => {
    setReply(null);

    if (index >= story.length - 1) {
      setFinished(true);
      return;
    }

    setIndex((prev) => prev + 1);
  };

  const chooseAnswer = (choice: any) => {
    setReply(choice);

    setHistory((prev) => [
      ...prev,
      {
        step: index,
        answer: choice.jp,
        intent: choice.intent,
        correct: choice.correct,
      },
    ]);

    if (choice.correct) {
      setScore((prev) => prev + 1);
    } else {
      setMistakes((prev) => prev + 1);
    }
  };

  const backToMenu = () => {
    setFinished(false);
    router.push('/QuackResponse');
  };

  const restart = () => {
    setFinished(false);
    setIndex(0);
    setScore(0);
    setMistakes(0);
    setHistory([]);
    setReply(null);
  };

  const boySprite =
    reply && reply.correct ? boySmile :
    reply && !reply.correct ? boySad :
    current.boy || boyNeutral;

  const sumiSprite =
    reply && reply.correct ? sumiClosedSmile :
    reply && !reply.correct ? sumiFrown :
    current.sumi || sumiSmile;

  return (
    <ImageBackground source={classroomBg} style={styles.background} resizeMode="cover">
      <View style={styles.overlay} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/QuackResponse')}>
          <View style={styles.backButtonContainer}>
            <BackIcon width={22} height={22} fill="white" />
          </View>
        </TouchableOpacity>

        <View style={styles.headerTitleBox}>
          <Text style={styles.headerMini}>2.3 MULTI-STEP MODE</Text>
          <Text style={styles.headerTitle}>Conversation Story</Text>
        </View>

        <Image source={require('../assets/talk.png')} style={styles.headerDuck} />
      </View>

      <View style={styles.hud}>
        <View style={styles.hudCard}>
          <Text style={styles.hudLabel}>Progress</Text>
          <Text style={styles.hudValue}>{index + 1}/{story.length}</Text>
        </View>

        <View style={styles.hudCard}>
          <Text style={styles.hudLabel}>Correct</Text>
          <Text style={styles.hudValue}>{score}</Text>
        </View>

        <View style={styles.hudCard}>
          <Text style={styles.hudLabel}>Mistakes</Text>
          <Text style={styles.hudValue}>{mistakes}</Text>
        </View>
      </View>

      <Animated.View style={[styles.characterScene, { transform: [{ scale: zoomAnim }] }]}>
        <Animated.Image
          source={boySprite}
          style={[styles.boySprite, { transform: [{ translateY: boyFloat }] }]}
        />

        <Animated.Image
          source={sumiSprite}
          style={[styles.sumiSprite, { transform: [{ translateY: sumiFloat }] }]}
        />
      </Animated.View>

      {!reply && current.kind !== 'choice' && (
        <Animated.View
          style={[
            styles.dialogueBox,
            {
              opacity: panelAnim,
              transform: [
                {
                  translateY: panelAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [35, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.speaker}>{current.speaker}</Text>

          {current.text && <Text style={styles.narration}>{current.text}</Text>}

          {current.jp && (
            <>
              <Text style={styles.jp}>{current.jp}</Text>
              <Text style={styles.romaji}>{current.romaji}</Text>
              <Text style={styles.english}>{current.english}</Text>
            </>
          )}

          <TouchableOpacity style={styles.nextButton} onPress={goNext}>
            <Text style={styles.nextButtonText}>Continue</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {!reply && current.kind === 'choice' && (
        <View style={styles.choiceContainer}>
          <Text style={styles.choiceTitle}>{current.prompt}</Text>

          {current.choices.map((choice: any) => (
            <TouchableOpacity
              key={choice.jp}
              style={styles.choiceButton}
              activeOpacity={0.85}
              onPress={() => chooseAnswer(choice)}
            >
              <Text style={styles.choiceJP}>{choice.jp}</Text>
              <Text style={styles.choiceRomaji}>{choice.romaji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {reply && (
        <View style={styles.replyContainer}>
          <Text style={styles.replySpeaker}>{reply.replySpeaker}</Text>
          <Text style={styles.replyJP}>{reply.replyJP}</Text>
          <Text style={styles.replyRomaji}>{reply.replyRomaji}</Text>
          <Text style={styles.replyEnglish}>{reply.replyEnglish}</Text>

          <TouchableOpacity style={styles.nextButton} onPress={goNext}>
            <Text style={styles.nextButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={finished} transparent animationType="fade" onRequestClose={() => setFinished(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <TouchableOpacity style={styles.closeButton} onPress={backToMenu}>
              <Text style={styles.closeText}>X</Text>
            </TouchableOpacity>

            <Text style={styles.resultTitle}>Story Complete!</Text>
            <Text style={styles.resultScore}>Correct Responses: {score}</Text>
            <Text style={styles.resultSub}>Mistakes: {mistakes}</Text>
            <Text style={styles.resultSub}>Interactions Finished: {history.length}</Text>

            <TouchableOpacity style={styles.finishButton} onPress={restart}>
              <Text style={styles.finishText}>Retry Story</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.finishButton} onPress={backToMenu}>
              <Text style={styles.finishText}>Back to Menu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
};

export default QuackResponseMultiStep;