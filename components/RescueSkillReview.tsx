import React,{useMemo,useState} from 'react';
import {Modal,Pressable,ScrollView,StyleSheet,Text,View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {RescueTransfer,rescueTransferFeedback} from '../services/ahiruRescueContext';
import {shuffleOptions} from '../services/shuffleOptions';
export default function RescueSkillReview({question,onContinue}:{question:RescueTransfer;onContinue:()=>void}){
  const choices=useMemo(()=>shuffleOptions(question.choices),[question]);
  const [selected,setSelected]=useState<string|null>(null);
  const answered=selected!==null,correct=selected===question.correctAnswer;
  return <Modal visible transparent animationType="fade" onRequestClose={()=>undefined}>
    <View style={s.shade}><View style={s.card}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content}>
        <View style={s.header}><View style={s.icon}><Ionicons name="chatbubbles-outline" size={23} color="#8423D9"/></View><View style={s.copy}><Text style={s.eyebrow}>SAME SKILL · NEW SCENE</Text><Text style={s.title}>A fresh situation</Text></View><View style={s.badge}><Ionicons name="time-outline" size={13} color="#688447"/><Text style={s.badgeText}>Untimed</Text></View></View>
        <Text style={s.intro}>Use what you just learned in a different setting.</Text>
        <View style={s.context}>
          <View style={s.contextRow}><Ionicons name="location-outline" size={16} color="#8B7399"/><View style={s.copy}><Text style={s.label}>WHERE</Text><Text style={s.contextText}>{question.where}</Text></View></View>
          <View style={s.contextRow}><Ionicons name="people-outline" size={16} color="#8B7399"/><View style={s.copy}><Text style={s.label}>WHO</Text><Text style={s.contextText}>{question.who}</Text></View></View>
          <View style={s.rule}/><Text style={s.goalLabel}>YOUR GOAL</Text><Text style={s.goal}>{question.goal}</Text>
        </View>
        <Text style={s.answerLabel}>CHOOSE THE REPLY THAT FITS</Text>
        <View style={s.answers}>{choices.map((choice,index)=>{
          const picked=selected===choice.japanese,best=answered&&choice.japanese===question.correctAnswer;
          return <Pressable key={choice.japanese} accessibilityRole="button" accessibilityState={{disabled:answered,selected:picked}} disabled={answered} style={({pressed})=>[s.answer,pressed&&s.pressed,best&&s.answerGood,picked&&!correct&&s.answerWrong]} onPress={()=>setSelected(choice.japanese)}>
            <View style={[s.letter,best&&s.letterGood]}><Text style={[s.letterText,best&&s.letterGoodText]}>{String.fromCharCode(65+index)}</Text></View>
            <View style={s.copy}><Text style={s.japanese}>{choice.japanese}</Text><Text style={s.romaji}>{choice.romaji}</Text></View>
            <Ionicons name={best?'checkmark-circle':picked?'close-circle':'chevron-forward'} size={19} color={best?'#57943A':picked?'#BE6173':'#C1AEC9'}/>
          </Pressable>;
        })}</View>
        {answered&&<View accessibilityLiveRegion="polite" style={[s.feedback,!correct&&s.feedbackCompare]}><Text style={[s.feedbackTitle,!correct&&{color:'#9D6731'}]}>{correct?'That fits the situation':'Notice the difference'}</Text><Text style={s.feedbackText}>{rescueTransferFeedback(question,selected)}</Text></View>}
      </ScrollView>
      <View style={s.footer}><View style={s.note}><Ionicons name="shield-checkmark-outline" size={14} color="#8B7399"/><Text style={s.noteText}>Your score and rescue lives stay unchanged.</Text></View>
        {answered&&<Pressable style={s.continue} onPress={onContinue}><Text style={s.continueText}>Continue rescue</Text><Ionicons name="arrow-forward" size={18} color="#fff"/></Pressable>}
      </View>
    </View></View>
  </Modal>;
}

const s=StyleSheet.create({
  shade:{flex:1,padding:18,backgroundColor:'rgba(38,21,49,.58)',alignItems:'center',justifyContent:'center'},
  card:{width:'100%',maxWidth:460,maxHeight:'92%',borderRadius:24,backgroundColor:'#fff',borderWidth:1,borderColor:'#EEE5F3',overflow:'hidden',shadowColor:'#24102E',shadowOpacity:.16,shadowRadius:24,shadowOffset:{width:0,height:10},elevation:12},
  scroll:{flexGrow:0,flexShrink:1,minHeight:0},content:{padding:20,paddingBottom:16},
  header:{flexDirection:'row',alignItems:'center',gap:10},icon:{width:43,height:43,borderRadius:14,backgroundColor:'#F2E8FC',alignItems:'center',justifyContent:'center'},copy:{flex:1,minWidth:0},eyebrow:{fontSize:8,fontWeight:'800',letterSpacing:.9,color:'#79A54D'},title:{fontFamily:'Jua',fontSize:23,color:'#432750',marginTop:3},badge:{flexDirection:'row',alignItems:'center',gap:3,backgroundColor:'#F1F7EB',paddingHorizontal:7,paddingVertical:5,borderRadius:9},badgeText:{fontSize:9,color:'#688447'},intro:{fontSize:12,lineHeight:18,color:'#8B7A93',marginVertical:13},
  context:{borderRadius:16,backgroundColor:'#FAF7FC',padding:14,gap:10},contextRow:{flexDirection:'row',gap:8,alignItems:'flex-start'},label:{fontSize:8,fontWeight:'800',letterSpacing:.8,color:'#A18AAE'},contextText:{fontSize:13,lineHeight:18,color:'#644E70',marginTop:2},rule:{height:1,backgroundColor:'#EDE4F2',marginVertical:1},goalLabel:{fontSize:9,fontWeight:'800',letterSpacing:.8,color:'#8423D9'},goal:{fontSize:14,lineHeight:21,color:'#432750',marginTop:-5},
  answerLabel:{fontSize:9,fontWeight:'800',letterSpacing:.8,color:'#967EA3',marginTop:17,marginBottom:9},answers:{gap:9},answer:{flexDirection:'row',alignItems:'center',gap:11,padding:12,borderRadius:15,borderWidth:1,borderColor:'#E8DCEE',backgroundColor:'#fff',minHeight:69},pressed:{backgroundColor:'#FAF5FE'},letter:{width:32,height:32,borderRadius:10,backgroundColor:'#F2E8FC',alignItems:'center',justifyContent:'center'},letterText:{fontFamily:'Jua',fontSize:16,color:'#8423D9'},japanese:{fontSize:18,lineHeight:25,color:'#432750'},romaji:{fontSize:11,lineHeight:16,color:'#9A83A7',marginTop:2},answerGood:{backgroundColor:'#F4F9EF',borderColor:'#BED6A7'},letterGood:{backgroundColor:'#DFEED2'},letterGoodText:{color:'#57943A'},answerWrong:{backgroundColor:'#FFF6F7',borderColor:'#EAC6CE'},
  feedback:{marginTop:14,padding:13,borderRadius:14,backgroundColor:'#F1F7EB'},feedbackCompare:{backgroundColor:'#FFF7EB'},feedbackTitle:{fontFamily:'Jua',fontSize:16,color:'#58813D',marginBottom:4},feedbackText:{fontSize:12,lineHeight:19,color:'#73627B'},footer:{borderTopWidth:1,borderTopColor:'#F0E9F4',padding:16,paddingTop:12},note:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:6},noteText:{fontSize:10,lineHeight:15,color:'#9A87A5',flexShrink:1},continue:{backgroundColor:'#8423D9',borderRadius:14,minHeight:47,marginTop:12,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:9,paddingHorizontal:14},continueText:{fontFamily:'Jua',fontSize:16,color:'#fff'}
});
