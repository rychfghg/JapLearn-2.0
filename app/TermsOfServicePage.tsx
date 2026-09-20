import React from 'react';
import { Linking, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Logo from '../assets/svg/jpLogo.svg';

const uiFont = Platform.select({ android: 'sans-serif', ios: 'System', web: 'Inter, system-ui, sans-serif' });

const sections = [
  {
    icon: 'person-circle-outline' as const,
    title: 'Who can use JapLearn',
    body: 'JapLearn is built for classroom language learning and is intended for learners aged 13 and above, or younger learners enrolled by their school with the consent of a parent, guardian or the school. JapLearn is free to use; there are no paid features, subscriptions or in-app purchases.',
  },
  {
    icon: 'key-outline' as const,
    title: 'Your account',
    body: 'Give accurate account details, keep your password private, and use only the account assigned to you. You are responsible for what happens through your account. Student accounts are activated after email confirmation and teacher approval.',
  },
  {
    icon: 'school-outline' as const,
    title: 'Classes and what teachers see',
    body: 'When you join a class with a class code, that teacher can see your name, email address and learning records for the class, including lesson progress, quiz and game scores, and speaking feedback. Join only classes you actually belong to.',
  },
  {
    icon: 'mic-outline' as const,
    title: 'Speaking activities',
    body: 'Speaking activities record your voice while the activity is running and send it for automated pronunciation assessment and feedback, as described in our Privacy Policy. Use them for language practice only, and do not record other people or share private or sensitive information through them.',
  },
  {
    icon: 'shield-checkmark-outline' as const,
    title: 'Acceptable use',
    body: 'Do not misuse JapLearn, interfere with the service, attempt unauthorized access, submit harmful or offensive content, impersonate another person, cheat in graded activities, or use the platform in a way that harms other learners or teachers.',
  },
  {
    icon: 'sparkles-outline' as const,
    title: 'Automated scores and feedback',
    body: 'Scores, pronunciation assessments and generated feedback are produced automatically and are learning aids. They can be wrong or incomplete, are not a formal language certification, and should not be treated as professional or academic advice. Your teacher decides how they count in class.',
  },
  {
    icon: 'analytics-outline' as const,
    title: 'Progress and availability',
    body: 'JapLearn works to save your progress accurately, including offline work that syncs when you reconnect. Uninterrupted access cannot be guaranteed: maintenance, connectivity, device limits or technical issues may temporarily affect features.',
  },
  {
    icon: 'create-outline' as const,
    title: 'Content ownership',
    body: 'Lessons, activities, characters, artwork and other JapLearn material belong to JapLearn or its licensors, and may not be copied or redistributed without permission. Content you submit stays yours, and you allow JapLearn to process it to run the service and show it to your teacher.',
  },
  {
    icon: 'trash-outline' as const,
    title: 'Ending your account',
    body: 'You may delete your account at any time from Profile, then Delete account, or at portal.japlearn.com/delete-account. Deletion is permanent. We may restrict or remove accounts when needed for security, classroom administration, policy violations, or to protect JapLearn and its users.',
  },
  {
    icon: 'refresh-outline' as const,
    title: 'Changes and contact',
    body: 'Lessons, activities, features and these terms may change as JapLearn improves, and the current version is available in the app and at portal.japlearn.com/terms. Continued use after an update means the revised terms apply. Questions: japlearnofficial@gmail.com.',
  },
];

export default function TermsOfServicePage() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 820;
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
            <View style={styles.heroIcon}><Ionicons name="reader-outline" size={27} color="#8423D9" /></View>
            <Text style={styles.heroTitle}>Terms of Service</Text>
            <Text style={styles.heroText}>The guidelines that help keep JapLearn safe, fair, and useful for every learner and teacher.</Text>
            <View style={styles.effectivePill}><View style={styles.statusDot} /><Text style={styles.effectiveText}>Effective September 20, 2026</Text></View>
          </View>

          <View style={[styles.content, isWide && styles.contentWide]}>
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
              <View style={styles.termsIcon}><Ionicons name={section.icon} size={19} color="#8423D9" /></View>
              <View style={styles.termsContent}>
                <View style={styles.termsTitleRow}>
                  <Text style={styles.numberText}>{String(index + 1).padStart(2, '0')}</Text>
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
          <View style={styles.footer}>
          <Pressable onPress={handleClose} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
            <Text style={styles.primaryButtonText}>Done</Text>
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
  container: { flex: 1, backgroundColor: '#FBF8FD',overflow:'hidden' },
  orbTop:{position:'absolute',width:280,height:280,borderRadius:140,backgroundColor:'#EFE0FB',right:-115,top:-125},
  orbBottom:{position:'absolute',width:230,height:230,borderRadius:115,backgroundColor:'#EAF5E2',left:-110,bottom:-120},
  scrollContent: { flexGrow:1,justifyContent:'center',paddingHorizontal:20,paddingVertical:24 },
  document:{width:'100%',maxWidth:560,alignSelf:'center',backgroundColor:'#FFFFFF',borderWidth:1,borderColor:'#EAE2EE',borderRadius:24,overflow:'hidden'},
  documentWide:{maxWidth:1040,minHeight:680,flexDirection:'row',borderRadius:30},
  pressed: { opacity: 0.76 },
  hero:{padding:22,backgroundColor:'#F3E9FA'},heroWide:{width:'36%',padding:32,justifyContent:'center'},
  topRow: { flexDirection: 'row', alignItems: 'center' },
  backButton: { width: 42, height: 42, borderRadius: 13, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E1D4E8' },
  brand:{marginLeft:12,flexDirection:'row',alignItems:'center',gap:9},logoShell:{width:42,height:42,borderRadius:13,backgroundColor:'#E7D5F4',alignItems:'center',justifyContent:'center'},brandText:{fontFamily:uiFont,fontSize:16,fontWeight:'500',color:'#382541'},
  heroRule:{flexDirection:'row',alignItems:'center',gap:7,marginTop:28},heroRuleLine:{width:24,height:2,borderRadius:2,backgroundColor:'#D3BCE3'},
  heroIcon: { width: 52, height: 52, borderRadius: 17, backgroundColor: '#FFFFFF',borderWidth:1,borderColor:'#DFCDEB', alignItems: 'center', justifyContent: 'center', marginTop:18 },
  heroTitle: { color: '#321B40',fontFamily:uiFont,fontWeight:'400', fontSize: 28, marginTop: 13 },
  heroText: { color: '#74677B',fontFamily:uiFont,fontSize: 13, lineHeight: 20, maxWidth: 330, marginTop: 6 },
  effectivePill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFFFFF', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 7, marginTop: 14 },
  statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#8ED94D' },
  effectiveText: { color: '#716477',fontFamily:uiFont,fontSize: 10, fontWeight:'500' },
  content:{padding:22},contentWide:{flex:1,paddingHorizontal:42,paddingVertical:34},
  summaryCard: { padding: 15, borderRadius: 16, backgroundColor: '#F0F8EA', borderWidth: 1, borderColor: '#CDE2BD', flexDirection: 'row', alignItems: 'center' },
  summaryIcon: { width: 45, height: 45, borderRadius: 15, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  summaryCopy: { flex: 1 },
  summaryTitle: { color: '#315226',fontFamily:uiFont,fontWeight:'500', fontSize: 14 },
  summaryText: { color: '#63745D',fontFamily:uiFont,fontSize: 11, lineHeight: 17, marginTop: 2 },
  sectionHeading: { color: '#382044',fontFamily:uiFont,fontWeight:'500', fontSize: 18,marginTop:27,marginBottom:5 },
  termsCard: { flexDirection: 'row',paddingVertical:16,borderBottomWidth:1,borderBottomColor:'#EEE7F1' },
  numberText: { color: '#8E78A0',fontFamily:uiFont,fontSize: 10, fontWeight:'500',letterSpacing:.5 },
  termsContent: { flex: 1 },
  termsTitleRow: { flexDirection: 'row', alignItems: 'center',gap:8 },
  termsIcon: { width:38,height:38,borderRadius:12,backgroundColor:'#F3E9FA',alignItems:'center',justifyContent:'center',marginRight:13 },
  termsTitle: { flex: 1, color: '#42294F',fontFamily:uiFont,fontWeight:'500', fontSize: 14 },
  termsText: { color: '#776B7D',fontFamily:uiFont,fontSize: 12, lineHeight: 19, marginTop: 7 },
  contactCard: { flexDirection: 'row', alignItems: 'center',marginTop:20,padding:16,borderRadius:17,backgroundColor:'#F6F0FA',borderWidth:1,borderColor:'#E7DBEC' },
  contactCopy: { flex: 1, marginLeft: 12 },
  contactTitle: { color: '#42294F',fontFamily:uiFont,fontWeight:'500', fontSize: 14 },
  contactEmail: { color: '#8423D9',fontFamily:uiFont,fontSize: 11, fontWeight:'500', marginTop: 4 },
  footer:{paddingTop:20},
  primaryButton: { height:54,borderRadius:15,backgroundColor:'#8423D9',flexDirection:'row',alignItems:'center',justifyContent:'center' },
  primaryButtonText: { color:'#FFFFFF',fontFamily:uiFont,fontSize:14,fontWeight:'500' },
  buttonIcon:{position:'absolute',right:7,width:40,height:40,borderRadius:11,backgroundColor:'#FFFFFF',alignItems:'center',justifyContent:'center'},
});
