import { Platform, StyleSheet } from 'react-native';
import { platformShadow } from '../utils/platformShadow';

const uiFont = Platform.select({ android: 'sans-serif', ios: 'System', web: 'Inter, system-ui, sans-serif' });

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#7B2CBF', paddingLeft: 20, paddingRight: 7, width: '100%', borderRadius: 15,
    height: 56,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9,
  },
  buttonPressed: { opacity: 0.86, transform: [{ scale: 0.99 }] },

  buttonText: {
    color: '#fff',
    fontFamily: uiFont,
    fontSize: 15,
    fontWeight: '500',
  },
  buttonIcon:{position:'absolute',right:7,width:42,height:42,borderRadius:12,backgroundColor:'#FFFFFF',alignItems:'center',justifyContent:'center'},

  buttonContainer: {
    alignItems:'center',
    marginTop: 10,
  },

  container: {
    flex: 1,
    backgroundColor: '#FBF8FD',
    overflow: 'hidden',
  },
  keyboardView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center', paddingHorizontal: 24,
    paddingTop: Platform.OS === 'web' ? 34 : 34, paddingBottom: 24,
  },
  authShell: {
    width:'100%', maxWidth:390, alignSelf:'center',
  },
  authShellWide: {
    maxWidth:900, minHeight:610, flexDirection:'row', backgroundColor:'#FFFFFF',
    borderRadius:32, overflow:'hidden', borderWidth:1, borderColor:'#EAE2EE',
    ...platformShadow('#3C194E',0.12,28,12,5),
  },
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
    color: '#29232D', fontFamily:uiFont,
    paddingHorizontal: 10,
    height: 52, fontSize: 15,
    outlineStyle: 'none',
    outlineWidth: 0,
  },
  inputReset: {
    flex: 1, color: '#462A5E', paddingHorizontal: 10, height: 56,
    fontSize: 16, outlineStyle: 'none', outlineWidth: 0,
  },

  imageContainer: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 34, paddingHorizontal: 2,
  },
  imageContainerWide:{width:'43%',marginBottom:0,paddingHorizontal:34,paddingVertical:34,justifyContent:'space-between',backgroundColor:'#F2E7FB'},
  brandRow:{flexDirection:'row',alignItems:'center',gap:12,alignSelf:'center'},
  logoShell:{width:62,height:62,borderRadius:19,backgroundColor:'#F0E4FA',borderWidth:1,borderColor:'#DFC8F0',alignItems:'center',justifyContent:'center'},
  mobileBrandAccent:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:9,marginBottom:18},
  mobileAccentLine:{width:28,height:2,borderRadius:2,backgroundColor:'#DCC6ED'},
  desktopVisual:{flex:1,width:'100%',alignItems:'center',justifyContent:'center',paddingTop:18},
  desktopHalo:{position:'absolute',width:270,height:270,borderRadius:135,backgroundColor:'#E5CFF8'},
  desktopMascot:{width:225,height:270,zIndex:1},
  desktopJapanese:{fontFamily:uiFont,fontSize:13,fontWeight:'400',letterSpacing:.5,color:'#68A83C',marginTop:5,zIndex:2},
  desktopTitle:{fontFamily:uiFont,fontSize:24,lineHeight:31,fontWeight:'400',letterSpacing:-0.3,color:'#382341',textAlign:'center',marginTop:8,zIndex:2},
  welcomeBadge:{flexDirection:'row',alignItems:'center',gap:7,backgroundColor:'#EEF7E7',borderRadius:99,paddingHorizontal:11,paddingVertical:7,marginBottom:7},
  welcomeBadgeText:{fontSize:8,fontWeight:'900',letterSpacing:1,color:'#568E35'},
  mascotWrap: { alignItems: 'center', justifyContent: 'center' },
  welcomeTitle:{fontFamily:'Jua',fontSize:23,lineHeight:29,color:'#3C2348',textAlign:'center',maxWidth:340,marginTop:5},
  subtitleText: { fontSize: 12, lineHeight:18,color: '#786D7D', marginTop: 4, textAlign: 'center',maxWidth:340 },
  formCard: {
    backgroundColor: 'transparent', paddingHorizontal: 0, paddingVertical: 0,
  },
  formCardWide:{flex:1,justifyContent:'center',borderWidth:0,borderRadius:0,paddingHorizontal:58,paddingVertical:42,shadowOpacity:0,elevation:0},
  formHeadingIcon:{width:42,height:42,borderRadius:14,backgroundColor:'#F1E5FA',alignItems:'center',justifyContent:'center',marginBottom:11},
  formEyebrow:{fontSize:8,fontWeight:'900',letterSpacing:1.2,color:'#6AAB3D',marginBottom:5},
  cardHeading: { alignItems: 'flex-start', marginBottom: 22 },
  cardHeadingMark: { width: 30, height: 4, borderRadius: 99, backgroundColor: '#8ED94D', marginBottom: 10 },
  formTitle: { fontFamily:uiFont,fontSize: 28, lineHeight:34, fontWeight:'400', color: '#29232D', letterSpacing:-0.3 },
  formSubtitle: { fontFamily:uiFont,color: '#817586', fontSize: 13, lineHeight:19, marginTop:5 },
  fieldLabel:{fontFamily:uiFont,fontSize:12,fontWeight:'500',color:'#514B55',marginBottom:8,marginLeft:1},
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F3FB',
    borderWidth: 1, borderColor:'#E5D9EA', borderRadius: 14, paddingHorizontal: 14, marginBottom: 14,
  },
  inputFocused:{borderColor:'#8A35D1',backgroundColor:'#FFFFFF',borderWidth:1.5},
  inputIcon: { marginRight: 2 },
  
  linkContainer: {
    marginTop: 17,
    alignItems: 'center',
  },

  linkText: {
      color: '#7B2CBF', fontFamily:uiFont,
      fontWeight: '500', fontSize: 13,
  },
  linkPrompt: { fontFamily:uiFont,color:'#817586', fontSize:13, textAlign:'center' },
  passwordLabelRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
  forgotRow: { alignItems:'flex-end', marginTop:8, marginBottom:2 },
  forgotText: { fontFamily:uiFont,color:'#7B2CBF', fontSize:13, fontWeight:'500' },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F3FB', borderWidth: 1, borderColor:'#E5D9EA', borderRadius: 14,
    paddingLeft: 15,
    marginBottom: 0,
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
    color: '#302936', fontFamily:uiFont,
    fontSize: 20, fontWeight:'400', letterSpacing:-0.2,
  },
  brandCaption:{fontFamily:uiFont,fontSize:10,fontWeight:'500',letterSpacing:.7,color:'#65A63B',marginTop:3},

  policyTextContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 20,
  },
  policyText: {
    fontFamily:uiFont,fontSize: 11,
    color: '#8A838C',
    textAlign: 'center',
  },
  linkText2: {
    fontFamily:uiFont,fontSize: 11,
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
    justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 24,paddingTop:30,paddingBottom:24,
    backgroundColor: '#FFFFFF', borderRadius: 22,
    width: '100%',
    maxWidth: 430,
    shadowColor: '#24152F', shadowOpacity: 0.25, shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 }, elevation: 12,
  },
  modalAccent:{position:'absolute',top:0,left:55,right:55,height:5,backgroundColor:'#8ED94D',borderBottomLeftRadius:5,borderBottomRightRadius:5},
  modalClose: { position: 'absolute', right: 18, top: 18, zIndex: 2, padding: 4 },
  modalIconWrap: {
    width: 54, height: 54, borderRadius: 18, backgroundColor: '#F2E8F9',
    alignItems: 'center', justifyContent: 'center',
  },
  modalIconHalo:{width:68,height:68,borderRadius:22,backgroundColor:'#FAF7FC',borderWidth:1,borderColor:'#E7DAED',alignItems:'center',justifyContent:'center',marginBottom:16},
  modalEyebrow:{fontSize:8,fontWeight:'900',letterSpacing:1.2,color:'#6AAB3D',marginBottom:6},
  
  modalTitle: {
    fontFamily:uiFont,fontSize: 22,fontWeight: '400',
    marginBottom: 8,
    textAlign: 'center',
    color: '#462A5E',
  },
  modalDescription: { fontFamily:uiFont,color: '#817586', fontSize: 14, lineHeight: 21, textAlign: 'center', marginBottom: 20 },
  resetFieldLabel:{width:'100%',fontSize:11,fontWeight:'800',color:'#54415E',marginBottom:7,marginLeft:2},
  resetInputContainer: {
    width: '100%', flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DDD7E0',
    borderRadius: 12, paddingHorizontal: 14, marginBottom: 16,
  },
  buttonReset: {
    backgroundColor: '#7B2CBF',
    padding: 12,
    width:  '100%',
    borderRadius: 12, height: 52,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9,
    
  },

  buttonTextReset: {
    color: '#fff',
    fontFamily:uiFont,fontSize: 15,fontWeight: '500',
  },
});

export default styles;
