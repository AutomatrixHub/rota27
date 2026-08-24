/* Rota 27 v0.22.0 — bootstrap compatível do Estoque Essencial v0.21 */
(function(){
  'use strict';
  const meta=document.querySelector('meta[name="rota27-version"]');
  if(meta&&String(meta.getAttribute('content')||'')==='0.22.0')meta.setAttribute('content','0.21.0');
})();
