import {shuffleOptions} from './shuffleOptions';
export type ExpressionPosition='top'|'bottom';
/** Balanced positions per run, shuffled once; never re-shuffle on hint/audio renders. */
export function expressionTargetOrder(count:number,random:()=>number=Math.random):ExpressionPosition[]{
  const extra=random()<.5?'top':'bottom';
  return shuffleOptions(Array.from({length:count},(_,i):ExpressionPosition=>i<Math.floor(count/2)?'top':i<Math.floor(count/2)*2?'bottom':extra),random);
}
