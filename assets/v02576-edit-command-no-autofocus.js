/* Rota 27 v0.25.76 — Editar comanda sem foco automático */
(function(){
  'use strict';
  if(window.Rota27V02576EditNoAutofocus)return;

  const VERSION='0.25.76';
  const GUARD_MS=240;
  const byId=id=>document.getElementById(id);

  function editScope(){
    const field=byId('editTable')||byId('editCustomer')||byId('editWhatsapp')||byId('editBirthDate');
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

    const base=current;
    const patched=function(){
      const proto=window.HTMLElement?.prototype;
      const nativeFocus=proto?.focus;
      let guardedFocus=null;

      removeAutofocus();

      if(proto&&typeof nativeFocus==='function'){
        guardedFocus=function(){
          const wrap=byId('editCommandWrap');
          if(this?.id==='editTable'&&wrap?.classList?.contains('open'))return;
          return nativeFocus.apply(this,arguments);
        };
        try{proto.focus=guardedFocus;}catch{}
      }

      let result;
      try{
        result=base.apply(this,arguments);
        neutralizeInitialFocus();
      }finally{
        if(proto&&guardedFocus){
          window.setTimeout(()=>{
            try{if(proto.focus===guardedFocus)proto.focus=nativeFocus;}catch{}
          },GUARD_MS);
        }
      }
      return result;
    };

    patched.__v02576NoAutofocus=true;
    patched.__v02576Base=base;
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
    console.info('[Rota27] v0.25.76 — foco automático tardio da edição bloqueado na origem.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
