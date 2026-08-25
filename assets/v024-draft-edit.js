/* Rota 27 v0.24.0 — edição de pedidos em rascunho */
(function(){
  'use strict';

  const VERSION='0.24.0';
  const ORDERS_KEY='rota27_v022_purchase_orders_v1';
  const OUTBOX_KEY='rota27_v022_purchase_outbox_v1';
  const SYNC_KEY='rota27_sync_config_v1';
  let editingOrderId=null;

  function byId(id){return document.getElementById(id);}
  function clone(v){return JSON.parse(JSON.stringify(v==null?null:v));}
  function esc(v){
    if(typeof escapeHtml==='function')return escapeHtml(String(v??''));
    return String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }
  function clean(v,max=180){return String(v??'').replace(/[\u0000-\u001f\u007f]/g,' ').trim().replace(/\s+/g,' ').slice(0,max);}
  function readJson(key,fallback){try{const x=JSON.parse(localStorage.getItem(key)||'null');return x==null?fallback:x;}catch{return fallback;}}
  function writeJson(key,v){localStorage.setItem(key,JSON.stringify(v));}
  function round3(v){return Math.round(Number(v||0)*1000)/1000;}
  function round4(v){return Math.round(Number(v||0)*10000)/10000;}
  function parseMoney(v){
    const raw=String(v??'').trim().replace(/\s/g,'');
    if(!raw)return 0;
    const normalized=raw.includes(',')?raw.replace(/\./g,'').replace(',','.'):raw;
    const n=Number(normalized);
    return Number.isFinite(n)&&n>=0?round4(n):0;
  }
  function fmtMoney(v){return Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}
  function moneyInput(v){return Number(v||0)>0?String(Number(v)).replace('.',','):'';}
  function toast(msg){try{if(typeof showToast==='function')showToast(msg,false);else console.info('[Rota27]',msg);}catch{}}
  function uid(prefix='evt'){return globalThis.crypto?.randomUUID?`${prefix}_${crypto.randomUUID()}`:`${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,10)}`;}

  function orders(){
    try{return window.Rota27V022?.getOrders?.()||readJson(ORDERS_KEY,[]);}catch{return readJson(ORDERS_KEY,[]);}
  }
  function suppliers(){
    try{return (window.Rota27V022?.getSuppliers?.()||[]).filter(s=>s?.active!==false);}catch{return [];}
  }
  function catalog(){return Array.isArray(window.state?.catalog)?window.state.catalog:[];}
  function orderById(id){return orders().find(o=>String(o.id)===String(id))||null;}
  function syncConfig(){const x=readJson(SYNC_KEY,{});return x&&typeof x==='object'&&!Array.isArray(x)?x:{};}
  function syncReady(){
    const c=syncConfig();
    return c.enabled===true&&c.initialized===true&&/^https:\/\/.+\/functions\/v1\/rota27-sync\/?$/i.test(String(c.functionUrl||''))&&String(c.deviceToken||'').length>=16&&!!c.deviceId;
  }

  function ensureSheet(){
    if(byId('v024DraftEditWrap'))return;
    const wrap=document.createElement('div');
    wrap.id='v024DraftEditWrap';
    wrap.className='sheet-wrap v024-draft-edit-wrap';
    wrap.innerHTML=`<div class="sheet v024-draft-edit-sheet">
      <div class="handle"></div>
      <div class="v024-de-head"><div><span class="v024-de-kicker">RASCUNHO</span><h3>Editar pedido</h3><p class="desc">Ajuste o pedido antes de marcar como enviado.</p></div><button type="button" id="v024DraftEditClose" class="v024-de-close" aria-label="Fechar">×</button></div>
      <div id="v024DraftEditContent"></div>
    </div>`;
    document.body.appendChild(wrap);
    byId('v024DraftEditClose').onclick=closeEditor;
    wrap.addEventListener('click',e=>{if(e.target===wrap)closeEditor();});
  }

  function supplierOptions(order){
    const rows=suppliers().slice().sort((a,b)=>String(a.name||'').localeCompare(String(b.name||''),'pt-BR'));
    let html='<option value="">Sem fornecedor</option>';
    const seen=new Set();
    rows.forEach(s=>{seen.add(String(s.id));html+=`<option value="${esc(s.id)}" ${String(s.id)===String(order.supplierId||'')?'selected':''}>${esc(s.name||'Fornecedor')}</option>`;});
    if(order.supplierId&&!seen.has(String(order.supplierId)))html+=`<option value="${esc(order.supplierId)}" selected>${esc(order.supplierName||'Fornecedor atual')}</option>`;
    return html;
  }

  function itemRow(item,index){
    const qty=Math.max(0,Number(item.qty||0));
    const cost=Math.max(0,Number(item.unitCostQuoted||0));
    return `<div class="v024-de-item" data-index="${index}" data-product-id="${esc(item.productId)}">
      <div class="v024-de-item-name"><strong>${esc(item.productName||'Produto')}</strong><small>${esc(item.productId||'')}</small></div>
      <label><small>Quantidade</small><input data-role="qty" type="number" min="0.001" step="0.001" inputmode="decimal" value="${qty}"></label>
      <label><small>Custo unit. previsto</small><input data-role="cost" type="text" inputmode="decimal" placeholder="Opcional" value="${moneyInput(cost)}"></label>
      <div class="v024-de-subtotal"><small>Subtotal</small><b data-role="subtotal">${cost>0&&qty>0?fmtMoney(cost*qty):'—'}</b></div>
      <button type="button" class="v024-de-remove" data-role="remove">Remover</button>
    </div>`;
  }

  function renderEditor(){
    const order=orderById(editingOrderId);const content=byId('v024DraftEditContent');
    if(!content)return;
    if(!order||order.status!=='draft'){
      content.innerHTML='<div class="v024-de-warning">Este pedido não está mais em rascunho e não pode ser editado.</div><button type="button" class="primary" id="v024DraftEditDone">Fechar</button>';
      byId('v024DraftEditDone').onclick=closeEditor;return;
    }
    const items=Array.isArray(order.items)?order.items:[];
    content.innerHTML=`
      <div class="v024-de-summary"><div><small>Pedido</small><strong>${esc(order.code||'Pedido')}</strong></div><div><small>Itens</small><strong>${items.length}</strong></div></div>
      <label class="v024-de-field"><small>Fornecedor do pedido</small><select id="v024DraftSupplier">${supplierOptions(order)}</select></label>
      <div class="v024-de-items" id="v024DraftItems">${items.map(itemRow).join('')}</div>
      <div class="v024-de-add"><select id="v024DraftAddProduct"><option value="">Adicionar outro produto…</option>${catalog().filter(p=>!items.some(i=>String(i.productId)===String(p.id))).map(p=>`<option value="${esc(p.id)}">${esc(p.name||'Produto')}</option>`).join('')}</select><button type="button" id="v024DraftAddBtn">+ Adicionar</button></div>
      <label class="v024-de-field"><small>Observação</small><textarea id="v024DraftNote" rows="2" maxlength="240" placeholder="Opcional">${esc(order.note||'')}</textarea></label>
      <div class="v024-de-total"><span><small>Itens com custo</small><b id="v024DraftCosted">0/${items.length}</b></span><span><small>Total previsto conhecido</small><b id="v024DraftTotal">—</b></span></div>
      <div class="v024-de-actions"><button type="button" id="v024DraftCancel">Cancelar</button><button type="button" class="primary" id="v024DraftSave">Salvar alterações</button></div>`;

    byId('v024DraftCancel').onclick=closeEditor;
    byId('v024DraftSave').onclick=saveEditor;
    byId('v024DraftAddBtn').onclick=addSelectedProduct;
    content.querySelectorAll('.v024-de-item').forEach(bindItemRow);
    recalcEditor();
  }

  function bindItemRow(row){
    row.querySelectorAll('input').forEach(input=>input.addEventListener('input',()=>{recalcRow(row);recalcEditor();}));
    row.querySelector('[data-role="remove"]')?.addEventListener('click',()=>{row.remove();recalcEditor();});
  }
  function recalcRow(row){
    const qty=Math.max(0,Number(row.querySelector('[data-role="qty"]')?.value||0));
    const cost=parseMoney(row.querySelector('[data-role="cost"]')?.value||'');
    const out=row.querySelector('[data-role="subtotal"]');if(out)out.textContent=qty>0&&cost>0?fmtMoney(qty*cost):'—';
  }
  function recalcEditor(){
    const rows=[...document.querySelectorAll('#v024DraftItems .v024-de-item')];
    let total=0,costed=0;
    rows.forEach(row=>{const qty=Math.max(0,Number(row.querySelector('[data-role="qty"]')?.value||0));const cost=parseMoney(row.querySelector('[data-role="cost"]')?.value||'');if(qty>0&&cost>0){total+=qty*cost;costed++;}});
    const c=byId('v024DraftCosted'),t=byId('v024DraftTotal');if(c)c.textContent=`${costed}/${rows.length}`;if(t)t.textContent=total>0?fmtMoney(total):'—';
  }

  function addSelectedProduct(){
    const select=byId('v024DraftAddProduct');const pid=String(select?.value||'');if(!pid)return;
    const p=catalog().find(x=>String(x.id)===pid);if(!p)return;
    const box=byId('v024DraftItems');if(!box)return;
    const temp={productId:pid,productName:p.name||'Produto',qty:1,unitCostQuoted:0};
    const holder=document.createElement('div');holder.innerHTML=itemRow(temp,box.children.length);const row=holder.firstElementChild;box.appendChild(row);bindItemRow(row);
    [...select.options].find(o=>String(o.value)===pid)?.remove();select.value='';recalcEditor();
  }

  function updatePurchaseOutbox(order){
    if(!syncReady())return;
    const cfg=syncConfig();
    const rows=readJson(OUTBOX_KEY,[]);const list=Array.isArray(rows)?rows:[];
    const existing=[...list].reverse().find(e=>String(e.eventType)==='purchase_order_upsert'&&String(e.entityId)===String(order.id));
    if(existing){existing.payload={order:clone(order)};existing.appVersion=VERSION;existing.createdAt=new Date(order.updatedAt).toISOString();}
    else list.push({eventId:uid('purchase_order_edit'),eventType:'purchase_order_upsert',entityId:String(order.id),payload:{order:clone(order)},deviceId:String(cfg.deviceId),createdAt:new Date(order.updatedAt).toISOString(),appVersion:VERSION});
    writeJson(OUTBOX_KEY,list.slice(-1200));
  }

  function saveEditor(){
    const current=orderById(editingOrderId);if(!current||current.status!=='draft'){renderEditor();return;}
    const itemRows=[...document.querySelectorAll('#v024DraftItems .v024-de-item')];
    const nextItems=itemRows.map(row=>{
      const pid=String(row.dataset.productId||'');const p=catalog().find(x=>String(x.id)===pid);
      const qty=round3(Math.max(0,Number(row.querySelector('[data-role="qty"]')?.value||0)));
      const cost=parseMoney(row.querySelector('[data-role="cost"]')?.value||'');
      const old=(current.items||[]).find(i=>String(i.productId)===pid)||{};
      const next={...old,productId:pid,productName:p?.name||old.productName||'Produto',qty};
      if(cost>0){next.unitCostQuoted=cost;next.costSource='manual';}else{delete next.unitCostQuoted;delete next.costSource;}
      return next;
    }).filter(i=>i.productId&&i.qty>0);
    if(!nextItems.length){toast('O pedido precisa ter pelo menos um item com quantidade maior que zero.');return;}

    const supplierId=String(byId('v024DraftSupplier')?.value||'');
    const supplier=suppliers().find(s=>String(s.id)===supplierId)||null;
    const known=nextItems.filter(i=>Number(i.unitCostQuoted||0)>0);
    const updatedAt=Date.now();
    const next={...current,
      supplierId:supplier?.id||null,
      supplierName:supplier?.name||'Sem fornecedor',
      items:nextItems,
      note:clean(byId('v024DraftNote')?.value||'',240),
      estimatedItemsCost:known.length?round4(known.reduce((s,i)=>s+Number(i.qty||0)*Number(i.unitCostQuoted||0),0)):0,
      costedItems:known.length,
      costAppVersion:VERSION,
      updatedAt,
      editedAt:updatedAt,
      editedAppVersion:VERSION
    };
    const rows=readJson(ORDERS_KEY,[]);if(!Array.isArray(rows))return;
    const idx=rows.findIndex(o=>String(o.id)===String(next.id));if(idx<0)return;
    rows[idx]=next;writeJson(ORDERS_KEY,rows);updatePurchaseOutbox(next);
    try{window.dispatchEvent(new CustomEvent('rota27:v022-purchases-updated'));}catch{}
    if(navigator.onLine&&window.Rota27V022?.syncPurchases)setTimeout(()=>window.Rota27V022.syncPurchases(),80);
    closeEditor();
    try{window.Rota27V022?.open?.('orders');}catch{}
    setTimeout(enhanceDraftButtons,0);
    toast('Rascunho atualizado.');
  }

  function openEditor(orderId){
    const order=orderById(orderId);if(!order)return;
    if(order.status!=='draft'){toast('Somente pedidos em rascunho podem ser editados.');return;}
    editingOrderId=String(orderId);ensureSheet();renderEditor();byId('v024DraftEditWrap').classList.add('open');
  }
  function closeEditor(){byId('v024DraftEditWrap')?.classList.remove('open');editingOrderId=null;}

  function enhanceDraftButtons(){
    document.querySelectorAll('#v022Content .v022-order-card').forEach(card=>{
      const o=orderById(card.dataset.orderId);if(!o||o.status!=='draft')return;
      const actions=card.querySelector('.v022-order-actions');if(!actions||actions.querySelector('[data-v024-action="edit-draft"]'))return;
      const btn=document.createElement('button');btn.type='button';btn.dataset.v024Action='edit-draft';btn.textContent='Editar';
      actions.insertBefore(btn,actions.firstChild);
    });
  }

  function scheduleEnhance(){setTimeout(enhanceDraftButtons,0);setTimeout(enhanceDraftButtons,120);}
  function start(){
    ensureSheet();scheduleEnhance();
    document.addEventListener('click',e=>{
      const btn=e.target?.closest?.('[data-v024-action="edit-draft"]');
      if(btn){e.preventDefault();e.stopPropagation();openEditor(btn.closest('.v022-order-card')?.dataset.orderId);return;}
      if(e.target?.closest?.('#v022PurchasesWrap'))scheduleEnhance();
    },true);
    window.addEventListener('rota27:v022-purchases-updated',scheduleEnhance);
    try{
      const api=window.Rota27V022;
      if(api?.open&&!api.__v024DraftEditWrapped){const base=api.open.bind(api);api.open=function(){const r=base(...arguments);scheduleEnhance();return r;};api.__v024DraftEditWrapped=true;}
    }catch{}
    console.info('[Rota27] edição de rascunho v0.24 carregada.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
