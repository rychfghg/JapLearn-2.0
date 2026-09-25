import React, { useCallback, useContext, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
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

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

export default function TeacherStudents() {
  const { user } = useContext(AuthContext);

  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [students, setStudents] = useState<TeacherStudent[]>([]);
  const [progress, setProgress] = useState<LessonProgress[]>([]);
  const [removing, setRemoving] = useState<TeacherStudent | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [classFilter, setClassFilter] = useState('');

  const [addOpen, setAddOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newClass, setNewClass] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saved, setSaved] = useState('');

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
      setError(failure instanceof Error ? failure.message : 'Could not load your learners.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return students.filter((student) => {
      const matchesClass = !classFilter || student.classCode === classFilter;
      const matchesTerm = !term
        || `${student.fname} ${student.lname} ${student.email}`.toLowerCase().includes(term);
      return matchesClass && matchesTerm;
    });
  }, [students, query, classFilter]);

  const addStudent = async () => {
    const email = newEmail.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(email)) {
      setSaveError("Enter the student's full email address.");
      return;
    }
    if (!newClass) {
      setSaveError('Choose the class to add them to.');
      return;
    }
    setSaving(true);
    setSaveError('');
    try {
      await teacherApi.addStudentToClass(user, email, newClass);
      setSaved(`${email} was added to ${newClass}.`);
      setNewEmail('');
      await load();
    } catch {
      // The server answers 404 when the account or class code is not found.
      setSaveError('That student account was not found, or the class code is not yours. Ask the student to create an account first.');
    } finally {
      setSaving(false);
    }
  };

  const closeSheet = () => {
    if (saving) return;
    setAddOpen(false);
    setSaveError('');
    setSaved('');
    setNewEmail('');
  };

  return (
    <SafeAreaView style={s.screen}>
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }} tintColor={t.brand} />}
      >
        <LinearGradient colors={['#3B1450', '#6B22B4', '#8E34DC']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.header}>
          <View style={s.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.headerKicker}>MY CLASSROOM</Text>
              <Text style={s.headerName}>Students</Text>
            </View>
            <Pressable
              onPress={() => { setNewClass(classes[0]?.classCodes ?? ''); setAddOpen(true); }}
              style={s.headerAction}
              accessibilityRole="button"
              accessibilityLabel="Add a student"
            >
              <Ionicons name="person-add-outline" size={19} color="#FFFFFF" />
            </Pressable>
          </View>
          <Text style={s.headerSub}>
            {loading ? 'Loading your learners…' : `${students.length} ${students.length === 1 ? 'learner' : 'learners'} across ${classes.length} ${classes.length === 1 ? 'class' : 'classes'}.`}
          </Text>
        </LinearGradient>

        <View style={{ marginTop: -14 }}>
          <View style={s.search}>
            <Ionicons name="search" size={18} color={t.muted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search by name or email"
              placeholderTextColor="#B6ADBB"
              style={s.searchInput}
              autoCapitalize="none"
            />
            {!!query && (
              <Pressable onPress={() => setQuery('')} hitSlop={8} accessibilityLabel="Clear search">
                <Ionicons name="close-circle" size={18} color={t.muted} />
              </Pressable>
            )}
          </View>

          {classes.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 14 }}>
              <Pressable onPress={() => setClassFilter('')} style={[s.chip, !classFilter ? null : s.chipMuted]}>
                <Text style={[s.chipText, classFilter ? s.chipMutedText : null]}>All classes</Text>
              </Pressable>
              {classes.map((item) => {
                const on = classFilter === item.classCodes;
                return (
                  <Pressable key={item.classCodes} onPress={() => setClassFilter(on ? '' : item.classCodes)} style={[s.chip, on ? null : s.chipMuted]}>
                    <Text style={[s.chipText, on ? null : s.chipMutedText]}>{item.classCodes}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}

          {!!error && (
            <View style={[s.notice, s.errorNotice]}>
              <Ionicons name="alert-circle-outline" size={17} color={t.danger} />
              <Text style={[s.noticeText, s.errorText]}>{error}</Text>
            </View>
          )}

          {loading ? (
            <View style={s.empty}><ActivityIndicator color={t.brand} /></View>
          ) : visible.length === 0 ? (
            <View style={[s.card, s.empty]}>
              <Ionicons name="people-outline" size={30} color={t.muted} />
              <Text style={s.emptyTitle}>{students.length ? 'No matching learners' : 'No learners yet'}</Text>
              <Text style={s.emptyText}>
                {students.length
                  ? 'Try a different name, email, or class.'
                  : 'Share a class code with your students, or add one by email using the button above.'}
              </Text>
            </View>
          ) : (
            visible.map((student) => {
              const percent = completionPercent(
                progress.find((item) => item.email?.toLowerCase() === student.email.toLowerCase()),
              );
              return (
                <View key={student.email} style={s.row}>
                  <View style={s.rowAvatar}>
                    <Text style={s.rowAvatarText}>{`${student.fname?.[0] ?? ''}${student.lname?.[0] ?? ''}`.toUpperCase()}</Text>
                  </View>
                  <View style={s.rowBody}>
                    <Text style={s.rowTitle} numberOfLines={1}>{student.fname} {student.lname}</Text>
                    <Text style={s.rowSub} numberOfLines={1}>{student.email}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
                      <View style={{ flex: 1, height: 6, borderRadius: 4, backgroundColor: '#F0EAF4', overflow: 'hidden' }}>
                        <View style={{ width: `${percent}%`, height: '100%', borderRadius: 4, backgroundColor: percent >= 60 ? t.green : t.brand }} />
                      </View>
                      <Text style={s.rowSub}>{percent}%</Text>
                      <View style={[s.chip, !student.classCode && s.chipMuted]}>
                        <Text style={[s.chipText, !student.classCode && s.chipMutedText]}>{student.classCode || 'No class'}</Text>
                      </View>
                    </View>
                  </View>
                  {!!student.classCode && (
                    <Pressable
                      onPress={() => setRemoving(student)}
                      hitSlop={8}
                      accessibilityLabel={`Remove ${student.fname} from ${student.classCode}`}
                    >
                      <Ionicons name="person-remove-outline" size={19} color={t.danger} />
                    </Pressable>
                  )}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      <TeacherBottomNav active="students" />

      {/* Remove a learner from their class */}
      <Modal visible={!!removing} transparent animationType="fade" onRequestClose={() => setRemoving(null)}>
        <Pressable style={s.sheetBackdrop} onPress={() => !saving && setRemoving(null)} accessibilityLabel="Close">
          <Pressable style={s.sheet} onPress={() => undefined}>
            <View style={s.sheetHandle} />
            <Text style={s.sheetTitle}>Remove {removing?.fname} from {removing?.classCode}?</Text>
            <Text style={s.sheetText}>
              The learner is removed from this class. Their account and learning progress are kept, and they can join again with the class code.
            </Text>
            <Pressable
              onPress={async () => {
                if (!removing?.classCode) return;
                setSaving(true);
                try {
                  await teacherApi.removeStudent(user, removing.classCode, removing);
                  setRemoving(null);
                  await load();
                } catch (failure) {
                  setError(failure instanceof Error ? failure.message : 'The learner could not be removed.');
                  setRemoving(null);
                } finally {
                  setSaving(false);
                }
              }}
              disabled={saving}
              style={({ pressed }) => [s.primaryButton, { backgroundColor: t.danger }, (pressed || saving) && s.pressed]}
            >
              {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={s.primaryText}>Remove from class</Text>}
            </Pressable>
            <Pressable onPress={() => setRemoving(null)} disabled={saving} style={({ pressed }) => [s.ghostButton, { marginTop: 10 }, pressed && s.pressed]}>
              <Text style={s.ghostText}>Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Add a student to a class */}
      <Modal visible={addOpen} transparent animationType="slide" onRequestClose={closeSheet}>
        <Pressable style={s.sheetBackdrop} onPress={closeSheet} accessibilityLabel="Close">
          <Pressable style={s.sheet} onPress={() => undefined}>
            <View style={s.sheetHandle} />
            <Text style={s.sheetTitle}>Add a student</Text>
            <Text style={s.sheetText}>
              The student needs a JapLearn account already. Enter their email and choose the class.
            </Text>

            {classes.length === 0 ? (
              <View style={[s.notice, s.errorNotice]}>
                <Ionicons name="alert-circle-outline" size={17} color={t.danger} />
                <Text style={[s.noticeText, s.errorText]}>Create a class first from the dashboard.</Text>
              </View>
            ) : (
              <>
                <Text style={s.label}>Student email</Text>
                <TextInput
                  value={newEmail}
                  onChangeText={(value) => { setNewEmail(value.replace(/\s/g, '')); setSaveError(''); setSaved(''); }}
                  placeholder="student@example.com"
                  placeholderTextColor="#B6ADBB"
                  style={s.input}
                  autoCapitalize="none"
                  inputMode="email"
                  editable={!saving}
                />

                <Text style={[s.label, { marginTop: 14 }]}>Class</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {classes.map((item) => {
                    const on = newClass === item.classCodes;
                    return (
                      <Pressable key={item.classCodes} onPress={() => setNewClass(item.classCodes)} style={[s.chip, on ? null : s.chipMuted]}>
                        <Text style={[s.chipText, on ? null : s.chipMutedText]}>{item.classCodes}</Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>

                {!!saveError && (
                  <View style={[s.notice, s.errorNotice]}>
                    <Ionicons name="alert-circle-outline" size={17} color={t.danger} />
                    <Text style={[s.noticeText, s.errorText]}>{saveError}</Text>
                  </View>
                )}
                {!!saved && (
                  <View style={s.notice}>
                    <Ionicons name="checkmark-circle-outline" size={18} color={t.green} />
                    <Text style={s.noticeText}>{saved}</Text>
                  </View>
                )}

                <Pressable
                  onPress={addStudent}
                  disabled={saving}
                  style={({ pressed }) => [s.primaryButton, { marginTop: 18 }, (pressed || saving) && s.pressed]}
                >
                  {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={s.primaryText}>Add to class</Text>}
                </Pressable>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
