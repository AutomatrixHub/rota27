/* Rota 27 v0.25.42 — Feedback de envio de convites */
(function(){
  'use strict';
  const VERSION='0.25.42';
  function patchToast(){
    const api=window.Rota27V017;
    if(!api||typeof api.toast!=='function'||api.__v02542EventToastPatched)return false;
    const original=api.toast.bind(api);
    api.toast=function(message,...args){
      const text=String(message??'').trim();
      if(/^0 convite\(s\) enviado\(s\)\.$/i.test(text)){
        return original('Nenhum novo convite foi enviado. Quem já recebeu este evento não recebe novamente.',...args);
      }
      return original(message,...args);
    };
    api.__v02542EventToastPatched=true;
    return true;
  }
  function start(){
    patchToast();
    setTimeout(patchToast,120);
    setTimeout(patchToast,500);
    window.Rota27V02542EventSendFeedback={version:VERSION,patchToast};
    console.info('[Rota27] v0.25.42 — feedback de envio de convites carregado.');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
