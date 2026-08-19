import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, View, Pressable, Modal } from 'react-native';
import CustomModal from '../components/CustomModal';
import PrivacyModal from '../components/PrivacyModal';
import styles from '../styles/stylesSignup';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import expoconfig from '../expoconfig';
import PrivacyPolicyModal from '../components/PrivacyPolicyModal';
import Logo from '../assets/svg/jpLogo.svg';

const Signup = () => {
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
        return /^[^\s@]+@(gmail\.com|cit\.edu)$/.test(value.toLowerCase());
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
        }
        if (!lname.trim()) {
            validationErrors.lname = 'Please enter your last name';
        }
        if (!email.trim()) {
            validationErrors.email = 'Please enter your email';
        } else if (!isAllowedEmail(email)) {
            validationErrors.email = 'Email must be a valid Gmail or CIT email';
        }
        if (!password) {
            validationErrors.password = 'Please enter your password';
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
            if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
                validationErrors.password = validationErrors.password + ' Include at least one special character';
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
                    : 'Signup failed. Please try again.';
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
            <View style={styles.backgroundOrbTop} />
            <View style={styles.backgroundOrbBottom} />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                <View style={styles.contentWrapper}>
                    <View style={styles.imageContainer}>
                        <Logo width={88} height={88} />
                        <Text style={styles.brandText}>JAPLEARN 2.0</Text>
                        <Text style={styles.titleText}>Create your account</Text>
                        <Text style={styles.subtitleText}>Start your Japanese learning journey today.</Text>
                    </View>
                    <View style={styles.formCard}>
                    <View style={styles.inputShell}>
                    <Ionicons name="person-outline" size={21} color="#8423D9" />
                    <TextInput
                        style={[styles.input, errors.fname ? styles.errorInput : null]}
                        value={fname}
                        placeholder="Firstname"
                        autoCapitalize="none"
                        maxLength={30}
                        onChangeText={(text) => {
                            const formattedText = text
                                .trimStart()
                                .replace(/\s+/g, ' ')
                                .replace(/\b\w/g, c => c.toUpperCase());
                            setFname(formattedText);
                            if (formattedText) {
                                setErrors((prevErrors) => ({ ...prevErrors, fname: '' }));
                            }
                        }}
                        onBlur={() => setFname(fname.trimEnd())}
                    />
                    </View>

                    <View style={styles.inputShell}>
                    <Ionicons name="person-outline" size={21} color="#8423D9" />
                    <TextInput
                        style={[styles.input, errors.lname ? styles.errorInput : null]}
                        value={lname}
                        placeholder="Lastname"
                        autoCapitalize="none"
                        maxLength={30}
                        onChangeText={(text) => {
                            const formattedText = text
                                .trimStart()
                                .replace(/\s+/g, ' ')
                                .replace(/\b\w/g, c => c.toUpperCase());
                            setLname(formattedText);
                            if (formattedText) {
                                setErrors((prevErrors) => ({ ...prevErrors, lname: '' }));
                            }
                        }}
                        onBlur={() => setLname(lname.trimEnd())}
                    />
                    </View>

                    <View style={[styles.inputShell, errors.email ? styles.errorInput : null]}>
                    <Ionicons name="mail-outline" size={21} color="#8423D9" />
                    <TextInput
                        style={styles.input}
                        value={email}
                        placeholder="Email"
                        autoCapitalize="none"
                        inputMode="email"
                        maxLength={50}
                        onChangeText={(text) => {
                            const formattedText = text.replace(/\s/g, '').toLowerCase();
                            setEmail(formattedText);

                            if (isAllowedEmail(formattedText)) {
                                setErrors((prevErrors) => ({ ...prevErrors, email: '' }));
                            }
                        }}
                    />
                    </View>

                    {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

                    <View style={styles.passwordContainer}>
                        <Ionicons name="lock-closed-outline" size={21} color="#8423D9" />
                        <TextInput
                            style={[styles.input, styles.passwordInput, errors.password ? styles.errorInput : null]}
                            secureTextEntry={!showPassword}
                            value={password}
                            placeholder="Password"
                            autoCapitalize="none"
                            onChangeText={(text) => {
                                const formattedText = text.replace(/\s/g, '');
                                setPassword(formattedText);

                                if (formattedText.length >= 8 && /[A-Z]/.test(formattedText) && /[0-9]/.test(formattedText) && /[!@#$%^&*(),.?":{}|<>]/.test(formattedText)) {
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

                    <View style={styles.passwordContainer}>
                        <Ionicons name="shield-checkmark-outline" size={21} color="#8423D9" />
                        <TextInput
                            style={[styles.input, styles.passwordInput, errors.cpassword ? styles.errorInput : null]}
                            secureTextEntry={!showCPassword}
                            value={cpassword}
                            placeholder="Confirm Password"
                            autoCapitalize="none"
                            onChangeText={(text) => {
                                const formattedText = text.replace(/\s/g, '');
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
                                <Ionicons name="person-add-outline" size={21} color="#FFFFFF" />
                                <Text style={styles.buttonText}>Create account</Text>
                            </Pressable>
                        )}
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
                />

                {privacyModalVisible && (
                    <Modal visible={privacyModalVisible} transparent animationType="fade">
                        <View style={styles.modalWrapper}>
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
                        </View>
                    </Modal>
                )}

            </ScrollView>
        </View>
    );
};

export default Signup;
