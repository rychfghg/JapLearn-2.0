import Ionicons from '@expo/vector-icons/Ionicons';
import { AudioManager, AudioRecorder, FileFormat, FilePreset } from 'react-native-audio-api';
import { router } from 'expo-router';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Image, ImageBackground, Platform, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import BackIcon from '../assets/svg/back-icon.svg';
import { AuthContext } from '../context/AuthContext';
import expoconfig from '../expoconfig';
import styles from '../styles/stylesQuackTalkPracticeRoom';
import { ConversationEvaluation, GeminiGuidedPhraseLive, GuidedLiveAccess } from '../services/guidedPhraseLive';

const background=require('../assets/quacktalk/talk-with-sumi-lounge-v1.png');
const idle=require('../assets/img/Sumi_PoseB_WinterUni_Smile.png');
const blink=require('../assets/img/Sumi_PoseB_WinterUni_EyesClosed_Smile.png');
const speaking=require('../assets/img/Sumi_PoseB_WinterUni_Open.png');
const speakingBlink=require('../assets/img/Sumi_PoseB_WinterUni_EyesClosed_Open.png');
const listening=require('../assets/img/Sumi_PoseB_WinterUni_Smile_Blush.png');

type Scores={speechDetected?:boolean;recognizedText?:string;pronunciation:number;accuracy:number;fluency:number;completeness:number};
/** One learner turn. Only turns where speech was actually detected count toward any score. */
type Turn={id:number;learnerText:string;sumiText:string;speech:'pending'|'ok'|'none'|'failed';scores?:Scores;evaluation?:ConversationEvaluation};
type State='connecting'|'thinking'|'start'|'speaking'|'ready'|'listening'|'saving'|'finished'|'error';

const SUMI_REPLY_TIMEOUT_MS=25000;

async function request(url:string,options:RequestInit={}){
 const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),45000);
 try{return await fetch(url,{...options,signal:controller.signal});}finally{clearTimeout(timeout);}
}
async function activateDeviceAudio(mode:'playback'|'recording'){
 if(Platform.OS==='web')return;
 // Android does not need iOS category values. Applying those values while a
 // screen mounts can terminate the native audio session on some APK builds.
 if(Platform.OS==='ios'){
  AudioManager.setAudioSessionOptions(mode==='recording'
   ?{iosCategory:'playAndRecord',iosMode:'default',iosOptions:['defaultToSpeaker','allowBluetooth']}
   :{iosCategory:'playback',iosMode:'spokenAudio',iosOptions:['allowBluetoothA2DP']});
 }
 await AudioManager.setAudioSessionActivity(true);
}

export default function TalkWithSumiLiveRoom(){
 const {user}=useContext(AuthContext);
 const transmitting=useRef(false);const mounted=useRef(true);const starting=useRef(false);const ending=useRef(false);const micBusy=useRef(false);
 const replaying=useRef(false);const awaitingSumi=useRef(false);const sumiTimeout=useRef<ReturnType<typeof setTimeout>|null>(null);
 const pending=useRef<Promise<void>[]>([]);const recordingTimeout=useRef<ReturnType<typeof setTimeout>|null>(null);
 const sessionId=useRef('talk-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2));
 const liveRef=useRef<GeminiGuidedPhraseLive|null>(null);const recorderRef=useRef<AudioRecorder|null>(null);
 const webStreamRef=useRef<any>(null);const webContextRef=useRef<any>(null);const webProcessorRef=useRef<any>(null);const webRecorderRef=useRef<any>(null);const chunksRef=useRef<Blob[]>([]);
 const turnsRef=useRef<Turn[]>([]);const currentTurn=useRef<Turn|null>(null);const sumiLine=useRef('');const openingLine=useRef('');
 const startedAt=useRef(Date.now());
 const [remaining,setRemaining]=useState(10);const [resetAt,setResetAt]=useState('');const [clock,setClock]=useState(Date.now());
 const [state,setState]=useState<State>('start');const [message,setMessage]=useState('Tap Start conversation when you are ready.');
 const [blinked,setBlinked]=useState(false);const [mouth,setMouth]=useState(false);const [saveError,setSaveError]=useState('');const [notice,setNotice]=useState('');
 const [history,setHistory]=useState<{who:'sumi'|'you';text:string}[]>([]);const [showHistory,setShowHistory]=useState(false);const [canReplay,setCanReplay]=useState(false);const [validTurns,setValidTurns]=useState(0);
 const frame=state==='speaking'?(blinked?speakingBlink:mouth?speaking:idle):state==='listening'?listening:(blinked?blink:idle);

 useEffect(()=>{const id=setInterval(()=>{setBlinked(true);setTimeout(()=>setBlinked(false),150);},3500);return()=>clearInterval(id);},[]);
 useEffect(()=>{if(state!=='speaking'){setMouth(false);return;}const id=setInterval(()=>setMouth(value=>!value),170);return()=>clearInterval(id);},[state]);
 useEffect(()=>{mounted.current=true;if(!user?.email){setState('error');setMessage('Sign in to talk with Sumi.');}return()=>{mounted.current=false;starting.current=false;transmitting.current=false;if(recordingTimeout.current)clearTimeout(recordingTimeout.current);if(sumiTimeout.current)clearTimeout(sumiTimeout.current);liveRef.current?.close();try{recorderRef.current?.stop();}catch{}webStreamRef.current?.getTracks?.().forEach((track:any)=>track.stop());void webContextRef.current?.close?.();if(Platform.OS!=='web')void AudioManager.setAudioSessionActivity(false).catch(()=>undefined);};},[user?.email]);

 const addHistory=(who:'sumi'|'you',text:string)=>{const clean=text.trim();if(clean)setHistory(current=>[...current,{who,text:clean}].slice(-12));};
 const quietState=(current:State)=>current==='start'||current==='error'||current==='listening'||current==='saving'||current==='finished';
 const clearSumiTimeout=()=>{if(sumiTimeout.current)clearTimeout(sumiTimeout.current);sumiTimeout.current=null;};

 /** Sumi has completely finished a turn (all audio played): only now does the microphone unlock. */
 const onSumiFinished=()=>{
  if(!mounted.current||ending.current)return;
  clearSumiTimeout();awaitingSumi.current=false;
  const line=sumiLine.current.trim();sumiLine.current='';
  if(line){addHistory('sumi',line);if(currentTurn.current)currentTurn.current.sumiText=line;else openingLine.current=line;}
  setCanReplay(!!liveRef.current?.hasReplay());
  setState(current=>quietState(current)?current:'ready');
  setMessage('Your turn—tap the microphone and answer naturally.');
 };

 const unlock=async()=>{
  if(starting.current||!user?.email)return;
  starting.current=true;ending.current=false;setSaveError('');setNotice('');
  setState('connecting');setMessage('Connecting to Sumi…');
  try{
    // Nothing native or network-related runs until this explicit user action.
    await activateDeviceAudio('playback');
    const response=await request(`${expoconfig.API_URL}/api/talk-with-sumi/live-token`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:user.email})});
    const raw=await response.text();let body:any={};
    try{body=raw?JSON.parse(raw):{};}catch{throw new Error(response.ok?'The conversation service returned an unreadable response.':'The conversation service is temporarily unavailable.');}
    if(body.resetsAt)setResetAt(body.resetsAt);
    if(typeof body.remaining==='number')setRemaining(body.remaining);
    if(!response.ok)throw new Error(body.message||'The conversation could not open.');
    if(!mounted.current)return;
    liveRef.current?.close();
    const live=new GeminiGuidedPhraseLive({
     onConnected:()=>{if(!mounted.current)return;setState('thinking');setMessage('Sumi is greeting you…');awaitingSumi.current=true;},
     // Speaking only animates Sumi; turn-taking is decided by onModelTurnDone.
     onSpeaking:value=>{if(!mounted.current||ending.current)return;
      if(value){setState(current=>current==='listening'||current==='saving'||current==='finished'?current:'speaking');setMessage(replaying.current?'Replaying Sumi…':'Listen to Sumi…');return;}
      if(replaying.current){replaying.current=false;setState(current=>quietState(current)?current:'ready');setMessage('Your turn—tap the microphone and answer naturally.');}},
     onModelTurnDone:onSumiFinished,
     onInputTranscript:text=>{if(currentTurn.current)currentTurn.current.learnerText=(currentTurn.current.learnerText+text).slice(-400);},
     onOutputTranscript:text=>{sumiLine.current=(sumiLine.current+text).slice(-600);},
     onTurn:()=>undefined,onEvaluation:()=>undefined,
     onConversationEvaluation:value=>{if(currentTurn.current&&!currentTurn.current.evaluation)currentTurn.current.evaluation=value;},
     onError:text=>{if(!mounted.current||ending.current)return;clearSumiTimeout();setState('error');setMessage(text);},
     onComplete:()=>{if(!mounted.current||ending.current)return;clearSumiTimeout();setState('error');setMessage('The live conversation ended. Reconnect to continue, or save your session.');}
    },'conversation');
    liveRef.current=live;
    await live.activateAudio();
    await live.connect(body as GuidedLiveAccess,{deferNativeAudio:true,autoBegin:false});
    if(!mounted.current){live.close();return;}
    live.begin();
    sumiTimeout.current=setTimeout(()=>{if(awaitingSumi.current&&mounted.current&&!ending.current){awaitingSumi.current=false;setState('ready');setMessage('Sumi is quiet. Tap the microphone and say hello to begin.');}},SUMI_REPLY_TIMEOUT_MS);
   }catch(error){if(mounted.current){liveRef.current?.close();liveRef.current=null;setState('start');setMessage(error instanceof Error?error.message:'Tap again to start the conversation.');}}
   finally{starting.current=false;}
 };

 const startWeb=async()=>{const devices=(globalThis.navigator as any)?.mediaDevices;if(!devices?.getUserMedia)throw new Error('Microphone recording is unavailable in this browser.');const stream=await devices.getUserMedia({audio:{channelCount:1,echoCancellation:true,noiseSuppression:true,autoGainControl:true}});const AC=(globalThis as any).AudioContext||(globalThis as any).webkitAudioContext;const context=new AC();await context.resume();const source=context.createMediaStreamSource(stream);const processor=context.createScriptProcessor(2048,1,1);const silent=context.createGain();silent.gain.value=0;processor.onaudioprocess=(event:any)=>{const input=event.inputBuffer.getChannelData(0);const ratio=context.sampleRate/16000;const output=new Float32Array(Math.max(1,Math.floor(input.length/ratio)));for(let i=0;i<output.length;i++)output[i]=input[Math.min(input.length-1,Math.floor(i*ratio))];if(transmitting.current)liveRef.current?.sendPcm16(output);};source.connect(processor);processor.connect(silent);silent.connect(context.destination);const MR=(globalThis as any).MediaRecorder;if(!MR)throw new Error('This browser cannot prepare speech review.');const recorder=new MR(stream);chunksRef.current=[];recorder.ondataavailable=(event:any)=>{if(event.data?.size)chunksRef.current.push(event.data);};webStreamRef.current=stream;webContextRef.current=context;webProcessorRef.current=processor;webRecorderRef.current=recorder;recorder.start(250);};
 const releaseWeb=()=>{webProcessorRef.current?.disconnect?.();webStreamRef.current?.getTracks?.().forEach((track:any)=>track.stop());void webContextRef.current?.close?.();webProcessorRef.current=null;webStreamRef.current=null;webContextRef.current=null;};

 const startMic=async()=>{
  if(state!=='ready'||micBusy.current||ending.current||remaining<=0)return;
  micBusy.current=true;setNotice('');
  setState('thinking');setMessage('Preparing your microphone…');
  let reserved=false;
  try{
   const live=liveRef.current;if(!live)throw new Error('Sumi is not connected yet. Please try again.');
   if(Platform.OS!=='web'){
    const permission=await AudioManager.requestRecordingPermissions();
    if(permission!=='Granted')throw new Error('Allow microphone access in your device settings to speak with Sumi.');
   }
   await live.activateAudio();live.interrupt();
   const reservation=await request(`${expoconfig.API_URL}/api/talk-with-sumi/reserve-response`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:user?.email})});
   const quota=await reservation.json().catch(()=>({}));if(quota.resetsAt)setResetAt(quota.resetsAt);if(typeof quota.remaining==='number')setRemaining(quota.remaining);
   if(!reservation.ok)throw new Error(quota.message||'Your response could not start.');
   reserved=true;
   if(Platform.OS==='web')await startWeb();
   else{
    await activateDeviceAudio('recording');
    const recorder=new AudioRecorder();recorderRef.current=recorder;
    const file=recorder.enableFileOutput({format:FileFormat.Wav,preset:FilePreset.Medium});
    if(file.status==='error')throw new Error(file.message);
    const stream=recorder.onAudioReady({sampleRate:16000,bufferLength:1600,channelCount:1},({buffer})=>{if(transmitting.current)live.sendPcm16(buffer.getChannelData(0));});
    if(stream.status==='error')throw new Error(stream.message);
    const result=recorder.start();if(result.status==='error')throw new Error(result.message);
   }
   const turn:Turn={id:turnsRef.current.length+1,learnerText:'',sumiText:'',speech:'pending'};
   turnsRef.current=[...turnsRef.current,turn];currentTurn.current=turn;
   live.beginUserAudio();transmitting.current=true;
   setState('listening');setMessage('Sumi is listening. Speak naturally, then tap Stop.');
  }catch(error){
   transmitting.current=false;releaseWeb();
   if(recorderRef.current){try{recorderRef.current.clearOnAudioReady();recorderRef.current.stop();}catch{}recorderRef.current=null;}
   if(reserved)void releaseResponse();
   setState('ready');setMessage(error instanceof Error?error.message:'The microphone could not start.');
  }finally{micBusy.current=false;}
 };

 /** Gives back today's response when a turn could not be used (no speech or a technical failure). */
 const releaseResponse=async()=>{try{const response=await request(`${expoconfig.API_URL}/api/talk-with-sumi/release-response`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:user?.email})});const body=await response.json().catch(()=>({}));if(typeof body.remaining==='number'&&mounted.current)setRemaining(body.remaining);}catch{}};

 const stopMic=async()=>{
  if(state!=='listening'||micBusy.current)return;
  micBusy.current=true;transmitting.current=false;
  if(recordingTimeout.current)clearTimeout(recordingTimeout.current);
  const turn=currentTurn.current;
  try{
   let audio:string|Blob|null=null;
   if(Platform.OS==='web'){
    const recorder=webRecorderRef.current;webRecorderRef.current=null;
    if(recorder){audio=await new Promise<Blob>((resolve,reject)=>{recorder.onerror=()=>reject(new Error('Recording could not finish.'));recorder.onstop=()=>resolve(new Blob(chunksRef.current,{type:recorder.mimeType||'audio/webm'}));recorder.stop();});}
    releaseWeb();
   }else{
    const recorder=recorderRef.current;recorderRef.current=null;
    if(recorder){const result=recorder.stop();recorder.clearOnAudioReady();if(result.status==='success'&&result.path)audio=result.path;}
    await activateDeviceAudio('playback').catch(()=>undefined);
   }
   await liveRef.current?.activateAudio();liveRef.current?.endUserAudio();
   awaitingSumi.current=true;setState('thinking');setMessage('Sumi is thinking about your answer…');
   clearSumiTimeout();
   sumiTimeout.current=setTimeout(()=>{if(awaitingSumi.current&&mounted.current&&!ending.current){awaitingSumi.current=false;setState('ready');setMessage('Sumi did not answer. Please say that again.');}},SUMI_REPLY_TIMEOUT_MS);
   if(!audio||(audio instanceof Blob&&!audio.size)){if(turn)markUnusable(turn,'failed');return;}
   if(turn){const review=assess(turn,audio);pending.current.push(review);}
  }catch(error){if(turn)markUnusable(turn,'failed');setState('ready');setMessage(error instanceof Error?error.message:'Please try your response again.');}
  finally{micBusy.current=false;}
 };

 /** No speech or a technical failure: the turn is never scored as wrong Japanese, and today's response is returned. */
 const markUnusable=(turn:Turn,reason:'none'|'failed')=>{
  turn.speech=reason;void releaseResponse();
  if(mounted.current)setNotice(reason==='none'?"Sumi couldn't hear you clearly, so that answer wasn't counted. Please try again a little closer to the microphone.":'That recording could not be checked, so it was not counted. Please try again.');
 };

 const assess=async(turn:Turn,audio:string|Blob)=>{
  try{
   const form=new FormData();
   if(typeof audio==='string')form.append('audio',{uri:audio.startsWith('file:')?audio:`file://${audio}`,name:'conversation-turn.wav',type:'audio/wav'} as any);
   else form.append('audio',audio,'conversation-turn.webm');
   const response=await request(`${expoconfig.API_URL}/api/talk-with-sumi/assess?email=${encodeURIComponent(String(user?.email??''))}`,{method:'POST',body:form});
   const body=await response.json().catch(()=>null);
   if(!response.ok||!body)throw new Error('assessment failed');
   if(body.speechDetected===false){markUnusable(turn,'none');return;}
   turn.speech='ok';turn.scores=body;
   if(!turn.learnerText&&body.recognizedText)turn.learnerText=String(body.recognizedText);
   if(turn.learnerText)addHistory('you',turn.learnerText);
   if(mounted.current)setValidTurns(turnsRef.current.filter(item=>item.speech==='ok').length);
  }catch{markUnusable(turn,'failed');}
 };

 const replay=()=>{if(state!=='ready'||!liveRef.current)return;replaying.current=true;if(!liveRef.current.replayLastTurn()){replaying.current=false;setNotice('There is nothing to replay yet.');}};

 const finish=async()=>{
  if(ending.current||state==='finished'||micBusy.current)return;
  if(state==='listening')await stopMic();
  ending.current=true;clearSumiTimeout();setState('saving');setMessage('Saving your conversation feedback…');
  liveRef.current?.close();
  await Promise.allSettled(pending.current);
  // Only turns where speech was detected count; silent or failed turns are never scored.
  const valid=turnsRef.current.filter(turn=>turn.speech==='ok');
  const scores=valid.map(turn=>turn.scores!).filter(Boolean);
  const evaluations=valid.map(turn=>turn.evaluation).filter((item):item is ConversationEvaluation=>!!item);
  const avg=(key:keyof Scores)=>scores.length?Math.round(scores.reduce((sum,item)=>sum+Number(item[key]||0),0)/scores.length):0;
  const pronunciation=avg('pronunciation'),accuracy=avg('accuracy'),fluency=avg('fluency'),completeness=avg('completeness');
  const contextual=evaluations.length?Math.round(evaluations.reduce((sum,item)=>sum+Number(item.contextScore||0),0)/evaluations.length):0;
  const overall=Math.round(((pronunciation+accuracy+fluency+completeness)/4+contextual)/2);
  const areas=[...new Set(evaluations.map(item=>item.improvementArea).filter(Boolean))].slice(0,8);
  try{const response=await request(`${expoconfig.API_URL}/api/talk-with-sumi/complete`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:sessionId.current,email:user?.email,name:`${user?.fname??''} ${user?.lname??''}`.trim(),durationSeconds:Math.max(1,Math.round((Date.now()-startedAt.current)/1000)),conversationTurns:valid.length,score:overall,pronunciationScore:pronunciation,accuracyScore:accuracy,fluencyScore:fluency,completenessScore:completeness,contextualAccuracy:contextual,expressionsPracticed:valid.map(turn=>turn.learnerText).filter(Boolean).slice(-30),areasForImprovement:areas,turnAssessments:scores,contextEvaluations:evaluations.map(item=>({contextScore:Number(item.contextScore)||0,japaneseAttempted:!!item.japaneseAttempted})),unusableTurns:turnsRef.current.length-valid.length,feedbackSummary:evaluations.slice(-3).map(item=>item.assessment).filter(Boolean).join(' ')||'Keep building confidence through short, natural Japanese exchanges.'})});
   if(!response.ok)throw new Error('Your feedback could not be saved.');
   setState('finished');setMessage('Your conversation and feedback are saved.');
  }catch(error){ending.current=false;setSaveError(error instanceof Error?error.message:'Your feedback could not be saved.');setState('error');}
 };
 const leave=async()=>{if((validTurns>0||state==='listening')&&state!=='finished')await finish();else{liveRef.current?.close();router.replace('/QuackTalk');}};

 useEffect(()=>{const timer=setInterval(()=>setClock(Date.now()),1000);return()=>clearInterval(timer);},[]);
 useEffect(()=>{if(state!=='listening')return;recordingTimeout.current=setTimeout(()=>void stopMic(),25000);return()=>{if(recordingTimeout.current)clearTimeout(recordingTimeout.current);};},[state]);
 useEffect(()=>{if(remaining===0&&state==='ready'&&validTurns>0)void finish();},[remaining,state,validTurns]);
 const unlockSeconds=Math.max(0,Math.ceil((new Date(resetAt).getTime()-clock)/1000));
 const statusText=state==='listening'?'YOUR TURN · SUMI IS LISTENING':state==='speaking'?'SUMI IS SPEAKING':state==='thinking'||state==='connecting'?'PLEASE WAIT':state==='ready'?'YOUR TURN':'OPEN CONVERSATION';

 return <SafeAreaView style={styles.safeArea}><ImageBackground source={background} style={[styles.background,{backgroundColor:'#251A35'}]} imageStyle={styles.backgroundArtwork} resizeMode="cover"><View style={styles.sceneTint}/>
  <View style={styles.header}><Pressable onPress={()=>void leave()} style={styles.headerButton}><BackIcon width={18} height={18} fill="#47295A"/></Pressable><View style={[styles.headerMark,{backgroundColor:'#F0E7FA'}]}><Ionicons name="chatbubbles" size={19} color="#7552C8"/></View><View style={styles.headerCopy}><Text style={[styles.headerEyebrow,{color:'#7552C8'}]}>CONVERSATION LOUNGE</Text><Text style={styles.headerTitle}>Talk with Sumi</Text></View><Pressable onPress={()=>{if(validTurns>0||state==='listening')void finish();else{liveRef.current?.close();router.push({pathname:'/QuackTalkFeedback',params:{returnTo:'conversation'}});}}} style={[styles.headerButton,{backgroundColor:'#F0E7FA'}]}><Ionicons name="analytics-outline" size={21} color="#7552C8"/></Pressable></View>
  <View style={styles.stage}>
   <View style={styles.coachStatus}><View style={styles.onlineDot}/><View><Text style={styles.coachStatusText}>{statusText}</Text><Text style={styles.coachStatusSubtext}>{remaining} of 10 responses remaining today</Text></View></View>
   <Image source={frame} style={styles.sumi} resizeMode="contain"/>
   <View style={styles.controlPanel}>
    <View style={styles.guidedPromptCard}>
     <View style={styles.guidedPromptTop}><View style={[styles.promptIcon,{backgroundColor:'#F0E7FA'}]}><Ionicons name={state==='listening'?'mic':state==='speaking'?'volume-high':'chatbubbles'} size={20} color="#7552C8"/></View><View style={styles.promptCopy}><Text style={[styles.promptLabel,{color:'#7552C8'}]}>VOICE-TO-VOICE JAPANESE</Text><Text style={styles.promptTitle}>{message}</Text></View></View>
     {history.length>0&&<View style={{flexDirection:'row',gap:8,marginTop:8}}>
      <Pressable onPress={()=>setShowHistory(value=>!value)} accessibilityRole="button" style={{flexDirection:'row',alignItems:'center',gap:5,paddingHorizontal:10,paddingVertical:6,borderRadius:10,backgroundColor:'#F0E7FA'}}><Ionicons name={showHistory?'chevron-up':'chatbox-ellipses-outline'} size={15} color="#7552C8"/><Text style={{fontSize:12,fontWeight:'600',color:'#7552C8'}}>{showHistory?'Hide conversation':'Show conversation'}</Text></Pressable>
      {canReplay&&<Pressable onPress={replay} disabled={state!=='ready'} accessibilityRole="button" accessibilityLabel="Replay Sumi's last line" style={{flexDirection:'row',alignItems:'center',gap:5,paddingHorizontal:10,paddingVertical:6,borderRadius:10,backgroundColor:'#F0E7FA',opacity:state==='ready'?1:.45}}><Ionicons name="refresh" size={15} color="#7552C8"/><Text style={{fontSize:12,fontWeight:'600',color:'#7552C8'}}>Replay Sumi</Text></Pressable>}
     </View>}
     {showHistory&&<ScrollView style={{maxHeight:150,marginTop:8}} nestedScrollEnabled>{history.map((line,index)=><Text key={index} style={{fontSize:13,lineHeight:19,color:line.who==='sumi'?'#47295A':'#7552C8',marginBottom:4}}><Text style={{fontWeight:'700'}}>{line.who==='sumi'?'Sumi: ':'You: '}</Text>{line.text}</Text>)}</ScrollView>}
     {!showHistory&&<Text style={styles.guidedInstruction}>Listen, respond naturally, and ask for English help whenever you need it. Open the conversation to read or replay what Sumi said.</Text>}
    </View>
    {state==='start'?<Pressable onPress={()=>void unlock()} style={[styles.tutorialDone,{backgroundColor:'#7552C8'}]}><Text style={styles.tutorialDoneText}>Start conversation</Text></Pressable>
     :state==='finished'?<View style={styles.sessionCompleteActions}><Pressable style={styles.sessionCompleteSecondary} onPress={()=>router.replace('/QuackTalk')}><Text style={styles.sessionCompleteSecondaryText}>Back to QuackTalk</Text></Pressable><Pressable style={styles.sessionCompletePrimary} onPress={()=>router.push({pathname:'/QuackTalkFeedback',params:{returnTo:'conversation'}})}><Text style={styles.sessionCompletePrimaryText}>View feedback</Text></Pressable></View>
     :state==='error'&&!saveError?<Pressable onPress={()=>{setState('start');void unlock();}} style={[styles.tutorialDone,{backgroundColor:'#7552C8'}]}><Text style={styles.tutorialDoneText}>Reconnect to Sumi</Text></Pressable>
     :<View style={styles.learnerMicCard}><View style={styles.learnerMicCopy}><Text style={styles.learnerMicEyebrow}>{state==='listening'?'YOUR TURN':'CONVERSATION CONTROL'}</Text><Text style={styles.learnerMicTitle}>{state==='listening'?'Speak to Sumi now':state==='ready'?'Ready for your response':state==='speaking'?'Listen to Sumi':'Please wait'}</Text><Text style={styles.microphoneStatus}>{state==='ready'?'Tap the microphone when you are ready.':state==='listening'?'Tap Stop when your response is complete.':'The microphone unlocks when Sumi finishes.'}</Text></View><Pressable disabled={(state!=='ready'&&state!=='listening')||(remaining===0&&state!=='listening')} accessibilityRole="button" accessibilityLabel={state==='listening'?'Stop recording':'Start recording'} onPress={()=>void(state==='listening'?stopMic():startMic())} style={[styles.microphoneButton,{backgroundColor:state==='listening'?'#E34F6C':'#7552C8',opacity:state==='ready'||state==='listening'?1:.45}]}><Ionicons name={state==='listening'?'stop':'mic'} size={26} color="#FFFFFF"/></Pressable></View>}
    {validTurns>0&&state!=='finished'&&state!=='saving'?<Pressable onPress={()=>void finish()} style={[styles.headerButton,{width:'100%',height:44,marginTop:10}]}><Ionicons name="stop-circle-outline" size={18} color="#7552C8"/><Text style={{fontFamily:'Jua',fontSize:12,color:'#7552C8'}}>End and save conversation</Text></Pressable>:null}
    {notice?<Text style={styles.assessmentMeaning}>{notice}</Text>:null}
    {remaining===0&&resetAt?<Text style={styles.assessmentMeaning}>Today's responses are used. Available again in {Math.floor(unlockSeconds/3600)}h {Math.floor(unlockSeconds%3600/60)}m.</Text>:null}
    {saveError?<><Text style={styles.assessmentMeaning}>{saveError}</Text><Pressable onPress={()=>void finish()} style={[styles.headerButton,{width:'100%',height:40,marginTop:6}]}><Text style={{fontFamily:'Jua',fontSize:12,color:'#7552C8'}}>Try saving again</Text></Pressable></>:null}
   </View>
  </View></ImageBackground></SafeAreaView>;
}
