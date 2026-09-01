const CACHE_NAME = 'rota27-comandas-v0.25.94-r1';
const RELEASE_VERSION = '0.25.94';
const APP_SHELL = [
  './','./index.html','./sandbox.html','./base-v013.html',
  './assets/v014.css','./assets/v014.js','./assets/v014-dev3.css','./assets/v014-dev3.js','./assets/v014-rc2-category-fix.js','./assets/v014-final.js',
  './assets/v015.css','./assets/v015-sync.js','./assets/v015-dev2.css','./assets/v015-dev2.js','./assets/v015-dev3.css','./assets/v015-dev3.js','./assets/v015-dev4.css','./assets/v015-dev4.js','./assets/v015-rc2-ops.css','./assets/v015-rc2-ops.js','./assets/v015-rc3-items.css','./assets/v015-rc3-items.js',
  './assets/v0151-hotfix.css','./assets/v0151-hotfix.js','./assets/v0151-help.css','./assets/v0151-help.js',
  './assets/v0171-help-update.js','./assets/v016-help-polish.css','./assets/v016-help-polish.js',
  './assets/v017.css','./assets/v017-core.js','./assets/v017-client-ids.js','./assets/v017-manager.js','./assets/v017-whatsapp-polish.js','./assets/v017-layout.js',
  './assets/v018.css','./assets/v018-turn-summary.js','./assets/v018-help.js',
  './assets/v0181.css','./assets/v0181-audit.js','./assets/v0181-help.js',
  './assets/v0182-brand-theme.css','./assets/v0183-capixaba-help.css','./assets/v0183-final.js',
  './assets/v019-turn-close.css','./assets/v019-turn-close.js','./assets/v02515-turn-close.js','./assets/v02516-repair.js',
  './assets/v020-manager-dashboard.css','./assets/v020-manager-dashboard.js','./assets/v020-demo-mode.css','./assets/v020-demo-mode.js','./assets/v020-preview-demo.js',
  './assets/v021-stock.css','./assets/v021-stock.js','./assets/v021-compat.js','./assets/v021-help-compat.js',
  './assets/v022-stock-preflight.js','./assets/v022-stock-release.js','./assets/v022-stock-manager-view.css','./assets/v022-stock-manager-view.js','./assets/v022-stock-view-bridge.js','./assets/v022-purchases.css','./assets/v022-purchases.js','./assets/v022-compat.js','./assets/v022-manager-view.css','./assets/v022-manager-view.js',
  './assets/v023-inventory.css','./assets/v023-inventory.js',
  './assets/v024-costs.css','./assets/v024-costs.js','./assets/v024-draft-edit.css','./assets/v024-draft-edit.js','./assets/v024-release-identity.css',
  './assets/v025-relationship.css','./assets/v025-relationship-r2.css','./assets/v025-relationship-r3.css','./assets/v025-relationship.js','./assets/v025-relationship-r3.js','./assets/v025-release-identity.css',
  './assets/v0251-navigation.css','./assets/v0251-navigation.js',
  './assets/v0252-command-map.css','./assets/v0252-command-map.js','./assets/v0252-panel-polish.css','./assets/v0252-panel-polish.js',
  './assets/v0253-map-visual.css','./assets/v0253-release.js','./assets/v0254-map-accent.css','./assets/v0254-release.js',
  './assets/v0255-map-card.css','./assets/v0255-map-card.js','./assets/v0255-fixed-whatsapp-copy.js','./assets/v0255-release.js',
  './assets/v0256-map-list-parity.css','./assets/v0256-map-list-parity.js','./assets/v0256-release.js',
  './assets/v0259-category-reference.css','./assets/v0259-category-reference.js','./assets/v0259-production-cleanup.js',
  './assets/v02510-turn-summary-current-name.js','./assets/v02511-history-rank-current-name.js',
  './assets/v02512-receivables.css','./assets/v02512-receivables.js','./assets/v02512-overdue-turn.js','./assets/v02512-receivables-safety.js',
  './assets/v02513-client-picker.css','./assets/v02513-client-picker.js',
  './assets/v02517-client-birthday.js','./assets/v02518-client-birthday-on-open.js','./assets/v02519-command-cards.css',
  './assets/v02520-birthday-campaign.css','./assets/v02520-birthday-campaign.js',
  './assets/v02521-history-ux.css','./assets/v02521-history-ux.js','./assets/v02521-history-search-bridge.js',
  './assets/v02522-closure-polish.css','./assets/v02522r3-closure-render.js','./assets/v02524-history-finish.css','./assets/v02525-panel-finish.css','./assets/v02526-menu-finish.css',
  './assets/v02527-product-icons.css','./assets/v02527-product-icons.js','./assets/v02528-product-icons-soft.css','./assets/v02529-menu-category-legibility.css','./assets/v02531-product-icons-panel.css',
  './assets/v02533-menu-header-polish.css','./assets/v02533-menu-header-polish.js','./assets/v02534-menu-actions-polish.css','./assets/v02534-menu-actions-polish.js','./assets/v02535-edit-command-birthday.js','./assets/v02536-receivables-card.css',
  './assets/v02537-internal-consumption.css','./assets/v02537-internal-consumption.js','./assets/v02537-internal-stock-bridge.js','./assets/v02537-internal-sync-guard.js','./assets/v02537-history-financial-guard.js','./assets/v02537-internal-ledger-guard.js',
  './assets/v02538-backup-sandbox.css','./assets/v02538-backup-sandbox.js','./assets/v02539-internal-toggle-hotfix.js','./assets/v02540-events.css','./assets/v02540-events.js','./assets/v02542-event-send-feedback.js','./assets/v02543-whatsapp-delivery-status.js','./assets/v02544-client-card-details.css','./assets/v02544-client-card-details.js','./assets/v02545-command-list-compact.css','./assets/v02545-command-list-compact.js','./assets/v02546-attention-panel.css','./assets/v02546-attention-panel.js',
  './assets/roadmap-loader.js','./assets/v02547-turn-favorites.css','./assets/v02547-turn-favorites.js','./assets/v02548-event-delivery-funnel.css','./assets/v02548-event-delivery-funnel.js','./assets/v02549-turn-favorites-hotfix.js','./assets/v02550-ui-stability.js','./assets/v02551-ux-hotfix.css','./assets/v02551-ux-hotfix.js','./assets/v02552-command-map-simplify.css','./assets/v02552-command-map-simplify.js','./assets/v02553-cartbar-button.css','./assets/v02554-new-command-no-autofocus.js','./assets/v02555-new-command-focus-root.js','./assets/v02557-upcoming-birthdays.css','./assets/v02557-upcoming-birthdays.js','./assets/v02558-receivables-due-date.css','./assets/v02558-receivables-due-date.js','./assets/v02559-stock-coverage.css','./assets/v02559-stock-coverage.js','./assets/v02560-client-intelligence.css','./assets/v02560-client-intelligence.js','./assets/v02561-turn-preflight.css','./assets/v02561-turn-preflight.js','./assets/v02562-cost-margin-alerts.css','./assets/v02562-cost-margin-alerts.js','./assets/v02563-operational-turn-coherence.css','./assets/v02563-operational-turn-coherence.js','./assets/v02564-mobile-runtime-hotfix.css','./assets/v02564-mobile-runtime-hotfix.js','./assets/v02565-birthday-greeting.css','./assets/v02565-birthday-greeting.js','./assets/v02566-birthday-eligibility.css','./assets/v02566-birthday-eligibility.js','./assets/v02567-birthday-visual-state.js','./assets/v02569-menu-category-order.css','./assets/v02569-menu-category-order.js','./assets/v02570-new-command-root.js','./assets/v02571-client-picker.css','./assets/v02571-client-picker.js','./assets/v02572-panel-client-stability.css','./assets/v02572-panel-client-stability.js','./assets/v02573-whatsapp-cancel.js','./assets/v02574-whatsapp-consent.css','./assets/v02574-whatsapp-consent.js','./assets/v02575-cardapio-compact-edit.css','./assets/v02576-edit-command-no-autofocus.js','./assets/v02577-menu-option-b.css','./assets/v02580-product-category-no-autofocus.js','./assets/v02580-r4-list-empty-parity.css','./assets/v02581-global-test-mode.css','./assets/v02581-global-test-mode.js','./assets/v02581-manager-test-bridge.js','./assets/v02582-test-mode-hotfix.css','./assets/v02582-test-mode-hotfix.js','./assets/v02583-history-panel-parity.css','./assets/v02584-manager-visual-parity.css','./assets/v02585-device-management.css','./assets/v02585-device-management.js','./assets/v02585-device-management-stability.js','./assets/v02586-device-telemetry.css','./assets/v02586-device-telemetry.js','./assets/v02587-auto-update.js','./assets/v02588-list-empty-visibility.js','./assets/v02589-device-release.js','./assets/v02589-receivable-settlement.js','./assets/v02590-update-coordinator.js','./assets/v02590-device-clarity.js','./assets/v02591-floating-close.css','./assets/v02591-floating-close.js','./assets/v02592-fab-visibility.css','./assets/v02592-fab-visibility.js','./assets/v02593-help-v11.css','./assets/v02593-help-v11.js','./assets/v02594-help-no-autofocus.js',
  './assets/brand/rota27-logo-oficial.png',
  './manifest.webmanifest','./icons/apple-touch-icon.png','./icons/icon-192.png','./icons/icon-512.png','./icons/icon-192-maskable.png','./icons/icon-512-maskable.png','./icons/favicon-32.png'
];

const ROADMAP_PREFIX = `window.Rota27V02587AutoUpdate={version:'${RELEASE_VERSION}',superseded:true};\n`;
const ROADMAP_SUFFIX = `\n;(function(){
  function bootV02590(){
    try{
      var meta=document.querySelector('meta[name="rota27-release-version"]');if(meta)meta.content='${RELEASE_VERSION}';
      if(window.Rota27Roadmap)window.Rota27Roadmap.version='${RELEASE_VERSION}';
      var style=document.getElementById('v02590ReleaseIdentity');
      if(!style){style=document.createElement('style');style.id='v02590ReleaseIdentity';document.head.appendChild(style);}
      style.textContent='#v14VersionBadge::after{content:"v${RELEASE_VERSION}"!important}';
      var footer=document.querySelector('#r27HelpOverlay .r27-help-footer span');if(footer)footer.textContent='Ajuda v11.0 • Rota 27 v${RELEASE_VERSION}';
      [['v02590UpdateCoordinatorJs','./assets/v02590-update-coordinator.js?v=02590r1'],['v02590DeviceClarityJs','./assets/v02590-device-clarity.js?v=02590r1']].forEach(function(pair){
        if(document.getElementById(pair[0]))return;var s=document.createElement('script');s.id=pair[0];s.src=pair[1];s.async=false;document.body.appendChild(s);
      });
    }catch(err){console.warn('[Rota27 v0.25.90] bootstrap hotfix:',err);}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bootV02590,{once:true});else bootV02590();
})();`;

self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_SHELL)));self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key)))));self.clients.claim();});
self.addEventListener('message',event=>{
  const type=event.data?.type;
  if(type==='ROTA27_SKIP_WAITING'){self.skipWaiting();return;}
  if(type==='ROTA27_GET_RELEASE')event.ports?.[0]?.postMessage({version:RELEASE_VERSION,cacheName:CACHE_NAME});
});

async function roadmapResponse(request){
  const cache=await caches.open(CACHE_NAME);
  let base=await cache.match('./assets/roadmap-loader.js');
  if(!base){try{base=await fetch(request,{cache:'reload'});}catch{base=null;}}
  if(!base)return new Response('',{status:503,headers:{'content-type':'application/javascript; charset=utf-8'}});
  const source=await base.text();
  const headers=new Headers(base.headers);
  headers.set('content-type','application/javascript; charset=utf-8');
  headers.delete('content-length');
  return new Response(ROADMAP_PREFIX+source+ROADMAP_SUFFIX,{status:base.status,statusText:base.statusText,headers});
}

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.pathname.endsWith('/assets/roadmap-loader.js')){event.respondWith(roadmapResponse(event.request));return;}
  event.respondWith(fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));return response;}).catch(()=>caches.match(event.request,{ignoreSearch:true}).then(cached=>cached||caches.match('./index.html'))));
});
