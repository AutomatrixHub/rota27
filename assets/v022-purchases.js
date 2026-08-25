/* Rota 27 v0.22.0 — Compras & Reposição */
(function(){
  'use strict';

  const VERSION='0.22.0';
  const LABEL='v0.22.0';
  const TITLE='Rota 27 Bodega • Comandas v0.22.0';

  const SUPPLIERS_KEY='rota27_v022_suppliers_v1';
  const ORDERS_KEY='rota27_v022_purchase_orders_v1';
  const RECEIPTS_KEY='rota27_v022_purchase_receipts_v1';
  const OUTBOX_KEY='rota27_v022_purchase_outbox_v1';
  const CURSOR_KEY='rota27_v022_purchase_cursor_v1';
  const META_KEY='rota27_v022_purchase_meta_v1';

  const STOCK_CFG_KEY='rota27_v021_stock_cfg_v1';
  const STOCK_MOV_KEY='rota27_v021_stock_mov_v1';
  const STOCK_OUTBOX_KEY='rota27_v021_stock_outbox_v1';
  const SYNC_KEY='rota27_sync_config_v1';

  const MAX_SUPPLIERS=400;
  const MAX_ORDERS=3000;
  const MAX_RECEIPTS=6000;
  const MAX_OUTBOX=1200;
  const MAX_STOCK_MOV=6000;
  const MAX_STOCK_OUTBOX=900;

  let activeTab='restock';
  let syncing=false;
  let selectedSupplierId=null;
  let selectedOrderId=null;
  let orderFilter='pending';
  let search='';

  function byId(id){return document.getElementById(id);}
  function clone(v){return JSON.parse(JSON.stringify(v==null?null:v));}
  function esc(v){
    if(typeof escapeHtml==='function')return escapeHtml(String(v??''));
    return String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }
  function clean(v,max=180){return String(v??'').replace(/[\u0000-\u001f\u007f]/g,' ').trim().replace(/\s+/g,' ').slice(0,max);}
  function round3(v){return Math.round(Number(v||0)*1000)/1000;}
  function fmtQty(v){return Number(v||0).toLocaleString('pt-BR',{maximumFractionDigits:3});}
  function fmtDate(ts){return new Date(Number(ts||0)).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',year:'2-digit',hour:'2-digit',minute:'2-digit'});}
  function uid(prefix='p'){return globalThis.crypto?.randomUUID?`${prefix}_${crypto.randomUUID()}`:`${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,10)}`;}
  function readJson(key,fallback){try{const x=JSON.parse(localStorage.getItem(key)||'null');return x==null?fallback:x;}catch{return fallback;}}
  function writeJson(key,v){localStorage.setItem(key,JSON.stringify(v));}
  function toast(msg){try{if(typeof showToast==='function')showToast(msg,false);else console.info('[Rota27]',msg);}catch{}}
  function meta(){const x=readJson(META_KEY,{});return x&&typeof x==='object'&&!Array.isArray(x)?x:{};}
  function patchMeta(p){writeJson(META_KEY,{...meta(),...p});}
  function device(){
    const c=syncConfig();
    return {
      id:clean(c.deviceId||'local',120)||'local',
      name:clean(c.deviceName||'Este aparelho',80)||'Este aparelho',
      storeId:clean(c.storeId||'rota27-bodega',80)||'rota27-bodega'
    };
  }
  function syncConfig(){const x=readJson(SYNC_KEY,{});return x&&typeof x==='object'&&!Array.isArray(x)?x:{};}
  function syncReady(){
    const c=syncConfig();
    return c.enabled===true&&c.initialized===true&&/^https:\/\/.+\/functions\/v1\/rota27-sync\/?$/i.test(String(c.functionUrl||''))&&String(c.deviceToken||'').length>=16&&!!c.deviceId;
  }
  function product(id){return (Array.isArray(window.state?.catalog)?window.state.catalog:[]).find(p=>String(p.id)===String(id))||null;}
  function productName(id){return product(id)?.name||stockConfigs()[id]?.name||'Produto';}

  function suppliers(){
    const x=readJson(SUPPLIERS_KEY,[]);
    return Array.isArray(x)?x:[];
  }
  function saveSuppliers(rows){writeJson(SUPPLIERS_KEY,(Array.isArray(rows)?rows:[]).slice(-MAX_SUPPLIERS));}
  function supplierById(id){return suppliers().find(s=>String(s.id)===String(id))||null;}
  function activeSuppliers(){return suppliers().filter(s=>s.active!==false).sort((a,b)=>String(a.name||'').localeCompare(String(b.name||''),'pt-BR'));}
  function supplierForProduct(productId){
    return activeSuppliers().find(s=>Array.isArray(s.productIds)&&s.productIds.some(id=>String(id)===String(productId)))||null;
  }
  function upsertSupplier(next,queue=true){
    if(!next?.id)return false;
    const rows=suppliers();
    const i=rows.findIndex(x=>String(x.id)===String(next.id));
    if(i>=0&&Number(rows[i].updatedAt||0)>Number(next.updatedAt||0))return false;
    if(i>=0)rows[i]=clone(next);else rows.push(clone(next));
    saveSuppliers(rows);
    if(queue)queueEvent('supplier_upsert',next.id,{supplier:clone(next)},`supplier_${next.id}_${Number(next.updatedAt||Date.now())}`);
    refresh();
    return true;
  }
  function assignProduct(productId,supplierId){
    const pid=String(productId);
    const rows=suppliers();
    let changed=false;
    const now=Date.now();
    rows.forEach(s=>{
      const before=Array.isArray(s.productIds)?s.productIds.map(String):[];
      const shouldHave=String(s.id)===String(supplierId||'');
      const after=before.filter(x=>x!==pid);
      if(shouldHave&&!after.includes(pid))after.push(pid);
      if(before.join('|')!==after.join('|')){
        s.productIds=after;
        s.updatedAt=now;
        changed=true;
      }
    });
    if(changed){
      saveSuppliers(rows);
      rows.filter(s=>Number(s.updatedAt)===now).forEach(s=>queueEvent('supplier_upsert',s.id,{supplier:clone(s)},`supplier_${s.id}_${now}`));
      refresh();
    }
  }

  function orders(){
    const x=readJson(ORDERS_KEY,[]);
    return Array.isArray(x)?x:[];
  }
  function saveOrders(rows){writeJson(ORDERS_KEY,(Array.isArray(rows)?rows:[]).slice(-MAX_ORDERS));}
  function orderById(id){return orders().find(o=>String(o.id)===String(id))||null;}
  function upsertOrder(next,queue=true){
    if(!next?.id)return false;
    const rows=orders();
    const i=rows.findIndex(x=>String(x.id)===String(next.id));
    if(i>=0&&Number(rows[i].updatedAt||0)>Number(next.updatedAt||0))return false;
    if(i>=0)rows[i]=clone(next);else rows.push(clone(next));
    saveOrders(rows);
    if(queue)queueEvent('purchase_order_upsert',next.id,{order:clone(next)},`purchase_order_${next.id}_${Number(next.updatedAt||Date.now())}`);
    refresh();
    return true;
  }

  function receipts(){
    const x=readJson(RECEIPTS_KEY,[]);
    return Array.isArray(x)?x:[];
  }
  function saveReceipts(rows){writeJson(RECEIPTS_KEY,(Array.isArray(rows)?rows:[]).slice(-MAX_RECEIPTS));}
  function appendReceipt(next,queue=true){
    if(!next?.id||!next?.orderId)return false;
    const rows=receipts();
    if(rows.some(r=>String(r.id)===String(next.id)))return false;
    rows.push(clone(next));
    saveReceipts(rows);
    applyReceiptToStock(next);
    if(queue)queueEvent('purchase_receipt',next.orderId,{receipt:clone(next)},next.id);
    refresh();
    return true;
  }
  function receiptsForOrder(orderId){return receipts().filter(r=>String(r.orderId)===String(orderId));}
  function receivedQty(orderId,productId){
    return round3(receiptsForOrder(orderId).reduce((sum,r)=>sum+(Array.isArray(r.items)?r.items:[]).reduce((s,i)=>s+(String(i.productId)===String(productId)?Number(i.qty||0):0),0),0));
  }
  function pendingQty(order,item){return round3(Math.max(0,Number(item.qty||0)-receivedQty(order.id,item.productId)));}

  function stockConfigs(){
    if(window.Rota27V021?.getConfigs)try{return window.Rota27V021.getConfigs()||{};}catch{}
    const x=readJson(STOCK_CFG_KEY,{});
    return x&&typeof x==='object'&&!Array.isArray(x)?x:{};
  }
  function stockMovements(){
    if(window.Rota27V021?.getMovements)try{return window.Rota27V021.getMovements()||[];}catch{}
    const x=readJson(STOCK_MOV_KEY,[]);
    return Array.isArray(x)?x:[];
  }
  function currentQty(id){
    if(window.Rota27V021?.currentQty)try{return round3(window.Rota27V021.currentQty(id));}catch{}
    const c=stockConfigs()[id];
    if(!c)return 0;
    return round3(Number(c.initialQty||0)+stockMovements().filter(m=>String(m.productId)===String(id)).reduce((s,m)=>s+Number(m.delta||0),0));
  }
  function committedQty(id){
    if(window.Rota27V021?.committedQty)try{return round3(window.Rota27V021.committedQty(id));}catch{}
    return round3((Array.isArray(window.state?.commands)?window.state.commands:[]).reduce((sum,c)=>sum+Number(c?.items?.[id]||0),0));
  }
  function availableQty(id){
    if(window.Rota27V021?.availableQty)try{return round3(window.Rota27V021.availableQty(id));}catch{}
    return round3(currentQty(id)-committedQty(id));
  }
  function replenishmentRows(){
    const cfg=stockConfigs();
    return (Array.isArray(window.state?.catalog)?window.state.catalog:[])
      .map(p=>{
        const c=cfg[p.id]||null;
        const available=availableQty(p.id);
        const min=Math.max(0,Number(c?.minQty||0));
        const enabled=c?.enabled===true;
        const needs=enabled&&available<=min;
        const suggested=needs?round3(Math.max(0,(min+1)-available)):0;
        return {product:p,config:c,enabled,current:currentQty(p.id),committed:committedQty(p.id),available,min,needs,suggested,supplier:supplierForProduct(p.id)};
      })
      .filter(r=>r.needs)
      .sort((a,b)=>(a.available-a.min)-(b.available-b.min)||String(a.product.name||'').localeCompare(String(b.product.name||''),'pt-BR'));
  }

  function appendStockEvent(event){
    const rows=readJson(STOCK_OUTBOX_KEY,[]);
    const list=Array.isArray(rows)?rows:[];
    const filtered=list.filter(x=>String(x.eventId)!==String(event.eventId));
    filtered.push(event);
    writeJson(STOCK_OUTBOX_KEY,filtered.slice(-MAX_STOCK_OUTBOX));
  }
  function applyReceiptToStock(receipt){
    const d=device();
    const existing=readJson(STOCK_MOV_KEY,[]);
    const rows=Array.isArray(existing)?existing:[];
    let changed=false;
    (Array.isArray(receipt.items)?receipt.items:[]).forEach(item=>{
      const qty=round3(Number(item.qty||0));
      if(qty<=0)return;
      const id=`purchase_entry_${receipt.id}_${item.productId}`;
      if(rows.some(m=>String(m.id)===id))return;
      const ts=Number(receipt.createdAt||Date.now());
      const movement={
        id,
        productId:String(item.productId),
        productName:clean(item.productName||productName(item.productId),180),
        delta:qty,
        type:'entry',
        reason:`Recebimento ${clean(receipt.orderCode||receipt.orderId,80)}`,
        createdAt:ts,
        createdAtIso:new Date(ts).toISOString(),
        deviceId:d.id,
        deviceName:d.name,
        commandId:null,
        purchaseOrderId:String(receipt.orderId),
        purchaseReceiptId:String(receipt.id),
        appVersion:VERSION
      };
      rows.push(movement);
      changed=true;
      if(syncReady()){
        appendStockEvent({
          eventId:id,
          eventType:'stock_movement',
          entityId:String(item.productId),
          payload:{movement:clone(movement)},
          deviceId:d.id,
          createdAt:new Date(ts).toISOString(),
          appVersion:VERSION
        });
      }
    });
    if(changed){
      writeJson(STOCK_MOV_KEY,rows.slice(-MAX_STOCK_MOV));
      try{window.dispatchEvent(new CustomEvent('rota27:v021-stock-updated'));}catch{}
      if(navigator.onLine&&window.Rota27V021?.syncStock)setTimeout(()=>window.Rota27V021.syncStock(),80);
    }
    return changed;
  }

  function outbox(){const x=readJson(OUTBOX_KEY,[]);return Array.isArray(x)?x:[];}
  function saveOutbox(rows){writeJson(OUTBOX_KEY,(Array.isArray(rows)?rows:[]).slice(-MAX_OUTBOX));}
  function queueEvent(type,entityId,payload,eventId){
    if(!syncReady())return;
    const d=device();
    const e={
      eventId:eventId||uid('purchase'),
      eventType:type,
      entityId:String(entityId||''),
      payload:clone(payload||{}),
      deviceId:d.id,
      createdAt:new Date().toISOString(),
      appVersion:VERSION
    };
    const rows=outbox().filter(x=>String(x.eventId)!==String(e.eventId));
    rows.push(e);
    saveOutbox(rows);
    if(navigator.onLine)setTimeout(syncNow,120);
  }
  async function api(body){
    const c=syncConfig();
    if(!syncReady())throw new Error('Sincronização não configurada neste aparelho.');
    const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),12000);
    try{
      const r=await fetch(String(c.functionUrl).replace(/\/+$/,''),{
        method:'POST',
        headers:{'content-type':'application/json','x-rota27-device-token':String(c.deviceToken)},
        body:JSON.stringify({...body,deviceId:c.deviceId,deviceName:c.deviceName||'Aparelho',storeId:c.storeId||'rota27-bodega',appVersion:VERSION}),
        signal:ctrl.signal
      });
      const data=await r.json().catch(()=>({}));
      if(!r.ok||data.ok!==true)throw new Error(data.error||`HTTP ${r.status}`);
      return data;
    }finally{clearTimeout(timer);}
  }
  function backendVersionReady(v){
    const m=String(v||'').match(/v(\d+)\.(\d+)\.(\d+)/i);
    if(!m)return false;
    const major=Number(m[1]),minor=Number(m[2]);
    return major>0||(major===0&&minor>=22);
  }
  async function ensureBackendReady(force=false){
    const m=meta(),now=Date.now();
    if(!force&&Number(m.backendCheckedAt||0)>now-60000)return m.backendReady===true;
    try{
      const data=await api({action:'status',afterSeq:Number(localStorage.getItem(CURSOR_KEY)||0)});
      const ready=backendVersionReady(data.edgeVersion);
      patchMeta({backendCheckedAt:now,backendReady:ready,backendVersion:clean(data.edgeVersion||'',80),lastError:ready?'':String(m.lastError||'')});
      return ready;
    }catch(err){
      patchMeta({backendCheckedAt:now,backendReady:false,lastError:clean(err?.name==='AbortError'?'Tempo esgotado ao verificar sincronização de compras.':(err?.message||'Falha ao verificar sincronização.'),250)});
      return false;
    }
  }
  function applyRemote(e){
    const type=String(e.event_type||e.eventType||''),payload=e.payload||{};
    if(type==='supplier_upsert'){
      const s=payload.supplier;
      if(!s?.id)return false;
      return upsertSupplier(s,false);
    }
    if(type==='purchase_order_upsert'){
      const o=payload.order;
      if(!o?.id)return false;
      return upsertOrder(o,false);
    }
    if(type==='purchase_receipt'){
      const r=payload.receipt;
      if(!r?.id||!r?.orderId)return false;
      return appendReceipt(r,false);
    }
    return false;
  }
  async function syncNow(forceCheck=false){
    if(syncing||!syncReady()||!navigator.onLine)return false;
    syncing=true;
    try{
      if(!(await ensureBackendReady(forceCheck)))return false;
      let rows=outbox();
      while(rows.length){
        const batch=rows.slice(0,80);
        await api({action:'push',events:batch});
        const sent=new Set(batch.map(x=>String(x.eventId)));
        rows=outbox().filter(x=>!sent.has(String(x.eventId)));
        saveOutbox(rows);
      }
      let cursor=Math.max(0,Number(localStorage.getItem(CURSOR_KEY)||0)),changed=false;
      for(let page=0;page<30;page++){
        const data=await api({action:'pull',afterSeq:cursor,limit:500,preferSnapshot:false});
        const ev=Array.isArray(data.events)?data.events:[];
        for(const e of ev){
          cursor=Math.max(cursor,Number(e.seq||0));
          if(applyRemote(e))changed=true;
        }
        localStorage.setItem(CURSOR_KEY,String(Math.max(cursor,Number(data.cursor||cursor))));
        if(!data.hasMore||!ev.length)break;
      }
      patchMeta({lastSyncAt:Date.now(),lastError:''});
      if(changed)refresh();
      return true;
    }catch(err){
      patchMeta({lastError:clean(err?.name==='AbortError'?'Tempo esgotado ao sincronizar compras.':(err?.message||'Falha de sincronização de compras.'),250)});
      return false;
    }finally{
      syncing=false;
      renderNotice();
      renderPanelEntry();
    }
  }

  function orderCode(){
    const d=new Date(),date=`${String(d.getFullYear()).slice(-2)}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
    const suffix=Math.random().toString(36).slice(2,6).toUpperCase();
    return `PC-${date}-${suffix}`;
  }
  function statusLabel(status){return ({draft:'Rascunho',sent:'Enviado',received:'Recebido',cancelled:'Cancelado'})[status]||status;}
  function statusClass(status){return status==='received'?'ok':status==='cancelled'?'muted':status==='sent'?'info':'warn';}
  function openOrderCount(){return orders().filter(o=>o.status==='draft'||o.status==='sent').length;}
  function totalPendingUnits(){
    return round3(orders().filter(o=>o.status==='draft'||o.status==='sent').reduce((sum,o)=>sum+(Array.isArray(o.items)?o.items:[]).reduce((s,i)=>s+pendingQty(o,i),0),0));
  }

  function ensureMainSheet(){
    if(byId('v022PurchasesWrap'))return;
    const wrap=document.createElement('div');
    wrap.id='v022PurchasesWrap';
    wrap.className='sheet-wrap';
    wrap.innerHTML=`<div class="sheet v022-sheet">
      <div class="handle"></div>
      <div class="v022-head">
        <div><div class="v022-kicker">v0.22.0</div><h3>Compras & Reposição</h3><p class="desc">Do alerta de estoque ao recebimento, sem ERP pesado.</p></div>
        <button id="v022Close" class="v022-x" type="button">×</button>
      </div>
      <div id="v022Summary" class="v022-summary"></div>
      <div id="v022Notice"></div>
      <div class="v022-tabs">
        <button data-tab="restock" class="active">Reposição</button>
        <button data-tab="orders">Pedidos</button>
        <button data-tab="suppliers">Fornecedores</button>
      </div>
      <div id="v022Toolbar"></div>
      <div id="v022Content"></div>
    </div>`;
    document.body.appendChild(wrap);
    wrap.addEventListener('click',e=>{if(e.target===wrap)wrap.classList.remove('open');});
    byId('v022Close').onclick=()=>wrap.classList.remove('open');
    wrap.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{activeTab=b.dataset.tab;renderMain();});
  }

  function ensureSupplierSheet(){
    if(byId('v022SupplierWrap'))return;
    const wrap=document.createElement('div');
    wrap.id='v022SupplierWrap';
    wrap.className='sheet-wrap';
    wrap.innerHTML=`<div class="sheet v022-form-sheet">
      <div class="handle"></div>
      <div class="v022-head"><div><h3 id="v022SupplierTitle">Fornecedor</h3><p class="desc">Cadastro leve. Telefone e observação são opcionais.</p></div><button id="v022SupplierX" class="v022-x">×</button></div>
      <div class="v022-form">
        <label>Nome<input id="v022SupplierName" maxlength="120" placeholder="Ex.: Cervejaria Capixaba"></label>
        <label>WhatsApp / telefone<input id="v022SupplierPhone" maxlength="40" inputmode="tel" placeholder="Opcional"></label>
        <label>Observação<textarea id="v022SupplierNote" maxlength="240" placeholder="Dia de entrega, contato, pedido mínimo..."></textarea></label>
        <div><strong>Produtos associados</strong><small class="v022-helptext">Opcional. Um produto pode ter um fornecedor padrão nesta etapa.</small><div id="v022SupplierProducts" class="v022-product-picker"></div></div>
        <div class="v022-form-actions"><button id="v022SupplierCancel" class="secondary">Cancelar</button><button id="v022SupplierSave" class="primary">Salvar fornecedor</button></div>
      </div>
    </div>`;
    document.body.appendChild(wrap);
    byId('v022SupplierX').onclick=byId('v022SupplierCancel').onclick=()=>wrap.classList.remove('open');
    byId('v022SupplierSave').onclick=saveSupplierForm;
  }

  function ensureReceiveSheet(){
    if(byId('v022ReceiveWrap'))return;
    const wrap=document.createElement('div');
    wrap.id='v022ReceiveWrap';
    wrap.className='sheet-wrap';
    wrap.innerHTML=`<div class="sheet v022-form-sheet">
      <div class="handle"></div>
      <div class="v022-head"><div><h3 id="v022ReceiveTitle">Receber pedido</h3><p class="desc">Informe apenas o que chegou agora. Pode ser parcial.</p></div><button id="v022ReceiveX" class="v022-x">×</button></div>
      <div id="v022ReceiveItems" class="v022-receive-items"></div>
      <label class="v022-label">Observação<textarea id="v022ReceiveNote" maxlength="240" placeholder="Opcional"></textarea></label>
      <div class="v022-form-actions"><button id="v022ReceiveCancel" class="secondary">Cancelar</button><button id="v022ReceiveSave" class="primary">Registrar recebimento</button></div>
    </div>`;
    document.body.appendChild(wrap);
    byId('v022ReceiveX').onclick=byId('v022ReceiveCancel').onclick=()=>wrap.classList.remove('open');
    byId('v022ReceiveSave').onclick=saveReceiptForm;
  }

  function renderSummary(){
    const restock=replenishmentRows().length,open=openOrderCount(),pending=totalPendingUnits(),sup=activeSuppliers().length;
    const el=byId('v022Summary');if(!el)return;
    el.innerHTML=`<div class="v022-metric"><small>Para repor</small><strong>${restock}</strong></div>
      <div class="v022-metric"><small>Pedidos pendentes</small><strong>${open}</strong></div>
      <div class="v022-metric"><small>Unid. pendentes</small><strong>${fmtQty(pending)}</strong></div>
      <div class="v022-metric"><small>Fornecedores</small><strong>${sup}</strong></div>`;
  }
  function renderNotice(){
    const el=byId('v022Notice');if(!el)return;
    const m=meta();
    if(!navigator.onLine){el.innerHTML='<div class="v022-note warn">Offline: compras e recebimentos continuam salvos neste aparelho.</div>';return;}
    if(m.lastError){el.innerHTML=`<div class="v022-note danger">Sincronização de compras: ${esc(m.lastError)}</div>`;return;}
    if(syncReady()&&m.backendReady!==true){
      el.innerHTML='<div class="v022-note neutral">Sincronização multidispositivo de Compras ainda não foi ativada no backend da candidata. O uso local permanece normal.</div>';return;
    }
    el.innerHTML='';
  }

  function renderRestockToolbar(){
    const t=byId('v022Toolbar');
    t.innerHTML=`<div class="v022-toolbar"><input id="v022Search" type="search" placeholder="Buscar produto..." value="${esc(search)}"><button id="v022NewSupplier">+ Fornecedor</button></div>`;
    byId('v022Search').oninput=e=>{search=e.target.value||'';renderRestock();};
    byId('v022NewSupplier').onclick=()=>openSupplier();
  }
  function supplierOptions(selected){
    return `<option value="">Sem fornecedor</option>`+activeSuppliers().map(s=>`<option value="${esc(s.id)}" ${String(s.id)===String(selected||'')?'selected':''}>${esc(s.name)}</option>`).join('');
  }
  function renderRestock(){
    const content=byId('v022Content');if(!content)return;
    const q=search.trim().toLocaleLowerCase('pt-BR');
    const rows=replenishmentRows().filter(r=>!q||String(r.product.name||'').toLocaleLowerCase('pt-BR').includes(q));
    if(!rows.length){
      content.innerHTML=`<div class="v022-empty"><strong>Nada para repor agora.</strong><span>Quando um produto controlado chegar ao mínimo, ele aparece aqui automaticamente.</span></div>`;
      return;
    }
    content.innerHTML=`<div class="v022-restock-list">${rows.map(r=>`<div class="v022-restock-row" data-product-id="${esc(r.product.id)}">
      <label class="v022-select"><input type="checkbox" data-role="selected" checked aria-label="Incluir ${esc(r.product.name)}"></label>
      <div class="v022-product"><strong>${esc(r.product.name)}</strong><small>${esc(r.product.cat||'Outros')} • disponível ${fmtQty(r.available)} • mínimo ${fmtQty(r.min)}</small></div>
      <label class="v022-qty"><small>Comprar</small><input data-role="qty" type="number" min="0" step="1" value="${r.suggested}"></label>
      <label class="v022-supplier"><small>Fornecedor</small><select data-role="supplier">${supplierOptions(r.supplier?.id)}</select></label>
    </div>`).join('')}</div>
    <div class="v022-sticky-actions"><button id="v022CreateOrders" class="primary">Criar pedido(s) selecionado(s)</button></div>`;
    content.querySelectorAll('[data-role="supplier"]').forEach(sel=>sel.onchange=()=>{
      const row=sel.closest('.v022-restock-row');assignProduct(row.dataset.productId,sel.value||null);
    });
    byId('v022CreateOrders').onclick=createOrdersFromRestock;
  }
  function createOrdersFromRestock(){
    const selected=[...document.querySelectorAll('#v022Content .v022-restock-row')].filter(row=>row.querySelector('[data-role="selected"]')?.checked);
    if(!selected.length){toast('Selecione pelo menos um produto.');return;}
    const groups=new Map();
    selected.forEach(row=>{
      const pid=String(row.dataset.productId),qty=round3(Math.max(0,Number(row.querySelector('[data-role="qty"]')?.value||0)));
      if(qty<=0)return;
      const sid=String(row.querySelector('[data-role="supplier"]')?.value||'');
      const key=sid||'__none__';
      if(!groups.has(key))groups.set(key,{supplierId:sid||null,items:[]});
      groups.get(key).items.push({productId:pid,productName:productName(pid),qty});
    });
    if(!groups.size){toast('Informe uma quantidade maior que zero.');return;}
    const d=device(),now=Date.now();
    let count=0;
    groups.forEach(group=>{
      const supplier=group.supplierId?supplierById(group.supplierId):null;
      const o={
        id:uid('po'),
        code:orderCode(),
        supplierId:supplier?.id||null,
        supplierName:supplier?.name||'Sem fornecedor',
        status:'draft',
        items:group.items,
        note:'',
        createdAt:now+count,
        updatedAt:now+count,
        createdDeviceId:d.id,
        createdDeviceName:d.name,
        appVersion:VERSION
      };
      upsertOrder(o,true);count++;
    });
    activeTab='orders';
    renderMain();
    toast(`${count} pedido${count===1?' criado':'s criados'} em rascunho.`);
  }

  function renderOrdersToolbar(){
    const t=byId('v022Toolbar');
    t.innerHTML=`<div class="v022-toolbar">
      <select id="v022OrderFilter"><option value="pending" ${orderFilter==='pending'?'selected':''}>Pendentes</option><option value="all" ${orderFilter==='all'?'selected':''}>Todos</option><option value="draft" ${orderFilter==='draft'?'selected':''}>Rascunhos</option><option value="sent" ${orderFilter==='sent'?'selected':''}>Enviados</option><option value="received" ${orderFilter==='received'?'selected':''}>Recebidos</option><option value="cancelled" ${orderFilter==='cancelled'?'selected':''}>Cancelados</option></select>
      <input id="v022Search" type="search" placeholder="Buscar pedido ou fornecedor..." value="${esc(search)}">
      <button id="v022ExportCsv">⇩ CSV</button>
    </div>`;
    byId('v022OrderFilter').onchange=e=>{orderFilter=e.target.value;renderOrders();};
    byId('v022Search').oninput=e=>{search=e.target.value||'';renderOrders();};
    byId('v022ExportCsv').onclick=exportCsv;
  }
  function renderOrders(){
    const content=byId('v022Content');if(!content)return;
    const q=search.trim().toLocaleLowerCase('pt-BR');
    let rows=orders().slice().sort((a,b)=>Number(b.createdAt||0)-Number(a.createdAt||0));
    if(orderFilter==='pending')rows=rows.filter(o=>o.status==='draft'||o.status==='sent');
    else if(orderFilter!=='all')rows=rows.filter(o=>o.status===orderFilter);
    rows=rows.filter(o=>!q||`${o.code||''} ${o.supplierName||''} ${(o.items||[]).map(i=>i.productName).join(' ')}`.toLocaleLowerCase('pt-BR').includes(q));
    if(!rows.length){content.innerHTML='<div class="v022-empty"><strong>Nenhum pedido neste filtro.</strong><span>Use a aba Reposição para criar um pedido em poucos toques.</span></div>';return;}
    content.innerHTML=`<div class="v022-orders">${rows.map(o=>{
      const items=Array.isArray(o.items)?o.items:[];
      const pending=round3(items.reduce((s,i)=>s+pendingQty(o,i),0));
      const detail=items.slice(0,3).map(i=>`${fmtQty(i.qty)} × ${esc(i.productName)}`).join(' • ')+(items.length>3?` • +${items.length-3}`:'');
      const actions=[];
      if(o.status==='draft')actions.push(`<button data-action="send">Marcar enviado</button>`);
      if(o.status==='draft'||o.status==='sent')actions.push(`<button data-action="receive" class="primary">Receber</button>`,`<button data-action="cancel" class="danger-text">Cancelar</button>`);
      actions.push(`<button data-action="copy">Copiar</button>`);
      return `<div class="v022-order-card" data-order-id="${esc(o.id)}">
        <div class="v022-order-top"><div><strong>${esc(o.code||'Pedido')}</strong><small>${esc(o.supplierName||'Sem fornecedor')} • ${fmtDate(o.createdAt)}</small></div><span class="v022-status ${statusClass(o.status)}">${statusLabel(o.status)}</span></div>
        <div class="v022-order-items">${detail||'Sem itens'}</div>
        <div class="v022-order-foot"><small>${o.status==='received'?'Recebimento concluído':o.status==='cancelled'?'Pedido cancelado':`${fmtQty(pending)} unid. pendentes`}</small><div class="v022-order-actions">${actions.join('')}</div></div>
      </div>`;
    }).join('')}</div>`;
    content.querySelectorAll('.v022-order-card').forEach(card=>card.querySelectorAll('[data-action]').forEach(btn=>btn.onclick=()=>handleOrderAction(card.dataset.orderId,btn.dataset.action)));
  }
  function handleOrderAction(id,action){
    const o=orderById(id);if(!o)return;
    if(action==='copy'){copyOrder(o);return;}
    if(action==='receive'){openReceive(o.id);return;}
    if(action==='send'){
      if(o.status!=='draft')return;
      upsertOrder({...o,status:'sent',sentAt:Date.now(),updatedAt:Date.now()},true);
      toast('Pedido marcado como enviado.');return;
    }
    if(action==='cancel'){
      if(o.status==='received'||o.status==='cancelled')return;
      if(!confirm(`Cancelar o pedido ${o.code}?`))return;
      upsertOrder({...o,status:'cancelled',cancelledAt:Date.now(),updatedAt:Date.now()},true);
      toast('Pedido cancelado.');
    }
  }
  async function copyText(text){
    try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text);return true;}}catch{}
    try{
      const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();
      const ok=document.execCommand('copy');ta.remove();return ok;
    }catch{return false;}
  }
  function orderText(o){
    const phone=o.supplierId?supplierById(o.supplierId)?.phone:'';
    const lines=[`Rota 27 Bodega — Pedido ${o.code}`,o.supplierName&&o.supplierName!=='Sem fornecedor'?`Fornecedor: ${o.supplierName}`:''];
    (o.items||[]).forEach(i=>lines.push(`- ${fmtQty(i.qty)} × ${i.productName}`));
    if(o.note)lines.push(`Obs.: ${o.note}`);
    if(phone)lines.push(`Contato cadastrado: ${phone}`);
    return lines.filter(Boolean).join('\n');
  }
  async function copyOrder(o){toast(await copyText(orderText(o))?'Pedido copiado.':'Não foi possível copiar automaticamente.');}

  function openReceive(id){
    const o=orderById(id);if(!o||o.status==='received'||o.status==='cancelled')return;
    ensureReceiveSheet();selectedOrderId=String(id);
    byId('v022ReceiveTitle').textContent=`Receber ${o.code}`;
    byId('v022ReceiveNote').value='';
    const pending=(o.items||[]).map(i=>({...i,pending:pendingQty(o,i)})).filter(i=>i.pending>0);
    byId('v022ReceiveItems').innerHTML=pending.map(i=>`<div class="v022-receive-row" data-product-id="${esc(i.productId)}" data-max="${i.pending}">
      <div><strong>${esc(i.productName)}</strong><small>Pedido ${fmtQty(i.qty)} • já recebido ${fmtQty(receivedQty(o.id,i.productId))} • pendente ${fmtQty(i.pending)}</small></div>
      <label><small>Chegou agora</small><input type="number" min="0" max="${i.pending}" step="1" value="${i.pending}"></label>
    </div>`).join('');
    byId('v022ReceiveWrap').classList.add('open');
  }
  function saveReceiptForm(){
    const o=orderById(selectedOrderId);if(!o)return;
    const items=[];
    for(const row of byId('v022ReceiveItems').querySelectorAll('.v022-receive-row')){
      const max=round3(Number(row.dataset.max||0)),qty=round3(Math.max(0,Number(row.querySelector('input')?.value||0)));
      if(qty>max+0.0001){toast(`Quantidade acima do pendente para ${productName(row.dataset.productId)}.`);return;}
      if(qty>0)items.push({productId:String(row.dataset.productId),productName:productName(row.dataset.productId),qty});
    }
    if(!items.length){toast('Informe pelo menos uma quantidade recebida.');return;}
    const d=device(),now=Date.now();
    const r={
      id:uid('receipt'),
      orderId:o.id,
      orderCode:o.code,
      supplierId:o.supplierId||null,
      supplierName:o.supplierName||'Sem fornecedor',
      items,
      note:clean(byId('v022ReceiveNote').value||'',240),
      createdAt:now,
      createdAtIso:new Date(now).toISOString(),
      deviceId:d.id,
      deviceName:d.name,
      appVersion:VERSION
    };
    appendReceipt(r,true);
    const latest=orderById(o.id)||o;
    const fully=(latest.items||[]).every(i=>receivedQty(latest.id,i.productId)>=Number(i.qty||0)-0.0001);
    upsertOrder({...latest,status:fully?'received':'sent',sentAt:latest.sentAt||now,receivedAt:fully?now:(latest.receivedAt||null),updatedAt:now},true);
    byId('v022ReceiveWrap').classList.remove('open');
    toast(fully?'Pedido recebido por completo.':'Recebimento parcial registrado.');
  }

  function renderSuppliersToolbar(){
    const t=byId('v022Toolbar');
    t.innerHTML=`<div class="v022-toolbar"><input id="v022Search" type="search" placeholder="Buscar fornecedor..." value="${esc(search)}"><button id="v022NewSupplier" class="primary">+ Novo fornecedor</button></div>`;
    byId('v022Search').oninput=e=>{search=e.target.value||'';renderSuppliers();};
    byId('v022NewSupplier').onclick=()=>openSupplier();
  }
  function renderSuppliers(){
    const content=byId('v022Content');if(!content)return;
    const q=search.trim().toLocaleLowerCase('pt-BR');
    const rows=activeSuppliers().filter(s=>!q||`${s.name||''} ${s.phone||''} ${s.note||''}`.toLocaleLowerCase('pt-BR').includes(q));
    if(!rows.length){content.innerHTML='<div class="v022-empty"><strong>Nenhum fornecedor cadastrado.</strong><span>Fornecedor é opcional. Cadastre apenas quando isso poupar tempo na reposição.</span></div>';return;}
    content.innerHTML=`<div class="v022-suppliers">${rows.map(s=>`<div class="v022-supplier-card" data-supplier-id="${esc(s.id)}">
      <div><strong>${esc(s.name)}</strong><small>${esc(s.phone||'Sem telefone')} • ${(s.productIds||[]).length} produto${(s.productIds||[]).length===1?'':'s'} associado${(s.productIds||[]).length===1?'':'s'}</small>${s.note?`<p>${esc(s.note)}</p>`:''}</div>
      <div class="v022-order-actions"><button data-action="edit">Editar</button><button data-action="archive" class="danger-text">Arquivar</button></div>
    </div>`).join('')}</div>`;
    content.querySelectorAll('.v022-supplier-card').forEach(card=>card.querySelectorAll('[data-action]').forEach(btn=>btn.onclick=()=>{
      if(btn.dataset.action==='edit')openSupplier(card.dataset.supplierId);
      else archiveSupplier(card.dataset.supplierId);
    }));
  }
  function openSupplier(id=null){
    ensureSupplierSheet();selectedSupplierId=id?String(id):null;
    const s=id?supplierById(id):null;
    byId('v022SupplierTitle').textContent=s?'Editar fornecedor':'Novo fornecedor';
    byId('v022SupplierName').value=s?.name||'';
    byId('v022SupplierPhone').value=s?.phone||'';
    byId('v022SupplierNote').value=s?.note||'';
    const controlled=Object.entries(stockConfigs()).filter(([,c])=>c?.enabled===true).map(([id])=>product(id)).filter(Boolean);
    byId('v022SupplierProducts').innerHTML=controlled.length?controlled.map(p=>{
      const owner=supplierForProduct(p.id),checked=String(owner?.id||'')===String(s?.id||'');
      return `<label><input type="checkbox" value="${esc(p.id)}" ${checked?'checked':''}> <span>${esc(p.name)}</span></label>`;
    }).join(''):'<small class="v022-helptext">Ative o Estoque Essencial em um produto para associá-lo a fornecedor.</small>';
    byId('v022SupplierWrap').classList.add('open');
    setTimeout(()=>byId('v022SupplierName').focus(),50);
  }
  function saveSupplierForm(){
    const name=clean(byId('v022SupplierName').value,120);
    if(!name){toast('Informe o nome do fornecedor.');return;}
    const old=selectedSupplierId?supplierById(selectedSupplierId):null,d=device(),now=Date.now();
    const selected=[...byId('v022SupplierProducts').querySelectorAll('input[type="checkbox"]:checked')].map(x=>String(x.value));
    const s={
      id:old?.id||uid('supplier'),
      name,
      phone:clean(byId('v022SupplierPhone').value,40),
      note:clean(byId('v022SupplierNote').value,240),
      productIds:selected,
      active:true,
      createdAt:Number(old?.createdAt||now),
      updatedAt:now,
      createdDeviceId:old?.createdDeviceId||d.id,
      createdDeviceName:old?.createdDeviceName||d.name,
      appVersion:VERSION
    };
    const all=suppliers();
    selected.forEach(pid=>{
      all.filter(x=>x.active!==false&&String(x.id)!==String(s.id)&&Array.isArray(x.productIds)&&x.productIds.map(String).includes(pid)).forEach(other=>{
        other.productIds=other.productIds.map(String).filter(x=>x!==pid);
        other.updatedAt=now;
      });
    });
    saveSuppliers(all);
    all.filter(x=>Number(x.updatedAt)===now&&String(x.id)!==String(s.id)).forEach(x=>queueEvent('supplier_upsert',x.id,{supplier:clone(x)},`supplier_${x.id}_${now}`));
    upsertSupplier(s,true);
    byId('v022SupplierWrap').classList.remove('open');
    toast('Fornecedor salvo.');
  }
  function archiveSupplier(id){
    const s=supplierById(id);if(!s)return;
    if(!confirm(`Arquivar o fornecedor ${s.name}? Os pedidos existentes serão preservados.`))return;
    upsertSupplier({...s,active:false,productIds:[],updatedAt:Date.now()},true);
    toast('Fornecedor arquivado.');
  }

  function csvCell(v){const s=String(v??'');return /[;"\r\n]/.test(s)?`"${s.replace(/"/g,'""')}"`:s;}
  function download(name,content){
    const b=new Blob([content],{type:'text/csv;charset=utf-8'}),u=URL.createObjectURL(b),a=document.createElement('a');
    a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000);
  }
  function exportCsv(){
    const lines=['Pedido;Status;Fornecedor;Criado em;Produto;Qtd pedida;Qtd recebida;Qtd pendente'];
    orders().slice().sort((a,b)=>Number(b.createdAt||0)-Number(a.createdAt||0)).forEach(o=>(o.items||[]).forEach(i=>lines.push([
      o.code,statusLabel(o.status),o.supplierName||'',new Date(Number(o.createdAt||0)).toISOString(),i.productName,i.qty,receivedQty(o.id,i.productId),pendingQty(o,i)
    ].map(csvCell).join(';'))));
    download(`rota27-compras-${new Date().toISOString().slice(0,10)}.csv`,'\uFEFF'+lines.join('\r\n'));
    toast('CSV de compras gerado.');
  }

  function renderMain(){
    ensureMainSheet();
    renderSummary();renderNotice();
    const wrap=byId('v022PurchasesWrap');
    wrap.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===activeTab));
    if(activeTab==='restock'){renderRestockToolbar();renderRestock();}
    else if(activeTab==='orders'){renderOrdersToolbar();renderOrders();}
    else{renderSuppliersToolbar();renderSuppliers();}
  }
  function openPurchases(tab='restock'){
    activeTab=['restock','orders','suppliers'].includes(tab)?tab:'restock';
    search='';
    renderMain();
    byId('v022PurchasesWrap').classList.add('open');
    if(navigator.onLine)syncNow();
  }

  function renderPanelEntry(){
    const screen=byId('screenPanel');if(!screen)return;
    let entry=byId('v022PurchasesEntry');
    if(!entry){
      entry=document.createElement('section');
      entry.id='v022PurchasesEntry';
      entry.className='v022-panel-entry';
      const stock=byId('v021StockEntry');
      if(stock)stock.insertAdjacentElement('afterend',entry);
      else{
        const mg=byId('v020ManagerEntry');
        if(mg)mg.insertAdjacentElement('afterend',entry);else screen.appendChild(entry);
      }
    }
    const n=replenishmentRows().length,open=openOrderCount();
    const hint=n?`${n} produto${n===1?'':'s'} na fila de reposição.`:(open?`${open} pedido${open===1?' pendente':'s pendentes'} para acompanhar.`:'Sem compra pendente agora.');
    entry.innerHTML=`<div class="v022-panel-entry-head"><div><span class="v022-mini-label">v0.22.0</span><strong>Compras & Reposição</strong><small>${esc(hint)} Recebimentos entram no Estoque Essencial sem duplicidade.</small></div><button class="${n?'warn':open?'info':'ok'}" type="button">${n?`Repor ${n}`:open?`Ver ${open} pedido${open===1?'':'s'}`:'Abrir compras'}</button></div>`;
    entry.querySelector('button').onclick=()=>openPurchases(n?'restock':'orders');
  }

  function injectHelp(){
    const overlay=byId('r27HelpOverlay');if(!overlay)return false;
    const content=overlay.querySelector('.r27-help-content');if(!content)return false;
    if(!byId('r27-help-compras')){
      const d=document.createElement('details');
      d.id='r27-help-compras';d.className='r27-help-section';
      d.innerHTML=`<summary><span class="r27-help-section-icon">🛒</span><span><strong>Compras & Reposição</strong><small>Da fila de reposição ao recebimento no estoque.</small></span></summary>
      <div class="r27-help-section-body">
        <div class="r27-help-lead">No <b>Painel</b>, abra <b>Compras & Reposição</b>. A lista mostra somente produtos controlados que chegaram ao estoque mínimo.</div>
        <ol class="r27-help-steps">
          <li><span>1</span><div><b>Confira o que repor</b><br>A quantidade sugerida tira o produto da faixa crítica e pode ser alterada.</div></li>
          <li><span>2</span><div><b>Escolha o fornecedor</b><br>É opcional. O app lembra o fornecedor padrão associado ao produto.</div></li>
          <li><span>3</span><div><b>Crie e compartilhe o pedido</b><br>Pedidos começam em Rascunho. Use Copiar para enviar o texto pelo canal que preferir.</div></li>
          <li><span>4</span><div><b>Registre o que chegou</b><br>Receba tudo ou apenas parte. Cada recebimento gera Entrada no Estoque Essencial uma única vez.</div></li>
        </ol>
        <div class="r27-help-tip"><b>Importante:</b> Compras não bloqueia o atendimento. Se estiver offline, pedidos e recebimentos continuam salvos localmente e sincronizam quando o backend da v0.22 estiver habilitado.</div>
      </div>`;
      const stock=byId('r27-help-estoque');
      if(stock)stock.insertAdjacentElement('afterend',d);else content.appendChild(d);
    }
    const footer=overlay.querySelector('.r27-help-footer span');
    if(footer)footer.textContent='Ajuda v4.6 • v0.22.0';
    return true;
  }

  function applyVersion(){
    const m=document.querySelector('meta[name="rota27-version"]');
    if(m)m.setAttribute('content',VERSION);
    const b=byId('v14VersionBadge');
    if(b&&b.textContent!==LABEL)b.textContent=LABEL;
    if(document.title!==TITLE)document.title=TITLE;
    try{window.ROTA27_RELEASE_VERSION=VERSION;window.ROTA27_SYNC_DEV_VERSION=VERSION;}catch{}
  }
  function refresh(){
    try{renderPanelEntry();}catch{}
    try{if(byId('v022PurchasesWrap')?.classList.contains('open'))renderMain();}catch{}
    try{injectHelp();}catch{}
    try{applyVersion();}catch{}
    try{window.dispatchEvent(new CustomEvent('rota27:v022-purchases-updated'));}catch{}
  }
  function start(){
    ensureMainSheet();ensureSupplierSheet();ensureReceiveSheet();
    applyVersion();renderPanelEntry();injectHelp();
    setTimeout(()=>{applyVersion();renderPanelEntry();injectHelp();},250);
    setTimeout(()=>{applyVersion();renderPanelEntry();injectHelp();},1000);
    window.addEventListener('rota27:v021-stock-updated',refresh);
    window.addEventListener('rota27:v017-domain-updated',refresh);
    window.addEventListener('storage',refresh);
    window.addEventListener('online',()=>{refresh();syncNow(true);});
    window.addEventListener('offline',refresh);
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){refresh();syncNow();}});
    if(navigator.onLine)syncNow();
    console.info('[Rota27] v0.22.0 Compras & Reposição carregado.');
  }

  window.Rota27V022={
    version:VERSION,
    open:openPurchases,
    getSuppliers:()=>clone(suppliers()),
    getOrders:()=>clone(orders()),
    getReceipts:()=>clone(receipts()),
    syncPurchases:()=>syncNow(true)
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();