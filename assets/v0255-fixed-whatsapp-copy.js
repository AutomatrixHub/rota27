/* Rota 27 v0.25.5 — cópia fixa dos lançamentos de comanda
 * Destino fixo definido pela release: +55 27 99776-9279.
 * Reaproveita o mesmo backend/template do WhatsApp já configurado no aparelho.
 */
(function(){
  'use strict';

  const VERSION='0.25.5';
  const FALLBACK_PHONE='5527997769279';
  const OUTBOX_KEY='rota27_v0255_fixed_copy_outbox_v1';
  const BATCH_DELAY_MS=4500;
  const RETRY_BASE_MS=12000;
  const MAX_OUTBOX=300;
  const timers=new Map();
  let baseQueueWhatsappDelta=null;
  let flushing=false;

  function api(){return window.Rota27V017||null;}
  function byId(id){return document.getElementById(id);}
  function now(){return Date.now();}
  function clone(v){return JSON.parse(JSON.stringify(v==null?null:v));}
  function clean(v,max=220){return api()?.clean?.(v,max)||String(v??'').replace(/[\u0000-\u001f\u007f]/g,' ').trim().replace(/\s+/g,' ').slice(0,max);}
  function normalize(v){return api()?.normalizePhone?.(v)||String(v||'').replace(/\D/g,'');}
  function configured(){try{return typeof isWhatsappConfigured==='function'&&isWhatsappConfigured();}catch{return false;}}
  function wa(){try{return typeof waConfig==='object'&&waConfig?waConfig:null;}catch{return null;}}
  function fixedPhone(){
    const meta=document.querySelector('meta[name="rota27-fixed-copy-whatsapp"]')?.content||FALLBACK_PHONE;
    const phone=normalize(meta);
    return phone||FALLBACK_PHONE;
  }
  function managerPhone(){try{return normalize(state?.managerWhatsapp?.phone||'');}catch{return '';}}
  function customerPhone(c){return normalize(c?.whatsappPhone||'');}
  function shouldSkip(c){
    const fixed=fixedPhone();
    if(!fixed)return true;
    if(managerPhone()&&managerPhone()===fixed)return true;
    if(c?.whatsappOptIn===true&&customerPhone(c)===fixed)return true;
    return false;
  }
  function uid(){return globalThis.crypto?.randomUUID?`fixed_${crypto.randomUUID()}`:`fixed_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,10)}`;}
  function read(){try{const v=JSON.parse(localStorage.getItem(OUTBOX_KEY)||'[]');return Array.isArray(v)?v:[];}catch{return [];}}
  function write(rows){localStorage.setItem(OUTBOX_KEY,JSON.stringify((Array.isArray(rows)?rows:[]).slice(-MAX_OUTBOX)));renderStatusNote();}
  function commandExists(id){return (state?.commands||[]).find(c=>String(c.id)===String(id))||(state?.history||[]).find(c=>String(c.id)===String(id));}
  function commandTotalValue(c){try{return typeof commandTotal==='function'?Number(commandTotal(c)||0):Number(c?.total||0)||0;}catch{return Number(c?.total||0)||0;}}
  function commandLabelValue(c){try{return typeof commandLabel==='function'?commandLabel(c):[c?.table,c?.customer].filter(Boolean).join(' • ');}catch{return 'Comanda';}}

  function queueFixedDelta(c,p,delta){
    if(!c||!p||!delta||shouldSkip(c))return;
    let rows=read();
    let batch=rows.find(b=>String(b.commandId)===String(c.id)&&(b.status==='pending'||b.status==='failed'));
    const t=now();
    if(!batch){
      batch={id:uid(),commandId:String(c.id),phone:fixedPhone(),commandLabel:commandLabelValue(c),changes:{},createdAt:t,dueAt:t+BATCH_DELAY_MS,attempts:0,status:'pending',lastError:''};
      rows.push(batch);
    }
    const key=String(p.id||p.name);
    if(!batch.changes[key])batch.changes[key]={productId:p.id||key,name:clean(p.name||'Produto',160),unitPrice:Number(p.price||0),delta:0};
    batch.changes[key].delta+=Number(delta);
    if(!batch.changes[key].delta)delete batch.changes[key];
    batch.phone=fixedPhone();
    batch.commandLabel=commandLabelValue(c);
    batch.dueAt=t+BATCH_DELAY_MS;
    batch.status='pending';
    batch.lastError='';
    if(!Object.keys(batch.changes).length){
      rows=rows.filter(x=>x.id!==batch.id);
      const old=timers.get(batch.id);if(old)clearTimeout(old);timers.delete(batch.id);
      write(rows);return;
    }
    write(rows);schedule(batch.id);
  }

  function schedule(id){
    const b=read().find(x=>x.id===id);if(!b)return;
    const old=timers.get(id);if(old)clearTimeout(old);
    const delay=Math.max(250,Number(b.dueAt||now())-now());
    timers.set(id,setTimeout(()=>flushOne(id),Math.min(delay,2147483000)));
  }
  function resume(){read().forEach(b=>schedule(b.id));}

  async function flushOne(id){
    timers.delete(id);
    let rows=read();let batch=rows.find(x=>x.id===id);if(!batch)return;
    const c=commandExists(batch.commandId);
    if(!c||shouldSkip(c)){write(rows.filter(x=>x.id!==id));return;}
    const changes=Object.values(batch.changes||{}).filter(x=>Number(x.delta)!==0);
    if(!changes.length){write(rows.filter(x=>x.id!==id));return;}
    const cfg=wa();
    if(!configured()||!cfg?.functionUrl||!cfg?.deviceToken){
      batch.status='failed';batch.lastError='WhatsApp não configurado neste aparelho';batch.dueAt=now()+60000;write(rows);schedule(id);return;
    }

    batch.status='sending';write(rows);
    const payload={
      eventId:batch.id,
      commandId:String(c.id),
      commandLabel:`Cópia fixa • ${commandLabelValue(c)}`,
      customerName:'Rota 27',
      phone:fixedPhone(),
      consent:true,
      items:changes.map(x=>({productId:x.productId,name:x.name,delta:Number(x.delta),quantity:Math.abs(Number(x.delta)),unitPrice:Number(x.unitPrice)||0})),
      total:Number(commandTotalValue(c).toFixed(2)),
      currency:'BRL',
      audience:'manager-fixed',
      subjectCustomerName:clean(c.customer||'',120),
      sentFrom:'rota27-pwa-fixed-copy',
      clientTimestamp:new Date().toISOString()
    };

    const ctrl=new AbortController();const timeout=setTimeout(()=>ctrl.abort(),12000);
    try{
      const response=await fetch(String(cfg.functionUrl||'').replace(/\/+$/,''),{
        method:'POST',headers:{'Content-Type':'application/json','x-rota27-device-token':cfg.deviceToken},
        body:JSON.stringify(payload),signal:ctrl.signal
      });
      const data=await response.json().catch(()=>({}));
      if(!response.ok||data.ok!==true)throw new Error(data.error||`HTTP ${response.status}`);
      write(read().filter(x=>x.id!==id));
    }catch(err){
      rows=read();batch=rows.find(x=>x.id===id);if(!batch)return;
      batch.status='failed';
      batch.attempts=(batch.attempts||0)+1;
      batch.lastError=clean(err?.message||'Falha de conexão',160);
      batch.dueAt=now()+Math.min(120000,RETRY_BASE_MS*Math.pow(2,Math.min(batch.attempts-1,3)));
      write(rows);schedule(id);
    }finally{clearTimeout(timeout);}
  }

  async function flushAll(){
    if(flushing||!navigator.onLine)return;
    flushing=true;
    try{
      for(const b of read()){
        if(Number(b.dueAt||0)<=now())await flushOne(b.id);else schedule(b.id);
      }
    }finally{flushing=false;renderStatusNote();}
  }

  function patchQueue(){
    const current=window.queueWhatsappDelta;
    if(typeof current!=='function'||current.__r27v0255FixedCopy)return false;
    baseQueueWhatsappDelta=current;
    const patched=function(c,p,delta){
      const result=baseQueueWhatsappDelta.apply(this,arguments);
      try{queueFixedDelta(c,p,delta);}catch(err){console.warn('[Rota27 v0.25.5] cópia fixa:',err);}
      return result;
    };
    patched.__r27v0255FixedCopy=true;
    try{window.queueWhatsappDelta=patched;}catch{}
    try{queueWhatsappDelta=patched;}catch{}
    return true;
  }

  function injectManagerNote(){
    const sheet=byId('v017ManagerWrap')?.querySelector('.sheet');if(!sheet)return false;
    if(byId('v0255FixedCopyNote'))return true;
    const reference=sheet.querySelector('.v017-manager-note');
    const note=document.createElement('div');
    note.id='v0255FixedCopyNote';
    note.className='v017-manager-note';
    note.innerHTML='<strong>Cópia fixa adicional</strong><span>Além do gerente, os lançamentos também são enviados para <b>+55 27 99776-9279</b>. Este número é fixo nesta versão e não precisa ser configurado. Se o gerente usar o mesmo número, o Rota 27 envia apenas uma cópia.</span>';
    if(reference)reference.insertAdjacentElement('afterend',note);else sheet.prepend(note);
    return true;
  }

  function renderStatusNote(){
    injectManagerNote();
    const note=byId('v0255FixedCopyNote');if(!note)return;
    const span=note.querySelector('span');if(!span)return;
    const pending=read().length;
    span.innerHTML=`Além do gerente, os lançamentos também são enviados para <b>+55 27 99776-9279</b>. Este número é fixo nesta versão e não precisa ser configurado.${pending?` <b>${pending} envio${pending===1?'':'s'} pendente${pending===1?'':'s'}.</b>`:''}`;
  }

  function cleanupMissingCommands(){
    const kept=read().filter(b=>!!commandExists(b.commandId));if(kept.length!==read().length)write(kept);
  }

  function start(){
    patchQueue();
    injectManagerNote();
    resume();
    renderStatusNote();
    setTimeout(()=>{patchQueue();injectManagerNote();},180);
    window.addEventListener('online',()=>{resume();setTimeout(flushAll,300);});
    window.addEventListener('rota27:v017-open-manager',()=>setTimeout(()=>{injectManagerNote();renderStatusNote();},0));
    document.addEventListener('visibilitychange',()=>{
      if(document.visibilityState==='visible'){
        cleanupMissingCommands();patchQueue();resume();flushAll();injectManagerNote();
      }
    });
    window.Rota27V0255FixedCopy={version:VERSION,phone:fixedPhone(),flushAll,queueFixedDelta};
    console.info('[Rota27] v0.25.5 cópia fixa de WhatsApp ativa para +55 27 99776-9279.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
