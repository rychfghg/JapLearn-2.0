import React, { useCallback, useContext, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { AuthContext } from '../context/AuthContext';
import TeacherBottomNav from '../components/TeacherBottomNav';
import { teacherStyles as s, teacherTheme as t } from '../styles/stylesTeacherApp';
import {
  completionPercent,
  teacherApi,
  type LessonProgress,
  type TeacherClass,
  type TeacherStudent,
} from '../services/teacherApi';

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

/** Mirrors the Overview page of the web teacher portal. */
export default function TeacherHome() {
  const { user } = useContext(AuthContext);
  const router = useRouter();

  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [students, setStudents] = useState<TeacherStudent[]>([]);
  const [progress, setProgress] = useState<LessonProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const [classList, studentList, progressList] = await Promise.all([
        teacherApi.classes(user),
        teacherApi.students(user),
        teacherApi.lessonProgress(user).catch(() => [] as LessonProgress[]),
      ]);
      setClasses(Array.isArray(classList) ? classList : []);
      setStudents(Array.isArray(studentList) ? studentList : []);
      setProgress(Array.isArray(progressList) ? progressList : []);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Could not load your classroom.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const percentFor = (email: string) =>
    completionPercent(progress.find((item) => item.email?.toLowerCase() === email.toLowerCase()));

  const mastery = students.length
    ? Math.round(students.reduce((sum, student) => sum + percentFor(student.email), 0) / students.length)
    : 0;
  const unassigned = students.filter((student) => !student.classCode).length;
  const initials = `${user?.fname?.[0] ?? ''}${user?.lname?.[0] ?? ''}`.toUpperCase();

  const metrics = [
    { label: 'Active classes', value: classes.length, caption: 'Connected classrooms', icon: 'school-outline' as const, tint: t.brandSoft, color: t.brand, route: '/TeacherClasses' },
    { label: 'Live accounts', value: students.length, caption: 'Enrolled learners', icon: 'people-outline' as const, tint: t.greenSoft, color: t.green, route: '/TeacherStudents' },
    { label: 'Curriculum mastery', value: `${mastery}%`, caption: 'Average lesson progress', icon: 'trending-up-outline' as const, tint: t.blueSoft, color: t.blue, route: '/TeacherClasses' },
    { label: 'Needs a class', value: unassigned, caption: 'Learners without a class', icon: 'alert-circle-outline' as const, tint: t.orangeSoft, color: t.orange, route: '/TeacherStudents' },
  ];

  return (
    <SafeAreaView style={s.screen}>
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }} tintColor={t.brand} />}
      >
        <LinearGradient colors={['#3B1450', '#6B22B4', '#8E34DC']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.header}>
          <View style={s.headerRow}>
            <View style={s.headerAvatar}><Text style={s.headerAvatarText}>{initials || 'T'}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={s.headerKicker}>{greeting().toUpperCase()}</Text>
              <Text style={s.headerName} numberOfLines={1}>{user ? `${user.fname} ${user.lname}` : 'Teacher'}</Text>
            </View>
            <Pressable onPress={() => router.replace('/TeacherProfile')} style={s.headerAction} accessibilityRole="button" accessibilityLabel="Open profile">
              <Ionicons name="person-circle-outline" size={21} color="#FFFFFF" />
            </Pressable>
          </View>
          <Text style={s.headerSub}>Enrollment, lessons, and progress across your classrooms.</Text>
        </LinearGradient>

        {!!error && (
          <View style={[s.notice, s.errorNotice, { marginTop: 16 }]}>
            <Ionicons name="alert-circle-outline" size={17} color={t.danger} />
            <Text style={[s.noticeText, s.errorText]}>{error}</Text>
          </View>
        )}

        <Text style={s.sectionLabel}>CLASSROOM PULSE</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {metrics.map((metric) => (
            <Pressable
              key={metric.label}
              onPress={() => router.replace(metric.route)}
              style={({ pressed }) => [s.statCard, { flexBasis: '47%', flexGrow: 1 }, pressed && s.pressed]}
              accessibilityRole="button"
            >
              <View style={[s.statIcon, { backgroundColor: metric.tint }]}>
                <Ionicons name={metric.icon} size={17} color={metric.color} />
              </View>
              <Text style={s.statValue}>{loading ? '—' : metric.value}</Text>
              <Text style={s.statLabel}>{metric.label}</Text>
              <Text style={[s.statLabel, { fontSize: 10.5, marginTop: 1 }]}>{metric.caption}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={s.sectionLabel}>QUICK START</Text>
        <Pressable onPress={() => router.replace('/TeacherClasses')} style={({ pressed }) => [s.row, pressed && s.pressed]}>
          <View style={s.rowAvatar}><Ionicons name="add-circle-outline" size={20} color={t.brand} /></View>
          <View style={s.rowBody}>
            <Text style={s.rowTitle}>Create a class</Text>
            <Text style={s.rowSub}>Generate a class code students can join with</Text>
          </View>
          <Ionicons name="chevron-forward" size={19} color={t.muted} />
        </Pressable>
        <Pressable onPress={() => router.replace('/TeacherStudents')} style={({ pressed }) => [s.row, pressed && s.pressed]}>
          <View style={[s.rowAvatar, { backgroundColor: t.greenSoft }]}><Ionicons name="person-add-outline" size={19} color={t.green} /></View>
          <View style={s.rowBody}>
            <Text style={s.rowTitle}>Add a learner</Text>
            <Text style={s.rowSub}>Enroll an existing account into a class</Text>
          </View>
          <Ionicons name="chevron-forward" size={19} color={t.muted} />
        </Pressable>
        <Pressable onPress={() => router.replace('/TeacherClasses')} style={({ pressed }) => [s.row, pressed && s.pressed]}>
          <View style={[s.rowAvatar, { backgroundColor: t.blueSoft }]}><Ionicons name="bar-chart-outline" size={19} color={t.blue} /></View>
          <View style={s.rowBody}>
            <Text style={s.rowTitle}>Review class progress</Text>
            <Text style={s.rowSub}>See how each class is moving through lessons</Text>
          </View>
          <Ionicons name="chevron-forward" size={19} color={t.muted} />
        </Pressable>

        <Text style={s.sectionLabel}>CLASS PROGRESS</Text>
        {loading ? (
          <View style={s.empty}><ActivityIndicator color={t.brand} /></View>
        ) : classes.length === 0 ? (
          <View style={[s.card, s.empty]}>
            <Ionicons name="school-outline" size={30} color={t.muted} />
            <Text style={s.emptyTitle}>No classes yet</Text>
            <Text style={s.emptyText}>Create your first class to start tracking progress.</Text>
          </View>
        ) : (
          <View style={s.card}>
            {classes.map((item, index) => {
              const roster = students.filter((student) => student.classCode === item.classCodes);
              const average = roster.length
                ? Math.round(roster.reduce((sum, student) => sum + percentFor(student.email), 0) / roster.length)
                : 0;
              return (
                <View key={item.classCodes} style={{ marginTop: index === 0 ? 0 : 16 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={s.rowTitle} numberOfLines={1}>{item.classTitle || item.classCodes}</Text>
                    <Text style={[s.rowTitle, { color: t.brand }]}>{average}%</Text>
                  </View>
                  <View style={{ height: 8, borderRadius: 5, backgroundColor: '#F0EAF4', overflow: 'hidden' }}>
                    <View style={{ width: `${average}%`, height: '100%', borderRadius: 5, backgroundColor: t.brand }} />
                  </View>
                  <Text style={[s.rowSub, { marginTop: 5 }]}>{roster.length} {roster.length === 1 ? 'learner' : 'learners'} · {item.classCodes}</Text>
                </View>
              );
            })}
          </View>
        )}

        <Text style={s.sectionLabel}>LEARNER SNAPSHOT</Text>
        {loading ? null : students.length === 0 ? (
          <View style={[s.card, s.empty]}>
            <Ionicons name="people-outline" size={30} color={t.muted} />
            <Text style={s.emptyTitle}>No learners yet</Text>
            <Text style={s.emptyText}>Share a class code, or add a learner from the Students tab.</Text>
          </View>
        ) : (
          <>
            {students.slice(0, 5).map((student) => {
              const percent = percentFor(student.email);
              return (
                <View key={student.email} style={s.row}>
                  <View style={s.rowAvatar}>
                    <Text style={s.rowAvatarText}>{`${student.fname?.[0] ?? ''}${student.lname?.[0] ?? ''}`.toUpperCase()}</Text>
                  </View>
                  <View style={s.rowBody}>
                    <Text style={s.rowTitle} numberOfLines={1}>{student.fname} {student.lname}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 5 }}>
                      <View style={{ flex: 1, height: 6, borderRadius: 4, backgroundColor: '#F0EAF4', overflow: 'hidden' }}>
                        <View style={{ width: `${percent}%`, height: '100%', borderRadius: 4, backgroundColor: percent >= 60 ? t.green : t.brand }} />
                      </View>
                      <Text style={s.rowSub}>{percent}%</Text>
                    </View>
                  </View>
                  <View style={[s.chip, !student.classCode && s.chipMuted]}>
                    <Text style={[s.chipText, !student.classCode && s.chipMutedText]}>{student.classCode || 'No class'}</Text>
                  </View>
                </View>
              );
            })}
            {students.length > 5 && (
              <Pressable onPress={() => router.replace('/TeacherStudents')} style={({ pressed }) => [s.ghostButton, pressed && s.pressed]}>
                <Text style={s.ghostText}>See all {students.length} learners</Text>
                <Ionicons name="arrow-forward" size={16} color={t.body} />
              </Pressable>
            )}
          </>
        )}
      </ScrollView>

      <TeacherBottomNav active="home" />
    </SafeAreaView>
  );
}
