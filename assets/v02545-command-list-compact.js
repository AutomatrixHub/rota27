/* Rota 27 v0.25.45 — local na mesma linha do cliente */
(function(){
  'use strict';

  const VERSION='0.25.45';
  let previousRender=null;

  function compactListCards(){
    const screen=document.getElementById('screenCommands');
    if(!screen||screen.dataset.v0252View!=='list')return;
    screen.querySelectorAll('#commandList .command-card.v017-command-card').forEach(card=>{
      const primary=card.querySelector('.v017-command-primary');
      const title=primary?.querySelector('.command-title');
      const location=card.querySelector('.v017-command-location');
      if(primary&&title&&location&&location.parentElement!==primary){
        primary.appendChild(location);
      }
      card.dataset.v02545Compact='1';
    });
  }

  function patchRenderCommands(){
    const current=window.renderCommands;
    if(typeof current!=='function'||current.__v02545Compact===true)return;
    previousRender=current;
    const patched=function(){
      const result=previousRender.apply(this,arguments);
      compactListCards();
      return result;
    };
    patched.__v02545Compact=true;
    try{window.renderCommands=patched;}catch{}
    try{renderCommands=patched;}catch{}
  }

  function start(){
    patchRenderCommands();
    compactListCards();
    window.addEventListener('rota27:v0252-view-change',compactListCards);
    window.Rota27V02545CommandList={version:VERSION,compactListCards,patchRenderCommands};
    console.info('[Rota27] v0.25.45 — lista de comandas mais compacta.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
