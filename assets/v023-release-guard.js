/* Rota 27 v0.23.0 — guarda leve da identificação pública da release, sem polling/observer */
(function(){
  'use strict';
  const LABEL='v0.23.0',TITLE='Rota 27 Bodega • Comandas v0.23.0';
  function apply(){
    const b=document.getElementById('v14VersionBadge');if(b&&b.textContent!==LABEL)b.textContent=LABEL;
    if(document.title!==TITLE)document.title=TITLE;
    const footer=document.querySelector('#r27HelpOverlay .r27-help-footer span');if(footer&&footer.textContent!=='Ajuda v4.7 • v0.23.0')footer.textContent='Ajuda v4.7 • v0.23.0';
    try{window.ROTA27_RELEASE_VERSION='0.23.0';window.ROTA27_SYNC_DEV_VERSION='0.23.0';}catch{}
  }
  function later(){setTimeout(apply,0);}
  apply();setTimeout(apply,250);setTimeout(apply,1000);
  window.addEventListener('rota27:v021-stock-updated',later);
  window.addEventListener('rota27:v022-purchases-updated',later);
  window.addEventListener('rota27:v023-inventory-updated',later);
  window.addEventListener('storage',later);
  window.addEventListener('online',later);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')later();});
  document.addEventListener('click',e=>{if(e.target.closest?.('button,summary,a'))later();},true);
})();
