import { StyleSheet } from "react-native";

export const stylesLevels = StyleSheet.create ({
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
    titleTextContainer: {
        padding: 20,
    },
    titleText: {
        fontFamily: 'jua',
        fontSize: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10, 
        paddingHorizontal: 10, 
    },
    button: {
        backgroundColor: '#8ED94D',
        padding: 5,
        height: 60,
        width: 100,
        borderRadius: 5,
        justifyContent: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 20,
    },
    levelContainer: {
        padding: 10,
    },
    scrollViewContent: {
        flexGrow: 1, 
    },
    level : {
        padding: 20,
        backgroundColor: '#8ED94D',
        height: 100,
        borderRadius: 10,
        borderBottomWidth: 8,
        borderBottomColor: '#81AF59',
        marginBottom: 10,
        
    },
    levelText: {
        fontFamily: 'jua',
        fontSize: 16,
        color: 'white',
    },
    gameCodeContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50, // Adjust for space
    },
    bigGameCodeText: {
        fontSize: 40, // Large font size for the game code
        fontWeight: 'bold', // Make the game code bold
        textAlign: 'center',
        color: '#000', // Dark color for contrast
    },
    noGameCodeText: {
        fontSize: 24,
        textAlign: 'center',
        color: '#777', // Lighter color for the placeholder
    },
});
