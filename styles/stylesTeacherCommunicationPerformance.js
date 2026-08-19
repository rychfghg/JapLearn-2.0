import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  background: {
    flex: 1,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(12, 7, 28, 0.48)',
  },

  header: {
    height: 100,
    backgroundColor: '#8423D9',
    borderBottomWidth: 8,
    borderBottomColor: '#6C3A99',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },

  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },

  headerMini: {
    fontFamily: 'Jua',
    fontSize: 10,
    color: '#D6B4FC',
    letterSpacing: 1,
  },

  headerTitle: {
    fontFamily: 'Jua',
    fontSize: 25,
    color: '#FFFFFF',
    textAlign: 'center',
  },

  teacherIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 45,
  },

  summaryCard: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 28,
    borderWidth: 4,
    borderColor: '#D6B4FC',
    padding: 18,
  },

  summaryTitle: {
    fontFamily: 'Jua',
    fontSize: 24,
    color: '#4B256D',
    textAlign: 'center',
  },

  summaryText: {
    fontFamily: 'Jua',
    fontSize: 13,
    color: '#333333',
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 6,
  },

  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },

  metricBox: {
    width: '31%',
    backgroundColor: '#F5ECFF',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#D6B4FC',
    paddingVertical: 12,
    alignItems: 'center',
  },

  metricValue: {
    fontFamily: 'Jua',
    fontSize: 25,
    color: '#8423D9',
  },

  metricLabel: {
    fontFamily: 'Jua',
    fontSize: 10,
    color: '#4B256D',
    textAlign: 'center',
  },

  sectionTitle: {
    fontFamily: 'Jua',
    fontSize: 22,
    color: '#FFFFFF',
    marginTop: 18,
    marginBottom: 10,
  },

  moduleCard: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#FFD76A',
    padding: 15,
    marginBottom: 12,
  },

  moduleTitle: {
    fontFamily: 'Jua',
    fontSize: 20,
    color: '#4B256D',
  },

  moduleDesc: {
    fontFamily: 'Jua',
    fontSize: 12,
    color: '#333333',
    lineHeight: 17,
    marginTop: 4,
  },

  progressTrack: {
    height: 15,
    backgroundColor: '#E8D7FF',
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 10,
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#7DDA47',
    borderRadius: 20,
  },

  progressText: {
    fontFamily: 'Jua',
    fontSize: 11,
    color: '#6C5A72',
    marginTop: 5,
  },

  studentCard: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#D6B4FC',
    padding: 15,
    marginBottom: 12,
  },

  studentTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  studentName: {
    fontFamily: 'Jua',
    fontSize: 18,
    color: '#24170D',
  },

  studentAccuracy: {
    fontFamily: 'Jua',
    fontSize: 17,
    color: '#FFFFFF',
    backgroundColor: '#8423D9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    overflow: 'hidden',
  },

  studentInfoBox: {
    backgroundColor: '#EEFFD9',
    borderRadius: 16,
    padding: 10,
    marginTop: 10,
    borderWidth: 2,
    borderColor: '#7DDA47',
  },

  studentInfoBoxWeak: {
    backgroundColor: '#FFF2D0',
    borderRadius: 16,
    padding: 10,
    marginTop: 8,
    borderWidth: 2,
    borderColor: '#FFD76A',
  },

  infoLabel: {
    fontFamily: 'Jua',
    fontSize: 11,
    color: '#8423D9',
  },

  infoText: {
    fontFamily: 'Jua',
    fontSize: 14,
    color: '#24170D',
    marginTop: 2,
  },

  recommendationCard: {
    backgroundColor: 'rgba(0,0,0,0.78)',
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#FFD76A',
    padding: 15,
    marginTop: 4,
  },

  recommendationTitle: {
    fontFamily: 'Jua',
    fontSize: 20,
    color: '#FFD76A',
  },

  recommendationText: {
    fontFamily: 'Jua',
    fontSize: 13,
    color: '#FFFFFF',
    lineHeight: 19,
    marginTop: 5,
  },
  studentSelectCard: {
  backgroundColor: 'rgba(255,255,255,0.96)',
  borderRadius: 24,
  borderWidth: 3,
  borderColor: '#D6B4FC',
  padding: 14,
  marginBottom: 14,
},

sectionTitleDark: {
  fontFamily: 'Jua',
  fontSize: 20,
  color: '#4B256D',
  marginBottom: 10,
},

studentChip: {
  backgroundColor: '#F5ECFF',
  borderWidth: 2,
  borderColor: '#D6B4FC',
  borderRadius: 18,
  paddingVertical: 9,
  paddingHorizontal: 16,
  marginRight: 8,
},

studentChipActive: {
  backgroundColor: '#8423D9',
  borderColor: '#6C3A99',
},

studentChipText: {
  fontFamily: 'Jua',
  fontSize: 13,
  color: '#4B256D',
},

studentChipTextActive: {
  color: '#FFFFFF',
},

loadingCard: {
  backgroundColor: 'rgba(255,255,255,0.96)',
  borderRadius: 24,
  borderWidth: 3,
  borderColor: '#D6B4FC',
  padding: 25,
  alignItems: 'center',
},

loadingText: {
  fontFamily: 'Jua',
  fontSize: 14,
  color: '#4B256D',
  marginTop: 10,
},

cardHeading: {
  fontFamily: 'Jua',
  fontSize: 19,
  color: '#4B256D',
  marginBottom: 10,
},

emptyText: {
  fontFamily: 'Jua',
  fontSize: 13,
  color: '#777',
  textAlign: 'center',
},
});