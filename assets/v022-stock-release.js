/* Rota 27 v0.22.0 — libera runtime após o Estoque Essencial registrar seu start */
(function(){
  'use strict';

  function exposeLiveState(){
    try{
      const current=Object.getOwnPropertyDescriptor(window,'state');
      if(!current||current.configurable){
        Object.defineProperty(window,'state',{
          configurable:true,
          enumerable:false,
          get(){return state;},
          set(value){state=value;}
        });
      }
    }catch(err){
      console.warn('[Rota27] Não foi possível expor o estado legado para a v0.22.',err);
    }
  }

  function release(){
    exposeLiveState();
    const meta=document.querySelector('meta[name="rota27-version"]');
    if(meta&&String(meta.getAttribute('content')||'')==='0.21.0')meta.setAttribute('content','0.22.0');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',release,{once:true});else release();
})();
