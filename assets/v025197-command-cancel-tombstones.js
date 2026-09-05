/* Rota 27 v0.25.197 — tombstones duráveis de cancelamento de comandas */
(function(){
  'use strict';
  if(window.Rota27V025197CommandCancelTombstones)return;

  const VERSION='0.25.197';
  const TOMBSTONE_KEY='rota27_v025197_command_cancel_tombstones_v1';
  const SCAN_KEY='rota27_v025197_command_cancel_scan_outbox_marker_v1';
  const CANCEL_QUEUE_KEY='rota27_cancel_outbox_v0151';
  const CORE_KEY='rota27_comandas_v01';
  const SYNC_KEY='rota27_sync_config_v1';
  const PUSH_BATCH=50;
  const RECONCILE_MS=5000;
  const REMOTE_SCAN_INTERVAL_MS=30000;
  const REMOTE_SCAN_PAGES=8;
  const previousSetItem=Storage.prototype.setItem;
  let flushing=false;
  let scanning=false;
  let timer=null;

  function clone(value){return JSON.parse(JSON.stringify(value==null?null:value));}
  function readJson(key,fallback){
    try{const value=JSON.parse(localStorage.getItem(key)||'null');return value==null?fallback:value;}catch{return fallback;}
  }
  function writeJson(key,value){
    try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}
  }
  function store(){
    const raw=readJson(TOMBSTONE_KEY,{});
    const records=raw&&typeof raw==='object'&&!Array.isArray(raw)&&raw.records&&typeof raw.records==='object'&&!Array.isArray(raw.records)?raw.records:{};
    return {version:1,records};
  }
  function saveStore(next){return writeJson(TOMBSTONE_KEY,{version:1,records:next.records||{}});}
  function tombstoneIds(){return new Set(Object.keys(store().records));}
  function syncConfig(){
    const cfg=readJson(SYNC_KEY,{});
    return cfg&&typeof cfg==='object'&&!Array.isArray(cfg)?cfg:{};
  }
  function syncReady(cfg=syncConfig()){
    return cfg.enabled===true&&cfg.initialized===true&&/^https:\/\/.+\/functions\/v1\/rota27-sync\/?$/i.test(String(cfg.functionUrl||''))&&String(cfg.deviceToken||'').length>=16&&!!cfg.deviceId;
  }
  function backendKey(cfg){return `${String(cfg.functionUrl||'').replace(/\/+$/,'')}|${String(cfg.storeId||'rota27-bodega')}`;}
  function cancellationAt(row,fallback=Date.now()){
    const value=Number(row?.patch?.cancelledAt||row?.cancelledAt||row?.committedAt||row?.preparedAt||fallback);
    return Number.isFinite(value)&&value>0?value:fallback;
  }
  function upsertTombstone(commandId,cancelledAt,snapshot=null){
    const id=String(commandId||'').trim();
    if(!id)return false;
    const next=store(),old=next.records[id]||null,at=Math.max(Number(old?.cancelledAt||0),Number(cancelledAt||0),1);
    const newer=!old||at>Number(old.cancelledAt||0);
    if(old&&!newer&&(!snapshot||old.commandSnapshot))return true;
    next.records[id]={
      ...(old||{}),
      commandId:id,
      eventId:`cancel_command_${id}`,
      cancelledAt:at,
      updatedAt:Date.now(),
      commandSnapshot:snapshot?clone(snapshot):(old?.commandSnapshot||null),
      serverConfirmedAt:newer?0:Number(old?.serverConfirmedAt||0),
      confirmedBackendKey:newer?'':String(old?.confirmedBackendKey||'')
    };
    return saveStore(next);
  }
  function markObservedOnServer(commandId,cancelledAt,key){
    const id=String(commandId||'').trim();
    if(!id)return false;
    if(!upsertTombstone(id,cancelledAt,null))return false;
    const next=store(),current=next.records[id];
    if(!current||Number(current.cancelledAt||0)>Number(cancelledAt||0))return true;
    const now=Date.now();
    next.records[id]={...current,serverConfirmedAt:now,confirmedBackendKey:key,updatedAt:Math.max(Number(current.updatedAt||0),now)};
    return saveStore(next);
  }
  function filterCoreState(core){
    if(!core||typeof core!=='object'||Array.isArray(core))return {core,changed:false};
    const ids=tombstoneIds();
    if(!ids.size)return {core,changed:false};
    let changed=false;
    const next={...core};
    if(Array.isArray(core.commands)){
      const commands=core.commands.filter(command=>!ids.has(String(command?.id||'')));
      if(commands.length!==core.commands.length){next.commands=commands;changed=true;}
    }
    if(Array.isArray(core.whatsappOutbox)){
      const whatsappOutbox=core.whatsappOutbox.filter(row=>!ids.has(String(row?.commandId||'')));
      if(whatsappOutbox.length!==core.whatsappOutbox.length){next.whatsappOutbox=whatsappOutbox;changed=true;}
    }
    return {core:next,changed};
  }
  function harvestCancelledCoreState(core){
    if(!core||!Array.isArray(core.commands))return 0;
    let count=0;
    for(const command of core.commands){
      if(command?.cancelled!==true||!command?.id)continue;
      const at=cancellationAt(command,Number(command.updatedAt||Date.now()));
      if(upsertTombstone(command.id,at,command))count++;
    }
    return count;
  }
  function filterCoreRaw(raw){
    try{
      const parsed=JSON.parse(String(raw));
      harvestCancelledCoreState(parsed);
      const result=filterCoreState(parsed);
      return result.changed?JSON.stringify(result.core):String(raw);
    }catch{return String(raw);}
  }
  function runtimeState(){
    try{if(typeof state!=='undefined'&&state)return state;}catch{}
    try{return window.state||null;}catch{return null;}
  }
  function enforceRuntime(){
    const live=runtimeState();
    if(!live||typeof live!=='object')return false;
    const ids=tombstoneIds();
    if(!ids.size)return false;
    let changed=false;
    if(Array.isArray(live.commands)){
      const commands=live.commands.filter(command=>!ids.has(String(command?.id||'')));
      if(commands.length!==live.commands.length){live.commands=commands;changed=true;}
    }
    if(Array.isArray(live.whatsappOutbox)){
      const whatsappOutbox=live.whatsappOutbox.filter(row=>!ids.has(String(row?.commandId||'')));
      if(whatsappOutbox.length!==live.whatsappOutbox.length){live.whatsappOutbox=whatsappOutbox;changed=true;}
    }
    if(changed){
      try{if(typeof renderCommands==='function')renderCommands();}catch{}
      try{window.dispatchEvent(new CustomEvent('rota27:command-cancel-tombstones-updated'));}catch{}
    }
    return changed;
  }

  Storage.prototype.setItem=function(key,value){
    if(String(key)!==CORE_KEY)return previousSetItem.apply(this,arguments);
    const filtered=filterCoreRaw(value);
    const changed=String(filtered)!==String(value);
    const result=previousSetItem.call(this,key,filtered);
    if(changed)queueMicrotask(enforceRuntime);
    return result;
  };

  function enforceLocal(){
    const raw=localStorage.getItem(CORE_KEY);
    if(raw==null){enforceRuntime();return false;}
    let parsed;
    try{parsed=JSON.parse(raw);}catch{enforceRuntime();return false;}
    harvestCancelledCoreState(parsed);
    const result=filterCoreState(parsed);
    let persisted=false;
    if(result.changed){
      try{localStorage.setItem(CORE_KEY,JSON.stringify(result.core));persisted=true;}catch{}
    }
    enforceRuntime();
    return persisted;
  }
  function corePresence(commandId){
    const raw=localStorage.getItem(CORE_KEY);
    if(raw==null)return {known:false,present:false};
    try{
      const core=JSON.parse(raw);
      if(!core||!Array.isArray(core.commands))return {known:false,present:false};
      return {known:true,present:core.commands.some(command=>String(command?.id||'')===String(commandId||''))};
    }catch{return {known:false,present:false};}
  }
  function harvestCancelQueue(){
    const rows=readJson(CANCEL_QUEUE_KEY,[]);
    if(!Array.isArray(rows)||!rows.length)return 0;
    let added=0;
    for(const row of rows){
      const id=String(row?.commandId||'').trim();
      if(!id)continue;
      const stage=String(row?.stage||'');
      const state=corePresence(id);
      const authoritative=stage==='committed'||(state.known&&!state.present);
      if(!authoritative)continue;
      if(upsertTombstone(id,cancellationAt(row),row?.commandSnapshot||null))added++;
    }
    return added;
  }
  function captureCancellation(event){
    const snapshot=event?.detail?.command||null;
    const id=String(snapshot?.id||event?.detail?.commandId||'').trim();
    if(!id)return;
    const at=Math.max(1,Number(event?.detail?.cancelledAt||Date.now()));
    if(upsertTombstone(id,at,snapshot)){
      enforceLocal();
      schedule(0);
    }
  }
  window.addEventListener('rota27:command-cancelled-durable',captureCancellation);

  async function request(cfg,body){
    const ctrl=new AbortController(),timeout=setTimeout(()=>ctrl.abort(),12000);
    try{
      const response=await fetch(String(cfg.functionUrl).replace(/\/+$/,''),{
        method:'POST',
        headers:{'content-type':'application/json','x-rota27-device-token':String(cfg.deviceToken)},
        body:JSON.stringify({...body,deviceId:cfg.deviceId,deviceName:cfg.deviceName||'Aparelho',storeId:cfg.storeId||'rota27-bodega',appVersion:VERSION}),
        signal:ctrl.signal
      });
      const data=await response.json().catch(()=>({}));
      if(!response.ok||data.ok!==true)return null;
      return data;
    }catch{return null;}finally{clearTimeout(timeout);}
  }
  function scanState(cfg){
    const key=backendKey(cfg),raw=readJson(SCAN_KEY,{});
    if(!raw||typeof raw!=='object'||Array.isArray(raw)||String(raw.backendKey||'')!==key)return {backendKey:key,cursor:0,completeAt:0,lastScanAt:0};
    return {backendKey:key,cursor:Math.max(0,Number(raw.cursor||0)),completeAt:Math.max(0,Number(raw.completeAt||0)),lastScanAt:Math.max(0,Number(raw.lastScanAt||0))};
  }
  function saveScanState(next){return writeJson(SCAN_KEY,next);}
  function remoteEventCancellation(event,cfg){
    const type=String(event?.event_type||event?.eventType||'');
    if(type!=='command_patch')return false;
    const patch=event?.payload?.patch;
    if(!patch||patch.cancelled!==true)return false;
    const id=String(event?.entity_id||event?.entityId||'').trim();
    if(!id)return false;
    const created=Date.parse(String(event?.created_at||event?.createdAt||''));
    const at=cancellationAt(patch,Number.isFinite(created)?created:Date.now());
    return markObservedOnServer(id,at,backendKey(cfg));
  }
  async function scanRemote(){
    if(scanning||!navigator.onLine)return false;
    const cfg=syncConfig();
    if(!syncReady(cfg))return false;
    let scan=scanState(cfg);
    const now=Date.now();
    if(scan.completeAt>0&&scan.lastScanAt>now-REMOTE_SCAN_INTERVAL_MS)return true;
    scanning=true;
    try{
      let cursor=scan.cursor,complete=false;
      for(let page=0;page<REMOTE_SCAN_PAGES;page++){
        const data=await request(cfg,{action:'pull',afterSeq:cursor,limit:500,preferSnapshot:false});
        if(!data)return false;
        const events=Array.isArray(data.events)?data.events:[];
        let maxSeq=cursor;
        for(const event of events){
          maxSeq=Math.max(maxSeq,Number(event?.seq||0));
          remoteEventCancellation(event,cfg);
        }
        const nextCursor=Math.max(cursor,maxSeq,Number(data.cursor||0));
        cursor=nextCursor;
        complete=data.hasMore!==true;
        scan={backendKey:backendKey(cfg),cursor,completeAt:complete?Date.now():0,lastScanAt:Date.now()};
        if(!saveScanState(scan))return false;
        if(complete)break;
        if(!events.length&&nextCursor<=maxSeq)break;
      }
      enforceLocal();
      if(!complete)setTimeout(()=>scanRemote(),400);
      return true;
    }finally{scanning=false;}
  }

  async function pushBatch(cfg,records){
    const events=records.map(record=>({
      eventId:String(record.eventId||`cancel_command_${record.commandId}`),
      eventType:'command_patch',
      entityId:String(record.commandId),
      payload:{patch:{cancelled:true,cancelledAt:Number(record.cancelledAt||Date.now()),updatedAt:Number(record.cancelledAt||Date.now())}},
      deviceId:String(cfg.deviceId),
      createdAt:new Date(Number(record.cancelledAt||Date.now())).toISOString(),
      appVersion:VERSION
    }));
    return !!(await request(cfg,{action:'push',events,afterSeq:Number(cfg.cursor||0)}));
  }
  function markConfirmed(records,key){
    const next=store(),now=Date.now();
    let changed=false;
    for(const record of records){
      const id=String(record?.commandId||'');
      const current=next.records[id];
      if(!current)continue;
      if(Number(current.cancelledAt||0)!==Number(record.cancelledAt||0))continue;
      next.records[id]={...current,serverConfirmedAt:now,confirmedBackendKey:key,updatedAt:Math.max(Number(current.updatedAt||0),now)};
      changed=true;
    }
    return !changed||saveStore(next);
  }
  async function flush(){
    if(flushing||!navigator.onLine)return false;
    const cfg=syncConfig();
    if(!syncReady(cfg))return false;
    const key=backendKey(cfg),records=Object.values(store().records)
      .filter(record=>record?.commandId&&!(Number(record.serverConfirmedAt||0)>0&&String(record.confirmedBackendKey||'')===key))
      .sort((a,b)=>Number(a.cancelledAt||0)-Number(b.cancelledAt||0));
    if(!records.length)return true;
    flushing=true;
    try{
      for(let offset=0;offset<records.length;offset+=PUSH_BATCH){
        const batch=records.slice(offset,offset+PUSH_BATCH);
        if(!(await pushBatch(cfg,batch)))return false;
        if(!markConfirmed(batch,key))return false;
      }
      return true;
    }finally{flushing=false;}
  }
  function reconcile(){
    harvestCancelQueue();
    enforceLocal();
    scanRemote();
    flush();
  }
  function schedule(delay=150){
    clearTimeout(timer);
    timer=setTimeout(reconcile,Math.max(0,Number(delay)||0));
  }
  function start(){
    reconcile();
    setInterval(reconcile,RECONCILE_MS);
    window.addEventListener('online',()=>schedule(100));
    window.addEventListener('pageshow',()=>schedule(150));
    window.addEventListener('storage',event=>{if([CORE_KEY,CANCEL_QUEUE_KEY,TOMBSTONE_KEY,SCAN_KEY,SYNC_KEY].includes(String(event.key||'')))schedule(50);});
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')schedule(100);});
    window.Rota27V025197CommandCancelTombstones={
      version:VERSION,
      key:TOMBSTONE_KEY,
      reconcile,
      flush,
      scanRemote,
      pending:()=>Object.values(store().records).filter(record=>!Number(record.serverConfirmedAt||0)).length
    };
    console.info(`[Rota27] tombstones de cancelamento v${VERSION} ativos.`);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
