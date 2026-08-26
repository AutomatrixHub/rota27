/* Rota 27 v0.25.16 — reparo histórico idempotente do fechamento de 25/08 */
(function(){
  'use strict';

  const VERSION='0.25.16';
  const REPAIR_STATE_KEY='rota27_v02516_turn_repair_state_v1';
  const REPAIR_CURSOR_KEY='rota27_v02516_turn_repair_cursor_v1';
  const CLOSURE_STORE_KEY='rota27_v019_turn_closures_v1';
  const SYNC_CONFIG_KEY='rota27_sync_config_v1';
  let syncing=false;

  const BUILTIN_REPAIR={
    id:'repair_turn_fred_20260826_v1',
    reason:'A comanda c1787690191876 foi aberta em 25/08/2026 e fechada administrativamente em 26/08/2026. O turn_closed seq 539 classificou a venda em 26/08 antes da publicação da v0.25.15. Este reparo preserva o evento original para auditoria e substitui apenas a visão operacional efetiva.',
    commandId:'c1787690191876',
    receivableId:'recv_c1787690191876',
    sourceSeqs:{commandOpened:397,receivableUpsert:535,commandClosed:536,turnClosed:539},
    supersededClosureIds:['turn_2026-08-26'],
    supersededClosure:{
      id:'turn_2026-08-26',
      storeId:'rota27-bodega',
      businessDate:'2026-08-26',
      closedAt:1787766350444,
      closedAtIso:'2026-08-26T17:45:50.444Z',
      timezoneOffsetMinutes:180,
      deviceId:'dev_af201194-9b36-481b-9908-83480b66fe51',
      deviceName:'Edge 30',
      appVersion:'0.19.0',
      schemaVersion:1,
      summary:{
        units:7,revenue:145,avgTicket:145,cancelled:0,openCount:0,openValue:0,auditEvents:1,closedCount:1,auditServerSynced:true,
        payments:[{name:'A receber',value:145}],
        products:[
          {qty:5,name:'Chope Brahma 300ml',revenue:50},
          {qty:1,name:'Cachaça Pratinha 750ml',revenue:65},
          {qty:1,name:'Lombo Defumado',revenue:30}
        ]
      }
    },
    replacementClosure:{
      id:'turn_2026-08-25_repair_fred_20260826_v1',
      storeId:'rota27-bodega',
      businessDate:'2026-08-25',
      shiftStartedAt:1787690191876,
      closedAt:1787766350444,
      closedAtIso:'2026-08-26T17:45:50.444Z',
      timezoneOffsetMinutes:180,
      deviceId:'admin_repair_v02516',
      deviceName:'Reparo administrativo',
      appVersion:VERSION,
      schemaVersion:4,
      repairId:'repair_turn_fred_20260826_v1',
      repairedFrom:{eventId:'turn_closed_2026-08-26',entityId:'turn_2026-08-26',seq:539},
      summary:{
        businessDate:'2026-08-25',
        revenue:448,
        closedCount:8,
        openCount:0,
        openValue:0,
        avgTicket:56,
        units:33,
        cancelled:0,
        auditEvents:1,
        auditServerSynced:true,
        shiftStart:1787690191876,
        firstOpenedAt:1787690191876,
        payments:[
          {name:'A receber',value:145},
          {name:'Pix',value:132},
          {name:'Débito',value:104},
          {name:'Crédito',value:67}
        ],
        products:[
          {qty:15,name:'Chope Brahma 300ml',revenue:150},
          {qty:8,name:'Cerveja Original 300ml',revenue:48},
          {qty:2,name:'Lombo Defumado',revenue:60},
          {qty:2,name:'Cerveja IPA 500ml - Rochi Beer',revenue:46},
          {qty:2,name:'Chope Ipa Ronchi 500ml',revenue:46},
          {qty:1,name:'Cachaça Pratinha 750ml',revenue:65},
          {qty:1,name:'Copinho Torresmo',revenue:17},
          {qty:1,name:'Água Pedra Azul 1L',revenue:10},
          {qty:1,name:'Coca 220ml',revenue:6}
        ]
      }
    }
  };

  const clone=v=>JSON.parse(JSON.stringify(v==null?null:v));
  const clean=(v,max=200)=>String(v??'').replace(/[\u0000-\u001f\u007f]/g,' ').trim().replace(/\s+/g,' ').slice(0,max);
  function readJson(key,fallback){try{const v=JSON.parse(localStorage.getItem(key)||'null');return v==null?fallback:v;}catch{return fallback;}}
  function writeJson(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}}
  function readArray(key){const v=readJson(key,[]);return Array.isArray(v)?v:[];}
  function readState(){const s=readJson(REPAIR_STATE_KEY,{});return s&&typeof s==='object'?{repairs:s.repairs&&typeof s.repairs==='object'?s.repairs:{},archivedClosures:s.archivedClosures&&typeof s.archivedClosures==='object'?s.archivedClosures:{},lastEnforcedAt:Number(s.lastEnforcedAt||0),lastSyncAt:Number(s.lastSyncAt||0),lastError:clean(s.lastError||'',260)}:{repairs:{},archivedClosures:{},lastEnforcedAt:0,lastSyncAt:0,lastError:''};}
  function writeState(s){return writeJson(REPAIR_STATE_KEY,s);}

  function normalizeRepair(raw){
    const r=raw?.repair&&typeof raw.repair==='object'?raw.repair:raw;
    if(!r||typeof r!=='object'||!r.id||!r.replacementClosure?.id)return null;
    const superseded=Array.isArray(r.supersededClosureIds)?r.supersededClosureIds.map(x=>clean(x,160)).filter(Boolean):[];
    if(!superseded.length)return null;
    return {...clone(r),id:clean(r.id,160),supersededClosureIds:superseded};
  }

  function registerRepair(raw,meta={}){
    const repair=normalizeRepair(raw);if(!repair)return false;
    const s=readState(),prev=s.repairs[repair.id]||{};
    s.repairs[repair.id]={...prev,...clone(repair),source:clean(meta.source||prev.source||'remote',40),remoteSeq:Math.max(Number(prev.remoteSeq||0),Number(meta.seq||0)),registeredAt:Number(prev.registeredAt||Date.now())};
    writeState(s);enforceRepairs();return true;
  }

  function allRepairs(){return Object.values(readState().repairs||{}).map(normalizeRepair).filter(Boolean);}
  function isClosureSuperseded(id){const key=String(id||'');return allRepairs().some(r=>r.supersededClosureIds.some(x=>String(x)===key));}

  function enforceRepairs(){
    const s=readState(),repairs=Object.values(s.repairs||{}).map(normalizeRepair).filter(Boolean);if(!repairs.length)return false;
    let closures=readArray(CLOSURE_STORE_KEY),changed=false;
    for(const repair of repairs){
      const superseded=new Set(repair.supersededClosureIds.map(String));
      const keep=[];
      for(const row of closures){
        if(row?.id&&superseded.has(String(row.id))){
          if(!s.archivedClosures[String(row.id)])s.archivedClosures[String(row.id)]={repairId:repair.id,archivedAt:Date.now(),closure:clone(row)};
          changed=true;continue;
        }
        keep.push(row);
      }
      if(repair.supersededClosure?.id&&!s.archivedClosures[String(repair.supersededClosure.id)]){
        s.archivedClosures[String(repair.supersededClosure.id)]={repairId:repair.id,archivedAt:Date.now(),closure:clone(repair.supersededClosure),source:'repair-descriptor'};
      }
      const replacement=clone(repair.replacementClosure);
      const idx=keep.findIndex(x=>String(x?.id||'')===String(replacement.id));
      if(idx<0){keep.push(replacement);changed=true;}
      else if(JSON.stringify(keep[idx])!==JSON.stringify(replacement)){keep[idx]=replacement;changed=true;}
      closures=keep;
    }
    closures.sort((a,b)=>Number(b?.closedAt||0)-Number(a?.closedAt||0));
    if(changed)writeJson(CLOSURE_STORE_KEY,closures.slice(0,900));
    s.lastEnforcedAt=Date.now();writeState(s);
    if(changed){try{window.dispatchEvent(new CustomEvent('rota27:v017-domain-updated',{detail:{source:'v0.25.16-turn-repair'}}));}catch{}}
    return changed;
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
  function getCursor(){return Math.max(0,Number(localStorage.getItem(REPAIR_CURSOR_KEY)||0));}
  function setCursor(v){localStorage.setItem(REPAIR_CURSOR_KEY,String(Math.max(0,Number(v||0))));}
  async function pullRepairs(){
    let cursor=getCursor(),changed=false;
    for(let page=0;page<40;page++){
      const data=await api({action:'pull',afterSeq:cursor,limit:500,preferSnapshot:false}),events=Array.isArray(data.events)?data.events:[];
      for(const evt of events){
        cursor=Math.max(cursor,Number(evt.seq||0));
        if(String(evt.event_type||evt.eventType)==='turn_closure_repair'&&registerRepair(evt.payload||{}, {source:'remote',seq:Number(evt.seq||0)}))changed=true;
      }
      cursor=Math.max(cursor,Number(data.cursor||cursor));setCursor(cursor);
      if(!data.hasMore||!events.length)break;
    }
    return changed;
  }
  async function syncNow(){
    if(syncing||!navigator.onLine||!syncReady())return false;syncing=true;
    try{await pullRepairs();const s=readState();s.lastSyncAt=Date.now();s.lastError='';writeState(s);enforceRepairs();return true;}
    catch(err){const s=readState();s.lastError=clean(err?.message||'Falha ao sincronizar reparos.',260);writeState(s);console.warn('[Rota27 v0.25.16] reparo histórico:',s.lastError);return false;}
    finally{syncing=false;}
  }

  function scheduleEnforcement(){setTimeout(enforceRepairs,0);setTimeout(enforceRepairs,900);setTimeout(enforceRepairs,2600);}
  function start(){
    registerRepair(BUILTIN_REPAIR,{source:'builtin'});scheduleEnforcement();
    window.addEventListener('online',()=>{syncNow();scheduleEnforcement();});
    window.addEventListener('storage',e=>{if(e.key===CLOSURE_STORE_KEY||e.key===REPAIR_STATE_KEY)scheduleEnforcement();});
    window.addEventListener('rota27:v019-turn-updated',scheduleEnforcement);
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){scheduleEnforcement();if(navigator.onLine)syncNow();}});
    if(navigator.onLine)setTimeout(syncNow,250);
    console.info('[Rota27] v0.25.16 — reparo histórico de fechamento carregado.');
  }

  window.Rota27V02516Repair={version:VERSION,repairId:BUILTIN_REPAIR.id,isClosureSuperseded,enforce:enforceRepairs,sync:syncNow,getState:()=>clone(readState()),getBuiltinRepair:()=>clone(BUILTIN_REPAIR)};
  registerRepair(BUILTIN_REPAIR,{source:'builtin'});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
