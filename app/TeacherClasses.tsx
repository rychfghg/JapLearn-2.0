import React, { useCallback, useContext, useState } from 'react';
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

export default function TeacherClasses() {
  const { user } = useContext(AuthContext);

  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [students, setStudents] = useState<TeacherStudent[]>([]);
  const [progress, setProgress] = useState<LessonProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [className, setClassName] = useState('');
  const [created, setCreated] = useState('');

  const [openClass, setOpenClass] = useState<TeacherClass | null>(null);
  const [roster, setRoster] = useState<TeacherStudent[]>([]);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [joinEmail, setJoinEmail] = useState('');

  const [confirm, setConfirm] = useState<{ kind: 'class'; code: string } | { kind: 'student'; student: TeacherStudent; code: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [sheetError, setSheetError] = useState('');
  const [sheetDone, setSheetDone] = useState('');

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
      setError(failure instanceof Error ? failure.message : 'Could not load your classes.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const classAverage = (code: string) => {
    const emails = students.filter((student) => student.classCode === code).map((student) => student.email.toLowerCase());
    if (!emails.length) return 0;
    const total = emails.reduce((sum, email) => {
      const record = progress.find((item) => item.email?.toLowerCase() === email);
      return sum + completionPercent(record);
    }, 0);
    return Math.round(total / emails.length);
  };

  const openRoster = async (item: TeacherClass) => {
    setOpenClass(item);
    setRosterLoading(true);
    setSheetError('');
    setSheetDone('');
    setJoinEmail('');
    try {
      const list = await teacherApi.studentsByClass(user, item.classCodes);
      setRoster(Array.isArray(list) ? list : []);
    } catch {
      setRoster(students.filter((student) => student.classCode === item.classCodes));
    } finally {
      setRosterLoading(false);
    }
  };

  const createClass = async () => {
    const title = className.trim();
    if (!title) { setSheetError('Enter a name for the class, such as Nihongo 1.'); return; }
    setBusy(true); setSheetError('');
    try {
      const newClass = await teacherApi.addClass(user, title);
      setCreated(newClass?.classCodes || '');
      setClassName('');
      await load();
    } catch (failure) {
      setSheetError(failure instanceof Error ? failure.message : 'The class could not be created.');
    } finally { setBusy(false); }
  };

  const joinStudent = async () => {
    if (!openClass) return;
    const email = joinEmail.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(email)) { setSheetError("Enter the student's full email address."); return; }
    setBusy(true); setSheetError(''); setSheetDone('');
    try {
      await teacherApi.addStudentToClass(user, email, openClass.classCodes);
      setSheetDone(`${email} was added to ${openClass.classCodes}.`);
      setJoinEmail('');
      await openRosterRefresh();
      await load();
    } catch {
      setSheetError('That student account was not found. Ask them to create an account first.');
    } finally { setBusy(false); }
  };

  const openRosterRefresh = async () => {
    if (!openClass) return;
    try {
      const list = await teacherApi.studentsByClass(user, openClass.classCodes);
      setRoster(Array.isArray(list) ? list : []);
    } catch {
      // Keep the list already on screen.
    }
  };

  const runRemoval = async () => {
    if (!confirm) return;
    setBusy(true); setSheetError('');
    try {
      if (confirm.kind === 'class') {
        await teacherApi.removeClass(user, confirm.code);
        setOpenClass(null);
      } else {
        await teacherApi.removeStudent(user, confirm.code, confirm.student);
        await openRosterRefresh();
      }
      setConfirm(null);
      await load();
    } catch (failure) {
      setSheetError(failure instanceof Error ? failure.message : 'That could not be removed.');
    } finally { setBusy(false); }
  };

  const closeCreate = () => { if (busy) return; setCreateOpen(false); setCreated(''); setClassName(''); setSheetError(''); };

  return (
    <SafeAreaView style={s.screen}>
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }} tintColor={t.brand} />}
      >
        <LinearGradient colors={['#3B1450', '#6B22B4', '#8E34DC']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.header}>
          <View style={s.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.headerKicker}>MY CLASSROOM</Text>
              <Text style={s.headerName}>Classes</Text>
            </View>
            <Pressable
              onPress={() => { setSheetError(''); setCreateOpen(true); }}
              style={s.headerAction}
              accessibilityRole="button"
              accessibilityLabel="New class"
            >
              <Ionicons name="add" size={22} color="#FFFFFF" />
            </Pressable>
          </View>
          <Text style={s.headerSub}>
            {loading ? 'Loading your classes…' : `${classes.length} ${classes.length === 1 ? 'class' : 'classes'}. Tap one to manage its learners.`}
          </Text>
        </LinearGradient>

        {!!error && (
          <View style={[s.notice, s.errorNotice, { marginTop: 16 }]}>
            <Ionicons name="alert-circle-outline" size={17} color={t.danger} />
            <Text style={[s.noticeText, s.errorText]}>{error}</Text>
          </View>
        )}

        <View style={{ marginTop: 18 }}>
          {loading ? (
            <View style={s.empty}><ActivityIndicator color={t.brand} /></View>
          ) : classes.length === 0 ? (
            <View style={[s.card, s.empty]}>
              <Ionicons name="school-outline" size={30} color={t.muted} />
              <Text style={s.emptyTitle}>No classes yet</Text>
              <Text style={s.emptyText}>Create a class, then share its code so students can join from their app.</Text>
              <Pressable onPress={() => setCreateOpen(true)} style={({ pressed }) => [s.primaryButton, { marginTop: 16, paddingHorizontal: 22 }, pressed && s.pressed]}>
                <Ionicons name="add" size={18} color="#FFFFFF" />
                <Text style={s.primaryText}>New class</Text>
              </Pressable>
            </View>
          ) : (
            classes.map((item) => {
              const count = students.filter((student) => student.classCode === item.classCodes).length;
              const average = classAverage(item.classCodes);
              return (
                <Pressable key={item.classCodes} onPress={() => openRoster(item)} style={({ pressed }) => [s.card, { marginBottom: 10 }, pressed && s.pressed]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={s.rowAvatar}><Ionicons name="school" size={19} color={t.brand} /></View>
                    <View style={s.rowBody}>
                      <Text style={s.rowTitle} numberOfLines={1}>{item.classTitle || item.classCodes}</Text>
                      <Text style={s.rowSub}>{count} {count === 1 ? 'learner' : 'learners'}</Text>
                    </View>
                    <View style={s.chip}><Text style={s.chipText}>{item.classCodes}</Text></View>
                  </View>

                  <View style={{ marginTop: 14 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                      <Text style={s.rowSub}>Lesson progress</Text>
                      <Text style={[s.rowSub, { color: t.brand, fontWeight: '700' }]}>{average}%</Text>
                    </View>
                    <View style={{ height: 7, borderRadius: 5, backgroundColor: '#F0EAF4', overflow: 'hidden' }}>
                      <View style={{ width: `${average}%`, height: '100%', borderRadius: 5, backgroundColor: t.brand }} />
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
                    <Pressable onPress={() => openRoster(item)} style={({ pressed }) => [s.ghostButton, { flex: 1 }, pressed && s.pressed]}>
                      <Ionicons name="people-outline" size={17} color={t.body} />
                      <Text style={s.ghostText}>Manage learners</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => { setSheetError(''); setConfirm({ kind: 'class', code: item.classCodes }); }}
                      style={({ pressed }) => [s.ghostButton, { width: 52, backgroundColor: t.dangerSoft, borderColor: '#F3D9DD' }, pressed && s.pressed]}
                      accessibilityLabel={`Delete class ${item.classCodes}`}
                    >
                      <Ionicons name="trash-outline" size={18} color={t.danger} />
                    </Pressable>
                  </View>
                </Pressable>
              );
            })
          )}
        </View>
      </ScrollView>

      <TeacherBottomNav active="classes" />

      {/* Create a class */}
      <Modal visible={createOpen} transparent animationType="slide" onRequestClose={closeCreate}>
        <Pressable style={s.sheetBackdrop} onPress={closeCreate} accessibilityLabel="Close">
          <Pressable style={s.sheet} onPress={() => undefined}>
            <View style={s.sheetHandle} />
            <Text style={s.sheetTitle}>New class</Text>
            <Text style={s.sheetText}>Name the class. JapLearn creates the code your students use to join.</Text>

            {created ? (
              <>
                <View style={s.notice}>
                  <Ionicons name="checkmark-circle-outline" size={18} color={t.green} />
                  <Text style={s.noticeText}>Class created. Share this code with your students.</Text>
                </View>
                <View style={[s.card, { alignItems: 'center', marginTop: 14 }]}>
                  <Text style={s.cardText}>CLASS CODE</Text>
                  <Text style={{ fontFamily: 'Jua', fontSize: 26, color: t.brand, letterSpacing: 2, marginTop: 4 }}>{created}</Text>
                </View>
                <Pressable onPress={closeCreate} style={({ pressed }) => [s.primaryButton, { marginTop: 18 }, pressed && s.pressed]}>
                  <Text style={s.primaryText}>Done</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={s.label}>Class name</Text>
                <TextInput
                  value={className}
                  onChangeText={(value) => { setClassName(value); setSheetError(''); }}
                  placeholder="Nihongo 1 · Section A"
                  placeholderTextColor="#B6ADBB"
                  style={s.input}
                  editable={!busy}
                  autoFocus
                />
                {!!sheetError && (
                  <View style={[s.notice, s.errorNotice]}>
                    <Ionicons name="alert-circle-outline" size={17} color={t.danger} />
                    <Text style={[s.noticeText, s.errorText]}>{sheetError}</Text>
                  </View>
                )}
                <Pressable onPress={createClass} disabled={busy} style={({ pressed }) => [s.primaryButton, { marginTop: 18 }, (pressed || busy) && s.pressed]}>
                  {busy ? <ActivityIndicator color="#FFFFFF" /> : <Text style={s.primaryText}>Create class</Text>}
                </Pressable>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Class roster: add and remove learners */}
      <Modal visible={!!openClass} transparent animationType="slide" onRequestClose={() => setOpenClass(null)}>
        <Pressable style={s.sheetBackdrop} onPress={() => !busy && setOpenClass(null)} accessibilityLabel="Close">
          <Pressable style={[s.sheet, { maxHeight: '86%' }]} onPress={() => undefined}>
            <View style={s.sheetHandle} />
            <Text style={s.sheetTitle} numberOfLines={1}>{openClass?.classTitle || openClass?.classCodes}</Text>
            <Text style={s.sheetText}>Class code {openClass?.classCodes} · {roster.length} {roster.length === 1 ? 'learner' : 'learners'}</Text>

            <Text style={s.label}>Add a learner by email</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TextInput
                value={joinEmail}
                onChangeText={(value) => { setJoinEmail(value.replace(/\s/g, '')); setSheetError(''); setSheetDone(''); }}
                placeholder="student@example.com"
                placeholderTextColor="#B6ADBB"
                style={[s.input, { flex: 1 }]}
                autoCapitalize="none"
                inputMode="email"
                editable={!busy}
              />
              <Pressable onPress={joinStudent} disabled={busy} style={({ pressed }) => [s.primaryButton, { width: 56 }, (pressed || busy) && s.pressed]} accessibilityLabel="Add learner">
                {busy ? <ActivityIndicator color="#FFFFFF" /> : <Ionicons name="add" size={22} color="#FFFFFF" />}
              </Pressable>
            </View>

            {!!sheetError && (
              <View style={[s.notice, s.errorNotice]}>
                <Ionicons name="alert-circle-outline" size={17} color={t.danger} />
                <Text style={[s.noticeText, s.errorText]}>{sheetError}</Text>
              </View>
            )}
            {!!sheetDone && (
              <View style={s.notice}>
                <Ionicons name="checkmark-circle-outline" size={18} color={t.green} />
                <Text style={s.noticeText}>{sheetDone}</Text>
              </View>
            )}

            <ScrollView style={{ marginTop: 14 }} showsVerticalScrollIndicator={false}>
              {rosterLoading ? (
                <View style={s.empty}><ActivityIndicator color={t.brand} /></View>
              ) : roster.length === 0 ? (
                <View style={s.empty}>
                  <Ionicons name="people-outline" size={26} color={t.muted} />
                  <Text style={s.emptyTitle}>No learners yet</Text>
                  <Text style={s.emptyText}>Share the class code, or add a learner by email above.</Text>
                </View>
              ) : (
                roster.map((student) => (
                  <View key={student.email} style={s.row}>
                    <View style={s.rowAvatar}>
                      <Text style={s.rowAvatarText}>{`${student.fname?.[0] ?? ''}${student.lname?.[0] ?? ''}`.toUpperCase()}</Text>
                    </View>
                    <View style={s.rowBody}>
                      <Text style={s.rowTitle} numberOfLines={1}>{student.fname} {student.lname}</Text>
                      <Text style={s.rowSub} numberOfLines={1}>{student.email}</Text>
                    </View>
                    <Pressable
                      onPress={() => setConfirm({ kind: 'student', student, code: openClass?.classCodes ?? '' })}
                      hitSlop={8}
                      accessibilityLabel={`Remove ${student.fname} from the class`}
                    >
                      <Ionicons name="person-remove-outline" size={19} color={t.danger} />
                    </Pressable>
                  </View>
                ))
              )}
            </ScrollView>

            <Pressable onPress={() => setOpenClass(null)} style={({ pressed }) => [s.ghostButton, { marginTop: 10 }, pressed && s.pressed]}>
              <Text style={s.ghostText}>Close</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Confirm a removal */}
      <Modal visible={!!confirm} transparent animationType="fade" onRequestClose={() => setConfirm(null)}>
        <Pressable style={s.sheetBackdrop} onPress={() => !busy && setConfirm(null)} accessibilityLabel="Close">
          <Pressable style={s.sheet} onPress={() => undefined}>
            <View style={s.sheetHandle} />
            <Text style={s.sheetTitle}>
              {confirm?.kind === 'class' ? `Delete class ${confirm.code}?` : `Remove ${confirm?.kind === 'student' ? confirm.student.fname : ''}?`}
            </Text>
            <Text style={s.sheetText}>
              {confirm?.kind === 'class'
                ? 'The class is removed from your workspace. Learners keep their accounts and progress.'
                : 'The learner is removed from this class. Their account and progress are kept.'}
            </Text>
            {!!sheetError && (
              <View style={[s.notice, s.errorNotice]}>
                <Ionicons name="alert-circle-outline" size={17} color={t.danger} />
                <Text style={[s.noticeText, s.errorText]}>{sheetError}</Text>
              </View>
            )}
            <Pressable onPress={runRemoval} disabled={busy} style={({ pressed }) => [s.primaryButton, { backgroundColor: t.danger, marginTop: 6 }, (pressed || busy) && s.pressed]}>
              {busy ? <ActivityIndicator color="#FFFFFF" /> : <Text style={s.primaryText}>{confirm?.kind === 'class' ? 'Delete class' : 'Remove learner'}</Text>}
            </Pressable>
            <Pressable onPress={() => setConfirm(null)} disabled={busy} style={({ pressed }) => [s.ghostButton, { marginTop: 10 }, pressed && s.pressed]}>
              <Text style={s.ghostText}>Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
