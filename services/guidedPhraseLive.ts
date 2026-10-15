import { AudioContext } from 'react-native-audio-api';

export type GuidedPhraseTurn={targetJapanese:string;targetRomaji:string;englishMeaning:string;learnerInstruction:string};
export type MeaningEvaluation={contextScore:number;appropriate:boolean;explanation:string;betterResponse:string};
export type ConversationEvaluation={contextScore:number;japaneseAttempted:boolean;assessment:string;improvementArea:string};
export type GuidedLiveCallbacks={onConnected:()=>void;onSpeaking:(value:boolean)=>void;onInputTranscript:(text:string)=>void;onOutputTranscript:(text:string)=>void;onTurn:(turn:GuidedPhraseTurn)=>void;onEvaluation:(value:MeaningEvaluation)=>void;onConversationEvaluation?:(value:ConversationEvaluation)=>void;onError:(message:string)=>void;onComplete:()=>void;onModelTurnDone?:()=>void};
export type GuidedLiveAccess={token:string;model:string;websocketUrl:string;voice:string;systemInstruction:string;practicesRemaining:number;sessionId?:string;responsesCompleted?:number};

const base64Alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const base64Lookup=new Uint8Array(128);
for(let i=0;i<base64Alphabet.length;i++)base64Lookup[base64Alphabet.charCodeAt(i)]=i;
const bytesToBase64=(bytes:Uint8Array)=>{
  const result:string[]=[];
  for(let i=0;i<bytes.length;i+=3){
    const a=bytes[i],b=i+1<bytes.length?bytes[i+1]:0,c=i+2<bytes.length?bytes[i+2]:0;
    result.push(base64Alphabet[a>>2],base64Alphabet[((a&3)<<4)|(b>>4)],i+1<bytes.length?base64Alphabet[((b&15)<<2)|(c>>6)]:'=',i+2<bytes.length?base64Alphabet[c&63]:'=');
  }
  return result.join('');
};
const base64ToBytes=(value:string)=>{
  const clean=value.replace(/[^A-Za-z0-9+/=]/g,'');
  const padding=clean.endsWith('==')?2:clean.endsWith('=')?1:0;
  const bytes=new Uint8Array(Math.max(0,Math.floor(clean.length/4)*3-padding));
  let offset=0;
  for(let i=0;i<clean.length;i+=4){
    const a=base64Lookup[clean.charCodeAt(i)],b=base64Lookup[clean.charCodeAt(i+1)];
    const c=clean[i+2]==='='?0:base64Lookup[clean.charCodeAt(i+2)];
    const d=clean[i+3]==='='?0:base64Lookup[clean.charCodeAt(i+3)];
    if(offset<bytes.length)bytes[offset++]=(a<<2)|(b>>4);
    if(offset<bytes.length)bytes[offset++]=((b&15)<<4)|(c>>2);
    if(offset<bytes.length)bytes[offset++]=((c&3)<<6)|d;
  }
  return bytes;
};
const isBrowser=typeof document!=='undefined';

export class GeminiGuidedPhraseLive {
  private socket:WebSocket|null=null;
  // Create the native audio graph only when playback starts. Constructing it
  // while a screen mounts can terminate Android before an error can be shown.
  private audioContext:AudioContext|null=null;
  private nextPlaybackAt=0;
  private setupResolve:(()=>void)|null=null;
  private setupReject:((error:Error)=>void)|null=null;
  private setupTimer:ReturnType<typeof setTimeout>|null=null;
  private intentionallyClosed=false;
  private receiveChain:Promise<void>=Promise.resolve();
  private pendingAudio:string[]=[];
  private activePlaybackCount=0;
  private preparedTargets=new Set<string>();
  private browserAudioUnlocked=false;
  private browserNativeContext:any=null;
  private browserPendingPcm:Uint8Array[]=[];
  private browserSources=new Set<any>();
  private browserNextPlaybackAt=0;
  private browserEndTimer:ReturnType<typeof setTimeout>|null=null;
  private nativeSources=new Set<any>();
  private nativeEndTimer:ReturnType<typeof setTimeout>|null=null;
  private modelTurnActive=false;
  private practiceRequestPending=false;
  private awaitingPracticeTool=false;
  private playbackHeld=false;
  private heldAudio:string[]=[];
  private begun=false;
  private turnDonePending=false;
  private awaitingEvaluation=false;
  private awaitingConversationEvaluation=false;
  private collectingTurnAudio=false;
  private lastTurnAudio:string[]=[];
  private lastTurnBytes=0;
  private autoBegin=true;
  constructor(private callbacks:GuidedLiveCallbacks,private mode:'guided'|'conversation'='guided'){}

  private nativeAudioContext(){
    if(!this.audioContext)this.audioContext=new AudioContext({sampleRate:24000});
    return this.audioContext;
  }

  async activateAudio(){
    if(isBrowser){const BrowserAudioContext=(globalThis as any).AudioContext||(globalThis as any).webkitAudioContext;if(!BrowserAudioContext)throw new Error('Audio playback is unavailable in this browser.');if(!this.browserNativeContext||this.browserNativeContext.state==='closed')this.browserNativeContext=new BrowserAudioContext({sampleRate:24000});await this.browserNativeContext.resume();if(this.browserNativeContext.state!=='running')throw new Error('Tap once more to enable Sumi’s voice.');this.browserAudioUnlocked=true;this.browserNextPlaybackAt=this.browserNativeContext.currentTime+0.06;const queued=this.browserPendingPcm.splice(0);for(const pcm of queued)this.scheduleBrowserPcm(pcm);return;}
    const context=this.nativeAudioContext();
    await context.resume();
    if(context.state!=='running')throw new Error('Sumi’s audio could not start on this device.');
    const queued=this.pendingAudio.splice(0);
    for(const encoded of queued)this.playPcm24(encoded);
  }

  async connect(access:GuidedLiveAccess,options:{deferNativeAudio?:boolean;autoBegin?:boolean}={}){
    // Native apps can activate immediately. Browsers must wait for the
    // explicit user gesture in activateAudio(), otherwise mobile autoplay
    // policy can reject the whole Gemini connection before setup begins.
    if(!isBrowser&&!options.deferNativeAudio)await this.activateAudio();
    this.intentionallyClosed=false;
    this.autoBegin=options.autoBegin!==false;
    const url=`${access.websocketUrl}?access_token=${encodeURIComponent(access.token)}`;
    await new Promise<void>((resolve,reject)=>{
      this.setupResolve=resolve;this.setupReject=reject;
      const socket=new WebSocket(url);this.socket=socket;
      this.setupTimer=setTimeout(()=>{this.setupReject=null;reject(new Error('Sumi is taking longer than expected to connect. Please try again.'));socket.close();},20000);
      socket.onopen=()=>{const declarations=this.mode==='guided'?[{name:'prepare_practice_turn',description:'Required before every learner response. Supply the phrase and accurate beginner-readable romaji.',parameters:{type:'OBJECT',properties:{targetJapanese:{type:'STRING'},targetRomaji:{type:'STRING'},englishMeaning:{type:'STRING'},learnerInstruction:{type:'STRING'}},required:['targetJapanese','targetRomaji','englishMeaning','learnerInstruction']}},{name:'evaluate_learner_meaning',description:'Call after each learner answer.',parameters:{type:'OBJECT',properties:{contextScore:{type:'INTEGER'},appropriate:{type:'BOOLEAN'},explanation:{type:'STRING'},betterResponse:{type:'STRING'}},required:['contextScore','appropriate','explanation','betterResponse']}}]:[{name:'evaluate_conversation_turn',description:'Privately evaluate each learner response for end-of-session conversation feedback.',parameters:{type:'OBJECT',properties:{contextScore:{type:'INTEGER'},japaneseAttempted:{type:'BOOLEAN'},assessment:{type:'STRING'},improvementArea:{type:'STRING'}},required:['contextScore','japaneseAttempted','assessment','improvementArea']}}];socket.send(JSON.stringify({setup:{model:`models/${access.model}`,generationConfig:{responseModalities:['AUDIO'],speechConfig:{voiceConfig:{prebuiltVoiceConfig:{voiceName:access.voice}}}},systemInstruction:{parts:[{text:access.systemInstruction}]},inputAudioTranscription:{},outputAudioTranscription:{},realtimeInputConfig:{automaticActivityDetection:{disabled:true}},contextWindowCompression:{slidingWindow:{}},sessionResumption:{},tools:[{functionDeclarations:declarations}]}}));};
      socket.onerror=()=>{if(this.setupTimer)clearTimeout(this.setupTimer);this.setupTimer=null;this.setupReject=null;reject(new Error('Sumi could not connect. Check your internet connection and try again.'));};
      socket.onmessage=(event)=>{this.receiveChain=this.receiveChain.then(()=>this.handleSocketData(event.data)).catch(error=>this.callbacks.onError(error instanceof Error?error.message:'The conversation response could not be read.'));};
      socket.onclose=(event)=>{if(this.setupTimer)clearTimeout(this.setupTimer);this.setupTimer=null;this.callbacks.onSpeaking(false);if(this.setupReject){this.setupReject(new Error('Sumi could not accept the conversation setup. Please try again.'));this.setupReject=null;}else if(!this.intentionallyClosed)this.callbacks.onError(event.reason||'The speaking room disconnected. Please reconnect.');};
    });
  }

  begin(){if(this.begun)return;this.begun=true;if(this.mode==='conversation'){this.sendTextTurn('Open Talk with Sumi now. Give the brief Japanese greeting and English introduction, then begin the natural Japanese conversation with one simple question.');return;}this.awaitingPracticeTool=true;this.sendTextTurn('Begin Guided Phrase Practice now. First greet me warmly in Japanese, then say the same greeting in English. In English, briefly explain the activity: you will say one phrase at a time, I repeat it into the microphone, my pronunciation is rated, then you give feedback. Then call prepare_practice_turn exactly once. After the tool succeeds, say a short situation line and the complete Japanese phrase aloud once, invite me to try, and then stop and wait silently. Do not prepare, say, or hint at any other phrase until the application asks.');}
  requestPracticeTurn(){if(this.modelTurnActive||this.activePlaybackCount>0||this.browserSources.size>0||this.browserPendingPcm.length>0){this.practiceRequestPending=true;return;}this.awaitingPracticeTool=true;this.turnDonePending=false;this.sendTextTurn('Move to exactly one new practice phrase. It must use a different communicative purpose, situation, wording, and target expression from every earlier phrase in this session. Say one short, friendly transition that introduces the new everyday situation. Then call prepare_practice_turn exactly once with accurate romaji. After the tool succeeds, clearly speak the complete Japanese target phrase aloud once, invite the learner to try, then stop and wait silently. Do not prepare, say, or hint at a later phrase until the application requests it.');}
  /** Guided mode: the learner's answer reaches Sumi only as text, after the pronunciation service confirmed real speech. */
  sendLearnerAnswer(turn:GuidedPhraseTurn,heard:string){this.awaitingEvaluation=true;this.turnDonePending=false;this.sendTextTurn(`LEARNER_ANSWER for the practice phrase ${JSON.stringify(turn.targetJapanese)} (meaning: ${JSON.stringify(turn.englishMeaning)}). Speech recognition heard: ${JSON.stringify(heard||'(unclear)')}. Call evaluate_learner_meaning exactly once for this answer. Then speak your feedback only: warm Japanese praise if it is understandable, or a gentle Japanese correction, then one short helpful tip in English. Do not introduce, say, or prepare any new practice phrase.`);}
  /** Guided mode: Sumi finished speaking without preparing the phrase; ask again for the tool call. */
  nudgePracticeTool(){this.awaitingPracticeTool=true;this.turnDonePending=false;this.sendTextTurn('You have not called prepare_practice_turn yet. Call it now exactly once for one new practice phrase, then say that phrase aloud once and wait silently.');}
  sendPcm16(samples:Float32Array){const pcm=new Int16Array(samples.length);for(let i=0;i<samples.length;i++){const n=Math.max(-1,Math.min(1,samples[i]));pcm[i]=n<0?n*0x8000:n*0x7fff;}this.send({realtimeInput:{audio:{data:bytesToBase64(new Uint8Array(pcm.buffer)),mimeType:'audio/pcm;rate=16000'}}});}
  beginUserAudio(){this.modelTurnActive=false;this.send({realtimeInput:{activityStart:{}}});}
  endUserAudio(){this.modelTurnActive=true;this.turnDonePending=false;if(this.mode==='conversation')this.awaitingConversationEvaluation=true;this.send({realtimeInput:{activityEnd:{}}});}
  /** Plays Sumi's most recent turn again (Talk with Sumi). Returns false when nothing can be replayed right now. */
  replayLastTurn(){if(this.modelTurnActive||!this.lastTurnAudio.length||!this.playbackIdle())return false;for(const encoded of this.lastTurnAudio)this.playPcm24(encoded,false);return true;}
  hasReplay(){return this.lastTurnAudio.length>0;}
  holdPlayback(){this.playbackHeld=true;}
  releasePlayback(){this.playbackHeld=false;const queued=this.heldAudio.splice(0);for(const encoded of queued)this.playPcm24(encoded);if(!queued.length&&!this.modelTurnActive){this.callbacks.onSpeaking(false);this.drainPracticeRequest();}}
  interrupt(){this.nextPlaybackAt=this.audioContext?.currentTime||0;this.pendingAudio=[];this.heldAudio=[];this.playbackHeld=false;if(this.nativeEndTimer)clearTimeout(this.nativeEndTimer);this.nativeEndTimer=null;if(this.browserEndTimer)clearTimeout(this.browserEndTimer);this.browserEndTimer=null;for(const source of this.browserSources){try{source.stop();}catch{}}this.browserSources.clear();this.browserNextPlaybackAt=this.browserNativeContext?.currentTime||0;for(const source of this.nativeSources){try{source.stop();}catch{}}this.nativeSources.clear();this.browserPendingPcm=[];this.activePlaybackCount=0;this.callbacks.onSpeaking(false);this.tryFinishTurn();}
  close(){this.intentionallyClosed=true;this.interrupt();void this.browserNativeContext?.close?.();this.browserNativeContext=null;this.socket?.close();this.socket=null;void this.audioContext?.close().catch(()=>undefined);this.audioContext=null;}

  private send(value:unknown){if(this.socket?.readyState===WebSocket.OPEN)this.socket.send(JSON.stringify(value));}
  private sendTextTurn(text:string){this.modelTurnActive=true;this.send({clientContent:{turns:[{role:'user',parts:[{text}]}],turnComplete:true}});}
  private playbackIdle(){return this.activePlaybackCount===0&&this.pendingAudio.length===0&&this.heldAudio.length===0&&!this.playbackHeld&&this.browserSources.size===0&&this.browserPendingPcm.length===0;}
  private tryFinishTurn(){if(!this.turnDonePending||this.modelTurnActive||!this.playbackIdle())return;this.turnDonePending=false;this.callbacks.onModelTurnDone?.();}
  private drainPracticeRequest(){this.tryFinishTurn();if(!this.practiceRequestPending||this.modelTurnActive||this.activePlaybackCount>0||this.browserSources.size>0||this.browserPendingPcm.length>0)return;this.practiceRequestPending=false;this.requestPracticeTurn();}
  private async handleSocketData(data:unknown){
    try{
      if(typeof data==='string'){this.handleMessage(data);return;}
      if(typeof Blob!=='undefined'&&data instanceof Blob){this.handleMessage(await data.text());return;}
      if(data instanceof ArrayBuffer){this.handleMessage(new TextDecoder().decode(new Uint8Array(data)));return;}
      if(ArrayBuffer.isView(data)){this.handleMessage(new TextDecoder().decode(new Uint8Array(data.buffer,data.byteOffset,data.byteLength)));return;}
      this.callbacks.onError('Sumi returned an unreadable conversation message. Please reconnect.');
    }catch(error){this.callbacks.onError(error instanceof Error?error.message:'The conversation response could not be read.');}
  }
  private handleMessage(raw:string){
    try{
      if(this.intentionallyClosed)return;
      const message=JSON.parse(raw);
      if(message.setupComplete){if(this.setupTimer)clearTimeout(this.setupTimer);this.setupTimer=null;this.setupResolve?.();this.setupResolve=null;this.setupReject=null;this.callbacks.onConnected();if(this.autoBegin)this.begin();return;}
      const content=message.serverContent;
      if(content?.interrupted){this.interrupt();}
      if(content?.inputTranscription?.text)this.callbacks.onInputTranscript(content.inputTranscription.text);
      if(content?.outputTranscription?.text)this.callbacks.onOutputTranscript(content.outputTranscription.text);
      for(const part of content?.modelTurn?.parts??[]){if(part.inlineData?.data){if(!this.collectingTurnAudio){this.collectingTurnAudio=true;this.lastTurnAudio=[];this.lastTurnBytes=0;}if(this.lastTurnBytes<6_000_000){this.lastTurnAudio.push(part.inlineData.data);this.lastTurnBytes+=part.inlineData.data.length;}this.playPcm24(part.inlineData.data);}}
      const functionCalls=message.toolCall?.functionCalls??[];
      if(functionCalls.length)this.modelTurnActive=true;
      for(const call of functionCalls){
        if(call.name==='prepare_practice_turn'){
          const args=call.args as Partial<GuidedPhraseTurn>;
          const key=String(args.targetJapanese||'').replace(/\s/g,'');
          if(!this.awaitingPracticeTool){
            this.send({toolResponse:{functionResponses:[{id:call.id,name:call.name,response:{result:'Not accepted. The application has not requested another practice phrase. Wait for an explicit request.'}}]}});
            continue;
          }
          if(key&&!/[\u3040-\u30ff\u3400-\u9fff]/.test(key)){
            this.send({toolResponse:{functionResponses:[{id:call.id,name:call.name,response:{result:'Invalid target rejected. targetJapanese must be a natural Japanese phrase, not an English sentence.'}}]}});
            continue;
          }
          if(key&&this.preparedTargets.has(key)){
            this.send({toolResponse:{functionResponses:[{id:call.id,name:call.name,response:{result:'Duplicate phrase rejected. Prepare a different useful phrase for this turn.'}}]}});
            continue;
          }
          if(args.targetJapanese&&args.englishMeaning&&args.learnerInstruction){this.awaitingPracticeTool=false;this.preparedTargets.add(key);this.callbacks.onTurn({targetJapanese:args.targetJapanese,targetRomaji:args.targetRomaji||'',englishMeaning:args.englishMeaning,learnerInstruction:args.learnerInstruction});}
        }
        if(call.name==='evaluate_learner_meaning'){
          if(!this.awaitingEvaluation){this.send({toolResponse:{functionResponses:[{id:call.id,name:call.name,response:{result:'Not accepted. No learner answer is waiting. Stay silent and wait for the application.'}}]}});continue;}
          this.awaitingEvaluation=false;this.callbacks.onEvaluation(call.args as MeaningEvaluation);
        }
        if(call.name==='evaluate_conversation_turn'){if(this.awaitingConversationEvaluation){this.awaitingConversationEvaluation=false;this.callbacks.onConversationEvaluation?.(call.args as ConversationEvaluation);}}
        const toolResult=call.name==='evaluate_learner_meaning'?'Recorded. Now speak directly to the learner: first give warm Japanese praise when understandable, or a gentle Japanese correction when adjustment is needed; then give one short actionable suggestion in English when useful. Do not introduce, say, or prepare the next phrase; the application will ask when it is time.':call.name==='evaluate_conversation_turn'?'Recorded privately. Continue the natural spoken conversation now. React briefly to what the learner communicated and ask one related beginner-friendly question in Japanese.':'Recorded. Now say the situation line and the complete Japanese phrase aloud once, slowly and clearly, invite the learner to try it, then stop and wait silently. Do not evaluate, continue, or introduce another phrase.';
        this.send({toolResponse:{functionResponses:[{id:call.id,name:call.name,response:{result:toolResult}}]}});
      }
      // A tool call is an intermediate model step. Gemini can include
      // turnComplete in the same server message, but its spoken follow-up is
      // still coming after our tool response. Ending the turn here unlocks the
      // microphone too early and can strand Guided Phrase between phases.
      if(content?.turnComplete&&functionCalls.length===0){this.modelTurnActive=false;this.turnDonePending=true;this.collectingTurnAudio=false;if(isBrowser)this.finishBrowserTurn();else if(this.activePlaybackCount===0&&this.pendingAudio.length===0){this.callbacks.onSpeaking(false);this.drainPracticeRequest();}}
      if(message.goAway)this.callbacks.onComplete();
    }catch(error){this.callbacks.onError(error instanceof Error?error.message:'The conversation could not continue. Please try again.');}
  }
  private playPcm24(encoded:string,_live=true){
    if(this.playbackHeld){this.heldAudio.push(encoded);return;}
    if(isBrowser){const pcm=base64ToBytes(encoded);if(this.browserAudioUnlocked)this.scheduleBrowserPcm(pcm);else this.browserPendingPcm.push(pcm);return;}
    // When native activation is deferred, keep audio queued without creating
    // the native graph during screen mount.
    if(!this.audioContext){this.pendingAudio.push(encoded);return;}
    const context=this.audioContext;
    if(context.state!=='running'){
      this.pendingAudio.push(encoded);
      return;
    }
    const bytes=base64ToBytes(encoded);const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);const frames=Math.floor(bytes.byteLength/2);
    const buffer=context.createBuffer(1,frames,24000);const channel=buffer.getChannelData(0);for(let i=0;i<frames;i++)channel[i]=view.getInt16(i*2,true)/32768;
    const source=context.createBufferSource();source.buffer=buffer;source.connect(context.destination);
    this.activePlaybackCount++;this.nativeSources.add(source);source.onEnded=()=>{this.nativeSources.delete(source);this.activePlaybackCount=Math.max(0,this.activePlaybackCount-1);if(this.activePlaybackCount===0&&this.pendingAudio.length===0&&!this.modelTurnActive){if(this.nativeEndTimer)clearTimeout(this.nativeEndTimer);this.nativeEndTimer=null;this.callbacks.onSpeaking(false);this.drainPracticeRequest();}};
    const start=Math.max(context.currentTime+0.02,this.nextPlaybackAt);source.start(start);this.nextPlaybackAt=start+buffer.duration;this.callbacks.onSpeaking(true);if(this.nativeEndTimer)clearTimeout(this.nativeEndTimer);this.nativeEndTimer=setTimeout(()=>{if(this.activePlaybackCount>0&&!this.modelTurnActive){this.activePlaybackCount=0;this.nativeSources.clear();this.callbacks.onSpeaking(false);this.drainPracticeRequest();}},Math.max(3000,Math.ceil((this.nextPlaybackAt-context.currentTime)*1000)+2000));
  }
  private finishBrowserTurn(){
    if(this.browserSources.size===0&&this.browserPendingPcm.length===0){this.callbacks.onSpeaking(false);this.drainPracticeRequest();return;}
    if(this.browserEndTimer)clearTimeout(this.browserEndTimer);
    const context=this.browserNativeContext;const remaining=Math.max(0,(this.browserNextPlaybackAt-(context?.currentTime||0))*1000);
    this.browserEndTimer=setTimeout(()=>{this.browserEndTimer=null;if(!this.modelTurnActive){this.browserSources.clear();this.callbacks.onSpeaking(false);this.drainPracticeRequest();}},Math.ceil(remaining)+2000);
  }
  private scheduleBrowserPcm(pcm:Uint8Array){const context=this.browserNativeContext;if(!context||context.state!=='running'||!pcm.byteLength){this.browserPendingPcm.push(pcm);return;}const frames=Math.floor(pcm.byteLength/2);if(!frames)return;const buffer=context.createBuffer(1,frames,24000);const channel=buffer.getChannelData(0);const view=new DataView(pcm.buffer,pcm.byteOffset,pcm.byteLength);for(let i=0;i<frames;i++)channel[i]=view.getInt16(i*2,true)/32768;const source=context.createBufferSource();source.buffer=buffer;source.connect(context.destination);const start=Math.max(context.currentTime+0.04,this.browserNextPlaybackAt);this.browserNextPlaybackAt=start+buffer.duration;this.browserSources.add(source);source.onended=()=>{this.browserSources.delete(source);if(this.browserSources.size===0&&!this.modelTurnActive){if(this.browserEndTimer)clearTimeout(this.browserEndTimer);this.browserEndTimer=null;this.callbacks.onSpeaking(false);this.drainPracticeRequest();}};source.start(start);this.callbacks.onSpeaking(true);}
}
