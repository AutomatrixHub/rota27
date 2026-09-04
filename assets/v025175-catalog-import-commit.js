/* Rota 27 v0.25.175 — commit durável para importação de cardápio */
(function(){
  'use strict';
  const VERSION='0.25.175';
  const snapshot=()=>JSON.stringify({
    catalog:Array.isArray(state?.catalog)?state.catalog:[],
    categories:Array.isArray(state?.categories)?state.categories:[],
    categoryStatus:state?.categoryStatus&&typeof state.categoryStatus==='object'?state.categoryStatus:{}
  });

  function install(){
    const original=window.v14ApplyCatalogImport;
    if(typeof original!=='function'||original.__v025175CatalogCommit)return false;
    const wrapped=function(){
      const before=snapshot();
      const result=original.apply(this,arguments);
      if(before===snapshot())return result;
      try{
        /* A função da sincronização grava diretamente a base local e só então
         * coloca os eventos de produto/categoria na outbox do aparelho. */
        const committed=window.v15CommitCoreMutation?.('catalog-import')===true;
        if(!committed&&window.Rota27V02581TestMode?.isActive?.()!==true){
          console.warn('[Rota27 v0.25.175] Importação alterou a tela, mas o commit protegido não estava disponível.');
        }
      }catch(error){console.error('[Rota27 v0.25.175] Falha ao confirmar importação:',error);}
      return result;
    };
    wrapped.__v025175CatalogCommit=true;
    wrapped.__v025175Base=original;
    window.v14ApplyCatalogImport=wrapped;
    return true;
  }

  function start(){
    /* Aguarda a inicialização do v0.15, responsável pela outbox de sync. */
    setTimeout(()=>{
      if(!install())console.warn('[Rota27 v0.25.175] Ação de importação não encontrada para integrar.');
      window.Rota27V025175CatalogImportCommit={version:VERSION,install};
    },0);
    console.info('[Rota27] v0.25.175 — commit durável de importação carregado.');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
