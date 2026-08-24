/* Rota 27 v0.21.0 — amostra de estoque somente na preview */
(function(){
  'use strict';
  if(new URLSearchParams(location.search).get('preview')!=='v0210')return;
  const CONFIG_KEY='rota27_v021_inventory_config_v1';
  const MOVEMENTS_KEY='rota27_v021_inventory_movements_v1';

  function seed(){
    let products=[];
    try{products=Array.isArray(state?.catalog)?state.catalog.filter(p=>p&&p.id&&p.active!==false):[];}catch{}
    if(!products.length)return false;
    let existing={};
    try{existing=JSON.parse(localStorage.getItem(CONFIG_KEY)||'{}')||{};}catch{}
    if(Object.keys(existing).length)return true;

    const stocks=[18,4,0,9,2,15],mins=[5,5,3,4,4,6],now=Date.now();
    const map={};
    products.slice(0,6).forEach((p,i)=>{
      map[String(p.id)]={productId:String(p.id),enabled:true,baseQty:stocks[i%stocks.length],minQty:mins[i%mins.length],trackingFrom:now,updatedAt:now+i,updatedBy:'Preview v0.21.0'};
    });
    localStorage.setItem(CONFIG_KEY,JSON.stringify(map));
    localStorage.setItem(MOVEMENTS_KEY,'[]');
    window.dispatchEvent(new StorageEvent('storage',{key:CONFIG_KEY,newValue:JSON.stringify(map)}));
    return true;
  }

  function banner(){
    const status=document.getElementById('v021StockStatus');
    if(!status||document.getElementById('v021PreviewBanner'))return false;
    const el=document.createElement('div');el.id='v021PreviewBanner';el.className='v021-status warn';
    el.innerHTML='<strong>Preview com amostra de estoque</strong><br>Alguns produtos foram pré-configurados somente neste endereço de preview para acelerar o teste. Isso não altera a PWA de produção.';
    status.insertAdjacentElement('afterend',el);return true;
  }

  let tries=0;
  const timer=setInterval(()=>{
    tries++;
    const ok=seed();
    if(ok&&window.Rota27V021){try{window.Rota27V021.reconcileSales();}catch{}}
    banner();
    if(ok&&document.getElementById('v021PreviewBanner'))clearInterval(timer);
    if(tries>50)clearInterval(timer);
  },150);
})();
