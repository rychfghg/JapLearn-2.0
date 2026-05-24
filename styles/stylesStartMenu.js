import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    input: {
        backgroundColor:'#EFECEC',
        color: '#A4A4A4',
        borderRadius: 10,
        padding: 10,
        width: 340,
        marginBottom: 10,
        height: 70,
    },
    pictureCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    header: {
        backgroundColor: '#C7C5C5',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingTop: 40,
        marginBottom: 20,
        height:150,
        
    },
    hText1: {
        fontFamily: 'Jua',
        fontSize: 30,
    },
    hText2: {
        fontFamily: 'Jua',
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
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuText: {
        fontFamily: 'Jua',
        fontSize: 30,
    },
    button: {
        backgroundColor:'#8ED94D',
        borderBottomColor: '#74A14C',
        borderBottomWidth: 4,
        padding: 5,
        height: 60,
        width: 100,
        marginBottom: 20,
        borderRadius: 10,
        borderBottomStartRadius: 5,
        borderBottomEndRadius: 5,
        justifyContent: 'center',
    },
    buttonText: {
        fontSize: 20,
        color: 'white',
    },
    pictureCircle: {
        backgroundColor: 'white',
        width: 65, 
        height: 65, 
        borderRadius: 50,
    },
    profileButton: {
        height: 60,
        backgroundColor: '#7551B0',
        borderRadius: 10,
    },
    profileButtonText: {
        fontSize: 25,
        color: "#fff",
    },

    profileIcon: {
        borderRadius: 100,
        overflow: 'hidden',
        alignSelf: 'flex-end', // Adjust as per your layout needs
    },
    rightContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    },
    
    
});
