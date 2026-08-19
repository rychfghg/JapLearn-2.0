import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

interface CompletionModalProps {
  isVisible: boolean;
  onComplete: () => void;
  message: string;
}

export default function CompletionModal({ isVisible, onComplete, message }: CompletionModalProps) {
  return (
    <Modal transparent visible={isVisible} animationType="fade" statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.confettiRow}><Text>✦</Text><Text>•</Text><Text>✦</Text></View>
          <View style={styles.icon}><Ionicons name="checkmark" size={34} color="#FFFFFF" /></View>
          <Text style={styles.eyebrow}>LESSON COMPLETE</Text>
          <Text style={styles.title}>Excellent work!</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.note}><Ionicons name="game-controller-outline" size={18} color="#6CAB3C" /><Text style={styles.noteText}>Next, complete the practice activity to save this milestone and unlock the next lesson.</Text></View>
          <Pressable style={({ pressed }) => [styles.button, pressed && styles.pressed]} onPress={onComplete}>
            <Text style={styles.buttonText}>Continue to practice</Text>
            <Ionicons name="arrow-forward" size={19} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: 'rgba(42, 22, 51, 0.68)' },
  card: { width: '100%', maxWidth: 430, padding: 27, borderRadius: 30, alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E8DEED', shadowColor: '#2F1839', shadowOpacity: 0.24, shadowRadius: 28, elevation: 12 },
  confettiRow: { width: '62%', position: 'absolute', top: 25, flexDirection: 'row', justifyContent: 'space-between' },
  icon: { width: 72, height: 72, marginTop: 5, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: '#72BE3E', shadowColor: '#72BE3E', shadowOpacity: 0.25, shadowRadius: 14, elevation: 5 },
  eyebrow: { marginTop: 20, color: '#78BE43', fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  title: { marginTop: 7, color: '#40244C', fontFamily: 'Jua', fontSize: 28 },
  message: { marginTop: 10, color: '#7B6E81', fontSize: 13, lineHeight: 20, textAlign: 'center' },
  note: { width: '100%', marginTop: 20, padding: 14, borderRadius: 16, flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: '#F2F8ED' },
  noteText: { flex: 1, color: '#607052', fontSize: 11, lineHeight: 17 },
  button: { width: '100%', height: 54, marginTop: 20, paddingHorizontal: 20, borderRadius: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, backgroundColor: '#8423D9' },
  buttonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  pressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
});
