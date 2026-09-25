import { Platform, StyleSheet } from 'react-native';

const uiFont = Platform.select({ android: 'sans-serif', ios: 'System', web: 'Inter, system-ui, sans-serif' });
const uiFontMedium = Platform.select({ android: 'sans-serif-medium', ios: 'System', web: 'Inter, system-ui, sans-serif' });

// Same palette as the web teacher portal.
export const teacherTheme = {
  ink: '#2F1A3A',
  body: '#5C4D65',
  muted: '#8A7D90',
  line: '#EDE6F1',
  surface: '#FFFFFF',
  page: '#FAF7FC',
  brand: '#7B26CE',
  brandSoft: '#F4EBFC',
  green: '#5D9C38',
  greenSoft: '#EDF7E7',
  orange: '#C97A24',
  orangeSoft: '#FDF1E3',
  blue: '#3A72C4',
  blueSoft: '#E9F0FC',
  danger: '#C53D47',
  dangerSoft: '#FCEBED',
  uiFont,
  uiFontMedium,
};

export const teacherStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: teacherTheme.page },
  scroll: { paddingHorizontal: 18, paddingBottom: 110 },

  // Purple header, like the portal's overview banner.
  header: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 22, borderBottomLeftRadius: 26, borderBottomRightRadius: 26 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerAvatar: {
    width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)',
  },
  headerAvatarText: { fontFamily: uiFontMedium, fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  headerKicker: { fontFamily: uiFont, fontSize: 10.5, fontWeight: '800', letterSpacing: 1.3, color: '#C8F0A8' },
  headerName: { fontFamily: 'Jua', fontSize: 21, color: '#FFFFFF', marginTop: 2 },
  headerAction: {
    width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  headerSub: { fontFamily: uiFont, fontSize: 13, lineHeight: 20, color: '#E6D8F7', marginTop: 14 },

  // Cards and sections
  sectionLabel: {
    fontFamily: uiFont, fontSize: 10, fontWeight: '800', letterSpacing: 1.3,
    color: teacherTheme.muted, marginTop: 22, marginBottom: 10, marginLeft: 2,
  },
  card: {
    backgroundColor: teacherTheme.surface, borderRadius: 20, borderWidth: 1,
    borderColor: teacherTheme.line, padding: 16,
  },
  cardTitle: { fontFamily: uiFontMedium, fontSize: 15.5, fontWeight: '700', color: teacherTheme.ink },
  cardText: { fontFamily: uiFont, fontSize: 13, lineHeight: 20, color: teacherTheme.muted, marginTop: 4 },

  // Stat tiles
  statRow: { flexDirection: 'row', gap: 10, marginTop: -30 },
  statCard: {
    flex: 1, backgroundColor: teacherTheme.surface, borderRadius: 18, borderWidth: 1,
    borderColor: teacherTheme.line, padding: 14,
    shadowColor: '#3C194E', shadowOpacity: 0.07, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 2,
  },
  statIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginBottom: 9 },
  statValue: { fontFamily: uiFontMedium, fontSize: 22, fontWeight: '700', color: teacherTheme.ink },
  statLabel: { fontFamily: uiFont, fontSize: 11.5, color: teacherTheme.muted, marginTop: 2 },

  // Rows (students, classes, menu items)
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14,
    backgroundColor: teacherTheme.surface, borderRadius: 16, borderWidth: 1, borderColor: teacherTheme.line,
    marginBottom: 9,
  },
  rowAvatar: {
    width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    backgroundColor: teacherTheme.brandSoft,
  },
  rowAvatarText: { fontFamily: uiFontMedium, fontSize: 14, fontWeight: '700', color: teacherTheme.brand },
  rowBody: { flex: 1, minWidth: 0 },
  rowTitle: { fontFamily: uiFontMedium, fontSize: 14.5, fontWeight: '600', color: teacherTheme.ink },
  rowSub: { fontFamily: uiFont, fontSize: 12, color: teacherTheme.muted, marginTop: 2 },

  chip: {
    alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999,
    backgroundColor: teacherTheme.brandSoft,
  },
  chipText: { fontFamily: uiFontMedium, fontSize: 11.5, fontWeight: '700', color: teacherTheme.brand, letterSpacing: 0.3 },
  chipMuted: { backgroundColor: '#F4F1F6' },
  chipMutedText: { color: teacherTheme.muted },

  // Search and inputs
  search: {
    flexDirection: 'row', alignItems: 'center', gap: 9, height: 48, paddingHorizontal: 14,
    backgroundColor: teacherTheme.surface, borderRadius: 14, borderWidth: 1, borderColor: teacherTheme.line,
  },
  searchInput: { flex: 1, height: '100%', fontFamily: uiFont, fontSize: 14.5, color: teacherTheme.ink },
  label: { fontFamily: uiFontMedium, fontSize: 12.5, fontWeight: '600', color: teacherTheme.ink, marginBottom: 7 },
  input: {
    height: 50, paddingHorizontal: 14, borderRadius: 13, borderWidth: 1, borderColor: '#E3DFE8',
    backgroundColor: '#FFFFFF', fontFamily: uiFont, fontSize: 15, color: teacherTheme.ink,
  },

  // Buttons
  primaryButton: {
    height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8,
    backgroundColor: teacherTheme.brand,
  },
  primaryText: { fontFamily: uiFontMedium, fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
  ghostButton: {
    height: 48, borderRadius: 13, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8,
    backgroundColor: '#F4EFF6', borderWidth: 1, borderColor: teacherTheme.line,
  },
  ghostText: { fontFamily: uiFontMedium, fontSize: 14, fontWeight: '600', color: teacherTheme.body },
  pressed: { opacity: 0.85 },

  // Feedback
  empty: { alignItems: 'center', paddingVertical: 34, paddingHorizontal: 20 },
  emptyTitle: { fontFamily: uiFontMedium, fontSize: 15, fontWeight: '600', color: teacherTheme.ink, marginTop: 12 },
  emptyText: { fontFamily: uiFont, fontSize: 13, lineHeight: 19, color: teacherTheme.muted, textAlign: 'center', marginTop: 5 },
  notice: {
    flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 13,
    backgroundColor: teacherTheme.greenSoft, marginTop: 12,
  },
  noticeText: { flex: 1, fontFamily: uiFont, fontSize: 12.5, lineHeight: 18, color: '#4C7A2C' },
  errorNotice: { backgroundColor: teacherTheme.dangerSoft },
  errorText: { color: '#A33540' },

  // Bottom sheet used for the add forms
  sheetBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(38,22,50,0.5)' },
  sheet: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 26, borderTopRightRadius: 26,
    paddingHorizontal: 20, paddingTop: 10, paddingBottom: 26,
  },
  sheetHandle: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: '#E3DAE8', marginBottom: 16 },
  sheetTitle: { fontFamily: 'Jua', fontSize: 20, color: teacherTheme.ink },
  sheetText: { fontFamily: uiFont, fontSize: 13, lineHeight: 19, color: teacherTheme.muted, marginTop: 4, marginBottom: 16 },
});
