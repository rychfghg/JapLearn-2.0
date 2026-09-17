import { Platform, StyleSheet } from 'react-native';
import { platformShadow } from '../utils/platformShadow';

const uiFont = Platform.select({ android: 'sans-serif', ios: 'System', web: 'Inter, system-ui, sans-serif' });

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#7B2CBF', padding: 10, width: '100%', borderRadius: 12,
        height: 52,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9,
    },
    buttonPressed: { opacity: 0.86, transform: [{ scale: 0.99 }] },

    buttonText: {
        color: '#fff',
        fontFamily:uiFont,fontSize: 15,fontWeight: '500',
    },

    buttonContainer: {
        alignItems: 'center',
        marginTop: 8,
    },

    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
    },
    scrollContent: { flexGrow: 1, justifyContent:'center',paddingHorizontal: 24, paddingTop:Platform.OS==='web'?32:30,paddingBottom:24 },
    contentWrapper: {
        width: '100%', maxWidth: 390, alignSelf: 'center',
    },
    contentWrapperWide:{maxWidth:940,minHeight:680,flexDirection:'row',backgroundColor:'#FFFFFF',borderRadius:32,overflow:'hidden',borderWidth:1,borderColor:'#EAE2EE',...platformShadow('#3C194E',0.12,28,12,5)},
    backgroundOrbTop: {
        position: 'absolute', width: 290, height: 290, borderRadius: 145,
        backgroundColor: '#EFE0FB', top: -132, right: -105,
    },
    backgroundOrbBottom: {
        position: 'absolute', width: 240, height: 240, borderRadius: 120,
        backgroundColor: '#E9F6DE', bottom: -128, left: -92,
    },
    formCard: {
        backgroundColor: 'transparent', paddingHorizontal: 0, paddingVertical: 0,
    },
    formCardWide:{flex:1,justifyContent:'center',borderWidth:0,borderRadius:0,paddingHorizontal:52,paddingVertical:34,shadowOpacity:0,elevation:0},
    inputShell: {
        flexDirection: 'row', alignItems: 'center', gap: 2,
        backgroundColor: '#FFFFFF', borderWidth: 1, borderColor:'#DDD7E0',
        borderRadius: 12, paddingHorizontal: 14, marginBottom: 12,
    },

    input: {
        flex: 1, color: '#29232D', fontFamily:uiFont,paddingHorizontal: 9, height: 52,
        fontSize: 15, outlineStyle: 'none', outlineWidth: 0,
    },

    imageContainer: {
        alignItems: 'center',
        width: '100%',
        marginBottom: 34,
        paddingHorizontal: 4,
    },
    imageContainerWide:{width:'42%',marginBottom:0,paddingHorizontal:32,paddingVertical:34,justifyContent:'space-between',backgroundColor:'#F2E7FB'},
    brandRow:{flexDirection:'row',alignItems:'center',gap:11,alignSelf:'center'},
    desktopVisual:{flex:1,width:'100%',alignItems:'center',justifyContent:'center',paddingTop:12},
    desktopHalo:{position:'absolute',width:270,height:270,borderRadius:135,backgroundColor:'#E5CFF8'},
    desktopMascot:{width:225,height:270,zIndex:1},
    desktopJapanese:{fontSize:13,fontWeight:'900',letterSpacing:1.5,color:'#68A83C',marginTop:5,zIndex:2},
    desktopTitle:{fontSize:23,lineHeight:29,fontWeight:'900',letterSpacing:-0.5,color:'#382341',textAlign:'center',marginTop:8,zIndex:2},
    logoBadge: { alignItems: 'center', justifyContent: 'center' },
    welcomeBadge:{flexDirection:'row',alignItems:'center',gap:7,backgroundColor:'#EEF7E7',borderRadius:99,paddingHorizontal:11,paddingVertical:7,marginBottom:8},
    welcomeBadgeText:{fontSize:8,fontWeight:'900',letterSpacing:1,color:'#568E35'},
    brandText: { color: '#302936', fontFamily:uiFont,fontSize: 20,fontWeight:'400',letterSpacing:-0.2 },
    brandCaption:{fontSize:9,fontWeight:'900',letterSpacing:1.4,color:'#72AD43',marginTop:2},
    cardHeading: { alignItems: 'flex-start', marginBottom: 21 },
    cardHeadingMark: { width: 30, height: 4, borderRadius: 99, backgroundColor: '#8ED94D', marginBottom: 10 },
    nameRow: { flexDirection: 'row', gap: 10 },
    nameField: { flex: 1, minWidth: 0 },
    heroTitle:{fontFamily:'Jua',fontSize:22,lineHeight:28,color:'#3C2348',textAlign:'center',maxWidth:350,marginTop:5},
    subtitleText: { color: '#74687A', fontSize: 12,lineHeight:18, marginTop: 4, textAlign: 'center',maxWidth:350 },
    formHeading:{flexDirection:'row',alignItems:'center',gap:12,marginBottom:8},
    formHeadingIcon:{width:42,height:42,borderRadius:14,backgroundColor:'#F1E5FA',alignItems:'center',justifyContent:'center'},
    formEyebrow:{fontSize:8,fontWeight:'900',letterSpacing:1.1,color:'#6AAB3D',marginBottom:2},
    formSubtitle:{fontFamily:uiFont,color:'#817586',fontSize:13,lineHeight:19,marginTop:5},
    fieldLabel:{fontFamily:uiFont,fontSize:12,fontWeight:'500',color:'#514B55',marginBottom:8,marginLeft:1},
    inputFocused:{borderColor:'#7B2CBF',backgroundColor:'#FFFFFF'},

    linkContainer: {
        marginTop: 20,
        alignItems: 'center',
    },

    linkText: {
        color: '#7B2CBF',fontFamily:uiFont,fontWeight: '500',fontSize: 13,
    },
    linkPrompt: { color: '#817586', fontFamily:uiFont,fontSize: 13 },

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
        backgroundColor: '#FFFFFF', borderWidth: 1, borderColor:'#DDD7E0',
        borderRadius: 12, paddingLeft: 14, marginBottom: 12,
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
        fontFamily:uiFont,fontSize: 28, lineHeight:34,
        fontWeight:'400', letterSpacing:-0.3,color: '#29232D',
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
