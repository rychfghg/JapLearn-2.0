import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { styles } from '../styles/stylesCharacterExercise';

type Props = { onDone: () => void };

export default function ExerciseCompletePanel({ onDone }: Props) {
  return (
    <View style={styles.completionOverlay}>
      <View style={styles.completionCard}>
        <Text style={[styles.completionSpark, styles.sparkLeft]}>✦</Text>
        <Text style={[styles.completionSpark, styles.sparkRight]}>✦</Text>
        <View style={styles.completionIconRing}>
          <View style={styles.completionIcon}><Ionicons name="trophy" size={30} color="#FFFFFF" /></View>
        </View>
        <Text style={styles.completionEyebrow}>MEMORY QUEST COMPLETE</Text>
        <Text style={styles.completionTitle}>Excellent work!</Text>
        <Text style={styles.completionText}>You matched every character and finished this practice round.</Text>
        <View style={styles.completionSaved}><Ionicons name="cloud-done-outline" size={18} color="#62A936" /><Text style={styles.completionSavedText}>Your lesson progress will be saved to your account.</Text></View>
        <Pressable style={({ pressed }) => [styles.completionButton, pressed && styles.completionButtonPressed]} onPress={onDone}>
          <Text style={styles.completionButtonText}>Finish exercise</Text>
          <Ionicons name="arrow-forward" size={19} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}
