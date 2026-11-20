const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const bank=require('../content/bank.json'),core=require('../web/core.js'),katex=require('../web/vendor/katex/katex.js');
const root=path.resolve(__dirname,'..');
test('Replacement content is complete and source sections are preserved verbatim',()=>{
 assert.equal(bank.version,2);assert.equal(bank.problems.length,20);assert.equal(bank.courses.length,3);
 assert.equal(bank.problems.reduce((n,p)=>n+p.steps.length,0),192);assert.equal(bank.problems.reduce((n,p)=>n+p.essays.length,0),40);
 assert.equal(new Set(bank.problems.map(p=>p.id)).size,20);
 for(const source of bank.sources){const bytes=fs.readFileSync(path.join(root,'content/imported/docs',source.file));assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),source.sha256);assert.deepEqual(fs.readFileSync(path.join(root,'web/texts',source.file)),bytes);}
 for(const c of bank.courses){const original=fs.readFileSync(path.join(root,'content/imported/docs',c.source),'utf8');for(const p of bank.problems.filter(p=>p.course===c.id)){assert(original.includes(p.bodyMarkdown),p.id+' problem modified');assert(original.includes(p.solutionMarkdown),p.id+' solution modified');assert.equal(p.essays.length,2);assert(p.bodyHtml.length>0);assert(p.solutionHtml.includes('<table>'));}}
});
test('Every blank and choice has exactly one corresponding answer',()=>{
 for(const p of bank.problems){const labels=p.steps.map(s=>s.label),used=[...p.bodyMarkdown.matchAll(/【([ァ-ヺぁ-ゖ])】|\{\s*([ァ-ヺぁ-ゖ])\s*\}/g)].map(m=>m[1]||m[2]);assert.equal(new Set(labels).size,labels.length);assert.deepEqual([...new Set(used)].sort(),[...labels].sort(),p.id);for(const s of p.steps){assert(s.answer&&s.answerHtml);assert.equal(core.check(s.answer,[s.answer]),'match');}}
});
test('All supplied display formulas render with KaTeX',()=>{
 let count=0;
 for(const p of bank.problems)for(const text of [p.bodyMarkdown,p.solutionMarkdown])for(const match of text.matchAll(/```math\n([\s\S]*?)```/g)){katex.renderToString(match[1],{displayMode:true,throwOnError:true,strict:'ignore'});count++;}
 assert.equal(count,bank.sources.reduce((n,s)=>n+[...fs.readFileSync(path.join(root,'content/imported/docs',s.file),'utf8').matchAll(/```math\n/g)].length,0));console.log(`${count} display formulas validated`);
});
test('Record format separates old and new textbooks and validates imported data',()=>{
 const raw={version:2,dataset:bank.dataset,entries:{MP01:{answers:{ア:'∪ₙ Aₙᶜ'},essays:{1:'<script>test</script>',2:'proof'},revealed:{ア:true},status:'mastered'},M01:{status:'mastered'},UNKNOWN:{status:'review'}},last:'MP01'};
 const state=core.validateState(raw,bank);assert.equal(state.entries.MP01.answers.ア,'∪ₙ Aₙᶜ');assert.equal(state.entries.MP01.essays[2],'proof');assert(!state.entries.M01&&!state.entries.UNKNOWN);assert.deepEqual(core.validateState(JSON.parse(JSON.stringify(state)),bank),state);
 assert.throws(()=>core.validateState({version:1,entries:{}},bank));assert.throws(()=>core.validateState({...raw,dataset:'other'},bank));
});
test('Numeric and selection comparison is conservative',()=>{
 assert.equal(core.check(' ０．５ ',['1/2']),'match');assert.equal(core.check('2',['②']),'match');assert.equal(core.check('2/4',['1/2']),'match');assert.equal(core.check('',['0']),'empty');assert.equal(core.check('x+x',['2x']),'compare');assert.equal(core.numeric('alert(1)'),null);assert.equal(core.numeric('1/0'),null);
});
test('Published data matches the bank and static resources resolve',()=>{
 const data=fs.readFileSync(path.join(root,'web/data.js'),'utf8');assert.deepEqual(JSON.parse(data.replace(/^window.KEIKO_BANK = /,'').replace(/;\s*$/,'')),bank);
 for(const html of ['index.html','research.html']){const text=fs.readFileSync(path.join(root,'web',html),'utf8');for(const m of text.matchAll(/(?:src|href)="([^"#]+)"/g)){if(/^(https?:|data:)/.test(m[1]))continue;assert(fs.existsSync(path.join(root,'web',m[1].split('#')[0])),m[1]);}}
 for(const file of ['questions.pdf','solutions.pdf','analysis.pdf']){const local=fs.readFileSync(path.join(root,'pdf',file));assert(local.length>10000);assert.deepEqual(fs.readFileSync(path.join(root,'web/pdf',file)),local);}
});
