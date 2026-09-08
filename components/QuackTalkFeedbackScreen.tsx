import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, ImageBackground, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import BackIcon from '../assets/svg/back-icon.svg';
import { AuthContext } from '../context/AuthContext';
import expoconfig from '../expoconfig';
import styles from '../styles/stylesQuackTalkFeedback';

type Mode = 'guided' | 'conversation';
type Session = {
  id: string; roomType?: string; language?: string; scenarioTitle?: string;
  durationSeconds?: number; conversationTurns?: number; completed?: boolean; evaluated?: boolean;
  score?: number | null; pronunciationScore?: number | null; accuracyScore?: number | null;
  fluencyScore?: number | null; completenessScore?: number | null; contextualAccuracy?: number | null;
  feedbackSummary?: string; expressionsPracticed?: string[]; areasForImprovement?: string[]; practicedAt: string;
};

const background = require('../assets/img/background/clubroom a st2 day.png');
const sumi = require('../assets/img/Sumi_PoseB_WinterUni_Smile_Blush.png');
const rounded = (value?: number | null) => typeof value === 'number' ? Math.round(value) : null;
const duration = (seconds = 0) => `${Math.floor(seconds / 60)}m ${Math.max(0, Math.round(seconds)) % 60}s`;

export default function QuackTalkFeedbackScreen() {
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const { user } = useContext(AuthContext);
  const [mode, setMode] = useState<Mode>(returnTo === 'conversation' ? 'conversation' : 'guided');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!user?.email) { setError('Sign in to view your saved speaking history.'); setLoading(false); return; }
      try {
        setLoading(true); setError('');
        const response = await fetch(`${expoconfig.API_URL}/api/quackTalkSessions?email=${encodeURIComponent(user.email)}`);
        const body = await response.json();
        if (!response.ok || !Array.isArray(body)) throw new Error(body?.message || 'Speaking history could not be loaded.');
        if (active) setSessions(body);
      } catch (reason) {
        if (active) setError(reason instanceof Error ? reason.message : 'Speaking history could not be loaded.');
      } finally { if (active) setLoading(false); }
    };
    void load();
    return () => { active = false; };
  }, [user?.email]);

  const guided = useMemo(() => sessions.filter((item) => item.roomType === 'GUIDED_PHRASE' && item.completed && item.evaluated), [sessions]);
  const conversations = useMemo(() => sessions.filter((item) => item.roomType === 'TALK_WITH_SUMI' && item.completed), [sessions]);
  const visible = mode === 'guided' ? guided : conversations;
  const scores = guided.map((item) => rounded(item.score)).filter((item): item is number => item !== null);
  const average = scores.length ? Math.round(scores.reduce((sum, item) => sum + item, 0) / scores.length) : null;
  const totalMinutes = Math.round(conversations.reduce((sum, item) => sum + (item.durationSeconds || 0), 0) / 60);
  const returnRoute = returnTo === 'conversation' ? '/QuackTalkConversation' : returnTo === 'speaking' ? '/QuackTalkSpeech' : '/QuackTalk';

  const metric = (label: string, value?: number | null) => <View style={styles.metricPill}><Text style={styles.metricValue}>{rounded(value) ?? '—'}</Text><Text style={styles.metricLabel}>{label}</Text></View>;

  return <SafeAreaView style={styles.safeArea}>
    <ImageBackground source={background} style={styles.background} resizeMode="cover">
      <View style={styles.overlay} />
      <View style={styles.header}>
        <Pressable onPress={() => router.replace(returnRoute)} style={styles.backButton}><BackIcon width={18} height={18} fill="#462A5E" /></Pressable>
        <View style={styles.headerCopy}><Text style={styles.headerEyebrow}>QUACKTALK</Text><Text style={styles.headerTitle}>Speaking feedback</Text></View>
        <View style={styles.roomBadge}><Ionicons name={mode === 'guided' ? 'mic' : 'chatbubbles'} size={14} color="#8051C8" /><Text style={styles.roomBadgeText}>{mode === 'guided' ? 'Guided Phrase' : 'Talk with Sumi'}</Text></View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.coachCard}><View style={styles.heroOrbLarge} /><Image source={sumi} style={styles.sumi} resizeMode="contain" /><View style={styles.coachCopy}><Text style={styles.coachKicker}>SUMI'S REVIEW DESK</Text><Text style={styles.coachTitle}>Your speaking journey, clearly organized.</Text><Text style={styles.coachText}>See assessed phrase practice separately from free conversation activity.</Text></View></View>

        <View style={styles.modeSwitch}>
          <ModeButton active={mode === 'guided'} icon="mic-outline" title="Guided Phrase" caption="Scores & coaching" count={guided.length} onPress={() => setMode('guided')} />
          <ModeButton active={mode === 'conversation'} icon="chatbubbles-outline" title="Talk with Sumi" caption="Conversation activity" count={conversations.length} onPress={() => setMode('conversation')} />
        </View>

        {loading ? <View style={styles.loadingCard}><ActivityIndicator color="#8051C8" size="large" /><Text style={styles.loadingText}>Loading your speaking history…</Text></View> : null}
        {!loading && error ? <Empty icon="cloud-offline-outline" title="Feedback unavailable" copy={error} /> : null}
        {!loading && !error ? <>
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeading}><View><Text style={styles.sectionKicker}>{mode === 'guided' ? 'ASSESSED PRACTICE' : 'CONVERSATION LOG'}</Text><Text style={styles.sectionTitle}>{mode === 'guided' ? 'Guided Phrase overview' : 'Talk with Sumi overview'}</Text></View><Ionicons name={mode === 'guided' ? 'ribbon-outline' : 'sparkles-outline'} size={25} color="#8051C8" /></View>
            <View style={styles.summaryMetrics}>
              <Summary value={mode === 'guided' ? (average ?? '—') : conversations.length} label={mode === 'guided' ? 'Average score' : 'Saved talks'} />
              <View style={styles.summaryDivider} />
              <Summary value={mode === 'guided' ? (scores.length ? Math.max(...scores) : '—') : totalMinutes} label={mode === 'guided' ? 'Personal best' : 'Total minutes'} />
              <View style={styles.summaryDivider} />
              <Summary value={mode === 'guided' ? guided.length : new Set(conversations.map((item) => item.language).filter(Boolean)).size} label={mode === 'guided' ? 'Reviews saved' : 'Languages used'} />
            </View>
            <Text style={styles.summaryNote}>{mode === 'guided' ? 'Scores come only from completed pronunciation assessments.' : 'Conversation activity is kept separate and is never shown as an assessment score.'}</Text>
          </View>

          <View style={styles.sectionHeading}><View><Text style={styles.sectionKicker}>HISTORY</Text><Text style={styles.sectionTitle}>{mode === 'guided' ? 'Pronunciation reviews' : 'Conversation sessions'}</Text></View></View>
          {!visible.length ? <Empty icon={mode === 'guided' ? 'mic-outline' : 'chatbubbles-outline'} title={mode === 'guided' ? 'No assessed phrases yet' : 'No conversations saved yet'} copy={mode === 'guided' ? 'Complete a Guided Phrase practice to see pronunciation scores and Sumi’s coaching here.' : 'Completed Talk with Sumi sessions will appear here as conversation activity.'} /> : visible.map((session, index) =>
            <View key={session.id || `${session.practicedAt}-${index}`} style={styles.sessionCard}>
              <View style={styles.sessionTop}><View style={styles.sessionIcon}><Ionicons name={mode === 'guided' ? 'mic' : 'chatbubbles'} size={18} color="#8051C8" /></View><View style={styles.sessionTitleCopy}><Text style={styles.sessionTitle}>{mode === 'guided' ? (session.scenarioTitle || 'Guided Phrase Practice') : 'Talk with Sumi'}</Text><Text style={styles.sessionMeta}>{new Date(session.practicedAt).toLocaleString()} · {duration(session.durationSeconds)}</Text></View>{mode === 'guided' ? <View style={styles.scoreBadge}><Text style={styles.scoreBadgeValue}>{rounded(session.score) ?? '—'}</Text><Text style={styles.scoreBadgeLabel}>OVERALL</Text></View> : <View style={styles.savedBadge}><Ionicons name="checkmark-circle" size={14} color="#5CA936" /><Text style={styles.savedBadgeText}>SAVED</Text></View>}</View>
              {mode === 'guided' ? <>
                <View style={styles.metricStrip}>{metric('Pronunciation', session.pronunciationScore)}{metric('Accuracy', session.accuracyScore)}{metric('Fluency', session.fluencyScore)}{metric('Complete', session.completenessScore)}</View>
                {rounded(session.contextualAccuracy) !== null ? <View style={styles.contextRow}><Ionicons name="chatbox-ellipses-outline" size={17} color="#6AB43F" /><Text style={styles.contextText}>Conversation fit</Text><Text style={styles.contextScore}>{rounded(session.contextualAccuracy)}/100</Text></View> : null}
                {session.feedbackSummary ? <View style={styles.coachNote}><Text style={styles.detailLabel}>SUMI'S NOTE</Text><Text style={styles.detailText}>{session.feedbackSummary}</Text></View> : null}
                {session.expressionsPracticed?.length ? <View style={styles.detailBlock}><Text style={styles.detailLabel}>PHRASES PRACTICED</Text><View style={styles.tagWrap}>{session.expressionsPracticed.map((item, tag) => <View key={`${item}-${tag}`} style={styles.tag}><Text style={styles.tagText}>{item}</Text></View>)}</View></View> : null}
                {session.areasForImprovement?.length ? <View style={styles.focusBlock}><Text style={styles.focusLabel}>FOCUS NEXT</Text><Text style={styles.detailText}>{session.areasForImprovement.join(' · ')}</Text></View> : null}
              </> : <View style={styles.activityRow}><View style={styles.activityItem}><Text style={styles.activityValue}>{session.conversationTurns || '—'}</Text><Text style={styles.activityLabel}>Conversation turns</Text></View><View style={styles.activityItem}><Text style={styles.activityValue}>{session.language || 'Japanese'}</Text><Text style={styles.activityLabel}>Practice language</Text></View></View>}
            </View>)}

          <Pressable style={styles.progressLink} onPress={() => router.push('/QuackProgress')}><View style={styles.progressIcon}><Ionicons name="analytics-outline" size={20} color="#5DAE38" /></View><View style={styles.progressCopy}><Text style={styles.progressTitle}>Open QuackProgress</Text><Text style={styles.progressText}>See how speaking contributes to your complete learning record.</Text></View><Ionicons name="arrow-forward" size={19} color="#5DAE38" /></Pressable>
        </> : null}
      </ScrollView>
    </ImageBackground>
  </SafeAreaView>;
}

function ModeButton({ active, icon, title, caption, count, onPress }: { active: boolean; icon: keyof typeof Ionicons.glyphMap; title: string; caption: string; count: number; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.modeButton, active && styles.modeButtonActive]}><View style={[styles.modeIcon, active && styles.modeIconActive]}><Ionicons name={icon} size={19} color={active ? '#FFFFFF' : '#8051C8'} /></View><View style={styles.modeCopy}><Text style={[styles.modeLabel, active && styles.modeLabelActive]}>{title}</Text><Text style={[styles.modeCaption, active && styles.modeCaptionActive]}>{caption}</Text></View><Text style={[styles.modeCount, active && styles.modeCountActive]}>{count}</Text></Pressable>;
}
function Summary({ value, label }: { value: string | number; label: string }) { return <View style={styles.summaryMetric}><Text style={styles.summaryValue}>{value}</Text><Text style={styles.summaryLabel}>{label}</Text></View>; }
function Empty({ icon, title, copy }: { icon: keyof typeof Ionicons.glyphMap; title: string; copy: string }) { return <View style={styles.emptyCard}><View style={styles.emptyIcon}><Ionicons name={icon} size={25} color="#8051C8" /></View><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.emptyCopy}>{copy}</Text></View>; }
