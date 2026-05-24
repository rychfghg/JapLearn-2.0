import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
    },
    logoContainer: {
        marginTop: 200,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    textContainer: {
        width: 100,
    },
    textLogo: {
        fontFamily: 'Jua',
        color: '#757575',
        fontSize: 22,
        flexWrap: 'wrap',
    },
    button: {
        backgroundColor: '#8ED94D',
        padding: 10,
        width:  '100%',
        borderRadius: 5,
        borderColor: '#8AC25A',
        borderBottomWidth: 6,
        height: 50,
    },
    
    buttonText: {
        color: '#fff',
        fontSize: 22
    },
    
    buttonContainer: {
        alignItems:'center',
        rowGap: 20,
        marginTop: 100,
    },
});

export default styles;