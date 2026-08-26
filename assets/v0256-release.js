/* Rota 27 v0.25.15 — identidade operacional, data do turno pela abertura e seleção de cliente */
(function(){
  'use strict';
  const VERSION='0.25.15';

  function updateIdentity(){
    document.title='Rota 27 Bodega • Comandas v0.25.15';
    const meta=document.querySelector('meta[name="rota27-release-version"]');
    if(meta)meta.content=VERSION;
    let style=document.getElementById('v02515ReleaseIdentity');
    if(!style){
      style=document.createElement('style');
      style.id='v02515ReleaseIdentity';
      style.textContent='#v14VersionBadge::after{content:"v0.25.15"!important}';
      document.head.appendChild(style);
    }
  }

  function updateHelpIdentity(){
    const overlay=document.getElementById('r27HelpOverlay');
    const footer=overlay?.querySelector('.r27-help-footer span');
    if(footer)footer.textContent='Ajuda v6.6 • Rota 27 v0.25.15';
  }

  function removeReplayUi(){
    document.getElementById('v0257ReplayCard')?.remove();
    document.getElementById('v0257ReplayCss')?.remove();
    document.getElementById('v0257ReplayJs')?.remove();
  }

  function loadCss(id,href){
    if(document.getElementById(id)||document.querySelector(`link[href*="${href.split('?')[0].split('/').pop()}"]`))return;
    const link=document.createElement('link');link.id=id;link.rel='stylesheet';link.href=href;document.head.appendChild(link);
  }
  function loadReleaseAssets(){
    loadCss('v0259CategoryReferenceCss','./assets/v0259-category-reference.css?v=0259r1');
    loadCss('v02512ReceivablesCss','./assets/v02512-receivables.css?v=02512r1');
    loadCss('v02513ClientPickerCss','./assets/v02513-client-picker.css?v=02513r1');
    const scripts=[
      ['v0259CategoryReferenceJs','./assets/v0259-category-reference.js?v=0259r1'],
      ['v0259ProductionCleanupJs','./assets/v0259-production-cleanup.js?v=0259r1'],
      ['v02510TurnSummaryCurrentNameJs','./assets/v02510-turn-summary-current-name.js?v=02510r1'],
      ['v02511HistoryRankCurrentNameJs','./assets/v02511-history-rank-current-name.js?v=02511r1'],
      ['v02512ReceivablesJs','./assets/v02512-receivables.js?v=02512r1'],
      ['v02512OverdueTurnJs','./assets/v02512-overdue-turn.js?v=02515r1'],
      ['v02512ReceivablesSafetyJs','./assets/v02512-receivables-safety.js?v=02512r1'],
      ['v02513ClientPickerJs','./assets/v02513-client-picker.js?v=02513r1']
    ];
    scripts.forEach(([id,src])=>{
      if(document.getElementById(id))return;
      const script=document.createElement('script');script.id=id;script.src=src;script.async=false;document.body.appendChild(script);
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
    window.Rota27V02515Release={version:VERSION,updateIdentity,updateHelpIdentity,removeReplayUi,loadReleaseAssets,replayHibernated:true};
    console.info('[Rota27] v0.25.15 — data operacional pela abertura e seleção pesquisável de cliente carregadas.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
