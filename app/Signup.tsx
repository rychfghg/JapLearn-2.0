import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, TextInput, View, Pressable, useWindowDimensions } from 'react-native';
import CustomModal from '../components/CustomModal';
import styles from '../styles/stylesSignup';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import expoconfig from '../expoconfig';
import PrivacyPolicyModal from '../components/PrivacyPolicyModal';
import Logo from '../assets/svg/jpLogo.svg';
import { EMAIL_RULE, NAME_RULE, PASSWORD_RULE, cleanEmailInput, cleanNameInput, cleanPasswordInput, isStrictEmail, isValidName, isValidPasswordChars } from '../utils/inputRules';
import GoogleAuthButton from '../components/GoogleAuthButton';
import { setPendingGoogleToken } from '../services/googleAuth';

const Signup = () => {
    const { width } = useWindowDimensions();
    const isWide = width >= 900;
    const params = useLocalSearchParams();
    const [hasCheckedModal, setHasCheckedModal] = useState(false);
    const [fname, setFname] = useState('');
    const [lname, setLname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [cpassword, setCPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showCPassword, setShowCPassword] = useState(false);
    const [activeField, setActiveField] = useState<string | null>(null);
    const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
    const [hasAgreedToPrivacy, setHasAgreedToPrivacy] = useState(false);

    const [errors, setErrors] = useState({
        fname: '',
        lname: '',
        email: '',
        password: '',
        cpassword: ''
    });

    const isAllowedEmail = (value) => {
        const lower = value.toLowerCase();
        return isStrictEmail(lower) && /@(gmail\.com|cit\.edu)$/.test(lower);
    };

    const validateForm = () => {
        let validationErrors = {
            fname: '',
            lname: '',
            email: '',
            password: '',
            cpassword: ''
        };

        if (!fname.trim()) {
            validationErrors.fname = 'Please enter your first name';
        } else if (!isValidName(fname)) {
            validationErrors.fname = NAME_RULE;
        }
        if (!lname.trim()) {
            validationErrors.lname = 'Please enter your last name';
        } else if (!isValidName(lname)) {
            validationErrors.lname = NAME_RULE;
        }
        if (!email.trim()) {
            validationErrors.email = 'Please enter your email';
        } else if (!isAllowedEmail(email)) {
            validationErrors.email = 'Please use a valid Gmail address';
        }
        if (!password) {
            validationErrors.password = 'Please enter your password';
        } else if (!isValidPasswordChars(password)) {
            validationErrors.password = PASSWORD_RULE;
        } else {
            if (password.length < 8) {
                validationErrors.password = 'Password must be at least 8 characters long';
            }
            if (!/[A-Z]/.test(password)) {
                validationErrors.password = validationErrors.password + ' Include at least one uppercase letter';
            }
            if (!/[0-9]/.test(password)) {
                validationErrors.password = validationErrors.password + ' Include at least one number';
            }
            if (!/[^A-Za-z0-9\s]/.test(password)) {
                validationErrors.password = validationErrors.password + ' Include at least one symbol, such as ! @ # _ - or .';
            }
        }
        if (!cpassword) {
            validationErrors.cpassword = 'Please confirm your password';
        } else if (password !== cpassword) {
            validationErrors.cpassword = 'Passwords do not match';
        }

        setErrors(validationErrors);

        return Object.values(validationErrors).every(error => error === '');
    };

    const signup2 = () => {
        if (!validateForm()) {
            setModalMessage('Please correct the highlighted fields.');
            setModalVisible(true);
            return;
        }

        setPrivacyModalVisible(true);
    };

    const signup = async (agreed = false) => {
        if (!validateForm()) {
            setModalMessage('Please correct the highlighted fields.');
            setModalVisible(true);
            return;
        }
        if (!agreed && !hasAgreedToPrivacy) {
            setPrivacyModalVisible(true);
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`${expoconfig.API_URL}/api/users/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fname,
                    lname,
                    email,
                    password,
                    role: 'student',
                }),
            });

            if (response.ok) {
                setModalMessage('Signup successful! Please check your email and confirm the link to complete registration.');
                setModalVisible(true);
                setFname('');
                setLname('');
                setEmail('');
                setPassword('');
                setCPassword('');
                setTimeout(() => {
                    setModalVisible(false);
                    router.push('/Login');
                }, 2000);
            } else {
                const errorResponse = await response.json();
                const errorMessage = errorResponse.error === 'User already exists'
                    ? 'User already exists. Please try logging in.'
                    : (typeof errorResponse.error === 'string' && errorResponse.error !== 'Registration failed' ? errorResponse.error : 'Signup failed. Please try again.');
                throw new Error(errorMessage);
            }
        } catch (error) {
            setModalMessage(`Signup failed: ${error.message}`);
            setModalVisible(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View pointerEvents="none" style={styles.backgroundOrbTop} />
            <View pointerEvents="none" style={styles.backgroundOrbBottom} />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                <View style={[styles.contentWrapper, isWide && styles.contentWrapperWide]}>
                    <View style={[styles.imageContainer, isWide && styles.imageContainerWide]}>
                        <View style={styles.brandRow}>
                            <View style={styles.logoShell}><Logo width={50} height={50} /></View>
                            <View>
                                <Text style={styles.brandText}>JapLearn 2.0</Text>
                                {isWide && <Text style={styles.brandCaption}>Student registration</Text>}
                            </View>
                        </View>
                        {isWide && <View style={styles.desktopVisual}>
                            <View style={styles.desktopHalo} />
                            <Image source={require('../assets/hello.png')} style={styles.desktopMascot} resizeMode="contain" />
                            <Text style={styles.desktopTitle}>Begin your Japanese journey.</Text>
                        </View>}
                    </View>
                    <View style={[styles.formCard, isWide && styles.formCardWide]}>
                    <View style={styles.cardHeading}>
                        <View style={styles.cardHeadingMark} />
                        <Text style={styles.titleText}>Create account</Text>
                        {isWide && <Text style={styles.formSubtitle}>Set up your student profile.</Text>}
                    </View>
                    {isWide && <Text style={styles.fieldLabel}>Your name</Text>}
                    <View style={styles.nameRow}>
                        <View style={[styles.inputShell, styles.nameField, activeField === 'fname' && styles.inputFocused, errors.fname ? styles.errorInput : null]}>
                        <Ionicons name="person-outline" size={19} color={activeField === 'fname' ? '#7B2CBF' : '#958B9A'} />
                        <TextInput
                            style={styles.input}
                            value={fname}
                            placeholder="First name"
                            placeholderTextColor="#A69AAA"
                            autoCapitalize="words"
                            autoComplete="given-name"
                            accessibilityLabel="First name"
                            maxLength={30}
                            onFocus={() => setActiveField('fname')}
                            onChangeText={(text) => {
                                const { value: lettersOnly, removed } = cleanNameInput(text);
                                const formattedText = lettersOnly.replace(/\b\w/g, c => c.toUpperCase());
                                setFname(formattedText);
                                if (removed) {
                                    setErrors((prevErrors) => ({ ...prevErrors, fname: NAME_RULE }));
                                } else if (formattedText) {
                                    setErrors((prevErrors) => ({ ...prevErrors, fname: '' }));
                                }
                            }}
                            onBlur={() => { setActiveField(null); setFname(fname.trimEnd()); }}
                        />
                        </View>
                        <View style={[styles.inputShell, styles.nameField, activeField === 'lname' && styles.inputFocused, errors.lname ? styles.errorInput : null]}>
                        <TextInput
                            style={styles.input}
                            value={lname}
                            placeholder="Last name"
                            placeholderTextColor="#A69AAA"
                            autoCapitalize="words"
                            autoComplete="family-name"
                            accessibilityLabel="Last name"
                            maxLength={30}
                            onFocus={() => setActiveField('lname')}
                            onChangeText={(text) => {
                                const { value: lettersOnly, removed } = cleanNameInput(text);
                                const formattedText = lettersOnly.replace(/\b\w/g, c => c.toUpperCase());
                                setLname(formattedText);
                                if (removed) {
                                    setErrors((prevErrors) => ({ ...prevErrors, lname: NAME_RULE }));
                                } else if (formattedText) {
                                    setErrors((prevErrors) => ({ ...prevErrors, lname: '' }));
                                }
                            }}
                            onBlur={() => { setActiveField(null); setLname(lname.trimEnd()); }}
                        />
                        </View>
                    </View>
                    {(errors.fname || errors.lname) ? <Text style={styles.errorText}>{errors.fname || errors.lname}</Text> : null}

                    {isWide && <Text style={styles.fieldLabel}>Email address</Text>}
                    <View style={[styles.inputShell, activeField === 'email' && styles.inputFocused, errors.email ? styles.errorInput : null]}>
                    <Ionicons name="mail-outline" size={20} color={activeField === 'email' ? '#7B2CBF' : '#958B9A'} />
                    <TextInput
                        style={styles.input}
                        value={email}
                        placeholder="Email address"
                        placeholderTextColor="#A69AAA"
                        autoCapitalize="none"
                        inputMode="email"
                        autoComplete="email"
                        accessibilityLabel="Email address"
                        maxLength={50}
                        onFocus={() => setActiveField('email')}
                        onBlur={() => setActiveField(null)}
                        onChangeText={(text) => {
                            const { value: formattedText, removed } = cleanEmailInput(text);
                            setEmail(formattedText);

                            if (removed) {
                                setErrors((prevErrors) => ({ ...prevErrors, email: EMAIL_RULE }));
                            } else if (isAllowedEmail(formattedText)) {
                                setErrors((prevErrors) => ({ ...prevErrors, email: '' }));
                            }
                        }}
                    />
                    </View>

                    {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

                    {isWide && <Text style={styles.fieldLabel}>Password</Text>}
                    <View style={[styles.passwordContainer, activeField === 'password' && styles.inputFocused, errors.password ? styles.errorInput : null]}>
                        <Ionicons name="lock-closed-outline" size={20} color={activeField === 'password' ? '#7B2CBF' : '#958B9A'} />
                        <TextInput
                            style={[styles.input, styles.passwordInput]}
                            secureTextEntry={!showPassword}
                            value={password}
                            placeholder="Password"
                            placeholderTextColor="#A69AAA"
                            autoCapitalize="none"
                            autoComplete="new-password"
                            accessibilityLabel="Password"
                            onFocus={() => setActiveField('password')}
                            onBlur={() => setActiveField(null)}
                            onChangeText={(text) => {
                                const { value: formattedText, removed } = cleanPasswordInput(text);
                                setPassword(formattedText);

                                if (removed) {
                                    setErrors((prevErrors) => ({ ...prevErrors, password: PASSWORD_RULE }));
                                } else if (formattedText.length >= 8 && /[A-Z]/.test(formattedText) && /[0-9]/.test(formattedText) && /[^A-Za-z0-9\s]/.test(formattedText)) {
                                    setErrors((prevErrors) => ({ ...prevErrors, password: '' }));
                                }
                            }}
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
                    {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

                    {isWide && <Text style={styles.fieldLabel}>Confirm password</Text>}
                    <View style={[styles.passwordContainer, activeField === 'cpassword' && styles.inputFocused, errors.cpassword ? styles.errorInput : null]}>
                        <Ionicons name="shield-checkmark-outline" size={20} color={activeField === 'cpassword' ? '#7B2CBF' : '#958B9A'} />
                        <TextInput
                            style={[styles.input, styles.passwordInput]}
                            secureTextEntry={!showCPassword}
                            value={cpassword}
                            placeholder="Repeat password"
                            placeholderTextColor="#A69AAA"
                            autoCapitalize="none"
                            autoComplete="new-password"
                            accessibilityLabel="Repeat password"
                            onFocus={() => setActiveField('cpassword')}
                            onBlur={() => setActiveField(null)}
                            onChangeText={(text) => {
                                const formattedText = cleanPasswordInput(text).value;
                                setCPassword(formattedText);

                                if (formattedText === password) {
                                    setErrors((prevErrors) => ({ ...prevErrors, cpassword: '' }));
                                }
                            }}
                        />
                        {cpassword.length > 0 && (
                            <Pressable
                                onPress={() => setShowCPassword(!showCPassword)}
                                style={styles.insideInputButton}
                            >
                                <Ionicons
                                    name={showCPassword ? 'eye-off' : 'eye'}
                                    size={24}
                                    color="#4F4F4F"
                                />
                            </Pressable>
                        )}
                    </View>
                    {errors.cpassword ? <Text style={styles.errorText}>{errors.cpassword}</Text> : null}

                    <View style={styles.buttonContainer}>
                        {loading ? (
                            <View style={styles.button}><ActivityIndicator size="small" color="#FFFFFF" /></View>
                        ) : (
                            <Pressable onPress={signup2} style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
                                <Text style={styles.buttonText}>Create account</Text>
                                <View style={styles.buttonIcon}><Ionicons name="arrow-forward" size={17} color="#7B2CBF" /></View>
                            </Pressable>
                        )}
                        <GoogleAuthButton
                            label="Sign up with Google"
                            mode="signup"
                            onToken={(idToken) => { setPendingGoogleToken(idToken); router.replace('/Login'); }}
                            onError={(message) => { setModalMessage(message); setModalVisible(true); }}
                        />
                    </View>

                    <View style={styles.linkContainer}>
                        <Pressable onPress={() => router.push('/Login')}>
                            <Text style={styles.linkPrompt}>Already have an account? <Text style={styles.linkText}>Sign in</Text></Text>
                        </Pressable>
                    </View>
                    </View>
                </View>

                <CustomModal
                    visible={modalVisible}
                    message={modalMessage}
                    onClose={() => setModalVisible(false)}
                    variant="auth"
                    title="Account notice"
                />

                {privacyModalVisible && (
                    <PrivacyPolicyModal
                        key={privacyModalVisible ? 'modal-opened' : 'modal-closed'}
                        visible={privacyModalVisible}
                        onAgree={() => {
                            setHasAgreedToPrivacy(true);
                            setPrivacyModalVisible(false);
                            signup(true);
                        }}
                        onClose={() => setPrivacyModalVisible(false)}
                    />
                )}

            </ScrollView>
        </View>
    );
};

export default Signup;
