/* Rota 27 v0.15 RC.3.1 — consulta rápida dos itens da comanda
 * Benefício operacional: conferir consumo sem navegar por categorias e sem entrar no fluxo de fechamento.
 * Refinamento RC.3.1: ícone, microanimação e estado ativo na entrada "Ver itens".
 * A consulta é somente leitura; edição continua no fluxo já validado de "Editar itens".
 */
(function(){
  'use strict';

  const VERSION='0.15-rc.3.1';
  let refreshTimer=null;
  let popTimer=null;

  function byId(id){return document.getElementById(id);}
  function esc(value){
    if(typeof escapeHtml==='function')return escapeHtml(String(value??''));
    return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }
  function current(){
    try{return typeof currentCommand==='function'?currentCommand():null;}catch{return null;}
  }
  function label(command){
    try{return typeof commandLabel==='function'?commandLabel(command):[command?.table,command?.customer].filter(Boolean).join(' • ');}catch{return [command?.table,command?.customer].filter(Boolean).join(' • ');}
  }
  function formatMoney(value){
    try{return typeof money==='function'?money(Number(value||0)):Number(value||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}catch{return 'R$ 0,00';}
  }
  function total(command){
    try{return typeof commandTotal==='function'?Number(commandTotal(command)||0):0;}catch{return 0;}
  }
  function line(command,id){
    try{
      if(typeof lineProduct==='function'){
        const p=lineProduct(command,id);
        if(p)return p;
      }
    }catch{}
    const meta=command?.itemMeta?.[id]||{};
    try{
      if(typeof productById==='function')return productById(id)||meta;
    }catch{}
    return meta;
  }
  function itemCount(command){
    return Object.values(command?.items||{}).reduce((sum,qty)=>sum+Math.max(0,Number(qty||0)),0);
  }

  function ensureSheet(){
    let wrap=byId('v15ItemsSummaryWrap');
    if(wrap)return wrap;
    wrap=document.createElement('div');
    wrap.className='sheet-wrap';
    wrap.id='v15ItemsSummaryWrap';
    wrap.setAttribute('aria-hidden','true');
    wrap.innerHTML=`
      <div class="sheet v15items-sheet" role="dialog" aria-modal="true" aria-labelledby="v15ItemsTitle">
        <div class="handle"></div>
        <div class="v15items-head">
          <div>
            <h3 id="v15ItemsTitle">Itens da comanda</h3>
            <p class="desc" id="v15ItemsCommandName"></p>
          </div>
          <span class="v15items-count" id="v15ItemsCount">0 itens</span>
        </div>
        <div class="v15items-list" id="v15ItemsList"></div>
        <div class="v15items-total"><span>Total da comanda</span><strong id="v15ItemsTotal">R$ 0,00</strong></div>
        <div class="sheet-actions v15items-actions">
          <button class="secondary" type="button" id="v15ItemsContinueBtn">Continuar lançando</button>
          <button class="primary" type="button" id="v15ItemsEditBtn">Editar itens</button>
        </div>
      </div>`;
    document.body.appendChild(wrap);

    wrap.addEventListener('click',event=>{if(event.target===wrap)closeSummary();});
    byId('v15ItemsContinueBtn')?.addEventListener('click',closeSummary);
    byId('v15ItemsEditBtn')?.addEventListener('click',()=>{
      closeSummary();
      try{if(typeof openCartSheet==='function')openCartSheet();}catch{}
    });
    return wrap;
  }

  function renderSummary(){
    const command=current();
    const wrap=ensureSheet();
    const list=byId('v15ItemsList');
    if(!wrap||!list)return;

    if(!command){
      closeSummary();
      return;
    }

    const entries=Object.entries(command.items||{}).filter(([,qty])=>Number(qty)>0);
    const units=itemCount(command);
    byId('v15ItemsCommandName').textContent=label(command)||'Comanda atual';
    byId('v15ItemsCount').textContent=units+' '+(units===1?'item':'itens');
    byId('v15ItemsTotal').textContent=formatMoney(total(command));

    if(!entries.length){
      list.innerHTML='<div class="v15items-empty"><span>🧺</span><strong>Comanda sem itens</strong><small>Continue lançando os produtos normalmente.</small></div>';
      return;
    }

    list.innerHTML=entries.map(([id,rawQty])=>{
      const qty=Math.max(0,Number(rawQty||0));
      const product=line(command,id)||{};
      const meta=command?.itemMeta?.[id]||{};
      const name=product.name||meta.name||'Produto';
      const emoji=product.emoji||meta.emoji||'🍽️';
      const price=Number(product.price??meta.price??0);
      const subtotal=qty*price;
      return `<div class="v15items-row">
        <div class="v15items-qty">${esc(qty)}×</div>
        <div class="v15items-product">
          <strong><span aria-hidden="true">${esc(emoji)}</span> ${esc(name)}</strong>
          <small>${esc(formatMoney(price))} cada</small>
        </div>
        <strong class="v15items-subtotal">${esc(formatMoney(subtotal))}</strong>
      </div>`;
    }).join('');
  }

  function setTriggerOpen(open){
    const summary=document.querySelector('#cartbar .cart-summary');
    if(!summary)return;
    summary.classList.toggle('is-open',Boolean(open));
    summary.setAttribute('aria-expanded',open?'true':'false');
    const view=summary.querySelector('.v15items-view');
    if(view)view.setAttribute('aria-label',open?'Itens da comanda abertos':'Ver itens da comanda');
  }

  function pulseTrigger(){
    const summary=document.querySelector('#cartbar .cart-summary');
    if(!summary)return;
    summary.classList.remove('v15items-pop');
    requestAnimationFrame(()=>{
      summary.classList.add('v15items-pop');
      clearTimeout(popTimer);
      popTimer=setTimeout(()=>summary.classList.remove('v15items-pop'),360);
    });
  }

  function openSummary(){
    const command=current();
    if(!command)return;
    const wrap=ensureSheet();
    renderSummary();
    wrap.classList.add('open');
    wrap.setAttribute('aria-hidden','false');
    setTriggerOpen(true);
    pulseTrigger();
    setTimeout(()=>byId('v15ItemsContinueBtn')?.focus(),40);
  }

  function closeSummary(){
    const wrap=byId('v15ItemsSummaryWrap');
    if(!wrap)return;
    wrap.classList.remove('open');
    wrap.setAttribute('aria-hidden','true');
    setTriggerOpen(false);
  }

  function enhanceTriggerMarkup(summary){
    if(!summary||summary.dataset.v15ItemsMarkup==='1')return;
    const currentItems=byId('cartbarItems')?.textContent||'0 itens';
    const currentTotal=byId('cartbarTotal')?.textContent||'R$ 0,00';
    summary.innerHTML=`
      <div class="v15items-summary-topline">
        <small id="cartbarItems">${esc(currentItems)}</small>
        <span class="v15items-view" aria-hidden="true">
          <span class="v15items-view-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 6h11M8 12h11M8 18h11"/><path d="M4.5 6h.01M4.5 12h.01M4.5 18h.01"/></svg>
          </span>
          <span class="v15items-view-label">Ver itens</span>
          <span class="v15items-view-chevron">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 14 4-4 4 4"/></svg>
          </span>
        </span>
      </div>
      <strong id="cartbarTotal">${esc(currentTotal)}</strong>`;
    summary.dataset.v15ItemsMarkup='1';
  }

  function wireCartSummary(){
    const summary=document.querySelector('#cartbar .cart-summary');
    if(!summary)return;
    enhanceTriggerMarkup(summary);
    if(summary.dataset.v15ItemsReady==='1')return;
    summary.dataset.v15ItemsReady='1';
    summary.classList.add('v15items-summary-trigger');
    summary.setAttribute('role','button');
    summary.setAttribute('tabindex','0');
    summary.setAttribute('aria-label','Ver itens da comanda');
    summary.setAttribute('aria-controls','v15ItemsSummaryWrap');
    summary.setAttribute('aria-expanded','false');
    summary.setAttribute('title','Ver itens da comanda');
    summary.addEventListener('click',openSummary);
    summary.addEventListener('keydown',event=>{
      if(event.key==='Enter'||event.key===' '){event.preventDefault();openSummary();}
    });
  }

  function applyVersion(){
    const badge=byId('v14VersionBadge');
    if(badge)badge.textContent='v0.15 RC.3.1';
    document.title='Rota 27 Bodega • Comandas v0.15 RC.3.1';
    window.ROTA27_SYNC_DEV_VERSION=VERSION;
  }

  function start(){
    ensureSheet();
    wireCartSummary();
    applyVersion();
    clearInterval(refreshTimer);
    refreshTimer=setInterval(()=>{
      wireCartSummary();
      if(byId('v15ItemsSummaryWrap')?.classList.contains('open'))renderSummary();
    },1500);
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&byId('v15ItemsSummaryWrap')?.classList.contains('open'))closeSummary();});
    window.openItemsSummary=openSummary;
    console.info('[Rota27] consulta rápida de itens refinada (v0.15 RC.3.1).');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
