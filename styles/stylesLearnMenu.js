import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
      flex: 1,
  },
  background: {
      flex: 1,
      resizeMode: 'cover',
  },
  header: {
      height: 105,
      backgroundColor: '#8423D9',
      borderBottomWidth: 10,
      borderBottomColor: '#6C3A99',
      justifyContent: 'center',
      padding: 10,
      paddingTop: 40,
  },
  backButtonContainer: {
      height: 50,
      width: 50,
      borderRadius: 50,
      backgroundColor: '#462A5E',
      alignItems: 'center',
      justifyContent: 'center',
  },
  menuContainer: {
    flex: 1,
    alignItems: 'center', // Horizontally center the buttons
    justifyContent: 'center', // Vertically center the buttons
    paddingHorizontal: 20, // Add horizontal padding for responsiveness
    paddingVertical: 20,
    width: '100%', // Ensure full width for consistent alignment
},


  disabledButton: {
      backgroundColor: 'gray',
      opacity: 0.6,
  },
  disabledText: {
      color: '#7d7d7d',
  },
  awardModalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.8)', // Dim background
  },
  awardBadge: {
      width: 200,
      height: 200,
      resizeMode: 'contain',
  },
  backdropLight: {
      position: 'absolute',
      width: 300, // Ensure it fits your design
      height: 300,
      alignSelf: 'center',
      backgroundColor: 'rgba(144, 228, 193, 0.6)', // Soft teal with transparency
      borderRadius: 9999, // Maintain circular shape
      zIndex: 0, // Ensure it's behind the badge
  },
  congratsMessage: {
      color: 'white', // White text color
      fontSize: 18, // Adjust font size
      fontWeight: 'bold', // Make it bold
      textAlign: 'center', // Center the text
      marginTop: 20, // Add some spacing from the badge
      paddingHorizontal: 10, // Add padding for better readability
      textShadowColor: 'rgba(0, 0, 0, 0.8)', // Add a subtle text shadow
      textShadowOffset: { width: 1, height: 1 }, // Shadow offset
      textShadowRadius: 3, // Shadow radius
  },
});


export default styles;
