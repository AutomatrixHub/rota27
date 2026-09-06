/* Rota 27 v0.25.212 — bloqueio global de aparelho removido/desativado */
(function(){
  'use strict';
  if(window.Rota27V025212DeviceSessionGuard)return;

  const VERSION='0.25.212';
  const CONFIG_KEY='rota27_sync_config_v1';
  const STATUS_KEY='rota27_device_session_status_v1';
  const REAUTH_KEY='rota27_device_reauth_required_v1';
  const ACCESS_CACHE_KEY='rota27_device_access_profile_v1';
  let checking=false;
  let intervalId=null;
  let handoffId=null;

  const byId=id=>document.getElementById(id);
  const clean=(v,max=240)=>String(v??'').trim().replace(/\s+/g,' ').slice(0,max);
  function readJson(key,fallback){try{const v=JSON.parse(localStorage.getItem(key)||'null');return v==null?fallback:v;}catch{return fallback;}}
  function writeJson(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}}
  function config(){const raw=readJson(CONFIG_KEY,{});return raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{};}
  function validConfig(cfg=config()){
    return cfg.enabled===true&&cfg.initialized===true&&/^https:\/\/.+\/functions\/v1\/rota27-sync\/?$/i.test(String(cfg.functionUrl||''))&&String(cfg.deviceToken||'').length>=16&&!!cfg.deviceId;
  }
  function releaseVersion(){return clean(document.querySelector('meta[name="rota27-release-version"]')?.content||VERSION,40)||VERSION;}

  function ensureUi(){
    if(!byId('v025212DeviceLockStyle')){
      const style=document.createElement('style');style.id='v025212DeviceLockStyle';style.textContent=`
        #v025212DeviceLock{position:fixed;inset:0;z-index:2147483600;background:#f5e9d5;display:none;place-items:center;padding:18px;box-sizing:border-box;overflow:auto}
        #v025212DeviceLock.open{display:grid}
        #v025212DeviceLock .v025212-card{width:min(460px,100%);background:#fff9f0;border:1px solid #d9c7a7;border-radius:22px;padding:24px;box-sizing:border-box;box-shadow:0 18px 48px rgba(30,22,15,.18);text-align:left}
        #v025212DeviceLock .v025212-brand{font-size:10px;letter-spacing:2.1px;font-weight:950;color:#8f4421;margin-bottom:9px}
        #v025212DeviceLock h2{margin:0 0 8px;font-size:25px;line-height:1.15}
        #v025212DeviceLock p{margin:0 0 15px;color:#685b50;font-size:13px;line-height:1.5}
        #v025212DeviceLock .v025212-state{border:1px solid #dfc6a8;background:#f5ead9;border-radius:13px;padding:10px 12px;margin:0 0 14px;font-size:12px;line-height:1.45;color:#5e5146}
        #v025212DeviceLock .v025212-actions{display:grid;gap:8px}
        #v025212DeviceLock button{min-height:45px;border-radius:12px;border:1px solid #cbb89b;background:#fffaf2;color:#2a211a;font-weight:850;padding:9px 13px;cursor:pointer}
        #v025212DeviceLock button.primary{background:#2f6a49;color:#fff;border-color:#2f6a49}
        #v025212DeviceLock small{display:block;margin-top:13px;color:#85776a;font-size:10.5px;line-height:1.45}
        body.r27-device-session-locked{overflow:hidden!important}
      `;document.head.appendChild(style);
    }
    if(byId('v025212DeviceLock'))return;
    const gate=document.createElement('div');gate.id='v025212DeviceLock';gate.innerHTML=`<section class="v025212-card" role="alertdialog" aria-modal="true" aria-labelledby="v025212DeviceLockTitle">
      <div class="v025212-brand">ROTA 27 BODEGA</div>
      <h2 id="v025212DeviceLockTitle">Aparelho bloqueado</h2>
      <p id="v025212DeviceLockText"></p>
      <div class="v025212-state" id="v025212DeviceLockState"></div>
      <div class="v025212-actions">
        <button type="button" class="primary" id="v025212CheckAgain">Verificar novamente</button>
        <button type="button" id="v025212Reauthorize">Reautorizar este aparelho</button>
      </div>
      <small>O bloqueio não apaga os registros históricos da loja. Um aparelho removido só volta a operar após nova autorização.</small>
    </section>`;
    document.body.appendChild(gate);
    byId('v025212CheckAgain')?.addEventListener('click',()=>checkStatus(true));
    byId('v025212Reauthorize')?.addEventListener('click',beginReauthorization);
  }

  function messageFor(status){
    if(status==='removed')return {title:'Aparelho removido',text:'Este aparelho foi removido da loja e não pode mais usar o Rota 27.',state:'A sincronização e o uso do aplicativo estão bloqueados neste aparelho.',reauth:true};
    if(status==='retired')return {title:'Aparelho desativado',text:'Este aparelho foi desativado pelo responsável.',state:'Peça ao gerente para reativá-lo. Depois toque em “Verificar novamente”.',reauth:false};
    if(status==='unauthorized')return {title:'Credencial inválida',text:'A credencial deste aparelho não é mais aceita pelo servidor.',state:'Reautorize o aparelho para receber uma nova credencial individual.',reauth:true};
    if(status==='unregistered')return {title:'Aparelho não registrado',text:'Este aparelho não está mais registrado na loja.',state:'Faça uma nova autorização para voltar a usar o Rota 27.',reauth:true};
    if(status==='reauthorize')return {title:'Reautorização necessária',text:'Este aparelho precisa ser vinculado novamente.',state:'Use o QR Code ou o código temporário gerado por um aparelho autorizado.',reauth:false};
    return {title:'Aparelho bloqueado',text:'O acesso deste aparelho foi bloqueado.',state:'Fale com o responsável pela loja.',reauth:true};
  }

  function setLocked(status,detail=''){
    ensureUi();
    const cfg=config(),meta=messageFor(status);
    writeJson(STATUS_KEY,{deviceId:clean(cfg.deviceId,120),status,locked:true,detail:clean(detail,320),checkedAt:Date.now()});
    byId('v025212DeviceLockTitle').textContent=meta.title;
    byId('v025212DeviceLockText').textContent=meta.text;
    byId('v025212DeviceLockState').textContent=detail?clean(detail,320):meta.state;
    const reauth=byId('v025212Reauthorize');if(reauth)reauth.hidden=!meta.reauth;
    byId('v025212DeviceLock')?.classList.add('open');
    document.body.classList.add('r27-device-session-locked');
  }

  function clearLocked(){
    const cfg=config();
    if(cfg.deviceId)writeJson(STATUS_KEY,{deviceId:clean(cfg.deviceId,120),status:'active',locked:false,checkedAt:Date.now()});
    localStorage.removeItem(REAUTH_KEY);
    byId('v025212DeviceLock')?.classList.remove('open');
    document.body.classList.remove('r27-device-session-locked');
  }

  function applyCached(){
    const cfg=config(),reauth=readJson(REAUTH_KEY,null);
    if(reauth){setLocked('reauthorize');return true;}
    const cached=readJson(STATUS_KEY,null);
    if(cached&&String(cached.deviceId||'')===String(cfg.deviceId||'')&&cached.locked===true){setLocked(clean(cached.status,30)||'removed',cached.detail||'');return true;}
    return false;
  }

  function handoffToEnrollment(){
    clearInterval(handoffId);
    handoffId=setInterval(()=>{
      const gate=byId('v025211JoinGate');
      if(gate&&gate.classList.contains('open')){
        byId('v025212DeviceLock')?.classList.remove('open');
        document.body.classList.remove('r27-device-session-locked');
        clearInterval(handoffId);handoffId=null;
      }
    },80);
    setTimeout(()=>{if(handoffId){clearInterval(handoffId);handoffId=null;}},12000);
  }

  function beginReauthorization(){
    const cfg=config();
    if(!window.confirm('Reautorizar este aparelho?\n\nA credencial antiga será descartada. Depois use um novo QR Code ou código temporário.'))return;
    writeJson(REAUTH_KEY,{previousDeviceId:clean(cfg.deviceId,120),startedAt:Date.now()});
    try{localStorage.removeItem(CONFIG_KEY);localStorage.removeItem(ACCESS_CACHE_KEY);localStorage.removeItem(STATUS_KEY);}catch{}
    location.reload();
  }

  async function checkStatus(manual=false){
    if(checking)return;
    const cfg=config();
    const reauth=readJson(REAUTH_KEY,null);
    if(!validConfig(cfg)){
      if(reauth){setLocked('reauthorize');handoffToEnrollment();}
      return;
    }
    checking=true;
    const button=byId('v025212CheckAgain');if(manual&&button)button.disabled=true;
    const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),10000);
    try{
      const response=await fetch(cfg.functionUrl,{method:'POST',headers:{'content-type':'application/json','x-rota27-device-token':String(cfg.deviceToken)},body:JSON.stringify({action:'status',storeId:cfg.storeId||'rota27-bodega',deviceId:cfg.deviceId,deviceName:cfg.deviceName||'Aparelho',appVersion:releaseVersion(),afterSeq:Number(cfg.cursor||0)}),signal:ctrl.signal});
      const data=await response.json().catch(()=>({}));
      if(response.ok&&data?.ok===true){clearLocked();return;}
      const code=clean(data?.code,80),deviceStatus=clean(data?.deviceStatus,30);
      if(code==='device_inactive'||deviceStatus==='removed'||deviceStatus==='retired'){
        setLocked(deviceStatus==='removed'?'removed':'retired',data?.error||'');return;
      }
      if(response.status===401||code==='device_unauthorized'){
        setLocked('unauthorized',data?.error||'');return;
      }
      if(code==='device_not_registered'){
        setLocked('unregistered',data?.error||'');return;
      }
    }catch(error){
      if(manual&&navigator.onLine!==false){const state=byId('v025212DeviceLockState');if(state)state.textContent='Não foi possível confirmar o status agora. Verifique a conexão e tente novamente.';}
    }finally{clearTimeout(timer);checking=false;if(button)button.disabled=false;}
  }

  function start(){
    ensureUi();
    applyCached();
    checkStatus(false);
    window.addEventListener('online',()=>checkStatus(false));
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')checkStatus(false);});
    intervalId=setInterval(()=>{if(document.visibilityState==='visible'&&navigator.onLine!==false)checkStatus(false);},20000);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
  window.Rota27V025212DeviceSessionGuard={version:VERSION,refresh:checkStatus,isLocked:()=>byId('v025212DeviceLock')?.classList.contains('open')===true,reauthorize:beginReauthorization};
})();
