// Optional JSON input: a captured public question feed. No live database writes.
const fs=require('fs'),path=require('path'),ts=require('typescript'),assert=require('node:assert/strict');
require.extensions['.ts']=(m,p)=>m._compile(ts.transpileModule(fs.readFileSync(p,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,p);
for(const extension of ['.webp','.mp3'])require.extensions[extension]=(m,p)=>{m.exports=p;};
const {replaceExpressionQuestions,isCaptionOnlyMoment}=require('../services/expressionMatchContext.ts');
const pictures=require('../services/expressionMatchImages.ts').default;
const audio=require('../services/expressionMatchAudio.ts').default;
const bank=require('../data/expressionMatchMedia.json');
const rows=process.argv[2]?JSON.parse(fs.readFileSync(process.argv[2],'utf8')):[];
const audit=[];
for(const level of [1,2,3]){
 const replacements=bank.filter(row=>row.level===level).map(row=>({id:`canonical:${row.key}`,level,setNumber:1,bundledMediaKey:row.key,correctAnswer:row.japanese,scenario:row.scenario,secondaryScenario:row.secondaryScenario,choices:[{japanese:row.japanese,romaji:row.romaji}]}));
 const round=replaceExpressionQuestions(rows,level,replacements);assert.equal(round.length,20);
 for(const [index,question] of round.entries()){
  const authored=bank.find(row=>row.level===level&&row.japanese===question.correctAnswer&&row.scenario===question.scenario&&row.secondaryScenario===question.secondaryScenario);
  const key=question.bundledMediaKey??authored?.key;
  assert(key,`Level ${level}, question ${index+1} has no exact authored media pair`);
  const pair=pictures[key];assert(pair?.scene&&pair?.alternative,`${key}: both pictures required`);
  assert(fs.existsSync(pair.scene)&&fs.existsSync(pair.alternative),`${key}: picture file missing`);
  assert(fs.existsSync(audio[question.correctAnswer]),`${key}: audio missing`);
  assert(!isCaptionOnlyMoment(index),`${key}: picture must not be hidden`);
  audit.push({level,question:index+1,expression:question.correctAnswer,mediaKey:key,firstPicture:path.basename(pair.scene),secondPicture:path.basename(pair.alternative),audio:path.basename(audio[question.correctAnswer])});
 }
}
console.log(JSON.stringify({source:process.argv[2]?'captured-live-feed':'bundled-fallback',questions:60,pictures:120,missingPictures:0,rows:audit},null,2));
