const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),vm=require('vm');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8'),rush=read('app/QuackResponseTimed.tsx');
// Execute the actual pause/resume handlers with a controlled wall clock.
let now=6000,paused=false;
const deadline={current:21000},choiceStarted={current:1000},pausedAt={current:0},pausedTimingNodes={current:new Set()};
const context={Date:{now:()=>now},deadline,choiceStarted,pausedAt,pausedTimingNodes,nodeId:'question',setPaused:v=>paused=v};
const handler=name=>vm.runInNewContext('('+rush.match(new RegExp('const '+name+'=(\\(\\)=>\\{[^\\n]+\\});'))[1]+')',context);
const pause=handler('pauseGame'),resume=handler('resumeGame');
pause();assert.equal(paused,true);now=16000;resume();assert.equal(paused,false);assert.equal(deadline.current-now,15000);
now=19000;pause();now=49000;resume();assert.equal(deadline.current-now,12000);assert(pausedTimingNodes.current.has('question'));
const timer=rush.slice(rush.indexOf('if(!currentNode||!rushCanTime('),rush.indexOf('const pause=()=>'));
assert(!timer.includes('hintVisible'));assert(!timer.includes('questionReplay'));assert(timer.includes('if(!deadline.current)'));
const interruption=rush.slice(rush.indexOf('const interrupt='),rush.indexOf('const roundTotal='));
assert(!interruption.includes('exemptNodes.current.add'));assert(interruption.includes('Math.max(1,timeLeft)*1000'));
assert(rush.includes('Resume timed challenge'));assert(!rush.includes('Hints are available in untimed practice'));
const controls=rush.slice(rush.indexOf('<View style={{flexDirection:\'row\',alignItems:\'center\',gap:8,marginBottom:8}}>'),rush.indexOf('<ScrollView style={{flexShrink:1}} onLayout='));
assert(controls.includes('>Replay</Text>'));assert(controls.includes('>Hint</Text>'));
for(const file of ['app/QuackResponseTimed.tsx','app/QuackResponseGuided.tsx','app/QuackResponseMultiStep.tsx'])assert(read(file).includes('>Play again</Text>'));
console.log('PASS: repeated pause/resume preserves 15s then 12s; technical resume stays timed; hints/replay do not stop clock; all three completion screens offer Play again.');
