import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const stylesRecognition = StyleSheet.create({
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
    backgroundColor: 'rgba(18, 10, 36, 0.35)',
  },

  backButton: {
    position: 'absolute',
    top: 38,
    left: 18,
    width: 46,
    height: 46,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.58)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
  },

  topBoard: {
    alignSelf: 'center',
    marginTop: 28,
    backgroundColor: 'rgba(0,0,0,0.72)',
    borderWidth: 3,
    borderColor: '#D6B4FC',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 26,
    alignItems: 'center',
  },

  levelText: {
    fontFamily: 'Jua',
    fontSize: 13,
    color: '#D6B4FC',
  },

  titleText: {
    fontFamily: 'Jua',
    fontSize: 29,
    color: '#FFFFFF',
  },

  scenarioCard: {
    alignSelf: 'center',
    marginTop: 16,
    width: '90%',
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 24,
    padding: 12,
    overflow: 'hidden',
  },

  scenarioHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  scenarioTitle: {
    fontFamily: 'Jua',
    fontSize: 22,
    color: '#FFFFFF',
  },

  liveBadge: {
    backgroundColor: '#8ED94D',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  liveBadgeText: {
    fontFamily: 'Jua',
    fontSize: 11,
    color: '#FFFFFF',
  },

  scenarioGif: {
    width: '100%',
    height: 170,
    borderRadius: 18,
    marginBottom: 10,
  },

  questionBox: {
    backgroundColor: 'rgba(0,0,0,0.62)',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#D6B4FC',
    padding: 10,
  },

  questionText: {
    fontFamily: 'Jua',
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 20,
  },

  answerLabel: {
    alignSelf: 'center',
    marginTop: 10,
    backgroundColor: 'rgba(0,0,0,0.58)',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.18)',
  },

  answerLabelText: {
    fontFamily: 'Jua',
    fontSize: 13,
    color: '#F5F2FF',
  },

  choiceGrid: {
    marginTop: 8,
    alignSelf: 'center',
    width: '90%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  choiceButton: {
    width: '48%',
    minHeight: 66,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 18,
    borderWidth: 3,
    borderColor: '#FFD76A',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginBottom: 10,
  },

  choiceSelected: {
    backgroundColor: '#E9FFD7',
    borderColor: '#7DD83D',
  },

  choiceJP: {
    fontFamily: 'Jua',
    fontSize: 19,
    color: '#2F2417',
    textAlign: 'center',
  },

  choiceRomaji: {
    fontFamily: 'Jua',
    fontSize: 12,
    color: '#6B4A20',
    textAlign: 'center',
    marginTop: 3,
  },

  duckGlow: {
    position: 'absolute',
    bottom: 70,
    left: 22,
    width: 130,
    height: 130,
    borderRadius: 80,
    backgroundColor: 'rgba(214,180,252,0.38)',
  },

  characterImage: {
    position: 'absolute',
    bottom: 62,
    left: 8,
    width: width * 0.36,
    height: height * 0.2,
    resizeMode: 'contain',
  },

  dialogueContainer: {
    position: 'absolute',
    bottom: 20,
    left: width * 0.32,
    width: width * 0.43,
    backgroundColor: 'rgba(0,0,0,0.78)',
    borderWidth: 3,
    borderColor: '#D6B4FC',
    borderRadius: 16,
    padding: 10,
  },

  dialogueText: {
    fontFamily: 'Jua',
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 17,
  },

  submitButton: {
    position: 'absolute',
    bottom: 24,
    right: 15,
    width: 90,
    height: 55,
    borderRadius: 18,
    backgroundColor: '#8ED94D',
    borderWidth: 4,
    borderColor: '#5FAF2E',
    justifyContent: 'center',
    alignItems: 'center',
  },

  submitButtonText: {
    fontFamily: 'Jua',
    fontSize: 17,
    color: '#FFFFFF',
  },

  effectImage: {
    position: 'absolute',
    width: 80,
    height: 80,
    resizeMode: 'contain',
    top: '47%',
    left: '50%',
    marginLeft: -40,
    zIndex: 50,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.68)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalCard: {
    width: '84%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 4,
    borderColor: '#D6B4FC',
    padding: 22,
    alignItems: 'center',
  },

  modalCloseButton: {
    position: 'absolute',
    top: 10,
    right: 12,
    zIndex: 10,
  },

  modalCloseText: {
    fontFamily: 'Jua',
    fontSize: 20,
    color: '#8423D9',
  },

  modalTitle: {
    fontFamily: 'Jua',
    fontSize: 30,
    color: '#8423D9',
    marginBottom: 8,
  },

  modalJP: {
    fontFamily: 'Jua',
    fontSize: 28,
    color: '#222222',
    textAlign: 'center',
  },

  modalRomaji: {
    fontFamily: 'Jua',
    fontSize: 15,
    color: '#6C3A99',
    marginBottom: 10,
  },

  modalText: {
    fontFamily: 'Jua',
    fontSize: 15,
    color: '#333333',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 15,
  },

  modalButton: {
    backgroundColor: '#8ED94D',
    borderWidth: 4,
    borderColor: '#5FAF2E',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 35,
  },

  modalButtonText: {
    fontFamily: 'Jua',
    fontSize: 18,
    color: '#FFFFFF',
  },
});