/* Rota 27 v0.25.22 — refinamento dos Fechamentos, Histórico Ontem e baseline operacional */
(function(){
  'use strict';
  const VERSION='0.25.22';
  function updateIdentity(){
    document.title='Rota 27 Bodega • Comandas v0.25.22';
    const meta=document.querySelector('meta[name="rota27-release-version"]');if(meta)meta.content=VERSION;
    let style=document.getElementById('v02522ReleaseIdentity');
    if(!style){style=document.createElement('style');style.id='v02522ReleaseIdentity';style.textContent='#v14VersionBadge::after{content:"v0.25.22"!important}';document.head.appendChild(style);}
  }
  function updateHelpIdentity(){const overlay=document.getElementById('r27HelpOverlay');const footer=overlay?.querySelector('.r27-help-footer span');if(footer)footer.textContent='Ajuda v7.0 • Rota 27 v0.25.22';}
  function removeReplayUi(){document.getElementById('v0257ReplayCard')?.remove();document.getElementById('v0257ReplayCss')?.remove();document.getElementById('v0257ReplayJs')?.remove();}
  function loadCss(id,href){if(document.getElementById(id)||document.querySelector(`link[href*="${href.split('?')[0].split('/').pop()}"]`))return;const link=document.createElement('link');link.id=id;link.rel='stylesheet';link.href=href;document.head.appendChild(link);}
  function loadReleaseAssets(){
    loadCss('v0259CategoryReferenceCss','./assets/v0259-category-reference.css?v=0259r1');
    loadCss('v02512ReceivablesCss','./assets/v02512-receivables.css?v=02512r1');
    loadCss('v02513ClientPickerCss','./assets/v02513-client-picker.css?v=02513r1');
    loadCss('v02519CommandCardsCss','./assets/v02519-command-cards.css?v=02519r1');
    loadCss('v02520BirthdayCampaignCss','./assets/v02520-birthday-campaign.css?v=02520r1');
    loadCss('v02521HistoryUxCss','./assets/v02521-history-ux.css?v=02521r1');
    loadCss('v02522ClosurePolishCss','./assets/v02522-closure-polish.css?v=02522r1');
    const scripts=[
      ['v0259CategoryReferenceJs','./assets/v0259-category-reference.js?v=0259r1'],
      ['v0259ProductionCleanupJs','./assets/v0259-production-cleanup.js?v=0259r1'],
      ['v02510TurnSummaryCurrentNameJs','./assets/v02510-turn-summary-current-name.js?v=02510r1'],
      ['v02511HistoryRankCurrentNameJs','./assets/v02511-history-rank-current-name.js?v=02511r1'],
      ['v02512ReceivablesJs','./assets/v02512-receivables.js?v=02512r1'],
      ['v02512OverdueTurnJs','./assets/v02512-overdue-turn.js?v=02516r1'],
      ['v02512ReceivablesSafetyJs','./assets/v02512-receivables-safety.js?v=02512r1'],
      ['v02513ClientPickerJs','./assets/v02513-client-picker.js?v=02513r1'],
      ['v02516RepairJs','./assets/v02516-repair.js?v=02516r1'],
      ['v02517ClientBirthdayJs','./assets/v02517-client-birthday.js?v=02517r1'],
      ['v02518ClientBirthdayOnOpenJs','./assets/v02518-client-birthday-on-open.js?v=02518r1'],
      ['v02520BirthdayCampaignJs','./assets/v02520-birthday-campaign.js?v=02520r1'],
      ['v02521HistoryUxJs','./assets/v02521-history-ux.js?v=02521r1'],
      ['v02521HistorySearchBridgeJs','./assets/v02521-history-search-bridge.js?v=02521r1'],
      ['v02522ClosurePolishJs','./assets/v02522-closure-polish.js?v=02522r1']
    ];
    scripts.forEach(([id,src])=>{if(document.getElementById(id))return;const script=document.createElement('script');script.id=id;script.src=src;script.async=false;document.body.appendChild(script);});
  }
  function handleClick(e){if(e.target.closest?.('#r27HelpBtn,[data-help]'))setTimeout(updateHelpIdentity,120);}
  function start(){
    updateIdentity();updateHelpIdentity();removeReplayUi();loadReleaseAssets();document.addEventListener('click',handleClick);
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){updateIdentity();updateHelpIdentity();removeReplayUi();loadReleaseAssets();}});
    const api={version:VERSION,updateIdentity,updateHelpIdentity,removeReplayUi,loadReleaseAssets,replayHibernated:true};
    window.Rota27V02522Release=api;window.Rota27V02521Release=api;window.Rota27V02520Release=api;window.Rota27V02519Release=api;window.Rota27V02518Release=api;window.Rota27V02517Release=api;window.Rota27V02516Release=api;window.Rota27V02515Release=api;
    console.info('[Rota27] v0.25.22 — refinamento dos Fechamentos e Histórico Ontem carregados.');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
