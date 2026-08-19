import React, { useEffect, useRef } from 'react';
import { Animated, Image, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  color: string;
  tint: string;
  icon: keyof typeof Ionicons.glyphMap;
  eyebrow: string;
  title: string;
  message: string;
  footer: string;
  mascot: ImageSourcePropType;
  onComplete: () => void;
};

export default function AhiruMissionExit({ color, tint, icon, eyebrow, title, message, footer, mascot, onComplete }: Props) {
  const progress = useRef(new Animated.Value(0)).current;
  const mascotScale = useRef(new Animated.Value(.94)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(progress, { toValue: 1, duration: 950, useNativeDriver: false }),
      Animated.spring(mascotScale, { toValue: 1, friction: 6, tension: 55, useNativeDriver: true }),
    ]).start();
    const timeout = setTimeout(onComplete, 1050);
    return () => timeout && clearTimeout(timeout);
  }, [onComplete, mascotScale, progress]);

  const barWidth = progress.interpolate({ inputRange: [0, 1], outputRange: ['6%', '100%'] });

  return <View style={[styles.screen, { backgroundColor: tint }]}>
    <View style={[styles.orb, styles.orbTop, { backgroundColor: color }]} />
    <View style={[styles.orb, styles.orbBottom, { backgroundColor: color }]} />
    <View style={styles.card}>
      <View style={[styles.badge, { backgroundColor: tint }]}><Ionicons name={icon} size={16} color={color} /><Text style={[styles.badgeText, { color }]}>{eyebrow}</Text></View>
      <View style={styles.stage}>
        <View style={[styles.halo, { backgroundColor: tint, borderColor: `${color}42` }]} />
        <View style={[styles.spark, styles.sparkOne, { backgroundColor: color }]} />
        <View style={[styles.spark, styles.sparkTwo, { backgroundColor: color }]} />
        <Animated.View style={{ transform: [{ scale: mascotScale }] }}><Image source={mascot} style={styles.mascot} resizeMode="contain" /></Animated.View>
      </View>
      <Text style={styles.kicker}>MISSION COMPLETE</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      <View style={styles.statusRow}><Text style={styles.status}>Returning to Ahiru Quest</Text><Ionicons name="checkmark-circle" size={18} color={color} /></View>
      <View style={styles.track}><Animated.View style={[styles.fill, { width: barWidth, backgroundColor: color }]} /></View>
      <View style={styles.footer}><Ionicons name="sparkles-outline" size={14} color={color} /><Text style={styles.footerText}>{footer}</Text></View>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  screen:{flex:1,alignItems:'center',justifyContent:'center',paddingHorizontal:24,overflow:'hidden'},orb:{position:'absolute',width:310,height:310,borderRadius:155,opacity:.09},orbTop:{right:-130,top:-95},orbBottom:{left:-150,bottom:-105},card:{width:'100%',maxWidth:390,backgroundColor:'#FFF',borderRadius:30,paddingHorizontal:25,paddingTop:22,paddingBottom:25,alignItems:'center',borderWidth:1,borderColor:'rgba(70,42,94,.09)',shadowColor:'#402253',shadowOpacity:.16,shadowRadius:26,shadowOffset:{width:0,height:13},elevation:12},badge:{alignSelf:'flex-start',flexDirection:'row',alignItems:'center',gap:7,borderRadius:99,paddingHorizontal:12,paddingVertical:8},badgeText:{fontSize:8,fontWeight:'900',letterSpacing:1},stage:{height:190,width:190,alignItems:'center',justifyContent:'center',marginTop:2},halo:{position:'absolute',width:164,height:164,borderRadius:82,borderWidth:1},mascot:{width:158,height:170},spark:{position:'absolute',width:7,height:7,borderRadius:4,opacity:.7},sparkOne:{left:11,top:53},sparkTwo:{right:9,bottom:49},kicker:{color:'#978A9F',fontSize:8,fontWeight:'900',letterSpacing:1.35},title:{color:'#352040',fontFamily:'Jua',fontSize:28,textAlign:'center',marginTop:5},message:{color:'#75697C',fontSize:10,lineHeight:16,textAlign:'center',maxWidth:275,marginTop:6,marginBottom:22},statusRow:{width:'100%',flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:8},status:{color:'#5D5064',fontSize:9,fontWeight:'800'},track:{width:'100%',height:10,borderRadius:6,backgroundColor:'#EEE9F0',overflow:'hidden'},fill:{height:'100%',borderRadius:6},footer:{flexDirection:'row',alignItems:'center',gap:7,marginTop:17,backgroundColor:'#FAF8FB',borderRadius:12,paddingHorizontal:12,paddingVertical:9},footerText:{color:'#6E6275',fontSize:9,fontWeight:'700'},
});
