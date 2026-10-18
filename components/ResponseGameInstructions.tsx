import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function ResponseGameInstructions({visible,title,steps,onStart,onLeave}:{visible:boolean;title:string;steps:string[];onStart:()=>void;onLeave:()=>void}) {
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={onLeave}>
    <View style={s.backdrop}><ScrollView style={s.scroll} contentContainerStyle={s.content}>
      <View style={s.card}><View style={s.icon}><Ionicons name="chatbubbles-outline" size={28} color="#8423D9"/></View>
        <Text style={s.eyebrow}>BEFORE YOU BEGIN</Text><Text style={s.title}>{title}</Text>
        {steps.map((step,index)=><View key={step} style={s.step}><Text style={s.number}>{index+1}</Text><Text style={s.body}>{step}</Text></View>)}
        <Pressable style={s.primary} onPress={onStart}><Text style={s.primaryText}>Start game</Text><Ionicons name="arrow-forward" size={18} color="#fff"/></Pressable>
        <Pressable style={s.back} onPress={onLeave}><Text style={s.backText}>Back to games</Text></Pressable>
      </View>
    </ScrollView></View>
  </Modal>;
}
const s=StyleSheet.create({
  backdrop:{flex:1,backgroundColor:'rgba(38,20,51,.5)',alignItems:'center',justifyContent:'center',padding:20},
  scroll:{width:'100%',maxWidth:440,flexGrow:0},content:{paddingVertical:12},
  card:{backgroundColor:'#fff',borderRadius:28,padding:24,alignItems:'center',borderWidth:1,borderColor:'#EADFF1'},
  icon:{width:62,height:62,borderRadius:21,backgroundColor:'#F3E7FC',alignItems:'center',justifyContent:'center',marginBottom:12},
  eyebrow:{fontSize:10,color:'#65A936',letterSpacing:1.3,fontWeight:'700'},title:{fontFamily:'Jua',fontSize:26,color:'#351A4A',textAlign:'center',marginVertical:10},
  step:{flexDirection:'row',gap:10,width:'100%',marginVertical:7},number:{color:'#8423D9',fontSize:15,fontWeight:'700'},body:{flex:1,color:'#746779',fontSize:14,lineHeight:21},
  primary:{width:'100%',backgroundColor:'#8423D9',padding:16,borderRadius:16,flexDirection:'row',justifyContent:'center',alignItems:'center',gap:10,marginTop:16},primaryText:{color:'#fff',fontFamily:'Jua',fontSize:17},back:{padding:14},backText:{color:'#8423D9',fontSize:14}
});
