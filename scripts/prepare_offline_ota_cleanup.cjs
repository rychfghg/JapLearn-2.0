// Mechanical, reversible cleanup. No remote assets or asset exclusions.
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const {load,relayUsed}=require('./audit_offline_audio.cjs');
const root=path.resolve(__dirname,'..');
const archive=path.resolve(root,'../../ARCHIVED_UNUSED_ASSETS/2026-10-18-offline-ota');
const apply=process.argv.includes('--apply');
if(apply&&fs.existsSync(path.join(archive,'archive-manifest.json')))throw Error('Cleanup already applied. Keep the existing archive/receipt; do not overwrite recovery data.');
const changes=new Map(),removed=new Set(),aliases=[];
const fileKey=p=>p.replaceAll('\\','/');
const read=p=>changes.get(fileKey(p))??fs.readFileSync(path.join(root,p),'utf8');
const write=(p,s)=>changes.set(fileKey(p),s);
const entries=[];
function bank(file,manifest,keep=()=>true){
  const records=JSON.parse(fs.readFileSync(path.join(root,manifest),'utf8'));
  const map=load(file).default;
  let source=read(file);
  for(const [id,asset]of Object.entries(map)){
    if(!keep(id)){
      source=source.split('\n').filter(line=>!line.includes(`'${id}':`)).join('\n');removed.add(asset);continue;
    }
    const record=records.find(r=>r.id===id);
    if(record)entries.push({file,id,asset,text:record.text,voice:record.voice});
  }
  write(file,source);
}
bank('app/dialogueRelayAudio.ts','assets/audio/dialogue-relay/manifest.json',id=>relayUsed.has(id));
bank('app/replyCoachAudio.ts','assets/audio/reply-coach/manifest.json',id=>! /^(reaction-|merge-)/.test(id));
const coachManifest='assets/audio/reply-coach/manifest.json';
write(coachManifest,JSON.stringify(JSON.parse(read(coachManifest)).filter(r=>! /^(reaction-|merge-)/.test(r.id)),null,2)+'\n');
const rushSource=read('app/QuackResponseTimed.tsx');
const rush=load('app/QuackResponseTimed.tsx',rushSource.split('type SpriteActorProps')[0]+'\nexport {audioOverrides,nodes};');
for(const n of rush.nodes)if(n.japanese&&rush.audioOverrides[n.id])entries.push({file:'app/QuackResponseTimed.tsx',id:n.id,asset:rush.audioOverrides[n.id],text:n.japanese,voice:n.characterKey==='HARU'?'ja-JP-KeitaNeural':'ja-JP-NanamiNeural'});
const expressionAudio=load('services/expressionMatchAudio.ts').default;
for(const row of JSON.parse(fs.readFileSync(path.join(root,'assets/audio/expression-match/manifest.json'),'utf8')))
  entries.push({file:'services/expressionMatchAudio.ts',id:row.text,asset:expressionAudio[row.text],text:row.text,voice:row.voice});
// Share only exactly equal Japanese text AND the same established character voice.
const canonical=new Map();
for(const item of entries){
  const key=JSON.stringify([item.text.trim(),item.voice]);
  const previous=canonical.get(key);
  if(!previous){canonical.set(key,item);continue;}
  if(item.asset===previous.asset)continue;
  const from='../'+path.relative(root,item.asset).replaceAll('\\','/');
  const to='../'+path.relative(root,previous.asset).replaceAll('\\','/');
  const escaped=item.id.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const pattern=new RegExp(`((?:['"]${escaped}['"]|${escaped})\\s*:\\s*require\\(['"])${from.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}(['"]\\))`);
  const source=read(item.file);const updated=source.replace(pattern,(_,a,b)=>a+to+b);
  if(updated===source)throw Error('Cannot locate audio mapping '+item.id);
  write(item.file,updated);removed.add(item.asset);aliases.push({id:item.id,canonical:previous.id,text:item.text,voice:item.voice});
}
function sourceFiles(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{
  if(e.isDirectory())return ['node_modules','.git','scripts','docs'].includes(e.name)||e.name.startsWith('dist')||e.name.startsWith('.expo')?[]:sourceFiles(path.join(dir,e.name));
  return /\.(tsx?|jsx?)$/.test(e.name)?[path.join(dir,e.name)]:[];
});}
const iconFamilies=new Set();
for(const file of sourceFiles(root)){
  const relative=path.relative(root,file);const source=read(relative);
  const updated=source.replace(/import\s*\{([^}]+)\}\s*from\s*(['"])@expo\/vector-icons\2\s*;?/g,(_,names)=>names.split(',').map(n=>{
    const [family,alias]=n.trim().split(/\s+as\s+/);if(!/^\w+$/.test(family))throw Error('Unexpected icon import');
    iconFamilies.add(family);return `import ${alias||family} from '@expo/vector-icons/${family}';`;
  }).join('\n'));
  if(updated!==source)write(relative,updated);
}
// Do not move a candidate if another runtime source still requires it.
const referenced=new Set();
for(const file of sourceFiles(root)){
  const source=read(path.relative(root,file));
  for(const m of source.matchAll(/require\(['"]([^'"]+)['"]\)/g))referenced.add(path.resolve(path.dirname(file),m[1]));
}
const movable=[...removed].filter(file=>!referenced.has(path.resolve(file)));
for(const file of movable)if(!path.resolve(file).startsWith(path.join(root,'assets')+path.sep))throw Error('Archive source outside assets');
if(!archive.startsWith(path.resolve(root,'../..')+path.sep)||archive.startsWith(root+path.sep))throw Error('Invalid archive target');
console.log(JSON.stringify({apply,changedSources:changes.size,archive,archiveCandidates:movable.length,aliases:aliases.length,iconFamilies:[...iconFamilies]},null,2));
if(apply){
  fs.mkdirSync(archive,{recursive:true});
  for(const [file,source]of changes){
    const original=path.join(root,file),backup=path.join(archive,'source-before-cleanup',file);
    fs.mkdirSync(path.dirname(backup),{recursive:true});if(!fs.existsSync(backup))fs.copyFileSync(original,backup);
    fs.writeFileSync(original,source);
  }
  const moved=[];
  for(const file of movable){
    const relative=path.relative(root,file),destination=path.join(archive,relative);
    if(fs.existsSync(destination))throw Error('Archive collision: '+relative);
    const hash=crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
    fs.mkdirSync(path.dirname(destination),{recursive:true});fs.renameSync(file,destination);moved.push({relative,sha256:hash});
  }
  fs.writeFileSync(path.join(archive,'archive-manifest.json'),JSON.stringify({moved,aliases,iconFamilies:[...iconFamilies]},null,2)+'\n');
  console.log('Archived obsolete recordings with checksums; all current game pictures and dialogue retained offline.');
}
