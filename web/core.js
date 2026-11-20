(function(root){
  const normalize = value => String(value).normalize('NFKC').trim().toLowerCase().replace(/[\s　]/g,'').replace(/−/g,'-');
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
    if(!raw||raw.version!==2||raw.dataset!==bank.dataset||!raw.entries||typeof raw.entries!=='object'||Array.isArray(raw.entries))throw new Error('Different textbook or invalid record');
    const entries={};
    for(const p of bank.problems){
      const r=Object.hasOwn(raw.entries,p.id)?raw.entries[p.id]:null;if(!r||typeof r!=='object')continue;
      const answers={},revealed={},essays={};
      for(const s of p.steps){answers[s.label]=typeof r.answers?.[s.label]==='string'?r.answers[s.label].slice(0,2000):'';revealed[s.label]=r.revealed?.[s.label]===true;}
      for(const n of p.essays)essays[n]=typeof r.essays?.[n]==='string'?r.essays[n].slice(0,20000):'';
      entries[p.id]={answers,revealed,essays,solution:r.solution===true,status:['mastered','review','assisted'].includes(r.status)?r.status:''};
    }
    return {version:2,dataset:bank.dataset,entries,mode:raw.mode==='exam'?'exam':'learn',last:bank.problems.some(p=>p.id===raw.last)?raw.last:''};
  }
  const api={normalize,numeric,check,validateState};root.KeikoCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
