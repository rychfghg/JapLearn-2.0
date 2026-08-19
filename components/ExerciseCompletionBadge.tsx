import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import expoconfig from '../expoconfig';
import { styles } from '../styles/stylesCharacterExercise';

type Props = {
  email?: string;
  field: 'hiragana1' | 'hiragana2' | 'hiragana3' | 'katakana1' | 'katakana2' | 'katakana3';
};

export default function ExerciseCompletionBadge({ email, field }: Props) {
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!email) return;
    fetch(`${expoconfig.API_URL}/api/progress/${encodeURIComponent(email)}`)
      .then((response) => response.ok ? response.json() : null)
      .then((progress) => setCompleted(Boolean(progress?.[field])))
      .catch(() => setCompleted(false));
  }, [email, field]);

  if (!completed) return null;

  return (
    <View style={styles.completedBadge}>
      <Ionicons name="checkmark-circle" size={17} color="#64AA37" />
      <View>
        <Text style={styles.completedBadgeTitle}>COMPLETED BEFORE</Text>
        <Text style={styles.completedBadgeText}>Replay available anytime</Text>
      </View>
    </View>
  );
}
