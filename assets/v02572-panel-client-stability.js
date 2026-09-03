/* Rota 27 v0.25.72 — estabilidade do seletor de clientes + Painel */
(function(){
  'use strict';
  const VERSION='0.25.72';
  const byId=id=>document.getElementById(id);

 function removeLegacyDatalist(){
    const dl=byId('v017ClientSuggestions');
    if(dl)dl.remove();
  }

  function guardCustomerInput(){
    const input=byId('newCustomer');
    if(!input)return false;
    removeLegacyDatalist();
    input.removeAttribute('list');
    input.setAttribute('autocomplete','off');
    input.setAttribute('name','rota27_customer_picker_v02572');
    input.setAttribute('autocorrect','off');
    input.setAttribute('autocapitalize','words');
    input.setAttribute('spellcheck','false');
    input.setAttribute('aria-autocomplete','list');
    input.setAttribute('aria-controls','v02513ClientPicker');

    if(input.dataset.v02572ListGuard!=='1'){
      const nativeSet=input.setAttribute.bind(input);
      const guarded=function(name,value){
        if(String(name||'').toLowerCase()==='list')return;
        return nativeSet(name,value);
      };
      try{
        Object.defineProperty(input,'setAttribute',{configurable:true,writable:true,value:guarded});
        input.dataset.v02572ListGuard='1';
      }catch(err){console.warn('[Rota27 v0.25.72] proteção do campo Cliente:',err);}
    }
    return true;
  }

  function refreshClientPicker(){
    guardCustomerInput();
    try{window.Rota27V02571ClientPicker?.refresh?.();}catch(err){console.warn('[Rota27 v0.25.72] seletor de clientes:',err);}
    guardCustomerInput();
  }

  function panelCleanup(){
    const legacy=byId('v02512ReceivablesEntry');
    if(legacy)legacy.setAttribute('aria-hidden','true');
    try{window.Rota27V02551UX?.renderAttention?.();}catch{}
  }

  function refresh(){
    refreshClientPicker();
    panelCleanup();
  }

  function start(){
    refreshClientPicker();
    panelCleanup();

    document.addEventListener('focusin',e=>{
      if(e.target?.id==='newCustomer'){
        guardCustomerInput();
        queueMicrotask(()=>guardCustomerInput());
      }
    },true);

    document.addEventListener('click',e=>{
      if(e.target.closest?.('#fabNew,#commandsEmpty [onclick*="openNewCommandSheet"]')){
        queueMicrotask(refreshClientPicker);
      }
      if(e.target.closest?.('#navPanel'))requestAnimationFrame(panelCleanup);
    });

    ['rota27:v017-domain-updated','rota27:v02512-receivables-updated'].forEach(name=>{
      window.addEventListener(name,()=>{
        refreshClientPicker();
        if(name==='rota27:v02512-receivables-updated')panelCleanup();
      });
    });

    window.addEventListener('storage',refreshClientPicker);
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refresh();});

    window.Rota27V02572ClientPicker={version:VERSION,refresh,guardCustomerInput,panelCleanup};
    console.info('[Rota27] v0.25.72 — seletor de clientes e Painel estabilizados.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
