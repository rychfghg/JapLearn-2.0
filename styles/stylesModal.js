import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Add semi-transparent background for focus
    },
    modalView: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 25,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '85%',
        maxWidth: 400,
        alignItems: 'center',
        position: 'relative',
        maxHeight: '80%', // Limit modal height to enable scrolling
    },
    scrollViewContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    
    modalContent: {
        justifyContent: 'center',
        alignItems: 'center', // Center text and inputs inside the modal
        marginTop:20
    },
    input: {
        height: 50, // Adjust input height for consistency
        width: '90%', // Make inputs responsive to modal width
        marginVertical: 10, // Add vertical spacing between inputs
        paddingHorizontal: 15,
        backgroundColor: '#f7f7f7', // Subtle background color for inputs
        borderRadius: 10,
        borderColor: '#ddd', // Add border for input clarity
        borderWidth: 1,
        fontSize: 14,
    },
    text: {
        marginBottom: 20,
        fontSize: 16,
        fontFamily: 'Jua',
        textAlign: 'center',
        color: '#333', // Slightly darker text for better readability
    },
    closeButtonContainer: {
        position: 'absolute', // Position close button at the top-right corner
        top: 10,
        right: 10,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between', // Space buttons apart
        width: '70%', // Adjust button row width
        marginTop: 15,
    },
    closeButton: {
        height: 35,
        width: 35,
        backgroundColor: '#f0f0f0', // Subtle background color
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 17.5, // Perfect circle
        elevation: 2,
        marginLeft: 250
    },
    closeButtonText: {
        fontSize: 18,
        color: '#888', // Subtle text color for the close button
        fontWeight: 'bold',
    },
    stack: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
        columnGap: 10,
        flexWrap: 'wrap',
    },
    stackText: {
        marginLeft: 10,
        fontSize: 16,
        padding: 5,
        borderRadius: 5,
        marginTop: 5,
        backgroundColor: 'lightgray',
        marginRight: 10,
        marginBottom: 5,
        paddingHorizontal: 10,
        paddingVertical: 3,
    },
    button: {
        backgroundColor: '#8ED94D',
        paddingVertical: 15,
        paddingHorizontal: 20,
        height: 50,
        borderRadius: 5,
        justifyContent: 'center',
        marginTop: 10,
        alignItems: 'center',
    },
    button2: {
        backgroundColor: '#8ED94D',
        paddingVertical: 15,
        paddingHorizontal: 20,
        height: 50,
        borderRadius: 5,
        justifyContent: 'center',
        marginTop: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontFamily: 'Jua',
        fontSize: 15,
        textAlign: 'center',
    },
    removeModalContainer: {
        // Removed for now (not needed based on context provided)
    },
    contentText: {
        fontSize: 16,
        fontFamily: 'Jua',
        color: 'white',
        textAlign: 'center', // Ensure text is centered in content areas
    },
    selected: {
        padding: 15,
        backgroundColor: '#ff5c5c',
        borderRadius: 5,
        marginBottom: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentModalContainer: {
        backgroundColor: '#8ED94D',
        marginBottom: 15,
        padding: 15,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContainer: {
        maxHeight: 200,
    },

    centeredView2: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    },
    modalView2: {
        width: '100%', // Adjust width for better responsiveness
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalText2: {
        marginBottom: 15,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    buttonRow2: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap:10,
    },
    button2: {
        flex: 1,
        margin: 5, // Add spacing between buttons
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#8BC34A', // Green button color
    },
    buttonText2: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
