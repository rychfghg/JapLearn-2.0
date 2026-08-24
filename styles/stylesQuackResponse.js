import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
  responseBadgeStage:{width:195,height:195,alignItems:'center',justifyContent:'center',overflow:'hidden'},responseBadgeGlow:{position:'absolute',width:178,height:178,borderRadius:89,backgroundColor:'rgba(117,66,186,.10)'},responseBadgeOuter:{width:156,height:156,borderRadius:78,backgroundColor:'#F1E8F7',borderWidth:2,borderColor:'#D2B9E5',alignItems:'center',justifyContent:'center',shadowColor:'#7542BA',shadowOpacity:.22,shadowRadius:20,elevation:8},responseBadgeInner:{width:124,height:124,borderRadius:62,backgroundColor:'#7542BA',borderWidth:5,borderColor:'#E4D3F0',alignItems:'center',justifyContent:'center'},responseBadgeCharacter:{position:'absolute',fontFamily:'Jua',fontSize:76,color:'rgba(255,255,255,.14)'},responseBadgeSweep:{position:'absolute',width:29,height:195,backgroundColor:'rgba(255,255,255,.44)',zIndex:8},responseSparkleOne:{position:'absolute',left:8,top:25,color:'#67AA41',fontSize:24,zIndex:9},responseSparkleTwo:{position:'absolute',right:8,bottom:26,color:'#D4953A',fontSize:20,zIndex:9},gameBadgeStage:{width:205,height:205,alignItems:'center',justifyContent:'center',overflow:'hidden'},gameBadgeGlow:{position:'absolute',width:188,height:188,borderRadius:94},gameBadgeOuter:{width:158,height:158,borderRadius:79,backgroundColor:'#FFF',borderWidth:2,alignItems:'center',justifyContent:'center',shadowColor:'#493152',shadowOpacity:.15,shadowRadius:18,elevation:8},gameBadgeInner:{width:126,height:126,borderRadius:63,borderWidth:5,borderColor:'rgba(255,255,255,.46)',alignItems:'center',justifyContent:'center'},gameBadgeCharacter:{position:'absolute',fontFamily:'Jua',fontSize:77,color:'rgba(255,255,255,.18)'},gameBadgeSweep:{position:'absolute',width:29,height:205,backgroundColor:'rgba(255,255,255,.44)',zIndex:8},gameBadgeMascot:{position:'absolute',width:68,height:78,right:3,bottom:3,zIndex:9},gameBadgeSparkle:{position:'absolute',left:8,top:24,fontSize:24,zIndex:9},gameLoadNote:{flexDirection:'row',alignItems:'center',gap:7,backgroundColor:'#F6F2F8',borderRadius:13,paddingHorizontal:13,paddingVertical:10,marginTop:16},gameLoadNoteText:{color:'#675A6D',fontSize:9,fontWeight:'700'},
  loadContent:{width:'100%',alignItems:'center'},loadJapanese:{color:'#67AA41',fontFamily:'Jua',fontSize:11,letterSpacing:2,marginTop:1,marginBottom:6},loadSteps:{flexDirection:'row',gap:6,marginTop:13},loadStep:{width:25,height:4,borderRadius:2,backgroundColor:'#DDD3E3'},loadStepActive:{backgroundColor:'#7542BA'},loadFooter:{flexDirection:'row',alignItems:'center',gap:7,marginTop:17,backgroundColor:'#F2EBF6',borderRadius:14,paddingHorizontal:13,paddingVertical:10},loadFooterText:{color:'#65566D',fontSize:9,fontWeight:'700'},gameLoadOrbTop:{right:-125,top:-95},gameLoadOrbBottom:{left:-145,bottom:-100},
  japanSun:{position:'absolute',width:15,height:15,borderRadius:8,backgroundColor:'rgba(255,255,255,.78)',right:18,top:24},
  responseArtCircleInner:{position:'absolute',width:92,height:92,borderRadius:46,borderWidth:1,borderColor:'rgba(255,255,255,.34)',backgroundColor:'rgba(255,255,255,.06)',bottom:20},
  toriiTop:{position:'absolute',width:98,height:7,borderRadius:4,backgroundColor:'rgba(255,255,255,.32)',top:35},
  toriiBeam:{position:'absolute',width:79,height:5,borderRadius:3,backgroundColor:'rgba(255,255,255,.23)',top:48},
  toriiLeft:{position:'absolute',width:6,height:61,borderRadius:3,backgroundColor:'rgba(255,255,255,.22)',top:42,left:34,transform:[{rotate:'3deg'}]},
  toriiRight:{position:'absolute',width:6,height:61,borderRadius:3,backgroundColor:'rgba(255,255,255,.22)',top:42,right:34,transform:[{rotate:'-3deg'}]},
  kanjiSeal:{width:72,height:72,borderRadius:22,backgroundColor:'rgba(255,255,255,.93)',borderWidth:1,borderColor:'rgba(255,255,255,.65)',alignItems:'center',justifyContent:'center',zIndex:3,shadowColor:'#2D123B',shadowOpacity:.12,shadowRadius:8,elevation:3},
  kanjiText:{fontFamily:'Jua',fontSize:45,color:'#FFFFFF',zIndex:3,textShadowColor:'rgba(53,25,64,.16)',textShadowRadius:6,textShadowOffset:{width:0,height:2}},
  readingPill:{zIndex:3,marginTop:3,backgroundColor:'rgba(255,255,255,.17)',borderRadius:99,paddingHorizontal:9,paddingVertical:4},
  kanjiReading:{color:'#FFFFFF',fontSize:7,fontWeight:'900',letterSpacing:1},
  sampleLabel:{position:'absolute',top:15,left:7,right:1,zIndex:5,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:4},
  sampleLabelText:{fontSize:6,fontWeight:'900',letterSpacing:.6,color:'#6E4BC6'},
  responseMascotLeft:{position:'absolute',width:93,height:132,left:-3,bottom:5,zIndex:2,transform:[{scaleX:-1}]},
  responseMascotRight:{position:'absolute',width:93,height:132,right:-5,bottom:5,zIndex:2},
  promptChip:{position:'absolute',left:-2,top:43,zIndex:5,backgroundColor:'#FFF',borderRadius:10,paddingHorizontal:7,paddingVertical:5,shadowColor:'#4C335C',shadowOpacity:.10,shadowRadius:6,elevation:2},
  promptChipText:{fontFamily:'Jua',fontSize:8,color:'#6E4BC6'},
  safeArea:{flex:1,backgroundColor:'#FCFAFF'},lightOverlay:{...StyleSheet.absoluteFillObject,backgroundColor:'rgba(252,250,255,.94)'},menuScroll:{paddingHorizontal:14,paddingTop:10,paddingBottom:30},topBar:{flexDirection:'row',alignItems:'center'},menuBack:{width:44,height:44,borderRadius:14,backgroundColor:'#FFF',alignItems:'center',justifyContent:'center',shadowColor:'#4C335C',shadowOpacity:.09,shadowRadius:9,elevation:3},menuBrand:{flexDirection:'row',alignItems:'center',gap:6,marginLeft:11},menuBrandText:{color:'#4A3158',fontSize:8,fontWeight:'900',letterSpacing:1},menuTopIcon:{marginLeft:'auto',width:44,height:44,borderRadius:14,backgroundColor:'#FFF',alignItems:'center',justifyContent:'center',shadowColor:'#4C335C',shadowOpacity:.09,shadowRadius:9,elevation:3},responseHero:{minHeight:280,marginTop:14,borderRadius:24,overflow:'hidden',backgroundColor:'#F8F1FB',borderWidth:1,borderColor:'#E1D4E8',flexDirection:'row',paddingLeft:19,alignItems:'center'},heroBurstOne:{position:'absolute',width:235,height:235,borderRadius:118,right:-35,top:24,backgroundColor:'#EDDCF7'},heroBurstTwo:{position:'absolute',width:110,height:110,borderRadius:55,right:92,top:-45,backgroundColor:'rgba(216,79,131,.10)'},heroCopy:{width:'58%',zIndex:3},heroPill:{alignSelf:'flex-start',flexDirection:'row',alignItems:'center',gap:5,backgroundColor:'#FFF',borderWidth:1,borderColor:'#F1D8E4',borderRadius:8,paddingHorizontal:8,paddingVertical:6,marginBottom:9},heroPillText:{color:'#B83C6B',fontSize:7,fontWeight:'900'},responseHeroTitle:{color:'#30193D',fontFamily:'Jua',fontSize:25,lineHeight:29},responseHeroText:{color:'#6C6072',fontSize:10,lineHeight:15,marginTop:7},heroButton:{alignSelf:'flex-start',flexDirection:'row',alignItems:'center',gap:6,backgroundColor:'#D84F83',borderRadius:9,paddingHorizontal:11,paddingVertical:9,marginTop:14},heroButtonText:{color:'#FFF',fontSize:8,fontWeight:'900'},heroMascotStage:{width:'42%',height:238,alignItems:'center',justifyContent:'flex-end',alignSelf:'flex-end'},heroMascotHalo:{position:'absolute',width:166,height:166,borderRadius:83,backgroundColor:'rgba(110,75,198,.13)',bottom:19,right:-7},responseMascot:{width:158,height:205,zIndex:2},speechChip:{position:'absolute',right:5,top:39,zIndex:4,backgroundColor:'#FFF',borderRadius:12,paddingHorizontal:9,paddingVertical:6,shadowColor:'#4C335C',shadowOpacity:.12,shadowRadius:8,elevation:3},speechChipText:{fontFamily:'Jua',fontSize:12,color:'#D84F83'},responseHeading:{flexDirection:'row',alignItems:'flex-end',justifyContent:'space-between',marginTop:22,marginBottom:12},responseSectionTitle:{fontFamily:'Jua',fontSize:20,color:'#382044'},responseSectionText:{fontSize:9,color:'#817586',marginTop:2,maxWidth:260},responseCount:{backgroundColor:'#F8EAF0',borderRadius:99,paddingHorizontal:9,paddingVertical:6},responseCountText:{fontSize:7,fontWeight:'900',color:'#B83C6B'},responseList:{gap:12},responseCard:{minHeight:205,borderRadius:20,borderWidth:1,borderColor:'rgba(255,255,255,.25)',padding:15,overflow:'hidden'},responsePressed:{opacity:.86,transform:[{scale:.99}]},responseGlow:{position:'absolute',width:190,height:190,borderRadius:95,right:-35,top:10,backgroundColor:'rgba(255,255,255,.13)'},responseCharacter:{position:'absolute',right:19,bottom:-29,color:'rgba(255,255,255,.11)',fontFamily:'Jua',fontSize:112},responseCardTop:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',zIndex:3},responseBadge:{flexDirection:'row',alignItems:'center',gap:5,backgroundColor:'#FFF',borderRadius:8,paddingHorizontal:8,paddingVertical:6},responseBadgeText:{fontSize:7,fontWeight:'900',letterSpacing:.7},responseGameNumber:{color:'rgba(255,255,255,.74)',fontSize:7,fontWeight:'900'},responseCardBody:{flex:1,flexDirection:'row',alignItems:'flex-end'},responseCardCopy:{width:'62%',zIndex:3,paddingTop:14},responseCardTitle:{color:'#FFF',fontFamily:'Jua',fontSize:22},responseCardSubtitle:{color:'#FFF',fontSize:10,fontWeight:'800',marginTop:2},responseCardDescription:{color:'rgba(255,255,255,.80)',fontSize:9,lineHeight:13,marginTop:5},responsePlay:{alignSelf:'flex-start',height:31,borderRadius:8,backgroundColor:'#FFF',flexDirection:'row',gap:5,paddingHorizontal:10,alignItems:'center',marginTop:11},responsePlayText:{fontSize:8,fontWeight:'900'},responseArt:{width:'38%',height:145,alignItems:'center',justifyContent:'flex-end'},responseArtCircle:{position:'absolute',width:125,height:125,borderRadius:63,backgroundColor:'rgba(255,255,255,.14)',bottom:3},responseCardMascot:{width:125,height:145,zIndex:2},premiumLoading:{flex:1,backgroundColor:'#F9F2FC',alignItems:'center',justifyContent:'center',paddingHorizontal:24,overflow:'hidden'},loadOrbOne:{position:'absolute',width:300,height:300,borderRadius:150,right:-130,top:-100,backgroundColor:'rgba(110,75,198,.12)'},loadOrbTwo:{position:'absolute',width:250,height:250,borderRadius:125,left:-125,bottom:-90,backgroundColor:'rgba(216,79,131,.10)'},loadCard:{width:'100%',maxWidth:390,backgroundColor:'#FFF',borderRadius:30,padding:24,alignItems:'center',shadowColor:'#402253',shadowOpacity:.15,shadowRadius:24,shadowOffset:{width:0,height:12},elevation:11},loadBrand:{alignSelf:'flex-start',flexDirection:'row',gap:7,alignItems:'center',backgroundColor:'#FCEBF2',borderRadius:99,paddingHorizontal:11,paddingVertical:8},loadBrandText:{fontSize:8,fontWeight:'900',letterSpacing:1,color:'#A93763'},loadStage:{width:180,height:180,alignItems:'center',justifyContent:'center'},loadHalo:{position:'absolute',width:158,height:158,borderRadius:79,backgroundColor:'#F1E8FA'},loadMascot:{width:148,height:158,resizeMode:'contain'},loadKicker:{fontSize:8,fontWeight:'900',letterSpacing:1.3,color:'#978A9F'},loadTitle:{fontFamily:'Jua',fontSize:30,color:'#352040',marginTop:4},loadCopy:{fontSize:10,lineHeight:15,color:'#75697C',textAlign:'center',maxWidth:270,marginTop:5,marginBottom:22},loadStatus:{width:'100%',flexDirection:'row',justifyContent:'space-between',marginBottom:8},loadStatusText:{fontSize:7,fontWeight:'900',color:'#76697D',letterSpacing:.7},loadValue:{fontFamily:'Jua',fontSize:12,color:'#D84F83'},loadTrack:{width:'100%',height:10,borderRadius:6,backgroundColor:'#EEE9F0',overflow:'hidden'},loadFill:{height:'100%',borderRadius:6,backgroundColor:'#D84F83'},gameLoading:{flex:1,alignItems:'center',justifyContent:'center',paddingHorizontal:24,overflow:'hidden'},gameLoadOrb:{position:'absolute',width:310,height:310,borderRadius:155,opacity:.09,right:-120,top:-90},gameLoadCard:{width:'100%',maxWidth:390,backgroundColor:'#FFF',borderRadius:30,padding:24,alignItems:'center',shadowColor:'#402253',shadowOpacity:.15,shadowRadius:24,shadowOffset:{width:0,height:12},elevation:11},gameLoadBadge:{alignSelf:'flex-start',flexDirection:'row',alignItems:'center',gap:7,borderRadius:99,paddingHorizontal:12,paddingVertical:8},gameLoadBadgeText:{fontSize:8,fontWeight:'900',letterSpacing:1},gameLoadStage:{width:190,height:190,alignItems:'center',justifyContent:'center'},gameLoadHalo:{position:'absolute',width:166,height:166,borderRadius:83,borderWidth:1},gameLoadMascot:{width:158,height:174},gameLoadKicker:{fontSize:8,fontWeight:'900',letterSpacing:1.3,color:'#978A9F'},gameLoadTitle:{fontFamily:'Jua',fontSize:29,color:'#352040',marginTop:4},gameLoadCopy:{fontSize:10,lineHeight:15,color:'#75697C',textAlign:'center',maxWidth:275,marginTop:5,marginBottom:22},gameLoadStatus:{width:'100%',flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:8},gameLoadStatusText:{fontSize:9,fontWeight:'800',color:'#5D5064'},gameLoadValue:{fontFamily:'Jua',fontSize:13},gameLoadTrack:{width:'100%',height:10,borderRadius:6,backgroundColor:'#EEE9F0',overflow:'hidden'},gameLoadFill:{height:'100%',borderRadius:6},
  background: {
    flex: 1,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(12, 8, 28, 0.46)',
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: '#160F2E',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingBackground: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    opacity: 0.45,
  },

  loadingDuck: {
    width: 130,
    height: 130,
    resizeMode: 'contain',
    marginBottom: 15,
  },

  loadingTitle: {
    fontFamily: 'Jua',
    fontSize: 38,
    color: '#FFFFFF',
    marginBottom: 18,
  },

  loadingBarOuter: {
    width: width * 0.72,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#D6B4FC',
    overflow: 'hidden',
  },

  loadingBarInner: {
    height: '100%',
    backgroundColor: '#7DDA47',
  },

  loadingPercent: {
    marginTop: 10,
    fontFamily: 'Jua',
    fontSize: 18,
    color: '#FFFFFF',
  },

  header: {
    height: 98,
    backgroundColor: '#8423D9',
    borderBottomWidth: 8,
    borderBottomColor: '#6C3A99',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },

  backButtonContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitleBox: {
    flex: 1,
    alignItems: 'center',
  },

  headerSmall: {
    fontFamily: 'Jua',
    fontSize: 11,
    color: '#D6B4FC',
    letterSpacing: 1,
  },

  headerTitle: {
    fontFamily: 'Jua',
    fontSize: 29,
    color: '#FFFFFF',
  },

  headerDuck: {
    width: 48,
    height: 48,
    resizeMode: 'contain',
  },

  stage: {
    flex: 1,
    position: 'relative',
  },

  stageTitle: {
    marginTop: 24,
    fontFamily: 'Jua',
    fontSize: 34,
    color: '#FFFFFF',
    textAlign: 'center',
  },

  stageSubtitle: {
    fontFamily: 'Jua',
    fontSize: 14,
    color: '#E8D8FF',
    textAlign: 'center',
    marginTop: 2,
  },

  centerDuck: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 130,
    width: width * 0.38,
    height: height * 0.2,
    resizeMode: 'contain',
    zIndex: 4,
  },

  pathLine: {
    position: 'absolute',
    top: 170,
    alignSelf: 'center',
    width: 8,
    height: height * 0.47,
    borderRadius: 10,
    backgroundColor: 'rgba(214,180,252,0.62)',
    zIndex: 1,
  },

  missionNode: {
    position: 'absolute',
    width: width * 0.38,
    minHeight: 122,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderWidth: 4,
    padding: 12,
    alignItems: 'center',
    zIndex: 5,
  },

  nodeOne: {
    top: 125,
    left: 28,
    borderColor: '#7DDA47',
  },

  nodeTwo: {
    top: 275,
    right: 28,
    borderColor: '#FFB84D',
  },

  nodeThree: {
    top: 425,
    left: 28,
    borderColor: '#D6B4FC',
  },

  nodeCircleActive: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#7DDA47',
    borderWidth: 4,
    borderColor: '#5FAF2E',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -38,
    marginBottom: 6,
  },

  nodeCircleTimer: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFB84D',
    borderWidth: 4,
    borderColor: '#E89022',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -38,
    marginBottom: 6,
  },

  nodeCircleLocked: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#8423D9',
    borderWidth: 4,
    borderColor: '#D6B4FC',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -38,
    marginBottom: 6,
  },

  nodeNumber: {
    fontFamily: 'Jua',
    fontSize: 15,
    color: '#FFFFFF',
  },

  nodeTitle: {
    fontFamily: 'Jua',
    fontSize: 18,
    color: '#4B256D',
    textAlign: 'center',
  },

  nodeDesc: {
    fontFamily: 'Jua',
    fontSize: 11,
    color: '#2A1C10',
    textAlign: 'center',
    marginTop: 4,
  },

  nodeStatusReady: {
    marginTop: 8,
    backgroundColor: '#7DDA47',
    color: '#FFFFFF',
    fontFamily: 'Jua',
    fontSize: 10,
    paddingHorizontal: 13,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },

  nodeStatusTimer: {
    marginTop: 8,
    backgroundColor: '#FFB84D',
    color: '#FFFFFF',
    fontFamily: 'Jua',
    fontSize: 10,
    paddingHorizontal: 13,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },

  nodeStatusLocked: {
    marginTop: 8,
    backgroundColor: '#8423D9',
    color: '#FFFFFF',
    fontFamily: 'Jua',
    fontSize: 10,
    paddingHorizontal: 13,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },

  coachBubble: {
    position: 'absolute',
    bottom: 28,
    alignSelf: 'center',
    width: width * 0.88,
    backgroundColor: 'rgba(0,0,0,0.78)',
    borderRadius: 22,
    borderWidth: 3,
    borderColor: '#D6B4FC',
    padding: 13,
  },

  coachName: {
    fontFamily: 'Jua',
    fontSize: 12,
    color: '#D6B4FC',
    marginBottom: 3,
  },

  coachText: {
    fontFamily: 'Jua',
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
  },

  mapBackgroundWash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(251, 248, 255, 0.94)',
  },

  mapScroll: {
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 44,
  },

  mapTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
  },

  mapBrand: {
    marginLeft: 12,
  },

  mapBrandEyebrow: {
    color: '#8B24DB',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.2,
  },

  mapBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },

  mapBrandTitle: {
    color: '#3F2850',
    fontFamily: 'Jua',
    fontSize: 18,
  },

  mapMissionCount: {
    marginLeft: 'auto',
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#8423D9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    shadowColor: '#582078',
    shadowOpacity: 0.18,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  mapMissionCountText: {
    color: '#FFFFFF',
    fontFamily: 'Jua',
    fontSize: 15,
  },

  mapHero: {
    minHeight: 224,
    marginTop: 14,
    borderRadius: 28,
    backgroundColor: '#F2E8FC',
    borderWidth: 1,
    borderColor: '#DDC9EF',
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 20,
  },

  mapHeroCloudOne: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    right: -18,
    top: -20,
    backgroundColor: 'rgba(255,255,255,0.60)',
  },

  mapHeroCloudTwo: {
    position: 'absolute',
    width: 72,
    height: 22,
    borderRadius: 14,
    right: 114,
    top: 35,
    backgroundColor: 'rgba(255,255,255,0.65)',
  },

  mapHeroCopy: {
    width: '60%',
    zIndex: 3,
  },

  mapHeroKicker: {
    color: '#65A936',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1.1,
  },

  mapHeroTitle: {
    color: '#372044',
    fontFamily: 'Jua',
    fontSize: 24,
    lineHeight: 29,
    marginTop: 7,
  },

  mapHeroText: {
    color: '#776A7E',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 7,
  },

  mapHeroMascotStage: {
    width: '40%',
    height: 214,
    alignSelf: 'flex-end',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  mapHeroHalo: {
    position: 'absolute',
    width: 152,
    height: 152,
    borderRadius: 76,
    bottom: 17,
    backgroundColor: 'rgba(132,35,217,0.11)',
  },

  mapHeroMascot: {
    width: 125,
    height: 164,
    zIndex: 2,
  },

  mapHeroBubble: {
    position: 'absolute',
    top: 24,
    right: 8,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 7,
    zIndex: 4,
    shadowColor: '#4D3158',
    shadowOpacity: 0.12,
    shadowRadius: 7,
    elevation: 3,
  },

  mapHeroBubbleText: {
    color: '#8423D9',
    fontFamily: 'Jua',
    fontSize: 11,
  },

  mapSectionHeading: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 25,
    marginBottom: 16,
  },

  mapSectionKicker: {
    color: '#65A936',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.2,
  },

  mapSectionTitle: {
    color: '#3C2749',
    fontFamily: 'Jua',
    fontSize: 21,
    marginTop: 3,
  },

  mapReadyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 99,
    backgroundColor: '#EDF8E7',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  mapReadyDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#65A936',
  },

  mapReadyText: {
    color: '#4D8E2C',
    fontSize: 7,
    fontWeight: '900',
  },

  mapTrail: {
    position: 'relative',
    paddingBottom: 8,
  },

  mapTrailLine: {
    position: 'absolute',
    top: 44,
    bottom: 68,
    left: '50%',
    width: 7,
    marginLeft: -3.5,
    borderRadius: 99,
    backgroundColor: '#DCC6EC',
    borderWidth: 1,
    borderColor: '#CBA9E4',
  },

  mapNodeRow: {
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: 28,
    position: 'relative',
  },

  mapNodeRowRight: {
    alignItems: 'flex-end',
  },

  mapCheckpoint: {
    position: 'absolute',
    top: 42,
    left: '50%',
    marginLeft: -23,
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 5,
    borderColor: '#FAF7FC',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 8,
    shadowColor: '#472256',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 5,
  },

  mapCheckpointNumber: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },

  mapMissionCard: {
    width: '86%',
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5DAEA',
    overflow: 'hidden',
    shadowColor: '#392145',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 5,
  },

  mapMissionCardRight: {
    alignSelf: 'flex-end',
  },

  mapMissionCardPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.92,
  },

  mapMissionAccent: {
    height: 6,
    width: '100%',
  },

  mapMissionLandscape: {
    height: 118,
    overflow: 'hidden',
  },

  mapLandscapeSun: {
    position: 'absolute',
    right: 20,
    top: 15,
    width: 54,
    height: 54,
    borderRadius: 27,
  },

  mapLandscapeHillBack: {
    position: 'absolute',
    width: 210,
    height: 88,
    borderRadius: 100,
    right: -25,
    bottom: -49,
    transform: [{ rotate: '-8deg' }],
  },

  mapLandscapeHillFront: {
    position: 'absolute',
    width: 235,
    height: 94,
    borderRadius: 110,
    left: -45,
    bottom: -61,
    transform: [{ rotate: '6deg' }],
  },

  mapMissionMascot: {
    position: 'absolute',
    right: 12,
    bottom: -4,
    width: 104,
    height: 112,
  },

  mapModePill: {
    position: 'absolute',
    left: 15,
    top: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  mapModeText: {
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.7,
  },

  mapMissionContent: {
    paddingHorizontal: 17,
    paddingTop: 15,
    paddingBottom: 15,
  },

  mapMissionStep: {
    color: '#9A8D9F',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1,
  },

  mapMissionTitle: {
    color: '#3C2548',
    fontFamily: 'Jua',
    fontSize: 22,
    marginTop: 3,
  },

  mapMissionSubtitle: {
    color: '#55445E',
    fontSize: 10,
    fontWeight: '800',
    marginTop: 1,
  },

  mapMissionDescription: {
    color: '#817487',
    fontSize: 9,
    lineHeight: 14,
    marginTop: 5,
    maxWidth: '90%',
  },

  mapMissionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EEE7F1',
    marginTop: 13,
    paddingTop: 11,
  },

  mapStartText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  mapStartButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  mapFinish: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 18,
    backgroundColor: '#FFF8E8',
    borderWidth: 1,
    borderColor: '#F0D89D',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#8D6820',
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 3,
  },

  mapFinishKicker: {
    color: '#B67A12',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  mapFinishText: {
    color: '#4B354C',
    fontFamily: 'Jua',
    fontSize: 14,
    marginTop: 1,
  },
});
