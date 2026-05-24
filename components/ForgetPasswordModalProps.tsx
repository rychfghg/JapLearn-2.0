import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Modal, StyleSheet } from 'react-native';

interface ForgetPasswordModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (email: string) => void;
}

const ForgetPasswordModal: React.FC<ForgetPasswordModalProps> = ({ isVisible, onClose, onSubmit }) => {
  const [email, setEmail] = useState('');

  const handleResetPassword = () => {
    if (email.trim()) {
      onSubmit(email);
      setEmail(''); // Clear the input field after submission
    } else {
      alert('Please enter a valid email address.');
    }
  };

  return (
    <Modal
      transparent={true}
      visible={isVisible}
      animationType="fade"
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Forgot Password</Text>
          <Text style={styles.modalText}>Enter your email address to reset your password:</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View style={styles.buttonContainer}>
            <Pressable style={styles.resetButton} onPress={handleResetPassword}>
              <Text style={styles.resetButtonText}>Reset Password</Text>
            </Pressable>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ForgetPasswordModal;

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#6200EE',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginRight: 10,
    alignItems: 'center',
    
  },
  resetButtonText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: 'bold',
  },
  closeButton: {
    flex: 1,
    backgroundColor: '#CCC',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 15,
    color: '#333',
    fontWeight: 'bold',
  
  },
});
