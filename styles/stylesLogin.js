import { Platform, StyleSheet } from 'react-native';
import { platformShadow } from '../utils/platformShadow';

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#8423D9',
    padding: 12,
    width:  '100%',
    borderRadius: 16,
    borderColor: '#8423D9',
    borderBottomWidth: 0,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    ...platformShadow('#5E1A93', 0.18, 12, 6, 3),
  },
  buttonPressed: { opacity: 0.86, transform: [{ scale: 0.99 }] },

  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Jua',
  },

  buttonContainer: {
    alignItems:'center',
    marginTop: 10,
  },

  container: {
    flex: 1,
    backgroundColor: '#F8F4FC',
    overflow: 'hidden',
  },
  keyboardView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'web' ? 34 : 18,
    paddingBottom: 22,
  },
  authShell: { width:'100%', maxWidth:440, alignSelf:'center' },
  authShellWide: { maxWidth:480 },
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
    marginBottom: 18,
  },
  imageContainerWide:{alignItems:'center',marginBottom:16},
  welcomeBadge:{flexDirection:'row',alignItems:'center',gap:7,backgroundColor:'#EEF7E7',borderRadius:99,paddingHorizontal:11,paddingVertical:7,marginBottom:7},
  welcomeBadgeText:{fontSize:8,fontWeight:'900',letterSpacing:1,color:'#568E35'},
  mascotWrap: { width: 78, height: 78, borderRadius:22,alignItems: 'center', justifyContent: 'center', transform:[{scale:.68}] },
  welcomeTitle:{fontFamily:'Jua',fontSize:23,lineHeight:29,color:'#3C2348',textAlign:'center',maxWidth:340,marginTop:5},
  subtitleText: { fontSize: 12, lineHeight:18,color: '#786D7D', marginTop: 4, textAlign: 'center',maxWidth:340 },
  formCard: {
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 21,
    borderWidth:1,borderColor:'#E8DFEC',
    ...platformShadow('#462A5E',0.09,16,7,3),
  },
  formCardWide:{paddingHorizontal:25},
  formHeadingIcon:{width:42,height:42,borderRadius:14,backgroundColor:'#F1E5FA',alignItems:'center',justifyContent:'center',marginBottom:11},
  formEyebrow:{fontSize:8,fontWeight:'900',letterSpacing:1.2,color:'#6AAB3D',marginBottom:5},
  formTitle: { fontFamily:'Jua',fontSize: 27, color: '#3B2446', marginBottom: 20 },
  formSubtitle: { color: '#817586', fontSize: 12, lineHeight:18,marginBottom: 17 },
  fieldLabel:{fontSize:11,fontWeight:'800',color:'#54415E',marginBottom:7,marginLeft:2},
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FAF8FB',
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
      fontWeight: '800',
      fontSize: 12,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF8FB',
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
    color: '#8423D9',
    marginTop: 4,
    fontSize: 21,
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
