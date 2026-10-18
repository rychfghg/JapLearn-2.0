const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {load}=require('./audit_offline_audio.cjs');
const root=path.resolve(__dirname,'..');
const relay=load('app/dialogueRelayAudio.ts').default;
const connected=load('app/relayConversationAudio.ts').default;
const scenes=load('app/dialogueRelayContent.ts').RELAY_SCENES;
for(const scene of scenes)for(const [i,q]of scene.questions.entries()){
  for(const speaker of ['sumi','haru','followup'])assert(fs.existsSync(connected[`connected-${scene.id}-${i}-${speaker}`]));
  for(const choice of q.choices)assert(fs.existsSync(relay[`choice-${choice.id}`]));
}
const coach=load('app/replyCoachAudio.ts').default;
const variants=load('app/replyCoachVoiceVariants.ts').default;
for(const line of Object.values(coach))assert(fs.existsSync(line));
for(const line of variants)assert(fs.existsSync(line.asset));
const imageBank=load('services/expressionMatchImages.ts').default;
const expressionAudio=load('services/expressionMatchAudio.ts').default;
const media=JSON.parse(fs.readFileSync(path.join(root,'data/expressionMatchMedia.json'),'utf8'));
assert.equal(media.length,60);
for(const row of media){assert(fs.existsSync(imageBank[row.key].scene));assert(fs.existsSync(imageBank[row.key].alternative));assert(fs.existsSync(expressionAudio[row.japanese]));}
const rushSource=fs.readFileSync(path.join(root,'app/QuackResponseTimed.tsx'),'utf8');
const rush=load('app/QuackResponseTimed.tsx',rushSource.split('type SpriteActorProps')[0]+'\nexport {audioOverrides,nodes};');
const practice=load('services/replyRushPracticeAudio.ts').default;
for(const node of rush.nodes)if(node.japanese)assert(fs.existsSync(practice[node.id]??rush.audioOverrides[node.id]),node.id);
const metadata=JSON.parse(fs.readFileSync(path.join(root,'dist-offline-cleanup-check/metadata.json'),'utf8'));
assert(metadata.fileMetadata.android.assets.length+1<=1000,'OTA asset count exceeds server limit');
console.log(`PASS: 120 offline Expression Match pictures, 60 phrase entries, all Relay/Coach/Rush speech assets, ${metadata.fileMetadata.android.assets.length+1} OTA bundle+assets.`);
