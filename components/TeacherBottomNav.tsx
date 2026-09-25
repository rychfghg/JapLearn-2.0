import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { teacherTheme } from '../styles/stylesTeacherApp';

type TabKey = 'home' | 'students' | 'profile';

const TABS: { key: TabKey; label: string; route: string; icon: React.ComponentProps<typeof Ionicons>['name'] }[] = [
  { key: 'home', label: 'Dashboard', route: '/TeacherHome', icon: 'grid-outline' },
  { key: 'students', label: 'Students', route: '/TeacherStudents', icon: 'people-outline' },
  { key: 'profile', label: 'Profile', route: '/TeacherProfile', icon: 'person-circle-outline' },
];

/** Bottom navigation shared by every teacher screen in the app. */
export default function TeacherBottomNav({ active }: { active: TabKey }) {
  const router = useRouter();

  return (
    <View style={styles.bar}>
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Pressable
            key={tab.key}
            onPress={() => !isActive && router.replace(tab.route)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={tab.label}
            style={styles.tab}
          >
            <View style={[styles.iconShell, isActive && styles.iconShellActive]}>
              <Ionicons
                name={isActive ? (tab.icon.replace('-outline', '') as typeof tab.icon) : tab.icon}
                size={21}
                color={isActive ? '#FFFFFF' : teacherTheme.muted}
              />
            </View>
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 8, paddingBottom: Platform.OS === 'ios' ? 24 : 12, paddingHorizontal: 12,
    backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: teacherTheme.line,
  },
  tab: { flex: 1, alignItems: 'center', gap: 4 },
  iconShell: { width: 46, height: 32, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  iconShellActive: { backgroundColor: teacherTheme.brand },
  label: { fontFamily: teacherTheme.uiFont, fontSize: 11, color: teacherTheme.muted },
  labelActive: { fontFamily: teacherTheme.uiFontMedium, fontWeight: '600', color: teacherTheme.brand },
});
