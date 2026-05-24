import { StyleSheet } from 'react-native';

export const stylesScore = StyleSheet.create({
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
    categoryContainer: {
        height: 100,
        marginTop: 50,
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    categoryButton: {
        backgroundColor: '#8ED94D',
        padding: 5,
        paddingLeft: 20,
        paddingRight: 20,
        borderRadius: 30,
        height: 55,
    },
    categoryButtonText: {
        textAlign: 'center',
        fontSize: 10,
        fontFamily: 'jua',
    },
    scoreContainer: {
        flex: 1,
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 10,
    },
    scoreField: {
        height: 100,
        padding: 10,
        borderRadius: 10,
        backgroundColor: '#8ED94D',
        borderBottomWidth: 10,
        borderBottomColor: '#81AF59',
        marginBottom: 10,
    },
    scoreTextContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    scoreTitleText: {
        color: '#789C59',
        fontFamily: 'jua',
    },
    scoreText: {
        fontFamily: 'jua',
        color: 'white',
    },
    container: {
        flex: 1,
        position: 'relative',
    },
    background: {
        position: 'absolute',
        bottom: 0,
        right: 0,
    },
    contentContainer: {
        flex: 1,
        position: 'absolute',
        top: 105,
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: -1,
    },
});
