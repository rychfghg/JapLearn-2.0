import { Platform, StyleSheet } from 'react-native';
import { platformShadow } from '../utils/platformShadow';

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#7D20D4', padding: 10, width: '100%', borderRadius: 14,
        borderColor: '#7D20D4', borderBottomWidth: 0, height: 54,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9,
        ...platformShadow('#5E1A93', 0.2, 10, 5, 2),
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
        backgroundColor: '#F3EDF7',
        overflow: 'hidden',
    },
    scrollContent: { flexGrow: 1, justifyContent:'center',paddingHorizontal: 18, paddingTop:Platform.OS==='web'?28:18,paddingBottom:24 },
    contentWrapper: {
        width: '100%', maxWidth: 430, alignSelf: 'center', backgroundColor:'#FFFFFF',
        borderRadius:32, overflow:'hidden', borderWidth:1, borderColor:'#E7DBED',
        ...platformShadow('#3C194E', 0.13, 24, 10, 5),
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
        backgroundColor: '#FFFFFF', borderTopLeftRadius: 30, borderTopRightRadius: 30,
        paddingHorizontal: 22, paddingTop: 25, paddingBottom: 23, marginTop:-20,
    },
    formCardWide:{paddingHorizontal:25},
    inputShell: {
        flexDirection: 'row', alignItems: 'center', gap: 2,
        backgroundColor: '#F5F1F7', borderWidth: 0,
        borderRadius: 14, paddingHorizontal: 14, marginBottom: 12,
    },

    input: {
        flex: 1, color: '#462A5E', paddingHorizontal: 9, height: 55,
        fontSize: 15, outlineStyle: 'none', outlineWidth: 0,
    },

    imageContainer: {
        alignItems: 'center',
        width: '100%',
        marginBottom: 0,
        paddingTop: 27,
        paddingBottom: 41,
        overflow: 'hidden',
    },
    imageContainerWide:{alignItems:'center',marginBottom:0},
    logoBadge: {
        zIndex: 2,
        width: 82, height: 82, borderRadius: 24, alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: 'rgba(255,255,255,0.72)',
        ...platformShadow('#321044', 0.2, 12, 5, 3),
    },
    brandGlow: { position:'absolute', width:210, height:210, borderRadius:105, backgroundColor:'rgba(255,255,255,0.09)', right:-64, top:-92 },
    brandDotOne: { position:'absolute', width:18, height:18, borderRadius:9, backgroundColor:'rgba(142,217,77,0.72)', left:32, top:34 },
    brandDotTwo: { position:'absolute', width:8, height:8, borderRadius:4, backgroundColor:'rgba(255,255,255,0.55)', right:45, bottom:37 },
    welcomeBadge:{flexDirection:'row',alignItems:'center',gap:7,backgroundColor:'#EEF7E7',borderRadius:99,paddingHorizontal:11,paddingVertical:7,marginBottom:8},
    welcomeBadgeText:{fontSize:8,fontWeight:'900',letterSpacing:1,color:'#568E35'},
    brandText: { zIndex:2, color: '#FFFFFF', fontSize: 24, fontFamily: 'Jua', marginTop: 8 },
    cardHeading: { alignItems: 'flex-start', marginBottom: 21 },
    cardHeadingMark: { width: 30, height: 4, borderRadius: 99, backgroundColor: '#8ED94D', marginBottom: 10 },
    nameRow: { flexDirection: 'row', gap: 10 },
    nameField: { flex: 1, minWidth: 0 },
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
        backgroundColor: '#F5F1F7', borderWidth: 0,
        borderRadius: 14, paddingLeft: 14, marginBottom: 12,
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
        fontSize: 29,
        fontFamily: 'Jua',
        color: '#3B2446',
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
