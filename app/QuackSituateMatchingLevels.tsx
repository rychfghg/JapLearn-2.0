import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ImageBackground, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import expoconfig from '../expoconfig';

const levels = [
  { level: 1, sets: 3, title: 'Everyday beginnings', topic: 'Greetings, thanks, and friendly farewells', color: '#69B43A' },
  { level: 2, sets: 3, title: 'Daily life', topic: 'School, meals, and home routines', color: '#D88727' },
  { level: 3, sets: 3, title: 'Social confidence', topic: 'Introductions, work, and travel', color: '#8A20E8' },
  { level: 4, sets: 5, title: 'Nuanced moments', topic: 'Five intermediate situation sets', color: '#D34D83' },
  { level: 5, sets: 10, title: 'Expression master', topic: 'Ten hard mixed-context trials', color: '#523189' },
];

export default function QuackSituateMatchingLevels() {
  const [unlocked, setUnlocked] = useState(1);
  const [completedSets, setCompletedSets] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('user').then(async value => {
      try {
        const email = value ? JSON.parse(value).email : '';
        const response = await fetch(`${expoconfig.API_URL}/api/situational/expression-match/progress?email=${encodeURIComponent(email)}`);
        if (response.ok) {
          const data = await response.json();
          setUnlocked(data.unlockedLevel || 1);
          setCompletedSets(data.completedSets || []);
        }
      } finally { setLoading(false); }
    });
  }, []);

  return <SafeAreaView style={styles.safe}><ImageBackground source={require('../assets/quacksituate/quacksituate-menu-background-v3.png')} style={styles.background} imageStyle={styles.backgroundImage}>
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.top}><Pressable style={styles.back} onPress={() => router.replace('/QuackSituate')}><Ionicons name="arrow-back" size={24} color="#442454" /></Pressable><View><Text style={styles.kicker}>EXPRESSION MATCH</Text><Text style={styles.heading}>Choose your level</Text></View><Ionicons name="git-compare" size={28} color="#8A20E8" /></View>
      <View style={styles.hero}><Text style={styles.heroTitle}>Connect words to real moments</Text><Text style={styles.heroText}>Complete every set in a level to open the next gate. Replay any unlocked set to improve your mastery.</Text><View style={styles.legend}><Ionicons name="link" size={17} color="#8A20E8" /><Text style={styles.legendText}>Select a phrase, then connect it to its scene.</Text></View></View>
      {loading ? <ActivityIndicator size="large" color="#8A20E8" /> : levels.map(item => {
        const locked = item.level > unlocked;
        const complete = Array.from({ length: item.sets }, (_, index) => completedSets.includes(`${item.level}-${index + 1}`)).filter(Boolean).length;
        return <View key={item.level} style={[styles.levelCard, locked && styles.locked]}>
          <View style={[styles.levelNumber, { backgroundColor: item.color }]}><Text style={styles.levelNumberText}>{item.level}</Text></View>
          <View style={styles.levelCopy}><Text style={styles.levelLabel}>LEVEL {item.level}</Text><Text style={styles.levelTitle}>{item.title}</Text><Text style={styles.levelTopic}>{item.topic}</Text><Text style={styles.setProgress}>{complete} / {item.sets} sets cleared</Text></View>
          <View style={styles.sets}>{Array.from({ length: item.sets }, (_, index) => {
            const done = completedSets.includes(`${item.level}-${index + 1}`);
            return <Pressable key={index} disabled={locked} onPress={() => router.push({ pathname: '/QuackSituateMatching', params: { level: String(item.level), set: String(index + 1) } })} style={[styles.setButton, { borderColor: item.color }, done && { backgroundColor: item.color }]}><Text style={[styles.setText, done && styles.setTextDone]}>{index + 1}</Text></Pressable>;
          })}</View>
          {locked && <View style={styles.lock}><Ionicons name="lock-closed" size={18} color="#918799" /><Text style={styles.lockText}>Clear Level {item.level - 1}</Text></View>}
        </View>;
      })}
    </ScrollView>
  </ImageBackground></SafeAreaView>;
}

const styles = StyleSheet.create({ safe:{flex:1,backgroundColor:'#FAF7FC'},background:{flex:1},backgroundImage:{opacity:.12},content:{padding:20,paddingBottom:50},top:{flexDirection:'row',alignItems:'center',gap:14,marginBottom:18},back:{width:52,height:52,borderRadius:18,backgroundColor:'#FFF',alignItems:'center',justifyContent:'center',shadowColor:'#351C45',shadowOpacity:.1,shadowRadius:10},kicker:{fontFamily:'Jua',fontSize:11,letterSpacing:1.6,color:'#65A936'},heading:{fontFamily:'Jua',fontSize:28,color:'#3F2450'},hero:{backgroundColor:'#FFF',borderRadius:28,padding:22,marginBottom:18,borderWidth:1,borderColor:'#E9DDF1'},heroTitle:{fontFamily:'Jua',fontSize:24,color:'#3F2450'},heroText:{fontSize:14,color:'#7D7182',lineHeight:21,marginTop:5},legend:{marginTop:14,padding:12,borderRadius:16,backgroundColor:'#F4E9FD',flexDirection:'row',gap:8,alignItems:'center'},legendText:{fontSize:12,color:'#5D376E'},levelCard:{backgroundColor:'rgba(255,255,255,.96)',borderRadius:26,padding:18,marginBottom:14,borderWidth:1,borderColor:'#E8DDEB',shadowColor:'#422552',shadowOpacity:.08,shadowRadius:12},locked:{opacity:.65},levelNumber:{width:48,height:48,borderRadius:16,alignItems:'center',justifyContent:'center',position:'absolute',top:18,left:18},levelNumberText:{fontFamily:'Jua',fontSize:22,color:'#FFF'},levelCopy:{paddingLeft:62},levelLabel:{fontSize:10,fontWeight:'800',letterSpacing:1.2,color:'#8A20E8'},levelTitle:{fontFamily:'Jua',fontSize:21,color:'#402450',marginTop:2},levelTopic:{fontSize:13,color:'#827687',marginTop:2},setProgress:{fontSize:11,color:'#65A936',fontWeight:'700',marginTop:7},sets:{flexDirection:'row',flexWrap:'wrap',gap:8,marginTop:16},setButton:{width:42,height:42,borderRadius:14,borderWidth:2,backgroundColor:'#FFF',alignItems:'center',justifyContent:'center'},setText:{fontFamily:'Jua',color:'#4E335C'},setTextDone:{color:'#FFF'},lock:{position:'absolute',right:16,top:17,flexDirection:'row',gap:5,alignItems:'center'},lockText:{fontSize:10,color:'#918799',fontWeight:'700'} });
