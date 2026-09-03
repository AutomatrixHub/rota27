/* Rota 27 v0.22.0 — compatibilidade do Painel, Visão Gerencial e Estoque */
(function(){
  'use strict';
  const VERSION='0.22.0';
  let panelObserver=null;

  function byId(id){return document.getElementById(id);}
  function own(){return String(document.querySelector('meta[name="rota27-version"]')?.getAttribute('content')||'')===VERSION;}
  function esc(v){return String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[ch]));}
  function shortDate(value){const p=String(value||'').split('-');return p.length===3?`${p[2]}/${p[1]}`:String(value||'');}
  function fmtQty(v){return Number(v||0).toLocaleString('pt-BR',{maximumFractionDigits:3});}

  function managerHint(){
    try{
      const rows=Array.isArray(window.Rota27V019?.getClosures?.())?window.Rota27V019.getClosures():[];
      const last=rows.slice().sort((a,b)=>String(b.businessDate||'').localeCompare(String(a.businessDate||'')))[0]||null;
      return rows.length?`${rows.length} fechamento${rows.length===1?'':'s'} disponíve${rows.length===1?'l':'is'}${last?' • último '+shortDate(last.businessDate):''} • compare períodos, faturamento, ticket, produtos e pagamentos.`:'Feche o primeiro turno para iniciar o histórico confiável.';
    }catch{return 'Compare faturamento, ticket, produtos e pagamentos usando fechamentos imutáveis.';}
  }

  function stockStats(){
    try{
      const cfg=window.Rota27V021?.getConfigs?.()||{};
      const catalog=Array.isArray(window.state?.catalog)?window.state.catalog:[];
      const ids=catalog.map(p=>String(p.id)).filter(id=>cfg[id]?.enabled===true);
      const attention=ids.filter(id=>{const s=window.Rota27V021.statusFor(id);return s==='low'||s==='zero';});
      return {enabled:ids.length,attention:attention.length,zero:attention.some(id=>window.Rota27V021.statusFor(id)==='zero')};
    }catch{return {enabled:0,attention:0,zero:false};}
  }

  function purchaseStats(){
    try{
      const cfg=window.Rota27V021?.getConfigs?.()||{};
      const catalog=Array.isArray(window.state?.catalog)?window.state.catalog:[];
      const restock=catalog.filter(p=>cfg[p.id]?.enabled===true&&Number(window.Rota27V021?.availableQty?.(p.id)||0)<=Math.max(0,Number(cfg[p.id]?.minQty||0))).length;
      const orders=window.Rota27V022?.getOrders?.()||[];
      const open=orders.filter(o=>o.status==='draft'||o.status==='sent').length;
      return {restock,open};
    }catch{return {restock:0,open:0};}
  }

  function setEntryHtml(entry,html,handler){
    if(entry.innerHTML!==html){entry.innerHTML=html;entry.querySelector('button')?.addEventListener('click',handler);}
  }

  function ensureManagerEntry(){
    const screen=byId('screenPanel');if(!screen||!window.Rota27V020?.openManager)return;
    let e=byId('v020ManagerEntry');
    if(!e){e=document.createElement('section');e.id='v020ManagerEntry';e.className='v020-manager-entry';const head=screen.querySelector('.v15d4-head');if(head)head.insertAdjacentElement('afterend',e);else screen.prepend(e);}
    const html=`<div class="v020-manager-entry-head"><div><strong>Visão Gerencial</strong><small>${esc(managerHint())}</small></div><button type="button" class="v020-manager-open">Abrir visão gerencial</button></div>`;
    setEntryHtml(e,html,()=>window.Rota27V020.openManager());
  }

  function ensureStockEntry(){
    const screen=byId('screenPanel');if(!screen||!window.Rota27V021?.openStock)return;
    let e=byId('v021StockEntry');
    if(!e){e=document.createElement('section');e.id='v021StockEntry';e.className='v021-stock-entry';const manager=byId('v020ManagerEntry');if(manager)manager.insertAdjacentElement('afterend',e);else{const head=screen.querySelector('.v15d4-head');if(head)head.insertAdjacentElement('afterend',e);else screen.prepend(e);}}
    const s=stockStats(),cls=s.attention?(s.zero?'danger':'warn'):'ok';
    const hint=s.enabled?(s.attention?`${s.attention} produto${s.attention===1?'':'s'} precisa${s.attention===1?'':'m'} de atenção.`:'Estoque controlado sem alerta agora.'):'Ative o controle apenas nos produtos que desejar.';
    const html=`<div class="v021-stock-entry-head"><div><strong>Estoque Essencial</strong><small>${esc(hint)} Estoque projetado desconta itens já lançados em comandas abertas.</small></div><button class="v021-stock-open ${cls}" type="button">${s.attention?`Ver ${s.attention} alerta${s.attention===1?'':'s'}`:'Abrir estoque'}</button></div>`;
    setEntryHtml(e,html,()=>window.Rota27V021.openStock());
  }

  function ensurePurchasesEntry(){
    const screen=byId('screenPanel');if(!screen||!window.Rota27V022?.open)return;
    let e=byId('v022PurchasesEntry');
    if(!e){e=document.createElement('section');e.id='v022PurchasesEntry';e.className='v022-panel-entry';const stock=byId('v021StockEntry');if(stock)stock.insertAdjacentElement('afterend',e);else screen.appendChild(e);}
    const s=purchaseStats();
    const hint=s.restock?`${s.restock} produto${s.restock===1?'':'s'} na fila de reposição.`:(s.open?`${s.open} pedido${s.open===1?' pendente':'s pendentes'} para acompanhar.`:'Sem compra pendente agora.');
    const cls=s.restock?'warn':s.open?'info':'ok';
    const label=s.restock?`Repor ${s.restock}`:s.open?`Ver ${s.open} pedido${s.open===1?'':'s'}`:'Abrir compras';
    const html=`<div class="v022-panel-entry-head"><div><span class="v022-mini-label">v0.22.0</span><strong>Compras & Reposição</strong><small>${esc(hint)} Recebimentos entram no Estoque Essencial sem duplicidade.</small></div><button class="${cls}" type="button">${label}</button></div>`;
    setEntryHtml(e,html,()=>window.Rota27V022.open(s.restock?'restock':'orders'));
  }

  function repairPanel(){if(!own())return;ensureManagerEntry();ensureStockEntry();ensurePurchasesEntry();}
  function watchPanel(){
    if(panelObserver)return;
    const screen=byId('screenPanel');if(!screen)return;
    panelObserver=new MutationObserver(()=>repairPanel());
    panelObserver.observe(screen,{childList:true});
  }

  function ensureHistorySheet(){
    if(byId('v022StockHistoryWrap'))return;
    const w=document.createElement('div');w.id='v022StockHistoryWrap';w.className='sheet-wrap';
    w.innerHTML='<div class="sheet"><div class="handle"></div><div class="v021-head"><div><h3>Histórico do estoque</h3><p class="desc">Entradas, vendas, perdas, consumo interno, ajustes e recebimentos de compras.</p></div><button id="v022StockHistoryX" class="v021-x" type="button">×</button></div><div id="v022StockHistoryBody" class="v021-history"></div></div>';
    document.body.appendChild(w);w.addEventListener('click',e=>{if(e.target===w)w.classList.remove('open');});byId('v022StockHistoryX').onclick=()=>w.classList.remove('open');
  }
  function openHistory(){
    ensureHistorySheet();const rows=window.Rota27V021?.getMovements?.()||[];rows.sort((a,b)=>Number(b.createdAt)-Number(a.createdAt));
    byId('v022StockHistoryBody').innerHTML=rows.length?rows.slice(0,300).map(m=>`<div class="v021-history-row"><small>${esc(new Date(Number(m.createdAt||0)).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}))}</small><div><strong>${esc(m.productName||'Produto')}</strong><small>${esc(({entry:'Entrada',loss:'Perda',internal:'Consumo interno',adjust:'Ajuste',sale:'Venda'})[m.type]||m.type)}${m.reason?' • '+esc(m.reason):''}</small></div><b class="${Number(m.delta)>=0?'v021-pos':'v021-neg'}">${Number(m.delta)>0?'+':''}${fmtQty(m.delta)}</b></div>`).join(''):'<div class="v021-empty">Nenhuma movimentação registrada.</div>';
    byId('v022StockHistoryWrap').classList.add('open');
  }
  function ensureHistoryButton(){
    const toolbar=document.querySelector('#v021StockWrap .v021-toolbar');if(!toolbar)return;
    let b=byId('v022StockHistoryBtn');if(b)return;
    b=document.createElement('button');b.id='v022StockHistoryBtn';b.type='button';b.textContent='◷ Histórico';b.onclick=openHistory;toolbar.appendChild(b);
  }

  function ensureManagerHelp(){
    const overlay=byId('r27HelpOverlay'),content=overlay?.querySelector('.r27-help-content');if(!content)return;
    if(!byId('r27-help-visao-gerencial')){
      const d=document.createElement('details');d.id='r27-help-visao-gerencial';d.className='r27-help-section';
      d.innerHTML='<summary><span class="r27-help-section-icon">▦</span><span><strong>Visão Gerencial</strong><small>Comparar períodos usando fechamentos confiáveis.</small></span></summary><div class="r27-help-section-body"><div class="r27-help-lead">No <b>Painel</b>, abra <b>Visão Gerencial</b> para acompanhar faturamento, média por turno, ticket, comandas, itens, produtos e formas de pagamento.</div><ol class="r27-help-steps"><li><span>1</span><div><b>Escolha o período</b><br>Use 7, 30, 90 dias ou todo o histórico.</div></li><li><span>2</span><div><b>Compare</b><br>Quando há base anterior, o app mostra a variação percentual.</div></li><li><span>3</span><div><b>Leia a tendência</b><br>O gráfico usa apenas turnos realmente fechados.</div></li><li><span>4</span><div><b>Demonstre sem contaminar</b><br>O Modo demonstração usa dados simulados somente em memória.</div></li></ol></div>';
      content.appendChild(d);
    }
  }

  function tick(){if(!own())return;repairPanel();watchPanel();ensureHistorySheet();ensureHistoryButton();ensureManagerHelp();}
  function start(){
    if(!own())return;
    tick();setTimeout(tick,250);setTimeout(tick,900);
    window.addEventListener('rota27:v021-stock-updated',tick);
    window.addEventListener('rota27:v022-purchases-updated',tick);
    window.addEventListener('rota27:v019-turn-updated',tick);
    window.addEventListener('rota27:v017-domain-updated',repairPanel);
    window.addEventListener('pageshow',tick);
    console.info('[Rota27] v0.22.0 compatibilidade do Painel carregada sem polling visual.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
