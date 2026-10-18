import AsyncStorage from '@react-native-async-storage/async-storage';
import expoconfig from '../expoconfig';
import { getPendingSubmissions, syncOfflineSubmissions } from './offlineSync';

export type ActivityHistory = {
  id: string; clientAttemptId?: string; title: string; gameType?: string; status: string;
  score: number | null; rawScore?: number | null; maxScore?: number | null; playedAt?: string;
  answeredCount?: number | null; mode?: string; timed?: boolean; resultStatus?: string; level?: number;
};
export type ProgressAnalytics = {
  overallMastery: number; situationalAccuracy: number; interactionAccuracy: number;
  progressSummary: string; recommendation: string; weakAreas: string[]; repeatedMistakes: string[];
  history: ActivityHistory[]; moduleAccuracy: Array<{label:string;value:number}>;
  quackTalkBreakdown?: Array<{key:string;label:string;value:number;sessions:number}>;
  completedActivities?: number; attemptCount?: number;
};
const names: Record<string,string> = {RECOGNITION:'Ahiru Rescue',EXPRESSION_MATCH:'Expression Match',POLITENESS:'Politeness',QUACKRESPONSE_RUSH:'Response Rush',QUACKRESPONSE_RELAY:'Dialogue Relay'};
const kind = (game: string) => game.startsWith('EXPRESSION_MATCH_LEVEL_') ? 'EXPRESSION_MATCH' : game;
const timestamp = (value?:string) => Date.parse(value || '') || 0;

export function mergeActivityHistory(server: ActivityHistory[], pending: ActivityHistory[], local: ActivityHistory[] = []) {
  const rows=[...server];
  for(const item of pending) {
    if(item.clientAttemptId && rows.some(row=>row.clientAttemptId===item.clientAttemptId && !['IN_PROGRESS','PENDING_SYNC'].includes(row.status)))continue;
    // A queued result supersedes its old unfinished version, not earlier completed attempts.
    for(let i=rows.length-1;i>=0;i--)if(item.clientAttemptId && rows[i].clientAttemptId===item.clientAttemptId && ['IN_PROGRESS','PENDING_SYNC'].includes(rows[i].status))rows.splice(i,1);
    rows.push(item);
  }
  for(const item of local) {
    const levelOf=(row:ActivityHistory)=>row.level || Number(row.gameType?.split('_LEVEL_')[1]) || 0;
    if(rows.some(row=>kind(row.gameType||'')===kind(item.gameType||'') && (kind(item.gameType||'')!=='EXPRESSION_MATCH'||levelOf(row)===levelOf(item)) && timestamp(row.playedAt)>=timestamp(item.playedAt)))continue;
    rows.push(item);
  }
  return rows.sort((a,b)=>timestamp(b.playedAt)-timestamp(a.playedAt));
}

export async function deviceActivityHistory(email:string) {
  const queue=await getPendingSubmissions(email);
  const pending:ActivityHistory[]=queue.filter(entry=>['/api/situational/attempts','/api/scores/high-score','/api/scores/save'].includes(entry.path)).map(entry=>{
    const b=entry.body, game=String(b.gameType||b.game||'');const raw=Number(b.score)||0,max=Number(b.maxScore)||Number(b.totalQuestions)*10||0;
    return {id:`pending:${entry.id}`,clientAttemptId:String(b.clientAttemptId||entry.id),title:names[game]||game,gameType:game,level:Number(b.level)||undefined,status:'PENDING_SYNC',resultStatus:b.endReason==='GAME_OVER'?'FAILED':b.completed===false?'IN_PROGRESS':'COMPLETED',score:max>0?Math.round(raw*100/max):null,rawScore:raw,maxScore:max,playedAt:entry.createdAt,mode:String(b.mode||''),timed:b.mode==='RUSH_TIMED_V2'};
  });
  const local:ActivityHistory[]=[];
  const normalized=email.trim().toLowerCase();
  const keys=[`ahiru-rescue:${normalized}`,...[1,2,3].map(level=>`expressionRun:${normalized}:EXPRESSION_MATCH_LEVEL_${level}`)];
  for(const key of keys){try{const raw=await AsyncStorage.getItem(key);if(!raw)continue;const run=JSON.parse(raw);const index=Number(run.questionIndex??run.index)||0;const answered=Math.max(index,Array.isArray(run.answers)?run.answers.length:0,Number(run.correctCount||0)+Number(run.easyMistakes||0)+Number(run.hardMistakes||0));if(answered<=0||!run.savedAt)continue;const game=key.startsWith('ahiru-')?'RECOGNITION':key.split(':').pop()!;local.push({id:`device:${key}`,title:names[kind(game)],gameType:game,status:'SAVED_ON_DEVICE',score:null,answeredCount:answered,playedAt:new Date(Number(run.savedAt)).toISOString()});}catch{}}
  // These games keep their own continuation formats; never turn a checkpoint into mastery.
  for(const [key,game] of [[`response_rush_resume_v3:${normalized}`,'QUACKRESPONSE_RUSH'],[`dialogue_relay_v5:${email}`,'QUACKRESPONSE_RELAY']] as const){
    try{const raw=await AsyncStorage.getItem(key);if(!raw)continue;const run=JSON.parse(raw);if(run.completed||!Array.isArray(run.answers)||!run.answers.length)continue;
      const matching=serverDate(run.savedAt);if(!matching)continue;
      local.push({id:`device:${key}`,clientAttemptId:run.runId,title:names[game],gameType:game,status:'SAVED_ON_DEVICE',score:null,answeredCount:run.answers.length,playedAt:matching,mode:run.mode,timed:run.mode==='TIMED'});
    }catch{}
  }
  return {pending,local};
}
function serverDate(value:unknown){const n=typeof value==='number'?value:Date.parse(String(value||''));return Number.isFinite(n)&&n>0?new Date(n).toISOString():undefined;}

export async function loadProgressAnalytics(email:string):Promise<ProgressAnalytics> {
  const response=await fetch(`${expoconfig.API_URL}/api/quackProgress/analytics?email=${encodeURIComponent(email)}`);
  if(!response.ok)throw new Error(response.status===401||response.status===403?'Please sign in again to load your saved progress.':'Saved progress could not be loaded. Your results have not been erased. Try Refresh.');
  const body=await response.json();
  if(!Array.isArray(body.history)||!Array.isArray(body.moduleAccuracy))throw new Error('The progress response was incomplete. Please try Refresh.');
  const device=await deviceActivityHistory(email);
  void syncOfflineSubmissions(email).catch(()=>undefined);
  return {...body,history:mergeActivityHistory(body.history,device.pending,device.local)};
}
