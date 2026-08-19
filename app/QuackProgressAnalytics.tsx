import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BackIcon from '../assets/svg/back-icon.svg';
import styles from '../styles/stylesQuackProgressAnalytics';
import expoconfig from '../expoconfig';
import { AuthContext } from '../context/AuthContext';
import StudentBottomNav from '../components/StudentBottomNav';

type ModuleAccuracy = { label: string; value: number };
type HistoryItem = { title: string; score: number };
type AnalyticsData = { overallMastery: number; situationalAccuracy: number; interactionAccuracy: number; progressSummary: string; recommendation: string; weakAreas: string[]; repeatedMistakes: string[]; history: HistoryItem[]; moduleAccuracy: ModuleAccuracy[] };
type LessonProgress = { hiragana1: boolean; hiragana2: boolean; hiragana3: boolean; katakana1: boolean; katakana2: boolean; katakana3: boolean; vocab1: boolean; vocab2: boolean; vocab3: boolean; sentence: boolean };

export default function QuackProgressAnalytics() {
  const { user } = useContext(AuthContext);
  const [tab, setTab] = useState<'summary' | 'mistakes' | 'history'>('summary');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lessonProgress, setLessonProgress] = useState<LessonProgress | null>(null);

  useEffect(() => {
    fetchAnalytics();
    if (user?.email) fetch(`${expoconfig.API_URL}/api/progress/${encodeURIComponent(user.email)}`).then(response => response.ok ? response.json() : null).then(setLessonProgress).catch(() => setLessonProgress(null));
  }, [user?.email]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      if (!user?.email) throw new Error('User email not found.');
      const response = await fetch(`${expoconfig.API_URL}/api/quackProgress/analytics?email=${user.email}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch analytics.');
      setAnalytics(data);
    } catch (error: any) {
      console.log('QuackProgress analytics fetch error:', error.message);
      setAnalytics({ overallMastery: 0, situationalAccuracy: 0, interactionAccuracy: 0, progressSummary: 'No analytics records found yet. Complete QuackSituate, QuackResponse, or QuackTalk activities first.', recommendation: 'Start with guided communication activities to generate progress recommendations.', weakAreas: [], repeatedMistakes: [], history: [], moduleAccuracy: [] });
    } finally { setLoading(false); }
  };

  const reportCard = (title: string, value: number, color: string) => <View style={styles.reportCard}><View style={[styles.reportAccent, { backgroundColor: color }]} /><View style={styles.reportTop}><Text style={styles.reportTitle}>{title}</Text><Text style={[styles.reportValue, { color }]}>{value}%</Text></View><View style={styles.track}><View style={[styles.fill, { width: `${value}%`, backgroundColor: color }]} /></View></View>;

  const lessonItems = [
    { name: 'Kana', detail: 'Hiragana and Katakana', icon: 'language-outline' as const, done: Boolean(lessonProgress?.hiragana1 && lessonProgress?.hiragana2 && lessonProgress?.hiragana3 && lessonProgress?.katakana1 && lessonProgress?.katakana2 && lessonProgress?.katakana3), progress: [lessonProgress?.hiragana1, lessonProgress?.hiragana2, lessonProgress?.hiragana3, lessonProgress?.katakana1, lessonProgress?.katakana2, lessonProgress?.katakana3].filter(Boolean).length, total: 6 },
    { name: 'Words', detail: 'Three picture collections', icon: 'images-outline' as const, done: Boolean(lessonProgress?.vocab1 && lessonProgress?.vocab2 && lessonProgress?.vocab3), progress: [lessonProgress?.vocab1, lessonProgress?.vocab2, lessonProgress?.vocab3].filter(Boolean).length, total: 3 },
    { name: 'Grammar', detail: 'Sentence and grammar lesson', icon: 'reader-outline' as const, done: Boolean(lessonProgress?.sentence), progress: lessonProgress?.sentence ? 1 : 0, total: 1 },
  ];
  const completedCore = lessonItems.filter(item => item.done).length;

  return <SafeAreaView style={styles.safeArea}><View style={styles.container}>
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.headerCircle} /><Text style={styles.headerCharacter}>析</Text>
        <View style={styles.topRow}><Pressable onPress={() => router.push('/QuackProgress')} style={styles.backButton}><BackIcon width={18} height={18} fill="#462A5E" /></Pressable><View style={styles.wordmark}><Ionicons name="analytics" size={15} color="#8423D9" /><Text style={styles.wordmarkText}>PROGRESS REPORT</Text></View><View style={styles.masteryBadge}><Text style={styles.masteryValue}>{analytics?.overallMastery || 0}%</Text><Text style={styles.masteryLabel}>MASTERY</Text></View></View>
        <View style={styles.headerCopy}><Text style={styles.eyebrow}>ANALYTICS & INSIGHTS</Text><Text style={styles.headerTitle}>Your learning report</Text><Text style={styles.headerText}>Understand your accuracy, learning patterns, focus areas, and activity history.</Text></View>
        <View style={styles.headerSummary}><View style={styles.summaryItem}><Ionicons name="pulse-outline" size={18} color="#8423D9" /><View><Text style={styles.summaryValue}>{analytics?.situationalAccuracy || 0}%</Text><Text style={styles.summaryLabel}>Situational</Text></View></View><View style={styles.summaryDivider} /><View style={styles.summaryItem}><Ionicons name="chatbubbles-outline" size={18} color="#65A936" /><View><Text style={styles.summaryValue}>{analytics?.interactionAccuracy || 0}%</Text><Text style={styles.summaryLabel}>Interaction</Text></View></View></View>
      </View>

      <View style={styles.content}>
        <View style={styles.tabs}>{(['summary','mistakes','history'] as const).map((item) => <Pressable key={item} style={[styles.tab, tab === item && styles.activeTab]} onPress={() => setTab(item)}><Ionicons name={item === 'summary' ? 'pie-chart-outline' : item === 'mistakes' ? 'alert-circle-outline' : 'time-outline'} size={17} color={tab === item ? '#FFFFFF' : '#8A7D8F'} /><Text style={[styles.tabText, tab === item && styles.activeTabText]}>{item === 'summary' ? 'Summary' : item === 'mistakes' ? 'Focus' : 'History'}</Text></Pressable>)}</View>
        {loading ? <View style={styles.loadingCard}><ActivityIndicator size="large" color="#8423D9" /><Text style={styles.loadingText}>Loading progress analytics...</Text></View> : <>
          {tab === 'summary' && <>
            <View style={styles.sectionHeading}><View><Text style={styles.sectionTitle}>Core lesson journey</Text><Text style={styles.sectionSubtitle}>Your badge milestones and lesson completion.</Text></View><View style={styles.lessonCountPill}><Text style={styles.lessonCountText}>{completedCore} / 3 COMPLETE</Text></View></View>
            <View style={styles.lessonJourneyCard}>
              <View style={styles.journeySummary}><View style={styles.journeyIcon}><Ionicons name="school-outline" size={24} color="#8423D9" /></View><View style={styles.journeyCopy}><Text style={styles.journeyTitle}>Lesson progress report</Text><Text style={styles.journeyText}>{completedCore === 3 ? 'All core learning paths are complete.' : `${3 - completedCore} core ${3 - completedCore === 1 ? 'path' : 'paths'} remaining.`}</Text></View><Text style={styles.journeyPercent}>{Math.round((completedCore / 3) * 100)}%</Text></View>
              <View style={styles.lessonGrid}>{lessonItems.map(item => <View key={item.name} style={[styles.lessonCard, item.done && styles.lessonCardDone]}><View style={[styles.lessonIcon, item.done && styles.lessonIconDone]}><Ionicons name={item.done ? 'checkmark' : item.icon} size={20} color={item.done ? '#FFFFFF' : '#8423D9'} /></View><Text style={styles.lessonName}>{item.name}</Text><Text style={styles.lessonDetail}>{item.detail}</Text><View style={styles.lessonMeta}><Text style={[styles.lessonStatus, item.done && styles.lessonStatusDone]}>{item.done ? 'Completed' : 'In progress'}</Text><Text style={styles.lessonFraction}>{item.progress}/{item.total}</Text></View><View style={styles.lessonTrack}><View style={[styles.lessonFill, { width: `${(item.progress / item.total) * 100}%` }, item.done && styles.lessonFillDone]} /></View></View>)}</View>
            </View>
            <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>Accuracy overview</Text><View style={styles.reportPill}><Text style={styles.reportPillText}>LIVE REPORT</Text></View></View>
            {reportCard('Situational response accuracy', analytics?.situationalAccuracy || 0, '#8423D9')}
            {reportCard('Interaction accuracy', analytics?.interactionAccuracy || 0, '#65A936')}
            {analytics?.moduleAccuracy?.length ? analytics.moduleAccuracy.map((item, index) => <React.Fragment key={item.label}>{reportCard(item.label, item.value, index % 2 ? '#65A936' : '#8423D9')}</React.Fragment>) : <View style={styles.emptyCard}><Ionicons name="bar-chart-outline" size={27} color="#A99DAE" /><Text style={styles.emptyTitle}>No module accuracy yet</Text><Text style={styles.emptyText}>Complete communication activities to build this report.</Text></View>}
            <View style={styles.insightCard}><View style={styles.insightIcon}><Ionicons name="document-text-outline" size={22} color="#8423D9" /></View><View style={styles.insightCopy}><Text style={styles.insightTitle}>Progress summary</Text><Text style={styles.insightText}>{analytics?.progressSummary}</Text></View></View>
            <View style={styles.recommendation}><View style={styles.recommendationIcon}><Ionicons name="bulb-outline" size={22} color="#A66A12" /></View><View style={styles.insightCopy}><Text style={styles.recommendationTitle}>Recommended next</Text><Text style={styles.recommendationText}>{analytics?.recommendation}</Text></View></View>
          </>}
          {tab === 'mistakes' && <><View style={styles.sectionHeading}><Text style={styles.sectionTitle}>Learning focus</Text><View style={styles.focusPill}><Text style={styles.focusPillText}>{analytics?.repeatedMistakes?.length || 0} NOTES</Text></View></View>
            {analytics?.repeatedMistakes?.length ? analytics.repeatedMistakes.map((item,index) => <View key={`${item}-${index}`} style={styles.mistakeCard}><View style={styles.mistakeNumber}><Text style={styles.mistakeNumberText}>{index+1}</Text></View><View style={styles.mistakeCopy}><Text style={styles.mistakeLabel}>REPEATED PATTERN</Text><Text style={styles.mistakeText}>{item}</Text></View></View>) : <View style={styles.emptyCard}><Ionicons name="checkmark-circle-outline" size={27} color="#65A936" /><Text style={styles.emptyTitle}>No repeated mistakes</Text><Text style={styles.emptyText}>Keep practicing to maintain this result.</Text></View>}
            <Text style={styles.subheading}>Weak communication areas</Text><View style={styles.areaWrap}>{analytics?.weakAreas?.length ? analytics.weakAreas.map(item => <View key={item} style={styles.areaBadge}><Ionicons name="fitness-outline" size={15} color="#D88727" /><Text style={styles.areaText}>{item}</Text></View>) : <Text style={styles.noAreaText}>No weak areas recorded yet.</Text>}</View>
          </>}
          {tab === 'history' && <><View style={styles.sectionHeading}><Text style={styles.sectionTitle}>Activity history</Text><View style={styles.historyPill}><Text style={styles.historyPillText}>{analytics?.history?.length || 0} RECORDS</Text></View></View>
            {analytics?.history?.length ? analytics.history.map((item,index) => <View key={`${item.title}-${index}`} style={styles.historyCard}><View style={styles.historyIcon}><Ionicons name="game-controller-outline" size={20} color="#8423D9" /></View><View style={styles.historyCopy}><Text style={styles.historyTitle}>{item.title}</Text><Text style={styles.historyLabel}>Completed activity</Text></View><View style={styles.scoreBadge}><Text style={styles.historyScore}>{item.score}%</Text></View></View>) : <View style={styles.emptyCard}><Ionicons name="time-outline" size={27} color="#A99DAE" /><Text style={styles.emptyTitle}>No activity history yet</Text><Text style={styles.emptyText}>Complete a communication activity to see it here.</Text></View>}
            <Pressable style={styles.continueButton} onPress={() => router.push('/Exercises')}><Text style={styles.continueText}>Continue practice</Text><Ionicons name="arrow-forward" size={18} color="#FFFFFF" /></Pressable>
          </>}
        </>}
      </View>
    </ScrollView>
    <StudentBottomNav />
  </View></SafeAreaView>;
}
