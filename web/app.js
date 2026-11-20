'use strict';
const bank=window.KEIKO_BANK,core=window.KeikoCore,KEY='keiko-progress-'+bank.dataset;
const $=s=>document.querySelector(s),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const empty=()=>({version:2,dataset:bank.dataset,entries:{},mode:'learn',last:''});
let state=empty(),storageOK=true,reviewOnly=false,noticeTimer;
try{const raw=localStorage.getItem(KEY);if(raw)state=core.validateState(JSON.parse(raw),bank);}catch{storageOK=false;}
function record(p){return state.entries[p.id]??={answers:{},revealed:{},essays:{},solution:false,status:''};}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch{storageOK=false;notify('保存を利用できません。学習記録を書き出して保管してください。');}}
function notify(text){$('#notice').textContent=text;$('#notice').classList.add('visible');clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>$('#notice').classList.remove('visible'),4500);}
function askConfirm(message){return new Promise(resolve=>{const d=$('#confirm-dialog');$('#confirm-message').textContent=message;d.returnValue='cancel';d.addEventListener('close',()=>resolve(d.returnValue==='confirm'),{once:true});d.showModal();});}
function typeset(el){el.querySelectorAll('.math-display:not([data-rendered])').forEach(node=>{if(!window.katex)return;katex.render(node.textContent,node,{displayMode:true,throwOnError:false,strict:'ignore',trust:false});node.dataset.rendered='true';});}
function current(){return bank.problems.find(p=>p.id===location.hash.slice(1));}
function renderNav(){
 const selected=current();
 $('#course-nav').innerHTML=bank.courses.map(c=>{
  const ps=bank.problems.filter(p=>p.course===c.id&&(!reviewOnly||state.entries[p.id]?.status==='review'));
  return ps.length?`<div class="nav-group"><h3 class="nav-title">${esc(c.title)}</h3>${ps.map(p=>`<a class="nav-link ${selected?.id===p.id?'active':''}" href="#${p.id}" ${selected?.id===p.id?'aria-current="page"':''}><span>${p.number}</span><span>${esc(p.title)}</span>${state.entries[p.id]?.status?`<span class="status-dot">${({mastered:'✓',review:'↻',assisted:'◐'})[state.entries[p.id].status]}</span>`:''}</a>`).join('')}</div>`:'';
 }).join('')||'<p class="empty">要復習の問題はまだありません。</p>';
 $('#review-toggle').textContent=reviewOnly?'すべての問題を表示':'要復習だけ表示';
 const count=bank.problems.filter(p=>state.entries[p.id]?.status==='mastered').length;
 $('#progress-text').textContent=`${count} / ${bank.problems.length} 自力で解けた`;$('#progress').max=bank.problems.length;$('#progress').value=count;
}
function home(){
 const next=bank.problems.find(p=>p.id===state.last)||bank.problems[0];
 $('#main').innerHTML=`${!storageOK?'<p class="save-warning">保存済み記録を読み込めない、または保存を利用できない環境です。</p>':''}
 <section class="hero"><span class="eyebrow">KYODAI-STYLE MATHEMATICS TEXTS</span><h1>誘導をたどる。<br>理論を組み立てる。</h1><p>一つの設定から、定義・計算・証明へ。<br>長文の空欄を埋めながら、数学のつながりを確かめる。<br>測度論的確率論・微分幾何学・情報幾何学の演習集。</p><a class="primary" href="#${next.id}">${state.last?'続きから取り組む':'最初の問題を解く'} / ${next.id}</a></section>
 <div class="summary-strip"><span><strong>${bank.courses.length}</strong>分野</span><span><strong>${bank.problems.length}</strong>大問</span><span><strong>30–40</strong>分 / 大問</span></div>
 <div class="section-heading"><h2>${reviewOnly?'もう一度、取り組む':'分野を選ぶ'}</h2><span>長文誘導 → 空欄・選択 → 導出・証明</span></div>
 <section class="course-grid" aria-label="分野一覧">${bank.courses.map(c=>{
  const ps=bank.problems.filter(p=>p.course===c.id&&(!reviewOnly||state.entries[p.id]?.status==='review'));if(!ps.length)return '';
  const first=ps.find(p=>state.entries[p.id]?.status!=='mastered')||ps[0];
  return `<a class="course-card" href="#${first.id}" style="--course-color:${c.color}"><span class="eyebrow">${c.en}</span><h3>${esc(c.title)}</h3><p>${esc(c.subtitle)}</p><div class="card-meta"><span>${ps.length} 大問</span><span>${ps.filter(p=>state.entries[p.id]?.status==='mastered').length} / ${ps.length} 自力で解けた</span></div></a>`;
 }).join('')}</section>
 <section class="howto"><h2>文章の流れを追いながら解く</h2><p>各大問の本文を読み、空欄・選択欄と「問1」「問2」に取り組みます。下の解答欄に入力し、一つずつ答えを確認できます。「解答・解説」には原稿の答案例を全文掲載しています。復習テストでは、終了するまで解答を隠します。</p></section>
 <section class="howto"><h2>冊子と原稿</h2><p><a href="pdf/questions.pdf" target="_blank" rel="noopener">問題冊子</a> · <a href="pdf/solutions.pdf" target="_blank" rel="noopener">解答・解説冊子</a> · <a href="research.html">京大物理の形式分析</a></p><p>旧版とは教材が異なるため、学習記録は別に保存されます。</p></section>`;
}
function answerBox(s){return `<div class="answer-box"><strong>【${esc(s.label)}】の解答</strong><div class="prose">${s.answerHtml}</div>${s.explanation?`<p>${s.explanationHtml}</p>`:''}</div>`;}
function showSolutions(p){$('#full-solution').innerHTML=`<div class="prose solution-text">${p.solutionHtml}</div>`;typeset($('#full-solution'));$('#solution-toggle')?.setAttribute('aria-expanded','true');}
function problem(p){
 const r=record(p),c=bank.courses.find(c=>c.id===p.course),exam=state.mode==='exam',index=bank.problems.indexOf(p);
 state.last=p.id;save();
 $('#main').innerHTML=`<div class="breadcrumb"><span><a href="#">学びの地図</a> / ${esc(c.title)}</span><div class="mode-switch" aria-label="学習モード"><button data-mode="learn" aria-pressed="${!exam}">学習</button><button data-mode="exam" aria-pressed="${exam}">復習テスト</button></div></div>
 <header class="problem-head"><span class="pill">${p.id} · 問題${p.number} / 目安 ${p.minutes}分</span><h1>${esc(p.title)}</h1><p>${p.steps.length} 空欄・選択欄 / ${p.essays.length} 記述問題</p></header>
 <details class="recall"><summary>この分野の使い方・前提・共通の記号</summary><div class="prose">${c.introduction}</div></details>
 ${exam?'<p class="exam-note">復習テスト：解答は終了後に表示します。入力は自動保存されます。</p>':''}
 <nav class="reading-nav" aria-label="大問内の移動"><button data-jump="question-body">問題本文</button><button data-jump="answer-fields">解答欄</button><button data-jump="written-fields">記述欄</button><button data-jump="solutions">解答・解説</button></nav>
 <section class="paper prose" id="question-body" tabindex="-1"><h2>問題本文</h2>${p.bodyHtml}</section>
 <section class="paper" id="answer-fields" tabindex="-1"><h2>空欄・選択欄の解答</h2><p class="end-note">本文で同じ記号が繰り返される箇所には、同じ解答が入ります。選択欄には①〜③、または1〜3を入力してください。</p>${p.steps.map(s=>`<section class="step" id="step-${s.label}"><div class="answer-row"><label for="answer-${s.label}">【${s.label}】</label><input id="answer-${s.label}" data-answer="${s.label}" value="${esc(r.answers[s.label]||'')}" maxlength="2000" autocomplete="off" placeholder="式・語句・数値・選択番号">${exam?'':`<button class="secondary" data-check="${s.label}">照合</button><button class="quiet" data-reveal="${s.label}" aria-expanded="${!!r.revealed[s.label]}">解答を見る</button>`}<button class="quiet" data-find="${s.label}">本文の位置へ</button></div><p id="feedback-${s.label}" class="feedback" role="status"></p><div id="solution-${s.label}">${!exam&&r.revealed[s.label]?answerBox(s):''}</div></section>`).join('')}${exam?'':'<p class="end-note">照合は登録表記・数値の比較です。同値な式や別解の正否は、解説を読んで確認してください。</p>'}</section>
 <section class="essay" id="written-fields" tabindex="-1"><h2>記述の解答</h2>${p.essays.map(n=>`<label for="essay-${n}">問${n} · あなたの答案</label><textarea id="essay-${n}" data-essay="${n}" maxlength="20000" placeholder="導出・証明・計算の筋道を記入">${esc(r.essays[n]||'')}</textarea>`).join('')}</section>
 <section class="paper" id="solutions" tabindex="-1"><h2>解答・解説</h2>${exam?'<button class="primary" id="finish-exam">テストを終えて解答を見る</button>':`<button class="secondary" id="solution-toggle" aria-expanded="${r.solution}">解答・解説を${r.solution?'閉じる':'全文表示'}</button>`}<div id="full-solution"></div></section>
 <section class="assessment"><h2>今回の理解を記録する</h2><p>解説と照合してから、自分の理解を選んでください。</p><div class="assessment-buttons">${[['mastered','自力で解けた'],['assisted','解説で理解'],['review','もう一度']].map(([v,t])=>`<button class="secondary" data-status="${v}" aria-pressed="${r.status===v}">${t}</button>`).join('')}</div></section>
 <button class="quiet" id="retry">この大問を白紙に戻して解き直す</button><div class="problem-bottom">${index?`<a class="secondary" href="#${bank.problems[index-1].id}">前の大問</a>`:'<a class="secondary" href="#">学びの地図</a>'}${index<bank.problems.length-1?`<a class="primary" href="#${bank.problems[index+1].id}">次の大問 / ${bank.problems[index+1].id}</a>`:'<a class="primary" href="#">学びの地図へ</a>'}</div>`;
 typeset($('#main'));
 // Turn the supplied blank markers into links without splitting the narrative.
 const walker=document.createTreeWalker($('#question-body'),NodeFilter.SHOW_TEXT);const nodes=[];
 while(walker.nextNode()){const node=walker.currentNode;if(!node.parentElement.closest('.math-display')&&/【[ァ-ヺぁ-ゖ]】|\{\s*[ァ-ヺぁ-ゖ]\s*\}/.test(node.textContent))nodes.push(node);}
 for(const node of nodes){const parts=node.textContent.split(/(【[ァ-ヺぁ-ゖ]】|\{\s*[ァ-ヺぁ-ゖ]\s*\})/g),frag=document.createDocumentFragment();for(const part of parts){const label=part.match(/^【([ァ-ヺぁ-ゖ])】$|^\{\s*([ァ-ヺぁ-ゖ])\s*\}$/);if(label){const button=document.createElement('button');button.className='inline-blank';button.textContent=part;button.dataset.blank=label[1]||label[2];button.setAttribute('aria-label',`${button.dataset.blank} の解答欄へ`);frag.append(button);}else frag.append(document.createTextNode(part));}node.replaceWith(frag);}
 $('#main').querySelectorAll('[data-blank]').forEach(b=>b.onclick=()=>{const input=$('#answer-'+b.dataset.blank);input.focus({preventScroll:true});input.scrollIntoView({block:'center',behavior:'smooth'});});
 $('#main').querySelectorAll('[data-jump]').forEach(b=>b.onclick=()=>{const target=$('#'+b.dataset.jump);target.focus({preventScroll:true});target.scrollIntoView({block:'start'});});
 $('#main').querySelectorAll('[data-find]').forEach(b=>b.onclick=()=>{const marker=$('#question-body').querySelector(`[data-blank="${b.dataset.find}"]`)||Array.from($('#question-body').querySelectorAll('.math-display')).find(el=>el.textContent.includes(`【${b.dataset.find}】`));(marker||$('#question-body')).scrollIntoView({block:'center'});if(marker?.focus)marker.focus({preventScroll:true});});
 $('#main').querySelectorAll('[data-answer]').forEach(input=>input.addEventListener('input',()=>{r.answers[input.dataset.answer]=input.value;save();$('#feedback-'+input.dataset.answer).textContent='';}));
 $('#main').querySelectorAll('[data-essay]').forEach(input=>input.addEventListener('input',()=>{r.essays[input.dataset.essay]=input.value;save();}));
 $('#main').querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{state.mode=b.dataset.mode;save();problem(p);});
 $('#main').querySelectorAll('[data-check]').forEach(b=>b.onclick=()=>{const s=p.steps.find(s=>s.label===b.dataset.check);const el=document.createElement('div');el.innerHTML=s.answerHtml;const result=core.check(r.answers[s.label]||'',[el.textContent]);$('#feedback-'+s.label).textContent=result==='empty'?'まず解答を入力してください。':result==='match'?'登録解答と一致しました。理由も確かめましょう。':'登録表記とは一致しません。同値な式や別解の可能性があります。解答を開いて比べてください。';});
 $('#main').querySelectorAll('[data-reveal]').forEach(b=>b.onclick=()=>{const s=p.steps.find(s=>s.label===b.dataset.reveal);r.revealed[s.label]=!r.revealed[s.label];$('#solution-'+s.label).innerHTML=r.revealed[s.label]?answerBox(s):'';b.setAttribute('aria-expanded',r.revealed[s.label]);save();});
 if(!exam&&r.solution)showSolutions(p);
 if($('#solution-toggle'))$('#solution-toggle').onclick=()=>{r.solution=!r.solution;save();if(r.solution)showSolutions(p);else $('#full-solution').innerHTML='';$('#solution-toggle').textContent=r.solution?'解答・解説を閉じる':'解答・解説を全文表示';$('#solution-toggle').setAttribute('aria-expanded',r.solution);};
 if($('#finish-exam'))$('#finish-exam').onclick=()=>{state.mode='learn';r.solution=true;p.steps.forEach(s=>r.revealed[s.label]=true);save();problem(p);$('#solutions').scrollIntoView();};
 $('#main').querySelectorAll('[data-status]').forEach(b=>b.onclick=()=>{r.status=b.dataset.status;save();$('#main').querySelectorAll('[data-status]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.status===r.status));renderNav();notify('今回の理解を記録しました。');});
 $('#retry').onclick=async()=>{if(await askConfirm('この大問の入力・理解記録を消して白紙に戻しますか？')){delete state.entries[p.id];save();render();}};
}
function render(){renderNav();const p=current();if(p)problem(p);else home();$('#sidebar').classList.remove('open');$('#menu-toggle').setAttribute('aria-expanded','false');}
$('#menu-toggle').onclick=()=>{const open=$('#sidebar').classList.toggle('open');$('#menu-toggle').setAttribute('aria-expanded',open);};
$('.skip').onclick=e=>{e.preventDefault();$('#main').focus();$('#main').scrollIntoView();};
$('#review-toggle').onclick=()=>{reviewOnly=!reviewOnly;renderNav();if(!current())home();};
$('#export').onclick=()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download='keiko-texts-progress-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notify('学習記録を書き出しました。');};
$('#import').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>3000000)throw new Error();const data=core.validateState(JSON.parse(await file.text()),bank);if(await askConfirm('現在の教材の学習記録を、このファイルで置き換えますか？')){state=data;save();render();notify('学習記録を読み込みました。');}}catch{notify('読み込めませんでした。現在の教材から書き出したJSONを選んでください。旧版の記録は読み込めません。');}e.target.value='';};
$('#reset').onclick=async()=>{if(await askConfirm('現在の教材の全学習記録を消去しますか？旧版の記録には影響しません。')){state=empty();save();render();notify('現在の教材の記録を消去しました。');}};
window.addEventListener('hashchange',()=>{render();window.scrollTo(0,0);$('#main').focus({preventScroll:true});});
render();
