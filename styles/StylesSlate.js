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
    gameScreen: {
        flex: 1,
        paddingHorizontal: 20,
        paddingBottom: 22,
        backgroundColor: 'rgba(247, 240, 252, 0.72)',
    },
    gameHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 14,
        paddingBottom: 18,
    },
    roundPill: {
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.94)',
        borderRadius: 18,
        paddingHorizontal: 22,
        paddingVertical: 9,
        borderWidth: 1,
        borderColor: '#eadcf1',
    },
    roundEyebrow: {
        color: '#8423D9',
        fontSize: 10,
        fontWeight: '600',
        letterSpacing: 1.4,
    },
    roundText: {
        color: '#40204c',
        fontSize: 15,
        fontWeight: '500',
        marginTop: 2,
    },
    challengeCard: {
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.96)',
        borderRadius: 28,
        paddingHorizontal: 24,
        paddingVertical: 24,
        borderWidth: 1,
        borderColor: '#e6d9ec',
        shadowColor: '#3b1748',
        shadowOffset: { width: 0, height: 7 },
        shadowOpacity: 0.12,
        shadowRadius: 15,
        elevation: 5,
    },
    challengeLabel: {
        color: '#68ad3b',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1.5,
        marginBottom: 12,
    },
    challengeInstruction: {
        color: '#88798d',
        fontSize: 12,
        fontWeight: '400',
        marginBottom: 8,
    },
    centeredContainer: {
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    japaneseText: {
        fontSize: 27,
        fontWeight: '500',
        color: '#3c2147',
        textAlign: 'center',
        marginBottom: 8,
    },
    englishText: {
        fontSize: 15,
        color: '#86778b',
        textAlign: 'center',
    },
    selectedAnswersContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
        minHeight: 82,
        marginVertical: 15,
        padding: 12,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#cdb5db',
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.82)',
    },
    answerPlaceholder: {
        color: '#978a9b',
        fontSize: 13,
    },
    selectedTextBox: {
        backgroundColor: '#f0e2fa',
        borderRadius: 11,
        paddingHorizontal: 13,
        paddingVertical: 9,
        margin: 4,
        borderColor: '#c997e8',
        borderWidth: 1,
    },
    selectedText: {
        fontSize: 16,
        color: '#542165',
        fontWeight: '600',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
        width: '100%',
        marginBottom: 12,
    },
    gameButton: {
        backgroundColor: 'rgba(255,255,255,0.96)',
        borderRadius: 14,
        minWidth: '27%',
        paddingHorizontal: 14,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 5,
        borderWidth: 1,
        borderColor: '#d8b8ec',
        shadowColor: '#4e1b63',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 2,
    },
    gameButtonText: {
        color: '#482154',
        fontSize: 16,
        fontWeight: '700',
    },
    submitResetContainer: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 'auto',
        paddingTop: 8,
        width: '100%',
    },
    submitButton: {
        flex: 2,
        backgroundColor: '#8423D9',
        borderRadius: 16,
        paddingVertical: 15,
        alignItems: 'center',
        shadowColor: '#8423D9',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 4,
    },
    submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
    resetButton: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingVertical: 15,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#dfd2e5',
    },
    resetButtonText: { color: '#6c5574', fontSize: 14, fontWeight: '700' },
    timerContainer: {
        minWidth: 57,
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.94)',
        borderRadius: 18,
        paddingHorizontal: 13,
        paddingVertical: 13,
        borderWidth: 1,
        borderColor: '#eadcf1',
    },
    timerText: { fontSize: 17, fontWeight: '800' },
    modalView: {
        width: '88%',
        maxWidth: 390,
        backgroundColor: '#fff',
        borderRadius: 28,
        padding: 25,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#eadced',
        shadowColor: '#32133e',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 9,
    },
    modalContent: { alignItems: 'center' },
    modalImage: { width: 112, height: 112, marginBottom: 10 },
    modalTitle: { fontSize: 22, fontWeight: '500', color: '#3c2944', textAlign: 'center', marginBottom: 8 },
    modalText: { fontSize: 15, lineHeight: 21, color: '#6d5b73', marginBottom: 10, textAlign: 'center' },
    modalExplanation: { fontSize: 13, lineHeight: 20, color: '#776a7b', textAlign: 'center', backgroundColor: '#faf7fb', borderRadius: 15, padding: 13, width: '100%', borderWidth: 1, borderColor: '#eee5f1' },
    modalWaiting: { color: '#679a47', fontSize: 10, fontWeight: '600', letterSpacing: 1, marginTop: 14, textTransform: 'uppercase' },
    completionEyebrow: { color: '#679f42', fontSize: 10, fontWeight: '600', letterSpacing: 1.5, marginBottom: 8 },
    feedbackAccent: { position: 'absolute', top: 0, left: 38, right: 38, height: 4, borderBottomLeftRadius: 8, borderBottomRightRadius: 8 },
    feedbackAccentCorrect: { backgroundColor: '#72b54a' },
    feedbackAccentWrong: { backgroundColor: '#d46a78' },
    completionMark: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: '#eef8e8', borderWidth: 1, borderColor: '#cce6bb', marginBottom: 12 },
    completionMarkText: { color: '#64a63b', fontSize: 24, fontWeight: '500' },
    modalButton: { width: '100%', alignItems: 'center', backgroundColor: '#8423D9', borderRadius: 15, paddingVertical: 14 },
    modalButtonText: { fontSize: 15, color: '#fff', fontWeight: '600' },
});

export default stylesSlate;
