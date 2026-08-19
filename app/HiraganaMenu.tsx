import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useContext, useState } from 'react';
import { Image, Modal, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import expoconfig from '../expoconfig';
import styles from '../styles/stylesKanaJourney';

type Progress = { basics1: boolean; basics2: boolean; basics3: boolean };

const lessons = [
  { title: 'Hiragana Basics 1', subtitle: 'Vowels, K, and S sounds', route: '/HiraganaSet1', key: 'basics1', character: 'あ' },
  { title: 'Hiragana Basics 2', subtitle: 'T, N, H, and M sounds', route: '/HiraganaSet2', key: 'basics2', character: 'た' },
  { title: 'Hiragana Basics 3', subtitle: 'Y, R, W, and final sounds', route: '/HiraganaSet3', key: 'basics3', character: 'や' },
] as const;

export default function HiraganaMenu() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const [progress, setProgress] = useState<Progress>({ basics1: false, basics2: false, basics3: false });
  const [showIntroduction, setShowIntroduction] = useState(false);

  useFocusEffect(useCallback(() => {
    if (!user?.email) return;
    fetch(`${expoconfig.API_URL}/api/progress/${encodeURIComponent(user.email)}`)
      .then(async (response) => {
        if (response.status === 404) {
          const created = await fetch(`${expoconfig.API_URL}/api/progress/${encodeURIComponent(user.email)}`, { method: 'POST' });
          return created.json();
        }
        return response.json();
      })
      .then((data) => {
        const next = { basics1: Boolean(data.hiragana1), basics2: Boolean(data.hiragana2), basics3: Boolean(data.hiragana3) };
        setProgress(next);
        if (!next.basics1) setShowIntroduction(true);
      })
      .catch((error) => console.error('Could not load Hiragana progress:', error));
  }, [user?.email]));

  const isUnlocked = (index: number) => index === 0 || (index === 1 ? progress.basics1 : progress.basics2);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroCircle} />
          <View style={styles.topRow}><Pressable style={styles.backButton} onPress={() => router.push('/KanaMenu')}><Ionicons name="arrow-back" size={21} color="#4B2B59" /></Pressable><Text style={styles.wordmark}>HIRAGANA JOURNEY</Text></View>
          <View style={styles.heroCopy}><Text style={styles.eyebrow}>ひらがな · HIRAGANA</Text><Text style={styles.title}>Build your reading foundation</Text><Text style={styles.subtitle}>Learn a set, complete its exercise, and unlock the next.</Text></View>
          <Image source={require('../assets/idle.png')} style={styles.mascot} resizeMode="contain" />
        </View>
        <View style={styles.body}>
          <View style={styles.sectionRow}><View><Text style={styles.sectionTitle}>Your learning map</Text><Text style={styles.sectionSubtitle}>Progress is saved to your account.</Text></View><Text style={styles.count}>{Object.values(progress).filter(Boolean).length} / 3</Text></View>
          {lessons.map((lesson, index) => {
            const unlocked = isUnlocked(index);
            const completed = progress[lesson.key];
            return <Pressable key={lesson.key} disabled={!unlocked} style={[styles.card, !unlocked && styles.cardLocked]} onPress={() => router.push(lesson.route)}><View style={styles.icon}><Text style={{ fontSize: 28, color: '#8423D9', fontWeight: '900' }}>{lesson.character}</Text></View><View style={styles.cardCopy}><Text style={styles.cardLabel}>{completed ? 'COMPLETED · REPLAY ANYTIME' : unlocked ? index === 0 ? 'START HERE' : 'UNLOCKED' : 'LOCKED MILESTONE'}</Text><Text style={styles.cardTitle}>{lesson.title}</Text><Text style={styles.cardText}>{completed ? `${lesson.subtitle} · Tap to practice again` : lesson.subtitle}</Text></View><View style={[styles.action, completed && styles.actionDone]}><Ionicons name={completed ? 'refresh' : unlocked ? 'arrow-forward' : 'lock-closed'} size={20} color="#FFF" /></View></Pressable>;
          })}
        </View>
      </ScrollView>
      <Modal visible={showIntroduction} transparent animationType="slide"><View style={styles.modalBackdrop}><View style={styles.modalCard}><View style={styles.modalIcon}><Text style={{ fontSize: 28, color: '#8423D9' }}>あ</Text></View><Text style={styles.modalTitle}>Welcome to Hiragana</Text><Text style={styles.modalText}>Hiragana is the foundation of Japanese reading and writing. Each character represents a sound. You will learn the characters in three guided sets, then prove your learning through a matching exercise before the next set unlocks.</Text><Pressable style={styles.modalButton} onPress={() => setShowIntroduction(false)}><Text style={styles.modalButtonText}>Begin the journey</Text></Pressable></View></View></Modal>
    </SafeAreaView>
  );
}
