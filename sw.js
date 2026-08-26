const CACHE_NAME = 'rota27-comandas-v0.25.12-r1';
const APP_SHELL = [
  './','./index.html','./base-v013.html',
  './assets/v014.css','./assets/v014.js','./assets/v014-dev3.css','./assets/v014-dev3.js','./assets/v014-rc2-category-fix.js','./assets/v014-final.js',
  './assets/v015.css','./assets/v015-sync.js','./assets/v015-dev2.css','./assets/v015-dev2.js','./assets/v015-dev3.css','./assets/v015-dev3.js','./assets/v015-dev4.css','./assets/v015-dev4.js','./assets/v015-rc2-ops.css','./assets/v015-rc2-ops.js','./assets/v015-rc3-items.css','./assets/v015-rc3-items.js',
  './assets/v0151-hotfix.css','./assets/v0151-hotfix.js','./assets/v0151-help.css','./assets/v0151-help.js',
  './assets/v0171-help-update.js','./assets/v016-help-polish.css','./assets/v016-help-polish.js',
  './assets/v017.css','./assets/v017-core.js','./assets/v017-client-ids.js','./assets/v017-manager.js','./assets/v017-whatsapp-polish.js','./assets/v017-layout.js',
  './assets/v018.css','./assets/v018-turn-summary.js','./assets/v018-help.js',
  './assets/v0181.css','./assets/v0181-audit.js','./assets/v0181-help.js',
  './assets/v0182-brand-theme.css',
  './assets/v0183-capixaba-help.css','./assets/v0183-final.js',
  './assets/v019-turn-close.css','./assets/v019-turn-close.js',
  './assets/v020-manager-dashboard.css','./assets/v020-manager-dashboard.js','./assets/v020-demo-mode.css','./assets/v020-demo-mode.js','./assets/v020-preview-demo.js',
  './assets/v021-stock.css','./assets/v021-stock.js','./assets/v021-compat.js','./assets/v021-help-compat.js',
  './assets/v022-stock-preflight.js','./assets/v022-stock-release.js','./assets/v022-stock-manager-view.css','./assets/v022-stock-manager-view.js','./assets/v022-stock-view-bridge.js','./assets/v022-purchases.css','./assets/v022-purchases.js','./assets/v022-compat.js','./assets/v022-manager-view.css','./assets/v022-manager-view.js',
  './assets/v023-inventory.css','./assets/v023-inventory.js',
  './assets/v024-costs.css','./assets/v024-costs.js','./assets/v024-draft-edit.css','./assets/v024-draft-edit.js','./assets/v024-release-identity.css',
  './assets/v025-relationship.css','./assets/v025-relationship-r2.css','./assets/v025-relationship-r3.css','./assets/v025-relationship.js','./assets/v025-relationship-r3.js','./assets/v025-release-identity.css',
  './assets/v0251-navigation.css','./assets/v0251-navigation.js',
  './assets/v0252-command-map.css','./assets/v0252-command-map.js','./assets/v0252-panel-polish.css','./assets/v0252-panel-polish.js',
  './assets/v0253-map-visual.css','./assets/v0253-release.js',
  './assets/v0254-map-accent.css','./assets/v0254-release.js',
  './assets/v0255-map-card.css','./assets/v0255-map-card.js','./assets/v0255-fixed-whatsapp-copy.js','./assets/v0255-release.js',
  './assets/v0256-map-list-parity.css','./assets/v0256-map-list-parity.js','./assets/v0256-release.js',
  './assets/v0259-category-reference.css','./assets/v0259-category-reference.js','./assets/v0259-production-cleanup.js',
  './assets/v02510-turn-summary-current-name.js','./assets/v02511-history-rank-current-name.js',
  './assets/v02512-receivables.css','./assets/v02512-receivables.js',
  './assets/brand/rota27-logo-oficial.png',
  './manifest.webmanifest','./icons/apple-touch-icon.png','./icons/icon-192.png','./icons/icon-512.png','./icons/icon-192-maskable.png','./icons/icon-512-maskable.png','./icons/favicon-32.png'
];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_SHELL)));self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key)))));self.clients.claim();});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;event.respondWith(fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));return response;}).catch(()=>caches.match(event.request).then(cached=>cached||caches.match('./index.html'))));});
