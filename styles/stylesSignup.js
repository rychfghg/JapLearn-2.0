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
    scrollContent: { flexGrow: 1, justifyContent:'center',paddingHorizontal: 22, paddingTop:Platform.OS==='web'?34:22,paddingBottom:30 },
    contentWrapper: { width: '100%', maxWidth: 450, alignSelf: 'center' },
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
        backgroundColor: '#FFFDFF', borderRadius: 28, paddingHorizontal: 22, paddingVertical: 24,
        borderWidth:1,borderColor:'#E9DDEF', overflow: 'hidden',
        ...platformShadow('#462A5E',0.11,20,9,4),
    },
    formCardWide:{paddingHorizontal:25},
    inputShell: {
        flexDirection: 'row', alignItems: 'center', gap: 2,
        backgroundColor: '#F9F6FB', borderWidth: 1.5, borderColor: '#E2D6E8',
        borderRadius: 16, paddingHorizontal: 14, marginBottom: 13,
    },

    input: {
        flex: 1, color: '#462A5E', paddingHorizontal: 9, height: 55,
        fontSize: 15, outlineStyle: 'none', outlineWidth: 0,
    },

    imageContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    imageContainerWide:{alignItems:'center',marginBottom:15},
    logoBadge: {
        width: 88, height: 88, borderRadius: 26, alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E8D9F2',
        ...platformShadow('#5D2777', 0.12, 13, 5, 2),
    },
    welcomeBadge:{flexDirection:'row',alignItems:'center',gap:7,backgroundColor:'#EEF7E7',borderRadius:99,paddingHorizontal:11,paddingVertical:7,marginBottom:8},
    welcomeBadgeText:{fontSize:8,fontWeight:'900',letterSpacing:1,color:'#568E35'},
    brandText: { color: '#3B2446', fontSize: 23, fontFamily: 'Jua', marginTop: 8 },
    cardHeading: { alignItems: 'center', marginBottom: 23 },
    cardHeadingMark: { width: 38, height: 5, borderRadius: 99, backgroundColor: '#8ED94D', marginBottom: 12 },
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
        backgroundColor: '#F9F6FB', borderWidth: 1.5, borderColor: '#E2D6E8',
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
        fontSize: 28,
        fontFamily: 'Jua',
        color: '#3B2446',
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
