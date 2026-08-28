/* Rota 27 v0.25.37 — isolamento do ledger interno do fechamento de turno */
(function(){
  'use strict';
  const VERSION='0.25.37';
  const INTERNAL_DATE='0000-00-00';
  let baseFinalize=null;
  const isInternal=c=>c?.internalConsumption===true||c?.nonRevenue===true||String(c?.paymentMethod||'')==='Consumo interno';

  function hardenRecord(id){
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
    return true;
  }

  function patch(){
    if(baseFinalize||typeof window.finalizeCommand!=='function')return;
    baseFinalize=window.finalizeCommand;
    window.finalizeCommand=function(){
      let id='',internal=false;
      try{
        const c=(state?.commands||[]).find(x=>String(x?.id||'')===String(activeCommandId||''));
        id=String(c?.id||'');internal=isInternal(c);
      }catch{}
      if(!internal||!id)return baseFinalize.apply(this,arguments);

      const previousWindowSave=window.save;
      let previousSave=null;
      try{previousSave=typeof save==='function'?save:null;}catch{}
      const targetSave=typeof previousWindowSave==='function'?previousWindowSave:previousSave;
      const guardedSave=function(){
        hardenRecord(id);
        if(typeof targetSave==='function')return targetSave.apply(this,arguments);
      };

      try{window.save=guardedSave;}catch{}
      try{save=guardedSave;}catch{}
      try{
        return baseFinalize.apply(this,arguments);
      }finally{
        try{window.save=previousWindowSave;}catch{}
        try{if(previousSave)save=previousSave;}catch{}
        hardenRecord(id);
      }
    };
    try{finalizeCommand=window.finalizeCommand;}catch{}
  }

  function reconcile(){
    let changed=false;
    try{(state?.history||[]).filter(isInternal).forEach(c=>{if(hardenRecord(c.id))changed=true;});}catch{}
    if(changed){try{if(typeof save==='function')save();}catch{}}
  }

  function start(){
    patch();setTimeout(patch,500);setTimeout(reconcile,800);
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){patch();setTimeout(reconcile,120);}});
    window.Rota27V02537InternalLedgerGuard={version:VERSION,reconcile};
    console.info('[Rota27] v0.25.37 — isolamento de ledger interno carregado.');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
