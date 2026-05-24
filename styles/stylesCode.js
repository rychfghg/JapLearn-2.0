import { StyleSheet } from 'react-native';

export const stylesCode = StyleSheet.create({
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
    upperButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        paddingHorizontal: 20,
        position: 'absolute',
        top: 120, // Adjusted to be at the top below the header
        width: '100%',
    },
    leftButton: {
        backgroundColor: '#8ED94D',
        padding: 5,
        height: 60,
        width: 150,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rightButton: {
        backgroundColor: '#8ED94D',
        padding: 5,
        height: 60,
        width: 150,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    gameCodeContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gameCodeLabel: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 10,
    },
    bigGameCodeText: {
        fontSize:70,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#000',
    },
    noGameCodeText: {
        fontSize: 30,
        textAlign: 'center',
        color: '#777',
    },
    copyNote: {
        fontSize: 30,
        color: '#777',
        marginTop: 5,
        textAlign: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        width: 300,
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
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalText: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
    },
    modalButton: {
        backgroundColor: '#8ED94D',
        borderRadius: 5,
        padding: 5

    },
    modalButtonText: {
        fontSize: 20,
        color: "#fff",
    },
});
