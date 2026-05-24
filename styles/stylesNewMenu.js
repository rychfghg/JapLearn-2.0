import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    pictureCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    header: {
        backgroundColor: '#C7C5C5',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingTop: 40,
        marginBottom: 20,
        height:150,
    },
    hText1: {
        fontFamily: 'Jua',
        fontSize: 30,
    },
    hText2: {
        fontFamily: 'Jua',
        fontSize: 20,
    },
    leftContainer: {
        flex: 1,
        alignItems: 'center'
    },
    rightContainer: {
        flex: 1,
        alignItems: 'flex-end',
    },
    menuContainer: {
        marginTop: 20,
        paddingHorizontal: 20,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    levelContainer: {
        flex: 1,
        margin: 5,
        alignItems: 'center',
        maxWidth: '50%', 
        marginBottom: 40, 
    },
    menuText: {
        fontFamily: 'Jua',
        fontSize: 20,
        textAlign: 'center',
    },
    buttonText: {
        fontSize: 20,
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
    imageIcon: {
        width: 148,
        height: 100,
        resizeMode: 'contain',
    },
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover', 
    },
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    menuButton: {
        backgroundColor: '#8ED94D',
        height: 160,
        borderRadius: 5,
        padding: 5,
        marginBottom: 20,

    },
    menuButtonText: {
        fontSize: 40,
        color: "#fff",
    },
    profileButton: {
        height: 60,
        backgroundColor: '#7551B0',
        borderRadius: 10,
    },
    profileButtonText: {
        fontSize: 25,
        color: "#fff",
    },
    classContainer: {
        backgroundColor: '#8ED94D',
        padding: 15,
        marginBottom: 40,
        borderRadius: 10,
        borderBottomWidth: 5,
        borderBottomColor: '#81AF59',
        borderBottomEndRadius: 5,
        borderBottomStartRadius: 5,
    },
    classText: {
        fontSize: 20,
        textAlign: 'left',
        fontFamily: 'Jua',
        color: 'white',
    }
});

export default styles;
