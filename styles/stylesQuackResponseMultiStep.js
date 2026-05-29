// styles/stylesQuackResponseMultiStep.js

import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
  background: {
    flex: 1,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8, 6, 20, 0.42)',
  },

  /* HEADER */

  header: {
    height: 105,
    backgroundColor: '#8423D9',
    borderBottomWidth: 7,
    borderBottomColor: '#5C2D91',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    zIndex: 50,
  },

  backButtonContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(0,0,0,0.34)',
    justifyContent: 'center',
    alignItems: 'center',

    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
  },

  headerTitleBox: {
    flex: 1,
    alignItems: 'center',
  },

  headerMini: {
    fontFamily: 'Jua',
    fontSize: 11,
    color: '#DCC6FF',
    letterSpacing: 1,
  },

  headerTitle: {
    fontFamily: 'Jua',
    fontSize: 30,
    color: '#FFFFFF',
    marginTop: 1,
  },

  headerDuck: {
    width: 48,
    height: 48,
    resizeMode: 'contain',
  },

  /* HUD */

  hud: {
    position: 'absolute',
    top: 118,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 12,
    zIndex: 40,
  },

  hudCard: {
    width: 92,
    paddingVertical: 10,

    backgroundColor: 'rgba(0,0,0,0.72)',
    borderRadius: 18,

    borderWidth: 2,
    borderColor: '#C79DFF',

    alignItems: 'center',
  },

  hudLabel: {
    fontFamily: 'Jua',
    fontSize: 11,
    color: '#D6B4FC',
  },

  hudValue: {
    fontFamily: 'Jua',
    fontSize: 20,
    color: '#FFFFFF',
    marginTop: 2,
  },

  /* TIMER */

  timerContainer: {
    position: 'absolute',
    top: 182,
    alignSelf: 'center',

    width: width * 0.82,
    height: 24,

    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 16,
    overflow: 'hidden',

    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',

    zIndex: 30,
  },

  timerBar: {
    height: '100%',
    backgroundColor: '#7DDA47',
    borderRadius: 16,
  },

  timerText: {
    position: 'absolute',
    alignSelf: 'center',
    top: 2,

    fontFamily: 'Jua',
    fontSize: 14,
    color: '#FFFFFF',
  },

  /* CHARACTER AREA */

  characterScene: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 70,
  },

  boySprite: {
    position: 'absolute',
    left: -10,
    bottom: 150,

    width: width * 0.48,
    height: height * 0.50,

    resizeMode: 'contain',
  },

  sumiSprite: {
    position: 'absolute',
    right: -15,
    bottom: 145,

    width: width * 0.50,
    height: height * 0.53,

    resizeMode: 'contain',
  },

  /* DIALOGUE */

  dialogueBox: {
    position: 'absolute',
    top: height * 0.47,
    alignSelf: 'center',

    width: width * 0.9,

    backgroundColor: 'rgba(10,10,20,0.88)',
    borderRadius: 28,

    paddingVertical: 16,
    paddingHorizontal: 18,

    borderWidth: 3,
    borderColor: '#D6B4FC',

    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 8,
  },

  speaker: {
    fontFamily: 'Jua',
    fontSize: 15,
    color: '#D6B4FC',
    marginBottom: 7,
  },

  jp: {
    fontFamily: 'Jua',
    fontSize: 24,
    color: '#FFFFFF',
    lineHeight: 32,
  },

  romaji: {
    fontFamily: 'Jua',
    fontSize: 14,
    color: '#FFD76A',
    marginTop: 6,
  },

  english: {
    fontFamily: 'Jua',
    fontSize: 13,
    color: '#D9D9D9',
    lineHeight: 20,
    marginTop: 7,
  },

  narration: {
    fontFamily: 'Jua',
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 24,
  },

  /* CHOICES */

  choiceContainer: {
    position: 'absolute',
    bottom: 28,
    alignSelf: 'center',

    width: width * 0.93,

    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  choiceButton: {
    width: '48%',
    minHeight: 92,

    backgroundColor: 'rgba(255,255,255,0.96)',

    borderRadius: 22,

    borderWidth: 3,
    borderColor: '#D6B4FC',

    justifyContent: 'center',
    alignItems: 'center',

    paddingHorizontal: 10,
    marginBottom: 12,

    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 5,
  },

  choiceJP: {
    fontFamily: 'Jua',
    fontSize: 21,
    color: '#23170F',
    textAlign: 'center',
  },

  choiceRomaji: {
    fontFamily: 'Jua',
    fontSize: 11,
    color: '#7A5527',
    marginTop: 4,
    textAlign: 'center',
  },

  /* REPLY */

  replyContainer: {
    position: 'absolute',
    bottom: 34,
    alignSelf: 'center',

    width: width * 0.9,

    backgroundColor: 'rgba(0,0,0,0.9)',
    borderRadius: 28,

    borderWidth: 3,
    borderColor: '#7DDA47',

    padding: 20,

    alignItems: 'center',
  },

  replySpeaker: {
    fontFamily: 'Jua',
    fontSize: 13,
    color: '#7DDA47',
    marginBottom: 7,
  },

  replyJP: {
    fontFamily: 'Jua',
    fontSize: 24,
    color: '#FFFFFF',
    textAlign: 'center',
  },

  replyRomaji: {
    fontFamily: 'Jua',
    fontSize: 13,
    color: '#FFE066',
    textAlign: 'center',
    marginTop: 5,
  },

  replyEnglish: {
    fontFamily: 'Jua',
    fontSize: 13,
    color: '#D8D8D8',
    textAlign: 'center',
    marginTop: 7,
    lineHeight: 20,
  },

  nextButton: {
    marginTop: 18,

    backgroundColor: '#7DDA47',

    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#5AA62D',

    paddingVertical: 12,
    paddingHorizontal: 34,
  },

  nextButtonText: {
    fontFamily: 'Jua',
    fontSize: 17,
    color: '#FFFFFF',
  },

  /* FINISH */

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.74)',
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
    fontSize: 32,
    color: '#4A2572',
    marginBottom: 14,
  },

  resultScore: {
    fontFamily: 'Jua',
    fontSize: 24,
    color: '#7DDA47',
    marginBottom: 10,
  },

  resultSub: {
    fontFamily: 'Jua',
    fontSize: 15,
    color: '#333',
    marginBottom: 5,
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
    fontSize: 18,
    color: '#FFFFFF',
  },
});