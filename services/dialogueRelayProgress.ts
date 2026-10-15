type TurnAnswer = {sceneId:string;questionIndex:number};

/** Repairs never replace the first response or inflate the score/turn count. */
export function recordRelayFirstAttempt<T extends TurnAnswer>(answers:T[], answer:T):T[] {
  return answers.some(a=>a.sceneId===answer.sceneId&&a.questionIndex===answer.questionIndex)
    ? answers : [...answers,answer];
}

/** Incorrect replies must be repaired before the next conversational turn. */
export function relayCanContinue(choice:{correct:boolean}|null):boolean {
  return choice?.correct===true;
}

/** Old bonus saves already passed all conversation turns; never reopen the bonus. */
export function relayRunComplete(save:{completed?:boolean;bonusPromptSeen?:boolean;bonusEarned?:boolean}):boolean {
  return save.completed===true||save.bonusPromptSeen===true||save.bonusEarned===true;
}
