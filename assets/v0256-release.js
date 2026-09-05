/* Rota 27 v0.25.46 — Hoje precisa de atenção */
(function(){
  'use strict';
  function removeReplayUi(){document.getElementById('v0257ReplayCard')?.remove();document.getElementById('v0257ReplayCss')?.remove();document.getElementById('v0257ReplayJs')?.remove();}
  function loadCss(id,href){if(document.getElementById(id)||document.querySelector(`link[href*="${href.split('?')[0].split('/').pop()}"]`))return;const link=document.createElement('link');link.id=id;link.rel='stylesheet';link.href=href;document.head.appendChild(link);}
  function loadReleaseAssets(){
    loadCss('v0259CategoryReferenceCss','./assets/v0259-category-reference.css?v=0259r1');
    loadCss('v02512ReceivablesCss','./assets/v02512-receivables.css?v=02512r1');
    loadCss('v02513ClientPickerCss','./assets/v02513-client-picker.css?v=02513r1');
    loadCss('v02519CommandCardsCss','./assets/v02519-command-cards.css?v=02519r1');
    loadCss('v02520BirthdayCampaignCss','./assets/v02520-birthday-campaign.css?v=02520r1');
    loadCss('v02521HistoryUxCss','./assets/v02521-history-ux.css?v=02521r1');
    loadCss('v02522ClosurePolishCss','./assets/v02522-closure-polish.css?v=02523r1');
    loadCss('v02524HistoryFinishCss','./assets/v02524-history-finish.css?v=02524r1');
    loadCss('v02525PanelFinishCss','./assets/v02525-panel-finish.css?v=02525r1');
    loadCss('v02526MenuFinishCss','./assets/v02526-menu-finish.css?v=02526r1');
    loadCss('v02527ProductIconsCss','./assets/v02527-product-icons.css?v=02527r1');
    loadCss('v02528ProductIconsSoftCss','./assets/v02528-product-icons-soft.css?v=02528r1');
    loadCss('v02529MenuCategoryLegibilityCss','./assets/v02529-menu-category-legibility.css?v=02529r1');
    loadCss('v02531ProductIconsPanelCss','./assets/v02531-product-icons-panel.css?v=02531r1');
    loadCss('v02533MenuHeaderPolishCss','./assets/v02533-menu-header-polish.css?v=02533r1');
    loadCss('v02534MenuActionsPolishCss','./assets/v02534-menu-actions-polish.css?v=02534r1');
    loadCss('v02536ReceivablesCardCss','./assets/v02536-receivables-card.css?v=02536r1');
    loadCss('v02537InternalConsumptionCss','./assets/v02537-internal-consumption.css?v=02537r1');
    loadCss('v02538BackupSandboxCss','./assets/v02538-backup-sandbox.css?v=02538r1');
    loadCss('v02540EventsCss','./assets/v02540-events.css?v=02540r1');
    loadCss('v02544ClientCardDetailsCss','./assets/v02544-client-card-details.css?v=02544r1');
    loadCss('v02545CommandListCompactCss','./assets/v02545-command-list-compact.css?v=02545r1');
    loadCss('v02546AttentionPanelCss','./assets/v02546-attention-panel.css?v=02546r1');
    loadCss('v02569MenuCategoryOrderCss','./assets/v02569-menu-category-order.css?v=02569r1');
    const scripts=[
      ['v0259CategoryReferenceJs','./assets/v0259-category-reference.js?v=0259r1'],
      ['v02512ReceivablesJs','./assets/v02512-receivables.js?v=02512r1'],
      ['v02512OverdueTurnJs','./assets/v02512-overdue-turn.js?v=025194r1'],
      ['v02512ReceivablesSafetyJs','./assets/v02512-receivables-safety.js?v=02512r1'],
      ['v02516RepairJs','./assets/v02516-repair.js?v=02516r1'],
      ['v02517ClientBirthdayJs','./assets/v02517-client-birthday.js?v=02517r1'],
      ['v02518ClientBirthdayOnOpenJs','./assets/v02518-client-birthday-on-open.js?v=02518r1'],
      ['v02520BirthdayCampaignJs','./assets/v02520-birthday-campaign.js?v=02520r1'],
      ['v02521HistoryUxJs','./assets/v02521-history-ux.js?v=02521r1'],
      ['v02522R3ClosureRenderJs','./assets/v02522r3-closure-render.js?v=02523r1'],
      ['v02527ProductIconsJs','./assets/v02527-product-icons.js?v=02527r1'],
      ['v02533MenuHeaderPolishJs','./assets/v02533-menu-header-polish.js?v=02533r1'],
      ['v02534MenuActionsPolishJs','./assets/v02534-menu-actions-polish.js?v=02534r1'],
      ['v02535EditCommandBirthdayJs','./assets/v02535-edit-command-birthday.js?v=02535r1'],
      ['v02537InternalConsumptionJs','./assets/v02537-internal-consumption.js?v=02537r1'],
      ['v02537InternalStockBridgeJs','./assets/v02537-internal-stock-bridge.js?v=02537r1'],
      ['v02537InternalSyncGuardJs','./assets/v02537-internal-sync-guard.js?v=02537r1'],
      ['v02537HistoryFinancialGuardJs','./assets/v02537-history-financial-guard.js?v=02537r1'],
      ['v02537InternalLedgerGuardJs','./assets/v02537-internal-ledger-guard.js?v=02537r1'],
      ['v02538BackupSandboxJs','./assets/v02538-backup-sandbox.js?v=025180r1'],
      ['v02540EventsJs','./assets/v02540-events.js?v=02540r1'],
      ['v02543WhatsAppDeliveryStatusJs','./assets/v02543-whatsapp-delivery-status.js?v=02543r1'],
      ['v02544ClientCardDetailsJs','./assets/v02544-client-card-details.js?v=02544r1'],
      ['v02545CommandListCompactJs','./assets/v02545-command-list-compact.js?v=02545r1'],
      ['v02569MenuCategoryOrderJs','./assets/v02569-menu-category-order.js?v=02569r1']
    ];
    scripts.forEach(([id,src])=>{if(document.getElementById(id))return;const script=document.createElement('script');script.id=id;script.src=src;script.async=false;document.body.appendChild(script);});
  }
  function start(){
    removeReplayUi();loadReleaseAssets();
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){removeReplayUi();loadReleaseAssets();}});
    const releaseApi={version:'0.25.46',removeReplayUi,loadReleaseAssets,replayHibernated:true};
    window.Rota27V02546Release=releaseApi;
    console.info('[Rota27] v0.25.46 — Hoje precisa de atenção.');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
