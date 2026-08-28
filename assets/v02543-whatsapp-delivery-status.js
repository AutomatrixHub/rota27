/* Rota 27 v0.25.43 — Status real de entrega do WhatsApp */
(function(){
  'use strict';
  const VERSION='0.25.43';
  function api(){return window.Rota27V017||null;}
  function patchToast(){
    const a=api();
    if(!a||typeof a.toast!=='function'||a.__v02543DeliveryToastPatched)return false;
    const original=a.toast.bind(a);
    a.toast=function(message,...args){
      const text=String(message??'').trim();
      const m=text.match(/^(\d+) convite\(s\) enviado\(s\)(?:\s*•\s*(\d+) falha\(s\))?\.$/i);
      if(m){
        const accepted=Number(m[1]||0),failed=Number(m[2]||0);
        if(accepted>0){
          const suffix=failed?` • ${failed} falha${failed===1?'':'s'}.`:'.';
          return original(`${accepted} convite${accepted===1?'':'s'} aceito${accepted===1?'':'s'} pela Meta${suffix} A entrega é confirmada depois pelo WhatsApp.`,...args);
        }
      }
      return original(message,...args);
    };
    a.__v02543DeliveryToastPatched=true;
    return true;
  }
  function clarifyCampaign(){
    const stats=document.getElementById('v02540CampaignStats');
    if(!stats)return false;
    stats.querySelectorAll('span').forEach(span=>{
      if(String(span.textContent||'').trim().toLowerCase()==='enviados')span.textContent='aceitos Meta';
    });
    if(!document.getElementById('v02543DeliveryNote')){
      const note=document.createElement('small');
      note.id='v02543DeliveryNote';
      note.className='v02540-footnote';
      note.textContent='Aceito pela Meta não significa entregue. O Rota 27 agora acompanha os retornos de entrega do WhatsApp; falhas confirmadas passam a aparecer em Falhas e ficam liberadas para nova tentativa.';
      stats.insertAdjacentElement('afterend',note);
    }
    return true;
  }
  function settle(){[0,80,220,500].forEach(ms=>setTimeout(()=>{patchToast();clarifyCampaign();},ms));}
  function start(){
    patchToast();settle();
    document.addEventListener('click',e=>{
      if(e.target.closest?.('#v02540OpenEvents,.v02540-event-card .open,#v02540RefreshStatus,#v02540SendCampaign,#v02540SelectAll,#v02540SelectNone'))settle();
    });
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')settle();});
    window.Rota27V02543WhatsAppDelivery={version:VERSION,refresh:clarifyCampaign};
    console.info('[Rota27] v0.25.43 — acompanhamento de entrega do WhatsApp carregado.');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
