/* Rota 27 v0.25.172 — confirmação visual do salvamento no Cardápio */
(function(){
  'use strict';
  const VERSION='0.25.172';

  function returnToList(){
    const wrap=document.getElementById('menuItemWrap');
    if(wrap?.classList.contains('open'))return;
    try{showScreen('menu');}catch{}
    try{renderMenu();}catch{}
  }
  function install(){
    const current=window.saveMenuItem;
    if(typeof current!=='function'||current.__v025172MenuReturn)return false;
    const wrapped=function(){
      const result=current.apply(this,arguments);
      /* A função-base só fecha o editor após validar e persistir o produto. */
      setTimeout(returnToList,0);
      return result;
    };
    wrapped.__v025172MenuReturn=true;
    wrapped.__v025172Base=current;
    try{window.saveMenuItem=wrapped;saveMenuItem=wrapped;}catch{}
    return true;
  }
  function start(){
    install();
    window.Rota27V025172MenuSaveReturn={version:VERSION,refresh:returnToList};
    console.info('[Rota27] v0.25.172 — retorno ao Cardápio após salvar carregado.');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
