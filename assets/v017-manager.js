/* Rota 27 v0.17.0 — cópia dos lançamentos para o WhatsApp do gerente */
(function(){
  'use strict';

  const VERSION='0.17.0';
  const OUTBOX_KEY='rota27_v017_manager_outbox_v1';
  const BATCH_DELAY_MS=4500;
  const RETRY_BASE_MS=12000;
  const MAX_OUTBOX=300;
  const timers=new Map();
  let baseQueueWhatsappDelta=null;
  let flushing=false;

  function api(){return window.Rota27V017||null;}
  function byId(id){return document.getElementById(id);}
  function clone(v){return JSON.parse(JSON.stringify(v==null?null:v));}
  function now(){return Date.now();}
  function uid(){return globalThis.crypto?.randomUUID?`mgr_${crypto.randomUUID()}`:`mgr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,10)}`;}
  function read(){try{const v=JSON.parse(localStorage.getItem(OUTBOX_KEY)||'[]');return Array.isArray(v)?v:[];}catch{return [];}}
  function write(rows){localStorage.setItem(OUTBOX_KEY,JSON.stringify((Array.isArray(rows)?rows:[]).slice(-MAX_OUTBOX)));renderManagerState();}
  function manager(){return api()?.sanitizeManager?.(state?.managerWhatsapp)||{name:'Gerente',phone:'',enabled:false,updatedAt:0};}
  function configured(){try{return typeof isWhatsappConfigured==='function'&&isWhatsappConfigured();}catch{return false;}}
  function normalize(v){return api()?.normalizePhone?.(v)||String(v||'').replace(/\D/g,'');}
  function valid(v){return api()?.validPhone?.(v)||normalize(v).length>=12;}
  function fmt(v){return api()?.formatPhone?.(v)||v;}
  function clean(v,max=200){return api()?.clean?.(v,max)||String(v??'').trim().slice(0,max);}
  function esc(v){return api()?.esc?.(v)||String(v??'');}
  function toast(v){api()?.toast?.(v);}
  function safeSave(){try{if(typeof save==='function')save();}catch{}}

  function commandExists(id){return (state?.commands||[]).find(c=>String(c.id)===String(id))||(state?.history||[]).find(c=>String(c.id)===String(id));}
  function commandTotalValue(c){try{return typeof commandTotal==='function'?Number(commandTotal(c)||0):0;}catch{return 0;}}
  function commandLabelValue(c){try{return typeof commandLabel==='function'?commandLabel(c):[c?.table,c?.customer].filter(Boolean).join(' • ');}catch{return 'Comanda';}}

  function findOpenBatch(commandId){return read().find(b=>String(b.commandId)===String(commandId)&&(b.status==='pending'||b.status==='failed'));}

  function queueManagerDelta(c,p,delta){
    const m=manager();
    if(!m.enabled||!m.phone||!c||!p||!delta)return;
    if(c.whatsappOptIn===true&&normalize(c.whatsappPhone)===normalize(m.phone))return;
    let rows=read(),batch=rows.find(b=>String(b.commandId)===String(c.id)&&(b.status==='pending'||b.status==='failed'));
    const t=now();
    if(!batch){
      batch={id:uid(),commandId:String(c.id),phone:m.phone,managerName:m.name,commandLabel:commandLabelValue(c),changes:{},createdAt:t,dueAt:t+BATCH_DELAY_MS,attempts:0,status:'pending',lastError:''};
      rows.push(batch);
    }
    const key=String(p.id||p.name);
    if(!batch.changes[key])batch.changes[key]={productId:p.id||key,name:clean(p.name||'Produto',160),unitPrice:Number(p.price||0),delta:0};
    batch.changes[key].delta+=Number(delta);
    if(!batch.changes[key].delta)delete batch.changes[key];
    batch.phone=m.phone;batch.managerName=m.name;batch.commandLabel=commandLabelValue(c);batch.dueAt=t+BATCH_DELAY_MS;batch.status='pending';batch.lastError='';
    if(!Object.keys(batch.changes).length){rows=rows.filter(x=>x.id!==batch.id);const old=timers.get(batch.id);if(old)clearTimeout(old);timers.delete(batch.id);write(rows);return;}
    write(rows);schedule(batch.id);renderManagerState();
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
    let rows=read(),batch=rows.find(x=>x.id===id);if(!batch)return;
    const c=commandExists(batch.commandId);
    if(!c){write(rows.filter(x=>x.id!==id));return;}
    const changes=Object.values(batch.changes||{}).filter(x=>Number(x.delta)!==0);
    const m=manager();
    if(!m.enabled||!m.phone){write(rows.filter(x=>x.id!==id));return;}
    if(!changes.length){write(rows.filter(x=>x.id!==id));return;}
    if(!configured()){
      batch.status='failed';batch.lastError='WhatsApp não configurado neste aparelho';batch.dueAt=now()+60000;write(rows);schedule(id);return;
    }
    batch.status='sending';write(rows);
    const payload={
      eventId:batch.id,
      commandId:String(c.id),
      commandLabel:`Gerência • ${commandLabelValue(c)}`,
      customerName:m.name||'Gerente',
      phone:normalize(m.phone),
      consent:true,
      items:changes.map(x=>({productId:x.productId,name:x.name,delta:Number(x.delta),quantity:Math.abs(Number(x.delta)),unitPrice:Number(x.unitPrice)||0})),
      total:Number(commandTotalValue(c).toFixed(2)),
      currency:'BRL',
      audience:'manager',
      subjectCustomerName:clean(c.customer||'',120),
      sentFrom:'rota27-pwa-manager-copy',
      clientTimestamp:new Date().toISOString()
    };
    const ctrl=new AbortController(),timeout=setTimeout(()=>ctrl.abort(),12000);
    try{
      const response=await fetch(String(waConfig.functionUrl||'').replace(/\/+$/,''),{method:'POST',headers:{'Content-Type':'application/json','x-rota27-device-token':waConfig.deviceToken},body:JSON.stringify(payload),signal:ctrl.signal});
      const data=await response.json().catch(()=>({}));
      if(!response.ok||data.ok!==true)throw new Error(data.error||`HTTP ${response.status}`);
      write(read().filter(x=>x.id!==id));
    }catch(err){
      rows=read();batch=rows.find(x=>x.id===id);if(!batch)return;
      batch.status='failed';batch.attempts=(batch.attempts||0)+1;batch.lastError=clean(err?.message||'Falha de conexão',160);batch.dueAt=now()+Math.min(120000,RETRY_BASE_MS*Math.pow(2,Math.min(batch.attempts-1,3)));write(rows);schedule(id);
    }finally{clearTimeout(timeout);}
  }

  async function flushAll(){
    if(flushing||!navigator.onLine)return;flushing=true;
    try{for(const b of read()){if(Number(b.dueAt||0)<=now())await flushOne(b.id);else schedule(b.id);}}
    finally{flushing=false;renderManagerState();}
  }

  function patchQueue(){
    if(baseQueueWhatsappDelta||typeof queueWhatsappDelta!=='function')return;
    baseQueueWhatsappDelta=queueWhatsappDelta;
    const patched=function(c,p,delta){const result=baseQueueWhatsappDelta.apply(this,arguments);try{queueManagerDelta(c,p,delta);}catch(err){console.warn('[Rota27 v0.17] gerente:',err);}return result;};
    try{queueWhatsappDelta=patched;}catch{} try{window.queueWhatsappDelta=patched;}catch{}
  }

  function ensureManagerUi(){
    if(byId('v017ManagerWrap'))return;
    const wrap=document.createElement('div');wrap.id='v017ManagerWrap';wrap.className='sheet-wrap';
    wrap.innerHTML=`<div class="sheet v017-sheet"><div class="handle"></div><div class="v017-sheet-head"><div><h3>WhatsApp do gerente</h3><p class="desc">Envie ao responsável uma cópia agrupada dos lançamentos feitos nas comandas.</p></div><button type="button" class="v017-icon-btn" id="v017ManagerClose" aria-label="Fechar">×</button></div><div class="v017-manager-note"><strong>Como funciona</strong><span>A cópia é enviada pelo aparelho onde o lançamento foi feito. Por isso, esse aparelho precisa ter a integração de WhatsApp configurada.</span></div><div class="field"><label>Nome do gerente/responsável</label><input id="v017ManagerName" maxlength="120" placeholder="Ex.: Gerência Rota 27"></div><div class="field"><label>WhatsApp do gerente</label><input id="v017ManagerPhone" inputmode="tel" maxlength="30" placeholder="(27) 99999-9999"></div><label class="v017-toggle"><input id="v017ManagerEnabled" type="checkbox"><span></span><div><strong>Receber lançamentos</strong><small>Itens adicionados, removidos ou corrigidos serão agrupados antes do envio.</small></div></label><div id="v017ManagerState" class="v017-manager-state"></div><div class="sheet-actions"><button type="button" class="secondary" id="v017ManagerCancel">Voltar</button><button type="button" class="primary" id="v017ManagerSave">Salvar</button></div></div>`;
    document.body.appendChild(wrap);
    wrap.addEventListener('click',e=>{if(e.target===wrap)wrap.classList.remove('open');});
    byId('v017ManagerClose').addEventListener('click',()=>wrap.classList.remove('open'));
    byId('v017ManagerCancel').addEventListener('click',()=>wrap.classList.remove('open'));
    byId('v017ManagerSave').addEventListener('click',saveManager);
  }

  function openManager(){
    ensureManagerUi();const m=manager();byId('v017ManagerName').value=m.name||'Gerente';byId('v017ManagerPhone').value=m.phone?fmt(m.phone):'';byId('v017ManagerEnabled').checked=m.enabled===true;renderManagerState();byId('v017ManagerWrap').classList.add('open');setTimeout(()=>byId('v017ManagerName').focus(),100);
  }

  function saveManager(){
    const name=clean(byId('v017ManagerName').value,120)||'Gerente',raw=byId('v017ManagerPhone').value.trim(),enabled=byId('v017ManagerEnabled').checked;
    if(enabled&&!valid(raw)){toast('Informe um WhatsApp válido para ativar os envios ao gerente.');return;}
    if(raw&&!valid(raw)){toast('O WhatsApp informado não é válido.');return;}
    const config={name,phone:raw?normalize(raw):'',enabled:enabled&&!!raw,updatedAt:now()};state.managerWhatsapp=config;safeSave();api()?.queueDomainEvent?.('manager_config_replace','manager',{config:clone(config)});api()?.updateAdminCards?.();byId('v017ManagerWrap').classList.remove('open');renderManagerState();toast(config.enabled?'WhatsApp do gerente ativado.':'Configuração do gerente salva.');
  }

  function renderManagerState(){
    const el=byId('v017ManagerState');if(!el)return;const m=manager(),rows=read(),failed=rows.filter(x=>x.status==='failed').length;
    let text=m.enabled?`Ativo para ${m.name} • ${fmt(m.phone)}`:'Envios ao gerente desativados.';
    if(m.enabled&&!configured())text+=' Este aparelho ainda não está pronto para enviar WhatsApp.';
    if(rows.length)text+=` ${rows.length} envio${rows.length===1?'':'s'} na fila${failed?` • ${failed} com nova tentativa pendente`:''}.`;
    el.className='v017-manager-state'+(m.enabled&&configured()?' ok':m.enabled?' warn':'');el.textContent=text;
  }

  function cleanupMissingCommands(){
    const kept=read().filter(b=>!!commandExists(b.commandId));if(kept.length!==read().length)write(kept);
  }

  function start(){
    try{ensureManagerUi();patchQueue();window.addEventListener('rota27:v017-open-manager',openManager);window.addEventListener('rota27:v017-domain-updated',()=>{renderManagerState();api()?.updateAdminCards?.();});window.addEventListener('online',()=>{resume();setTimeout(flushAll,400);});document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){cleanupMissingCommands();resume();flushAll();}});setInterval(()=>{patchQueue();cleanupMissingCommands();if(navigator.onLine)flushAll();},15000);resume();renderManagerState();console.info('[Rota27] v0.17.0 WhatsApp do gerente carregado.');}
    catch(err){console.error('[Rota27 v0.17.0] Falha no gerente:',err);}
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
