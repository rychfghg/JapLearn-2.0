import { Platform, StyleSheet } from 'react-native';
import { platformShadow } from '../utils/platformShadow';

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#8ED94D',
    padding: 12,
    width:  '100%',
    borderRadius: 16,
    borderColor: '#8AC25A',
    borderBottomWidth: Platform.OS === 'android' ? 0 : 6,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    ...(Platform.OS === 'android' ? platformShadow('#5B9032', 0.22, 10, 5, 2) : {}),
  },
  buttonPressed: { opacity: 0.86, transform: [{ scale: 0.99 }] },

  buttonText: {
    color: '#fff',
    fontSize: 22,
    fontFamily: 'Jua',
  },

  buttonContainer: {
    alignItems:'center',
    marginTop: 10,
  },

  container: {
    flex: 1,
    backgroundColor: '#FBF9FD',
    overflow: 'hidden',
  },
  keyboardView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 46,
    paddingBottom: 28,
  },
  authShell: { width:'100%', maxWidth:480, alignSelf:'center' },
  authShellWide: { maxWidth:1040, minHeight:620, flexDirection:'row', alignItems:'stretch', borderRadius:34, overflow:'hidden', backgroundColor:'#FFFFFF', borderWidth:1, borderColor:'#E6DDEB', ...platformShadow('#3B2146',0.12,24,10,5) },
  backgroundOrbTop: {
    position: 'absolute', width: 260, height: 260, borderRadius: 130,
    backgroundColor: '#F0E4FA', top: -105, right: -85,
  },
  backgroundOrbBottom: {
    position: 'absolute', width: 220, height: 220, borderRadius: 110,
    backgroundColor: '#EAF7DF', bottom: -115, left: -80,
  },

  input: {
    flex: 1,
    color: '#462A5E',
    paddingHorizontal: 10,
    height: 56,
    fontSize: 16,
    outlineStyle: 'none',
    outlineWidth: 0,
  },
  inputReset: {
    flex: 1, color: '#462A5E', paddingHorizontal: 10, height: 56,
    fontSize: 16, outlineStyle: 'none', outlineWidth: 0,
  },

  imageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  imageContainerWide:{flex:1,justifyContent:'center',alignItems:'flex-start',paddingHorizontal:52,paddingVertical:48,marginBottom:0,backgroundColor:'#F2E8F9'},
  welcomeBadge:{flexDirection:'row',alignItems:'center',gap:7,backgroundColor:'#EEF7E7',borderRadius:99,paddingHorizontal:11,paddingVertical:7,marginBottom:10},
  welcomeBadgeText:{fontSize:8,fontWeight:'900',letterSpacing:1,color:'#568E35'},
  mascotWrap: { width: 132, height: 132, alignItems: 'center', justifyContent: 'center' },
  welcomeTitle:{fontFamily:'Jua',fontSize:28,lineHeight:34,color:'#3C2348',textAlign:'center',maxWidth:380,marginTop:12},
  subtitleText: { fontSize: 14, lineHeight:21,color: '#706576', marginTop: 8, textAlign: 'center',maxWidth:390 },
  formCard: {
    backgroundColor: '#FFFFFF', borderRadius: 26, padding: 22,
    shadowColor: '#462A5E', shadowOpacity: 0.12, shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 }, elevation: 6,
  },
  formCardWide:{flex:1.05,borderRadius:0,justifyContent:'center',paddingHorizontal:54,shadowOpacity:0,elevation:0},
  formHeadingIcon:{width:46,height:46,borderRadius:15,backgroundColor:'#F1E5FA',alignItems:'center',justifyContent:'center',marginBottom:14},
  formEyebrow:{fontSize:8,fontWeight:'900',letterSpacing:1.2,color:'#6AAB3D',marginBottom:5},
  formTitle: { fontFamily:'Jua',fontSize: 28, color: '#462A5E', marginBottom: 5 },
  formSubtitle: { color: '#817586', fontSize: 13, lineHeight:19,marginBottom: 20 },
  fieldLabel:{fontSize:11,fontWeight:'800',color:'#54415E',marginBottom:7,marginLeft:2},
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F6F3F8',
    borderWidth: 1, borderColor: '#E8E0ED', borderRadius: 15, paddingHorizontal: 15,
    marginBottom: 12,
  },
  inputIcon: { marginRight: 2 },
  
  linkContainer: {
    marginTop: 16,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
  },

  linkText: {
      color: '#8423D9',
      fontWeight: '600',
      fontSize: 14,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F3F8',
    borderWidth: 1,
    borderColor: '#E8E0ED',
    borderRadius: 15,
    paddingLeft: 15,
    marginBottom: 4,
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
    color: '#8ED94D',
    marginTop: 8,
    fontSize: 28,
    fontFamily: 'Jua'  
  },

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
