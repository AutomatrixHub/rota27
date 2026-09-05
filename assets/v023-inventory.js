/* Rota 27 v0.23.0 — Inventário & Conferência */
(function(){
  'use strict';

  const VERSION='0.23.0';
  const INV_KEY='rota27_v023_inventories_v1';
  const OUTBOX_KEY='rota27_v023_inventory_outbox_v1';
  const CURSOR_KEY='rota27_v023_inventory_cursor_v1';
  const META_KEY='rota27_v023_inventory_meta_v1';
  const SYNC_KEY='rota27_sync_config_v1';
  const STOCK_MOV_KEY='rota27_v021_stock_mov_v1';
  const STOCK_OUTBOX_KEY='rota27_v021_stock_outbox_v1';
  const MAX_OUTBOX=1200,MAX_STOCK_MOV=6000,MAX_STOCK_OUTBOX=900;

  let activeInventoryId=null;
  let activeProductId=null;
  let mode='home';
  let search='';
  let category='all';
  let itemFilter='all';
  let syncing=false;
  let wrappedStock=false;

  function byId(id){return document.getElementById(id);}
  function clone(v){return JSON.parse(JSON.stringify(v==null?null:v));}
  function esc(v){if(typeof escapeHtml==='function')return escapeHtml(String(v??''));return String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[ch]));}
  function clean(v,max=180){return String(v??'').replace(/[\u0000-\u001f\u007f]/g,' ').trim().replace(/\s+/g,' ').slice(0,max);}
  function readJson(key,fallback){try{const x=JSON.parse(localStorage.getItem(key)||'null');return x==null?fallback:x;}catch{return fallback;}}
  function writeJson(key,v){localStorage.setItem(key,JSON.stringify(v));}
  function round3(v){return Math.round(Number(v||0)*1000)/1000;}
  function fmtQty(v){return Number(v||0).toLocaleString('pt-BR',{maximumFractionDigits:3});}
  function fmtDate(ts){const n=Number(ts||0);if(!n)return '—';return new Date(n).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',year:'2-digit',hour:'2-digit',minute:'2-digit'});}
  function uid(prefix='inv'){return globalThis.crypto?.randomUUID?`${prefix}_${crypto.randomUUID()}`:`${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,10)}`;}
  function toast(msg){try{if(typeof showToast==='function')showToast(msg,false);else console.info('[Rota27]',msg);}catch{}}
  function catalog(){return Array.isArray(window.state?.catalog)?window.state.catalog:[];}
  function configs(){try{return window.Rota27V021?.getConfigs?.()||{};}catch{return {};}}
  function stockMovements(){try{return window.Rota27V021?.getMovements?.()||[];}catch{const x=readJson(STOCK_MOV_KEY,[]);return Array.isArray(x)?x:[];}}
  function currentQty(id){try{return round3(window.Rota27V021?.currentQty?.(id)||0);}catch{return 0;}}
  function controlledProducts(){const cfg=configs();return catalog().filter(p=>cfg[p.id]?.enabled===true).sort((a,b)=>String(a.cat||'').localeCompare(String(b.cat||''),'pt-BR')||String(a.name||'').localeCompare(String(b.name||''),'pt-BR'));}
  function device(){const c=syncConfig();return {id:clean(c.deviceId||'local',120)||'local',name:clean(c.deviceName||'Este aparelho',80)||'Este aparelho',storeId:clean(c.storeId||'rota27-bodega',80)||'rota27-bodega'};}
  function syncConfig(){const x=readJson(SYNC_KEY,{});return x&&typeof x==='object'&&!Array.isArray(x)?x:{};}
  function syncReady(){const c=syncConfig();return c.enabled===true&&c.initialized===true&&/^https:\/\/.+\/functions\/v1\/rota27-sync\/?$/i.test(String(c.functionUrl||''))&&String(c.deviceToken||'').length>=16&&!!c.deviceId;}
  function meta(){const x=readJson(META_KEY,{});return x&&typeof x==='object'&&!Array.isArray(x)?x:{};}
  function patchMeta(p){writeJson(META_KEY,{...meta(),...p});}

  function inventories(){const x=readJson(INV_KEY,[]);return Array.isArray(x)?x:[];}
  function saveInventories(rows){writeJson(INV_KEY,Array.isArray(rows)?rows:[]);}
  function inventoryById(id){return inventories().find(x=>String(x.id)===String(id))||null;}
  function openInventorySession(){return inventories().filter(x=>x.status==='open').sort((a,b)=>Number(b.updatedAt||0)-Number(a.updatedAt||0))[0]||null;}
  function finalizedInventories(){return inventories().filter(x=>x.status==='finalized').sort((a,b)=>Number(b.finalizedAt||b.updatedAt||0)-Number(a.finalizedAt||a.updatedAt||0));}
  function lastFinalized(){return finalizedInventories()[0]||null;}

  function mergeItems(localItems,remoteItems){
    const map=new Map();
    [...(Array.isArray(localItems)?localItems:[]),...(Array.isArray(remoteItems)?remoteItems:[])].forEach(item=>{
      if(!item?.productId)return;
      const key=String(item.productId),prev=map.get(key);
      if(!prev||Number(item.updatedAt||0)>=Number(prev.updatedAt||0))map.set(key,clone(item));
    });
    return [...map.values()];
  }
  function upsertInventory(next,queue=true){
    if(!next?.id)return false;
    const rows=inventories(),i=rows.findIndex(x=>String(x.id)===String(next.id));
    let merged=clone(next);
    if(i>=0){
      const old=rows[i];
      merged={...(Number(next.updatedAt||0)>=Number(old.updatedAt||0)?old:next),...(Number(next.updatedAt||0)>=Number(old.updatedAt||0)?next:old)};
      merged.items=mergeItems(old.items,next.items);
      if(old.status==='finalized'||next.status==='finalized'){
        const fin=Number(next.finalizedAt||0)>=Number(old.finalizedAt||0)?next:old;
        merged.status='finalized';merged.finalizedAt=fin.finalizedAt;merged.finalizedDeviceId=fin.finalizedDeviceId;merged.finalizedDeviceName=fin.finalizedDeviceName;merged.summary=clone(fin.summary||merged.summary||{});
      }
      rows[i]=merged;
    }else rows.push(merged);
    saveInventories(rows);
    if(queue)queueInventoryEvent(merged);
    refresh();
    return true;
  }

  function outbox(){const x=readJson(OUTBOX_KEY,[]);return Array.isArray(x)?x:[];}
  function saveOutbox(rows){writeJson(OUTBOX_KEY,(Array.isArray(rows)?rows:[]).slice(-MAX_OUTBOX));}
  function queueInventoryEvent(inv){
    if(!syncReady()||!inv?.id)return;
    const d=device(),event={eventId:`inventory_${inv.id}_${Number(inv.updatedAt||Date.now())}`,eventType:'inventory_upsert',entityId:String(inv.id),payload:{inventory:clone(inv)},deviceId:d.id,createdAt:new Date().toISOString(),appVersion:VERSION};
    const rows=outbox().filter(x=>String(x.eventId)!==String(event.eventId));rows.push(event);saveOutbox(rows);
    if(navigator.onLine)setTimeout(()=>syncNow(),120);
  }
  async function api(body){
    const c=syncConfig();if(!syncReady())throw new Error('Sincronização não configurada neste aparelho.');
    const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),12000);
    try{
      const r=await fetch(String(c.functionUrl).replace(/\/+$/,''),{method:'POST',headers:{'content-type':'application/json','x-rota27-device-token':String(c.deviceToken)},body:JSON.stringify({...body,deviceId:c.deviceId,deviceName:c.deviceName||'Aparelho',storeId:c.storeId||'rota27-bodega',appVersion:VERSION}),signal:ctrl.signal});
      const data=await r.json().catch(()=>({}));if(!r.ok||data.ok!==true)throw new Error(data.error||`HTTP ${r.status}`);return data;
    }finally{clearTimeout(timer);}
  }
  function backendReadyVersion(v){const m=String(v||'').match(/v(\d+)\.(\d+)\.(\d+)/i);if(!m)return false;const major=Number(m[1]),minor=Number(m[2]);return major>0||(major===0&&minor>=23);}
  async function ensureBackendReady(force=false){
    const m=meta(),now=Date.now();if(!force&&Number(m.backendCheckedAt||0)>now-60000)return m.backendReady===true;
    try{const data=await api({action:'status',afterSeq:Number(localStorage.getItem(CURSOR_KEY)||0)});const ready=backendReadyVersion(data.edgeVersion);patchMeta({backendCheckedAt:now,backendReady:ready,backendVersion:clean(data.edgeVersion||'',80),lastError:''});return ready;}
    catch(err){patchMeta({backendCheckedAt:now,backendReady:false,lastError:clean(err?.name==='AbortError'?'Tempo esgotado ao verificar sincronização do inventário.':(err?.message||'Falha ao verificar sincronização.'),250)});return false;}
  }
  function applyRemote(e){if(String(e.event_type||e.eventType||'')!=='inventory_upsert')return false;const inv=e.payload?.inventory;if(!inv?.id)return false;return upsertInventory(inv,false);}
  async function syncNow(force=false){
    if(syncing||!syncReady()||!navigator.onLine)return false;syncing=true;
    try{
      if(!(await ensureBackendReady(force)))return false;
      let rows=outbox();
      while(rows.length){const batch=rows.slice(0,80);await api({action:'push',events:batch});const sent=new Set(batch.map(x=>String(x.eventId)));rows=outbox().filter(x=>!sent.has(String(x.eventId)));saveOutbox(rows);}
      let cursor=Math.max(0,Number(localStorage.getItem(CURSOR_KEY)||0)),changed=false;
      for(let page=0;page<30;page++){
        const data=await api({action:'pull',afterSeq:cursor,limit:500,preferSnapshot:false}),ev=Array.isArray(data.events)?data.events:[];
        ev.forEach(e=>{cursor=Math.max(cursor,Number(e.seq||0));if(applyRemote(e))changed=true;});
        cursor=Math.max(cursor,Number(data.cursor||cursor));localStorage.setItem(CURSOR_KEY,String(cursor));if(!data.hasMore||!ev.length)break;
      }
      patchMeta({lastSyncAt:Date.now(),lastError:''});if(changed)refresh();return true;
    }catch(err){patchMeta({lastError:clean(err?.name==='AbortError'?'Tempo esgotado ao sincronizar inventário.':(err?.message||'Falha de sincronização do inventário.'),250)});return false;}
    finally{syncing=false;renderNotice();}
  }

  function orderCode(){const d=new Date();return `INV-${String(d.getFullYear()).slice(-2)}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}-${String(d.getHours()).padStart(2,'0')}${String(d.getMinutes()).padStart(2,'0')}`;}
  function counted(item){return item?.countedQty!==null&&item?.countedQty!==undefined&&item?.countedQty!==''&&Number.isFinite(Number(item.countedQty));}
  function diff(item){return counted(item)?round3(Number(item.countedQty)-Number(item.expectedQty||0)):null;}
  function sessionStats(inv){
    const items=Array.isArray(inv?.items)?inv.items:[],done=items.filter(counted),div=done.filter(i=>diff(i)!==0),short=div.filter(i=>diff(i)<0),surplus=div.filter(i=>diff(i)>0),same=done.filter(i=>diff(i)===0);
    return {total:items.length,done:done.length,pending:items.length-done.length,divergent:div.length,shortages:short.length,surpluses:surplus.length,same:same.length,shortUnits:round3(short.reduce((s,i)=>s+Math.abs(diff(i)),0)),surplusUnits:round3(surplus.reduce((s,i)=>s+diff(i),0))};
  }
  function movementConflicts(inv){
    const ids=new Set((inv?.items||[]).map(i=>String(i.productId))),start=Number(inv?.createdAt||0),prefix=`inventory_adjust_${inv?.id}_`;
    return stockMovements().filter(m=>ids.has(String(m.productId))&&Number(m.createdAt||0)>start&&!String(m.id||'').startsWith(prefix));
  }

  function ensureSheet(){
    if(byId('v023InventoryWrap'))return;
    const wrap=document.createElement('div');wrap.id='v023InventoryWrap';wrap.className='sheet-wrap';
    wrap.innerHTML=`<div class="sheet v023-sheet"><div class="handle"></div><div class="v023-head"><div><div class="v023-kicker">v0.23.0</div><h3>Inventário & Conferência</h3><p class="desc">Conte o físico, compare com o sistema e ajuste somente depois de revisar.</p></div><button id="v023Close" class="v023-x" type="button">×</button></div><div id="v023Notice"></div><div id="v023InventoryBody"></div></div>`;
    document.body.appendChild(wrap);wrap.addEventListener('click',e=>{if(e.target===wrap)wrap.classList.remove('open');});byId('v023Close').onclick=()=>wrap.classList.remove('open');
  }
  function renderNotice(){
    const el=byId('v023Notice');if(!el)return;const m=meta();
    if(!navigator.onLine){el.innerHTML='<div class="v023-note warn">Offline: a conferência continua salva neste aparelho.</div>';return;}
    if(m.lastError){el.innerHTML=`<div class="v023-note danger">Sincronização do inventário: ${esc(m.lastError)}</div>`;return;}
    if(syncReady()&&m.backendReady!==true){el.innerHTML='<div class="v023-note neutral">A sincronização multidispositivo do Inventário ainda não foi ativada no backend da candidata. Contagem e ajustes locais continuam normais.</div>';return;}
    el.innerHTML='';
  }
  function openInventory(target='home'){
    ensureSheet();mode=target;const open=openInventorySession();if((target==='count'||target==='summary')&&open){activeInventoryId=open.id;if(!activeProductId)activeProductId=open.items.find(i=>!counted(i))?.productId||open.items[0]?.productId||null;}
    render();byId('v023InventoryWrap').classList.add('open');
  }

  function renderHome(){
    const body=byId('v023InventoryBody'),open=openInventorySession(),last=lastFinalized(),controlled=controlledProducts().length,lastStats=last?sessionStats(last):null;
    body.innerHTML=`<div class="v023-metrics"><div><small>Controlados</small><strong>${controlled}</strong><span>produtos para conferir</span></div><div><small>Em andamento</small><strong>${open?'1':'0'}</strong><span>${open?`${sessionStats(open).done}/${sessionStats(open).total} conferidos`:'nenhuma conferência'}</span></div><div><small>Última conferência</small><strong>${last?fmtDate(last.finalizedAt):'—'}</strong><span>${last?last.code:'ainda não realizada'}</span></div><div><small>Divergências</small><strong>${lastStats?lastStats.divergent:'—'}</strong><span>${lastStats?`${lastStats.shortages} faltas • ${lastStats.surpluses} sobras`:'na última conferência'}</span></div></div>
      ${open?`<section class="v023-current"><div><small>CONFERÊNCIA EM ANDAMENTO</small><h4>${esc(open.code)}</h4><p>Iniciada em ${fmtDate(open.createdAt)} • ${sessionStats(open).done} de ${sessionStats(open).total} produtos contados.</p><div class="v023-progress"><span style="width:${sessionStats(open).total?sessionStats(open).done/sessionStats(open).total*100:0}%"></span></div></div><button id="v023Continue" class="primary">Continuar conferência</button></section>`:''}
      <div class="v023-home-actions"><button id="v023Start" class="primary" ${open?'disabled':''}>＋ Iniciar conferência</button><button id="v023History">◷ Histórico</button><button id="v023BackStock">← Estoque Essencial</button></div>
      <section class="v023-info-card"><strong>Como funciona</strong><p>O saldo não muda durante a contagem. Ao finalizar, somente as diferenças confirmadas viram movimentos de Ajuste de inventário no Estoque Essencial.</p></section>
      ${last?`<section class="v023-last"><div><small>ÚLTIMA CONFERÊNCIA</small><h4>${esc(last.code)}</h4><p>${lastStats.done} produtos • ${lastStats.same} corretos • ${lastStats.divergent} divergências</p></div><button id="v023LastDetail">Ver detalhes</button></section>`:''}`;
    byId('v023Start')?.addEventListener('click',startInventory);byId('v023Continue')?.addEventListener('click',()=>openInventory('count'));byId('v023History')?.addEventListener('click',()=>{mode='history';render();});
    byId('v023BackStock')?.addEventListener('click',()=>{byId('v023InventoryWrap').classList.remove('open');setTimeout(()=>window.Rota27V021?.openStock?.(),0);});
    byId('v023LastDetail')?.addEventListener('click',()=>{activeInventoryId=last.id;mode='detail';render();});
  }

  function startInventory(){
    if(openInventorySession()){toast('Já existe uma conferência em andamento.');openInventory('count');return;}
    const products=controlledProducts();if(!products.length){toast('Ative o controle de estoque em pelo menos um produto antes de iniciar o inventário.');return;}
    const d=device(),now=Date.now(),inv={id:uid('inventory'),code:orderCode(),status:'open',createdAt:now,updatedAt:now,createdDeviceId:d.id,createdDeviceName:d.name,finalizedAt:null,items:products.map(p=>({productId:String(p.id),productName:clean(p.name,180),category:clean(p.cat||'Outros',80),expectedQty:currentQty(p.id),countedQty:null,note:'',updatedAt:0})),appVersion:VERSION};
    upsertInventory(inv,true);activeInventoryId=inv.id;activeProductId=inv.items[0]?.productId||null;mode='count';render();toast('Conferência iniciada. O estoque não será alterado até a finalização.');
  }

  function activeInventory(){return inventoryById(activeInventoryId)||openInventorySession();}
  function filteredItems(inv){
    const q=search.trim().toLocaleLowerCase('pt-BR');return (inv?.items||[]).filter(i=>{
      if(category!=='all'&&String(i.category)!==category)return false;
      if(q&&!`${i.productName} ${i.category}`.toLocaleLowerCase('pt-BR').includes(q))return false;
      if(itemFilter==='pending'&&counted(i))return false;
      if(itemFilter==='divergent'&&(!counted(i)||diff(i)===0))return false;
      return true;
    });
  }
  function saveCount(inv,productId,value,queue=false){
    const rows=inventories(),idx=rows.findIndex(x=>String(x.id)===String(inv.id));if(idx<0)return;
    const item=rows[idx].items.find(i=>String(i.productId)===String(productId));if(!item)return;
    const text=String(value??'').trim();item.countedQty=text===''?null:round3(Math.max(0,Number(text)||0));item.updatedAt=Date.now();rows[idx].updatedAt=item.updatedAt;saveInventories(rows);if(queue)queueInventoryEvent(rows[idx]);
  }
  function saveCurrent(queue=true){const inv=activeInventory(),input=byId('v023CountInput');if(!inv||!input||!activeProductId)return;saveCount(inv,activeProductId,input.value,queue);}
  function setCurrentValue(value,next=false){const input=byId('v023CountInput');if(!input)return;input.value=String(value);updateLiveDiff();saveCurrent(true);if(next)goRelative(1);else renderCount();}
  function updateLiveDiff(){const inv=activeInventory(),item=inv?.items.find(i=>String(i.productId)===String(activeProductId)),input=byId('v023CountInput'),el=byId('v023LiveDiff');if(!item||!input||!el)return;const raw=input.value.trim();if(raw===''){el.className='v023-live-diff';el.innerHTML='<small>Diferença</small><strong>—</strong><span>Informe a quantidade física</span>';return;}const d=round3(Number(raw||0)-Number(item.expectedQty||0));el.className=`v023-live-diff ${d<0?'neg':d>0?'pos':'ok'}`;el.innerHTML=`<small>Diferença</small><strong>${d>0?'+':''}${fmtQty(d)}</strong><span>${d<0?'falta física':d>0?'sobra física':'igual ao sistema'}</span>`;}
  function goRelative(delta){saveCurrent(true);const inv=activeInventory(),items=filteredItems(inv);if(!items.length)return;let idx=items.findIndex(i=>String(i.productId)===String(activeProductId));if(idx<0)idx=0;idx=Math.max(0,Math.min(items.length-1,idx+delta));activeProductId=items[idx].productId;renderCount();setTimeout(()=>byId('v023CountInput')?.focus(),0);}

  function renderCount(){
    const body=byId('v023InventoryBody'),inv=activeInventory();if(!inv||inv.status!=='open'){mode='home';renderHome();return;}const stats=sessionStats(inv),cats=[...new Set(inv.items.map(i=>i.category||'Outros'))].sort((a,b)=>a.localeCompare(b,'pt-BR')),items=filteredItems(inv);
    if(!items.some(i=>String(i.productId)===String(activeProductId)))activeProductId=items.find(i=>!counted(i))?.productId||items[0]?.productId||null;
    const item=inv.items.find(i=>String(i.productId)===String(activeProductId))||null,pos=items.findIndex(i=>String(i.productId)===String(activeProductId));
    body.innerHTML=`<div class="v023-session-head"><div><small>${esc(inv.code)}</small><strong>${stats.done}/${stats.total} conferidos</strong></div><div class="v023-progress"><span style="width:${stats.total?stats.done/stats.total*100:0}%"></span></div><button id="v023Pause">Pausar</button><button id="v023GoSummary" class="primary">Revisar</button></div>
      <div class="v023-count-toolbar"><input id="v023Search" type="search" placeholder="Buscar produto..." value="${esc(search)}"><select id="v023Category"><option value="all">Todas as categorias</option>${cats.map(c=>`<option value="${esc(c)}" ${category===c?'selected':''}>${esc(c)}</option>`).join('')}</select><div class="v023-filter-buttons"><button data-inv-filter="all" class="${itemFilter==='all'?'active':''}">Todos</button><button data-inv-filter="pending" class="${itemFilter==='pending'?'active':''}">Pendentes</button><button data-inv-filter="divergent" class="${itemFilter==='divergent'?'active':''}">Divergentes</button></div></div>
      ${item?`<section class="v023-count-card"><div class="v023-count-title"><div><small>${esc(item.category||'Outros')}</small><h4>${esc(item.productName)}</h4><span>${pos+1} de ${items.length} neste filtro</span></div><div class="v023-expected"><small>Saldo esperado</small><strong>${fmtQty(item.expectedQty)}</strong></div></div><div class="v023-count-entry"><label>Quantidade contada<input id="v023CountInput" type="number" inputmode="decimal" min="0" step="1" value="${counted(item)?esc(item.countedQty):''}" placeholder="Digite a contagem"></label><div id="v023LiveDiff" class="v023-live-diff"></div></div><div class="v023-count-shortcuts"><button id="v023Same">= Igual ao sistema</button><button id="v023Zero">0 Sem unidade</button></div><div class="v023-nav"><button id="v023Prev" ${pos<=0?'disabled':''}>← Anterior</button><button id="v023Next" class="primary" ${pos>=items.length-1?'disabled':''}>Salvar e próximo →</button></div></section>`:`<div class="v023-empty"><strong>Nenhum item neste filtro.</strong><span>Troque a busca ou o filtro para continuar.</span></div>`}
      <section class="v023-item-list"><div class="v023-list-head"><strong>Itens da conferência</strong><span>${items.length} exibidos</span></div>${items.map(i=>{const d=diff(i);return `<button type="button" data-product="${esc(i.productId)}" class="${String(i.productId)===String(activeProductId)?'active':''}"><span><b>${esc(i.productName)}</b><small>${esc(i.category||'Outros')} • esperado ${fmtQty(i.expectedQty)}</small></span><em class="${!counted(i)?'pending':d<0?'neg':d>0?'pos':'ok'}">${!counted(i)?'Pendente':d===0?'OK':`${d>0?'+':''}${fmtQty(d)}`}</em></button>`;}).join('')}</section>`;
    byId('v023Search').oninput=e=>{saveCurrent(false);search=e.target.value||'';renderCount();};byId('v023Category').onchange=e=>{saveCurrent(false);category=e.target.value||'all';renderCount();};
    body.querySelectorAll('[data-inv-filter]').forEach(b=>b.onclick=()=>{saveCurrent(false);itemFilter=b.dataset.invFilter;renderCount();});body.querySelectorAll('[data-product]').forEach(b=>b.onclick=()=>{saveCurrent(true);activeProductId=b.dataset.product;renderCount();setTimeout(()=>byId('v023CountInput')?.focus(),0);});
    byId('v023CountInput')?.addEventListener('input',e=>{saveCount(inv,activeProductId,e.target.value,false);updateLiveDiff();});byId('v023CountInput')?.addEventListener('change',()=>saveCurrent(true));
    byId('v023Same')?.addEventListener('click',()=>setCurrentValue(item.expectedQty,true));byId('v023Zero')?.addEventListener('click',()=>setCurrentValue(0,true));byId('v023Prev')?.addEventListener('click',()=>goRelative(-1));byId('v023Next')?.addEventListener('click',()=>goRelative(1));
    byId('v023Pause').onclick=()=>{saveCurrent(true);mode='home';renderHome();toast('Conferência pausada. Você pode continuar depois.');};byId('v023GoSummary').onclick=()=>{saveCurrent(true);mode='summary';render();};updateLiveDiff();
  }

  function renderSummary(){
    const body=byId('v023InventoryBody'),inv=activeInventory();if(!inv){mode='home';renderHome();return;}const s=sessionStats(inv),conflicts=movementConflicts(inv),div=inv.items.filter(i=>counted(i)&&diff(i)!==0).sort((a,b)=>Math.abs(diff(b))-Math.abs(diff(a)));
    body.innerHTML=`<div class="v023-review-head"><button id="v023BackCount">← Voltar à contagem</button><div><small>${esc(inv.code)}</small><h4>Revisão da conferência</h4></div></div><div class="v023-review-metrics"><div><small>Conferidos</small><strong>${s.done}/${s.total}</strong></div><div><small>Corretos</small><strong>${s.same}</strong></div><div class="neg"><small>Faltas</small><strong>${s.shortages}</strong><span>-${fmtQty(s.shortUnits)} unid.</span></div><div class="pos"><small>Sobras</small><strong>${s.surpluses}</strong><span>+${fmtQty(s.surplusUnits)} unid.</span></div></div>
      ${s.pending?`<div class="v023-note warn"><b>${s.pending} produto${s.pending===1?' ainda não foi contado':'s ainda não foram contados'}.</b> A finalização só é liberada depois de conferir todos.</div>`:''}
      ${conflicts.length?`<div class="v023-note danger"><b>O estoque mudou depois que esta conferência começou.</b> Foram detectados ${conflicts.length} movimento${conflicts.length===1?'':'s'} em produtos desta contagem. Para evitar ajuste incorreto, cancele/reinicie a conferência em um momento sem movimentações.</div>`:''}
      <section class="v023-divergences"><div class="v023-list-head"><strong>Divergências</strong><span>${div.length}</span></div>${div.length?div.map(i=>`<div><span><b>${esc(i.productName)}</b><small>Esperado ${fmtQty(i.expectedQty)} • contado ${fmtQty(i.countedQty)}</small></span><em class="${diff(i)<0?'neg':'pos'}">${diff(i)>0?'+':''}${fmtQty(diff(i))}</em></div>`).join(''):'<div class="v023-empty-mini">Nenhuma diferença encontrada.</div>'}</section>
      <div class="v023-final-actions"><button id="v023CancelInv" class="danger-outline">Cancelar conferência</button><button id="v023Finalize" class="primary" ${s.pending||conflicts.length?'disabled':''}>Confirmar e ajustar estoque</button></div>`;
    byId('v023BackCount').onclick=()=>{mode='count';render();};byId('v023CancelInv').onclick=cancelInventory;byId('v023Finalize').onclick=finalizeInventory;
  }

  function appendStockMovement(m){
    const rows=readJson(STOCK_MOV_KEY,[]),list=Array.isArray(rows)?rows:[];if(list.some(x=>String(x.id)===String(m.id)))return false;list.push(clone(m));writeJson(STOCK_MOV_KEY,list.slice(-MAX_STOCK_MOV));
    if(syncReady()){
      const d=device(),q=readJson(STOCK_OUTBOX_KEY,[]),out=Array.isArray(q)?q:[],event={eventId:m.id,eventType:'stock_movement',entityId:String(m.productId),payload:{movement:clone(m)},deviceId:d.id,createdAt:new Date(Number(m.createdAt||Date.now())).toISOString(),appVersion:VERSION};
      const filtered=out.filter(x=>String(x.eventId)!==String(event.eventId));filtered.push(event);writeJson(STOCK_OUTBOX_KEY,filtered.slice(-MAX_STOCK_OUTBOX));
    }
    return true;
  }
  function finalizeInventory(){
    const inv=activeInventory();if(!inv||inv.status!=='open')return;const s=sessionStats(inv),conflicts=movementConflicts(inv);if(s.pending){toast('Conte todos os produtos antes de finalizar.');return;}if(conflicts.length){toast('O estoque mudou durante a conferência. Reinicie para evitar ajuste incorreto.');return;}
    if(!confirm(`Finalizar ${inv.code}? As ${s.divergent} divergências serão registradas como ajustes de estoque.`))return;
    const d=device(),now=Date.now();let adjustments=0;
    inv.items.forEach(item=>{const delta=diff(item);if(delta===null||delta===0)return;const movement={id:`inventory_adjust_${inv.id}_${item.productId}`,productId:String(item.productId),productName:clean(item.productName,180),delta, type:'adjust',reason:`Ajuste de inventário ${inv.code}`,createdAt:now+adjustments,createdAtIso:new Date(now+adjustments).toISOString(),deviceId:d.id,deviceName:d.name,commandId:null,inventoryId:inv.id,inventoryCode:inv.code,expectedQty:Number(item.expectedQty||0),countedQty:Number(item.countedQty||0),appVersion:VERSION};if(appendStockMovement(movement))adjustments++;});
    inv.status='finalized';inv.finalizedAt=Date.now();inv.updatedAt=inv.finalizedAt;inv.finalizedDeviceId=d.id;inv.finalizedDeviceName=d.name;inv.summary=sessionStats(inv);upsertInventory(inv,true);
    try{window.dispatchEvent(new CustomEvent('rota27:v021-stock-updated'));}catch{}try{window.dispatchEvent(new CustomEvent('rota27:v023-inventory-updated'));}catch{}if(navigator.onLine&&window.Rota27V021?.syncStock)setTimeout(()=>window.Rota27V021.syncStock(),80);
    mode='detail';render();toast(adjustments?`${adjustments} ajuste${adjustments===1?' registrado':'s registrados'} no estoque.`:'Inventário finalizado sem divergências.');
  }
  function cancelInventory(){const inv=activeInventory();if(!inv||inv.status!=='open')return;if(!confirm(`Cancelar ${inv.code}? Nenhum ajuste será aplicado ao estoque.`))return;inv.status='cancelled';inv.cancelledAt=Date.now();inv.updatedAt=inv.cancelledAt;upsertInventory(inv,true);mode='home';activeInventoryId=null;activeProductId=null;render();toast('Conferência cancelada sem alterar o estoque.');}

  function csvCell(v){const s=String(v??'');return /[;"\n]/.test(s)?`"${s.replace(/"/g,'""')}"`:s;}
  function exportCsv(inv){
    const lines=[['Inventário','Status','Data','Produto','Categoria','Esperado','Contado','Diferença']];(inv.items||[]).forEach(i=>lines.push([inv.code,inv.status,fmtDate(inv.finalizedAt||inv.updatedAt),i.productName,i.category,fmtQty(i.expectedQty),counted(i)?fmtQty(i.countedQty):'',counted(i)?fmtQty(diff(i)):'']));
    const blob=new Blob(['\ufeff'+lines.map(r=>r.map(csvCell).join(';')).join('\n')],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`rota27-inventario-${inv.code}.csv`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),500);
  }
  function renderHistory(){
    const body=byId('v023InventoryBody'),rows=inventories().slice().sort((a,b)=>Number(b.finalizedAt||b.cancelledAt||b.updatedAt||0)-Number(a.finalizedAt||a.cancelledAt||a.updatedAt||0));
    body.innerHTML=`<div class="v023-review-head"><button id="v023BackHome">← Voltar</button><div><small>HISTÓRICO</small><h4>Conferências de estoque</h4></div></div><div class="v023-history-list">${rows.length?rows.map(inv=>{const s=sessionStats(inv),label=inv.status==='finalized'?'Finalizado':inv.status==='cancelled'?'Cancelado':'Em andamento';return `<button data-inventory="${esc(inv.id)}"><span><b>${esc(inv.code)}</b><small>${label} • ${fmtDate(inv.finalizedAt||inv.cancelledAt||inv.updatedAt)} • ${s.done}/${s.total} conferidos</small></span><em class="${inv.status==='finalized'?(s.divergent?'warn':'ok'):'muted'}">${inv.status==='finalized'?`${s.divergent} diverg.`:label}</em></button>`;}).join(''):'<div class="v023-empty"><strong>Nenhuma conferência registrada.</strong><span>Inicie o primeiro inventário para criar o histórico.</span></div>'}</div>`;
    byId('v023BackHome').onclick=()=>{mode='home';render();};body.querySelectorAll('[data-inventory]').forEach(b=>b.onclick=()=>{activeInventoryId=b.dataset.inventory;mode='detail';render();});
  }
  function renderDetail(){
    const body=byId('v023InventoryBody'),inv=inventoryById(activeInventoryId);if(!inv){mode='history';renderHistory();return;}const s=sessionStats(inv),div=inv.items.filter(i=>counted(i)&&diff(i)!==0);
    body.innerHTML=`<div class="v023-review-head"><button id="v023BackHistory">← Histórico</button><div><small>${esc(inv.code)}</small><h4>${inv.status==='finalized'?'Conferência finalizada':inv.status==='cancelled'?'Conferência cancelada':'Conferência em andamento'}</h4></div></div><div class="v023-review-metrics"><div><small>Conferidos</small><strong>${s.done}/${s.total}</strong></div><div><small>Corretos</small><strong>${s.same}</strong></div><div class="neg"><small>Faltas</small><strong>${s.shortages}</strong></div><div class="pos"><small>Sobras</small><strong>${s.surpluses}</strong></div></div><section class="v023-detail-card"><p><b>Início:</b> ${fmtDate(inv.createdAt)}${inv.finalizedAt?`<br><b>Finalização:</b> ${fmtDate(inv.finalizedAt)} por ${esc(inv.finalizedDeviceName||'Aparelho')}`:''}</p><div class="v023-detail-actions">${inv.status==='open'?'<button id="v023ContinueDetail" class="primary">Continuar conferência</button>':''}<button id="v023Csv">⇩ CSV</button></div></section><section class="v023-divergences"><div class="v023-list-head"><strong>Itens</strong><span>${inv.items.length}</span></div>${inv.items.map(i=>{const d=diff(i);return `<div><span><b>${esc(i.productName)}</b><small>${esc(i.category||'Outros')} • esperado ${fmtQty(i.expectedQty)} • contado ${counted(i)?fmtQty(i.countedQty):'—'}</small></span><em class="${!counted(i)?'pending':d<0?'neg':d>0?'pos':'ok'}">${!counted(i)?'Pendente':d===0?'OK':`${d>0?'+':''}${fmtQty(d)}`}</em></div>`;}).join('')}</section>`;
    byId('v023BackHistory').onclick=()=>{mode='history';render();};byId('v023Csv').onclick=()=>exportCsv(inv);byId('v023ContinueDetail')?.addEventListener('click',()=>{activeProductId=inv.items.find(i=>!counted(i))?.productId||inv.items[0]?.productId||null;mode='count';render();});
  }

  function render(){ensureSheet();renderNotice();if(mode==='count')renderCount();else if(mode==='summary')renderSummary();else if(mode==='history')renderHistory();else if(mode==='detail')renderDetail();else renderHome();ensureHelp();}

  function inventoryHint(){const open=openInventorySession(),last=lastFinalized();if(open){const s=sessionStats(open);return `${s.done}/${s.total} produtos conferidos • continuar ${open.code}.`;}if(last)return `Última conferência ${fmtDate(last.finalizedAt)} • ${sessionStats(last).divergent} divergência${sessionStats(last).divergent===1?'':'s'}.`;return 'Nenhuma conferência física realizada ainda.';}
  function decorateStock(){
    const wrap=byId('v021StockWrap');if(!wrap)return;const toolbar=wrap.querySelector('.v021-toolbar');if(toolbar&&!byId('v023InventoryBtn')){const b=document.createElement('button');b.id='v023InventoryBtn';b.type='button';b.className='v023-stock-btn';b.textContent='◎ Inventário';b.onclick=()=>{wrap.classList.remove('open');openInventory('home');};toolbar.appendChild(b);}
    const overview=byId('v022StockManagerOverview');if(overview){let card=byId('v023StockInventoryStatus');if(!card){card=document.createElement('section');card.id='v023StockInventoryStatus';card.className='v023-stock-status';const quick=overview.querySelector('.v022s-quick-actions');if(quick)quick.insertAdjacentElement('afterend',card);else overview.prepend(card);}const open=openInventorySession(),last=lastFinalized();card.innerHTML=`<div><small>INVENTÁRIO & CONFERÊNCIA</small><strong>${open?'Conferência em andamento':last?'Estoque conferido':'Conferência física pendente'}</strong><span>${esc(inventoryHint())}</span></div><button type="button">${open?'Continuar':'Abrir inventário'}</button>`;card.querySelector('button').onclick=()=>{wrap.classList.remove('open');openInventory(open?'count':'home');};}
  }
  function wrapStockOpen(){if(wrappedStock||typeof window.Rota27V021?.openStock!=='function')return;wrappedStock=true;const base=window.Rota27V021.openStock.bind(window.Rota27V021);window.Rota27V021.openStock=function(){const r=base(...arguments);setTimeout(decorateStock,0);return r;};}

  function injectHelp(){
    const overlay=byId('r27HelpOverlay'),content=overlay?.querySelector('.r27-help-content');if(!content)return false;
    if(!byId('r27-help-inventario')){const d=document.createElement('details');d.id='r27-help-inventario';d.className='r27-help-section';d.innerHTML=`<summary><span class="r27-help-section-icon">◎</span><span><strong>Inventário & Conferência</strong><small>Compare o estoque do sistema com a contagem física.</small></span></summary><div class="r27-help-section-body"><div class="r27-help-lead">No <b>Estoque Essencial</b>, toque em <b>Inventário</b>. A contagem não altera nenhum saldo até você revisar e confirmar a finalização.</div><ol class="r27-help-steps"><li><span>1</span><div><b>Inicie a conferência</b><br>O app guarda um snapshot do saldo esperado dos produtos controlados.</div></li><li><span>2</span><div><b>Conte o físico</b><br>Digite a quantidade encontrada. Use Igual ao sistema ou Sem unidade para acelerar.</div></li><li><span>3</span><div><b>Revise as diferenças</b><br>Faltas e sobras ficam destacadas antes de qualquer alteração.</div></li><li><span>4</span><div><b>Confirme</b><br>Somente as divergências viram Ajustes de inventário, uma única vez por produto.</div></li></ol><div class="v023-help-tip"><b>Importante:</b> faça a conferência em um período sem vendas, entradas ou outras movimentações. Se o estoque mudar durante a contagem, o Rota 27 bloqueia a finalização para proteger o saldo.</div></div>`;const stock=byId('r27-help-estoque'),purchases=byId('r27-help-compras');if(purchases)purchases.insertAdjacentElement('afterend',d);else if(stock)stock.insertAdjacentElement('afterend',d);else content.appendChild(d);}
    return true;
  }
  function ensureHelp(){injectHelp();}
  function refresh(){wrapStockOpen();if(byId('v021StockWrap')?.classList.contains('open'))setTimeout(decorateStock,0);if(byId('v023InventoryWrap')?.classList.contains('open'))render();ensureHelp();try{window.dispatchEvent(new CustomEvent('rota27:v023-inventory-updated'));}catch{}}

  function start(){
    ensureSheet();wrapStockOpen();ensureHelp();setTimeout(()=>{wrapStockOpen();decorateStock();ensureHelp();},120);setTimeout(()=>{decorateStock();ensureHelp();},700);
    window.addEventListener('rota27:v021-stock-updated',refresh);window.addEventListener('rota27:v022-purchases-updated',refresh);window.addEventListener('rota27:v017-domain-updated',refresh);window.addEventListener('storage',refresh);window.addEventListener('online',()=>{refresh();syncNow(true);});window.addEventListener('offline',refresh);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){refresh();syncNow();}});
    if(navigator.onLine)syncNow();console.info('[Rota27] v0.23.0 Inventário & Conferência carregado.');
  }

  window.Rota27V023={version:VERSION,open:openInventory,getInventories:()=>clone(inventories()),getOpenInventory:()=>clone(openInventorySession()),getLastInventory:()=>clone(lastFinalized()),syncInventory:()=>syncNow(true)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
