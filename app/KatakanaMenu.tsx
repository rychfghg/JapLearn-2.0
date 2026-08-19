import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useContext, useState } from 'react';
import { Image, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import expoconfig from '../expoconfig';
import styles from '../styles/stylesKanaJourney';

type Progress = {
  hiragana1: boolean; hiragana2: boolean; hiragana3: boolean;
  katakana1: boolean; katakana2: boolean; katakana3: boolean; badge1: boolean;
};

const lessons = [
  { title: 'Katakana Basics 1', subtitle: 'Vowels, K, and S sounds', route: '/KatakanaSet1', key: 'katakana1', character: 'ア' },
  { title: 'Katakana Basics 2', subtitle: 'T, N, H, and M sounds', route: '/KatakanaSet2', key: 'katakana2', character: 'タ' },
  { title: 'Katakana Basics 3', subtitle: 'Y, R, W, and final sounds', route: '/KatakanaSet3', key: 'katakana3', character: 'ヤ' },
] as const;

export default function KatakanaMenu() {
  const router = useRouter();
  const { fromExercise } = useLocalSearchParams();
  const { user } = useContext(AuthContext);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [showIntroduction, setShowIntroduction] = useState(false);
  const [showBadge, setShowBadge] = useState(false);

  const loadProgress = useCallback(async () => {
    if (!user?.email) return;
    try {
      const response = await fetch(`${expoconfig.API_URL}/api/progress/${encodeURIComponent(user.email)}`);
      if (!response.ok) throw new Error('Could not load Katakana progress.');
      const data: Progress = await response.json();
      setProgress(data);
      if (!data.katakana1) setShowIntroduction(true);

      const kanaComplete = data.hiragana1 && data.hiragana2 && data.hiragana3 && data.katakana1 && data.katakana2 && data.katakana3;
      if (fromExercise === 'true' && kanaComplete && !data.badge1) {
        setShowBadge(true);
        await fetch(`${expoconfig.API_URL}/api/progress/${encodeURIComponent(user.email)}/updateField?field=badge1&value=true`, { method: 'PUT' });
      }
    } catch (error) {
      console.error('Could not load Katakana progress:', error);
    }
  }, [fromExercise, user?.email]);

  useFocusEffect(useCallback(() => { loadProgress(); }, [loadProgress]));

  const isUnlocked = (index: number) => index === 0 || (index === 1 ? Boolean(progress?.katakana1) : Boolean(progress?.katakana2));
  const completedCount = [progress?.katakana1, progress?.katakana2, progress?.katakana3].filter(Boolean).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={[styles.heroCircle, localStyles.heroCircle]} />
          <View style={styles.topRow}><Pressable style={styles.backButton} onPress={() => router.push('/KanaMenu')}><Ionicons name="arrow-back" size={21} color="#4B2B59" /></Pressable><Text style={styles.wordmark}>KATAKANA JOURNEY</Text></View>
          <View style={styles.heroCopy}><Text style={styles.eyebrow}>カタカナ · KATAKANA</Text><Text style={styles.title}>Read the language of modern Japan</Text><Text style={styles.subtitle}>Complete each character set and its practice quest to unlock the next.</Text></View>
          <Image source={require('../assets/hello.png')} style={styles.mascot} resizeMode="contain" />
        </View>
        <View style={styles.body}>
          <View style={styles.sectionRow}><View><Text style={styles.sectionTitle}>Your Katakana map</Text><Text style={styles.sectionSubtitle}>Progress is saved after every exercise.</Text></View><Text style={styles.count}>{completedCount} / 3</Text></View>
          {lessons.map((lesson, index) => {
            const unlocked = isUnlocked(index);
            const completed = Boolean(progress?.[lesson.key]);
            return <Pressable key={lesson.key} disabled={!unlocked} style={[styles.card, !unlocked && styles.cardLocked]} onPress={() => router.push(lesson.route)}><View style={[styles.icon, localStyles.katakanaIcon]}><Text style={localStyles.character}>{lesson.character}</Text></View><View style={styles.cardCopy}><Text style={styles.cardLabel}>{completed ? 'COMPLETED · REPLAY ANYTIME' : unlocked ? index === 0 ? 'START HERE' : 'UNLOCKED' : 'LOCKED MILESTONE'}</Text><Text style={styles.cardTitle}>{lesson.title}</Text><Text style={styles.cardText}>{completed ? `${lesson.subtitle} · Tap to practice again` : lesson.subtitle}</Text></View><View style={[styles.action, completed && styles.actionDone]}><Ionicons name={completed ? 'refresh' : unlocked ? 'arrow-forward' : 'lock-closed'} size={20} color="#FFFFFF" /></View></Pressable>;
          })}
        </View>
      </ScrollView>

      <Modal visible={showIntroduction} transparent animationType="slide" statusBarTranslucent>
        <View style={localStyles.modalBackdrop}><View style={localStyles.modalCard}>
          <View style={localStyles.modalTop}><View style={localStyles.modalCharacter}><Text style={localStyles.modalCharacterText}>カ</Text></View><View style={localStyles.modalTag}><Text style={localStyles.modalTagText}>KATAKANA PATH</Text></View></View>
          <Text style={localStyles.modalTitle}>Welcome to Katakana</Text>
          <Text style={localStyles.modalLead}>The script you see across modern Japanese life.</Text>
          <View style={localStyles.useList}>
            <View style={localStyles.useItem}><Ionicons name="earth-outline" size={20} color="#8423D9" /><View><Text style={localStyles.useTitle}>Foreign words</Text><Text style={localStyles.useText}>Recognize words such as コーヒー and テレビ.</Text></View></View>
            <View style={localStyles.useItem}><Ionicons name="restaurant-outline" size={20} color="#65A936" /><View><Text style={localStyles.useTitle}>Daily Japanese</Text><Text style={localStyles.useText}>Read menus, brands, names, and advertisements.</Text></View></View>
            <View style={localStyles.useItem}><Ionicons name="volume-high-outline" size={20} color="#D98728" /><View><Text style={localStyles.useTitle}>Sounds and expression</Text><Text style={localStyles.useText}>Understand emphasis and Japanese sound words.</Text></View></View>
          </View>
          <View style={localStyles.modalNote}><Text>46 characters · 3 guided sets · 3 practice quests</Text></View>
          <Pressable style={localStyles.modalButton} onPress={() => setShowIntroduction(false)}><Text style={localStyles.modalButtonText}>Start Katakana Basics 1</Text><Ionicons name="arrow-forward" size={19} color="#FFFFFF" /></Pressable>
        </View></View>
      </Modal>

      <Modal visible={showBadge} transparent animationType="fade" statusBarTranslucent>
        <View style={localStyles.modalBackdrop}><View style={localStyles.badgeCard}><Image source={require('../assets/kana_badge.png')} style={localStyles.badgeImage} resizeMode="contain" /><Text style={localStyles.badgeEyebrow}>KANA MILESTONE COMPLETE</Text><Text style={localStyles.modalTitle}>You mastered both scripts!</Text><Text style={localStyles.modalLead}>Your Kana badge is now part of your JapLearn progress.</Text><Pressable style={localStyles.modalButton} onPress={() => setShowBadge(false)}><Text style={localStyles.modalButtonText}>Continue learning</Text></Pressable></View></View>
      </Modal>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  heroCircle: { backgroundColor: '#E7F3DE' },
  katakanaIcon: { backgroundColor: '#EAF5E2' },
  character: { color: '#5EAA34', fontSize: 28, fontFamily: 'Jua' },
  modalBackdrop: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: 'rgba(39,20,48,0.68)' },
  modalCard: { maxHeight: '88%', padding: 26, borderRadius: 30, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E7DCEC' },
  modalTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalCharacter: { width: 62, height: 62, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EAF5E2' },
  modalCharacterText: { color: '#5EAA34', fontFamily: 'Jua', fontSize: 30 },
  modalTag: { paddingHorizontal: 11, paddingVertical: 7, borderRadius: 999, backgroundColor: '#F1E7FA' },
  modalTagText: { color: '#7627CA', fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  modalTitle: { marginTop: 18, color: '#40244C', fontFamily: 'Jua', fontSize: 28, fontWeight: '400' },
  modalLead: { marginTop: 7, color: '#7D7082', fontSize: 13, lineHeight: 20 },
  useList: { marginTop: 20, gap: 10 },
  useItem: { minHeight: 68, padding: 13, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FAF7FC', borderWidth: 1, borderColor: '#EEE6F1' },
  useTitle: { color: '#4A3154', fontSize: 12, fontWeight: '800' },
  useText: { maxWidth: 270, marginTop: 3, color: '#8A7D90', fontSize: 10, lineHeight: 15 },
  modalNote: { marginTop: 17, padding: 12, borderRadius: 14, backgroundColor: '#F2F8ED', alignItems: 'center' },
  modalButton: { minHeight: 54, marginTop: 18, paddingHorizontal: 18, borderRadius: 17, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#8423D9' },
  modalButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  badgeCard: { padding: 28, borderRadius: 30, alignItems: 'center', backgroundColor: '#FFFFFF' },
  badgeImage: { width: 135, height: 135 },
  badgeEyebrow: { marginTop: 12, color: '#65A936', fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
});
