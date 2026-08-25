/* Rota 27 v0.25.6 — identidade de release */
(function(){
  'use strict';
  const VERSION='0.25.6';

  function updateHelpIdentity(){
    const overlay=document.getElementById('r27HelpOverlay');
    const footer=overlay?.querySelector('.r27-help-footer span');
    if(footer)footer.textContent='Ajuda v5.7 • Rota 27 v0.25.6';
  }

  function handleClick(e){
    if(e.target.closest?.('#r27HelpBtn,[data-help]'))setTimeout(updateHelpIdentity,120);
  }

  function start(){
    updateHelpIdentity();
    document.addEventListener('click',handleClick);
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')updateHelpIdentity();});
    window.Rota27V0256={version:VERSION,updateHelpIdentity};
    console.info('[Rota27] v0.25.6 — Paridade Visual Lista/Mapa carregada.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
