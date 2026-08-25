/* Rota 27 v0.25.3 — identidade de release e Ajuda */
(function(){
  'use strict';
  const VERSION='0.25.3';

  function updateHelpIdentity(){
    const overlay=document.getElementById('r27HelpOverlay');
    const footer=overlay?.querySelector('.r27-help-footer span');
    if(footer)footer.textContent='Ajuda v5.4 • Rota 27 v0.25.3';
  }

  function handleClick(e){
    if(e.target.closest?.('#r27HelpBtn,[data-help]'))setTimeout(updateHelpIdentity,140);
  }

  function start(){
    updateHelpIdentity();
    document.addEventListener('click',handleClick);
    document.addEventListener('visibilitychange',()=>{
      if(document.visibilityState==='visible')updateHelpIdentity();
    });
    window.Rota27V0253={version:VERSION,updateHelpIdentity};
    console.info('[Rota27] v0.25.3 consistência visual do Mapa carregada.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
