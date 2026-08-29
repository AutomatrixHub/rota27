/* Rota 27 v0.25.54 — Nova comanda sem foco automático */
(function(){
  'use strict';

  const VERSION='0.25.54';
  let baseOpen=null;

  const byId=id=>document.getElementById(id);

  function removeAutofocus(){
    const wrap=byId('newCommandWrap');
    if(!wrap)return;
    wrap.querySelectorAll('[autofocus]').forEach(el=>el.removeAttribute('autofocus'));
  }

  function blurFocusedField(){
    const wrap=byId('newCommandWrap');
    const active=document.activeElement;
    if(!wrap||!active||active===document.body||!wrap.contains(active))return;
    if(typeof active.blur==='function')active.blur();
  }

  function neutralizeInitialFocus(){
    removeAutofocus();
    blurFocusedField();
    if(typeof queueMicrotask==='function')queueMicrotask(blurFocusedField);
    if(typeof requestAnimationFrame==='function')requestAnimationFrame(blurFocusedField);
  }

  function patchOpenNewCommand(){
    const current=window.openNewCommandSheet;
    if(typeof current!=='function'||current.__v02554NoAutofocus)return;
    baseOpen=current;
    const patched=function(){
      const result=baseOpen.apply(this,arguments);
      neutralizeInitialFocus();
      return result;
    };
    patched.__v02554NoAutofocus=true;
    try{window.openNewCommandSheet=patched;}catch{}
    try{openNewCommandSheet=patched;}catch{}
  }

  function start(){
    removeAutofocus();
    patchOpenNewCommand();
    document.addEventListener('visibilitychange',()=>{
      if(document.visibilityState==='visible'){
        removeAutofocus();
        patchOpenNewCommand();
      }
    });
    window.Rota27V02554NoAutofocus={version:VERSION,refresh:patchOpenNewCommand};
    console.info('[Rota27] v0.25.54 — Nova comanda sem foco automático.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
