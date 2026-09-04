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
import { RESPONSE_RUSH_BEST_SCORE_KEY } from './QuackResponseTimed';

type MasteryItem = { name: string; percentage: number };
type ProgressSummary = { overallMastery: number; completedActivities: number; weakAreaCount: number; recommendation: string; masteryItems: MasteryItem[] };
type SpeakingSummary = { sessions: number; seconds: number; lastRoom?: string };
type ReplyCoachSummary = { completedChapters: number; attempts: number; bestScore: number; averageScore: number };

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
  const [recognitionMaximum, setRecognitionMaximum] = useState(0);
  const [expressionBest, setExpressionBest] = useState(0);
  const [expressionAverage, setExpressionAverage] = useState(0);
  const [expressionAttempts, setExpressionAttempts] = useState(0);
  const [politenessBest, setPolitenessBest] = useState(0);
  const [responseRushBest, setResponseRushBest] = useState(0);
  const [speakingSummary, setSpeakingSummary] = useState<SpeakingSummary>({ sessions: 0, seconds: 0 });
  const [replyCoachSummary, setReplyCoachSummary] = useState<ReplyCoachSummary>({ completedChapters: 0, attempts: 0, bestScore: 0, averageScore: 0 });
  const [expandedGames, setExpandedGames] = useState<Record<string, boolean>>({});

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
    // Response Rush has no backend model yet, so its best score lives only
    // in the same local storage key the game itself writes to.
    const responseRushLocalBest = Number(await AsyncStorage.getItem(`${RESPONSE_RUSH_BEST_SCORE_KEY}:${email.toLowerCase()}`)) || 0;
    setResponseRushBest(responseRushLocalBest);
    fetch(`${expoconfig.API_URL}/api/scores/high-score?email=${encodeURIComponent(email)}&game=QUACKAMOLE`)
      .then((response) => response.status === 204 ? null : response.json())
      .then((record) => record && setQuackamoleBest((current) => Math.max(current, record.score || 0)))
      .catch((error) => console.log('Quack-a-Mole score fetch error:', error.message));
    fetch(`${expoconfig.API_URL}/api/situational/best?email=${encodeURIComponent(email)}&gameType=RECOGNITION`)
      .then((response) => response.status === 204 ? null : response.json())
      .then((record) => {
        if (!record) return;
        setRecognitionBest(record.score || 0);
        setRecognitionMaximum(record.maxScore || (record.totalQuestions || 0) * 10);
      })
      .catch((error) => console.log('Recognition score fetch error:', error.message));
    fetch(`${expoconfig.API_URL}/api/situational/best?email=${encodeURIComponent(email)}&gameType=EXPRESSION_MATCH`)
      .then((response) => response.status === 204 ? null : response.json())
      .then((record) => record && setExpressionBest(record.score || 0))
      .catch((error) => console.log('Expression Match score fetch error:', error.message));
    fetch(`${expoconfig.API_URL}/api/situational/expression-match/progress?email=${encodeURIComponent(email)}`)
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Expression Match progress unavailable')))
      .then((record) => {
        setExpressionAverage(record.averageAccuracy || 0);
        setExpressionAttempts(record.attempts || 0);
      })
      .catch((error) => console.log('Expression Match summary fetch error:', error.message));
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
    fetch(`${expoconfig.API_URL}/api/reply-coach/progress?email=${encodeURIComponent(email)}`)
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Reply Coach progress unavailable')))
      .then((record) => setReplyCoachSummary({
        completedChapters: record.completedChapters || 0,
        attempts: record.attempts || 0,
        bestScore: record.bestScore || 0,
        averageScore: record.averageScore || 0,
      }))
      .catch((error) => console.log('Reply Coach progress fetch error:', error.message));

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
        { name: 'Reply Coach', percentage: data.quackResponseAccuracy || 0 },
        { name: 'QuackTalk', percentage: data.quackTalkAccuracy || 0 },
        { name: 'Quack-a-Mole', percentage: data.quackamoleAccuracy || 0 },
        { name: 'Quackman', percentage: data.quackmanAccuracy || 0 },
        { name: 'QuackSlate', percentage: data.quackslateAccuracy || 0 },
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

  const masteryFor = (name: string) => summary?.masteryItems.find((item) => item.name === name)?.percentage || 0;
  const activeAverage = (values: number[]) => {
    const active = values.filter((value) => value > 0);
    return active.length ? Math.round(active.reduce((total, value) => total + value, 0) / active.length) : 0;
  };
  const situateScores = [masteryFor('Recognition'), masteryFor('Expression Match'), masteryFor('Politeness')];
  const responseScores = [masteryFor('Reply Coach'), responseRushBest, 0];
  const gameScores = [
    { key: 'quacktalk', name: 'QuackTalk', caption: `${speakingSummary.sessions} speaking session${speakingSummary.sessions === 1 ? '' : 's'}`, score: masteryFor('QuackTalk'), color: '#7552C8', tint: '#F1ECFC', icon: 'mic-outline' },
    { key: 'quacksituate', name: 'QuackSituate', caption: 'Real-world communication', score: activeAverage(situateScores), color: '#65A936', tint: '#EFF8E8', icon: 'navigate-outline', children: [
      { name: 'Ahiru Rescue', skill: 'Recognition', score: situateScores[0], icon: 'eye-outline' },
      { name: 'Expression Match', skill: 'Gesture matching', score: situateScores[1], icon: 'git-compare-outline' },
      { name: 'Tone Quest', skill: 'Politeness', score: situateScores[2], icon: 'people-outline' },
    ] },
    { key: 'quackresponse', name: 'QuackResponse', caption: `${replyCoachSummary.attempts} story attempt${replyCoachSummary.attempts === 1 ? '' : 's'}`, score: activeAverage(responseScores), color: '#8423D9', tint: '#F3EAFB', icon: 'chatbubbles-outline', children: [
      { name: 'Reply Coach', skill: 'Guided response', score: responseScores[0], icon: 'book-outline' },
      { name: 'Response Rush', skill: 'Timed response', score: responseScores[1], icon: 'timer-outline' },
      { name: 'Dialogue Relay', skill: 'Multi-step response', score: responseScores[2], icon: 'git-branch-outline' },
    ] },
    { key: 'quackamole', name: 'Quack-a-Mole', caption: `Personal best: ${quackamoleBest}`, score: masteryFor('Quack-a-Mole'), color: '#D59A2A', tint: '#FFF7E5', icon: 'hammer-outline' },
    { key: 'quackman', name: 'Quackman', caption: 'Word-survival accuracy', score: masteryFor('Quackman'), color: '#347CCB', tint: '#EAF3FC', icon: 'shield-checkmark-outline' },
    { key: 'quackslate', name: 'QuackSlate', caption: 'Solo and teacher-coded play', score: masteryFor('QuackSlate'), color: '#D84F83', tint: '#FCECF2', icon: 'grid-outline' },
  ];

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
        <View style={styles.progressPanel}><View style={styles.panelHeading}><View style={styles.panelIcon}><Ionicons name="analytics-outline" size={21} color="#8423D9" /></View><View style={styles.panelCopy}><Text style={styles.panelTitle}>Game mastery</Text><Text style={styles.panelSubtitle}>Overall performance across your JapLearn games</Text></View><View style={styles.reportTag}><Text style={styles.reportTagText}>SCORES</Text></View></View>
          <View style={styles.gameScoreList}>
            {gameScores.map((game) => { const expanded = !!expandedGames[game.key]; const expandable = !!game.children?.length; return <View key={game.key} style={[styles.gameScoreCard, expanded && styles.gameScoreCardExpanded]}>
              <Pressable disabled={!expandable} onPress={() => setExpandedGames((current) => ({ ...current, [game.key]: !current[game.key] }))} style={({ pressed }) => [styles.gameScoreMain, pressed && expandable && styles.pressed]}>
                <View style={[styles.gameScoreIcon, { backgroundColor: game.tint }]}><Ionicons name={game.icon as any} size={22} color={game.color} /></View>
                <View style={styles.gameScoreCopy}><Text style={styles.gameScoreName}>{game.name}</Text><Text style={styles.gameScoreCaption}>{game.caption}</Text><View style={styles.gameScoreTrack}><View style={[styles.gameScoreFill, { width: `${game.score}%`, backgroundColor: game.color }]} /></View></View>
                <View style={styles.gameScoreValueBlock}><Text style={[styles.gameScoreValue, { color: game.color }]}>{game.score}%</Text><Text style={styles.gameScoreValueLabel}>OVERALL</Text></View>
                {expandable ? <View style={[styles.gameScoreChevron, { backgroundColor: game.tint }]}><Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={17} color={game.color} /></View> : null}
              </Pressable>
              {expanded && game.children ? <View style={styles.subgameList}>{game.children.map((child, childIndex) => <View key={child.name} style={[styles.subgameRow, childIndex === game.children!.length - 1 && styles.subgameRowLast]}><View style={[styles.subgameIcon, { backgroundColor: game.tint }]}><Ionicons name={child.icon as any} size={16} color={game.color} /></View><View style={styles.subgameCopy}><Text style={styles.subgameName}>{child.name}</Text><Text style={styles.subgameSkill}>{child.skill}</Text></View><View style={styles.subgameTrack}><View style={[styles.subgameFill, { width: `${child.score}%`, backgroundColor: game.color }]} /></View><Text style={[styles.subgameScore, { color: game.color }]}>{child.score}%</Text></View>)}</View> : null}
            </View>})}
          </View>
          <Text style={styles.gameScoreHint}>Tap QuackSituate or QuackResponse to view their games.</Text>
        </View>
        <Text style={styles.actionsTitle}>Explore your progress</Text>
        <Pressable style={styles.featureGreen} onPress={() => router.push('/QuackProgressProgression')}><View style={styles.featureIcon}><Ionicons name="trending-up-outline" size={25} color="#FFFFFF" /></View><View style={styles.featureCopy}><Text style={styles.featureTitle}>Progression & Reinforcement</Text><Text style={styles.featureText}>View mastery stages, repeated mistakes, and retry activities.</Text></View><Ionicons name="arrow-forward-circle" size={27} color="#65A936" /></Pressable>
        <Pressable style={styles.featurePurple} onPress={() => router.push('/QuackProgressAnalytics')}><View style={styles.featureIcon}><Ionicons name="bar-chart-outline" size={25} color="#FFFFFF" /></View><View style={styles.featureCopy}><Text style={styles.featureTitle}>Analytics & Progress Reports</Text><Text style={styles.featureText}>View accuracy, weak areas, completion progress, and summaries.</Text></View><Ionicons name="arrow-forward-circle" size={27} color="#8423D9" /></Pressable>
        <View style={styles.recommendation}><View style={styles.recommendationIcon}><Ionicons name="bulb-outline" size={23} color="#A66A12" /></View><View style={styles.recommendationCopy}><Text style={styles.recommendationTitle}>Recommended next</Text><Text style={styles.recommendationText}>{summary?.recommendation || 'Complete more activities to receive a recommendation.'}</Text></View></View>
      </View>}
    </ScrollView>
    <StudentBottomNav />
  </View></SafeAreaView>;
}
