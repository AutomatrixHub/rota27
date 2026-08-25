/* Rota 27 v0.25.7 — identidade operacional e replay de histórico */
(function(){
  'use strict';
  const VERSION='0.25.7';

  function updateIdentity(){
    document.title='Rota 27 Bodega • Comandas v0.25.7';
    const meta=document.querySelector('meta[name="rota27-release-version"]');
    if(meta)meta.content=VERSION;
    let style=document.getElementById('v0257ReleaseIdentity');
    if(!style){style=document.createElement('style');style.id='v0257ReleaseIdentity';style.textContent='#v14VersionBadge::after{content:"v0.25.7"!important}';document.head.appendChild(style);}
  }

  function updateHelpIdentity(){
    const overlay=document.getElementById('r27HelpOverlay');
    const footer=overlay?.querySelector('.r27-help-footer span');
    if(footer)footer.textContent='Ajuda v5.8 • Rota 27 v0.25.7';
  }

  function loadReplayAssets(){
    if(!document.getElementById('v0257ReplayCss')){
      const link=document.createElement('link');link.id='v0257ReplayCss';link.rel='stylesheet';link.href='./assets/v0257-history-replay.css?v=0257r1';document.head.appendChild(link);
    }
    if(!document.getElementById('v0257ReplayJs')){
      const script=document.createElement('script');script.id='v0257ReplayJs';script.src='./assets/v0257-history-replay.js?v=0257r1';script.defer=true;document.body.appendChild(script);
    }
  }

  function handleClick(e){if(e.target.closest?.('#r27HelpBtn,[data-help]'))setTimeout(updateHelpIdentity,120);}

  function start(){
    updateIdentity();
    updateHelpIdentity();
    loadReplayAssets();
    document.addEventListener('click',handleClick);
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){updateIdentity();updateHelpIdentity();loadReplayAssets();}});
    window.Rota27V0257={version:VERSION,updateIdentity,updateHelpIdentity,loadReplayAssets};
    console.info('[Rota27] v0.25.7 — replay de histórico disponível.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
