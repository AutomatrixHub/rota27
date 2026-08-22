const CACHE_NAME = 'rota27-comandas-v0.16.0';
const APP_SHELL = [
  './','./index.html','./base-v013.html',
  './assets/v014.css','./assets/v014.js','./assets/v014-dev3.css','./assets/v014-dev3.js','./assets/v014-rc2-category-fix.js','./assets/v014-final.js',
  './assets/v015.css','./assets/v015-sync.js','./assets/v015-dev2.css','./assets/v015-dev2.js','./assets/v015-dev3.css','./assets/v015-dev3.js','./assets/v015-dev4.css','./assets/v015-dev4.js','./assets/v015-rc2-ops.css','./assets/v015-rc2-ops.js','./assets/v015-rc3-items.css','./assets/v015-rc3-items.js',
  './assets/v0151-hotfix.css','./assets/v0151-hotfix.js','./assets/v015-final.js','./assets/v0151-help.css','./assets/v0151-help.js',
  './assets/v016-help-polish.css','./assets/v016-help-polish.js','./assets/v016-final.js',
  './manifest.webmanifest','./icons/apple-touch-icon.png','./icons/icon-192.png','./icons/icon-512.png','./icons/icon-192-maskable.png','./icons/icon-512-maskable.png','./icons/favicon-32.png'
];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_SHELL)));self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key)))));self.clients.claim();});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;event.respondWith(fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));return response;}).catch(()=>caches.match(event.request).then(cached=>cached||caches.match('./index.html'))));});
