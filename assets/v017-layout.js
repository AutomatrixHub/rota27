/* Rota 27 v0.17.0 — hierarquia da identificação na comanda aberta */
(function(){
  'use strict';
  let baseRenderSale=null;

  function byId(id){return document.getElementById(id);}
  function clean(v){return String(v??'').trim().replace(/\s+/g,' ');}

  function applySaleIdentity(){
    let c=null;
    try{c=typeof currentCommand==='function'?currentCommand():null;}catch{}
    if(!c)return;
    const title=byId('saleTitle');
    const subtitle=byId('saleSubtitle');
    const detail=title?.closest('.detail-title');
    if(!title||!detail)return;

    const customer=clean(c.customer);
    const location=clean(c.table);
    title.textContent=customer||location||'Comanda';

    let loc=byId('v017SaleLocation');
    if(!loc){
      loc=document.createElement('p');
      loc.id='v017SaleLocation';
      loc.className='v017-sale-location';
      title.insertAdjacentElement('afterend',loc);
    }
    loc.textContent=customer&&location?location:'';
    loc.style.display=customer&&location?'block':'none';
    if(subtitle)subtitle.classList.add('v017-sale-subtitle');
  }

  function patch(){
    if(baseRenderSale||typeof renderSale!=='function')return;
    baseRenderSale=renderSale;
    const wrapped=function(){
      const result=baseRenderSale.apply(this,arguments);
      applySaleIdentity();
      return result;
    };
    try{renderSale=wrapped;}catch{}
    try{window.renderSale=wrapped;}catch{}
    if(byId('screenSale')?.classList.contains('active'))applySaleIdentity();
  }

  function start(){
    patch();
    document.addEventListener('click',()=>{if(byId('screenSale')?.classList.contains('active'))setTimeout(applySaleIdentity,0);},{passive:true});
    window.addEventListener('rota27:v017-domain-updated',()=>{if(byId('screenSale')?.classList.contains('active'))applySaleIdentity();});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
