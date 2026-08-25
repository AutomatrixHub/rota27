/* Rota 27 v0.22.0 — visão gerencial ampliada do Estoque Essencial */
(function(){
  'use strict';

  const VERSION='0.22.0';
  const STOCK_OUTBOX_KEY='rota27_v021_stock_outbox_v1';
  let baseOpenStock=null;
  let started=false;

  function byId(id){return document.getElementById(id);}
  function esc(v){
    if(typeof escapeHtml==='function')return escapeHtml(String(v??''));
    return String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }
  function clean(v,max=180){return String(v??'').trim().replace(/\s+/g,' ').slice(0,max);}
  function round3(v){return Math.round(Number(v||0)*1000)/1000;}
  function fmtQty(v){return Number(v||0).toLocaleString('pt-BR',{maximumFractionDigits:3});}
  function fmtDate(ts){const n=Number(ts||0);if(!n)return '—';return new Date(n).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});}
  function own(){return String(document.querySelector('meta[name="rota27-version"]')?.getAttribute('content')||'')===VERSION;}
  function catalog(){return Array.isArray(window.state?.catalog)?window.state.catalog:[];}
  function configs(){try{return window.Rota27V021?.getConfigs?.()||{};}catch{return {};}}
  function movements(){try{return window.Rota27V021?.getMovements?.()||[];}catch{return [];}}
  function orders(){try{return window.Rota27V022?.getOrders?.()||[];}catch{return [];}}
  function receipts(){try{return window.Rota27V022?.getReceipts?.()||[];}catch{return [];}}
  function suppliers(){try{return (window.Rota27V022?.getSuppliers?.()||[]).filter(s=>s?.active!==false);}catch{return [];}}
  function outboxCount(){try{const x=JSON.parse(localStorage.getItem(STOCK_OUTBOX_KEY)||'[]');return Array.isArray(x)?x.length:0;}catch{return 0;}}
  function current(id){try{return round3(window.Rota27V021?.currentQty?.(id)||0);}catch{return 0;}}
  function committed(id){try{return round3(window.Rota27V021?.committedQty?.(id)||0);}catch{return 0;}}
  function available(id){try{return round3(window.Rota27V021?.availableQty?.(id)||0);}catch{return round3(current(id)-committed(id));}}
  function productName(id){return catalog().find(p=>String(p.id)===String(id))?.name||configs()[id]?.name||'Produto';}
  function movementLabel(type){return ({entry:'Entrada',loss:'Perda',internal:'Consumo interno',adjust:'Ajuste',sale:'Venda'})[type]||clean(type||'Movimento',40);}

  function receivedQty(orderId,productId){return round3(receipts().filter(r=>String(r.orderId)===String(orderId)).reduce((sum,r)=>sum+(Array.isArray(r.items)?r.items:[]).reduce((s,i)=>s+(String(i.productId)===String(productId)?Number(i.qty||0):0),0),0));}
  function pendingQty(order,item){return round3(Math.max(0,Number(item?.qty||0)-receivedQty(order.id,item.productId)));}
  function pendingForProduct(productId){return round3(orders().filter(o=>o?.status==='draft'||o?.status==='sent').reduce((sum,o)=>sum+(Array.isArray(o.items)?o.items:[]).reduce((s,i)=>s+(String(i.productId)===String(productId)?pendingQty(o,i):0),0),0));}
  function supplierForProduct(productId){return suppliers().find(s=>Array.isArray(s.productIds)&&s.productIds.some(id=>String(id)===String(productId)))||null;}

  function stockRows(){
    const cfg=configs();
    return catalog().map(p=>{
      const c=cfg[p.id]||null;
      if(c?.enabled!==true)return null;
      const cur=current(p.id),com=committed(p.id),avail=available(p.id),min=Math.max(0,Number(c.minQty||0));
      const critical=avail<=0,attention=!critical&&avail<=min;
      return {product:p,current:cur,committed:com,available:avail,min,status:critical?'critical':attention?'attention':'healthy',inOrder:pendingForProduct(p.id),supplier:supplierForProduct(p.id)};
    }).filter(Boolean);
  }

  function sameLocalDay(a,b){const x=new Date(Number(a||0)),y=new Date(Number(b||0));return x.getFullYear()===y.getFullYear()&&x.getMonth()===y.getMonth()&&x.getDate()===y.getDate();}

  function stats(){
    const rows=stockRows(),critical=rows.filter(r=>r.status==='critical'),attention=rows.filter(r=>r.status==='attention'),healthy=rows.filter(r=>r.status==='healthy');
    const now=Date.now(),today=movements().filter(m=>sameLocalDay(m.createdAt,now)),last7=movements().filter(m=>now-Number(m.createdAt||0)<=7*24*60*60*1000);
    const sumAbs=(list,pred)=>round3(list.filter(pred).reduce((s,m)=>s+Math.abs(Number(m.delta||0)),0));
    const entries=sumAbs(today,m=>m.type==='entry'&&Number(m.delta||0)>0),sales=sumAbs(today,m=>m.type==='sale'&&Number(m.delta||0)<0),losses=sumAbs(today,m=>(m.type==='loss'||m.type==='internal')&&Number(m.delta||0)<0),adjustments=today.filter(m=>m.type==='adjust');
    const openOrders=orders().filter(o=>o.status==='draft'||o.status==='sent');
    const pendingUnits=round3(openOrders.reduce((sum,o)=>sum+(Array.isArray(o.items)?o.items:[]).reduce((s,i)=>s+pendingQty(o,i),0),0));
    return {rows,critical,attention,healthy,today,last7,entries,sales,losses,adjustments,currentUnits:round3(rows.reduce((s,r)=>s+r.current,0)),committedUnits:round3(rows.reduce((s,r)=>s+r.committed,0)),availableUnits:round3(rows.reduce((s,r)=>s+r.available,0)),inOrderUnits:round3(rows.reduce((s,r)=>s+r.inOrder,0)),withSupplier:rows.filter(r=>r.supplier).length,openOrders,pendingUnits,outbox:outboxCount()};
  }

  function metric(label,value,sub='',cls=''){return `<div class="v022s-metric ${cls}"><small>${esc(label)}</small><strong>${esc(value)}</strong>${sub?`<span>${esc(sub)}</span>`:''}</div>`;}
  function setNativeFilter(name){const btn=byId('v021StockWrap')?.querySelector(`[data-filter="${name}"]`);if(btn)btn.click();}
  function openPurchases(){byId('v021StockWrap')?.classList.remove('open');try{window.Rota27V022?.open?.('restock');}catch{}}

  function renderSummary(s){
    const el=byId('v021StockSummary');if(!el)return;
    el.className='v021-summary v022s-summary';
    el.innerHTML=[metric('Controlados',s.rows.length,`${s.healthy.length} saudáveis`),metric('Críticos',s.critical.length,s.critical.length?'sem disponível':'nenhum agora',s.critical.length?'danger':''),metric('Abaixo do mínimo',s.attention.length,s.attention.length?'pedem reposição':'nenhum agora',s.attention.length?'warn':''),metric('Disponível projetado',fmtQty(s.availableUnits),'unidades livres'),metric('Comprometido',fmtQty(s.committedUnits),'em comandas abertas'),metric('Movimentos hoje',s.today.length,`${fmtQty(s.entries)} entrada • ${fmtQty(s.sales)} venda`)].join('');
  }

  function healthBar(s){const total=Math.max(1,s.rows.length);return `<div class="v022s-healthbar" aria-label="Saúde do estoque"><span class="critical" style="width:${s.critical.length/total*100}%"></span><span class="attention" style="width:${s.attention.length/total*100}%"></span><span class="healthy" style="width:${s.healthy.length/total*100}%"></span></div>`;}

  function priorityRows(s){
    const rows=[...s.critical,...s.attention].sort((a,b)=>(a.status==='critical'?0:1)-(b.status==='critical'?0:1)||(a.available-a.min)-(b.available-b.min)||String(a.product.name||'').localeCompare(String(b.product.name||''),'pt-BR')).slice(0,6);
    if(!rows.length)return '<div class="v022s-empty-mini">Nenhum produto exige atenção agora.</div>';
    return rows.map(r=>`<div class="v022s-priority-row"><div class="v022s-priority-main"><strong>${esc(r.product.name)}</strong><span class="v022s-pill ${r.status}">${r.status==='critical'?'Crítico':'Abaixo do mínimo'}</span><small>${esc(r.supplier?.name||'Sem fornecedor padrão')}</small></div><div class="v022s-facts"><span><small>Físico</small><b>${fmtQty(r.current)}</b></span><span><small>Comprometido</small><b>${fmtQty(r.committed)}</b></span><span><small>Disponível</small><b>${fmtQty(r.available)}</b></span><span><small>Mínimo</small><b>${fmtQty(r.min)}</b></span><span><small>Em pedido</small><b>${fmtQty(r.inOrder)}</b></span></div><div class="v022s-priority-actions"><button type="button" data-move="${esc(r.product.id)}">Movimentar</button><button type="button" data-config="${esc(r.product.id)}">Configurar</button></div></div>`).join('');
  }

  function latestMovements(){
    const rows=movements().slice().sort((a,b)=>Number(b.createdAt||0)-Number(a.createdAt||0)).slice(0,7);
    if(!rows.length)return '<div class="v022s-empty-mini">Nenhuma movimentação registrada ainda.</div>';
    return rows.map(m=>{const delta=Number(m.delta||0),cls=delta>0?'pos':delta<0?'neg':'';return `<div class="v022s-movement-row"><div><strong>${esc(m.productName||productName(m.productId))}</strong><small>${esc(movementLabel(m.type))} • ${fmtDate(m.createdAt)}${m.reason?` • ${esc(m.reason)}`:''}</small></div><b class="${cls}">${delta>0?'+':''}${fmtQty(delta)}</b></div>`;}).join('');
  }

  function renderOverview(s){
    const notice=byId('v021StockNotice');if(!notice)return;
    let el=byId('v022StockManagerOverview');if(!el){el=document.createElement('section');el.id='v022StockManagerOverview';el.className='v022s-overview';notice.insertAdjacentElement('afterend',el);}
    const supplierPct=s.rows.length?Math.round((s.withSupplier/s.rows.length)*100):0;
    el.innerHTML=`<div class="v022s-quick-actions"><button type="button" data-go="attention"><span>!</span><b>Ver alertas</b><small>${s.critical.length+s.attention.length} produto${s.critical.length+s.attention.length===1?'':'s'} em atenção</small></button><button type="button" data-go="enabled"><span>▦</span><b>Controlados</b><small>${s.rows.length} produto${s.rows.length===1?'':'s'} com controle ativo</small></button><button type="button" data-go="purchases"><span>↻</span><b>Compras & Reposição</b><small>${fmtQty(s.pendingUnits)} unid. pendentes em pedidos</small></button><button type="button" data-go="history"><span>≡</span><b>Movimentações</b><small>${s.last7.length} evento${s.last7.length===1?'':'s'} nos últimos 7 dias</small></button></div>
      <div class="v022s-grid">
        <section class="v022s-card"><div class="v022s-card-head"><div><small>SAÚDE DO ESTOQUE</small><h4>Situação dos produtos controlados</h4></div><button type="button" data-go="attention">Ver alertas</button></div>${healthBar(s)}<div class="v022s-health-legend"><span><i class="critical"></i><b>${s.critical.length}</b> críticos</span><span><i class="attention"></i><b>${s.attention.length}</b> abaixo do mínimo</span><span><i class="healthy"></i><b>${s.healthy.length}</b> saudáveis</span></div><div class="v022s-stock-totals"><span><small>Estoque físico</small><b>${fmtQty(s.currentUnits)}</b></span><span><small>Comprometido</small><b>${fmtQty(s.committedUnits)}</b></span><span><small>Disponível projetado</small><b>${fmtQty(s.availableUnits)}</b></span><span><small>Em pedidos</small><b>${fmtQty(s.inOrderUnits)}</b></span></div><div class="v022s-footnote">${supplierPct}% dos produtos controlados têm fornecedor associado${s.outbox?` • ${s.outbox} evento${s.outbox===1?'':'s'} de estoque aguardando sync`:''}.</div></section>
        <section class="v022s-card"><div class="v022s-card-head"><div><small>FLUXO DE HOJE</small><h4>Entradas e saídas registradas</h4></div></div><div class="v022s-flow-grid"><div><small>Entradas</small><strong>+${fmtQty(s.entries)}</strong><span>unidades registradas</span></div><div><small>Vendas</small><strong>-${fmtQty(s.sales)}</strong><span>baixas por comandas</span></div><div><small>Perdas / consumo</small><strong>-${fmtQty(s.losses)}</strong><span>saídas operacionais</span></div><div><small>Ajustes</small><strong>${s.adjustments.length}</strong><span>movimento${s.adjustments.length===1?'':'s'} hoje</span></div></div><div class="v022s-today-note">${s.today.length?`${s.today.length} movimentação${s.today.length===1?'':'ões'} registrada${s.today.length===1?'':'s'} hoje.`:'Nenhuma movimentação registrada hoje.'}</div></section>
        <section class="v022s-card v022s-priorities"><div class="v022s-card-head"><div><small>PRIORIDADES</small><h4>Produtos que pedem decisão</h4></div><button type="button" data-go="purchases">Abrir compras</button></div><div class="v022s-priority-list">${priorityRows(s)}</div></section>
        <section class="v022s-card v022s-history" id="v022StockRecentMovements"><div class="v022s-card-head"><div><small>MOVIMENTAÇÕES</small><h4>Últimos registros de estoque</h4></div></div><div class="v022s-movement-list">${latestMovements()}</div></section>
      </div>`;
    el.querySelectorAll('[data-go]').forEach(btn=>btn.addEventListener('click',()=>{const go=btn.dataset.go;if(go==='purchases'){openPurchases();return;}if(go==='history'){byId('v022StockRecentMovements')?.scrollIntoView({behavior:'smooth',block:'start'});return;}setNativeFilter(go);}));
    el.querySelectorAll('[data-move]').forEach(btn=>btn.addEventListener('click',()=>window.Rota27V021?.openMove?.(btn.dataset.move)));
    el.querySelectorAll('[data-config]').forEach(btn=>btn.addEventListener('click',()=>window.Rota27V021?.openConfig?.(btn.dataset.config)));
  }

  function rowProductId(row){
    const strong=row.querySelector('.v021-product strong');if(!strong)return '';
    const copy=strong.cloneNode(true);copy.querySelectorAll('.v021-stock-chip,.v022s-row-flag').forEach(x=>x.remove());
    const name=clean(copy.textContent,180),p=catalog().find(x=>clean(x?.name,180)===name);return p?String(p.id):'';
  }

  function enhanceRows(s){
    document.querySelectorAll('#v021StockList .v021-row').forEach(row=>{
      row.querySelectorAll('.v022s-row-num,.v022s-row-meta').forEach(x=>x.remove());
      const id=rowProductId(row),r=s.rows.find(x=>String(x.product.id)===String(id));if(!r)return;
      row.dataset.stockProductId=id;
      const product=row.querySelector('.v021-product'),strong=product?.querySelector('strong');
      if(strong&&!strong.querySelector('.v022s-row-flag')){const flag=document.createElement('span');flag.className=`v022s-row-flag ${r.status}`;flag.textContent=r.status==='critical'?'crítico':r.status==='attention'?'repor':'saudável';strong.appendChild(flag);}
      if(product){const meta=document.createElement('div');meta.className='v022s-row-meta';meta.innerHTML=`<span>mínimo <b>${fmtQty(r.min)}</b></span><span>em pedido <b>${fmtQty(r.inOrder)}</b></span><span>fornecedor <b>${esc(r.supplier?.name||'—')}</b></span>`;product.appendChild(meta);}
      const actions=row.querySelector('.v021-actions');
      if(actions){const min=document.createElement('div');min.className='v022s-row-num';min.innerHTML=`<small>Mínimo</small><b>${fmtQty(r.min)}</b>`;const order=document.createElement('div');order.className='v022s-row-num';order.innerHTML=`<small>Em pedido</small><b>${fmtQty(r.inOrder)}</b>`;actions.insertAdjacentElement('beforebegin',min);actions.insertAdjacentElement('beforebegin',order);}
    });
  }

  function enhanceToolbar(){const toolbar=byId('v021StockWrap')?.querySelector('.v021-toolbar');if(!toolbar||byId('v022StockPurchasesBtn'))return;const btn=document.createElement('button');btn.id='v022StockPurchasesBtn';btn.type='button';btn.className='v022s-purchases-btn';btn.textContent='↻ Compras';btn.addEventListener('click',openPurchases);toolbar.appendChild(btn);}
  function enhanceHeader(){const head=byId('v021StockWrap')?.querySelector('.v021-head'),title=head?.querySelector('h3'),desc=head?.querySelector('.desc');if(title)title.textContent='Estoque Essencial';if(desc)desc.textContent='Central para entender saldos, comprometimentos, alertas, pedidos em trânsito e movimentações.';}

  function enhanceOpenStock(){if(!own())return;const wrap=byId('v021StockWrap');if(!wrap?.classList.contains('open'))return;const s=stats();enhanceHeader();renderSummary(s);renderOverview(s);enhanceToolbar();enhanceRows(s);}

  function wrapOpenStock(){if(baseOpenStock||typeof window.Rota27V021?.openStock!=='function')return;baseOpenStock=window.Rota27V021.openStock.bind(window.Rota27V021);window.Rota27V021.openStock=function(){const r=baseOpenStock(...arguments);setTimeout(enhanceOpenStock,0);return r;};}
  function patchPanelButton(){const btn=byId('v021StockEntry')?.querySelector('button');if(!btn||btn.dataset.v022StockManager==='1')return;btn.dataset.v022StockManager='1';btn.addEventListener('click',()=>setTimeout(enhanceOpenStock,0));}
  function refresh(){if(!own())return;wrapOpenStock();patchPanelButton();if(byId('v021StockWrap')?.classList.contains('open'))setTimeout(enhanceOpenStock,0);}

  function start(){
    if(started||!own())return;started=true;wrapOpenStock();patchPanelButton();refresh();
    window.addEventListener('rota27:v021-stock-updated',refresh);window.addEventListener('rota27:v022-purchases-updated',refresh);window.addEventListener('rota27:v017-domain-updated',refresh);window.addEventListener('storage',refresh);window.addEventListener('online',refresh);window.addEventListener('offline',refresh);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refresh();});document.addEventListener('click',e=>{if(e.target.closest?.('#v021StockEntry .v021-stock-open'))setTimeout(enhanceOpenStock,0);},true);
    setTimeout(refresh,80);setTimeout(refresh,500);console.info('[Rota27] v0.22.0 visão gerencial do Estoque Essencial carregada.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
