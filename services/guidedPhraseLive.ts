import { AudioContext } from 'react-native-audio-api';

export type GuidedPhraseTurn={targetJapanese:string;targetRomaji:string;englishMeaning:string;learnerInstruction:string};
export type MeaningEvaluation={contextScore:number;appropriate:boolean;explanation:string;betterResponse:string};
export type GuidedLiveCallbacks={onConnected:()=>void;onSpeaking:(value:boolean)=>void;onInputTranscript:(text:string)=>void;onOutputTranscript:(text:string)=>void;onTurn:(turn:GuidedPhraseTurn)=>void;onEvaluation:(value:MeaningEvaluation)=>void;onError:(message:string)=>void;onComplete:()=>void};
export type GuidedLiveAccess={token:string;model:string;websocketUrl:string;voice:string;systemInstruction:string;practicesRemaining:number};

const bytesToBase64=(bytes:Uint8Array)=>{let binary='';for(let i=0;i<bytes.length;i+=0x8000)binary+=String.fromCharCode(...bytes.subarray(i,i+0x8000));return globalThis.btoa(binary);};
const base64ToBytes=(value:string)=>{const binary=globalThis.atob(value);const bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);return bytes;};
const isBrowser=typeof document!=='undefined'&&typeof Audio!=='undefined';
const pcmToWav=(chunks:Uint8Array[])=>{const length=chunks.reduce((sum,item)=>sum+item.byteLength,0);const bytes=new Uint8Array(44+length);const view=new DataView(bytes.buffer);const write=(offset:number,value:string)=>{for(let i=0;i<value.length;i++)bytes[offset+i]=value.charCodeAt(i);};write(0,'RIFF');view.setUint32(4,36+length,true);write(8,'WAVE');write(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);view.setUint32(24,24000,true);view.setUint32(28,48000,true);view.setUint16(32,2,true);view.setUint16(34,16,true);write(36,'data');view.setUint32(40,length,true);let offset=44;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}return new Blob([bytes],{type:'audio/wav'});};

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
  private browserAudio:any=null;
  private browserAudioUrl:string|null=null;
  private browserAudioUnlocked=false;
  private browserEndTimer:ReturnType<typeof setTimeout>|null=null;
  constructor(private callbacks:GuidedLiveCallbacks){}

  async activateAudio(){
    if(isBrowser){this.browserAudioUnlocked=true;if(this.browserAudio){await this.browserAudio.play();this.armBrowserEndTimer(this.browserAudio);}return;}
    await this.audioContext.resume();
    if((this.audioContext as any).state!=='running')throw new Error('Audio playback is still blocked by this browser.');
    const queued=this.pendingAudio.splice(0);
    for(const encoded of queued)this.playPcm24(encoded);
  }

  async connect(access:GuidedLiveAccess){
    // Mobile browsers can leave AudioContext.resume() pending until a user
    // gesture. Do not let that browser policy block the Gemini connection.
    await Promise.race([this.activateAudio(),new Promise<void>(resolve=>setTimeout(resolve,700))]);
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
  requestPracticeTurn(){this.sendTextTurn('The learner is ready. Call prepare_practice_turn now, include accurate romaji, then speak the next prompt and wait for the microphone response.');}
  sendPcm16(samples:Float32Array){const pcm=new Int16Array(samples.length);for(let i=0;i<samples.length;i++){const n=Math.max(-1,Math.min(1,samples[i]));pcm[i]=n<0?n*0x8000:n*0x7fff;}this.send({realtimeInput:{audio:{data:bytesToBase64(new Uint8Array(pcm.buffer)),mimeType:'audio/pcm;rate=16000'}}});}
  endUserAudio(){this.send({realtimeInput:{audioStreamEnd:true}});}
  interrupt(){this.nextPlaybackAt=this.audioContext.currentTime;this.pendingAudio=[];if(this.browserEndTimer)clearTimeout(this.browserEndTimer);this.browserEndTimer=null;if(this.browserAudio){this.browserAudio.pause();this.browserAudio=null;}this.browserTurnAudio=[];this.releaseBrowserAudioUrl();this.activePlaybackCount=0;this.callbacks.onSpeaking(false);}
  close(){this.intentionallyClosed=true;this.pendingAudio=[];this.browserTurnAudio=[];if(this.browserEndTimer)clearTimeout(this.browserEndTimer);this.browserEndTimer=null;if(this.browserAudio)this.browserAudio.pause();this.browserAudio=null;this.releaseBrowserAudioUrl();this.socket?.close();this.socket=null;void this.audioContext.suspend();}

  private send(value:unknown){if(this.socket?.readyState===WebSocket.OPEN)this.socket.send(JSON.stringify(value));}
  private sendTextTurn(text:string){this.send({clientContent:{turns:[{role:'user',parts:[{text}]}],turnComplete:true}});}
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
      if(content?.turnComplete&&isBrowser)this.finishBrowserTurn();
      else if(content?.turnComplete&&this.activePlaybackCount===0&&this.pendingAudio.length===0)this.callbacks.onSpeaking(false);
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
        this.send({toolResponse:{functionResponses:[{id:call.id,name:call.name,response:{result:'Recorded. Continue naturally.'}}]}});
      }
      if(message.goAway)this.callbacks.onComplete();
    }catch(error){this.callbacks.onError(error instanceof Error?error.message:'The conversation could not continue. Please try again.');}
  }
  private playPcm24(encoded:string){
    if(isBrowser){this.browserTurnAudio.push(base64ToBytes(encoded));this.callbacks.onSpeaking(true);return;}
    if((this.audioContext as any).state!=='running'){
      this.pendingAudio.push(encoded);
      this.callbacks.onSpeaking(true);
      return;
    }
    const bytes=base64ToBytes(encoded);const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);const frames=Math.floor(bytes.byteLength/2);
    const buffer=this.audioContext.createBuffer(1,frames,24000);const channel=buffer.getChannelData(0);for(let i=0;i<frames;i++)channel[i]=view.getInt16(i*2,true)/32768;
    const source=this.audioContext.createBufferSource();source.buffer=buffer;source.connect(this.audioContext.destination);
    this.activePlaybackCount++;source.onended=()=>{this.activePlaybackCount=Math.max(0,this.activePlaybackCount-1);if(this.activePlaybackCount===0&&this.pendingAudio.length===0)this.callbacks.onSpeaking(false);};
    const start=Math.max(this.audioContext.currentTime+0.02,this.nextPlaybackAt);source.start(start);this.nextPlaybackAt=start+buffer.duration;this.callbacks.onSpeaking(true);
  }
  private finishBrowserTurn(){
    if(!this.browserTurnAudio.length){this.callbacks.onSpeaking(false);return;}
    const blob=pcmToWav(this.browserTurnAudio.splice(0));this.releaseBrowserAudioUrl();this.browserAudioUrl=URL.createObjectURL(blob);const audio=new Audio(this.browserAudioUrl);this.browserAudio=audio;audio.preload='auto';(audio as any).__watchdogMs=Math.max(3000,Math.ceil(Math.max(0,blob.size-44)/48)+2500);const finish=()=>{if(this.browserEndTimer)clearTimeout(this.browserEndTimer);this.browserEndTimer=null;if(this.browserAudio===audio)this.browserAudio=null;this.releaseBrowserAudioUrl();this.callbacks.onSpeaking(false);};(audio as any).__finish=finish;audio.onended=finish;audio.onerror=()=>{finish();this.callbacks.onError('Sumi’s voice could not play on this device. Check media volume and try again.');};if(this.browserAudioUnlocked)void audio.play().then(()=>this.armBrowserEndTimer(audio)).catch(()=>finish());
  }
  private armBrowserEndTimer(audio:any){if(this.browserEndTimer)clearTimeout(this.browserEndTimer);this.browserEndTimer=setTimeout(()=>{if(this.browserAudio===audio){audio.pause();audio.__finish?.();}},Number(audio.__watchdogMs||30000));}
  private releaseBrowserAudioUrl(){if(this.browserAudioUrl){URL.revokeObjectURL(this.browserAudioUrl);this.browserAudioUrl=null;}}
}
