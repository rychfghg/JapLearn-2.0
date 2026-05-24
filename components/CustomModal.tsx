import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';

const CustomModal = ({ visible, message, onClose }) => {
    return (
        <Modal
            animationType='fade'
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.modalMessage}>{message}</Text>
                    <Pressable onPress={onClose} style={styles.button}>
                        <Text style={styles.buttonText}>Close</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        width: 300,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalMessage: {
        marginBottom: 15,
        textAlign: 'center',
        fontSize: 18,
    },
    button: {
        padding: 10,
        width: 60,
        backgroundColor: '#8ED94D',
        borderRadius: 5,
    },
    buttonText: {
        fontSize: 16,
        fontFamily: 'Jua',
        color: 'white',
        textAlign: 'center',
    },
});

export default CustomModal;
