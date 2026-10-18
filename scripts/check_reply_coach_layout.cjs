const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname, '..');
const exportsObject = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root, 'services/replyCoachLayout.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
}).outputText, { exports: exportsObject });
let cases = 0;
for (const width of [280, 320, 360, 412, 680, 820]) {
  for (const height of [240, 340, 480, 620, 780]) {
    for (const long of [false, true]) {
      const choices = Array.from({ length: 4 }, () => ({
        japanese: long ? '降りる人を先に通します。'.repeat(3) : 'こんにちは！',
        romaji: long ? 'Oriru hito o saki ni tooshimasu. '.repeat(3) : 'Konnichiwa!'
      }));
      const result = exportsObject.replyCoachLayout(width, height, choices);
      assert(result.panelHeight > 0 && result.panelHeight <= height * (height < 400 ? .72 : .62));
      assert(Number.isFinite(result.panelHeight));
      cases++;
    }
  }
}
const screen = fs.readFileSync(path.join(root, 'app/QuackResponseGuided.tsx'), 'utf8');
const choiceSection = screen.slice(screen.indexOf(") : currentNode.type === 'CHOICE' ? ("), screen.indexOf(") : currentNode.type === 'ENDING' ? ("));
assert(choiceSection.indexOf('Show a hint for this reply') > choiceSection.indexOf('styles.decisionPanel'));
assert(choiceSection.includes('contentContainerStyle={coachUI.choiceContent}'));
assert(choiceSection.includes('{choice.romaji}'));
assert(choiceSection.includes('choiceOrder.map((choice, index)'));
assert(!screen.includes('setChoicePage'));
assert(!choiceSection.includes('coachChoicePager'));
for (const file of ['app/QuackResponseGuided.tsx', 'services/replyCoachLayout.ts']) {
  const result = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
    fileName: file, reportDiagnostics: true,
    compilerOptions: { jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2020 }
  });
  assert.equal((result.diagnostics || []).filter(d => d.category === ts.DiagnosticCategory.Error).length, 0);
}
console.log(`PASS: ${cases} Reply Coach layout cases; Hint placement, Romaji, scroll fallback and syntax.`);
