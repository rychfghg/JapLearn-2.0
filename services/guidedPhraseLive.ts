import { AudioContext } from 'react-native-audio-api';

export type GuidedPhraseTurn={targetJapanese:string;targetRomaji:string;englishMeaning:string;learnerInstruction:string};
export type MeaningEvaluation={contextScore:number;appropriate:boolean;explanation:string;betterResponse:string};
export type GuidedLiveCallbacks={onConnected:()=>void;onSpeaking:(value:boolean)=>void;onInputTranscript:(text:string)=>void;onOutputTranscript:(text:string)=>void;onTurn:(turn:GuidedPhraseTurn)=>void;onEvaluation:(value:MeaningEvaluation)=>void;onError:(message:string)=>void;onComplete:()=>void};
export type GuidedLiveAccess={token:string;model:string;websocketUrl:string;voice:string;systemInstruction:string;practicesRemaining:number};

const bytesToBase64=(bytes:Uint8Array)=>{let binary='';for(let i=0;i<bytes.length;i+=0x8000)binary+=String.fromCharCode(...bytes.subarray(i,i+0x8000));return globalThis.btoa(binary);};
const base64ToBytes=(value:string)=>{const binary=globalThis.atob(value);const bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);return bytes;};
const isBrowser=typeof document!=='undefined';

export class GeminiGuidedPhraseLive {
  private socket:WebSocket|null=null;
  private audioContext=new AudioContext({sampleRate:24000});
  private nextPlaybackAt=0;
  private setupResolve:(()=>void)|null=null;
  private setupReject:((error:Error)=>void)|null=null;
  private setupTimer:ReturnType<typeof setTimeout>|null=null;
  private intentionallyClosed=false;
  private receiveChain:Promise<void>=Promise.resolve();
  private pendingAudio:string[]=[];
  private activePlaybackCount=0;
  private preparedTargets=new Set<string>();
  private browserTurnAudio:Uint8Array[]=[];
  private browserAudioUnlocked=false;
  private browserEndTimer:ReturnType<typeof setTimeout>|null=null;
  private browserNativeContext:any=null;
  private browserPendingPcm:Uint8Array[]=[];
  private browserSource:any=null;
  private nativeSources=new Set<any>();
  private nativeEndTimer:ReturnType<typeof setTimeout>|null=null;
  private modelTurnActive=false;
  private practiceRequestPending=false;
  constructor(private callbacks:GuidedLiveCallbacks){}

  async activateAudio(){
    if(isBrowser){const BrowserAudioContext=(globalThis as any).AudioContext||(globalThis as any).webkitAudioContext;if(!BrowserAudioContext)throw new Error('Audio playback is unavailable in this browser.');if(!this.browserNativeContext||this.browserNativeContext.state==='closed')this.browserNativeContext=new BrowserAudioContext();await this.browserNativeContext.resume();if(this.browserNativeContext.state!=='running')throw new Error('Tap once more to enable Sumi’s voice.');this.browserAudioUnlocked=true;await this.playNextBrowserPcm();return;}
    await this.audioContext.resume();
    if((this.audioContext as any).state!=='running')throw new Error('Audio playback is still blocked by this browser.');
    const queued=this.pendingAudio.splice(0);
    for(const encoded of queued)this.playPcm24(encoded);
  }

  async connect(access:GuidedLiveAccess){
    // Native apps can activate immediately. Browsers must wait for the
    // explicit user gesture in activateAudio(), otherwise mobile autoplay
    // policy can reject the whole Gemini connection before setup begins.
    if(!isBrowser)await this.activateAudio();
    this.intentionallyClosed=false;
    const url=`${access.websocketUrl}?access_token=${encodeURIComponent(access.token)}`;
    await new Promise<void>((resolve,reject)=>{
      this.setupResolve=resolve;this.setupReject=reject;
      const socket=new WebSocket(url);this.socket=socket;
      this.setupTimer=setTimeout(()=>{this.setupReject=null;reject(new Error('Sumi is taking longer than expected to connect. Please try again.'));socket.close();},20000);
      socket.onopen=()=>socket.send(JSON.stringify({setup:{model:`models/${access.model}`,generationConfig:{responseModalities:['AUDIO'],speechConfig:{voiceConfig:{prebuiltVoiceConfig:{voiceName:access.voice}}}},systemInstruction:{parts:[{text:access.systemInstruction}]},inputAudioTranscription:{},outputAudioTranscription:{},tools:[{functionDeclarations:[{name:'prepare_practice_turn',description:'Required before every learner response. Supply the phrase and accurate beginner-readable romaji.',parameters:{type:'OBJECT',properties:{targetJapanese:{type:'STRING'},targetRomaji:{type:'STRING'},englishMeaning:{type:'STRING'},learnerInstruction:{type:'STRING'}},required:['targetJapanese','targetRomaji','englishMeaning','learnerInstruction']}},{name:'evaluate_learner_meaning',description:'Call after each learner answer.',parameters:{type:'OBJECT',properties:{contextScore:{type:'INTEGER'},appropriate:{type:'BOOLEAN'},explanation:{type:'STRING'},betterResponse:{type:'STRING'}},required:['contextScore','appropriate','explanation','betterResponse']}}]}]}}));
      socket.onerror=()=>{if(this.setupTimer)clearTimeout(this.setupTimer);this.setupTimer=null;this.setupReject=null;reject(new Error('Sumi could not connect. Check your internet connection and try again.'));};
      socket.onmessage=(event)=>{this.receiveChain=this.receiveChain.then(()=>this.handleSocketData(event.data)).catch(error=>this.callbacks.onError(error instanceof Error?error.message:'The conversation response could not be read.'));};
      socket.onclose=(event)=>{if(this.setupTimer)clearTimeout(this.setupTimer);this.setupTimer=null;this.callbacks.onSpeaking(false);if(this.setupReject){this.setupReject(new Error('Sumi could not accept the conversation setup. Please try again.'));this.setupReject=null;}else if(!this.intentionallyClosed)this.callbacks.onError(event.reason||'The speaking room disconnected. Please reconnect.');};
    });
  }

  begin(){this.sendTextTurn('Begin Guided Phrase Practice now. Greet me briefly in Japanese, explain the activity in English, then call prepare_practice_turn for the first spoken response.');}
  requestPracticeTurn(){if(this.modelTurnActive||this.activePlaybackCount>0||!!this.browserSource||this.browserPendingPcm.length>0){this.practiceRequestPending=true;return;}this.sendTextTurn('The learner is ready. Call prepare_practice_turn now, include accurate romaji, then speak the next prompt and wait for the microphone response.');}
  sendPcm16(samples:Float32Array){const pcm=new Int16Array(samples.length);for(let i=0;i<samples.length;i++){const n=Math.max(-1,Math.min(1,samples[i]));pcm[i]=n<0?n*0x8000:n*0x7fff;}this.send({realtimeInput:{audio:{data:bytesToBase64(new Uint8Array(pcm.buffer)),mimeType:'audio/pcm;rate=16000'}}});}
  endUserAudio(){this.modelTurnActive=true;this.send({realtimeInput:{audioStreamEnd:true}});}
  interrupt(){this.nextPlaybackAt=this.audioContext.currentTime;this.pendingAudio=[];if(this.browserEndTimer)clearTimeout(this.browserEndTimer);this.browserEndTimer=null;if(this.nativeEndTimer)clearTimeout(this.nativeEndTimer);this.nativeEndTimer=null;try{this.browserSource?.stop?.();}catch{}this.browserSource=null;for(const source of this.nativeSources){try{source.stop();}catch{}}this.nativeSources.clear();this.browserPendingPcm=[];this.browserTurnAudio=[];this.activePlaybackCount=0;this.callbacks.onSpeaking(false);}
  close(){this.intentionallyClosed=true;this.interrupt();void this.browserNativeContext?.close?.();this.browserNativeContext=null;this.socket?.close();this.socket=null;void this.audioContext.suspend();}

  private send(value:unknown){if(this.socket?.readyState===WebSocket.OPEN)this.socket.send(JSON.stringify(value));}
  private sendTextTurn(text:string){this.modelTurnActive=true;this.send({clientContent:{turns:[{role:'user',parts:[{text}]}],turnComplete:true}});}
  private drainPracticeRequest(){if(!this.practiceRequestPending||this.modelTurnActive||this.activePlaybackCount>0||this.browserSource||this.browserPendingPcm.length>0)return;this.practiceRequestPending=false;this.sendTextTurn('The learner is ready. Call prepare_practice_turn now, include accurate romaji, then speak the next prompt and wait for the microphone response.');}
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
      const message=JSON.parse(raw);
      if(message.setupComplete){if(this.setupTimer)clearTimeout(this.setupTimer);this.setupTimer=null;this.setupResolve?.();this.setupResolve=null;this.setupReject=null;this.callbacks.onConnected();this.begin();return;}
      const content=message.serverContent;
      if(content?.interrupted){this.nextPlaybackAt=this.audioContext.currentTime;this.callbacks.onSpeaking(false);}
      if(content?.inputTranscription?.text)this.callbacks.onInputTranscript(content.inputTranscription.text);
      if(content?.outputTranscription?.text)this.callbacks.onOutputTranscript(content.outputTranscription.text);
      for(const part of content?.modelTurn?.parts??[]){if(part.inlineData?.data)this.playPcm24(part.inlineData.data);}
      if(content?.turnComplete){this.modelTurnActive=false;if(isBrowser)this.finishBrowserTurn();else if(this.activePlaybackCount===0&&this.pendingAudio.length===0){this.callbacks.onSpeaking(false);this.drainPracticeRequest();}}
      for(const call of message.toolCall?.functionCalls??[]){
        if(call.name==='prepare_practice_turn'){
          const args=call.args as Partial<GuidedPhraseTurn>;
          const key=String(args.targetJapanese||'').replace(/\s/g,'');
          if(key&&!/[\u3040-\u30ff\u3400-\u9fff]/.test(key)){
            this.send({toolResponse:{functionResponses:[{id:call.id,name:call.name,response:{result:'Invalid target rejected. targetJapanese must be a natural Japanese phrase, not an English sentence.'}}]}});
            continue;
          }
          if(key&&this.preparedTargets.has(key)){
            this.send({toolResponse:{functionResponses:[{id:call.id,name:call.name,response:{result:'Duplicate phrase rejected. Prepare a different useful phrase for this turn.'}}]}});
            continue;
          }
          if(args.targetJapanese&&args.englishMeaning&&args.learnerInstruction){this.preparedTargets.add(key);this.callbacks.onTurn({targetJapanese:args.targetJapanese,targetRomaji:args.targetRomaji||'',englishMeaning:args.englishMeaning,learnerInstruction:args.learnerInstruction});}
        }
        if(call.name==='evaluate_learner_meaning')this.callbacks.onEvaluation(call.args as MeaningEvaluation);
        this.send({toolResponse:{functionResponses:[{id:call.id,name:call.name,response:{result:call.name==='evaluate_learner_meaning'?'Recorded. Give one short spoken reaction, then stop and wait. Do not prepare the next practice turn until the application requests it.':'Recorded. Speak this prepared prompt, then wait for the learner.'}}]}});
      }
      if(message.goAway)this.callbacks.onComplete();
    }catch(error){this.callbacks.onError(error instanceof Error?error.message:'The conversation could not continue. Please try again.');}
  }
  private playPcm24(encoded:string){
    if(isBrowser){this.browserTurnAudio.push(base64ToBytes(encoded));return;}
    if((this.audioContext as any).state!=='running'){
      this.pendingAudio.push(encoded);
      return;
    }
    const bytes=base64ToBytes(encoded);const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);const frames=Math.floor(bytes.byteLength/2);
    const buffer=this.audioContext.createBuffer(1,frames,24000);const channel=buffer.getChannelData(0);for(let i=0;i<frames;i++)channel[i]=view.getInt16(i*2,true)/32768;
    const source=this.audioContext.createBufferSource();source.buffer=buffer;source.connect(this.audioContext.destination);
    this.activePlaybackCount++;this.nativeSources.add(source);source.onEnded=()=>{this.nativeSources.delete(source);this.activePlaybackCount=Math.max(0,this.activePlaybackCount-1);if(this.activePlaybackCount===0&&this.pendingAudio.length===0){if(this.nativeEndTimer)clearTimeout(this.nativeEndTimer);this.nativeEndTimer=null;this.callbacks.onSpeaking(false);this.drainPracticeRequest();}};
    const start=Math.max(this.audioContext.currentTime+0.02,this.nextPlaybackAt);source.start(start);this.nextPlaybackAt=start+buffer.duration;this.callbacks.onSpeaking(true);if(this.nativeEndTimer)clearTimeout(this.nativeEndTimer);this.nativeEndTimer=setTimeout(()=>{if(this.activePlaybackCount>0){this.activePlaybackCount=0;this.nativeSources.clear();this.callbacks.onSpeaking(false);this.drainPracticeRequest();}},Math.max(3000,Math.ceil((this.nextPlaybackAt-this.audioContext.currentTime)*1000)+2000));
  }
  private finishBrowserTurn(){
    if(!this.browserTurnAudio.length){this.callbacks.onSpeaking(false);this.drainPracticeRequest();return;}
    const chunks=this.browserTurnAudio.splice(0);const length=chunks.reduce((sum,item)=>sum+item.byteLength,0);const pcm=new Uint8Array(length);let offset=0;for(const chunk of chunks){pcm.set(chunk,offset);offset+=chunk.byteLength;}this.browserPendingPcm.push(pcm);if(this.browserAudioUnlocked&&!this.browserSource)void this.playNextBrowserPcm();
  }
  private async playNextBrowserPcm(){const context=this.browserNativeContext;if(!context||context.state!=='running'||this.browserSource)return;const pcm=this.browserPendingPcm.shift();if(!pcm?.byteLength){this.callbacks.onSpeaking(false);this.drainPracticeRequest();return;}const frames=Math.floor(pcm.byteLength/2);if(!frames){void this.playNextBrowserPcm();return;}const buffer=context.createBuffer(1,frames,24000);const channel=buffer.getChannelData(0);const view=new DataView(pcm.buffer,pcm.byteOffset,pcm.byteLength);for(let i=0;i<frames;i++)channel[i]=view.getInt16(i*2,true)/32768;const source=context.createBufferSource();source.buffer=buffer;source.connect(context.destination);this.browserSource=source;let ended=false;const finish=()=>{if(ended)return;ended=true;if(this.browserSource===source)this.browserSource=null;if(this.browserEndTimer)clearTimeout(this.browserEndTimer);this.browserEndTimer=null;if(this.browserPendingPcm.length)void this.playNextBrowserPcm();else{this.callbacks.onSpeaking(false);this.drainPracticeRequest();}};source.onended=finish;this.browserEndTimer=setTimeout(()=>{if(this.browserSource===source){try{source.stop();}catch{}finish();}},Math.max(3000,Math.ceil(buffer.duration*1000)+2500));source.start(0);this.callbacks.onSpeaking(true);}
}
