import React, { useEffect, useState } from 'react';
import { Keyboard, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Tab = 'home' | 'learn' | 'talk' | 'play' | 'profile';

const items: { key: Tab; label: string; icon: any; activeIcon: any; route: any }[] = [
  { key: 'home', label: 'Home', icon: 'home-outline', activeIcon: 'home', route: '/Menu' },
  { key: 'learn', label: 'Learn', icon: 'book-outline', activeIcon: 'book', route: '/LearnMenu' },
  { key: 'talk', label: 'Talk', icon: 'mic', activeIcon: 'mic', route: '/QuackTalk' },
  { key: 'play', label: 'Exercises', icon: 'game-controller-outline', activeIcon: 'game-controller', route: '/Exercises' },
  { key: 'profile', label: 'Profile', icon: 'person-outline', activeIcon: 'person', route: '/Profile' },
];

export default function StudentBottomNav({ active }: { active?: Tab }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bottomOffset = Math.max(insets.bottom, 8);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  if (keyboardVisible) return null;

  const dockStyle = Platform.OS === 'web'
    ? ({ position: 'fixed', bottom: 'max(8px, env(safe-area-inset-bottom))' } as any)
    : { bottom: bottomOffset };

  return (
    <View style={[styles.nav, dockStyle]}>
      {items.map((item) => {
        const selected = item.key === active;
        const isTalk = item.key === 'talk';
        return (
          <Pressable key={item.key} accessibilityRole="tab" accessibilityState={{ selected }} style={[styles.item, isTalk && styles.talkItem]} onPress={() => { if (!selected) router.replace(item.route); }}>
            {({ pressed }) => (
              <>
                {/* Press feedback sits on the pill itself: fading the whole tab makes
                    Android draw it as a separate layer, which loses the rounded corners. */}
                <View style={[styles.iconWrap, selected && styles.activeIconWrap, isTalk && styles.talkIconWrap, isTalk && selected && styles.talkIconActive, pressed && styles.pressed]}>
                  <Ionicons name={selected ? item.activeIcon : item.icon} size={isTalk ? 27 : 22} color={selected ? '#FFFFFF' : '#918797'} />
                </View>
                <Text style={[styles.label, selected && styles.activeLabel, isTalk && styles.talkLabel, pressed && styles.pressed]}>{item.label}</Text>
              </>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    position: 'absolute', left: 14, right: 14, height: 76,
    backgroundColor: '#FFFFFF', borderRadius: 24, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 8,
    borderWidth: 1, borderColor: '#EEE7F1', zIndex: 50,
    shadowColor: '#2E193B', shadowOpacity: 0.16, shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 }, elevation: 14,
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 },
  talkItem: { transform: [{ translateY: -13 }] },
  pressed: { opacity: 0.72 },
  // overflow: 'hidden' makes Android clip the violet fill to the rounded corners.
  iconWrap: { width: 38, height: 32, borderRadius: 13, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  activeIconWrap: { backgroundColor: '#8423D9' },
  talkIconWrap: { width: 58, height: 58, borderRadius: 29, overflow: 'visible', backgroundColor: '#F3EFF5', borderWidth: 5, borderColor: '#FFFFFF', shadowColor: '#2E193B', shadowOpacity: .16, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 12 },
  talkIconActive: { backgroundColor: '#8423D9' },
  label: { color: '#918797', fontFamily: 'Jua', fontSize: 11 },
  activeLabel: { color: '#8423D9' },
  talkLabel: { color: '#918797', marginTop: -1 },
});
