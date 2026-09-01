import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
  responseBadgeStage:{width:195,height:195,alignItems:'center',justifyContent:'center',overflow:'hidden'},responseBadgeGlow:{position:'absolute',width:178,height:178,borderRadius:89,backgroundColor:'rgba(117,66,186,.10)'},responseBadgeOuter:{width:156,height:156,borderRadius:78,backgroundColor:'#F1E8F7',borderWidth:2,borderColor:'#D2B9E5',alignItems:'center',justifyContent:'center',shadowColor:'#7542BA',shadowOpacity:.22,shadowRadius:20,elevation:8},responseBadgeInner:{width:124,height:124,borderRadius:62,backgroundColor:'#7542BA',borderWidth:5,borderColor:'#E4D3F0',alignItems:'center',justifyContent:'center'},responseBadgeCharacter:{position:'absolute',fontFamily:'Jua',fontSize:76,color:'rgba(255,255,255,.14)'},responseBadgeSweep:{position:'absolute',width:29,height:195,backgroundColor:'rgba(255,255,255,.44)',zIndex:8},responseSparkleOne:{position:'absolute',left:8,top:25,color:'#67AA41',fontSize:24,zIndex:9},responseSparkleTwo:{position:'absolute',right:8,bottom:26,color:'#D4953A',fontSize:20,zIndex:9},gameBadgeStage:{width:205,height:205,alignItems:'center',justifyContent:'center',overflow:'hidden'},gameBadgeGlow:{position:'absolute',width:188,height:188,borderRadius:94},gameBadgeOuter:{width:158,height:158,borderRadius:79,backgroundColor:'#FFF',borderWidth:2,alignItems:'center',justifyContent:'center',shadowColor:'#493152',shadowOpacity:.15,shadowRadius:18,elevation:8},gameBadgeInner:{width:126,height:126,borderRadius:63,borderWidth:5,borderColor:'rgba(255,255,255,.46)',alignItems:'center',justifyContent:'center'},gameBadgeCharacter:{position:'absolute',fontFamily:'Jua',fontSize:77,color:'rgba(255,255,255,.18)'},gameBadgeSweep:{position:'absolute',width:29,height:205,backgroundColor:'rgba(255,255,255,.44)',zIndex:8},gameBadgeMascot:{position:'absolute',width:68,height:78,right:3,bottom:3,zIndex:9},gameBadgeSparkle:{position:'absolute',left:8,top:24,fontSize:24,zIndex:9},gameLoadNote:{flexDirection:'row',alignItems:'center',gap:7,backgroundColor:'#F6F2F8',borderRadius:13,paddingHorizontal:13,paddingVertical:10,marginTop:16},gameLoadNoteText:{color:'#675A6D',fontSize:9,fontWeight:'700'},
  loadContent:{width:'100%',alignItems:'center'},loadJapanese:{color:'#67AA41',fontFamily:'Jua',fontSize:11,letterSpacing:2,marginTop:1,marginBottom:6},loadSteps:{flexDirection:'row',gap:6,marginTop:13},loadStep:{width:25,height:4,borderRadius:2,backgroundColor:'#DDD3E3'},loadStepActive:{backgroundColor:'#7542BA'},loadFooter:{flexDirection:'row',alignItems:'center',gap:7,marginTop:17,backgroundColor:'#F2EBF6',borderRadius:14,paddingHorizontal:13,paddingVertical:10},loadFooterText:{color:'#65566D',fontSize:9,fontWeight:'700'},gameLoadOrbTop:{right:-125,top:-95},gameLoadOrbBottom:{left:-145,bottom:-100},
  storyboardStage:{width:'100%',height:190,marginTop:15,alignItems:'center',justifyContent:'center',overflow:'hidden',borderRadius:24,backgroundColor:'#F2EAF8'},
  storyboardHero:{width:104,height:104,borderRadius:34,backgroundColor:'#7542BA',borderWidth:6,borderColor:'#E5D5F0',alignItems:'center',justifyContent:'center',zIndex:4,shadowColor:'#4E2763',shadowOpacity:.24,shadowRadius:15,elevation:7},
  storyboardKanji:{position:'absolute',fontFamily:'Jua',fontSize:67,color:'rgba(255,255,255,.14)'},
  storyboardFrame:{position:'absolute',width:91,height:74,borderRadius:18,backgroundColor:'#FFFFFF',borderWidth:1,borderColor:'#E2D4E8',alignItems:'center',justifyContent:'center',shadowColor:'#42244E',shadowOpacity:.12,shadowRadius:8,elevation:3},
  storyboardFrameLeft:{left:14,top:24,transform:[{rotate:'-6deg'}]},storyboardFrameRight:{right:14,bottom:22,transform:[{rotate:'6deg'}]},
  storyboardFrameText:{marginTop:4,fontSize:7,fontWeight:'900',letterSpacing:.8,color:'#6D6073'},storyboardSweep:{position:'absolute',width:25,height:220,backgroundColor:'rgba(255,255,255,.42)',zIndex:8},
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
    backgroundColor: 'rgba(251, 248, 255, 0.76)',
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
    shadowColor: '#582078',
    shadowOpacity: 0.18,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  mapGuideButtonPressed: {
    transform: [{ scale: 0.94 }],
    opacity: 0.88,
  },

  mapMissionCountText: {
    color: '#FFFFFF',
    fontFamily: 'Jua',
    fontSize: 15,
  },

  questBoard: {
    minHeight: 174,
    marginTop: 18,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#4C2365',
    borderWidth: 2,
    borderColor: '#D7BCE8',
    paddingHorizontal: 21,
    paddingVertical: 22,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#32143E',
    shadowOpacity: 0.18,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 7,
  },

  questBoardPatternOne: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    right: -45,
    top: -75,
    borderWidth: 25,
    borderColor: 'rgba(255,255,255,0.06)',
  },

  questBoardPatternTwo: {
    position: 'absolute',
    width: 135,
    height: 135,
    borderRadius: 68,
    right: 42,
    bottom: -92,
    backgroundColor: 'rgba(170,104,218,0.18)',
  },

  questBoardCopy: {
    flex: 1,
    paddingRight: 14,
    zIndex: 2,
  },

  questBoardKicker: {
    color: '#A9E67E',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.3,
  },

  questBoardTitle: {
    color: '#FFFFFF',
    fontFamily: 'Jua',
    fontSize: 23,
    lineHeight: 28,
    marginTop: 7,
  },

  questBoardText: {
    color: 'rgba(255,255,255,0.76)',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 7,
    maxWidth: 360,
  },

  questProgressMedallion: {
    width: 70,
    height: 96,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 5,
    borderColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    shadowColor: '#1F0B29',
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 5,
  },

  questProgressValue: {
    color: '#6E4BC6',
    fontFamily: 'Jua',
    fontSize: 25,
    lineHeight: 28,
  },

  questProgressDivider: {
    width: 25,
    height: 2,
    borderRadius: 2,
    backgroundColor: '#E1D6E8',
    marginVertical: 3,
  },

  questProgressTotal: {
    color: '#8B7C91',
    fontFamily: 'Jua',
    fontSize: 13,
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 16,
    paddingHorizontal: 2,
  },

  mapSectionKicker: {
    color: '#4B2C5A',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  mapSectionSubcopy: { marginTop: 4, maxWidth: 330, color: '#807286', fontSize: 9.5, lineHeight: 14 },

  mapSectionTitle: {
    color: '#3C2749',
    fontFamily: 'Jua',
    fontSize: 23,
    marginTop: 3,
  },

  mapReadyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 99,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#D5C2E7',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  mapReadyDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#6E4BC6',
  },

  mapReadyText: {
    color: '#6E4BC6',
    fontSize: 7,
    fontWeight: '900',
  },

  mapTrail: {
    position: 'relative',
    paddingBottom: 10,
  },
  trailStartSeal: { position: 'absolute', left: 12, top: -4, width: 34, height: 34, borderRadius: 17, backgroundColor: '#4B2C5A', borderWidth: 4, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', zIndex: 9 },
  atlasHeading:{marginTop:24,marginBottom:14,flexDirection:'row',alignItems:'flex-end',justifyContent:'space-between'},atlasKicker:{fontSize:8,fontWeight:'900',letterSpacing:1.4,color:'#65A936'},atlasTitle:{marginTop:4,fontFamily:'Jua',fontSize:22,color:'#3F2850'},atlasCounter:{width:54,height:54,borderRadius:18,backgroundColor:'#4B2C5A',alignItems:'center',justifyContent:'center'},atlasCounterValue:{fontFamily:'Jua',fontSize:21,color:'#FFFFFF'},atlasCounterLabel:{fontSize:6,fontWeight:'900',letterSpacing:.8,color:'#C8EDA9'},
  atlasBoard:{position:'relative',overflow:'hidden',borderRadius:31,backgroundColor:'rgba(255,255,255,.72)',borderWidth:1,borderColor:'#E1D5E7',padding:14,paddingBottom:18},atlasGridLineOne:{position:'absolute',left:'33%',top:0,bottom:0,width:1,backgroundColor:'rgba(95,57,111,.05)'},atlasGridLineTwo:{position:'absolute',left:'66%',top:0,bottom:0,width:1,backgroundColor:'rgba(95,57,111,.05)'},atlasRouteStem:{position:'absolute',left:'50%',top:335,height:74,width:5,marginLeft:-2.5,borderRadius:5,backgroundColor:'#D5BEE5'},atlasPressed:{transform:[{scale:.985}],opacity:.92},
  featuredChapter:{overflow:'hidden',borderRadius:27,backgroundColor:'#FFFFFF',borderWidth:1.5,borderColor:'#D8C4E7',shadowColor:'#3E204D',shadowOpacity:.16,shadowRadius:15,shadowOffset:{width:0,height:8},elevation:6},featuredArt:{height:205,overflow:'hidden',backgroundColor:'#4C2365',alignItems:'flex-end',justifyContent:'flex-end'},featuredMoon:{position:'absolute',width:190,height:190,borderRadius:95,right:-25,top:-55,backgroundColor:'rgba(255,255,255,.10)'},featuredKanji:{position:'absolute',left:19,top:20,fontFamily:'Jua',fontSize:118,color:'rgba(255,255,255,.08)'},featuredMascot:{width:190,height:198,marginRight:13},nowPlaying:{position:'absolute',left:15,top:15,flexDirection:'row',alignItems:'center',gap:6,borderRadius:99,paddingHorizontal:10,paddingVertical:7,backgroundColor:'rgba(255,255,255,.94)'},nowPlayingDot:{width:7,height:7,borderRadius:4,backgroundColor:'#65A936'},nowPlayingText:{fontSize:7,fontWeight:'900',letterSpacing:.75,color:'#4B2C5A'},featuredCopy:{padding:18},chapterNumber:{fontSize:8,fontWeight:'900',letterSpacing:1.1,color:'#65A936'},featuredTitle:{marginTop:4,fontFamily:'Jua',fontSize:28,color:'#382044'},featuredSubtitle:{marginTop:2,fontSize:11,fontWeight:'800',color:'#6E4BC6'},featuredDescription:{marginTop:7,fontSize:10,lineHeight:15,color:'#786B7E'},featuredAction:{marginTop:14,minHeight:44,borderRadius:15,backgroundColor:'#6E4BC6',flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8},featuredActionText:{fontSize:8,fontWeight:'900',letterSpacing:.8,color:'#FFFFFF'},
  branchLabel:{marginVertical:20,flexDirection:'row',alignItems:'center',gap:9},branchLine:{flex:1,height:1,backgroundColor:'#DCCFE3'},branchLabelText:{fontSize:7,fontWeight:'900',letterSpacing:1,color:'#87768F'},chapterBranches:{flexDirection:'row',gap:10},branchChapter:{flex:1,overflow:'hidden',borderRadius:22,backgroundColor:'#FFFFFF',borderWidth:1,borderColor:'#E1D6E6'},branchChapterLocked:{backgroundColor:'#F4F1F5'},branchArt:{height:118,alignItems:'center',justifyContent:'flex-end',overflow:'hidden'},branchKanji:{position:'absolute',fontFamily:'Jua',fontSize:82,top:3},branchMascot:{width:94,height:107},branchMascotLocked:{opacity:.42},branchStatus:{position:'absolute',left:8,top:8,flexDirection:'row',alignItems:'center',gap:4,borderRadius:99,paddingHorizontal:7,paddingVertical:5},branchStatusText:{fontSize:6,fontWeight:'900',color:'#FFFFFF'},branchCopy:{padding:11,minHeight:112},branchMode:{fontSize:7,fontWeight:'900',letterSpacing:.8},branchTitle:{marginTop:3,fontFamily:'Jua',fontSize:17,lineHeight:20,color:'#3D2549'},branchMuted:{color:'#8E8591'},branchText:{marginTop:5,fontSize:8.5,lineHeight:12.5,color:'#7E7183'},
  atlasDestination:{marginTop:19,minHeight:92,borderRadius:22,backgroundColor:'#3F2850',padding:14,flexDirection:'row',alignItems:'center'},atlasDestinationIcon:{width:54,height:54,borderRadius:18,backgroundColor:'#D88727',alignItems:'center',justifyContent:'center'},atlasDestinationCopy:{flex:1,marginLeft:12},atlasDestinationKicker:{fontSize:7,fontWeight:'900',letterSpacing:1,color:'#BCE99C'},atlasDestinationTitle:{marginTop:2,fontFamily:'Jua',fontSize:19,color:'#FFFFFF'},atlasDestinationText:{marginTop:3,fontSize:8.5,lineHeight:12,color:'rgba(255,255,255,.70)'},

  mapTrailLine: {
    position: 'absolute',
    top: 31,
    bottom: 35,
    left: 25,
    width: 8,
    borderRadius: 99,
    backgroundColor: '#C39BE0',
    borderWidth: 2,
    borderColor: '#FDFBFF',
    shadowColor: '#7130A2',
    shadowOpacity: 0.22,
    shadowRadius: 7,
    elevation: 3,
  },

  mapNodeRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 22,
    position: 'relative',
  },

  mapNodeRowRight: {
    alignItems: 'flex-start',
  },

  mapCheckpointColumn: {
    width: 58,
    alignItems: 'center',
    paddingTop: 24,
    zIndex: 8,
  },

  mapCheckpoint: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 5,
    borderColor: '#FAF7FC',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 8,
    shadowColor: '#472256',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 7,
  },

  mapCheckpointLabel: {
    color: '#6F5C78',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginTop: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 99,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },

  mapCheckpointNumber: {
    color: '#FFFFFF',
    fontFamily: 'Jua',
    fontSize: 12,
    fontWeight: '900',
  },

  mapMissionCard: {
    flex: 1,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderWidth: 2,
    borderColor: '#D9C4E8',
    overflow: 'hidden',
    shadowColor: '#392145',
    shadowOpacity: 0.17,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 9 },
    elevation: 7,
  },

  mapMissionCardRight: {
    alignSelf: 'stretch',
  },

  mapMissionCardPressed: {
    transform: [{ scale: 0.975 }],
    opacity: 0.9,
  },

  mapMissionCardLocked: {
    backgroundColor: 'rgba(248,246,249,0.98)',
    borderColor: '#D9D2DC',
    shadowOpacity: 0.08,
    elevation: 3,
  },

  mapMissionAccent: {
    height: 8,
    width: '100%',
  },

  mapMissionColorRail: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 7,
    zIndex: 5,
  },

  mapMissionLandscape: {
    height: 124,
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(76,45,88,0.10)',
  },

  mapMissionArt: {
    height: 118,
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(76,45,88,0.10)',
  },

  mapArtRingLarge: {
    position: 'absolute',
    width: 155,
    height: 155,
    borderRadius: 78,
    borderWidth: 24,
    right: -22,
    top: -51,
  },

  mapArtRingSmall: {
    position: 'absolute',
    width: 92,
    height: 92,
    borderRadius: 46,
    left: 23,
    bottom: -50,
  },

  mapArtCharacter: {
    position: 'absolute',
    left: 22,
    top: 21,
    fontFamily: 'Jua',
    fontSize: 72,
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
    bottom: -7,
    width: 108,
    height: 118,
  },

  mapMissionMascotLocked: {
    opacity: 0.38,
  },

  mapStageBadge: {
    position: 'absolute',
    left: 17,
    top: 14,
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  mapStageBadgeText: {
    color: '#FFFFFF',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  mapModePill: {
    position: 'absolute',
    left: 15,
    top: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  mapModeText: {
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.7,
  },

  mapMissionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 32,
  },

  mapModeIcon: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  mapLockedPill: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 99,
    backgroundColor: '#EFECEF',
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  mapLockedPillText: {
    color: '#756B79',
    fontSize: 6,
    fontWeight: '900',
    letterSpacing: 0.6,
  },

  mapLockedSeal: {
    position: 'absolute',
    right: 14,
    top: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderWidth: 1,
    borderColor: '#D8D0DC',
    paddingHorizontal: 9,
    paddingVertical: 7,
    shadowColor: '#4C3B53',
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
  },

  mapLockedSealText: {
    color: '#675A6D',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.7,
  },

  mapMissionContent: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 16,
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
    fontSize: 23,
    marginTop: 11,
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
    paddingTop: 12,
  },

  mapMissionActionCopy: {
    flex: 1,
    paddingRight: 8,
  },

  mapStartText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  mapUnlockHint: {
    color: '#9B919F',
    fontSize: 7,
    marginTop: 3,
  },

  mapStartButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.75)',
    shadowColor: '#3B1F46',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },

  mapFinish: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 18,
    backgroundColor: '#FFF8E8',
    borderWidth: 2,
    borderColor: '#F0D89D',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#8D6820',
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 3,
  },

  mapFinishRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 74,
  },

  mapFinishCheckpoint: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginHorizontal: 4,
    backgroundColor: '#D88727',
    borderWidth: 5,
    borderColor: '#FAF7FC',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 8,
    shadowColor: '#7B5317',
    shadowOpacity: 0.24,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },

  mapFinishIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FFF0C9',
    alignItems: 'center',
    justifyContent: 'center',
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

  guideOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 28,
    backgroundColor: 'rgba(36,18,45,0.58)',
  },

  guideDismissArea: {
    ...StyleSheet.absoluteFillObject,
  },

  guideCard: {
    width: '100%',
    maxWidth: 390,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#DDCDE8',
    padding: 22,
    shadowColor: '#24102D',
    shadowOpacity: 0.28,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 14,
  },

  guideTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  guideIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEE7FA',
  },

  guideClose: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F1F7',
  },

  guideKicker: {
    color: '#65A936',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.2,
  },

  guideTitle: {
    color: '#3C2548',
    fontFamily: 'Jua',
    fontSize: 25,
    lineHeight: 30,
    marginTop: 5,
  },

  guideText: {
    color: '#776A7E',
    fontSize: 10,
    lineHeight: 16,
    marginTop: 7,
  },

  guideSteps: {
    gap: 10,
    marginTop: 18,
  },

  guideStep: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: '#F9F6FB',
    borderWidth: 1,
    borderColor: '#E9DFEE',
    padding: 12,
  },

  guideStepNumber: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  guideStepNumberLocked: {
    backgroundColor: '#AAA0AE',
  },

  guideStepNumberText: {
    color: '#FFFFFF',
    fontFamily: 'Jua',
    fontSize: 15,
  },

  guideStepCopy: {
    flex: 1,
  },

  guideStepTitle: {
    color: '#493451',
    fontFamily: 'Jua',
    fontSize: 14,
  },

  guideStepText: {
    color: '#807584',
    fontSize: 9,
    lineHeight: 13,
    marginTop: 2,
  },

  guideButton: {
    height: 50,
    borderRadius: 16,
    backgroundColor: '#6E4BC6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    marginTop: 18,
  },

  guideButtonText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  responseJourneyIntro:{marginHorizontal:2,marginTop:17,marginBottom:14,borderRadius:22,padding:16,backgroundColor:'rgba(255,255,255,.88)',borderWidth:1,borderColor:'#E6DAEC',flexDirection:'row',alignItems:'center',shadowColor:'#432450',shadowOpacity:.08,shadowRadius:12,shadowOffset:{width:0,height:5},elevation:2},
  responseJourneyIntroCopy:{flex:1,paddingRight:12},responseJourneyKicker:{fontSize:8,fontWeight:'900',letterSpacing:1.05,color:'#65A936'},responseJourneyTitle:{marginTop:5,fontFamily:'Jua',fontSize:18,lineHeight:23,color:'#3E244B'},
  responseJourneyCounter:{width:53,height:53,borderRadius:18,backgroundColor:'#6E4BC6',alignItems:'center',justifyContent:'center',shadowColor:'#6E4BC6',shadowOpacity:.23,shadowRadius:8,shadowOffset:{width:0,height:4},elevation:3},responseJourneyCounterValue:{fontFamily:'Jua',fontSize:19,color:'#FFFFFF',lineHeight:21},responseJourneyCounterLabel:{fontSize:6,fontWeight:'900',letterSpacing:.8,color:'#EDE5FF'},
  responseTrailLead:{paddingHorizontal:24,paddingTop:24,paddingBottom:15,alignItems:'center'},responseTrailLeadKicker:{fontSize:9,fontWeight:'900',letterSpacing:1.25,color:'#65A936',textAlign:'center'},responseTrailLeadText:{maxWidth:410,marginTop:6,fontSize:11,lineHeight:17,color:'#786B7E',textAlign:'center'},
  responseRoute:{position:'relative',paddingTop:7,paddingBottom:24},responseRouteLine:{position:'absolute',top:25,bottom:98,left:'50%',width:4,marginLeft:-2,borderRadius:8,backgroundColor:'#D7C6E5'},
  responseStop:{position:'relative',width:'94%',alignSelf:'flex-start',marginBottom:25,paddingLeft:20},responseStopRight:{alignSelf:'flex-end',paddingLeft:0,paddingRight:20},
  responseCheckpoint:{position:'absolute',left:1,top:23,zIndex:4,width:48,height:48,borderRadius:17,borderWidth:4,backgroundColor:'#6E4BC6',alignItems:'center',justifyContent:'center',shadowColor:'#432450',shadowOpacity:.22,shadowRadius:7,shadowOffset:{width:0,height:4},elevation:6},responseCheckpointRight:{right:1,left:'auto'},responseCheckpointLocked:{backgroundColor:'#9B929E'},responseCheckpointNumber:{position:'absolute',top:-16,fontSize:7,fontWeight:'900',color:'#4F335B',letterSpacing:.8},
  responseChapter:{overflow:'hidden',borderRadius:27,backgroundColor:'#FFFFFF',borderWidth:1.5,borderColor:'#DDD0E5',shadowColor:'#3E204D',shadowOpacity:.14,shadowRadius:14,shadowOffset:{width:0,height:7},elevation:5},responseChapterRight:{},responseChapterLocked:{opacity:.88,borderColor:'#D8D1DA'},responseChapterPressed:{transform:[{scale:.985}],opacity:.94},
  responseChapterArt:{height:150,overflow:'hidden',alignItems:'flex-end',justifyContent:'flex-end'},responseChapterHalo:{position:'absolute',right:-20,top:-50,width:185,height:185,borderRadius:93},responseChapterKanji:{position:'absolute',left:22,top:8,fontFamily:'Jua',fontSize:102},responseChapterMascot:{width:164,height:158,marginRight:18},responseChapterMascotLocked:{opacity:.42},responsePageTab:{position:'absolute',left:14,top:14,borderRadius:99,paddingHorizontal:11,paddingVertical:7},responsePageTabText:{fontSize:7,fontWeight:'900',letterSpacing:.8,color:'#FFFFFF'},
  responseChapterCopy:{padding:17},responseChapterEyebrow:{fontSize:8,fontWeight:'900',letterSpacing:1},responseChapterTitle:{marginTop:4,fontFamily:'Jua',fontSize:25,color:'#3B2447'},responseChapterSubtitle:{marginTop:1,fontSize:10,fontWeight:'800',color:'#6E4BC6'},responseChapterDescription:{marginTop:7,minHeight:30,fontSize:9.5,lineHeight:15,color:'#786D7D'},responseMuted:{color:'#8F8792'},
  responseChapterFooter:{marginTop:13,flexDirection:'row',alignItems:'center',gap:9},responseStatePill:{flex:1,minHeight:39,borderRadius:13,paddingHorizontal:11,flexDirection:'row',alignItems:'center',gap:7},responseStateText:{flex:1,fontSize:7,fontWeight:'900',letterSpacing:.55},responseChapterAction:{width:42,height:42,borderRadius:14,alignItems:'center',justifyContent:'center'},
  responseDestination:{marginTop:1,marginHorizontal:18,borderRadius:24,backgroundColor:'#432353',padding:17,flexDirection:'row',alignItems:'center',borderWidth:1,borderColor:'#70447F',shadowColor:'#32183C',shadowOpacity:.2,shadowRadius:12,shadowOffset:{width:0,height:6},elevation:4},responseDestinationSeal:{width:47,height:47,borderRadius:16,backgroundColor:'#6E4BC6',alignItems:'center',justifyContent:'center',marginRight:12},responseDestinationCopy:{flex:1},responseDestinationKicker:{fontSize:7,fontWeight:'900',letterSpacing:1,color:'#BEE39E'},responseDestinationTitle:{marginTop:3,fontFamily:'Jua',fontSize:17,color:'#FFFFFF'},responseDestinationText:{marginTop:3,fontSize:8.5,lineHeight:13,color:'#DACFE0'},
});
