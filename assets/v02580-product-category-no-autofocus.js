/* Rota 27 v0.25.80-r4 — Produto/categoria sem foco + paridade real do empty state Lista/Mapa */
(function(){
  'use strict';
  if(window.Rota27V02580ProductCategoryNoAutofocus)return;

  const VERSION='0.25.80-r4';
  const GUARD_MS=220;
  const byId=id=>document.getElementById(id);

  function ensureR3Layout(){
    if(!byId('v02580R3ListEmptyTopbarCss')){
      const link=document.createElement('link');
      link.id='v02580R3ListEmptyTopbarCss';
      link.rel='stylesheet';
      link.href='./assets/v02580-r3-list-empty-topbar.css?v=02580r3';
      document.head.appendChild(link);
    }

    const subtitle=document.querySelector('.topbar .brand-copy > small');
    if(subtitle&&subtitle.dataset.v02580r3Split!=='1'){
      const first=document.createElement('span');
      const second=document.createElement('span');
      first.className='v02580r3-subline';
      second.className='v02580r3-subline';
      first.textContent='Das delícias capixabas •';
      second.textContent='Jardim Camburi';
      subtitle.replaceChildren(first,second);
      subtitle.dataset.v02580r3Split='1';
    }
    document.body?.classList.add('v02597-topbar-ready');
  }

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
    ensureR3Layout();
    removeIconField();
    patchProductEditor();
    patchCategoryEditor();
  }

  function start(){
    refresh();
    document.addEventListener('visibilitychange',()=>{
      if(document.visibilityState==='visible')refresh();
    });
    window.Rota27V02580ProductCategoryNoAutofocus={version:VERSION,refresh,removeIconField,ensureR3Layout};
    console.info('[Rota27] v0.25.80-r4 — correções de edição e Topbar preservadas; estado vazio pertence ao shell canônico.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
