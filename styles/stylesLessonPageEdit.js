import { StyleSheet } from 'react-native';

export const stylesLessonPage = StyleSheet.create({
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
    pageContentContainer: {
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
    pageContent: {
        flexDirection: 'row', // Align items in a row
        alignItems: 'center', // Vertically center the text and button
        justifyContent: 'space-between', // Push the items apart
        backgroundColor: '#C7C3C3',
        height: 100,
        padding: 20,
        borderRadius: 10,
        width: '100%',
    },
    pageContentText: {
        color: 'white',
        fontFamily: 'jua',
        fontSize: 17,
        marginRight: 20, // Add spacing between text and the button
    },
    selectedPage: {
        backgroundColor: '#8ed94d',
    },
    lessonButton: {
        backgroundColor: '#8ED94D',
        padding: 5,
        height: 40,
        width: 75,
        borderRadius: 5,
        justifyContent: 'center',
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
    }
})