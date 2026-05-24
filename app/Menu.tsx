import { SafeAreaView, Text, View, Pressable, FlatList, Image, ImageBackground, Platform, StatusBar } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import styles from '../styles/stylesMenu';
import Profile from '../assets/svg/user_pf.svg';
import Background from '../assets/img/MenuBackground.png';
import { AuthContext } from '../context/AuthContext';
import MenuButton from '../components/MenuButton';
import expoconfig from '../expoconfig';

const Menu = () => {
    const { user } = useContext(AuthContext);
    const router = useRouter();
    const [classCode, setClassCode] = useState('');

    useEffect(() => {
        const fetchClassCode = async () => {
            try {
                const response = await fetch(`${expoconfig.API_URL}/api/students/getStudentByEmail?email=${user?.email}`);
                if (response.ok) {
                    const student = await response.json();
                    setClassCode(student?.classCode || 'Unknown'); // Default to 'Unknown' if no class code is found
                } else {
                    console.error('Failed to fetch class code:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching class code:', error);
            }
        };

        if (user?.email) {
            fetchClassCode();
        }
    }, [user]);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent', }}>
            {/* StatusBar Configuration */}
            <StatusBar
                barStyle="light-content"
                backgroundColor="transparent"
                translucent={true}
            />
            <ImageBackground source={Background} style={styles.backgroundImage}>
                <View style={styles.container}>
                   
                    <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 10 : 50
                        }]}>
                        <View style={styles.leftContainer}>
                            <Text style={styles.hText}>Welcome Back</Text>
                            <Text style={styles.hText}>{user?.fname}</Text>
                        </View>
                        <View style={styles.rightContainer}>
                            <Pressable onPress={() => router.push('/Profile')}>
                                <Profile width={65} height={65} />
                            </Pressable>
                        </View>
                    </View>

                    
                    <View style={styles.menuContainer}>
                        <View style={styles.classContainer}>
                            <Text style={styles.classText}>Foreign Language 3: Nihongo 1 - FLO33 {classCode}</Text>
                        </View>
                        <MenuButton 
                            title="Learn"
                            onPress={() => router.push('/LearnMenu')}
                            imageSource={require('../assets/img/m_menu_button.png')}
                            infoText="Learn is where there will be lessons to facilitate your process in learning the Japanese language."
                            buttonStyle={styles.menuButton}
                            textStyle={styles.menuButtonText} imageStyle={undefined}                        />
                        <MenuButton 
                            title="Play"
                            onPress={() => router.push('/Exercises')}
                            buttonStyle={styles.menuButton}
                            textStyle={styles.menuButtonText}
                            imageSource={require('../assets/img/m_menu_button2.png')}
                            infoText="Play is where activities are given by the teacher synchronously." imageStyle={undefined}                        />
                    </View>
                </View>
            </ImageBackground>
        </SafeAreaView>
    );
};

export default Menu;
