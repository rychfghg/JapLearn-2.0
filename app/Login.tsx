import React, { useState, useContext } from 'react';
import {
    Modal,
    Text,
    TextInput,
    View,
    Pressable,
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    useWindowDimensions,
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


//Checking  

const Login = () => {
    const { width } = useWindowDimensions();
    const isWide = width >= 860;
    const { login } = useContext(AuthContext);
    const { setClassCode } = useClassCode();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [activeField, setActiveField] = useState<'email' | 'password' | null>(null);
    const [forgotPasswordVisible, setForgotPasswordVisible] = useState(false);
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');

    const navigateBasedOnRole = (role, userClassCode = '') => {
        const cleanRole = role?.toLowerCase();

        if (cleanRole === 'teacher') {
            router.replace('/TeacherDashboard');
        } else if (cleanRole === 'student') {
            router.replace('/Menu');
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
                portalSessionToken: data.portalSessionToken,
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
        const normalizedEmail = forgotPasswordEmail.trim().toLowerCase();
        const validEmail = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(normalizedEmail);
        if (!validEmail) {
            setModalMessage('Enter a valid email address, such as name@gmail.com.');
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
                    email: normalizedEmail,
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
            <View pointerEvents="none" style={styles.backgroundOrbTop} />
            <View pointerEvents="none" style={styles.backgroundOrbBottom} />
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                <View style={[styles.authShell, isWide && styles.authShellWide]}>
                <View style={[styles.imageContainer, isWide && styles.imageContainerWide]}>
                    {!isWide && <View style={styles.mobileBrandAccent}>
                        <View style={styles.mobileAccentLine} />
                        <Ionicons name="sparkles" size={15} color="#72B544" />
                        <View style={styles.mobileAccentLine} />
                    </View>}
                    <View style={styles.brandRow}>
                        <View style={styles.logoShell}><Logo width={50} height={50} /></View>
                        <View>
                        <Text style={styles.titleText}>JapLearn 2.0</Text>
                        <Text style={styles.brandCaption}>{isWide ? 'Student access' : '日本語を楽しく学ぼう'}</Text>
                        </View>
                    </View>
                    {isWide && <View style={styles.desktopVisual}>
                        <View style={styles.desktopHalo} />
                        <Image source={require('../assets/hello.png')} style={styles.desktopMascot} resizeMode="contain" />
                        <Text style={styles.desktopJapanese}>いっしょに学ぼう</Text>
                        <Text style={styles.desktopTitle}>Japanese starts here.</Text>
                    </View>}
                </View>

                <View style={[styles.formCard, isWide && styles.formCardWide]}>
                <View style={styles.cardHeading}>
                    <View style={styles.cardHeadingMark} />
                    <Text style={styles.formTitle}>Sign in</Text>
                    {isWide && <Text style={styles.formSubtitle}>Use your student account to continue.</Text>}
                </View>
                {isWide && <Text style={styles.fieldLabel}>Email address</Text>}
                <View style={[styles.inputContainer, activeField === 'email' && styles.inputFocused]}>
                    <Ionicons name="mail-outline" size={20} color={activeField === 'email' ? '#7B2CBF' : '#958B9A'} style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    value={email}
                    placeholder="Email address"
                    placeholderTextColor="#A69AAA"
                    autoCapitalize="none"
                    inputMode="email"
                    autoComplete="email"
                    accessibilityLabel="Email address"
                    onFocus={() => setActiveField('email')}
                    onBlur={() => setActiveField(null)}
                    onChangeText={(text) => setEmail(text.replace(/\s/g, '').toLowerCase())}
                />
                </View>

                {isWide && <Text style={styles.fieldLabel}>Password</Text>}
                <View style={[styles.passwordContainer, activeField === 'password' && styles.inputFocused]}>
                    <Ionicons name="lock-closed-outline" size={20} color={activeField === 'password' ? '#7B2CBF' : '#958B9A'} style={styles.inputIcon} />
                    <TextInput
                        style={[styles.input, styles.passwordInput]}
                        secureTextEntry={!showPassword}
                        value={password}
                        placeholder="Password"
                        placeholderTextColor="#A69AAA"
                        autoCapitalize="none"
                        autoComplete="current-password"
                        accessibilityLabel="Password"
                        onFocus={() => setActiveField('password')}
                        onBlur={() => setActiveField(null)}
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

                <View style={styles.forgotRow}>
                    <Pressable onPress={() => setForgotPasswordVisible(true)} hitSlop={8}>
                        <Text style={styles.forgotText}>Forgot password?</Text>
                    </Pressable>
                </View>

                <View style={styles.buttonContainer}>
                    {loading ? (
                        <View style={styles.button}><ActivityIndicator size="small" color="#FFFFFF" /></View>
                    ) : (
                        <Pressable onPress={handleLogin} style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
                            <Text style={styles.buttonText}>Sign in</Text>
                            <View style={styles.buttonIcon}><Ionicons name="arrow-forward" size={17} color="#7B2CBF" /></View>
                        </Pressable>
                    )}
                </View>
                <View style={styles.linkContainer}>
                    <Pressable onPress={() => router.push('/Signup')} hitSlop={8}>
                        <Text style={styles.linkPrompt}>New to JapLearn? <Text style={styles.linkText}>Join now</Text></Text>
                    </Pressable>
                </View>
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
                        <View style={styles.modalIconHalo}><View style={styles.modalIconWrap}>
                            <Ionicons name="lock-open-outline" size={29} color="#8423D9" />
                        </View></View>
                        <Text style={styles.modalTitle}>Reset password</Text>
                        <Text style={styles.modalDescription}>Enter the email connected to your account and we’ll send you a reset link.</Text>
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
                variant="auth"
                title="Account notice"
            />
        </View>
    );
};

export default Login;
