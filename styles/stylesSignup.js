import { Platform, StyleSheet } from 'react-native';
import { platformShadow } from '../utils/platformShadow';

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#8423D9',
        padding: 10,
        width: '100%',
        borderRadius: 16,
        borderColor: '#8423D9',
        borderBottomWidth: 0,
        height: 56,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9,
        ...platformShadow('#5E1A93', 0.18, 12, 6, 3),
    },
    buttonPressed: { opacity: 0.86, transform: [{ scale: 0.99 }] },

    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontFamily: 'Jua',
    },

    buttonContainer: {
        alignItems: 'center',
        marginTop: 8,
    },

    container: {
        flex: 1,
        backgroundColor: '#F8F4FC',
        overflow: 'hidden',
    },
    scrollContent: { flexGrow: 1, justifyContent:'center',paddingHorizontal: 20, paddingTop:Platform.OS==='web'?30:18,paddingBottom:30 },
    contentWrapper: { width: '100%', maxWidth: 470, alignSelf: 'center' },
    contentWrapperWide:{maxWidth:500},
    backgroundOrbTop: {
        position: 'absolute', width: 250, height: 250, borderRadius: 125,
        backgroundColor: '#F0E4FA', top: -120, right: -75,
    },
    backgroundOrbBottom: {
        position: 'absolute', width: 210, height: 210, borderRadius: 105,
        backgroundColor: '#EAF7DF', bottom: -110, left: -75,
    },
    formCard: {
        backgroundColor: '#FFFFFF', borderRadius: 24, padding: 21,
        borderWidth:1,borderColor:'#E8DFEC',
        ...platformShadow('#462A5E',0.09,16,7,3),
    },
    formCardWide:{paddingHorizontal:25},
    inputShell: {
        flexDirection: 'row', alignItems: 'center', gap: 2,
        backgroundColor: '#FAF8FB', borderWidth: 1, borderColor: '#E8E0ED',
        borderRadius: 15, paddingHorizontal: 15, marginBottom: 12,
    },

    input: {
        flex: 1, color: '#462A5E', paddingHorizontal: 10, height: 56,
        fontSize: 16, outlineStyle: 'none', outlineWidth: 0,
    },

    imageContainer: {
        alignItems: 'center',
        marginBottom: 15,
    },
    imageContainerWide:{alignItems:'center',marginBottom:15},
    welcomeBadge:{flexDirection:'row',alignItems:'center',gap:7,backgroundColor:'#EEF7E7',borderRadius:99,paddingHorizontal:11,paddingVertical:7,marginBottom:8},
    welcomeBadgeText:{fontSize:8,fontWeight:'900',letterSpacing:1,color:'#568E35'},
    brandText: { color: '#8423D9', fontSize: 18, fontFamily: 'Jua', marginTop: 4 },
    heroTitle:{fontFamily:'Jua',fontSize:22,lineHeight:28,color:'#3C2348',textAlign:'center',maxWidth:350,marginTop:5},
    subtitleText: { color: '#74687A', fontSize: 12,lineHeight:18, marginTop: 4, textAlign: 'center',maxWidth:350 },
    formHeading:{flexDirection:'row',alignItems:'center',gap:12,marginBottom:8},
    formHeadingIcon:{width:42,height:42,borderRadius:14,backgroundColor:'#F1E5FA',alignItems:'center',justifyContent:'center'},
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
        backgroundColor: '#FAF8FB', borderWidth: 1, borderColor: '#E8E0ED',
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
