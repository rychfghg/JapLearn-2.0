// Copies, never removes, the authored media into the backend deployment.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const front = path.resolve(__dirname, '..');
const destination = path.resolve(front, '../../JapLearn-BackEnd/Backend/src/main/resources/expression-media-seed');
const bank = JSON.parse(fs.readFileSync(path.join(front, 'data/expressionMatchMedia.json'), 'utf8'));
const audioSource = fs.readFileSync(path.join(front, 'services/expressionMatchAudio.ts'), 'utf8');
const audio = Object.fromEntries([...audioSource.matchAll(/"([^"]+)":require\('([^']+)'\)/g)].map(m => [m[1], path.resolve(front, 'services', m[2])]));
const imagesSource = fs.readFileSync(path.join(front, 'services/expressionMatchImages.ts'), 'utf8');
const images = Object.fromEntries([...imagesSource.matchAll(/'([^']+)':\{scene:require\('([^']+)'\),alternative:require\('([^']+)'\)\}/g)].map(m => [m[1], {scene:path.resolve(front,'services',m[2]),alternative:path.resolve(front,'services',m[3])}]));
const copies = new Map();
const manifest = bank.map(row => {
  const pair = images[row.key];
  if (!pair || !audio[row.japanese]) throw new Error(`Missing authored media: ${row.key}`);
  const result = {...row};
  for (const [field, source] of Object.entries({...pair, audio: audio[row.japanese]})) {
    if (!fs.existsSync(source)) throw new Error(`Missing file: ${source}`);
    const bytes = fs.readFileSync(source);
    const sha256 = crypto.createHash('sha256').update(bytes).digest('hex');
    const filename = `${sha256}${path.extname(source)}`;
    copies.set(filename, source);
    result[field] = filename;
  }
  return result;
});
if (manifest.length !== 60) throw new Error('Expected 60 authored question mappings');
fs.mkdirSync(destination, {recursive:true});
for (const [filename, source] of copies) fs.copyFileSync(source, path.join(destination, filename));
fs.writeFileSync(path.join(destination, 'manifest.json'), JSON.stringify(manifest, null, 2)+'\n');
console.log(`Prepared ${manifest.length} question mappings and ${copies.size} unique media files. Original frontend files preserved.`);
