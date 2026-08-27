/* Rota 27 v0.25.34 — ações do Cardápio mais claras */
(function(){
  'use strict';
  const VERSION='0.25.34';

  function refineActions(){
    const screen=document.getElementById('screenMenu');
    if(!screen)return false;

    const categories=screen.querySelector('.menu-categories');
    if(categories){
      categories.textContent='Categorias';
      categories.setAttribute('aria-label','Gerenciar categorias');
      categories.setAttribute('title','Gerenciar categorias');
    }

    return true;
  }

  function settle(){[0,80,180].forEach(delay=>setTimeout(refineActions,delay));}

  function handleClick(e){if(e.target.closest?.('#navMenu'))settle();}

  function start(){
    settle();
    document.addEventListener('click',handleClick);
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')settle();});
    window.Rota27V02534MenuActions={version:VERSION,refresh:settle,refineActions};
    console.info('[Rota27] v0.25.34 — ações do Cardápio refinadas.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
