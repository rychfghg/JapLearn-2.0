import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  characterContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 5,
    borderColor: '#D6B4FC',
    borderWidth: 3,
    alignSelf: 'center', // Center horizontally
    marginBottom: 10,
  },
  character: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    alignSelf: 'center',
  },
  dialogueContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
    alignSelf: 'center',
    borderColor: '#D6B4FC',
    borderWidth: 3,
  },
  dialogue: {
    fontSize: 16,
    color: 'white',
  },
  characterImage: {
    alignSelf: 'center',
    width: width * 0.8,
    height: height * 0.4,
    resizeMode: 'contain',
  },
  cinematicContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cinematicText: {
    fontSize: 24,
    fontStyle: 'italic',
    color: 'white',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
    borderRadius: 10,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  gameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameTitle: {
    fontSize: 24,
    color: 'white',
    marginBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  gameQuestion: {
    fontSize: 20,
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  gameChoice: {
    backgroundColor: '#3b6b3b',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
  },
  gameChoiceText: {
    color: 'white',
    fontSize: 14,
  },
  gameFeedback: {
    marginTop: 20,
    fontSize: 18,
    color: 'white',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 5,
    textAlign: 'center',
  },
  gameImage: {
    width: width * 0.7,
    height: height * 0.3,
    resizeMode: 'contain',
  },
  // New styles added for the enemy and attack effect
  enemyContainer: {
    position: 'absolute',
    top: 50,
    right: 50,
    alignItems: 'center',
  },
  enemyImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  enemyHPContainer: {
    width: 80,
    height: 10,
    backgroundColor: '#ccc',
    marginTop: 5,
    borderRadius: 5,
    overflow: 'hidden',
  },
  enemyHPText: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 5,
    textAlign: 'center',
  },
  enemyHPBar: {
    width: 80,
    height: 10,
    backgroundColor: '#ccc',
    borderRadius: 5,
    overflow: 'hidden',
  },
  enemyHPFill: {
    height: '100%',
    backgroundColor: '#ff0000',
  },
  attackEffect: {
    position: 'absolute',
    width: 50,
    height: 50,
    left: 100,
    bottom: 120,
    resizeMode: 'contain',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Slightly transparent
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Dark transparent background
    justifyContent: 'center',
    alignItems: 'center',
  },
  finishText: {
    fontSize: 40, // Increase font size for prominence
    color: '#f8f8f8', // Slightly off-white color
    fontStyle: 'italic', // Apply italic style
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)', // Add a shadow for depth
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
});

