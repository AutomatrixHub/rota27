/* Rota 27 v0.25.100 — Produto/categoria sem foco (responsabilidade única) */
(function(){
  'use strict';
  if(window.Rota27V02580ProductCategoryNoAutofocus)return;

  const VERSION='0.25.100';
  const GUARD_MS=220;
  const byId=id=>document.getElementById(id);

  function removeIconField(){
    const current=byId('menuItemEmoji');
    if(!current||current.type==='hidden')return;
    const row=current.closest?.('.field-row');
    const field=current.closest?.('.field');
    const hidden=document.createElement('input');
    hidden.type='hidden';
    hidden.id='menuItemEmoji';
    hidden.value=current.value||'🍽️';
    if(field)field.replaceWith(hidden);else current.replaceWith(hidden);
    if(row){
      row.classList.add('v02580-single-field');
      row.style.gridTemplateColumns='1fr';
    }
  }

  function scopeById(id){return byId(id)||null;}

  function removeAutofocus(scope){
    if(!scope)return;
    scope.querySelectorAll('[autofocus]').forEach(el=>el.removeAttribute('autofocus'));
  }

  function blurInside(scope){
    const active=document.activeElement;
    if(!scope||!active||active===document.body||!scope.contains(active))return;
    if(typeof active.blur==='function')active.blur();
  }

  function neutralize(scope){
    removeAutofocus(scope);
    blurInside(scope);
    if(typeof queueMicrotask==='function')queueMicrotask(()=>blurInside(scope));
    if(typeof requestAnimationFrame==='function')requestAnimationFrame(()=>blurInside(scope));
  }

  function guardedOpen(base,args,wrapId,targetIds){
    const proto=window.HTMLElement?.prototype;
    const inputProto=window.HTMLInputElement?.prototype;
    const nativeFocus=proto?.focus;
    const nativeSelect=inputProto?.select;
    let guardedFocus=null;
    let guardedSelect=null;

    const wrap=()=>scopeById(wrapId);
    removeAutofocus(wrap());

    if(proto&&typeof nativeFocus==='function'){
      guardedFocus=function(){
        const scope=wrap();
        if(scope?.classList?.contains('open')&&targetIds.includes(this?.id))return;
        return nativeFocus.apply(this,arguments);
      };
      try{proto.focus=guardedFocus;}catch{}
    }

    if(inputProto&&typeof nativeSelect==='function'){
      guardedSelect=function(){
        const scope=wrap();
        if(scope?.classList?.contains('open')&&targetIds.includes(this?.id))return;
        return nativeSelect.apply(this,arguments);
      };
      try{inputProto.select=guardedSelect;}catch{}
    }

    let result;
    try{
      result=base.apply(this,args);
      const scope=wrap();
      neutralize(scope);
      window.setTimeout(()=>neutralize(scope),140);
      window.setTimeout(()=>neutralize(scope),185);
    }finally{
      window.setTimeout(()=>{
        try{if(proto&&guardedFocus&&proto.focus===guardedFocus)proto.focus=nativeFocus;}catch{}
        try{if(inputProto&&guardedSelect&&inputProto.select===guardedSelect)inputProto.select=nativeSelect;}catch{}
      },GUARD_MS);
    }
    return result;
  }

  function patchProductEditor(){
    const current=window.openMenuItemSheet;
    if(typeof current!=='function'||current.__v02580r2NoAutofocus)return;
    const base=current;
    const patched=function(){
      removeIconField();
      return guardedOpen.call(this,base,arguments,'menuItemWrap',['menuItemName']);
    };
    patched.__v02580r2NoAutofocus=true;
    patched.__v02580r2Base=base;
    try{window.openMenuItemSheet=patched;}catch{}
    try{openMenuItemSheet=patched;}catch{}
  }

  function patchCategoryEditor(){
    const current=window.openCategorySheet;
    if(typeof current!=='function'||current.__v02580r2NoAutofocus)return;
    const base=current;
    const patched=function(){
      return guardedOpen.call(this,base,arguments,'categoryWrap',['categoryName']);
    };
    patched.__v02580r2NoAutofocus=true;
    patched.__v02580r2Base=base;
    try{window.openCategorySheet=patched;}catch{}
    try{openCategorySheet=patched;}catch{}
  }

  function refresh(){
    removeIconField();
    patchProductEditor();
    patchCategoryEditor();
  }

  function start(){
    refresh();
    document.addEventListener('visibilitychange',()=>{
      if(document.visibilityState==='visible')refresh();
    });
    window.Rota27V02580ProductCategoryNoAutofocus={version:VERSION,refresh,removeIconField};
    console.info('[Rota27] v0.25.100 — edição de produto/categoria sem foco automático.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
