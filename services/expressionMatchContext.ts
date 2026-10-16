// Reject indistinguishable authored contexts rather than marking a learner wrong.
const normalize=(text:string)=>text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
export function hasDistinctContexts(first?:string,second?:string){
  return !!first?.trim()&&!!second?.trim()&&normalize(first)!==normalize(second);
}
// Periodic text-only items reduce dependence on a familiar illustration.
export const isCaptionOnlyMoment=(index:number)=>(index+1)%4===0;
export const expressionCheckpoint=(index:number,answered:boolean)=>index+(answered?1:0);
