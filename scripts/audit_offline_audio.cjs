const fs=require('fs'),path=require('path'),vm=require('vm'),ts=require('typescript');
const root=path.resolve(__dirname,'..');
const cache=new Map();
function load(file,source){
  file=path.resolve(root,file);if(cache.has(file)&&!source)return cache.get(file);
  if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));
  const exports={};cache.set(file,exports);
  const code=ts.transpileModule(source??fs.readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText;
  vm.runInNewContext(code,{exports,require(id){
    if(!id.startsWith('.'))return {};
    let next=path.resolve(path.dirname(file),id);
    if(/\.(png|jpe?g|webp|mp3|wav|ttf|gif)$/.test(next))return next;
    if(!path.extname(next))next+='.ts';
    if(next.endsWith('.js')||!fs.existsSync(next))return {};
    return load(next);
  }},{filename:file});return exports;
}
const scenes=load('app/dialogueRelayContent.ts').RELAY_SCENES;
const relayUsed=new Set(scenes.flatMap(s=>s.questions.flatMap(q=>q.choices.map(c=>'choice-'+c.id))));
const relay=load('app/dialogueRelayAudio.ts').default;
const rushSource=fs.readFileSync(path.join(root,'app/QuackResponseTimed.tsx'),'utf8');
const rush=load('app/QuackResponseTimed.tsx',rushSource.split('type SpriteActorProps')[0]+'\nexport {audioOverrides,nodes};');
const rushUsed=new Set(rush.nodes.filter(n=>n.japanese).map(n=>n.id));
const deadRelay=Object.entries(relay).filter(([key])=>!relayUsed.has(key));
const deadRush=Object.entries(rush.audioOverrides).filter(([key])=>!rushUsed.has(key));
const rushByText=new Map(),rushAliases=[];
for(const node of rush.nodes){
  if(!node.japanese||!rush.audioOverrides[node.id])continue;
  const key=JSON.stringify([node.characterKey,node.japanese]);
  const previous=rushByText.get(key);
  if(previous)rushAliases.push({id:node.id,canonical:previous.id,file:rush.audioOverrides[node.id],canonicalFile:rush.audioOverrides[previous.id],text:node.japanese,character:node.characterKey});
  else rushByText.set(key,node);
}
if(require.main===module)console.log(JSON.stringify({relay:{total:Object.keys(relay).length,neededKeys:relayUsed.size,unusedKeys:deadRelay.length,unusedFiles:new Set(deadRelay.map(x=>x[1])).size,keys:deadRelay.map(x=>x[0])},rush:{total:Object.keys(rush.audioOverrides).length,neededKeys:rushUsed.size,unusedKeys:deadRush.length,unusedFiles:new Set(deadRush.map(x=>x[1])).size,keys:deadRush.map(x=>x[0])}},null,2));
module.exports={load,relayUsed,rushUsed,deadRelay,deadRush,rushAliases};
