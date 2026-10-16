const fs=require('fs'),path=require('path'),ts=require('typescript'),assert=require('node:assert/strict');
require.extensions['.ts']=(m,p)=>m._compile(ts.transpileModule(fs.readFileSync(p,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,p);
const {POLITENESS_SCENARIOS:bank}=require('../data/politenessScenarios.ts');
assert.equal(bank.length,30);
for(const row of bank){
 assert(row.relationship&&row.learnerRole,`${row.id}: relationship/role missing`);
 assert(row.choices.some(choice=>choice.correct));
 for(const choice of row.choices)assert(choice.feedback?.length>30,`${row.id}: contextual feedback missing`);
}
for(const id of [8,16,17,18,23,24,25,28])assert(bank.find(row=>row.id===id).choices.filter(choice=>choice.correct).length>1,`${id}: a valid alternative must not be marked wrong just for being less formal`);
const screen=fs.readFileSync(path.join(__dirname,'../app/QuackSituateFormal.tsx'),'utf8');
assert(screen.includes('Speaking to: {question.relationship}'));
assert(screen.includes('You: {question.learnerRole}'));
assert(!screen.includes('That answer sounds'));
assert(!screen.includes('npcVoices[(question.id - 1) %'));
assert(screen.includes('politenessResponses:answerRecords.current'));
assert(screen.includes('answerLock.current=true'));
console.log('PASS: 30 relationships, learner roles, 90 contextual choice explanations, valid polite alternatives accepted, response evidence and no unrelated indexed NPC audio.');
