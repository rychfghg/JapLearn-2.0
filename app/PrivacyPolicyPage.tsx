import React from 'react';
import { Linking, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

const sections = [
  {
    icon: 'person-outline' as const,
    title: 'Information we collect',
    body: 'We collect information you provide when creating and using your account, such as your name, email address, class information, learning activity, scores, lesson completion, and achievements. We may also receive basic technical information needed to keep the app working correctly.',
  },
  {
    icon: 'sparkles-outline' as const,
    title: 'How we use information',
    body: 'Your information is used to create and manage your account, save learning progress, unlock lessons, display achievements, support classroom features, improve the learning experience, respond to support requests, and maintain the security and reliability of JapLearn.',
  },
  {
    icon: 'school-outline' as const,
    title: 'Classes and learning progress',
    body: 'When you join a class, authorized teachers may be able to view relevant student information and learning progress needed to manage the class and support your learning. JapLearn does not use your learning records for unrelated advertising.',
  },
  {
    icon: 'shield-checkmark-outline' as const,
    title: 'Data protection',
    body: 'We use reasonable administrative and technical safeguards designed to protect your information. No digital service can guarantee absolute security, so you should protect your password, avoid sharing account access, and contact us if you notice suspicious activity.',
  },
  {
    icon: 'people-outline' as const,
    title: 'Information sharing',
    body: 'We do not sell your personal information. Information may be shared only when necessary to operate JapLearn, provide classroom functionality, comply with applicable requirements, protect users and the service, or when you have authorized the sharing.',
  },
  {
    icon: 'server-outline' as const,
    title: 'Storage and retention',
    body: 'We retain account and learning information while it is needed to provide JapLearn and meet legitimate operational or legal requirements. Information may be deleted or anonymized when it is no longer necessary, subject to applicable requirements and system backup schedules.',
  },
  {
    icon: 'options-outline' as const,
    title: 'Your choices',
    body: 'You may review information shown in your profile, update supported account details, reset your password, or contact JapLearn about questions involving your information. Some information is required for account, class, and progress features to function.',
  },
  {
    icon: 'refresh-outline' as const,
    title: 'Policy updates',
    body: 'We may update this policy when JapLearn features or privacy practices change. The current version will be available in the app with its effective date. Continued use after an update means the revised policy applies to future use of the service.',
  },
];

export default function PrivacyPolicyPage() {
  const router = useRouter();
  const { fromSignup, fromProfile, fromLogin } = useLocalSearchParams();

  const handleClose = () => {
    if (fromSignup === 'true') {
      router.push({ pathname: '/Signup', params: { showPrivacyModal: 'true' } });
    } else if (fromLogin === 'true') {
      router.replace('/Login');
    } else if (fromProfile === 'true') {
      router.replace('/Profile');
    } else {
      router.replace('/Profile');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <View style={styles.heroCircle} />
            <Text style={styles.heroCharacter}>守</Text>
            <View style={styles.topRow}>
              <Pressable onPress={handleClose} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
                <Ionicons name="arrow-back" size={21} color="#462A5E" />
              </Pressable>
              <View style={styles.documentPill}>
                <Ionicons name="document-text-outline" size={14} color="#8423D9" />
                <Text style={styles.documentPillText}>JAPLEARN POLICY</Text>
              </View>
            </View>
            <View style={styles.heroIcon}><Ionicons name="shield-checkmark" size={32} color="#FFFFFF" /></View>
            <Text style={styles.heroTitle}>Privacy Policy</Text>
            <Text style={styles.heroText}>A clear explanation of how JapLearn handles account and learning information.</Text>
            <View style={styles.effectivePill}><View style={styles.statusDot} /><Text style={styles.effectiveText}>Effective August 12, 2026</Text></View>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryIcon}><Ionicons name="lock-closed-outline" size={22} color="#5B9F34" /></View>
            <View style={styles.summaryCopy}>
              <Text style={styles.summaryTitle}>Your learning data matters</Text>
              <Text style={styles.summaryText}>JapLearn uses your information to operate your account, classroom, lessons, exercises, and progress features.</Text>
            </View>
          </View>

          <Text style={styles.sectionHeading}>How your information is handled</Text>
          {sections.map((section, index) => (
            <View key={section.title} style={styles.policyCard}>
              <View style={styles.numberBadge}><Text style={styles.numberText}>{String(index + 1).padStart(2, '0')}</Text></View>
              <View style={styles.policyContent}>
                <View style={styles.policyTitleRow}>
                  <View style={styles.policyIcon}><Ionicons name={section.icon} size={19} color="#8423D9" /></View>
                  <Text style={styles.policyTitle}>{section.title}</Text>
                </View>
                <Text style={styles.policyText}>{section.body}</Text>
              </View>
            </View>
          ))}

          <View style={styles.contactCard}>
            <View style={styles.contactIcon}><Ionicons name="mail-outline" size={24} color="#FFFFFF" /></View>
            <View style={styles.contactCopy}>
              <Text style={styles.contactTitle}>Privacy questions?</Text>
              <Text style={styles.contactText}>Contact the JapLearn team and we’ll help with your concern.</Text>
              <Pressable onPress={() => Linking.openURL('mailto:japlearnofficial@gmail.com?subject=JapLearn%20Privacy%20Question')}>
                <Text style={styles.contactEmail}>japlearnofficial@gmail.com</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable onPress={handleClose} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
            <Text style={styles.primaryButtonText}>{fromSignup === 'true' ? 'I understand' : 'Done'}</Text>
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
  heroText: { color: '#74677B', fontSize: 12, lineHeight: 18, maxWidth: 310, marginTop: 4 },
  effectivePill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFFFFF', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 7, marginTop: 14 },
  statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#8ED94D' },
  effectiveText: { color: '#716477', fontSize: 9, fontWeight: '700' },
  summaryCard: { marginHorizontal: 20, marginTop: 18, padding: 15, borderRadius: 20, backgroundColor: '#EFF8E8', borderWidth: 1, borderColor: '#C5E1B0', flexDirection: 'row', alignItems: 'center' },
  summaryIcon: { width: 45, height: 45, borderRadius: 15, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  summaryCopy: { flex: 1 }, summaryTitle: { color: '#315226', fontFamily: 'Jua', fontSize: 15 }, summaryText: { color: '#63745D', fontSize: 10, lineHeight: 15, marginTop: 2 },
  sectionHeading: { marginHorizontal: 20, marginTop: 26, marginBottom: 12, color: '#3D234A', fontFamily: 'Jua', fontSize: 20 },
  policyCard: { marginHorizontal: 20, marginBottom: 12, padding: 15, borderRadius: 21, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EAE3ED', flexDirection: 'row', shadowColor: '#43254E', shadowOpacity: 0.07, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  numberBadge: { width: 29, height: 29, borderRadius: 10, backgroundColor: '#F1E5FA', alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  numberText: { color: '#8423D9', fontSize: 9, fontWeight: '900' },
  policyContent: { flex: 1 }, policyTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  policyIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#F7F1FA', alignItems: 'center', justifyContent: 'center' },
  policyTitle: { flex: 1, color: '#43264F', fontFamily: 'Jua', fontSize: 15 },
  policyText: { color: '#766B7C', fontSize: 11, lineHeight: 17, marginTop: 10 },
  contactCard: { marginHorizontal: 20, marginTop: 4, padding: 17, borderRadius: 22, backgroundColor: '#8423D9', flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
  contactIcon: { width: 47, height: 47, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center', marginRight: 13 },
  contactCopy: { flex: 1 }, contactTitle: { color: '#FFFFFF', fontFamily: 'Jua', fontSize: 16 }, contactText: { color: '#EADAF5', fontSize: 10, lineHeight: 15, marginTop: 2 },
  contactEmail: { color: '#CFF4B5', fontSize: 10, fontWeight: '900', marginTop: 7, textDecorationLine: 'underline' },
  footer: { paddingHorizontal: 20, paddingTop: 11, paddingBottom: 12, backgroundColor: '#FCFAFF', borderTopWidth: 1, borderTopColor: '#EEE7F1' },
  primaryButton: { height: 52, borderRadius: 17, backgroundColor: '#8423D9', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderBottomWidth: 4, borderBottomColor: '#6417A6' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
});
