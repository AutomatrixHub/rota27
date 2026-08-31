/* Rota 27 v0.25.86 — telemetria e solicitações remotas por aparelho */
(function(){
  'use strict';
  if(window.Rota27V02586DeviceTelemetry)return;

  const VERSION='0.25.86';
  const SYNC_KEY='rota27_sync_config_v1';
  const WA_KEY='rota27_whatsapp_config_v1';
  const MANAGER_OUTBOX_KEY='rota27_v017_manager_outbox_v1';
  const FIXED_OUTBOX_KEY='rota27_v0255_fixed_copy_outbox_v1';
  const AGENT_INTERVAL_MS=15000;
  const byId=id=>document.getElementById(id);
  const clean=(value,max=180)=>String(value??'').trim().replace(/\s+/g,' ').slice(0,max);
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

  let agentBusy=false;
  let uiBusy=false;
  let uiTimer=null;
  let agentTimer=null;
  let listObserver=null;
  let telemetryById=new Map();
  let currentDeviceId='';

  function inTestMode(){return document.body.classList.contains('v02581-test-mode');}
  function toast(message,error=false){
    try{if(typeof showToast==='function'){showToast(message,error);return;}}catch{}
    console[error?'error':'info']('[Rota27 device telemetry]',message);
  }
  function syncConfig(){
    try{
      const raw=JSON.parse(localStorage.getItem(SYNC_KEY)||'{}')||{};
      return {
        enabled:raw.enabled===true,
        initialized:raw.initialized===true,
        functionUrl:clean(raw.functionUrl,500),
        deviceToken:clean(raw.deviceToken,500),
        storeId:clean(raw.storeId||'rota27-bodega',80)||'rota27-bodega',
        deviceId:clean(raw.deviceId,120),
        deviceName:clean(raw.deviceName||'Aparelho',80),
        cursor:Math.max(0,Number(raw.cursor||0))
      };
    }catch{return null;}
  }
  function currentAppVersion(){return clean(document.querySelector('meta[name="rota27-release-version"]')?.content||VERSION,40)||VERSION;}
  function controlUrl(cfg){return String(cfg?.functionUrl||'').replace(/\/rota27-sync\/?$/i,'/rota27-device-control');}
  function validConfig(cfg){return !!(cfg?.enabled&&cfg?.initialized&&cfg?.deviceId&&cfg?.deviceToken?.length>=16&&/^https:\/\/.+\/functions\/v1\/rota27-sync\/?$/i.test(cfg.functionUrl||''));}

  async function controlApi(action,extra={}){
    if(inTestMode())throw new Error('Telemetria de aparelhos fica desativada no Modo Teste.');
    const cfg=syncConfig();
    if(!validConfig(cfg))throw new Error('Sincronização ainda não está configurada neste aparelho.');
    const url=controlUrl(cfg);
    if(!/^https:\/\/.+\/functions\/v1\/rota27-device-control\/?$/i.test(url))throw new Error('Endpoint de controle de aparelhos inválido.');
    const response=await fetch(url,{
      method:'POST',
      headers:{'content-type':'application/json','x-rota27-device-token':cfg.deviceToken},
      body:JSON.stringify({
        action,
        storeId:cfg.storeId,
        deviceId:cfg.deviceId,
        deviceName:cfg.deviceName||'Aparelho',
        appVersion:currentAppVersion(),
        afterSeq:cfg.cursor||0,
        ...extra
      })
    });
    let data={};
    try{data=await response.json();}catch{}
    if(!response.ok||data?.ok===false){
      const error=new Error(clean(data?.error||`Falha HTTP ${response.status}`,300));
      error.code=clean(data?.code,60);
      throw error;
    }
    return data||{};
  }

  function readArray(key){
    try{const value=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(value)?value:[];}catch{return [];}
  }
  function whatsappConfigured(){
    try{
      const raw=JSON.parse(localStorage.getItem(WA_KEY)||'{}')||{};
      return /^https:\/\/.+\/functions\/v1\/.+/i.test(String(raw.functionUrl||''))&&String(raw.deviceToken||'').length>=16;
    }catch{return false;}
  }
  function sanitizeError(value){
    return clean(value,300)
      .replace(/https?:\/\/\S+/gi,'[url omitida]')
      .replace(/\b[A-Za-z0-9_-]{32,}\b/g,'[dado oculto]');
  }
  function collectTelemetry(){
    const main=(()=>{try{return Array.isArray(state?.whatsappOutbox)?state.whatsappOutbox:[];}catch{return [];}})();
    const rows=[...main,...readArray(MANAGER_OUTBOX_KEY),...readArray(FIXED_OUTBOX_KEY)];
    const pending=rows.filter(row=>['pending','waiting','sending'].includes(String(row?.status||'pending'))).length;
    const failedRows=rows.filter(row=>String(row?.status||'')==='failed');
    const lastError=failedRows.map(row=>sanitizeError(row?.lastError||row?.error||'')).find(Boolean)||'';
    return {
      whatsappConfigured:whatsappConfigured(),
      pendingCount:pending,
      failedCount:failedRows.length,
      lastError
    };
  }

  async function acknowledge(extra){
    try{return await controlApi('agent',{telemetry:collectTelemetry(),...extra});}catch{return null;}
  }
  async function runRequestedSync(requestedAt){
    if(!requestedAt)return;
    try{
      if(typeof window.v15SyncNow!=='function')return;
      const result=window.v15SyncNow();
      if(result&&typeof result.then==='function')await result;
      await acknowledge({ackSyncRequestAt:requestedAt});
    }catch(err){console.warn('[Rota27 v0.25.86] sync remoto pendente:',err);}
  }
  async function runRequestedDiagnostic(requestedAt){
    if(!requestedAt)return;
    try{await acknowledge({ackDiagnosticRequestAt:requestedAt});}
    catch(err){console.warn('[Rota27 v0.25.86] diagnóstico remoto pendente:',err);}
  }
  async function agentOnce(){
    if(agentBusy||inTestMode()||!navigator.onLine)return;
    const cfg=syncConfig();if(!validConfig(cfg))return;
    agentBusy=true;
    try{
      const data=await controlApi('agent',{telemetry:collectTelemetry()});
      if(data?.requestedSyncAt)await runRequestedSync(String(data.requestedSyncAt));
      if(data?.requestedDiagnosticAt)await runRequestedDiagnostic(String(data.requestedDiagnosticAt));
      if(byId('v02585DeviceWrap')?.classList.contains('open'))scheduleUiRefresh(120);
    }catch(err){
      if(!['device_inactive','device_not_registered'].includes(String(err?.code||'')))console.warn('[Rota27 v0.25.86] agente:',err);
    }finally{agentBusy=false;}
  }

  function formatSeen(value){
    if(!value)return 'Ainda não recebido';
    const d=new Date(value);if(Number.isNaN(d.getTime()))return '—';
    const now=new Date();
    const sameDay=d.getFullYear()===now.getFullYear()&&d.getMonth()===now.getMonth()&&d.getDate()===now.getDate();
    return sameDay?`Hoje, ${d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}`:d.toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});
  }
  function isPending(requested,ack){
    if(!requested)return false;
    const r=new Date(requested).getTime(),a=ack?new Date(ack).getTime():0;
    return Number.isFinite(r)&&r>a;
  }
  function telemetryHtml(device){
    const at=device?.whatsapp_telemetry_at;
    const configured=device?.whatsapp_configured;
    const pendingCount=Math.max(0,Number(device?.whatsapp_pending_count||0));
    const failedCount=Math.max(0,Number(device?.whatsapp_failed_count||0));
    const syncPending=isPending(device?.requested_sync_at,device?.sync_request_ack_at);
    const diagnosticPending=isPending(device?.requested_diagnostic_at,device?.diagnostic_request_ack_at);
    const waClass=!at?'unknown':configured===true?'ok':'warn';
    const waText=!at?'WhatsApp: diagnóstico não recebido':configured===true?'WhatsApp: configurado':'WhatsApp: não configurado';
    return `<div class="v02586-telemetry">
      <div class="v02586-telemetry-line"><span class="v02586-wa ${waClass}">${esc(waText)}</span>${at?`<span>Fila WA: ${pendingCount} pend. · ${failedCount} falha${failedCount===1?'':'s'}</span>`:''}</div>
      <div class="v02586-telemetry-line"><span>Diagnóstico: ${esc(formatSeen(at))}</span>${syncPending?'<b class="pending">Sync solicitado</b>':''}${diagnosticPending?'<b class="pending">Diagnóstico solicitado</b>':''}</div>
      ${device?.whatsapp_last_error?`<div class="v02586-last-error">Último erro: ${esc(device.whatsapp_last_error)}</div>`:''}
    </div>`;
  }
  function augmentRows(){
    const list=byId('v02585DeviceList');if(!list)return;
    list.querySelectorAll('.v02585-device-row[data-device-row]').forEach(row=>{
      const id=clean(row.dataset.deviceRow,120);const device=telemetryById.get(id);if(!device)return;
      let telemetry=row.querySelector('.v02586-telemetry');
      const holder=document.createElement('div');holder.innerHTML=telemetryHtml(device);const fresh=holder.firstElementChild;
      if(telemetry)telemetry.replaceWith(fresh);
      else{
        const code=row.querySelector('.v02585-device-main>code');
        if(code)code.insertAdjacentElement('beforebegin',fresh);else row.querySelector('.v02585-device-main')?.appendChild(fresh);
      }
      const menu=row.querySelector('.v02585-menu-pop');
      if(menu&&!row.classList.contains('retired')&&!row.classList.contains('removed')&&id!==currentDeviceId){
        if(!menu.querySelector('[data-v02586-action="request_sync"]')){
          const syncBtn=document.createElement('button');
          syncBtn.type='button';syncBtn.dataset.v02586Action='request_sync';syncBtn.dataset.deviceId=id;syncBtn.textContent='Solicitar sincronização';
          menu.prepend(syncBtn);
        }
        if(!menu.querySelector('[data-v02586-action="request_diagnostic"]')){
          const diagBtn=document.createElement('button');
          diagBtn.type='button';diagBtn.dataset.v02586Action='request_diagnostic';diagBtn.dataset.deviceId=id;diagBtn.textContent='Solicitar diagnóstico';
          const syncBtn=menu.querySelector('[data-v02586-action="request_sync"]');
          syncBtn?.insertAdjacentElement('afterend',diagBtn);
        }
      }
    });
  }
  async function refreshTelemetryUi(){
    if(uiBusy||inTestMode()||!byId('v02585DeviceWrap')?.classList.contains('open'))return;
    uiBusy=true;
    try{
      const includeRemoved=byId('v02585ShowRemoved')?.checked===true;
      const data=await controlApi('list',{includeRemoved});
      currentDeviceId=clean(data?.currentDeviceId,120);
      telemetryById=new Map((Array.isArray(data?.devices)?data.devices:[]).map(device=>[clean(device?.device_id,120),device]));
      augmentRows();
    }catch(err){console.warn('[Rota27 v0.25.86] telemetria UI:',err);}
    finally{uiBusy=false;}
  }
  function scheduleUiRefresh(delay=120){
    clearTimeout(uiTimer);uiTimer=setTimeout(refreshTelemetryUi,delay);
  }
  function watchDeviceList(){
    const list=byId('v02585DeviceList');if(!list||listObserver)return;
    listObserver=new MutationObserver(mutations=>{
      if(mutations.some(m=>m.target===list&&m.type==='childList'))scheduleUiRefresh(80);
    });
    listObserver.observe(list,{childList:true});
  }

  async function requestRemote(action,id){
    const device=telemetryById.get(id);const name=clean(device?.device_name||'Aparelho',80)||'Aparelho';
    const isSync=action==='request_sync';
    const question=isSync
      ?`Solicitar sincronização de “${name}”?\n\nO pedido será executado assim que o aparelho estiver ativo e com o Rota 27 aberto.`
      :`Solicitar diagnóstico de “${name}”?\n\nO aparelho reportará o estado local do WhatsApp e das filas assim que voltar a ficar ativo.`;
    if(!window.confirm(question))return;
    try{
      await controlApi(action,{targetDeviceId:id});
      toast(isSync?'Sincronização solicitada. O aparelho atenderá quando estiver ativo.':'Diagnóstico solicitado. O aparelho reportará quando estiver ativo.',false);
      await refreshTelemetryUi();
    }catch(err){toast(err?.message||'Não foi possível registrar a solicitação.',true);}
  }

  document.addEventListener('click',event=>{
    const remote=event.target.closest?.('[data-v02586-action]');
    if(remote){
      event.preventDefault();event.stopPropagation();
      const action=clean(remote.dataset.v02586Action,40),id=clean(remote.dataset.deviceId,120);
      remote.closest('.v02585-device-row')?.classList.remove('menu-open');
      requestRemote(action,id);return;
    }
    if(event.target.closest?.('#v02585OpenDevices')){setTimeout(()=>{watchDeviceList();scheduleUiRefresh(100);},120);return;}
    if(event.target.closest?.('#v02585RefreshDevices')){setTimeout(()=>scheduleUiRefresh(120),120);return;}
  },true);
  document.addEventListener('change',event=>{if(event.target?.id==='v02585ShowRemoved')setTimeout(()=>scheduleUiRefresh(120),120);});
  window.addEventListener('online',()=>setTimeout(agentOnce,250));
  window.addEventListener('rota27:test-mode-changed',()=>{if(!inTestMode())setTimeout(agentOnce,600);});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){setTimeout(agentOnce,250);setTimeout(()=>{watchDeviceList();scheduleUiRefresh(120);},500);}});

  function start(){
    watchDeviceList();
    setTimeout(agentOnce,900);
    setTimeout(()=>{watchDeviceList();scheduleUiRefresh(120);},1400);
    clearInterval(agentTimer);agentTimer=setInterval(agentOnce,AGENT_INTERVAL_MS);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

  window.Rota27V02586DeviceTelemetry={version:VERSION,run:agentOnce,refresh:refreshTelemetryUi,collect:collectTelemetry};
})();
