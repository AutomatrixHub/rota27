/* Rota 27 v0.25.89 — release oficial por aparelho */
(function(){
  'use strict';
  if(window.Rota27V02589DeviceRelease)return;

  const VERSION='0.25.89';
  const SYNC_KEY='rota27_sync_config_v1';
  const clean=(value,max=180)=>String(value??'').trim().replace(/\s+/g,' ').slice(0,max);
  let busy=false;
  let reportBusy=false;
  let observer=null;
  let timer=null;
  let applying=false;
  let deviceMap=new Map();

  function inTestMode(){return document.body.classList.contains('v02581-test-mode');}
  function currentRelease(){return clean(document.querySelector('meta[name="rota27-release-version"]')?.content||VERSION,40)||VERSION;}
  function versionParts(v){return String(v||'').replace(/^v/i,'').split('.').map(n=>Number(n)||0);}
  function compareVersion(a,b){
    const aa=versionParts(a),bb=versionParts(b),len=Math.max(aa.length,bb.length);
    for(let i=0;i<len;i++){const d=(aa[i]||0)-(bb[i]||0);if(d)return d>0?1:-1;}
    return 0;
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
  function validConfig(cfg){return !!(cfg?.enabled&&cfg?.initialized&&cfg?.deviceId&&cfg?.deviceToken?.length>=16&&/^https:\/\/.+\/functions\/v1\/rota27-sync\/?$/i.test(cfg.functionUrl||''));}
  function controlUrl(cfg){return String(cfg?.functionUrl||'').replace(/\/rota27-sync\/?$/i,'/rota27-device-control');}
  async function controlApi(action,extra={}){
    if(inTestMode())throw new Error('Gestão de aparelhos indisponível no Modo Teste.');
    const cfg=syncConfig();if(!validConfig(cfg))throw new Error('Sincronização não configurada neste aparelho.');
    const response=await fetch(controlUrl(cfg),{
      method:'POST',
      headers:{'content-type':'application/json','x-rota27-device-token':cfg.deviceToken},
      body:JSON.stringify({
        action,
        storeId:cfg.storeId,
        deviceId:cfg.deviceId,
        deviceName:cfg.deviceName||'Aparelho',
        appVersion:currentRelease(),
        releaseVersion:currentRelease(),
        afterSeq:cfg.cursor||0,
        ...extra
      })
    });
    let data={};try{data=await response.json();}catch{}
    if(!response.ok||data?.ok===false)throw new Error(clean(data?.error||`Falha HTTP ${response.status}`,300));
    return data||{};
  }
  function formatSeen(value){
    if(!value)return 'Nunca';
    const d=new Date(value);if(Number.isNaN(d.getTime()))return '—';
    const now=new Date();
    const sameDay=d.getFullYear()===now.getFullYear()&&d.getMonth()===now.getMonth()&&d.getDate()===now.getDate();
    return sameDay?`Hoje, ${d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}`:d.toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',year:'2-digit',hour:'2-digit',minute:'2-digit'});
  }
  function pending(req,ack){
    if(!req)return false;
    const r=new Date(req).getTime(),a=ack?new Date(ack).getTime():0;
    return Number.isFinite(r)&&r>a;
  }
  function applyRows(){
    const list=document.getElementById('v02585DeviceList');if(!list)return;
    applying=true;
    try{
      list.querySelectorAll('.v02585-device-row[data-device-row]').forEach(row=>{
        const id=clean(row.dataset.deviceRow,120),device=deviceMap.get(id);if(!device)return;
        const main=row.querySelector('.v02585-device-main');if(!main)return;
        const baseMeta=main.querySelector(':scope > small');
        const seen=`Última atividade: ${formatSeen(device.last_seen_at)}`;
        if(baseMeta&&baseMeta.textContent!==seen)baseMeta.textContent=seen;

        let releaseLine=main.querySelector('.v02587-version-line');
        if(!releaseLine){releaseLine=document.createElement('div');releaseLine.className='v02587-version-line';main.appendChild(releaseLine);}
        const release=clean(device.release_version,40);
        const updatePending=pending(device.requested_update_at,device.update_request_ack_at);
        const requested=clean(device.requested_update_version,40);
        const stalePending=updatePending&&requested&&compareVersion(requested,currentRelease())<0;
        let text=`Versão do Rota 27: ${release?`v${release}`:'aguardando telemetria desta release'}`;
        if(updatePending){
          if(stalePending)text+=` • pedido antigo para v${requested}`;
          else text+=` • atualização para v${requested||currentRelease()} pendente`;
        }
        if(releaseLine.textContent!==text)releaseLine.textContent=text;

        const updateBtn=row.querySelector('[data-v02587-request-update]');
        if(updateBtn){
          const label=stalePending?`Atualizar pedido para v${currentRelease()}`:`Solicitar atualização para v${currentRelease()}`;
          if(updateBtn.textContent!==label)updateBtn.textContent=label;
        }
      });
    }finally{applying=false;}
  }
  async function reportCurrentRelease(){
    if(reportBusy||inTestMode()||!navigator.onLine)return;
    const cfg=syncConfig();if(!validConfig(cfg))return;
    reportBusy=true;
    try{await controlApi('agent',{releaseVersion:currentRelease()});}
    catch(err){console.warn('[Rota27 v0.25.89] release report:',err?.message||err);}
    finally{reportBusy=false;}
  }
  async function refresh(){
    if(busy||inTestMode()||!document.getElementById('v02585DeviceWrap')?.classList.contains('open'))return;
    busy=true;
    try{
      const data=await controlApi('list',{includeRemoved:document.getElementById('v02585ShowRemoved')?.checked===true});
      deviceMap=new Map((Array.isArray(data?.devices)?data.devices:[]).map(device=>[clean(device?.device_id,120),device]));
      applyRows();
    }catch(err){console.warn('[Rota27 v0.25.89] release UI:',err?.message||err);}
    finally{busy=false;}
  }
  function scheduleRefresh(delay=80){clearTimeout(timer);timer=setTimeout(refresh,delay);}
  function watch(){
    const list=document.getElementById('v02585DeviceList');if(!list||observer)return;
    observer=new MutationObserver(()=>{if(!applying)scheduleRefresh(60);});
    observer.observe(list,{childList:true,subtree:true,characterData:true});
  }
  function start(){
    setTimeout(reportCurrentRelease,700);
    setTimeout(()=>{watch();scheduleRefresh(120);},1200);
    document.addEventListener('click',event=>{
      if(event.target.closest?.('#v02585OpenDevices,#v02585RefreshDevices'))setTimeout(()=>{watch();scheduleRefresh(80);},150);
    },true);
    document.addEventListener('change',event=>{if(event.target?.id==='v02585ShowRemoved')setTimeout(()=>scheduleRefresh(100),130);});
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){setTimeout(reportCurrentRelease,250);setTimeout(()=>scheduleRefresh(120),500);}});
    window.addEventListener('online',()=>{setTimeout(reportCurrentRelease,250);setTimeout(()=>scheduleRefresh(120),500);});
    window.addEventListener('rota27:test-mode-changed',()=>{if(!inTestMode()){setTimeout(reportCurrentRelease,500);setTimeout(()=>scheduleRefresh(120),700);}});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

  window.Rota27V02589DeviceRelease={version:VERSION,report:reportCurrentRelease,refresh};
})();
