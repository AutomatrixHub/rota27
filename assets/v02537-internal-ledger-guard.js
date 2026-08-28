/* Rota 27 v0.25.37 — isolamento do ledger interno do fechamento de turno */
(function(){
  'use strict';
  const VERSION='0.25.37';
  const SYNC_KEY='rota27_sync_config_v1';
  const INTERNAL_DATE='0000-00-00';
  let baseFinalize=null;
  const clone=v=>JSON.parse(JSON.stringify(v==null?null:v));
  const isInternal=c=>c?.internalConsumption===true||c?.nonRevenue===true||String(c?.paymentMethod||'')==='Consumo interno';
  function readConfig(){try{const c=JSON.parse(localStorage.getItem(SYNC_KEY)||'{}');return c&&typeof c==='object'?c:{};}catch{return {};}}
  function writeConfig(c){try{localStorage.setItem(SYNC_KEY,JSON.stringify(c));return true;}catch{return false;}}
  function harden(id){
    let record=null;
    try{record=(state?.history||[]).find(c=>String(c?.id||'')===String(id)&&isInternal(c))||null;}catch{}
    if(!record)return false;
    const opened=Number(record.internalOpenedAt||record.createdAt||record.openedAt||0);
    record.internalOpenedAt=opened;
    record.internalClosedAt=Number(record.internalClosedAt||record.operationalClosedAt||Date.now());
    record.operationalClosedAt=record.internalClosedAt;
    record.internalBusinessDate=String(record.internalBusinessDate||'');
    record.businessDate=INTERNAL_DATE;
    record.closedAt=0;
    record.createdAt=0;
    record.openedAt=0;
    record.updatedAt=0;
    record.paymentConfirmedAt=null;
    record.paymentMethod='Consumo interno';
    record.internalConsumption=true;
    record.nonRevenue=true;
    try{if(typeof save==='function')save();}catch{}

    const cfg=readConfig();
    if(Array.isArray(cfg.outbox)){
      let changed=false;
      cfg.outbox=cfg.outbox.map(evt=>{
        const type=String(evt?.eventType||evt?.event_type||''),entity=String(evt?.entityId||evt?.entity_id||'');
        if((type==='command_closed'||type==='history_upsert')&&entity===String(id)){
          changed=true;
          return {...evt,payload:{...(evt.payload||{}),command:clone(record)},appVersion:VERSION};
        }
        return evt;
      });
      if(changed)writeConfig(cfg);
    }
    return true;
  }
  function patch(){
    if(baseFinalize||typeof window.finalizeCommand!=='function')return;
    baseFinalize=window.finalizeCommand;
    window.finalizeCommand=function(){
      let id='',internal=false;
      try{const c=(state?.commands||[]).find(x=>String(x?.id||'')===String(activeCommandId||''));id=String(c?.id||'');internal=isInternal(c);}catch{}
      const result=baseFinalize.apply(this,arguments);
      if(internal&&id)harden(id);
      return result;
    };
    try{finalizeCommand=window.finalizeCommand;}catch{}
  }
  function reconcile(){
    try{(state?.history||[]).filter(isInternal).forEach(c=>harden(c.id));}catch{}
  }
  function start(){patch();setTimeout(patch,500);setTimeout(reconcile,800);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){patch();setTimeout(reconcile,120);}});window.Rota27V02537InternalLedgerGuard={version:VERSION,reconcile};console.info('[Rota27] v0.25.37 — isolamento de ledger interno carregado.');}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
