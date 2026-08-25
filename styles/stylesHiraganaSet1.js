import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flexGrow: 1,
    minHeight: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 118,
    paddingBottom: 28,
  },
  header: {
    position: 'absolute',
    top: 52,
    left: 24,
    zIndex: 5,
  },
  backButtonContainer: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#4A2859',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  contentContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '86%',
    maxWidth: 480,
    paddingVertical: 26,
    paddingHorizontal: 24,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderWidth: 1,
    borderColor: '#E7DDEF',
    shadowColor: '#4A2859',
    shadowOpacity: 0.1,
    shadowRadius: 22,
    elevation: 5,
  },
  character: {
    fontSize: 82,
    fontFamily: 'Jua',
    color: '#442451',
    marginBottom: 10,
  },
  romaji: {
    fontSize: 28,
    fontFamily: 'Jua',
    color: '#7A6B81',
    marginBottom: 24,
  },
  nextButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#8423D9',
    borderRadius: 15,
  },
  nextButtonText: {
    fontSize: 18,
    color: '#FFF',
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#F0E6F8',
    borderRadius: 15,
    marginRight: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    
  },
  buttonText: {
    color: '#6321AD',
    textAlign: 'center',
    fontSize: 16,
  },

  audioButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 18,
    backgroundColor: '#F1E7FA',
    marginHorizontal: 10,
  },
  audioButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
});

export default styles;
