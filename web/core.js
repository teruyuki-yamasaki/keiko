(function(root){
  const normalize = value => String(value).normalize('NFKC').trim().toLowerCase().replace(/[\s　]/g,'').replace(/−/g,'-').replace(/θ/g,'theta').replace(/π/g,'pi').replace(/ℓ/g,'ell');
  function numeric(value) {
    const s=normalize(value);
    if (/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s)) return Number(s);
    const m=s.match(/^([+-]?\d+)\/([+-]?\d+)$/);
    return m && Number(m[2])!==0 ? Number(m[1])/Number(m[2]) : null;
  }
  function check(value,accepted){
    if(!normalize(value))return 'empty';
    if(accepted.some(x=>normalize(x)===normalize(value)))return 'match';
    const n=numeric(value);
    if(n!==null && accepted.some(x=>{const a=numeric(x);return a!==null&&Math.abs(a-n)<1e-10;}))return 'match';
    return 'compare';
  }
  function validateState(raw,bank){
    if(!raw||typeof raw!=='object'||raw.version!==1||typeof raw.entries!=='object'||!raw.entries)throw new Error('Unsupported record');
    const entries={};
    for(const p of bank.problems){
      const r=raw.entries[p.id];if(!r||typeof r!=='object')continue;
      const answers={},hints={},revealed={},rubric={};
      for(const s of p.steps){answers[s.label]=typeof r.answers?.[s.label]==='string'?r.answers[s.label].slice(0,1000):'';hints[s.label]=r.hints?.[s.label]===true;revealed[s.label]=r.revealed?.[s.label]===true;}
      for(let i=0;i<p.rubric.length;i++)rubric[i]=r.rubric?.[i]===true;
      entries[p.id]={answers,hints,revealed,rubric,essay:typeof r.essay==='string'?r.essay.slice(0,20000):'',solution:r.solution===true,status:['mastered','review','assisted'].includes(r.status)?r.status:'',updated:typeof r.updated==='string'?r.updated.slice(0,30):''};
    }
    return {version:1,entries,mode:raw.mode==='exam'?'exam':'learn',last:bank.problems.some(p=>p.id===raw.last)?raw.last:''};
  }
  const api={normalize,numeric,check,validateState};root.KeikoCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
