export type RushMode='PRACTICE'|'TIMED';
export type RushOutcome={nodeId:string;outcome:'CORRECT'|'INCORRECT'|'TIMEOUT'|'TECHNICAL_INTERRUPTION';choiceId?:string;responseMs?:number|null;timingEligible?:boolean;reason?:string};
export const rushModeCode=(mode:RushMode)=>mode==='TIMED'?'RUSH_TIMED_V2':'RUSH_PRACTICE_SHORT_V3';
export function rushMetrics(events:readonly RushOutcome[]){
  const terminal=events.filter(e=>e.outcome!=='TECHNICAL_INTERRUPTION');
  const correct=terminal.filter(e=>e.outcome==='CORRECT').length;
  const incorrect=terminal.filter(e=>e.outcome==='INCORRECT').length;
  const interrupted=new Set(events.filter(e=>e.outcome==='TECHNICAL_INTERRUPTION').map(e=>e.nodeId));
  const measured=terminal.filter(e=>e.outcome!=='TIMEOUT'&&!interrupted.has(e.nodeId)&&e.timingEligible&&typeof e.responseMs==='number');
  return {correct,incorrect,timeouts:terminal.filter(e=>e.outcome==='TIMEOUT').length,
    technicalInterruptions:events.filter(e=>e.outcome==='TECHNICAL_INTERRUPTION').length,
    answered:correct+incorrect,answeredAccuracy:correct+incorrect?Math.round(correct*100/(correct+incorrect)):null,
    meanResponseMs:measured.length?Math.round(measured.reduce((s,e)=>s+e.responseMs!,0)/measured.length):null};
}
/** A suspended/throttled UI is an interruption, never an automatic timeout. */
export function rushClock(now:number,lastTick:number,deadline:number){
  if(now<lastTick||now-lastTick>2000)return {kind:'INTERRUPTED' as const,seconds:null};
  return now>=deadline?{kind:'TIMEOUT' as const,seconds:0}:{kind:'RUNNING' as const,seconds:Math.ceil((deadline-now)/1000)};
}
export function rushCanTime(ready:{mode:RushMode|null;layout:boolean;audio:boolean;blocked:boolean;exempt:boolean}){
  return ready.mode==='TIMED'&&ready.layout&&ready.audio&&!ready.blocked&&!ready.exempt;
}
