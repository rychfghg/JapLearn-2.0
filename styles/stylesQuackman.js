import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const cellSize = Math.min(width, height - 100) / 5 - 25;

export const stylesQuackman = StyleSheet.create({
    progressContainer: {
        alignItems: 'flex-end',
    },
    progress: {
        backgroundColor: '#FDFCFE',
        width: 100,
        height: 50,
        borderRadius: 50,
        margin: 20,
        justifyContent: 'center',
    },
    progressText: {
        textAlign: 'center',
    },
    menuContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: -30,
    },
    centeredContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column', // This ensures text is above the image
    },
    Quacklogo: {
        width: 150,
        height: 150,
        marginBottom: 50,
    },
    textStyle: {
        fontFamily: 'Jua',
        fontSize: 30,
        marginTop: 10, // Add some margin for spacing between the image and the text
    },
    attemptsContainer: {
        height: 50,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 10, // Increased margin to add space below the circles
    },
    attempt: {
        height: 40,
        width: 40,
        borderRadius: 20,
        backgroundColor: '#C7C5C5',
        margin: 5,
    },
    attemptWrong: {
        backgroundColor: '#FF6347', // Red color for incorrect attempt
    },
    attemptCorrect: {
        backgroundColor: '#8ED94D', // Green color for correct attempt
    },
    charGridContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 20,
        marginTop: 10, // Added margin above the grid for spacing
    },
    charGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10, // Add some space above the grid items
    },
    charCell: {
        width: cellSize,
        height: cellSize,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 8, // Increased margin between individual cells
        backgroundColor: '#8423D9',
        borderRadius: 10,
    },
    charCellSelected: {
        backgroundColor: '#6C3A99', // Change color when selected
    },
    charText: {
        fontSize: 18, // Slightly reduce text size for better readability
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 5, // Space between text and the character
    },
    hintInputContainer: {
        padding: 10,
        backgroundColor: '#A883C8', // Set background color for the entire container
        alignItems: 'center',
    },
    hintContainer: {
        marginBottom: 10, // Add margin to separate hint text from input cells
    },
    hintText: {
        fontSize: 16,
        color: '#333',
    },
    inputContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    },
    inputCell: {
        width: 40,
        height: 40, // Ensure the cell is square
        justifyContent: 'center',
        alignItems: 'center',
        margin: 5,
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#8423D9',
        borderRadius: 10,
    },
    inputText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#8423D9',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: 300,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalText: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
    },
    gameOverContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9F5FF', // Light background color for contrast
        paddingHorizontal: 20,
    },
    gameOverText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#4CAF50', // Bright green for success message
        marginBottom: 10, // Add spacing below the Game Over text
        textAlign: 'center',
    },
    scoreText: {
        fontSize: 18,
        color: '#333333', // Neutral text color for the score
        marginBottom: 30, // Add spacing below the score text
        textAlign: 'center',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        width: '70%', // Adjust the width of the buttons' container
    },
    endButton: {
        backgroundColor: '#8423D9',
        height: 50,
        width: 80,
    },
    endButtonText: {
        fontSize: 20,
        color: '#fff'
    },
    backButton: {
        backgroundColor: '#D9534F', // Red for back button
        borderRadius: 25,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        width: 100, // Adjust button width
        shadowColor: '#000', // Add shadow for depth
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5, // Android shadow
        marginLeft: 10, // Add space between Retry and Back buttons
    },
    
    backButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    
    retryButton: {
        backgroundColor: '#6200EE', // Purple for the Retry button
        borderRadius: 25,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        width: 100, // Adjust button width
        shadowColor: '#000', // Add shadow for depth
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5, // Android shadow
    },
    
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    modButton: {
        height: 40,
        backgroundColor: '#8ED94D'
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#6C3A99', // Lighter purple to match the character color
        paddingHorizontal: 20, // Add some padding on the sides
    },
    loadingTitle: {
        fontSize: 36,
        fontWeight: 'bold',
        color: 'white',
    },
    loadingQuackLogo: {
        width: 150,
        height: 150,
        marginVertical: 20,
    },
    loadingText: {
        marginTop: 20,
        fontSize: 30,
        fontWeight: 'bold',
        color: 'white',
    },
    introModalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dimmed background for the modal
    },
    introModalContainer: {
        width: '85%',
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5, // Add shadow for Android
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 }, // iOS shadow
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
    closeButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#8423D9', // Match your theme color
    },
    introTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
        textAlign: 'center',
    },
    introText: {
        fontSize: 16,
        color: '#555',
        textAlign: 'center',
        lineHeight: 22,
    },
    angelContainer: {
        position: 'absolute',
        bottom: 0,
        left: '50%',
        transform: [{ translateX: -50 }], // Center horizontally
        alignItems: 'center',
    },
    angelImage: {
        width: 200,
        height: 200,
        resizeMode: 'contain',
    },
    modalContentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    
    modalImage: {
        width: 80, // Adjust the size as needed
        height: 80,
        marginRight: -100, // Add space between the image and the text content
        resizeMode: 'contain',
    },
    
    modalTextContent: {
        flex: 1, // Ensure the text content takes up the remaining space
    },
    loadingBackgroundImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: width, // Full screen width
        height: height + 50, // Increase height to stretch further down
        resizeMode: 'cover', // You can also try 'stretch' if needed
    },
    loadingContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },

    progressBarContainer: {
        width: '80%', // Width of the progress bar container
        height: 20, // Height of the progress bar
        backgroundColor: '#ddd', // Background color for the bar
        borderRadius: 10, // Rounded corners
        overflow: 'hidden', // Ensure the progress doesn't overflow
        marginTop: 10, // Space between the bar and other elements
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#8423D9', // Progress bar color
        borderRadius: 10, // Match the container's radius
    },
    
    
    
});
