import { StyleSheet } from 'react-native';

export const stylesDashboard = StyleSheet.create({
    input: {
        backgroundColor:'#EFECEC',
        color: '#A4A4A4',
        borderRadius: 10,
        padding: 10,
        width: 200,
        marginBottom: 10,
        height: 70,
    },
    header: {
        backgroundColor: '#8423D9',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 20,
        paddingTop: 40,
        marginBottom: 10,
        borderBottomWidth: 10,
        borderBottomColor: '#6C3A99',
        height: 130,
    },
    hText: {
        fontFamily: 'Jua',
        color: 'white',
        fontSize: 15,
    },
    leftContainer: {
        flex: 1,
    },
    rightContainer: {
        flex: 1,
        alignItems: 'flex-end',
    },
    menuContainer: {
        justifyContent: 'center',
        padding: 10,
        borderBottomWidth: 5,
        borderBottomColor: '#D9D9D9',
    },
    menuText: {
        fontFamily: 'Jua',
        fontSize: 30,
    },
    button: {
        backgroundColor:'#8ED94D',
        padding: 5,
        height: 60,
        width: 100,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    button2: {
        backgroundColor:'#8ED94D',
        padding: 5,
        height: 60,
        width: 100,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: -120,
    },
    buttonText: {
        fontSize: 18,
        color: 'white', // Ensure text is white
    },
    pictureCircle: {
        backgroundColor: 'white',
        width: 65,
        height: 65,
        borderRadius: 50,
    },
    titleText: {
        fontFamily: 'Jua',
        fontSize: 20,
        marginBottom: 30
    },
    buttonContainer: {
        flexDirection: 'row',
        padding: 10,
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,  
    },
    classContainer: {
        alignItems: 'center',
        flexGrow: 1,
        padding: 20,
        justifyContent: 'flex-start',
    },
    classContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'lightgray', // Use a light background for better contrast
        marginTop: 20,
        padding: 20,
        height: 80,
        borderRadius: 30,
        marginVertical: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
        width: 300, // Adjust the width to your preference
        alignSelf: 'center' // Center the classContent boxes
    },
    classContentText: {
        color: '#333', // Use darker text for readability
        fontFamily: 'Jua',
        fontSize: 18, // Increase font size for visibility
        textAlign: 'center', // Center the text within the box
    },

    pendingUserText: {
        color: '#333',
        fontFamily: 'Jua',
        fontSize: 18,
        textAlign: 'left',
        marginBottom: 2, // Minor space between name and email
    },
    pendingUserEmail: {
        fontSize: 12,
        color: 'gray',
        textAlign: 'left',
    },
    

    buttonApprove: {
        backgroundColor: '#8ED94D',
        padding: 10,
        height: 40,
        flex: 1, // Equal button width
        marginRight: 5, // Spacing between buttons
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rejectButton: {
        backgroundColor: 'red',
        padding: 10,
        height: 40,
        flex: 1, // Equal button width
        marginLeft: 5, // Spacing between buttons
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },

    pendingUserContent: {
        flexDirection: 'column', // Stack user info and buttons vertically
        alignItems: 'stretch', // Ensure items take up the container width
        backgroundColor: 'lightgray',
        marginVertical: 10, // Reduce vertical spacing between containers
        padding: 15, // Reduce padding inside the container
        borderRadius: 20,
        width: '90%', // Ensure container fits the screen
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
        alignSelf: 'center', // Center the container horizontally
    },
    userInfoContainer: {
        marginBottom: 5, // Minimal spacing between user info and buttons
    },
    pendingUserText: {
        color: '#333',
        fontFamily: 'Jua',
        fontSize: 18,
        textAlign: 'left', // Align text to the left
        flex: 1, // Take up available space
    },
    titleContainer: {
        padding: 10,
        backgroundColor: '#f1f1f1', // Example background color
        borderBottomWidth: 1,
        borderBottomColor: '#ddd', // Border under the title
    },
    titleText: {
        fontSize: 35,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    backButtonContainer: {
        height: 50,
        width: 50,
        borderRadius: 50,
        backgroundColor: '#462A5E',
        alignItems: 'center',
        justifyContent: 'center',
    },

    actionContainer: {
        flexDirection: 'row', // Layout buttons in a row
        justifyContent: 'space-between', // Space buttons evenly
        alignItems: 'center',
        marginTop: 5, // Slight spacing above buttons
        width: '100%', // Ensure buttons take up the full width of the container
    },
});
