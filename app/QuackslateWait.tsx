import {
    SafeAreaView,
    TouchableOpacity,
    Text,
    View,
    Pressable,
    ImageBackground,
    Image,
} from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Profile from '../assets/svg/user_pf.svg';
const Background = require('../assets/quackslate-twilight-workshop-v4.png');
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
    const [remaining, setRemaining] = useState<number | null>(null);
    const [closed, setClosed] = useState(false);
    const navigating = useRef(false);
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
        if (navigating.current) return;

        try {
            const response = await fetch(
                `${expoconfig.API_URL}/api/quackslate/session/${encodeURIComponent(String(gameCode))}`
            );
            if (response.ok) {
                const data = await response.json();
                if (data.status === 'LIVE' && !navigating.current) {
                    navigating.current = true;
                    setQuizStarted(true);
                    router.replace({
                        pathname: '/Quackslate',
                        params: { gameCode: String(gameCode) },
                    });
                } else if (data.status === 'ENDED') {
                    setClosed(true);
                } else if (data.startsAt) {
                    const serverOffset = new Date(data.serverNow).getTime() - Date.now();
                    setRemaining(Math.max(0, Math.ceil((new Date(data.startsAt).getTime() - Date.now() - serverOffset) / 1000)));
                }
            } else if (response.status === 404 || response.status === 410) {
                setClosed(true);
                setRemaining(null);
            } else {
                console.error('Failed to poll quiz start', response.status);
            }
        } catch (error) {
            console.error('Error while polling quiz start:', error);
        }
    };

    useEffect(() => {
        if (!quizStarted && !closed) {
            changeTrivia();
            const triviaInterval = setInterval(changeTrivia, 5000); // Change trivia every 5 seconds
            void pollForQuizStart();
            const pollInterval = setInterval(pollForQuizStart, 3000); // Poll every 3 seconds
            const countdown = setInterval(() => setRemaining((value) => value === null ? null : Math.max(0, value - 1)), 1000);

            return () => {
                clearInterval(triviaInterval);
                clearInterval(pollInterval); // Stop polling when quiz starts
                clearInterval(countdown);
            };
        }
    }, [quizStarted, closed, gameCode]);

    const handleBackPress = () => {
        router.replace('/QuackslateMenu');
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ImageBackground source={Background} style={{ flex: 1 }}>
                <View style={styles.container}>
                    {/* Header Section */}
                    <View style={[styles.header, { padding: 20 }]}>
                        <TouchableOpacity onPress={handleBackPress}>
                            <View style={stylesEdit.backButtonContainer}>
                                <BackIcon width={20} height={20} fill={'white'} />
                            </View>
                        </TouchableOpacity>
                        <View></View>
                        <View>
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
                            {closed ? 'This class code is no longer available.' : remaining === null ? 'Checking the scheduled start time...' : `Starts automatically in ${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}`}
                        </Text>
                        {closed && <Pressable onPress={() => router.replace('/QuackslateMenu')}><Text style={stylesSlate.waitTitle}>Return to QuackSlate</Text></Pressable>}
    
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
