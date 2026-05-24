import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'absolute', // Ensures the background is absolute and fills the parent
    resizeMode: 'cover', // Stretches to cover the entire screen while maintaining aspect ratio
  },
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  question: {
    paddingTop: 40,
    fontSize: 30,
    marginVertical: 20,
    textAlign: 'center',
    color: 'white',
    fontFamily: 'Jua',
  },
  choiceContainer: {
    position: 'absolute',
    bottom: '14%',
    width: '90%',
    height: '25%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 20,
  },
  
  choice: {
    width: 70, // Set fixed width
    height: 50, // Set fixed height
    backgroundColor: '#3b6b3b',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    margin: 10,
    position: 'relative', // Allows absolute positioning during animation
  },
  choiceText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Jua',
  },
  battleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 5,
    marginTop: 120,
  },
  characterContainer: {
    alignItems: 'center',

  },
  playerImage: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
  },
  enemyImage: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
  },
  playerHPContainer: { // New style for player HP container
    width: 100,
    height: 10,
    backgroundColor: '#ccc',
    borderRadius: 5,
    marginTop: 10,
  },
  playerHPFill: { // New style for player HP fill
    height: '100%',
    backgroundColor: '#00ff00',
  },
  enemyHPContainer: {
    width: 100,
    height: 10,
    backgroundColor: '#ccc',
    borderRadius: 5,
    marginTop: 10,
  },
  enemyHPFill: {
    height: '100%',
    backgroundColor: '#ff0000',
  },
  attackEffect: {
    position: 'absolute',
    width: 50,
    height: 50,
    left: width / 2 - 25,
    top: height / 2 - 100,
    resizeMode: 'contain',
    tintColor: '#ff0000',
  },
  bottomButton: {
    position: 'absolute',
    bottom: height * 0.03,
    width: width * 0.2,
    paddingVertical: 15,
    backgroundColor: '#76C043',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bottomButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Jua',
  },
  curtainContainer: {
    ...StyleSheet.absoluteFillObject, // Ensure it covers the full screen
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999, // Place it above all elements
    backgroundColor: 'transparent', // Maintain transparency for underlying elements
  },
  curtainLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '50%', // Covers half the screen width
    height: '100%', // Covers full screen height
    backgroundColor: '#000',
  },
  curtainRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '50%', // Covers half the screen width
    height: '100%', // Covers full screen height
    backgroundColor: '#000',
  },
  curtainText: {
    position: 'absolute', // Ensure the text is centered
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Jua',
    zIndex: 10000, // Ensure it is above the curtains
  },
  curtainText: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Jua',
    zIndex: 11,
  },
  characterName: {
    fontSize: 18,
    color: 'white',
    fontFamily: 'Jua',
    marginBottom: 5, // Adds spacing between the name and character image
    textAlign: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject, // Covers the entire screen
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Semi-transparent black background
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999, // Ensures it's above all other UI elements
  },
  
  
  gameOverText: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Jua',
    marginRight:10
  },
  proceedButton: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  proceedButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  selectedAnswerContainer: {
    marginTop: 10,
    marginBottom: -51,
    backgroundColor: '#3b6b3b',
    borderRadius: 10,
    padding: 10,
    width: '20%',
    alignItems: 'center',
  },
  selectedAnswerText: {
    fontSize: 18,
    color: 'white',
    fontFamily: 'Jua',
  },
  
});
