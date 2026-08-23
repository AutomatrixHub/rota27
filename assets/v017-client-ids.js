/* Rota 27 v0.17.0 — IDs canônicos para clientes com WhatsApp */
(function(){
  'use strict';
  const OUTBOX_KEY='rota27_v017_domain_outbox_v1';
  let running=false;
  let baseSave=null;

  function api(){return window.Rota27V017||null;}
  function normalize(v){
    try{return api()?.normalizePhone?.(v)||String(v||'').replace(/\D/g,'');}
    catch{return String(v||'').replace(/\D/g,'');}
  }
  function canonicalId(phone){const p=normalize(phone);return p?`cli_p_${p}`:'';}
  function readOutbox(){try{const rows=JSON.parse(localStorage.getItem(OUTBOX_KEY)||'[]');return Array.isArray(rows)?rows:[];}catch{return [];}}

  function canonicalizeOutbox(){
    const rows=readOutbox();let changed=false;
    rows.forEach(evt=>{
      if(evt?.eventType!=='client_upsert')return;
      const client=evt?.payload?.client;if(!client)return;
      const id=canonicalId(client.whatsappPhone||client.phone||'');if(!id)return;
      if(client.id!==id){client.id=id;changed=true;}
      if(evt.entityId!==id){evt.entityId=id;changed=true;}
    });
    if(changed)localStorage.setItem(OUTBOX_KEY,JSON.stringify(rows));
  }

  function canonicalizeState(){
    if(typeof state==='undefined'||!state||!Array.isArray(state.clients))return false;
    let changed=false;
    const byKey=new Map();
    const next=[];

    for(const raw of state.clients){
      if(!raw||typeof raw!=='object')continue;
      const phone=normalize(raw.whatsappPhone||'');
      const id=phone?canonicalId(phone):String(raw.id||'');
      if(id&&raw.id!==id){raw.id=id;changed=true;}
      const key=phone?`p:${phone}`:`i:${raw.id}`;
      const existing=byKey.get(key);
      if(!existing){byKey.set(key,raw);next.push(raw);continue;}

      changed=true;
      const existingTime=Number(existing.lastSeenAt||0);
      const incomingTime=Number(raw.lastSeenAt||0);
      const newer=incomingTime>=existingTime?raw:existing;
      const older=newer===raw?existing:raw;
      const keepId=phone?canonicalId(phone):(newer.id||older.id);
      Object.assign(existing,older,newer,{
        id:keepId,
        firstSeenAt:Math.min(Number(existing.firstSeenAt||Date.now()),Number(raw.firstSeenAt||Date.now())),
        lastSeenAt:Math.max(existingTime,incomingTime)
      });
    }

    if(next.length!==state.clients.length){state.clients=next;changed=true;}
    return changed;
  }

  function run(){
    if(running)return false;running=true;
    try{const changed=canonicalizeState();canonicalizeOutbox();return changed;}
    finally{running=false;}
  }

  function patchSave(){
    if(baseSave||typeof save!=='function')return;
    baseSave=save;
    const wrapped=function(){
      run();
      const result=baseSave.apply(this,arguments);
      canonicalizeOutbox();
      return result;
    };
    try{save=wrapped;}catch{}
    try{window.save=wrapped;}catch{}
  }

  function start(){
    const changed=run();
    patchSave();
    if(changed&&baseSave){try{baseSave();}catch{}}
    window.addEventListener('rota27:v017-domain-updated',()=>setTimeout(()=>{run();},0));
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')run();});
    window.addEventListener('pageshow',()=>setTimeout(run,0));
    setTimeout(run,300);
    setTimeout(run,750);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
