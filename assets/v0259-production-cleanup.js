/* Rota 27 v0.25.9 — limpeza controlada de uma comanda de teste em produção */
(function(){
  'use strict';

  const VERSION='0.25.9';
  const COMMAND_ID='c1787598217117';
  const BUSINESS_DATE='2026-08-24';
  const CLIENT_ID='cli_p_5527988553392';
  const CLIENT_PHONE='5527988553392';
  const CLIENT_NAME='Mamute';
  const TURN_KEY='rota27_v019_turn_closures_v1';
  const TURN_OUTBOX_KEY='rota27_v019_turn_outbox_v1';
  const SYNC_CONFIG_KEY='rota27_sync_config_v1';
  const DOMAIN_OUTBOX_KEY='rota27_v017_domain_outbox_v1';
  const FIXED_COPY_OUTBOX_KEY='rota27_v0255_fixed_copy_outbox_v1';
  const FLAG_KEY='rota27_v0259_cleanup_c1787598217117_v1';
  const TEST_OPEN_SEEN=1787598217144;
  const TEST_CLOSED=1787598227336;

  function clone(v){return JSON.parse(JSON.stringify(v==null?null:v));}
  function read(key,fallback){try{const v=JSON.parse(localStorage.getItem(key)||'null');return v==null?fallback:v;}catch{return fallback;}}
  function write(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}}
  function norm(v){return String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLocaleLowerCase('pt-BR');}
  function phone(v){return String(v||'').replace(/\D/g,'');}
  function currentState(){try{return typeof state!=='undefined'&&state?state:null;}catch{return null;}}
  function commandMatches(c){return String(c?.id||'')===COMMAND_ID;}

  function purgeMainSyncOutbox(){
    const cfg=read(SYNC_CONFIG_KEY,{});if(!cfg||typeof cfg!=='object'||!Array.isArray(cfg.outbox))return false;
    const before=cfg.outbox.length;
    cfg.outbox=cfg.outbox.filter(e=>{
      const entity=String(e?.entityId||e?.entity_id||'');
      const cmd=String(e?.payload?.command?.id||e?.payload?.commandId||'');
      return entity!==COMMAND_ID&&cmd!==COMMAND_ID;
    });
    if(cfg.outbox.length!==before){write(SYNC_CONFIG_KEY,cfg);return true;}return false;
  }

  function purgeDomainOutbox(){
    const rows=read(DOMAIN_OUTBOX_KEY,[]);if(!Array.isArray(rows))return false;
    const kept=rows.filter(e=>{
      if(String(e?.eventType||e?.event_type||'')!=='client_upsert')return true;
      if(String(e?.entityId||e?.entity_id||'')!==CLIENT_ID)return true;
      const seen=Number(e?.payload?.client?.lastSeenAt||0);
      return seen!==TEST_OPEN_SEEN&&seen!==TEST_CLOSED;
    });
    if(kept.length!==rows.length){write(DOMAIN_OUTBOX_KEY,kept);return true;}return false;
  }

  function purgeFixedCopyOutbox(){
    const rows=read(FIXED_COPY_OUTBOX_KEY,[]);if(!Array.isArray(rows))return false;
    const kept=rows.filter(x=>String(x?.commandId||'')!==COMMAND_ID);
    if(kept.length!==rows.length){write(FIXED_COPY_OUTBOX_KEY,kept);return true;}return false;
  }

  function correctTurnClosure(){
    const rows=read(TURN_KEY,[]);if(!Array.isArray(rows))return false;
    let changed=false;
    rows.forEach(c=>{
      if(String(c?.businessDate||'')!==BUSINESS_DATE||!c?.summary)return;
      const s=c.summary;
      const hasTestProduct=Array.isArray(s.products)&&s.products.some(p=>norm(p?.name)==='red ale artesanal 500ml'&&Number(p?.qty||0)===1&&Math.abs(Number(p?.revenue||0)-22)<0.001);
      if(Number(s.closedCount||0)===1&&Math.abs(Number(s.revenue||0)-22)<0.001&&hasTestProduct){
        c.summary={...s,revenue:0,closedCount:0,avgTicket:0,units:0,products:[],payments:[]};
        changed=true;
      }
    });
    if(changed)write(TURN_KEY,rows);

    const outbox=read(TURN_OUTBOX_KEY,[]);
    if(Array.isArray(outbox)){
      const kept=outbox.filter(e=>String(e?.eventId||'')!==`turn_closed_${BUSINESS_DATE}`&&String(e?.entityId||'')!==`turn_${BUSINESS_DATE}`);
      if(kept.length!==outbox.length){write(TURN_OUTBOX_KEY,kept);changed=true;}
    }
    return changed;
  }

  function correctClient(s){
    if(!Array.isArray(s?.clients))return false;
    const idx=s.clients.findIndex(c=>String(c?.id||'')===CLIENT_ID||(phone(c?.whatsappPhone)===CLIENT_PHONE&&norm(c?.name)===norm(CLIENT_NAME)));
    if(idx<0)return false;
    const c=s.clients[idx];
    const rows=[...(Array.isArray(s.history)?s.history:[]),...(Array.isArray(s.commands)?s.commands.filter(x=>x?.cancelled!==true):[])].filter(x=>{
      if(commandMatches(x))return false;
      if(norm(x?.customer)!==norm(CLIENT_NAME))return false;
      const p=phone(x?.whatsappPhone);
      return !p||p===CLIENT_PHONE;
    });
    if(!rows.length)return false;
    const latest=Math.max(...rows.map(x=>Number(x?.closedAt||x?.updatedAt||x?.createdAt||0)).filter(Number.isFinite));
    const earliest=Math.min(...rows.map(x=>Number(x?.createdAt||x?.closedAt||0)).filter(v=>Number.isFinite(v)&&v>0));
    let changed=false;
    if(Number.isFinite(latest)&&latest>0&&Number(c.lastSeenAt||0)!==latest){c.lastSeenAt=latest;changed=true;}
    if(Number.isFinite(earliest)&&earliest>0&&(!Number(c.firstSeenAt||0)||Number(c.firstSeenAt)>earliest)){c.firstSeenAt=earliest;changed=true;}
    return changed;
  }

  function renderAfter(){
    try{if(typeof renderCommands==='function')renderCommands();}catch{}
    try{if(typeof renderHistory==='function')renderHistory();}catch{}
    try{if(typeof renderMenu==='function')renderMenu();}catch{}
    try{window.Rota27V017?.updateAdminCards?.();}catch{}
    try{window.dispatchEvent(new CustomEvent('rota27:v017-domain-updated'));}catch{}
    try{window.dispatchEvent(new CustomEvent('rota27:v019-turn-updated'));}catch{}
  }

  function purge(reason='startup'){
    const s=currentState();if(!s)return false;
    let changed=false;
    const beforeCommands=Array.isArray(s.commands)?s.commands.length:0;
    const beforeHistory=Array.isArray(s.history)?s.history.length:0;
    if(Array.isArray(s.commands))s.commands=s.commands.filter(c=>!commandMatches(c));
    if(Array.isArray(s.history))s.history=s.history.filter(c=>!commandMatches(c));
    if((s.commands?.length||0)!==beforeCommands||(s.history?.length||0)!==beforeHistory)changed=true;

    try{if(typeof activeCommandId!=='undefined'&&String(activeCommandId||'')===COMMAND_ID)activeCommandId=null;}catch{}
    if(correctClient(s))changed=true;
    if(purgeMainSyncOutbox())changed=true;
    if(purgeDomainOutbox())changed=true;
    if(purgeFixedCopyOutbox())changed=true;
    if(correctTurnClosure())changed=true;

    if(changed){
      try{if(typeof save==='function')save();}catch(err){console.warn('[Rota27 v0.25.9] falha ao persistir limpeza local:',err);}
      renderAfter();
    }
    try{localStorage.setItem(FLAG_KEY,JSON.stringify({version:VERSION,commandId:COMMAND_ID,at:new Date().toISOString(),reason,changed}));}catch{}
    return changed;
  }

  function start(){
    purge('startup');
    setTimeout(()=>purge('post-sync-2s'),2000);
    setTimeout(()=>purge('post-sync-10s'),10000);
    window.addEventListener('online',()=>setTimeout(()=>purge('online'),1800));
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')purge('visible');});
    window.Rota27V0259ProductionCleanup={version:VERSION,commandId:COMMAND_ID,purge};
    console.info('[Rota27] v0.25.9 limpeza controlada da comanda de teste protegida.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
