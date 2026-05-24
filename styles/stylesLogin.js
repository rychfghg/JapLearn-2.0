import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#8ED94D',
    padding: 10,
    width:  '100%',
    borderRadius: 5,
    borderColor: '#8AC25A',
    borderBottomWidth: 6,
    height: 70,
  },

  buttonText: {
    color: '#fff',
    fontSize: 40
  },

  buttonContainer: {
    alignItems:'center',
    marginTop: 10,
  },

  container: {
    marginTop: 50,
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    marginTop: 50,
  },

  input: {
    backgroundColor: '#ececec',
    color: '#777676',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    height: 60,
    borderColor: 'red',
  },
  inputReset: {
    backgroundColor: '#ececec',
    color: '#777676',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    height: 60,
    borderColor: 'red',
    width:'100%'
  },

  imageContainer: {
    alignItems: 'center',
    marginBottom: 100,
  },
  
  linkContainer: {
    marginTop: 60,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },

  linkText: {
      color: '#B6B5B5',
      textDecorationLine: 'underline',
      fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    position: 'relative',
  },
  passwordInput: {
    flex: 1,
    paddingRight: 40,
  },
  insideInputButton: {
    position: 'absolute',
    right: 10,
    height: '100%',
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    color: '#8ED94D',
    marginTop: 10,
    fontSize: 30,
    fontFamily: 'Jua'  
  },

  policyTextContainer: {
    flexDirection: 'row',  // Aligns the child elements horizontally (side by side)
    justifyContent: 'center', // Centers the content horizontally (optional)
    alignItems: 'center',  // Aligns vertically in the center (optional)
    marginTop:20
  },
  policyText: {
    fontSize: 16,
    textAlign: 'center',
    marginLeft:10
  },
  linkText2: {
    fontSize: 16,
    color: 'blue',
    textDecorationLine: 'underline',
    marginLeft: 5,  // Space between the two texts (optional)
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10, // Add padding for better alignment
  },
  
  modalContent: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20, // Add vertical spacing between elements
    padding: 40, // Add padding inside the modal content
    backgroundColor: 'white', // Ensure clear modal content background
    borderRadius: 10, // Add rounded corners for a cleaner UI
    width: '100%', // Widen the modal box
  },
  
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15, // Add spacing below the title
    textAlign: 'center',
  },
  buttonReset: {
    backgroundColor: '#8ED94D',
    padding: 10,
    width:  '100%',
    borderRadius: 5,
    borderColor: '#8AC25A',
    borderBottomWidth: 6,
    height: 70,
    marginBottom:10
    
  },

  buttonTextReset: {
    color: '#fff',
    fontSize: 25
  },
});

export default styles;