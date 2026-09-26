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
import { markSurveyAfterLogin } from '../services/surveyPrompt';


//Checking  

type LoginNotice = {
    title: string;
    message: string;
    hint?: string;
    tone?: 'info' | 'error' | 'warning' | 'success';
    icon?: any;
    action?: 'reset';
};

const Login = () => {
    const { width } = useWindowDimensions();
    const isWide = width >= 860;
    const { login } = useContext(AuthContext);
    const { setClassCode } = useClassCode();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [notice, setNotice] = useState<LoginNotice>({ title: 'Account notice', message: '' });

    const showNotice = (next: LoginNotice) => {
        setNotice(next);
        setModalVisible(true);
    };
    const [showPassword, setShowPassword] = useState(false);
    const [activeField, setActiveField] = useState<'email' | 'password' | null>(null);
    const [forgotPasswordVisible, setForgotPasswordVisible] = useState(false);
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');

    const navigateBasedOnRole = (role, userClassCode = '') => {
        const cleanRole = role?.toLowerCase();

        if (cleanRole === 'teacher') {
            router.replace('/TeacherHome');
        } else if (cleanRole === 'student') {
            router.replace('/Menu');
        } else {
            router.replace('/Login');
        }
    };

    // Turns a failed sign-in response into a clear, specific pop-up.
    const describeLoginFailure = async (response: Response): Promise<LoginNotice> => {
        let serverError = '';
        try {
            const data = await response.json();
            serverError = String(data?.error || data?.message || '');
        } catch {
            // Some failures carry no JSON body.
        }

        if (response.status === 429) {
            return {
                title: 'Too many attempts',
                message: 'You have tried to sign in too many times. Please wait a minute, then try again.',
                tone: 'warning',
                icon: 'timer-outline',
            };
        }

        if (serverError === 'Email not confirmed') {
            return {
                title: 'Confirm your email first',
                message: 'Your account is created, but your email address is not confirmed yet.',
                hint: 'Open the confirmation email from JapLearn and tap the link. Check your Spam or Promotions folder too.',
                tone: 'warning',
                icon: 'mail-unread-outline',
            };
        }

        if (serverError === 'User not approved') {
            return {
                title: 'Waiting for approval',
                message: 'Your email is confirmed. The JapLearn admin still needs to approve your account.',
                hint: 'You can sign in as soon as the JapLearn admin approves your account.',
                tone: 'warning',
                icon: 'hourglass-outline',
            };
        }

        if (response.status === 401 || response.status === 404 || serverError === 'Invalid credentials' || serverError === 'User not found') {
            return {
                title: 'Incorrect email or password',
                message: 'The email or password you entered is not correct. Please check both and try again.',
                hint: 'Passwords are case-sensitive, so check that Caps Lock is off.',
                tone: 'error',
                icon: 'lock-closed-outline',
                action: 'reset',
            };
        }

        if (response.status >= 500) {
            return {
                title: 'JapLearn is having trouble',
                message: 'Our server could not finish signing you in. This is on our side, not yours.',
                hint: 'Wait a moment and try again.',
                tone: 'error',
                icon: 'cloud-offline-outline',
            };
        }

        return {
            title: 'Sign-in failed',
            message: serverError || 'Something went wrong while signing you in. Please try again.',
            tone: 'error',
        };
    };

    // Forgot-password responses reuse the same wording.
    const getErrorMessage = async (response: Response) => {
        const failure = await describeLoginFailure(response);
        return failure.message;
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
            const missingEmail = !email.trim();
            const missingPassword = !password.trim();
            showNotice({
                title: missingEmail && missingPassword ? 'Enter your details' : missingEmail ? 'Enter your email' : 'Enter your password',
                message: missingEmail && missingPassword
                    ? 'Type the email and password for your JapLearn account.'
                    : missingEmail
                        ? 'Type the email address you use for JapLearn.'
                        : 'Type your password to continue.',
                tone: 'info',
                icon: 'create-outline',
            });
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(email.trim())) {
            showNotice({
                title: 'Check your email address',
                message: 'That does not look like a complete email address.',
                hint: 'Use the full address, such as name@gmail.com.',
                tone: 'error',
                icon: 'at-outline',
            });
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
                showNotice(await describeLoginFailure(response));
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
            if (String(userData.role || '').toLowerCase() === 'student') await markSurveyAfterLogin();

            navigateBasedOnRole(userData.role, userClassCode);
        } catch (error) {
            showNotice({
                title: "Can't connect to JapLearn",
                message: 'We could not reach the JapLearn server. Check that you are connected to Wi-Fi or mobile data.',
                hint: 'If your connection is fine, the server may be starting up. Wait a few seconds and try again.',
                tone: 'error',
                icon: 'wifi-outline',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        const normalizedEmail = forgotPasswordEmail.trim().toLowerCase();
        const validEmail = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(normalizedEmail);
        if (!validEmail) {
            showNotice({
                title: 'Check your email address',
                message: 'Enter the full email address for your account, such as name@gmail.com.',
                tone: 'error',
                icon: 'at-outline',
            });
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
                setForgotPasswordVisible(false);
                showNotice({
                    title: 'Check your inbox',
                    message: 'If an account exists for that email, we have sent a link to reset your password.',
                    hint: 'The link expires in one hour. Check your Spam folder if you do not see it.',
                    tone: 'success',
                    icon: 'mail-outline',
                });
            } else if (response.status === 429) {
                showNotice({
                    title: 'Too many requests',
                    message: 'Please wait a minute before asking for another reset link.',
                    tone: 'warning',
                    icon: 'timer-outline',
                });
            } else {
                showNotice({ title: 'Reset link not sent', message: await getErrorMessage(response), tone: 'error' });
            }
        } catch {
            showNotice({
                title: "Can't connect to JapLearn",
                message: 'We could not send the reset link. Check your internet connection and try again.',
                tone: 'error',
                icon: 'wifi-outline',
            });
        }
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
                        <Ionicons name="language-outline" size={16} color="#72B544" />
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
                message={notice.message}
                onClose={() => setModalVisible(false)}
                variant="auth"
                title={notice.title}
                tone={notice.tone}
                icon={notice.icon}
                hint={notice.hint}
                actionLabel={notice.action === 'reset' ? 'Reset my password' : undefined}
                onAction={notice.action === 'reset'
                    ? () => {
                        setModalVisible(false);
                        setForgotPasswordEmail(email.trim().toLowerCase());
                        setForgotPasswordVisible(true);
                    }
                    : undefined}
            />
        </View>
    );
};

export default Login;
