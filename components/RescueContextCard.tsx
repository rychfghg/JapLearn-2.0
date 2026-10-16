import React from 'react';
import {StyleSheet,Text,View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
export default function RescueContextCard({where,who,goal,skill}:{where:string;who:string;goal:string;skill?:string}){
  return <View style={s.card}>{skill&&<Text style={s.skill}>{skill}</Text>}{([
    ['location-outline','WHERE',where],['people-outline','WHO',who],['flag-outline','GOAL',goal]
  ] as const).map(([icon,label,value])=><View key={label} style={s.row}><Ionicons name={icon} size={16} color="#8423D9"/><View style={s.copy}><Text style={s.label}>{label}</Text><Text style={s.value}>{value}</Text></View></View>)}</View>;
}
const s=StyleSheet.create({card:{alignSelf:'stretch',borderRadius:16,padding:12,backgroundColor:'#F8F3FC',borderWidth:1,borderColor:'#EADFF1',marginTop:10,gap:8},skill:{color:'#619C32',fontSize:10,fontWeight:'800',letterSpacing:.6},row:{flexDirection:'row',alignItems:'flex-start',gap:8},copy:{flex:1},label:{fontSize:9,fontWeight:'800',color:'#947BA2',letterSpacing:.7},value:{fontSize:13,lineHeight:18,color:'#432750',marginTop:1}});
