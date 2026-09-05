/* Rota 27 v0.25.195 — aviso de cancelamento de comanda pelo WhatsApp */
(function(){
  'use strict';

  const VERSION='0.25.195';
  const OUTBOX_KEY='rota27_v02573_cancel_whatsapp_outbox_v1';
  const SENT_KEY='rota27_v02573_cancel_whatsapp_sent_v1';
  const WA_KEY='rota27_whatsapp_config_v1';
  const FLUSH_BATCH=20;
  const MAX_SENT=300;
  let flushing=false;
  let retryTimer=null;

  const clean=(v,max=180)=>String(v??'').replace(/[\u0000-\u001f\u007f]/g,' ').trim().replace(/\s+/g,' ').slice(0,max);
  const clone=v=>JSON.parse(JSON.stringify(v==null?null:v));
  const readJson=(key,fallback)=>{try{const v=JSON.parse(localStorage.getItem(key)||'null');return v==null?fallback:v;}catch{return fallback;}};
  const writeJson=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}};
  const normalizePhone=v=>{try{if(typeof normalizeWhatsappPhone==='function')return normalizeWhatsappPhone(v);}catch{}let d=String(v||'').replace(/\D/g,'').replace(/^0+/,'');if(d.length===10||d.length===11)d='55'+d;return d;};
  const validPhone=v=>{const d=normalizePhone(v);return d.length>=12&&d.length<=15;};

  function readOutbox(){const rows=readJson(OUTBOX_KEY,[]);return Array.isArray(rows)?rows:[];}
  function saveOutbox(rows){return writeJson(OUTBOX_KEY,Array.isArray(rows)?rows:[]);}
  function readSent(){const rows=readJson(SENT_KEY,[]);return Array.isArray(rows)?rows:[];}
  function wasSent(commandId){return readSent().some(x=>String(x?.commandId||'')===String(commandId||''));}
  function markSent(row){
    const sent=readSent().filter(x=>String(x?.commandId||'')!==String(row.commandId||''));
    sent.push({commandId:String(row.commandId||''),eventId:String(row.eventId||''),sentAt:Date.now()});
    return writeJson(SENT_KEY,sent.slice(-MAX_SENT));
  }

  function waConfig(){
    const raw=readJson(WA_KEY,{});
    let functionUrl=clean(raw?.functionUrl||'',500).replace(/\/+$/,'');
    if(/\/rota27-sync$/i.test(functionUrl))functionUrl=functionUrl.replace(/\/rota27-sync$/i,'/rota27-whatsapp');
    return {functionUrl,deviceToken:clean(raw?.deviceToken||'',500)};
  }
  function waReady(){const c=waConfig();return /^https:\/\/.+\/functions\/v1\/rota27-whatsapp$/i.test(c.functionUrl)&&c.deviceToken.length>=16;}

  function productMeta(c,id){
    const meta=c?.itemMeta?.[id];if(meta)return meta;
    try{return (state?.catalog||[]).find(p=>String(p?.id||'')===String(id))||null;}catch{return null;}
  }
  function cancellationItems(c){
    return Object.entries(c?.items||{})
      .map(([id,qty])=>{
        const q=Math.max(0,Number(qty||0));if(!q)return null;
        const p=productMeta(c,id)||{};
        return {productId:String(id),name:clean(p.name||'Produto',160),unitPrice:Math.max(0,Number(p.price||0)),delta:-q,quantity:q};
      })
      .filter(Boolean)
      .slice(0,30);
  }
  function commandLabel(c){
    const base=clean(c?.table||c?.customer||'Comanda',120)||'Comanda';
    return `${base} • CANCELADA`;
  }

  function currentCommandSnapshot(){
    let c=null;
    try{if(typeof currentCommand==='function')c=currentCommand();}catch{}
    if(!c){
      try{const id=typeof activeCommandId!=='undefined'?String(activeCommandId||''):'';c=(state?.commands||[]).find(x=>String(x?.id||'')===id)||null;}catch{}
    }
    return c?clone(c):null;
  }

  function isCancellationWhatsappEligible(c){
    return !!(c?.id&&c.cancelled!==true&&c.whatsappOptIn===true&&validPhone(c.whatsappPhone||'')&&cancellationItems(c).length);
  }

  function decorateCancelConfirm(){
    const summary=document.getElementById('v0151CancelSummary');
    if(!summary)return;
    const snapshot=currentCommandSnapshot();
    summary.innerHTML=summary.innerHTML.replace(
      'e nenhum envio pendente de WhatsApp desta comanda será tentado.',
      'e os envios pendentes anteriores desta comanda serão cancelados.'
    );
    summary.querySelector('.v02573-cancel-wa-note')?.remove();
    const note=document.createElement('div');
    note.className='v02573-cancel-wa-note';
    note.style.cssText='margin-top:12px;padding:10px 11px;border-radius:12px;background:#f4e5d2;color:#68442b;font-size:12px;line-height:1.4;';
    if(isCancellationWhatsappEligible(snapshot)){
      note.innerHTML='<strong>WhatsApp:</strong> o cliente será avisado do cancelamento, com os itens marcados como removidos e total atualizado para R$ 0,00.';
    }else{
      note.innerHTML='<strong>WhatsApp:</strong> não há aviso de cancelamento a enviar para esta comanda.';
    }
    summary.appendChild(note);
  }

  function queueCancellation(c){
    if(!isCancellationWhatsappEligible(c))return false;
    const phone=normalizePhone(c.whatsappPhone||'');
    const items=cancellationItems(c);
    if(wasSent(c.id))return false;

    const rows=readOutbox();
    if(rows.some(x=>String(x?.commandId||'')===String(c.id)))return true;
    const now=Date.now();
    rows.push({
      id:`cancelwa_${String(c.id)}`,
      eventId:`cancel_whatsapp_${String(c.id)}`,
      commandId:String(c.id),
      commandLabel:commandLabel(c),
      customerName:clean(c.customer||'Cliente',120)||'Cliente',
      phone,
      consent:true,
      items,
      total:0,
      createdAt:now,
      dueAt:now+350,
      attempts:0,
      lastError:''
    });
    if(!saveOutbox(rows))return false;
    scheduleFlush(380);
    return true;
  }

  function scheduleFlush(delay=500){
    clearTimeout(retryTimer);
    retryTimer=setTimeout(()=>flushOutbox(),Math.max(250,Number(delay)||500));
  }

  async function sendRow(row){
    const cfg=waConfig();
    if(!waReady())throw new Error('Integração WhatsApp não configurada.');
    const ctrl=new AbortController();const timeout=setTimeout(()=>ctrl.abort(),12000);
    try{
      const response=await fetch(cfg.functionUrl,{
        method:'POST',
        headers:{'content-type':'application/json','x-rota27-device-token':cfg.deviceToken},
        body:JSON.stringify({
          eventId:row.eventId,
          commandId:row.commandId,
          commandLabel:row.commandLabel,
          customerName:row.customerName,
          phone:row.phone,
          consent:true,
          items:row.items,
          total:0,
          currency:'BRL',
          sentFrom:'rota27-pwa-cancel',
          clientVersion:VERSION,
          clientTimestamp:new Date().toISOString()
        }),
        signal:ctrl.signal
      });
      const data=await response.json().catch(()=>({}));
      if(!response.ok||data.ok!==true)throw new Error(data.error||`HTTP ${response.status}`);
      return data;
    }finally{clearTimeout(timeout);}
  }

  async function flushOutbox(){
    if(flushing||!navigator.onLine)return false;
    const initial=readOutbox();if(!initial.length)return true;
    flushing=true;
    let nextDelay=null;
    try{
      const batch=initial.slice(0,FLUSH_BATCH),sent=new Set(),updates=new Map();
      for(const row of batch){
        const id=String(row?.id||'');
        if(wasSent(row.commandId)){sent.add(id);continue;}
        if(Number(row.dueAt||0)>Date.now()){
          updates.set(id,row);
          const delay=Number(row.dueAt)-Date.now();nextDelay=nextDelay==null?delay:Math.min(nextDelay,delay);
          continue;
        }
        try{
          await sendRow(row);
          markSent(row);
          sent.add(id);
          try{if(typeof showToast==='function')showToast('Cliente avisado do cancelamento pelo WhatsApp.',false);}catch{}
        }catch(err){
          const attempts=Math.max(0,Number(row.attempts||0))+1;
          const delay=Math.min(120000,15000*Math.pow(2,Math.min(attempts-1,3)));
          updates.set(id,{...row,attempts,lastError:clean(err?.message||'Falha de conexão',180),dueAt:Date.now()+delay});
          nextDelay=nextDelay==null?delay:Math.min(nextDelay,delay);
        }
      }

      const currentRows=readOutbox();
      const next=currentRows.map(row=>{
        const id=String(row?.id||'');
        if(sent.has(id))return null;
        if(updates.has(id))return updates.get(id);
        return row;
      }).filter(Boolean);

      if(!saveOutbox(next)){
        console.warn('[Rota27 v0.25.195] Não foi possível confirmar a fila de aviso de cancelamento; itens enviados permanecerão para repetição idempotente.');
        return false;
      }
      if(next.length&&navigator.onLine){
        const ready=next.some(row=>Number(row?.dueAt||0)<=Date.now());
        scheduleFlush(ready?350:Math.max(500,nextDelay||15000));
      }
      return next.length===0;
    }finally{flushing=false;}
  }

  function handleDurableCancellation(event){
    const snapshot=event?.detail?.command;
    if(!snapshot)return;
    const eligible=isCancellationWhatsappEligible(snapshot);
    if(!eligible)return;
    if(queueCancellation(snapshot))return;
    try{if(typeof showToast==='function')showToast('Comanda cancelada, mas o aviso de WhatsApp não pôde ser enfileirado neste aparelho.',true);}catch{}
  }

  function start(){
    document.addEventListener('click',e=>{
      if(e.target?.closest?.('#v0151CancelCommandBtn'))queueMicrotask(decorateCancelConfirm);
    });
    window.addEventListener('rota27:command-cancelled-durable',handleDurableCancellation);
    window.addEventListener('online',()=>scheduleFlush(300));
    window.addEventListener('pageshow',()=>scheduleFlush(450));
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')scheduleFlush(450);});
    scheduleFlush(800);
    window.Rota27V02573WhatsappCancel={version:VERSION,flush:flushOutbox,pending:()=>readOutbox().length,decorateCancelConfirm};
    console.info('[Rota27] v0.25.195 — aviso WhatsApp de cancelamento ativo após confirmação durável.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
