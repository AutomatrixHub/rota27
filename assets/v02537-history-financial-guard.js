/* Rota 27 v0.25.37 — isolamento do consumo interno no histórico financeiro */
(function(){
  'use strict';
  const VERSION='0.25.37';
  let baseRenderHistory=null,baseExportSales=null;
  const isInternal=c=>c?.internalConsumption===true||c?.nonRevenue===true||String(c?.paymentMethod||'')==='Consumo interno';
  function withSalesHistory(fn,ctx,args){
    if(typeof fn!=='function')return;
    const original=Array.isArray(state?.history)?state.history:null;
    if(!original)return fn.apply(ctx,args||[]);
    state.history=original.filter(c=>!isInternal(c));
    try{return fn.apply(ctx,args||[]);}finally{state.history=original;}
  }
  function patch(){
    if(!baseRenderHistory&&typeof window.renderHistory==='function'){
      baseRenderHistory=window.renderHistory;
      window.renderHistory=function(){const r=withSalesHistory(baseRenderHistory,this,arguments);setTimeout(()=>window.Rota27V02537InternalConsumption?.renderHistory?.(),0);return r;};
      try{renderHistory=window.renderHistory;}catch{}
    }
    if(!baseExportSales&&typeof window.v14ExportSalesCsv==='function'){
      baseExportSales=window.v14ExportSalesCsv;
      window.v14ExportSalesCsv=function(){return withSalesHistory(baseExportSales,this,arguments);};
      try{v14ExportSalesCsv=window.v14ExportSalesCsv;}catch{}
    }
  }
  function start(){patch();setTimeout(patch,500);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')patch();});window.Rota27V02537HistoryFinancialGuard={version:VERSION};}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
