/* Rota 27 v0.25.12 — pequenos gates de segurança do A Receber */
(function(){
  'use strict';

  function resetPaymentConfirmationIfDue(target){
    if(target?.id!=='v14PaymentMethod'||target.value!=='A receber')return;
    try{paymentConfirmed=false;}catch{}
    try{window.renderPaymentConfirmation?.();}catch{}
  }

  function normalizePaymentAmount(target){
    if(target?.id!=='v02512PaymentAmount')return;
    const raw=String(target.value||'').trim();
    if(!raw||raw.includes(','))return;
    if(/^\d+\.\d{1,2}$/.test(raw))target.value=raw.replace('.',',');
  }

  function start(){
    document.addEventListener('change',e=>{resetPaymentConfirmationIfDue(e.target);normalizePaymentAmount(e.target);},true);
    document.addEventListener('blur',e=>normalizePaymentAmount(e.target),true);
    window.Rota27V02512Safety={version:'0.25.12'};
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
