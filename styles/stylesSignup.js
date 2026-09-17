import { Platform, StyleSheet } from 'react-native';
import { platformShadow } from '../utils/platformShadow';

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#8ED94D',
        padding: 10,
        width: '100%',
        borderRadius: 16,
        borderColor: '#8AC25A',
        borderBottomWidth: Platform.OS === 'android' ? 0 : 5,
        height: 60,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9,
        ...(Platform.OS === 'android' ? platformShadow('#5B9032', 0.22, 10, 5, 2) : {}),
    },
    buttonPressed: { opacity: 0.86, transform: [{ scale: 0.99 }] },

    buttonText: {
        color: '#fff',
        fontSize: 21,
        fontFamily: 'Jua',
    },

    buttonContainer: {
        alignItems: 'center',
        marginTop: 8,
    },

    container: {
        flex: 1,
        backgroundColor: '#FBF9FD',
        overflow: 'hidden',
    },
    scrollContent: { flexGrow: 1, justifyContent:'center',paddingHorizontal: 20, paddingVertical: 30 },
    contentWrapper: { width: '100%', maxWidth: 520, alignSelf: 'center' },
    contentWrapperWide:{maxWidth:1100,minHeight:690,flexDirection:'row',alignItems:'stretch',borderRadius:34,overflow:'hidden',backgroundColor:'#FFF',borderWidth:1,borderColor:'#E6DDEB',...platformShadow('#3B2146',0.12,24,10,5)},
    backgroundOrbTop: {
        position: 'absolute', width: 250, height: 250, borderRadius: 125,
        backgroundColor: '#F0E4FA', top: -120, right: -75,
    },
    backgroundOrbBottom: {
        position: 'absolute', width: 210, height: 210, borderRadius: 105,
        backgroundColor: '#EAF7DF', bottom: -110, left: -75,
    },
    formCard: {
        backgroundColor: '#FFFFFF', borderRadius: 26, padding: 22,
        shadowColor: '#462A5E', shadowOpacity: 0.12, shadowRadius: 20,
        shadowOffset: { width: 0, height: 8 }, elevation: 6,
    },
    formCardWide:{flex:1.15,borderRadius:0,paddingHorizontal:46,paddingVertical:36,justifyContent:'center',shadowOpacity:0,elevation:0},
    inputShell: {
        flexDirection: 'row', alignItems: 'center', gap: 2,
        backgroundColor: '#F6F3F8', borderWidth: 1, borderColor: '#E8E0ED',
        borderRadius: 15, paddingHorizontal: 15, marginBottom: 12,
    },

    input: {
        flex: 1, color: '#462A5E', paddingHorizontal: 10, height: 56,
        fontSize: 16, outlineStyle: 'none', outlineWidth: 0,
    },

    imageContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    imageContainerWide:{flex:.85,justifyContent:'center',alignItems:'flex-start',paddingHorizontal:48,paddingVertical:46,marginBottom:0,backgroundColor:'#F2E8F9'},
    welcomeBadge:{flexDirection:'row',alignItems:'center',gap:7,backgroundColor:'#EEF7E7',borderRadius:99,paddingHorizontal:11,paddingVertical:7,marginBottom:18},
    welcomeBadgeText:{fontSize:8,fontWeight:'900',letterSpacing:1,color:'#568E35'},
    brandText: { color: '#8ED94D', fontSize: 20, fontFamily: 'Jua', marginTop: 8 },
    heroTitle:{fontFamily:'Jua',fontSize:28,lineHeight:35,color:'#3C2348',textAlign:'center',maxWidth:390,marginTop:14},
    subtitleText: { color: '#74687A', fontSize: 14,lineHeight:21, marginTop: 8, textAlign: 'center',maxWidth:390 },
    formHeading:{flexDirection:'row',alignItems:'center',gap:12,marginBottom:8},
    formHeadingIcon:{width:46,height:46,borderRadius:15,backgroundColor:'#F1E5FA',alignItems:'center',justifyContent:'center'},
    formEyebrow:{fontSize:8,fontWeight:'900',letterSpacing:1.1,color:'#6AAB3D',marginBottom:2},
    formSubtitle:{color:'#817586',fontSize:12,lineHeight:18,marginBottom:17},
    fieldLabel:{fontSize:11,fontWeight:'800',color:'#54415E',marginBottom:7,marginLeft:2},

    linkContainer: {
        marginTop: 20,
        alignItems: 'center',
    },

    linkText: {
        color: '#8423D9',
        fontWeight: '700',
        fontSize: 14,
    },
    linkPrompt: { color: '#817586', fontSize: 14 },

    errorInput: {
        borderWidth: 1,
        borderColor: '#D84343',
    },

    errorText: {
        color: '#B3261E',
        marginLeft: 5,
        marginBottom: 18,
        fontSize: 12,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
        width: '100%',
        backgroundColor: '#F6F3F8', borderWidth: 1, borderColor: '#E8E0ED',
        borderRadius: 15, paddingLeft: 15, marginBottom: 12,
    },
    passwordInput: {
        flex: 1,
        paddingRight: 40,
    },
    insideInputButton: {
        position: 'absolute',
        right: 8,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleText: {
        fontSize: 25,
        fontFamily: 'Jua',
        color: '#462A5E',
        marginTop: 0,
        textAlign: 'center',
    },

    modalWrapper: {
        flex: 1,
       
        justifyContent: 'flex-start', // Align to the top for scrolling
        paddingTop: 50, // Add space at the top
    },
    
    modalContent: {
        width: '90%',
        maxHeight: '80%', // Allow some space at the top and bottom
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
    },
    

});

export default styles;
