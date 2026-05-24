import { Modal, Button, View, Text, StyleSheet, Pressable } from 'react-native'; 
import { router } from 'expo-router';

const PrivacyModal = ({ visible, onAgree, onDecline, onClose }) => {
    const handleLinkPress = () => {
        onClose(); // Close the modal
        router.push({
            pathname: '/PrivacyPolicyPage',
            params: { fromSignup: 'true' }, // Pass state to track navigation origin
        }); // Navigate to the Privacy Policy page
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onDecline} // Optionally, close the modal when pressing the back button
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Privacy Policy</Text>
                    <Text style={styles.modalText}>
                        By signing up, you agree to our
                        <Pressable onPress={handleLinkPress}>
                            <Text style={styles.linkText}>
                                {" "}Privacy Policy
                            </Text>
                        </Pressable>.
                    </Text>
                    <View style={styles.modalButtonContainer}>
                        <Button title="Agree" onPress={onAgree} />
                        <Button title="Decline" onPress={onDecline} />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: 300,
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    modalText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
        fontFamily: 'Jua',
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    linkText: {
        color: 'blue',
        textDecorationLine: 'underline',
    },
});

export default PrivacyModal;
