const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),crypto=require('crypto'),ts=require('typescript');
require.extensions['.ts']=(m,p)=>m._compile(ts.transpileModule(fs.readFileSync(p,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,p);
const {expressionTargetOrder}=require('../services/expressionMatchTargets.ts');
for(const count of [1,2,5,20,60])for(const random of [()=>0,()=>.25,()=>.75,()=>.999]){
 const positions=expressionTargetOrder(count,random);assert.equal(positions.length,count);assert(Math.abs(positions.filter(p=>p==='top').length-positions.filter(p=>p==='bottom').length)<=1);
}
const root=path.resolve(__dirname,'..'),read=file=>fs.readFileSync(path.join(root,file),'utf8');
const bank=JSON.parse(read('data/expressionMatchMedia.json')),clips=JSON.parse(read('assets/audio/expression-match/manifest.json'));
assert.equal(bank.length,60);assert.equal(clips.length,60);
for(const row of bank){const clip=clips.find(c=>c.key===row.key);assert(clip);assert.equal(clip.text,row.japanese);assert.equal(clip.voice,'ja-JP-NanamiNeural');const bytes=fs.readFileSync(path.join(root,'assets/audio/expression-match',clip.file));assert(bytes.length>1000);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),clip.sha256);assert(read('services/expressionMatchAudio.ts').includes(clip.file));}
const screen=read('app/QuackSituateMatching.tsx');
assert(screen.includes('expressionAudio[current.correctAnswer]'));assert(screen.includes('await loadBundledSound(source,{shouldPlay:false'));
assert(screen.includes('Audio could not play. Tap the speaker to retry.'));assert(!screen.includes('disabled={!current.audioUrl}'));
assert(!screen.includes('fallback: waveImage'));assert(!screen.includes('fallback: bowImage'));assert(!screen.includes('setCorrectPosition'));
assert(screen.includes('expressionTargetOrder(moments.length)'));assert(screen.includes('setRunRevision(run=>run+1)'));
assert(screen.includes('row.scenario===current?.scenario&&row.secondaryScenario===current?.secondaryScenario'));
const artworkFile=path.join(root,'assets/quacksituate/expression-scenes-v1/manifest.json');
if(fs.existsSync(artworkFile)){
 const images=JSON.parse(fs.readFileSync(artworkFile,'utf8'));assert.equal(images.length,40);
 for(const row of bank.filter(r=>r.level===1))for(const side of ['scene','alternative']){const image=images.find(x=>x.key===row.key&&x.side===side);assert(image);const bytes=fs.readFileSync(path.join(root,'assets/quacksituate/expression-scenes-v1',image.file));assert(bytes.length>1000);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),image.sha256);assert(read('services/expressionMatchImages.ts').includes(image.file));}
 console.log('PASS: 40 Level 1 scene assets and checksums; 60 exact-phrase audio clips; balanced stable answer positions; no fixed wave/bow correctness cue; guarded playback and retry feedback.');
}else console.log('PASS: 60 exact-phrase audio clips, balanced answer positions, no fixed gesture cue, playback guards. Level 1 artwork is not installed yet.');
