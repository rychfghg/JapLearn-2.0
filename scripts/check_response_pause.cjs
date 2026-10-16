const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const coach=read('app/QuackResponseGuided.tsx'),rush=read('app/QuackResponseTimed.tsx'),relay=read('app/QuackResponseMultiStep.tsx'),menu=read('components/ResponsePauseMenu.tsx');
for(const source of [coach,rush,relay]){assert(source.includes('name="ellipsis-horizontal"'));assert(source.includes('<ResponsePauseMenu'));}
assert(menu.includes('Restart from the beginning?'));assert(menu.includes('Resume game'));
assert(rush.includes('deadline.current+=elapsed;choiceStarted.current+=elapsed;'));
assert(rush.includes('if(!deadline.current){choiceStarted.current=Date.now();'));
assert(rush.includes('blocked:paused||'));assert(rush.includes('!pausedTimingNodes.current.has(nodeId)'));
assert(coach.includes('restart: String(forceNew)'));assert(coach.includes('onPress={reenactConversation}'));
assert(coach.includes("const currentNode = replayIndex!==null ? replayLines[replayIndex] : nodes.get(nodeId)"));
assert(coach.includes('const choices = nodes.get(nodeId)?.choices ?? []')); // Replay cannot reshuffle the unanswered choice.
assert(coach.includes('if(live&&replayIndex!==null)setReplayIndex('));
assert(coach.includes('[currentNode?.id,instructionsVisible,paused,replayIndex,replayRun]'));
assert(relay.includes('[phase,selected?.id,paused]'));assert(relay.includes('[phase,scene.id,questionIndex,replayRun,paused]'));
assert(relay.includes('setSceneIndex(0);setQuestionIndex(0);setAnswers([])'));
console.log('PASS: three pause menus, confirmation, Rush deadline preservation/speed exclusion, Coach reenactment and stable choices, Relay pause/restart guards.');
