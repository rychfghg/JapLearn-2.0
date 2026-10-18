const fs=require('fs'),assert=require('node:assert/strict'),vm=require('node:vm'),ts=require('typescript');
const root=require('node:path').resolve(__dirname,'..');
const read=p=>fs.readFileSync(require('node:path').join(root,p),'utf8');
const rush=read('app/QuackResponseTimed.tsx');
const expression=rush.match(/points: (GOOD_TIERS\.includes\(choice\.evaluation\)[^\r\n]+),/)[1];
for(const evaluation of ['BEST','ACCEPTABLE','AWKWARD','IMPOLITE','RUDE','TIMEOUT']){
 const points=vm.runInNewContext(expression,{GOOD_TIERS:['BEST','ACCEPTABLE'],choice:{evaluation,points:2}});
 assert.equal(points,['BEST','ACCEPTABLE'].includes(evaluation)?2:0);
}
assert(rush.includes("feedbackTitle: 'Time ran out'"));
assert(rush.includes("evaluation: 'TIMEOUT',\n      points: 0") || /evaluation: 'TIMEOUT',\s+points: 0/.test(rush));
assert(rush.includes("lastAnswer.betterExample || nodeMap.get(lastAnswer.nodeId)?.choices?.find(choice=>choice.evaluation==='BEST')"));
for(const file of ['app/QuackResponseGuided.tsx','app/QuackResponseTimed.tsx','app/QuackResponseMultiStep.tsx']){
 const source=read(file);
 assert.equal((source.match(/<ResponseFeedbackHeader /g)||[]).length,1,`${file}: single compact feedback score`);
 assert.equal((source.match(/<ResponseScore /g)||[]).length,1,`${file}: final score only`);
 assert(!source.includes('<ResponseScore earned='));
 const compiled=ts.transpileModule(source,{fileName:file,reportDiagnostics:true,compilerOptions:{jsx:ts.JsxEmit.React,target:ts.ScriptTarget.ES2020}});
 assert(!(compiled.diagnostics||[]).some(d=>d.category===ts.DiagnosticCategory.Error));
}
const compact=read('components/ResponseFeedbackHeader.tsx');
assert(compact.includes("flexDirection:'row'"));
assert(compact.includes('Score: {total}/{maximum}'));
assert(!read('components/ResponseScore.tsx').includes('this reply'));
console.log('PASS: single compact icon/result/score row per game; final scores retained; no duplicate points boxes; zero incorrect/timeout points and Rush examples unchanged.');
