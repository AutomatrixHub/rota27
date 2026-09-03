/* Rota 27 v0.25.173 — retorno direto do editor de produtos */
(function(){
  'use strict';
  const VERSION='0.25.173';

  function returnToMenu(){
    const editor=document.getElementById('menuItemWrap');
    /* Se a validação falhou, a função-base mantém o editor aberto. */
    if(editor?.classList.contains('open'))return;
    try{showScreen('menu');}catch{}
    try{renderMenu();}catch{}
  }
  function isEditorAction(target){
    if(target.closest?.('#v025171DeleteProduct'))return true;
    const button=target.closest?.('#menuItemWrap button');
    return String(button?.getAttribute('onclick')||'').includes('saveMenuItem');
  }
  function start(){
    /* Captura o clique no próprio controle visível, sem depender de escopo global. */
    document.addEventListener('click',event=>{
      if(isEditorAction(event.target))setTimeout(returnToMenu,0);
    },true);
    window.Rota27V025173MenuEditorReturn={version:VERSION,returnToMenu};
    console.info('[Rota27] v0.25.173 — retorno direto do editor de Cardápio carregado.');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
