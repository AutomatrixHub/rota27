/* Rota 27 v0.24.0 — Custos & Margem */
(function(){
  'use strict';

  const VERSION='0.24.0';
  const LABEL='v0.24.0';
  const TITLE='Rota 27 Bodega • Comandas v0.24.0';

  const ORDERS_KEY='rota27_v022_purchase_orders_v1';
  const RECEIPTS_KEY='rota27_v022_purchase_receipts_v1';
  const PURCHASE_OUTBOX_KEY='rota27_v022_purchase_outbox_v1';
  const META_KEY='rota27_v024_cost_meta_v1';

  let pendingOrderCosts=null;
  let pendingReceiptCosts=null;
  let activeReceiveOrderId=null;
  let managerMode='overview';
  let search='';

  function byId(id){return document.getElementById(id);}
  function clone(v){return JSON.parse(JSON.stringify(v==null?null:v));}
  function esc(v){
    if(typeof escapeHtml==='function')return escapeHtml(String(v??''));
    return String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }
  function readJson(key,fallback){try{const x=JSON.parse(localStorage.getItem(key)||'null');return x==null?fallback:x;}catch{return fallback;}}
  function writeJson(key,v){localStorage.setItem(key,JSON.stringify(v));}
  function round2(v){return Math.round(Number(v||0)*100)/100;}
  function round4(v){return Math.round(Number(v||0)*10000)/10000;}
  function fmtQty(v){return Number(v||0).toLocaleString('pt-BR',{maximumFractionDigits:3});}
  function fmtMoney(v){return Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}
  function fmtPct(v){return Number(v||0).toLocaleString('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1})+'%';}
  function fmtDate(ts){const n=Number(ts||0);if(!n)return '—';return new Date(n).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',year:'2-digit',hour:'2-digit',minute:'2-digit'});}
  function parseMoney(v){
    const raw=String(v??'').trim().replace(/\s/g,'');
    if(!raw)return 0;
    const s=raw.includes(',')?raw.replace(/\./g,'').replace(',','.'):raw;
    const n=Number(s);
    return Number.isFinite(n)&&n>=0?round4(n):0;
  }
  function toast(msg){try{if(typeof showToast==='function')showToast(msg,false);else console.info('[Rota27]',msg);}catch{}}
  function catalog(){return Array.isArray(window.state?.catalog)?window.state.catalog:[];}
  function orders(){try{return window.Rota27V022?.getOrders?.()||readJson(ORDERS_KEY,[]);}catch{return readJson(ORDERS_KEY,[]);}}
  function receipts(){try{return window.Rota27V022?.getReceipts?.()||readJson(RECEIPTS_KEY,[]);}catch{return readJson(RECEIPTS_KEY,[]);}}
  function suppliers(){try{return (window.Rota27V022?.getSuppliers?.()||[]).filter(s=>s?.active!==false);}catch{return [];}}
  function configs(){try{return window.Rota27V021?.getConfigs?.()||{};}catch{return {};}}
  function currentQty(id){try{return Number(window.Rota27V021?.currentQty?.(id)||0);}catch{return 0;}}
  function product(id){return catalog().find(p=>String(p.id)===String(id))||null;}
  function productPrice(id){const p=product(id);const n=Number(p?.price||0);return Number.isFinite(n)&&n>0?n:0;}
  function supplierForProduct(id){return suppliers().find(s=>Array.isArray(s.productIds)&&s.productIds.some(x=>String(x)===String(id)))||null;}
  function meta(){const x=readJson(META_KEY,{});return x&&typeof x==='object'&&!Array.isArray(x)?x:{};}
  function patchMeta(p){writeJson(META_KEY,{...meta(),...p});}

  function costRecords(){
    const list=[];
    receipts().forEach(r=>{
      const known=(Array.isArray(r.items)?r.items:[]).map(i=>{
        const qty=Number(i.qty||0);
        const unit=Number(i.unitCost||0);
        if(!(qty>0&&unit>0))return null;
        const base=Number(i.lineCost||round2(qty*unit));
        return {item:i,qty,unit,base};
      }).filter(Boolean);
      const knownBase=known.reduce((s,x)=>s+x.base,0);
      const freight=Math.max(0,Number(r.freightCost||0));
      known.forEach(x=>{
        const storedShare=Number(x.item.freightShare||0);
        const share=storedShare>0?storedShare:(knownBase>0&&freight>0?round2(freight*(x.base/knownBase)):0);
        const effectiveLine=Number(x.item.effectiveLineCost||round2(x.base+share));
        const effectiveUnit=Number(x.item.effectiveUnitCost||round4(effectiveLine/x.qty));
        list.push({
          receiptId:String(r.id||''),
          orderId:String(r.orderId||''),
          orderCode:r.orderCode||'Pedido',
          supplierId:r.supplierId||null,
          supplierName:r.supplierName||'Sem fornecedor',
          productId:String(x.item.productId||''),
          productName:x.item.productName||product(x.item.productId)?.name||'Produto',
          qty:x.qty,
          unitCost:x.unit,
          lineCost:x.base,
          freightShare:share,
          effectiveLineCost:effectiveLine,
          effectiveUnitCost:effectiveUnit,
          createdAt:Number(r.createdAt||0)
        });
      });
    });
    return list.sort((a,b)=>b.createdAt-a.createdAt);
  }

  function lastCost(productId,supplierId=null){
    const all=costRecords().filter(x=>String(x.productId)===String(productId));
    if(supplierId){
      const same=all.find(x=>String(x.supplierId||'')===String(supplierId||''));
      if(same)return same;
    }
    return all[0]||null;
  }
  function previousCost(productId){
    const all=costRecords().filter(x=>String(x.productId)===String(productId));
    return all.length>1?all[1]:null;
  }
  function quoteFor(productId,supplierId=null){
    const r=lastCost(productId,supplierId);
    if(!r)return {value:0,source:''};
    const same=supplierId&&String(r.supplierId||'')===String(supplierId||'');
    return {value:r.unitCost,source:same?'last_supplier_cost':'last_product_cost'};
  }

  function controlledRows(){
    const cfg=configs();
    return catalog().filter(p=>cfg[p.id]?.enabled===true).map(p=>{
      const cost=lastCost(p.id);
      const price=productPrice(p.id);
      const current=Number(currentQty(p.id)||0);
      const marginUnit=cost&&price>0?round2(price-cost.effectiveUnitCost):null;
      const marginPct=cost&&price>0?round4((marginUnit/price)*100):null;
      return {product:p,cost,price,current,stockValue:cost?round2(current*cost.effectiveUnitCost):null,marginUnit,marginPct};
    });
  }

  function restockSuggestion(id){
    const cfg=configs()[id];
    if(cfg?.enabled!==true)return 0;
    let available=0;
    try{available=Number(window.Rota27V021?.availableQty?.(id)||0);}catch{available=currentQty(id);}
    const min=Math.max(0,Number(cfg.minQty||0));
    return available<=min?Math.max(0,(min+1)-available):0;
  }
  function knownReplenishmentCost(){
    let total=0,known=0,unknown=0;
    controlledRows().forEach(r=>{
      const q=restockSuggestion(r.product.id);
      if(!(q>0))return;
      const c=quoteFor(r.product.id,supplierForProduct(r.product.id)?.id);
      if(c.value>0){total+=q*c.value;known++;}else unknown++;
    });
    return {total:round2(total),known,unknown};
  }
  function stats(){
    const rows=controlledRows();
    const known=rows.filter(r=>r.cost);
    const stockValue=round2(known.reduce((s,r)=>s+Number(r.stockValue||0),0));
    const margins=rows.filter(r=>r.marginPct!==null);
    const avgMargin=margins.length?margins.reduce((s,r)=>s+r.marginPct,0)/margins.length:null;
    const negative=margins.filter(r=>r.marginPct<0);
    const rep=knownReplenishmentCost();
    return {rows,known,margins,negative,stockValue,avgMargin,coverage:rows.length?Math.round(known.length/rows.length*100):0,rep};
  }

  function enrichReceipt(receipt,costs){
    if(!receipt||!costs)return receipt;
    const costMap=new Map(costs.items.map(x=>[String(x.productId),x]));
    const items=(receipt.items||[]).map(i=>{
      const c=costMap.get(String(i.productId));
      if(!c||!(c.unitCost>0))return {...i};
      const line=round2(Number(i.qty||0)*c.unitCost);
      return {...i,unitCost:c.unitCost,lineCost:line,costSource:c.source||'manual'};
    });
    const known=items.filter(i=>Number(i.unitCost||0)>0&&Number(i.qty||0)>0);
    const itemsCost=round2(known.reduce((s,i)=>s+Number(i.lineCost||0),0));
    const freight=round2(costs.freightCost||0);
    const nextItems=items.map(i=>{
      if(!(Number(i.unitCost||0)>0&&Number(i.qty||0)>0))return i;
      const base=Number(i.lineCost||0);
      const share=itemsCost>0&&freight>0?round2(freight*(base/itemsCost)):0;
      const effectiveLine=round2(base+share);
      const effectiveUnit=round4(effectiveLine/Number(i.qty||1));
      return {...i,freightShare:share,effectiveLineCost:effectiveLine,effectiveUnitCost:effectiveUnit};
    });
    return {...receipt,items:nextItems,freightCost:freight,itemsCost,totalAcquisitionCost:round2(itemsCost+freight),costedItems:known.length,costUpdatedAt:Date.now(),costAppVersion:VERSION};
  }

  function patchPurchaseOutboxReceipt(receipt){
    const rows=readJson(PURCHASE_OUTBOX_KEY,[]);if(!Array.isArray(rows))return;
    let changed=false;
    rows.forEach(e=>{
      if(String(e.eventType)==='purchase_receipt'&&String(e.eventId)===String(receipt.id)){
        e.payload={receipt:clone(receipt)};e.appVersion=VERSION;changed=true;
      }
    });
    if(changed)writeJson(PURCHASE_OUTBOX_KEY,rows);
  }
  function patchPurchaseOutboxOrder(order){
    const rows=readJson(PURCHASE_OUTBOX_KEY,[]);if(!Array.isArray(rows))return;
    let changed=false;
    rows.forEach(e=>{
      if(String(e.eventType)==='purchase_order_upsert'&&String(e.entityId)===String(order.id)){
        e.payload={order:clone(order)};e.appVersion=VERSION;changed=true;
      }
    });
    if(changed)writeJson(PURCHASE_OUTBOX_KEY,rows);
  }

  function patchNewOrders(){
    const snap=pendingOrderCosts;pendingOrderCosts=null;if(!snap)return;
    const rows=readJson(ORDERS_KEY,[]);if(!Array.isArray(rows))return;
    const cutoff=snap.at-2000;let changed=false;
    rows.forEach(o=>{
      if(Number(o.createdAt||0)<cutoff)return;
      let orderChanged=false;
      o.items=(o.items||[]).map(i=>{
        const c=snap.costs[String(i.productId)];
        if(!c||!(c.value>0))return i;
        orderChanged=true;
        return {...i,unitCostQuoted:c.value,costSource:c.source||'manual'};
      });
      if(orderChanged){
        const known=o.items.filter(i=>Number(i.unitCostQuoted||0)>0);
        o.estimatedItemsCost=round2(known.reduce((s,i)=>s+Number(i.qty||0)*Number(i.unitCostQuoted||0),0));
        o.costedItems=known.length;o.costAppVersion=VERSION;patchPurchaseOutboxOrder(o);changed=true;
      }
    });
    if(changed){writeJson(ORDERS_KEY,rows);setTimeout(()=>{try{window.dispatchEvent(new CustomEvent('rota27:v022-purchases-updated'));}catch{}},0);}
  }

  function patchNewReceipt(){
    const snap=pendingReceiptCosts;pendingReceiptCosts=null;if(!snap)return;
    const rows=readJson(RECEIPTS_KEY,[]);if(!Array.isArray(rows))return;
    const candidates=rows.filter(r=>String(r.orderId)===String(snap.orderId)&&Number(r.createdAt||0)>=snap.at-2000).sort((a,b)=>Number(b.createdAt||0)-Number(a.createdAt||0));
    const r=candidates[0];if(!r)return;
    const next=enrichReceipt(r,snap);const idx=rows.findIndex(x=>String(x.id)===String(r.id));if(idx<0)return;
    rows[idx]=next;writeJson(RECEIPTS_KEY,rows);patchPurchaseOutboxReceipt(next);
    setTimeout(()=>{try{window.dispatchEvent(new CustomEvent('rota27:v022-purchases-updated'));}catch{}},0);
  }

  function captureRestockCosts(){
    const costs={};
    document.querySelectorAll('#v022Content .v022-restock-row').forEach(row=>{
      if(!row.querySelector('[data-role="selected"]')?.checked)return;
      const input=row.querySelector('[data-v024-role="quoted-cost"]');const value=parseMoney(input?.value||'');
      if(value>0)costs[String(row.dataset.productId)]={value,source:input?.dataset.source||'manual'};
    });
    pendingOrderCosts={at:Date.now(),costs};
  }
  function captureReceiptCosts(){
    const wrap=byId('v022ReceiveWrap');if(!wrap)return;
    const items=[];
    wrap.querySelectorAll('.v022-receive-row').forEach(row=>{
      const costInput=row.querySelector('[data-v024-role="receipt-cost"]');const value=parseMoney(costInput?.value||'');
      items.push({productId:String(row.dataset.productId),unitCost:value,source:costInput?.dataset.source||'manual'});
    });
    const freight=parseMoney(byId('v024ReceiptFreight')?.value||'');
    pendingReceiptCosts={at:Date.now(),orderId:activeReceiveOrderId,items,freightCost:freight};
  }

  function updateRestockSubtotal(row){
    const qty=Number(row.querySelector('[data-role="qty"]')?.value||0);
    const cost=parseMoney(row.querySelector('[data-v024-role="quoted-cost"]')?.value||'');
    const out=row.querySelector('[data-v024-role="subtotal"]');if(out)out.textContent=cost>0&&qty>0?fmtMoney(qty*cost):'—';
  }
  function enhanceRestock(){
    document.querySelectorAll('#v022Content .v022-restock-row').forEach(row=>{
      if(row.querySelector('[data-v024-role="quoted-cost"]'))return;
      const pid=String(row.dataset.productId||'');
      const supplierId=row.querySelector('[data-role="supplier"]')?.value||supplierForProduct(pid)?.id||null;
      const q=quoteFor(pid,supplierId);
      const label=document.createElement('label');label.className='v024-restock-cost';
      label.innerHTML=`<small>Custo unit. previsto</small><input data-v024-role="quoted-cost" inputmode="decimal" type="text" placeholder="Opcional" value="${q.value>0?String(q.value).replace('.',','):''}" data-source="${q.source||''}"><span data-v024-role="subtotal">${q.value>0?fmtMoney(Number(row.querySelector('[data-role="qty"]')?.value||0)*q.value):'—'}</span>`;
      row.appendChild(label);
      const input=label.querySelector('input');
      input.addEventListener('input',()=>{input.dataset.source='manual';updateRestockSubtotal(row);});
      row.querySelector('[data-role="qty"]')?.addEventListener('input',()=>updateRestockSubtotal(row));
      row.querySelector('[data-role="supplier"]')?.addEventListener('change',()=>{
        if(input.dataset.source==='manual'&&input.value.trim())return;
        const next=quoteFor(pid,row.querySelector('[data-role="supplier"]')?.value||null);
        input.value=next.value>0?String(next.value).replace('.',','):'';input.dataset.source=next.source||'';updateRestockSubtotal(row);
      });
    });
  }

  function enhanceReceive(){
    const wrap=byId('v022ReceiveWrap');if(!wrap||!wrap.classList.contains('open'))return;
    const o=orders().find(x=>String(x.id)===String(activeReceiveOrderId))||null;
    wrap.querySelectorAll('.v022-receive-row').forEach(row=>{
      if(row.querySelector('[data-v024-role="receipt-cost"]'))return;
      const pid=String(row.dataset.productId||'');const orderItem=(o?.items||[]).find(i=>String(i.productId)===pid);
      let value=Number(orderItem?.unitCostQuoted||0),source=value>0?'order_quote':'';
      if(!(value>0)){const q=quoteFor(pid,o?.supplierId||null);value=q.value;source=q.source;}
      const label=document.createElement('label');label.className='v024-receive-cost';
      label.innerHTML=`<small>Custo unitário</small><input data-v024-role="receipt-cost" type="text" inputmode="decimal" placeholder="Opcional" value="${value>0?String(value).replace('.',','):''}" data-source="${source||''}"><span data-v024-role="receive-line">—</span>`;
      row.appendChild(label);
      const input=label.querySelector('input');
      const update=()=>{
        const qty=Number(row.querySelector('input[type="number"]')?.value||0);const cost=parseMoney(input.value);
        label.querySelector('[data-v024-role="receive-line"]').textContent=qty>0&&cost>0?fmtMoney(qty*cost):'—';renderReceiptTotal();
      };
      input.addEventListener('input',()=>{input.dataset.source='manual';update();});row.querySelector('input[type="number"]')?.addEventListener('input',update);update();
    });
    if(!byId('v024ReceiptFreight')){
      const note=byId('v022ReceiveNote')?.closest('label');const label=document.createElement('label');label.className='v022-label v024-freight-label';
      label.innerHTML='<span>Frete desta entrega <small>opcional</small></span><input id="v024ReceiptFreight" type="text" inputmode="decimal" placeholder="R$ 0,00"><div id="v024ReceiptTotal" class="v024-receipt-total"></div>';
      if(note)note.insertAdjacentElement('beforebegin',label);else byId('v022ReceiveItems')?.insertAdjacentElement('afterend',label);
      byId('v024ReceiptFreight').addEventListener('input',renderReceiptTotal);
    }
    renderReceiptTotal();
  }
  function renderReceiptTotal(){
    const el=byId('v024ReceiptTotal');if(!el)return;
    let items=0,known=0,totalRows=0;
    document.querySelectorAll('#v022ReceiveWrap .v022-receive-row').forEach(row=>{
      const qty=Number(row.querySelector('input[type="number"]')?.value||0);const cost=parseMoney(row.querySelector('[data-v024-role="receipt-cost"]')?.value||'');
      if(qty>0){totalRows++;if(cost>0){items+=qty*cost;known++;}}
    });
    const freight=parseMoney(byId('v024ReceiptFreight')?.value||'');
    el.innerHTML=`<span><small>Itens com custo</small><b>${known}/${totalRows}</b></span><span><small>Subtotal conhecido</small><b>${items>0?fmtMoney(items):'—'}</b></span><span><small>Frete</small><b>${freight>0?fmtMoney(freight):'—'}</b></span><span><small>Total conhecido</small><b>${items>0?fmtMoney(items+freight):'—'}</b></span>`;
  }

  function orderCost(o){const known=(o.items||[]).filter(i=>Number(i.unitCostQuoted||0)>0);return known.length?round2(known.reduce((s,i)=>s+Number(i.qty||0)*Number(i.unitCostQuoted||0),0)):null;}
  function receivedCost(o){const totals=receipts().filter(r=>String(r.orderId)===String(o.id)).map(r=>Number(r.totalAcquisitionCost||0)).filter(x=>x>0);return totals.length?round2(totals.reduce((s,x)=>s+x,0)):null;}
  function enhanceOrders(){
    document.querySelectorAll('#v022Content .v022-order-card').forEach(card=>{
      if(card.querySelector('.v024-order-costs'))return;const o=orders().find(x=>String(x.id)===String(card.dataset.orderId));if(!o)return;
      const quoted=orderCost(o),received=receivedCost(o);const box=document.createElement('div');box.className='v024-order-costs';
      box.innerHTML=`<span><small>Previsto</small><b>${quoted!==null?fmtMoney(quoted):'Sem custo'}</b></span><span><small>Recebido</small><b>${received!==null?fmtMoney(received):'—'}</b></span>`;
      const foot=card.querySelector('.v022-order-foot');if(foot)foot.insertAdjacentElement('beforebegin',box);else card.appendChild(box);
    });
  }

  function injectEntryButtons(){
    const pq=byId('v022ManagerOverview')?.querySelector('.v022g-quick-actions');
    if(pq&&!byId('v024PurchasesCostBtn')){const b=document.createElement('button');b.id='v024PurchasesCostBtn';b.type='button';b.innerHTML='<span>R$</span><b>Custos & Margem</b><small>Custos reais e margem bruta</small>';b.onclick=()=>openCosts();pq.appendChild(b);}
    const sq=byId('v022StockManagerOverview')?.querySelector('.v022s-quick-actions');
    if(sq&&!byId('v024StockCostBtn')){const b=document.createElement('button');b.id='v024StockCostBtn';b.type='button';b.innerHTML='<span>R$</span><b>Custos & Margem</b><small>Valor estimado e cobertura</small>';b.onclick=()=>{byId('v021StockWrap')?.classList.remove('open');openCosts();};sq.appendChild(b);}
  }

  function ensureSheet(){
    if(byId('v024CostsWrap'))return;
    const wrap=document.createElement('div');wrap.id='v024CostsWrap';wrap.className='sheet-wrap';
    wrap.innerHTML=`<div class="sheet v024-sheet"><div class="handle"></div><div class="v024-head"><div><div class="v024-kicker">v0.24.0</div><h3>Custos & Margem</h3><p class="desc">Use custos reais de aquisição para entender margem, estoque e reposição.</p></div><button id="v024Close" class="v024-x" type="button">×</button></div><div class="v024-notice"><strong>Regra:</strong> sem custo real registrado, o Rota 27 não inventa valor.</div><div class="v024-tabs"><button data-mode="overview" class="active">Visão geral</button><button data-mode="products">Produtos</button><button data-mode="history">Histórico de custos</button></div><div id="v024Toolbar"></div><div id="v024Body"></div></div>`;
    document.body.appendChild(wrap);byId('v024Close').onclick=()=>wrap.classList.remove('open');wrap.addEventListener('click',e=>{if(e.target===wrap)wrap.classList.remove('open');});wrap.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{managerMode=b.dataset.mode;search='';renderManager();});
  }
  function metric(label,value,sub='',cls=''){return `<div class="v024-metric ${cls}"><small>${esc(label)}</small><strong>${esc(value)}</strong>${sub?`<span>${esc(sub)}</span>`:''}</div>`;}

  function changesList(){
    const rows=controlledRows().map(r=>{const last=r.cost,prev=previousCost(r.product.id);if(!last||!prev||!(prev.effectiveUnitCost>0))return null;const pct=(last.effectiveUnitCost-prev.effectiveUnitCost)/prev.effectiveUnitCost*100;return {...r,last,prev,changePct:pct};}).filter(Boolean).sort((a,b)=>Math.abs(b.changePct)-Math.abs(a.changePct)).slice(0,6);
    if(!rows.length)return '<div class="v024-empty">Ainda não há dois custos reais do mesmo produto para comparar.</div>';
    return rows.map(r=>`<div class="v024-list-row"><div><strong>${esc(r.product.name)}</strong><small>${esc(r.last.supplierName)} • ${fmtDate(r.last.createdAt)}</small></div><div class="${r.changePct>0?'neg':r.changePct<0?'pos':''}"><b>${r.changePct>0?'+':''}${fmtPct(r.changePct)}</b><small>${fmtMoney(r.prev.effectiveUnitCost)} → ${fmtMoney(r.last.effectiveUnitCost)}</small></div></div>`).join('');
  }
  function lowMargins(){
    const rows=controlledRows().filter(r=>r.marginPct!==null).sort((a,b)=>a.marginPct-b.marginPct).slice(0,6);
    if(!rows.length)return '<div class="v024-empty">Registre custos em recebimentos para calcular margem.</div>';
    return rows.map(r=>`<div class="v024-list-row"><div><strong>${esc(r.product.name)}</strong><small>Venda ${fmtMoney(r.price)} • custo ${fmtMoney(r.cost.effectiveUnitCost)}</small></div><div class="${r.marginPct<0?'neg':r.marginPct<20?'warn':''}"><b>${fmtPct(r.marginPct)}</b><small>${fmtMoney(r.marginUnit)} / unid.</small></div></div>`).join('');
  }
  function missingCosts(){
    const rows=controlledRows().filter(r=>!r.cost).slice(0,8);
    if(!rows.length)return '<div class="v024-empty good">Todos os produtos controlados têm custo registrado.</div>';
    return rows.map(r=>`<div class="v024-list-row"><div><strong>${esc(r.product.name)}</strong><small>${esc(r.product.cat||'Outros')} • fornecedor ${esc(supplierForProduct(r.product.id)?.name||'não definido')}</small></div><b>Sem custo</b></div>`).join('');
  }
  function latestCosts(){
    const rows=costRecords().slice(0,6);if(!rows.length)return '<div class="v024-empty">Nenhum recebimento com custo real registrado ainda.</div>';
    return rows.map(r=>`<div class="v024-list-row"><div><strong>${esc(r.productName)}</strong><small>${esc(r.orderCode)} • ${esc(r.supplierName)} • ${fmtDate(r.createdAt)}</small></div><div><b>${fmtMoney(r.effectiveUnitCost)}</b><small>${fmtQty(r.qty)} unid.${r.freightShare>0?` • frete ${fmtMoney(r.freightShare)}`:''}</small></div></div>`).join('');
  }

  function renderOverview(){
    const s=stats(),body=byId('v024Body');byId('v024Toolbar').innerHTML='';
    body.innerHTML=`<div class="v024-metrics">${[metric('Com custo',s.known.length,`${s.coverage}% dos controlados`),metric('Sem custo',s.rows.length-s.known.length,'não entram nas estimativas',s.rows.length-s.known.length?'warn':''),metric('Valor do estoque',s.known.length?fmtMoney(s.stockValue):'—','somente cobertura conhecida'),metric('Margem média',s.avgMargin!==null?fmtPct(s.avgMargin):'—','média simples dos produtos válidos'),metric('Margem negativa',s.negative.length,s.negative.length?'pedem revisão':'nenhuma agora',s.negative.length?'danger':''),metric('Reposição conhecida',s.rep.known?fmtMoney(s.rep.total):'—',`${s.rep.known} item(ns) com custo`)].join('')}</div><div class="v024-grid"><section class="v024-card"><div class="v024-card-head"><div><small>COBERTURA</small><h4>Produtos sem custo registrado</h4></div><button data-open-mode="products">Ver produtos</button></div>${missingCosts()}</section><section class="v024-card"><div class="v024-card-head"><div><small>MARGEM BRUTA ESTIMADA</small><h4>Menores margens conhecidas</h4></div><button data-open-mode="products">Detalhar</button></div>${lowMargins()}</section><section class="v024-card"><div class="v024-card-head"><div><small>EVOLUÇÃO</small><h4>Custos que mais mudaram</h4></div></div>${changesList()}</section><section class="v024-card"><div class="v024-card-head"><div><small>RECEBIMENTOS</small><h4>Últimos custos reais</h4></div><button data-open-mode="history">Histórico</button></div>${latestCosts()}</section></div><div class="v024-disclaimer">Margem bruta estimada = preço de venda atual − último custo efetivo registrado. Não inclui impostos, taxas de cartão, perdas nem custos indiretos.</div>`;
    body.querySelectorAll('[data-open-mode]').forEach(b=>b.onclick=()=>{managerMode=b.dataset.openMode;renderManager();});
  }
  function renderProducts(){
    const rows=controlledRows().filter(r=>!search||`${r.product.name} ${r.product.cat||''}`.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')));
    byId('v024Toolbar').innerHTML=`<div class="v024-toolbar"><input id="v024Search" type="search" placeholder="Buscar produto..." value="${esc(search)}"></div>`;byId('v024Search').oninput=e=>{search=e.target.value||'';renderProducts();};
    byId('v024Body').innerHTML=rows.length?`<div class="v024-product-list">${rows.map(r=>`<article class="v024-product-card"><div class="v024-product-top"><div><strong>${esc(r.product.name)}</strong><small>${esc(r.product.cat||'Outros')} • estoque ${fmtQty(r.current)}</small></div>${r.cost?'<span class="ok">custo conhecido</span>':'<span class="muted">sem custo</span>'}</div><div class="v024-product-facts"><span><small>Venda</small><b>${r.price>0?fmtMoney(r.price):'—'}</b></span><span><small>Último custo</small><b>${r.cost?fmtMoney(r.cost.effectiveUnitCost):'—'}</b></span><span><small>Margem unit.</small><b>${r.marginUnit!==null?fmtMoney(r.marginUnit):'—'}</b></span><span><small>Margem %</small><b class="${r.marginPct!==null&&r.marginPct<0?'neg':''}">${r.marginPct!==null?fmtPct(r.marginPct):'—'}</b></span><span><small>Valor estoque</small><b>${r.stockValue!==null?fmtMoney(r.stockValue):'—'}</b></span></div><div class="v024-product-source">${r.cost?`Base: ${esc(r.cost.supplierName)} • ${fmtDate(r.cost.createdAt)} • ${esc(r.cost.orderCode)}`:'Registre o custo no próximo recebimento. O preço de venda não é usado como substituto.'}</div></article>`).join('')}</div>`:'<div class="v024-empty">Nenhum produto encontrado.</div>';
  }
  function renderHistory(){
    const rows=costRecords().filter(r=>!search||`${r.productName} ${r.supplierName} ${r.orderCode}`.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')));
    byId('v024Toolbar').innerHTML=`<div class="v024-toolbar"><input id="v024Search" type="search" placeholder="Buscar produto, fornecedor ou pedido..." value="${esc(search)}"><button id="v024ExportCostCsv">⇩ CSV</button></div>`;byId('v024Search').oninput=e=>{search=e.target.value||'';renderHistory();};byId('v024ExportCostCsv').onclick=exportCostCsv;
    byId('v024Body').innerHTML=rows.length?`<div class="v024-history-list">${rows.map(r=>`<article class="v024-history-row"><div><strong>${esc(r.productName)}</strong><small>${esc(r.supplierName)} • ${esc(r.orderCode)} • ${fmtDate(r.createdAt)}</small></div><div class="v024-history-facts"><span><small>Qtd.</small><b>${fmtQty(r.qty)}</b></span><span><small>Custo unit.</small><b>${fmtMoney(r.unitCost)}</b></span><span><small>Frete rateado</small><b>${r.freightShare>0?fmtMoney(r.freightShare):'—'}</b></span><span><small>Custo efetivo</small><b>${fmtMoney(r.effectiveUnitCost)}</b></span></div></article>`).join('')}</div>`:'<div class="v024-empty">Nenhum custo real registrado.</div>';
  }
  function csvCell(v){const s=String(v??'');return /[;"\r\n]/.test(s)?`"${s.replace(/"/g,'""')}"`:s;}
  function exportCostCsv(){
    const lines=['Data;Pedido;Fornecedor;Produto;Quantidade;Custo unitário;Frete rateado;Custo efetivo unitário;Subtotal efetivo'];costRecords().forEach(r=>lines.push([new Date(r.createdAt).toISOString(),r.orderCode,r.supplierName,r.productName,r.qty,r.unitCost,r.freightShare,r.effectiveUnitCost,r.effectiveLineCost].map(csvCell).join(';')));
    const blob=new Blob(['\uFEFF'+lines.join('\r\n')],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`rota27-custos-${new Date().toISOString().slice(0,10)}.csv`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('CSV de custos gerado.');
  }
  function renderManager(){ensureSheet();byId('v024CostsWrap').querySelectorAll('[data-mode]').forEach(b=>b.classList.toggle('active',b.dataset.mode===managerMode));if(managerMode==='products')renderProducts();else if(managerMode==='history')renderHistory();else renderOverview();}
  function openCosts(mode='overview'){managerMode=['overview','products','history'].includes(mode)?mode:'overview';search='';renderManager();byId('v024CostsWrap').classList.add('open');}

  function injectHelp(){
    const overlay=byId('r27HelpOverlay'),content=overlay?.querySelector('.r27-help-content');if(!content)return false;
    if(!byId('r27-help-custos')){const d=document.createElement('details');d.id='r27-help-custos';d.className='r27-help-section';d.innerHTML=`<summary><span class="r27-help-section-icon">R$</span><span><strong>Custos & Margem</strong><small>Registre custo real e entenda a margem bruta estimada.</small></span></summary><div class="r27-help-section-body"><div class="r27-help-lead">O Rota 27 só calcula valores financeiros quando existe <b>custo de aquisição informado</b>. O preço de venda nunca é usado como custo.</div><ol class="r27-help-steps"><li><span>1</span><div><b>Informe o custo previsto</b><br>Na reposição, o custo é opcional e ajuda a estimar o pedido.</div></li><li><span>2</span><div><b>Confirme o custo real no recebimento</b><br>Informe o custo unitário do que chegou. O frete também é opcional.</div></li><li><span>3</span><div><b>Veja a margem</b><br>A Central Custos & Margem compara o preço de venda atual com o último custo efetivo registrado.</div></li><li><span>4</span><div><b>Use como apoio gerencial</b><br>Valor de estoque e margem são estimativas operacionais, não contabilidade nem DRE.</div></li></ol><div class="r27-help-tip"><b>Importante:</b> produtos sem custo continuam aparecendo como Sem custo registrado e ficam fora das estimativas financeiras.</div></div>`;const inv=byId('r27-help-inventario');if(inv)inv.insertAdjacentElement('afterend',d);else content.appendChild(d);}
    const footer=overlay.querySelector('.r27-help-footer span');if(footer)footer.textContent='Ajuda v4.8 • v0.24.0';return true;
  }
  function applyReleaseUi(){const b=byId('v14VersionBadge');if(b&&b.textContent!==LABEL)b.textContent=LABEL;if(document.title!==TITLE)document.title=TITLE;try{window.ROTA27_RELEASE_VERSION=VERSION;window.ROTA27_SYNC_DEV_VERSION=VERSION;}catch{}injectHelp();}
  function enhance(){applyReleaseUi();injectEntryButtons();if(byId('v022PurchasesWrap')?.classList.contains('open')){enhanceRestock();enhanceOrders();enhanceReceive();injectEntryButtons();}if(byId('v021StockWrap')?.classList.contains('open'))injectEntryButtons();if(byId('v024CostsWrap')?.classList.contains('open'))renderManager();}

  function onClickCapture(e){
    const target=e.target?.closest?.('button,[data-action]');if(!target)return;
    if(target.id==='v022CreateOrders')captureRestockCosts();
    if(target.dataset?.action==='receive'){activeReceiveOrderId=target.closest('.v022-order-card')?.dataset.orderId||null;setTimeout(enhanceReceive,0);}
    if(target.id==='v022ReceiveSave')captureReceiptCosts();
  }
  function onClickBubble(e){
    const target=e.target?.closest?.('button,[data-action]');if(!target)return;
    if(target.id==='v022CreateOrders')setTimeout(patchNewOrders,0);
    if(target.id==='v022ReceiveSave')setTimeout(patchNewReceipt,0);
    if(target.matches('#v022PurchasesWrap [data-tab]')||target.dataset?.action==='receive')setTimeout(enhance,0);
  }
  function start(){
    ensureSheet();applyReleaseUi();document.addEventListener('click',onClickCapture,true);document.addEventListener('click',onClickBubble,false);document.addEventListener('input',e=>{if(e.target?.id==='v022Search')setTimeout(enhance,0);});window.addEventListener('rota27:v022-purchases-updated',()=>setTimeout(enhance,0));window.addEventListener('rota27:v021-stock-updated',()=>setTimeout(enhance,0));window.addEventListener('rota27:v023-inventory-updated',()=>setTimeout(enhance,0));window.addEventListener('rota27:v017-domain-updated',()=>setTimeout(enhance,0));window.addEventListener('storage',()=>setTimeout(enhance,0));document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')setTimeout(enhance,0);});setTimeout(enhance,120);setTimeout(enhance,700);console.info('[Rota27] v0.24.0 Custos & Margem carregado.');
  }

  window.Rota27V024={version:VERSION,open:openCosts,getCostRecords:()=>clone(costRecords()),getLastCost:(productId,supplierId=null)=>clone(lastCost(productId,supplierId)),getStats:()=>clone(stats())};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();