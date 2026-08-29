import { SafeAreaView, Text, View, Pressable, Image, Platform, StatusBar, ScrollView, useWindowDimensions, Animated } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import styles from '../styles/stylesMenu';
import { AuthContext } from '../context/AuthContext';
import expoconfig from '../expoconfig';
import { Ionicons } from '@expo/vector-icons';
import StudentBottomNav from '../components/StudentBottomNav';
import AsyncStorage from '@react-native-async-storage/async-storage';

const dateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const Menu = () => {
    const { user } = useContext(AuthContext);
    const router = useRouter();
    const { width } = useWindowDimensions();
    const isCompact = width < 390;
    const [classCode, setClassCode] = useState('');
    const [mascotFrame, setMascotFrame] = useState(0);
    const mascotFrames = [require('../assets/idle.png'), require('../assets/hello.png'), require('../assets/talk.png')];
    const [dailyMinutes, setDailyMinutes] = useState(0);
    const [goalStreak, setGoalStreak] = useState(0);
    const [tipVisible, setTipVisible] = useState(true);
    const [flippedCard, setFlippedCard] = useState<'play' | 'progress' | null>(null);
    const darkMode = false;
    const playFlip = React.useRef(new Animated.Value(0)).current;
    const progressFlip = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const fetchClassCode = async () => {
            try {
                const response = await fetch(`${expoconfig.API_URL}/api/students/getStudentByEmail?email=${user?.email}`);
                if (response.ok) {
                    const student = await response.json();
                    setClassCode(student?.classCode || 'Unknown');
                } else {
                    console.error('Failed to fetch class code:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching class code:', error);
            }
        };
        if (user?.email) fetchClassCode();
    }, [user]);

    useEffect(() => {
        const waveTimer = setInterval(() => setMascotFrame((frame) => (frame + 1) % mascotFrames.length), 700);
        return () => clearInterval(waveTimer);
    }, []);

    useEffect(() => {
        if (!user?.email) return;

        const todayDate = new Date();
        const today = dateKey(todayDate);
        const accountKey = user.email.trim().toLowerCase();
        const storageKey = `dailyGoalMinutes:${accountKey}:${today}`;
        let currentMinutes = 0;
        let goalRecorded = false;

        const loadAccountStreak = async () => {
            try {
                const response = await fetch(
                    `${expoconfig.API_URL}/api/users/daily-goal/streak?email=${encodeURIComponent(user.email)}`,
                );

                if (!response.ok) return;

                const data = await response.json();
                setGoalStreak(Number(data?.streak) || 0);
                goalRecorded = Boolean(data?.completedToday);
            } catch (error) {
                console.warn('Unable to load account streak.', error);
            }
        };

        const recordCompletedGoal = async () => {
            if (goalRecorded) return;
            goalRecorded = true;

            try {
                const response = await fetch(`${expoconfig.API_URL}/api/users/daily-goal/complete`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: user.email }),
                });

                if (!response.ok) {
                    goalRecorded = false;
                    return;
                }

                const data = await response.json();
                setGoalStreak(Number(data?.streak) || 0);
            } catch (error) {
                goalRecorded = false;
                console.warn('Unable to save account streak.', error);
            }
        };

        Promise.all([AsyncStorage.getItem(storageKey), loadAccountStreak()]).then(([storedMinutes]) => {
            currentMinutes = Math.min(Number(storedMinutes) || 0, 20);
            setDailyMinutes(currentMinutes);

            if (currentMinutes >= 20) recordCompletedGoal();
        });

        const goalTimer = setInterval(() => {
            currentMinutes = Math.min(currentMinutes + 1, 20);
            setDailyMinutes(currentMinutes);
            AsyncStorage.setItem(storageKey, String(currentMinutes));
            if (currentMinutes >= 20) recordCompletedGoal();
        }, 60000);

        return () => clearInterval(goalTimer);
    }, [user?.email]);

    const flipCard = (card: 'play' | 'progress') => {
        const value = card === 'play' ? playFlip : progressFlip;
        const shouldOpen = flippedCard !== card;
        if (flippedCard && flippedCard !== card) {
            Animated.timing(flippedCard === 'play' ? playFlip : progressFlip, { toValue: 0, duration: 260, useNativeDriver: true }).start();
        }
        setFlippedCard(shouldOpen ? card : null);
        Animated.spring(value, { toValue: shouldOpen ? 1 : 0, friction: 8, tension: 70, useNativeDriver: true }).start();
    };

    const frontRotation = (value: Animated.Value) => value.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
    const backRotation = (value: Animated.Value) => value.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });

    return (
        <SafeAreaView style={[styles.safeArea, darkMode && styles.darkPage]}>
            <StatusBar barStyle="light-content" backgroundColor={darkMode ? '#17101E' : '#8423D9'} />
                <View style={[styles.container, darkMode && styles.darkPage]}>
                    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        <View style={[styles.header, darkMode && styles.darkHeader, isCompact && styles.headerCompact, { paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 16 : 30 }]}>
                            <View style={styles.heroCircle} />
                            <View style={styles.cloudOne} />
                            <View style={styles.cloudTwo} />
                            <View style={styles.fujiSilhouette} />
                            <View style={styles.fujiSnow} />
                            <View style={styles.heroTorii}>
                                <View style={styles.heroToriiRoof} /><View style={styles.heroToriiBeam} />
                                <View style={styles.heroToriiPostLeft} /><View style={styles.heroToriiPostRight} />
                            </View>
                            <View style={styles.heroTopBar}>
                                <View style={styles.headerIntro}>
                                    <Text style={[styles.greeting, isCompact && styles.greetingCompact]}>Hi, {user?.fname || 'Learner'}! 👋</Text>
                                </View>
                                <Pressable onPress={() => router.push('/Profile')} style={({ pressed }) => [styles.profileButton, pressed && styles.pressed]}>
                                    <Ionicons name="person" size={23} color="#8423D9" />
                                </Pressable>
                            </View>
                            <View style={[styles.heroBody, isCompact && styles.heroBodyCompact]}>
                                <View style={[styles.headerCopy, isCompact && styles.headerCopyCompact]}>
                                    <Text style={styles.headerSubtitle}>Ready for today’s Japanese adventure?</Text>
                                    <View style={[styles.goalCard, isCompact && styles.goalCardCompact]}>
                                        <View style={styles.goalIcon}><Ionicons name="flame" size={28} color="#F29123" /></View>
                                        <View style={styles.goalCopy}>
                                            <Text style={styles.goalLabel}>Daily Goal</Text>
                                            <Text style={styles.goalValue}>{dailyMinutes} <Text style={styles.goalUnit}>/ 20 min</Text></Text>
                                            <View style={styles.goalTrack}><View style={[styles.goalFill, { width: `${Math.min((dailyMinutes / 20) * 100, 100)}%` }]} /></View>
                                        </View>
                                    </View>
                                </View>
                                <View style={[styles.mascotStage, isCompact && styles.mascotStageCompact]}>
                                    <View style={styles.mascotSun} /><View style={styles.mascotGround} />
                                    <View style={styles.miniFuji} /><View style={styles.miniFujiSnow} />
                                    <Image source={mascotFrames[mascotFrame]} style={[styles.mascotImage, isCompact && styles.mascotImageCompact]} resizeMode="contain" fadeDuration={0} />
                                </View>
                            </View>
                        </View>

                        <View style={[styles.content, darkMode && styles.darkContent]}>
                            <View style={[styles.classContainer, darkMode && styles.darkCard, isCompact && styles.classContainerCompact]}>
                                <Text style={styles.classCharacter}>日</Text>
                                <View style={styles.classIconWrap}><Ionicons name="school-outline" size={23} color="#FFFFFF" /></View>
                                <View style={styles.classCopy}>
                                    <Text style={styles.classLabel}>YOUR CLASS</Text>
                                    <Text style={[styles.classText, isCompact && styles.classTextCompact]}>Foreign Language 3 · Nihongo 1</Text>
                                    <Text style={styles.classCode}>FLO33 {classCode}</Text>
                                </View>
                                <Ionicons name="checkmark-circle" size={23} color="#72B83F" />
                            </View>
                            <View style={styles.sectionHeading}>
                                <View><Text style={[styles.sectionTitle, darkMode && styles.darkTitle]}>Choose your path</Text><Text style={[styles.sectionSubtitle, darkMode && styles.darkMuted]}>Small steps make big progress.</Text></View>
                                <View style={styles.streakPill}><Ionicons name="flame" size={17} color="#F7AE23" /><Text style={styles.streakText}>{goalStreak > 0 ? `${goalStreak} day streak` : 'Reach today’s goal'}</Text></View>
                            </View>
                            <Pressable onPress={() => router.push('/LearnMenu')} style={({ pressed }) => [styles.primaryCard, pressed && styles.cardPressed]}>
                                <View style={styles.primaryGlow} />
                                <View style={styles.cardIconPrimary}><Ionicons name="book-outline" size={29} color="#FFFFFF" /></View>
                                <View style={styles.cardCopy}>
                                    <View style={styles.lessonPill}><Text style={styles.lessonPillText}>GUIDED LESSONS</Text></View>
                                    <Text style={styles.cardTitleLight}>Learn Japanese</Text>
                                    <Text style={styles.cardDescriptionLight}>Master kana, words, and sentences through guided lessons.</Text>
                                    <View style={styles.cardActionLight}><Text style={styles.cardActionTextLight}>Continue learning</Text><Ionicons name="arrow-forward" size={18} color="#FFFFFF" /></View>
                                </View>
                                <Text style={styles.decorativeKana}>あ</Text>
                            </Pressable>
                            <View style={[styles.cardRow, isCompact && styles.cardRowCompact]}>
                                <View style={styles.flipWrapper}>
                                    <Animated.View pointerEvents={flippedCard === 'play' ? 'none' : 'auto'} style={[styles.flipFace, { transform: [{ rotateY: frontRotation(playFlip) }] }]}>
                                        <Pressable onPress={() => router.push('/Exercises')} style={({ pressed }) => [styles.smallCard, darkMode && styles.darkCard, pressed && styles.cardPressed]}>
                                            <Pressable onPress={() => flipCard('play')} style={styles.infoButton}><Ionicons name="information-circle-outline" size={20} color="#8423D9" /></Pressable>
                                            <Text style={styles.playCharacter}>遊</Text><View style={[styles.smallIcon, styles.playIcon]}><Ionicons name="game-controller-outline" size={25} color="#8423D9" /></View>
                                            <Text style={[styles.smallCardTitle, darkMode && styles.darkTitle]}>Play</Text><Text style={[styles.smallCardDescription, darkMode && styles.darkMuted]}>Practice with fun interactive activities.</Text><Ionicons name="arrow-forward-circle" size={24} color="#8423D9" />
                                        </Pressable>
                                    </Animated.View>
                                    <Animated.View pointerEvents={flippedCard === 'play' ? 'auto' : 'none'} style={[styles.flipFace, styles.flipBack, { transform: [{ rotateY: backRotation(playFlip) }] }]}>
                                        <Pressable onPress={() => flipCard('play')} style={[styles.backCard, darkMode && styles.darkCard]}><Ionicons name="game-controller-outline" size={29} color="#A95BE8" /><Text style={[styles.backTitle, darkMode && styles.darkTitle]}>Play activities</Text><Text style={[styles.backDescription, darkMode && styles.darkMuted]}>Open teacher-assigned games and interactive Japanese practice.</Text><Text style={styles.backHint}>Tap to return</Text></Pressable>
                                    </Animated.View>
                                </View>
                                <View style={styles.flipWrapper}>
                                    <Animated.View pointerEvents={flippedCard === 'progress' ? 'none' : 'auto'} style={[styles.flipFace, { transform: [{ rotateY: frontRotation(progressFlip) }] }]}>
                                        <Pressable onPress={() => router.push('/QuackProgress')} style={({ pressed }) => [styles.smallCard, darkMode && styles.darkCard, pressed && styles.cardPressed]}>
                                            <Pressable onPress={() => flipCard('progress')} style={styles.infoButton}><Ionicons name="information-circle-outline" size={20} color="#57942E" /></Pressable>
                                            <Text style={styles.progressCharacter}>上</Text><View style={styles.chartSilhouette}><Ionicons name="trending-up" size={100} color="rgba(142,217,77,0.10)" /></View>
                                            <View style={[styles.smallIcon, styles.progressIcon]}><Ionicons name="stats-chart-outline" size={25} color="#4F8F24" /></View>
                                            <Text style={[styles.smallCardTitle, darkMode && styles.darkTitle]}>Progress</Text><Text style={[styles.smallCardDescription, darkMode && styles.darkMuted]}>See your growth and achievements.</Text><Ionicons name="arrow-forward-circle" size={24} color="#6DBD37" />
                                        </Pressable>
                                    </Animated.View>
                                    <Animated.View pointerEvents={flippedCard === 'progress' ? 'auto' : 'none'} style={[styles.flipFace, styles.flipBack, { transform: [{ rotateY: backRotation(progressFlip) }] }]}>
                                        <Pressable onPress={() => flipCard('progress')} style={[styles.backCard, darkMode && styles.darkCard]}><Ionicons name="stats-chart-outline" size={28} color="#79C94A" /><Text style={[styles.backTitle, darkMode && styles.darkTitle]}>Learning progress</Text><Text style={[styles.backDescription, darkMode && styles.darkMuted]}>Review completed lessons, performance, growth, and achievements.</Text><Text style={styles.backHint}>Tap to return</Text></Pressable>
                                    </Animated.View>
                                </View>
                            </View>
                            {tipVisible && <View style={[styles.tipCard, darkMode && styles.darkTip]}>
                                <Pressable onPress={() => setTipVisible(false)} style={styles.tipClose} hitSlop={8}><Ionicons name="close" size={18} color="#8B621C" /></Pressable>
                                <View style={styles.tipIcon}><Ionicons name="bulb-outline" size={22} color="#F7AE23" /></View>
                                <View style={styles.tipCopy}><Text style={styles.tipLabel}>Learning tip</Text><Text style={styles.tipText}>A few minutes of practice every day helps Japanese stick.</Text></View>
                            </View>}
                        </View>
                    </ScrollView>
                    <StudentBottomNav active="home" />
                </View>
        </SafeAreaView>
    );
};

export default Menu;
