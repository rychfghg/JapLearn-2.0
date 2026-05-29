import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
  background: {
    flex: 1,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(12, 8, 28, 0.46)',
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: '#160F2E',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingBackground: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    opacity: 0.45,
  },

  loadingDuck: {
    width: 130,
    height: 130,
    resizeMode: 'contain',
    marginBottom: 15,
  },

  loadingTitle: {
    fontFamily: 'Jua',
    fontSize: 38,
    color: '#FFFFFF',
    marginBottom: 18,
  },

  loadingBarOuter: {
    width: width * 0.72,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#D6B4FC',
    overflow: 'hidden',
  },

  loadingBarInner: {
    height: '100%',
    backgroundColor: '#7DDA47',
  },

  loadingPercent: {
    marginTop: 10,
    fontFamily: 'Jua',
    fontSize: 18,
    color: '#FFFFFF',
  },

  header: {
    height: 98,
    backgroundColor: '#8423D9',
    borderBottomWidth: 8,
    borderBottomColor: '#6C3A99',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
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
    fontSize: 29,
    color: '#FFFFFF',
  },

  headerDuck: {
    width: 48,
    height: 48,
    resizeMode: 'contain',
  },

  stage: {
    flex: 1,
    position: 'relative',
  },

  stageTitle: {
    marginTop: 24,
    fontFamily: 'Jua',
    fontSize: 34,
    color: '#FFFFFF',
    textAlign: 'center',
  },

  stageSubtitle: {
    fontFamily: 'Jua',
    fontSize: 14,
    color: '#E8D8FF',
    textAlign: 'center',
    marginTop: 2,
  },

  centerDuck: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 130,
    width: width * 0.38,
    height: height * 0.2,
    resizeMode: 'contain',
    zIndex: 4,
  },

  pathLine: {
    position: 'absolute',
    top: 170,
    alignSelf: 'center',
    width: 8,
    height: height * 0.47,
    borderRadius: 10,
    backgroundColor: 'rgba(214,180,252,0.62)',
    zIndex: 1,
  },

  missionNode: {
    position: 'absolute',
    width: width * 0.38,
    minHeight: 122,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderWidth: 4,
    padding: 12,
    alignItems: 'center',
    zIndex: 5,
  },

  nodeOne: {
    top: 125,
    left: 28,
    borderColor: '#7DDA47',
  },

  nodeTwo: {
    top: 275,
    right: 28,
    borderColor: '#FFB84D',
  },

  nodeThree: {
    top: 425,
    left: 28,
    borderColor: '#D6B4FC',
  },

  nodeCircleActive: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#7DDA47',
    borderWidth: 4,
    borderColor: '#5FAF2E',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -38,
    marginBottom: 6,
  },

  nodeCircleTimer: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFB84D',
    borderWidth: 4,
    borderColor: '#E89022',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -38,
    marginBottom: 6,
  },

  nodeCircleLocked: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#8423D9',
    borderWidth: 4,
    borderColor: '#D6B4FC',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -38,
    marginBottom: 6,
  },

  nodeNumber: {
    fontFamily: 'Jua',
    fontSize: 15,
    color: '#FFFFFF',
  },

  nodeTitle: {
    fontFamily: 'Jua',
    fontSize: 18,
    color: '#4B256D',
    textAlign: 'center',
  },

  nodeDesc: {
    fontFamily: 'Jua',
    fontSize: 11,
    color: '#2A1C10',
    textAlign: 'center',
    marginTop: 4,
  },

  nodeStatusReady: {
    marginTop: 8,
    backgroundColor: '#7DDA47',
    color: '#FFFFFF',
    fontFamily: 'Jua',
    fontSize: 10,
    paddingHorizontal: 13,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },

  nodeStatusTimer: {
    marginTop: 8,
    backgroundColor: '#FFB84D',
    color: '#FFFFFF',
    fontFamily: 'Jua',
    fontSize: 10,
    paddingHorizontal: 13,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },

  nodeStatusLocked: {
    marginTop: 8,
    backgroundColor: '#8423D9',
    color: '#FFFFFF',
    fontFamily: 'Jua',
    fontSize: 10,
    paddingHorizontal: 13,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },

  coachBubble: {
    position: 'absolute',
    bottom: 28,
    alignSelf: 'center',
    width: width * 0.88,
    backgroundColor: 'rgba(0,0,0,0.78)',
    borderRadius: 22,
    borderWidth: 3,
    borderColor: '#D6B4FC',
    padding: 13,
  },

  coachName: {
    fontFamily: 'Jua',
    fontSize: 12,
    color: '#D6B4FC',
    marginBottom: 3,
  },

  coachText: {
    fontFamily: 'Jua',
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});