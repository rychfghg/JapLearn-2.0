import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router'; // Updated to useLocalSearchParams
import CustomButton from '../components/CustomButton';
import stylesReset from '../styles/stylesResetPassword'; // New styles for Reset Password
import expoconfig from '../expoconfig';

const ResetPassword = () => {
    const params = useLocalSearchParams<{ token?: string | string[] }>();
    const token = useMemo(() => Array.isArray(params.token) ? params.token[0] : params.token, [params.token]);
    const router = useRouter();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [errors, setErrors] = useState({ newPassword: '', confirmPassword: '' });
    const [resetSucceeded, setResetSucceeded] = useState(false);
    const [submitting, setSubmitting] = useState(false);

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

        if (!confirmPassword) {
            validationErrors.confirmPassword = 'Please confirm your new password';
        } else if (confirmPassword !== newPassword) {
            validationErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(validationErrors);

        return Object.values(validationErrors).every((error) => error === '');
    };

    const handleResetPassword = async () => {
        if (!token) {
            setModalMessage('This password reset link is incomplete or invalid. Please request a new link from the login page.');
            setModalVisible(true);
            return;
        }

        if (!validatePassword()) {
            setModalMessage('Please correct the highlighted fields.');
            setModalVisible(true);
            return;
        }

        try {
            setSubmitting(true);
            const response = await fetch(`${expoconfig.API_URL}/api/users/reset-password?token=${encodeURIComponent(token)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ newPassword }),
            });

            const data = await response.json();

            if (response.ok) {
                setResetSucceeded(true);
                setModalMessage('Password has been reset successfully. You can now sign in with your new password.');
                setModalVisible(true);
            } else {
                setModalMessage(data.error || data.message || 'This reset link is invalid or has already been used.');
                setModalVisible(true);
            }
        } catch (error) {
            setModalMessage(error instanceof Error ? `Error: ${error.message}` : 'Unable to reset your password. Please try again.');
            setModalVisible(true);
        } finally {
            setSubmitting(false);
        }
    };

    const closeNotice = () => {
        setModalVisible(false);
        if (resetSucceeded) router.replace('/Login');
    };

    return (
        <View style={stylesReset.container}>
            <Text style={stylesReset.title}>Create a new password</Text>
            <Text style={stylesReset.subtitle}>Enter and confirm the new password for your JapLearn account.</Text>
            
            <TextInput
                style={[stylesReset.input, errors.newPassword ? stylesReset.errorInput : null]}
                value={newPassword}
                placeholder="New password"
                secureTextEntry={true}
                onChangeText={(text) => setNewPassword(text)}
            />
            {errors.newPassword ? <Text style={stylesReset.errorText}>{errors.newPassword}</Text> : null}

            <TextInput
                style={[stylesReset.input, errors.confirmPassword ? stylesReset.errorInput : null]}
                value={confirmPassword}
                placeholder="Confirm new password"
                secureTextEntry={true}
                onChangeText={(text) => setConfirmPassword(text)}
            />
            {errors.confirmPassword ? <Text style={stylesReset.errorText}>{errors.confirmPassword}</Text> : null}
            
            <View style={stylesReset.buttonContainer}>
                <CustomButton
                    title={submitting ? 'Updating password...' : 'Update password'}
                    onPress={submitting ? () => undefined : handleResetPassword}
                    buttonStyle={stylesReset.button}
                    textStyle={stylesReset.buttonText}
                />
            </View>

            <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={closeNotice}>
                <View style={stylesReset.modalContainer}>
                    <View style={stylesReset.modalContent}>
                        <Text style={stylesReset.modalTitle}>{resetSucceeded ? 'Password updated' : 'Please check'}</Text>
                        <Text style={stylesReset.modalMessage}>{modalMessage}</Text>
                        <CustomButton
                            title={resetSucceeded ? 'Continue to Login' : 'Close'}
                            onPress={closeNotice}
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
