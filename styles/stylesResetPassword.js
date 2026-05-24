import { StyleSheet } from 'react-native';

const stylesReset = StyleSheet.create({

    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
        backgroundColor: '#f9f9f9',  // Soft background color for a clean look
    },

    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#4CAF50',  // Green color for the title
        marginBottom: 10,
        textAlign: 'center',
    },

    subtitle: {
        fontSize: 16,
        color: '#7d7d7d',  // Lighter gray for subtitle
        marginBottom: 20,
        textAlign: 'center',
    },

    input: {
        width: '100%',
        backgroundColor: '#ececec',  // Light background for input fields
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        color: '#333',  // Dark text color for better readability
        fontSize: 16,
    },

    buttonContainer: {
        width: '100%',
        marginTop: 20,
    },

    button: {
        backgroundColor: '#8ED94D',  // Green button color
        paddingVertical: 15,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },

    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },

    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',  // Semi-transparent background for modal
    },

    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '80%',
        alignItems: 'center',
    },

    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },

    modalMessage: {
        fontSize: 16,
        color: '#555',
        marginBottom: 15,
        textAlign: 'center',
    },

    modalButton: {
        backgroundColor: '#8ED94D',
        padding: 10,
        borderRadius: 5,
        width: '100%',
        alignItems: 'center',
    },

    modalButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },

    errorInput: {
        borderColor: 'red',
        borderWidth: 1,
    },

    errorText: {
        color: 'red',
        marginBottom: 10,
    },
    
});


export default stylesReset;