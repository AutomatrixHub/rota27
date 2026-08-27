/* Rota 27 v0.25.22 — refinamento dos cards de Fechamentos */
(function(){
  'use strict';
  const VERSION='0.25.22';
  const META_KEY='rota27_v019_turn_meta_v1';
  let timer=null;

  const byId=id=>document.getElementById(id);
  function readJson(key,fallback){try{const v=JSON.parse(localStorage.getItem(key)||'null');return v==null?fallback:v;}catch{return fallback;}}
  function closures(){
    try{
      const rows=window.Rota27V019?.getClosures?.();
      if(Array.isArray(rows))return rows.slice().sort((a,b)=>Number(b?.closedAt||0)-Number(a?.closedAt||0));
    }catch{}
    const rows=readJson('rota27_v019_turn_closures_v1',[]);
    return (Array.isArray(rows)?rows:[]).slice().sort((a,b)=>Number(b?.closedAt||0)-Number(a?.closedAt||0));
  }
  function shortDateTime(ts){
    const d=new Date(Number(ts||0));if(Number.isNaN(d.getTime()))return '—';
    return `${d.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'})} ${d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}`;
  }
  function fullDateTime(ts){
    const d=new Date(Number(ts||0));if(Number.isNaN(d.getTime()))return '—';
    return `${d.toLocaleDateString('pt-BR')} ${d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}`;
  }

  function renameMetric(mini,label){const small=mini?.querySelector('small');if(small)small.textContent=label;}
  function polishRow(row,closure){
    const minis=[...row.querySelectorAll('.v019-history-mini')];
    if(minis.length>=6){
      renameMetric(minis[0],'Faturamento');
      renameMetric(minis[1],'Comandas fechadas');
      renameMetric(minis[2],'Comandas canceladas');
      renameMetric(minis[3],'Ticket médio');
      renameMetric(minis[4],'Itens vendidos');
      renameMetric(minis[5],'Formas de pagamento');
    }
    const headTime=row.querySelector('.v019-history-row-head span');
    if(headTime&&closure?.closedAt)headTime.textContent=`Fechado: ${shortDateTime(closure.closedAt)}`;
    const meta=row.querySelector('.v019-history-meta');
    if(meta&&closure)meta.textContent=`Data operacional pela abertura • fechado em ${String(closure.deviceName||'Aparelho')}`;
  }

  function polishSyncStatus(){
    const gate=byId('v019HistoryStatus');if(!gate||!gate.classList.contains('ok'))return;
    const meta=readJson(META_KEY,{}),last=Number(meta?.lastSyncAt||0);
    gate.textContent=last?`Sincronizado • ${fullDateTime(last)}`:'Fechamentos sincronizados neste aparelho.';
  }

  function apply(){
    const wrap=byId('v019HistoryWrap');if(!wrap)return;
    const rows=[...wrap.querySelectorAll('.v019-history-row')],data=closures();
    rows.forEach((row,i)=>polishRow(row,data[i]||null));
    polishSyncStatus();
  }
  function schedule(delay=0){clearTimeout(timer);timer=setTimeout(apply,delay);}
  function scheduleBurst(){schedule(0);setTimeout(apply,90);setTimeout(apply,260);}

  function start(){
    scheduleBurst();
    document.addEventListener('click',e=>{
      if(e.target.closest?.('#v019ViewAll,#v019HistoryWrap button'))scheduleBurst();
    });
    window.addEventListener('online',()=>setTimeout(apply,220));
    window.addEventListener('rota27:v019-turn-updated',()=>setTimeout(apply,120));
    window.addEventListener('rota27:v017-domain-updated',()=>setTimeout(apply,160));
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')setTimeout(apply,180);});
    window.Rota27V02522ClosurePolish={version:VERSION,apply};
    console.info('[Rota27] v0.25.22 — refinamento dos Fechamentos carregado.');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
