/* Rota 27 v0.25.194 — compatibilidade A receber com data operacional pela abertura */
(function(){
  'use strict';
  const VERSION='0.25.194';
  const RECEIVABLE_STORE='rota27_v02512_receivables_v1';
  const RECEIVABLE_OUTBOX='rota27_v02512_receivable_outbox_v1';
  const SYNC_CONFIG='rota27_sync_config_v1';
  let baseFinalize=null;
  function read(key,fallback){try{const v=JSON.parse(localStorage.getItem(key)||'null');return v==null?fallback:v;}catch{return fallback;}}
  function write(key,v){localStorage.setItem(key,JSON.stringify(v));}
  function clone(v){return JSON.parse(JSON.stringify(v==null?null:v));}
  function dateKey(ts){const d=new Date(Number(ts||Date.now()));return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
  function label(key){return String(key||'').split('-').reverse().join('/');}
  function notify(msg){try{typeof showToast==='function'?showToast(msg,false):console.info('[Rota27]',msg);}catch{}}
  function cfg(){const c=read(SYNC_CONFIG,{});return c&&typeof c==='object'?c:{};}
  function patchReceivable(commandId,businessDate,adminAt){
    const rid=`recv_${commandId}`,rows=read(RECEIVABLE_STORE,[]),idx=Array.isArray(rows)?rows.findIndex(x=>String(x.id)===rid):-1;if(idx<0)return;
    rows[idx]={...rows[idx],businessDate,operationalDate:businessDate,administrativeClosedAt:adminAt,updatedAt:Math.max(Number(rows[idx].updatedAt||0),adminAt)};write(RECEIVABLE_STORE,rows);
    const c=cfg(),out=read(RECEIVABLE_OUTBOX,[]),eventId=`receivable_upsert_businessdate_${commandId}`;
    if(Array.isArray(out)&&!out.some(x=>String(x.eventId)===eventId)){
      const receivable={...rows[idx]};delete receivable.payments;delete receivable.balance;delete receivable.paidAmount;delete receivable.status;
      out.push({eventId,eventType:'receivable_upsert',entityId:rid,payload:{receivable},deviceId:c.deviceId||'local',createdAt:new Date(adminAt).toISOString(),appVersion:VERSION});write(RECEIVABLE_OUTBOX,out);
    }
  }
  function queueHistoryCorrection(commandId,historyRecord,adminAt){
    if(!historyRecord)return;const c=cfg(),out=Array.isArray(c.outbox)?c.outbox:[],eventId=`history_upsert_businessdate_${commandId}`;
    if(!out.some(x=>String(x.eventId)===eventId)){
      out.push({eventId,eventType:'history_upsert',entityId:String(commandId),payload:{command:clone(historyRecord)},deviceId:c.deviceId||'local',createdAt:new Date(adminAt).toISOString(),appVersion:VERSION});
      // A outbox principal não possui limite destrutivo. O v015-sync faz apenas
      // compactação idempotente e remove eventos somente depois de confirmação do servidor.
      c.outbox=out;write(SYNC_CONFIG,c);
    }
    setTimeout(()=>{try{window.v15SyncNow?.();}catch{}},0);
  }
  function patchHistory(commandId,businessDate,adminAt){
    const idx=(state.history||[]).findIndex(h=>String(h.id)===String(commandId));if(idx<0)return null;
    state.history[idx]={...state.history[idx],businessDate,operationalDate:businessDate,administrativeClosedAt:adminAt};try{save();}catch{}
    const corrected=clone(state.history[idx]);queueHistoryCorrection(commandId,corrected,adminAt);return corrected;
  }
  function install(){
    if(baseFinalize||typeof window.finalizeCommand!=='function')return;baseFinalize=window.finalizeCommand;
    const wrapped=function(){
      const due=document.getElementById('v14PaymentMethod')?.value==='A receber';let command=null,opened=0;
      if(due){try{command=(state.commands||[]).find(c=>c.id===activeCommandId)||null;opened=Number(command?.createdAt||command?.openedAt||0);}catch{}}
      const result=baseFinalize.apply(this,arguments);if(!due||!command||!opened)return result;
      const adminAt=Date.now(),businessDate=dateKey(opened);patchHistory(command.id,businessDate,adminAt);patchReceivable(command.id,businessDate,adminAt);
      setTimeout(()=>{try{window.Rota27V02512?.sync?.();}catch{}},0);
      if(businessDate!==dateKey(adminAt))setTimeout(()=>notify(`Comanda mantida no turno operacional de ${label(businessDate)} pela data de abertura.`),120);
      return result;
    };
    try{window.finalizeCommand=wrapped;finalizeCommand=wrapped;}catch{}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,0),{once:true});else setTimeout(install,0);
})();
