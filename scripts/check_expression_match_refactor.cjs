require('./check_expression_match_level3.cjs');
const assert=require('node:assert/strict'),fs=require('fs');
const {hasDistinctContexts,hasMeaningfulText,canScoreExpression,isCaptionOnlyMoment,expressionCheckpoint,selectExpressionQuestions,replaceExpressionQuestions,expressionRunMatches}=require('../services/expressionMatchContext.ts');
const checkpoint={expressionMatchVersion:3,questionIds:['one','two'],questionIndex:1,questionResults:[{questionId:'one',questionIndex:0,mode:'PICTURE',outcome:'CORRECT'}]};
assert(expressionRunMatches(checkpoint,['one','two']));
assert(!expressionRunMatches({...checkpoint,expressionMatchVersion:1},['one','two']));
assert(!expressionRunMatches(checkpoint,['one']));
assert(!expressionRunMatches({...checkpoint,questionIndex:2},['one','two']));
assert(expressionRunMatches({...checkpoint,questionResults:[...checkpoint.questionResults,{questionId:'two',questionIndex:1,mode:'PICTURE',outcome:'TECHNICAL_INTERRUPTION'}]},['one','two']));
const fixture={id:'one',level:1,setNumber:1,order:1,correctAnswer:'またあした',scenario:'See your classmate tomorrow.',secondaryScenario:'Meet your new manager.',choices:[{japanese:'またあした'}]};
const cases=[fixture,{...fixture,id:'dup',order:2},{...fixture,id:'other-set',setNumber:2},{...fixture,id:'inactive',active:false},
 {...fixture,id:'broken',correctAnswer:'こんにちは',secondaryScenario:'.',choices:[{japanese:'こんにちは'}]},
 {...fixture,id:'other-level',level:2},{...fixture,id:'empty-set',setNumber:undefined}];
assert.deepEqual(selectExpressionQuestions(cases,1).map(row=>row.id),['one'],'No duplicate phrase, other set, inactive row or dot-only situation');
assert.deepEqual(selectExpressionQuestions([{...fixture,id:'dot',scenario:'.'},fixture],1).map(row=>row.id),['one']);
for(const value of ['.','...','。','  ','?!',undefined])assert(!hasMeaningfulText(value));
assert(!hasDistinctContexts('.','An actual situation'));
assert(hasMeaningfulText('こんにちは'));
for(const top of [true,false])for(const bottom of [true,false]){
 assert.equal(canScoreExpression(false,top,bottom),top&&bottom);
 assert(canScoreExpression(true,top,bottom),'Intentional caption-only checks are not image failures');
}
assert(!hasDistinctContexts('Same scene.',' same SCENE! '));
assert(!hasDistinctContexts('A scene',''));
assert(hasDistinctContexts('Greeting your teacher in the morning','Saying goodbye after class'));
for(let i=0;i<20;i++)assert.equal(isCaptionOnlyMoment(i),(i+1)%4===0);
assert.equal(expressionCheckpoint(4,false),4);
assert.equal(expressionCheckpoint(4,true),5);
assert.equal(expressionCheckpoint(19,true),20);
const bank=require('../data/expressionMatchMedia.json');
for(const level of [1,2,3]){
 const authored=bank.filter(row=>row.level===level).map((row,index)=>({id:row.key,level,setNumber:1,order:index+100,correctAnswer:row.japanese,scenario:row.scenario,secondaryScenario:row.secondaryScenario,choices:[{japanese:row.japanese}]}));
 const broken={...authored[0],id:'published-broken',secondaryScenario:'.'};
 const duplicated=[broken,{...authored[1],id:'published-valid'},{...authored[1],id:'duplicate'}, {...authored[1],id:'duplicate-two'}, {...authored[2],setNumber:2}];
 const fixed=replaceExpressionQuestions(duplicated,level,authored);
 assert.equal(fixed.length,20);assert.equal(new Set(fixed.map(row=>row.correctAnswer)).size,20);
 assert.equal(fixed.find(row=>row.id==='published-broken').secondaryScenario,authored[0].secondaryScenario);
 assert(fixed.some(row=>row.id==='published-valid'),'Valid published questions must be retained');
 assert(fixed.every(row=>hasDistinctContexts(row.scenario,row.secondaryScenario)));
 assert.equal(replaceExpressionQuestions([],level,authored).length,20,'Missing content receives complete authored replacements');
}
for(const row of bank)assert(hasDistinctContexts(row.scenario,row.secondaryScenario),row.key);
for(const row of bank)assert(hasMeaningfulText(row.hint),row.key);
if(process.argv[2]){
 const seed=fs.readFileSync(process.argv[2],'utf8');
 for(const row of bank)assert(seed.includes(`${row.japanese}|${row.romaji}|${row.scenario}|${row.secondaryScenario}|${row.hint}`),`Backend hint mismatch: ${row.key}`);
 console.log('PASS: all 60 frontend/backend canonical hints match.');
}
const screen=fs.readFileSync(require('path').join(__dirname,'../app/QuackSituateMatching.tsx'),'utf8');
for(const fragment of ['event.stopPropagation()','Retry scene picture','setShowPause(true)','setShowStart(true)','await saveRun(0,0,0)','expressionCheckpoint(momentIndex,locked)','questionIds=moments.map','{score}/{moments.length*10} pts','{scoreSummary}','captionOnly={captionOnly}','japanese={current.correctAnswer}'])assert(screen.includes(fragment),fragment);
assert(!screen.includes('item.imageUrl &&'),'Missing artwork must not discard a caption-complete question');
const restart=screen.slice(screen.indexOf('const restartGame='),screen.indexOf('const scoreSummary='));
assert(screen.indexOf('if(!canScoreExpression')<screen.indexOf('const nextMistakes ='),'Media guard must precede scoring');
assert(screen.includes('authoredMedia?.hint'),'Use revised canonical hints instead of stale server hints');
assert(screen.includes('questionResults:questionResults.current'),'Records must be sent and checkpointed');
assert(screen.includes("record('TECHNICAL_INTERRUPTION')"));
assert(screen.includes("record(isCorrect?'CORRECT':'INCORRECT')"));
assert(screen.includes('expressionMatchVersion:3'),'Reset older checkpoints after replacing question content');
assert(!restart.includes('ensureCompletedAttempt'),'Restarting unfinished practice must not submit it as complete');
console.log('PASS: distinct-caption guard, 5 caption-only checks per 20 questions, checkpoint boundary logic, retry isolation, menu/start/restart/score UI wiring. Device interaction QA still required.');
