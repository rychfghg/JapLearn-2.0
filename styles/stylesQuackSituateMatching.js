import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const stylesMatching = StyleSheet.create({
  container: {
    flex: 1,
  },

  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(7, 22, 16, 0.28)',
  },

  backButton: {
    position: 'absolute',
    top: 42,
    left: 18,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(23, 48, 38, 0.82)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    borderWidth: 3,
    borderColor: '#A7E07B',
  },

  titleBoard: {
    position: 'absolute',
    top: 34,
    alignSelf: 'center',
    width: width * 0.72,
    backgroundColor: 'rgba(22, 44, 36, 0.58)',
    borderColor: 'rgba(183, 240, 141, 0.9)',
    borderWidth: 3,
    borderRadius: 26,
    paddingVertical: 10,
    paddingHorizontal: 18,
    zIndex: 90,
  },

  titleText: {
    fontFamily: 'Jua',
    fontSize: 25,
    color: '#FFFFFF',
    textAlign: 'center',
  },

  subtitleText: {
    fontFamily: 'Jua',
    fontSize: 12,
    color: '#D8F5C0',
    textAlign: 'center',
    marginTop: 2,
  },

  stage: {
    flex: 1,
  },

  ropeLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 20,
  },

  columnLabelLeft: {
    position: 'absolute',
    backgroundColor: 'rgba(22, 44, 36, 0.9)',
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 14,
    zIndex: 40,
    borderWidth: 2,
    borderColor: '#A7E07B',
  },

  columnLabelRight: {
    position: 'absolute',
    backgroundColor: 'rgba(22, 44, 36, 0.9)',
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 14,
    zIndex: 40,
    borderWidth: 2,
    borderColor: '#A7E07B',
  },

  columnLabelText: {
    fontFamily: 'Jua',
    fontSize: 12,
    color: '#FFFFFF',
  },

  expressionNode: {
    position: 'absolute',
    width: 168,
    height: 104,
    zIndex: 35,
  },

  sceneNode: {
    position: 'absolute',
    width: 168,
    height: 114,
    zIndex: 35,
  },

  duckSprite: {
    position: 'absolute',
    width: 68,
    height: 68,
    resizeMode: 'contain',
    left: -18,
    bottom: -5,
    zIndex: 50,
  },

  expressionCard: {
    marginLeft: 36,
    height: 96,
    borderRadius: 22,
    backgroundColor: 'rgba(248, 255, 245, 0.94)',
    borderWidth: 3,
    borderColor: '#8FD26B',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },

  sceneCard: {
    height: 108,
    borderRadius: 22,
    backgroundColor: 'rgba(248, 255, 245, 0.94)',
    borderWidth: 3,
    borderColor: '#8FD26B',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },

  selectedCard: {
    backgroundColor: '#F1FFE7',
    borderColor: '#C8FF9B',
  },

  correctCard: {
    borderColor: '#7ACB4E',
    backgroundColor: '#F1FFE7',
  },

  wrongCard: {
    borderColor: '#E94B3C',
    backgroundColor: '#FFE4DF',
  },

  jpText: {
    fontFamily: 'Jua',
    fontSize: 21,
    color: '#183225',
    textAlign: 'center',
  },

  romajiText: {
    fontFamily: 'Jua',
    fontSize: 11,
    color: '#2F5A3D',
    textAlign: 'center',
    marginTop: 4,
  },

  sceneEmoji: {
    fontSize: 31,
    marginBottom: 5,
  },

  sceneText: {
    fontFamily: 'Jua',
    fontSize: 13,
    color: '#183225',
    textAlign: 'center',
    lineHeight: 18,
  },

  anchorRight: {
    position: 'absolute',
    right: -12,
    top: 40,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#C8FF9B',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    zIndex: 70,
  },

  anchorLeft: {
    position: 'absolute',
    left: -12,
    top: 45,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#C8FF9B',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    zIndex: 70,
  },

  floatingDuckGlow: {
    position: 'absolute',
    bottom: 126,
    alignSelf: 'center',
    width: 155,
    height: 155,
    borderRadius: 80,
    backgroundColor: 'rgba(184, 255, 130, 0.22)',
    zIndex: 3,
  },

  characterImage: {
    position: 'absolute',
    bottom: 94,
    alignSelf: 'center',
    width: width * 0.36,
    height: height * 0.19,
    resizeMode: 'contain',
    zIndex: 4,
  },

  bottomBar: {
    position: 'absolute',
    bottom: 118,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 14,
    zIndex: 70,
  },

  dialogueContainer: {
    position: 'absolute',
    bottom: 18,
    alignSelf: 'center',
    width: width * 0.88,
    backgroundColor: 'rgba(30, 55, 44, 0.9)',
    borderRadius: 18,
    borderWidth: 3,
    borderColor: '#B9F18C',
    paddingVertical: 10,
    paddingHorizontal: 14,
    zIndex: 60,
  },

  dialogueText: {
    fontFamily: 'Jua',
    fontSize: 13,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 18,
  },

  gameButton: {
    backgroundColor: '#7ACB4E',
    borderWidth: 4,
    borderColor: '#C8FF9B',
    borderRadius: 22,
    paddingVertical: 11,
    paddingHorizontal: 30,
  },

  gameButtonText: {
    fontFamily: 'Jua',
    fontSize: 17,
    color: '#FFFFFF',
  },

  resetButton: {
    backgroundColor: 'rgba(30, 55, 44, 0.92)',
    borderWidth: 4,
    borderColor: '#8FD26B',
    borderRadius: 22,
    paddingVertical: 11,
    paddingHorizontal: 30,
  },

  resetButtonText: {
    fontFamily: 'Jua',
    fontSize: 17,
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
    borderRadius: 28,
    borderWidth: 4,
    borderColor: '#8FD26B',
    padding: 24,
    alignItems: 'center',
  },

  modalCloseButton: {
    position: 'absolute',
    top: 12,
    right: 16,
    zIndex: 10,
  },

  modalCloseText: {
    fontFamily: 'Jua',
    fontSize: 20,
    color: '#2F5A3D',
  },

  modalDuck: {
    width: 105,
    height: 105,
    resizeMode: 'contain',
    marginBottom: 4,
  },

  modalTitle: {
    fontFamily: 'Jua',
    fontSize: 29,
    color: '#2F5A3D',
    marginBottom: 10,
    textAlign: 'center',
  },

  modalText: {
    fontFamily: 'Jua',
    fontSize: 16,
    color: '#183225',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
});