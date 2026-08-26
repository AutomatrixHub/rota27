/* Rota 27 v0.25.12 — Pendências / A Receber */
(function(){
  'use strict';

  const VERSION='0.25.12';
  const STORE_KEY='rota27_v02512_receivables_v1';
  const OUTBOX_KEY='rota27_v02512_receivable_outbox_v1';
  const CURSOR_KEY='rota27_v02512_receivable_cursor_v1';
  const SYNC_CONFIG_KEY='rota27_sync_config_v1';
  const MAX_OUTBOX=500;
  let syncing=false;
  let baseFinalize=null;
  let baseRenderPayment=null;
  let panelBridgeInstalled=false;
  let activeReceivableId='';

  const byId=id=>document.getElementById(id);
  const clone=v=>JSON.parse(JSON.stringify(v==null?null:v));
  const clean=(v,max=180)=>String(v??'').replace(/[\u0000-\u001f\u007f]/g,' ').trim().replace(/\s+/g,' ').slice(0,max);
  const esc=v=>typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const moneyValue=v=>{try{return typeof money==='function'?money(Number(v||0)):Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}catch{return 'R$ 0,00';}};
  const nowIso=()=>new Date().toISOString();
  const uid=prefix=>globalThis.crypto?.randomUUID?`${prefix}_${crypto.randomUUID()}`:`${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,10)}`;
  function notify(msg){try{typeof showToast==='function'?showToast(msg,false):console.info('[Rota27]',msg);}catch{}}
  function readJson(key,fallback){try{const v=JSON.parse(localStorage.getItem(key)||'null');return v==null?fallback:v;}catch{return fallback;}}
  function writeJson(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}}
  function readRows(){const rows=readJson(STORE_KEY,[]);return Array.isArray(rows)?rows:[];}
  function normalizeRow(row){
    const payments=Array.isArray(row?.payments)?row.payments.filter(p=>p&&p.id&&Number(p.amount)>0):[];
    const originalAmount=Math.max(0,Number(row?.originalAmount||0));
    const paid=payments.reduce((sum,p)=>sum+Math.max(0,Number(p.amount||0)),0);
    const balance=Math.max(0,originalAmount-paid);
    return {...row,payments,originalAmount,paidAmount:paid,balance,status:balance<=0.005?'paid':'open'};
  }
  function rows(){return readRows().map(normalizeRow).sort((a,b)=>Number(b.openedAt||0)-Number(a.openedAt||0));}
  function saveRows(next){writeJson(STORE_KEY,(Array.isArray(next)?next:[]).map(normalizeRow));refreshUi();}
  function upsertLocal(incoming){
    if(!incoming?.id)return false;
    const list=readRows();const idx=list.findIndex(x=>String(x.id)===String(incoming.id));
    if(idx<0){list.push(normalizeRow({...clone(incoming),payments:[]}));saveRows(list);return true;}
    const existing=normalizeRow(list[idx]);
    list[idx]=normalizeRow({...existing,...clone(incoming),payments:existing.payments});saveRows(list);return true;
  }
  function addPaymentLocal(receivableId,payment){
    const list=readRows();const idx=list.findIndex(x=>String(x.id)===String(receivableId));if(idx<0)return false;
    const row=normalizeRow(list[idx]);if(row.payments.some(p=>String(p.id)===String(payment?.id)))return false;
    row.payments.push(clone(payment));row.updatedAt=Math.max(Number(row.updatedAt||0),Number(payment.paidAt||Date.now()));list[idx]=normalizeRow(row);saveRows(list);return true;
  }

  function syncConfig(){const c=readJson(SYNC_CONFIG_KEY,{});return c&&typeof c==='object'?c:{};}
  function syncReady(){const c=syncConfig();return c.enabled===true&&c.initialized===true&&/^https:\/\/.+\/functions\/v1\/rota27-sync\/?$/i.test(String(c.functionUrl||''))&&String(c.deviceToken||'').length>=16&&!!c.deviceId;}
  async function api(body){
    const c=syncConfig();if(!syncReady())throw new Error('Sincronização não configurada.');
    const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),12000);
    try{
      const r=await fetch(String(c.functionUrl).replace(/\/+$/,''),{method:'POST',headers:{'content-type':'application/json','x-rota27-device-token':String(c.deviceToken)},body:JSON.stringify({...body,deviceId:c.deviceId,deviceName:c.deviceName||'Aparelho',storeId:c.storeId||'rota27-bodega',appVersion:VERSION}),signal:ctrl.signal});
      const data=await r.json().catch(()=>({}));if(!r.ok||data.ok!==true)throw new Error(data.error||`HTTP ${r.status}`);return data;
    }finally{clearTimeout(timer);}
  }
  function readOutbox(){const v=readJson(OUTBOX_KEY,[]);return Array.isArray(v)?v:[];}
  function writeOutbox(v){writeJson(OUTBOX_KEY,(Array.isArray(v)?v:[]).slice(-MAX_OUTBOX));}
  function queueEvent(eventType,entityId,payload,eventId){
    const c=syncConfig();const evt={eventId:eventId||uid('recv_evt'),eventType,entityId:String(entityId||''),payload:clone(payload||{}),deviceId:c.deviceId||'local',createdAt:nowIso(),appVersion:VERSION};
    const out=readOutbox();if(!out.some(x=>String(x.eventId)===evt.eventId))out.push(evt);writeOutbox(out);
    if(navigator.onLine&&syncReady())setTimeout(()=>syncNow(),0);
  }
  async function pushOutbox(){
    let out=readOutbox();
    while(out.length){const batch=out.slice(0,100);await api({action:'push',events:batch});const sent=new Set(batch.map(x=>String(x.eventId)));out=readOutbox().filter(x=>!sent.has(String(x.eventId)));writeOutbox(out);}
  }
  function applyRemote(event){
    const type=String(event.event_type||event.eventType||'');const id=String(event.entity_id||event.entityId||'');const payload=event.payload&&typeof event.payload==='object'?event.payload:{};
    if(type==='receivable_upsert')return upsertLocal(payload.receivable||{...payload,id});
    if(type==='receivable_payment')return addPaymentLocal(payload.receivableId||id,payload.payment);
    return false;
  }
  async function pullEvents(){
    let cursor=Math.max(0,Number(localStorage.getItem(CURSOR_KEY)||0)),changed=false;
    for(let page=0;page<40;page++){
      const data=await api({action:'pull',afterSeq:cursor,limit:500,preferSnapshot:false});const events=Array.isArray(data.events)?data.events:[];
      for(const evt of events){cursor=Math.max(cursor,Number(evt.seq||0));if(applyRemote(evt))changed=true;}
      cursor=Math.max(cursor,Number(data.cursor||cursor));localStorage.setItem(CURSOR_KEY,String(cursor));if(!data.hasMore||!events.length)break;
    }
    return changed;
  }
  async function syncNow(){
    if(syncing||!navigator.onLine||!syncReady())return false;syncing=true;
    try{await pushOutbox();const changed=await pullEvents();if(changed)window.dispatchEvent(new CustomEvent('rota27:v02512-receivables-updated'));return true;}
    catch(err){console.warn('[Rota27 v0.25.12] sync A receber:',err?.message||err);return false;}
    finally{syncing=false;refreshUi();}
  }

  function itemPrice(command,id){
    const meta=command?.itemMeta?.[id];if(meta)return Number(meta.price||0);
    try{const p=Array.isArray(state?.catalog)?state.catalog.find(x=>String(x.id)===String(id)):null;return Number(p?.price||0);}catch{return 0;}
  }
  function recordTotal(command){
    if(Number.isFinite(Number(command?.total)))return Number(command.total);
    try{if(typeof commandTotal==='function')return Number(commandTotal(command)||0);}catch{}
    return Object.entries(command?.items||{}).reduce((sum,[id,qty])=>sum+Number(qty||0)*itemPrice(command,id),0);
  }

  function ensurePaymentOption(){
    const select=byId('v14PaymentMethod');if(!select)return false;
    if(!select.querySelector('option[value="A receber"]')){
      const option=document.createElement('option');option.value='A receber';option.textContent='A receber / Paga depois';select.appendChild(option);
    }
    return true;
  }
  function isOnAccount(){return byId('v14PaymentMethod')?.value==='A receber';}
  function renderPaymentMode(){
    ensurePaymentOption();
    if(baseRenderPayment)baseRenderPayment();
    const wrap=byId('closeWrap'),confirm=byId('paymentConfirmBtn'),text=byId('paymentConfirmText'),finalBtn=byId('finalizeBtn'),note=wrap?.querySelector('.closed-note');
    if(!wrap||!finalBtn)return;
    const due=isOnAccount();wrap.classList.toggle('v02512-on-account',due);
    if(due){
      if(confirm){confirm.disabled=true;confirm.setAttribute('aria-pressed','false');confirm.classList.remove('confirmed');const icon=confirm.querySelector('.pay-icon');if(icon)icon.textContent='○';}
      if(text)text.textContent='Pagamento ficará pendente';
      if(note)note.textContent='A venda será fechada normalmente e ficará registrada em A receber para baixa posterior.';
      finalBtn.disabled=false;
    }else if(confirm){confirm.disabled=false;}
  }
  function installPaymentPatch(){
    ensurePaymentOption();
    if(!baseRenderPayment&&typeof window.renderPaymentConfirmation==='function')baseRenderPayment=window.renderPaymentConfirmation;
    if(!baseFinalize&&typeof window.finalizeCommand==='function')baseFinalize=window.finalizeCommand;
    if(baseRenderPayment){const fn=function(){return renderPaymentMode();};try{window.renderPaymentConfirmation=fn;renderPaymentConfirmation=fn;}catch{}}
    if(baseFinalize){const fn=function(){if(!isOnAccount())return baseFinalize.apply(this,arguments);return finalizeOnAccount();};try{window.finalizeCommand=fn;finalizeCommand=fn;}catch{}}
    const select=byId('v14PaymentMethod');if(select&&!select.dataset.v02512Bound){select.dataset.v02512Bound='1';select.addEventListener('change',renderPaymentMode);}
  }

  function finalizeOnAccount(){
    let idx=-1;try{idx=state.commands.findIndex(c=>c.id===activeCommandId);}catch{}if(idx<0)return;
    const c=state.commands[idx];const customer=clean(c?.customer||'',120);if(!customer){notify('Informe o nome do cliente antes de registrar como A receber.');return;}
    const total=recordTotal(c);if(!(total>0)){notify('Esta comanda não possui valor a receber.');return;}
    const closedAt=Date.now();const receivableId=`recv_${String(c.id)}`;
    const history={...clone(c),closedAt,paymentConfirmedAt:null,paymentMethod:'A receber',receivableId,receivableStatus:'open',total};
    state.history.unshift(history);state.commands.splice(idx,1);
    const row={id:receivableId,commandId:String(c.id),customer,table:clean(c.table||'',120),whatsappPhone:clean(c.whatsappPhone||'',40),openedAt:closedAt,originalAmount:total,updatedAt:closedAt,source:'command',payments:[]};
    upsertLocal(row);
    try{save();}catch{}
    queueEvent('receivable_upsert',receivableId,{receivable:{...row,payments:undefined}},`receivable_upsert_${String(c.id)}`);
    try{closeSheet('closeWrap');}catch{byId('closeWrap')?.classList.remove('open');}
    try{activeCommandId=null;}catch{}
    try{showScreen('commands');}catch{}
    notify(`Comanda fechada. ${moneyValue(total)} registrado em A receber.`);
    window.dispatchEvent(new CustomEvent('rota27:v02512-receivables-updated',{detail:{receivableId}}));
    setTimeout(()=>{renderPanel();augmentTurnClose();},0);
  }

  function openRows(){return rows().filter(r=>r.status==='open');}
  function paidRows(){return rows().filter(r=>r.status==='paid');}
  function totals(){const open=openRows();return {count:open.length,balance:open.reduce((s,r)=>s+r.balance,0),original:open.reduce((s,r)=>s+r.originalAmount,0)};}
  function buildPanel(){
    const section=document.createElement('section');section.id='v02512ReceivablesEntry';section.className='v0252-standard-entry v02512-receivables-entry';
    section.innerHTML='<div class="v02512-entry-head"><div class="v02512-entry-copy"><strong>A receber</strong><small id="v02512PanelSummary"></small></div><button type="button" class="v02512-open" id="v02512Open">Abrir pendências</button></div>';return section;
  }
  function renderPanel(){
    const panel=byId('screenPanel');if(!panel)return false;let section=byId('v02512ReceivablesEntry');if(!section)section=buildPanel();
    const relationship=byId('v0252RelationshipSection');if(relationship){if(section.parentElement!==panel||section.previousElementSibling!==relationship)relationship.insertAdjacentElement('afterend',section);}else if(section.parentElement!==panel)panel.appendChild(section);
    const t=totals(),summary=byId('v02512PanelSummary');section.classList.toggle('has-open',t.count>0);
    if(summary)summary.innerHTML=t.count?`<span class="v02512-dot warn"></span>${esc(`${t.count} pendência${t.count===1?'':'s'} • ${moneyValue(t.balance)} a receber`)}`:`<span class="v02512-dot ok"></span>Nenhuma pendência em aberto`;
    const btn=byId('v02512Open');if(btn)btn.textContent=t.count?`Ver ${t.count} pendência${t.count===1?'':'s'}`:'Abrir A receber';return true;
  }
  function installPanelBridge(){
    const panel=byId('screenPanel');if(!panel||panel.dataset.v02512Bridge==='1')return;
    const own=Object.getOwnPropertyDescriptor(panel,'innerHTML');const proto=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');const descriptor=own?.get&&own?.set?own:proto;
    if(!descriptor?.get||!descriptor?.set)return;
    try{Object.defineProperty(panel,'innerHTML',{configurable:true,enumerable:descriptor.enumerable,get:function(){return descriptor.get.call(this);},set:function(value){descriptor.set.call(this,value);queueMicrotask(()=>renderPanel());}});panel.dataset.v02512Bridge='1';panelBridgeInstalled=true;}catch(err){console.warn('[Rota27 v0.25.12] ponte Painel:',err);}
  }

  function ensureSheets(){
    if(!byId('v02512ReceivablesWrap')){
      const wrap=document.createElement('div');wrap.id='v02512ReceivablesWrap';wrap.className='sheet-wrap';wrap.innerHTML='<div class="sheet v02512-sheet"><div class="handle"></div><div class="v019-head"><div><h3>A receber</h3><p class="desc">Pendências de clientes que pagam depois. Recebimentos aqui não criam uma nova venda.</p></div><button type="button" class="v019-x" id="v02512ReceivablesX">×</button></div><div id="v02512ReceivablesBody"></div><div class="sheet-actions"><button type="button" class="secondary" id="v02512Sync">Sincronizar</button><button type="button" class="primary" id="v02512Done">Concluir</button></div></div>';document.body.appendChild(wrap);
      wrap.addEventListener('click',e=>{if(e.target===wrap)wrap.classList.remove('open');});byId('v02512ReceivablesX').addEventListener('click',()=>wrap.classList.remove('open'));byId('v02512Done').addEventListener('click',()=>wrap.classList.remove('open'));byId('v02512Sync').addEventListener('click',async()=>{await syncNow();renderReceivablesSheet();});
    }
    if(!byId('v02512PaymentWrap')){
      const wrap=document.createElement('div');wrap.id='v02512PaymentWrap';wrap.className='sheet-wrap';wrap.innerHTML='<div class="sheet v02512-sheet"><div class="handle"></div><div class="v019-head"><div><h3>Registrar recebimento</h3><p class="desc" id="v02512PaymentSubtitle"></p></div><button type="button" class="v019-x" id="v02512PaymentX">×</button></div><div id="v02512PaymentBody"></div><div class="sheet-actions"><button type="button" class="secondary" id="v02512PaymentCancel">Cancelar</button><button type="button" class="primary" id="v02512PaymentSave">Registrar recebimento</button></div></div>';document.body.appendChild(wrap);
      wrap.addEventListener('click',e=>{if(e.target===wrap)wrap.classList.remove('open');});byId('v02512PaymentX').addEventListener('click',()=>wrap.classList.remove('open'));byId('v02512PaymentCancel').addEventListener('click',()=>wrap.classList.remove('open'));byId('v02512PaymentSave').addEventListener('click',savePayment);
    }
  }
  function rowHtml(r){const last=r.payments.slice().sort((a,b)=>Number(b.paidAt)-Number(a.paidAt))[0];return `<div class="v02512-row ${r.status==='paid'?'paid':''}"><div class="v02512-row-copy"><strong>${esc(r.customer||'Cliente')}</strong><span>${esc(r.table||'Sem local')} • origem ${new Date(Number(r.openedAt||0)).toLocaleDateString('pt-BR')}</span><small>${r.paidAmount>0?`${moneyValue(r.paidAmount)} já recebido${last?` • último ${new Date(Number(last.paidAt)).toLocaleDateString('pt-BR')}`:''}`:'Nenhum recebimento registrado'}</small></div><div class="v02512-row-balance"><b>${esc(r.status==='paid'?'Quitado':moneyValue(r.balance))}</b><button type="button" data-v02512-pay="${esc(r.id)}">Registrar recebimento</button></div></div>`;}
  function renderReceivablesSheet(){ensureSheets();const body=byId('v02512ReceivablesBody');if(!body)return;const open=openRows(),paid=paidRows().slice(0,8),t=totals();body.innerHTML=`<div class="v02512-summary"><div><small>Pendências</small><strong>${open.length}</strong></div><div><small>A receber</small><strong>${esc(moneyValue(t.balance))}</strong></div><div><small>Quitadas</small><strong>${paidRows().length}</strong></div></div><div class="v02512-section-title"><h4>Em aberto</h4><small>${open.length?`${open.length} cliente${open.length===1?'':'s'}`:'Tudo em dia'}</small></div><div class="v02512-list">${open.length?open.map(rowHtml).join(''):'<div class="v02512-empty">Nenhuma pendência em aberto.</div>'}</div>${paid.length?`<div class="v02512-section-title"><h4>Quitadas recentemente</h4><small>referência</small></div><div class="v02512-list">${paid.map(rowHtml).join('')}</div>`:''}<div class="v02512-help"><strong>Regra:</strong> registrar um recebimento aqui baixa a dívida do cliente, mas não gera outra venda nem altera os produtos vendidos.</div>`;}
  function openReceivables(){ensureSheets();renderReceivablesSheet();byId('v02512ReceivablesWrap').classList.add('open');if(navigator.onLine)syncNow().then(renderReceivablesSheet);}
  function openPayment(id){const r=rows().find(x=>String(x.id)===String(id));if(!r||r.status!=='open')return;activeReceivableId=r.id;ensureSheets();byId('v02512PaymentSubtitle').textContent=`${r.customer} • saldo ${moneyValue(r.balance)}`;byId('v02512PaymentBody').innerHTML=`<div class="v02512-payment-box"><small>Saldo atual</small><strong>${esc(moneyValue(r.balance))}</strong></div><div class="v02512-payment-field"><label>Valor recebido</label><input id="v02512PaymentAmount" inputmode="decimal" value="${String(r.balance.toFixed(2)).replace('.',',')}" /></div><div class="v02512-payment-field"><label>Forma de recebimento</label><select id="v02512PaymentMethod"><option value="Pix">Pix</option><option value="Dinheiro">Dinheiro</option><option value="Débito">Cartão de débito</option><option value="Crédito">Cartão de crédito</option><option value="Outro">Outro</option></select></div>`;byId('v02512PaymentWrap').classList.add('open');setTimeout(()=>byId('v02512PaymentAmount')?.select(),50);}
  function parseAmount(v){return Number(String(v||'').replace(/\s/g,'').replace(/\./g,'').replace(',','.'));}
  function savePayment(){
    const r=rows().find(x=>String(x.id)===String(activeReceivableId));if(!r||r.status!=='open')return;
    const amount=parseAmount(byId('v02512PaymentAmount')?.value),method=clean(byId('v02512PaymentMethod')?.value||'',40);if(!(amount>0)){notify('Informe um valor recebido válido.');return;}if(amount-r.balance>0.005){notify(`O valor não pode ultrapassar o saldo de ${moneyValue(r.balance)}.`);return;}if(!method){notify('Escolha a forma de recebimento.');return;}
    const c=syncConfig(),payment={id:uid('recvpay'),amount:Number(amount.toFixed(2)),method,paidAt:Date.now(),deviceId:c.deviceId||'local',deviceName:c.deviceName||'Aparelho'};
    if(!addPaymentLocal(r.id,payment))return;queueEvent('receivable_payment',r.id,{receivableId:r.id,payment},`receivable_payment_${payment.id}`);byId('v02512PaymentWrap').classList.remove('open');activeReceivableId='';renderReceivablesSheet();renderPanel();notify(amount+0.005>=r.balance?'Pendência quitada.':'Recebimento parcial registrado.');window.dispatchEvent(new CustomEvent('rota27:v02512-receivables-updated'));
  }

  function augmentTurnClose(){
    const wrap=byId('v019CloseWrap');if(!wrap?.classList.contains('open'))return;const body=byId('v019CloseBody');if(!body)return;body.querySelector('.v02512-turn-money')?.remove();
    let summary=null;try{summary=window.Rota27V019?.buildSummary?.();}catch{}if(!summary)return;
    const due=(Array.isArray(summary.payments)?summary.payments:[]).filter(p=>String(p?.name||'').trim().toLocaleLowerCase('pt-BR')==='a receber').reduce((s,p)=>s+Number(p.value||0),0);const received=Math.max(0,Number(summary.revenue||0)-due);
    if(!(due>0))return;const box=document.createElement('div');box.className='v02512-turn-money';box.innerHTML=`<div class="received"><small>Recebido no turno</small><strong>${esc(moneyValue(received))}</strong></div><div class="due"><small>A receber</small><strong>${esc(moneyValue(due))}</strong></div>`;const metrics=body.querySelector('.v019-preview-metrics');metrics?.insertAdjacentElement('afterend',box);
  }

  function injectHelp(){
    const content=byId('r27HelpOverlay')?.querySelector('.r27-help-content');if(!content||byId('r27-help-a-receber'))return false;const section=document.createElement('details');section.id='r27-help-a-receber';section.className='r27-help-section';section.innerHTML='<summary><span class="r27-help-section-icon">$</span><span><strong>A receber / Paga depois</strong><small>Fechar a venda sem inventar pagamento.</small></span></summary><div class="r27-help-section-body"><p>Ao fechar uma comanda, escolha <strong>A receber / Paga depois</strong> quando o cliente for pagar em outro momento. A venda entra no faturamento e deixa de bloquear o turno, mas o valor fica como pendência.</p><p>No <strong>Painel → A receber</strong>, registre pagamentos totais ou parciais. A baixa não cria uma nova venda e não duplica itens nem faturamento.</p></div>';content.appendChild(section);return true;
  }

  function refreshUi(){installPanelBridge();renderPanel();if(byId('v02512ReceivablesWrap')?.classList.contains('open'))renderReceivablesSheet();if(byId('v019CloseWrap')?.classList.contains('open'))augmentTurnClose();}
  function handleClick(e){
    if(e.target.closest?.('#v02512Open')){e.preventDefault();openReceivables();return;}
    const pay=e.target.closest?.('[data-v02512-pay]');if(pay){e.preventDefault();openPayment(pay.dataset.v02512Pay);return;}
    if(e.target.closest?.('#navPanel'))setTimeout(refreshUi,0);
    if(e.target.closest?.('#v019CloseTurn')){setTimeout(augmentTurnClose,180);setTimeout(augmentTurnClose,900);}
    if(e.target.closest?.('#r27HelpBtn,[data-help]'))setTimeout(injectHelp,80);
  }
  function start(){
    installPaymentPatch();installPanelBridge();ensureSheets();setTimeout(()=>{installPaymentPatch();refreshUi();injectHelp();if(navigator.onLine)syncNow();},260);
    document.addEventListener('click',handleClick);window.addEventListener('online',()=>syncNow());window.addEventListener('storage',refreshUi);window.addEventListener('rota27:v017-domain-updated',refreshUi);window.addEventListener('rota27:v02512-receivables-updated',refreshUi);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){installPaymentPatch();refreshUi();if(navigator.onLine)syncNow();}});
    window.Rota27V02512={version:VERSION,getReceivables:()=>clone(rows()),getOpenReceivables:()=>clone(openRows()),sync:syncNow,open:openReceivables,refresh:refreshUi};
    console.info('[Rota27] v0.25.12 — Pendências / A Receber carregado.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
