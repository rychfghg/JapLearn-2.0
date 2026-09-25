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
import { useFocusEffect, useRouter } from 'expo-router';
import { AuthContext } from '../context/AuthContext';
import TeacherBottomNav from '../components/TeacherBottomNav';
import { teacherStyles as s, teacherTheme as t } from '../styles/stylesTeacherApp';
import { teacherApi, type TeacherClass, type TeacherStudent } from '../services/teacherApi';

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function TeacherHome() {
  const { user } = useContext(AuthContext);
  const router = useRouter();

  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [students, setStudents] = useState<TeacherStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [addOpen, setAddOpen] = useState(false);
  const [className, setClassName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [created, setCreated] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const [classList, studentList] = await Promise.all([teacherApi.classes(user), teacherApi.students(user)]);
      setClasses(Array.isArray(classList) ? classList : []);
      setStudents(Array.isArray(studentList) ? studentList : []);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Could not load your classroom.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const createClass = async () => {
    const title = className.trim();
    if (!title) {
      setSaveError('Enter a name for the class, such as Nihongo 1.');
      return;
    }
    setSaving(true);
    setSaveError('');
    try {
      const newClass = await teacherApi.addClass(user, title);
      setCreated(newClass?.classCodes || '');
      setClassName('');
      await load();
    } catch (failure) {
      setSaveError(failure instanceof Error ? failure.message : 'The class could not be created.');
    } finally {
      setSaving(false);
    }
  };

  const closeSheet = () => {
    if (saving) return;
    setAddOpen(false);
    setSaveError('');
    setCreated('');
    setClassName('');
  };

  const initials = `${user?.fname?.[0] ?? ''}${user?.lname?.[0] ?? ''}`.toUpperCase();
  const unapproved = students.filter((student) => student.approved === false).length;

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
            <Pressable onPress={() => router.push('/TeacherProfile')} style={s.headerAction} accessibilityRole="button" accessibilityLabel="Open profile">
              <Ionicons name="settings-outline" size={19} color="#FFFFFF" />
            </Pressable>
          </View>
          <Text style={s.headerSub}>Your classroom at a glance. Add a class, share its code, and watch learners join.</Text>
        </LinearGradient>

        <View style={{ paddingHorizontal: 0 }}>
          <View style={s.statRow}>
            <View style={s.statCard}>
              <View style={[s.statIcon, { backgroundColor: t.brandSoft }]}><Ionicons name="school-outline" size={17} color={t.brand} /></View>
              <Text style={s.statValue}>{loading ? '—' : classes.length}</Text>
              <Text style={s.statLabel}>Classes</Text>
            </View>
            <View style={s.statCard}>
              <View style={[s.statIcon, { backgroundColor: t.greenSoft }]}><Ionicons name="people-outline" size={17} color={t.green} /></View>
              <Text style={s.statValue}>{loading ? '—' : students.length}</Text>
              <Text style={s.statLabel}>Learners</Text>
            </View>
            <View style={s.statCard}>
              <View style={[s.statIcon, { backgroundColor: t.orangeSoft }]}><Ionicons name="hourglass-outline" size={17} color={t.orange} /></View>
              <Text style={s.statValue}>{loading ? '—' : unapproved}</Text>
              <Text style={s.statLabel}>Awaiting</Text>
            </View>
          </View>

          {!!error && (
            <View style={[s.notice, s.errorNotice]}>
              <Ionicons name="alert-circle-outline" size={17} color={t.danger} />
              <Text style={[s.noticeText, s.errorText]}>{error}</Text>
            </View>
          )}

          <Text style={s.sectionLabel}>QUICK ACTIONS</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Pressable
              onPress={() => setAddOpen(true)}
              style={({ pressed }) => [s.primaryButton, { flex: 1 }, pressed && s.pressed]}
              accessibilityRole="button"
            >
              <Ionicons name="add" size={19} color="#FFFFFF" />
              <Text style={s.primaryText}>New class</Text>
            </Pressable>
            <Pressable
              onPress={() => router.replace('/TeacherStudents')}
              style={({ pressed }) => [s.ghostButton, { flex: 1 }, pressed && s.pressed]}
              accessibilityRole="button"
            >
              <Ionicons name="person-add-outline" size={18} color={t.body} />
              <Text style={s.ghostText}>Add student</Text>
            </Pressable>
          </View>

          <Text style={s.sectionLabel}>YOUR CLASSES</Text>
          {loading ? (
            <View style={s.empty}><ActivityIndicator color={t.brand} /></View>
          ) : classes.length === 0 ? (
            <View style={[s.card, s.empty]}>
              <Ionicons name="school-outline" size={30} color={t.muted} />
              <Text style={s.emptyTitle}>No classes yet</Text>
              <Text style={s.emptyText}>Create your first class, then share its code so students can join from their app.</Text>
            </View>
          ) : (
            classes.map((item) => {
              const count = students.filter((student) => student.classCode === item.classCodes).length;
              return (
                <View key={item.classCodes} style={s.row}>
                  <View style={s.rowAvatar}><Ionicons name="school" size={19} color={t.brand} /></View>
                  <View style={s.rowBody}>
                    <Text style={s.rowTitle} numberOfLines={1}>{item.classTitle || item.classCodes}</Text>
                    <Text style={s.rowSub}>{count} {count === 1 ? 'learner' : 'learners'}</Text>
                  </View>
                  <View style={s.chip}><Text style={s.chipText}>{item.classCodes}</Text></View>
                </View>
              );
            })
          )}

          <Text style={s.sectionLabel}>RECENT LEARNERS</Text>
          {loading ? null : students.length === 0 ? (
            <View style={[s.card, s.empty]}>
              <Ionicons name="people-outline" size={30} color={t.muted} />
              <Text style={s.emptyTitle}>No learners yet</Text>
              <Text style={s.emptyText}>Share a class code, or add a student from the Students tab.</Text>
            </View>
          ) : (
            students.slice(0, 5).map((student) => (
              <View key={student.email} style={s.row}>
                <View style={s.rowAvatar}>
                  <Text style={s.rowAvatarText}>{`${student.fname?.[0] ?? ''}${student.lname?.[0] ?? ''}`.toUpperCase()}</Text>
                </View>
                <View style={s.rowBody}>
                  <Text style={s.rowTitle} numberOfLines={1}>{student.fname} {student.lname}</Text>
                  <Text style={s.rowSub} numberOfLines={1}>{student.email}</Text>
                </View>
                <View style={[s.chip, !student.classCode && s.chipMuted]}>
                  <Text style={[s.chipText, !student.classCode && s.chipMutedText]}>{student.classCode || 'No class'}</Text>
                </View>
              </View>
            ))
          )}

          {students.length > 5 && (
            <Pressable onPress={() => router.replace('/TeacherStudents')} style={({ pressed }) => [s.ghostButton, pressed && s.pressed]}>
              <Text style={s.ghostText}>See all {students.length} learners</Text>
              <Ionicons name="arrow-forward" size={16} color={t.body} />
            </Pressable>
          )}
        </View>
      </ScrollView>

      <TeacherBottomNav active="home" />

      {/* New class */}
      <Modal visible={addOpen} transparent animationType="slide" onRequestClose={closeSheet}>
        <Pressable style={s.sheetBackdrop} onPress={closeSheet} accessibilityLabel="Close">
          <Pressable style={s.sheet} onPress={() => undefined}>
            <View style={s.sheetHandle} />
            <Text style={s.sheetTitle}>New class</Text>
            <Text style={s.sheetText}>Name the class. JapLearn creates the code your students will use to join.</Text>

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
                <Pressable onPress={closeSheet} style={({ pressed }) => [s.primaryButton, { marginTop: 18 }, pressed && s.pressed]}>
                  <Text style={s.primaryText}>Done</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={s.label}>Class name</Text>
                <TextInput
                  value={className}
                  onChangeText={(value) => { setClassName(value); setSaveError(''); }}
                  placeholder="Nihongo 1 · Section A"
                  placeholderTextColor="#B6ADBB"
                  style={s.input}
                  editable={!saving}
                  autoFocus
                />
                {!!saveError && (
                  <View style={[s.notice, s.errorNotice]}>
                    <Ionicons name="alert-circle-outline" size={17} color={t.danger} />
                    <Text style={[s.noticeText, s.errorText]}>{saveError}</Text>
                  </View>
                )}
                <Pressable
                  onPress={createClass}
                  disabled={saving}
                  style={({ pressed }) => [s.primaryButton, { marginTop: 18 }, (pressed || saving) && s.pressed]}
                >
                  {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={s.primaryText}>Create class</Text>}
                </Pressable>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
