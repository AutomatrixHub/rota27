/* Rota 27 v0.25.12 — fechamento administrativo de comanda A receber de turno anterior */
(function(){
  'use strict';
  const VERSION='0.25.12';
  const RECEIVABLE_STORE='rota27_v02512_receivables_v1';
  const RECEIVABLE_OUTBOX='rota27_v02512_receivable_outbox_v1';
  const TURN_STORE='rota27_v019_turn_closures_v1';
  const TURN_OUTBOX='rota27_v019_turn_outbox_v1';
  const SYNC_CONFIG='rota27_sync_config_v1';
  let baseFinalize=null;

  function read(key,fallback){try{const v=JSON.parse(localStorage.getItem(key)||'null');return v==null?fallback:v;}catch{return fallback;}}
  function write(key,v){localStorage.setItem(key,JSON.stringify(v));}
  function dateKey(ts){const d=new Date(Number(ts||Date.now()));return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
  function today(){return dateKey(Date.now());}
  function notify(msg){try{typeof showToast==='function'?showToast(msg,false):console.info('[Rota27]',msg);}catch{}}
  function recordTotal(c){if(Number.isFinite(Number(c?.total)))return Number(c.total);try{return Number(commandTotal(c)||0);}catch{return Object.entries(c?.items||{}).reduce((s,[id,q])=>s+Number(q||0)*Number(c?.itemMeta?.[id]?.price||0),0);}}
  function cfg(){const c=read(SYNC_CONFIG,{});return c&&typeof c==='object'?c:{};}

  function patchReceivable(commandId,operationalAt,adminAt){
    const rid=`recv_${commandId}`;const rows=read(RECEIVABLE_STORE,[]);const idx=Array.isArray(rows)?rows.findIndex(x=>String(x.id)===rid):-1;if(idx<0)return;
    rows[idx]={...rows[idx],openedAt:operationalAt,operationalDate:dateKey(operationalAt),administrativeClosedAt:adminAt,updatedAt:Math.max(Number(rows[idx].updatedAt||0),adminAt)};write(RECEIVABLE_STORE,rows);
    const c=cfg();const out=read(RECEIVABLE_OUTBOX,[]);const eventId=`receivable_upsert_operational_${commandId}`;
    if(Array.isArray(out)&&!out.some(x=>String(x.eventId)===eventId)){
      const receivable={...rows[idx]};delete receivable.payments;delete receivable.balance;delete receivable.paidAmount;delete receivable.status;
      out.push({eventId,eventType:'receivable_upsert',entityId:rid,payload:{receivable},deviceId:c.deviceId||'local',createdAt:new Date(adminAt).toISOString(),appVersion:VERSION});write(RECEIVABLE_OUTBOX,out);
    }
  }

  function patchHistory(commandId,operationalAt,adminAt){
    const idx=(state.history||[]).findIndex(h=>String(h.id)===String(commandId));if(idx<0)return false;
    state.history[idx]={...state.history[idx],closedAt:operationalAt,businessDate:dateKey(operationalAt),administrativeClosedAt:adminAt};
    try{save();}catch{}return true;
  }

  function openCommandsFor(key){return (state.commands||[]).filter(c=>dateKey(Number(c.updatedAt||c.createdAt||0))===key);}
  function queuePriorTurnClosure(key){
    const existing=read(TURN_STORE,[]);if(Array.isArray(existing)&&existing.some(x=>String(x.businessDate)===key))return false;
    const stillOpen=openCommandsFor(key);if(stillOpen.length){notify(`Ainda existem ${stillOpen.length} comanda(s) aberta(s) do turno de ${key.split('-').reverse().join('/')}.`);return false;}
    let summary=null;try{summary=window.Rota27V019?.buildSummary?.(key);}catch{}if(!summary)return false;
    summary={...summary,openCount:0,openValue:0};const c=cfg(),closedAt=Date.now();
    const closure={id:`turn_${key}`,businessDate:key,closedAt,closedAtIso:new Date(closedAt).toISOString(),timezoneOffsetMinutes:new Date().getTimezoneOffset(),deviceId:c.deviceId||'local',deviceName:c.deviceName||'Aparelho',storeId:c.storeId||'rota27-bodega',appVersion:VERSION,schemaVersion:1,summary};
    const list=Array.isArray(existing)?existing:[];list.push(closure);list.sort((a,b)=>Number(b.closedAt||0)-Number(a.closedAt||0));write(TURN_STORE,list);
    const out=read(TURN_OUTBOX,[]);const evtId=`turn_closed_${key}`;if(Array.isArray(out)&&!out.some(x=>String(x.eventId)===evtId)){out.push({eventId:evtId,eventType:'turn_closed',entityId:closure.id,payload:{closure},deviceId:c.deviceId||'local',createdAt:new Date(closedAt).toISOString(),appVersion:VERSION});write(TURN_OUTBOX,out);}
    try{window.Rota27V019?.syncTurnClosures?.();}catch{}window.dispatchEvent(new CustomEvent('rota27:v019-turn-updated',{detail:{closure}}));notify(`Turno de ${key.split('-').reverse().join('/')} fechado e registrado.`);return true;
  }

  function install(){
    if(baseFinalize||typeof window.finalizeCommand!=='function')return;baseFinalize=window.finalizeCommand;
    const wrapped=function(){
      const due=document.getElementById('v14PaymentMethod')?.value==='A receber';let command=null,activityAt=0;
      if(due){try{command=(state.commands||[]).find(c=>c.id===activeCommandId)||null;activityAt=Math.max(Number(command?.updatedAt||0),Number(command?.createdAt||0));}catch{}}
      const result=baseFinalize.apply(this,arguments);
      if(!due||!command||!activityAt||dateKey(activityAt)===today())return result;
      const adminAt=Date.now(),key=dateKey(activityAt);patchHistory(command.id,activityAt,adminAt);patchReceivable(command.id,activityAt,adminAt);
      setTimeout(()=>{try{window.Rota27V02512?.sync?.();}catch{}},0);
      setTimeout(()=>{
        if(!openCommandsFor(key).length&&window.confirm(`Esta comanda pertence ao turno de ${key.split('-').reverse().join('/')}, que ficou pendente.\n\nRegistrar agora o fechamento desse turno?`))queuePriorTurnClosure(key);
      },180);
      return result;
    };
    try{window.finalizeCommand=wrapped;finalizeCommand=wrapped;}catch{}
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,0),{once:true});else setTimeout(install,0);
})();
