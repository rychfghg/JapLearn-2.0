import React, {useState} from 'react';
import {Modal,Pressable,ScrollView,StyleSheet,Text,View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';

export default function ResponsePauseMenu({visible,onResume,onRestart,onReview}:{visible:boolean;onResume:()=>void;onRestart:()=>void;onReview:()=>void}){
  const [confirm,setConfirm]=useState(false);
  const resume=()=>{setConfirm(false);onResume();};
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={resume}><View style={s.backdrop}><ScrollView style={s.scroll} contentContainerStyle={{paddingVertical:12}}><View style={s.card}>
    <Ionicons name={confirm?'refresh-outline':'pause-circle-outline'} size={38} color="#8423D9"/>
    <Text style={s.title}>{confirm?'Restart from the beginning?':'Game paused'}</Text>
    <Text style={s.body}>{confirm?'Your current run will start over. Previously completed results will not be deleted.':'The conversation and audio are paused. Resume when you are ready.'}</Text>
    {confirm?<><Pressable style={s.primary} onPress={()=>{setConfirm(false);onRestart();}}><Text style={s.white}>Restart game</Text></Pressable><Pressable style={s.secondary} onPress={()=>setConfirm(false)}><Text style={s.purple}>Keep current game</Text></Pressable></>:<>
      <Pressable style={s.primary} onPress={resume}><Text style={s.white}>Resume game</Text></Pressable>
      <Pressable style={s.secondary} onPress={()=>{setConfirm(false);onReview();}}><Text style={s.purple}>Review responses</Text></Pressable>
      <Pressable style={s.secondary} onPress={()=>setConfirm(true)}><Text style={s.purple}>Restart from the beginning</Text></Pressable>
    </>}
  </View></ScrollView></View></Modal>;
}
const s=StyleSheet.create({backdrop:{flex:1,padding:20,backgroundColor:'rgba(38,20,51,.5)',alignItems:'center',justifyContent:'center'},scroll:{width:'100%',maxWidth:420,flexGrow:0},card:{borderRadius:26,backgroundColor:'#fff',padding:24,alignItems:'center'},title:{fontFamily:'Jua',fontSize:24,color:'#351A4A',textAlign:'center',marginVertical:12},body:{fontSize:14,lineHeight:21,color:'#746779',textAlign:'center',marginBottom:12},primary:{width:'100%',padding:16,borderRadius:15,backgroundColor:'#8423D9',alignItems:'center',marginTop:8},secondary:{width:'100%',padding:14,borderRadius:15,backgroundColor:'#F3EAFB',alignItems:'center',marginTop:9},white:{fontFamily:'Jua',fontSize:16,color:'#fff'},purple:{fontSize:14,color:'#8423D9',textAlign:'center'}});
