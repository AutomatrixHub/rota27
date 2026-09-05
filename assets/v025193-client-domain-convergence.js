/* Rota 27 v0.25.193 — convergência segura do domínio de clientes */
(function(){
  'use strict';
  if(window.Rota27V025193ClientDomainConvergence)return;

  const VERSION='0.25.193';
  const TOMBSTONE_KEY='rota27_v025189_client_delete_ledger_v1';
  const previousFetch=window.fetch.bind(window);
  let replayActive=false;
  let replayDeviceId='';
  let ignoredTotal=0;
  let replayedTotal=0;

  const num=v=>Number.isFinite(Number(v))?Number(v):0;
  const normalizePhone=v=>{let d=String(v||'').replace(/\D/g,'').replace(/^0+/,'');if(d.length===10||d.length===11)d='55'+d;return d;};
  const readJson=(key,fallback)=>{try{const v=JSON.parse(localStorage.getItem(key)||'null');return v==null?fallback:v;}catch{return fallback;}};
  const eventType=e=>String(e?.event_type||e?.eventType||'');
  const eventEntity=e=>String(e?.entity_id||e?.entityId||'');
  const eventDevice=e=>String(e?.device_id||e?.deviceId||'');
  const eventTime=e=>{const raw=e?.client_created_at||e?.clientCreatedAt||e?.created_at||e?.createdAt||'';const t=Date.parse(String(raw||''));return Number.isFinite(t)?t:0;};
  const clientStamp=c=>Math.max(num(c?.lastSeenAt),num(c?.updatedAt));
  const managerStamp=m=>num(m?.updatedAt);

  function parseDomainPull(input,init){
    try{
      const url=String(typeof input==='string'?input:input?.url||'');
      if(!/\/functions\/v1\/rota27-sync\/?$/i.test(url))return null;
      if(typeof init?.body!=='string')return null;
      const body=JSON.parse(init.body);
      if(body?.action!=='pull'||String(body?.appVersion||'')!=='0.17.0')return null;
      const deviceId=String(body?.deviceId||'');
      if(!deviceId)return null;
      return {body,deviceId,afterSeq:Math.max(0,num(body?.afterSeq))};
    }catch{return null;}
  }

  function tombstoneIndex(){
    const byId=new Map(),byPhone=new Map();
    const rows=readJson(TOMBSTONE_KEY,[]);
    (Array.isArray(rows)?rows:[]).forEach(t=>{
      const at=Math.max(0,num(t?.at)),id=String(t?.id||''),phone=normalizePhone(t?.phone||'');
      if(id)byId.set(id,Math.max(at,num(byId.get(id))));
      if(phone)byPhone.set(phone,Math.max(at,num(byPhone.get(phone))));
    });
    return {byId,byPhone};
  }

  function shadowState(){
    const byId=new Map(),byPhone=new Map();
    function put(raw){
      if(!raw||typeof raw!=='object')return;
      const id=String(raw.id||''),phone=normalizePhone(raw.whatsappPhone||raw.phone||'');
      const row={...raw};
      if(id)byId.set(id,row);
      if(phone)byPhone.set(phone,row);
    }
    function get(id,phone){return (id&&byId.get(id))||(phone&&byPhone.get(phone))||null;}
    function remove(id){
      const row=id?byId.get(id):null;
      if(row){const phone=normalizePhone(row.whatsappPhone||row.phone||'');if(phone)byPhone.delete(phone);byId.delete(id);}
    }
    (Array.isArray(window.state?.clients)?window.state.clients:[]).forEach(put);
    return {put,get,remove,manager:window.state?.managerWhatsapp&&typeof window.state.managerWhatsapp==='object'?{...window.state.managerWhatsapp}:{}};
  }

  function ignoredEvent(event){
    ignoredTotal++;
    return {...event,event_type:'__r27_stale_domain_ignored__',eventType:'__r27_stale_domain_ignored__'};
  }

  function protectEvent(event,shadow,tombs){
    const type=eventType(event),payload=event?.payload&&typeof event.payload==='object'?event.payload:{};
    if(type==='client_upsert'){
      const incoming=payload.client&&typeof payload.client==='object'?payload.client:null;
      if(!incoming)return event;
      const id=eventEntity(event)||String(incoming.id||''),phone=normalizePhone(incoming.whatsappPhone||incoming.phone||'');
      const current=shadow.get(id,phone),incomingAt=clientStamp(incoming)||eventTime(event),currentAt=clientStamp(current);
      const deletedAt=Math.max(num(tombs.byId.get(id)),num(tombs.byPhone.get(phone)));
      if((currentAt>0&&(incomingAt<=0||incomingAt<currentAt))||(deletedAt>0&&(incomingAt<=0||incomingAt<=deletedAt)))return ignoredEvent(event);
      shadow.put(current?{...current,...incoming,id:current.id||incoming.id||id}:{...incoming,id:incoming.id||id});
      return event;
    }
    if(type==='client_delete'){
      const id=eventEntity(event),current=shadow.get(id,''),deletedAt=eventTime(event),currentAt=clientStamp(current);
      if(current&&currentAt>0&&(deletedAt<=0||deletedAt<currentAt))return ignoredEvent(event);
      shadow.remove(id);return event;
    }
    if(type==='manager_config_replace'){
      const incoming=payload.config&&typeof payload.config==='object'?payload.config:{};
      const incomingAt=managerStamp(incoming),currentAt=managerStamp(shadow.manager);
      if(currentAt>0&&(incomingAt<=0||incomingAt<currentAt))return ignoredEvent(event);
      shadow.manager={...shadow.manager,...incoming};return event;
    }
    return event;
  }

  function replayOwnEvent(event,deviceId){
    if(!replayActive||eventDevice(event)!==deviceId)return event;
    replayedTotal++;
    const replayId=`replay:${deviceId}`;
    return {...event,device_id:replayId,deviceId:replayId};
  }

  window.fetch=async function(input,init){
    const domain=parseDomainPull(input,init);
    const response=await previousFetch(input,init);
    if(!domain||!response.ok)return response;

    const data=await response.clone().json().catch(()=>null);
    if(!data||!Array.isArray(data.events))return response;

    if(domain.afterSeq===0||replayDeviceId!==domain.deviceId){
      replayActive=domain.afterSeq===0;
      replayDeviceId=domain.deviceId;
    }

    const shadow=shadowState(),tombs=tombstoneIndex();
    data.events=data.events.map(event=>replayOwnEvent(protectEvent(event,shadow,tombs),domain.deviceId));
    if(data.hasMore!==true)replayActive=false;

    const headers=new Headers(response.headers);
    headers.delete('content-length');
    headers.set('content-type','application/json; charset=utf-8');
    return new Response(JSON.stringify(data),{status:response.status,statusText:response.statusText,headers});
  };

  window.Rota27V025193ClientDomainConvergence={
    version:VERSION,
    status:()=>({replayActive,replayDeviceId,ignoredTotal,replayedTotal})
  };
  console.info(`[Rota27] convergência segura de clientes v${VERSION} carregada.`);
})();
