import React,{useMemo,useState} from 'react';
import {Modal,Pressable,ScrollView,Text,View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import RescueContextCard from './RescueContextCard';
import {RescueTransfer,rescueTransferFeedback} from '../services/ahiruRescueContext';
import {shuffleOptions} from '../services/shuffleOptions';
import {stylesRecognition as styles} from '../styles/stylesQuackSituateRecognition';
export default function RescueSkillReview({question,onContinue}:{question:RescueTransfer;onContinue:()=>void}){
  const choices=useMemo(()=>shuffleOptions(question.choices),[question]);
  const [selected,setSelected]=useState<string|null>(null);
  return <Modal visible transparent animationType="fade" onRequestClose={()=>undefined}><View style={styles.modalShade}><ScrollView style={{width:'100%',maxWidth:470,maxHeight:'94%',flexGrow:0,flexShrink:1}} contentContainerStyle={{paddingVertical:12}}><View style={styles.modalCard}>
    <Ionicons name="chatbubbles-outline" size={28} color="#8423D9"/><Text style={styles.modalEyebrow}>SAME SKILL · NEW SITUATION</Text><Text style={styles.modalTitle}>Try it somewhere else</Text>
    <Text style={styles.modalBody}>Untimed practice only. Your score and rescue lives will not change.</Text>
    <RescueContextCard where={question.where} who={question.who} goal={question.goal}/>
    {choices.map((choice,index)=><Pressable key={choice.japanese} disabled={selected!==null} style={[styles.choiceCard,{alignSelf:'stretch',marginTop:10},selected===choice.japanese&&styles.choiceCardActive]} onPress={()=>setSelected(choice.japanese)}><Text style={styles.choiceMarkerText}>{String.fromCharCode(65+index)}</Text><View style={styles.choiceCopy}><Text style={styles.choiceJapanese}>{choice.japanese}</Text><Text style={styles.choiceRomaji}>{choice.romaji}</Text></View></Pressable>)}
    {selected!==null&&<><Text style={styles.modalEyebrow}>{selected===question.correctAnswer?'THAT FITS':'COMPARE THE GOAL'}</Text><Text style={styles.modalBody}>{rescueTransferFeedback(question,selected)}</Text><Text style={styles.correctJapanese}>{question.correctAnswer}</Text><Text style={styles.correctRomaji}>{question.choices.find(c=>c.japanese===question.correctAnswer)?.romaji}</Text><Pressable style={styles.primaryButton} onPress={onContinue}><Text style={styles.primaryButtonText}>CONTINUE RESCUE</Text></Pressable></>}
  </View></ScrollView></View></Modal>;
}
