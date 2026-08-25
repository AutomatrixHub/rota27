/* Rota 27 v0.22.0 — visão gerencial ampliada de Compras & Estoque */
(function(){
  'use strict';

  const VERSION='0.22.0';
  let wrapped=false;
  let enhanceTimer=null;

  function byId(id){return document.getElementById(id);}
  function esc(v){
    if(typeof escapeHtml==='function')return escapeHtml(String(v??''));
    return String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }
  function round3(v){return Math.round(Number(v||0)*1000)/1000;}
  function fmtQty(v){return Number(v||0).toLocaleString('pt-BR',{maximumFractionDigits:3});}
  function fmtDate(ts){
    const n=Number(ts||0);if(!n)return '—';
    return new Date(n).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});
  }
  function own(){return String(document.querySelector('meta[name="rota27-version"]')?.getAttribute('content')||'')===VERSION;}
  function catalog(){return Array.isArray(window.state?.catalog)?window.state.catalog:[];}
  function configs(){try{return window.Rota27V021?.getConfigs?.()||{};}catch{return {};}}
  function orders(){try{return window.Rota27V022?.getOrders?.()||[];}catch{return [];}}
  function receipts(){try{return window.Rota27V022?.getReceipts?.()||[];}catch{return [];}}
  function suppliers(){try{return (window.Rota27V022?.getSuppliers?.()||[]).filter(s=>s?.active!==false);}catch{return [];}}
  function current(id){try{return round3(window.Rota27V021?.currentQty?.(id)||0);}catch{return 0;}}
  function committed(id){try{return round3(window.Rota27V021?.committedQty?.(id)||0);}catch{return 0;}}
  function available(id){try{return round3(window.Rota27V021?.availableQty?.(id)||0);}catch{return round3(current(id)-committed(id));}}
  function productName(id){return catalog().find(p=>String(p.id)===String(id))?.name||configs()[id]?.name||'Produto';}

  function receivedQty(orderId,productId){
    return round3(receipts().filter(r=>String(r.orderId)===String(orderId)).reduce((sum,r)=>sum+(Array.isArray(r.items)?r.items:[]).reduce((s,i)=>s+(String(i.productId)===String(productId)?Number(i.qty||0):0),0),0));
  }
  function pendingQty(order,item){return round3(Math.max(0,Number(item?.qty||0)-receivedQty(order.id,item.productId)));}
  function pendingForProduct(productId){
    return round3(orders().filter(o=>o?.status==='draft'||o?.status==='sent').reduce((sum,o)=>sum+(Array.isArray(o.items)?o.items:[]).reduce((s,i)=>s+(String(i.productId)===String(productId)?pendingQty(o,i):0),0),0));
  }
  function supplierForProduct(productId){
    return suppliers().find(s=>Array.isArray(s.productIds)&&s.productIds.some(id=>String(id)===String(productId)))||null;
  }

  function stockRows(){
    const cfg=configs();
    return catalog().map(p=>{
      const c=cfg[p.id]||null;
      if(c?.enabled!==true)return null;
      const cur=current(p.id),com=committed(p.id),avail=available(p.id),min=Math.max(0,Number(c.minQty||0));
      const critical=avail<=0,attention=!critical&&avail<=min;
      const status=critical?'critical':attention?'attention':'healthy';
      const suggested=(critical||attention)?round3(Math.max(0,(min+1)-avail)):0;
      const inOrder=pendingForProduct(p.id);
      return {product:p,current:cur,committed:com,available:avail,min,status,suggested,inOrder,supplier:supplierForProduct(p.id)};
    }).filter(Boolean);
  }

  function stats(){
    const rows=stockRows(),need=rows.filter(r=>r.status!=='healthy'),critical=rows.filter(r=>r.status==='critical'),healthy=rows.filter(r=>r.status==='healthy');
    const openOrders=orders().filter(o=>o.status==='draft'||o.status==='sent');
    const draft=openOrders.filter(o=>o.status==='draft'),sent=openOrders.filter(o=>o.status==='sent');
    const partial=sent.filter(o=>receipts().some(r=>String(r.orderId)===String(o.id)));
    const pendingUnits=round3(openOrders.reduce((sum,o)=>sum+(Array.isArray(o.items)?o.items:[]).reduce((s,i)=>s+pendingQty(o,i),0),0));
    const suggestedUnits=round3(need.reduce((s,r)=>s+r.suggested,0));
    const currentUnits=round3(rows.reduce((s,r)=>s+r.current,0));
    const committedUnits=round3(rows.reduce((s,r)=>s+r.committed,0));
    const availableUnits=round3(rows.reduce((s,r)=>s+r.available,0));
    const withSupplier=rows.filter(r=>r.supplier).length;
    const needWithoutSupplier=need.filter(r=>!r.supplier).length;
    const todayKey=new Date().toDateString();
    const now=Date.now(),sevenDays=7*24*60*60*1000;
    const receivedToday=receipts().filter(r=>new Date(Number(r.createdAt||0)).toDateString()===todayKey);
    const received7=receipts().filter(r=>now-Number(r.createdAt||0)<=sevenDays);
    const unitsToday=round3(receivedToday.reduce((s,r)=>s+(r.items||[]).reduce((x,i)=>x+Number(i.qty||0),0),0));
    const units7=round3(received7.reduce((s,r)=>s+(r.items||[]).reduce((x,i)=>x+Number(i.qty||0),0),0));
    return {rows,need,critical,healthy,openOrders,draft,sent,partial,pendingUnits,suggestedUnits,currentUnits,committedUnits,availableUnits,withSupplier,needWithoutSupplier,receivedToday,received7,unitsToday,units7};
  }

  function metric(label,value,sub='',cls=''){
    return `<div class="v022g-metric ${cls}"><small>${esc(label)}</small><strong>${esc(value)}</strong>${sub?`<span>${esc(sub)}</span>`:''}</div>`;
  }

  function switchTab(tab){
    const btn=document.querySelector(`#v022PurchasesWrap [data-tab="${tab}"]`);
    if(btn)btn.click();
  }
  function openStock(){
    byId('v022PurchasesWrap')?.classList.remove('open');
    try{window.Rota27V021?.openStock?.();}catch{}
  }

  function renderSummary(s){
    const el=byId('v022Summary');if(!el)return;
    el.classList.add('v022g-summary');
    el.innerHTML=[
      metric('Produtos controlados',s.rows.length,`${s.healthy.length} saudáveis`),
      metric('Críticos',s.critical.length,s.critical.length?'sem disponível':'nenhum agora',s.critical.length?'danger':''),
      metric('Para repor',s.need.length,`${fmtQty(s.suggestedUnits)} unid. sugeridas`,s.need.length?'warn':''),
      metric('Pedidos abertos',s.openOrders.length,`${s.draft.length} rasc. • ${s.sent.length} enviados`),
      metric('Unid. em pedido',fmtQty(s.pendingUnits),s.partial.length?`${s.partial.length} parcial(is)`:''),
      metric('Comprometidas',fmtQty(s.committedUnits),'em comandas abertas')
    ].join('');
  }

  function healthBar(s){
    const total=Math.max(1,s.rows.length),criticalPct=s.critical.length/total*100,attentionPct=(s.need.length-s.critical.length)/total*100,healthyPct=s.healthy.length/total*100;
    return `<div class="v022g-healthbar" aria-label="Saúde do estoque"><span class="critical" style="width:${criticalPct}%"></span><span class="attention" style="width:${attentionPct}%"></span><span class="healthy" style="width:${healthyPct}%"></span></div>`;
  }

  function priorityRows(s){
    const rows=s.need.slice().sort((a,b)=>{
      const rank=x=>x.status==='critical'?0:1;
      return rank(a)-rank(b)||(a.available-a.min)-(b.available-b.min)||String(a.product.name||'').localeCompare(String(b.product.name||''),'pt-BR');
    }).slice(0,6);
    if(!rows.length)return '<div class="v022g-empty-mini">Nenhum produto exige reposição agora.</div>';
    return rows.map(r=>`<div class="v022g-priority-row">
      <div class="v022g-priority-main"><strong>${esc(r.product.name)}</strong><span class="v022g-pill ${r.status}">${r.status==='critical'?'Crítico':'Abaixo do mínimo'}</span><small>${esc(r.supplier?.name||'Sem fornecedor padrão')}</small></div>
      <div class="v022g-facts">
        <span><small>Disponível</small><b>${fmtQty(r.available)}</b></span>
        <span><small>Mínimo</small><b>${fmtQty(r.min)}</b></span>
        <span><small>Sugestão</small><b>${fmtQty(r.suggested)}</b></span>
        <span><small>Já em pedido</small><b>${fmtQty(r.inOrder)}</b></span>
      </div>
    </div>`).join('');
  }

  function latestReceipts(){
    const rows=receipts().slice().sort((a,b)=>Number(b.createdAt||0)-Number(a.createdAt||0)).slice(0,5);
    if(!rows.length)return '<div class="v022g-empty-mini">Nenhum recebimento registrado ainda.</div>';
    return rows.map(r=>{
      const units=round3((r.items||[]).reduce((s,i)=>s+Number(i.qty||0),0));
      return `<div class="v022g-receipt-row"><div><strong>${esc(r.orderCode||'Recebimento')}</strong><small>${esc(r.supplierName||'Sem fornecedor')} • ${fmtDate(r.createdAt)}</small></div><b>+${fmtQty(units)}</b></div>`;
    }).join('');
  }

  function renderOverview(s){
    const wrap=byId('v022PurchasesWrap'),notice=byId('v022Notice');if(!wrap||!notice)return;
    let el=byId('v022ManagerOverview');
    if(!el){el=document.createElement('section');el.id='v022ManagerOverview';el.className='v022g-overview';notice.insertAdjacentElement('afterend',el);}
    const supplierPct=s.rows.length?Math.round((s.withSupplier/s.rows.length)*100):0;
    el.innerHTML=`
      <div class="v022g-quick-actions">
        <button type="button" data-go="restock"><span>↻</span><b>Repor agora</b><small>${s.need.length} produto${s.need.length===1?'':'s'} em atenção</small></button>
        <button type="button" data-go="orders"><span>▤</span><b>Pedidos</b><small>${s.openOrders.length} aberto${s.openOrders.length===1?'':'s'} • ${fmtQty(s.pendingUnits)} unid.</small></button>
        <button type="button" data-go="suppliers"><span>⌂</span><b>Fornecedores</b><small>${suppliers().length} ativo${suppliers().length===1?'':'s'} • ${supplierPct}% cobertura</small></button>
        <button type="button" data-go="stock"><span>▦</span><b>Estoque Essencial</b><small>${fmtQty(s.availableUnits)} unid. disponíveis</small></button>
      </div>
      <div class="v022g-grid">
        <section class="v022g-card v022g-stock-health">
          <div class="v022g-card-head"><div><small>VISÃO DO ESTOQUE</small><h4>Situação dos produtos controlados</h4></div><button type="button" data-go="stock">Abrir estoque</button></div>
          ${healthBar(s)}
          <div class="v022g-health-legend"><span><i class="critical"></i><b>${s.critical.length}</b> críticos</span><span><i class="attention"></i><b>${s.need.length-s.critical.length}</b> abaixo do mínimo</span><span><i class="healthy"></i><b>${s.healthy.length}</b> saudáveis</span></div>
          <div class="v022g-stock-totals">
            <span><small>Estoque físico</small><b>${fmtQty(s.currentUnits)}</b></span>
            <span><small>Comprometido</small><b>${fmtQty(s.committedUnits)}</b></span>
            <span><small>Disponível projetado</small><b>${fmtQty(s.availableUnits)}</b></span>
            <span><small>Sem fornecedor na atenção</small><b>${s.needWithoutSupplier}</b></span>
          </div>
        </section>
        <section class="v022g-card v022g-flow">
          <div class="v022g-card-head"><div><small>FLUXO DE COMPRAS</small><h4>O que está acontecendo agora</h4></div><button type="button" data-go="orders">Ver pedidos</button></div>
          <div class="v022g-flow-grid">
            <div><small>Rascunhos</small><strong>${s.draft.length}</strong><span>ainda não enviados</span></div>
            <div><small>Enviados</small><strong>${s.sent.length}</strong><span>${fmtQty(s.pendingUnits)} unid. pendentes</span></div>
            <div><small>Recebido hoje</small><strong>${fmtQty(s.unitsToday)}</strong><span>${s.receivedToday.length} recebimento${s.receivedToday.length===1?'':'s'}</span></div>
            <div><small>Últimos 7 dias</small><strong>${fmtQty(s.units7)}</strong><span>unidades recebidas</span></div>
          </div>
        </section>
        <section class="v022g-card v022g-priorities">
          <div class="v022g-card-head"><div><small>PRIORIDADES</small><h4>Produtos que pedem decisão</h4></div><button type="button" data-go="restock">Ir para reposição</button></div>
          <div class="v022g-priority-list">${priorityRows(s)}</div>
        </section>
        <section class="v022g-card v022g-receipts">
          <div class="v022g-card-head"><div><small>RECEBIMENTOS</small><h4>Últimas entradas por compra</h4></div></div>
          <div class="v022g-receipt-list">${latestReceipts()}</div>
        </section>
      </div>`;
    el.querySelectorAll('[data-go]').forEach(btn=>btn.addEventListener('click',()=>{
      const go=btn.dataset.go;
      if(go==='stock')openStock();else switchTab(go);
    }));
  }

  function enhanceRestock(s){
    document.querySelectorAll('#v022Content .v022-restock-row').forEach(row=>{
      const id=String(row.dataset.productId||'');const r=s.rows.find(x=>String(x.product.id)===id);if(!r)return;
      row.classList.toggle('v022g-critical',r.status==='critical');
      row.querySelector('.v022g-stock-facts')?.remove();
      const product=row.querySelector('.v022-product');if(!product)return;
      const facts=document.createElement('div');facts.className='v022g-stock-facts';
      facts.innerHTML=`<span><small>Físico</small><b>${fmtQty(r.current)}</b></span><span><small>Comprometido</small><b>${fmtQty(r.committed)}</b></span><span><small>Disponível</small><b>${fmtQty(r.available)}</b></span><span><small>Mínimo</small><b>${fmtQty(r.min)}</b></span><span><small>Em pedido</small><b>${fmtQty(r.inOrder)}</b></span>`;
      product.appendChild(facts);
      let flag=row.querySelector('.v022g-row-flag');
      if(!flag){flag=document.createElement('span');flag.className='v022g-row-flag';product.insertBefore(flag,product.firstChild);}
      flag.className=`v022g-row-flag ${r.status}`;
      flag.textContent=r.status==='critical'?'CRÍTICO':'REPOR';
    });
  }

  function enhanceOrders(){
    const allOrders=orders();
    document.querySelectorAll('#v022Content .v022-order-card').forEach(card=>{
      const o=allOrders.find(x=>String(x.id)===String(card.dataset.orderId));if(!o)return;
      card.querySelector('.v022g-order-progress')?.remove();
      const items=Array.isArray(o.items)?o.items:[],ordered=round3(items.reduce((s,i)=>s+Number(i.qty||0),0));
      const received=round3(items.reduce((s,i)=>s+receivedQty(o.id,i.productId),0));
      const pending=round3(Math.max(0,ordered-received)),pct=ordered?Math.max(0,Math.min(100,received/ordered*100)):0;
      const box=document.createElement('div');box.className='v022g-order-progress';
      box.innerHTML=`<div class="v022g-order-progress-top"><span><small>Pedido</small><b>${fmtQty(ordered)}</b></span><span><small>Recebido</small><b>${fmtQty(received)}</b></span><span><small>Pendente</small><b>${fmtQty(pending)}</b></span><strong>${Math.round(pct)}%</strong></div><div class="v022g-progress-track"><span style="width:${pct}%"></span></div>`;
      card.querySelector('.v022-order-items')?.insertAdjacentElement('afterend',box);
    });
  }

  function enhanceSuppliers(s){
    const allSup=suppliers(),allOrders=orders();
    document.querySelectorAll('#v022Content .v022-supplier-card').forEach(card=>{
      const sup=allSup.find(x=>String(x.id)===String(card.dataset.supplierId));if(!sup)return;
      card.querySelector('.v022g-supplier-insight')?.remove();
      const ids=Array.isArray(sup.productIds)?sup.productIds.map(String):[];
      const names=ids.map(productName).filter(Boolean);
      const need=s.need.filter(r=>ids.includes(String(r.product.id))).length;
      const open=allOrders.filter(o=>(o.status==='draft'||o.status==='sent')&&String(o.supplierId)===String(sup.id)).length;
      const box=document.createElement('div');box.className='v022g-supplier-insight';
      box.innerHTML=`<span><small>Produtos vinculados</small><b>${ids.length}</b></span><span><small>Precisando reposição</small><b>${need}</b></span><span><small>Pedidos abertos</small><b>${open}</b></span><p>${names.length?esc(names.slice(0,5).join(' • ')):'Nenhum produto associado'}${names.length>5?` • +${names.length-5}`:''}</p>`;
      card.appendChild(box);
    });
  }

  function enhance(){
    enhanceTimer=null;if(!own())return;
    const wrap=byId('v022PurchasesWrap');if(!wrap)return;
    const title=wrap.querySelector('.v022-head h3'),desc=wrap.querySelector('.v022-head .desc');
    if(title)title.textContent='Compras & Reposição';
    if(desc)desc.textContent='Central gerencial para entender o estoque, priorizar compras, acompanhar pedidos e registrar recebimentos.';
    const s=stats();
    renderSummary(s);renderOverview(s);
    if(wrap.querySelector('[data-tab="restock"]')?.classList.contains('active'))enhanceRestock(s);
    if(wrap.querySelector('[data-tab="orders"]')?.classList.contains('active'))enhanceOrders();
    if(wrap.querySelector('[data-tab="suppliers"]')?.classList.contains('active'))enhanceSuppliers(s);
  }
  function schedule(){if(enhanceTimer)clearTimeout(enhanceTimer);enhanceTimer=setTimeout(enhance,0);}

  function wrapOpen(){
    if(wrapped||!window.Rota27V022?.open)return;
    const base=window.Rota27V022.open.bind(window.Rota27V022);
    window.Rota27V022.open=function(){const r=base(...arguments);schedule();setTimeout(schedule,40);return r;};
    wrapped=true;
  }

  function start(){
    if(!own())return;
    wrapOpen();schedule();
    const root=byId('v022PurchasesWrap');
    if(root){
      root.addEventListener('click',schedule);
      root.addEventListener('change',schedule);
      root.addEventListener('input',e=>{if(e.target?.matches?.('[data-role="qty"]'))schedule();});
    }
    window.addEventListener('rota27:v021-stock-updated',schedule);
    window.addEventListener('rota27:v022-purchases-updated',schedule);
    window.addEventListener('rota27:v017-domain-updated',schedule);
    console.info('[Rota27] v0.22.0 visão gerencial ampliada de Compras & Estoque carregada.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
