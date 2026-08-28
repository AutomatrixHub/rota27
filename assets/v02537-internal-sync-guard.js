/* Rota 27 v0.25.37 — garantia multidispositivo para consumo interno */
(function(){
  'use strict';
  const VERSION='0.25.37';
  const CONFIG_KEY='rota27_sync_config_v1';
  const OUTBOX_KEY='rota27_v02537_internal_marker_outbox_v1';
  let baseCreateCommand=null,syncing=false;
  const clone=v=>JSON.parse(JSON.stringify(v==null?null:v));
  const readJson=(k,f)=>{try{const v=JSON.parse(localStorage.getItem(k)||'null');return v==null?f:v;}catch{return f;}};
  const writeJson=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true;}catch{return false;}};
  const isInternal=c=>c?.internalConsumption===true||c?.nonRevenue===true;
  const uid=()=>globalThis.crypto?.randomUUID?crypto.randomUUID():`${Date.now().toString(36)}_${Math.random().toString(36).slice(2,10)}`;

  function config(){const c=readJson(CONFIG_KEY,{});return c&&typeof c==='object'?c:{};}
  function ready(c=config()){return c.enabled===true&&c.initialized===true&&/^https:\/\/.+\/functions\/v1\/rota27-sync\/?$/i.test(String(c.functionUrl||''))&&String(c.deviceToken||'').length>=16&&!!c.deviceId;}
  function queueMarker(c){
    if(!c?.id||!isInternal(c))return;
    const rows=readJson(OUTBOX_KEY,[]),eventId=`internal_command_opened_${String(c.id)}`;
    const marker={eventId,eventType:'command_opened',entityId:String(c.id),payload:{command:clone(c)},createdAt:new Date().toISOString(),appVersion:VERSION};
    const next=(Array.isArray(rows)?rows:[]).filter(x=>String(x?.eventId)!==eventId);next.push(marker);writeJson(OUTBOX_KEY,next.slice(-100));
    setTimeout(pushMarkers,0);
  }
  async function pushMarkers(){
    if(syncing||!navigator.onLine)return;const c=config();if(!ready(c))return;let rows=readJson(OUTBOX_KEY,[]);if(!Array.isArray(rows)||!rows.length)return;syncing=true;
    try{
      while(rows.length){
        const batch=rows.slice(0,20).map(e=>({...e,deviceId:c.deviceId}));
        const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),12000);
        let r;try{r=await fetch(String(c.functionUrl).replace(/\/+$/,''),{method:'POST',headers:{'content-type':'application/json','x-rota27-device-token':String(c.deviceToken)},body:JSON.stringify({action:'push',events:batch,deviceId:c.deviceId,deviceName:c.deviceName||'Aparelho',storeId:c.storeId||'rota27-bodega',appVersion:VERSION}),signal:ctrl.signal});}finally{clearTimeout(timer);}
        const data=await r.json().catch(()=>({}));if(!r.ok||data.ok!==true)throw new Error(data.error||`HTTP ${r.status}`);
        const sent=new Set(batch.map(x=>String(x.eventId)));rows=readJson(OUTBOX_KEY,[]).filter(x=>!sent.has(String(x?.eventId)));writeJson(OUTBOX_KEY,rows);
      }
    }catch(err){console.warn('[Rota27 v0.25.37] marcação sync consumo interno:',err?.message||err);}finally{syncing=false;}
  }
  function patchCreate(){
    if(baseCreateCommand||typeof window.createCommand!=='function')return;
    baseCreateCommand=window.createCommand;
    window.createCommand=function(){
      const before=new Set((state?.commands||[]).map(c=>String(c?.id||'')));
      const r=baseCreateCommand.apply(this,arguments);
      const created=(state?.commands||[]).find(c=>!before.has(String(c?.id||''))&&isInternal(c));if(created)queueMarker(created);
      return r;
    };
    try{createCommand=window.createCommand;}catch{}
  }
  function start(){patchCreate();setTimeout(patchCreate,450);setTimeout(pushMarkers,700);window.addEventListener('online',()=>setTimeout(pushMarkers,250));document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){patchCreate();setTimeout(pushMarkers,250);}});window.Rota27V02537InternalSync={version:VERSION,push:pushMarkers};}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
