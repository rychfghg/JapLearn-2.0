import { AudioContext } from 'react-native-audio-api';

export type GuidedPhraseTurn={targetJapanese:string;englishMeaning:string;learnerInstruction:string};
export type MeaningEvaluation={contextScore:number;appropriate:boolean;explanation:string;betterResponse:string};
export type GuidedLiveCallbacks={onConnected:()=>void;onSpeaking:(value:boolean)=>void;onInputTranscript:(text:string)=>void;onOutputTranscript:(text:string)=>void;onTurn:(turn:GuidedPhraseTurn)=>void;onEvaluation:(value:MeaningEvaluation)=>void;onError:(message:string)=>void;onComplete:()=>void};
export type GuidedLiveAccess={token:string;model:string;websocketUrl:string;voice:string;systemInstruction:string;practicesRemaining:number};

const bytesToBase64=(bytes:Uint8Array)=>{let binary='';for(let i=0;i<bytes.length;i+=0x8000)binary+=String.fromCharCode(...bytes.subarray(i,i+0x8000));return globalThis.btoa(binary);};
const base64ToBytes=(value:string)=>{const binary=globalThis.atob(value);const bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);return bytes;};

export class GeminiGuidedPhraseLive {
  private socket:WebSocket|null=null;
  private audioContext=new AudioContext({sampleRate:24000});
  private nextPlaybackAt=0;
  private setupResolve:(()=>void)|null=null;
  private setupReject:((error:Error)=>void)|null=null;
  private setupTimer:ReturnType<typeof setTimeout>|null=null;
  private intentionallyClosed=false;
  constructor(private callbacks:GuidedLiveCallbacks){}

  async connect(access:GuidedLiveAccess){
    await this.audioContext.resume();
    this.intentionallyClosed=false;
    const url=`${access.websocketUrl}?access_token=${encodeURIComponent(access.token)}`;
    await new Promise<void>((resolve,reject)=>{
      this.setupResolve=resolve;this.setupReject=reject;
      const socket=new WebSocket(url);this.socket=socket;
      this.setupTimer=setTimeout(()=>{this.setupReject=null;reject(new Error('Sumi is taking longer than expected to connect. Please try again.'));socket.close();},20000);
      socket.onopen=()=>socket.send(JSON.stringify({setup:{model:`models/${access.model}`,responseModalities:['AUDIO'],systemInstruction:{parts:[{text:access.systemInstruction}]},speechConfig:{voiceConfig:{prebuiltVoiceConfig:{voiceName:access.voice}}},inputAudioTranscription:{},outputAudioTranscription:{},tools:[{functionDeclarations:[{name:'prepare_practice_turn',description:'Call before speaking each learner turn.',parameters:{type:'OBJECT',properties:{targetJapanese:{type:'STRING'},englishMeaning:{type:'STRING'},learnerInstruction:{type:'STRING'}},required:['targetJapanese','englishMeaning','learnerInstruction']}},{name:'evaluate_learner_meaning',description:'Call after each learner answer.',parameters:{type:'OBJECT',properties:{contextScore:{type:'INTEGER'},appropriate:{type:'BOOLEAN'},explanation:{type:'STRING'},betterResponse:{type:'STRING'}},required:['contextScore','appropriate','explanation','betterResponse']}}]}]}}));
      socket.onerror=()=>{if(this.setupTimer)clearTimeout(this.setupTimer);this.setupTimer=null;this.setupReject=null;reject(new Error('Sumi could not connect. Check your internet connection and try again.'));};
      socket.onmessage=(event)=>this.handleMessage(String(event.data));
      socket.onclose=(event)=>{if(this.setupTimer)clearTimeout(this.setupTimer);this.setupTimer=null;this.callbacks.onSpeaking(false);if(this.setupReject){this.setupReject(new Error('Sumi could not accept the conversation setup. Please try again.'));this.setupReject=null;}else if(!this.intentionallyClosed)this.callbacks.onError(event.reason||'The speaking room disconnected. Please reconnect.');};
    });
  }

  begin(){this.send({realtimeInput:{text:'Begin Guided Phrase Practice now. Greet me in Japanese, explain the activity briefly in English, then prepare the first of five spoken practice turns.'}});}
  sendPcm16(samples:Float32Array){const pcm=new Int16Array(samples.length);for(let i=0;i<samples.length;i++){const n=Math.max(-1,Math.min(1,samples[i]));pcm[i]=n<0?n*0x8000:n*0x7fff;}this.send({realtimeInput:{audio:{data:bytesToBase64(new Uint8Array(pcm.buffer)),mimeType:'audio/pcm;rate=16000'}}});}
  endUserAudio(){this.send({realtimeInput:{audioStreamEnd:true}});}
  interrupt(){this.nextPlaybackAt=this.audioContext.currentTime;}
  close(){this.intentionallyClosed=true;this.socket?.close();this.socket=null;void this.audioContext.suspend();}

  private send(value:unknown){if(this.socket?.readyState===WebSocket.OPEN)this.socket.send(JSON.stringify(value));}
  private handleMessage(raw:string){
    try{
      const message=JSON.parse(raw);
      if(message.setupComplete){if(this.setupTimer)clearTimeout(this.setupTimer);this.setupTimer=null;this.setupResolve?.();this.setupResolve=null;this.setupReject=null;this.callbacks.onConnected();this.begin();return;}
      const content=message.serverContent;
      if(content?.interrupted){this.nextPlaybackAt=this.audioContext.currentTime;this.callbacks.onSpeaking(false);}
      if(content?.inputTranscription?.text)this.callbacks.onInputTranscript(content.inputTranscription.text);
      if(content?.outputTranscription?.text)this.callbacks.onOutputTranscript(content.outputTranscription.text);
      for(const part of content?.modelTurn?.parts??[]){if(part.inlineData?.data)this.playPcm24(part.inlineData.data);}
      if(content?.turnComplete)this.callbacks.onSpeaking(false);
      for(const call of message.toolCall?.functionCalls??[]){
        if(call.name==='prepare_practice_turn')this.callbacks.onTurn(call.args as GuidedPhraseTurn);
        if(call.name==='evaluate_learner_meaning')this.callbacks.onEvaluation(call.args as MeaningEvaluation);
        this.send({toolResponse:{functionResponses:[{id:call.id,name:call.name,response:{result:'Recorded. Continue naturally.'}}]}});
      }
      if(message.goAway)this.callbacks.onComplete();
    }catch(error){this.callbacks.onError(error instanceof Error?error.message:'The conversation could not continue. Please try again.');}
  }
  private playPcm24(encoded:string){
    const bytes=base64ToBytes(encoded);const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);const frames=Math.floor(bytes.byteLength/2);
    const buffer=this.audioContext.createBuffer(1,frames,24000);const channel=buffer.getChannelData(0);for(let i=0;i<frames;i++)channel[i]=view.getInt16(i*2,true)/32768;
    const source=this.audioContext.createBufferSource();source.buffer=buffer;source.connect(this.audioContext.destination);
    const start=Math.max(this.audioContext.currentTime+0.02,this.nextPlaybackAt);source.start(start);this.nextPlaybackAt=start+buffer.duration;this.callbacks.onSpeaking(true);
  }
}
