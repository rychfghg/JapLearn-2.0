// Reject indistinguishable authored contexts rather than marking a learner wrong.
const normalize=(text:string)=>text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
export const hasMeaningfulText=(text?:string)=>typeof text==='string'&&(text.match(/\p{L}/gu)?.length??0)>=2;
export function hasDistinctContexts(first?:string,second?:string){
  return hasMeaningfulText(first)&&hasMeaningfulText(second)&&normalize(first!)!==normalize(second!);
}
export const canScoreExpression=(captionOnly:boolean,topReady:boolean,bottomReady:boolean)=>captionOnly||(topReady&&bottomReady);
// Periodic text-only items reduce dependence on a familiar illustration.
export const isCaptionOnlyMoment=(index:number)=>(index+1)%4===0;
export const expressionCheckpoint=(index:number,answered:boolean)=>index+(answered?1:0);

type PublishedExpression={id:string;level:number;setNumber:number;order?:number;active?:boolean;correctAnswer:string;scenario:string;secondaryScenario?:string;choices?:{japanese:string}[]};
export function selectExpressionQuestions<T extends PublishedExpression>(rows:T[],level:number):T[]{
  const seen=new Set<string>();
  return rows.filter(row=>row.level===level&&row.setNumber===1&&row.active!==false)
    .sort((a,b)=>(a.order??0)-(b.order??0))
    .filter(row=>{
      if(!hasMeaningfulText(row.correctAnswer)||!hasDistinctContexts(row.scenario,row.secondaryScenario)
        ||!row.choices?.some(c=>c?.japanese===row.correctAnswer))return false;
      const key=row.correctAnswer.normalize('NFKC').replace(/\s+/g,'').trim();
      if(seen.has(key))return false;
      seen.add(key);return true;
    });
}

// Repair a known broken expression with its complete authored version; fill gaps
// with unused authored questions so removing bad/duplicate rows never shortens a level.
export function replaceExpressionQuestions<T extends PublishedExpression>(rows:T[],level:number,replacements:T[]):T[]{
  const repaired=rows.map(row=>{
    if(row.level!==level||row.setNumber!==1||row.active===false)return row;
    const authored=replacements.find(item=>item.correctAnswer===row.correctAnswer);
    const broken=!hasDistinctContexts(row.scenario,row.secondaryScenario)
      ||!row.choices?.some(choice=>choice?.japanese===row.correctAnswer);
    return authored&&broken?{...authored,id:row.id,order:row.order}:row;
  });
  const selected=selectExpressionQuestions(repaired,level);
  const key=(row:T)=>row.correctAnswer.normalize('NFKC').replace(/\s+/g,'');
  const seen=new Set(selected.map(key));
  for(const row of selectExpressionQuestions(replacements,level)){
    if(!seen.has(key(row))){selected.push(row);seen.add(key(row));}
  }
  return selected.slice(0,replacements.length);
}

export type ExpressionQuestionResult={questionId:string;expression:string;questionIndex:number;mode:'PICTURE'|'CAPTION_ONLY';outcome:'CORRECT'|'INCORRECT'|'TECHNICAL_INTERRUPTION';selectedPosition:'top'|'bottom';correctPosition:'top'|'bottom';selectedScenario:string;correctScenario:string;alternativeScenario:string;hintUsed:boolean;audioReplays:number;recordedAt:string};

export function expressionRunMatches(run:any,ids:string[]):boolean{
  if(run?.expressionMatchVersion!==3||!Array.isArray(run.questionResults)
    ||JSON.stringify(run.questionIds)!==JSON.stringify(ids))return false;
  if(run.questionResults.some((row:any)=>!row||ids[row.questionIndex]!==row.questionId
    ||!['CORRECT','INCORRECT','TECHNICAL_INTERRUPTION'].includes(row.outcome)
    ||row.mode!==(isCaptionOnlyMoment(row.questionIndex)?'CAPTION_ONLY':'PICTURE')))return false;
  const scored=run.questionResults.filter((row:ExpressionQuestionResult)=>row.outcome!=='TECHNICAL_INTERRUPTION');
  return scored.length===run.questionIndex&&scored.length<=ids.length
    &&scored.every((row:ExpressionQuestionResult,index:number)=>row.questionIndex===index);
}
