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
const sumi = require('../assets/img/Sumi_PoseB_WinterUni_EyesClosed_Smile.png');

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
          <View style={styles.headerIcon}>
            <Ionicons name="analytics" size={19} color="#8051C8" />
          </View>
          <View style={styles.headerCopy}>
            <Text style={styles.headerEyebrow}>{roomName.toUpperCase()}</Text>
            <Text style={styles.headerTitle}>Feedback studio</Text>
          </View>
          <View style={styles.soonBadge}>
            <View style={styles.soonDot} />
            <Text style={styles.soonText}>AI SOON</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.coachCard}>
            <Image source={sumi} style={styles.sumi} resizeMode="contain" />
            <View style={styles.coachCopy}>
              <Text style={styles.coachKicker}>SUMI'S REVIEW</Text>
              <Text style={styles.coachTitle}>Your speaking journey, clearly organized.</Text>
              <Text style={styles.coachText}>
                Real evaluated results and session history will appear here when listening analysis is available.
              </Text>
            </View>
          </View>

          <View style={styles.tabs}>
            {(['overview', 'focus', 'history'] as Tab[]).map((item) => (
              <Pressable
                key={item}
                onPress={() => setTab(item)}
                style={[styles.tab, tab === item && styles.activeTab]}
              >
                <Text style={[styles.tabText, tab === item && styles.activeTabText]}>
                  {item === 'overview' ? 'Overview' : item === 'focus' ? 'Focus' : 'History'}
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
              <View style={styles.statusCard}>
                <View style={styles.statusIcon}>
                  <Ionicons name="mic-outline" size={23} color="#D64D82" />
                </View>
                <View style={styles.statusCopy}>
                  <Text style={styles.statusLabel}>MICROPHONE READY</Text>
                  <Text style={styles.statusTitle}>Practice recording is available</Text>
                  <Text style={styles.statusText}>
                    You can test your microphone now. Transcription, pronunciation analysis, and scoring are not active yet.
                  </Text>
                </View>
              </View>
              <Pressable style={styles.primaryAction} onPress={() => router.replace(returnRoute)}>
                <Ionicons name="mic" size={19} color="#FFFFFF" />
                <Text style={styles.primaryActionText}>Return to {roomName}</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
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
              <Text style={styles.progressTitle}>Open QuackProgress</Text>
              <Text style={styles.progressText}>View your currently saved game and learning records.</Text>
            </View>
            <Ionicons name="arrow-forward" size={19} color="#5DAE38" />
          </Pressable>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}
