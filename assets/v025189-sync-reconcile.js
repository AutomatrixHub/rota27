/* Rota 27 v0.25.192 — reconciliação estrutural de dados locais com o sync */
(function(){
  'use strict';
  if(window.Rota27V025189SyncReconcile)return;

  const VERSION='0.25.192';
  const SYNC_KEY='rota27_sync_config_v1';
  const MARKER_KEY='rota27_v025189_reconcile_cursor_v1';
  const TOMBSTONE_KEY='rota27_v025189_client_delete_ledger_v1';
  const CORE_KEY='rota27_comandas_v01';
  const STOCK_CFG_KEY='rota27_v021_stock_cfg_v1';
  const STOCK_MOV_KEY='rota27_v021_stock_mov_v1';
  const SUPPLIERS_KEY='rota27_v022_suppliers_v1';
  const ORDERS_KEY='rota27_v022_purchase_orders_v1';
  const RECEIPTS_KEY='rota27_v022_purchase_receipts_v1';
  const INV_KEY='rota27_v023_inventories_v1';
  const RECEIVABLES_KEY='rota27_v02512_receivables_v1';
  const CLOSURES_KEY='rota27_v019_turn_closures_v1';
  const REPAIR_KEY='rota27_v02516_turn_repair_state_v1';
  const WATCHED_KEYS=new Set([SYNC_KEY,CORE_KEY,STOCK_CFG_KEY,STOCK_MOV_KEY,SUPPLIERS_KEY,ORDERS_KEY,RECEIPTS_KEY,INV_KEY,RECEIVABLES_KEY,CLOSURES_KEY,REPAIR_KEY]);
  const MAX_PAGES=120;
  const PAGE_SIZE=500;
  const MAX_PUSH=80;
  const MAX_CANDIDATES=20000;
  let running=false;
  let timer=null;
  let rerun=false;

  const nativeSetItem=Storage.prototype.setItem;
  const clean=(v,max=240)=>String(v??'').replace(/[\u0000-\u001f\u007f]/g,' ').trim().replace(/\s+/g,' ').slice(0,max);
  const clone=v=>JSON.parse(JSON.stringify(v==null?null:v));
  const readJson=(key,fallback)=>{try{const v=JSON.parse(localStorage.getItem(key)||'null');return v==null?fallback:v;}catch{return fallback;}};
  const num=v=>Number.isFinite(Number(v))?Number(v):0;
  const iso=v=>{const n=num(v);return n>0?new Date(n).toISOString():new Date().toISOString();};
  const currentRelease=()=>clean(window.Rota27Roadmap?.version||document.querySelector('meta[name="rota27-release-version"]')?.content||VERSION,40)||VERSION;
  const inTestMode=()=>document.body?.classList.contains('v02581-test-mode')===true;
  const normalizePhone=v=>{let d=String(v||'').replace(/\D/g,'').replace(/^0+/,'');if(d.length===10||d.length===11)d='55'+d;return d;};

  function syncConfig(){const c=readJson(SYNC_KEY,{});return c&&typeof c==='object'&&!Array.isArray(c)?c:{};}
  function syncReady(){const c=syncConfig();return c.enabled===true&&c.initialized===true&&/^https:\/\/.+\/functions\/v1\/rota27-sync\/?$/i.test(String(c.functionUrl||''))&&String(c.deviceToken||'').length>=16&&!!c.deviceId;}
  function device(){const c=syncConfig();return {id:clean(c.deviceId||'local',120)||'local',name:clean(c.deviceName||'Aparelho',80)||'Aparelho',storeId:clean(c.storeId||'rota27-bodega',80)||'rota27-bodega'};}
  function fnv(text){let h=2166136261>>>0;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}return h.toString(16).padStart(8,'0');}
  function stableId(prefix,value){return `${prefix}_${fnv(String(value))}`;}
  function latestStamp(obj){
    if(!obj||typeof obj!=='object')return 0;
    return Math.max(
      num(obj.updatedAt),num(obj.lastSeenAt),num(obj.birthDateUpdatedAt),num(obj.relationshipMarketingOptInAt),
      num(obj.finalizedAt),num(obj.paidAt),num(obj.closedAt),num(obj.openedAt),num(obj.createdAt),num(obj.firstSeenAt)
    );
  }
  function payloadObject(event){
    const type=String(event?.event_type||event?.eventType||''),p=event?.payload&&typeof event.payload==='object'?event.payload:{};
    if(type==='client_upsert')return p.client||p;
    if(type==='manager_config_replace')return p.config||p;
    if(type==='stock_config_upsert')return p.config||p;
    if(type==='stock_movement')return p.movement||p;
    if(type==='supplier_upsert')return p.supplier||p;
    if(type==='purchase_order_upsert')return p.order||p;
    if(type==='purchase_receipt')return p.receipt||p;
    if(type==='inventory_upsert')return p.inventory||p;
    if(type==='receivable_upsert')return p.receivable||p;
    if(type==='receivable_payment')return p.payment||p;
    if(type==='turn_closed')return p.closure||p;
    return p;
  }
  function eventStamp(event){const obj=payloadObject(event),own=latestStamp(obj);if(own>0)return own;return Date.parse(event?.created_at||event?.createdAt||'')||0;}
  function eventEntity(event){return String(event?.entity_id||event?.entityId||'');}
  function eventType(event){return String(event?.event_type||event?.eventType||'');}
  function eventId(event){return String(event?.event_id||event?.eventId||'');}

  async function api(body){
    const c=syncConfig();if(!syncReady())throw new Error('Sincronização não configurada.');
    const ctrl=new AbortController(),timeout=setTimeout(()=>ctrl.abort(),15000);
    try{
      const r=await fetch(String(c.functionUrl).replace(/\/+$/,''),{
        method:'POST',headers:{'content-type':'application/json','x-rota27-device-token':String(c.deviceToken)},
        body:JSON.stringify({...body,deviceId:c.deviceId,deviceName:c.deviceName||'Aparelho',storeId:c.storeId||'rota27-bodega',appVersion:currentRelease()}),signal:ctrl.signal
      });
      const data=await r.json().catch(()=>({}));if(!r.ok||data.ok!==true)throw new Error(data.error||`HTTP ${r.status}`);return data;
    }finally{clearTimeout(timeout);}
  }

  function remoteIndex(){return {eventIds:new Set(),byTypeEntity:new Map(),clientsByPhone:new Map(),turnClosuresByWindow:new Map(),manager:null,lastSeq:0};}
  function indexRemote(idx,event){
    const type=eventType(event),entity=eventEntity(event),seq=num(event?.seq),id=eventId(event);
    idx.lastSeq=Math.max(idx.lastSeq,seq);if(id)idx.eventIds.add(id);
    if(type&&entity){const key=`${type}|${entity}`,old=idx.byTypeEntity.get(key);if(!old||num(old.seq)<seq)idx.byTypeEntity.set(key,event);}
    if(type==='client_upsert'){
      const phone=normalizePhone(payloadObject(event)?.whatsappPhone||payloadObject(event)?.phone||'');
      if(phone){const old=idx.clientsByPhone.get(phone);if(!old||num(old.seq)<seq)idx.clientsByPhone.set(phone,event);}
    }
    if(type==='client_delete'&&entity){
      const key=`client_upsert|${entity}`,old=idx.byTypeEntity.get(key);if(!old||num(old.seq)<seq)idx.byTypeEntity.set(key,event);
    }
    if(type==='turn_closed'){
      const key=closureWindowKey(payloadObject(event));
      if(key){const old=idx.turnClosuresByWindow.get(key);if(!old||num(old.seq)<seq)idx.turnClosuresByWindow.set(key,event);}
    }
    if(type==='manager_config_replace'&&(!idx.manager||num(idx.manager.seq)<seq))idx.manager=event;
  }
  async function scanRemote(){
    const idx=remoteIndex();let cursor=0,lastCursor=-1;
    for(let page=0;page<MAX_PAGES;page++){
      const data=await api({action:'pull',afterSeq:cursor,limit:PAGE_SIZE,preferSnapshot:false});
      const events=Array.isArray(data.events)?data.events:[];events.forEach(e=>indexRemote(idx,e));
      const next=Math.max(cursor,num(data.cursor),...events.map(e=>num(e.seq)));
      const hasMore=data.hasMore===true;
      if(!hasMore){idx.lastSeq=Math.max(idx.lastSeq,next);return idx;}
      if(next<=cursor&&cursor===lastCursor)throw new Error('Paginação do histórico remoto não avançou.');
      lastCursor=cursor;cursor=next;
    }
    throw new Error('Histórico remoto excedeu o limite seguro de reconciliação.');
  }

  function remoteFor(idx,type,entity,extra={}){
    let hit=idx.byTypeEntity.get(`${type}|${String(entity||'')}`)||null;
    if(type==='client_upsert'&&extra.phone){const byPhone=idx.clientsByPhone.get(normalizePhone(extra.phone));if(byPhone&&(!hit||num(byPhone.seq)>num(hit.seq)))hit=byPhone;}
    return hit;
  }
  function shouldPublish(local,remote){
    if(!remote)return true;
    const localStamp=latestStamp(local),remoteStamp=eventStamp(remote);
    if(eventType(remote)==='client_delete')return localStamp>remoteStamp;
    if(localStamp<=0)return false;
    return localStamp>remoteStamp;
  }
  function makeEvent(type,entity,payload,id,createdAt){const d=device();return {eventId:id,eventType:type,entityId:String(entity||''),payload:clone(payload||{}),deviceId:d.id,createdAt:createdAt||new Date().toISOString(),appVersion:currentRelease()};}

  function supersededClosureIds(){
    const state=readJson(REPAIR_KEY,{}),ids=new Set();
    Object.values(state?.repairs||{}).forEach(r=>(Array.isArray(r?.supersededClosureIds)?r.supersededClosureIds:[]).forEach(id=>ids.add(String(id||''))));
    return ids;
  }
  function closureShiftStartedAt(c){const raw=num(c?.shiftStartedAt||c?.summary?.firstOpenedAt||c?.summary?.shiftStart);return raw>0?Math.trunc(raw):0;}
  function closureWindowKey(c){const date=String(c?.businessDate||'').trim(),shift=closureShiftStartedAt(c);return /^\d{4}-\d{2}-\d{2}$/.test(date)&&shift>0?`${date}_${shift}`:'';}
  function canonicalClosureId(c){const key=closureWindowKey(c);return key?`turn_${key}`:String(c?.id||'');}

  function buildCandidates(idx){
    const out=[];
    const core=readJson(CORE_KEY,{}),clients=Array.isArray(window.Rota27V017?.clients?.())?window.Rota27V017.clients():Array.isArray(core?.clients)?core.clients:[];
    for(const client of clients){
      if(!client?.id||!client?.name)continue;
      const remote=remoteFor(idx,'client_upsert',client.id,{phone:client.whatsappPhone});
      if(!shouldPublish(client,remote))continue;
      const stamp=latestStamp(client)||Date.now(),id=stableId('reconcile_client',`${client.id}|${stamp}|${JSON.stringify(client)}`);
      if(!idx.eventIds.has(id))out.push(makeEvent('client_upsert',client.id,{client:clone(client)},id,iso(stamp)));
    }
    const manager=core?.managerWhatsapp&&typeof core.managerWhatsapp==='object'?core.managerWhatsapp:null;
    if(manager&&num(manager.updatedAt)>0&&shouldPublish(manager,idx.manager)){
      const id=stableId('reconcile_manager',`${num(manager.updatedAt)}|${JSON.stringify(manager)}`);if(!idx.eventIds.has(id))out.push(makeEvent('manager_config_replace','manager',{config:clone(manager)},id,iso(manager.updatedAt)));
    }

    const cfg=readJson(STOCK_CFG_KEY,{});Object.entries(cfg&&typeof cfg==='object'&&!Array.isArray(cfg)?cfg:{}).forEach(([pid,row])=>{
      if(!row||typeof row!=='object')return;const entity=String(row.productId||pid),remote=remoteFor(idx,'stock_config_upsert',entity);if(!shouldPublish(row,remote))return;
      const stamp=latestStamp(row)||Date.now(),id=`stock_cfg_${entity}_${stamp}`;if(!idx.eventIds.has(id))out.push(makeEvent('stock_config_upsert',entity,{config:{...clone(row),productId:entity}},id,iso(stamp)));
    });
    const movements=readJson(STOCK_MOV_KEY,[]);(Array.isArray(movements)?movements:[]).forEach(m=>{
      if(!m?.id||!m?.productId)return;const id=String(m.id);if(!idx.eventIds.has(id))out.push(makeEvent('stock_movement',m.productId,{movement:clone(m)},id,iso(m.createdAt)));
    });

    const suppliers=readJson(SUPPLIERS_KEY,[]);(Array.isArray(suppliers)?suppliers:[]).forEach(s=>{
      if(!s?.id)return;const remote=remoteFor(idx,'supplier_upsert',s.id);if(!shouldPublish(s,remote))return;const stamp=latestStamp(s)||Date.now(),id=`supplier_${s.id}_${stamp}`;if(!idx.eventIds.has(id))out.push(makeEvent('supplier_upsert',s.id,{supplier:clone(s)},id,iso(stamp)));
    });
    const orders=readJson(ORDERS_KEY,[]);(Array.isArray(orders)?orders:[]).forEach(o=>{
      if(!o?.id)return;const remote=remoteFor(idx,'purchase_order_upsert',o.id);if(!shouldPublish(o,remote))return;const stamp=latestStamp(o)||Date.now(),id=`purchase_order_${o.id}_${stamp}`;if(!idx.eventIds.has(id))out.push(makeEvent('purchase_order_upsert',o.id,{order:clone(o)},id,iso(stamp)));
    });
    const receipts=readJson(RECEIPTS_KEY,[]);(Array.isArray(receipts)?receipts:[]).forEach(r=>{
      if(!r?.id||!r?.orderId)return;const id=String(r.id);if(!idx.eventIds.has(id))out.push(makeEvent('purchase_receipt',r.orderId,{receipt:clone(r)},id,iso(r.createdAt)));
    });

    const inventories=readJson(INV_KEY,[]);(Array.isArray(inventories)?inventories:[]).forEach(inv=>{
      if(!inv?.id)return;const remote=remoteFor(idx,'inventory_upsert',inv.id);if(!shouldPublish(inv,remote))return;const stamp=latestStamp(inv)||Date.now(),id=`inventory_${inv.id}_${num(inv.updatedAt)||stamp}`;if(!idx.eventIds.has(id))out.push(makeEvent('inventory_upsert',inv.id,{inventory:clone(inv)},id,iso(stamp)));
    });

    const receivables=readJson(RECEIVABLES_KEY,[]);(Array.isArray(receivables)?receivables:[]).forEach(row=>{
      if(!row?.id)return;const remote=remoteFor(idx,'receivable_upsert',row.id);if(shouldPublish(row,remote)){
        const base={...clone(row)};delete base.payments;const stamp=latestStamp(row)||Date.now(),id=stableId('reconcile_receivable',`${row.id}|${stamp}|${JSON.stringify(base)}`);
        if(!idx.eventIds.has(id))out.push(makeEvent('receivable_upsert',row.id,{receivable:base},id,iso(stamp)));
      }
      (Array.isArray(row.payments)?row.payments:[]).forEach(p=>{if(!p?.id||!(num(p.amount)>0))return;const id=`receivable_payment_${p.id}`;if(!idx.eventIds.has(id))out.push(makeEvent('receivable_payment',row.id,{receivableId:row.id,payment:clone(p)},id,iso(p.paidAt)));});
    });

    const superseded=supersededClosureIds(),closures=readJson(CLOSURES_KEY,[]);(Array.isArray(closures)?closures:[]).forEach(c=>{
      if(!c?.id||!c?.businessDate||c?.repairId||c?.repairedFrom||superseded.has(String(c.id)))return;
      const windowKey=closureWindowKey(c),canonical=canonicalClosureId(c);if(!canonical)return;
      if(windowKey&&idx.turnClosuresByWindow.has(windowKey))return;
      const id=`turn_closed_${canonical}`;if(idx.eventIds.has(id))return;
      const normalized={...clone(c),id:canonical};out.push(makeEvent('turn_closed',canonical,{closure:normalized},id,iso(c.closedAt)));
    });
    return out;
  }

  async function pushCandidates(events){
    if(events.length>MAX_CANDIDATES)throw new Error(`Reconciliação excedeu ${MAX_CANDIDATES} eventos; publicação bloqueada por segurança.`);
    for(let i=0;i<events.length;i+=MAX_PUSH)await api({action:'push',events:events.slice(i,i+MAX_PUSH)});
  }
  function readMarker(){const m=readJson(MARKER_KEY,{});return m&&typeof m==='object'?m:{};}
  function writeMarker(value){nativeSetItem.call(localStorage,MARKER_KEY,JSON.stringify(value));}
  function clearMarker(){try{localStorage.removeItem(MARKER_KEY);}catch{}}
  function tombstones(){const rows=readJson(TOMBSTONE_KEY,[]);return Array.isArray(rows)?rows:[];}
  function writeTombstones(rows){nativeSetItem.call(localStorage,TOMBSTONE_KEY,JSON.stringify((Array.isArray(rows)?rows:[]).slice(-1000)));}
  function captureClientDeletes(beforeRaw,afterRaw){
    try{
      const before=JSON.parse(beforeRaw||'{}')||{},after=JSON.parse(afterRaw||'{}')||{};
      const oldRows=Array.isArray(before.clients)?before.clients:[],newRows=Array.isArray(after.clients)?after.clients:[];
      const nextIds=new Set(newRows.map(c=>String(c?.id||'')).filter(Boolean));
      const removed=oldRows.filter(c=>c?.id&&!nextIds.has(String(c.id)));if(!removed.length)return;
      const rows=tombstones(),map=new Map(rows.filter(x=>x?.id).map(x=>[String(x.id),x]));
      const at=Date.now();removed.forEach(c=>map.set(String(c.id),{id:String(c.id),phone:normalizePhone(c.whatsappPhone||''),at}));
      writeTombstones([...map.values()]);return removed.length;
    }catch{return 0;}
  }
  function appendTombstoneCandidates(idx,out){
    const core=readJson(CORE_KEY,{}),live=Array.isArray(window.Rota27V017?.clients?.())?window.Rota27V017.clients():Array.isArray(core?.clients)?core.clients:[];
    tombstones().forEach(t=>{
      if(!t?.id)return;
      const current=live.find(c=>String(c?.id||'')===String(t.id)||(t.phone&&normalizePhone(c?.whatsappPhone||'')===normalizePhone(t.phone)));
      if(current&&latestStamp(current)>=num(t.at))return;
      const remote=remoteFor(idx,'client_upsert',t.id,{phone:t.phone});
      if(remote&&eventType(remote)==='client_delete')return;
      if(remote&&eventStamp(remote)>num(t.at))return;
      const id=stableId('reconcile_client_delete',`${t.id}|${num(t.at)}`);
      if(!idx.eventIds.has(id))out.push(makeEvent('client_delete',t.id,{},id,iso(t.at)));
    });
  }
  function schedule(reason='change',delay=900){clearTimeout(timer);timer=setTimeout(()=>run(reason),delay);}
  function fanOutSync(){
    setTimeout(()=>{
      const calls=[
        ()=>window.Rota27V017?.syncDomainNow?.(),()=>window.Rota27V021?.syncStock?.(),()=>window.Rota27V022?.syncPurchases?.(),
        ()=>window.Rota27V023?.syncInventory?.(),()=>window.Rota27V02512?.sync?.(),()=>window.Rota27V019?.syncTurnClosures?.()
      ];
      calls.forEach(fn=>{try{const p=fn();if(p&&typeof p.catch==='function')p.catch(()=>{});}catch{}});
    },180);
  }
  async function run(reason='manual'){
    if(running){rerun=true;return false;}
    if(inTestMode()||!navigator.onLine||!syncReady())return false;
    const marker=readMarker();if(marker.release===VERSION&&reason!=='force')return true;
    running=true;rerun=false;
    try{
      const remote=await scanRemote(),events=buildCandidates(remote);appendTombstoneCandidates(remote,events);
      if(events.length)await pushCandidates(events);
      writeTombstones([]);
      writeMarker({release:VERSION,lastServerSeq:remote.lastSeq,published:events.length,lastAt:Date.now()});
      fanOutSync();
      window.dispatchEvent(new CustomEvent('rota27:sync-reconciled',{detail:{version:VERSION,published:events.length,lastServerSeq:remote.lastSeq}}));
      console.info(`[Rota27 ${VERSION}] reconciliação concluída: ${events.length} evento(s) reparado(s).`);
      return true;
    }catch(err){
      console.warn(`[Rota27 ${VERSION}] reconciliação adiada:`,err?.message||err);return false;
    }finally{running=false;if(rerun)schedule('rerun',700);}
  }

  Storage.prototype.setItem=function(key,value){
    const k=String(key),watch=this===localStorage&&WATCHED_KEYS.has(k),before=watch&&k===CORE_KEY&&!inTestMode()?localStorage.getItem(CORE_KEY):null;
    const result=nativeSetItem.call(this,key,value);
    if(watch&&!inTestMode()){
      const deleted=k===CORE_KEY&&before!==null?captureClientDeletes(before,localStorage.getItem(CORE_KEY)):0;
      if(deleted>0){clearMarker();if(syncReady())schedule('client-delete',450);}
      if(k===SYNC_KEY){if(syncReady())schedule('sync-config',350);}
      else if(!syncReady())clearMarker();
    }
    return result;
  };

  window.addEventListener('online',()=>schedule('online',350));
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')schedule('visible',500);});
  window.addEventListener('rota27:test-mode-changed',e=>{if(e?.detail?.active!==true)schedule('test-exit',600);});
  window.addEventListener('rota27:v017-domain-updated',()=>schedule('domain',800));
  window.addEventListener('rota27:v021-stock-updated',()=>schedule('stock',800));
  window.addEventListener('rota27:v022-purchases-updated',()=>schedule('purchases',800));
  window.addEventListener('rota27:v02512-receivables-updated',()=>schedule('receivables',800));

  window.Rota27V025189SyncReconcile={version:VERSION,run:()=>run('force'),status:()=>clone(readMarker())};
  schedule('startup',1200);
  console.info(`[Rota27] reconciliação estrutural v${VERSION} carregada.`);
})();
