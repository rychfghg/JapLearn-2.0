import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FCFAFF' },
  container: {
      flex: 1,
      minHeight: 0,
      backgroundColor: '#FCFAFF',
      overflow: 'hidden',
  },
  scrollView: { flex: 1 },
  background: {
      flex: 1,
      resizeMode: 'cover',
  },
  header: {
      minHeight: 390,
      paddingHorizontal: 20,
      paddingTop: 14,
      backgroundColor: '#FBF8FF',
      overflow: 'hidden',
      zIndex: 2,
  },
  headerShell: { paddingTop: 0 },
  backButtonContainer: {
      height: 44,
      width: 44,
      borderRadius: 15,
      backgroundColor: '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: '#EDE5F1',
      shadowColor: '#462A5E', shadowOpacity: 0.10, shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  pressed: { opacity: 0.72 },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', zIndex: 5 },
  headerWordmark: { flexDirection: 'row', alignItems: 'center', gap: 6, marginLeft: 11 },
  headerWordmarkText: { color: '#4A3158', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  headerIcon: { marginLeft: 'auto', width: 44, height: 44, borderRadius: 15, backgroundColor: '#EEE0FA', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E1CDEF' },
  heroCircle: { position: 'absolute', width: 295, height: 295, borderRadius: 148, right: -55, top: 66, backgroundColor: '#EEE2FA' },
  heroCloudOne: { position: 'absolute', width: 62, height: 20, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.72)', right: 248, top: 180 },
  heroCloudTwo: { position: 'absolute', width: 46, height: 16, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.64)', right: 145, top: 147 },
  heroFuji: { position: 'absolute', right: 5, bottom: 16, width: 0, height: 0, borderLeftWidth: 105, borderRightWidth: 105, borderBottomWidth: 142, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: 'rgba(132,35,217,0.08)' },
  heroFujiSnow: { position: 'absolute', right: 65, bottom: 102, width: 0, height: 0, borderLeftWidth: 45, borderRightWidth: 45, borderBottomWidth: 55, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: 'rgba(255,255,255,0.68)' },
  heroBody: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingTop: 5 },
  heroCopy: { width: '52%', zIndex: 4 },
  heroEyebrow: { color: '#8ED94D', fontSize: 9, fontWeight: '900', letterSpacing: 1.4, marginBottom: 5 },
  headerTitle: { color: '#2F193D', fontFamily: 'Jua', fontSize: 25, lineHeight: 30 },
  headerSubtitle: { color: '#655A6C', fontSize: 11, lineHeight: 17, marginTop: 6, maxWidth: 190 },
  mascotStage: { width: '48%', height: 285, alignItems: 'center', justifyContent: 'flex-end', alignSelf: 'flex-end', zIndex: 3 },
  mascotSun: { position: 'absolute', width: 218, height: 218, borderRadius: 109, backgroundColor: 'rgba(224,203,246,0.72)', bottom: 8, right: -20 },
  mascotGround: { position: 'absolute', width: 175, height: 27, borderRadius: 14, backgroundColor: 'rgba(132,35,217,0.11)', bottom: 5, right: -1 },
  mascotImage: { width: 190, height: 248, zIndex: 2 },
  dialogueSteps: { flexDirection: 'row', gap: 5, marginTop: 14 },
  dialogueStep: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#DDD4E1' },
  dialogueStepActive: { width: 18, backgroundColor: '#8423D9' },
  scrollContent: { paddingBottom: 112 },
  contentBody: { paddingHorizontal: 20 },
  introCard: { minHeight: 132, borderRadius: 25, backgroundColor: '#8423D9', padding: 19, paddingRight: 65, flexDirection: 'row', alignItems: 'center', overflow: 'hidden', borderBottomWidth: 5, borderBottomColor: '#6817AA', shadowColor: '#4C1C68', shadowOpacity: 0.16, shadowRadius: 15, shadowOffset: { width: 0, height: 7 }, elevation: 6 },
  introIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  introCopy: { flex: 1, zIndex: 2 },
  introTitle: { color: '#FFFFFF', fontFamily: 'Jua', fontSize: 19 },
  introText: { color: '#EEDFF8', fontSize: 11, lineHeight: 17, marginTop: 4 },
  introCharacter: { position: 'absolute', right: -8, bottom: -34, color: 'rgba(255,255,255,0.075)', fontFamily: 'Jua', fontSize: 128 },
  sectionHeading: { marginTop: 22, marginBottom: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  sectionTitle: { color: '#382044', fontFamily: 'Jua', fontSize: 21 },
  sectionSubtitle: { color: '#837787', fontSize: 11, marginTop: 2 },
  pathCount: { backgroundColor: '#EFF8E8', borderRadius: 99, paddingHorizontal: 9, paddingVertical: 6 },
  pathCountText: { color: '#5A9E36', fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  menuContainer: { width: '100%' },
  mapContainer: { width: '100%', paddingTop: 3 },
  mapStep: { flexDirection: 'row', alignItems: 'stretch' },
  mapRail: { width: 38, alignItems: 'center' },
  mapNode: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', zIndex: 3, borderWidth: 3, borderColor: '#FCFAFF', shadowColor: '#43234F', shadowOpacity: 0.16, shadowRadius: 7, shadowOffset: { width: 0, height: 3 }, elevation: 4 },
  mapNodePurple: { backgroundColor: '#8423D9' },
  mapNodeGreen: { backgroundColor: '#72B83F' },
  mapNodeOrange: { backgroundColor: '#E8912D' },
  mapNodeLocked: { backgroundColor: '#A9A0AD' },
  mapLine: { position: 'absolute', width: 4, top: 31, bottom: -3, borderRadius: 3 },
  mapLineUnlocked: { backgroundColor: '#B88BE1' },
  mapLineLocked: { backgroundColor: '#DED8E1' },
  mapCardWrap: { flex: 1, paddingLeft: 9 },
  milestoneLabel: { color: '#8423D9', fontSize: 8, fontWeight: '900', letterSpacing: 1.1, marginBottom: 7, marginLeft: 4 },
  milestoneLabelGreen: { color: '#5B9F34', fontSize: 8, fontWeight: '900', letterSpacing: 1.1, marginBottom: 7, marginLeft: 4 },
  milestoneLabelOrange: { color: '#C8771D', fontSize: 8, fontWeight: '900', letterSpacing: 1.1, marginBottom: 7, marginLeft: 4 },
  milestoneLabelLocked: { color: '#99909E', fontSize: 8, fontWeight: '900', letterSpacing: 1.1, marginBottom: 7, marginLeft: 4 },
  tipCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFDF6', borderWidth: 1, borderColor: '#F4E5B8', borderRadius: 19, padding: 14, paddingRight: 43, marginTop: 2 },
  tipClose: { position: 'absolute', right: 10, top: 10, width: 28, height: 28, borderRadius: 10, backgroundColor: '#FFF2CC', alignItems: 'center', justifyContent: 'center', zIndex: 3 },
  tipIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#FFF1C8', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  tipCopy: { flex: 1 },
  tipLabel: { color: '#8B621C', fontSize: 11, fontWeight: '900' },
  tipText: { color: '#77694D', fontSize: 11, lineHeight: 16, marginTop: 2 },


  disabledButton: {
      backgroundColor: 'gray',
      opacity: 0.6,
  },
  disabledText: {
      color: '#7d7d7d',
  },
  classLessonSection: {
      marginTop: 24,
      paddingTop: 22,
      borderTopWidth: 1,
      borderTopColor: '#E7DDED',
  },
  awardModalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.8)', // Dim background
  },
  awardBadge: {
      width: 200,
      height: 200,
      resizeMode: 'contain',
  },
  backdropLight: {
      position: 'absolute',
      width: 300, // Ensure it fits your design
      height: 300,
      alignSelf: 'center',
      backgroundColor: 'rgba(144, 228, 193, 0.6)', // Soft teal with transparency
      borderRadius: 9999, // Maintain circular shape
      zIndex: 0, // Ensure it's behind the badge
  },
  congratsMessage: {
      color: 'white', // White text color
      fontSize: 18, // Adjust font size
      fontWeight: 'bold', // Make it bold
      textAlign: 'center', // Center the text
      marginTop: 20, // Add some spacing from the badge
      paddingHorizontal: 10, // Add padding for better readability
      textShadowColor: 'rgba(0, 0, 0, 0.8)', // Add a subtle text shadow
      textShadowOffset: { width: 1, height: 1 }, // Shadow offset
      textShadowRadius: 3, // Shadow radius
  },
  darkPage: { backgroundColor: '#120D17' },
  darkHeader: { backgroundColor: '#1B1223' },
  darkTitle: { color: '#F6EFFA' },
  darkMuted: { color: '#B9ACBF' },
  darkTip: { backgroundColor: '#282016', borderColor: '#5B4724' },
});


export default styles;
