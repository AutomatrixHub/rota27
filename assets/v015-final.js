/* Rota 27 v0.15 — selo final de produção
 * Esta camada roda por último somente no index.html de produção.
 * O preview RC mantém seus próprios selos para testes.
 * Hotfix de gate: camadas RC legadas ainda executam comportamento funcional,
 * mas não podem mais sobrescrever visualmente a versão final de produção.
 */
(function(){
  'use strict';
  const VERSION='0.15';
  const LABEL='v0.15';
  const TITLE='Rota 27 Bodega • Comandas v0.15';
  let badgeObserver=null;
  let titleObserver=null;

  function applyFinalVersion(){
    const badge=document.getElementById('v14VersionBadge');
    if(badge&&badge.textContent!==LABEL)badge.textContent=LABEL;
    if(document.title!==TITLE)document.title=TITLE;
    try{window.ROTA27_SYNC_DEV_VERSION=VERSION;}catch{}
  }

  function protectFinalVersion(){
    applyFinalVersion();
    const badge=document.getElementById('v14VersionBadge');
    const title=document.querySelector('title');
    if(badge&&!badgeObserver){
      badgeObserver=new MutationObserver(()=>applyFinalVersion());
      badgeObserver.observe(badge,{childList:true,characterData:true,subtree:true});
    }
    if(title&&!titleObserver){
      titleObserver=new MutationObserver(()=>applyFinalVersion());
      titleObserver.observe(title,{childList:true,characterData:true,subtree:true});
    }
  }

  function start(){
    protectFinalVersion();
    window.addEventListener('online',()=>setTimeout(applyFinalVersion,0));
    window.addEventListener('offline',()=>setTimeout(applyFinalVersion,0));
    window.addEventListener('pageshow',()=>setTimeout(applyFinalVersion,0));
    setTimeout(applyFinalVersion,50);
    setTimeout(applyFinalVersion,3500);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
