import { StyleSheet } from 'react-native';

export const stylesLessonContent = StyleSheet.create ({
    container: {
        flex: 1,
    },
    header: {
        height: 105,
        backgroundColor: '#8423D9',
        borderBottomWidth: 10,
        borderBottomColor: '#6C3A99',
        flexDirection: 'row', // Make sure this is in place to align back button and text horizontally
        alignItems: 'center',
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
    buttonContainer: {
        flexDirection: 'row',
        padding: 10,
        height: 80,
        alignItems: 'center',
        justifyContent: 'space-between',
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
        fontSize: 20,
        color: 'white',
    },
    centerContainer: {
        flex: 1, 
        alignItems: 'center',  // Center horizontally
        justifyContent: 'center', // Center vertically
        marginLeft: -40
    },
    headerText:{
        fontSize: 20,
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    textContainer: {
        alignSelf: 'flex-start', // Align text container to the left
        marginLeft: 20, // Add padding to the left for the text
    },
    lessonContentContainer: {
        rowGap: 10,
        paddingLeft: 10,
        paddingRight: 10,
        height: '100%',
    },
    contentScrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        width: '100%',
    },
    LessonContent: {
        flexDirection: 'column', // Change to column layout
        alignItems: 'center', // Center items horizontally
        backgroundColor: '#C7C3C3',
        padding: 20,
        borderRadius: 10,
        width: '100%',
    },
    LessonContentText: {
        color: 'white',
        fontFamily: 'jua',
        fontSize: 17,
        marginVertical: 5, // Add vertical spacing between items
    },

    selectedLessonContent: {
        backgroundColor: '#8ed94d',
    },
    lessonContentButton: {
        backgroundColor: '#8ED94D',
        padding: 5,
        height: 40,
        width: 75,
        borderRadius: 5,
        justifyContent: 'center',
        marginTop: 10, // Add space above the button
    },
    lessonContentImage: {
        width: 300, // Adjust as needed
        height: 300, // Adjust as needed
        resizeMode: 'contain', // Or 'cover' based on your needs
        marginBottom: 10, // Add some space below the image
    },
})