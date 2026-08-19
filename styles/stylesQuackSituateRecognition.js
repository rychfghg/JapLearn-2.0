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
    backgroundColor: 'rgba(24, 16, 8, 0.42)',
  },

  backButton: {
    position: 'absolute',
    top: 38,
    left: 18,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(70, 42, 20, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
    borderWidth: 3,
    borderColor: '#D9A35F',
  },

  topBoard: {
    alignSelf: 'center',
    marginTop: 30,
    backgroundColor: 'rgba(63, 37, 17, 0.94)',
    borderWidth: 4,
    borderColor: '#D9A35F',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },

  levelText: {
    fontFamily: 'Jua',
    fontSize: 12,
    color: '#F7DFAF',
  },

  titleText: {
    fontFamily: 'Jua',
    fontSize: 27,
    color: '#FFF6DC',
  },

  progressWrap: {
    alignSelf: 'center',
    width: '86%',
    marginTop: 10,
  },

  progressText: {
    fontFamily: 'Jua',
    fontSize: 12,
    color: '#FFF6DC',
    marginBottom: 4,
  },

  progressTrack: {
    height: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 2,
    borderColor: 'rgba(255,246,220,0.5)',
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    width: '35%',
    backgroundColor: '#F5C84B',
    borderRadius: 8,
  },

  scenarioCard: {
    alignSelf: 'center',
    marginTop: 10,
    width: '90%',
    backgroundColor: 'rgba(255, 246, 220, 0.18)',
    borderWidth: 3,
    borderColor: 'rgba(217, 163, 95, 0.8)',
    borderRadius: 26,
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
    color: '#FFF6DC',
  },

  liveBadge: {
    backgroundColor: '#5E8C3A',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 2,
    borderColor: '#BDEB7A',
  },

  liveBadgeText: {
    fontFamily: 'Jua',
    fontSize: 10,
    color: '#FFFFFF',
  },

  scenarioGif: {
    width: '100%',
    height: height * 0.17,
    borderRadius: 20,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: '#D9A35F',
  },

  questionBox: {
    backgroundColor: 'rgba(63, 37, 17, 0.92)',
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#D9A35F',
    padding: 10,
  },

  questionText: {
    fontFamily: 'Jua',
    fontSize: 14,
    color: '#FFF6DC',
    textAlign: 'center',
    lineHeight: 20,
  },

  answerLabel: {
    alignSelf: 'center',
    marginTop: 10,
    backgroundColor: 'rgba(63, 37, 17, 0.94)',
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#D9A35F',
  },

  answerLabelText: {
    fontFamily: 'Jua',
    fontSize: 13,
    color: '#FFF6DC',
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
    minHeight: 70,
    backgroundColor: 'rgba(255, 248, 236, 0.96)',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#D9A35F',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },

  choiceSelected: {
    backgroundColor: '#FFF0C8',
    borderColor: '#F5C84B',
  },

  choiceTopRow: {
    position: 'absolute',
    top: 6,
    right: 8,
    zIndex: 10,
  },

  hintButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F5C84B',
    borderWidth: 2,
    borderColor: '#8B5A2B',
    justifyContent: 'center',
    alignItems: 'center',
  },

  hintText: {
    fontSize: 14,
  },

  choiceJP: {
    fontFamily: 'Jua',
    fontSize: 19,
    color: '#2F2417',
    textAlign: 'center',
    marginTop: 4,
  },

  choiceRomaji: {
    fontFamily: 'Jua',
    fontSize: 11,
    color: '#6B4A20',
    textAlign: 'center',
    marginTop: 3,
  },

  guideArea: {
    position: 'absolute',
    bottom: 86,
    left: 14,
    right: 14,
    height: height * 0.2,
  },

  duckGlow: {
    position: 'absolute',
    bottom: 0,
    left: 12,
    width: 125,
    height: 125,
    borderRadius: 80,
    backgroundColor: 'rgba(245, 200, 75, 0.28)',
  },

  characterImage: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: width * 0.32,
    height: height * 0.18,
    resizeMode: 'contain',
  },

  dialogueContainer: {
    position: 'absolute',
    bottom: 28,
    left: width * 0.3,
    right: 4,
    backgroundColor: 'rgba(63, 37, 17, 0.94)',
    borderWidth: 3,
    borderColor: '#D9A35F',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },

  dialogueText: {
    fontFamily: 'Jua',
    fontSize: 13,
    color: '#FFF6DC',
    textAlign: 'center',
    lineHeight: 18,
  },

  submitButton: {
    position: 'absolute',
    bottom: 24,
    right: 18,
    width: 112,
    height: 58,
    borderRadius: 22,
    backgroundColor: '#8B5A2B',
    borderWidth: 4,
    borderColor: '#D9A35F',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.32,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },

  submitButtonText: {
    fontFamily: 'Jua',
    fontSize: 18,
    color: '#FFF6DC',
  },

  effectImage: {
    position: 'absolute',
    width: 90,
    height: 90,
    resizeMode: 'contain',
    top: '47%',
    left: '50%',
    marginLeft: -45,
    zIndex: 80,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.68)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalCard: {
    width: '84%',
    backgroundColor: '#FFF6DC',
    borderRadius: 28,
    borderWidth: 4,
    borderColor: '#D9A35F',
    padding: 24,
    alignItems: 'center',
  },

  modalCloseButton: {
    position: 'absolute',
    top: 10,
    right: 14,
    zIndex: 10,
  },

  modalCloseText: {
    fontFamily: 'Jua',
    fontSize: 20,
    color: '#5C351A',
  },

  modalTitle: {
    fontFamily: 'Jua',
    fontSize: 30,
    color: '#5C351A',
    marginBottom: 8,
  },

  modalJP: {
    fontFamily: 'Jua',
    fontSize: 28,
    color: '#2F2417',
    textAlign: 'center',
  },

  modalRomaji: {
    fontFamily: 'Jua',
    fontSize: 15,
    color: '#8B5A2B',
    marginBottom: 10,
  },

  modalText: {
    fontFamily: 'Jua',
    fontSize: 15,
    color: '#33200F',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 15,
  },

  modalReward: {
    fontFamily: 'Jua',
    fontSize: 16,
    color: '#5E8C3A',
    marginBottom: 14,
    textAlign: 'center',
  },

  modalButton: {
    backgroundColor: '#8B5A2B',
    borderWidth: 4,
    borderColor: '#D9A35F',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 36,
  },

  modalButtonText: {
    fontFamily: 'Jua',
    fontSize: 18,
    color: '#FFF6DC',
  },
});