import React,{useEffect,useRef} from 'react';
import {AccessibilityInfo,Animated,Pressable,Text} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
export default function RescueBriefingButton({questionId,onPress}:{questionId:string;onPress:()=>void}){
  const opacity=useRef(new Animated.Value(1)).current;
  const animation=useRef<Animated.CompositeAnimation|null>(null);
  useEffect(()=>{
    let live=true;opacity.setValue(1);
    const pulse=Animated.loop(Animated.sequence([Animated.timing(opacity,{toValue:.65,duration:650,useNativeDriver:true}),Animated.timing(opacity,{toValue:1,duration:650,useNativeDriver:true})]),{iterations:2});
    animation.current=pulse;
    void AccessibilityInfo.isReduceMotionEnabled().then(reduced=>{if(live&&!reduced)pulse.start();}).catch(()=>undefined);
    const subscription=AccessibilityInfo.addEventListener('reduceMotionChanged',reduced=>{if(reduced){pulse.stop();opacity.setValue(1);}});
    return()=>{live=false;pulse.stop();subscription.remove();};
  },[questionId,opacity]);
  return <Animated.View style={{opacity}}><Pressable accessibilityRole="button" accessibilityLabel="Scene briefing: view where you are, who you are speaking to, and your goal" onPress={()=>{animation.current?.stop();opacity.setValue(1);onPress();}} style={{minHeight:44,paddingHorizontal:8,borderRadius:14,backgroundColor:'#F1E6FA',borderWidth:1,borderColor:'#DDC9EE',flexDirection:'row',alignItems:'center',gap:5}}><Ionicons name="compass-outline" size={18} color="#8423D9"/><Text style={{fontSize:11,color:'#71428A',fontWeight:'700'}}>Scene briefing</Text></Pressable></Animated.View>;
}
