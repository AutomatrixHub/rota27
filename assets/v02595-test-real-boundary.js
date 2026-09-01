/* Rota 27 v0.25.95 — barreira atômica Modo Teste -> dados reais */
(function(){
  'use strict';
  if(window.Rota27V02595TestRealBoundary)return;

  const VERSION='0.25.95';
  const EXIT_MARK='rota27_v02595_test_exit_rehydrate';
  let exiting=false;
  let reloadScheduled=false;

  const isTestCommand=c=>!!c&&(c.testMode===true||/^test_(?:open|cmd)_/i.test(String(c.id||'')));
  const isTestActive=()=>window.Rota27V02581TestMode?.isActive?.()===true||document.body?.classList.contains('v02581-test-mode');

  function stateCommands(){
    try{return Array.isArray(state?.commands)?state.commands:null;}catch{}
    try{return Array.isArray(window.state?.commands)?window.state.commands:null;}catch{}
    return null;
  }

  function hasTestArtifacts(){
    const rows=stateCommands();
    return Array.isArray(rows)&&rows.some(isTestCommand);
  }

  function boundaryActive(){
    return exiting||(!isTestActive()&&hasTestArtifacts());
  }

  function clearTransientTestUi(){
    const contaminated=hasTestArtifacts();
    document.querySelectorAll('[data-v02582-test-command]').forEach(node=>node.remove());
    const list=document.getElementById('commandList');if(list&&contaminated)list.innerHTML='';
    const count=document.getElementById('openCount');if(count&&contaminated)count.textContent='0';
    const total=document.getElementById('openTotal');if(total&&contaminated)total.textContent='R$ 0,00';
    const items=document.getElementById('openItems');if(items&&contaminated)items.textContent='0';
  }

  function purgeTestCommandsFromMemory(){
    const rows=stateCommands();
    if(!Array.isArray(rows))return 0;
    const clean=rows.filter(c=>!isTestCommand(c));
    const removed=rows.length-clean.length;
    if(!removed)return 0;
    try{if(state&&Array.isArray(state.commands))state.commands=clean;}catch{}
    try{if(window.state&&Array.isArray(window.state.commands))window.state.commands=clean;}catch{}
    return removed;
  }

  function installSaveBoundary(){
    let base=null;
    try{base=window.save||save;}catch{base=window.save;}
    if(typeof base!=='function'||base.__v02595Boundary)return;
    const guarded=function(){
      if(boundaryActive()){
        console.info('[Rota27 v0.25.95] persistência adiada durante restauração Teste -> Real.');
        return true;
      }
      return base.apply(this,arguments);
    };
    guarded.__v02595Boundary=true;
    guarded.__v02595Base=base;
    try{window.save=guarded;}catch{}
    try{save=guarded;}catch{}
  }

  function installSyncBoundary(){
    const base=window.fetch;
    if(typeof base!=='function'||base.__v02595Boundary)return;
    const wrapped=function(input,init){
      const url=String(input?.url||input||'');
      if(boundaryActive()&&/\/functions\/v1\/rota27-sync(?:\?|$|\/)/i.test(url)){
        console.info('[Rota27 v0.25.95] sync adiado durante restauração Teste -> Real.');
        return Promise.reject(new Error('Sincronização aguardando restauração dos dados reais.'));
      }
      return base.apply(this,arguments);
    };
    wrapped.__v02595Boundary=true;
    wrapped.__v02595Base=base;
    window.fetch=wrapped;
  }

  function scheduleRealRehydrate(reason){
    if(reloadScheduled)return;
    exiting=true;
    reloadScheduled=true;
    /* O bloqueio de save/sync entra antes de qualquer limpeza do state. */
    installSaveBoundary();
    installSyncBoundary();
    clearTransientTestUi();
    purgeTestCommandsFromMemory();
    try{sessionStorage.setItem(EXIT_MARK,JSON.stringify({version:VERSION,at:Date.now(),reason:String(reason||'exit')}));}catch{}
    /* O localStorage real nunca foi sobrescrito pelo sandbox. Um reload único força
       todas as camadas legadas a reconstruírem state/DOM exclusivamente dessa base. */
    setTimeout(()=>location.reload(),80);
  }

  function onModeChanged(event){
    if(event?.detail?.active===false)scheduleRealRehydrate('test-mode-changed');
  }

  function recoverIfNeeded(){
    let marked=false;
    try{marked=!!sessionStorage.getItem(EXIT_MARK);sessionStorage.removeItem(EXIT_MARK);}catch{}
    if(isTestActive())return;
    if(hasTestArtifacts()){
      scheduleRealRehydrate(marked?'post-exit-artifact':'stale-test-artifact');
      return;
    }
    exiting=false;
  }

  function start(){
    installSaveBoundary();
    installSyncBoundary();
    /* capture: a barreira reage antes dos listeners normais que re-renderizam a UI. */
    window.addEventListener('rota27:test-mode-changed',onModeChanged,true);
    recoverIfNeeded();
    window.Rota27V02595TestRealBoundary={version:VERSION,hasTestArtifacts,recover:scheduleRealRehydrate};
    console.info('[Rota27] v0.25.95 — fronteira Modo Teste / dados reais protegida.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
