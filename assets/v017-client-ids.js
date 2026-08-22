/* Rota 27 v0.17.0 — IDs canônicos para clientes com WhatsApp */
(function(){
  'use strict';
  const OUTBOX_KEY='rota27_v017_domain_outbox_v1';
  let running=false;

  function api(){return window.Rota27V017||null;}
  function normalize(v){
    try{return api()?.normalizePhone?.(v)||String(v||'').replace(/\D/g,'');}catch{return String(v||'').replace(/\D/g,'');}
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
    if(typeof state==='undefined'||!state||!Array.isArray(state.clients))return;
    if(document.getElementById('v017ClientEditWrap')?.classList.contains('open'))return;
    let changed=false;
    const map=new Map();
    for(const raw of state.clients){
      if(!raw||typeof raw!=='object')continue;
      const p=normalize(raw.whatsappPhone||'');
      const id=p?canonicalId(p):String(raw.id||'');
      const client={...raw,id:id||raw.id};
      if(client.id!==raw.id)changed=true;
      const key=p?`p:${p}`:`i:${client.id}`;
      const old=map.get(key);
      if(!old){map.set(key,client);continue;}
      changed=true;
      const newer=Number(client.lastSeenAt||0)>=Number(old.lastSeenAt||0)?client:old;
      const older=newer===client?old:client;
      map.set(key,{...older,...newer,id:p?canonicalId(p):(newer.id||older.id),firstSeenAt:Math.min(Number(old.firstSeenAt||Date.now()),Number(client.firstSeenAt||Date.now())),lastSeenAt:Math.max(Number(old.lastSeenAt||0),Number(client.lastSeenAt||0))});
    }
    const next=[...map.values()];
    if(next.length!==state.clients.length)changed=true;
    if(changed){state.clients=next;try{if(typeof save==='function')save();}catch{}}
  }

  function run(){
    if(running)return;running=true;
    try{canonicalizeState();canonicalizeOutbox();}
    finally{running=false;}
  }

  function start(){
    run();
    window.addEventListener('rota27:v017-domain-updated',()=>setTimeout(run,0));
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')run();});
    setInterval(run,350);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
