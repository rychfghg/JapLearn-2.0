import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
  background: {
    flex: 1,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8, 6, 22, 0.36)',
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
    fontSize: 27,
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

  sumiArea: {
    position: 'absolute',
    top: 128,
    alignSelf: 'center',
    width,
    height: height * 0.32,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  shadow: {
    position: 'absolute',
    bottom: 8,
    width: width * 0.28,
    height: 24,
    borderRadius: 50,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },

  sumiSprite: {
    width: width * 0.42,
    height: height * 0.31,
    resizeMode: 'contain',
  },

  panel: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    width: width * 0.92,
    maxHeight: height * 0.56,
    backgroundColor: 'rgba(0,0,0,0.82)',
    borderWidth: 3,
    borderColor: '#D6B4FC',
    borderRadius: 26,
    padding: 14,
  },

  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  taskTitle: {
    fontFamily: 'Jua',
    fontSize: 22,
    color: '#FFFFFF',
  },

  taskPrompt: {
    fontFamily: 'Jua',
    fontSize: 12,
    color: '#D6B4FC',
    marginTop: 2,
    maxWidth: width * 0.62,
  },

  scorePill: {
    backgroundColor: '#7DDA47',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },

  scorePillText: {
    fontFamily: 'Jua',
    fontSize: 12,
    color: '#FFFFFF',
  },

  guideBox: {
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderWidth: 3,
    borderColor: '#FFD76A',
    borderRadius: 20,
    padding: 11,
    alignItems: 'center',
  },

  guideLabel: {
    fontFamily: 'Jua',
    fontSize: 11,
    color: '#8423D9',
  },

  guideJP: {
    fontFamily: 'Jua',
    fontSize: 21,
    color: '#24170D',
    textAlign: 'center',
    marginTop: 3,
  },

  guideRomaji: {
    fontFamily: 'Jua',
    fontSize: 12,
    color: '#6B4A20',
    textAlign: 'center',
    marginTop: 2,
  },

  guideEnglish: {
    fontFamily: 'Jua',
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    marginTop: 3,
  },

  micSection: {
    alignItems: 'center',
    marginTop: 13,
  },

  micButton: {
    width: 84,
    height: 84,
    borderRadius: 42,
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

  helperText: {
    fontFamily: 'Jua',
    fontSize: 12,
    color: '#FFFFFF',
    marginTop: 7,
    textAlign: 'center',
  },

  listeningBox: {
    alignItems: 'center',
    marginTop: 13,
  },

  recordCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#FF6B6B',
    borderWidth: 5,
    borderColor: '#FFB1B1',
    justifyContent: 'center',
    alignItems: 'center',
  },

  recordText: {
    fontFamily: 'Jua',
    fontSize: 18,
    color: '#FFFFFF',
  },

  listeningText: {
    fontFamily: 'Jua',
    fontSize: 20,
    color: '#FFFFFF',
    marginTop: 7,
  },

  analysisScroll: {
    marginTop: 10,
  },

  recognizedBox: {
    backgroundColor: '#F5ECFF',
    borderWidth: 3,
    borderColor: '#D6B4FC',
    borderRadius: 18,
    padding: 11,
    alignItems: 'center',
    marginBottom: 10,
  },

  analysisLabel: {
    fontFamily: 'Jua',
    fontSize: 11,
    color: '#8423D9',
  },

  recognizedText: {
    fontFamily: 'Jua',
    fontSize: 21,
    color: '#24170D',
    textAlign: 'center',
  },

  analysisBox: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 20,
    padding: 12,
    marginBottom: 10,
  },

  analysisTitle: {
    fontFamily: 'Jua',
    fontSize: 16,
    color: '#4B256D',
    marginBottom: 8,
  },

  issueCard: {
    backgroundColor: '#FFF7E4',
    borderRadius: 15,
    padding: 10,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#FFD76A',
  },

  issueWord: {
    fontFamily: 'Jua',
    fontSize: 16,
    color: '#24170D',
  },

  issueText: {
    fontFamily: 'Jua',
    fontSize: 12,
    color: '#A14D4D',
    marginTop: 2,
  },

  issueTip: {
    fontFamily: 'Jua',
    fontSize: 12,
    color: '#333',
    marginTop: 3,
    lineHeight: 17,
  },

  noteText: {
    fontFamily: 'Jua',
    fontSize: 12,
    color: '#333',
    lineHeight: 18,
    marginBottom: 4,
  },

  nextButton: {
    alignSelf: 'center',
    marginTop: 3,
    marginBottom: 8,
    backgroundColor: '#7DDA47',
    borderWidth: 4,
    borderColor: '#5FAF2E',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 32,
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
    fontSize: 27,
    color: '#4B256D',
    textAlign: 'center',
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