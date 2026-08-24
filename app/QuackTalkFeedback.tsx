import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
import BackIcon from '../assets/svg/back-icon.svg';
import { AuthContext } from '../context/AuthContext';
import expoconfig from '../expoconfig';
import styles from '../styles/stylesQuackTalkFeedback';

type HistoryItem = {
  title: string;
  score: number;
};

type AnalyticsData = {
  weakAreas?: string[];
  repeatedMistakes?: string[];
  history?: HistoryItem[];
};

type Tab = 'overview' | 'focus' | 'history';

const background = require('../assets/img/background/clubroom a st2 day.png');
const sumi = require('../assets/img/Sumi_PoseB_WinterUni_Smile_Blush.png');

const feedbackTabs: Array<{
  key: Tab;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = [
  { key: 'overview', label: 'Summary', icon: 'grid-outline' },
  { key: 'focus', label: 'Coach notes', icon: 'sparkles-outline' },
  { key: 'history', label: 'Sessions', icon: 'time-outline' },
];

export default function QuackTalkFeedback() {
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const { user } = useContext(AuthContext);
  const [tab, setTab] = useState<Tab>('overview');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const cameFromConversation = returnTo === 'conversation';
  const cameFromSpeaking = returnTo === 'speaking';
  const returnRoute = cameFromConversation
    ? '/QuackTalkConversation'
    : cameFromSpeaking
      ? '/QuackTalkSpeech'
      : '/QuackTalk';
  const roomName = cameFromConversation
    ? 'Talk with Sumi'
    : cameFromSpeaking
      ? 'Voice Practice'
      : 'QuackTalk';

  useEffect(() => {
    let active = true;

    const loadFeedback = async () => {
      if (!user?.email) {
        setLoading(false);
        setLoadError('Sign in to view your saved activity history.');
        return;
      }

      try {
        setLoading(true);
        setLoadError('');

        const response = await fetch(
          `${expoconfig.API_URL}/api/quackProgress/analytics?email=${encodeURIComponent(user.email)}`,
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Feedback history could not be loaded.');
        }

        if (active) {
          setAnalytics(data);
        }
      } catch (error) {
        if (active) {
          setLoadError(
            error instanceof Error ? error.message : 'Feedback history could not be loaded.',
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadFeedback();

    return () => {
      active = false;
    };
  }, [user?.email]);

  const talkHistory = useMemo(() => {
    return (analytics?.history ?? []).filter((item) => {
      return /quacktalk|speaking|speech|conversation/i.test(item.title);
    });
  }, [analytics?.history]);

  const emptyCard = (icon: keyof typeof Ionicons.glyphMap, title: string, copy: string) => (
    <View style={styles.emptyCard}>
      <View style={styles.emptyIcon}>
        <Ionicons name={icon} size={25} color="#8051C8" />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyCopy}>{copy}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground source={background} style={styles.background} resizeMode="cover">
        <View style={styles.overlay} />

        <View style={styles.header}>
          <Pressable onPress={() => router.replace(returnRoute)} style={styles.backButton}>
            <BackIcon width={18} height={18} fill="#462A5E" />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.headerEyebrow}>SUMI'S SPEAKING COACH</Text>
            <Text style={styles.headerTitle}>Practice review</Text>
          </View>
          <View style={styles.roomBadge}>
            <Ionicons name="mic" size={14} color="#8051C8" />
            <Text style={styles.roomBadgeText}>{roomName}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.coachCard}>
            <View style={styles.heroOrbLarge} />
            <View style={styles.heroOrbSmall} />
            <Image source={sumi} style={styles.sumi} resizeMode="contain" />
            <View style={styles.coachCopy}>
              <View style={styles.coachKickerRow}>
                <View style={styles.liveDot} />
                <Text style={styles.coachKicker}>YOUR VOICE JOURNEY</Text>
              </View>
              <Text style={styles.coachTitle}>Review, reflect, and speak with confidence.</Text>
              <Text style={styles.coachText}>
                Your real speaking feedback and completed sessions will be organized here as listening analysis becomes available.
              </Text>
              <View style={styles.heroStatus}>
                <Ionicons name="shield-checkmark-outline" size={15} color="#5DAE38" />
                <Text style={styles.heroStatusText}>Only evaluated sessions become scores</Text>
              </View>
            </View>
          </View>

          <View style={styles.tabs}>
            {feedbackTabs.map((item) => (
              <Pressable
                key={item.key}
                onPress={() => setTab(item.key)}
                style={[styles.tab, tab === item.key && styles.activeTab]}
              >
                <Ionicons
                  name={item.icon}
                  size={17}
                  color={tab === item.key ? '#FFFFFF' : '#8E8093'}
                />
                <Text style={[styles.tabText, tab === item.key && styles.activeTabText]}>
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {loading ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator color="#8051C8" size="large" />
              <Text style={styles.loadingText}>Checking saved progress…</Text>
            </View>
          ) : loadError ? (
            emptyCard('cloud-offline-outline', 'History is unavailable', loadError)
          ) : null}

          {!loading && !loadError && tab === 'overview' && (
            <>
              <View style={styles.sectionHeading}>
                <View>
                  <Text style={styles.sectionKicker}>CURRENT STATUS</Text>
                  <Text style={styles.sectionTitle}>Your speaking workspace</Text>
                </View>
                <View style={styles.readyBadge}>
                  <View style={styles.readyDot} />
                  <Text style={styles.readyText}>READY</Text>
                </View>
              </View>

              <View style={styles.statusGrid}>
                <View style={[styles.featureCard, styles.featureCardPurple]}>
                  <View style={styles.featureIconPurple}>
                    <Ionicons name="mic-outline" size={22} color="#8051C8" />
                  </View>
                  <Text style={styles.featureKicker}>AVAILABLE NOW</Text>
                  <Text style={styles.featureTitle}>Voice recording</Text>
                  <Text style={styles.featureText}>Test your microphone and rehearse naturally with Sumi.</Text>
                </View>
                <View style={[styles.featureCard, styles.featureCardPink]}>
                  <View style={styles.featureIconPink}>
                    <Ionicons name="waveform-outline" size={22} color="#D64D82" />
                  </View>
                  <Text style={styles.featureKickerPink}>COMING SOON</Text>
                  <Text style={styles.featureTitle}>Voice evaluation</Text>
                  <Text style={styles.featureText}>Pronunciation, transcription, and coaching notes will appear here.</Text>
                </View>
              </View>
              <Pressable style={styles.primaryAction} onPress={() => router.replace(returnRoute)}>
                <View style={styles.primaryActionIcon}>
                  <Ionicons name="mic" size={19} color="#8051C8" />
                </View>
                <View style={styles.primaryActionCopy}>
                  <Text style={styles.primaryActionLabel}>CONTINUE PRACTICING</Text>
                  <Text style={styles.primaryActionText}>Return to {roomName}</Text>
                </View>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </Pressable>
            </>
          )}

          {!loading && !loadError && tab === 'focus' && (
            <>
              {(analytics?.repeatedMistakes?.length ?? 0) > 0 ? (
                <View style={styles.dataCard}>
                  <Text style={styles.dataTitle}>Saved speaking notes</Text>
                  {analytics?.repeatedMistakes?.map((item, index) => (
                    <View key={`${item}-${index}`} style={styles.noteRow}>
                      <View style={styles.noteNumber}>
                        <Text style={styles.noteNumberText}>{index + 1}</Text>
                      </View>
                      <Text style={styles.noteText}>{item}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                emptyCard(
                  'sparkles-outline',
                  'No evaluated speaking notes yet',
                  'This section will use real evaluation results when the listening service is available.',
                )
              )}
            </>
          )}

          {!loading && !loadError && tab === 'history' && (
            <>
              {talkHistory.length > 0 ? (
                <View style={styles.dataCard}>
                  <Text style={styles.dataTitle}>QuackTalk history</Text>
                  {talkHistory.map((item, index) => (
                    <View key={`${item.title}-${index}`} style={styles.historyRow}>
                      <View style={styles.historyIcon}>
                        <Ionicons name="chatbubbles-outline" size={18} color="#8051C8" />
                      </View>
                      <Text style={styles.historyTitle}>{item.title}</Text>
                      <Text style={styles.historyScore}>{item.score}%</Text>
                    </View>
                  ))}
                </View>
              ) : (
                emptyCard(
                  'time-outline',
                  'No QuackTalk history yet',
                  'Only real evaluated sessions will be listed here. Microphone tests are not recorded as scores.',
                )
              )}
            </>
          )}

          <Pressable style={styles.progressLink} onPress={() => router.push('/QuackProgress')}>
            <View style={styles.progressIcon}>
              <Ionicons name="analytics-outline" size={20} color="#5DAE38" />
            </View>
            <View style={styles.progressCopy}>
              <Text style={styles.progressTitle}>Complete progress report</Text>
              <Text style={styles.progressText}>Open QuackProgress for all saved learning and game records.</Text>
            </View>
            <Ionicons name="arrow-forward" size={19} color="#5DAE38" />
          </Pressable>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}
