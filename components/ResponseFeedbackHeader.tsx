import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

/** One compact feedback row; the final results use ResponseScore separately. */
export default function ResponseFeedbackHeader({label,icon,color,total,maximum}:{label:string;icon:React.ComponentProps<typeof Ionicons>['name'];color:string;total:number;maximum:number}) {
  return <View style={ui.row}>
    <Ionicons name={icon} size={19} color={color}/>
    <Text style={[ui.label,{color}]}>{label}</Text>
    <Text style={ui.divider}>|</Text>
    <Text style={ui.score}>Score: {total}/{maximum}</Text>
  </View>;
}
const ui=StyleSheet.create({
  row:{alignSelf:'stretch',flexDirection:'row',alignItems:'center',justifyContent:'center',gap:6,marginTop:4,marginBottom:8},
  label:{flexShrink:1,fontFamily:'Jua',fontSize:13,lineHeight:18},
  divider:{color:'#C7B5D1',fontSize:14},
  score:{fontFamily:'Jua',fontSize:13,lineHeight:18,color:'#512B65'},
});
