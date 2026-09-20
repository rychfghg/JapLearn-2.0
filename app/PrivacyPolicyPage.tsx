import React from 'react';
import { Linking, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Logo from '../assets/svg/jpLogo.svg';

const uiFont = Platform.select({ android: 'sans-serif', ios: 'System', web: 'Inter, system-ui, sans-serif' });

const sections = [
  {
    icon: 'person-outline' as const,
    title: 'Information we collect',
    body: 'Account details you give us: your first and last name, email address, password (stored encrypted, never in readable form), your role as a student, and the class code you join. Learning records we create as you use JapLearn: lesson completion, quiz answers, game scores and attempts, badges, streaks, daily goal minutes, and speaking practice results. Basic technical information needed to run and troubleshoot the service, such as your app version and the date and time of activity.',
  },
  {
    icon: 'mic-outline' as const,
    title: 'Microphone and voice recordings',
    body: 'Speaking activities (Talk with Sumi, Guided Phrase Practice, Dialogue Relay and similar exercises) record your voice only while you are in that activity and only after you allow microphone access on your device. Your recorded speech is sent securely to Microsoft Azure Speech Services to measure pronunciation, accuracy, fluency and completeness. What you said, as text, is also sent to Google Gemini to generate learning feedback. JapLearn stores the resulting transcript, scores and feedback with your account. We do not store the raw audio recording after it has been assessed, and we never use your voice for advertising or to identify you.',
  },
  {
    icon: 'phone-portrait-outline' as const,
    title: 'Device permissions we request',
    body: 'Microphone: required for speaking activities; you can decline and still use every other part of JapLearn. Internet access: required to sign in, save progress and load lessons. Vibration: short feedback during some games. Photos and files: only used if you attach an image or document to lesson content. JapLearn does not request your location, contacts, camera roll scanning, phone number, calendar or SMS.',
  },
  {
    icon: 'sparkles-outline' as const,
    title: 'How we use information',
    body: 'To create and manage your account, save and sync your learning progress, unlock lessons, award badges, show your scores, run classroom activities your teacher assigns, give speaking feedback, answer your support requests, and keep JapLearn secure and reliable. We do not use your information for advertising, and we do not sell it.',
  },
  {
    icon: 'school-outline' as const,
    title: 'What your teacher can see',
    body: 'When you join a class with a class code, the teacher who owns that class can see your name, email address, lesson progress, quiz and game scores, and speaking practice results for that class. Teachers cannot see your password. Other students cannot see your records.',
  },
  {
    icon: 'people-outline' as const,
    title: 'Companies that process data for us',
    body: 'MongoDB Atlas stores your account and learning records. Render hosts the JapLearn server. Microsoft Azure Speech Services assesses your pronunciation. Google Gemini generates conversation and learning feedback. Brevo sends account emails such as confirmation, password reset and account deletion. Expo delivers app updates. These providers process data only to deliver JapLearn to you. We do not sell personal information or share it for advertising.',
  },
  {
    icon: 'lock-closed-outline' as const,
    title: 'Data protection',
    body: 'Your connection to JapLearn uses encrypted HTTPS. Passwords are hashed with bcrypt and cannot be read by us. Sign-in sessions expire, and teacher access is limited to that teacher\'s own classes. No online service can promise perfect security, so keep your password private and tell us if you notice anything suspicious.',
  },
  {
    icon: 'server-outline' as const,
    title: 'Storage and retention',
    body: 'Your data is stored on servers operated by our providers and may be processed outside the Philippines. We keep account and learning information while your account is active. If you delete your account, your records are removed immediately, although routine encrypted backups may retain copies for a short period before they expire.',
  },
  {
    icon: 'trash-outline' as const,
    title: 'Deleting your account',
    body: 'You can delete your JapLearn account at any time from Profile, then Delete account. You can also delete it from a web browser at portal.japlearn.com/delete-account without installing the app. Deletion permanently removes your account, lesson progress, badges, quiz and game scores, and speaking feedback. It cannot be undone. If you can no longer access your email address, contact japlearnofficial@gmail.com and we will verify and delete the account for you.',
  },
  {
    icon: 'options-outline' as const,
    title: 'Your choices and rights',
    body: 'You can view your profile details, join or change your class, reset your password, decline microphone access, and request a copy or correction of your information by contacting us. Some details, such as your email address, are required for the account to work.',
  },
  {
    icon: 'happy-outline' as const,
    title: 'Children and school use',
    body: 'JapLearn is made for classroom use and is intended for learners aged 13 and above, or younger learners enrolled by their school with the consent of a parent, guardian or the school. If you believe a child has created an account without the proper consent, contact japlearnofficial@gmail.com and we will delete it.',
  },
  {
    icon: 'refresh-outline' as const,
    title: 'Policy updates and contact',
    body: 'We update this policy when JapLearn features or privacy practices change, and the current version is always available in the app and at portal.japlearn.com/privacy with its effective date. For any privacy question or request, email japlearnofficial@gmail.com.',
  },
];

export default function PrivacyPolicyPage() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 820;
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
        <View pointerEvents="none" style={styles.orbTop} />
        <View pointerEvents="none" style={styles.orbBottom} />
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={[styles.document, isWide && styles.documentWide]}>
          <View style={[styles.hero, isWide && styles.heroWide]}>
            <View style={styles.topRow}>
              <Pressable onPress={handleClose} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
                <Ionicons name="arrow-back" size={21} color="#462A5E" />
              </Pressable>
              <View style={styles.brand}><View style={styles.logoShell}><Logo width={34} height={34} /></View><Text style={styles.brandText}>JapLearn 2.0</Text></View>
            </View>
            <View style={styles.heroRule}><View style={styles.heroRuleLine} /><Ionicons name="sparkles" size={14} color="#72B544" /><View style={styles.heroRuleLine} /></View>
            <View style={styles.heroIcon}><Ionicons name="shield-checkmark-outline" size={27} color="#8423D9" /></View>
            <Text style={styles.heroTitle}>Privacy Policy</Text>
            <Text style={styles.heroText}>A clear explanation of how JapLearn handles account and learning information.</Text>
            <View style={styles.effectivePill}><View style={styles.statusDot} /><Text style={styles.effectiveText}>Effective September 20, 2026</Text></View>
          </View>

          <View style={[styles.content, isWide && styles.contentWide]}>
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
              <View style={styles.policyIcon}><Ionicons name={section.icon} size={19} color="#8423D9" /></View>
              <View style={styles.policyContent}>
                <View style={styles.policyTitleRow}><Text style={styles.numberText}>{String(index + 1).padStart(2, '0')}</Text><Text style={styles.policyTitle}>{section.title}</Text></View>
                <Text style={styles.policyText}>{section.body}</Text>
              </View>
            </View>
          ))}

          <View style={styles.contactCard}>
            <View style={styles.contactIcon}><Ionicons name="mail-outline" size={22} color="#8423D9" /></View>
            <View style={styles.contactCopy}>
              <Text style={styles.contactTitle}>Privacy questions?</Text>
              <Text style={styles.contactText}>Contact the JapLearn team and we’ll help with your concern.</Text>
              <Pressable onPress={() => Linking.openURL('mailto:japlearnofficial@gmail.com?subject=JapLearn%20Privacy%20Question')}>
                <Text style={styles.contactEmail}>japlearnofficial@gmail.com</Text>
              </Pressable>
            </View>
          </View>
          <View style={styles.footer}>
          <Pressable onPress={handleClose} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
            <Text style={styles.primaryButtonText}>{fromSignup === 'true' ? 'I understand' : 'Done'}</Text>
            <View style={styles.buttonIcon}><Ionicons name="checkmark" size={18} color="#8423D9" /></View>
          </Pressable>
          </View>
          </View>
          </View>
        </ScrollView>
        </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FBF8FD' },
  container: { flex: 1, backgroundColor: '#FBF8FD', overflow: 'hidden' },
  orbTop:{position:'absolute',width:280,height:280,borderRadius:140,backgroundColor:'#EFE0FB',right:-115,top:-125},
  orbBottom:{position:'absolute',width:230,height:230,borderRadius:115,backgroundColor:'#EAF5E2',left:-110,bottom:-120},
  scrollContent: { flexGrow:1, justifyContent:'center', paddingHorizontal:20, paddingVertical:24 },
  document:{width:'100%',maxWidth:560,alignSelf:'center',backgroundColor:'#FFFFFF',borderWidth:1,borderColor:'#EAE2EE',borderRadius:24,overflow:'hidden'},
  documentWide:{maxWidth:1040,minHeight:680,flexDirection:'row',borderRadius:30},
  pressed: { opacity: 0.76 },
  hero:{padding:22,backgroundColor:'#F3E9FA'},
  heroWide:{width:'36%',padding:32,justifyContent:'center'},
  topRow: { flexDirection: 'row', alignItems: 'center' },
  backButton: { width: 42, height: 42, borderRadius: 13, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E1D4E8' },
  brand:{marginLeft:12,flexDirection:'row',alignItems:'center',gap:9},logoShell:{width:42,height:42,borderRadius:13,backgroundColor:'#E7D5F4',alignItems:'center',justifyContent:'center'},brandText:{fontFamily:uiFont,fontSize:16,fontWeight:'500',color:'#382541'},
  heroRule:{flexDirection:'row',alignItems:'center',gap:7,marginTop:28},heroRuleLine:{width:24,height:2,borderRadius:2,backgroundColor:'#D3BCE3'},
  heroIcon: { width: 52, height: 52, borderRadius: 17, backgroundColor: '#FFFFFF', borderWidth:1,borderColor:'#DFCDEB',alignItems: 'center', justifyContent: 'center', marginTop: 18 },
  heroTitle: { color: '#321B40', fontFamily:uiFont,fontWeight:'400', fontSize: 28, marginTop: 13 },
  heroText: { color: '#74677B', fontFamily:uiFont,fontSize: 13, lineHeight: 20, maxWidth: 310, marginTop: 6 },
  effectivePill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFFFFF', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 7, marginTop: 14 },
  statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#8ED94D' },
  effectiveText: { color: '#716477', fontFamily:uiFont,fontSize: 10, fontWeight: '500' },
  content:{padding:22},contentWide:{flex:1,paddingHorizontal:42,paddingVertical:34},
  summaryCard: { padding: 15, borderRadius: 16, backgroundColor: '#F0F8EA', borderWidth: 1, borderColor: '#CDE2BD', flexDirection: 'row', alignItems: 'center' },
  summaryIcon: { width: 45, height: 45, borderRadius: 15, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  summaryCopy: { flex: 1 }, summaryTitle: { color: '#315226', fontFamily:uiFont,fontWeight:'500', fontSize: 14 }, summaryText: { color: '#63745D', fontFamily:uiFont,fontSize: 11, lineHeight: 17, marginTop: 2 },
  sectionHeading: { marginTop: 27, marginBottom: 5, color: '#3D234A', fontFamily:uiFont,fontWeight:'500', fontSize: 18 },
  policyCard:{paddingVertical:16,borderBottomWidth:1,borderBottomColor:'#EEE7F1',flexDirection:'row'},
  numberText: { color: '#8E78A0', fontFamily:uiFont,fontSize: 10, fontWeight:'500',letterSpacing:.5 },
  policyContent: { flex: 1 }, policyTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  policyIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#F3E9FA', alignItems: 'center', justifyContent: 'center',marginRight:13 },
  policyTitle: { flex: 1, color: '#43264F', fontFamily:uiFont,fontWeight:'500', fontSize: 14 },
  policyText: { color: '#766B7C', fontFamily:uiFont,fontSize: 12, lineHeight: 19, marginTop: 7 },
  contactCard: { marginTop: 20, padding: 16, borderRadius: 17, backgroundColor: '#F6F0FA',borderWidth:1,borderColor:'#E7DBEC', flexDirection: 'row', alignItems: 'center' },
  contactIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor:'#FFFFFF',alignItems: 'center', justifyContent: 'center', marginRight: 13 },
  contactCopy: { flex: 1 }, contactTitle: { color: '#43264F',fontFamily:uiFont,fontWeight:'500', fontSize: 14 }, contactText: { color: '#766B7C',fontFamily:uiFont,fontSize: 11, lineHeight: 16, marginTop: 2 },
  contactEmail: { color: '#8423D9',fontFamily:uiFont,fontSize: 11, fontWeight:'500', marginTop: 5 },
  footer: { paddingTop: 20 },
  primaryButton: { height: 54, borderRadius: 15, backgroundColor: '#8423D9', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { color: '#FFFFFF',fontFamily:uiFont,fontSize: 14, fontWeight:'500' },
  buttonIcon:{position:'absolute',right:7,width:40,height:40,borderRadius:11,backgroundColor:'#FFFFFF',alignItems:'center',justifyContent:'center'},
});
