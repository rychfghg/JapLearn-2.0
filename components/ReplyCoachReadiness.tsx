import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import expoconfig from '../expoconfig';
import styles from '../styles/stylesQuackResponseGuided';
import { coachExamples } from '../services/replyCoachPractice';
import { shuffleOptions } from '../services/shuffleOptions';

type Review = { questionId: string; skill: string; prompt: string; correct: boolean; supported: boolean; explanation: string; bestReply: string; bestRomaji: string; practiceNumber: number };
type Check = {
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'; runId?: string; answered: number; ready: boolean;
  policy: { thresholdPercent: number; questionCount: number; label: string }; passed?: boolean; correct?: number; supported?: number;
  practicedQuestions?: string[]; review?: Review[];
  question?: { id: string; prompt: string; helpTypes: string[]; choices: { id: string; japanese: string; romaji: string; meaning: string }[] };
};

export default function ReplyCoachReadiness({ attemptId, email, onClose }: { attemptId: string; email: string; onClose: () => void }) {
  const [check, setCheck] = useState<Check | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [practiceAnswers, setPracticeAnswers] = useState<Record<number, boolean>>({});
  const [practiceHelp, setPracticeHelp] = useState<Record<number, string[]>>({});
  const lock = useRef(false);
  const practiceOrder=useRef<Record<string,boolean[]>>({});
  const choicesFor=(number:number)=>{
    const key=`${check?.runId}:${number}`;
    return practiceOrder.current[key]??(practiceOrder.current[key]=shuffleOptions([false,true]));
  };
  const request = async (body?: Record<string, string>) => {
    const response = await fetch(`${expoconfig.API_URL}/api/reply-coach/readiness${body ? '' : `?attemptId=${encodeURIComponent(attemptId)}&email=${encodeURIComponent(email)}`}`, body ? {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ attemptId, email, ...body }),
    } : undefined);
    if (!response.ok) throw new Error('Could not save or open your check. Please try again.');
    return response.json();
  };
  useEffect(() => { let active = true; request().then(value => { if (active) setCheck(value); }).catch(reason => { if (active) setError(reason.message); }); return () => { active = false; }; }, [attemptId, email]);
  const act = async (body: Record<string, string>) => {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError('');
    try { setCheck(await request(body)); }
    catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Please try again.');
      // A response may be lost after the server saved it. Recover the authoritative current question.
      try { setCheck(await request()); } catch { /* Keep the retry and save-and-return controls available. */ }
    }
    finally { lock.current = false; setBusy(false); }
  };
  const practice = async (number: number, correctChoice: boolean) => {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError('');
    try {
      const example = coachExamples[number - 1];
      const result = await request({ action: 'practice', mode: 'targeted', questionId: `practice-${number}`,
        selectedJapanese: example[correctChoice ? 1 : 4], helpTypes: (practiceHelp[number] ?? []).join(',') });
      setPracticeAnswers(value => ({ ...value, [number]: result.correct }));
      setCheck(value => value ? { ...value, practicedQuestions: [...(value.practicedQuestions ?? []), `practice-${number}`] } : value);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Please try again.'); }
    finally { lock.current = false; setBusy(false); }
  };
  const needed = [...new Set((check?.review ?? []).filter(item => !item.correct || item.supported).map(item => item.practiceNumber))];
  const practiceDone = needed.every(number => check?.practicedQuestions?.includes(`practice-${number}`));
  const question = check?.question;
  return <Modal visible animationType="slide" onRequestClose={onClose}>
    <SafeAreaView style={styles.reviewPage}>
      <View style={[styles.reviewHeader,ui.header]}><Pressable accessibilityLabel="Save and return" style={styles.iconButton} onPress={onClose}><Ionicons name="arrow-back" size={23} color="#8423D9" /></Pressable><View style={{flex:1,minWidth:0}}><Text style={ui.eyebrow}>REPLY COACH</Text><Text accessibilityRole="header" style={ui.title}>Readiness check</Text></View><View style={ui.icon}><Ionicons name="clipboard-outline" size={24} color="#8423D9"/></View></View>
      <ScrollView contentContainerStyle={[styles.reviewContent, { width: '100%', maxWidth: 700, alignSelf: 'center' }]}>
        {error ? <><Text accessibilityRole="alert" style={styles.coachNotice}>{error}</Text>{!check && <Pressable style={styles.secondaryButton} onPress={() => { setError(''); request().then(setCheck).catch(reason => setError(reason.message)); }}><Text style={styles.secondaryButtonText}>Retry</Text></Pressable>}</> : null}
        {!check && !error && <ActivityIndicator color="#8423D9" />}
        {check && <>
          <View style={ui.intro}>
            <Text style={ui.eyebrow}>YOUR NEXT STEP</Text>
            <Text style={ui.introTitle}>Put your replies into practice</Text>
            <View style={ui.chips}><View style={ui.chip}><Ionicons name="chatbubble-outline" size={14} color="#71449A"/><Text style={ui.chipText}>{check.policy.questionCount} questions</Text></View><View style={ui.chip}><Ionicons name="time-outline" size={14} color="#71449A"/><Text style={ui.chipText}>Untimed</Text></View><View style={ui.chip}><Ionicons name="flag-outline" size={14} color="#71449A"/><Text style={ui.chipText}>{check.policy.thresholdPercent}% to be ready</Text></View></View>
            <Text style={ui.body}>Choose the reply that fits each situation. Japanese and Romaji stay visible.</Text>
            <View style={ui.supportNote}><Ionicons name="information-circle-outline" size={18} color="#9A6515"/><Text style={ui.supportText}>Meaning help is available. Answers using it are recorded as supported practice, not independent correct answers.</Text></View>
            <Text style={ui.caption}>Text-only check · separate from your chapter score · readiness is assessed automatically</Text>
          </View>
          {check.status === 'NOT_STARTED' && <Pressable disabled={busy} style={styles.primaryButton} onPress={() => act({ action: 'start' })}><Text style={styles.primaryButtonText}>Start readiness check</Text></Pressable>}
          {check.status === 'IN_PROGRESS' && question && <>
            <View style={ui.questionCard}>
              <View style={ui.progressHeading}><Text style={ui.eyebrow}>CHOOSE THE BEST REPLY</Text><Text style={ui.counter}>{check.answered + 1} / {check.policy.questionCount}</Text></View>
              <View style={ui.track}><View style={[ui.fill,{width:`${Math.min(100,Math.max(0,check.answered/check.policy.questionCount*100))}%`}]}/></View>
              <Text style={ui.prompt}>{question.prompt}</Text>
            </View>
            <View style={styles.coachTools}>{['meaning'].map(help => <Pressable key={help} disabled={busy || question.helpTypes.includes(help)} style={styles.coachTool} onPress={() => act({ action: 'support', runId: check.runId!, questionId: question.id, helpType: help })}><Text style={styles.coachToolText}>{question.helpTypes.includes(help) ? `${help} shown` : `Show ${help}`}</Text></Pressable>)}</View>
            {question.helpTypes.length > 0 && <Text style={styles.coachNotice}>Support used · this answer will not count as independent.</Text>}
            {question.choices.map((choice,index) => <Pressable key={choice.id} disabled={busy} accessibilityRole="button" style={({pressed})=>[styles.coachExample,ui.answer,pressed&&ui.answerPressed,busy&&{opacity:.6}]} onPress={() => act({ action: 'answer', runId: check.runId!, questionId: question.id, choiceId: choice.id })}><View style={ui.letter}><Text style={ui.letterText}>{String.fromCharCode(65+index)}</Text></View><View style={{flex:1,minWidth:0}}><Text style={styles.choiceJapanese}>{choice.japanese}</Text>{Boolean(choice.romaji) && <Text style={styles.choiceRomaji}>{choice.romaji}</Text>}{Boolean(choice.meaning) && <Text style={styles.dialogueText}>{choice.meaning}</Text>}</View><Ionicons name="chevron-forward" size={17} color="#A58CAF"/></Pressable>)}
            <Text style={styles.coachNotice}>Feedback appears after all questions. Each answer is saved; you can return later.</Text>
          </>}
          {check.status === 'COMPLETED' && <>
            <View style={ui.result}><View style={ui.icon}><Ionicons name={check.passed?'checkmark-circle-outline':'book-outline'} size={30} color="#8423D9"/></View><Text style={ui.introTitle}>{check.passed ? 'Ready for the next activities' : 'Let’s strengthen these skills'}</Text><Text style={ui.resultScore}>{check.correct} / {check.policy.questionCount}</Text><Text style={ui.body}>Independent correct answers · {check.supported ?? 0} supported</Text></View>
            {check.review?.map(item => <View key={item.questionId} style={styles.reviewCard}><Text style={styles.coachContextLabel}>{item.skill} · {item.correct ? 'Correct' : 'Review'}{item.supported ? ' · supported' : ''}</Text><Text style={styles.reviewPrompt}>{item.prompt}</Text><Text style={styles.bestAnswerText}>{item.bestReply}</Text><Text style={styles.choiceRomaji}>{item.bestRomaji}</Text><Text style={styles.reviewExplanation}>{item.explanation}</Text></View>)}
            {!check.passed && <>
              <Text style={styles.hintTitle}>Targeted practice</Text>
              <Text style={styles.coachNotice}>Practice the missed or supported skills below, then try a different set. Your previous check stays saved.</Text>
              {needed.map(number => { const example = coachExamples[number - 1]; const done = check.practicedQuestions?.includes(`practice-${number}`); const help = practiceHelp[number] ?? []; return <View key={number} style={styles.reviewCard}>
                <Text style={styles.reviewPrompt}>{example[0]}</Text>
                <View style={styles.coachTools}>{['meaning'].map(type => <Pressable key={type} disabled={done} style={styles.coachTool} onPress={() => setPracticeHelp(value => ({ ...value, [number]: [...new Set([...help, type])] }))}><Text style={styles.coachToolText}>Show {type}</Text></Pressable>)}</View>
                {choicesFor(number).map((correct, index) => <Pressable key={index} disabled={busy || done} style={styles.coachExample} onPress={() => practice(number, correct)}><Text style={styles.choiceJapanese}>{example[correct ? 1 : 4]}</Text><Text style={styles.choiceRomaji}>{example[correct ? 2 : 5]}</Text>{help.includes('meaning') && <Text style={styles.dialogueText}>{example[correct ? 3 : 6]}</Text>}</Pressable>)}
                {done && <Text style={styles.reviewExplanation}>{practiceAnswers[number] === false ? 'Review: ' : 'Practice saved. '}{example[7]}</Text>}
              </View>; })}
              <Pressable disabled={busy || !practiceDone} style={[styles.primaryButton, !practiceDone && { opacity: 0.5 }]} onPress={() => { setPracticeAnswers({}); setPracticeHelp({}); void act({ action: 'start' }); }}><Text style={styles.primaryButtonText}>Try a different readiness set</Text></Pressable>
            </>}
          </>}
        </>}
        {busy && <ActivityIndicator style={{ marginTop: 12 }} color="#8423D9" />}
        <Pressable style={styles.secondaryButton} onPress={onClose}><Text style={styles.secondaryButtonText}>Save and return</Text></Pressable>
      </ScrollView>
    </SafeAreaView>
  </Modal>;
}

const ui=StyleSheet.create({
  header:{gap:10},
  eyebrow:{fontFamily:'Jua',fontSize:10,letterSpacing:1,color:'#65A73F'},
  title:{fontFamily:'Jua',fontSize:22,lineHeight:28,color:'#351A4A'},
  icon:{width:46,height:46,borderRadius:16,backgroundColor:'#F0E5FA',alignItems:'center',justifyContent:'center'},
  intro:{backgroundColor:'#FFFFFF',borderRadius:22,borderWidth:1,borderColor:'#E8DDEF',padding:16,marginBottom:16,gap:10},
  introTitle:{fontFamily:'Jua',fontSize:21,lineHeight:27,color:'#351A4A'},
  chips:{flexDirection:'row',flexWrap:'wrap',gap:6},
  chip:{flexDirection:'row',alignItems:'center',gap:5,paddingHorizontal:9,paddingVertical:6,borderRadius:10,backgroundColor:'#F5EFFA'},
  chipText:{fontSize:11,fontWeight:'600',color:'#71449A'},
  body:{fontSize:13,lineHeight:19,color:'#695771'},
  supportNote:{flexDirection:'row',alignItems:'flex-start',gap:7,padding:10,borderRadius:12,backgroundColor:'#FFF7E6'},
  supportText:{flex:1,fontSize:12,lineHeight:18,color:'#80632E'},
  caption:{fontSize:11,lineHeight:16,color:'#8A7892'},
  questionCard:{backgroundColor:'#F2EAF9',padding:16,borderRadius:18,marginBottom:8,borderWidth:1,borderColor:'#E6D6F2',gap:10},
  progressHeading:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:6},
  counter:{fontFamily:'Jua',fontSize:13,color:'#71449A'},
  track:{height:4,borderRadius:4,backgroundColor:'#E2D3ED',overflow:'hidden'},
  fill:{height:'100%',backgroundColor:'#8423D9'},
  prompt:{fontSize:16,lineHeight:24,fontWeight:'600',color:'#432750'},
  answer:{flexDirection:'row',alignItems:'center',gap:10,padding:12,backgroundColor:'#FFFFFF',borderColor:'#E6D9EB',borderRadius:16},
  answerPressed:{backgroundColor:'#F5ECFC',borderColor:'#8423D9'},
  letter:{width:32,height:32,borderRadius:11,backgroundColor:'#F0E5FA',alignItems:'center',justifyContent:'center'},
  letterText:{fontFamily:'Jua',fontSize:15,color:'#8423D9'},
  result:{padding:18,borderRadius:22,backgroundColor:'#F2EAF9',alignItems:'center',gap:10,marginBottom:16},
  resultScore:{fontFamily:'Jua',fontSize:34,color:'#8423D9'},
});
