/* Rota 27 — carregador incremental do roadmap pós-v0.25.46 */
(function(){
  'use strict';
  const CURRENT='0.25.186';
  const HELP='11.0';
  const assets=[
    {type:'js',id:'v025186SyncPaginationGuardJs',src:'./assets/v025186-sync-pagination-guard.js?v=025186r1'},
    {type:'js',id:'v025184DurableDomainOutboxJs',src:'./assets/v025184-durable-domain-outbox.js?v=025185r1'},
    {type:'js',id:'v025175CatalogImportCommitJs',src:'./assets/v025175-catalog-import-commit.js?v=025175r1'},
    {type:'js',id:'v025174CatalogEditorIntegrityJs',src:'./assets/v025174-catalog-editor-integrity.js?v=025177r1'},
    {type:'js',id:'v025173MenuEditorReturnJs',src:'./assets/v025173-menu-editor-return.js?v=025173r1'},
    {type:'js',id:'v025172MenuSaveReturnJs',src:'./assets/v025172-menu-save-return.js?v=025172r1'},
    {type:'css',id:'v025171CatalogDeleteCss',src:'./assets/v025171-catalog-delete.css?v=025171r1'},
    {type:'js',id:'v025171CatalogDeleteJs',src:'./assets/v025171-catalog-delete.js?v=025171r1'},
    {type:'css',id:'v02599HistoryEmphasisCss',src:'./assets/v02599-history-emphasis.css?v=02599r1'},
    {type:'css',id:'v02579RoundedBorderCss',src:'./assets/v02577-menu-option-b.css?v=02579r1'},
    {type:'css',id:'v02575CardapioCompactEditCss',src:'./assets/v02575-cardapio-compact-edit.css?v=02576r1'},
    {type:'css',id:'v02574WhatsappConsentCss',src:'./assets/v02574-whatsapp-consent.css?v=02574r1'},
    {type:'js',id:'v02574WhatsappConsentJs',src:'./assets/v02574-whatsapp-consent.js?v=02574r1'},
    {type:'js',id:'v02573WhatsappCancelJs',src:'./assets/v02573-whatsapp-cancel.js?v=02573r1'},
    {type:'css',id:'v02572PanelClientStabilityCss',src:'./assets/v02572-panel-client-stability.css?v=02572r1'},
    {type:'js',id:'v02572PanelClientStabilityJs',src:'./assets/v02572-panel-client-stability.js?v=02572r1'},
    {type:'css',id:'v02571ClientPickerCss',src:'./assets/v02571-client-picker.css?v=02571r1'},
    {type:'js',id:'v02571ClientPickerJs',src:'./assets/v02571-client-picker.js?v=02571r1'},
    {type:'js',id:'v02570NewCommandRootJs',src:'./assets/v02570-new-command-root.js?v=02570r1'},
    {type:'css',id:'v02569MenuCategoryOrderCss',src:'./assets/v02569-menu-category-order.css?v=02569r1'},
    {type:'js',id:'v02569MenuCategoryOrderJs',src:'./assets/v02569-menu-category-order.js?v=02571r1'},
    {type:'css',id:'v02557UpcomingBirthdaysCss',src:'./assets/v02557-upcoming-birthdays.css?v=02567r1'},
    {type:'js',id:'v02557UpcomingBirthdaysJs',src:'./assets/v02557-upcoming-birthdays.js?v=02567r1'},
    {type:'css',id:'v02565BirthdayGreetingCss',src:'./assets/v02565-birthday-greeting.css?v=02567r1'},
    {type:'js',id:'v02565BirthdayGreetingJs',src:'./assets/v02565-birthday-greeting.js?v=02567r1'},
    {type:'css',id:'v02566BirthdayEligibilityCss',src:'./assets/v02566-birthday-eligibility.css?v=02567r1'},
    {type:'js',id:'v02566BirthdayEligibilityJs',src:'./assets/v02566-birthday-eligibility.js?v=02567r1'},
    {type:'js',id:'v02567BirthdayVisualStateJs',src:'./assets/v02567-birthday-visual-state.js?v=02567r1'},
    {type:'css',id:'v02564MobileRuntimeCss',src:'./assets/v02564-mobile-runtime-hotfix.css?v=02564r1'},
    {type:'js',id:'v02564MobileRuntimeJs',src:'./assets/v02564-mobile-runtime-hotfix.js?v=02564r1'},
    {type:'css',id:'v02563OperationalTurnCss',src:'./assets/v02563-operational-turn-coherence.css?v=025119r1'},
    {type:'js',id:'v02563OperationalTurnJs',src:'./assets/v02563-operational-turn-coherence.js?v=025119r1'},
    {type:'css',id:'v02562CostAlertsCss',src:'./assets/v02562-cost-margin-alerts.css?v=02562r1'},
    {type:'js',id:'v02562CostAlertsJs',src:'./assets/v02562-cost-margin-alerts.js?v=02562r1'},
    {type:'css',id:'v02561TurnPreflightCss',src:'./assets/v02561-turn-preflight.css?v=02561r1'},
    {type:'js',id:'v02561TurnPreflightJs',src:'./assets/v02561-turn-preflight.js?v=02561r1'},
    {type:'css',id:'v02560ClientIntelligenceCss',src:'./assets/v02560-client-intelligence.css?v=02560r1'},
    {type:'js',id:'v02560ClientIntelligenceJs',src:'./assets/v02560-client-intelligence.js?v=02560r1'},
    {type:'css',id:'v02559StockCoverageCss',src:'./assets/v02559-stock-coverage.css?v=02559r1'},
    {type:'js',id:'v02559StockCoverageJs',src:'./assets/v02559-stock-coverage.js?v=02559r1'},
    {type:'css',id:'v02558ReceivableDueCss',src:'./assets/v02558-receivables-due-date.css?v=02558r1'},
    {type:'js',id:'v02558ReceivableDueJs',src:'./assets/v02558-receivables-due-date.js?v=02558r1'},
    {type:'css',id:'v02553CartbarButtonCss',src:'./assets/v02553-cartbar-button.css?v=02553r1'},
    {type:'css',id:'v02552CommandMapSimplifyCss',src:'./assets/v02552-command-map-simplify.css?v=02552r1'},
    {type:'js',id:'v02552CommandMapSimplifyJs',src:'./assets/v02552-command-map-simplify.js?v=02552r1'},
    {type:'css',id:'v02551UxHotfixCss',src:'./assets/v02551-ux-hotfix.css?v=02551r1'},
    {type:'js',id:'v02551UxHotfixJs',src:'./assets/v02551-ux-hotfix.js?v=02551r1'},
    {type:'css',id:'v02548EventDeliveryFunnelCss',src:'./assets/v02548-event-delivery-funnel.css?v=02548r1'},
    {type:'js',id:'v02548EventDeliveryFunnelJs',src:'./assets/v02548-event-delivery-funnel.js?v=02548r1'},
    {type:'css',id:'v02581GlobalTestModeCss',src:'./assets/v02581-global-test-mode.css?v=02581r1'},
    {type:'js',id:'v02581GlobalTestModeJs',src:'./assets/v02581-global-test-mode.js?v=02581r1'},
    {type:'js',id:'v02581ManagerTestBridgeJs',src:'./assets/v02581-manager-test-bridge.js?v=02582r3'},
    {type:'css',id:'v02582TestModeHotfixCss',src:'./assets/v02582-test-mode-hotfix.css?v=02582r1'},
    {type:'js',id:'v02582TestModeHotfixJs',src:'./assets/v02582-test-mode-hotfix.js?v=02582r1'},
    {type:'js',id:'v02595TestRealBoundaryJs',src:'./assets/v02595-test-real-boundary.js?v=02595r1'},
    {type:'css',id:'v02583HistoryPanelParityCss',src:'./assets/v02583-history-panel-parity.css?v=02583r1'},
    {type:'css',id:'v02584ManagerVisualParityCss',src:'./assets/v02584-manager-visual-parity.css?v=025124r1'},
    {type:'css',id:'v02585DeviceManagementCss',src:'./assets/v02585-device-management.css?v=02585r1'},
    {type:'js',id:'v02585DeviceManagementJs',src:'./assets/v02585-device-management.js?v=02585r1'},
    {type:'css',id:'v02586DeviceTelemetryCss',src:'./assets/v02586-device-telemetry.css?v=02586r1'},
    {type:'js',id:'v02586DeviceTelemetryJs',src:'./assets/v02586-device-telemetry.js?v=02586r1'},
    {type:'js',id:'v02590UpdateCoordinatorJs',src:'./assets/v02590-update-coordinator.js?v=02590r1'},
    {type:'js',id:'v02598CommandEmptyStateJs',src:'./assets/v02598-command-empty-state.js?v=02598r1'},
    {type:'js',id:'v02589DeviceReleaseJs',src:'./assets/v02589-device-release.js?v=02589r1'},
    {type:'js',id:'v02589ReceivableSettlementJs',src:'./assets/v02589-receivable-settlement.js?v=02589r1'},
    {type:'js',id:'v02590DeviceClarityJs',src:'./assets/v02590-device-clarity.js?v=02590r1'},
    {type:'css',id:'v02591FloatingCloseCss',src:'./assets/v02591-floating-close.css?v=02591r1'},
    {type:'js',id:'v02591FloatingCloseJs',src:'./assets/v02591-floating-close.js?v=02591r1'},
    {type:'css',id:'v02592FabVisibilityCss',src:'./assets/v02592-fab-visibility.css?v=02592r1'},
    {type:'js',id:'v02592FabVisibilityJs',src:'./assets/v02592-fab-visibility.js?v=025101r1'},
    {type:'css',id:'v02593HelpV11Css',src:'./assets/v02593-help-v11.css?v=02593r1'},
    {type:'js',id:'v02593HelpV11Js',src:'./assets/v02593-help-v11.js?v=025125r1'}
  ];
  let identityObserver=null,identityQueued=false;
  function identity(){
    const title=`Rota 27 Bodega • Comandas v${CURRENT}`;
    if(document.title!==title)document.title=title;
    const meta=document.querySelector('meta[name="rota27-release-version"]');if(meta&&meta.content!==CURRENT)meta.content=CURRENT;
    const brand=document.querySelector('.brand-copy');
    let badge=document.getElementById('v14VersionBadge');
    if(!badge&&brand){badge=document.createElement('span');badge.id='v14VersionBadge';badge.className='v14-version-badge';brand.appendChild(badge);}
    if(badge&&badge.textContent!==`v${CURRENT}`)badge.textContent=`v${CURRENT}`;
    let style=document.getElementById('rota27RoadmapReleaseIdentity');
    if(!style){style=document.createElement('style');style.id='rota27RoadmapReleaseIdentity';document.head.appendChild(style);}
    const css=`#v14VersionBadge{font-size:0!important;color:transparent!important;white-space:nowrap!important}#v14VersionBadge::after{content:"v${CURRENT}"!important;display:inline-block!important;visibility:visible!important;font-size:10.5px!important;line-height:1!important;font-weight:900!important;color:#8F4421!important}`;
    if(style.textContent!==css)style.textContent=css;
    if(style!==document.head.lastElementChild)document.head.appendChild(style);
    const footer=document.querySelector('#r27HelpOverlay .r27-help-footer span');if(footer)footer.textContent=`Ajuda v${HELP} • Rota 27 v${CURRENT}`;
  }
  function protectIdentity(){
    if(identityObserver||!document.head)return;
    identityObserver=new MutationObserver(()=>{
      if(identityQueued)return;
      identityQueued=true;
      Promise.resolve().then(()=>{identityQueued=false;identity();});
    });
    identityObserver.observe(document.head,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['content']});
  }
  function load(a){
    if(document.getElementById(a.id))return;
    if(a.type==='css'){const n=document.createElement('link');n.id=a.id;n.rel='stylesheet';n.href=a.src;document.head.appendChild(n);return;}
    const n=document.createElement('script');n.id=a.id;n.src=a.src;n.async=false;document.body.appendChild(n);
  }
  function refresh(){identity();assets.forEach(load);}
  function start(){refresh();protectIdentity();requestAnimationFrame(()=>document.body?.classList.add('r27-bootstrap-ready'));document.addEventListener('click',e=>{if(e.target.closest?.('#r27HelpBtn,#r27HelpButton,[data-help]'))setTimeout(identity,100);});document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refresh();});window.Rota27Roadmap={version:CURRENT,refresh,assets:assets.map(a=>a.id)};console.info(`[Rota27] roadmap loader v${CURRENT} carregado.`);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();