
import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  background: {
    flex: 1,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(16, 10, 35, 0.45)',
  },

  /* LOADING */

  loadingContainer: {
    flex: 1,
    backgroundColor: '#160B2E',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  loadingDuck: {
    width: 180,
    height: 180,
    resizeMode: 'contain',
  },

  loadingBarBackground: {
    width: '85%',
    height: 18,
    backgroundColor: '#3A255E',
    borderRadius: 30,
    overflow: 'hidden',
    marginTop: 20,
  },

  loadingBarFill: {
    height: '100%',
    backgroundColor: '#8ED94D',
    borderRadius: 30,
  },

  loadingText: {
    marginTop: 18,
    fontSize: 24,
    fontFamily: 'Jua',
    color: '#FFFFFF',
    textAlign: 'center',
  },

  loadingPercent: {
    marginTop: 8,
    fontSize: 18,
    fontFamily: 'Jua',
    color: '#C7B8FF',
  },

  /* HEADER */

  header: {
    height: 95,
    paddingHorizontal: 18,
    paddingTop: 35,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    backgroundColor: 'rgba(132,35,217,0.92)',

    borderBottomWidth: 3,
    borderBottomColor: '#D6B4FC',
  },

  backButtonContainer: {
    width: 48,
    height: 48,
    borderRadius: 30,
    backgroundColor: '#4B256D',
    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
  },

  headerTitle: {
    fontSize: 30,
    fontFamily: 'Jua',
    color: '#FFFFFF',
    letterSpacing: 1,
  },

  headerDuck: {
    width: 55,
    height: 55,
    resizeMode: 'contain',
  },

  /* MENU */

  menuContainer: {
    paddingBottom: 50,
    paddingHorizontal: 18,
  },

  heroSection: {
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 20,
  },

  glowCircle: {
    position: 'absolute',
    top: -10,
    width: 190,
    height: 190,
    borderRadius: 100,
    backgroundColor: 'rgba(174,104,255,0.35)',
  },

  character: {
    width: 155,
    height: 155,
    resizeMode: 'contain',
    zIndex: 5,
  },

  title: {
    fontSize: 34,
    fontFamily: 'Jua',
    color: '#FFFFFF',
    marginTop: 4,
    textAlign: 'center',
  },

  title2: {
    fontSize: 34,
    fontFamily: 'Jua',
    color: '#D6B4FC',
    textAlign: 'center',
    marginTop: -5,
  },

  subtitle: {
    width: '88%',
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'Jua',
    color: '#F5F2FF',
    textAlign: 'center',
  },

  /* CARDS */

  gameCard: {
    width: '100%',
    minHeight: 145,

    marginBottom: 18,

    borderRadius: 28,

    backgroundColor: 'rgba(255,255,255,0.14)',

    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.22)',

    overflow: 'hidden',

    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 12,
  },

  cardGlow1: {
    position: 'absolute',
    top: -25,
    right: -20,

    width: 120,
    height: 120,

    borderRadius: 60,

    backgroundColor: 'rgba(255,255,255,0.12)',
  },

  cardGlow2: {
    position: 'absolute',
    bottom: -15,
    left: -15,

    width: 75,
    height: 75,

    borderRadius: 40,

    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
  },

  iconContainer: {
    width: 90,
    height: 90,

    borderRadius: 24,

    backgroundColor: 'rgba(255,255,255,0.18)',

    justifyContent: 'center',
    alignItems: 'center',

    marginRight: 15,

    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
  },

  gameDuck: {
    width: 72,
    height: 72,
    resizeMode: 'contain',
  },

  gameInfo: {
    flex: 1,
  },

  gameTitle: {
    fontSize: 23,
    fontFamily: 'Jua',
    color: '#FFFFFF',
    marginBottom: 6,
  },

  gameDesc: {
    fontSize: 14,
    lineHeight: 21,
    fontFamily: 'Jua',
    color: '#EFE7FF',
  },

  badge: {
    marginTop: 12,
    alignSelf: 'flex-start',

    backgroundColor: '#8ED94D',

    borderRadius: 12,

    paddingHorizontal: 12,
    paddingVertical: 5,
  },

  badgeText: {
    fontSize: 12,
    fontFamily: 'Jua',
    color: '#FFFFFF',
  },
});

