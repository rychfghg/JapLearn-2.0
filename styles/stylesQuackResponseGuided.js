import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
  background: {
    flex: 1,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 7, 25, 0.30)',
  },

  header: {
    height: 98,
    backgroundColor: '#8423D9',
    borderBottomWidth: 8,
    borderBottomColor: '#6C3A99',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 50,
  },

  backButtonContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitleBox: {
    flex: 1,
    alignItems: 'center',
  },

  headerSmall: {
    fontFamily: 'Jua',
    fontSize: 11,
    color: '#D6B4FC',
    letterSpacing: 1,
  },

  headerTitle: {
    fontFamily: 'Jua',
    fontSize: 27,
    color: '#FFFFFF',
  },

  headerDuck: {
    width: 48,
    height: 48,
    resizeMode: 'contain',
  },

  scoreHud: {
    position: 'absolute',
    top: 126,
    alignSelf: 'center',
    flexDirection: 'row',
    zIndex: 40,
    gap: 10,
  },

  scoreBox: {
    width: 96,
    backgroundColor: 'rgba(0,0,0,0.76)',
    borderRadius: 18,
    borderWidth: 3,
    borderColor: '#D6B4FC',
    paddingVertical: 7,
    alignItems: 'center',
  },

  scoreLabel: {
    fontFamily: 'Jua',
    fontSize: 10,
    color: '#D6B4FC',
  },

  scoreValue: {
    fontFamily: 'Jua',
    fontSize: 19,
    color: '#FFFFFF',
  },

  stage: {
    flex: 1,
    alignItems: 'center',
    overflow: 'hidden',
  },

  locationPill: {
    marginTop: 82,
    backgroundColor: 'rgba(0,0,0,0.74)',
    borderColor: '#D6B4FC',
    borderWidth: 3,
    borderRadius: 18,
    paddingVertical: 7,
    paddingHorizontal: 24,
    zIndex: 20,
  },

  locationText: {
    fontFamily: 'Jua',
    fontSize: 14,
    color: '#FFFFFF',
  },

  characterScene: {
    width,
    height: height * 0.49,
    marginTop: -4,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },

  boySprite: {
    position: 'absolute',
    left: width * 0.02,
    bottom: -30,
    width: width * 0.47,
    height: height * 0.51,
    resizeMode: 'contain',
  },

  sumiSprite: {
    position: 'absolute',
    right: width * 0.02,
    bottom: -30,
    width: width * 0.47,
    height: height * 0.51,
    resizeMode: 'contain',
  },

  dialogueBox: {
    position: 'absolute',
    bottom: 24,
    width: width * 0.9,
    backgroundColor: 'rgba(0,0,0,0.84)',
    borderColor: '#D6B4FC',
    borderWidth: 3,
    borderRadius: 22,
    paddingVertical: 13,
    paddingHorizontal: 15,
    zIndex: 30,
  },

  speakerName: {
    fontFamily: 'Jua',
    fontSize: 14,
    color: '#D6B4FC',
    marginBottom: 4,
  },

  jpLine: {
    fontFamily: 'Jua',
    fontSize: 21,
    color: '#FFFFFF',
    textAlign: 'center',
  },

  romajiLine: {
    fontFamily: 'Jua',
    fontSize: 12,
    color: '#D6B4FC',
    textAlign: 'center',
    marginBottom: 5,
  },

  dialogueText: {
    fontFamily: 'Jua',
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 21,
    textAlign: 'center',
  },

  tapHint: {
    fontFamily: 'Jua',
    fontSize: 11,
    color: '#7DDA47',
    textAlign: 'right',
    marginTop: 6,
  },

  choicePanel: {
    position: 'absolute',
    bottom: 14,
    width: width * 0.92,
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderColor: '#FFD76A',
    borderWidth: 4,
    borderRadius: 26,
    padding: 13,
    zIndex: 35,
  },

  choiceTitle: {
    fontFamily: 'Jua',
    fontSize: 21,
    color: '#4B256D',
    textAlign: 'center',
  },

  choicePrompt: {
    fontFamily: 'Jua',
    fontSize: 12,
    color: '#2A1C10',
    textAlign: 'center',
    marginBottom: 9,
  },

  choiceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  choiceButton: {
    width: '48%',
    minHeight: 65,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: '#D6B4FC',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 6,
  },

  choiceSelected: {
    borderColor: '#7DDA47',
    backgroundColor: '#F1FFE8',
  },

  choiceJP: {
    fontFamily: 'Jua',
    fontSize: 17,
    color: '#24170D',
    textAlign: 'center',
  },

  choiceRomaji: {
    fontFamily: 'Jua',
    fontSize: 10,
    color: '#6B4A20',
    textAlign: 'center',
    marginTop: 2,
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
    padding: 22,
    alignItems: 'center',
  },

  closeButton: {
    position: 'absolute',
    top: 13,
    right: 16,
    zIndex: 10,
  },

  closeText: {
    fontFamily: 'Jua',
    fontSize: 20,
    color: '#8423D9',
  },

  modalNpc: {
    width: 110,
    height: 135,
    resizeMode: 'contain',
    marginBottom: -8,
  },

  resultTitle: {
    fontFamily: 'Jua',
    fontSize: 28,
    color: '#4B256D',
    marginBottom: 8,
  },

  resultText: {
    fontFamily: 'Jua',
    fontSize: 15,
    color: '#333',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 12,
  },

  npcReaction: {
    fontFamily: 'Jua',
    fontSize: 15,
    color: '#333',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 12,
  },

  answerBox: {
    width: '100%',
    backgroundColor: '#F5ECFF',
    borderColor: '#D6B4FC',
    borderWidth: 3,
    borderRadius: 18,
    padding: 11,
    alignItems: 'center',
  },

  answerLabel: {
    fontFamily: 'Jua',
    fontSize: 12,
    color: '#8423D9',
  },

  answerJP: {
    fontFamily: 'Jua',
    fontSize: 23,
    color: '#24170D',
  },

  answerRomaji: {
    fontFamily: 'Jua',
    fontSize: 13,
    color: '#6B4A20',
  },

  modalButton: {
    marginTop: 14,
    backgroundColor: '#7DDA47',
    borderWidth: 4,
    borderColor: '#5FAF2E',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 30,
  },

  modalButtonText: {
    fontFamily: 'Jua',
    fontSize: 16,
    color: '#FFFFFF',
  },
});