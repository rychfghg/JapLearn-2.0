import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
  background: {
    flex: 1,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 8, 28, 0.48)',
  },

  backButton: {
    position: 'absolute',
    top: 38,
    left: 18,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.62)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
  },

  headerBoard: {
    marginTop: 34,
    alignSelf: 'center',
    width: width * 0.74,
    backgroundColor: 'rgba(0,0,0,0.78)',
    borderRadius: 25,
    borderWidth: 3,
    borderColor: '#D6B4FC',
    paddingVertical: 9,
    alignItems: 'center',
  },

  chapterText: {
    fontFamily: 'Jua',
    fontSize: 11,
    color: '#D6B4FC',
  },

  headerTitle: {
    fontFamily: 'Jua',
    fontSize: 29,
    color: '#FFFFFF',
  },

  respectPanel: {
    marginTop: 12,
    alignSelf: 'center',
    width: width * 0.88,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    padding: 10,
  },

  respectLabel: {
    fontFamily: 'Jua',
    fontSize: 13,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 6,
  },

  respectBar: {
    height: 17,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 12,
    overflow: 'hidden',
  },

  respectFill: {
    height: '100%',
    backgroundColor: '#7DDA47',
    borderRadius: 12,
  },

  respectValue: {
    marginTop: 4,
    fontFamily: 'Jua',
    fontSize: 13,
    color: '#FFD76A',
    textAlign: 'center',
  },

  scenePanel: {
    marginTop: 12,
    alignSelf: 'center',
    width: width * 0.92,
    height: height * 0.39,
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.28)',
    overflow: 'hidden',
  },

  professorSprite: {
    position: 'absolute',
    left: 6,
    bottom: 46,
    width: width * 0.36,
    height: height * 0.31,
    resizeMode: 'contain',
    zIndex: 5,
  },

  professorBubble: {
    position: 'absolute',
    top: 30,
    right: 12,
    width: width * 0.56,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderTopLeftRadius: 6,
    borderWidth: 4,
    borderColor: '#FFD76A',
    padding: 13,
    zIndex: 10,
  },

  speakerName: {
    fontFamily: 'Jua',
    fontSize: 11,
    color: '#8423D9',
    marginBottom: 4,
  },

  professorText: {
    fontFamily: 'Jua',
    fontSize: 13,
    color: '#24170D',
    lineHeight: 19,
  },

  duckWrap: {
    position: 'absolute',
    bottom: 20,
    left: width * 0.17,
    zIndex: 8,
  },

  duckGlow: {
    position: 'absolute',
    width: 118,
    height: 118,
    borderRadius: 70,
    backgroundColor: 'rgba(214,180,252,0.36)',
  },

  duckImage: {
    width: width * 0.32,
    height: height * 0.14,
    resizeMode: 'contain',
  },

  duckBubble: {
    position: 'absolute',
    bottom: 22,
    right: 10,
    width: width * 0.56,
    backgroundColor: 'rgba(0,0,0,0.78)',
    borderRadius: 20,
    borderBottomRightRadius: 6,
    borderWidth: 3,
    borderColor: '#D6B4FC',
    padding: 11,
    zIndex: 12,
  },

  duckName: {
    fontFamily: 'Jua',
    fontSize: 11,
    color: '#D6B4FC',
    marginBottom: 3,
  },

  duckText: {
    fontFamily: 'Jua',
    fontSize: 13,
    color: '#FFFFFF',
    lineHeight: 19,
  },

  choiceContainer: {
    marginTop: 14,
    alignItems: 'center',
  },

  choiceCard: {
    width: width * 0.88,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 24,
    paddingVertical: 15,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 4,
    borderColor: '#D6B4FC',
  },

  selectedChoice: {
    backgroundColor: '#FFFBEA',
    borderColor: '#7DDA47',
  },

  choiceJP: {
    fontFamily: 'Jua',
    fontSize: 23,
    color: '#24170D',
    textAlign: 'center',
  },

  choiceRomaji: {
    fontFamily: 'Jua',
    fontSize: 12,
    color: '#73511F',
    textAlign: 'center',
    marginTop: 4,
  },

  dialogueBox: {
    position: 'absolute',
    bottom: 86,
    alignSelf: 'center',
    width: width * 0.88,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 18,
    borderWidth: 3,
    borderColor: '#D6B4FC',
    padding: 11,
  },

  dialogueText: {
    fontFamily: 'Jua',
    fontSize: 13,
    color: '#FFFFFF',
    textAlign: 'center',
  },

  submitButton: {
    position: 'absolute',
    bottom: 22,
    alignSelf: 'center',
    backgroundColor: '#7DDA47',
    borderWidth: 4,
    borderColor: '#5FAF2E',
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 44,
  },

  submitButtonText: {
    fontFamily: 'Jua',
    fontSize: 18,
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
    borderRadius: 30,
    borderWidth: 4,
    borderColor: '#D6B4FC',
    padding: 24,
    alignItems: 'center',
  },

  closeButton: {
    position: 'absolute',
    top: 14,
    right: 16,
  },

  closeButtonText: {
    fontSize: 20,
    color: '#8423D9',
    fontFamily: 'Jua',
  },

  modalTitle: {
    fontFamily: 'Jua',
    fontSize: 29,
    color: '#5A2D84',
    marginBottom: 8,
  },

  modalRank: {
    fontFamily: 'Jua',
    fontSize: 20,
    color: '#7DDA47',
    marginBottom: 10,
  },

  modalText: {
    fontFamily: 'Jua',
    fontSize: 15,
    color: '#333',
    textAlign: 'center',
    lineHeight: 22,
  },

  modalButton: {
    marginTop: 20,
    backgroundColor: '#7DDA47',
    borderWidth: 4,
    borderColor: '#5FAF2E',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 34,
  },

  modalButtonText: {
    fontFamily: 'Jua',
    fontSize: 17,
    color: '#FFFFFF',
  },
});