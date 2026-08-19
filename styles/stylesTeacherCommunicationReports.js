import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  background: {
    flex: 1,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(12, 7, 28, 0.5)',
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

  selectorCard: {
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

  summaryCard: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 28,
    borderWidth: 4,
    borderColor: '#D6B4FC',
    padding: 18,
    alignItems: 'center',
  },

  summaryTitle: {
    fontFamily: 'Jua',
    fontSize: 25,
    color: '#4B256D',
    textAlign: 'center',
  },

  summaryText: {
    fontFamily: 'Jua',
    fontSize: 13,
    color: '#333',
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 6,
  },

  generateButton: {
    marginTop: 16,
    backgroundColor: '#7DDA47',
    borderRadius: 22,
    borderWidth: 4,
    borderColor: '#5FAF2E',
    paddingVertical: 12,
    paddingHorizontal: 28,
  },

  generateButtonText: {
    fontFamily: 'Jua',
    fontSize: 16,
    color: '#FFFFFF',
  },

  loadingCard: {
    marginTop: 16,
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

  emptyCard: {
    marginTop: 16,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#FFD76A',
    padding: 22,
    alignItems: 'center',
  },

  emptyTitle: {
    fontFamily: 'Jua',
    fontSize: 22,
    color: '#4B256D',
  },

  emptyText: {
    fontFamily: 'Jua',
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },

  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },

  metricBox: {
    width: width * 0.29,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#D6B4FC',
    paddingVertical: 12,
    alignItems: 'center',
  },

  metricValue: {
    fontFamily: 'Jua',
    fontSize: 24,
    color: '#8423D9',
  },

  metricLabel: {
    fontFamily: 'Jua',
    fontSize: 11,
    color: '#4B256D',
  },

  sectionTitle: {
    fontFamily: 'Jua',
    fontSize: 22,
    color: '#FFFFFF',
    marginTop: 18,
    marginBottom: 10,
  },

  reportCard: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#D6B4FC',
    padding: 15,
  },

  progressTrack: {
    height: 18,
    backgroundColor: '#E9DDF7',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#D6B4FC',
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#7DDA47',
  },

  cardText: {
    fontFamily: 'Jua',
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginTop: 10,
    textAlign: 'center',
  },

  mistakeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF2F2',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#FF7A7A',
    padding: 11,
    marginBottom: 9,
  },

  mistakeNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FF7A7A',
    color: '#FFFFFF',
    fontFamily: 'Jua',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 30,
    marginRight: 10,
  },

  mistakeText: {
    flex: 1,
    fontFamily: 'Jua',
    fontSize: 13,
    color: '#331111',
    lineHeight: 18,
  },

  historyRow: {
    backgroundColor: '#F5ECFF',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#D6B4FC',
    padding: 12,
    marginBottom: 9,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  historyStage: {
    fontFamily: 'Jua',
    fontSize: 15,
    color: '#24170D',
  },

  historyStatus: {
    fontFamily: 'Jua',
    fontSize: 11,
    color: '#8423D9',
    marginTop: 2,
  },

  historyScore: {
    fontFamily: 'Jua',
    fontSize: 20,
    color: '#8423D9',
  },

  exportButton: {
    marginTop: 20,
    backgroundColor: '#8423D9',
    borderRadius: 24,
    borderWidth: 4,
    borderColor: '#D6B4FC',
    paddingVertical: 15,
    alignItems: 'center',
  },

  exportButtonText: {
    fontFamily: 'Jua',
    fontSize: 18,
    color: '#FFFFFF',
  },
});