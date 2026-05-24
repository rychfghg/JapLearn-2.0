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
        marginTop: -100,
        flex: 1,       // Adjust flex if needed
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
    message: {
        fontSize: 20,
        color: 'red',
        marginTop: 20,
    },
    cardImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    nextButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#6200EE',
        borderRadius: 10,
        justifyContent: 'center',  // Centers text horizontally
        alignItems: 'center',  // Centers text vertically
        width: 'auto',  // Makes sure the width adjusts to the content
        minWidth: 150,  // Set a minimum width if necessary
    },
    nextButtonText: {
        fontSize: 18,
        color: '#FFF',
        textAlign: 'center',  // Ensures the text is centered horizontally
    } 
});

export default styles;
