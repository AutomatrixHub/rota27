/* Rota 27 v0.22.0 — libera runtime após o Estoque Essencial registrar seu start */
(function(){
  'use strict';
  function release(){
    const meta=document.querySelector('meta[name="rota27-version"]');
    if(meta&&String(meta.getAttribute('content')||'')==='0.21.0')meta.setAttribute('content','0.22.0');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',release,{once:true});else release();
})();
