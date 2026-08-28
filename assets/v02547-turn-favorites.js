/* Rota 27 v0.25.47 — ponte de compatibilidade para o hotfix v0.25.49 */
(function(){
  'use strict';
  if(window.Rota27V02549TurnFavorites||document.getElementById('v02549TurnFavoritesCompatJs'))return;
  const script=document.createElement('script');
  script.id='v02549TurnFavoritesCompatJs';
  script.src='./assets/v02549-turn-favorites-hotfix.js?v=02549r1';
  script.async=false;
  document.body.appendChild(script);
  console.info('[Rota27] v0.25.47 redirecionada para o hotfix v0.25.49.');
})();
