import React, { useEffect, useRef, useState } from 'react';
import { Image, ImageBackground, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import expoconfig from '../expoconfig';

const background = require('../assets/quackslate-twilight-workshop-v4.png');
const mascot = require('../assets/img/Duck_Explorer.png');
const tips = [
  'In a polite sentence, です (desu) gives your answer a gentle, formal ending.',
  'The particle は (wa) can mark the topic of your sentence.',
  'Read all the tiles first, then build the sentence one piece at a time.',
  'If you get a sentence wrong, compare the word order before trying again.',
  'Japanese questions often end with か (ka). Listen for it when someone asks you something.',
];

export default function QuackslateWait() {
  const { gameCode } = useLocalSearchParams();
  const code = String(gameCode || '').toUpperCase();
  const router = useRouter();
  const navigating = useRef(false);
  const polling = useRef(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [closed, setClosed] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const { height } = useWindowDimensions();
  const compact = height < 760;
  const veryCompact = height < 660;

  useEffect(() => {
    if (closed || navigating.current || !code) return;
    let active = true;
    const check = async () => {
      if (polling.current) return;
      polling.current = true;
      try {
        const response = await fetch(`${expoconfig.API_URL}/api/quackslate/session/${encodeURIComponent(code)}`);
        if (!active) return;
        if (response.ok) {
          const data = await response.json();
          if (!active) return;
          if (data.status === 'LIVE' && !navigating.current) {
            navigating.current = true;
            router.replace({ pathname: '/Quackslate', params: { gameCode: code } });
          } else if (data.status === 'ENDED') {
            setClosed(true);
          } else if (data.startsAt) {
            const offset = new Date(data.serverNow).getTime() - Date.now();
            setRemaining(Math.max(0, Math.ceil((new Date(data.startsAt).getTime() - Date.now() - offset) / 1000)));
          }
        } else if (response.status === 404 || response.status === 410) {
          setClosed(true);
          setRemaining(null);
        }
      } catch (error) {
        console.warn('QuackSlate schedule check failed:', error);
      } finally {
        polling.current = false;
      }
    };
    void check();
    // Keep automatic entry responsive without creating a request spike when
    // an entire classroom waits behind the same Wi-Fi connection.
    const poll = setInterval(() => void check(), 5000);
    const tick = setInterval(() => setRemaining(value => value == null ? null : Math.max(0, value - 1)), 1000);
    const tipsTimer = setInterval(() => setTipIndex(value => (value + 1) % tips.length), 9000);
    return () => { active = false; clearInterval(poll); clearInterval(tick); clearInterval(tipsTimer); };
  }, [code, closed, router]);

  const countdown = remaining == null ? '–:––' : `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}`;
  return <SafeAreaView style={s.screen}>
    <ImageBackground source={background} resizeMode="cover" style={s.background} imageStyle={s.backgroundImage}>
      <View style={s.shade} />
      <View style={[s.layout, compact && s.layoutCompact, veryCompact && s.layoutVeryCompact]}>
        <View style={[s.header, compact && s.headerCompact]}>
          <Pressable accessibilityRole="button" accessibilityLabel="Back to QuackSlate" style={s.back} onPress={() => router.replace('/QuackslateMenu')}><Ionicons name="arrow-back" size={21} color="#44234F" /></Pressable>
          <Text style={s.headerTitle}>QUACKSLATE</Text>
          <View style={s.headerSpacer} />
        </View>
        <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator>
        <View style={[s.main, compact && s.mainCompact]}>
          <View style={[s.mascotStage, compact && s.mascotStageCompact]}><View style={[s.mascotHalo, compact && s.mascotHaloCompact]} /><View style={[s.mascotCircle, compact && s.mascotCircleCompact]}><Image source={mascot} resizeMode="contain" style={[s.mascot, compact && s.mascotCompact]} /></View></View>
          <View style={[s.card, compact && s.cardCompact, veryCompact && s.cardVeryCompact]}>
            <View style={s.statePill}><Ionicons name={closed ? 'close-circle-outline' : 'time-outline'} size={17} color={closed ? '#BD5463' : '#6AAB3D'} /><Text style={[s.stateText, closed && s.closedText]}>{closed ? 'SESSION UNAVAILABLE' : 'YOUR CLASS IS ALMOST READY'}</Text></View>
            {closed && <Text style={s.title}>This class code has closed</Text>}
            <Text style={s.description}>{closed ? 'Return to QuackSlate and ask your teacher for another code.' : 'You are checked in. Your sentence round opens automatically when the scheduled time begins.'}</Text>
            <View style={s.codeRow}><View style={s.codeIcon}><Ionicons name="key-outline" size={21} color="#7B2FC0" /></View><View><Text style={s.codeLabel}>CLASS CODE</Text><Text style={s.code}>{code || '—'}</Text></View><Ionicons name="checkmark-circle" size={22} color="#6AAB3D" style={s.codeCheck} /></View>
            {!closed && <View style={s.countdownCard}><View style={s.countdownHeading}><Ionicons name="alarm-outline" size={18} color="#7B2FC0" /><Text style={s.countdownLabel}>STARTS IN</Text></View><Text style={s.countdown}>{countdown}</Text><Text style={s.countdownNote}>{remaining == null ? 'Checking your teacher’s schedule…' : remaining === 0 ? 'Opening your round…' : 'No need to refresh. We’ll take you in automatically.'}</Text></View>}
            {!closed && !veryCompact && <View style={s.waitTimeline}><View style={s.timelineItem}><View style={[s.timelineDot,s.timelineDotDone]}><Ionicons name="checkmark" size={13} color="#fff" /></View><Text style={s.timelineDone}>Code accepted</Text></View><View style={s.timelineLine} /><View style={s.timelineItem}><View style={[s.timelineDot,s.timelineDotActive]}><Ionicons name="time-outline" size={13} color="#7B2FC0" /></View><Text style={s.timelineActive}>Waiting room</Text></View><View style={s.timelineLine} /><View style={s.timelineItem}><View style={s.timelineDot}><Ionicons name="play" size={11} color="#A796AE" /></View><Text style={s.timelineText}>Play</Text></View></View>}
            {closed && <Pressable style={s.returnButton} onPress={() => router.replace('/QuackslateMenu')}><Text style={s.returnText}>Back to QuackSlate</Text><Ionicons name="arrow-forward" size={17} color="#fff" /></Pressable>}
          </View>
          {!closed && !veryCompact && <View style={[s.tipCard, compact && s.tipCardCompact]}><View style={s.tipHeader}><Ionicons name="bulb-outline" size={19} color="#739D2B" /><Text style={s.tipTitle}>WHILE YOU WAIT</Text></View><Text style={s.tipText}>{tips[tipIndex]}</Text>{!compact && <View style={s.tipDots}>{tips.map((_, index) => <View key={index} style={[s.tipDot, index === tipIndex && s.tipDotActive]} />)}</View>}</View>}
        </View>
        </ScrollView>
      </View>
    </ImageBackground>
  </SafeAreaView>;
}

const s = StyleSheet.create({
  screen:{flex:1,backgroundColor:'#261138'},
  background:{flex:1}, backgroundImage:{opacity:0.68},
  shade:{...StyleSheet.absoluteFillObject,backgroundColor:'rgba(35,15,49,0.62)'},
  layout:{flex:1,paddingHorizontal:20,paddingBottom:18},layoutCompact:{paddingHorizontal:16,paddingBottom:10},layoutVeryCompact:{paddingBottom:6},
  header:{height:82,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
  back:{width:44,height:44,borderRadius:15,backgroundColor:'#fff',alignItems:'center',justifyContent:'center'},
  headerTitle:{color:'#fff',fontSize:14,fontWeight:'900',letterSpacing:2},
  headerSpacer:{width:44},
  scroll:{flex:1},scrollContent:{flexGrow:1,paddingBottom:18},
  main:{flexGrow:1,justifyContent:'center',alignItems:'center',paddingTop:22},
  mascotStage:{width:142,height:118,alignItems:'center',justifyContent:'center',zIndex:2},mascotHalo:{position:'absolute',width:142,height:142,borderRadius:71,backgroundColor:'rgba(255,255,255,.15)',borderWidth:1,borderColor:'rgba(255,255,255,.35)'},
  mascotCircle:{width:112,height:112,borderRadius:56,backgroundColor:'#F3E8FC',borderWidth:5,borderColor:'#fff',alignItems:'center',justifyContent:'center',marginBottom:-18,zIndex:1,shadowColor:'#1F0C2A',shadowOpacity:.25,shadowRadius:17,shadowOffset:{width:0,height:9},elevation:8},
  mascot:{width:105,height:105},
  card:{width:'100%',maxWidth:500,borderRadius:30,backgroundColor:'#FFFCFF',paddingHorizontal:22,paddingTop:42,paddingBottom:23,alignItems:'center',borderWidth:1,borderColor:'rgba(255,255,255,.72)',shadowColor:'#1F0C2A',shadowOpacity:.24,shadowRadius:25,shadowOffset:{width:0,height:13},elevation:12},
  statePill:{flexDirection:'row',gap:7,alignItems:'center',backgroundColor:'#F0F9E8',borderRadius:999,paddingHorizontal:12,paddingVertical:7},
  stateText:{color:'#5C9431',fontSize:10,fontWeight:'900',letterSpacing:1.2},
  closedText:{color:'#BD5463'},
  title:{fontFamily:'Jua',fontSize:25,color:'#44234F',textAlign:'center',marginTop:15},
  description:{fontSize:13,color:'#82748A',textAlign:'center',lineHeight:19,marginTop:7,maxWidth:330},
  codeRow:{width:'100%',borderWidth:1,borderColor:'#E9DCEF',backgroundColor:'#FBF7FE',borderRadius:16,padding:13,flexDirection:'row',alignItems:'center',gap:13,marginTop:20},
  codeIcon:{width:42,height:42,borderRadius:13,backgroundColor:'#F0E2FA',alignItems:'center',justifyContent:'center'},
  codeLabel:{fontSize:9,fontWeight:'900',letterSpacing:1.1,color:'#927DA0'},
  code:{fontSize:19,fontWeight:'900',letterSpacing:2,color:'#5A2575',marginTop:2},
  codeCheck:{marginLeft:'auto'},
  countdownCard:{width:'100%',borderRadius:21,backgroundColor:'#F4EBFC',paddingVertical:20,alignItems:'center',marginTop:14,borderWidth:1,borderColor:'#E5D3F2'},
  countdownHeading:{flexDirection:'row',alignItems:'center',gap:7},
  countdownLabel:{fontSize:10,fontWeight:'900',letterSpacing:1.3,color:'#8355A0'},
  countdown:{fontFamily:'Jua',fontSize:50,color:'#792BC4',marginTop:3},
  countdownNote:{fontSize:11,color:'#8A759A',textAlign:'center',paddingHorizontal:12},
  waitTimeline:{width:'100%',flexDirection:'row',alignItems:'flex-start',justifyContent:'center',marginTop:18,paddingHorizontal:4},timelineItem:{width:74,alignItems:'center',gap:6},timelineLine:{flex:1,height:2,marginTop:14,backgroundColor:'#E6DDE9'},timelineDot:{width:29,height:29,borderRadius:15,backgroundColor:'#F0EBF2',alignItems:'center',justifyContent:'center'},timelineDotDone:{backgroundColor:'#72AC48'},timelineDotActive:{backgroundColor:'#F0E3FA',borderWidth:1,borderColor:'#D4B7E7'},timelineDone:{fontSize:8,fontWeight:'800',color:'#6B9E43',textAlign:'center'},timelineActive:{fontSize:8,fontWeight:'800',color:'#7B2FC0',textAlign:'center'},timelineText:{fontSize:8,fontWeight:'800',color:'#A18FA8',textAlign:'center'},
  returnButton:{marginTop:22,backgroundColor:'#7B2FC0',borderRadius:13,paddingVertical:14,paddingHorizontal:20,flexDirection:'row',alignItems:'center',gap:9},
  returnText:{color:'#fff',fontWeight:'800'},
  tipCard:{width:'100%',maxWidth:500,borderRadius:20,backgroundColor:'rgba(250,255,241,.97)',padding:18,marginTop:16,borderWidth:1,borderColor:'#DCEBC9',shadowColor:'#1D1025',shadowOpacity:.12,shadowRadius:14,shadowOffset:{width:0,height:7},elevation:5},
  tipHeader:{flexDirection:'row',gap:8,alignItems:'center'},
  tipTitle:{fontSize:10,letterSpacing:1.2,fontWeight:'900',color:'#709634'},
  tipText:{fontSize:13,color:'#4F6245',lineHeight:19,marginTop:9},
  tipDots:{flexDirection:'row',gap:5,marginTop:13}, tipDot:{width:5,height:5,borderRadius:3,backgroundColor:'#CDE2AA'},tipDotActive:{width:18,backgroundColor:'#84B847'},
  headerCompact:{height:58},mainCompact:{paddingTop:2,justifyContent:'center'},
  mascotStageCompact:{width:106,height:74},mascotHaloCompact:{width:94,height:94,borderRadius:47},mascotCircleCompact:{width:78,height:78,borderRadius:39,borderWidth:4,marginBottom:-13},mascotCompact:{width:73,height:73},
  cardCompact:{borderRadius:24,paddingHorizontal:16,paddingTop:29,paddingBottom:14},cardVeryCompact:{paddingTop:25,paddingBottom:10},
  tipCardCompact:{paddingHorizontal:14,paddingVertical:10,marginTop:9},
});
