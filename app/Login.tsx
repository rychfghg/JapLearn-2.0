import React, { useState, useContext } from 'react';
import {
    Modal,
    Text,
    TextInput,
    View,
    Pressable,
    ActivityIndicator,
    KeyboardAvoidingView,
} from 'react-native';
import { router } from 'expo-router';
import CustomButton from '../components/CustomButton';
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
            <View style={styles.imageContainer}>
                <Logo width={150} height={150} />
                <Text style={styles.titleText}>JAPLEARN 2.0</Text>
            </View>

            <KeyboardAvoidingView>
                <TextInput
                    style={styles.input}
                    value={email}
                    placeholder="Email"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    onChangeText={(text) => setEmail(text.replace(/\s/g, '').toLowerCase())}
                />

                <View style={styles.passwordContainer}>
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
                        <ActivityIndicator size="large" color="#0000ff" />
                    ) : (
                        <CustomButton
                            title="Login"
                            onPress={handleLogin}
                            buttonStyle={styles.button}
                            textStyle={styles.buttonText}
                        />
                    )}
                </View>
            </KeyboardAvoidingView>

            <View style={styles.policyTextContainer}>
                <Text style={styles.policyText}>
                    By continuing, you agree with{' '}
                    <Text onPress={() => router.push('/PrivacyPolicyPage')} style={styles.linkText2}>
                        Japlearn's Terms of Service and Privacy Policy
                    </Text>
                </Text>
            </View>

            <View style={styles.linkContainer}>
                <Pressable onPress={() => router.push('/Signup')}>
                    <Text style={styles.linkText}>Create account?</Text>
                </Pressable>

                <Pressable onPress={() => setForgotPasswordVisible(true)}>
                    <Text style={styles.linkText}>Forgot Password?</Text>
                </Pressable>
            </View>

            <Modal visible={forgotPasswordVisible} transparent animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Reset Password</Text>

                        <TextInput
                            style={styles.inputReset}
                            placeholder="Enter your email"
                            value={forgotPasswordEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            onChangeText={(text) =>
                                setForgotPasswordEmail(text.replace(/\s/g, '').toLowerCase())
                            }
                        />

                        <CustomButton
                            title="Reset"
                            onPress={handleForgotPassword}
                            buttonStyle={styles.buttonReset}
                            textStyle={styles.buttonTextReset}
                        />

                        <CustomButton
                            title="Close"
                            onPress={() => setForgotPasswordVisible(false)}
                            buttonStyle={styles.buttonReset}
                            textStyle={styles.buttonTextReset}
                        />
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