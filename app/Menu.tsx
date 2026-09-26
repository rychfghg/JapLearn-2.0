import { SafeAreaView, Text, View, Pressable, Image, Platform, StatusBar, ScrollView, useWindowDimensions, Animated, AppState, Modal, TextInput, ActivityIndicator } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import styles from '../styles/stylesMenu';
import { AuthContext } from '../context/AuthContext';
import expoconfig from '../expoconfig';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useClassCode } from '../context/ClassCodeContext';
import SurveyPromptModal from '../components/SurveyPromptModal';
import { claimSurveyPrompt } from '../services/surveyPrompt';

const Menu = () => {
    const { user } = useContext(AuthContext);
    const { setClassCode: saveClassCode } = useClassCode();
    const router = useRouter();
    const { width } = useWindowDimensions();
    const isCompact = width < 390;
    const [classCode, setClassCode] = useState('');
    const [classPromptVisible, setClassPromptVisible] = useState(false);
    const [classCodeInput, setClassCodeInput] = useState('');
    const [classPromptError, setClassPromptError] = useState('');
    const [joiningClass, setJoiningClass] = useState(false);
    const [mascotFrame, setMascotFrame] = useState(0);
    const mascotFrames = [require('../assets/idle.png'), require('../assets/hello.png'), require('../assets/talk.png')];
    const [dailyMinutes, setDailyMinutes] = useState(0);
    const [goalStreak, setGoalStreak] = useState(0);
    const [tipVisible, setTipVisible] = useState(true);
    const [flippedCard, setFlippedCard] = useState<'play' | 'progress' | null>(null);
    const [surveyDue, setSurveyDue] = useState(false);
    const darkMode = false;

    // Survey pop-up: once after sign-in or after a long break, never on plain returns to Home.
    useEffect(() => {
        let active = true;
        claimSurveyPrompt().then(show => { if (active && show) setSurveyDue(true); });
        return () => { active = false; };
    }, []);
    const playFlip = React.useRef(new Animated.Value(0)).current;
    const progressFlip = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const fetchClassCode = async () => {
            try {
                const response = await fetch(`${expoconfig.API_URL}/api/students/getStudentByEmail?email=${user?.email}`);
                if (response.ok) {
                    const student = await response.json();
                    const assignedCode = String(student?.classCode || '').trim();
                    setClassCode(assignedCode);
                    if (!assignedCode) {
                        const promptKey = `classCodePromptSeen:${String(user?.email || '').toLowerCase()}`;
                        const alreadySeen = await AsyncStorage.getItem(promptKey);
                        if (!alreadySeen) setClassPromptVisible(true);
                    }
                } else {
                    console.error('Failed to fetch class code:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching class code:', error);
            }
        };
        if (user?.email) fetchClassCode();
    }, [user]);

    const dismissClassPrompt = async () => {
        if (user?.email) await AsyncStorage.setItem(`classCodePromptSeen:${user.email.toLowerCase()}`, 'true');
        setClassPromptVisible(false);
        setClassPromptError('');
    };

    const joinClass = async () => {
        const code = classCodeInput.trim();
        if (!code || !user?.email || joiningClass) {
            if (!code) setClassPromptError('Enter the class code shared by your teacher.');
            return;
        }
        setJoiningClass(true);setClassPromptError('');
        try {
            const response = await fetch(`${expoconfig.API_URL}/api/students/joinClass?email=${encodeURIComponent(user.email)}&classCode=${encodeURIComponent(code)}`, { method: 'POST' });
            if (!response.ok) {
                const message = await response.text();
                throw new Error(message || 'That class code could not be found.');
            }
            await AsyncStorage.setItem('classCode', code);
            await AsyncStorage.setItem(`classCodePromptSeen:${user.email.toLowerCase()}`, 'true');
            await saveClassCode(code);
            setClassCode(code);setClassPromptVisible(false);setClassCodeInput('');
        } catch (error) {
            setClassPromptError(error instanceof Error ? error.message.replace(/^.*"message":"?([^"}]+).*$/,'$1') : 'The class could not be joined.');
        } finally { setJoiningClass(false); }
    };

    useEffect(() => {
        const waveTimer = setInterval(() => setMascotFrame((frame) => (frame + 1) % mascotFrames.length), 700);
        return () => clearInterval(waveTimer);
    }, []);

    useEffect(() => {
        if (!user?.email) {
            setDailyMinutes(0);
            setGoalStreak(0);
            return;
        }

        let active = true;
        let requestInFlight = false;
        const email = user.email;

        const syncGoal = async (recordMinute: boolean) => {
            if (requestInFlight) return;
            requestInFlight = true;
            try {
                const response = recordMinute
                    ? await fetch(`${expoconfig.API_URL}/api/users/daily-goal/minute`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email }),
                    })
                    : await fetch(`${expoconfig.API_URL}/api/users/daily-goal/streak?email=${encodeURIComponent(email)}`);
                if (!response.ok) return;
                const data = await response.json();
                if (active) {
                    setDailyMinutes(Math.min(Math.max(Number(data?.minutes) || 0, 0), 20));
                    setGoalStreak(Number(data?.streak) || 0);
                }
            } catch (error) {
                console.warn('Unable to sync daily goal.', error);
            } finally {
                requestInFlight = false;
            }
        };

        setDailyMinutes(0);
        setGoalStreak(0);
        syncGoal(false);
        const goalTimer = setInterval(() => {
            if (AppState.currentState !== 'active') return;
            if (Platform.OS === 'web' && typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
            syncGoal(true);
        }, 60000);

        return () => {
            active = false;
            clearInterval(goalTimer);
        };
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
                                    <Text style={styles.classCode}>{classCode || 'No teacher class connected yet'}</Text>
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
                </View>
            <Modal visible={classPromptVisible} transparent animationType="fade" statusBarTranslucent onRequestClose={()=>void dismissClassPrompt()}>
                <View style={styles.classPromptBackdrop}>
                    <View style={styles.classPromptCard}>
                        <View style={styles.classPromptAccent}/>
                        <Pressable accessibilityLabel="Skip class code" onPress={()=>void dismissClassPrompt()} style={styles.classPromptClose}><Ionicons name="close" size={20} color="#796C80"/></Pressable>
                        <View style={styles.classPromptIcon}><Ionicons name="school-outline" size={28} color="#FFFFFF"/></View>
                        <Text style={styles.classPromptEyebrow}>OPTIONAL CLASS CONNECTION</Text>
                        <Text style={styles.classPromptTitle}>Do you have a class code?</Text>
                        <Text style={styles.classPromptText}>Join your teacher’s classroom to receive assigned lessons and activities. You can skip this and add a code later from Profile.</Text>
                        <View style={[styles.classPromptInput,classPromptError&&styles.classPromptInputError]}><Ionicons name="key-outline" size={20} color="#8423D9"/><TextInput value={classCodeInput} onChangeText={value=>{setClassCodeInput(value.replace(/\s/g,'').toLowerCase());setClassPromptError('');}} autoCapitalize="none" autoCorrect={false} placeholder="Example: nihonggo1234" placeholderTextColor="#A99BAF" style={styles.classPromptField}/></View>
                        {!!classPromptError&&<Text style={styles.classPromptError}>{classPromptError}</Text>}
                        <Pressable disabled={joiningClass} onPress={()=>void joinClass()} style={({pressed})=>[styles.classPromptPrimary,(pressed||joiningClass)&&{opacity:.75}]}>{joiningClass?<ActivityIndicator color="#FFFFFF"/>:<><Text style={styles.classPromptPrimaryText}>Join classroom</Text><Ionicons name="arrow-forward" size={19} color="#FFFFFF"/></>}</Pressable>
                        <Pressable onPress={()=>void dismissClassPrompt()} style={styles.classPromptSkip}><Text style={styles.classPromptSkipText}>Skip for now</Text></Pressable>
                        <View style={styles.classPromptHint}><Ionicons name="person-circle-outline" size={18} color="#6C9E45"/><Text style={styles.classPromptHintText}>Later: Profile → Class connection</Text></View>
                    </View>
                </View>
            </Modal>
            <SurveyPromptModal visible={surveyDue && !classPromptVisible} onClose={()=>setSurveyDue(false)}/>
        </SafeAreaView>
    );
};

export default Menu;
