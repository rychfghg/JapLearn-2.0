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
import styles from '../styles/stylesTeacherCommunicationReports';
import expoconfig from '../expoconfig';

import bg from '../assets/img/background/school a auditorium inuse.png';
import teacherProfile from '../assets/img/teacherProfile.png';

type Student = {
  fname: string;
  lname: string;
  email: string;
  classCode?: string;
};

type Report = {
  studentEmail: string;
  completionRate: number;
  masteryProgress: number;
  reinforcementCompleted: number;
  repeatedMistakes: string[];
  masteryHistory: {
    stage: string;
    status: string;
    score: number;
  }[];
  generatedDate?: string;
};

const TeacherCommunicationReports = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);
  const [exporting, setExporting] = useState(false);

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
        fetchReport(data[0]);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchReport = async (student: Student) => {
    try {
      setLoadingReport(true);
      setSelectedStudent(student);

      const response = await fetch(
        `${expoconfig.API_URL}/api/communicationReports/getStudentReport?email=${student.email}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'No communication report found.');
      }

      setReport(data);
    } catch {
      setReport(null);
    } finally {
      setLoadingReport(false);
    }
  };

  const generateReport = async () => {
    if (!selectedStudent) {
      Alert.alert('No Student', 'Please select a student first.');
      return;
    }

    try {
      setLoadingReport(true);

      const response = await fetch(`${expoconfig.API_URL}/api/communicationReports/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: selectedStudent.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate report.');
      }

      setReport(data);
      Alert.alert('Report Generated', 'Communication progress report is ready.');
    } catch (error: any) {
      Alert.alert('Backend Not Ready', error.message);
    } finally {
      setLoadingReport(false);
    }
  };

  const exportReport = async () => {
    if (!selectedStudent) return;

    try {
      setExporting(true);

      const response = await fetch(
        `${expoconfig.API_URL}/api/communicationReports/export?email=${selectedStudent.email}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new Error('Failed to export report.');
      }

      Alert.alert('Export Ready', 'Report export request was completed.');
    } catch (error: any) {
      Alert.alert('Export Failed', error.message);
    } finally {
      setExporting(false);
    }
  };

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
          <Text style={styles.headerMini}>5.3 COMMUNICATION REPORTS</Text>
          <Text style={styles.headerTitle}>Progress Reports</Text>
        </View>

        <Image source={teacherProfile} style={styles.teacherIcon} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.selectorCard}>
          <Text style={styles.sectionTitleDark}>Select Learner</Text>

          {loadingStudents ? (
            <ActivityIndicator color="#8423D9" />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {students.map((student) => (
                <TouchableOpacity
                  key={student.email}
                  style={[
                    styles.studentChip,
                    selectedStudent?.email === student.email && styles.studentChipActive,
                  ]}
                  onPress={() => fetchReport(student)}
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

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>
            {selectedStudent
              ? `${selectedStudent.fname} ${selectedStudent.lname}`
              : 'No Student Selected'}
          </Text>

          <Text style={styles.summaryText}>
            Generate learner communication progress reports with completion rates,
            reinforcement records, repeated mistakes, and mastery history.
          </Text>

          <TouchableOpacity style={styles.generateButton} onPress={generateReport}>
            <Text style={styles.generateButtonText}>Generate Report</Text>
          </TouchableOpacity>
        </View>

        {loadingReport ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#8423D9" />
            <Text style={styles.loadingText}>Retrieving communication records...</Text>
          </View>
        ) : !report ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No Report Data</Text>
            <Text style={styles.emptyText}>
              This learner has no available communication progress records yet.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.metricsRow}>
              <View style={styles.metricBox}>
                <Text style={styles.metricValue}>{report.completionRate}%</Text>
                <Text style={styles.metricLabel}>Completion</Text>
              </View>

              <View style={styles.metricBox}>
                <Text style={styles.metricValue}>{report.masteryProgress}%</Text>
                <Text style={styles.metricLabel}>Mastery</Text>
              </View>

              <View style={styles.metricBox}>
                <Text style={styles.metricValue}>{report.reinforcementCompleted}</Text>
                <Text style={styles.metricLabel}>Reinforced</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Completion Rate</Text>

            <View style={styles.reportCard}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${report.completionRate}%` }]} />
              </View>
              <Text style={styles.cardText}>
                Learner completed {report.completionRate}% of assigned communication activities.
              </Text>
            </View>

            <Text style={styles.sectionTitle}>Repeated Mistakes</Text>

            <View style={styles.reportCard}>
              {report.repeatedMistakes?.length ? (
                report.repeatedMistakes.map((item, index) => (
                  <View key={`${item}-${index}`} style={styles.mistakeBox}>
                    <Text style={styles.mistakeNumber}>{index + 1}</Text>
                    <Text style={styles.mistakeText}>{item}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.cardText}>No repeated mistakes recorded.</Text>
              )}
            </View>

            <Text style={styles.sectionTitle}>Mastery Progression History</Text>

            <View style={styles.reportCard}>
              {report.masteryHistory?.length ? (
                report.masteryHistory.map((item) => (
                  <View key={item.stage} style={styles.historyRow}>
                    <View>
                      <Text style={styles.historyStage}>{item.stage}</Text>
                      <Text style={styles.historyStatus}>{item.status}</Text>
                    </View>

                    <Text style={styles.historyScore}>{item.score}%</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.cardText}>No mastery history available.</Text>
              )}
            </View>

            <TouchableOpacity style={styles.exportButton} onPress={exportReport} disabled={exporting}>
              <Text style={styles.exportButtonText}>
                {exporting ? 'Exporting...' : 'Export Generated Report'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </ImageBackground>
  );
};

export default TeacherCommunicationReports;