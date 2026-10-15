const fs=require('fs'),assert=require('assert/strict'),ts=require('typescript');
require.extensions['.ts']=(m,p)=>m._compile(ts.transpileModule(fs.readFileSync(p,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,p);
const {shuffleOptions}=require('../services/shuffleOptions.ts');
for(const size of [2,4]){
  const input=Array.from({length:size},(_,i)=>({id:`choice-${i}`,correct:i===0}));
  const positions=new Set();
  for(let seed=1;seed<=200;seed++){
    let state=seed;
    const random=()=>{state=(Math.imul(1664525,state)+1013904223)>>>0;return state/4294967296;};
    const output=shuffleOptions(input,random);
    assert.notStrictEqual(output,input);
    assert.equal(output.length,size);
    assert.deepEqual(output.map(c=>c.id).sort(),input.map(c=>c.id).sort());
    assert.equal(output.filter(c=>c.correct).length,1);
    assert(output.every(c=>input.includes(c)));
    assert.equal(input[0].id,'choice-0');
    positions.add(output.findIndex(c=>c.correct));
  }
  // Include reproducible extreme draws to cover every position for both sizes.
  for(let step=0;step<100;step++)positions.add(shuffleOptions(input,()=>step/100).findIndex(c=>c.correct));
  assert.equal(positions.size,size);
}
for(const file of ['app/QuackResponseGuided.tsx','app/QuackResponseMultiStep.tsx']){
  const source=fs.readFileSync(require('path').join(__dirname,'..',file),'utf8');
  assert(!source.includes('sparkles'));
}
const coach=fs.readFileSync(require('path').join(__dirname,'../app/QuackResponseGuided.tsx'),'utf8');
assert(!coach.includes('Replay chapter'));
assert(!coach.includes('await loadStory(true)'));
assert(!coach.includes('shuffleChoices ?'));
console.log('PASS: shuffled 2/4-choice sets preserve IDs and correctness; correct answers reach every position; no sparkle icons or Reply Coach chapter restart.');
