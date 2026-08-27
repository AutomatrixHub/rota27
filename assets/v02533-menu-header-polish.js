/* Rota 27 v0.25.33 — acabamento do cabeçalho do Cardápio */
(function(){
  'use strict';
  const VERSION='0.25.33';

  function refineMenuHeader(){
    const screen=document.getElementById('screenMenu');
    if(!screen)return false;

    const tools=document.getElementById('v14CatalogTools');
    if(tools){
      tools.classList.add('v02533-catalog-tools');
      const small=tools.querySelector('small');
      if(small&&small.dataset.v02533Copy!=='1'){
        small.textContent='Importe, exporte ou atualize vários produtos.';
        small.dataset.v02533Copy='1';
      }
    }

    const note=screen.querySelector('.menu-note');
    if(note){
      note.classList.add('v02533-price-note');
      if(note.dataset.v02533Copy!=='1'){
        note.innerHTML='<span class="v02533-price-primary">Preços alterados valem só para novos lançamentos.</span><span class="v02533-price-secondary">Itens já lançados mantêm nome e valor registrados no lançamento.</span>';
        note.dataset.v02533Copy='1';
      }
    }

    return true;
  }

  function settle(){
    [0,80,180].forEach(delay=>setTimeout(refineMenuHeader,delay));
  }

  function handleClick(e){
    if(e.target.closest?.('#navMenu'))settle();
  }

  function start(){
    settle();
    document.addEventListener('click',handleClick);
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')settle();});
    window.Rota27V02533MenuHeader={version:VERSION,refresh:settle,refineMenuHeader};
    console.info('[Rota27] v0.25.33 — cabeçalho do Cardápio refinado.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
