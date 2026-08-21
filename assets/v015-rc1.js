/* Rota 27 v0.15 RC.1 — selo de release candidate sem alterar a lógica validada da DEV.4 */
(function(){
  'use strict';
  const VERSION='0.15-rc.1';
  function apply(){
    const badge=document.getElementById('v14VersionBadge');
    if(badge)badge.textContent='v0.15 RC.1';
    document.title='Rota 27 Bodega • Comandas v0.15 RC.1';
    window.ROTA27_SYNC_DEV_VERSION=VERSION;
    console.info('[Rota27] release candidate carregada (v0.15 RC.1).');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
})();
