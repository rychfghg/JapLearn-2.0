import React, { useState, useContext } from 'react';
import {
    Modal,
    Text,
    TextInput,
    View,
    Pressable,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import CustomModal from '../components/CustomModal';
import styles from '../styles/stylesLogin';
import Logo from '../assets/svg/jpLogo.svg';
import expoconfig from '../expoconfig';
import { AuthContext } from '../context/AuthContext';
import { useClassCode } from '../context/ClassCodeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const Login = () => {
    const { login } = useContext(AuthContext);
    const { setClassCode } = useClassCode();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [forgotPasswordVisible, setForgotPasswordVisible] = useState(false);
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');

    const navigateBasedOnRole = (role, userClassCode = '') => {
        const cleanRole = role?.toLowerCase();

        if (cleanRole === 'teacher') {
            router.replace('/TeacherDashboard');
        } else if (cleanRole === 'student') {
            router.replace(userClassCode ? '/Menu' : '/StartMenu');
        } else {
            router.replace('/Login');
        }
    };

    const getErrorMessage = async (response) => {
        try {
            const data = await response.json();

            if (data?.error === 'Email not confirmed') {
                return 'Your email is not confirmed. Please check your inbox for the confirmation email.';
            }

            if (data?.error === 'User not approved') {
                return 'Your account has not been approved yet. Please contact the administrator.';
            }

            if (data?.error === 'User not found') {
                return 'User not found.';
            }

            return data?.message || data?.error || 'Invalid credentials';
        } catch {
            return 'Invalid credentials';
        }
    };

    const getStudentClassCode = async (userEmail) => {
        try {
            const response = await fetch(
                `${expoconfig.API_URL}/api/students/getStudentByEmail?email=${encodeURIComponent(userEmail)}`
            );

            const text = await response.text();

            if (!response.ok || !text) {
                return '';
            }

            const studentData = JSON.parse(text);
            return studentData?.classCode || '';
        } catch {
            return '';
        }
    };

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            setModalMessage('Please fill in both email and password');
            setModalVisible(true);
            return;
        }

        if (loading) return;

        setLoading(true);

        try {
            const response = await fetch(`${expoconfig.API_URL}/api/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email.trim().toLowerCase(),
                    password,
                }),
            });

            if (!response.ok) {
                const errorMessage = await getErrorMessage(response);
                setModalMessage(errorMessage);
                setModalVisible(true);
                return;
            }

            const data = await response.json();

            const userData = {
                userId: data.id || data.userId,
                email: data.email,
                fname: data.fname,
                lname: data.lname,
                role: data.role?.toLowerCase(),
            };

            let userClassCode = '';

            if (userData.role === 'student') {
                userClassCode = await getStudentClassCode(userData.email);
            }

            await AsyncStorage.setItem('user', JSON.stringify(userData));
            await AsyncStorage.setItem('classCode', userClassCode);

            await setClassCode(userClassCode);
            await login(userData);

            navigateBasedOnRole(userData.role, userClassCode);
        } catch (error) {
            setModalMessage(`Login failed: ${error.message}`);
            setModalVisible(true);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!forgotPasswordEmail.trim()) {
            setModalMessage('Please provide an email address.');
            setModalVisible(true);
            return;
        }

        try {
            const response = await fetch(`${expoconfig.API_URL}/api/users/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: forgotPasswordEmail.trim().toLowerCase(),
                }),
            });

            if (response.ok) {
                setModalMessage('Password reset email sent. Please check your inbox.');
                setForgotPasswordVisible(false);
            } else {
                const errorMessage = await getErrorMessage(response);
                setModalMessage(errorMessage);
            }
        } catch (error) {
            setModalMessage(`Error: ${error.message}`);
        }

        setModalVisible(true);
    };

    return (
        <View style={styles.container}>
            <View style={styles.backgroundOrbTop} />
            <View style={styles.backgroundOrbBottom} />
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                <View style={styles.imageContainer}>
                    <View style={styles.mascotWrap}>
                        <Logo width={150} height={150} />
                    </View>
                    <Text style={styles.titleText}>JAPLEARN 2.0</Text>
                    <Text style={styles.subtitleText}>Learn Japanese, one step at a time.</Text>
                </View>

                <View style={styles.formCard}>
                <Text style={styles.formTitle}>Sign in</Text>
                <Text style={styles.formSubtitle}>Enter your details to continue learning.</Text>
                <View style={styles.inputContainer}>
                    <Ionicons name="mail-outline" size={21} color="#8423D9" style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    value={email}
                    placeholder="Email"
                    autoCapitalize="none"
                    inputMode="email"
                    onChangeText={(text) => setEmail(text.replace(/\s/g, '').toLowerCase())}
                />
                </View>

                <View style={styles.passwordContainer}>
                    <Ionicons name="lock-closed-outline" size={21} color="#8423D9" style={styles.inputIcon} />
                    <TextInput
                        style={[styles.input, styles.passwordInput]}
                        secureTextEntry={!showPassword}
                        value={password}
                        placeholder="Password"
                        autoCapitalize="none"
                        onChangeText={(text) => setPassword(text.replace(/\s/g, ''))}
                    />

                    {password.length > 0 && (
                        <Pressable
                            onPress={() => setShowPassword(!showPassword)}
                            style={styles.insideInputButton}
                        >
                            <Ionicons
                                name={showPassword ? 'eye-off' : 'eye'}
                                size={24}
                            color="#4F4F4F"
                            />
                        </Pressable>
                    )}
                </View>

                <View style={styles.buttonContainer}>
                    {loading ? (
                        <View style={styles.button}><ActivityIndicator size="small" color="#FFFFFF" /></View>
                    ) : (
                        <Pressable onPress={handleLogin} style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
                            <Text style={styles.buttonText}>Login</Text>
                            <Ionicons name="arrow-forward" size={21} color="#FFFFFF" />
                        </Pressable>
                    )}
                </View>
                <View style={styles.linkContainer}>
                    <Pressable onPress={() => router.push('/Signup')} hitSlop={8}>
                        <Text style={styles.linkText}>Create an account</Text>
                    </Pressable>

                    <Pressable onPress={() => setForgotPasswordVisible(true)} hitSlop={8}>
                        <Text style={styles.linkText}>Forgot password?</Text>
                    </Pressable>
                </View>
                </View>

                <View style={styles.policyTextContainer}>
                    <Text style={styles.policyText}>By continuing, you agree with JapLearn&apos;s </Text>
                    <Pressable onPress={() => router.push({ pathname: '/TermsOfServicePage', params: { fromLogin: 'true' } })} hitSlop={8} accessibilityRole="link">
                        <Text style={styles.linkText2}>Terms of Service</Text>
                    </Pressable>
                    <Text style={styles.policyText}> and </Text>
                    <Pressable onPress={() => router.push({ pathname: '/PrivacyPolicyPage', params: { fromLogin: 'true' } })} hitSlop={8} accessibilityRole="link">
                        <Text style={styles.linkText2}>Privacy Policy</Text>
                    </Pressable>
                </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <Modal visible={forgotPasswordVisible} transparent animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Pressable onPress={() => setForgotPasswordVisible(false)} style={styles.modalClose} hitSlop={10}>
                            <Ionicons name="close" size={22} color="#66596F" />
                        </Pressable>
                        <View style={styles.modalIconWrap}>
                            <Ionicons name="key-outline" size={28} color="#8423D9" />
                        </View>
                        <Text style={styles.modalTitle}>Reset Password</Text>
                        <Text style={styles.modalDescription}>Enter your account email and we’ll send you a password reset link.</Text>
                        <View style={styles.resetInputContainer}>
                            <Ionicons name="mail-outline" size={21} color="#8423D9" />
                            <TextInput
                                style={styles.inputReset}
                                placeholder="Email address"
                                value={forgotPasswordEmail}
                                autoCapitalize="none"
                                inputMode="email"
                                onChangeText={(text) =>
                                    setForgotPasswordEmail(text.replace(/\s/g, '').toLowerCase())
                                }
                            />
                        </View>
                        <Pressable onPress={handleForgotPassword} style={({ pressed }) => [styles.buttonReset, pressed && styles.buttonPressed]}>
                            <Ionicons name="paper-plane-outline" size={20} color="#FFFFFF" />
                            <Text style={styles.buttonTextReset}>Send reset link</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            <CustomModal
                visible={modalVisible}
                message={modalMessage}
                onClose={() => setModalVisible(false)}
            />
        </View>
    );
};

export default Login;
