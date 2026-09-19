import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, Modal, Pressable, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Logo from '../assets/svg/jpLogo.svg';
import { useLocalSearchParams, useRouter } from 'expo-router'; // Updated to useLocalSearchParams
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
    const [showPassword, setShowPassword] = useState(false);
    const [activeField, setActiveField] = useState<'new' | 'confirm' | null>(null);

    // Same rules validatePassword() enforces, shown live so users can see what is missing.
    const rules = [
        { label: 'At least 8 characters', met: newPassword.length >= 8 },
        { label: 'One uppercase letter', met: /[A-Z]/.test(newPassword) },
        { label: 'One number', met: /[0-9]/.test(newPassword) },
        { label: 'One special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword) },
    ];

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
            <View pointerEvents="none" style={stylesReset.orbTop} />
            <View pointerEvents="none" style={stylesReset.orbBottom} />
            <KeyboardAvoidingView style={stylesReset.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView contentContainerStyle={stylesReset.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                    <View style={stylesReset.shell}>
                        <View style={stylesReset.brandRow}>
                            <View style={stylesReset.logoShell}><Logo width={42} height={42} /></View>
                            <View>
                                <Text style={stylesReset.brandName}>JapLearn</Text>
                                <Text style={stylesReset.brandCaption}>Account security</Text>
                            </View>
                        </View>

                        <View style={stylesReset.card}>
                            <View style={stylesReset.headingIcon}><Ionicons name="key-outline" size={22} color="#7B2CBF" /></View>
                            <View style={stylesReset.headingMark} />
                            <Text style={stylesReset.title}>Create a new password</Text>
                            <Text style={stylesReset.subtitle}>Choose a strong password for your JapLearn account.</Text>

                            <Text style={stylesReset.fieldLabel}>New password</Text>
                            <View style={[stylesReset.inputContainer, activeField === 'new' && stylesReset.inputFocused, errors.newPassword ? stylesReset.inputError : null]}>
                                <Ionicons name="lock-closed-outline" size={20} color={activeField === 'new' ? '#7B2CBF' : '#958B9A'} />
                                <TextInput
                                    style={stylesReset.input}
                                    value={newPassword}
                                    placeholder="New password"
                                    placeholderTextColor="#A69AAA"
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                    autoComplete="new-password"
                                    accessibilityLabel="New password"
                                    onFocus={() => setActiveField('new')}
                                    onBlur={() => setActiveField(null)}
                                    onChangeText={(text) => setNewPassword(text)}
                                />
                                <Pressable style={stylesReset.eyeButton} onPress={() => setShowPassword((visible) => !visible)} accessibilityLabel={showPassword ? 'Hide password' : 'Show password'} hitSlop={6}>
                                    <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#8A7F8F" />
                                </Pressable>
                            </View>

                            <View style={stylesReset.rules}>
                                {rules.map((rule) => (
                                    <View key={rule.label} style={stylesReset.ruleRow}>
                                        <Ionicons name={rule.met ? 'checkmark-circle' : 'ellipse-outline'} size={15} color={rule.met ? '#5FA33A' : '#C4B8CA'} />
                                        <Text style={[stylesReset.ruleText, rule.met && stylesReset.ruleTextMet]}>{rule.label}</Text>
                                    </View>
                                ))}
                            </View>

                            <Text style={stylesReset.fieldLabel}>Confirm password</Text>
                            <View style={[stylesReset.inputContainer, activeField === 'confirm' && stylesReset.inputFocused, errors.confirmPassword ? stylesReset.inputError : null]}>
                                <Ionicons name="shield-checkmark-outline" size={20} color={activeField === 'confirm' ? '#7B2CBF' : '#958B9A'} />
                                <TextInput
                                    style={stylesReset.input}
                                    value={confirmPassword}
                                    placeholder="Confirm new password"
                                    placeholderTextColor="#A69AAA"
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                    autoComplete="new-password"
                                    accessibilityLabel="Confirm new password"
                                    onFocus={() => setActiveField('confirm')}
                                    onBlur={() => setActiveField(null)}
                                    onChangeText={(text) => setConfirmPassword(text)}
                                />
                            </View>
                            {errors.confirmPassword ? <Text style={stylesReset.errorText}>{errors.confirmPassword}</Text> : <View style={stylesReset.fieldGap} />}

                            <Pressable
                                onPress={submitting ? undefined : handleResetPassword}
                                disabled={submitting}
                                style={({ pressed }) => [stylesReset.button, submitting && stylesReset.buttonDisabled, pressed && stylesReset.buttonPressed]}
                            >
                                <Text style={stylesReset.buttonText}>{submitting ? 'Updating password…' : 'Update password'}</Text>
                                {!submitting && <View style={stylesReset.buttonIcon}><Ionicons name="arrow-forward" size={17} color="#7B2CBF" /></View>}
                            </Pressable>

                            <Pressable style={stylesReset.backLink} onPress={() => router.replace('/Login')} hitSlop={8}>
                                <Ionicons name="arrow-back" size={15} color="#7B2CBF" />
                                <Text style={stylesReset.backLinkText}>Back to sign in</Text>
                            </Pressable>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={closeNotice}>
                <View style={stylesReset.modalContainer}>
                    <View style={stylesReset.modalContent}>
                        <View style={[stylesReset.modalIcon, resetSucceeded ? stylesReset.modalIconSuccess : stylesReset.modalIconWarn]}>
                            <Ionicons name={resetSucceeded ? 'checkmark-circle' : 'alert-circle'} size={30} color={resetSucceeded ? '#57952E' : '#C2415D'} />
                        </View>
                        <Text style={stylesReset.modalTitle}>{resetSucceeded ? 'Password updated' : 'Please check'}</Text>
                        <Text style={stylesReset.modalMessage}>{modalMessage}</Text>
                        <Pressable onPress={closeNotice} style={({ pressed }) => [stylesReset.modalButton, pressed && stylesReset.buttonPressed]}>
                            <Text style={stylesReset.modalButtonText}>{resetSucceeded ? 'Continue to Login' : 'Close'}</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default ResetPassword;
