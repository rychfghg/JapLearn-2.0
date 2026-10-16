import contexts from './ahiruRescueContexts.json';
export type RescueChoice={japanese:string;romaji:string};
export type RescueTransfer={where:string;who:string;goal:string;choices:RescueChoice[];correctAnswer:string;explanation:string};
type Context={partner:string;goal:string;skill:string;transfer:RescueTransfer};
type ContextQuestion={scenario:string;location:string;correctAnswer:string;explanation:string;partner?:string;goal?:string;skill?:string};
const bank=contexts as Record<string,Context>;
// Exact scenario matching avoids assigning the wrong relationship to edited/admin questions.
export function rescueContext(question:ContextQuestion){
  const candidate=bank[question.scenario];
  const authored=candidate?.transfer.correctAnswer===question.correctAnswer?candidate:undefined;
  return {where:question.location,who:question.partner||authored?.partner||'The person described in the situation',goal:question.goal||authored?.goal||question.scenario,skill:question.skill||authored?.skill||'Choose a context-appropriate reply',transfer:authored?.transfer};
}
const meanings:Record<string,string>={
  'おはようございます':'a polite morning greeting','こんばんは':'an evening greeting','ありがとう':'casual thanks','じゃあ、また':'a casual goodbye',
  'こんにちは':'a daytime greeting','おやすみなさい':'a good-night farewell','ただいま':'announcing your own return home','いただきます':'appreciation before eating',
  'さようなら':'a farewell','すみません':'getting attention or apologizing','ありがとうございます':'polite thanks','どういたしまして':'responding to someone’s thanks',
  'ごめんなさい':'an apology','まだです':'saying something is not yet done','乾杯':'a toast','おかえりなさい':'welcoming someone back','もちろんです':'agreeing that something is possible',
  'ごちそうさまでした':'appreciation after a meal','おいしいです':'commenting on how food tastes','どうぞ':'offering or inviting someone to proceed','はじめまして':'a first-time introduction',
  'お久しぶり':'greeting someone after a long absence','お疲れさまでした':'acknowledging completed work','はい':'an affirmative answer','いいえ':'a negative answer','助けてください':'asking for help',
  'いってらっしゃい':'responding to someone leaving','ようこそ':'a general welcome','頑張ってください':'encouraging someone before a task','気をつけてください':'asking someone to take care',
  'ゆっくり話してください':'asking someone to speak slowly','ちょっと待ってください':'asking someone to wait briefly','どうぞ入ってください':'inviting someone inside','お先に失礼します':'excusing yourself for leaving first',
  'いってきます':'announcing that you are leaving and intend to return','よくできました':'evaluating someone’s performance','いらっしゃいませ':'a staff welcome to a customer','日本へようこそ':'welcoming someone to Japan',
  'おめでとうございます':'congratulating someone','大丈夫ですか':'asking whether someone is all right','お元気ですか':'asking about general well-being','元気です':'saying you are well',
  'どうぞよろしくお願いします':'completing an introduction and beginning a relationship','おかげさまで':'crediting others’ help','待ってください':'asking someone to wait'
};
export function rescueMismatch(question:ContextQuestion,selectedJapanese:string){
  const context=rescueContext(question),use=meanings[selectedJapanese];
  return `${use?`“${selectedJapanese}” is used for ${use}. `:''}Here you are speaking to ${context.who.toLowerCase()}, and your goal is: ${context.goal} ${question.explanation}`;
}
export function rescueTransferFeedback(question:RescueTransfer,selectedJapanese:string){
  const selectedUse=meanings[selectedJapanese],targetUse=meanings[question.correctAnswer];
  if(selectedJapanese===question.correctAnswer)return targetUse?`This fits: ${targetUse} matches your goal in this situation.`:question.explanation;
  return `${selectedUse?`Your reply is used for ${selectedUse}. `:''}${targetUse?`This situation calls for ${targetUse} instead.`:question.explanation}`;
}
