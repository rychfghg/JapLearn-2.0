import { StyleSheet } from 'react-native';

export const stylesClass = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        height: 105,
        backgroundColor: '#8423D9',
        borderBottomWidth: 10,
        borderBottomColor: '#6C3A99',
        justifyContent: 'center',
        padding: 10,
        paddingTop: 40,
    },
    selectedScore: {
        backgroundColor: '#8ed94d',
    },
    backButtonContainer: {
        height: 50,
        width: 50,
        borderRadius: 50,
        backgroundColor: '#462A5E',
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuContainer: {
        justifyContent: 'center',
        padding: 10,
        borderBottomWidth: 5,
        borderBottomColor: '#D9D9D9',
        marginBottom: 28,
    },
    titleText: {
        fontFamily: 'Jua',
        fontSize: 20,
    },
    categoryContainer: {
        height: 150,
        marginBottom: 40,
        padding: 20,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        columnGap: 5
    },
    categoryButton: {
        backgroundColor: '#8ED94D',
        width: 85,
        padding: 5,
        paddingLeft: 20,
        paddingRight: 20,
        borderRadius: 30,
        height: 50,
    },
    button: {
        backgroundColor: '#8ED94D',
        padding: 5,
        height: 60,
        width: 100,
        borderRadius: 5,
        justifyContent: 'center',
    },
    buttonContainer: {
        flex: 1,
        flexDirection: 'row',
        marginTop: 10,
        padding: 10,
        height: 80,
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    buttonText: {
        fontSize: 20,
        color: 'white',
    },
    categoryButtonText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 10,
    },
    content: {
        justifyContent: 'center',
        backgroundColor: '#C7C3C3',
        height: 70,
        padding: 20,
        borderRadius: 10,
        width: '100%',
    },
    scoreContent: {
        justifyContent: 'center',
        backgroundColor: '#C7C3C3',
        height: 100,
        padding: 20,
        borderRadius: 10,
        width: '100%',
    },
    gameContent: {
        backgroundColor: '#C28FF0',
        borderWidth: 10,
        borderColor: '#7551B0',
        height: 165,
        padding: 10,
        borderRadius: 10,
        width: '100%',
        position: 'relative',
    },
    gameContentText: {
        color: 'white',
        fontFamily: 'Jua',
        fontSize: 24,
        width: '100%'
    },
    gameTextContainer: {
        marginTop: 40,
    },
    classContentText: {
        color: 'white',
        fontFamily: 'Jua',
        fontSize: 17,
        width: '100%'
    },
    contentContainer: {
        paddingBottom: 80,
        flexGrow: 1,
        padding: 10,
        width: '100%',
    },
    membersContentContainer: {
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
    gameDescription: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    gamesContainer: {

    },
    gameButton: {
        backgroundColor: '#8ED94D',
        padding: 5,
        height: 40,
        width: 75,
        borderRadius: 5,
        justifyContent: 'center',
    },
    gameContentBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        overflow: 'hidden', 
    },
    floatingIcon: {
        position: 'absolute',
        top: '50%', // Center vertically
        left: '50%', // Center horizontally
        transform: [{ translateX: -60 }, { translateY: -60 }], // Adjust icon size and position
        zIndex: -1,
    },

    lessonContent: {
        flexDirection: 'column', // Stack text and button vertically
        backgroundColor: '#C7C3C3',
        padding: 20,
        borderRadius: 10,
        width: '100%',
        marginBottom: 10,
    },

    editButtonContainer: {
        flexShrink: 1, // Prevent button from overflowing
    },

    textButtonContainer: {
        flexDirection: 'row', // Align text and button horizontally
        alignItems: 'flex-start',
        justifyContent: 'space-between', // Place button to the right of text
    },

    titleTextSpacing: {
        marginBottom: 5
    },
    
    lessonContentText: {
        color: 'white',
        fontFamily: 'Jua',
        fontSize: 17,
        lineHeight: 22,
        flexWrap: 'wrap',
        maxWidth: '85%', // Ensure text doesn’t exceed this width
    },
    textContainer: {
        flex: 1,
        flexWrap: 'wrap', // Allow text to wrap
        paddingRight: 10, // Space for button
    },
    editButton: {
        backgroundColor: '#8ED94D',
        padding: 5,
        height: 40,
        width: 75,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchInput: {
        height: 45,                // Increase the height for better touch interaction
        borderColor: '#E0E0E0',    // Light gray border color for subtlety
        borderWidth: 1,            // Border width to match the design
        marginHorizontal: 20,      // Add horizontal margin for better spacing
        marginVertical: 10,        // Vertical margin for separation from other elements
        paddingLeft: 20,           // Add padding for the left (icon space)
        borderRadius: 25,          // Rounded corners for a modern look
        backgroundColor: '#FFF',   // White background for the input field
        fontSize: 16,              // Adjust font size for better readability
        elevation: 3,              // Add shadow for a slightly elevated effect (on Android)
        shadowColor: '#000',       // Shadow color for iOS
        shadowOffset: { width: 0, height: 2 },  // Shadow offset for iOS
        shadowOpacity: 0.1,        // Slight opacity for the shadow
        shadowRadius: 4,   
        flex: 1, // Takes up all available space in the container
        marginRight: 10, // Add margin to the right of the search input        // Shadow blur radius for iOS
    },
    
    searchContainer: {
        flexDirection: 'row',          // Align the items horizontally
        alignItems: 'center',         // Vertically center the items
        justifyContent: 'space-between', // Ensure space between input and button
        marginHorizontal: 20,         // Add horizontal margin for spacing
        marginVertical: 10,
        width: '90%'           // Vertical margin for separation
    },

    dateContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginVertical: 20,
    },
    dateButton: {
        backgroundColor: '#8ED94D', // Set the background color to gray
        paddingVertical: 12,       // Increase vertical padding for better height
        paddingHorizontal: 100,     // Add horizontal padding to make it wider
        margin: 8,                 // Adjust margin for spacing
        borderRadius: 8,           // Round the corners
        alignItems: 'center',      // Center the text horizontally
    },
    dateButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    
    
});
