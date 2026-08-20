import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ImageBackground, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { POLITENESS_LEVELS } from '../data/politenessScenarios';

export default function QuackSituateFormalLevels() {
  return (
    <SafeAreaView style={styles.safe}>
      <ImageBackground source={require('../assets/quacksituate/quacksituate-menu-background-v3.png')} style={styles.bg} imageStyle={styles.bgImage}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.topbar}>
            <Pressable style={styles.iconButton} onPress={() => router.replace('/QuackSituate')}><Ionicons name="arrow-back" size={24} color="#452452" /></Pressable>
            <View style={styles.brand}><Text style={styles.kicker}>TONE QUEST</Text><Text style={styles.title}>Politeness trails</Text></View>
            <View style={styles.iconButton}><Ionicons name="chatbubbles" size={23} color="#8423D9" /></View>
          </View>

          <View style={styles.hero}>
            <View style={styles.heroSeal}><Text style={styles.heroKanji}>礼</Text></View>
            <View style={styles.heroCopy}><Text style={styles.heroEyebrow}>SOCIAL JAPANESE</Text><Text style={styles.heroTitle}>Choose the tone that fits.</Text><Text style={styles.heroText}>Travel from everyday courtesy to formal Japanese. Every gate tests a new relationship.</Text></View>
          </View>

          <View style={styles.path}>
            <View style={styles.pathRope} />
            {POLITENESS_LEVELS.map((item, index) => (
              <View key={item.level} style={styles.stageRow}>
                <View style={[styles.stagePin,{backgroundColor:item.color}]}><Text style={styles.stageNumber}>{item.level}</Text></View>
                <Pressable style={[styles.stageCard,{borderColor:`${item.color}55`}]} onPress={() => router.push({pathname:'/QuackSituateFormal',params:{level:String(item.level)}})}>
                  <View style={[styles.stageIcon,{backgroundColor:`${item.color}18`}]}><Ionicons name={item.icon as any} size={25} color={item.color}/></View>
                  <View style={styles.stageCopy}><Text style={[styles.difficulty,{color:item.color}]}>{item.difficulty} · {item.count} MOMENTS</Text><Text style={styles.stageTitle}>{item.name}</Text><Text style={styles.stageText}>{index===0?'Greetings and everyday courtesy':index===1?'School, service, and workplace tone':'Honorific and humble language trials'}</Text></View>
                  <View style={[styles.play,{backgroundColor:item.color}]}><Ionicons name="arrow-forward" size={21} color="#FFF"/></View>
                </Pressable>
              </View>
            ))}
          </View>
          <View style={styles.tip}><Ionicons name="sparkles" size={20} color="#E58B2A"/><View><Text style={styles.tipTitle}>Tone matters</Text><Text style={styles.tipText}>The same meaning can sound warm, distant, respectful, or rude.</Text></View></View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles=StyleSheet.create({
  safe:{flex:1,backgroundColor:'#FAF7FC'},bg:{flex:1},bgImage:{opacity:.12},content:{padding:19,paddingBottom:46},topbar:{flexDirection:'row',alignItems:'center',gap:13,marginBottom:18},iconButton:{width:52,height:52,borderRadius:18,backgroundColor:'#FFF',alignItems:'center',justifyContent:'center',elevation:4,shadowColor:'#432750',shadowOpacity:.1,shadowRadius:10},brand:{flex:1},kicker:{fontSize:9,fontWeight:'900',letterSpacing:1.5,color:'#65A936'},title:{fontFamily:'Jua',fontSize:27,color:'#432750'},hero:{minHeight:184,borderRadius:30,backgroundColor:'#FFF',borderWidth:1,borderColor:'#E7DAEA',padding:20,flexDirection:'row',alignItems:'center',overflow:'hidden'},heroSeal:{width:104,height:126,borderRadius:50,backgroundColor:'#F1E4FC',alignItems:'center',justifyContent:'center',marginRight:17},heroKanji:{fontSize:65,color:'#8423D9'},heroCopy:{flex:1},heroEyebrow:{fontSize:9,fontWeight:'900',letterSpacing:1.3,color:'#65A936'},heroTitle:{fontFamily:'Jua',fontSize:24,lineHeight:29,color:'#432750',marginTop:5},heroText:{fontSize:12,lineHeight:18,color:'#807383',marginTop:6},path:{marginTop:24,position:'relative'},pathRope:{position:'absolute',left:30,top:24,bottom:24,width:8,borderRadius:8,backgroundColor:'#C99D75',borderWidth:2,borderColor:'#8D6649'},stageRow:{minHeight:150,flexDirection:'row',alignItems:'center'},stagePin:{width:60,height:60,borderRadius:30,borderWidth:5,borderColor:'#FFF',alignItems:'center',justifyContent:'center',zIndex:3,elevation:5},stageNumber:{fontFamily:'Jua',fontSize:23,color:'#FFF'},stageCard:{flex:1,minHeight:126,marginLeft:12,borderRadius:25,backgroundColor:'rgba(255,255,255,.97)',borderWidth:1.5,padding:15,flexDirection:'row',alignItems:'center',elevation:4,shadowColor:'#432750',shadowOpacity:.09,shadowRadius:12},stageIcon:{width:48,height:48,borderRadius:16,alignItems:'center',justifyContent:'center',marginRight:12},stageCopy:{flex:1},difficulty:{fontSize:8,fontWeight:'900',letterSpacing:1.2},stageTitle:{fontFamily:'Jua',fontSize:20,color:'#432750',marginTop:2},stageText:{fontSize:10,lineHeight:15,color:'#87798A',marginTop:3},play:{width:40,height:40,borderRadius:14,alignItems:'center',justifyContent:'center',marginLeft:8},tip:{marginTop:15,borderRadius:22,backgroundColor:'#FFF7E8',borderWidth:1,borderColor:'#F2D79F',padding:16,flexDirection:'row',gap:12,alignItems:'center'},tipTitle:{fontFamily:'Jua',fontSize:16,color:'#604223'},tipText:{fontSize:10,color:'#897256',marginTop:2}
});
