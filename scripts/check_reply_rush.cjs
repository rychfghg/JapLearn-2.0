const fs=require('fs'),path=require('path'),assert=require('assert/strict'),ts=require('typescript'),vm=require('vm');
require.extensions['.ts']=(m,p)=>m._compile(ts.transpileModule(fs.readFileSync(p,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,p);
const {rushMetrics,rushClock,rushCanTime,rushModeCode}=require('../services/replyRushSession.ts');
const {rushFollowups}=require('../services/replyRushFollowups.ts');
const {shuffleOptions}=require('../services/shuffleOptions.ts');
for(const mode of [null,'PRACTICE','TIMED'])for(const layout of [false,true])for(const audio of [false,true])for(const blocked of [false,true])for(const exempt of [false,true])assert.equal(rushCanTime({mode,layout,audio,blocked,exempt}),mode==='TIMED'&&layout&&audio&&!blocked&&!exempt);
assert.equal(rushClock(999,900,20000).kind,'RUNNING');
assert.equal(rushClock(20000,19900,20000).kind,'TIMEOUT');
assert.equal(rushClock(30000,1000,20000).kind,'INTERRUPTED');
assert.equal(rushClock(900,1000,20000).kind,'INTERRUPTED');
const stats=rushMetrics([{nodeId:'a',outcome:'CORRECT',timingEligible:true,responseMs:1000},{nodeId:'b',outcome:'INCORRECT',timingEligible:true,responseMs:2000},{nodeId:'c',outcome:'TIMEOUT'},{nodeId:'b',outcome:'TECHNICAL_INTERRUPTION'}]);
assert.equal(stats.answeredAccuracy,50);assert.equal(stats.incorrect,1);assert.equal(stats.timeouts,1);assert.equal(stats.technicalInterruptions,1);assert.equal(stats.meanResponseMs,1000);
assert.equal(rushMetrics([{nodeId:'c',outcome:'TIMEOUT'}]).answeredAccuracy,null);
assert.equal(rushModeCode('PRACTICE'),'RUSH_PRACTICE_SHORT_V3');assert.equal(rushModeCode('TIMED'),'RUSH_TIMED_V2');
const root=path.resolve(__dirname,'..'),source=fs.readFileSync(path.join(root,'app/QuackResponseTimed.tsx'),'utf8'),file=ts.createSourceFile('rush.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
let scenes,audio;for(const statement of file.statements)if(ts.isVariableStatement(statement))for(const d of statement.declarationList.declarations){if(d.name.getText(file)==='SCENES')scenes=vm.runInNewContext(d.initializer.getText(file));if(d.name.getText(file)==='audioOverrides')audio=vm.runInNewContext('('+d.initializer.getText(file)+')',{require:p=>p});}
let count=0;
const bankPath=path.resolve(root,'../../JapLearn-BackEnd/Backend/src/main/resources/reply-rush-v2.json');
const bank=fs.existsSync(bankPath)?JSON.parse(fs.readFileSync(bankPath,'utf8')):null;
for(const scene of scenes)for(const decision of scene.decisions){count++;const skill=scene.id+'_'+decision.id,q=rushFollowups[skill];assert(q&&q.length===6);assert.notEqual(q[1],q[3]);assert.notEqual(q[0],decision.prompt);assert(!decision.choices.some(c=>c.japanese===q[1]),'Follow-up must be new: '+skill);
  const setup='n_'+skill+'_setup';if(decision.setup)assert(fs.statSync(path.resolve(root,'app',audio[setup])).size>1000);
  const original=decision.choices.map(c=>c.id);for(const draw of [0,.25,.5,.99])assert.deepEqual(shuffleOptions(decision.choices,()=>draw).map(c=>c.id).sort(),[...original].sort());
  if(bank){assert.equal(bank['n_'+skill+'_choice'].followup,q[1]);assert.equal(bank['n_'+skill+'_choice'].alternate,q[3]);for(const c of decision.choices)assert.equal(bank['n_'+skill+'_choice'].choices[c.id],c.evaluation);}
}
assert.equal(count,20);assert.equal(Object.keys(rushFollowups).length,24);
const practice=JSON.parse(fs.readFileSync(path.join(root,'services/replyRushPracticeScene.json'),'utf8'));
assert.equal(practice.length,1);assert.equal(practice[0].decisions.length,4);
const practiceExpected=[];
for(const scene of practice){practiceExpected.push({id:'n_'+scene.id+'_opening',...scene.opening});for(const d of scene.decisions){const stem='n_'+scene.id+'_'+d.id;practiceExpected.push({id:stem+'_setup',...d.setup},{id:stem+'_react_timeout',...d.timeout});for(const c of d.choices)practiceExpected.push({id:stem+'_reply_'+c.id,japanese:c.japanese,character:'SUMI'},{id:stem+'_react_'+c.id,...c.reaction});const q=rushFollowups[scene.id+'_'+d.id];assert(q);assert(!d.choices.some(c=>c.japanese===q[1]));if(bank){assert.equal(bank[stem+'_choice'].followup,q[1]);for(const c of d.choices)assert.equal(bank[stem+'_choice'].choices[c.id],c.evaluation);}}}
const recorded=JSON.parse(fs.readFileSync(path.join(root,'assets/audio/response-rush/short-practice-manifest.json'),'utf8'));
const crypto=require('crypto');assert.equal(recorded.length,25);assert.equal(practiceExpected.length,25);
for(const line of practiceExpected){const row=recorded.find(r=>r.id===line.id);assert(row);assert.equal(row.text,line.japanese);assert.equal(row.voice,line.character==='SUMI'?'ja-JP-NanamiNeural':'ja-JP-KeitaNeural');const clip=fs.readFileSync(path.join(root,'assets/audio/response-rush',row.file));assert(clip.length>1000);assert.equal(crypto.createHash('sha256').update(clip).digest('hex'),row.sha256);}
assert(source.includes("buildStory(PRACTICE_SCENES,'n_practice_ending')"));
assert(source.includes("nextMode==='PRACTICE'?PRACTICE_STORY.startId:START_NODE_ID"));
assert(source.includes('rushCanTime('));assert(source.includes('onLayout='));assert(!source.includes('setTimeout(finishAndAdvance, fallbackMs)'));assert(!source.includes('long silence usually reads as confusion'));
assert(!source.includes('!resumeReady||!practiceCompleted'));
assert(source.includes("setPendingMode('TIMED')"));
assert(source.includes('visible={pendingMode!==null}'));
assert(source.includes("setPendingMode(saved.mode??'PRACTICE')"));
assert(source.includes("resumeInstructions?'Resume game':'Start game'"));
console.log('PASS: optional practice and explicit start/resume gates; 4 practice vs 20 timed replies; 25 voice/checksum entries; 24 review skills; timing/outcome gates; bank parity.');
