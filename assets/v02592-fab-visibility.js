/* Rota 27 v0.25.92 — FAB Nova comanda somente em Comandas */
(function(){
  'use strict';
  if(window.Rota27V02592FabVisibility)return;
  const VERSION='0.25.92';
  let raf=0;

  const byId=id=>document.getElementById(id);

  function syncFab(){
    raf=0;
    const fab=byId('fabNew');
    if(!fab)return;
    const commands=byId('screenCommands')?.classList.contains('active')===true;
    if(commands){
      fab.style.display='block';
      fab.style.pointerEvents='auto';
      fab.disabled=false;
    }else{
      fab.style.display='none';
      fab.style.pointerEvents='none';
    }
  }

  function schedule(){
    if(raf)return;
    raf=requestAnimationFrame(syncFab);
  }

  function wrapShowScreen(){
    const current=window.showScreen;
    if(typeof current!=='function')return false;
    if(current.__v02592FabVisibility===true)return true;
    const wrapped=function(){
      const result=current.apply(this,arguments);
      if(typeof queueMicrotask==='function')queueMicrotask(syncFab);else Promise.resolve().then(syncFab);
      requestAnimationFrame(syncFab);
      return result;
    };
    wrapped.__v02592FabVisibility=true;
    wrapped.__v02592Base=current;
    try{window.showScreen=wrapped;showScreen=wrapped;}catch{window.showScreen=wrapped;}
    return true;
  }

  function onClick(event){
    if(event.target.closest?.('.navbtn,[data-go],[data-screen],#v02591MenuClose')){
      if(typeof queueMicrotask==='function')queueMicrotask(syncFab);else Promise.resolve().then(syncFab);
      requestAnimationFrame(syncFab);
    }
  }

  function settle(){wrapShowScreen();syncFab();}
  function start(){
    settle();
    document.addEventListener('click',onClick,true);
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')schedule();});
    window.addEventListener('pageshow',schedule);
    [120,500,1200].forEach(ms=>setTimeout(settle,ms));
    window.Rota27V02592FabVisibility={version:VERSION,refresh:settle};
    console.info('[Rota27] v0.25.92 — FAB restrito à tela Comandas.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
