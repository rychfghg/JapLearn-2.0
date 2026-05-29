import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
  background: {
    flex: 1,
  },

  dimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8, 5, 24, 0.22)',
  },

  bottomGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: height * 0.5,
    backgroundColor: 'rgba(12, 8, 25, 0.45)',
  },

  header: {
    height: 98,
    backgroundColor: '#8423D9',
    borderBottomWidth: 8,
    borderBottomColor: '#6C3A99',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 40,
  },

  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.42)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTextBox: {
    flex: 1,
    alignItems: 'center',
  },

  headerLabel: {
    fontFamily: 'Jua',
    fontSize: 11,
    color: '#D6B4FC',
    letterSpacing: 1,
  },

  headerTitle: {
    fontFamily: 'Jua',
    fontSize: 30,
    color: '#FFFFFF',
  },

  levelBadge: {
    width: 56,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#7DDA47',
    borderWidth: 3,
    borderColor: '#5FAF2E',
    justifyContent: 'center',
    alignItems: 'center',
  },

  levelBadgeText: {
    fontFamily: 'Jua',
    fontSize: 13,
    color: '#FFFFFF',
  },

  stage: {
    flex: 1,
    overflow: 'hidden',
  },

  glassTitle: {
    marginTop: 16,
    alignSelf: 'center',
    width: width * 0.86,
    backgroundColor: 'rgba(0,0,0,0.56)',
    borderWidth: 3,
    borderColor: '#D6B4FC',
    borderRadius: 22,
    paddingVertical: 10,
    alignItems: 'center',
  },

  titleMini: {
    fontFamily: 'Jua',
    fontSize: 11,
    color: '#D6B4FC',
    letterSpacing: 1,
  },

  titleText: {
    fontFamily: 'Jua',
    fontSize: 24,
    color: '#FFFFFF',
  },

  sumiSprite: {
    position: 'absolute',
    right: -10,
    bottom: height * 0.21,
    width: width * 0.56,
    height: height * 0.55,
    resizeMode: 'contain',
    zIndex: 6,
  },

  dialogueBox: {
    position: 'absolute',
    left: 18,
    top: height * 0.2,
    width: width * 0.55,
    backgroundColor: 'rgba(0,0,0,0.78)',
    borderWidth: 3,
    borderColor: '#D6B4FC',
    borderRadius: 22,
    borderBottomRightRadius: 8,
    padding: 14,
    zIndex: 12,
  },

  speakerName: {
    fontFamily: 'Jua',
    fontSize: 13,
    color: '#D6B4FC',
    marginBottom: 5,
  },

  dialogueText: {
    fontFamily: 'Jua',
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },

  missionDock: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    width: width * 0.92,
    zIndex: 20,
  },

  mainMissionButton: {
    width: '100%',
    minHeight: 92,
    backgroundColor: 'rgba(0,0,0,0.78)',
    borderWidth: 3,
    borderColor: '#7DDA47',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 13,
  },

  missionCode: {
    width: 54,
    height: 54,
    borderRadius: 17,
    backgroundColor: '#7DDA47',
    borderWidth: 3,
    borderColor: '#5FAF2E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  missionCodeText: {
    fontFamily: 'Jua',
    fontSize: 17,
    color: '#FFFFFF',
  },

  mainMissionTextBox: {
    flex: 1,
  },

  mainMissionTitle: {
    fontFamily: 'Jua',
    fontSize: 20,
    color: '#FFFFFF',
  },

  mainMissionDesc: {
    fontFamily: 'Jua',
    fontSize: 12,
    color: '#E8E8E8',
    marginTop: 3,
  },

  playButton: {
    backgroundColor: '#8423D9',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#D6B4FC',
    paddingVertical: 8,
    paddingHorizontal: 13,
  },

  playButtonText: {
    fontFamily: 'Jua',
    fontSize: 12,
    color: '#FFFFFF',
  },

  sideMissionRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  sideMission: {
    width: '48%',
    height: 88,
    backgroundColor: 'rgba(0,0,0,0.66)',
    borderWidth: 3,
    borderColor: '#D6B4FC',
    borderRadius: 22,
    padding: 10,
    justifyContent: 'center',
  },

  sideMissionCode: {
    fontFamily: 'Jua',
    fontSize: 11,
    color: '#7DDA47',
    marginBottom: 3,
  },

  sideMissionTitle: {
    fontFamily: 'Jua',
    fontSize: 14,
    color: '#FFFFFF',
  },

  sideMissionStatus: {
    fontFamily: 'Jua',
    fontSize: 11,
    color: '#D6B4FC',
    marginTop: 3,
  },
});