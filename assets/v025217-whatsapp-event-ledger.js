/* Rota 27 v0.25.217 — ledger imutável de eventos de WhatsApp
 * Cada mutação de item gera entregas independentes por destino, sem compensação de deltas.
 */
(function(){
  'use strict';
  if(window.Rota27V025217WhatsappEventLedger)return;

  const VERSION='0.25.217';
  const OUTBOX_KEY='rota27_v025217_whatsapp_event_outbox_v1';
  const DOMAIN_CURSOR_KEY='rota27_v017_domain_cursor_v1';
  const REPLAY_KEY='rota27_v025217_manager_replay_v1';
  const SEND_DELAY_MS=700;
  const RETRY_BASE_MS=12000;
  const timers=new Map();
  let flushing=false;

  const now=()=>Date.now();
  const clean=(v,max=180)=>String(v??'').replace(/[\u0000-\u001f\u007f]/g,' ').trim().replace(/\s+/g,' ').slice(0,max);
  const normalize=v=>{let d=String(v||'').replace(/\D/g,'').replace(/^0+/,'');if(d.length===10||d.length===11)d='55'+d;return d;};
  const validPhone=v=>normalize(v).length>=12&&normalize(v).length<=15;
  const uuid=()=>globalThis.crypto?.randomUUID?crypto.randomUUID():`${Date.now().toString(36)}_${Math.random().toString(36).slice(2,10)}`;
  const read=()=>{try{const v=JSON.parse(localStorage.getItem(OUTBOX_KEY)||'[]');return Array.isArray(v)?v:[];}catch{return [];}};
  const write=rows=>localStorage.setItem(OUTBOX_KEY,JSON.stringify(Array.isArray(rows)?rows:[]));
  const fixedPhone=()=>normalize(document.querySelector('meta[name="rota27-fixed-copy-whatsapp"]')?.content||'5527988133915');
  const manager=()=>{try{return window.Rota27V017?.sanitizeManager?.(state?.managerWhatsapp)||state?.managerWhatsapp||{};}catch{return {};}};
  const testMode=()=>{try{return window.Rota27V02581TestMode?.isActive?.()===true||document.body?.classList.contains('v02581-test-mode');}catch{return false;}};
  const commandTotalValue=c=>{try{return typeof commandTotal==='function'?Number(commandTotal(c)||0):Number(c?.total||0)||0;}catch{return Number(c?.total||0)||0;}};
  const commandLabelValue=c=>{try{return typeof commandLabel==='function'?commandLabel(c):[c?.table,c?.customer].filter(Boolean).join(' • ');}catch{return 'Comanda';}};
  const configured=()=>{try{return typeof isWhatsappConfigured==='function'&&isWhatsappConfigured()&&waConfig?.functionUrl&&waConfig?.deviceToken;}catch{return false;}};

  function enqueue(row){
    const rows=read();rows.push(row);write(rows);schedule(row.eventId);return row;
  }

  function deliveryRow(mutationId,audience,c,p,delta,phone,customerName,label){
    const eventId=`waevt_${audience}_${mutationId}`;
    return {
      eventId,mutationId,audience,commandId:String(c.id),commandLabel:clean(label,160),customerName:clean(customerName,120),phone:normalize(phone),
      item:{productId:String(p.id||p.name||''),name:clean(p.name||'Produto',160),delta:Number(delta),quantity:Math.abs(Number(delta)),unitPrice:Number(p.price||0)},
      total:Number(commandTotalValue(c).toFixed(2)),subjectCustomerName:clean(c.customer||'',120),createdAt:now(),dueAt:now()+SEND_DELAY_MS,attempts:0,status:'pending',lastError:''
    };
  }

  function queueImmutable(c,p,delta){
    if(testMode()||!c||!p||!Number(delta))return;
    const mutationId=`${String(c.id)}_${uuid()}`;
    const used=new Set();
    const fixed=fixedPhone();
    if(validPhone(fixed)){
      enqueue(deliveryRow(mutationId,'fixed',c,p,delta,fixed,'Rota 27',`Cópia fixa • ${commandLabelValue(c)}`));
      used.add(fixed);
    }

    const customerPhone=normalize(c.whatsappPhone||'');
    if(c.whatsappOptIn===true&&validPhone(customerPhone)&&!used.has(customerPhone)){
      enqueue(deliveryRow(mutationId,'customer',c,p,delta,customerPhone,c.customer||'Cliente',commandLabelValue(c)));
      used.add(customerPhone);
    }

    const m=manager(),managerPhone=normalize(m?.phone||'');
    if(m?.enabled===true&&validPhone(managerPhone)&&!used.has(managerPhone)){
      enqueue(deliveryRow(mutationId,'manager',c,p,delta,managerPhone,m.name||'Gerente',`Gerência • ${commandLabelValue(c)}`));
      used.add(managerPhone);
    }

    setTimeout(flushAll,SEND_DELAY_MS+60);
  }

  function schedule(eventId){
    const row=read().find(x=>x.eventId===eventId);if(!row)return;
    const old=timers.get(eventId);if(old)clearTimeout(old);
    const delay=Math.max(200,Number(row.dueAt||now())-now());
    timers.set(eventId,setTimeout(()=>flushOne(eventId),Math.min(delay,2147483000)));
  }

  async function flushOne(eventId){
    timers.delete(eventId);
    let rows=read(),row=rows.find(x=>x.eventId===eventId);if(!row)return;
    if(testMode()){row.dueAt=now()+60000;row.status='pending';write(rows);schedule(eventId);return;}
    if(!configured()){
      row.status='failed';row.lastError='WhatsApp não configurado neste aparelho';row.dueAt=now()+60000;write(rows);schedule(eventId);return;
    }
    if(!validPhone(row.phone)||!row.item||!Number(row.item.delta)){
      write(rows.filter(x=>x.eventId!==eventId));return;
    }
    row.status='sending';write(rows);
    const payload={
      eventId:row.eventId,mutationId:row.mutationId,audience:row.audience,commandId:row.commandId,commandLabel:row.commandLabel,customerName:row.customerName,phone:row.phone,consent:true,
      items:[row.item],total:Number(row.total||0),currency:'BRL',subjectCustomerName:row.subjectCustomerName||'',sentFrom:'rota27-pwa-event-ledger',clientTimestamp:new Date(Number(row.createdAt||now())).toISOString()
    };
    const ctrl=new AbortController(),timeout=setTimeout(()=>ctrl.abort(),12000);
    try{
      const response=await fetch(String(waConfig.functionUrl||'').replace(/\/+$/,''),{method:'POST',headers:{'Content-Type':'application/json','x-rota27-device-token':waConfig.deviceToken},body:JSON.stringify(payload),signal:ctrl.signal});
      const data=await response.json().catch(()=>({}));
      if(!response.ok||data.ok!==true)throw new Error(data.error||`HTTP ${response.status}`);
      write(read().filter(x=>x.eventId!==eventId));
    }catch(err){
      rows=read();row=rows.find(x=>x.eventId===eventId);if(!row)return;
      row.status='failed';row.attempts=(row.attempts||0)+1;row.lastError=clean(err?.message||'Falha de conexão',180);
      row.dueAt=now()+Math.min(120000,RETRY_BASE_MS*Math.pow(2,Math.min(row.attempts-1,3)));write(rows);schedule(eventId);
    }finally{clearTimeout(timeout);}
  }

  async function flushAll(){
    if(flushing||!navigator.onLine)return;flushing=true;
    try{for(const row of read()){if(Number(row.dueAt||0)<=now())await flushOne(row.eventId);else schedule(row.eventId);}}
    finally{flushing=false;}
  }

  function installDispatcher(){
    const dispatcher=function(c,p,delta){try{queueImmutable(c,p,delta);}catch(err){console.warn('[Rota27 v0.25.217] ledger WhatsApp:',err);}};
    dispatcher.__r27v025217EventLedger=true;
    dispatcher.__r27v0255FixedCopy=true;
    try{window.queueWhatsappDelta=dispatcher;}catch{}
    try{queueWhatsappDelta=dispatcher;}catch{}
  }

  function replayManagerConfigOnce(){
    try{
      if(localStorage.getItem(REPLAY_KEY)===VERSION)return;
      localStorage.setItem('rota27_v025217_domain_cursor_backup_v1',String(Math.max(0,Number(localStorage.getItem(DOMAIN_CURSOR_KEY)||0))));
      localStorage.setItem(DOMAIN_CURSOR_KEY,'0');
      localStorage.setItem(REPLAY_KEY,VERSION);
      setTimeout(()=>window.Rota27V017?.syncDomainNow?.(),250);
    }catch{}
  }

  function start(){
    installDispatcher();replayManagerConfigOnce();read().forEach(x=>schedule(x.eventId));setTimeout(flushAll,900);
    setTimeout(installDispatcher,350);
    setInterval(()=>{installDispatcher();if(navigator.onLine)flushAll();},5000);
    window.addEventListener('online',()=>{installDispatcher();setTimeout(flushAll,180);});
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){installDispatcher();setTimeout(flushAll,120);}});
    window.Rota27V025217WhatsappEventLedger={version:VERSION,queue:queueImmutable,flushAll,pending:()=>read().map(x=>({...x}))};
    console.info('[Rota27] v0.25.217 ledger imutável de WhatsApp ativo.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
