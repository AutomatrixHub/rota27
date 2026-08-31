/* Rota 27 v0.25.85 — mantém o acesso de aparelhos após o refresh interno do Painel */
(function(){
  'use strict';
  if(window.Rota27V02585DeviceManagementStability)return;
  let observer=null;
  let scheduled=false;

  function ensureSoon(){
    if(scheduled)return;
    scheduled=true;
    const run=()=>{
      scheduled=false;
      try{window.Rota27V02585DeviceManagement?.ensure?.();}catch{}
    };
    if(typeof requestAnimationFrame==='function')requestAnimationFrame(run);else setTimeout(run,0);
  }

  function attach(){
    const screen=document.getElementById('screenPanel');
    if(!screen)return false;
    observer?.disconnect();
    observer=new MutationObserver(ensureSoon);
    observer.observe(screen,{childList:true});
    ensureSoon();
    return true;
  }

  function start(){
    if(!attach())setTimeout(attach,350);
    setTimeout(attach,1000);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
  window.Rota27V02585DeviceManagementStability={version:'0.25.85',attach};
})();
