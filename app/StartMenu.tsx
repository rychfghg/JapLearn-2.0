import React, { useState, useContext, useEffect } from 'react';
import { Pressable, View, TextInput, StyleSheet, KeyboardAvoidingView, Text, Alert } from 'react-native';
import EmptyClass from '../assets/svg/empty.svg';
import CustomButton from '../components/CustomButton';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';
import {styles} from '../styles/stylesStartMenu';
import CustomModal from '../components/CustomModal';
import Profile from '../assets/svg/user_pf.svg'; // Assuming this is the correct path for the SVG
import expoconfig from '../expoconfig';

const StartMenu = () => {
    const [classcode, setClasscode] = useState('');
    const { user } = useContext(AuthContext);
    const router = useRouter();
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    useEffect(() => {
        const checkClassCode = async () => {
            const storedClassCode = await AsyncStorage.getItem('classCode');
            if (storedClassCode) {
                // Redirect to another component if classCode exists
                router.push('/Menu'); // Update with the correct path if needed
            }
        };

        checkClassCode();
    }, [router]);

    const joinClass = async () => {
        if (!classcode.trim()) {
            setModalMessage('Please enter a class code.');
            setModalVisible(true);
            return;
        }

        if (!user || !user.email) {
            setModalMessage('Unable to identify the user or email is missing.');
            setModalVisible(true);
            return;
        }

        try {
            const params = new URLSearchParams({ email: user.email, classCode: classcode });
            const response = await fetch(`${expoconfig.API_URL}/api/students/joinClass`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params.toString()
            });

            if (response.ok) {
                const message = await response.text();
                Alert.alert('Success', message);
                await AsyncStorage.setItem('classCode', classcode);
                router.push('/Menu');
            } else {
                const errorMessage = await response.text();
                setModalMessage(`Error joining class: ${errorMessage}`);
                setModalVisible(true);
            }
        } catch (error) {
            console.error('Error joining class:', error.message);
            setModalMessage(`Error joining class. Please try again later.`);
            setModalVisible(true);
        }
    };

    return (
        <KeyboardAvoidingView behavior="padding">
            <View>
                {/* Header */}
                <View style={[styles.header, { padding: 20 }]}>
                    <View style={styles.leftContainer}>
                        <Text style={styles.hText1}>Welcome</Text>
                        <Text style={styles.hText2}>{user?.fname}</Text>
                    </View>
                    <View style={styles.rightContainer}>
                        <Pressable onPress={() => router.push('/Profile')}>
                            <Profile width={65} height={65} style={styles.profileIcon} />
                        </Pressable>
                    </View>
                </View>

                {/* Main Content */}
                <View style={styles.menuContainer}>
                    <Text style={styles.menuText}>Join a class!</Text>
                    <TextInput
                        style={styles.input}
                        value={classcode}
                        placeholder="Classcode"
                        autoCapitalize="none"
                        onChangeText={(text) => setClasscode(text)}
                    />
                    <CustomButton
                        title="Join"
                        onPress={joinClass}
                        buttonStyle={styles.button}
                        textStyle={styles.buttonText}
                    />
                    <EmptyClass width={300} height={300} />
                </View>

                {/* Modal */}
                <CustomModal
                    visible={modalVisible}
                    message={modalMessage}
                    onClose={() => setModalVisible(false)}
                />
            </View>
        </KeyboardAvoidingView>
    );
};

export default StartMenu;
