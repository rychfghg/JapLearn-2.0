import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Image, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import expoconfig from '../expoconfig';

type ConfirmationState = 'confirming' | 'confirmed' | 'invalid';

export default function ConfirmEmail() {
    const params = useLocalSearchParams<{ token?: string | string[] }>();
    const token = useMemo(() => Array.isArray(params.token) ? params.token[0] : params.token, [params.token]);
    const router = useRouter();
    const started = useRef(false);
    const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [state, setState] = useState<ConfirmationState>('confirming');

    useEffect(() => {
        if (started.current) return;
        started.current = true;

        if (!token) {
            setState('invalid');
            return;
        }

        fetch(`${expoconfig.API_URL}/api/users/confirm?token=${encodeURIComponent(token)}`)
            .then((response) => {
                if (!response.ok) throw new Error('Invalid confirmation link');
                setState('confirmed');
                redirectTimer.current = setTimeout(() => router.replace('/Login'), 1800);
            })
            .catch(() => setState('invalid'));

        return () => {
            if (redirectTimer.current) clearTimeout(redirectTimer.current);
        };
    }, [router, token]);

    const confirmed = state === 'confirmed';
    const invalid = state === 'invalid';

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.screen}>
                <View style={styles.orbLarge} />
                <View style={styles.orbSmall} />
                <View style={styles.card}>
                    <View style={styles.logoPlate}>
                        <Image source={require('../assets/APPLOGO.png')} style={styles.logo} resizeMode="contain" />
                    </View>

                    {state === 'confirming' ? (
                        <View style={styles.statusIcon}>
                            <ActivityIndicator size="large" color="#8423D9" />
                        </View>
                    ) : (
                        <View style={[styles.statusIcon, confirmed ? styles.successIcon : styles.errorIcon]}>
                            <Ionicons
                                name={confirmed ? 'checkmark' : 'close'}
                                size={34}
                                color={confirmed ? '#FFFFFF' : '#D85870'}
                            />
                        </View>
                    )}

                    <Text style={[styles.eyebrow, invalid && styles.errorEyebrow]}>
                        {state === 'confirming' ? 'VERIFYING YOUR ACCOUNT' : confirmed ? 'EMAIL CONFIRMED' : 'LINK NOT AVAILABLE'}
                    </Text>
                    <Text style={styles.title}>
                        {state === 'confirming' ? 'Confirming your email...' : confirmed ? 'You’re ready to learn!' : 'This link is invalid'}
                    </Text>
                    <Text style={styles.message}>
                        {state === 'confirming'
                            ? 'Please wait while JapLearn securely verifies your account.'
                            : confirmed
                                ? 'Your email address has been confirmed. We’re taking you to the login page now.'
                                : 'This confirmation link may be incomplete, expired, or already used. You can return to Login and request help if needed.'}
                    </Text>

                    {confirmed && <Text style={styles.redirectText}>Redirecting to Login...</Text>}

                    {state !== 'confirming' && (
                        <Pressable style={styles.loginButton} onPress={() => router.replace('/Login')}>
                            <Text style={styles.loginButtonText}>CONTINUE TO LOGIN</Text>
                            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                        </Pressable>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#FAF7FC' },
    screen: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, overflow: 'hidden' },
    orbLarge: { position: 'absolute', width: 330, height: 330, borderRadius: 165, backgroundColor: '#F0E2FB', top: -115, right: -125 },
    orbSmall: { position: 'absolute', width: 190, height: 190, borderRadius: 95, backgroundColor: '#EDF7E7', bottom: -60, left: -70 },
    card: { width: '100%', maxWidth: 460, paddingHorizontal: 28, paddingVertical: 34, borderRadius: 30, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E8DFED', alignItems: 'center', elevation: 10, shadowColor: '#3D2748', shadowOpacity: 0.14, shadowRadius: 24, shadowOffset: { width: 0, height: 12 } },
    logoPlate: { width: 72, height: 72, borderRadius: 22, padding: 7, backgroundColor: '#F0E4FA', marginBottom: 22 },
    logo: { width: '100%', height: '100%', borderRadius: 16 },
    statusIcon: { width: 70, height: 70, borderRadius: 24, backgroundColor: '#F5EDFA', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    successIcon: { backgroundColor: '#65A936' },
    errorIcon: { backgroundColor: '#FCECF0' },
    eyebrow: { color: '#65A936', fontSize: 10, fontWeight: '900', letterSpacing: 1.4, textAlign: 'center' },
    errorEyebrow: { color: '#D85870' },
    title: { fontFamily: 'Jua', color: '#3F244D', fontSize: 29, lineHeight: 36, textAlign: 'center', marginTop: 7 },
    message: { color: '#7D7082', fontSize: 14, lineHeight: 22, textAlign: 'center', marginTop: 10 },
    redirectText: { color: '#65A936', fontSize: 12, fontWeight: '800', marginTop: 18 },
    loginButton: { width: '100%', minHeight: 56, borderRadius: 18, backgroundColor: '#8423D9', marginTop: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, elevation: 5, shadowColor: '#8423D9', shadowOpacity: 0.24, shadowRadius: 12 },
    loginButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900', letterSpacing: 0.7 },
});
