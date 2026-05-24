import {
    SafeAreaView,
    TouchableOpacity,
    Text,
    View,
    Pressable,
    ImageBackground,
    Image,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Profile from '../assets/svg/user_pf.svg';
import Background from '../assets/img/MenuBackground.png';
import BackIcon from '../assets/svg/back-icon.svg';
import HourglassGIF from '../assets/gif/loading.gif'; // Add your hourglass gif in assets
import DuckExplorer from '../assets/img/Duck_Explorer.png'; // Add the Duck_Explorer image
import styles from '../styles/stylesMenu';
import stylesSlate from '../styles/StylesSlate';
import { stylesEdit } from '../styles/stylesEdit';
import expoconfig from '../expoconfig';

const QuackslateWait = () => {
    const { gameCode } = useLocalSearchParams();
    const [quizStarted, setQuizStarted] = useState(false);
    const [trivia, setTrivia] = useState('');
    const router = useRouter();

    // List of trivia
    const triviaList = [
        'Japan consists of over 6,800 islands!',
        'In Japan, there are more pets than children!',
        'The Japanese word for "Japan" is "Nihon" or "Nippon."',
        'Square watermelons are grown in Japan to save space.',
        'Mount Fuji is the tallest mountain in Japan.',
        'Tokyo is the largest city in the world by population.',
        'Japan has the world\'s third-largest economy.',
        'In Japan, slurping noodles is a sign of enjoyment.',
        'The Shinkansen (bullet train) is known for its punctuality.',
        'Cherry blossoms (sakura) are a symbol of renewal in Japan.',
    ];

    const changeTrivia = () => {
        const randomIndex = Math.floor(Math.random() * triviaList.length);
        setTrivia(triviaList[randomIndex]);
    };

    const pollForQuizStart = async () => {
        if (quizStarted) return;

        try {
            const response = await fetch(
                `${expoconfig.API_URL}/api/quackslateLevels/isQuizStarted/${gameCode}`
            );
            if (response.ok) {
                const data = await response.json();
                if (data.quizStarted && !quizStarted) {
                    setQuizStarted(true);
                    router.push({
                        pathname: '/Quackslate',
                        params: { gameCode },
                    });
                }
            } else {
                console.error('Failed to poll quiz start');
            }
        } catch (error) {
            console.error('Error while polling quiz start:', error);
        }
    };

    useEffect(() => {
        if (!quizStarted) {
            changeTrivia();
            const triviaInterval = setInterval(changeTrivia, 5000); // Change trivia every 5 seconds
            const pollInterval = setInterval(pollForQuizStart, 3000); // Poll every 3 seconds

            return () => {
                clearInterval(triviaInterval);
                clearInterval(pollInterval); // Stop polling when quiz starts
            };
        }
    }, [quizStarted]);

    const handleBackPress = () => {
        router.back();
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ImageBackground source={Background} style={styles.backgroundImage}>
                <View style={styles.container}>
                    {/* Header Section */}
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
    
                    {/* Centered Hourglass Section */}
                    <View style={stylesSlate.centeredContainerWait}>
                        <Image
                            source={HourglassGIF} // Embed the hourglass GIF here
                            style={{ width: 50, height: 50 }}
                        />
                        <Text style={stylesSlate.waitTitle}>
                            Waiting for the teacher to start the assessment...
                        </Text>
    
                        {/* Trivia Section */}
                        <View style={stylesSlate.triviaHeader}>
    <Text style={stylesSlate.triviaTitle}>Did you know?</Text>
    <Image
        source={DuckExplorer} // Add the Duck_Explorer image
        style={stylesSlate.triviaImageOverlap}
    />
</View>
<View style={stylesSlate.triviaBox}>
    <Text style={stylesSlate.triviaText}>{trivia}</Text>
</View>

                    </View>
                </View>
            </ImageBackground>
        </SafeAreaView>
    );
};

export default QuackslateWait;
