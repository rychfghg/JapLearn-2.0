import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import BackIcon from '../assets/svg/back-icon.svg';
import styles from '../styles/stylesTeacherCommunicationPerformance';
import expoconfig from '../expoconfig';

import bg from '../assets/img/background/school a auditorium inuse.png';
import teacherProfile from '../assets/img/teacherProfile.png';

type Student = {
  fname: string;
  lname: string;
  email: string;
  classCode?: string;
};

type Analytics = {
  quackTalkAccuracy: number;
  quackSituateAccuracy: number;
  quackResponseAccuracy: number;
  completedActivities: number;
  weakAreaCount: number;
  strengths: string[];
  weakAreas: string[];
  recommendation: string;
};

const TeacherCommunicationPerformance = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);

      const response = await fetch(`${expoconfig.API_URL}/api/students/getAllStudents`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch students.');
      }

      setStudents(data);

      if (data.length > 0) {
        setSelectedStudent(data[0]);
        fetchAnalytics(data[0]);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchAnalytics = async (student: Student) => {
    try {
      setLoadingAnalytics(true);
      setSelectedStudent(student);

      const response = await fetch(
        `${expoconfig.API_URL}/api/communicationAnalytics/getStudentAnalytics?email=${student.email}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch communication analytics.');
      }

      setAnalytics(data);
    } catch (error: any) {
      Alert.alert('Error', error.message);
      setAnalytics(null);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const averageAccuracy = analytics
    ? Math.round(
        (analytics.quackTalkAccuracy +
          analytics.quackSituateAccuracy +
          analytics.quackResponseAccuracy) /
          3
      )
    : 0;

  return (
    <ImageBackground source={bg} style={styles.background} resizeMode="cover">
      <View style={styles.overlay} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/TeacherDashboard')}>
          <View style={styles.backButton}>
            <BackIcon width={22} height={22} fill="white" />
          </View>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerMini}>5.1 COMMUNICATION MONITORING</Text>
          <Text style={styles.headerTitle}>Student Performance</Text>
        </View>

        <Image source={teacherProfile} style={styles.teacherIcon} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.studentSelectCard}>
          <Text style={styles.sectionTitleDark}>Select Learner</Text>

          {loadingStudents ? (
            <ActivityIndicator size="small" color="#8423D9" />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {students.map((student) => (
                <TouchableOpacity
                  key={student.email}
                  style={[
                    styles.studentChip,
                    selectedStudent?.email === student.email && styles.studentChipActive,
                  ]}
                  onPress={() => fetchAnalytics(student)}
                >
                  <Text
                    style={[
                      styles.studentChipText,
                      selectedStudent?.email === student.email && styles.studentChipTextActive,
                    ]}
                  >
                    {student.fname}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {loadingAnalytics ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#8423D9" />
            <Text style={styles.loadingText}>Loading communication analytics...</Text>
          </View>
        ) : (
          <>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>
                {selectedStudent
                  ? `${selectedStudent.fname} ${selectedStudent.lname}`
                  : 'No Student Selected'}
              </Text>

              <Text style={styles.summaryText}>
                Communication analytics across QuackTalk, QuackSituate, and QuackResponse.
              </Text>

              <View style={styles.metricsRow}>
                <View style={styles.metricBox}>
                  <Text style={styles.metricValue}>{averageAccuracy}%</Text>
                  <Text style={styles.metricLabel}>Avg Accuracy</Text>
                </View>

                <View style={styles.metricBox}>
                  <Text style={styles.metricValue}>{analytics?.completedActivities || 0}</Text>
                  <Text style={styles.metricLabel}>Completed</Text>
                </View>

                <View style={styles.metricBox}>
                  <Text style={styles.metricValue}>{analytics?.weakAreaCount || 0}</Text>
                  <Text style={styles.metricLabel}>Weak Areas</Text>
                </View>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Module Performance</Text>

            <View style={styles.moduleCard}>
              <Text style={styles.moduleTitle}>QuackTalk</Text>
              <Text style={styles.moduleDesc}>
                Conversational speaking and guided dialogue performance.
              </Text>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${analytics?.quackTalkAccuracy || 0}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {analytics?.quackTalkAccuracy || 0}% conversational accuracy
              </Text>
            </View>

            <View style={styles.moduleCard}>
              <Text style={styles.moduleTitle}>QuackSituate</Text>
              <Text style={styles.moduleDesc}>
                Situational communication and expression matching analytics.
              </Text>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${analytics?.quackSituateAccuracy || 0}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {analytics?.quackSituateAccuracy || 0}% situational accuracy
              </Text>
            </View>

            <View style={styles.moduleCard}>
              <Text style={styles.moduleTitle}>QuackResponse</Text>
              <Text style={styles.moduleDesc}>
                Guided response, timed challenge, and multi-step interaction results.
              </Text>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${analytics?.quackResponseAccuracy || 0}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {analytics?.quackResponseAccuracy || 0}% response accuracy
              </Text>
            </View>

            <Text style={styles.sectionTitle}>Strengths and Weak Areas</Text>

            <View style={styles.studentCard}>
              <Text style={styles.cardHeading}>Learner Strengths</Text>

              {analytics?.strengths?.length ? (
                analytics.strengths.map((item) => (
                  <View key={item} style={styles.studentInfoBox}>
                    <Text style={styles.infoText}>{item}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No strengths recorded yet.</Text>
              )}
            </View>

            <View style={styles.studentCard}>
              <Text style={styles.cardHeading}>Weak Communication Areas</Text>

              {analytics?.weakAreas?.length ? (
                analytics.weakAreas.map((item) => (
                  <View key={item} style={styles.studentInfoBoxWeak}>
                    <Text style={styles.infoText}>{item}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No weak areas recorded yet.</Text>
              )}
            </View>

            <View style={styles.recommendationCard}>
              <Text style={styles.recommendationTitle}>Recommendation</Text>
              <Text style={styles.recommendationText}>
                {analytics?.recommendation ||
                  'No recommendation available. Complete more communication activities first.'}
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </ImageBackground>
  );
};

export default TeacherCommunicationPerformance;