import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    pictureCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    header: {
        backgroundColor: '#8423D9',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 20,
        paddingTop: 60,
        marginBottom: 20,
        borderBottomWidth: 10,
        borderBottomColor: '#6C3A99',
        height: 150,
    },
    hText: {
        fontFamily: 'Jua',
        color: 'white',
        fontSize: 20,
    },
    leftContainer: {
        flex: 1,
    },
    rightContainer: {
        flex: 1,
        alignItems: 'flex-end',
    },
    menuContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontFamily: 'Jua',
        fontSize: 18,
        marginBottom: 10,
    },
    flatListContainer: {
        flexGrow: 1, // Ensure it grows to take available space
        justifyContent: 'center', // Center vertically
        alignItems: 'center', // Center horizontally
    },
    columnWrapper: {
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    levelContainer: {
        marginVertical: 10, // Add some vertical spacing between buttons
        alignItems: 'center', // Ensure the buttons are aligned centrally
    },
    menuText: {
        fontFamily: 'Jua',
        fontSize: 20,
        textAlign: 'center',
    },
    buttonText: {
        fontSize: 20,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        width: 300,
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
    modalText: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
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
    imageIcon: {
        width: 148,
        height: 100,
        resizeMode: 'contain',
    },
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover', // Ensure the image covers the entire background
    },
    container: {
        flex: 1,
        backgroundColor: 'transparent', // Make sure the background is transparent to show the image
    },
    titleContainer: {
        alignItems: 'center',
        marginBottom: 20, // Increased margin for better spacing
        marginTop: 20, // Add top margin to separate from the header
    },
    titleText: {
        fontFamily: 'Jua', 
        fontSize: 18,
        color: 'black', 
        textAlign: 'center',
    },

menuButton: {
    backgroundColor: '#8ED94D',
    height: 160,
    borderRadius: 5,
    padding: 5,
    marginBottom: 30,
    

},
menuButtonText: {
    fontSize: 40,
    color: "#fff",
},

classContainer: {
    backgroundColor: '#8ED94D',
    padding: 15,
    marginBottom: 40,
    marginTop: 20, // Add margin at the top for spacing
    borderRadius: 10,
    borderBottomWidth: 5,
    borderBottomColor: '#81AF59',
    borderBottomEndRadius: 5,
    borderBottomStartRadius: 5,
},
classText: {
    fontSize: 20,
    textAlign: 'left',
    fontFamily: 'Jua',
    color: 'white',
    lineHeight: 28, // Add line height for better readability
},

});

export default styles;
