/* Rota 27 v0.25.8 — identidade operacional; replay histórico hibernado */
(function(){
  'use strict';
  const VERSION='0.25.8';

  function updateIdentity(){
    document.title='Rota 27 Bodega • Comandas v0.25.8';
    const meta=document.querySelector('meta[name="rota27-release-version"]');
    if(meta)meta.content=VERSION;
    let style=document.getElementById('v0258ReleaseIdentity');
    if(!style){
      style=document.createElement('style');
      style.id='v0258ReleaseIdentity';
      style.textContent='#v14VersionBadge::after{content:"v0.25.8"!important}';
      document.head.appendChild(style);
    }
  }

  function updateHelpIdentity(){
    const overlay=document.getElementById('r27HelpOverlay');
    const footer=overlay?.querySelector('.r27-help-footer span');
    if(footer)footer.textContent='Ajuda v5.9 • Rota 27 v0.25.8';
  }

  function removeReplayUi(){
    document.getElementById('v0257ReplayCard')?.remove();
    document.getElementById('v0257ReplayCss')?.remove();
    document.getElementById('v0257ReplayJs')?.remove();
  }

  function handleClick(e){
    if(e.target.closest?.('#r27HelpBtn,[data-help]'))setTimeout(updateHelpIdentity,120);
  }

  function start(){
    updateIdentity();
    updateHelpIdentity();
    removeReplayUi();
    document.addEventListener('click',handleClick);
    document.addEventListener('visibilitychange',()=>{
      if(document.visibilityState==='visible'){
        updateIdentity();
        updateHelpIdentity();
        removeReplayUi();
      }
    });
    window.Rota27V0258={version:VERSION,updateIdentity,updateHelpIdentity,removeReplayUi,replayHibernated:true};
    console.info('[Rota27] v0.25.8 — replay histórico hibernado; cópia fixa contínua preservada.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
