/* Rota 27 v0.25.10 — Mais vendidos por ID com nome atual e receita histórica */
(function(){
  'use strict';

  const VERSION='0.25.10';

  function esc(v){
    try{return typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
    catch{return String(v??'');}
  }
  function moneyValue(v){
    try{return typeof money==='function'?money(Number(v||0)):Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}catch{return 'R$ 0,00';}
  }
  function catalog(){
    try{return typeof state!=='undefined'&&Array.isArray(state?.catalog)?state.catalog:[];}catch{return [];}
  }
  function history(){
    try{return typeof state!=='undefined'&&Array.isArray(state?.history)?state.history:[];}catch{return [];}
  }
  function startOfToday(){const d=new Date();d.setHours(0,0,0,0);return d.getTime();}
  function currentProduct(id){return catalog().find(p=>String(p?.id||'')===String(id||''))||null;}
  function historicalMeta(command,id){return command?.itemMeta?.[id]&&typeof command.itemMeta[id]==='object'?command.itemMeta[id]:null;}
  function displayName(command,id){
    const current=currentProduct(id);
    if(current?.name)return String(current.name);
    const meta=historicalMeta(command,id);
    return String(meta?.name||'Produto');
  }
  function historicalPrice(command,id){
    const meta=historicalMeta(command,id);
    if(meta&&Number.isFinite(Number(meta.price)))return Number(meta.price);
    const current=currentProduct(id);
    return Number(current?.price||0);
  }
  function topProducts(){
    const start=startOfToday();
    const rows=new Map();
    history().filter(c=>Number(c?.closedAt||0)>=start).forEach(command=>{
      Object.entries(command?.items||{}).forEach(([id,qtyRaw])=>{
        const qty=Number(qtyRaw||0);
        if(qty<=0)return;
        const key=String(id);
        const currentName=displayName(command,id);
        const row=rows.get(key)||{id:key,name:currentName,qty:0,revenue:0};
        row.name=currentProduct(id)?.name?String(currentProduct(id).name):row.name||currentName;
        row.qty+=qty;
        row.revenue+=qty*historicalPrice(command,id);
        rows.set(key,row);
      });
    });
    return [...rows.values()].sort((a,b)=>b.qty-a.qty||b.revenue-a.revenue||a.name.localeCompare(b.name,'pt-BR')).slice(0,5);
  }
  function findTopPanel(){
    const panels=[...document.querySelectorAll('#v018TurnSummary .v018-turn-panel')];
    return panels.find(panel=>String(panel.querySelector('h4')?.textContent||'').trim()==='Mais vendidos hoje')||null;
  }
  function apply(){
    const panel=findTopPanel();if(!panel)return false;
    const list=panel.querySelector('.v018-turn-list');if(!list)return false;
    const rows=topProducts();
    list.innerHTML=rows.length
      ?rows.map(p=>`<div class="v018-turn-row"><strong>${esc(p.name)}</strong><span>${esc(`${p.qty} un. • ${moneyValue(p.revenue)}`)}</span></div>`).join('')
      :'<div class="v018-turn-empty">Nenhum item vendido hoje.</div>';
    return true;
  }
  function start(){
    window.addEventListener('rota27:v018-summary-rendered',apply);
    window.addEventListener('rota27:v017-domain-updated',apply);
    window.addEventListener('storage',apply);
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')apply();});
    setTimeout(apply,300);
    window.Rota27V02510={version:VERSION,apply,topProducts};
    console.info('[Rota27] v0.25.10 — Mais vendidos usa ID do produto, nome atual e receita histórica.');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
