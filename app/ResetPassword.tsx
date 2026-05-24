import React, { useState } from 'react';
import { View, Text, TextInput, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router'; // Updated to useLocalSearchParams
import CustomButton from '../components/CustomButton';
import stylesReset from '../styles/stylesResetPassword'; // New styles for Reset Password
import expoconfig from '../expoconfig';

const ResetPassword = () => {
    const { token } = useLocalSearchParams(); // Use useLocalSearchParams instead
    const router = useRouter();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [errors, setErrors] = useState({ newPassword: '', confirmPassword: '' });

    const validatePassword = () => {
        let validationErrors = { newPassword: '', confirmPassword: '' };

        if (!newPassword) {
            validationErrors.newPassword = 'Please enter a new password';
        } else {
            if (newPassword.length < 8) {
                validationErrors.newPassword += 'Password must be at least 8 characters long.\n';
            }
            if (!/[A-Z]/.test(newPassword)) {
                validationErrors.newPassword += 'Include at least one uppercase letter.\n';
            }
            if (!/[0-9]/.test(newPassword)) {
                validationErrors.newPassword += 'Include at least one number.\n';
            }
            if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
                validationErrors.newPassword += 'Include at least one special character.\n';
            }
        }

        if (confirmPassword !== newPassword) {
            validationErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(validationErrors);

        return Object.values(validationErrors).every((error) => error === '');
    };

    const handleResetPassword = async () => {
        if (!validatePassword()) {
            setModalMessage('Please correct the highlighted fields.');
            setModalVisible(true);
            return;
        }

        try {
            const response = await fetch(`${expoconfig.API_URL}/api/users/reset-password?token=${token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ newPassword }),
            });

            const data = await response.json();

            if (response.ok) {
                setModalMessage('Password has been reset successfully.');
                setModalVisible(true);
                setTimeout(() => {
                    setModalVisible(false);
                    router.push('/login'); // Redirect to login page after success
                }, 2000);
            } else {
                setModalMessage(data.error || 'An error occurred.');
                setModalVisible(true);
            }
        } catch (error) {
            setModalMessage(`Error: ${error.message}`);
            setModalVisible(true);
        }
    };

    return (
        <View style={stylesReset.container}>
            <Text style={stylesReset.title}>Reset Account Password</Text>
            <Text style={stylesReset.subtitle}>Enter a new password for your account</Text>
            
            <TextInput
                style={[stylesReset.input, errors.newPassword ? stylesReset.errorInput : null]}
                value={newPassword}
                placeholder="New Password"
                secureTextEntry={true}
                onChangeText={(text) => setNewPassword(text)}
            />
            {errors.newPassword ? <Text style={stylesReset.errorText}>{errors.newPassword}</Text> : null}

            <TextInput
                style={[stylesReset.input, errors.confirmPassword ? stylesReset.errorInput : null]}
                value={confirmPassword}
                placeholder="Confirm Password"
                secureTextEntry={true}
                onChangeText={(text) => setConfirmPassword(text)}
            />
            {errors.confirmPassword ? <Text style={stylesReset.errorText}>{errors.confirmPassword}</Text> : null}
            
            <View style={stylesReset.buttonContainer}>
                <CustomButton
                    title="Reset Password"
                    onPress={handleResetPassword}
                    buttonStyle={stylesReset.button}
                    textStyle={stylesReset.buttonText}
                />
            </View>

            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={stylesReset.modalContainer}>
                    <View style={stylesReset.modalContent}>
                        <Text style={stylesReset.modalTitle}>Notice</Text>
                        <Text style={stylesReset.modalMessage}>{modalMessage}</Text>
                        <CustomButton
                            title="Close"
                            onPress={() => setModalVisible(false)}
                            buttonStyle={stylesReset.modalButton}
                            textStyle={stylesReset.modalButtonText}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default ResetPassword;
