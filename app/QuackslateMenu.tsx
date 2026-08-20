import React, { useEffect, useState } from 'react';
import { Image, Modal, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import expoconfig from '../expoconfig';

const scene = require('../assets/quackslate-twilight-workshop-v4.webp');
const idle = require('../assets/idle.png');
const talk = require('../assets/talk.png');
const loadingMascotImage = require('../assets/hello.png');

export default function QuackslateMenu() {
  const router = useRouter();
  const [progress, setProgress] = useState(5);
  const [loading, setLoading] = useState(true);
  const [mascot, setMascot] = useState<any>(idle);
  const [joinOpen, setJoinOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [code, setCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const imageTimer = setInterval(() => setMascot((value: any) => value === idle ? talk : idle), 850);
    const loadingTimer = setInterval(() => setProgress((value) => Math.min(100, value + 6)), 100);
    return () => { clearInterval(imageTimer); clearInterval(loadingTimer); };
  }, []);

  useEffect(() => {
    if (progress < 100) return;
    const timer = setTimeout(() => { setLoading(false); setGuideOpen(true); }, 260);
    return () => clearTimeout(timer);
  }, [progress]);

  const joinTeacher = async () => {
    const normalized = code.trim().toUpperCase();
    if (!normalized) return setMessage('Enter the session code shared by your teacher.');
    setJoining(true);
    try {
      const response = await fetch(`${expoconfig.API_URL}/api/quackslateLevels/getGameCode/${normalized}`);
      if (!response.ok) throw new Error('This classroom session is not available. Check the code and try again.');
      setJoinOpen(false);
      router.push({ pathname: '/QuackslateWait', params: { gameCode: normalized } });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The session could not be reached.');
    } finally {
      setJoining(false);
    }
  };

  if (loading) return (
    <SafeAreaView style={s.screen}>
      <Image source={scene} style={s.fullArtwork} resizeMode="cover" />
      <View style={s.loadingShade} />
      <Pressable style={s.backButton} onPress={() => router.replace('/Exercises')}>
        <Ionicons name="arrow-back" size={22} color="#432653" />
      </Pressable>
      <View style={s.loadingCenter}>
        <View style={s.modePill}>
          <Ionicons name="create-outline" size={14} color="#7140C6" />
          <Text style={s.modePillText}>JAPLEARN GRAMMAR BUILDER</Text>
        </View>
        <View style={s.mascotPortal}>
          <Image source={loadingMascotImage} style={s.loadingMascot} resizeMode="contain" />
        </View>
        <Text style={s.gameTitle}>QUACKSLATE</Text>
        <Text style={s.loadingSubtitle}>Opening the sentence workshop...</Text>
        <View style={s.progressTrack}><View style={[s.progressFill, { width: `${progress}%` }]} /></View>
        <Text style={s.progressText}>{progress < 100 ? `PREPARING TRIAL - ${progress}%` : 'READY TO BUILD'}</Text>
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={s.screen}>
      <View style={s.heroSection}>
        <Image source={scene} style={s.heroArtwork} resizeMode="cover" />
        <View style={s.heroWash} />
        <View style={s.topRow}>
          <Pressable style={s.backButtonStatic} onPress={() => router.replace('/Exercises')}>
            <Ionicons name="arrow-back" size={22} color="#432653" />
          </Pressable>
          <View style={s.modePill}>
            <Ionicons name="create-outline" size={14} color="#7140C6" />
            <Text style={s.modePillText}>QUACKSLATE</Text>
          </View>
          <Pressable style={s.backButtonStatic} onPress={() => setGuideOpen(true)}>
            <Ionicons name="help" size={22} color="#7140C6" />
          </Pressable>
        </View>
      </View>

      <View style={s.sessionSheet}>
        <View style={s.sheetHandle} />
        <Text style={s.sheetTitle}>Choose a session</Text>
        <Text style={s.sheetSubtitle}>Join your class live or practice independently.</Text>
        <Pressable style={({ pressed }) => [s.sessionOption, pressed && s.pressed]} onPress={() => setJoinOpen(true)}>
          <View style={s.optionNumber}><Ionicons name="easel-outline" size={24} color="#8423D9" /></View>
          <View style={s.actionCopy}><Text style={s.actionLabel}>TEACHER SESSION</Text><Text style={s.actionTitle}>Join with a class code</Text><Text style={s.optionText}>Follow a live quiz hosted by your teacher.</Text></View>
          <View style={s.optionArrow}><Ionicons name="arrow-forward" size={19} color="#8423D9" /></View>
        </Pressable>
        <View style={s.optionDivider}><View style={s.dividerLine} /><View style={s.orBadge}><Text style={s.orText}>OR</Text></View><View style={s.dividerLine} /></View>
        <Pressable style={({ pressed }) => [s.sessionOption, s.soloOption, pressed && s.pressed]} onPress={() => router.push({ pathname: '/Quackslate', params: { mode: 'system' } })}>
          <View style={s.optionNumberSolo}><Ionicons name="game-controller-outline" size={24} color="#FFFFFF" /></View>
          <View style={s.actionCopy}><Text style={s.actionLabelSolo}>INDEPENDENT ROUND</Text><Text style={s.actionTitle}>Solo QuackSlate</Text><Text style={s.optionText}>Build 10 sentences from the JapLearn bank.</Text></View>
          <View style={s.soloPlay}><Ionicons name="play" size={17} color="#FFFFFF" /></View>
        </Pressable>
      </View>

      <Modal visible={guideOpen} transparent animationType="fade" onRequestClose={() => setGuideOpen(false)}>
        <View style={s.modalShade}>
          <View style={s.guideModal}>
            <Pressable style={s.closeButton} onPress={() => setGuideOpen(false)}><Ionicons name="close" size={20} color="#725E7B" /></Pressable>
            <View style={s.guideSeal}><Ionicons name="create-outline" size={31} color="#FFFFFF" /></View>
            <Text style={s.modalKicker}>WELCOME TO QUACKSLATE</Text>
            <Text style={s.guideTitle}>Build Japanese with confidence</Text>
            <Text style={s.guideText}>Read the meaning, then tap the Japanese word tiles in the correct order to complete each sentence.</Text>
            <View style={s.guideSteps}>
              <View style={s.guideStep}><View style={s.stepNumber}><Text style={s.stepNumberText}>1</Text></View><View><Text style={s.stepTitle}>Choose a session</Text><Text style={s.stepText}>Join your teacher live or start an independent round.</Text></View></View>
              <View style={s.guideStep}><View style={s.stepNumber}><Text style={s.stepNumberText}>2</Text></View><View><Text style={s.stepTitle}>Arrange the tiles</Text><Text style={s.stepText}>Build the Japanese sentence in the correct order.</Text></View></View>
            </View>
            <Pressable style={s.guideButton} onPress={() => setGuideOpen(false)}><Text style={s.guideButtonText}>CHOOSE A SESSION</Text><Ionicons name="arrow-forward" size={18} color="#FFFFFF" /></Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={joinOpen} transparent animationType="fade" onRequestClose={() => setJoinOpen(false)}>
        <View style={s.modalShade}>
          <View style={s.joinModal}>
            <Pressable style={s.closeButton} onPress={() => { setJoinOpen(false); setMessage(''); }}>
              <Ionicons name="close" size={20} color="#725E7B" />
            </Pressable>
            <View style={s.modalIcon}><Ionicons name="key-outline" size={29} color="#8423D9" /></View>
            <Text style={s.modalKicker}>TEACHER-HOSTED SESSION</Text>
            <Text style={s.modalTitle}>Enter your class code</Text>
            <Text style={s.modalText}>Use the six-character code shown by your teacher.</Text>
            <TextInput
              style={s.codeInput}
              placeholder="------"
              placeholderTextColor="#B4A9B8"
              value={code}
              maxLength={6}
              autoCapitalize="characters"
              onChangeText={(value) => { setMessage(''); setCode(value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()); }}
            />
            {!!message && <Text style={s.errorText}>{message}</Text>}
            <Pressable style={s.joinButton} onPress={joinTeacher} disabled={joining}>
              <Text style={s.joinButtonText}>{joining ? 'CHECKING SESSION...' : 'JOIN CLASSROOM'}</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen:{flex:1,backgroundColor:'#DDC9EB',overflow:'hidden'},fullArtwork:{...StyleSheet.absoluteFillObject,width:'100%',height:'100%'},loadingShade:{...StyleSheet.absoluteFillObject,backgroundColor:'rgba(44,20,58,.14)'},menuShade:{...StyleSheet.absoluteFillObject,backgroundColor:'rgba(42,18,52,.18)'},backButton:{position:'absolute',left:22,top:22,width:52,height:52,borderRadius:18,backgroundColor:'rgba(255,255,255,.96)',alignItems:'center',justifyContent:'center',zIndex:5,elevation:8},loadingCenter:{position:'absolute',left:28,right:28,top:'22%',alignItems:'center'},modePill:{flexDirection:'row',alignItems:'center',gap:7,backgroundColor:'rgba(255,255,255,.95)',paddingHorizontal:15,paddingVertical:10,borderRadius:99},modePillText:{fontSize:9,fontWeight:'900',letterSpacing:1.3,color:'#543060'},mascotPortal:{width:190,height:190,borderRadius:95,backgroundColor:'rgba(255,255,255,.25)',borderWidth:2,borderColor:'rgba(255,255,255,.72)',alignItems:'center',justifyContent:'center',marginTop:24},loadingMascot:{width:148,height:148},gameTitle:{fontFamily:'Jua',fontSize:35,color:'#FFFFFF',letterSpacing:1,textShadowColor:'rgba(40,17,51,.7)',textShadowRadius:8,marginTop:10},loadingSubtitle:{fontSize:12,color:'#FFFFFF',textShadowColor:'rgba(40,17,51,.7)',textShadowRadius:5,marginTop:4},progressTrack:{width:'88%',height:9,borderRadius:10,backgroundColor:'rgba(255,255,255,.55)',overflow:'hidden',marginTop:22},progressFill:{height:'100%',borderRadius:10,backgroundColor:'#8423D9'},progressText:{fontSize:10,fontWeight:'900',letterSpacing:1.2,color:'#FFFFFF',textShadowColor:'rgba(40,17,51,.7)',textShadowRadius:4,marginTop:12},
  heroSection:{height:'44%',overflow:'hidden',backgroundColor:'#DCC5EB'},heroArtwork:{...StyleSheet.absoluteFillObject,width:'100%',height:'100%'},heroWash:{...StyleSheet.absoluteFillObject,backgroundColor:'rgba(245,236,250,.08)'},topRow:{position:'absolute',left:22,right:22,top:18,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},backButtonStatic:{width:50,height:50,borderRadius:17,backgroundColor:'rgba(255,255,255,.96)',alignItems:'center',justifyContent:'center',elevation:6},sessionSheet:{flex:1,marginTop:-18,borderTopLeftRadius:30,borderTopRightRadius:30,backgroundColor:'#FBF9FC',paddingHorizontal:22,paddingTop:12,elevation:12},sheetHandle:{width:43,height:5,borderRadius:4,backgroundColor:'#DCD3E0',alignSelf:'center',marginBottom:14},sheetTitle:{fontFamily:'Jua',fontSize:23,color:'#3B2447'},sheetSubtitle:{fontSize:11,color:'#897D8E',marginTop:2,marginBottom:15},sessionOption:{minHeight:100,borderRadius:22,backgroundColor:'#FFFFFF',borderWidth:1,borderColor:'#E4D9E8',padding:16,flexDirection:'row',alignItems:'center',shadowColor:'#3B2146',shadowOpacity:.08,shadowRadius:10,elevation:3},soloOption:{backgroundColor:'#FCFAFD',borderColor:'#DCCAE9'},optionNumber:{width:52,height:52,borderRadius:17,backgroundColor:'#F0E4FA',alignItems:'center',justifyContent:'center'},optionNumberSolo:{width:52,height:52,borderRadius:17,backgroundColor:'#8423D9',alignItems:'center',justifyContent:'center'},actionCopy:{flex:1,marginLeft:13},actionLabel:{fontSize:8,fontWeight:'900',letterSpacing:1.15,color:'#8423D9'},actionLabelSolo:{fontSize:8,fontWeight:'900',letterSpacing:1.15,color:'#65A936'},actionTitle:{fontFamily:'Jua',fontSize:17,color:'#3E2449',marginTop:2},optionText:{fontSize:10,color:'#8A7D8F',marginTop:3},optionArrow:{width:38,height:38,borderRadius:13,backgroundColor:'#F1E6FA',alignItems:'center',justifyContent:'center'},soloPlay:{width:38,height:38,borderRadius:13,backgroundColor:'#68B23B',alignItems:'center',justifyContent:'center'},optionDivider:{height:38,flexDirection:'row',alignItems:'center',paddingHorizontal:13},dividerLine:{flex:1,height:1,backgroundColor:'#E4DAE8'},orBadge:{width:34,height:22,borderRadius:11,backgroundColor:'#F2ECF5',alignItems:'center',justifyContent:'center',marginHorizontal:9},orText:{fontSize:8,fontWeight:'900',letterSpacing:.8,color:'#94869A'},pressed:{opacity:.86,transform:[{scale:.99}]},
  modalShade:{flex:1,backgroundColor:'rgba(31,11,39,.62)',alignItems:'center',justifyContent:'center',padding:24},joinModal:{width:'100%',maxWidth:370,borderRadius:29,backgroundColor:'#FFFFFF',padding:25,alignItems:'center'},guideModal:{width:'100%',maxWidth:380,borderRadius:30,backgroundColor:'#FFFFFF',padding:25,alignItems:'center'},closeButton:{position:'absolute',right:16,top:16,width:38,height:38,borderRadius:13,backgroundColor:'#F5F1F7',alignItems:'center',justifyContent:'center',zIndex:2},guideSeal:{width:68,height:68,borderRadius:23,backgroundColor:'#8423D9',alignItems:'center',justifyContent:'center',shadowColor:'#8423D9',shadowOpacity:.24,shadowRadius:12,elevation:5},guideTitle:{fontFamily:'Jua',fontSize:24,lineHeight:29,color:'#3B2146',textAlign:'center',marginTop:6},guideText:{fontSize:12,lineHeight:19,color:'#817486',textAlign:'center',marginTop:6},guideSteps:{width:'100%',backgroundColor:'#F8F4FA',borderRadius:19,padding:14,gap:13,marginTop:18},guideStep:{flexDirection:'row',alignItems:'center'},stepNumber:{width:31,height:31,borderRadius:11,backgroundColor:'#EDE0F8',alignItems:'center',justifyContent:'center',marginRight:10},stepNumberText:{fontFamily:'Jua',fontSize:13,color:'#8423D9'},stepTitle:{fontFamily:'Jua',fontSize:14,color:'#472751'},stepText:{fontSize:9,color:'#8A7D8F',marginTop:2},guideButton:{width:'100%',height:52,borderRadius:16,backgroundColor:'#8423D9',flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8,marginTop:18},guideButtonText:{fontFamily:'Jua',fontSize:12,color:'#FFFFFF'},modalIcon:{width:64,height:64,borderRadius:22,backgroundColor:'#F0E3FA',alignItems:'center',justifyContent:'center'},modalKicker:{fontSize:8,fontWeight:'900',letterSpacing:1.3,color:'#69AA3E',marginTop:15},modalTitle:{fontFamily:'Jua',fontSize:24,color:'#3B2146',marginTop:6},modalText:{fontSize:11,color:'#817486',textAlign:'center',marginTop:4},codeInput:{width:'100%',height:63,borderRadius:17,backgroundColor:'#F7F3F9',borderWidth:1,borderColor:'#DDD1E3',color:'#572666',fontSize:24,fontWeight:'900',letterSpacing:9,textAlign:'center',marginTop:20},errorText:{color:'#C75065',fontSize:10,lineHeight:15,textAlign:'center',marginTop:9},joinButton:{width:'100%',height:52,borderRadius:16,backgroundColor:'#8423D9',flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8,marginTop:15},joinButtonText:{fontFamily:'Jua',fontSize:12,color:'#FFFFFF'},
});
