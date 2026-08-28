/* Rota 27 v0.25.50 — ponte de compatibilidade para v0.25.51 */
(function(){
  'use strict';
  if(window.Rota27V02551UX||document.getElementById('v02551UxHotfixJs'))return;
  const script=document.createElement('script');
  script.id='v02551UxHotfixJs';
  script.src='./assets/v02551-ux-hotfix.js?v=02551r1';
  script.async=false;
  document.body.appendChild(script);
  console.info('[Rota27] v0.25.50 redirecionada para v0.25.51.');
})();
