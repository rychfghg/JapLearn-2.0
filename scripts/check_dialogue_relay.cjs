const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto'),ts=require('typescript');
const root=path.resolve(__dirname,'..');
require.extensions['.ts']=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,file);
require.extensions['.png']=(mod,file)=>{mod.exports=file;};
const {RELAY_SCENES,RELAY_TOTAL_RESPONSES,relayExchange}=require('../app/dialogueRelayContent.ts');
const {recordRelayFirstAttempt,relayCanContinue}=require('../services/dialogueRelayProgress.ts');
assert.equal(RELAY_TOTAL_RESPONSES,25);
assert.equal(RELAY_SCENES.length,10);
assert.equal(RELAY_SCENES[0].questions.length,2);
assert.equal(RELAY_SCENES.at(-1).questions.length,3);
let previous=0;
const out=path.join(root,'assets/audio/dialogue-relay');
const manifest=JSON.parse(fs.readFileSync(path.join(out,'conversation-manifest.json'),'utf8'));
const old=JSON.parse(fs.readFileSync(path.join(out,'manifest.json'),'utf8'));
const ids=new Set(),review=['# Dialogue Relay — complete exchange review','',
  'Status: proposed content; instructor approval and physical-device checks are still required.',
  'Untimed practice. Japanese is followed by Romaji. Wrong replies require repair. Scores retain first attempts; they are not independent-mastery certification.',
  'Sumi and Haru use the existing NanamiNeural and KeitaNeural voice assignments. New clips are checked against the script and file checksums; this is not a listening/transcription audit.',''];
const bundled=fs.readFileSync(path.join(root,'app/relayConversationAudio.ts'),'utf8');
for(const row of manifest){const file=path.join(out,row.file);assert(fs.statSync(file).size>1000);assert.equal(crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),row.sha256);assert(bundled.includes(`'${row.id}': require('../assets/audio/dialogue-relay/${row.file}')`));}
for(const scene of RELAY_SCENES){
  assert(scene.questions.length>=previous);previous=scene.questions.length;
  review.push(`## ${scene.title}`,scene.narration,'');
  for(const [i,q]of scene.questions.entries()){
    const d=relayExchange(scene.id,i);assert.equal(q.choices.length,2);assert.equal(q.choices.filter(c=>c.correct).length,1);
    review.push(`### Student turn ${i+1}`,`Sumi: ${d.sumi}`,d.sumiRomaji,`Haru: ${d.haru}`,d.haruRomaji,`Task: ${q.prompt}`,`Hint: ${q.coach}`,'');
    for(const [speaker,text]of [['sumi',d.sumi],['haru',d.haru],['followup',d.followup]]){
      const row=manifest.find(r=>r.id===`connected-${scene.id}-${i}-${speaker}`);
      assert.equal(row?.text,text);assert.equal(row?.voice,speaker==='haru'?'ja-JP-KeitaNeural':'ja-JP-NanamiNeural');
    }
    for(const c of q.choices){
      assert(!ids.has(c.id));ids.add(c.id);assert(c.japanese&&c.romaji&&c.explanation);
      const row=manifest.find(r=>r.id===`choice-${c.id}`)||old.find(r=>r.id===`choice-${c.id}`);
      assert.equal(row?.text,c.japanese,`Choice script mismatch: ${c.id}`);
      assert.equal(row.voice,'ja-JP-NanamiNeural');
      const file=path.join(out,row.file||row.id+'.mp3');assert(fs.statSync(file).size>1000);
      review.push(`${c.correct?'Accepted':'Repair required'}: ${c.japanese}`,c.romaji,`Why: ${c.explanation}`,'');
    }
    review.push(`Sumi after accepted/repaired reply: ${d.followup}`,d.followupRomaji,'');
    const wrong={sceneId:scene.id,questionIndex:i,correct:false,points:0};
    const first=recordRelayFirstAttempt([],wrong),repair=recordRelayFirstAttempt(first,{...wrong,correct:true,points:3});
    assert.strictEqual(repair,first);assert.equal(repair.length,1);assert.equal(repair[0].points,0);
    assert(!relayCanContinue(wrong));assert(relayCanContinue({correct:true}));assert(!relayCanContinue(null));
  }
}
assert.equal(manifest.length,80);
if(process.argv.includes('--write-review'))fs.writeFileSync(path.join(root,'DIALOGUE_RELAY_INSTRUCTOR_REVIEW.md'),review.join('\n')+'\n');
console.log('PASS: 10 scenes, 25 connected turns, 50 choices, 80 verified new audio entries; first-attempt and repair guards.');
