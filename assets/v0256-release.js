/* Rota 27 v0.25.11 — identidade operacional e rankings por produto atual */
(function(){
  'use strict';
  const VERSION='0.25.11';

  function updateIdentity(){
    document.title='Rota 27 Bodega • Comandas v0.25.11';
    const meta=document.querySelector('meta[name="rota27-release-version"]');
    if(meta)meta.content=VERSION;
    let style=document.getElementById('v02511ReleaseIdentity');
    if(!style){
      style=document.createElement('style');
      style.id='v02511ReleaseIdentity';
      style.textContent='#v14VersionBadge::after{content:"v0.25.11"!important}';
      document.head.appendChild(style);
    }
  }

  function updateHelpIdentity(){
    const overlay=document.getElementById('r27HelpOverlay');
    const footer=overlay?.querySelector('.r27-help-footer span');
    if(footer)footer.textContent='Ajuda v6.2 • Rota 27 v0.25.11';
  }

  function removeReplayUi(){
    document.getElementById('v0257ReplayCard')?.remove();
    document.getElementById('v0257ReplayCss')?.remove();
    document.getElementById('v0257ReplayJs')?.remove();
  }

  function loadReleaseAssets(){
    if(!document.getElementById('v0259CategoryReferenceCss')){
      const link=document.createElement('link');
      link.id='v0259CategoryReferenceCss';link.rel='stylesheet';link.href='./assets/v0259-category-reference.css?v=0259r1';
      document.head.appendChild(link);
    }
    const scripts=[
      ['v0259CategoryReferenceJs','./assets/v0259-category-reference.js?v=0259r1'],
      ['v0259ProductionCleanupJs','./assets/v0259-production-cleanup.js?v=0259r1'],
      ['v02510TurnSummaryCurrentNameJs','./assets/v02510-turn-summary-current-name.js?v=02510r1'],
      ['v02511HistoryRankCurrentNameJs','./assets/v02511-history-rank-current-name.js?v=02511r1']
    ];
    scripts.forEach(([id,src])=>{
      if(document.getElementById(id))return;
      const script=document.createElement('script');script.id=id;script.src=src;script.defer=true;document.body.appendChild(script);
    });
  }

  function handleClick(e){
    if(e.target.closest?.('#r27HelpBtn,[data-help]'))setTimeout(updateHelpIdentity,120);
  }

  function start(){
    updateIdentity();
    updateHelpIdentity();
    removeReplayUi();
    loadReleaseAssets();
    document.addEventListener('click',handleClick);
    document.addEventListener('visibilitychange',()=>{
      if(document.visibilityState==='visible'){
        updateIdentity();
        updateHelpIdentity();
        removeReplayUi();
        loadReleaseAssets();
      }
    });
    window.Rota27V02511Release={version:VERSION,updateIdentity,updateHelpIdentity,removeReplayUi,loadReleaseAssets,replayHibernated:true};
    console.info('[Rota27] v0.25.11 — rankings por ID com nome atual e valores históricos.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
