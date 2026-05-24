import { StyleSheet, Dimensions } from "react-native";


const styles = StyleSheet.create({

    container: {
        flex: 1,
        justifyContent: 'center',  // Vertically center the card container
        alignItems: 'center',      // Horizontally center the card container
    },
    cardContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',  // Horizontally center the cards within the card container
        alignItems: 'center',      // Vertically center the cards within the card container
        padding: 20,
    },
    card: {
        width: 100,
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 10,
        backgroundColor: '#DDD',
        borderRadius: 10,
        overflow: 'hidden',
    },
    cardText: {
        fontSize: 24,
        color: '#333',
    },
    cardImage: {
        width: '100%',
        height: '100%',
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
    modalText: {
        marginBottom: 15,
        fontSize: 20,
        textAlign: "center"
    },
    modalButton: {
        backgroundColor: '#8ED94D',
        width: 100,
        height: 50,
        padding: 10,
        marginBottom: 5,
        borderRadius: 5,

    },
    modalButtonText: {
        color: "#fff",
    }

});

export default styles;
