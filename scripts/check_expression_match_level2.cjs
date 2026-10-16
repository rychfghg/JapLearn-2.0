require('./check_expression_match.cjs');
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),crypto=require('crypto');
const root=path.resolve(__dirname,'..'),folder=path.join(root,'assets/quacksituate/expression-scenes-level2-v1');
const bank=JSON.parse(fs.readFileSync(path.join(root,'data/expressionMatchMedia.json'),'utf8')).filter(r=>r.level===2);
const manifest=JSON.parse(fs.readFileSync(path.join(folder,'manifest.json'),'utf8'));
const mapping=fs.readFileSync(path.join(root,'services/expressionMatchImages.ts'),'utf8');
assert.equal(bank.length,20);assert.equal(manifest.length,40);
assert.equal(new Set(manifest.map(r=>r.key+':'+r.side)).size,40);
assert.equal(new Set(manifest.map(r=>r.sha256)).size,40,'Each target must have a distinct illustration');
for(const question of bank)for(const side of ['scene','alternative']){
 const row=manifest.find(r=>r.key===question.key&&r.side===side);assert(row);
 assert.equal(row.scene,question[side==='scene'?'scenario':'secondaryScenario']);
 const file=fs.readFileSync(path.join(folder,row.file));assert(file.length>1000);
 assert.equal(crypto.createHash('sha256').update(file).digest('hex'),row.sha256);
 assert(mapping.includes(`expression-scenes-level2-v1/${row.file}`));
}
console.log('PASS: 40 distinct Level 2 illustrations, both targets for all 20 scenario pairs, exact scene mappings and checksums; Level 1 media and all 60 voice clips remain valid.');
