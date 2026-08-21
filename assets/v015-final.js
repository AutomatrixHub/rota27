/* Rota 27 v0.15 — selo final de produção
 * Esta camada roda por último somente no index.html de produção.
 * O preview RC mantém seus próprios selos para testes.
 */
(function(){
  'use strict';
  const VERSION='0.15';

  function applyFinalVersion(){
    const badge=document.getElementById('v14VersionBadge');
    if(badge)badge.textContent='v0.15';
    document.title='Rota 27 Bodega • Comandas v0.15';
    window.ROTA27_SYNC_DEV_VERSION=VERSION;
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',()=>setTimeout(applyFinalVersion,0),{once:true});
  }else{
    setTimeout(applyFinalVersion,0);
  }

  window.addEventListener('pageshow',()=>setTimeout(applyFinalVersion,0));
})();
