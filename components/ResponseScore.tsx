import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function ResponseScore({earned,maximum=3,total,totalMaximum}:{earned?:number;maximum?:number;total:number;totalMaximum:number}) {
  return <View style={ui.card}>
    {earned !== undefined && <Text style={ui.points}>{earned === 0 ? '0 points added' : `+${earned} points`} · {earned} / {maximum} this reply</Text>}
    <Text style={ui.total}>Score: {total} / {totalMaximum}</Text>
  </View>;
}
const ui=StyleSheet.create({
  card:{alignSelf:'stretch',alignItems:'center',backgroundColor:'#F3EBFA',borderWidth:1,borderColor:'#E4D3F0',borderRadius:14,padding:12,marginVertical:10,gap:4},
  points:{fontSize:12,lineHeight:18,color:'#745682',textAlign:'center'},
  total:{fontFamily:'Jua',fontSize:19,color:'#512B65',textAlign:'center'},
});
