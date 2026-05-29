import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
  background: {
    flex: 1,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8, 6, 22, 0.48)',
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

  scoreBadge: {
    width: 64,
    height: 38,
    borderRadius: 18,
    backgroundColor: '#7DDA47',
    borderWidth: 3,
    borderColor: '#5FAF2E',
    justifyContent: 'center',
    alignItems: 'center',
  },

  scoreBadgeText: {
    fontFamily: 'Jua',
    fontSize: 13,
    color: '#FFFFFF',
  },

  profilePanel: {
    marginTop: 14,
    alignSelf: 'center',
    width: width * 0.92,
    minHeight: 115,
    backgroundColor: 'rgba(0,0,0,0.76)',
    borderWidth: 3,
    borderColor: '#D6B4FC',
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },

  sumiImage: {
    width: 85,
    height: 95,
    resizeMode: 'contain',
    marginRight: 10,
  },

  profileTextBox: {
    flex: 1,
  },

  profileTitle: {
    fontFamily: 'Jua',
    fontSize: 22,
    color: '#FFFFFF',
  },

  profileSubtitle: {
    fontFamily: 'Jua',
    fontSize: 12,
    color: '#D6B4FC',
    lineHeight: 17,
    marginTop: 3,
  },

  tabRow: {
    marginTop: 12,
    alignSelf: 'center',
    width: width * 0.92,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.62)',
    borderRadius: 22,
    padding: 5,
    borderWidth: 2,
    borderColor: '#D6B4FC',
  },

  tabButton: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 17,
  },

  tabActive: {
    backgroundColor: '#7DDA47',
  },

  tabText: {
    fontFamily: 'Jua',
    fontSize: 13,
    color: '#D6B4FC',
  },

  tabTextActive: {
    color: '#FFFFFF',
  },

  contentScroll: {
    marginTop: 12,
    alignSelf: 'center',
    width: width * 0.92,
    maxHeight: height * 0.63,
  },

  reportCard: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 22,
    borderWidth: 3,
    borderColor: '#D6B4FC',
    padding: 15,
    marginBottom: 12,
  },

  cardTitle: {
    fontFamily: 'Jua',
    fontSize: 18,
    color: '#4B256D',
    marginBottom: 8,
  },

  cardText: {
    fontFamily: 'Jua',
    fontSize: 13,
    color: '#333',
    lineHeight: 19,
    marginBottom: 5,
  },

  bigScore: {
    fontFamily: 'Jua',
    fontSize: 36,
    color: '#4B256D',
    textAlign: 'center',
  },

  progressTrack: {
    height: 14,
    backgroundColor: '#E7D6FF',
    borderRadius: 10,
    overflow: 'hidden',
    marginVertical: 8,
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#7DDA47',
    borderRadius: 10,
  },

  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  smallMetricCard: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderWidth: 3,
    borderColor: '#FFD76A',
    borderRadius: 22,
    padding: 13,
    alignItems: 'center',
  },

  metricLabel: {
    fontFamily: 'Jua',
    fontSize: 13,
    color: '#4B256D',
  },

  metricValue: {
    fontFamily: 'Jua',
    fontSize: 30,
    color: '#24170D',
  },

  metricNote: {
    fontFamily: 'Jua',
    fontSize: 11,
    color: '#6B4A20',
  },

  masteryText: {
    fontFamily: 'Jua',
    fontSize: 18,
    color: '#24170D',
    marginBottom: 6,
  },

  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7E4',
    borderRadius: 16,
    padding: 10,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#FFD76A',
  },

  listNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#8423D9',
    color: '#FFFFFF',
    fontFamily: 'Jua',
    textAlign: 'center',
    lineHeight: 26,
    marginRight: 9,
  },

  listText: {
    flex: 1,
    fontFamily: 'Jua',
    fontSize: 12,
    color: '#333',
    lineHeight: 17,
  },

  warningPill: {
    backgroundColor: '#F5ECFF',
    borderWidth: 2,
    borderColor: '#D6B4FC',
    borderRadius: 16,
    padding: 10,
    marginBottom: 8,
  },

  warningText: {
    fontFamily: 'Jua',
    fontSize: 13,
    color: '#4B256D',
  },

  actionButton: {
    marginTop: 10,
    alignSelf: 'center',
    backgroundColor: '#7DDA47',
    borderWidth: 4,
    borderColor: '#5FAF2E',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 30,
  },

  actionButtonText: {
    fontFamily: 'Jua',
    fontSize: 15,
    color: '#FFFFFF',
  },

  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F5ECFF',
    borderWidth: 2,
    borderColor: '#D6B4FC',
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
  },

  historyTitle: {
    fontFamily: 'Jua',
    fontSize: 13,
    color: '#24170D',
  },

  historyScore: {
    fontFamily: 'Jua',
    fontSize: 14,
    color: '#8423D9',
  },

  bottomAction: {
    alignSelf: 'center',
    backgroundColor: '#7DDA47',
    borderWidth: 4,
    borderColor: '#5FAF2E',
    borderRadius: 20,
    paddingVertical: 11,
    paddingHorizontal: 35,
    marginBottom: 20,
  },

  bottomActionText: {
    fontFamily: 'Jua',
    fontSize: 16,
    color: '#FFFFFF',
  },
});