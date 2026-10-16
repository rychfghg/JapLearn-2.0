const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),ts=require('typescript');
require.extensions['.ts']=(m,p)=>m._compile(ts.transpileModule(fs.readFileSync(p,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,p);
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const {rescueContext,rescueMismatch,rescueTransferFeedback}=require('../services/ahiruRescueContext.ts');
const bank=JSON.parse(read('services/ahiruRescueContexts.json'));
assert.equal(Object.keys(bank).length,25);
const seed=read('../../JapLearn-BackEnd/Backend/src/main/java/japlearn/demo/Config/SituationalQuestionSeeder.java');
let count=0;
for(const m of seed.matchAll(/q\((\d+), "(STARTER|HARD)", "([^"]+)", "([^"]+)", "([^"]+)", "([^"]+)", "([^"]+)", "([^"]+)"([^\n]+)/g)){
  count++;const q={scenario:m[5],location:m[3],correctAnswer:m[7],explanation:m[8]},c=rescueContext(q);
  assert(c.who&&c.goal&&c.skill);assert(!c.who.includes('described in'));assert.equal(c.where,q.location);
  assert.notEqual(c.transfer.goal,q.scenario);assert.notEqual(c.transfer.where,q.location);assert.equal(c.transfer.choices.length,2);
  assert.equal(c.transfer.choices.filter(x=>x.japanese===c.transfer.correctAnswer).length,1);
  for(const choice of [...m[9].matchAll(/c\("([^"]+)", "([^"]+)"\)/g)])if(choice[1]!==q.correctAnswer){const reason=rescueMismatch(q,choice[1]);assert(reason.includes(choice[1]));assert(reason.includes(c.goal));assert(reason.includes('is used for'));}
  for(const choice of c.transfer.choices){assert(choice.romaji);assert(rescueTransferFeedback(c.transfer,choice.japanese).length>20);}
}
assert.equal(count,25);
const custom=rescueContext({scenario:'An instructor-authored new situation',location:'A new place',correctAnswer:'custom',explanation:'Custom reason',partner:'Your neighbor',goal:'Ask permission.'});
assert.equal(custom.who,'Your neighbor');assert.equal(custom.goal,'Ask permission.');assert.equal(custom.transfer,undefined);
const first=Object.keys(bank)[0];assert.equal(rescueContext({scenario:first,location:'Place',correctAnswer:'Changed answer',explanation:''}).transfer,undefined);
const source=read('app/QuackSituateRecognition.tsx'),review=read('components/RescueSkillReview.tsx');
assert(source.includes('<RescueContextCard {...learningContext}/>'));assert(source.includes('setSkillReviewVisible(true)'));assert(source.includes('finishFeedback();'));
for(const mutation of ['setCorrectCount','setEasyMistakes','setHardMistakes','queueOfflineSubmission','fetch('])assert(!review.includes(mutation));
assert(review.includes('shuffleOptions(question.choices)'));assert(source.includes('contentContainerStyle={styles.reactionCopy}'));
console.log('PASS: 25 seeded contexts, every distractor contextualized, 25 different-setting transfer questions, safe custom-content fallback, unscored randomized practice and scrollable feedback.');
