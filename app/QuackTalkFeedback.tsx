import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Image,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import BackIcon from '../assets/svg/back-icon.svg';
import styles from '../styles/stylesQuackTalkFeedback';

import bgLibrary from '../assets/img/background/clubroom a st2 day.png';
import sumiClosed from '../assets/img/Sumi_PoseB_WinterUni_EyesClosed_Smile.png';

const feedbackData = {
  accuracy: 84,
  contextual: 88,
  politeness: 91,
  mastery: 'Beginner Conversation Flow',
  strongest: 'Polite greetings and thanking responses',
  improvement: 'Long-vowel pronunciation and apology expressions',
  repeatedMistakes: [
    'Confusing 「すみません」 with thanking situations',
    'Shortening long vowel sounds in 「教室」',
    'Using casual phrases with teacher scenarios',
  ],
  weakAreas: [
    'Classroom conversation',
    'Polite interaction responses',
    'Direction asking phrases',
  ],
  history: [
    { title: 'Greeting Conversation', score: '92%' },
    { title: 'Self-Introduction Conversation', score: '85%' },
    { title: 'Classroom Interaction', score: '76%' },
  ],
};

const QuackTalkFeedback = () => {
  const [tab, setTab] = useState<'dashboard' | 'patterns' | 'history'>('dashboard');

  return (
    <ImageBackground source={bgLibrary} style={styles.background} resizeMode="cover">
      <View style={styles.overlay} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/QuackTalk')}>
          <View style={styles.backButton}>
            <BackIcon width={22} height={22} fill="white" />
          </View>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerMini}>4.3 PERFORMANCE REVIEW</Text>
          <Text style={styles.headerTitle}>Feedback Report</Text>
        </View>

        <View style={styles.scoreBadge}>
          <Text style={styles.scoreBadgeText}>{feedbackData.accuracy}%</Text>
        </View>
      </View>

      <View style={styles.profilePanel}>
        <Image source={sumiClosed} style={styles.sumiImage} />

        <View style={styles.profileTextBox}>
          <Text style={styles.profileTitle}>Conversation Analytics</Text>
          <Text style={styles.profileSubtitle}>
            Review your guided speaking progress, repeated mistakes, and mastery status.
          </Text>
        </View>
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabButton, tab === 'dashboard' && styles.tabActive]}
          onPress={() => setTab('dashboard')}
        >
          <Text style={[styles.tabText, tab === 'dashboard' && styles.tabTextActive]}>
            Feedback
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, tab === 'patterns' && styles.tabActive]}
          onPress={() => setTab('patterns')}
        >
          <Text style={[styles.tabText, tab === 'patterns' && styles.tabTextActive]}>
            Patterns
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, tab === 'history' && styles.tabActive]}
          onPress={() => setTab('history')}
        >
          <Text style={[styles.tabText, tab === 'history' && styles.tabTextActive]}>
            History
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
        {tab === 'dashboard' && (
          <>
            <View style={styles.reportCard}>
              <Text style={styles.cardTitle}>Conversation Accuracy</Text>
              <Text style={styles.bigScore}>{feedbackData.accuracy}%</Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${feedbackData.accuracy}%` }]} />
              </View>
              <Text style={styles.cardText}>
                You are responding correctly in most guided conversation situations.
              </Text>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.smallMetricCard}>
                <Text style={styles.metricLabel}>Context</Text>
                <Text style={styles.metricValue}>{feedbackData.contextual}%</Text>
                <Text style={styles.metricNote}>Appropriate usage</Text>
              </View>

              <View style={styles.smallMetricCard}>
                <Text style={styles.metricLabel}>Politeness</Text>
                <Text style={styles.metricValue}>{feedbackData.politeness}%</Text>
                <Text style={styles.metricNote}>Formality control</Text>
              </View>
            </View>

            <View style={styles.reportCard}>
              <Text style={styles.cardTitle}>AI-Assisted Feedback Summary</Text>
              <Text style={styles.cardText}>
                Your responses show improving beginner conversation flow. You are strongest in
                greeting and thanking situations, but should reinforce classroom and apology usage.
              </Text>
            </View>

            <View style={styles.reportCard}>
              <Text style={styles.cardTitle}>Mastery Status</Text>
              <Text style={styles.masteryText}>{feedbackData.mastery}</Text>
              <Text style={styles.cardText}>
                Continue practicing short guided conversations to unlock stronger fluency tracking.
              </Text>
            </View>
          </>
        )}

        {tab === 'patterns' && (
          <>
            <View style={styles.reportCard}>
              <Text style={styles.cardTitle}>Repeated Mistakes</Text>

              {feedbackData.repeatedMistakes.map((item, index) => (
                <View key={item} style={styles.listItem}>
                  <Text style={styles.listNumber}>{index + 1}</Text>
                  <Text style={styles.listText}>{item}</Text>
                </View>
              ))}
            </View>

            <View style={styles.reportCard}>
              <Text style={styles.cardTitle}>Weak Areas</Text>

              {feedbackData.weakAreas.map((item) => (
                <View key={item} style={styles.warningPill}>
                  <Text style={styles.warningText}>{item}</Text>
                </View>
              ))}
            </View>

            <View style={styles.reportCard}>
              <Text style={styles.cardTitle}>Recommendation</Text>
              <Text style={styles.cardText}>
                Retry reinforcement conversation activities focused on apology responses,
                direction asking, and teacher-level politeness.
              </Text>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/QuackTalkConversation')}
              >
                <Text style={styles.actionButtonText}>Retry Conversation</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {tab === 'history' && (
          <>
            <View style={styles.reportCard}>
              <Text style={styles.cardTitle}>Conversation History</Text>

              {feedbackData.history.map((item) => (
                <View key={item.title} style={styles.historyRow}>
                  <Text style={styles.historyTitle}>{item.title}</Text>
                  <Text style={styles.historyScore}>{item.score}</Text>
                </View>
              ))}
            </View>

            <View style={styles.reportCard}>
              <Text style={styles.cardTitle}>Overall Performance</Text>
              <Text style={styles.cardText}>Strongest Area: {feedbackData.strongest}</Text>
              <Text style={styles.cardText}>Needs Practice: {feedbackData.improvement}</Text>
            </View>

            <TouchableOpacity
              style={styles.bottomAction}
              onPress={() => router.replace('/QuackTalk')}
            >
              <Text style={styles.bottomActionText}>Continue Learning</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </ImageBackground>
  );
};

export default QuackTalkFeedback;