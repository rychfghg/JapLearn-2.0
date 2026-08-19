import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#8ED94D',
        padding: 10,
        width: '100%',
        borderRadius: 16,
        borderColor: '#8AC25A',
        borderBottomWidth: 6,
        height: 60,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9,
    },
    buttonPressed: { opacity: 0.86, transform: [{ scale: 0.99 }] },

    buttonText: {
        color: '#fff',
        fontSize: 21,
        fontFamily: 'Jua',
    },

    buttonContainer: {
        alignItems: 'center',
        marginTop: 8,
    },

    container: {
        flex: 1,
        backgroundColor: '#FBF9FD',
        overflow: 'hidden',
    },
    scrollContent: { flexGrow: 1, paddingHorizontal: 22, paddingVertical: 34 },
    contentWrapper: { width: '100%', maxWidth: 520, alignSelf: 'center' },
    backgroundOrbTop: {
        position: 'absolute', width: 250, height: 250, borderRadius: 125,
        backgroundColor: '#F0E4FA', top: -120, right: -75,
    },
    backgroundOrbBottom: {
        position: 'absolute', width: 210, height: 210, borderRadius: 105,
        backgroundColor: '#EAF7DF', bottom: -110, left: -75,
    },
    formCard: {
        backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20,
        shadowColor: '#462A5E', shadowOpacity: 0.12, shadowRadius: 20,
        shadowOffset: { width: 0, height: 8 }, elevation: 6,
    },
    inputShell: {
        flexDirection: 'row', alignItems: 'center', gap: 2,
        backgroundColor: '#F6F3F8', borderWidth: 1, borderColor: '#E8E0ED',
        borderRadius: 15, paddingHorizontal: 15, marginBottom: 12,
    },

    input: {
        flex: 1, color: '#462A5E', paddingHorizontal: 10, height: 56,
        fontSize: 16, outlineStyle: 'none', outlineWidth: 0,
    },

    imageContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    brandText: { color: '#8ED94D', fontSize: 20, fontFamily: 'Jua', marginTop: 8 },
    subtitleText: { color: '#817586', fontSize: 14, marginTop: 5, textAlign: 'center' },

    linkContainer: {
        marginTop: 20,
        alignItems: 'center',
    },

    linkText: {
        color: '#8423D9',
        fontWeight: '700',
        fontSize: 14,
    },
    linkPrompt: { color: '#817586', fontSize: 14 },

    errorInput: {
        borderWidth: 1,
        borderColor: '#D84343',
    },

    errorText: {
        color: '#B3261E',
        marginLeft: 5,
        marginBottom: 18,
        fontSize: 12,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
        width: '100%',
        backgroundColor: '#F6F3F8', borderWidth: 1, borderColor: '#E8E0ED',
        borderRadius: 15, paddingLeft: 15, marginBottom: 12,
    },
    passwordInput: {
        flex: 1,
        paddingRight: 40,
    },
    insideInputButton: {
        position: 'absolute',
        right: 8,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleText: {
        fontSize: 25,
        fontFamily: 'Jua',
        color: '#462A5E',
        marginTop: 8,
        textAlign: 'center',
    },

    modalWrapper: {
        flex: 1,
       
        justifyContent: 'flex-start', // Align to the top for scrolling
        paddingTop: 50, // Add space at the top
    },
    
    modalContent: {
        width: '90%',
        maxHeight: '80%', // Allow some space at the top and bottom
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
    },
    

});

export default styles;
