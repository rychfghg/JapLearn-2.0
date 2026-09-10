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
    SafeAreaView,
    ScrollView,
    useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';
import CustomModal from '../components/CustomModal';
import styles from '../styles/stylesLogin';
import expoconfig from '../expoconfig';
import { AuthContext } from '../context/AuthContext';
import { useClassCode } from '../context/ClassCodeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';


//Checking  

const Login = () => {
    const { login } = useContext(AuthContext);
    const { setClassCode } = useClassCode();
    const { width } = useWindowDimensions();
    const isWide = width >= 760;

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [forgotPasswordVisible, setForgotPasswordVisible] = useState(false);
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
    const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);

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
        <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
            <View style={styles.backgroundOrbTop} />
            <View style={styles.backgroundOrbBottom} />
            <View style={styles.backgroundSpark} />
            <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                    <View style={[styles.loginShell, isWide && styles.loginShellWide]}>
                        <View style={[styles.welcomePanel, isWide && styles.welcomePanelWide]}>
                            <View style={styles.brandRow}>
                                <View style={styles.logoPlate}>
                                    <Image source={require('../assets/APPLOGO.png')} style={styles.appLogo} />
                                </View>
                                <View>
                                    <Text style={styles.brandName}>JAPLEARN</Text>
                                    <Text style={styles.brandSubtitle}>Japanese made interactive</Text>
                                </View>
                            </View>

                            <View style={[styles.mascotScene, isWide && styles.mascotSceneWide]}>
                                <View style={styles.mascotHalo} />
                                <View style={styles.mascotGround} />
                                <Image source={require('../assets/hello.png')} style={styles.mascot} resizeMode="contain" />
                                <View style={styles.speechCard}>
                                    <Text style={styles.speechJapanese}>おかえりなさい！</Text>
                                    <Text style={styles.speechEnglish}>Welcome back!</Text>
                                </View>
                            </View>

                            <View style={styles.welcomeCopy}>
                                <Text style={styles.welcomeEyebrow}>YOUR JAPANESE JOURNEY</Text>
                                <Text style={styles.welcomeTitle}>Ready for your next small win?</Text>
                                <Text style={styles.welcomeText}>Pick up your lessons, games, and speaking practice right where you left them.</Text>
                            </View>
                        </View>

                        <View style={[styles.formCard, isWide && styles.formCardWide]}>
                            <View style={styles.studentBadge}>
                                <Ionicons name="school-outline" size={15} color="#65A936" />
                                <Text style={styles.studentBadgeText}>STUDENT ACCESS</Text>
                            </View>
                            <Text style={styles.formTitle}>Welcome back</Text>
                            <Text style={styles.formSubtitle}>Sign in to continue learning with JapLearn.</Text>

                            <Text style={styles.fieldLabel}>Email address</Text>
                            <View style={[styles.inputContainer, focusedField === 'email' && styles.inputContainerFocused]}>
                                <View style={styles.inputIconWrap}>
                                    <Ionicons name="mail-outline" size={19} color="#8423D9" />
                                </View>
                                <TextInput
                                    style={styles.input}
                                    value={email}
                                    placeholder="you@example.com"
                                    placeholderTextColor="#AA9EB0"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                    inputMode="email"
                                    returnKeyType="next"
                                    onFocus={() => setFocusedField('email')}
                                    onBlur={() => setFocusedField(null)}
                                    onChangeText={(text) => setEmail(text.replace(/\s/g, '').toLowerCase())}
                                />
                            </View>

                            <View style={styles.passwordLabelRow}>
                                <Text style={styles.fieldLabel}>Password</Text>
                                <Pressable onPress={() => setForgotPasswordVisible(true)} hitSlop={8}>
                                    <Text style={styles.forgotLink}>Forgot password?</Text>
                                </Pressable>
                            </View>
                            <View style={[styles.passwordContainer, focusedField === 'password' && styles.inputContainerFocused]}>
                                <View style={styles.inputIconWrap}>
                                    <Ionicons name="lock-closed-outline" size={19} color="#8423D9" />
                                </View>
                                <TextInput
                                    style={[styles.input, styles.passwordInput]}
                                    secureTextEntry={!showPassword}
                                    value={password}
                                    placeholder="Enter your password"
                                    placeholderTextColor="#AA9EB0"
                                    autoCapitalize="none"
                                    autoComplete="current-password"
                                    returnKeyType="go"
                                    onSubmitEditing={handleLogin}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    onChangeText={(text) => setPassword(text.replace(/\s/g, ''))}
                                />
                                {password.length > 0 && (
                                    <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.insideInputButton} accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}>
                                        <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={21} color="#6E5D77" />
                                    </Pressable>
                                )}
                            </View>

                            <View style={styles.buttonContainer}>
                                <Pressable disabled={loading} onPress={handleLogin} style={({ pressed }) => [styles.button, pressed && styles.buttonPressed, loading && styles.buttonDisabled]}>
                                    {loading ? <ActivityIndicator size="small" color="#FFFFFF" /> : <>
                                        <Text style={styles.buttonText}>Continue learning</Text>
                                        <View style={styles.buttonArrow}><Ionicons name="arrow-forward" size={18} color="#8423D9" /></View>
                                    </>}
                                </Pressable>
                            </View>

                            <View style={styles.signupDivider}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>NEW TO JAPLEARN?</Text>
                                <View style={styles.dividerLine} />
                            </View>
                            <Pressable onPress={() => router.push('/Signup')} style={({ pressed }) => [styles.createButton, pressed && styles.buttonPressed]}>
                                <Ionicons name="person-add-outline" size={19} color="#6D24B8" />
                                <Text style={styles.createButtonText}>Create a student account</Text>
                            </Pressable>

                            <View style={styles.policyTextContainer}>
                                <Text style={styles.policyText}>By continuing, you agree to JapLearn&apos;s </Text>
                                <Pressable onPress={() => router.push({ pathname: '/TermsOfServicePage', params: { fromLogin: 'true' } })} hitSlop={8} accessibilityRole="link"><Text style={styles.linkText2}>Terms</Text></Pressable>
                                <Text style={styles.policyText}> and </Text>
                                <Pressable onPress={() => router.push({ pathname: '/PrivacyPolicyPage', params: { fromLogin: 'true' } })} hitSlop={8} accessibilityRole="link"><Text style={styles.linkText2}>Privacy Policy</Text></Pressable>
                                <Text style={styles.policyText}>.</Text>
                            </View>
                        </View>
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
        </SafeAreaView>
    );
};

export default Login;
