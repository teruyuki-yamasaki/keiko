const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const bank=require('../content/bank.json'),core=require('../web/core.js'),katex=require('../web/vendor/katex/katex.js');
test('All prerequisites exist and form a directed acyclic graph',()=>{
  const ids=bank.problems.map(p=>p.id);assert.equal(new Set(ids).size,ids.length);
  function visit(id,stack=[]){assert(!stack.includes(id),`cycle: ${stack}`);const p=bank.problems.find(p=>p.id===id);assert(p,`unknown ${id}`);for(const dep of p.requires)visit(dep,[...stack,id]);}
  ids.forEach(id=>visit(id));
});
test('All problem and solution math renders with KaTeX',()=>{
  const fields=JSON.stringify(bank);const strings=[];
  function walk(x){if(typeof x==='string')strings.push(x);else if(Array.isArray(x))x.forEach(walk);else if(x&&typeof x==='object')Object.values(x).forEach(walk);}
  walk(bank);let count=0;
  for(const str of strings){for(const match of str.matchAll(/\\\((.*?)\\\)/gs)){katex.renderToString(match[1],{throwOnError:true,strict:'ignore'});count++;}}
  for(const p of bank.problems)for(const s of p.steps)katex.renderToString(s.answer,{throwOnError:true,strict:'ignore'});
  assert(count>200);console.log(`${count} inline formulas + ${bank.problems.reduce((n,p)=>n+p.steps.length,0)} answers validated`);
});
test('Every blank is unique, has a hint, a reason and accepted answer',()=>{
  for(const p of bank.problems){const labels=p.steps.map(s=>s.label);assert.equal(new Set(labels).size,labels.length);assert(p.essay&&p.solution&&p.rubric.length===3);
    for(const s of p.steps){assert(s.text.includes(`[[${s.label}]]`));assert(s.hint&&s.explanation);assert(s.accepted.length);for(const a of s.accepted)assert.equal(core.check(a,s.accepted),'match');}
  }
});
test('Numeric comparison handles fractions without executing text',()=>{
  assert.equal(core.check(' ０．５ ',['1/2']),'match');assert.equal(core.check('2/4',['1/2']),'match');assert.equal(core.check('0',['1/2']),'compare');assert.equal(core.check('',['0']),'empty');assert.equal(core.numeric('1/0'),null);assert.equal(core.numeric('alert(1)'),null);assert.equal(core.numeric('2**5'),null);assert.equal(core.check('theta-theta',['0']),'compare');
});
test('State import preserves answers and only permits known IDs and statuses',()=>{
  const raw={version:1,entries:{M01:{answers:{'ア':'{3,4}'},hints:{'イ':true},essay:'test',status:'mastered',rubric:{0:true}},UNKNOWN:{status:'mastered'}}};
  const state=core.validateState(raw,bank);assert.equal(state.entries.M01.answers['ア'],'{3,4}');assert.equal(state.entries.M01.status,'mastered');assert.equal(state.entries.M01.rubric[0],true);assert(!state.entries.UNKNOWN);assert.equal(state.entries.M01.revealed['ア'],false);
  assert.throws(()=>core.validateState({version:2,entries:{}},bank));
  assert.deepEqual(core.validateState(JSON.parse(JSON.stringify(state)),bank),state);
});
test('Static relative paths resolve and books exist',()=>{
  const root=path.resolve(__dirname,'../web');for(const html of ['index.html','research.html']){const text=fs.readFileSync(path.join(root,html),'utf8');for(const m of text.matchAll(/(?:src|href)="([^"#]+)"/g)){if(/^(https?:|data:)/.test(m[1]))continue;assert(fs.existsSync(path.join(root,m[1].split('#')[0])),m[1]);}}
  for(const file of ['pdf/questions.pdf','pdf/solutions.pdf'])assert(fs.statSync(path.join(root,file)).size>10000);
});
