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
  }

  function ensureR4ListParityCss(){
    if(byId('v02580R4ListEmptyParityCss'))return;
    const link=document.createElement('link');
    link.id='v02580R4ListEmptyParityCss';
    link.rel='stylesheet';
    link.href='./assets/v02580-r4-list-empty-parity.css?v=02580r4';
    document.head.appendChild(link);
  }

  function syncListEmpty(){
    const empty=byId('commandsEmpty');
    if(!empty)return false;

    empty.classList.add('v0252-map-empty','v02580r4-list-empty');

    const children=Array.from(empty.children||[]);
    const canonical=children.length===2
      && children[0]?.tagName==='STRONG'
      && children[1]?.tagName==='SPAN'
      && children[0]?.textContent==='Nenhuma comanda aberta'
      && children[1]?.textContent==='Use um dos atalhos acima para abrir a primeira.';

    if(!canonical){
      const title=document.createElement('strong');
      const hint=document.createElement('span');
      title.textContent='Nenhuma comanda aberta';
      hint.textContent='Use um dos atalhos acima para abrir a primeira.';
      empty.replaceChildren(title,hint);
    }

    empty.dataset.v02580r4Canonical='1';
    return true;
  }

  function ensureR4ListParity(){
    ensureR4ListParityCss();
    syncListEmpty();
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
    ensureR4ListParity();
    removeIconField();
    patchProductEditor();
    patchCategoryEditor();
  }

  function start(){
    refresh();
    window.addEventListener('rota27:v017-domain-updated',()=>window.setTimeout(syncListEmpty,0));
    document.addEventListener('click',event=>{
      if(event.target.closest?.('[data-v0252-view="list"],#navCommands'))window.setTimeout(syncListEmpty,0);
    });
    document.addEventListener('visibilitychange',()=>{
      if(document.visibilityState==='visible')refresh();
    });
    window.Rota27V02580ProductCategoryNoAutofocus={version:VERSION,refresh,removeIconField,ensureR3Layout,ensureR4ListParity,syncListEmpty};
    console.info('[Rota27] v0.25.80-r4 — Lista usa o mesmo empty state canônico do Mapa; demais correções v0.25.80 preservadas.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
