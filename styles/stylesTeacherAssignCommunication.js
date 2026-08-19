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
    fontSize: 24,
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

  loadingCard: {
    margin: 20,
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

  summaryCard: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 28,
    borderWidth: 4,
    borderColor: '#D6B4FC',
    padding: 18,
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

  assignmentCountRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    marginTop: 16,
  },

  countBox: {
    width: width * 0.3,
    backgroundColor: '#F5ECFF',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#D6B4FC',
    paddingVertical: 10,
    alignItems: 'center',
  },

  countValue: {
    fontFamily: 'Jua',
    fontSize: 24,
    color: '#8423D9',
  },

  countLabel: {
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

  filterChip: {
    backgroundColor: '#F5ECFF',
    borderWidth: 2,
    borderColor: '#D6B4FC',
    borderRadius: 18,
    paddingVertical: 9,
    paddingHorizontal: 16,
    marginRight: 8,
  },

  filterChipActive: {
    backgroundColor: '#8423D9',
    borderColor: '#6C3A99',
  },

  filterChipText: {
    fontFamily: 'Jua',
    fontSize: 13,
    color: '#4B256D',
  },

  filterChipTextActive: {
    color: '#FFFFFF',
  },

  activityCard: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#D6B4FC',
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  activityCardSelected: {
    borderColor: '#7DDA47',
    backgroundColor: '#F1FFE8',
  },

  activityCode: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: '#8423D9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  activityCodeText: {
    fontFamily: 'Jua',
    fontSize: 16,
    color: '#FFFFFF',
  },

  activityInfo: {
    flex: 1,
  },

  activityTitle: {
    fontFamily: 'Jua',
    fontSize: 18,
    color: '#24170D',
  },

  activityMeta: {
    fontFamily: 'Jua',
    fontSize: 11,
    color: '#8423D9',
    marginTop: 2,
  },

  activityDesc: {
    fontFamily: 'Jua',
    fontSize: 12,
    color: '#333',
    lineHeight: 17,
    marginTop: 4,
  },

  selectMark: {
    fontFamily: 'Jua',
    fontSize: 24,
    color: '#8423D9',
    marginLeft: 8,
  },

  classChip: {
    backgroundColor: '#FFF2D0',
    borderWidth: 3,
    borderColor: '#FFD76A',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginRight: 8,
  },

  classChipActive: {
    backgroundColor: '#7DDA47',
    borderColor: '#5FAF2E',
  },

  classChipText: {
    fontFamily: 'Jua',
    fontSize: 14,
    color: '#4B256D',
  },

  classChipTextActive: {
    color: '#FFFFFF',
  },

  studentCard: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#D6B4FC',
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  studentCardSelected: {
    backgroundColor: '#F1FFE8',
    borderColor: '#7DDA47',
  },

  studentName: {
    fontFamily: 'Jua',
    fontSize: 17,
    color: '#24170D',
  },

  studentEmail: {
    fontFamily: 'Jua',
    fontSize: 11,
    color: '#777',
    marginTop: 2,
  },

  studentCheck: {
    fontFamily: 'Jua',
    fontSize: 24,
    color: '#8423D9',
  },

  deadlineInput: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#D6B4FC',
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontFamily: 'Jua',
    fontSize: 15,
    color: '#24170D',
  },

  assignButton: {
    marginTop: 20,
    backgroundColor: '#7DDA47',
    borderRadius: 24,
    borderWidth: 4,
    borderColor: '#5FAF2E',
    paddingVertical: 15,
    alignItems: 'center',
  },

  assignButtonText: {
    fontFamily: 'Jua',
    fontSize: 18,
    color: '#FFFFFF',
  },
});