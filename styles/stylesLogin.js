import { Platform, StyleSheet } from 'react-native';
import { platformShadow } from '../utils/platformShadow';

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#7526C9', padding: 12, width: '100%', borderRadius: 16,
    height: 56,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9,
    ...platformShadow('#5E1A93', 0.16, 8, 4, 2),
  },
  buttonPressed: { opacity: 0.86, transform: [{ scale: 0.99 }] },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },

  buttonContainer: {
    alignItems:'center',
    marginTop: 10,
  },

  container: {
    flex: 1,
    backgroundColor: '#F8F5FA',
    overflow: 'hidden',
  },
  keyboardView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingTop: Platform.OS === 'web' ? 38 : 26,
    paddingBottom: 28,
  },
  authShell: {
    width:'100%', maxWidth:410, alignSelf:'center',
  },
  authShellWide: { maxWidth:450 },
  backgroundOrbTop: {
    position: 'absolute', width: 290, height: 290, borderRadius: 145,
    backgroundColor: '#EFE0FB', top: -128, right: -104,
  },
  backgroundOrbBottom: {
    position: 'absolute', width: 245, height: 245, borderRadius: 123,
    backgroundColor: '#E9F6DE', bottom: -132, left: -92,
  },

  input: {
    flex: 1,
    color: '#35243D',
    paddingHorizontal: 10,
    height: 56,
    fontSize: 15,
    outlineStyle: 'none',
    outlineWidth: 0,
  },
  inputReset: {
    flex: 1, color: '#462A5E', paddingHorizontal: 10, height: 56,
    fontSize: 16, outlineStyle: 'none', outlineWidth: 0,
  },

  imageContainer: {
    flexDirection:'row', alignItems: 'center', gap:13,
    width: '100%',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  imageContainerWide:{alignItems:'center',marginBottom:0},
  welcomeBadge:{flexDirection:'row',alignItems:'center',gap:7,backgroundColor:'#EEF7E7',borderRadius:99,paddingHorizontal:11,paddingVertical:7,marginBottom:7},
  welcomeBadgeText:{fontSize:8,fontWeight:'900',letterSpacing:1,color:'#568E35'},
  mascotWrap: { alignItems: 'center', justifyContent: 'center' },
  welcomeTitle:{fontFamily:'Jua',fontSize:23,lineHeight:29,color:'#3C2348',textAlign:'center',maxWidth:340,marginTop:5},
  subtitleText: { fontSize: 12, lineHeight:18,color: '#786D7D', marginTop: 4, textAlign: 'center',maxWidth:340 },
  formCard: {
    backgroundColor: '#FFFFFF', borderRadius: 26,
    paddingHorizontal: 22, paddingTop: 25, paddingBottom: 24,
    borderWidth:1, borderColor:'#EAE2EE',
    ...platformShadow('#3C194E', 0.10, 20, 8, 4),
  },
  formCardWide:{paddingHorizontal:25},
  formHeadingIcon:{width:42,height:42,borderRadius:14,backgroundColor:'#F1E5FA',alignItems:'center',justifyContent:'center',marginBottom:11},
  formEyebrow:{fontSize:8,fontWeight:'900',letterSpacing:1.2,color:'#6AAB3D',marginBottom:5},
  cardHeading: { alignItems: 'flex-start', marginBottom: 22 },
  cardHeadingMark: { width: 30, height: 4, borderRadius: 99, backgroundColor: '#8ED94D', marginBottom: 10 },
  formTitle: { fontSize: 30, lineHeight:36, fontWeight:'900', color: '#302036', letterSpacing:-0.7 },
  formSubtitle: { color: '#817586', fontSize: 13, lineHeight:19, marginTop:3 },
  fieldLabel:{fontSize:12,fontWeight:'800',color:'#514057',marginBottom:8,marginLeft:2},
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FAF8FB',
    borderWidth: 1, borderColor:'#E7DFEB', borderRadius: 16, paddingHorizontal: 15, marginBottom: 17,
  },
  inputFocused:{borderColor:'#8423D9',backgroundColor:'#FFFFFF',shadowColor:'#8423D9',shadowOpacity:0.08,shadowRadius:8,shadowOffset:{width:0,height:2},elevation:1},
  inputIcon: { marginRight: 2 },
  
  linkContainer: {
    marginTop: 17,
    alignItems: 'center',
  },

  linkText: {
      color: '#8423D9',
      fontWeight: '800',
      fontSize: 12,
  },
  linkPrompt: { color:'#817586', fontSize:13, textAlign:'center' },
  passwordLabelRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
  forgotRow: { alignItems:'flex-end', marginTop:8, marginBottom:2 },
  forgotText: { color:'#7D20D4', fontSize:12, fontWeight:'800' },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF8FB',
    borderWidth: 1, borderColor:'#E7DFEB',
    borderRadius: 16,
    paddingLeft: 15,
    marginBottom: 5,
    position: 'relative',
  },
  passwordInput: {
    flex: 1,
    paddingRight: 46,
  },
  insideInputButton: {
    position: 'absolute',
    right: 8,
    height: '100%',
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    color: '#35213F',
    fontSize: 23,
    fontFamily: 'Jua'  
  },
  brandCaption:{fontSize:9,fontWeight:'900',letterSpacing:1.4,color:'#72AD43',marginTop:2},

  policyTextContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 20,
  },
  policyText: {
    fontSize: 12,
    color: '#777076',
    textAlign: 'center',
  },
  linkText2: {
    fontSize: 12,
    color: '#8423D9',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(38,22,50,0.55)',
    paddingHorizontal: 22,
  },
  
  modalContent: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20, // Add vertical spacing between elements
    paddingHorizontal: 26,paddingTop:34,paddingBottom:26,
    backgroundColor: '#FFFCFF',
    borderRadius: 30,
    width: '100%',
    maxWidth: 430,
    shadowColor: '#24152F', shadowOpacity: 0.25, shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 }, elevation: 12,
  },
  modalAccent:{position:'absolute',top:0,left:55,right:55,height:5,backgroundColor:'#8ED94D',borderBottomLeftRadius:5,borderBottomRightRadius:5},
  modalClose: { position: 'absolute', right: 18, top: 18, zIndex: 2, padding: 4 },
  modalIconWrap: {
    width: 60, height: 60, borderRadius: 20, backgroundColor: '#F0E4FA',
    alignItems: 'center', justifyContent: 'center',
  },
  modalIconHalo:{width:76,height:76,borderRadius:25,backgroundColor:'#FAF4FE',borderWidth:1,borderColor:'#E6D3F2',alignItems:'center',justifyContent:'center',marginBottom:14},
  modalEyebrow:{fontSize:8,fontWeight:'900',letterSpacing:1.2,color:'#6AAB3D',marginBottom:6},
  
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#462A5E',
  },
  modalDescription: { color: '#817586', fontSize: 14, lineHeight: 21, textAlign: 'center', marginBottom: 20 },
  resetFieldLabel:{width:'100%',fontSize:11,fontWeight:'800',color:'#54415E',marginBottom:7,marginLeft:2},
  resetInputContainer: {
    width: '100%', flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F6F3F8', borderWidth: 1, borderColor: '#E8E0ED',
    borderRadius: 15, paddingHorizontal: 15, marginBottom: 16,
  },
  buttonReset: {
    backgroundColor: '#8423D9',
    padding: 12,
    width:  '100%',
    borderRadius: 16,
    borderColor: '#6D1CAD',
    borderBottomWidth: Platform.OS === 'android' ? 0 : 4,
    height: 58,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9,
    
  },

  buttonTextReset: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});

export default styles;
