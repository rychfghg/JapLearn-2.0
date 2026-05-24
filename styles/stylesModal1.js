import { StyleSheet } from 'react-native';

export const styles1 = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Add a semi-transparent background
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },    
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: 300,
        maxHeight: '80%', // Limit height to allow scrolling inside
},
    modalContent: {
        justifyContent: 'center'
    },
    input: {
        height: 65,
        width: 250,
        margin: 12,
        padding: 10,
        backgroundColor: '#ececec',
        borderRadius: 10
    },
    text: {
        marginBottom: 20,
        fontSize: 16,
        fontFamily: 'jua',
        textAlign: 'center',
    },
    closeButtonContainer: {
        alignItems: 'flex-end'
    },
    buttonList: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap', // Allow buttons to wrap
        marginTop: 10,
        gap: 15,
    },
    button: {
        width: 50, // Adjust the width to your preference
        marginHorizontal: 10, // Adds space between the buttons
    },
    closeButton: {
        height: 40,
        width: 40,
        backgroundColor: '#ececec',
        padding: 5,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
    },
    closeButtonText: {
        fontSize: 20,
        color: 'grey',
        fontFamily: 'jua',
        textAlign: 'center'
    },
    stack: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
        columnGap: 10,
        flexWrap: 'wrap'
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
        padding: 15,
        height: 60,
        borderRadius: 5,
        justifyContent: 'center',
        marginTop: 10
    },
    buttonText: {
        color: 'white',
        fontFamily: 'jua',
        fontSize: 15,
        textAlign: 'center'
    },
    removeModalContainer: {
        
    },
    contentText: {
        fontSize: 16,
        fontFamily: 'jua',
        color: 'white',
    },
    selected: {
        padding: 15,
        backgroundColor: '#ff5c5c',
        borderRadius: 5,
        marginBottom: 15,
        justifyContent: 'center',
    },
    contentModalContainer: {
        backgroundColor: '#8ED94D',
        marginBottom: 15,
        padding: 15,
        borderRadius: 5,
        justifyContent: 'center',
        
    },
    scrollContainer: {
        maxHeight: 200, 
    },
    lessonButton: {
        backgroundColor: '#ececec',
        paddingVertical: 10,
        paddingHorizontal: 15,
        margin: 5,
        borderRadius: 5,
    },
    lessonButtonText: {
        fontSize: 14,
        fontFamily: 'jua',
        textAlign: 'center',
    },
});
