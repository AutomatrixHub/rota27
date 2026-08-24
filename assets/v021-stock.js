/* Rota 27 v0.21.0 — Estoque Essencial */
(function(){
  'use strict';

  const VERSION='0.21.0';
  const LABEL='v0.21.0';
  const TITLE='Rota 27 Bodega • Comandas v0.21.0';
  const CONFIG_KEY='rota27_v021_inventory_config_v1';
  const MOVEMENTS_KEY='rota27_v021_inventory_movements_v1';
  const OUTBOX_KEY='rota27_v021_inventory_outbox_v1';
  const CURSOR_KEY='rota27_v021_inventory_cursor_v1';
  const META_KEY='rota27_v021_inventory_meta_v1';
  const SYNC_CONFIG_KEY='rota27_sync_config_v1';
  const MAX_MOVEMENTS=12000;
  const MAX_OUTBOX=5000;

  let filter='all';
  let searchText='';
  let baseSave=null;
  let reconcileTimer=null;
  let syncing=false;
  let badgeObserver=null;
  let titleObserver=null;

  function byId(id){return document.getElementById(id);}
  function clone(v){return JSON.parse(JSON.stringify(v==null?null:v));}
  function clean(v,max=220){return String(v??'').replace(/[\u0000-\u001F\u007F]/g,' ').trim().replace(/\s+/g,' ').slice(0,max);}
  function norm(v){return clean(v,500).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');}
  function esc(v){if(typeof escapeHtml==='function')return escapeHtml(String(v??''));return String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
  function uid(prefix='inv'){return globalThis.crypto?.randomUUID?`${prefix}_${crypto.randomUUID()}`:`${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,10)}`;}
  function num(v,fallback=0){const n=Number(v);return Number.isFinite(n)?n:fallback;}
  function qty(v){return Math.round(num(v,0)*1000)/1000;}
  function fmtQty(v){const n=qty(v);return n.toLocaleString('pt-BR',{minimumFractionDigits:Number.isInteger(n)?0:1,maximumFractionDigits:3});}
  function now(){return Date.now();}
  function ownVersion(){return String(document.querySelector('meta[name="rota27-version"]')?.getAttribute('content')||'')===VERSION;}
  function toast(msg){try{if(typeof showToast==='function')showToast(msg,false);}catch{}}

  function readJson(key,fallback){try{const x=JSON.parse(localStorage.getItem(key)||'null');return x==null?fallback:x;}catch{return fallback;}}
  function writeJson(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}}
  function readConfigMap(){const raw=readJson(CONFIG_KEY,{});return raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{};}
  function writeConfigMap(map){return writeJson(CONFIG_KEY,map&&typeof map==='object'?map:{});}
  function readMovements(){const rows=readJson(MOVEMENTS_KEY,[]);return Array.isArray(rows)?rows.slice(-MAX_MOVEMENTS):[];}
  function writeMovements(rows){return writeJson(MOVEMENTS_KEY,(Array.isArray(rows)?rows:[]).slice(-MAX_MOVEMENTS));}
  function readOutbox(){const rows=readJson(OUTBOX_KEY,[]);return Array.isArray(rows)?rows.slice(-MAX_OUTBOX):[];}
  function writeOutbox(rows){return writeJson(OUTBOX_KEY,(Array.isArray(rows)?rows:[]).slice(-MAX_OUTBOX));}
  function getCursor(){return Math.max(0,num(localStorage.getItem(CURSOR_KEY),0));}
  function setCursor(v){localStorage.setItem(CURSOR_KEY,String(Math.max(0,num(v,0))));}
  function readMeta(){const m=readJson(META_KEY,{});return m&&typeof m==='object'?m:{};}
  function patchMeta(patch){writeJson(META_KEY,{...readMeta(),...patch});}

  function catalog(){
    try{return Array.isArray(state?.catalog)?state.catalog.filter(p=>p&&p.id&&p.active!==false):[];}catch{return [];}
  }
  function productById(id){return catalog().find(p=>String(p.id)===String(id))||null;}
  function productName(id,fallback='Produto'){return clean(productById(id)?.name||fallback,160)||'Produto';}

  function normalizeConfig(raw,id){
    const r=raw&&typeof raw==='object'?raw:{};
    return {
      productId:String(id||r.productId||''),
      enabled:r.enabled===true,
      baseQty:qty(Math.max(0,num(r.baseQty,0))),
      minQty:qty(Math.max(0,num(r.minQty,0))),
      trackingFrom:Math.max(0,num(r.trackingFrom,0)),
      updatedAt:Math.max(0,num(r.updatedAt,0)),
      updatedBy:clean(r.updatedBy||'',120)
    };
  }
  function configFor(id){const m=readConfigMap();return normalizeConfig(m[String(id)],id);}

  function syncConfig(){const c=readJson(SYNC_CONFIG_KEY,{});return c&&typeof c==='object'?c:{};}
  function syncReady(){const c=syncConfig();return c.enabled===true&&c.initialized===true&&/^https:\/\/.+\/functions\/v1\/rota27-sync\/?$/i.test(String(c.functionUrl||''))&&String(c.deviceToken||'').length>=16&&!!c.deviceId;}
  function deviceMeta(){
    const c=syncConfig();
    return {deviceId:clean(c.deviceId||'local',120)||'local',deviceName:clean(c.deviceName||'Este aparelho',80)||'Este aparelho',storeId:clean(c.storeId||'rota27-bodega',80)||'rota27-bodega'};
  }

  function movementDelta(productId){return readMovements().filter(m=>String(m.productId)===String(productId)).reduce((sum,m)=>sum+qty(m.delta),0);}
  function currentStock(productId){const c=configFor(productId);return qty(c.baseQty+movementDelta(productId));}
  function openCommitted(productId){
    try{return qty((Array.isArray(state?.commands)?state.commands:[]).filter(c=>c?.cancelled!==true).reduce((sum,c)=>sum+Math.max(0,num(c?.items?.[productId],0)),0));}catch{return 0;}
  }
  function stockInfo(productId){
    const c=configFor(productId),current=currentStock(productId),committed=c.enabled?openCommitted(productId):0,projected=qty(current-committed);
    let status='off';
    if(c.enabled){if(current<0)status='divergence';else if(projected<=0)status='out';else if(projected<=c.minQty)status='low';else status='ok';}
    return {config:c,current,committed,projected,status};
  }
  function statusMeta(status){return ({off:['off','Sem controle'],ok:['ok','Saudável'],low:['low','Reposição'],out:['out','Zerando'],divergence:['danger','Divergência']})[status]||['off','Sem controle'];}

  function addMovement(row,{queue=true}={}){
    const m={
      id:clean(row?.id,180)||uid('mov'),productId:clean(row?.productId,160),productName:clean(row?.productName||productName(row?.productId),160),
      type:clean(row?.type||'adjustment',40),delta:qty(row?.delta),reason:clean(row?.reason||'',220),commandId:clean(row?.commandId||'',180),
      commandClosedAt:Math.max(0,num(row?.commandClosedAt,0)),createdAt:Math.max(0,num(row?.createdAt,now())),createdBy:clean(row?.createdBy||deviceMeta().deviceName,120),appVersion:clean(row?.appVersion||VERSION,40)
    };
    if(!m.productId||!m.id||!Number.isFinite(m.delta)||m.delta===0)return false;
    const rows=readMovements();if(rows.some(x=>String(x.id)===String(m.id)))return false;
    rows.push(m);writeMovements(rows);if(queue)queueMovementEvent(m);scheduleRefresh();return true;
  }

  function saveConfig(productId,patch,{queue=true}={}){
    const id=String(productId||'');if(!id)return null;
    const map=readConfigMap(),old=normalizeConfig(map[id],id),dm=deviceMeta();
    const next=normalizeConfig({...old,...patch,productId:id,updatedAt:Math.max(now(),num(patch?.updatedAt,0)),updatedBy:patch?.updatedBy||dm.deviceName},id);
    map[id]=next;writeConfigMap(map);if(queue)queueConfigEvent(next);scheduleRefresh();return next;
  }

  function queueEvent(event){const rows=readOutbox();if(rows.some(x=>String(x.eventId)===String(event.eventId)))return;rows.push(event);writeOutbox(rows);if(navigator.onLine&&syncReady())setTimeout(syncNow,300);}
  function queueConfigEvent(c){const dm=deviceMeta();queueEvent({eventId:uid('inv_cfg'),eventType:'inventory_config_upsert',entityId:c.productId,payload:{config:clone(c)},deviceId:dm.deviceId,createdAt:new Date(c.updatedAt||now()).toISOString(),appVersion:VERSION});}
  function queueMovementEvent(m){const dm=deviceMeta();queueEvent({eventId:`inventory_movement_${m.id}`,eventType:'inventory_movement',entityId:m.productId,payload:{movement:clone(m)},deviceId:dm.deviceId,createdAt:new Date(m.createdAt||now()).toISOString(),appVersion:VERSION});}

  async function syncApi(body){
    const c=syncConfig();if(!syncReady())throw new Error('Sincronização não configurada neste aparelho.');
    const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),12000);
    try{
      const r=await fetch(String(c.functionUrl).replace(/\/+$/,''),{method:'POST',headers:{'content-type':'application/json','x-rota27-device-token':String(c.deviceToken)},body:JSON.stringify({...body,deviceId:c.deviceId,deviceName:c.deviceName||'Aparelho',storeId:c.storeId||'rota27-bodega',appVersion:VERSION}),signal:ctrl.signal});
      const data=await r.json().catch(()=>({}));if(!r.ok||data.ok!==true)throw new Error(data.error||`HTTP ${r.status}`);return data;
    }finally{clearTimeout(timer);}
  }
  async function pushOutbox(){let rows=readOutbox();while(rows.length){const batch=rows.slice(0,100);await syncApi({action:'push',events:batch});const sent=new Set(batch.map(x=>String(x.eventId)));rows=readOutbox().filter(x=>!sent.has(String(x.eventId)));writeOutbox(rows);}}
  function applyRemoteConfig(raw){
    if(!raw||typeof raw!=='object'||!raw.productId)return false;
    const id=String(raw.productId),incoming=normalizeConfig(raw,id),map=readConfigMap(),local=normalizeConfig(map[id],id);
    if(local.updatedAt>incoming.updatedAt)return false;if(local.updatedAt===incoming.updatedAt&&JSON.stringify(local)===JSON.stringify(incoming))return false;
    map[id]=incoming;writeConfigMap(map);return true;
  }
  function applyRemoteMovement(raw){if(!raw||typeof raw!=='object'||!raw.id||!raw.productId)return false;return addMovement(raw,{queue:false});}
  async function pullEvents(){
    let cursor=getCursor(),changed=false;
    for(let page=0;page<50;page++){
      const data=await syncApi({action:'pull',afterSeq:cursor,limit:500,preferSnapshot:false}),events=Array.isArray(data.events)?data.events:[];
      for(const e of events){cursor=Math.max(cursor,num(e.seq,0));const type=String(e.event_type||e.eventType||''),payload=e.payload&&typeof e.payload==='object'?e.payload:{};if(type==='inventory_config_upsert'&&applyRemoteConfig(payload.config))changed=true;if(type==='inventory_movement'&&applyRemoteMovement(payload.movement))changed=true;}
      setCursor(Math.max(cursor,num(data.cursor,cursor)));if(!data.hasMore||!events.length)break;
    }
    return changed;
  }
  async function syncNow(){
    if(syncing||!navigator.onLine||!syncReady())return false;syncing=true;renderPanelEntry();renderStockSheet();
    try{await pushOutbox();const changed=await pullEvents();patchMeta({lastSyncAt:now(),lastError:''});if(changed)reconcileSales();return true;}
    catch(err){patchMeta({lastError:clean(err?.name==='AbortError'?'Tempo esgotado ao sincronizar estoque.':(err?.message||'Falha ao sincronizar estoque.'),260)});return false;}
    finally{syncing=false;renderPanelEntry();renderStockSheet();renderHistorySheet();}
  }

  function commandKey(c){return clean(c?.id||`closed_${num(c?.closedAt,0)}`,180);}
  function commandProductName(c,id){return clean(c?.itemMeta?.[id]?.name||productName(id),160);}
  function reconcileSales(){
    let added=0;const map=readConfigMap(),movementIds=new Set(readMovements().map(m=>String(m.id))),history=(()=>{try{return Array.isArray(state?.history)?state.history:[];}catch{return [];}})();
    history.forEach(c=>{const closedAt=Math.max(0,num(c?.closedAt,0));if(!closedAt)return;Object.entries(c?.items||{}).forEach(([productId,q])=>{const cfg=normalizeConfig(map[String(productId)],productId),sold=qty(Math.max(0,num(q,0)));if(!cfg.enabled||!cfg.trackingFrom||closedAt<cfg.trackingFrom||sold<=0)return;const id=`sale_${commandKey(c)}_${String(productId)}`;if(movementIds.has(id))return;const ok=addMovement({id,productId,productName:commandProductName(c,productId),type:'sale',delta:-sold,reason:'Baixa automática por comanda fechada',commandId:commandKey(c),commandClosedAt:closedAt,createdAt:closedAt,createdBy:'Rota 27'});if(ok){movementIds.add(id);added++;}});});
    if(added){patchMeta({lastSaleReconcileAt:now()});scheduleRefresh();}return added;
  }

  function trackedRows(){return catalog().map(p=>({product:p,info:stockInfo(p.id)}));}
  function summary(){const rows=trackedRows().filter(r=>r.info.config.enabled),low=rows.filter(r=>['low','out','divergence'].includes(r.info.status)),out=rows.filter(r=>['out','divergence'].includes(r.info.status)),committed=rows.reduce((s,r)=>s+r.info.committed,0);return {tracked:rows.length,low:low.length,out:out.length,committed:qty(committed),rows};}
  function filteredRows(){
    let rows=trackedRows();const q=norm(searchText);if(q)rows=rows.filter(r=>norm(`${r.product.name} ${r.product.cat||r.product.category||''}`).includes(q));
    if(filter==='tracked')rows=rows.filter(r=>r.info.config.enabled);if(filter==='low')rows=rows.filter(r=>r.info.config.enabled&&['low','out','divergence'].includes(r.info.status));if(filter==='out')rows=rows.filter(r=>r.info.config.enabled&&['out','divergence'].includes(r.info.status));
    const rank={divergence:0,out:1,low:2,ok:3,off:4};return rows.sort((a,b)=>(rank[a.info.status]??9)-(rank[b.info.status]??9)||String(a.product.name).localeCompare(String(b.product.name),'pt-BR'));
  }

  function ensureStockSheet(){
    if(byId('v021StockWrap'))return;const wrap=document.createElement('div');wrap.id='v021StockWrap';wrap.className='sheet-wrap';
    wrap.innerHTML=`<div class="sheet v021-sheet"><div class="handle"></div><div class="v021-head"><div><h3>Estoque Essencial</h3><p class="desc">Controle opcional, rápido e focado em reposição.</p></div><button type="button" class="v021-x" id="v021StockX" aria-label="Fechar">×</button></div><div id="v021StockStatus"></div><div class="v021-toolbar"><label class="v021-search"><span>⌕</span><input id="v021StockSearch" type="search" placeholder="Buscar produto..." autocomplete="off"></label><div class="v021-filters" id="v021Filters"><button data-filter="all" class="active">Todos</button><button data-filter="tracked">Controlados</button><button data-filter="low">Repor</button><button data-filter="out">Críticos</button></div></div><div id="v021StockMetrics"></div><div id="v021StockList" class="v021-stock-list"></div><div class="v021-actions"><button type="button" id="v021HistoryOpen">Histórico</button><button type="button" id="v021Export">Exportar CSV</button><button type="button" class="primary" id="v021Sync">↻ Sincronizar</button></div></div>`;
    document.body.appendChild(wrap);wrap.addEventListener('click',e=>{if(e.target===wrap)wrap.classList.remove('open');});byId('v021StockX').addEventListener('click',()=>wrap.classList.remove('open'));
    byId('v021StockSearch').addEventListener('input',e=>{searchText=e.target.value||'';renderStockSheet();});byId('v021Filters').querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{filter=btn.dataset.filter||'all';byId('v021Filters').querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('active',x===btn));renderStockSheet();}));
    byId('v021HistoryOpen').addEventListener('click',openHistorySheet);byId('v021Export').addEventListener('click',exportCsv);byId('v021Sync').addEventListener('click',async()=>{reconcileSales();await syncNow();renderStockSheet();});
  }

  function ensureConfigSheet(){
    if(byId('v021ConfigWrap'))return;const wrap=document.createElement('div');wrap.id='v021ConfigWrap';wrap.className='sheet-wrap';
    wrap.innerHTML=`<div class="sheet v021-small-sheet"><div class="handle"></div><div class="v021-head"><div><h3>Configurar estoque</h3><p class="desc" id="v021ConfigProduct"></p></div><button type="button" class="v021-x" id="v021ConfigX">×</button></div><input type="hidden" id="v021ConfigProductId"><label class="v021-switch-row"><span><strong>Controlar estoque deste produto</strong><small>A baixa automática ocorre quando a comanda é fechada.</small></span><input type="checkbox" id="v021ConfigEnabled"></label><div class="v021-form-grid"><label><span>Estoque mínimo</span><input id="v021ConfigMin" type="number" min="0" step="1" inputmode="decimal"></label><label id="v021CountedLabel"><span>Estoque contado agora</span><input id="v021ConfigCounted" type="number" min="0" step="1" inputmode="decimal"><small>Usado ao ativar ou reativar o controle.</small></label></div><div id="v021ConfigHint" class="v021-note"></div><div class="sheet-actions"><button type="button" class="secondary" id="v021ConfigCancel">Cancelar</button><button type="button" class="primary" id="v021ConfigSave">Salvar</button></div></div>`;
    document.body.appendChild(wrap);const close=()=>wrap.classList.remove('open');byId('v021ConfigX').addEventListener('click',close);byId('v021ConfigCancel').addEventListener('click',close);byId('v021ConfigSave').addEventListener('click',saveConfigFromSheet);byId('v021ConfigEnabled').addEventListener('change',renderConfigActivationState);
  }

  function ensureMovementSheet(){
    if(byId('v021MoveWrap'))return;const wrap=document.createElement('div');wrap.id='v021MoveWrap';wrap.className='sheet-wrap';
    wrap.innerHTML=`<div class="sheet v021-small-sheet"><div class="handle"></div><div class="v021-head"><div><h3>Movimentar estoque</h3><p class="desc" id="v021MoveProduct"></p></div><button type="button" class="v021-x" id="v021MoveX">×</button></div><input type="hidden" id="v021MoveProductId"><div class="v021-move-balance" id="v021MoveBalance"></div><div class="v021-type-grid" id="v021MoveTypes"><button data-type="entry" class="active">Entrada</button><button data-type="loss">Perda</button><button data-type="internal">Consumo interno</button><button data-type="adjustment">Ajuste</button></div><label class="v021-field"><span id="v021MoveQtyLabel">Quantidade</span><input id="v021MoveQty" type="number" min="0" step="1" inputmode="decimal"></label><label class="v021-field"><span>Observação</span><input id="v021MoveReason" type="text" maxlength="180" placeholder="Opcional"></label><div id="v021MoveHint" class="v021-note"></div><div class="sheet-actions"><button type="button" class="secondary" id="v021MoveCancel">Cancelar</button><button type="button" class="primary" id="v021MoveSave">Registrar</button></div></div>`;
    document.body.appendChild(wrap);const close=()=>wrap.classList.remove('open');byId('v021MoveX').addEventListener('click',close);byId('v021MoveCancel').addEventListener('click',close);byId('v021MoveTypes').querySelectorAll('[data-type]').forEach(btn=>btn.addEventListener('click',()=>{byId('v021MoveTypes').querySelectorAll('[data-type]').forEach(x=>x.classList.toggle('active',x===btn));renderMoveType();}));byId('v021MoveSave').addEventListener('click',saveMovementFromSheet);
  }

  function ensureHistorySheet(){
    if(byId('v021HistoryWrap'))return;const wrap=document.createElement('div');wrap.id='v021HistoryWrap';wrap.className='sheet-wrap';
    wrap.innerHTML=`<div class="sheet v021-sheet"><div class="handle"></div><div class="v021-head"><div><h3>Histórico do estoque</h3><p class="desc">Entradas, ajustes, perdas, consumo e baixas por venda.</p></div><button type="button" class="v021-x" id="v021HistoryX">×</button></div><div id="v021HistoryStatus"></div><div id="v021HistoryList" class="v021-history-list"></div></div>`;
    document.body.appendChild(wrap);byId('v021HistoryX').addEventListener('click',()=>wrap.classList.remove('open'));wrap.addEventListener('click',e=>{if(e.target===wrap)wrap.classList.remove('open');});
  }

  function openConfig(productId){
    ensureConfigSheet();const p=productById(productId);if(!p)return;const c=configFor(productId),info=stockInfo(productId);
    byId('v021ConfigProductId').value=String(productId);byId('v021ConfigProduct').textContent=p.name;byId('v021ConfigEnabled').checked=c.enabled;byId('v021ConfigMin').value=String(c.minQty||0);byId('v021ConfigCounted').value=String(Math.max(0,info.current));byId('v021ConfigHint').textContent=c.enabled?`Saldo atual: ${fmtQty(info.current)}. Para corrigir o saldo use “Movimentar → Ajuste”.`:'Ao ativar, informe a quantidade realmente contada agora. Vendas anteriores não serão baixadas retroativamente.';renderConfigActivationState();byId('v021ConfigWrap').classList.add('open');
  }
  function renderConfigActivationState(){const id=byId('v021ConfigProductId')?.value,c=id?configFor(id):null,enabling=byId('v021ConfigEnabled')?.checked===true,label=byId('v021CountedLabel');if(label)label.style.display=(!c?.enabled&&enabling)?'flex':'none';}
  function saveConfigFromSheet(){
    const id=byId('v021ConfigProductId').value,p=productById(id);if(!p)return;const old=configFor(id),enabled=byId('v021ConfigEnabled').checked,minQty=Math.max(0,qty(byId('v021ConfigMin').value));
    if(enabled&&!old.enabled){const counted=Math.max(0,qty(byId('v021ConfigCounted').value));if(old.updatedAt===0){saveConfig(id,{enabled:true,baseQty:counted,minQty,trackingFrom:now()});}else{saveConfig(id,{enabled:true,minQty,trackingFrom:now()});const current=currentStock(id),delta=qty(counted-current);if(delta!==0)addMovement({productId:id,productName:p.name,type:'adjustment',delta,reason:'Recontagem ao reativar controle'});}}
    else{saveConfig(id,{enabled,minQty,trackingFrom:old.trackingFrom});}
    byId('v021ConfigWrap').classList.remove('open');reconcileSales();renderStockSheet();renderPanelEntry();toast(enabled?'Controle de estoque atualizado.':'Controle de estoque desativado para este produto.');
  }

  function openMovement(productId){
    ensureMovementSheet();const p=productById(productId),info=stockInfo(productId);if(!p||!info.config.enabled){toast('Ative o controle de estoque deste produto primeiro.');return;}
    byId('v021MoveProductId').value=String(productId);byId('v021MoveProduct').textContent=p.name;byId('v021MoveBalance').innerHTML=`<div><small>Estoque atual</small><strong>${esc(fmtQty(info.current))}</strong></div><div><small>Disponível estimado</small><strong>${esc(fmtQty(info.projected))}</strong></div>`;byId('v021MoveQty').value='';byId('v021MoveReason').value='';byId('v021MoveTypes').querySelectorAll('[data-type]').forEach((x,i)=>x.classList.toggle('active',i===0));renderMoveType();byId('v021MoveWrap').classList.add('open');
  }
  function selectedMoveType(){return byId('v021MoveTypes')?.querySelector('[data-type].active')?.dataset.type||'entry';}
  function renderMoveType(){const type=selectedMoveType(),id=byId('v021MoveProductId')?.value,info=id?stockInfo(id):null,label=byId('v021MoveQtyLabel'),hint=byId('v021MoveHint');if(label)label.textContent=type==='adjustment'?'Novo saldo contado':'Quantidade';if(hint)hint.textContent=type==='entry'?'Entrada soma ao estoque atual.':type==='loss'?'Perda reduz o estoque e não pode deixar o saldo negativo.':type==='internal'?'Consumo interno reduz o estoque e fica auditado.':`Informe o saldo físico contado. Atual: ${fmtQty(info?.current||0)}.`;}
  function saveMovementFromSheet(){
    const id=byId('v021MoveProductId').value,p=productById(id),info=stockInfo(id);if(!p||!info.config.enabled)return;const type=selectedMoveType(),input=Math.max(0,qty(byId('v021MoveQty').value)),reason=clean(byId('v021MoveReason').value,180);let delta=0;
    if(type==='entry'){if(input<=0){toast('Informe uma quantidade maior que zero.');return;}delta=input;}
    if(type==='loss'||type==='internal'){if(input<=0){toast('Informe uma quantidade maior que zero.');return;}if(input>info.current){toast(`Movimento bloqueado: saldo atual é ${fmtQty(info.current)}.`);return;}delta=-input;}
    if(type==='adjustment'){delta=qty(input-info.current);if(delta===0){toast('O saldo informado já é o saldo atual.');return;}}
    const reasonText=reason||({entry:'Entrada manual',loss:'Perda registrada',internal:'Consumo interno',adjustment:'Ajuste por contagem'})[type];addMovement({productId:id,productName:p.name,type,delta,reason:reasonText});byId('v021MoveWrap').classList.remove('open');renderStockSheet();renderPanelEntry();toast('Movimento de estoque registrado.');
  }

  function renderStockSheet(){
    const list=byId('v021StockList'),status=byId('v021StockStatus'),metrics=byId('v021StockMetrics');if(!list||!status||!metrics)return;reconcileSales();const s=summary(),rows=filteredRows(),meta=readMeta(),outbox=readOutbox();
    const syncText=syncing?'Sincronizando estoque…':outbox.length?`${outbox.length} alteração${outbox.length===1?'':'ões'} aguardando sincronização.`:syncReady()&&meta.lastSyncAt?`Sincronizado • ${new Date(meta.lastSyncAt).toLocaleString('pt-BR')}`:'Estoque local neste aparelho.';
    status.className=`v021-status ${meta.lastError?'warn':(outbox.length?'warn':'ok')}`;status.textContent=meta.lastError?`Sync: ${meta.lastError}`:syncText;metrics.className='v021-metrics';metrics.innerHTML=`<div><small>Controlados</small><strong>${s.tracked}</strong></div><div><small>Precisam atenção</small><strong>${s.low}</strong></div><div><small>Críticos</small><strong>${s.out}</strong></div><div><small>Reservado em comandas</small><strong>${fmtQty(s.committed)}</strong></div>`;
    list.innerHTML=rows.length?rows.map(({product,info})=>{const [cls,label]=statusMeta(info.status),c=info.config,secondary=c.enabled?`Atual ${fmtQty(info.current)} • Disponível ${fmtQty(info.projected)} • Mín. ${fmtQty(c.minQty)}${info.committed?` • ${fmtQty(info.committed)} em aberto`:''}`:'Controle opcional desativado';return `<article class="v021-stock-row ${cls}"><div class="v021-stock-copy"><div class="v021-stock-title"><strong>${esc(product.name)}</strong><span class="v021-pill ${cls}">${esc(label)}</span></div><small>${esc(secondary)}</small></div><div class="v021-stock-buttons">${c.enabled?`<button type="button" data-move="${esc(product.id)}">Movimentar</button>`:''}<button type="button" data-config="${esc(product.id)}">${c.enabled?'Configurar':'Ativar'}</button></div></article>`;}).join(''):'<div class="v021-empty">Nenhum produto encontrado neste filtro.</div>';
    list.querySelectorAll('[data-config]').forEach(b=>b.addEventListener('click',()=>openConfig(b.dataset.config)));list.querySelectorAll('[data-move]').forEach(b=>b.addEventListener('click',()=>openMovement(b.dataset.move)));const syncBtn=byId('v021Sync');if(syncBtn){syncBtn.disabled=syncing||!syncReady()||!navigator.onLine;syncBtn.textContent=syncing?'Sincronizando…':'↻ Sincronizar';}
  }

  function renderPanelEntry(){
    const screen=byId('screenPanel');if(!screen)return;let entry=byId('v021InventoryEntry');if(!entry){entry=document.createElement('section');entry.id='v021InventoryEntry';entry.className='v021-panel-entry';const manager=byId('v020ManagerEntry'),head=screen.querySelector('.v15d4-head');if(manager)manager.insertAdjacentElement('afterend',entry);else if(head)head.insertAdjacentElement('afterend',entry);else screen.prepend(entry);}
    const s=summary();let stateText='Estoque ainda não ativado';if(s.tracked&&s.low===0)stateText=`${s.tracked} produto${s.tracked===1?'':'s'} controlado${s.tracked===1?'':'s'} • tudo saudável`;if(s.low>0)stateText=`${s.low} produto${s.low===1?' precisa':'s precisam'} de atenção`;entry.className=`v021-panel-entry${s.low?' attention':''}`;entry.innerHTML=`<div class="v021-panel-entry-head"><div><strong>Estoque Essencial</strong><small>${esc(stateText)}${s.committed?` • ${fmtQty(s.committed)} un. comprometidas em comandas abertas`:''}</small></div><button type="button">${s.low?'Ver reposição':'Abrir estoque'}</button></div>`;entry.querySelector('button')?.addEventListener('click',()=>openStock(s.low?'low':'all'));
  }

  function openStock(nextFilter='all'){ensureStockSheet();filter=nextFilter;searchText='';const input=byId('v021StockSearch');if(input)input.value='';byId('v021Filters')?.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('active',x.dataset.filter===filter));renderStockSheet();byId('v021StockWrap').classList.add('open');if(navigator.onLine&&syncReady())syncNow();}

  function movementTypeLabel(type){return ({entry:'Entrada',loss:'Perda',internal:'Consumo interno',adjustment:'Ajuste',sale:'Venda'})[type]||'Movimento';}
  function renderHistorySheet(){const list=byId('v021HistoryList'),status=byId('v021HistoryStatus');if(!list||!status)return;const all=readMovements(),rows=all.slice().sort((a,b)=>b.createdAt-a.createdAt).slice(0,400);status.className='v021-status';status.textContent=`${all.length} movimento${all.length===1?'':'s'} registrado${all.length===1?'':'s'} neste aparelho.`;list.innerHTML=rows.length?rows.map(m=>`<article class="v021-history-row"><div><strong>${esc(m.productName||productName(m.productId))}</strong><small>${esc(movementTypeLabel(m.type))} • ${esc(new Date(m.createdAt).toLocaleString('pt-BR'))}${m.reason?` • ${esc(m.reason)}`:''}</small></div><b class="${m.delta>0?'plus':'minus'}">${m.delta>0?'+':''}${esc(fmtQty(m.delta))}</b></article>`).join(''):'<div class="v021-empty">Ainda não há movimentações de estoque.</div>';}
  function openHistorySheet(){ensureHistorySheet();renderHistorySheet();byId('v021HistoryWrap').classList.add('open');}

  function csvCell(v){const s=String(v??'');return /[;"\r\n]/.test(s)?`"${s.replace(/"/g,'""')}"`:s;}
  function downloadText(filename,content){const blob=new Blob([content],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  function exportCsv(){const rows=trackedRows().filter(r=>r.info.config.enabled);if(!rows.length){toast('Ative o controle de pelo menos um produto antes de exportar.');return;}const lines=['Produto;Estoque Atual;Em Comandas Abertas;Disponivel Estimado;Estoque Minimo;Status'];rows.forEach(r=>lines.push([r.product.name,r.info.current,r.info.committed,r.info.projected,r.info.config.minQty,statusMeta(r.info.status)[1]].map(csvCell).join(';')));const d=new Date(),date=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;downloadText(`rota27-estoque-${date}.csv`,'\uFEFF'+lines.join('\r\n'));toast('CSV de estoque gerado.');}

  function injectHelp(){
    const overlay=byId('r27HelpOverlay'),content=overlay?.querySelector('.r27-help-content');if(!overlay||!content)return false;
    if(!byId('r27-help-estoque')){const section=document.createElement('details');section.id='r27-help-estoque';section.className='r27-help-section';section.innerHTML=`<summary><span class="r27-help-section-icon">▤</span><span><strong>Estoque Essencial</strong><small>Saldo, disponível estimado, reposição e movimentos.</small></span></summary><div class="r27-help-section-body"><div class="r27-help-lead">No <b>Painel</b>, abra <b>Estoque Essencial</b>. O controle é opcional por produto: você escolhe o que realmente precisa acompanhar.</div><ol class="r27-help-steps"><li><span>1</span><div><b>Ative e conte</b><br>Informe o estoque contado e o mínimo desejado.</div></li><li><span>2</span><div><b>Venda normalmente</b><br>Itens em comandas abertas reduzem o <b>Disponível estimado</b>. A baixa definitiva acontece somente quando a comanda é fechada.</div></li><li><span>3</span><div><b>Movimente</b><br>Use Entrada, Perda, Consumo interno ou Ajuste. Saídas manuais que deixariam saldo negativo são bloqueadas.</div></li><li><span>4</span><div><b>Reponha</b><br>Estados saudáveis ficam silenciosos. O Painel chama atenção somente para estoque baixo, zerando ou divergente.</div></li></ol><div class="r27-help-tip"><b>Multidispositivo:</b> configurações e movimentos usam eventos idempotentes. Se estiver offline, tudo fica salvo localmente e sincroniza quando a conexão voltar.</div></div>`;content.appendChild(section);}
    const footer=overlay.querySelector('.r27-help-footer span');if(footer&&ownVersion())footer.textContent='Ajuda v4.5 • v0.21.0';return true;
  }

  function applyVersion(){if(!ownVersion())return;const badge=byId('v14VersionBadge');if(badge&&badge.textContent!==LABEL)badge.textContent=LABEL;if(document.title!==TITLE)document.title=TITLE;try{window.ROTA27_RELEASE_VERSION=VERSION;window.ROTA27_SYNC_DEV_VERSION=VERSION;}catch{}}
  function protectVersion(){applyVersion();if(!ownVersion())return;const badge=byId('v14VersionBadge'),title=document.querySelector('title');if(badge&&!badgeObserver){badgeObserver=new MutationObserver(applyVersion);badgeObserver.observe(badge,{childList:true,characterData:true,subtree:true});}if(title&&!titleObserver){titleObserver=new MutationObserver(applyVersion);titleObserver.observe(title,{childList:true,characterData:true,subtree:true});}}

  function wrapSave(){if(baseSave||typeof save!=='function')return;baseSave=save;const patched=function(){const result=baseSave.apply(this,arguments);scheduleReconcile(60);return result;};try{save=patched;}catch{}try{window.save=patched;}catch{}}
  function scheduleReconcile(delay=120){clearTimeout(reconcileTimer);reconcileTimer=setTimeout(()=>{reconcileSales();renderPanelEntry();if(byId('v021StockWrap')?.classList.contains('open'))renderStockSheet();},delay);}
  function scheduleRefresh(){setTimeout(()=>{renderPanelEntry();if(byId('v021StockWrap')?.classList.contains('open'))renderStockSheet();if(byId('v021HistoryWrap')?.classList.contains('open'))renderHistorySheet();},40);}

  function start(){
    if(!ownVersion())return;protectVersion();wrapSave();ensureStockSheet();ensureConfigSheet();ensureMovementSheet();ensureHistorySheet();reconcileSales();setTimeout(renderPanelEntry,120);setTimeout(renderPanelEntry,650);setTimeout(injectHelp,600);
    window.addEventListener('online',()=>{syncNow();scheduleRefresh();});window.addEventListener('offline',scheduleRefresh);window.addEventListener('storage',()=>scheduleReconcile(80));window.addEventListener('focus',()=>{scheduleReconcile(80);if(navigator.onLine)syncNow();});window.addEventListener('rota27:v017-domain-updated',()=>scheduleReconcile(80));window.addEventListener('rota27:v019-turn-updated',()=>scheduleReconcile(80));document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){scheduleReconcile(80);if(navigator.onLine)syncNow();}});
    setInterval(()=>{wrapSave();reconcileSales();renderPanelEntry();injectHelp();if(byId('v021StockWrap')?.classList.contains('open'))renderStockSheet();},5000);setInterval(()=>{if(navigator.onLine)syncNow();},20000);if(navigator.onLine)syncNow();
    window.Rota27V021={version:VERSION,openStock,openReplenishment:()=>openStock('low'),reconcileSales,syncInventory:syncNow,getSummary:()=>clone(summary()),getStock:(id)=>clone(stockInfo(id)),getMovements:()=>clone(readMovements())};console.info('[Rota27] v0.21.0 Estoque Essencial carregado.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
