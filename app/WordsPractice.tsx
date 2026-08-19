import React, { useMemo, useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import styles from '../styles/stylesWordsPractice';

const questions = [
  { image: require('../assets/words_premium/words1-friend.png'), answer: 'ともだち', choices: ['ともだち', 'かぞく', 'がくせい'], meaning: 'friend' },
  { image: require('../assets/words_premium/words2-teacher.png'), answer: 'せんせい', choices: ['いしゃ', 'せんせい', 'べんごし'], meaning: 'teacher' },
  { image: require('../assets/words3_image/station.png'), answer: 'えき', choices: ['ぎんこう', 'えき', 'がっこう'], meaning: 'station' },
  { image: require('../assets/words3_image/book.png'), answer: 'ほん', choices: ['かぎ', 'かばん', 'ほん'], meaning: 'book' },
  { image: require('../assets/words3_image/train.png'), answer: 'でんしゃ', choices: ['くるま', 'でんしゃ', 'じてんしゃ'], meaning: 'train' },
  { image: require('../assets/words_premium/words1-family.png'), answer: 'かぞく', choices: ['こども', 'かぞく', 'ともだち'], meaning: 'family' },
];

export default function WordsPractice() {
  const router = useRouter();
  const mixed = useMemo(() => [...questions].sort(() => Math.random() - 0.5), []);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState('');
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const item = mixed[index];
  const isCorrect = selected === item.answer;

  const choose = (choice: string) => {
    if (selected) return;
    setSelected(choice);
    if (choice === item.answer) setScore(score + 1);
  };

  const next = () => {
    if (index === mixed.length - 1) setFinished(true);
    else { setIndex(index + 1); setSelected(''); }
  };

  const replay = () => {
    setIndex(0); setScore(0); setSelected(''); setFinished(false);
  };

  if (finished) return <View style={styles.screen}>
    <View style={styles.ambientTop} /><View style={styles.ambientBottom} />
    <View style={styles.resultCard}>
      <View style={styles.resultIcon}><Ionicons name="trophy" size={45} color="#8423D9" /></View>
      <Text style={styles.eyebrow}>REVIEW COMPLETE</Text><Text style={styles.resultTitle}>Picture-perfect practice!</Text>
      <View style={styles.scorePanel}><Text style={styles.scoreLabel}>YOUR SCORE</Text><Text style={styles.score}>{score} / {mixed.length}</Text></View>
      <Text style={styles.resultCopy}>You reviewed words from People, Professions, and Everyday Places & Objects.</Text>
      <Pressable style={styles.primaryButton} onPress={() => router.replace('/WordsMenu')}><Text style={styles.primaryText}>Back to collections</Text><Ionicons name="arrow-forward" size={19} color="#FFF" /></Pressable>
      <Pressable style={styles.replayButton} onPress={replay}><Text style={styles.replayText}>Practice again</Text></Pressable>
    </View>
  </View>;

  return <View style={styles.screen}>
    <View style={styles.ambientTop} /><View style={styles.ambientBottom} />
    <View style={styles.topRow}>
      <Pressable style={styles.backButton} onPress={() => router.back()}><Ionicons name="arrow-back" size={23} color="#552E68" /></Pressable>
      <View style={styles.headerCopy}><Text style={styles.topEyebrow}>WORDS CHECKPOINT</Text><Text style={styles.topLabel}>Picture Mix Review</Text></View>
      <View style={styles.countPill}><Text style={styles.topCount}>{index + 1} / {mixed.length}</Text></View>
    </View>
    <View style={styles.progress}><View style={[styles.progressFill, { width: `${((index + 1) / mixed.length) * 100}%` }]} /></View>
    <View style={styles.quizCard}>
      <View style={styles.questionHead}><View style={styles.questionTag}><Ionicons name="images-outline" size={14} color="#8423D9" /><Text style={styles.questionTagText}>VISUAL RECALL</Text></View><Text style={styles.prompt}>Which Japanese word matches this picture?</Text></View>
      <View style={styles.imageStage}><Image source={item.image} style={styles.image} /></View>
      <View style={styles.hintRow}><Text style={styles.hintLabel}>English clue</Text><Ionicons name="arrow-forward" size={13} color="#8B7E90" /><Text style={styles.hint}>{item.meaning}</Text></View>
      <View style={styles.choices}>{item.choices.map(choice => {
        const correct = Boolean(selected) && choice === item.answer;
        const wrong = selected === choice && choice !== item.answer;
        return <Pressable key={choice} style={[styles.choice, correct && styles.correct, wrong && styles.wrong]} onPress={() => choose(choice)}><Text style={[styles.choiceText, (correct || wrong) && styles.selectedText]}>{choice}</Text>{correct && <Ionicons name="checkmark-circle" size={21} color="#FFF" />}{wrong && <Ionicons name="close-circle" size={21} color="#FFF" />}</Pressable>;
      })}</View>
      {selected ? <><View style={[styles.feedback, isCorrect ? styles.feedbackCorrect : styles.feedbackWrong]}><Ionicons name={isCorrect ? 'sparkles' : 'information-circle'} size={18} color={isCorrect ? '#4C9929' : '#C34F66'} /><Text style={[styles.feedbackText, isCorrect ? styles.feedbackTextCorrect : styles.feedbackTextWrong]}>{isCorrect ? 'Great recall! That is the correct word.' : `The correct answer is ${item.answer}.`}</Text></View><Pressable style={styles.primaryButton} onPress={next}><Text style={styles.primaryText}>{index === mixed.length - 1 ? 'See results' : 'Next picture'}</Text><Ionicons name="arrow-forward" size={19} color="#FFF" /></Pressable></> : <Text style={styles.helper}>Choose one Japanese word to continue.</Text>}
    </View>
  </View>;
}
