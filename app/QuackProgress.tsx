import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BackIcon from '../assets/svg/back-icon.svg';
import styles from '../styles/stylesQuackProgress';
import expoconfig from '../expoconfig';
import { AuthContext } from '../context/AuthContext';
import StudentBottomNav from '../components/StudentBottomNav';
import AsyncStorage from '@react-native-async-storage/async-storage';

type MasteryItem = { name: string; percentage: number };
type ProgressSummary = { overallMastery: number; completedActivities: number; weakAreaCount: number; recommendation: string; masteryItems: MasteryItem[] };
type SpeakingSummary = { sessions: number; seconds: number; lastRoom?: string };

const guides = [
  { image: require('../assets/idle.png'), label: 'See how far you’ve come', text: 'Your activity results become a clear Japanese growth map here.' },
  { image: require('../assets/hello.png'), label: 'Celebrate your progress!', text: 'Every completed activity strengthens your communication skills.' },
  { image: require('../assets/talk.png'), label: 'Review your mastery', text: 'Check which communication areas are growing confidently.' },
  { image: require('../assets/thinking.png'), label: 'Find what to practice', text: 'Focus areas help you choose your next useful practice.' },
  { image: require('../assets/Surprised.png'), label: 'Ready for your next step?', text: 'Use your recommendation to keep improving efficiently.' },
] as const;

export default function QuackProgress() {
  const { user } = useContext(AuthContext);
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [guide, setGuide] = useState(0);
  const [quackamoleBest, setQuackamoleBest] = useState(0);
  const [recognitionBest, setRecognitionBest] = useState(0);
  const [expressionBest, setExpressionBest] = useState(0);
  const [politenessBest, setPolitenessBest] = useState(0);
  const [speakingSummary, setSpeakingSummary] = useState<SpeakingSummary>({ sessions: 0, seconds: 0 });

  useEffect(() => {
    fetchProgressSummary();
  }, [user?.email]);

  useEffect(() => {
    const timer = setInterval(() => setGuide((current) => (current + 1) % guides.length), 2600);
    return () => clearInterval(timer);
  }, []);

  const fetchProgressSummary = async () => {
    const email = user?.email;
    if (!email) {
      setLoading(false);
      return;
    }

    const localBest = Number(await AsyncStorage.getItem(`quackamole_high_score:${email.toLowerCase()}`)) || 0;
    setQuackamoleBest(localBest);
    fetch(`${expoconfig.API_URL}/api/scores/high-score?email=${encodeURIComponent(email)}&game=QUACKAMOLE`)
      .then((response) => response.status === 204 ? null : response.json())
      .then((record) => record && setQuackamoleBest((current) => Math.max(current, record.score || 0)))
      .catch((error) => console.log('Quack-a-Mole score fetch error:', error.message));
    fetch(`${expoconfig.API_URL}/api/situational/best?email=${encodeURIComponent(email)}&gameType=RECOGNITION`)
      .then((response) => response.status === 204 ? null : response.json())
      .then((record) => record && setRecognitionBest(record.score || 0))
      .catch((error) => console.log('Recognition score fetch error:', error.message));
    fetch(`${expoconfig.API_URL}/api/situational/best?email=${encodeURIComponent(email)}&gameType=EXPRESSION_MATCH`)
      .then((response) => response.status === 204 ? null : response.json())
      .then((record) => record && setExpressionBest(record.score || 0))
      .catch((error) => console.log('Expression Match score fetch error:', error.message));
    fetch(`${expoconfig.API_URL}/api/situational/best?email=${encodeURIComponent(email)}&gameType=POLITENESS`)
      .then((response) => response.status === 204 ? null : response.json())
      .then((record) => record && setPolitenessBest(record.score || 0))
      .catch((error) => console.log('Politeness score fetch error:', error.message));
    fetch(`${expoconfig.API_URL}/api/quackTalkSessions?email=${encodeURIComponent(email)}`)
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Speaking history unavailable')))
      .then((records) => setSpeakingSummary({
        sessions: records.length,
        seconds: records.reduce((total: number, record: { durationSeconds?: number }) => total + (record.durationSeconds || 0), 0),
        lastRoom: records[0]?.roomType,
      }))
      .catch((error) => console.log('QuackTalk history fetch error:', error.message));

    try {
      setLoading(true);
      const response = await fetch(
        `${expoconfig.API_URL}/api/communicationAnalytics/getStudentAnalytics?email=${encodeURIComponent(email)}`,
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch communication mastery.');

      const masteryItems = [
        { name: 'Recognition', percentage: data.recognitionAccuracy || 0 },
        { name: 'Expression Match', percentage: data.expressionMatchAccuracy || 0 },
        { name: 'Politeness', percentage: data.politenessAccuracy || 0 },
      ];
      const activeMastery = masteryItems.filter((item) => item.percentage > 0);
      const overallMastery = activeMastery.length
        ? Math.round(
            activeMastery.reduce((total, item) => total + item.percentage, 0)
              / activeMastery.length,
          )
        : 0;

      setSummary({
        overallMastery,
        completedActivities: data.completedActivities || 0,
        weakAreaCount: data.weakAreaCount || 0,
        recommendation: data.recommendation,
        masteryItems,
      });
    } catch (error: any) {
      console.log('QuackProgress fetch error:', error.message);
      setSummary({ overallMastery: 0, completedActivities: 0, weakAreaCount: 0, recommendation: 'No progress data found yet. Complete communication activities to generate recommendations.', masteryItems: [] });
    } finally {
      setLoading(false);
    }
  };

  return <SafeAreaView style={styles.safeArea}><View style={styles.container}>
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <View style={styles.heroCircle} /><View style={styles.cloudOne} /><View style={styles.cloudTwo} /><View style={styles.fuji} /><View style={styles.fujiSnow} />
        <View style={styles.topRow}>
          <Pressable onPress={() => router.push('/Menu')} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}><BackIcon width={18} height={18} fill="#462A5E" /></Pressable>
          <View style={styles.wordmark}><Ionicons name="stats-chart" size={15} color="#65A936" /><Text style={styles.wordmarkText}>JAPLEARN GROWTH</Text></View>
          <View style={styles.headerIcon}><Ionicons name="ribbon-outline" size={22} color="#65A936" /></View>
        </View>
        <View style={styles.heroBody}>
          <View style={styles.heroCopy}>
            <View style={styles.coachBadge}><View style={styles.coachDot} /><Text style={styles.coachBadgeText}>PROGRESS COACH</Text></View>
            <View style={styles.reportBubble}><View style={styles.reportTail} /><Text style={styles.eyebrow}>COACH NOTE {guide + 1} OF {guides.length}</Text><Text style={styles.heroTitle}>{guides[guide].label}</Text><Text style={styles.heroText}>{guides[guide].text}</Text></View>
            <View style={styles.steps}>{guides.map((_, i) => <Pressable key={i} onPress={() => setGuide(i)} style={[styles.step, i === guide && styles.activeStep]} />)}</View>
          </View>
          <View style={styles.mascotStage}>
            <View style={styles.mascotSun} />
            <View style={styles.mascotGround} />
            <Image source={guides[guide].image} style={styles.mascot} resizeMode="contain" fadeDuration={0} />
          </View>
        </View>
      </View>

      {loading ? <View style={styles.loadingCard}><ActivityIndicator size="large" color="#8423D9" /><Text style={styles.loadingText}>Loading your progress...</Text></View> : <View style={styles.content}>
        <View style={styles.sectionHeading}><View><Text style={styles.sectionTitle}>Progress overview</Text><Text style={styles.sectionSubtitle}>A snapshot of your communication growth.</Text></View><View style={styles.updatedPill}><View style={styles.updatedDot} /><Text style={styles.updatedText}>UPDATED</Text></View></View>
        <View style={styles.statsRow}>
          <View style={styles.statCard}><View style={[styles.statAccent, styles.purpleAccent]} /><View style={styles.purpleIcon}><Ionicons name="speedometer-outline" size={20} color="#8423D9" /></View><Text style={styles.statValue}>{summary?.overallMastery || 0}%</Text><Text style={styles.statLabel}>OVERALL MASTERY</Text></View>
          <View style={styles.statCard}><View style={[styles.statAccent, styles.greenAccent]} /><View style={styles.greenIcon}><Ionicons name="checkmark-done-outline" size={20} color="#5A9E36" /></View><Text style={styles.statValue}>{summary?.completedActivities || 0}</Text><Text style={styles.statLabel}>COMPLETED</Text></View>
          <View style={styles.statCard}><View style={[styles.statAccent, styles.orangeAccent]} /><View style={styles.orangeIcon}><Ionicons name="fitness-outline" size={20} color="#D88727" /></View><Text style={styles.statValue}>{summary?.weakAreaCount || 0}</Text><Text style={styles.statLabel}>FOCUS AREAS</Text></View>
        </View>
        <View style={styles.progressPanel}><View style={styles.panelHeading}><View style={styles.panelIcon}><Ionicons name="analytics-outline" size={21} color="#8423D9" /></View><View style={styles.panelCopy}><Text style={styles.panelTitle}>Communication mastery</Text><Text style={styles.panelSubtitle}>Skill-by-skill performance from your activities</Text></View><View style={styles.reportTag}><Text style={styles.reportTagText}>REPORT</Text></View></View>
          {summary?.masteryItems?.length ? summary.masteryItems.map((item) => <View key={item.name} style={styles.progressItem}><View style={styles.progressTop}><Text style={styles.progressName}>{item.name}</Text><Text style={styles.progressPercent}>{item.percentage}%</Text></View><View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${item.percentage}%` }]} /></View></View>) : <Text style={styles.emptyText}>No mastery records yet. Play QuackSituate, QuackResponse, or QuackTalk first.</Text>}
        </View>
        <View style={styles.arcadeBestCard}>
          <Ionicons name="mic" size={25} color="#7552C8" />
          <View style={styles.arcadeBestCopy}>
            <Text style={styles.arcadeBestKicker}>SUMI SPEAKING PRACTICE</Text>
            <Text style={styles.arcadeBestTitle}>
              {speakingSummary.sessions} saved session{speakingSummary.sessions === 1 ? '' : 's'}
            </Text>
            <Text style={styles.panelSubtitle}>
              {Math.floor(speakingSummary.seconds / 60)}m {speakingSummary.seconds % 60}s practiced · evaluation coming soon
            </Text>
          </View>
          <Ionicons name="checkmark-circle" size={24} color="#65A936" />
        </View>
        <View style={styles.arcadeBestCard}><Ionicons name="trophy" size={25} color="#D59A2A" /><View style={styles.arcadeBestCopy}><Text style={styles.arcadeBestKicker}>ARCADE PERSONAL BEST</Text><Text style={styles.arcadeBestTitle}>Quack-a-Mole</Text></View><Text style={styles.arcadeBestValue}>{quackamoleBest}</Text></View>
        <View style={styles.arcadeBestCard}><Ionicons name="eye" size={25} color="#65A936" /><View style={styles.arcadeBestCopy}><Text style={styles.arcadeBestKicker}>SITUATIONAL PERSONAL BEST</Text><Text style={styles.arcadeBestTitle}>Recognition</Text></View><Text style={styles.arcadeBestValue}>{recognitionBest}</Text></View>
        <View style={styles.arcadeBestCard}><Ionicons name="git-compare" size={25} color="#8423D9" /><View style={styles.arcadeBestCopy}><Text style={styles.arcadeBestKicker}>MATCHING PERSONAL BEST</Text><Text style={styles.arcadeBestTitle}>Expression Match</Text></View><Text style={styles.arcadeBestValue}>{expressionBest}</Text></View>
        <View style={styles.arcadeBestCard}><Ionicons name="people" size={25} color="#D88727" /><View style={styles.arcadeBestCopy}><Text style={styles.arcadeBestKicker}>TONE QUEST PERSONAL BEST</Text><Text style={styles.arcadeBestTitle}>Politeness</Text></View><Text style={styles.arcadeBestValue}>{politenessBest}</Text></View>
        <Text style={styles.actionsTitle}>Explore your progress</Text>
        <Pressable style={styles.featureGreen} onPress={() => router.push('/QuackProgressProgression')}><View style={styles.featureIcon}><Ionicons name="trending-up-outline" size={25} color="#FFFFFF" /></View><View style={styles.featureCopy}><Text style={styles.featureTitle}>Progression & Reinforcement</Text><Text style={styles.featureText}>View mastery stages, repeated mistakes, and retry activities.</Text></View><Ionicons name="arrow-forward-circle" size={27} color="#65A936" /></Pressable>
        <Pressable style={styles.featurePurple} onPress={() => router.push('/QuackProgressAnalytics')}><View style={styles.featureIcon}><Ionicons name="bar-chart-outline" size={25} color="#FFFFFF" /></View><View style={styles.featureCopy}><Text style={styles.featureTitle}>Analytics & Progress Reports</Text><Text style={styles.featureText}>View accuracy, weak areas, completion progress, and summaries.</Text></View><Ionicons name="arrow-forward-circle" size={27} color="#8423D9" /></Pressable>
        <View style={styles.recommendation}><View style={styles.recommendationIcon}><Ionicons name="bulb-outline" size={23} color="#A66A12" /></View><View style={styles.recommendationCopy}><Text style={styles.recommendationTitle}>Recommended next</Text><Text style={styles.recommendationText}>{summary?.recommendation || 'Complete more activities to receive a recommendation.'}</Text></View></View>
      </View>}
    </ScrollView>
    <StudentBottomNav />
  </View></SafeAreaView>;
}
