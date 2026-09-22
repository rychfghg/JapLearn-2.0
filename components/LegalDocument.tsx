import React, { useState } from 'react';
import {
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const uiFont = Platform.select({ android: 'sans-serif', ios: 'System', web: 'Inter, system-ui, sans-serif' });
const uiFontMedium = Platform.select({ android: 'sans-serif-medium', ios: 'System', web: 'Inter, system-ui, sans-serif' });

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export type LegalSection = { icon: IconName; title: string; body: string };
export type LegalHighlight = { icon: IconName; title: string; text: string };

type Props = {
  kind: 'privacy' | 'terms';
  eyebrow: string;
  title: string;
  intro: string;
  effective: string;
  highlights: LegalHighlight[];
  sections: LegalSection[];
  contactTitle: string;
  contactSubject: string;
  doneLabel: string;
  onClose: () => void;
  onSwitch: (kind: 'privacy' | 'terms') => void;
};

// A plain, document-style screen: white page, simple top bar, readable text.
export default function LegalDocument({
  kind,
  title,
  intro,
  effective,
  highlights,
  sections,
  contactSubject,
  doneLabel,
  onClose,
  onSwitch,
}: Props) {
  const { width } = useWindowDimensions();
  const isWide = width >= 820;
  const [scrolled, setScrolled] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.topBar, scrolled && styles.topBarScrolled]}>
        <Pressable onPress={onClose} hitSlop={10} accessibilityRole="button" accessibilityLabel="Go back" style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#1F1A24" />
        </Pressable>
        <Text style={[styles.topTitle, !scrolled && styles.topTitleHidden]} numberOfLines={1}>{title}</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, isWide && styles.contentWide]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={32}
        onScroll={(event) => setScrolled(event.nativeEvent.contentOffset.y > 56)}
      >
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.updated}>{effective}</Text>

        <View style={styles.segment} accessibilityRole="tablist">
          {(['privacy', 'terms'] as const).map((tab) => {
            const active = tab === kind;
            return (
              <Pressable
                key={tab}
                onPress={() => !active && onSwitch(tab)}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                style={[styles.segmentItem, active && styles.segmentItemActive]}
              >
                <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                  {tab === 'privacy' ? 'Privacy Policy' : 'Terms of Use'}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.intro}>{intro}</Text>

        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>In short</Text>
          {highlights.map((item) => (
            <View key={item.title} style={styles.summaryRow}>
              <Ionicons name="checkmark" size={16} color="#7B26CE" style={styles.summaryCheck} />
              <Text style={styles.summaryText}>
                <Text style={styles.summaryStrong}>{item.title}. </Text>
                {item.text}
              </Text>
            </View>
          ))}
        </View>

        {sections.map((section, index) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{index + 1}. {section.title}</Text>
            <Text style={styles.sectionBody}>{section.body}</Text>
          </View>
        ))}

        <View style={styles.divider} />

        <Text style={styles.contact}>
          Questions? Email{' '}
          <Text
            style={styles.link}
            onPress={() => Linking.openURL(`mailto:japlearnofficial@gmail.com?subject=${encodeURIComponent(contactSubject)}`)}
            accessibilityRole="link"
          >
            japlearnofficial@gmail.com
          </Text>
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable onPress={onClose} accessibilityRole="button" style={({ pressed }) => [styles.doneButton, pressed && styles.donePressed]}>
          <Text style={styles.doneText}>{doneLabel}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },

  topBar: {
    height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 8, backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'transparent',
  },
  topBarScrolled: { borderBottomColor: '#E6E2EA' },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  topTitle: { flex: 1, textAlign: 'center', fontFamily: uiFontMedium, fontSize: 16, fontWeight: '600', color: '#1F1A24' },
  topTitleHidden: { opacity: 0 },

  content: { paddingHorizontal: 22, paddingTop: 4, paddingBottom: 32 },
  contentWide: { alignSelf: 'center', width: '100%', maxWidth: 680 },

  title: { fontFamily: uiFont, fontSize: 30, lineHeight: 36, fontWeight: '700', color: '#1F1A24', letterSpacing: -0.4 },
  updated: { fontFamily: uiFont, fontSize: 13, color: '#8A8290', marginTop: 6 },

  segment: { flexDirection: 'row', marginTop: 20, padding: 3, borderRadius: 11, backgroundColor: '#F2F0F4' },
  segmentItem: { flex: 1, paddingVertical: 8, borderRadius: 9, alignItems: 'center' },
  segmentItemActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  segmentText: { fontFamily: uiFontMedium, fontSize: 13.5, fontWeight: '600', color: '#6E6674' },
  segmentTextActive: { color: '#1F1A24' },

  intro: { fontFamily: uiFont, fontSize: 15.5, lineHeight: 24, color: '#4A4350', marginTop: 22 },

  summary: { marginTop: 20, paddingVertical: 16, paddingHorizontal: 16, borderRadius: 14, backgroundColor: '#F8F6FA' },
  summaryTitle: { fontFamily: uiFontMedium, fontSize: 14, fontWeight: '600', color: '#1F1A24', marginBottom: 8 },
  summaryRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 6 },
  summaryCheck: { marginTop: 2, marginRight: 9 },
  summaryText: { flex: 1, fontFamily: uiFont, fontSize: 14, lineHeight: 21, color: '#4A4350' },
  summaryStrong: { fontFamily: uiFontMedium, fontWeight: '600', color: '#1F1A24' },

  section: { marginTop: 28 },
  sectionTitle: { fontFamily: uiFontMedium, fontSize: 17, lineHeight: 23, fontWeight: '600', color: '#1F1A24', marginBottom: 8 },
  sectionBody: { fontFamily: uiFont, fontSize: 15, lineHeight: 24, color: '#4A4350' },

  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#E6E2EA', marginTop: 32, marginBottom: 18 },
  contact: { fontFamily: uiFont, fontSize: 14, lineHeight: 21, color: '#6E6674' },
  link: { color: '#7B26CE', fontWeight: '600' },

  footer: {
    paddingHorizontal: 22, paddingTop: 10, paddingBottom: 14, backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#E6E2EA',
  },
  doneButton: { height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#7B26CE' },
  donePressed: { opacity: 0.85 },
  doneText: { fontFamily: uiFontMedium, fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
});
