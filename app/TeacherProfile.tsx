import React, { useCallback, useContext, useState } from 'react';
import {
  Linking,
  Modal,
  Pressable,
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
import { teacherApi, type TeacherClass, type TeacherStudent } from '../services/teacherApi';

const SUPPORT_EMAIL = 'japlearnofficial@gmail.com';

export default function TeacherProfile() {
  const { user, logout } = useContext(AuthContext);
  const router = useRouter();

  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [students, setStudents] = useState<TeacherStudent[]>([]);
  const [signOutOpen, setSignOutOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const [classList, studentList] = await Promise.all([teacherApi.classes(user), teacherApi.students(user)]);
      setClasses(Array.isArray(classList) ? classList : []);
      setStudents(Array.isArray(studentList) ? studentList : []);
    } catch {
      // The profile still shows the account details while offline.
    }
  }, [user]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const signOut = () => {
    setSignOutOpen(false);
    logout();
    router.replace('/Login');
  };

  const initials = `${user?.fname?.[0] ?? ''}${user?.lname?.[0] ?? ''}`.toUpperCase();

  return (
    <SafeAreaView style={s.screen}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#3B1450', '#6B22B4', '#8E34DC']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.header}>
          <View style={s.headerRow}>
            <View style={s.headerAvatar}><Text style={s.headerAvatarText}>{initials || 'T'}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={s.headerKicker}>先生 · TEACHER</Text>
              <Text style={s.headerName} numberOfLines={1}>{user ? `${user.fname} ${user.lname}` : 'Teacher'}</Text>
            </View>
          </View>
          <Text style={s.headerSub}>{user?.email}</Text>
        </LinearGradient>

        <View style={s.statRow}>
          <View style={s.statCard}>
            <View style={[s.statIcon, { backgroundColor: t.brandSoft }]}><Ionicons name="school-outline" size={17} color={t.brand} /></View>
            <Text style={s.statValue}>{classes.length}</Text>
            <Text style={s.statLabel}>Classes</Text>
          </View>
          <View style={s.statCard}>
            <View style={[s.statIcon, { backgroundColor: t.greenSoft }]}><Ionicons name="people-outline" size={17} color={t.green} /></View>
            <Text style={s.statValue}>{students.length}</Text>
            <Text style={s.statLabel}>Learners</Text>
          </View>
          <View style={s.statCard}>
            <View style={[s.statIcon, { backgroundColor: t.orangeSoft }]}><Ionicons name="ribbon-outline" size={17} color={t.orange} /></View>
            <Text style={[s.statValue, { fontSize: 16 }]}>Teacher</Text>
            <Text style={s.statLabel}>Role</Text>
          </View>
        </View>

        <Text style={s.sectionLabel}>ACCOUNT DETAILS</Text>
        <View style={s.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={[s.statIcon, { backgroundColor: t.brandSoft, marginBottom: 0 }]}><Ionicons name="person-outline" size={17} color={t.brand} /></View>
            <View style={s.rowBody}>
              <Text style={s.rowSub}>Full name</Text>
              <Text style={s.rowTitle}>{user ? `${user.fname} ${user.lname}` : ''}</Text>
            </View>
          </View>
          <View style={{ height: 1, backgroundColor: t.line, marginVertical: 13 }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={[s.statIcon, { backgroundColor: t.blueSoft, marginBottom: 0 }]}><Ionicons name="mail-outline" size={17} color={t.blue} /></View>
            <View style={s.rowBody}>
              <Text style={s.rowSub}>Email address</Text>
              <Text style={s.rowTitle} numberOfLines={1}>{user?.email}</Text>
            </View>
          </View>
        </View>

        <Text style={s.sectionLabel}>YOUR CLASS CODES</Text>
        {classes.length === 0 ? (
          <View style={[s.card, s.empty]}>
            <Ionicons name="school-outline" size={28} color={t.muted} />
            <Text style={s.emptyTitle}>No classes yet</Text>
            <Text style={s.emptyText}>Create one from the dashboard to get a class code.</Text>
          </View>
        ) : (
          <View style={[s.card, { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }]}>
            {classes.map((item) => (
              <View key={item.classCodes} style={s.chip}><Text style={s.chipText}>{item.classCodes}</Text></View>
            ))}
          </View>
        )}

        <Text style={s.sectionLabel}>SUPPORT</Text>
        <Pressable
          onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=JapLearn%20Teacher%20Support`)}
          style={({ pressed }) => [s.row, pressed && s.pressed]}
          accessibilityRole="button"
        >
          <View style={s.rowAvatar}><Ionicons name="headset-outline" size={19} color={t.brand} /></View>
          <View style={s.rowBody}>
            <Text style={s.rowTitle}>Contact support</Text>
            <Text style={s.rowSub}>{SUPPORT_EMAIL}</Text>
          </View>
          <Ionicons name="open-outline" size={18} color={t.muted} />
        </Pressable>

        <Pressable
          onPress={() => router.push({ pathname: '/PrivacyPolicyPage', params: { fromProfile: 'true' } })}
          style={({ pressed }) => [s.row, pressed && s.pressed]}
          accessibilityRole="button"
        >
          <View style={s.rowAvatar}><Ionicons name="shield-checkmark-outline" size={19} color={t.brand} /></View>
          <View style={s.rowBody}>
            <Text style={s.rowTitle}>Privacy policy</Text>
            <Text style={s.rowSub}>How JapLearn handles information</Text>
          </View>
          <Ionicons name="chevron-forward" size={19} color={t.muted} />
        </Pressable>

        <Pressable
          onPress={() => setSignOutOpen(true)}
          style={({ pressed }) => [s.row, pressed && s.pressed]}
          accessibilityRole="button"
        >
          <View style={[s.rowAvatar, { backgroundColor: t.dangerSoft }]}><Ionicons name="log-out-outline" size={19} color={t.danger} /></View>
          <View style={s.rowBody}>
            <Text style={[s.rowTitle, { color: t.danger }]}>Log out</Text>
            <Text style={s.rowSub}>Sign out of this device</Text>
          </View>
          <Ionicons name="chevron-forward" size={19} color={t.muted} />
        </Pressable>

        <Text style={[s.rowSub, { textAlign: 'center', marginTop: 18 }]}>
          Full classroom tools are available in the teacher portal at portal.japlearn.com
        </Text>
      </ScrollView>

      <TeacherBottomNav active="profile" />

      <Modal visible={signOutOpen} transparent animationType="slide" onRequestClose={() => setSignOutOpen(false)}>
        <Pressable style={s.sheetBackdrop} onPress={() => setSignOutOpen(false)} accessibilityLabel="Close">
          <Pressable style={s.sheet} onPress={() => undefined}>
            <View style={s.sheetHandle} />
            <Text style={s.sheetTitle}>Log out of JapLearn?</Text>
            <Text style={s.sheetText}>You will need to sign in again with your teacher account.</Text>
            <Pressable onPress={signOut} style={({ pressed }) => [s.primaryButton, { backgroundColor: t.danger }, pressed && s.pressed]}>
              <Text style={s.primaryText}>Log out</Text>
            </Pressable>
            <Pressable onPress={() => setSignOutOpen(false)} style={({ pressed }) => [s.ghostButton, { marginTop: 10 }, pressed && s.pressed]}>
              <Text style={s.ghostText}>Stay signed in</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
