import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Text, View } from 'react-native';
import { styles } from '../styles/stylesCharacterExercise';

type Props = {
  currentRound: number;
  totalRounds: number;
  previewing: boolean;
};

export default function ExerciseGameHeader({ currentRound, totalRounds, previewing }: Props) {
  return (
    <LinearGradient colors={['#7023C4', '#922CE3']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gameHero}>
      <Text style={[styles.heroKana, styles.heroKanaLeft]}>あ</Text>
      <Text style={[styles.heroKana, styles.heroKanaRight]}>記</Text>
      <View style={styles.gameHeroTop}>
        <View style={styles.gameModePill}><Ionicons name="sparkles" size={13} color="#FFFFFF" /><Text style={styles.gameModeText}>KANA MEMORY QUEST</Text></View>
        <View style={styles.roundPill}><Text style={styles.roundPillText}>ROUND {currentRound} / {totalRounds}</Text></View>
      </View>
      <Text style={styles.gameHeroTitle}>{previewing ? 'Study the cards' : 'Find the right character'}</Text>
      <Text style={styles.gameHeroText}>{previewing ? 'You have five seconds to remember every position.' : 'Match the requested romaji with its Japanese character.'}</Text>
      <View style={styles.roundDots}>{Array.from({ length: totalRounds }).map((_, index) => <View key={index} style={[styles.roundDot, index < currentRound && styles.roundDotActive]} />)}</View>
    </LinearGradient>
  );
}
