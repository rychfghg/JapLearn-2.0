import React,{useMemo,useState} from 'react';
import {Modal,View,Text,Pressable,ScrollView,SafeAreaView} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import styles from '../styles/stylesQuackResponseGuided';
import {rushFollowups,rushSkill} from '../services/replyRushFollowups';
import {shuffleOptions} from '../services/shuffleOptions';
export type RushReviewAnswer={nodeId:string;selectedJapanese:string};
export default function ReplyRushReview({visible,nodeIds:allNodeIds,onClose,onSave}:{visible:boolean;nodeIds:string[];onClose:()=>void;onSave:(answers:RushReviewAnswer[])=>Promise<void>}){
  const [index,setIndex]=useState(0),[answers,setAnswers]=useState<RushReviewAnswer[]>([]),[selected,setSelected]=useState<boolean|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  // Only skills with a written transfer question can be reviewed; others would leave the learner stuck.
  const nodeIds=allNodeIds.filter(n=>rushFollowups[rushSkill(n)]);
  const id=nodeIds[index],question=rushFollowups[rushSkill(id??'')];
  const order=useMemo(()=>shuffleOptions([true,false]),[id]);
  const finish=async()=>{setBusy(true);setError('');try{await onSave(answers);onClose();}catch{setError('Review could not be saved. Your answers remain here; please try again.');}finally{setBusy(false);}};
  return <Modal visible={visible} onRequestClose={onClose} animationType="slide"><View style={styles.resultsPage}><SafeAreaView style={{flex:1}}><ScrollView contentContainerStyle={styles.resultsContent}><View style={styles.resultMedal}><Ionicons name="school" size={40} color="#FFFFFF"/></View>
    <Text style={styles.resultsEyebrow}>UNTIMED SKILL REVIEW</Text><Text style={styles.hintTitle}>A new situation, the same skill</Text><Text style={styles.coachNotice}>This is text-only practice. Review results stay separate from the timed round. Timeouts do not prove a lack of understanding.</Text>
    {question?<><View style={{width:'100%',backgroundColor:'#FFFFFF',borderRadius:20,padding:16,marginTop:12}}><Text style={styles.resultsEyebrow}>SKILL {index+1} OF {nodeIds.length}</Text><Text style={styles.reviewPrompt}>{question[0]}</Text></View>{order.map((correct,i)=><Pressable key={String(correct)} disabled={selected!==null} style={styles.choiceButton} onPress={()=>{setSelected(correct);setAnswers(a=>[...a,{nodeId:id,selectedJapanese:question[correct?1:3]}]);}}><View style={{flex:1}}><Text style={styles.choiceJapanese}>{String.fromCharCode(65+i)} · {question[correct?1:3]}</Text><Text style={styles.choiceRomaji}>{question[correct?2:4]}</Text></View></Pressable>)}
      {selected!==null&&<><View style={{width:'100%',borderRadius:18,padding:14,marginTop:10,backgroundColor:selected?'#EFF8E8':'#FDF0EF'}}><Text style={[styles.resultsEyebrow,{marginTop:0,color:selected?'#2E9E48':'#C9453F'}]}>{selected?'THAT FITS':'COMPARE THE SITUATION'}</Text><Text style={styles.explanationText}>{question[5]}</Text><Text style={styles.bestAnswerText}>{question[1]}</Text><Text style={styles.choiceRomaji}>{question[2]}</Text></View>{index<nodeIds.length-1&&<Pressable style={styles.primaryButton} onPress={()=>{setIndex(i=>i+1);setSelected(null);}}><Text style={styles.primaryButtonText}>Next skill</Text></Pressable>}</>}
    </>:<Text style={styles.hintText}>No missed skills need review.</Text>}
    {!!error&&<Text style={{color:'#B83B55'}}>{error}</Text>}
    {(selected!==null&&index===nodeIds.length-1)&&<Pressable disabled={busy} style={styles.primaryButton} onPress={()=>void finish()}><Text style={styles.primaryButtonText}>{busy?'Saving…':'Save practice review'}</Text></Pressable>}
    <Pressable style={styles.secondaryButton} onPress={onClose}><Text style={styles.secondaryButtonText}>Back to results</Text></Pressable>
  </ScrollView></SafeAreaView></View></Modal>;
}
