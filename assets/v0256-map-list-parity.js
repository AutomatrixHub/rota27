/* Rota 27 v0.25.6 — paridade visual Lista / Mapa */
(function(){
  'use strict';

  const VERSION='0.25.6';

  function byId(id){return document.getElementById(id);}
  function clean(v,max=180){return String(v??'').replace(/[\u0000-\u001f\u007f]/g,' ').trim().replace(/\s+/g,' ').slice(0,max);}
  function esc(v){
    if(typeof escapeHtml==='function')return escapeHtml(String(v??''));
    return String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }
  function commands(){try{return Array.isArray(state?.commands)?state.commands.filter(c=>c?.cancelled!==true):[];}catch{return [];}}
  function findCommand(id){return commands().find(c=>String(c?.id)===String(id));}
  function itemCount(c){try{return Number(typeof commandItems==='function'?commandItems(c):0)||0;}catch{return 0;}}
  function totalValue(c){try{return Number(typeof commandTotal==='function'?commandTotal(c):0)||0;}catch{return 0;}}
  function moneyValue(v){try{return typeof money==='function'?money(Number(v||0)):Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}catch{return 'R$ 0,00';}}
  function elapsedValue(v){try{return typeof elapsed==='function'?elapsed(Number(v||0)):'';}catch{return '';}}

  function parityCard(btn){
    if(!btn)return;
    const c=findCommand(btn.dataset.v0252Command||'');
    if(!c)return;

    const customer=clean(c.customer,120);
    const location=clean(c.table,120);
    const primary=customer||location||'Comanda';
    const count=itemCount(c);
    const opened=elapsedValue(c.createdAt);
    const updated=elapsedValue(c.updatedAt);

    btn.classList.add('command-card','v017-command-card','v0256-map-command-card');
    btn.classList.remove('v0255-enhanced');
    btn.removeAttribute('data-v0255-enhanced');

    btn.innerHTML=`
      <div class="v017-command-primary">
        <h3 class="command-title">${esc(primary)}</h3>
      </div>
      <div class="v017-command-info">
        <div class="v017-command-copy">
          ${customer&&location?`<div class="v017-command-location">${esc(location)}</div>`:''}
          <div class="command-sub">${count} ${count===1?'item':'itens'}${opened?` • aberta há ${esc(opened)}`:''}</div>
        </div>
        <div class="money">${esc(moneyValue(totalValue(c)))}</div>
      </div>
      <div class="command-bottom">
        <span class="meta">${updated?`Último lançamento: ${esc(updated)}`:'Toque para abrir'}</span>
      </div>`;

    btn.setAttribute('aria-label',`Abrir ${primary}`);
    btn.dataset.v0256Parity='1';
  }

  function applyParity(){
    byId('v0252CommandMap')?.querySelectorAll('[data-v0252-command]').forEach(parityCard);
  }

  function patchRenderCommands(){
    const current=window.renderCommands;
    if(typeof current!=='function'||current.__r27v0256Parity)return false;
    const patched=function(){
      const result=current.apply(this,arguments);
      try{applyParity();}catch(err){console.warn('[Rota27 v0.25.6] paridade do Mapa:',err);}
      return result;
    };
    patched.__r27v0256Parity=true;
    try{window.renderCommands=patched;}catch{}
    try{renderCommands=patched;}catch{}
    return true;
  }

  function patchMapApi(){
    const api=window.Rota27V0252;
    if(!api||typeof api.renderMap!=='function'||api.renderMap.__r27v0256Parity)return false;
    const base=api.renderMap;
    const patched=function(){
      const result=base.apply(this,arguments);
      try{applyParity();}catch{}
      return result;
    };
    patched.__r27v0256Parity=true;
    api.renderMap=patched;
    return true;
  }

  function handleClick(e){
    if(e.target.closest?.('#navCommands,[data-v0252-view="map"]'))setTimeout(applyParity,0);
  }

  function start(){
    patchRenderCommands();
    patchMapApi();
    applyParity();
    setTimeout(()=>{patchRenderCommands();patchMapApi();applyParity();},120);
    document.addEventListener('click',handleClick);
    window.addEventListener('rota27:v017-domain-updated',applyParity);
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')applyParity();});
    window.Rota27V0256Map={version:VERSION,applyParity};
    console.info('[Rota27] v0.25.6 paridade visual Lista / Mapa carregada.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
