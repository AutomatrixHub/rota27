/* Compatibilidade v0.19 → gerenciador de turnos v0.25.16 com reparo histórico */
(function(){
  'use strict';
  function loadTurnClose(){
    if(document.getElementById('v02515TurnCloseJs'))return;
    const script=document.createElement('script');
    script.id='v02515TurnCloseJs';
    script.src='./assets/v02515-turn-close.js?v=02516r1';
    script.async=false;
    document.body.appendChild(script);
  }
  if(document.getElementById('v02516RepairJs')){loadTurnClose();return;}
  const repair=document.createElement('script');
  repair.id='v02516RepairJs';
  repair.src='./assets/v02516-repair.js?v=02516r1';
  repair.async=false;
  repair.onload=loadTurnClose;
  repair.onerror=loadTurnClose;
  document.body.appendChild(repair);
})();
