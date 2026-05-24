import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E9ECEF',
    },
    background: {
        flex: 1,
        resizeMode: 'cover',
    },
    backButtonContainer: {
        height: 50,
        width: 50,
        borderRadius: 50,
        backgroundColor: '#462A5E',
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
      marginTop: 20,
      marginHorizonatal: 20,
    },
    lessonBlock: {
      marginVertical: 20,
      marginHorizontal: 20,
      paddingHorizontal: 25,
      paddingVertical: 20,
      backgroundColor: '#fff',
      borderRadius: 8,
    },
    titleContainer: {
      marginBottom: 0,
    },
    lessonTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#333',
    },
    section: {
      marginTop: 30,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '500',
      color: '#444',
    },
    sectionContent: {
      fontSize: 16,
      color: '#666',
      marginTop: 5,
    },
    sectionImage: {
      width: '100%',
      height: undefined,
      aspectRatio: 1,
      borderRadius: 8,
      marginTop: 5, 
      resizeMode: 'contain'
    },
    button: {
      backgroundColor: '#8ED94D',
      padding: 10,
      width: 100,
      borderRadius: 5,
      borderColor: '#8AC25A',
      borderBottomWidth: 6,
      height: 60,
    },
    buttonText: {
      color: '#fff',
      fontSize: 24
    },
    buttonContainer: {
      paddingHorizontal: 20,
      marginBottom: 20,
      alignItems:'flex-end',
      marginTop: 20,
    },
});
export default styles;