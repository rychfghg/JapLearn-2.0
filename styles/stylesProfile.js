import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        height: 90,
        justifyContent: 'center',
        paddingLeft: '5%',
        paddingTop: 30,
    },
    cover: {
        backgroundColor: '#8423D9',
        height: 180,
        justifyContent: 'center',
        alignItems: 'center',
        
    },
    coverStudent: {
        backgroundColor: '#8423D9',
        height: 180,
        justifyContent: 'center',
        alignItems: 'center',
        alignItems: 'flex-end', // Align content to the right 
        paddingBottom:40,
        paddingRight:10
    },
    profilePicture: {
        width: 120,
        height: 120,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: 'white',
    },
    profileContainer: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 110,
        marginLeft: 10,
        shadowColor: 'light-grey',
    },
    description: {
        padding: 20,
        borderBottomColor: '#E1E1E1',
        borderBottomWidth: 5,
        borderTopWidth: 0,
        borderLeftWidth: 0,
        borderRightWidth: 0,
    },
    descText: {
        fontFamily: 'Jua',
        fontSize: 20,
        marginTop: 10,
    },
    descTextContainer: {
        justifyContent: 'center',
    },
    descTextContainerStudent: {
        justifyContent: 'center',
        marginTop:-40
    },
    actionContainer: {
        alignItems: 'flex-end', // Center items horizontally
        marginTop: 5, // Adjust spacing above
        marginRight: 10
      },
    whiteSpace: {
        height: 75,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingRight: '5%',
    },
    whiteSpaceStudent: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingRight: '10%',
    },
    buttonContainer: {
        height: 50,
        backgroundColor: '#bababa',
        borderRadius: 40,
        overflow: 'hidden',
        justifyContent: 'center',
    },
    buttonContainerStudent: {
        height: 50,
        backgroundColor: '#bababa',
        borderRadius: 20,
        overflow: 'hidden',
        justifyContent: 'center',
        marginVertical: 5,
        width: 100,
        marginBottom: 20, // Increased space below Logout button
    },
    buttonText: {
        color: 'white',
        fontFamily: 'Jua',
        fontSize: 16,
        textAlign: 'center',
        paddingVertical: 10,
        paddingHorizontal: 10,
    },
    buttonTextStudent: {
        color: 'white',
        fontFamily: 'Jua',
        fontSize: 16,
        textAlign: 'center',
        paddingVertical: 10,
        paddingHorizontal: 10,
    },
    clickableTextStudent: {
        color: '#6200EE',
        fontSize: 16,
        textDecorationLine: 'underline',
        marginTop: 10, // Space between the Logout button and the clickable text
      },
    button: {
        backgroundColor: '#6200EE', // Purple button
        borderRadius: 5,
        paddingVertical: 10,
        paddingHorizontal: 20,
        alignItems: 'center',
        marginTop: 10,
    },
    categoryContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
    categoryButton: {
        backgroundColor: '#8ED94D',
        paddingVertical: 20,
        paddingHorizontal: 10,
        borderRadius: 35,
        marginHorizontal: 5,
    },
    categoryButtonText: {
        color: 'white',
        fontFamily: 'Jua',
        fontSize: 14,
    },
    contentScrollContainer: {
        paddingHorizontal: 20,
    },
    contentContainer: {
        paddingBottom: 20,
    },
    scoresContainer: {
        marginTop: 20,
    },
    gameTitle: {
        fontSize: 22,
        fontFamily: 'Jua',
        textAlign: 'center',
        marginBottom: 20,
    },
    scoreCard: {
        backgroundColor: '#E1E1E1',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    scoreText: {
        fontSize: 16,
        fontFamily: 'Jua',
        marginBottom: 5,
    },
    noScoresText: {
        fontSize: 18,
        fontFamily: 'Jua',
        textAlign: 'center',
        marginTop: 20,
        color: 'grey',
    },
    // Modal Styles
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dim the background
    },
    modalContent: {
        width: '80%', // Adjust width to a narrower size
        maxWidth: 300, // Limit maximum width for better UI
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000', // Add shadow for better focus
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5, // For Android
    },
    modalTitle: {
        fontSize: 18, // Slightly smaller title font
        fontFamily: 'Jua',
        marginBottom: 10,
        fontWeight: 'bold',
    },
    modalMessage: {
        fontSize: 16,
        color: '#555',
        textAlign: 'center',
        marginVertical: 10,
        lineHeight: 22, // Better readability
    },
    buttonContainer: {
        backgroundColor: '#bababa', // Light gray for buttons
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginTop: 15,
        marginRight: 10,
    },
    
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#E1E1E1',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
    },
    errorInput: {
        borderColor: 'red',
    },
    errorText: {
        color: 'red',
        fontSize: 14,
        marginBottom: 10,
        fontFamily: 'Jua',
    },
    modalButton: {
        backgroundColor: '#8ED94D',
        borderRadius: 5,
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginTop: 10,
    },
    modalButtonText: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
        fontFamily: 'Jua',
    },
    badgeContainer: {
        flexDirection: "row",
        justifyContent: "center", // Closer alignment
        alignItems: "center",
        marginTop: 10, // Slight margin for balance
        // paddingHorizontal: 400, // Reduced padding
    },
    badgeWrapper: {
        alignItems: "center",
        marginHorizontal: 0,
    },
    badgeImage: {
        width: 110,
        height: 100,
        resizeMode: "contain",
    },
    badgeText: {
        marginTop: 10,
        fontSize: 14,
        fontWeight: "bold",
        textAlign: "center",
    },

    badgesTitle: {
        fontSize: 22,
        fontWeight: "bold",
        textAlign: "center",
        marginVertical: 20,
        fontFamily: "Jua", // Keep consistent with your app's font style
      },
      
      lockedBadgeWrapper: {
        backgroundColor: "#E1E1E1", // Light gray background
        borderRadius: 75, // Rounded container for consistency
        padding: 5, // Inner padding for better spacing
        alignItems: "center",
        justifyContent: "center",
      },
      
      lockedBadgeImage: {
        opacity: 0.5, // Make the badge image semi-transparent
      },
      
      
});
