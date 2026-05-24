import { SafeAreaView, Image, StyleSheet, TouchableOpacity, Text, View, Pressable, TextInput, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, Modal, Animated } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import Profile from '../assets/svg/user_pf.svg';
import { useRouter } from 'expo-router';
import Background from '../assets/img/MenuBackground.png'; // Original background image (if you want to keep it)
import QuackmanBackground from '../assets/quackman.png'; // New background image
import BackIcon from '../assets/svg/back-icon.svg';
import styles from '../styles/stylesMenu';
import stylesSlate from '../styles/StylesSlate';
import { stylesEdit } from '../styles/stylesEdit';
import expoconfig from '../expoconfig'; // Ensure your API URL config is here

const QuackslateMenu = () => {
    const [gameCode, setGameCode] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [instructionModalVisible, setInstructionModalVisible] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [imageSource, setImageSource] = useState(require('../assets/img/idle.png')); // Initial image
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0); // For loading progress
    const fadeAnim = useRef(new Animated.Value(1)).current; // Fade animation for loading screen
    const router = useRouter();

    useEffect(() => {
        const interval = setInterval(() => {
            setImageSource((prevSource) =>
                prevSource === require('../assets/idle.png')
                    ? require('../assets/talk.png')
                    : require('../assets/idle.png')
            );
        }, 1000); // Change image every 1 second

        return () => clearInterval(interval); // Cleanup interval on component unmount
    }, []);

    useEffect(() => {
        // Simulate the loading process
        const simulateLoading = () => {
            if (progress >= 100) {
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }).start(() => {
                    setLoading(false); // Hide the loading screen after reaching 100%
                });
                return;
            }

            const randomIncrement = Math.min(100 - progress, Math.random() * 3 + 1);
            setTimeout(() => {
                setProgress((prev) => Math.min(100, prev + randomIncrement));
                simulateLoading();
            }, 500);
        };

        simulateLoading();
    }, [progress]);

    useEffect(() => {
        const checkAuthentication = async () => {
            const authStatus = await getAuthenticationStatus();
            if (authStatus) {
                setIsAuthenticated(true);
            } else {
                router.push('/Login');
            }
        };
        checkAuthentication();
    }, []);

    const getAuthenticationStatus = async () => {
        const mockAuthCheck = true; // Mock authentication for now
        return mockAuthCheck;
    };

    const handleBackPress = () => {
        router.back();
    };

    const handleEnterPress = async () => {
        if (!gameCode) {
            setModalMessage('Game code is required');
            setModalVisible(true);
            return;
        }

        try {
            const response = await fetch(`${expoconfig.API_URL}/api/quackslateLevels/getGameCode/${gameCode}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            if (response.ok) {
                setInstructionModalVisible(true); // Show instructions modal
            } else {
                setModalMessage(response.status === 404 ? 'Game code not found.' : 'Invalid Game Code');
                setModalVisible(true);
            }
        } catch (error) {
            setModalMessage('An error occurred. Please try again.');
            setModalVisible(true);
        }
    };

    const handleInstructionModalClose = () => {
        setInstructionModalVisible(false);
        router.push({
            pathname: '/QuackslateWait',
            params: { gameCode }
        });
    };

    if (!isAuthenticated || loading) {
        return (
            <SafeAreaView style={{ flex: 1 }}>
                {/* ImageBackground for the loading screen */}
                <ImageBackground
                    source={QuackmanBackground}
                    style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                >
                    {/* Only display the loading percentage text */}
                    <Text style={stylesSlate.loadingText}>{Math.round(progress)}%</Text>
                </ImageBackground>
            </SafeAreaView>
        );
    }
    

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    {/* Use QuackmanBackground for the new background */}
                    <ImageBackground source={Background} style={styles.backgroundImage}>
                        <View style={styles.container}>
                            <View style={[styles.header, { padding: 20 }]}>
                                <TouchableOpacity onPress={handleBackPress}>
                                    <View style={stylesEdit.backButtonContainer}>
                                        <BackIcon width={20} height={20} fill={'white'} />
                                    </View>
                                </TouchableOpacity>
                                <View style={styles.leftContainer}></View>
                                <View style={styles.rightContainer}>
                                    <Pressable onPress={() => router.push('/Profile')}>
                                        <Profile width={65} height={65} />
                                    </Pressable>
                                </View>
                            </View>

                            <View style={stylesSlate.centeredContainerWait}>
                                <Text style={stylesSlate.title}>Quackslate</Text>
                                <Text style={stylesSlate.smallText}>Master Japanese Sentence Construction</Text>
                                <View style={stylesSlate.textBoxWrapper}>
                                    <TextInput
                                        style={stylesSlate.textBox}
                                        placeholder="Game Code"
                                        placeholderTextColor="#323332"
                                        value={gameCode}
                                        onChangeText={setGameCode}
                                        keyboardType="default"
                                    />
                                    <TouchableOpacity style={stylesSlate.button} onPress={handleEnterPress}>
                                        <Text style={stylesSlate.buttonText}>Enter</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </ImageBackground>
                </ScrollView>

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalView}>
                            <Text style={styles.modalTitle}>Invalid Code</Text>
                            <Text style={styles.modalText}>{modalMessage}</Text>
                            <TouchableOpacity
                                style={styles.modalButton}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.modalButtonText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                {/* Instructions Modal */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={instructionModalVisible}
                    onRequestClose={handleInstructionModalClose}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalView}>
                            <View style={stylesSlate.modalTitleContainer}>
                                <Image
                                    source={imageSource} // Dynamically switch between idle.png and talk.png
                                    style={stylesSlate.modalImageMenu}
                                />
                                <Text style={styles.modalTitle}>Instructions</Text>
                            </View>
                            <Text style={[styles.modalText, { textAlign: 'justify' }]}>
                                Welcome to Quackslate! Your task is to master Japanese grammar by arranging words in the correct order to match the given Japanese character. Let's see how fast you can get it right!
                            </Text>
                            <TouchableOpacity
                                style={styles.modalButton}
                                onPress={handleInstructionModalClose}
                            >
                                <Text style={styles.modalButtonText}>Let's Begin</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default QuackslateMenu;
