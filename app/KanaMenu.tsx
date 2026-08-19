import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useContext, useState } from 'react';
import { Image, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import expoconfig from '../expoconfig';
import styles from '../styles/stylesKanaJourney';

export default function KanaMenu() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const [hiraganaComplete, setHiraganaComplete] = useState(false);

  useFocusEffect(useCallback(() => {
    if (!user?.email) return;
    fetch(`${expoconfig.API_URL}/api/progress/${encodeURIComponent(user.email)}`)
      .then((response) => response.ok ? response.json() : null)
      .then((progress) => setHiraganaComplete(Boolean(progress?.hiragana1 && progress?.hiragana2 && progress?.hiragana3)))
      .catch(() => setHiraganaComplete(false));
  }, [user?.email]));

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroCircle} />
          <View style={styles.topRow}>
            <Pressable style={styles.backButton} onPress={() => router.push('/LearnMenu')}><Ionicons name="arrow-back" size={21} color="#4B2B59" /></Pressable>
            <Text style={styles.wordmark}>JAPLEARN · KANA PATH</Text>
          </View>
          <View style={styles.heroCopy}><Text style={styles.eyebrow}>FIRST MILESTONE</Text><Text style={styles.title}>Master the Japanese scripts</Text><Text style={styles.subtitle}>Begin with Hiragana, then unlock Katakana.</Text></View>
          <Image source={require('../assets/hello.png')} style={styles.mascot} resizeMode="contain" />
        </View>
        <View style={styles.body}>
          <View style={styles.sectionRow}><View><Text style={styles.sectionTitle}>Choose a script</Text><Text style={styles.sectionSubtitle}>Complete each journey in order.</Text></View><Text style={styles.count}>2 PATHS</Text></View>
          <Pressable style={styles.card} onPress={() => router.push('/HiraganaMenu')}><View style={styles.icon}><Text style={{ fontSize: 28, color: '#8423D9', fontWeight: '900' }}>あ</Text></View><View style={styles.cardCopy}><Text style={styles.cardLabel}>{hiraganaComplete ? 'COMPLETED · REPLAY ANYTIME' : 'START HERE'}</Text><Text style={styles.cardTitle}>Hiragana</Text><Text style={styles.cardText}>{hiraganaComplete ? 'Completed · Tap to practice again' : 'Learn the foundation of Japanese reading.'}</Text></View><View style={[styles.action, hiraganaComplete && styles.actionDone]}><Ionicons name={hiraganaComplete ? 'refresh' : 'arrow-forward'} size={20} color="#FFF" /></View></Pressable>
          <Pressable disabled={!hiraganaComplete} style={[styles.card, !hiraganaComplete && styles.cardLocked]} onPress={() => router.push('/KatakanaMenu')}><View style={[styles.icon, styles.iconGreen]}><Text style={{ fontSize: 28, color: '#65AD38', fontWeight: '900' }}>カ</Text></View><View style={styles.cardCopy}><Text style={styles.cardLabel}>{hiraganaComplete ? 'UNLOCKED' : 'COMPLETE HIRAGANA FIRST'}</Text><Text style={styles.cardTitle}>Katakana</Text><Text style={styles.cardText}>Read loanwords, names, and modern terms.</Text></View><View style={[styles.action, hiraganaComplete && styles.actionDone]}><Ionicons name={hiraganaComplete ? 'arrow-forward' : 'lock-closed'} size={19} color="#FFF" /></View></Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
