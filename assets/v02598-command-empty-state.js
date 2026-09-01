/* Rota 27 v0.25.98 — proprietário único do estado vazio da Lista */
(function(){
  'use strict';
  if(window.Rota27V02598CommandEmptyState)return;

  const VERSION='0.25.98';
  const byId=id=>document.getElementById(id);
  let renderPatched=false;

  function openCommands(){
    try{return Array.isArray(state?.commands)?state.commands.filter(c=>c?.cancelled!==true):[];}
    catch{return [];}
  }

  function sync(){
    const screen=byId('screenCommands');
    const empty=byId('commandsEmpty');
    if(!screen||!empty)return false;
    const show=screen.dataset.v0252View!=='map'&&openCommands().length===0;
    empty.style.display=show?'block':'none';
    empty.setAttribute('aria-hidden',show?'false':'true');
    return true;
  }

  function patchRender(){
    if(renderPatched)return false;
    const current=window.renderCommands;
    if(typeof current!=='function')return false;
    const patched=function(){
      const result=current.apply(this,arguments);
      sync();
      return result;
    };
    patched.__v02598CommandEmptyState=true;
    try{window.renderCommands=patched;}catch{}
    try{renderCommands=patched;}catch{}
    renderPatched=true;
    return true;
  }

  function schedule(){window.setTimeout(sync,0);}

  function start(){
    patchRender();
    sync();
    document.addEventListener('click',event=>{
      if(event.target.closest?.('#navCommands,[data-v0252-view]'))schedule();
    });
    window.addEventListener('rota27:v017-domain-updated',schedule);
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')schedule();});
    window.Rota27V02598CommandEmptyState={version:VERSION,sync};
    console.info('[Rota27] v0.25.98 — Lista e Mapa possuem estados vazios independentes.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
