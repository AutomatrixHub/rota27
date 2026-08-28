/* Rota 27 v0.25.47 — ponte de compatibilidade para o hotfix v0.25.50 */
(function(){
  'use strict';
  if(window.Rota27V02550UI||document.getElementById('v02550UiStabilityJs'))return;
  const script=document.createElement('script');
  script.id='v02550UiStabilityJs';
  script.src='./assets/v02550-ui-stability.js?v=02550r1';
  script.async=false;
  document.body.appendChild(script);
  console.info('[Rota27] v0.25.47 redirecionada para o hotfix v0.25.50.');
})();
