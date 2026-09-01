/* Rota 27 v0.25.90 — coordenador de atualização sem loop */
(function(){
  'use strict';
  if(window.Rota27V02590UpdateCoordinator)return;

  const VERSION='0.25.90';
  const SYNC_KEY='rota27_sync_config_v1';
  const ACK_KEY='rota27_update_pending_ack_v1';
  const RELOAD_GUARD_KEY='rota27_update_reload_guard_v2';
  const CHECK_INTERVAL_MS=60000;
  const REMOTE_INTERVAL_MS=30000;
  const clean=(value,max=180)=>String(value??'').trim().replace(/\s+/g,' ').slice(0,max);

  let checking=false;
  let remoteBusy=false;
  let reloadTimer=null;
  let checkTimer=null;
  let remoteTimer=null;
  let pendingRemote=null;
  let targetArmed='';
  let currentDeviceId='';
  let deviceMap=new Map();

  // Impede o coordenador antigo (v0.25.87) de iniciar nesta e nas próximas releases.
  window.Rota27V02587AutoUpdate={version:VERSION,superseded:true};

  function inTestMode(){return document.body.classList.contains('v02581-test-mode');}
  function currentVersion(){
    return clean(window.Rota27Roadmap?.version||document.querySelector('meta[name="rota27-release-version"]')?.content||VERSION,40)||VERSION;
  }
  function assertReleaseIdentity(){
    const meta=document.querySelector('meta[name="rota27-release-version"]');
    if(meta)meta.content=currentVersion();
  }
  function versionParts(v){return String(v||'').replace(/^v/i,'').split('.').map(n=>Number(n)||0);}
  function compareVersion(a,b){
    const aa=versionParts(a),bb=versionParts(b),len=Math.max(aa.length,bb.length);
    for(let i=0;i<len;i++){const d=(aa[i]||0)-(bb[i]||0);if(d)return d>0?1:-1;}
    return 0;
  }
  function toast(message,error=false){
    try{if(typeof showToast==='function'){showToast(message,error);return;}}catch{}
    console[error?'error':'info']('[Rota27 update v0.25.90]',message);
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
  function validConfig(cfg){
    return !!(cfg?.enabled&&cfg?.initialized&&cfg?.deviceId&&cfg?.deviceToken?.length>=16&&/^https:\/\/.+\/functions\/v1\/rota27-sync\/?$/i.test(cfg.functionUrl||''));
  }
  function controlUrl(cfg){return String(cfg?.functionUrl||'').replace(/\/rota27-sync\/?$/i,'/rota27-device-control');}
  async function controlApi(action,extra={}){
    if(inTestMode())throw new Error('Atualização remota fica desativada no Modo Teste.');
    const cfg=syncConfig();if(!validConfig(cfg))throw new Error('Sincronização ainda não está configurada neste aparelho.');
    const response=await fetch(controlUrl(cfg),{
      method:'POST',
      headers:{'content-type':'application/json','x-rota27-device-token':cfg.deviceToken},
      body:JSON.stringify({
        action,
        storeId:cfg.storeId,
        deviceId:cfg.deviceId,
        deviceName:cfg.deviceName||'Aparelho',
        appVersion:currentVersion(),
        releaseVersion:currentVersion(),
        afterSeq:cfg.cursor||0,
        ...extra
      })
    });
    let data={};try{data=await response.json();}catch{}
    if(!response.ok||data?.ok===false){
      const err=new Error(clean(data?.error||`Falha HTTP ${response.status}`,300));
      err.code=clean(data?.code,60);throw err;
    }
    return data||{};
  }
  async function latestVersion(){
    const response=await fetch(`./VERSION?__r27update=${Date.now()}`,{cache:'no-store'});
    if(!response.ok)throw new Error(`VERSION HTTP ${response.status}`);
    return clean(await response.text(),40);
  }
  function isEditable(el){return !!el&&(el.matches?.('input,textarea,select,[contenteditable="true"]')||el.closest?.('[contenteditable="true"]'));}
  function isActuallyVisible(el){
    if(!el||!el.isConnected)return false;
    try{
      const style=getComputedStyle(el);
      if(style.display==='none'||style.visibility==='hidden'||Number(style.opacity)===0)return false;
      const rect=el.getBoundingClientRect();
      return rect.width>0&&rect.height>0;
    }catch{return false;}
  }
  function unsafeOverlayOpen(){
    const candidates=document.querySelectorAll('.sheet-wrap.open,[id$="Wrap"].open,[id$="Overlay"].open,dialog[open],[role="dialog"][aria-modal="true"]');
    return Array.from(candidates).some(isActuallyVisible);
  }
  function safeToReload(){
    if(document.visibilityState!=='visible'||inTestMode())return false;
    if(isEditable(document.activeElement))return false;
    if(unsafeOverlayOpen())return false;
    return true;
  }
  function readReloadGuard(){
    try{return JSON.parse(sessionStorage.getItem(RELOAD_GUARD_KEY)||'null');}catch{return null;}
  }
  function markReloadGuard(target){
    try{sessionStorage.setItem(RELOAD_GUARD_KEY,JSON.stringify({target,at:Date.now()}));}catch{}
  }
  function alreadyReloadedFor(target){
    const guard=readReloadGuard();
    return !!(guard?.target&&compareVersion(guard.target,target)===0&&Date.now()-Number(guard.at||0)<5*60*1000);
  }
  function storePendingAck(){
    if(!pendingRemote?.requestedAt)return;
    try{localStorage.setItem(ACK_KEY,JSON.stringify({requestedAt:pendingRemote.requestedAt,targetVersion:pendingRemote.targetVersion||'',savedAt:new Date().toISOString()}));}catch{}
  }
  function scheduleReload(targetVersion){
    const target=clean(targetVersion||targetArmed||'',40);
    if(!target||alreadyReloadedFor(target)){
      console.warn('[Rota27 v0.25.90] reload repetido bloqueado para',target||'alvo desconhecido');
      return;
    }
    if(reloadTimer)return;
    const attempt=()=>{
      reloadTimer=null;
      if(!safeToReload()){reloadTimer=setTimeout(attempt,1500);return;}
      storePendingAck();
      markReloadGuard(target);
      location.reload();
    };
    reloadTimer=setTimeout(attempt,250);
  }
  async function probeController(){
    const controller=navigator.serviceWorker?.controller;if(!controller)return null;
    return await new Promise(resolve=>{
      const channel=new MessageChannel();let done=false;
      const finish=value=>{if(done)return;done=true;resolve(value||null);};
      const timer=setTimeout(()=>finish(null),800);
      channel.port1.onmessage=event=>{clearTimeout(timer);finish(event.data||null);};
      try{controller.postMessage({type:'ROTA27_GET_RELEASE'},[channel.port2]);}catch{clearTimeout(timer);finish(null);}
    });
  }
  function watchWorker(worker,target){
    if(!worker)return;
    const onState=()=>{if(worker.state==='activated')scheduleReload(target);};
    worker.addEventListener?.('statechange',onState);onState();
  }
  async function armServiceWorkerUpdate(targetVersion){
    if(!('serviceWorker' in navigator))return false;
    const target=clean(targetVersion,40);if(!target)return false;
    targetArmed=target;

    const currentController=await probeController();
    if(currentController?.version&&compareVersion(currentController.version,target)>=0){
      if(compareVersion(currentVersion(),target)<0)scheduleReload(target);
      return true;
    }

    const reg=await navigator.serviceWorker.getRegistration();if(!reg)return false;
    const onFound=()=>watchWorker(reg.installing,target);
    reg.addEventListener('updatefound',onFound,{once:true});
    if(reg.waiting){try{reg.waiting.postMessage({type:'ROTA27_SKIP_WAITING'});}catch{}watchWorker(reg.waiting,target);}
    if(reg.installing)watchWorker(reg.installing,target);
    try{await reg.update();}catch(err){console.warn('[Rota27 v0.25.90] SW update:',err);}
    if(reg.waiting){try{reg.waiting.postMessage({type:'ROTA27_SKIP_WAITING'});}catch{}watchWorker(reg.waiting,target);}
    if(reg.installing)watchWorker(reg.installing,target);

    setTimeout(async()=>{
      const info=await probeController();
      if(info?.version&&compareVersion(info.version,target)>=0&&compareVersion(currentVersion(),target)<0)scheduleReload(target);
    },1800);
    return true;
  }
  async function acknowledgeRemote(requestedAt){
    if(!requestedAt||inTestMode())return;
    try{
      await controlApi('agent',{ackUpdateRequestAt:requestedAt,releaseVersion:currentVersion()});
      try{localStorage.removeItem(ACK_KEY);}catch{}
    }catch(err){console.warn('[Rota27 v0.25.90] ACK update:',err);}
  }
  async function acknowledgeStored(){
    let stored=null;try{stored=JSON.parse(localStorage.getItem(ACK_KEY)||'null');}catch{}
    if(!stored?.requestedAt)return;
    if(stored.targetVersion&&compareVersion(currentVersion(),stored.targetVersion)<0)return;
    await acknowledgeRemote(String(stored.requestedAt));
  }
  async function checkForUpdate(reason='timer',forcedTarget=''){
    if(checking||inTestMode()||!navigator.onLine)return;
    checking=true;
    try{
      assertReleaseIdentity();
      let latest='';try{latest=await latestVersion();}catch{}
      const target=forcedTarget&&compareVersion(forcedTarget,latest)>0?forcedTarget:latest;
      if(!target||compareVersion(target,currentVersion())<=0){
        if(pendingRemote?.requestedAt)await acknowledgeRemote(pendingRemote.requestedAt);
        pendingRemote=null;return;
      }
      await armServiceWorkerUpdate(target);
    }finally{checking=false;}
  }
  async function handleRemoteRequest(requestedAt,targetVersion=''){
    const ts=clean(requestedAt,80);if(!ts)return;
    pendingRemote={requestedAt:ts,targetVersion:clean(targetVersion,40)};
    if(pendingRemote.targetVersion&&compareVersion(currentVersion(),pendingRemote.targetVersion)>=0){
      await acknowledgeRemote(ts);pendingRemote=null;return;
    }
    await checkForUpdate('remote',pendingRemote.targetVersion);
  }
  async function remoteAgentOnce(){
    if(remoteBusy||inTestMode()||!navigator.onLine)return;
    const cfg=syncConfig();if(!validConfig(cfg))return;
    remoteBusy=true;
    try{
      const data=await controlApi('agent',{releaseVersion:currentVersion()});
      if(data?.requestedUpdateAt)await handleRemoteRequest(String(data.requestedUpdateAt),String(data.requestedUpdateVersion||''));
      if(document.getElementById('v02585DeviceWrap')?.classList.contains('open'))setTimeout(refreshDeviceUi,120);
    }catch(err){
      if(!['device_inactive','device_not_registered'].includes(String(err?.code||'')))console.warn('[Rota27 v0.25.90] update agent:',err);
    }finally{remoteBusy=false;}
  }
  async function refreshDeviceUi(){
    if(inTestMode()||!document.getElementById('v02585DeviceWrap')?.classList.contains('open'))return;
    try{
      const data=await controlApi('list',{includeRemoved:document.getElementById('v02585ShowRemoved')?.checked===true});
      currentDeviceId=clean(data?.currentDeviceId,120);
      deviceMap=new Map((Array.isArray(data?.devices)?data.devices:[]).map(d=>[clean(d?.device_id,120),d]));
      augmentDeviceRows();
    }catch(err){console.warn('[Rota27 v0.25.90] update UI:',err);}
  }
  function pending(req,ack){
    if(!req)return false;
    const r=new Date(req).getTime(),a=ack?new Date(ack).getTime():0;
    return Number.isFinite(r)&&r>a;
  }
  function augmentDeviceRows(){
    const list=document.getElementById('v02585DeviceList');if(!list)return;
    list.querySelectorAll('.v02585-device-row[data-device-row]').forEach(row=>{
      const id=clean(row.dataset.deviceRow,120),device=deviceMap.get(id);if(!device)return;
      const menu=row.querySelector('.v02585-menu-pop');
      if(menu&&!row.classList.contains('retired')&&!row.classList.contains('removed')&&id!==currentDeviceId&&!menu.querySelector('[data-v02590-request-update]')){
        const btn=document.createElement('button');
        btn.type='button';btn.dataset.v02590RequestUpdate=id;
        btn.textContent=`Solicitar atualização para v${currentVersion()}`;
        menu.prepend(btn);
      }
      const line=row.querySelector('.v02587-version-line');
      if(line){
        const release=clean(device.release_version,40);
        const updatePending=pending(device.requested_update_at,device.update_request_ack_at);
        line.textContent=`Versão do Rota 27: ${release?`v${release}`:'aguardando confirmação do aparelho'}${updatePending?` • atualização para v${device.requested_update_version||currentVersion()} pendente`:''}`;
      }
    });
  }
  async function requestDeviceUpdate(id){
    const device=deviceMap.get(id),name=clean(device?.device_name||'Aparelho',80)||'Aparelho';
    if(!confirm(`Solicitar atualização de “${name}” para v${currentVersion()}?\n\nSe o aparelho estiver fechado, o pedido ficará pendente e será executado quando o Rota 27 voltar a ficar ativo.`))return;
    try{
      await controlApi('request_update',{targetDeviceId:id,targetVersion:currentVersion()});
      toast('Atualização solicitada. O aparelho atualizará quando estiver ativo.');
      await refreshDeviceUi();
    }catch(err){toast(err?.message||'Não foi possível solicitar a atualização.',true);}
  }

  document.addEventListener('click',event=>{
    const btn=event.target.closest?.('[data-v02590-request-update]');
    if(btn){
      event.preventDefault();event.stopPropagation();
      const id=clean(btn.dataset.v02590RequestUpdate,120);
      btn.closest('.v02585-device-row')?.classList.remove('menu-open');
      requestDeviceUpdate(id);return;
    }
    if(event.target.closest?.('#v02585OpenDevices,#v02585RefreshDevices'))setTimeout(refreshDeviceUi,180);
  },true);
  document.addEventListener('change',event=>{if(event.target?.id==='v02585ShowRemoved')setTimeout(refreshDeviceUi,180);});
  navigator.serviceWorker?.addEventListener?.('controllerchange',()=>{if(targetArmed)scheduleReload(targetArmed);});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){assertReleaseIdentity();setTimeout(()=>checkForUpdate('visible'),300);setTimeout(remoteAgentOnce,500);}});
  window.addEventListener('online',()=>{setTimeout(()=>checkForUpdate('online'),300);setTimeout(remoteAgentOnce,550);});
  window.addEventListener('rota27:test-mode-changed',()=>{if(!inTestMode()){setTimeout(()=>checkForUpdate('test-exit'),550);setTimeout(remoteAgentOnce,750);}});

  function start(){
    assertReleaseIdentity();
    setTimeout(assertReleaseIdentity,300);
    setTimeout(assertReleaseIdentity,1200);
    setTimeout(acknowledgeStored,750);
    setTimeout(()=>checkForUpdate('startup'),1300);
    setTimeout(remoteAgentOnce,1600);
    clearInterval(checkTimer);checkTimer=setInterval(()=>checkForUpdate('timer'),CHECK_INTERVAL_MS);
    clearInterval(remoteTimer);remoteTimer=setInterval(remoteAgentOnce,REMOTE_INTERVAL_MS);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

  window.Rota27V02590UpdateCoordinator={version:VERSION,check:checkForUpdate,handleRemoteRequest,refresh:refreshDeviceUi};
})();
