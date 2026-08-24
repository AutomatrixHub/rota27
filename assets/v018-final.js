/* Rota 27 v0.18.0 — selo final da candidata */
(function(){
  'use strict';
  const VERSION='0.18.0';
  const LABEL='v0.18.0';
  const TITLE='Rota 27 Bodega • Comandas v0.18.0';
  let badgeObserver=null;
  let titleObserver=null;
  function apply(){
    const badge=document.getElementById('v14VersionBadge');
    if(badge&&badge.textContent!==LABEL)badge.textContent=LABEL;
    if(document.title!==TITLE)document.title=TITLE;
    try{window.ROTA27_SYNC_DEV_VERSION=VERSION;}catch{}
  }
  function protect(){
    apply();
    const badge=document.getElementById('v14VersionBadge'),title=document.querySelector('title');
    if(badge&&!badgeObserver){badgeObserver=new MutationObserver(apply);badgeObserver.observe(badge,{childList:true,characterData:true,subtree:true});}
    if(title&&!titleObserver){titleObserver=new MutationObserver(apply);titleObserver.observe(title,{childList:true,characterData:true,subtree:true});}
  }
  function start(){protect();window.addEventListener('online',()=>setTimeout(apply,0));window.addEventListener('offline',()=>setTimeout(apply,0));window.addEventListener('pageshow',()=>setTimeout(apply,0));setTimeout(apply,50);setTimeout(apply,3500);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
