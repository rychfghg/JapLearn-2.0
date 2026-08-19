import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const cellSize = Math.min(width, height - 100) / 5 - 25;

export const stylesQuackman = StyleSheet.create({
    gameScreen:{flex:1,paddingTop:48},screenShade:{...StyleSheet.absoluteFillObject,backgroundColor:'rgba(250,247,255,.18)'},gameHeader:{height:51,flexDirection:'row',alignItems:'center',paddingHorizontal:16,zIndex:8},headerButton:{width:46,height:46,borderRadius:16,backgroundColor:'#FFF',alignItems:'center',justifyContent:'center',elevation:6},modePill:{marginLeft:9,flexDirection:'row',alignItems:'center',gap:6,backgroundColor:'rgba(255,255,255,.94)',borderRadius:99,paddingHorizontal:11,paddingVertical:9},modeText:{fontSize:8,fontWeight:'900',letterSpacing:.9,color:'#563270'},roundPill:{marginLeft:'auto',backgroundColor:'#7140C6',borderRadius:14,paddingHorizontal:13,paddingVertical:10},roundText:{fontFamily:'Jua',fontSize:12,color:'#FFF'},
    progressContainer: {
        alignItems: 'flex-end',
    },
    progress: {
        backgroundColor: 'rgba(255,255,255,.94)',
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
        marginBottom: -44,
    },
    centeredContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column', // This ensures text is above the image
    },
    Quacklogo: {
        width: 132,
        height: 132,
        marginBottom: 50,
    },
    textStyle: {
        fontFamily: 'Jua',
        fontSize: 21,
        color:'#43264F',backgroundColor:'rgba(255,255,255,.90)',paddingHorizontal:15,paddingVertical:6,borderRadius:99,
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
        height: 19,
        width: 42,
        borderRadius: 10,
        backgroundColor: '#F3EAF8',borderWidth:2,borderColor:'#D7C4E3',
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
        paddingBottom: 10,
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
        margin: 6,
        backgroundColor: 'rgba(255,255,255,.95)',
        borderRadius: 14,borderWidth:2,borderColor:'#7140C6',elevation:4,
    },
    charCellSelected: {
        backgroundColor: '#6C3A99', // Change color when selected
    },
    charText: {
        fontSize: 18, // Slightly reduce text size for better readability
        fontWeight: 'bold',
        color: '#4A275B',fontFamily:'Jua',
        marginBottom: 5, // Space between text and the character
    },
    hintInputContainer: {
        padding: 10,
        backgroundColor: 'rgba(255,255,255,.96)',
        alignItems: 'center',
        borderTopLeftRadius:28,borderTopRightRadius:28,borderWidth:1,borderColor:'#E3D5EA',
    },
    hintContainer: {
        marginBottom: 10, // Add margin to separate hint text from input cells
    },
    hintText: {
        fontSize: 14,
        color: '#4A4150',fontFamily:undefined,fontWeight:'400',textAlign:'left',lineHeight:20,
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
        borderRadius: 26,
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
        height: 44,
        backgroundColor: '#7140C6',borderRadius:14
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
        borderRadius: 28,
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
        fontFamily:'Jua',
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
    exitOverlay:{flex:1,backgroundColor:'rgba(37,20,48,.56)',alignItems:'center',justifyContent:'center',padding:24},exitCard:{width:'100%',maxWidth:360,backgroundColor:'#FFF',borderRadius:28,padding:22,alignItems:'center'},exitIcon:{width:62,height:62,borderRadius:21,backgroundColor:'#EEE6FA',alignItems:'center',justifyContent:'center'},exitTitle:{fontFamily:'Jua',fontSize:24,color:'#382044',marginTop:13},exitMessage:{fontSize:11,lineHeight:17,color:'#766A7B',textAlign:'center',marginTop:6,marginBottom:17},continueButton:{width:'100%',height:50,borderRadius:16,backgroundColor:'#7140C6',alignItems:'center',justifyContent:'center'},continueButtonText:{fontFamily:'Jua',fontSize:12,color:'#FFF'},leaveButton:{paddingTop:15,paddingBottom:3},leaveButtonText:{fontFamily:'Jua',fontSize:11,color:'#B04D60'},
    
    
    
    loadingShade:{...StyleSheet.absoluteFillObject,backgroundColor:'rgba(37,19,52,.24)'},loadingBadge:{flexDirection:'row',gap:7,alignItems:'center',backgroundColor:'rgba(255,255,255,.94)',borderRadius:99,paddingHorizontal:13,paddingVertical:9},loadingBadgeText:{fontSize:8,fontWeight:'900',letterSpacing:1,color:'#58316D'},loadingPortal:{width:180,height:180,borderRadius:90,backgroundColor:'rgba(255,255,255,.28)',borderWidth:2,borderColor:'rgba(255,255,255,.65)',alignItems:'center',justifyContent:'center',marginTop:18},loadingMascot:{width:142,height:142,resizeMode:'contain'},loadingGameTitle:{fontFamily:'Jua',fontSize:34,color:'#FFF',letterSpacing:1,textShadowColor:'rgba(44,20,60,.6)',textShadowRadius:8,marginTop:8},loadingSubtitle:{fontSize:11,color:'#FFF',marginTop:3},introIcon:{width:66,height:66,borderRadius:22,backgroundColor:'#EEE6FA',alignItems:'center',justifyContent:'center',alignSelf:'center'},introKicker:{fontSize:8,fontWeight:'900',letterSpacing:1.2,color:'#65A936',textAlign:'center',marginTop:13},introRules:{flexDirection:'row',gap:8,marginTop:16},introRule:{flex:1,alignItems:'center',backgroundColor:'#F8F4FB',borderRadius:16,padding:10},introRuleText:{fontSize:9,color:'#65566D',marginTop:5},introStart:{height:51,borderRadius:16,backgroundColor:'#7140C6',flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8,marginTop:17},introStartText:{fontFamily:'Jua',fontSize:12,color:'#FFF'},submitIcon:{width:56,height:56,borderRadius:19,backgroundColor:'#EEE6FA',alignItems:'center',justifyContent:'center'},modalKicker:{fontSize:8,fontWeight:'900',letterSpacing:1.1,color:'#65A936',marginTop:10},modalWord:{fontFamily:'Jua',fontSize:20,color:'#7140C6',backgroundColor:'#F4ECFA',borderRadius:14,paddingHorizontal:15,paddingVertical:9,marginBottom:16},cancelSubmit:{height:44,minWidth:95,borderRadius:14,backgroundColor:'#F1EAF5'},cancelSubmitText:{color:'#694D75'},confirmSubmitText:{color:'#FFF'},
    refinedStage:{height:220,marginTop:2,marginBottom:0},refinedMascot:{width:122,height:122,marginBottom:8},refinedAttempts:{height:34,marginBottom:1},refinedGridContainer:{paddingBottom:6,marginTop:0},refinedGrid:{marginTop:0,paddingHorizontal:10},refinedTile:{width:(width-68)/4,height:52,margin:5,borderRadius:14},refinedHintPanel:{marginHorizontal:12,marginBottom:10,borderRadius:24,paddingHorizontal:15,paddingTop:14,paddingBottom:12,borderWidth:1,borderColor:'#DED0E7',shadowColor:'#3D204A',shadowOpacity:.13,shadowRadius:10,elevation:6},clueLabel:{fontSize:8,fontWeight:'900',letterSpacing:1,color:'#65A936',marginBottom:6},clueRow:{flexDirection:'row',alignItems:'flex-start',gap:9},clueIcon:{width:35,height:35,borderRadius:12,backgroundColor:'#FFF0C9',alignItems:'center',justifyContent:'center'},clueTextWrap:{flex:1},clueTitle:{fontFamily:'Jua',fontSize:13,color:'#43264F'},clueHint:{fontSize:10,lineHeight:15,color:'#766A7B',marginTop:2},answerLabel:{fontSize:7,fontWeight:'900',letterSpacing:.8,color:'#7140C6',textAlign:'center',marginTop:10},refinedInputs:{paddingVertical:7},centeredAngel:{left:0,right:0,top:'35%',bottom:'auto',transform:[],zIndex:40,pointerEvents:'none'},angelGlow:{position:'absolute',width:230,height:230,borderRadius:115,backgroundColor:'rgba(255,255,255,.50)'},
readableClueLabel:{fontFamily:undefined,fontWeight:'700'},readableClueTitle:{fontFamily:undefined,fontWeight:'600',fontSize:14,color:'#352C3A'},readableHint:{fontFamily:undefined,fontWeight:'400',fontSize:13,lineHeight:19,color:'#4A4150',textAlign:'left'},
    loadingBackButton:{position:'absolute',left:20,top:50,width:49,height:49,borderRadius:17,backgroundColor:'rgba(255,255,255,.96)',alignItems:'center',justifyContent:'center',zIndex:20,shadowColor:'#34203D',shadowOpacity:.18,shadowRadius:8,shadowOffset:{width:0,height:4},elevation:8},
});
