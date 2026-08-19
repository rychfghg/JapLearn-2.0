import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'absolute', // Ensures the background is absolute and fills the parent
    resizeMode: 'cover', // Stretches to cover the entire screen while maintaining aspect ratio
  },
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  battleBackButton: {
    position: 'absolute', top: 22, left: 18, width: 48, height: 48, borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,.96)', alignItems: 'center', justifyContent: 'center',
    zIndex: 30000, elevation: 30, shadowColor: '#1E0928', shadowOpacity: .22,
    shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
  },
  question: {
    paddingTop: 72,
    paddingHorizontal: 48,
    fontSize: width < 380 ? 23 : 27,
    lineHeight: width < 380 ? 29 : 34,
    marginVertical: 20,
    textAlign: 'center',
    color: 'white',
    fontFamily: 'Jua',
  },
  choiceContainer: {
    position: 'absolute',
    bottom: '14%',
    width: '90%',
    height: '25%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 20,
  },
  
  choice: {
    width: 70, // Set fixed width
    height: 50, // Set fixed height
    backgroundColor: '#3b6b3b',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    margin: 10,
    position: 'relative', // Allows absolute positioning during animation
  },
  choiceText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Jua',
  },
  battleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 5,
    marginTop: 120,
  },
  characterContainer: {
    alignItems: 'center',

  },
  playerImage: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
  },
  enemyImage: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
  },
  playerHPContainer: { // New style for player HP container
    width: 100,
    height: 10,
    backgroundColor: '#ccc',
    borderRadius: 5,
    marginTop: 10,
  },
  playerHPFill: { // New style for player HP fill
    height: '100%',
    backgroundColor: '#00ff00',
  },
  enemyHPContainer: {
    width: 100,
    height: 10,
    backgroundColor: '#ccc',
    borderRadius: 5,
    marginTop: 10,
  },
  enemyHPFill: {
    height: '100%',
    backgroundColor: '#ff0000',
  },
  attackEffect: {
    position: 'absolute',
    width: 50,
    height: 50,
    left: width / 2 - 25,
    top: height / 2 - 100,
    resizeMode: 'contain',
    tintColor: '#ff0000',
  },
  bottomButton: {
    position: 'absolute',
    bottom: height * 0.03,
    width: width * 0.2,
    paddingVertical: 15,
    backgroundColor: '#76C043',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bottomButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Jua',
  },
  curtainContainer: {
    ...StyleSheet.absoluteFillObject, // Ensure it covers the full screen
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999, // Place it above all elements
    backgroundColor: 'transparent', // Maintain transparency for underlying elements
  },
  battleBriefOverlay: {
    ...StyleSheet.absoluteFillObject, zIndex: 20000, backgroundColor: 'rgba(25,8,34,.68)',
    alignItems: 'center', justifyContent: 'center', padding: 22,
  },
  battleBriefCard: {
    width: '100%', maxWidth: 430, backgroundColor: '#FFFCFF', borderRadius: 28, padding: 21,
    borderWidth: 1, borderColor: '#E8D9EF', shadowColor: '#16051E', shadowOpacity: .3,
    shadowRadius: 18, shadowOffset: { width: 0, height: 10 }, elevation: 14,
  },
  briefBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: '#F1E4FC', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7 },
  briefBadgeText: { color: '#7130A0', fontFamily: 'Jua', fontSize: 10, letterSpacing: 1.1 },
  briefTitle: { color: '#34203F', fontFamily: 'Jua', fontSize: 26, lineHeight: 31, marginTop: 15 },
  briefText: { color: '#746579', fontSize: 14, lineHeight: 21, marginTop: 7 },
  briefRule: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F4FAF0', borderRadius: 17, padding: 12, marginTop: 14, borderWidth: 1, borderColor: '#DDEED2' },
  briefRuleIcon: { width: 38, height: 38, borderRadius: 13, backgroundColor: '#E7F5DE', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  briefRuleText: { flex: 1, color: '#56614F', fontSize: 12, lineHeight: 17 },
  briefDialogue: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 12 },
  briefMascot: { width: 76, height: 88, resizeMode: 'contain', marginRight: 3 },
  briefBubble: { flex: 1, backgroundColor: '#F5ECFA', padding: 11, borderRadius: 16, borderBottomLeftRadius: 4 },
  briefSpeaker: { color: '#76BE43', fontFamily: 'Jua', fontSize: 9, letterSpacing: 1 },
  briefQuote: { color: '#51365F', fontFamily: 'Jua', fontSize: 12, lineHeight: 17, marginTop: 3 },
  briefButton: { height: 52, marginTop: 15, borderRadius: 17, backgroundColor: '#8424E8', flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' },
  briefButtonText: { color: '#fff', fontFamily: 'Jua', fontSize: 14, letterSpacing: .7 },
  exitOverlay: { flex: 1, backgroundColor: 'rgba(28,10,36,.68)', alignItems: 'center', justifyContent: 'center', padding: 25 },
  exitCard: { width: '100%', maxWidth: 380, backgroundColor: '#fff', borderRadius: 28, padding: 23, alignItems: 'center' },
  exitIcon: { width: 62, height: 62, borderRadius: 21, backgroundColor: '#F1E4FC', alignItems: 'center', justifyContent: 'center' },
  exitTitle: { color: '#382144', fontFamily: 'Jua', fontSize: 25, marginTop: 13 },
  exitText: { color: '#786A7D', fontSize: 14, lineHeight: 20, textAlign: 'center', marginTop: 6, marginBottom: 18 },
  stayButton: { width: '100%', height: 50, borderRadius: 16, backgroundColor: '#8424E8', alignItems: 'center', justifyContent: 'center' },
  stayButtonText: { color: '#fff', fontFamily: 'Jua', fontSize: 13 },
  leaveButton: { paddingVertical: 14, paddingHorizontal: 20 },
  leaveButtonText: { color: '#9A5D69', fontFamily: 'Jua', fontSize: 13 },
  curtainLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '50%', // Covers half the screen width
    height: '100%', // Covers full screen height
    backgroundColor: '#000',
  },
  curtainRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '50%', // Covers half the screen width
    height: '100%', // Covers full screen height
    backgroundColor: '#000',
  },
  curtainText: {
    position: 'absolute', // Ensure the text is centered
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Jua',
    zIndex: 10000, // Ensure it is above the curtains
  },
  curtainText: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Jua',
    zIndex: 11,
  },
  characterName: {
    fontSize: 18,
    color: 'white',
    fontFamily: 'Jua',
    marginBottom: 5, // Adds spacing between the name and character image
    textAlign: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject, // Covers the entire screen
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Semi-transparent black background
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999, // Ensures it's above all other UI elements
  },
  
  
  gameOverText: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Jua',
    marginRight:10
  },
  proceedButton: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  proceedButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  selectedAnswerContainer: {
    marginTop: 10,
    marginBottom: -51,
    backgroundColor: '#3b6b3b',
    borderRadius: 10,
    padding: 10,
    width: '20%',
    alignItems: 'center',
  },
  selectedAnswerText: {
    fontSize: 18,
    color: 'white',
    fontFamily: 'Jua',
  },
  
});
