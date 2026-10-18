import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import expoconfig from '../expoconfig';
import { NAME_RULE, cleanNameInput, isValidName } from '../utils/inputRules';

const uiFont = Platform.select({ android: 'sans-serif', ios: 'System', web: 'Inter, system-ui, sans-serif' });

/** Lets a student correct their own first and last name (for example after signing in with Google). */
export default function EditNameModal({ visible, onClose, onSaved }: { visible: boolean; onClose: () => void; onSaved?: (message: string) => void }) {
  const { user, setUser } = useContext(AuthContext) as any;
  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setFname(user?.fname ?? '');
    setLname(user?.lname ?? '');
    setError('');
  }, [visible, user?.fname, user?.lname]);

  const type = (setter: (value: string) => void) => (text: string) => {
    const { value, removed } = cleanNameInput(text);
    setter(value);
    setError(removed ? NAME_RULE : '');
  };

  const save = async () => {
    const first = fname.trim().replace(/\s+/g, ' '), last = lname.trim().replace(/\s+/g, ' ');
    if (!first || !last) { setError('Please enter both your first and last name.'); return; }
    if (!isValidName(first) || !isValidName(last)) { setError(NAME_RULE); return; }
    if (first === user?.fname && last === user?.lname) { onClose(); return; }
    setSaving(true);
    setError('');
    try {
      const response = await fetch(`${expoconfig.API_URL}/api/users/me/name`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Student-Token': String(user?.portalSessionToken ?? '') },
        body: JSON.stringify({ email: user?.email, fname: first, lname: last }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(typeof body?.error === 'string' ? body.error : 'Your name could not be saved. Please try again.');
      const updated = { ...user, fname: body?.fname ?? first, lname: body?.lname ?? last };
      await AsyncStorage.setItem('user', JSON.stringify(updated));
      setUser(updated);
      onSaved?.('Your name has been updated.');
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Your name could not be saved. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.icon}><Ionicons name="person-outline" size={20} color="#FFFFFF" /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.eyebrow}>EDIT PROFILE</Text>
              <Text style={styles.title}>Your name</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={10} accessibilityLabel="Close"><Ionicons name="close" size={22} color="#7A6E80" /></Pressable>
          </View>
          <Text style={styles.help}>Use your real name so your teacher can recognise you. Letters only.</Text>
          <Text style={styles.label}>First name</Text>
          <TextInput style={styles.input} value={fname} onChangeText={type(setFname)} maxLength={60} autoCapitalize="words" autoComplete="given-name" placeholder="First name" placeholderTextColor="#A69AAA" accessibilityLabel="First name" />
          <Text style={styles.label}>Last name</Text>
          <TextInput style={styles.input} value={lname} onChangeText={type(setLname)} maxLength={60} autoCapitalize="words" autoComplete="family-name" placeholder="Last name" placeholderTextColor="#A69AAA" accessibilityLabel="Last name" />
          {!!error && <Text style={styles.error}>{error}</Text>}
          <View style={styles.actions}>
            <Pressable onPress={onClose} style={[styles.button, styles.secondary]} disabled={saving}><Text style={styles.secondaryText}>Cancel</Text></Pressable>
            <Pressable onPress={() => void save()} style={[styles.button, styles.primary, saving && { opacity: 0.7 }]} disabled={saving}>
              {saving ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.primaryText}>Save name</Text>}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(36,19,47,0.45)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  card: { width: '100%', maxWidth: 420, backgroundColor: '#FFFFFF', borderRadius: 22, padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  icon: { width: 40, height: 40, borderRadius: 13, backgroundColor: '#8423D9', alignItems: 'center', justifyContent: 'center' },
  eyebrow: { fontFamily: uiFont, fontSize: 10, fontWeight: '700', letterSpacing: 1, color: '#70B642' },
  title: { fontFamily: uiFont, fontSize: 18, fontWeight: '700', color: '#2B1836' },
  help: { fontFamily: uiFont, fontSize: 13, color: '#7A6E80', lineHeight: 19, marginBottom: 10 },
  label: { fontFamily: uiFont, fontSize: 12, fontWeight: '600', color: '#54435F', marginTop: 8, marginBottom: 5 },
  input: { height: 48, borderRadius: 13, borderWidth: 1, borderColor: '#E3D8EA', backgroundColor: '#FBF8FD', paddingHorizontal: 14, fontFamily: uiFont, fontSize: 15, color: '#2B1836' },
  error: { fontFamily: uiFont, fontSize: 12, color: '#B23D6B', marginTop: 10, lineHeight: 17 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  button: { flex: 1, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  secondary: { backgroundColor: '#F3EEF6' },
  secondaryText: { fontFamily: uiFont, fontSize: 14, fontWeight: '600', color: '#54435F' },
  primary: { backgroundColor: '#7B2CBF' },
  primaryText: { fontFamily: uiFont, fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
});
