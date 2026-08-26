/* Compatibilidade v0.19 → gerenciador de turnos v0.25.15 */
(function(){
  'use strict';
  if(document.getElementById('v02515TurnCloseJs'))return;
  const script=document.createElement('script');
  script.id='v02515TurnCloseJs';
  script.src='./assets/v02515-turn-close.js?v=02515r1';
  script.async=false;
  document.body.appendChild(script);
})();
