import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function ResponseScore({total,totalMaximum}:{total:number;totalMaximum:number}) {
  return <View style={ui.card}>
    <Text style={ui.total}>Score: {total} / {totalMaximum}</Text>
  </View>;
}
const ui=StyleSheet.create({
  card:{alignSelf:'stretch',alignItems:'center',backgroundColor:'#F3EBFA',borderWidth:1,borderColor:'#E4D3F0',borderRadius:14,padding:12,marginVertical:10,gap:4},
  total:{fontFamily:'Jua',fontSize:19,color:'#512B65',textAlign:'center'},
});
