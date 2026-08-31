/* Rota 27 v0.25.88 — estado vazio da Lista somente quando realmente vazio */
(function(){
  'use strict';
  if(window.Rota27V02588ListEmptyVisibility)return;

  const VERSION='0.25.88';
  const byId=id=>document.getElementById(id);
  let baseRender=null;

  function openCommands(){
    try{return Array.isArray(state?.commands)?state.commands.filter(c=>c?.cancelled!==true):[];}
    catch{return [];}
  }

  function sync(){
    const empty=byId('commandsEmpty');
    if(!empty)return false;
    const hasOpen=openCommands().length>0;
    empty.style.setProperty('display',hasOpen?'none':'block','important');
    empty.setAttribute('aria-hidden',hasOpen?'true':'false');
    return true;
  }

  function patchRender(){
    const current=window.renderCommands;
    if(typeof current!=='function'||current.__v02588ListEmptyVisibility)return false;
    baseRender=current;
    const patched=function(){
      const result=baseRender.apply(this,arguments);
      try{sync();}catch{}
      return result;
    };
    patched.__v02588ListEmptyVisibility=true;
    try{window.renderCommands=patched;}catch{}
    try{renderCommands=patched;}catch{}
    return true;
  }

  function schedule(){setTimeout(sync,0);}

  function start(){
    patchRender();
    sync();
    setTimeout(()=>{patchRender();sync();},120);
    window.addEventListener('rota27:v017-domain-updated',schedule);
    document.addEventListener('click',event=>{
      if(event.target.closest?.('#navCommands,[data-v0252-view="list"]'))schedule();
    });
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')schedule();});
    window.Rota27V02588ListEmptyVisibility={version:VERSION,sync,patchRender};
    console.info('[Rota27] v0.25.88 — estado vazio da Lista condicionado às comandas abertas.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
