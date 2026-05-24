import { StyleSheet } from 'react-native';

const stylesSlate = StyleSheet.create({
    title: {
        fontSize: 48, // Huge font size for the title
        fontWeight: 'bold',
        color: '#8423D9', // Violet color
        textAlign: 'center',
        marginBottom: 5, // Space between title and small text
    },
    waitTitle: {
        fontSize: 25, // Huge font size for the title
        fontWeight: 'bold',
        color: '#8423D9', // Violet color
        textAlign: 'center',
        marginBottom: 40, // Space between title and small text
        marginTop: 20
    },
    smallText: {
        fontSize: 17, // Smaller font size
        color: '#6D6D6D', // Grey color for the description
        textAlign: 'center',
        marginBottom: 20, // Space between the small text and the text box
    },
    centeredContainer: {
        flex: 1,
        justifyContent: 'center', // Center items vertically
        alignItems: 'center',
        paddingHorizontal: 30, // Add horizontal padding if needed
        marginTop: 50, // Move the content 50px higher
    },
    centeredContainerWait: {
        flex: 1,
        justifyContent: 'center', // Center items vertically
        alignItems: 'center',
        paddingHorizontal: 30, // Add horizontal padding if needed
        marginTop: -100
    },
    textBoxWrapper: {
        backgroundColor: '#8ED94D', // Grey background for the wrapper
        padding: 20, // Padding inside the grey box
        borderRadius: 10, // Rounded corners for the grey box
        width: '100%', // Full width for better flexibility
        maxWidth: 400, // Limit max width to avoid overly wide content
        alignItems: 'center',
        marginBottom: 30, // Margin below the text box
    },
    textBox: {
        height: 50, // Height of the text box
        width: '100%', // Full width of the wrapper
        backgroundColor: 'white', // Background color for the text box
        color: '#8423D9', // Violet text color
        borderRadius: 10, // Rounded corners
        paddingHorizontal: 15, // Padding inside the text box
        fontSize: 18, // Text size
        marginBottom: 10, // Margin below the text box
    },
    button: {
        backgroundColor: '#323332', // Original button background color
        borderRadius: 10, // Rounded corners for the button
        width: '100%', // Make the button take the full width of the wrapper
        paddingHorizontal: 20, // Padding inside the button
        paddingVertical: 10, // Vertical padding
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: 'white', // Original button text color
        fontSize: 15, // Button text size
        fontWeight: 'bold', // Button text weight
    },
    buttonContainer: {
        flexDirection: 'row', // Align buttons horizontally
        justifyContent: 'center', // Center the buttons horizontally
        alignItems: 'center', // Center the buttons vertically
        flexWrap: 'wrap', // Allow wrapping if the buttons take more than one line
        marginTop: 20, // Space above the button container
        marginBottom: 15, // Space below the button container
        width: '100%', // Full width to distribute buttons
    },
    gameButton: {
        backgroundColor: '#8ED94D', // Violet background for the game buttons
        borderRadius: 15, // Rounded corners for a modern look
        width: '40%', // Slightly larger button width
        paddingVertical: 15, // More padding for a larger button
        alignItems: 'center', // Center the button text
        justifyContent: 'center', // Center the button text vertically
        margin: 10, // Space between buttons
        shadowColor: '#000', // Add subtle shadow for a floating effect
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5, // For Android shadow
        borderWidth: 2, // Add a border for a polished look
        borderColor: '#6D6D6D', // Slightly darker shade for the border
    },
    gameButtonText: {
        color: '#FFFFFF', // White text color for better contrast
        fontSize: 15, // Larger font size for better readability
        fontWeight: 'bold', // Bold text
        textTransform: 'capitalize', // Capitalize the button text
    },
    japaneseText: {
        fontSize: 30,  // **Increased** font size for the Japanese text
        fontWeight: 'bold',
        color: '#8423D9',  // Dodger blue color for the Japanese text
        textAlign: 'center',
        marginBottom: 10,  // Add more margin below the Japanese text
    },
    englishText: {
        fontSize: 20, // Smaller font for the English translation
        color: '#888', // Light gray color for English translation
        fontStyle: 'italic', // Italic style for English translation
        marginTop: 5,
      },
    selectedAnswersContainer: {
        flexDirection: 'row',  // Display selected answers in a row
        justifyContent: 'center',  // Center the selected answer boxes
        flexWrap: 'wrap',  // Allow wrapping if the selected answers exceed the width
        marginVertical: 20,  // Add space above and below the selected answers
    },

    selectedTextBox: {
        backgroundColor: '#F0F0F0',  // Light grey background for each answer box
        borderRadius: 10,  // Rounded corners for each answer box
        padding: 10,  // Padding inside each answer box
        margin: 5,  // Add space between each answer box
        borderColor: '#8423D9',  // Violet border to match the theme
        borderWidth: 2,  // Border width for emphasis
    },
    selectedText: {
        fontSize: 20,  // Larger font size for the selected answers
        color: '#333333',  // Darker text color for contrast
        textAlign: 'center',
    },

    submitResetContainer: {
        flexDirection: 'row',  // Align the Submit and Reset buttons horizontally
        justifyContent: 'space-around',  // Space between the buttons
        marginTop: 20,
        marginBottom: 40,
        paddingHorizontal: 20,
        width: '100%',
    },
    submitButton: {
        backgroundColor: '#8423D9', // Violet background matching the theme
        borderRadius: 20, // Rounded corners
        paddingVertical: 15,
        paddingHorizontal: 20,
        shadowColor: '#000', // Shadow for floating effect
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5, // For Android shadow
        borderWidth: 1, // Add a border
        borderColor: '#6D6D6D', // Border color
    },
    submitButtonText: {
        color: '#FFFFFF', // White text for contrast
        fontSize: 18, // Larger font size
        fontWeight: 'bold', // Bold text
    },
    resetButton: {
        backgroundColor: '#FF6347', // Red background for the reset button
        borderRadius: 20, // Rounded corners
        paddingVertical: 15,
        paddingHorizontal: 20,
        shadowColor: '#000', // Shadow for floating effect
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5, // For Android shadow
        borderWidth: 1, // Add a border
        borderColor: '#6D6D6D', // Border color
    },
    resetButtonText: {
        color: '#FFFFFF', // White text for contrast
        fontSize: 18, // Larger font size
        fontWeight: 'bold', // Bold text
    },
    timerContainer: {
        backgroundColor: '#ACACAC',  // Greyish white box (semi-transparent)
        padding: 10,
        borderRadius: 10,
        alignSelf: 'flex-end',  // Align to the right side of the screen
        marginRight: 20,  // Add some margin to the right side
        marginTop: 20,  // Add margin to the top to move it lower from the header
    },
    timerText: {
        fontSize: 18,  // Size of the timer text
        color: 'black',  // Orange-red color for the timer text
        fontWeight: 'bold',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: 400,
        position: 'relative'
    },
    quackslateEditContent: {
        width: '90%',
        backgroundColor: '#8ED94D',
        borderRadius: 10,
        justifyContent: 'center',
        padding: 20,
        marginVertical: 5,
        borderBottomColor: '#83C449',
        borderBottomWidth: 5,
        alignSelf: 'center', 
    },
    gameCodeContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 150,
        width: '100%',
        position: 'absolute',
        color: '#FFFFFF',
    },
    gameCodeText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'black',
        marginLeft:70
    },
    gameCodeTextHost: {
        fontSize: 30,
        fontWeight: 'bold',
        color: 'black',
        
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        width: 400,
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
    modalButton: {
        backgroundColor: '#8ED94D',
        borderRadius: 5,
        padding: 5

    },
    modalButtonText: {
        fontSize: 20,
        color: "#fff",
    },
    triviaHeader: {
        alignItems: 'center', // Center the text horizontally
        marginBottom: 10, // Space between the header and the trivia box
        position: 'relative', // Enable positioning for the image to overlap
    },
    triviaImageOverlap: {
        position: 'absolute', // Make the image overlap the text
        width: 110, // Smaller width for the image
        height: 110, // Smaller height for the image
        top: -40, // Adjust position vertically to overlap slightly
        left: -120, // Adjust position horizontally to overlap slightly
    },
    triviaTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#8423D9', // Violet color for the title
        
    },
    triviaBox: {
        backgroundColor: 'rgba(223, 255, 214, 0.8)', // Pastel green with transparency
        padding: 15, // Inner padding
        borderRadius: 10, // Rounded corners
        marginTop: 10, // Space between the "Did you know?" title and the box
        width: '90%', // Responsive width
        alignItems: 'center', // Center-align content
        borderWidth: 1, // Thin border
        borderColor: '#8423D9', // Violet border
        shadowColor: '#000', // Subtle shadow for card effect
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5, // Shadow for Android
    },
    triviaText: {
        fontSize: 16,
        color: '#333', // Neutral dark text color
        textAlign: 'center',
    },
    modalContent: {
        flexDirection: 'row', // Align the image and text horizontally
        alignItems: 'center', // Center the image and text vertically
        marginBottom: 10, // Add some spacing below the image and text
    },
    modalImageContainer: {
        alignItems: 'center', // Center the image inside the container
        justifyContent: 'center', // Ensure the image is centered
    },
    modalImage: {
        width: 80, // Size of the image
        height: 80, // Size of the image
        marginRight: 10,
        borderRadius: 45, // Makes the image round
      },
      modalImageMenu: {
        width: 100, // Size of the image
        height: 100, // Size of the image
      },
    modalView: {
        width: 400,
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
    modalText: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    loadingText: {
        marginTop: 20,
        fontSize: 30,
        fontWeight: 'bold',
    },
    scrollViewContent: {
        flexGrow: 1,
        paddingBottom: 10, // Prevent content from being cut off
    },
});

export default stylesSlate;