import React from 'react';
import { Linking, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

const sections = [
  {
    icon: 'person-circle-outline' as const,
    title: 'Using your account',
    body: 'Provide accurate account information, keep your password private, and use only the account assigned to you. You are responsible for activity performed through your account.',
  },
  {
    icon: 'school-outline' as const,
    title: 'Learning and classroom features',
    body: 'JapLearn provides lessons, exercises, communication activities, progress records, and classroom tools. Teachers may review relevant student activity when learners join their classes.',
  },
  {
    icon: 'shield-checkmark-outline' as const,
    title: 'Acceptable use',
    body: 'Do not misuse JapLearn, interfere with the service, attempt unauthorized access, submit harmful content, impersonate another person, or use the platform in a way that harms other learners or teachers.',
  },
  {
    icon: 'analytics-outline' as const,
    title: 'Progress and availability',
    body: 'JapLearn works to save accurate learning progress, but uninterrupted access cannot be guaranteed. Maintenance, connectivity, device limitations, or technical issues may temporarily affect features.',
  },
  {
    icon: 'create-outline' as const,
    title: 'Content and updates',
    body: 'Lessons, activities, interface features, and these terms may be updated as JapLearn improves. Continued use after an update means the current terms apply to future use of the service.',
  },
  {
    icon: 'close-circle-outline' as const,
    title: 'Account restrictions',
    body: 'Accounts may be restricted or removed when required for security, classroom administration, policy violations, or protection of JapLearn and its users.',
  },
];

export default function TermsOfServicePage() {
  const router = useRouter();
  const { fromLogin } = useLocalSearchParams();

  const handleClose = () => {
    if (fromLogin === 'true') {
      router.replace('/Login');
      return;
    }
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <View style={styles.heroCircle} />
            <Text style={styles.heroCharacter}>約</Text>
            <View style={styles.topRow}>
              <Pressable onPress={handleClose} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
                <Ionicons name="arrow-back" size={21} color="#462A5E" />
              </Pressable>
              <View style={styles.documentPill}>
                <Ionicons name="document-text-outline" size={14} color="#8423D9" />
                <Text style={styles.documentPillText}>JAPLEARN TERMS</Text>
              </View>
            </View>
            <View style={styles.heroIcon}><Ionicons name="reader" size={31} color="#FFFFFF" /></View>
            <Text style={styles.heroTitle}>Terms of Service</Text>
            <Text style={styles.heroText}>The guidelines that help keep JapLearn safe, fair, and useful for every learner and teacher.</Text>
            <View style={styles.effectivePill}><View style={styles.statusDot} /><Text style={styles.effectiveText}>Effective August 19, 2026</Text></View>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryIcon}><Ionicons name="checkmark-done-outline" size={23} color="#5B9F34" /></View>
            <View style={styles.summaryCopy}>
              <Text style={styles.summaryTitle}>Learn responsibly</Text>
              <Text style={styles.summaryText}>By using JapLearn, you agree to use your account and its learning features responsibly.</Text>
            </View>
          </View>

          <Text style={styles.sectionHeading}>Using JapLearn</Text>
          {sections.map((section, index) => (
            <View key={section.title} style={styles.termsCard}>
              <View style={styles.numberBadge}><Text style={styles.numberText}>{String(index + 1).padStart(2, '0')}</Text></View>
              <View style={styles.termsContent}>
                <View style={styles.termsTitleRow}>
                  <View style={styles.termsIcon}><Ionicons name={section.icon} size={19} color="#8423D9" /></View>
                  <Text style={styles.termsTitle}>{section.title}</Text>
                </View>
                <Text style={styles.termsText}>{section.body}</Text>
              </View>
            </View>
          ))}

          <View style={styles.contactCard}>
            <Ionicons name="mail-outline" size={23} color="#8423D9" />
            <View style={styles.contactCopy}>
              <Text style={styles.contactTitle}>Questions about these terms?</Text>
              <Pressable onPress={() => Linking.openURL('mailto:japlearnofficial@gmail.com?subject=JapLearn%20Terms%20Question')}>
                <Text style={styles.contactEmail}>japlearnofficial@gmail.com</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable onPress={handleClose} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
            <Text style={styles.primaryButtonText}>Done</Text>
            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FCFAFF' },
  container: { flex: 1, backgroundColor: '#FCFAFF' },
  scrollContent: { paddingBottom: 24 },
  pressed: { opacity: 0.76 },
  hero: { minHeight: 300, marginHorizontal: 12, marginTop: 10, borderRadius: 28, padding: 20, backgroundColor: '#F7F0FD', borderWidth: 1, borderColor: '#E6D8EE', overflow: 'hidden' },
  heroCircle: { position: 'absolute', width: 230, height: 230, borderRadius: 115, backgroundColor: '#EADAF7', right: -65, top: -70 },
  heroCharacter: { position: 'absolute', right: 4, bottom: -42, color: 'rgba(132,35,217,0.055)', fontFamily: 'Jua', fontSize: 140, transform: [{ rotate: '-7deg' }] },
  topRow: { flexDirection: 'row', alignItems: 'center' },
  backButton: { width: 44, height: 44, borderRadius: 15, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E8DDED', shadowColor: '#462A5E', shadowOpacity: 0.10, shadowRadius: 9, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  documentPill: { flexDirection: 'row', alignItems: 'center', gap: 6, marginLeft: 11, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5D7EC', borderRadius: 99, paddingHorizontal: 11, paddingVertical: 8 },
  documentPillText: { color: '#644C70', fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  heroIcon: { width: 58, height: 58, borderRadius: 19, backgroundColor: '#8423D9', alignItems: 'center', justifyContent: 'center', marginTop: 23 },
  heroTitle: { color: '#321B40', fontFamily: 'Jua', fontSize: 30, marginTop: 13 },
  heroText: { color: '#74677B', fontSize: 12, lineHeight: 18, maxWidth: 330, marginTop: 4 },
  effectivePill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFFFFF', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 7, marginTop: 14 },
  statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#8ED94D' },
  effectiveText: { color: '#716477', fontSize: 9, fontWeight: '700' },
  summaryCard: { marginHorizontal: 20, marginTop: 18, padding: 15, borderRadius: 20, backgroundColor: '#EFF8E8', borderWidth: 1, borderColor: '#C5E1B0', flexDirection: 'row', alignItems: 'center' },
  summaryIcon: { width: 45, height: 45, borderRadius: 15, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  summaryCopy: { flex: 1 },
  summaryTitle: { color: '#315226', fontFamily: 'Jua', fontSize: 15 },
  summaryText: { color: '#63745D', fontSize: 10, lineHeight: 15, marginTop: 2 },
  sectionHeading: { color: '#382044', fontFamily: 'Jua', fontSize: 20, marginHorizontal: 20, marginTop: 25, marginBottom: 11 },
  termsCard: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 11, padding: 15, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E8DFEC' },
  numberBadge: { width: 31, height: 31, borderRadius: 10, backgroundColor: '#F0E4FA', alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  numberText: { color: '#8423D9', fontSize: 8, fontWeight: '900' },
  termsContent: { flex: 1 },
  termsTitleRow: { flexDirection: 'row', alignItems: 'center' },
  termsIcon: { width: 35, height: 35, borderRadius: 11, backgroundColor: '#F7F0FD', alignItems: 'center', justifyContent: 'center', marginRight: 9 },
  termsTitle: { flex: 1, color: '#42294F', fontFamily: 'Jua', fontSize: 14 },
  termsText: { color: '#776B7D', fontSize: 10, lineHeight: 16, marginTop: 9 },
  contactCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginTop: 6, padding: 16, borderRadius: 20, backgroundColor: '#F5EFF9' },
  contactCopy: { flex: 1, marginLeft: 12 },
  contactTitle: { color: '#42294F', fontFamily: 'Jua', fontSize: 14 },
  contactEmail: { color: '#8423D9', fontSize: 10, fontWeight: '700', marginTop: 4 },
  footer: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16, backgroundColor: '#FCFAFF' },
  primaryButton: { height: 52, borderRadius: 16, backgroundColor: '#8423D9', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  primaryButtonText: { color: '#FFFFFF', fontFamily: 'Jua', fontSize: 16 },
});
