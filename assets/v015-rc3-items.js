/* Rota 27 v0.15 RC.3 — consulta rápida dos itens da comanda
 * Benefício operacional: conferir consumo sem navegar por categorias e sem entrar no fluxo de fechamento.
 * A consulta é somente leitura; edição continua no fluxo já validado de "Editar itens".
 */
(function(){
  'use strict';

  const VERSION='0.15-rc.3';
  let refreshTimer=null;

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

  function openSummary(){
    const command=current();
    if(!command)return;
    const wrap=ensureSheet();
    renderSummary();
    wrap.classList.add('open');
    wrap.setAttribute('aria-hidden','false');
    setTimeout(()=>byId('v15ItemsContinueBtn')?.focus(),40);
  }

  function closeSummary(){
    const wrap=byId('v15ItemsSummaryWrap');
    if(!wrap)return;
    wrap.classList.remove('open');
    wrap.setAttribute('aria-hidden','true');
  }

  function wireCartSummary(){
    const summary=document.querySelector('#cartbar .cart-summary');
    if(!summary||summary.dataset.v15ItemsReady==='1')return;
    summary.dataset.v15ItemsReady='1';
    summary.classList.add('v15items-summary-trigger');
    summary.setAttribute('role','button');
    summary.setAttribute('tabindex','0');
    summary.setAttribute('aria-label','Ver itens da comanda');
    summary.setAttribute('title','Ver itens da comanda');
    summary.addEventListener('click',openSummary);
    summary.addEventListener('keydown',event=>{
      if(event.key==='Enter'||event.key===' '){event.preventDefault();openSummary();}
    });
  }

  function applyVersion(){
    const badge=byId('v14VersionBadge');
    if(badge)badge.textContent='v0.15 RC.3';
    document.title='Rota 27 Bodega • Comandas v0.15 RC.3';
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
    console.info('[Rota27] consulta rápida de itens carregada (v0.15 RC.3).');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
