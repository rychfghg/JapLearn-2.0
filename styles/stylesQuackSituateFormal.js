import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
  background: {
    flex: 1,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(7, 22, 16, 0.28)',
  },

  backButton: {
    position: 'absolute',
    top: 42,
    left: 18,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(23, 48, 38, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    borderWidth: 3,
    borderColor: '#A7E07B',
  },

  headerBoard: {
    marginTop: 34,
    alignSelf: 'center',
    width: width * 0.8,
    backgroundColor: 'rgba(22, 44, 36, 0.52)',
    borderRadius: 28,
    borderWidth: 3,
    borderColor: 'rgba(183, 240, 141, 0.85)',
    paddingVertical: 10,
    alignItems: 'center',
  },

  chapterText: {
    fontFamily: 'Jua',
    fontSize: 11,
    color: '#D8F5C0',
  },

  headerTitle: {
    fontFamily: 'Jua',
    fontSize: 24,
    color: '#FFFFFF',
    textAlign: 'center',
  },

  sceneCard: {
    marginTop: 12,
    alignSelf: 'center',
    width: width * 0.92,
    height: height * 0.39,
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderRadius: 32,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.28)',
    overflow: 'hidden',
  },

  fireflyOne: {
    position: 'absolute',
    top: 52,
    right: 46,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#FFF7A5',
    zIndex: 30,
  },

  fireflyTwo: {
    position: 'absolute',
    top: 135,
    left: 70,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#D8FF9E',
    zIndex: 30,
  },

  fireflyThree: {
    position: 'absolute',
    bottom: 70,
    right: 105,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFF7A5',
    zIndex: 30,
  },

  placeText: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    fontFamily: 'Jua',
    fontSize: 18,
    color: '#FFFFFF',
    zIndex: 20,
    backgroundColor: 'rgba(22, 44, 36, 0.84)',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#A7E07B',
  },

  npcSprite: {
    position: 'absolute',
    left: 0,
    bottom: 18,
    width: width * 0.38,
    height: height * 0.29,
    resizeMode: 'contain',
    zIndex: 6,
  },

  npcBubble: {
    position: 'absolute',
    top: 46,
    right: 12,
    width: width * 0.56,
    backgroundColor: 'rgba(248,255,245,0.95)',
    borderRadius: 24,
    borderTopLeftRadius: 8,
    borderWidth: 3,
    borderColor: '#A7E07B',
    padding: 12,
    zIndex: 20,
  },

  speakerName: {
    fontFamily: 'Jua',
    fontSize: 11,
    color: '#2F5A3D',
    marginBottom: 4,
  },

  npcText: {
    fontFamily: 'Jua',
    fontSize: 13,
    color: '#183225',
    lineHeight: 19,
  },

  duckWrap: {
    position: 'absolute',
    bottom: 16,
    left: width * 0.18,
    zIndex: 10,
  },

  duckGlow: {
    position: 'absolute',
    width: 122,
    height: 122,
    borderRadius: 70,
    backgroundColor: 'rgba(184, 255, 130, 0.22)',
  },

  duckImage: {
    width: width * 0.32,
    height: height * 0.14,
    resizeMode: 'contain',
  },

  duckBubble: {
    position: 'absolute',
    bottom: 18,
    right: 10,
    width: width * 0.56,
    backgroundColor: 'rgba(30, 55, 44, 0.88)',
    borderRadius: 20,
    borderBottomRightRadius: 6,
    borderWidth: 3,
    borderColor: '#B9F18C',
    padding: 11,
    zIndex: 22,
  },

  duckName: {
    fontFamily: 'Jua',
    fontSize: 11,
    color: '#D8F5C0',
    marginBottom: 3,
  },

  duckText: {
    fontFamily: 'Jua',
    fontSize: 13,
    color: '#FFFFFF',
    lineHeight: 18,
  },

  hintButton: {
    marginTop: 10,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 3,
    borderColor: '#8FD26B',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 28,
  },

  hintButtonText: {
    fontFamily: 'Jua',
    fontSize: 14,
    color: '#2F5A3D',
  },

  choiceContainer: {
    marginTop: 10,
    alignItems: 'center',
  },

  choiceCard: {
    width: width * 0.9,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 26,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 11,
    borderWidth: 3,
    borderColor: '#8FD26B',
  },

  selectedChoice: {
    backgroundColor: '#F1FFE7',
    borderColor: '#C8FF9B',
  },

  choiceJP: {
    fontFamily: 'Jua',
    fontSize: 23,
    color: '#183225',
    textAlign: 'center',
  },

  choiceRomaji: {
    fontFamily: 'Jua',
    fontSize: 12,
    color: '#2F5A3D',
    textAlign: 'center',
    marginTop: 4,
  },

  choiceMeaning: {
    fontFamily: 'Jua',
    fontSize: 11,
    color: '#557A56',
    textAlign: 'center',
    marginTop: 3,
  },

  dialogueBox: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    width: width * 0.58,
    backgroundColor: 'rgba(30, 55, 44, 0.88)',
    borderRadius: 22,
    borderWidth: 3,
    borderColor: '#B9F18C',
    padding: 11,
  },

  dialogueText: {
    fontFamily: 'Jua',
    fontSize: 13,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 18,
  },

  submitButton: {
    position: 'absolute',
    bottom: 26,
    right: 18,
    backgroundColor: '#7ACB4E',
    borderWidth: 4,
    borderColor: '#C8FF9B',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 32,
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
    backgroundColor: '#F8FFF5',
    borderRadius: 30,
    borderWidth: 4,
    borderColor: '#8FD26B',
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
    color: '#2F5A3D',
    fontFamily: 'Jua',
  },

  modalDuck: {
    width: 110,
    height: 110,
    resizeMode: 'contain',
    marginBottom: 4,
  },

  modalTitle: {
    fontFamily: 'Jua',
    fontSize: 29,
    color: '#2F5A3D',
    marginBottom: 8,
    textAlign: 'center',
  },

  modalText: {
    fontFamily: 'Jua',
    fontSize: 15,
    color: '#183225',
    textAlign: 'center',
    lineHeight: 22,
  },

  modalButton: {
    marginTop: 20,
    backgroundColor: '#7ACB4E',
    borderWidth: 4,
    borderColor: '#C8FF9B',
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