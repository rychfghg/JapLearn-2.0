import { Platform, StyleSheet } from 'react-native';
import { platformShadow } from '../utils/platformShadow';

// Mirrors the student Sign in screen (stylesLogin.js) so both auth screens feel like one flow.
const uiFont = Platform.select({ android: 'sans-serif', ios: 'System', web: 'Inter, system-ui, sans-serif' });

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FBF8FD', overflow: 'hidden' },
  orbTop: { position: 'absolute', width: 290, height: 290, borderRadius: 145, backgroundColor: '#EFE0FB', top: -128, right: -104 },
  orbBottom: { position: 'absolute', width: 245, height: 245, borderRadius: 123, backgroundColor: '#E9F6DE', bottom: -132, left: -92 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 34 },
  shell: { width: '100%', maxWidth: 420, alignSelf: 'center' },

  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12, alignSelf: 'center', marginBottom: 26 },
  logoShell: { width: 54, height: 54, borderRadius: 17, backgroundColor: '#F0E4FA', borderWidth: 1, borderColor: '#DFC8F0', alignItems: 'center', justifyContent: 'center' },
  brandName: { fontFamily: 'Jua', fontSize: 22, color: '#3C2348' },
  brandCaption: { fontFamily: uiFont, fontSize: 11, color: '#8A7F8F', marginTop: 1 },

  card: {
    backgroundColor: '#FFFFFF', borderRadius: 26, borderWidth: 1, borderColor: '#EAE2EE',
    paddingHorizontal: 22, paddingTop: 24, paddingBottom: 22,
    ...platformShadow('#3C194E', 0.1, 24, 10, 4),
  },
  headingIcon: { width: 46, height: 46, borderRadius: 15, backgroundColor: '#F1E5FA', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  headingMark: { width: 30, height: 4, borderRadius: 99, backgroundColor: '#8ED94D', marginBottom: 10 },
  title: { fontFamily: uiFont, fontSize: 26, lineHeight: 32, fontWeight: '400', color: '#29232D', letterSpacing: -0.3 },
  subtitle: { fontFamily: uiFont, color: '#817586', fontSize: 13, lineHeight: 19, marginTop: 5, marginBottom: 20 },

  fieldLabel: { fontFamily: uiFont, fontSize: 12, fontWeight: '500', color: '#514B55', marginBottom: 8, marginLeft: 1 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F3FB',
    borderWidth: 1, borderColor: '#E5D9EA', borderRadius: 14, paddingLeft: 14, marginBottom: 6,
  },
  inputFocused: { borderColor: '#8A35D1', backgroundColor: '#FFFFFF', borderWidth: 1.5 },
  inputError: { borderColor: '#D9607A', backgroundColor: '#FFF7F8' },
  input: { flex: 1, height: 52, paddingHorizontal: 10, color: '#29232D', fontFamily: uiFont, fontSize: 15, outlineStyle: 'none', outlineWidth: 0 },
  eyeButton: { width: 44, height: 52, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontFamily: uiFont, color: '#C2415D', fontSize: 12, marginBottom: 10, marginLeft: 2 },
  fieldGap: { height: 10 },

  rules: { backgroundColor: '#FAF6FC', borderRadius: 14, borderWidth: 1, borderColor: '#EFE6F3', padding: 12, marginTop: 4, marginBottom: 12, gap: 7 },
  ruleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ruleText: { fontFamily: uiFont, fontSize: 12, color: '#8A7F8F' },
  ruleTextMet: { color: '#4E8A2B' },

  button: {
    backgroundColor: '#7B2CBF', width: '100%', height: 56, borderRadius: 15, marginTop: 8,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
  },
  buttonPressed: { opacity: 0.86, transform: [{ scale: 0.99 }] },
  buttonDisabled: { backgroundColor: '#B39BC8' },
  buttonText: { color: '#FFFFFF', fontFamily: uiFont, fontSize: 15, fontWeight: '500' },
  buttonIcon: { position: 'absolute', right: 7, width: 42, height: 42, borderRadius: 12, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },

  backLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 18 },
  backLinkText: { fontFamily: uiFont, color: '#7B2CBF', fontSize: 13, fontWeight: '500' },

  modalContainer: { flex: 1, backgroundColor: 'rgba(34,15,46,0.5)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalContent: { width: '100%', maxWidth: 360, backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, alignItems: 'center' },
  modalIcon: { width: 58, height: 58, borderRadius: 19, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  modalIconSuccess: { backgroundColor: '#EDF7E6' },
  modalIconWarn: { backgroundColor: '#FDEEF1' },
  modalTitle: { fontFamily: 'Jua', fontSize: 22, color: '#2F1F37', textAlign: 'center' },
  modalMessage: { fontFamily: uiFont, fontSize: 13, lineHeight: 19, color: '#766B7C', textAlign: 'center', marginTop: 6, marginBottom: 18 },
  modalButton: { backgroundColor: '#7B2CBF', height: 50, borderRadius: 14, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' },
  modalButtonText: { color: '#FFFFFF', fontFamily: uiFont, fontSize: 14, fontWeight: '500' },
});
