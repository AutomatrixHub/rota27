/* Rota 27 v0.25.11 — Produtos mais vendidos por ID com nome atual do catálogo */
(function(){
  'use strict';

  const VERSION='0.25.11';
  let baseRenderHistory=null;
  let refreshTimer=null;

  function byId(id){return document.getElementById(id);}
  function esc(v){
    if(typeof escapeHtml==='function')return escapeHtml(String(v??''));
    return String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }
  function moneyValue(v){
    try{return typeof money==='function'?money(Number(v||0)):Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}catch{return 'R$ 0,00';}
  }
  function normText(value){
    return String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLocaleLowerCase('pt-BR');
  }
  function startOfToday(){const d=new Date();d.setHours(0,0,0,0);return d.getTime();}
  function selectedPeriod(){return document.querySelector('#v14HistoryToolbar [data-period].active')?.dataset?.period||'today';}
  function periodStart(period){
    if(period==='all')return 0;
    const today=startOfToday();
    if(period==='today')return today;
    const days=period==='7d'?7:30;
    return today-(days-1)*86400000;
  }
  function currentProduct(id){
    return Array.isArray(state?.catalog)?state.catalog.find(p=>String(p?.id||'')===String(id)):null;
  }
  function historicalMeta(command,id){
    const meta=command?.itemMeta?.[id];
    if(meta)return meta;
    return currentProduct(id)||null;
  }
  function displayName(command,id){
    const current=currentProduct(id);
    if(current?.name)return String(current.name);
    const meta=historicalMeta(command,id);
    return String(meta?.name||'Produto removido');
  }
  function historicalPrice(command,id){
    const meta=historicalMeta(command,id);
    return Number(meta?.price||0);
  }
  function commandMatches(command,q){
    if(!q)return true;
    const productNames=Object.keys(command?.items||{}).flatMap(id=>{
      const meta=historicalMeta(command,id);
      return [displayName(command,id),String(meta?.name||'')];
    }).join(' ');
    const hay=normText([command?.table,command?.customer,command?.paymentMethod,productNames].filter(Boolean).join(' '));
    return hay.includes(q);
  }
  function filteredHistory(){
    const cutoff=periodStart(selectedPeriod());
    const q=normText(byId('v14HistorySearch')?.value||'');
    return (Array.isArray(state?.history)?state.history:[])
      .filter(h=>Number(h?.closedAt||0)>=cutoff)
      .filter(h=>commandMatches(h,q));
  }
  function aggregateProducts(rows){
    const products=new Map();
    rows.forEach(command=>{
      Object.entries(command?.items||{}).forEach(([id,qtyRaw])=>{
        const qty=Number(qtyRaw||0);
        if(qty<=0)return;
        const key=String(id);
        const row=products.get(key)||{id:key,name:displayName(command,key),qty:0,revenue:0};
        row.name=displayName(command,key);
        row.qty+=qty;
        row.revenue+=qty*historicalPrice(command,key);
        products.set(key,row);
      });
    });
    return [...products.values()].sort((a,b)=>b.qty-a.qty||b.revenue-a.revenue).slice(0,7);
  }
  function render(){
    const target=byId('v14TopProducts');
    if(!target)return;
    const rows=aggregateProducts(filteredHistory());
    if(!rows.length){
      target.innerHTML='<div class="v14-mini-empty">Sem itens vendidos neste período.</div>';
      return;
    }
    const max=Math.max(...rows.map(r=>Number(r.qty||0)),1);
    target.innerHTML=rows.map((row,i)=>{
      const pct=Math.max(6,Math.round((Number(row.qty||0)/max)*100));
      return `<div class="v14-rank-row"><div class="v14-rank-line"><strong>${i+1}. ${esc(row.name)}</strong><span>${esc(`${row.qty} un. • ${moneyValue(row.revenue)}`)}</span></div><div class="v14-bar"><i style="width:${pct}%"></i></div></div>`;
    }).join('');
  }
  function schedule(delay=0){clearTimeout(refreshTimer);refreshTimer=setTimeout(render,delay);}
  function wrapRenderHistory(){
    if(baseRenderHistory||typeof window.renderHistory!=='function')return;
    baseRenderHistory=window.renderHistory;
    const patched=function(){const result=baseRenderHistory.apply(this,arguments);schedule(40);return result;};
    try{window.renderHistory=patched;}catch{}
    try{renderHistory=patched;}catch{}
  }
  function start(){
    wrapRenderHistory();
    schedule(250);
    document.addEventListener('click',e=>{
      if(e.target.closest?.('#v14HistoryToolbar [data-period], [data-screen="history"], [data-target="history"], #navHistory'))schedule(80);
    });
    document.addEventListener('input',e=>{if(e.target?.id==='v14HistorySearch')schedule(20);});
    window.addEventListener('storage',()=>schedule(80));
    window.addEventListener('rota27:v017-domain-updated',()=>schedule(80));
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')schedule(100);});
    window.Rota27V02511={version:VERSION,refreshHistoryProductRanking:render};
    console.info('[Rota27] v0.25.11 — ranking histórico por ID com nome atual carregado.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
