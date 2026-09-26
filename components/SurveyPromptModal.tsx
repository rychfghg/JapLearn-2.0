import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  Linking,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SURVEY_URL } from '../services/surveyPrompt';

const uiFont = Platform.select({ android: 'sans-serif', ios: 'System', web: 'Inter, system-ui, sans-serif' });
const uiFontMedium = Platform.select({ android: 'sans-serif-medium', ios: 'System', web: 'Inter, system-ui, sans-serif' });

type Props = { visible: boolean; onClose: () => void };

const ASKS: { icon: React.ComponentProps<typeof Ionicons>['name']; title: string; text: string; tint: string; color: string }[] = [
  { icon: 'heart-outline', title: 'What you liked', text: 'The lessons, games or features you enjoy', tint: '#FCEAF3', color: '#C2477E' },
  { icon: 'bulb-outline', title: 'Your recommendations', text: 'What would make JapLearn better for you', tint: '#FDF1E1', color: '#C27A1A' },
  { icon: 'bug-outline', title: 'Bugs or problems', text: 'Anything that broke, froze or felt confusing', tint: '#E9F0FC', color: '#3A72C4' },
];

/**
 * Capstone feedback request shown on the student home screen.
 * When to show it is decided by services/surveyPrompt.
 */
export default function SurveyPromptModal({ visible, onClose }: Props) {
  const scale = useRef(new Animated.Value(0.88)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    scale.setValue(0.88);
    fade.setValue(0);
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 7, tension: 70, useNativeDriver: true }),
      Animated.timing(fade, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();

    // A gentle bob for the mascot while the card is open.
    const bob = Animated.loop(Animated.sequence([
      Animated.timing(float, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(float, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    bob.start();
    return () => bob.stop();
  }, [visible, scale, fade, float]);

  const openSurvey = async () => {
    try {
      await Linking.openURL(SURVEY_URL);
    } finally {
      onClose();
    }
  };

  const mascotY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -7] });

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <Animated.View style={[styles.backdrop, { opacity: fade }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close survey" />

        <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
          {/* Illustrated header */}
          <LinearGradient colors={['#4A1668', '#7B26CE', '#A24DEB']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
            <View style={styles.blobLarge} />
            <View style={styles.blobSmall} />
            <Text style={styles.kana} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">声</Text>

            <View style={styles.tag}>
              <Ionicons name="school" size={12} color="#4A1668" />
              <Text style={styles.tagText}>CAPSTONE PROJECT</Text>
            </View>

            <Animated.View style={[styles.mascotShell, { transform: [{ translateY: mascotY }] }]}>
              <Image source={require('../assets/hello.png')} style={styles.mascot} resizeMode="contain" />
            </Animated.View>

            <View style={styles.bubble}>
              <Text style={styles.bubbleText}>We&apos;d love your help!</Text>
            </View>
          </LinearGradient>

          <Pressable onPress={onClose} style={styles.close} hitSlop={10} accessibilityRole="button" accessibilityLabel="Close">
            <Ionicons name="close" size={19} color="#FFFFFF" />
          </Pressable>

          {/* Body */}
          <View style={styles.body}>
            <Text style={styles.title}>Help shape JapLearn</Text>
            <Text style={styles.lead}>
              JapLearn is our capstone project. A few minutes of your honest feedback helps us improve it for every learner.
            </Text>

            <View style={styles.asks}>
              {ASKS.map((ask) => (
                <View key={ask.title} style={styles.ask}>
                  <View style={[styles.askIcon, { backgroundColor: ask.tint }]}>
                    <Ionicons name={ask.icon} size={17} color={ask.color} />
                  </View>
                  <View style={styles.askCopy}>
                    <Text style={styles.askTitle}>{ask.title}</Text>
                    <Text style={styles.askText}>{ask.text}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.meta}>
              <View style={styles.metaItem}><Ionicons name="time-outline" size={14} color="#8A7D90" /><Text style={styles.metaText}>About 3 minutes</Text></View>
              <View style={styles.metaDot} />
              <View style={styles.metaItem}><Ionicons name="logo-google" size={13} color="#8A7D90" /><Text style={styles.metaText}>Google Form</Text></View>
            </View>

            <Pressable onPress={openSurvey} accessibilityRole="link" style={({ pressed }) => [styles.primary, pressed && styles.pressed]}>
              <Text style={styles.primaryText}>Take the survey</Text>
              <View style={styles.primaryArrow}><Ionicons name="arrow-forward" size={16} color="#7B26CE" /></View>
            </Pressable>

            <Pressable onPress={onClose} accessibilityRole="button" style={({ pressed }) => [styles.later, pressed && styles.pressed]}>
              <Text style={styles.laterText}>Maybe later</Text>
            </Pressable>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: 'rgba(28,14,38,0.62)' },
  card: {
    width: '100%', maxWidth: 400, borderRadius: 30, backgroundColor: '#FFFFFF', overflow: 'hidden',
    shadowColor: '#1E0B2B', shadowOpacity: 0.3, shadowRadius: 30, shadowOffset: { width: 0, height: 14 }, elevation: 18,
  },

  hero: { height: 168, alignItems: 'center', justifyContent: 'flex-end', overflow: 'hidden' },
  blobLarge: { position: 'absolute', width: 230, height: 230, borderRadius: 115, backgroundColor: 'rgba(255,255,255,0.09)', top: -90, right: -70 },
  blobSmall: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(200,240,168,0.14)', bottom: -46, left: -30 },
  kana: { position: 'absolute', left: 18, top: 42, fontSize: 64, color: 'rgba(255,255,255,0.1)', fontWeight: '900' },
  tag: {
    position: 'absolute', top: 16, left: 16, flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: '#C8F0A8',
  },
  tagText: { fontFamily: uiFontMedium, fontSize: 9.5, fontWeight: '800', letterSpacing: 1, color: '#4A1668' },
  mascotShell: { marginBottom: -6 },
  mascot: { width: 132, height: 132 },
  bubble: {
    position: 'absolute', right: 22, top: 58, paddingHorizontal: 11, paddingVertical: 7,
    borderRadius: 14, borderBottomLeftRadius: 4, backgroundColor: '#FFFFFF',
  },
  bubbleText: { fontFamily: 'Jua', fontSize: 12.5, color: '#4A1668' },
  close: {
    position: 'absolute', top: 14, right: 14, width: 34, height: 34, borderRadius: 17,
    alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.2)',
  },

  body: { paddingHorizontal: 22, paddingTop: 20, paddingBottom: 18 },
  title: { fontFamily: 'Jua', fontSize: 25, lineHeight: 31, color: '#2F1A3A', textAlign: 'center' },
  lead: { fontFamily: uiFont, fontSize: 13.5, lineHeight: 20, color: '#6E6174', textAlign: 'center', marginTop: 6 },

  asks: { marginTop: 16, gap: 8 },
  ask: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 10, borderRadius: 16, backgroundColor: '#FAF7FC', borderWidth: 1, borderColor: '#F0E9F4' },
  askIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  askCopy: { flex: 1 },
  askTitle: { fontFamily: uiFontMedium, fontSize: 13.5, fontWeight: '700', color: '#2F1A3A' },
  askText: { fontFamily: uiFont, fontSize: 11.5, color: '#8A7D90', marginTop: 1 },

  meta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, marginTop: 14 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontFamily: uiFont, fontSize: 12, color: '#8A7D90' },
  metaDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#D6CCDD' },

  primary: {
    height: 54, marginTop: 14, borderRadius: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#7B26CE', borderBottomWidth: 4, borderBottomColor: '#5E1AA3',
  },
  primaryText: { fontFamily: 'Jua', fontSize: 17, color: '#FFFFFF' },
  primaryArrow: {
    position: 'absolute', right: 9, width: 34, height: 34, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF',
  },
  later: { height: 44, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  laterText: { fontFamily: uiFontMedium, fontSize: 13.5, fontWeight: '700', color: '#7B6A86' },
  pressed: { opacity: 0.85 },
});
