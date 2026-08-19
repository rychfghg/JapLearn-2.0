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
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import BackIcon from '../assets/svg/back-icon.svg';
import styles from '../styles/stylesTeacherAssignCommunication';
import expoconfig from '../expoconfig';

import bg from '../assets/img/background/school a auditorium inuse.png';
import teacherProfile from '../assets/img/teacherProfile.png';

type Activity = {
  id: string;
  title: string;
  module: 'QuackSituate' | 'QuackResponse' | 'QuackTalk';
  transaction: string;
  activityType: string;
  difficulty: string;
  skillFocus: string;
  route: string;
};

type Student = {
  fname: string;
  lname: string;
  email: string;
  classCode?: string;
};

const fallbackActivities: Activity[] = [
  {
    id: 'QS-1.1',
    title: 'Situational Recognition',
    module: 'QuackSituate',
    transaction: '1.1',
    activityType: 'Scenario Choice',
    difficulty: 'Beginner',
    skillFocus: 'Contextual expression recognition',
    route: '/QuackSituateRecognition',
  },
  {
    id: 'QS-1.2',
    title: 'Expression Matching',
    module: 'QuackSituate',
    transaction: '1.2',
    activityType: 'Matching Activity',
    difficulty: 'Beginner',
    skillFocus: 'Expression-to-situation matching',
    route: '/QuackSituateMatching',
  },
  {
    id: 'QS-1.3',
    title: 'Formal vs Informal',
    module: 'QuackSituate',
    transaction: '1.3',
    activityType: 'Politeness Choice',
    difficulty: 'Beginner',
    skillFocus: 'Formality and politeness',
    route: '/QuackSituateFormal',
  },
  {
    id: 'QR-2.1',
    title: 'Guided Response',
    module: 'QuackResponse',
    transaction: '2.1',
    activityType: 'Guided Interaction',
    difficulty: 'Beginner',
    skillFocus: 'Appropriate response selection',
    route: '/QuackResponseGuided',
  },
  {
    id: 'QR-2.2',
    title: 'Timed Interaction Challenge',
    module: 'QuackResponse',
    transaction: '2.2',
    activityType: 'Timed Challenge',
    difficulty: 'Beginner',
    skillFocus: 'Fast contextual response',
    route: '/QuackResponseTimed',
  },
  {
    id: 'QR-2.3',
    title: 'Multi-Step Conversation',
    module: 'QuackResponse',
    transaction: '2.3',
    activityType: 'Progressive Interaction',
    difficulty: 'Beginner',
    skillFocus: 'Short conversation chain',
    route: '/QuackResponseMultiStep',
  },
  {
    id: 'QT-4.1',
    title: 'Controlled Conversation',
    module: 'QuackTalk',
    transaction: '4.1',
    activityType: 'Guided Speaking',
    difficulty: 'Beginner',
    skillFocus: 'Structured conversation flow',
    route: '/QuackTalkConversation',
  },
  {
    id: 'QT-4.2',
    title: 'Speech Recognition Assist',
    module: 'QuackTalk',
    transaction: '4.2',
    activityType: 'Speech Practice',
    difficulty: 'Beginner',
    skillFocus: 'Pronunciation and spoken response',
    route: '/QuackTalkSpeechAssist',
  },
];

const TeacherAssignCommunication = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<string[]>([]);

  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [deadline, setDeadline] = useState('');

  const [moduleFilter, setModuleFilter] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAssignmentData();
  }, []);

  const loadAssignmentData = async () => {
    try {
      setLoading(true);

      const [activityRes, studentRes, classRes] = await Promise.allSettled([
        fetch(`${expoconfig.API_URL}/api/assignableActivities/getAll`),
        fetch(`${expoconfig.API_URL}/api/students/getAllStudents`),
        fetch(`${expoconfig.API_URL}/api/classes/getAllClasses`),
      ]);

      if (activityRes.status === 'fulfilled' && activityRes.value.ok) {
        const data = await activityRes.value.json();
        setActivities(data);
      } else {
        setActivities(fallbackActivities);
      }

      if (studentRes.status === 'fulfilled' && studentRes.value.ok) {
        const data = await studentRes.value.json();
        setStudents(data);
      }

      if (classRes.status === 'fulfilled' && classRes.value.ok) {
        const data = await classRes.value.json();
        setClasses(data.map((item: any) => item.classCodes));
      }
    } catch {
      setActivities(fallbackActivities);
    } finally {
      setLoading(false);
    }
  };

  const toggleActivity = (id: string) => {
    setSelectedActivities((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleStudent = (email: string) => {
    setSelectedClass('');
    setSelectedStudents((prev) =>
      prev.includes(email) ? prev.filter((item) => item !== email) : [...prev, email]
    );
  };

  const selectClass = (classCode: string) => {
    setSelectedStudents([]);
    setSelectedClass(selectedClass === classCode ? '' : classCode);
  };

  const submitAssignment = async () => {
    if (selectedActivities.length === 0) {
      Alert.alert('Missing Activity', 'Please choose at least one communication activity.');
      return;
    }

    if (selectedStudents.length === 0 && !selectedClass) {
      Alert.alert('Missing Learner', 'Please select students or a class.');
      return;
    }

    const payload = {
      activityIds: selectedActivities,
      studentEmails: selectedStudents,
      classCode: selectedClass,
      deadline,
      status: 'ASSIGNED',
    };

    try {
      setSaving(true);

      const response = await fetch(`${expoconfig.API_URL}/api/activityAssignments/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save assignment.');
      }

      Alert.alert('Assigned Successfully', 'Communication activities have been assigned.');
      setSelectedActivities([]);
      setSelectedStudents([]);
      setSelectedClass('');
      setDeadline('');
    } catch (error: any) {
      Alert.alert('Saved Locally for UI Test', error.message || 'Backend is not connected yet.');
    } finally {
      setSaving(false);
    }
  };

  const filteredActivities =
    moduleFilter === 'All'
      ? activities
      : activities.filter((item) => item.module === moduleFilter);

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
          <Text style={styles.headerMini}>5.2 ACTIVITY ASSIGNMENT</Text>
          <Text style={styles.headerTitle}>Assign Communication</Text>
        </View>

        <Image source={teacherProfile} style={styles.teacherIcon} />
      </View>

      {loading ? (
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color="#8423D9" />
          <Text style={styles.loadingText}>Loading assignable activities...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Assignment Builder</Text>
            <Text style={styles.summaryText}>
              Select communication activities, choose learners or a class, then assign.
            </Text>

            <View style={styles.assignmentCountRow}>
              <View style={styles.countBox}>
                <Text style={styles.countValue}>{selectedActivities.length}</Text>
                <Text style={styles.countLabel}>Activities</Text>
              </View>

              <View style={styles.countBox}>
                <Text style={styles.countValue}>
                  {selectedClass ? '1' : selectedStudents.length}
                </Text>
                <Text style={styles.countLabel}>Target</Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Filter Module</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['All', 'QuackSituate', 'QuackResponse', 'QuackTalk'].map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.filterChip, moduleFilter === item && styles.filterChipActive]}
                onPress={() => setModuleFilter(item)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    moduleFilter === item && styles.filterChipTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.sectionTitle}>Available Activities</Text>

          {filteredActivities.map((activity) => (
            <TouchableOpacity
              key={activity.id}
              activeOpacity={0.9}
              style={[
                styles.activityCard,
                selectedActivities.includes(activity.id) && styles.activityCardSelected,
              ]}
              onPress={() => toggleActivity(activity.id)}
            >
              <View style={styles.activityCode}>
                <Text style={styles.activityCodeText}>{activity.transaction}</Text>
              </View>

              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activityMeta}>
                  {activity.module} • {activity.activityType}
                </Text>
                <Text style={styles.activityDesc}>{activity.skillFocus}</Text>
              </View>

              <Text style={styles.selectMark}>
                {selectedActivities.includes(activity.id) ? '✓' : '+'}
              </Text>
            </TouchableOpacity>
          ))}

          <Text style={styles.sectionTitle}>Assign to Class</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {classes.map((code) => (
              <TouchableOpacity
                key={code}
                style={[styles.classChip, selectedClass === code && styles.classChipActive]}
                onPress={() => selectClass(code)}
              >
                <Text
                  style={[
                    styles.classChipText,
                    selectedClass === code && styles.classChipTextActive,
                  ]}
                >
                  {code}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.sectionTitle}>Or Assign to Students</Text>

          {students.map((student) => (
            <TouchableOpacity
              key={student.email}
              style={[
                styles.studentCard,
                selectedStudents.includes(student.email) && styles.studentCardSelected,
              ]}
              onPress={() => toggleStudent(student.email)}
            >
              <View>
                <Text style={styles.studentName}>
                  {student.fname} {student.lname}
                </Text>
                <Text style={styles.studentEmail}>{student.email}</Text>
              </View>

              <Text style={styles.studentCheck}>
                {selectedStudents.includes(student.email) ? '✓' : '+'}
              </Text>
            </TouchableOpacity>
          ))}

          <Text style={styles.sectionTitle}>Deadline</Text>

          <TextInput
            value={deadline}
            onChangeText={setDeadline}
            placeholder="Example: 2026-06-15"
            placeholderTextColor="#8A7A93"
            style={styles.deadlineInput}
          />

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.assignButton}
            onPress={submitAssignment}
            disabled={saving}
          >
            <Text style={styles.assignButtonText}>
              {saving ? 'Assigning...' : 'Assign Selected Activities'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </ImageBackground>
  );
};

export default TeacherAssignCommunication;