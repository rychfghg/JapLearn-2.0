import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    header: {
        height: 100,
        justifyContent: 'center',
        paddingLeft: '5%',
        paddingTop: 20,
        backgroundColor: '#8423D9',
    },
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#FFFFFF',
    },
    characterDisplay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    romaji: {
        fontSize: 48,
        marginBottom: 20,
        fontWeight: 'bold',
    },
    character: {
        fontSize: 32,
        marginBottom: 20,
    },
    button: {
        padding: 15,
        backgroundColor: '#007BFF',
        borderRadius: 5,
        marginVertical: 10,
        minWidth: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButtonContainer: {
        height: 50,
        width: 50,
        borderRadius: 50,
        backgroundColor: '#462A5E',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
    },
    matchGame: {
        marginTop: 110,
        flex: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    matchGameText: {
        fontSize: 24,
        marginBottom: 20,
        fontWeight: 'bold',
    },
    cardsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom:90
    },
    card: {
        width: 110,
        height: 130,
        backgroundColor: '#9C4DE2',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 10,
        borderRadius: 5,
        marginBottom:10
    },
    cardText: {
        fontSize: 32,
        color: '#FFFFFF',
    },
    cardImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    messageContainer: {
        position: 'absolute', // Makes the container float above other content
        top: '35%', // Vertically centers the container
        left: '35%', // Horizontally centers the container
        transform: [{ translateX: -50 }, { translateY: -50 }], // Ensures perfect centering
        justifyContent: 'center', // Ensures children are centered vertically
        alignItems: 'center', // Ensures children are centered horizontally
        padding: 20, // Adds some padding inside the container
        borderRadius: 10, // Optional: Rounds the corners of the container
    },
    message: {
        fontSize: 20,
        color: 'red',
        marginBottom: 20, // Adds space between the message and the button
        textAlign: 'center', // Centers the text inside the message
    },
    nextButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#6200EE',
        borderRadius: 10,
        justifyContent: 'center', // Centers text horizontally
        alignItems: 'center', // Centers text vertically
        minWidth: 150, // Ensures the button has a minimum width
    },
    nextButtonText: {
        fontSize: 18,
        color: '#FFF',
        textAlign: 'center', // Ensures the text is centered horizontally
    },
});

export default styles;
