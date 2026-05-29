import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
  background: {
    flex: 1,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5,5,18,0.45)',
  },

  header: {
    height: 105,
    backgroundColor: '#8423D9',
    borderBottomWidth: 7,
    borderBottomColor: '#5D2A91',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
  },

  backButtonContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitleBox: {
    flex: 1,
    alignItems: 'center',
  },

  headerMini: {
    fontFamily: 'Jua',
    fontSize: 11,
    color: '#DCC6FF',
  },

  headerTitle: {
    fontFamily: 'Jua',
    fontSize: 30,
    color: '#FFFFFF',
  },

  headerDuck: {
    width: 48,
    height: 48,
    resizeMode: 'contain',
  },

  topHud: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },

  hudBox: {
    width: 90,
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#C79DFF',
  },

  hudLabel: {
    fontFamily: 'Jua',
    fontSize: 12,
    color: '#D6B4FC',
  },

  hudValue: {
    fontFamily: 'Jua',
    fontSize: 24,
    color: '#FFFFFF',
  },

  timerBarBg: {
    width: width * 0.85,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    overflow: 'hidden',
    alignSelf: 'center',
    marginTop: 16,
  },

  timerBar: {
    height: '100%',
    backgroundColor: '#7DDA47',
  },

  timerText: {
    alignSelf: 'center',
    marginTop: 8,
    fontFamily: 'Jua',
    fontSize: 26,
    color: '#FFFFFF',
  },

  character: {
    width: width * 0.55,
    height: height * 0.42,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: 10,
  },

  dialogueBox: {
    width: width * 0.9,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.82)',
    borderRadius: 26,
    borderWidth: 3,
    borderColor: '#D6B4FC',
    padding: 18,
    marginTop: -20,
  },

  speaker: {
    fontFamily: 'Jua',
    fontSize: 15,
    color: '#D6B4FC',
  },

  jp: {
    fontFamily: 'Jua',
    fontSize: 24,
    color: '#FFFFFF',
    marginTop: 5,
  },

  romaji: {
    fontFamily: 'Jua',
    fontSize: 13,
    color: '#FFD76A',
    marginTop: 4,
  },

  english: {
    fontFamily: 'Jua',
    fontSize: 13,
    color: '#D9D9D9',
    marginTop: 7,
  },

  choiceContainer: {
    width: width * 0.92,
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 18,
  },

  choiceButton: {
    width: '48%',
    minHeight: 88,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 22,
    borderWidth: 3,
    borderColor: '#D6B4FC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
  },

  choiceJP: {
    fontFamily: 'Jua',
    fontSize: 20,
    color: '#24170D',
    textAlign: 'center',
  },

  choiceRomaji: {
    fontFamily: 'Jua',
    fontSize: 11,
    color: '#734E24',
    marginTop: 4,
  },

  resultContainer: {
    marginTop: 24,
    alignItems: 'center',
  },

  resultText: {
    fontFamily: 'Jua',
    fontSize: 32,
  },

  correct: {
    color: '#7DDA47',
  },

  wrong: {
    color: '#FF6767',
  },

  nextButton: {
    marginTop: 16,
    backgroundColor: '#7DDA47',
    borderWidth: 3,
    borderColor: '#5CA92F',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 34,
  },

  nextButtonText: {
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
    borderRadius: 30,
    borderWidth: 4,
    borderColor: '#D6B4FC',
    padding: 28,
    alignItems: 'center',
  },

  resultTitle: {
    fontFamily: 'Jua',
    fontSize: 30,
    color: '#4A2572',
  },

  finalScore: {
    fontFamily: 'Jua',
    fontSize: 22,
    color: '#7DDA47',
    marginTop: 14,
  },

  finishButton: {
    marginTop: 22,
    backgroundColor: '#8423D9',
    borderRadius: 22,
    borderWidth: 3,
    borderColor: '#5C2D91',
    paddingVertical: 12,
    paddingHorizontal: 34,
  },

  finishText: {
    fontFamily: 'Jua',
    fontSize: 17,
    color: '#FFFFFF',
  },
});