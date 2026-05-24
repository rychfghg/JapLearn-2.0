import React, { useState, useContext, useEffect } from 'react';
import { Modal, Text, TextInput, View, Pressable, ActivityIndicator, KeyboardAvoidingView } from 'react-native';
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
    const { classCode, setClassCode } = useClassCode();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [forgotPasswordVisible, setForgotPasswordVisible] = useState(false);
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');

    useEffect(() => {
        const checkLoginStatus = async () => {
            const storedUser = await AsyncStorage.getItem('user');
            const storedClassCode = await AsyncStorage.getItem('classCode');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                navigateBasedOnRole(parsedUser.role);
            }
        };
        checkLoginStatus();
    }, []);

    const handleLinkPress = () => {
        router.push('/PrivacyPolicyPage');
    };

    const navigateBasedOnRole = (role) => {
        if (role === 'student') {
            if (classCode) {
                router.push('/Menu');
            } else {
                router.push('/StartMenu');
            }
        } else if (role === 'teacher') {
            router.push('/TeacherDashboard');
        } else {
            router.push('/StartMenu');
        }
    };

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            setModalMessage("Please fill in both email and password");
            setModalVisible(true);
            return;
        }

        setLoading(true);

        try {
            const studentResponse = await fetch(`${expoconfig.API_URL}/api/students/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (studentResponse.ok) {
                const studentData = await studentResponse.json();
                const userData = {
                    userId: studentData.userId,
                    email: studentData.email,
                    fname: studentData.fname,
                    lname: studentData.lname,
                    role: studentData.role,
                };
                await login(userData);
                setClassCode(studentData.classCode);
                navigateBasedOnRole(userData.role);
            } else {
                const userResponse = await fetch(`${expoconfig.API_URL}/api/users/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                if (userResponse.ok) {
                    const userDataFromResponse = await userResponse.json();
                    const userData = {
                        userId: userDataFromResponse.userId,
                        email: userDataFromResponse.email,
                        fname: userDataFromResponse.fname,
                        lname: userDataFromResponse.lname,
                        role: userDataFromResponse.role
                    };
                    await login(userData);
                    await AsyncStorage.setItem('classCode', '');
                    navigateBasedOnRole(userData.role);
                } else {
                    const message = await userResponse.json();

                    if (message.error === "Email not confirmed") {
                        setModalMessage("Your email is not confirmed. Please check your inbox for the confirmation email.");
                    } else if (message.error === "User not approved") {
                        setModalMessage("Your account has not been approved yet. Please contact the administrator.");
                    } else {
                        setModalMessage("Invalid credentials");
                    }
                    setModalVisible(true);
                }
            }
        } catch (error) {
            setModalMessage(`Login failed: ${error}`);
            setModalVisible(true);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!forgotPasswordEmail.trim()) {
            setModalMessage("Please provide an email address.");
            setModalVisible(true);
            return;
        }

        try {
            const response = await fetch(`${expoconfig.API_URL}/api/users/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: forgotPasswordEmail }),
            });

            if (response.ok) {
                setModalMessage("Password reset email sent. Please check your inbox.");
                setForgotPasswordVisible(false);
            } else {
                const error = await response.json();
                setModalMessage(error.message);
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
                <Text style={styles.titleText}>JAPLEARN</Text>
            </View>
            <KeyboardAvoidingView>
                <TextInput
                    style={styles.input}
                    value={email}
                    placeholder='Email'
                    autoCapitalize="none"
                    keyboardType="email-address"
                    onChangeText={(text) => setEmail(text.replace(/\s/g, '').toLowerCase())}
                />
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={[styles.input, styles.passwordInput]}
                        secureTextEntry={!showPassword}
                        value={password}
                        placeholder='Password'
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
                        <CustomButton title="Login" onPress={handleLogin} buttonStyle={styles.button} textStyle={styles.buttonText} />
                    )}
                </View>
            </KeyboardAvoidingView>

            <View style={styles.policyTextContainer}>
                <Text style={styles.policyText}>
                    By continuing, you agree with{' '}
                    <Text onPress={handleLinkPress} style={styles.linkText2}>
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
                            onChangeText={(text) => setForgotPasswordEmail(text.replace(/\s/g, '').toLowerCase())}
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