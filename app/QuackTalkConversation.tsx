import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { Pressable, SafeAreaView, Text, View } from 'react-native';
import { router } from 'expo-router';
import QuackTalkPracticeRoom from '../components/QuackTalkPracticeRoom';

class ConversationScreenBoundary extends Component<{children:ReactNode},{failed:boolean}> {
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  componentDidCatch(error:Error,info:ErrorInfo){console.error('Talk with Sumi screen error',error,info.componentStack);}
  render(){
    if(!this.state.failed)return this.props.children;
    return <SafeAreaView style={{flex:1,backgroundColor:'#F8F3FC',alignItems:'center',justifyContent:'center',padding:24}}>
      <View style={{width:'100%',maxWidth:440,padding:24,borderRadius:24,backgroundColor:'#FFFFFF',borderWidth:1,borderColor:'#E7DCEF'}}>
        <Text style={{fontFamily:'Jua',fontSize:24,color:'#3D2549',textAlign:'center'}}>The conversation room needs to reopen</Text>
        <Text style={{fontSize:14,lineHeight:21,color:'#75687A',textAlign:'center',marginTop:10}}>JapLearn stopped an unexpected screen error before it could close the app.</Text>
        <Pressable onPress={()=>this.setState({failed:false})} style={{height:50,borderRadius:15,backgroundColor:'#7B2CBF',alignItems:'center',justifyContent:'center',marginTop:20}}><Text style={{fontFamily:'Jua',fontSize:15,color:'#FFFFFF'}}>Try opening again</Text></Pressable>
        <Pressable onPress={()=>router.replace('/QuackTalk')} style={{height:46,alignItems:'center',justifyContent:'center',marginTop:6}}><Text style={{fontFamily:'Jua',fontSize:13,color:'#7552C8'}}>Back to QuackTalk</Text></Pressable>
      </View>
    </SafeAreaView>;
  }
}

export default function QuackTalkConversation() {
  return <ConversationScreenBoundary><QuackTalkPracticeRoom variant="conversation" /></ConversationScreenBoundary>;
}
