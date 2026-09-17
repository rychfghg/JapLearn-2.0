import { Platform, StyleSheet } from 'react-native';
import { platformShadow } from '../utils/platformShadow';

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#7526C9', padding: 10, width: '100%', borderRadius: 16,
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
        alignItems: 'center',
        marginTop: 8,
    },

    container: {
        flex: 1,
        backgroundColor: '#F8F5FA',
        overflow: 'hidden',
    },
    scrollContent: { flexGrow: 1, justifyContent:'center',paddingHorizontal: 22, paddingTop:Platform.OS==='web'?36:24,paddingBottom:28 },
    contentWrapper: {
        width: '100%', maxWidth: 420, alignSelf: 'center',
    },
    contentWrapperWide:{maxWidth:470},
    backgroundOrbTop: {
        position: 'absolute', width: 290, height: 290, borderRadius: 145,
        backgroundColor: '#EFE0FB', top: -132, right: -105,
    },
    backgroundOrbBottom: {
        position: 'absolute', width: 240, height: 240, borderRadius: 120,
        backgroundColor: '#E9F6DE', bottom: -128, left: -92,
    },
    formCard: {
        backgroundColor: '#FFFFFF', borderRadius:26,
        paddingHorizontal: 22, paddingTop: 25, paddingBottom: 23,
        borderWidth:1,borderColor:'#EAE2EE',
        ...platformShadow('#3C194E',0.10,20,8,4),
    },
    formCardWide:{paddingHorizontal:25},
    inputShell: {
        flexDirection: 'row', alignItems: 'center', gap: 2,
        backgroundColor: '#FAF8FB', borderWidth: 1, borderColor:'#E7DFEB',
        borderRadius: 16, paddingHorizontal: 14, marginBottom: 13,
    },

    input: {
        flex: 1, color: '#35243D', paddingHorizontal: 9, height: 56,
        fontSize: 15, outlineStyle: 'none', outlineWidth: 0,
    },

    imageContainer: {
        flexDirection:'row', alignItems: 'center', gap:13,
        width: '100%',
        marginBottom: 22,
        paddingHorizontal: 4,
    },
    imageContainerWide:{alignItems:'center',marginBottom:0},
    logoBadge: { alignItems: 'center', justifyContent: 'center' },
    welcomeBadge:{flexDirection:'row',alignItems:'center',gap:7,backgroundColor:'#EEF7E7',borderRadius:99,paddingHorizontal:11,paddingVertical:7,marginBottom:8},
    welcomeBadgeText:{fontSize:8,fontWeight:'900',letterSpacing:1,color:'#568E35'},
    brandText: { color: '#35213F', fontSize: 23, fontFamily: 'Jua' },
    brandCaption:{fontSize:9,fontWeight:'900',letterSpacing:1.4,color:'#72AD43',marginTop:2},
    cardHeading: { alignItems: 'flex-start', marginBottom: 22 },
    cardHeadingMark: { width: 30, height: 4, borderRadius: 99, backgroundColor: '#8ED94D', marginBottom: 10 },
    nameRow: { flexDirection: 'row', gap: 10 },
    nameField: { flex: 1, minWidth: 0 },
    heroTitle:{fontFamily:'Jua',fontSize:22,lineHeight:28,color:'#3C2348',textAlign:'center',maxWidth:350,marginTop:5},
    subtitleText: { color: '#74687A', fontSize: 12,lineHeight:18, marginTop: 4, textAlign: 'center',maxWidth:350 },
    formHeading:{flexDirection:'row',alignItems:'center',gap:12,marginBottom:8},
    formHeadingIcon:{width:42,height:42,borderRadius:14,backgroundColor:'#F1E5FA',alignItems:'center',justifyContent:'center'},
    formEyebrow:{fontSize:8,fontWeight:'900',letterSpacing:1.1,color:'#6AAB3D',marginBottom:2},
    formSubtitle:{color:'#817586',fontSize:13,lineHeight:19,marginTop:3},
    fieldLabel:{fontSize:12,fontWeight:'800',color:'#514057',marginBottom:8,marginLeft:2},
    inputFocused:{borderColor:'#8423D9',backgroundColor:'#FFFFFF',shadowColor:'#8423D9',shadowOpacity:0.08,shadowRadius:8,shadowOffset:{width:0,height:2},elevation:1},

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
        marginLeft: 4,
        marginTop: -7,
        marginBottom: 12,
        fontSize: 12,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
        width: '100%',
        backgroundColor: '#FAF8FB', borderWidth: 1, borderColor:'#E7DFEB',
        borderRadius: 16, paddingLeft: 14, marginBottom: 13,
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
        fontSize: 29, lineHeight:35,
        fontWeight:'900', letterSpacing:-0.7,
        color: '#302036',
        textAlign: 'left',
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
