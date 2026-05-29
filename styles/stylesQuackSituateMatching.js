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
    backgroundColor: 'rgba(15, 8, 32, 0.45)',
  },

  backButton: {
    position: 'absolute',
    top: 40,
    left: 18,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 90,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
  },

  titleBoard: {
    position: 'absolute',
    top: 34,
    alignSelf: 'center',
    width: width * 0.72,
    backgroundColor: 'rgba(0,0,0,0.76)',
    borderColor: '#D6B4FC',
    borderWidth: 3,
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 22,
    zIndex: 80,
  },

  titleText: {
    fontFamily: 'Jua',
    fontSize: 26,
    color: '#FFFFFF',
    textAlign: 'center',
  },

  subtitleText: {
    fontFamily: 'Jua',
    fontSize: 13,
    color: '#E6D2FF',
    textAlign: 'center',
    marginTop: 2,
  },

  stage: {
    flex: 1,
    paddingTop: 115,
  },

  ropeLayer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 5,
  },

  columnLabelLeft: {
    position: 'absolute',
    top: 112,
    left: 28,
    backgroundColor: 'rgba(0,0,0,0.62)',
    borderRadius: 14,
    paddingVertical: 5,
    paddingHorizontal: 12,
    zIndex: 30,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },

  columnLabelRight: {
    position: 'absolute',
    top: 112,
    right: 42,
    backgroundColor: 'rgba(0,0,0,0.62)',
    borderRadius: 14,
    paddingVertical: 5,
    paddingHorizontal: 12,
    zIndex: 30,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },

  columnLabelText: {
    fontFamily: 'Jua',
    fontSize: 12,
    color: '#FFFFFF',
  },

  expressionNode: {
    position: 'absolute',
    width: 174,
    height: 102,
    zIndex: 25,
  },

  sceneNode: {
    position: 'absolute',
    width: 174,
    height: 112,
    zIndex: 25,
  },

  duckSprite: {
    position: 'absolute',
    width: 68,
    height: 68,
    resizeMode: 'contain',
    left: -12,
    bottom: -5,
    zIndex: 35,
  },

  expressionCard: {
    marginLeft: 38,
    height: 94,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 3,
    borderColor: '#FFD76A',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOpacity: 0.32,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },

  sceneCard: {
    height: 104,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 3,
    borderColor: '#FFD76A',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOpacity: 0.32,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },

  selectedCard: {
    backgroundColor: '#EEFFD9',
    borderColor: '#7DDA47',
  },

  jpText: {
    fontFamily: 'Jua',
    fontSize: 21,
    color: '#2A1C10',
    textAlign: 'center',
  },

  romajiText: {
    fontFamily: 'Jua',
    fontSize: 11,
    color: '#73511F',
    textAlign: 'center',
    marginTop: 4,
  },

  sceneEmoji: {
    fontSize: 32,
    marginBottom: 5,
  },

  sceneText: {
    fontFamily: 'Jua',
    fontSize: 13,
    color: '#2A1C10',
    textAlign: 'center',
    lineHeight: 18,
  },

  anchorRight: {
    position: 'absolute',
    right: -9,
    top: 40,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFE066',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    zIndex: 45,
  },

  anchorLeft: {
    position: 'absolute',
    left: -10,
    top: 43,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFE066',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    zIndex: 45,
  },

  floatingDuckGlow: {
    position: 'absolute',
    bottom: 105,
    alignSelf: 'center',
    width: 165,
    height: 165,
    borderRadius: 90,
    backgroundColor: 'rgba(214,180,252,0.36)',
    zIndex: 1,
  },

  characterImage: {
    position: 'absolute',
    bottom: 72,
    alignSelf: 'center',
    width: width * 0.44,
    height: height * 0.22,
    resizeMode: 'contain',
    zIndex: 2,
  },

  dialogueContainer: {
    position: 'absolute',
    bottom: 18,
    alignSelf: 'center',
    width: width * 0.88,
    backgroundColor: 'rgba(0,0,0,0.78)',
    borderRadius: 18,
    borderWidth: 3,
    borderColor: '#D6B4FC',
    paddingVertical: 10,
    paddingHorizontal: 14,
    zIndex: 35,
  },

  dialogueText: {
    fontFamily: 'Jua',
    fontSize: 13,
    color: 'white',
    textAlign: 'center',
    lineHeight: 18,
  },

  bottomBar: {
    position: 'absolute',
    bottom: 128,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 14,
    zIndex: 50,
  },

  gameButton: {
    backgroundColor: '#7DDA47',
    borderWidth: 4,
    borderColor: '#5FAF2E',
    borderRadius: 20,
    paddingVertical: 11,
    paddingHorizontal: 30,
    shadowColor: '#000',
    shadowOpacity: 0.26,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },

  gameButtonText: {
    fontFamily: 'Jua',
    fontSize: 17,
    color: '#FFFFFF',
  },

  resetButton: {
    backgroundColor: '#8423D9',
    borderWidth: 4,
    borderColor: '#D6B4FC',
    borderRadius: 20,
    paddingVertical: 11,
    paddingHorizontal: 30,
    shadowColor: '#000',
    shadowOpacity: 0.26,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
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
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    borderWidth: 4,
    borderColor: '#D6B4FC',
    padding: 24,
    alignItems: 'center',
  },

  modalTitle: {
    fontFamily: 'Jua',
    fontSize: 30,
    color: '#5A2D84',
    marginBottom: 10,
    textAlign: 'center',
  },

  modalText: {
    fontFamily: 'Jua',
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
});