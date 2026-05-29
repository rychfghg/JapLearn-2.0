import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
  background: {
    flex: 1,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8, 6, 22, 0.34)',
  },

  header: {
    height: 96,
    backgroundColor: '#8423D9',
    borderBottomWidth: 8,
    borderBottomColor: '#6C3A99',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 30,
  },

  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.42)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },

  headerMini: {
    fontFamily: 'Jua',
    fontSize: 11,
    color: '#D6B4FC',
  },

  headerTitle: {
    fontFamily: 'Jua',
    fontSize: 28,
    color: '#FFFFFF',
  },

  stageBadge: {
    width: 64,
    height: 38,
    borderRadius: 18,
    backgroundColor: '#7DDA47',
    borderWidth: 3,
    borderColor: '#5FAF2E',
    justifyContent: 'center',
    alignItems: 'center',
  },

  stageBadgeText: {
    fontFamily: 'Jua',
    fontSize: 12,
    color: '#FFFFFF',
  },

  scoreRow: {
    position: 'absolute',
    top: 110,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 12,
    zIndex: 40,
  },

  scoreCard: {
    width: 105,
    backgroundColor: 'rgba(0,0,0,0.72)',
    borderWidth: 3,
    borderColor: '#D6B4FC',
    borderRadius: 18,
    alignItems: 'center',
    paddingVertical: 7,
  },

  scoreValue: {
    fontFamily: 'Jua',
    fontSize: 20,
    color: '#FFFFFF',
  },

  scoreLabel: {
    fontFamily: 'Jua',
    fontSize: 11,
    color: '#D6B4FC',
  },

  characterArea: {
    position: 'absolute',
    top: 150,
    alignSelf: 'center',
    width: width,
    alignItems: 'center',
    height: height * 0.38,
    justifyContent: 'flex-end',
  },

  characterShadow: {
    position: 'absolute',
    bottom: 18,
    width: width * 0.32,
    height: 24,
    borderRadius: 50,
    backgroundColor: 'rgba(0,0,0,0.32)',
  },

  sumiSprite: {
    width: width * 0.46,
    height: height * 0.36,
    resizeMode: 'contain',
  },

  promptPanel: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    width: width * 0.92,
    backgroundColor: 'rgba(0,0,0,0.80)',
    borderWidth: 3,
    borderColor: '#D6B4FC',
    borderRadius: 26,
    padding: 14,
  },

  topPromptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  promptTitle: {
    fontFamily: 'Jua',
    fontSize: 21,
    color: '#FFFFFF',
  },

  sceneText: {
    fontFamily: 'Jua',
    fontSize: 12,
    color: '#D6B4FC',
    marginTop: 1,
  },

  promptBadge: {
    fontFamily: 'Jua',
    fontSize: 11,
    color: '#FFFFFF',
    backgroundColor: '#7DDA47',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    overflow: 'hidden',
  },

  sumiBubble: {
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderWidth: 3,
    borderColor: '#FFD76A',
    borderRadius: 20,
    padding: 11,
    marginTop: 10,
    marginBottom: 10,
  },

  sumiName: {
    fontFamily: 'Jua',
    fontSize: 12,
    color: '#8423D9',
    marginBottom: 3,
  },

  sumiJP: {
    fontFamily: 'Jua',
    fontSize: 19,
    color: '#24170D',
    textAlign: 'center',
  },

  sumiRomaji: {
    fontFamily: 'Jua',
    fontSize: 11,
    color: '#6B4A20',
    textAlign: 'center',
    marginTop: 2,
  },

  sumiEnglish: {
    fontFamily: 'Jua',
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    marginTop: 3,
  },

  expectedBox: {
    backgroundColor: '#F5ECFF',
    borderWidth: 3,
    borderColor: '#D6B4FC',
    borderRadius: 18,
    paddingVertical: 9,
    alignItems: 'center',
    marginBottom: 10,
  },

  expectedLabel: {
    fontFamily: 'Jua',
    fontSize: 11,
    color: '#8423D9',
  },

  expectedJP: {
    fontFamily: 'Jua',
    fontSize: 21,
    color: '#24170D',
  },

  expectedRomaji: {
    fontFamily: 'Jua',
    fontSize: 12,
    color: '#6B4A20',
  },

  micArea: {
    alignItems: 'center',
  },

  micButton: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: '#7DDA47',
    borderWidth: 5,
    borderColor: '#5FAF2E',
    justifyContent: 'center',
    alignItems: 'center',
  },

  micText: {
    fontFamily: 'Jua',
    fontSize: 18,
    color: '#FFFFFF',
  },

  micHint: {
    fontFamily: 'Jua',
    fontSize: 12,
    color: '#FFFFFF',
    marginTop: 6,
  },

  listeningBox: {
    alignItems: 'center',
    paddingVertical: 8,
  },

  listeningRing: {
    position: 'absolute',
    top: 7,
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#7DDA47',
  },

  listeningDot: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#7DDA47',
    borderWidth: 5,
    borderColor: '#5FAF2E',
    justifyContent: 'center',
    alignItems: 'center',
  },

  listeningMicText: {
    fontFamily: 'Jua',
    fontSize: 16,
    color: '#FFFFFF',
  },

  listeningText: {
    fontFamily: 'Jua',
    fontSize: 19,
    color: '#FFFFFF',
    marginTop: 7,
  },

  listeningSub: {
    fontFamily: 'Jua',
    fontSize: 12,
    color: '#D6B4FC',
  },

  feedbackBox: {
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: 22,
    borderWidth: 3,
    borderColor: '#7DDA47',
    padding: 12,
    alignItems: 'center',
  },

  feedbackLabel: {
    fontFamily: 'Jua',
    fontSize: 11,
    color: '#8423D9',
  },

  recognizedText: {
    fontFamily: 'Jua',
    fontSize: 21,
    color: '#24170D',
    marginVertical: 4,
  },

  feedbackText: {
    fontFamily: 'Jua',
    fontSize: 13,
    color: '#333',
    textAlign: 'center',
    lineHeight: 18,
  },

  nextButton: {
    marginTop: 10,
    backgroundColor: '#7DDA47',
    borderWidth: 4,
    borderColor: '#5FAF2E',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 30,
  },

  nextButtonText: {
    fontFamily: 'Jua',
    fontSize: 16,
    color: '#FFFFFF',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalCard: {
    width: '84%',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    borderWidth: 4,
    borderColor: '#D6B4FC',
    padding: 24,
    alignItems: 'center',
  },

  modalSumi: {
    width: 130,
    height: 150,
    resizeMode: 'contain',
    marginBottom: 4,
  },

  modalTitle: {
    fontFamily: 'Jua',
    fontSize: 28,
    color: '#4B256D',
  },

  modalStats: {
    fontFamily: 'Jua',
    fontSize: 18,
    color: '#24170D',
    marginTop: 6,
  },

  modalDesc: {
    fontFamily: 'Jua',
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },

  modalButton: {
    marginTop: 18,
    backgroundColor: '#7DDA47',
    borderWidth: 4,
    borderColor: '#5FAF2E',
    borderRadius: 20,
    paddingVertical: 11,
    paddingHorizontal: 34,
  },

  modalButtonText: {
    fontFamily: 'Jua',
    fontSize: 16,
    color: '#FFFFFF',
  },
});