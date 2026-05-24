import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#8ED94D',
        padding: 10,
        width: '100%',
        borderRadius: 5,
        borderColor: '#8AC25A',
        borderBottomWidth: 6,
        height: 70,
    },

    buttonText: {
        color: '#fff',
        fontSize: 40,
    },

    buttonContainer: {
        alignItems: 'center',
        marginTop: 20,
        paddingTop: 20,
    },

    container: {
        flex: 1,
        justifyContent: 'center', // Center vertically
        alignItems: 'center', // Center horizontally
        paddingHorizontal: 30,
        paddingVertical: 20, // Add some vertical padding
        backgroundColor: '#ffffff',
    },

    input: {
        backgroundColor: '#ececec',
        color: '#777676',
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
        height: 60,
        borderColor: 'red',
        width: '100%', // Ensure inputs stretch the full container width
    },

    imageContainer: {
        paddingTop: '20%',
        alignItems: 'center',
        marginBottom: 45,
    },

    linkContainer: {
        marginTop: 40,
        alignItems: 'center',
    },

    linkText: {
        color: '#B6B5B5',
        textDecorationLine: 'underline',
        fontSize: 16,
    },

    errorInput: {
        borderWidth: 1,
        borderColor: 'red',
    },

    errorText: {
        color: 'white',
        marginLeft: 5,
        marginBottom: 18,
        borderWidth: 1,
        borderColor: 'red',
        backgroundColor: 'red',
        padding: 5,
        borderRadius: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
        width: '100%',
    },
    passwordInput: {
        flex: 1,
        paddingRight: 40,
    },
    insideInputButton: {
        position: 'absolute',
        right: 10,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleText: {
        fontSize: 24,
        fontFamily: 'Jua',
        marginBottom: 20,
        textAlign: 'center',
    },

    modalWrapper: {
        flex: 1,
       
        justifyContent: 'flex-start', // Align to the top for scrolling
        paddingTop: 50, // Add space at the top
    },
    
    modalContent: {
        width: '90%',
        maxHeight: '80%', // Allow some space at the top and bottom
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
    },
    

});

export default styles;
