/* Rota 27 v0.25.76 — Editar comanda sem foco automático */
(function(){
  'use strict';
  if(window.Rota27V02576EditNoAutofocus)return;

  const VERSION='0.25.76';
  let baseOpen=null;

  const byId=id=>document.getElementById(id);

  function editScope(){
    const field=byId('editCustomer')||byId('editWhatsapp')||byId('editBirthDate');
    return field?.closest?.('.sheet-wrap')||field?.closest?.('.sheet')||null;
  }

  function removeAutofocus(){
    const scope=editScope();
    if(!scope)return;
    scope.querySelectorAll('[autofocus]').forEach(el=>el.removeAttribute('autofocus'));
  }

  function blurFocusedField(){
    const scope=editScope();
    const active=document.activeElement;
    if(!scope||!active||active===document.body||!scope.contains(active))return;
    if(typeof active.blur==='function')active.blur();
  }

  function neutralizeInitialFocus(){
    removeAutofocus();
    blurFocusedField();
    if(typeof queueMicrotask==='function')queueMicrotask(blurFocusedField);
    if(typeof requestAnimationFrame==='function')requestAnimationFrame(blurFocusedField);
  }

  function patchOpenEditCommand(){
    const current=window.openEditCommandSheet;
    if(typeof current!=='function'||current.__v02576NoAutofocus)return;
    baseOpen=current;
    const patched=function(){
      const result=baseOpen.apply(this,arguments);
      neutralizeInitialFocus();
      return result;
    };
    patched.__v02576NoAutofocus=true;
    patched.__v02576Base=baseOpen;
    try{window.openEditCommandSheet=patched;}catch{}
    try{openEditCommandSheet=patched;}catch{}
  }

  function refresh(){
    removeAutofocus();
    patchOpenEditCommand();
  }

  function start(){
    refresh();
    document.addEventListener('visibilitychange',()=>{
      if(document.visibilityState==='visible')refresh();
    });
    window.Rota27V02576EditNoAutofocus={version:VERSION,refresh,neutralizeInitialFocus};
    console.info('[Rota27] v0.25.76 — Editar comanda sem foco automático.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
