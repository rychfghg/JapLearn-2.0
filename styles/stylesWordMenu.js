import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        flex: 1,
        resizeMode: 'cover',
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
    backButtonContainer: {
        height: 50,
        width: 50,
        borderRadius: 50,
        backgroundColor: '#462A5E',
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuContainer: {
        flex: 1,
        alignItems: 'center', // Horizontally center the buttons
        justifyContent: 'center', // Vertically center the buttons
        paddingHorizontal: 20, // Add horizontal padding for responsiveness
        paddingVertical: 20,
        width: '100%', // Ensure full width for consistent alignment
    },
});

export default styles;
