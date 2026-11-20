'use strict';
const bank=window.KEIKO_BANK, core=window.KeikoCore, KEY='keiko-progress-v1';
const $=s=>document.querySelector(s), esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rich=s=>esc(s).replace(/\[\[(.*?)\]\]/g,'<span class="blank-tag">$1</span>');
const math=s=>'\\('+esc(s)+'\\)';
const empty=()=>({version:1,entries:{},mode:'learn',last:''});
let state=empty(),storageOK=true,reviewOnly=false,noticeTimer;
try{const raw=localStorage.getItem(KEY);if(raw)state=core.validateState(JSON.parse(raw),bank);}catch{storageOK=false;}
function record(p){return state.entries[p.id]??=( {answers:{},hints:{},revealed:{},rubric:{},essay:'',solution:false,status:'',updated:''} );}
function notify(s){$('#notice').textContent=s;$('#notice').classList.add('visible');clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>$('#notice').classList.remove('visible'),4500);}
function askConfirm(message){return new Promise(resolve=>{const dialog=$('#confirm-dialog');$('#confirm-message').textContent=message;dialog.returnValue='cancel';dialog.addEventListener('close',()=>resolve(dialog.returnValue==='confirm'),{once:true});dialog.showModal();});}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch{storageOK=false;notify('この環境では保存できません。記録を書き出して保管してください。');}}
function typeset(el){if(window.renderMathInElement)renderMathInElement(el,{delimiters:[{left:'\\(',right:'\\)',display:false}],throwOnError:false,strict:'ignore',trust:false});}
function current(){return bank.problems.find(p=>p.id===location.hash.slice(1));}
function updateProgress(){const n=bank.problems.filter(p=>state.entries[p.id]?.status==='mastered').length;$('#progress-text').textContent=`${n} / ${bank.problems.length} 自力で解けた`;$('#progress').max=bank.problems.length;$('#progress').value=n;}
function renderNav(){
  const selected=current();
  $('#course-nav').innerHTML=bank.courses.map(c=>{
    const ps=bank.problems.filter(p=>p.course===c.id&&(!reviewOnly||state.entries[p.id]?.status==='review'));
    if(!ps.length)return '';
    return `<div class="nav-group"><h3 class="nav-title">${esc(c.title)}</h3>${ps.map(p=>{const status=state.entries[p.id]?.status;return `<a class="nav-link ${selected?.id===p.id?'active':''}" href="#${p.id}" ${selected?.id===p.id?'aria-current="page"':''}><span>${p.id}</span><span>${esc(p.title)}</span>${status?`<span class="status-dot" aria-label="${({mastered:'自力で解けた',review:'要復習',assisted:'解説で理解'})[status]}">${status==='mastered'?'✓':status==='review'?'↻':'◐'}</span>`:''}</a>`;}).join('')}</div>`;
  }).join('')||'<p class="empty">要復習の問題はまだありません。</p>';
  $('#review-toggle').textContent=reviewOnly?'すべての問題を表示':'要復習だけ表示';updateProgress();
}
function home(){
  const continueP=bank.problems.find(p=>p.id===state.last)||bank.problems[0];
  const symbols={measure:'∫',probability:'P',information:'g',complex:'ℂ',mechanics:'L'};
  $('#main').innerHTML=`${!storageOK?'<p class="save-warning">保存済み記録を読めない、または保存を利用できない環境です。記録を書き出して保管してください。</p>':''}
  <section class="hero"><div class="hero-content"><span class="eyebrow">A SMALL STEP INTO DEEPER UNDERSTANDING</span><h1>式を埋める。<br>つながりが見える。</h1><p>教科書を読む、その一歩先へ。<br>短い誘導をたどりながら、大学数学と物理の基礎を<br>自分の手で組み立てる、小さな演習室。</p><a class="primary" href="#${continueP.id}">${state.last?'続きから取り組む':'最初の問題を解く'} <span aria-hidden="true">/</span> ${continueP.id}</a></div>
  <svg class="hero-art" viewBox="0 0 220 220" aria-hidden="true"><defs><pattern id="dots" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="#a1b5a4"/></pattern></defs><rect width="220" height="220" fill="url(#dots)"/><g fill="none" stroke="#6e957c" stroke-width="1.2"><ellipse cx="115" cy="110" rx="83" ry="36" transform="rotate(-32 115 110)"/><ellipse cx="115" cy="110" rx="83" ry="36" transform="rotate(32 115 110)"/><ellipse cx="115" cy="110" rx="83" ry="36" transform="rotate(90 115 110)"/></g><circle cx="115" cy="110" r="5" fill="#326e50"/></svg></section>
  <div class="summary-strip"><span><strong>5</strong>分野</span><span><strong>17</strong>大問</span><span><strong>15–25</strong>分 / 1回</span></div>
  <div class="section-heading"><h2>${reviewOnly?'もう一度、取り組む':'学びたいところから'}</h2><span>定義 → 小さな計算 → ことばで説明</span></div>
  <section class="course-grid" aria-label="分野一覧">${bank.courses.map(c=>{
    const ps=bank.problems.filter(p=>p.course===c.id&&(!reviewOnly||state.entries[p.id]?.status==='review'));if(!ps.length)return '';
    const first=ps.find(p=>state.entries[p.id]?.status!=='mastered')||ps[0];
    return `<a class="course-card" href="#${first.id}" style="--course-color:${c.color}"><span class="eyebrow">${c.en}</span><span class="course-symbol" aria-hidden="true">${symbols[c.id]}</span><h3>${c.title}</h3><p>${c.subtitle}</p><div class="card-meta"><span>${ps.length} 大問 · 基礎</span><span>${ps.filter(p=>state.entries[p.id]?.status==='mastered').length} / ${ps.length} 自力で解けた</span></div></a>`;
  }).join('')}</section>${reviewOnly&&!bank.problems.some(p=>state.entries[p.id]?.status==='review')?'<p class="empty">「もう一度」を選んだ問題がここに表示されます。</p>':''}
  <section class="howto"><h2>まずは一つ、最後まで。</h2><p>「学習」では定義やヒントを使い、「復習テスト」では自分の力で。空欄を埋めたら、最後の問いをことばや式で説明してみてください。解答との照合後に、自分の理解を記録できます。</p></section>
  <section class="howto"><h2>この教材について</h2><p>京大物理の誘導構成を参考にしたオリジナル問題です。各分野を網羅する教科書ではなく、基礎の入口を短い大問に分けています。<a href="research.html">調査範囲と作問方針を見る</a></p></section>`;
}
function answerBox(s){return `<div class="answer-box"><strong>解答・考え方</strong>${math(s.answer)}<p>${rich(s.explanation)}</p></div>`;}
function problem(p){
  const r=record(p),c=bank.courses.find(c=>c.id===p.course),exam=state.mode==='exam',index=bank.problems.indexOf(p);
  state.last=p.id;save();
  $('#main').innerHTML=`<div class="breadcrumb"><span><a href="#">学びの地図</a> / ${c.title}</span><div class="mode-switch" aria-label="学習モード"><button data-mode="learn" aria-pressed="${!exam}">学習</button><button data-mode="exam" aria-pressed="${exam}">復習テスト</button></div></div>
  <header class="problem-head"><span class="pill">${p.id} · 基礎 / 目安 ${p.minutes}分</span><h1>${p.title}</h1><p>${p.goal}</p></header>
  <div class="prereq">前提：${esc(c.prerequisite)}${p.requires.length?' · 関連 '+p.requires.map(id=>`<a href="#${id}">${id}</a>`).join('、'):''}</div>
  ${exam?'<p class="exam-note">復習テスト：定義・ヒント・解答を隠しています。本文だけで難しい場合は「学習」に戻れます。入力は自動保存されます。</p>':`<details class="recall" open><summary>使う道具を確認する</summary><p>${rich(p.recall)}</p></details>`}
  <section class="paper"><h2>誘導をたどる</h2><div class="setup">${rich(p.setup)}</div>${p.steps.map(s=>`<section class="step" id="step-${s.label}"><p>${rich(s.text)}</p><div class="answer-row"><label for="answer-${s.label}">${s.label} の解答</label><input id="answer-${s.label}" data-answer="${s.label}" maxlength="1000" value="${esc(r.answers[s.label]||'')}" placeholder="数値・式・語句" autocomplete="off" spellcheck="false">${exam?'':`<button class="secondary" data-check="${s.label}">照合</button><button class="quiet" data-hint="${s.label}">ヒント</button><button class="quiet" data-reveal="${s.label}">解答を見る</button>`}</div><p id="feedback-${s.label}" class="feedback" role="status"></p><div id="hint-${s.label}">${!exam&&r.hints[s.label]?`<div class="hint-box">${rich(s.hint)}</div>`:''}</div><div id="solution-${s.label}">${!exam&&r.revealed[s.label]?answerBox(s):''}</div></section>`).join('')}
  ${exam?'':'<p class="end-note">照合は登録表記・数値の確認です。同値な式が一致しない場合は解答と比べてください。</p>'}</section>
  <section class="essay"><h2>問：ことば・式で説明する</h2><p>${rich(p.essay)}</p><label class="eyebrow" for="essay-answer">あなたの考え</label><textarea id="essay-answer" maxlength="20000" placeholder="結論だけでなく、その理由も書いてみる。">${esc(r.essay)}</textarea>${exam?'':'<button class="secondary" id="essay-reveal">解答例と採点の観点を見る</button>'}<div id="essay-solution"></div></section>
  ${exam?'<button class="primary reveal-all" id="finish-exam">解答を確認して復習へ</button>':''}
  <section class="assessment"><h2>今回の理解を記録する</h2><p>自動採点ではありません。解答と理由を確認したうえで選んでください。</p><div class="assessment-buttons">${[['mastered','自力で解けた'],['assisted','解説で理解'],['review','もう一度']].map(([v,t])=>`<button class="secondary" data-status="${v}" aria-pressed="${r.status===v}">${t}</button>`).join('')}</div></section>
  <button class="quiet" id="retry">この大問を白紙に戻して解き直す</button>
  <div class="problem-bottom">${index?`<a class="secondary" href="#${bank.problems[index-1].id}">前の大問</a>`:'<a class="secondary" href="#">学びの地図</a>'}${index<bank.problems.length-1?`<a class="primary" href="#${bank.problems[index+1].id}">次の大問 · ${bank.problems[index+1].id}</a>`:'<a class="primary" href="#">学びの地図へ</a>'}</div>`;
  if(!exam&&r.solution)showEssay(p);
  $('#main').querySelectorAll('[data-answer]').forEach(input=>input.addEventListener('input',()=>{r.answers[input.dataset.answer]=input.value;r.updated=new Date().toISOString();save();const fb=$('#feedback-'+input.dataset.answer);if(fb)fb.textContent='';}));
  $('#essay-answer').addEventListener('input',e=>{r.essay=e.target.value;r.updated=new Date().toISOString();save();});
  $('#main').querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{state.mode=b.dataset.mode;save();problem(p);typeset($('#main'));});
  $('#main').querySelectorAll('[data-check]').forEach(b=>b.onclick=()=>{const s=p.steps.find(s=>s.label===b.dataset.check);const result=core.check(r.answers[s.label]||'',s.accepted);$('#feedback-'+s.label).textContent=result==='empty'?'まず解答を入力してください。':result==='match'?'登録解答と一致しました。理由も説明できるか確かめましょう。':'登録表記とは一致しません。同値な式の可能性もあるため、解答を開いて照合してください。';});
  $('#main').querySelectorAll('[data-hint]').forEach(b=>b.onclick=()=>{const s=p.steps.find(s=>s.label===b.dataset.hint);r.hints[s.label]=!r.hints[s.label];$('#hint-'+s.label).innerHTML=r.hints[s.label]?`<div class="hint-box">${rich(s.hint)}</div>`:'';save();typeset($('#hint-'+s.label));});
  $('#main').querySelectorAll('[data-reveal]').forEach(b=>b.onclick=()=>{const s=p.steps.find(s=>s.label===b.dataset.reveal);r.revealed[s.label]=true;$('#solution-'+s.label).innerHTML=answerBox(s);save();typeset($('#solution-'+s.label));});
  if($('#essay-reveal'))$('#essay-reveal').onclick=()=>{r.solution=true;save();showEssay(p);};
  if($('#finish-exam'))$('#finish-exam').onclick=()=>{state.mode='learn';p.steps.forEach(s=>r.revealed[s.label]=true);r.solution=true;save();problem(p);typeset($('#main'));notify('解答を表示しました。記述の採点観点も確認してください。');};
  $('#main').querySelectorAll('[data-status]').forEach(b=>b.onclick=()=>{r.status=b.dataset.status;r.updated=new Date().toISOString();save();$('#main').querySelectorAll('[data-status]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.status===r.status));renderNav();notify('今回の理解を記録しました。');});
  $('#retry').onclick=async()=>{if(await askConfirm('この大問の入力・ヒント履歴・理解記録を消して白紙に戻しますか？')){delete state.entries[p.id];save();render();}};
}
function showEssay(p){const r=record(p);$('#essay-solution').innerHTML=`<div class="answer-box"><strong>解答例</strong><p>${rich(p.solution)}</p><strong style="margin-top:18px">採点の観点 · 各2点の自己採点</strong><ul class="rubric">${p.rubric.map((x,i)=>`<li><label><input type="checkbox" data-rubric="${i}" ${r.rubric[i]?'checked':''}>${esc(x)}</label></li>`).join('')}</ul><p class="takeaway">${rich(p.takeaway)}</p></div>`;$('#essay-solution').querySelectorAll('input').forEach(input=>input.onchange=()=>{r.rubric[input.dataset.rubric]=input.checked;save();});typeset($('#essay-solution'));}
function render(){renderNav();const p=current();if(p)problem(p);else home();typeset($('#main'));$('#sidebar').classList.remove('open');$('#menu-toggle').setAttribute('aria-expanded','false');}
$('#menu-toggle').onclick=()=>{const open=$('#sidebar').classList.toggle('open');$('#menu-toggle').setAttribute('aria-expanded',open);};
$('.skip').onclick=e=>{e.preventDefault();$('#main').focus();$('#main').scrollIntoView();};
$('#review-toggle').onclick=()=>{reviewOnly=!reviewOnly;renderNav();if(!current())home();};
$('#export').onclick=()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const a=document.createElement('a');const url=URL.createObjectURL(blob);a.href=url;a.download='keiko-progress-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notify('学習記録を書き出しました。');};
$('#import').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>2000000)throw new Error();const data=core.validateState(JSON.parse(await file.text()),bank);if(await askConfirm('現在の学習記録を、このファイルの記録で置き換えますか？')){state=data;save();render();notify('学習記録を読み込みました。');}}catch{notify('読み込めませんでした。稽古から書き出したJSONファイルを選んでください。');}e.target.value='';};
$('#reset').onclick=async()=>{if(await askConfirm('全大問の学習記録を消去しますか？必要なら先に書き出してください。')){state=empty();save();render();notify('学習記録を消去しました。');}};
window.addEventListener('hashchange',()=>{render();window.scrollTo(0,0);$('#main').focus({preventScroll:true});});
render();
