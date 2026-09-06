/* Rota 27 v0.25.211 — vínculo seguro de novos aparelhos por QR/código */
(function(){
  'use strict';
  if(window.Rota27V025211Enrollment)return;

  const VERSION='0.25.211';
  const SYNC_KEY='rota27_sync_config_v1';
  const ACCESS_CACHE_KEY='rota27_device_access_profile_v1';
  const PRE_ADOPT_BACKUP_KEY='rota27_sync_pre_adopt_backup_v1';
  const PENDING_KEY='rota27_device_enrollment_pending_v1';
  const CLAIM_NONCE_KEY='rota27_device_enrollment_claim_nonce_v1';
  const ENROLL_URL='https://owkvwsiblbzlpxjwybrt.supabase.co/functions/v1/rota27-device-enroll';
  const QR_LIB='https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js';
  const PERMISSION_KEYS=['commands','menu','panel','history','clients','receivables','stock','purchases','inventory','settings','devices'];
  const LABELS={
    commands:'Comandas',menu:'Cardápio',panel:'Painel',history:'Histórico',clients:'Clientes & Fidelização',
    receivables:'A receber',stock:'Estoque',purchases:'Compras & Reposição',inventory:'Inventário',
    settings:'Configurações & Integrações',devices:'Aparelhos'
  };
  const NONE=()=>Object.fromEntries(PERMISSION_KEYS.map(k=>[k,'none']));
  const FULL=()=>Object.fromEntries(PERMISSION_KEYS.map(k=>[k,'edit']));
  const PRESETS={
    waiter:{label:'Garçom',hint:'Opera comandas e consulta o cardápio.',permissions:{...NONE(),commands:'edit',menu:'view'}},
    counter:{label:'Balcão',hint:'Opera comandas e consulta clientes e recebimentos.',permissions:{...NONE(),commands:'edit',menu:'view',clients:'view',receivables:'view'}},
    stock:{label:'Estoque',hint:'Opera estoque, compras e inventário.',permissions:{...NONE(),menu:'view',panel:'view',stock:'edit',purchases:'edit',inventory:'edit'}},
    manager:{label:'Gerente',hint:'Acesso operacional amplo, inclusive gestão de aparelhos.',permissions:{...FULL(),history:'view'}},
    view:{label:'Consulta',hint:'Somente leitura nas principais áreas.',permissions:{...NONE(),commands:'view',menu:'view',panel:'view',history:'view',clients:'view',receivables:'view',stock:'view',purchases:'view',inventory:'view'}},
    custom:{label:'Personalizado',hint:'Escolha área por área.',permissions:NONE()}
  };

  const byId=id=>document.getElementById(id);
  const clean=(v,max=180)=>String(v??'').trim().replace(/\s+/g,' ').slice(0,max);
  const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const clone=v=>JSON.parse(JSON.stringify(v==null?null:v));
  function toast(message,error=false){try{if(typeof showToast==='function'){showToast(message,error);return;}}catch{}console[error?'warn':'info']('[Rota27 vínculo]',message);}
  function readJson(key,fallback){try{const v=JSON.parse(localStorage.getItem(key)||'null');return v==null?fallback:v;}catch{return fallback;}}
  function writeJson(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}}
  function releaseVersion(){return clean(document.querySelector('meta[name="rota27-release-version"]')?.content||VERSION,40)||VERSION;}
  function defaultDeviceName(){
    const ua=navigator.userAgent||'';
    if(/ipad/i.test(ua))return 'iPad';
    if(/iphone/i.test(ua))return 'iPhone';
    if(/android/i.test(ua))return /tablet/i.test(ua)?'Tablet Android':'Android';
    if(/windows/i.test(ua))return 'Windows';
    if(/macintosh|mac os/i.test(ua))return 'Mac';
    return 'Aparelho';
  }
  function syncConfig(){const raw=readJson(SYNC_KEY,{});return raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{};}
  function syncReady(cfg=syncConfig()){
    return cfg.enabled===true&&cfg.initialized===true&&/^https:\/\/.+\/functions\/v1\/rota27-sync\/?$/i.test(String(cfg.functionUrl||''))&&String(cfg.deviceToken||'').length>=16&&!!cfg.deviceId;
  }
  function currentAccess(){return window.Rota27V025208Access?.getProfile?.()||null;}
  function canManageDevices(){
    const access=window.Rota27V025208Access;
    if(access?.canEdit)return access.canEdit('devices')===true;
    return currentAccess()?.role==='owner';
  }
  function isOwner(){return currentAccess()?.role==='owner';}
  function randomNonce(){
    const bytes=new Uint8Array(18);crypto.getRandomValues(bytes);
    return Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
  }
  function getClaimNonce(){
    let nonce=clean(sessionStorage.getItem(CLAIM_NONCE_KEY)||'',120);
    if(nonce.length<16){nonce=randomNonce();sessionStorage.setItem(CLAIM_NONCE_KEY,nonce);}
    return nonce;
  }

  async function enrollApi(body,{auth=true}={}){
    const cfg=syncConfig();
    const headers={'content-type':'application/json'};
    if(auth){
      if(!cfg.deviceId||String(cfg.deviceToken||'').length<16)throw new Error('Este aparelho ainda não possui credencial para autorizar outro.');
      headers['x-rota27-device-token']=String(cfg.deviceToken);
    }
    const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),15000);
    try{
      const response=await fetch(ENROLL_URL,{method:'POST',headers,body:JSON.stringify(body),signal:ctrl.signal});
      const data=await response.json().catch(()=>({}));
      if(!response.ok||data?.ok!==true){
        const error=new Error(clean(data?.error||`Falha HTTP ${response.status}`,320));
        error.code=clean(data?.code,80);throw error;
      }
      return data;
    }finally{clearTimeout(timer);}
  }

  function ensureOwnerSheet(){
    if(byId('v025211EnrollOwnerWrap'))return;
    const wrap=document.createElement('div');wrap.id='v025211EnrollOwnerWrap';wrap.className='v025211-enroll-wrap';
    wrap.innerHTML=`<section class="v025211-enroll-sheet" role="dialog" aria-modal="true">
      <header><div><h3>Autorizar novo aparelho</h3><p>Crie um convite temporário. O novo aparelho recebe credencial própria e as permissões escolhidas.</p></div><button type="button" class="v025211-close" aria-label="Fechar">×</button></header>
      <div id="v025211EnrollSetup">
        <label class="v025211-field">Nome do funcionário<input id="v025211Employee" maxlength="120" placeholder="Ex.: João — Balcão"></label>
        <label class="v025211-field">Perfil de acesso<select id="v025211Preset"></select></label>
        <div id="v025211PresetHint" class="v025211-hint"></div>
        <div id="v025211CustomPermissions" class="v025211-permissions"></div>
        <button type="button" class="primary v025211-wide" id="v025211CreateInvite">Gerar QR Code e código</button>
      </div>
      <div id="v025211InviteResult" class="v025211-result" hidden>
        <div class="v025211-valid"><strong>Convite temporário</strong><span id="v025211Expires"></span></div>
        <div id="v025211Qr" class="v025211-qr" aria-label="QR Code de vínculo"></div>
        <p class="v025211-scan-help">No aparelho novo, abra a câmera e aponte para este QR. O Rota 27 abrirá e fará o vínculo automaticamente.</p>
        <div class="v025211-code"><small>Ou digite este código no aparelho novo</small><strong id="v025211ManualCode"></strong></div>
        <div class="v025211-result-actions"><button type="button" id="v025211CopyLink">Copiar link</button><button type="button" id="v025211ShareLink">Compartilhar</button><button type="button" class="danger" id="v025211RevokeInvite">Cancelar convite</button></div>
        <button type="button" class="secondary v025211-wide" id="v025211NewInvite">Gerar outro convite</button>
      </div>
      <div id="v025211OwnerStatus" class="v025211-status"></div>
    </section>`;
    document.body.appendChild(wrap);
    wrap.addEventListener('click',e=>{if(e.target===wrap)closeOwnerSheet();});
    wrap.querySelector('.v025211-close')?.addEventListener('click',closeOwnerSheet);
    byId('v025211Preset')?.addEventListener('change',renderPreset);
    byId('v025211CreateInvite')?.addEventListener('click',createInvite);
    byId('v025211NewInvite')?.addEventListener('click',resetInvite);
    byId('v025211CopyLink')?.addEventListener('click',copyInviteLink);
    byId('v025211ShareLink')?.addEventListener('click',shareInviteLink);
    byId('v025211RevokeInvite')?.addEventListener('click',revokeInvite);
  }
  function buildPresetOptions(){
    const select=byId('v025211Preset');if(!select)return;
    const options=Object.entries(PRESETS).map(([key,p])=>`<option value="${key}">${esc(p.label)}</option>`);
    if(isOwner())options.splice(options.length-1,0,'<option value="owner">Proprietário</option>');
    select.innerHTML=options.join('');
    select.value='waiter';renderPreset();
  }
  function renderPreset(){
    const key=byId('v025211Preset')?.value||'waiter';
    const host=byId('v025211CustomPermissions'),hint=byId('v025211PresetHint');
    const preset=key==='owner'?{label:'Proprietário',hint:'Acesso total. Use somente para aparelhos de administração.',permissions:FULL()}:PRESETS[key]||PRESETS.waiter;
    if(hint)hint.textContent=preset.hint;
    if(!host)return;
    if(key!=='custom'){host.innerHTML='';host.hidden=true;return;}
    host.hidden=false;
    host.innerHTML=PERMISSION_KEYS.map(area=>`<label><span>${esc(LABELS[area])}</span><select data-v025211-permission="${area}"><option value="none">Não ver</option><option value="view">Ver</option><option value="edit">Ver e editar</option></select></label>`).join('');
  }
  function selectedAccess(){
    const presetKey=byId('v025211Preset')?.value||'waiter';
    if(presetKey==='owner')return {role:'owner',permissions:FULL()};
    if(presetKey!=='custom')return {role:'staff',permissions:clone(PRESETS[presetKey]?.permissions||PRESETS.waiter.permissions)};
    const permissions=NONE();
    document.querySelectorAll('[data-v025211-permission]').forEach(el=>{permissions[el.dataset.v025211Permission]=el.value;});
    return {role:'staff',permissions};
  }
  let invite=null;
  function setOwnerStatus(text,kind=''){const el=byId('v025211OwnerStatus');if(el){el.className='v025211-status '+kind;el.textContent=text||'';}}
  async function createInvite(){
    if(!canManageDevices()){toast('Este aparelho não pode autorizar novos dispositivos.',true);return;}
    const cfg=syncConfig(),access=selectedAccess(),btn=byId('v025211CreateInvite');
    if(access.role==='owner'&&!isOwner()){toast('Somente proprietário pode autorizar outro proprietário.',true);return;}
    if(btn)btn.disabled=true;setOwnerStatus('Gerando convite seguro…','wait');
    try{
      const data=await enrollApi({action:'create',storeId:cfg.storeId||'rota27-bodega',deviceId:cfg.deviceId,deviceName:cfg.deviceName||'Aparelho',appVersion:releaseVersion(),employeeName:clean(byId('v025211Employee')?.value||'',120),role:access.role,permissions:access.permissions});
      const base=location.href.split('#')[0];
      const joiner=base.includes('?')?'&':'?';
      const link=`${base}${joiner}r27_pair=1#r27-enroll=${encodeURIComponent(data.enrollmentId)}&r27-secret=${encodeURIComponent(data.qrSecret)}`;
      invite={...data,link};
      byId('v025211EnrollSetup').hidden=true;byId('v025211InviteResult').hidden=false;
      byId('v025211ManualCode').textContent=String(data.code||'').replace(/(\d{4})(?=\d)/g,'$1 ');
      const exp=new Date(data.expiresAt);byId('v025211Expires').textContent=Number.isNaN(exp.getTime())?'Válido por poucos minutos':`Válido até ${exp.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}`;
      await renderQr(link);
      setOwnerStatus('Convite pronto. Ele funciona apenas uma vez.','ok');
    }catch(error){setOwnerStatus(error?.message||'Não foi possível criar o convite.','error');}
    finally{if(btn)btn.disabled=false;}
  }
  function resetInvite(){invite=null;byId('v025211EnrollSetup').hidden=false;byId('v025211InviteResult').hidden=true;byId('v025211Qr').innerHTML='';setOwnerStatus('');}
  async function revokeInvite(){
    if(!invite?.enrollmentId)return;
    if(!confirm('Cancelar este convite? Ele deixará de funcionar imediatamente.'))return;
    const cfg=syncConfig();
    try{await enrollApi({action:'revoke',storeId:cfg.storeId||'rota27-bodega',deviceId:cfg.deviceId,targetEnrollmentId:invite.enrollmentId,appVersion:releaseVersion()});setOwnerStatus('Convite cancelado.','ok');invite=null;byId('v025211RevokeInvite').disabled=true;}
    catch(error){setOwnerStatus(error?.message||'Não foi possível cancelar o convite.','error');}
  }
  async function copyInviteLink(){if(!invite?.link)return;try{await navigator.clipboard.writeText(invite.link);toast('Link de vínculo copiado.');}catch{toast('Não foi possível copiar o link.',true);}}
  async function shareInviteLink(){if(!invite?.link)return;if(navigator.share){try{await navigator.share({title:'Rota 27 — vincular aparelho',text:'Use este convite temporário para vincular o aparelho ao Rota 27.',url:invite.link});}catch{}}else copyInviteLink();}
  function closeOwnerSheet(){byId('v025211EnrollOwnerWrap')?.classList.remove('open');}
  function openOwnerSheet(){
    if(!canManageDevices()){toast('Gerenciamento de aparelhos não liberado neste dispositivo.',true);return;}
    ensureOwnerSheet();resetInvite();buildPresetOptions();byId('v025211EnrollOwnerWrap')?.classList.add('open');
  }

  let qrLoader=null;
  function loadQrLibrary(){
    if(window.QRCode)return Promise.resolve();
    if(qrLoader)return qrLoader;
    qrLoader=new Promise((resolve,reject)=>{
      const script=document.createElement('script');script.src=QR_LIB;script.async=true;script.crossOrigin='anonymous';
      script.onload=()=>window.QRCode?resolve():reject(new Error('Biblioteca de QR não carregou.'));
      script.onerror=()=>reject(new Error('Não foi possível carregar o gerador de QR.'));
      document.head.appendChild(script);
    });return qrLoader;
  }
  async function renderQr(text){
    const host=byId('v025211Qr');if(!host)return;
    host.innerHTML='<span>Gerando QR Code…</span>';
    try{await loadQrLibrary();host.innerHTML='';new QRCode(host,{text,width:232,height:232,correctLevel:QRCode.CorrectLevel.M});}
    catch(error){host.innerHTML='<span>QR indisponível neste momento. Use o código manual ou copie o link.</span>';console.warn('[Rota27 vínculo] QR:',error);}
  }

  function decorateDeviceSheet(){
    const sheet=byId('v02585DeviceWrap')?.querySelector('.v02585-device-sheet');if(!sheet)return;
    let button=byId('v025211AuthorizeDevice');
    if(canManageDevices()){
      if(!button){
        button=document.createElement('button');button.type='button';button.id='v025211AuthorizeDevice';button.className='v025211-authorize';
        button.innerHTML='<span>＋</span><b>Autorizar novo aparelho</b><small>QR Code ou código temporário</small>';
        const info=sheet.querySelector('.v02585-device-info');info?.insertAdjacentElement('afterend',button);
        button.addEventListener('click',openOwnerSheet);
      }
    }else button?.remove();
  }

  function ensureJoinGate(){
    if(byId('v025211JoinGate'))return;
    const gate=document.createElement('div');gate.id='v025211JoinGate';
    gate.innerHTML=`<section class="v025211-join-card">
      <div class="v025211-join-brand">ROTA 27 BODEGA</div>
      <h2>Vincular este aparelho</h2>
      <p>Este aparelho ainda não está ligado à loja. Aponte a câmera para o QR gerado pelo gerente ou digite o código temporário.</p>
      <label class="v025211-field">Código de autorização<input id="v025211JoinCode" inputmode="numeric" autocomplete="one-time-code" maxlength="11" placeholder="0000 0000"></label>
      <button type="button" class="primary v025211-wide" id="v025211ClaimCode">Vincular com código</button>
      <div id="v025211JoinStatus" class="v025211-status"></div>
      <button type="button" class="v025211-advanced" id="v025211AdvancedSetup">Configuração avançada</button>
    </section>`;
    document.body.appendChild(gate);
    byId('v025211JoinCode')?.addEventListener('input',e=>{const digits=String(e.target.value||'').replace(/\D/g,'').slice(0,8);e.target.value=digits.replace(/(\d{4})(?=\d)/g,'$1 ');});
    byId('v025211ClaimCode')?.addEventListener('click',()=>claimEnrollment({code:String(byId('v025211JoinCode')?.value||'').replace(/\D/g,'')}));
    byId('v025211AdvancedSetup')?.addEventListener('click',openAdvancedSetup);
  }
  function setJoinStatus(text,kind=''){const el=byId('v025211JoinStatus');if(el){el.className='v025211-status '+kind;el.textContent=text||'';}}
  function showGate(show=true){ensureJoinGate();byId('v025211JoinGate')?.classList.toggle('open',show);}
  function openAdvancedSetup(){
    showGate(false);
    try{window.v15OpenSyncSheet?.();}catch{}
    const timer=setInterval(()=>{if(syncReady()){clearInterval(timer);location.reload();return;}const wrap=byId('v15SyncWrap');if(wrap&&!wrap.classList.contains('open')){clearInterval(timer);showGate(true);}},500);
    setTimeout(()=>clearInterval(timer),120000);
  }

  function captureHashInvite(){
    const raw=String(location.hash||'').replace(/^#/,'');if(!raw)return null;
    const params=new URLSearchParams(raw);const enrollmentId=clean(params.get('r27-enroll')||'',80),qrSecret=clean(params.get('r27-secret')||'',200);
    if(!enrollmentId||!qrSecret)return null;
    const pending={enrollmentId,qrSecret,capturedAt:Date.now()};writeJson(PENDING_KEY,pending);
    try{history.replaceState(null,'',location.pathname+location.search);}catch{}
    return pending;
  }

  async function claimEnrollment(input){
    const code=clean(input?.code||'',20).replace(/\D/g,'');
    const enrollmentId=clean(input?.enrollmentId||'',80),qrSecret=clean(input?.qrSecret||'',200);
    if(!qrSecret&&code.length!==8){setJoinStatus('Digite os 8 números do código de autorização.','error');return;}
    const btn=byId('v025211ClaimCode');if(btn)btn.disabled=true;
    showGate(true);setJoinStatus('Validando convite e preparando este aparelho…','wait');
    try{
      const data=await enrollApi({action:'claim',enrollmentId,qrSecret,code,claimNonce:getClaimNonce(),deviceName:defaultDeviceName(),appVersion:releaseVersion()},{auth:false});
      setJoinStatus('Convite validado. Baixando a base compartilhada…','wait');
      await bootstrapClaimedDevice(data);
      sessionStorage.removeItem(CLAIM_NONCE_KEY);localStorage.removeItem(PENDING_KEY);
      setJoinStatus('Aparelho vinculado. Abrindo o Rota 27…','ok');
      setTimeout(()=>location.reload(),300);
    }catch(error){
      setJoinStatus(error?.message||'Não foi possível vincular este aparelho.','error');
    }finally{if(btn)btn.disabled=false;}
  }

  function coreSnapshot(source){
    const s=source&&typeof source==='object'?source:{};
    return {commands:clone(Array.isArray(s.commands)?s.commands:[]),history:clone(Array.isArray(s.history)?s.history:[]),catalog:clone(Array.isArray(s.catalog)?s.catalog:[]),categories:clone(Array.isArray(s.categories)?s.categories:[]),categoryStatus:clone(s.categoryStatus&&typeof s.categoryStatus==='object'?s.categoryStatus:{})};
  }
  function findById(rows,id){return (Array.isArray(rows)?rows:[]).find(x=>String(x?.id||'')===String(id||''))||null;}
  function applyCoreEvent(event){
    const type=String(event?.event_type||event?.eventType||''),id=String(event?.entity_id||event?.entityId||''),payload=event?.payload||{};
    if(type==='state_snapshot'&&String(payload?.reason||'')==='initial-publish'&&payload?.state){
      const snap=coreSnapshot(payload.state);state.commands=snap.commands;state.history=snap.history;state.catalog=snap.catalog;state.categories=snap.categories;state.categoryStatus=snap.categoryStatus;return true;
    }
    if(type==='command_opened'){
      const incoming=clone(payload.command);if(!incoming?.id||findById(state.history,id))return false;const existing=findById(state.commands,id);if(existing)Object.assign(existing,incoming);else state.commands.push(incoming);return true;
    }
    if(type==='command_patch'){const command=findById(state.commands,id);if(!command)return false;Object.assign(command,payload.patch||{});command.updatedAt=Date.now();return true;}
    if(type==='item_delta'){
      const command=findById(state.commands,id);if(!command)return false;const productId=String(payload.productId||''),delta=Number(payload.delta||0);if(!productId||!delta)return false;
      command.items=command.items&&typeof command.items==='object'?command.items:{};command.itemMeta=command.itemMeta&&typeof command.itemMeta==='object'?command.itemMeta:{};
      const next=Math.max(0,Number(command.items[productId]||0)+delta);if(next>0){command.items[productId]=next;if(payload.meta&&!command.itemMeta[productId])command.itemMeta[productId]=clone(payload.meta);}else{delete command.items[productId];delete command.itemMeta[productId];}command.updatedAt=Date.now();return true;
    }
    if(type==='command_closed'||type==='history_upsert'){
      const incoming=clone(payload.command);if(!incoming?.id)return false;state.commands=(state.commands||[]).filter(c=>String(c?.id||'')!==id);const idx=(state.history||[]).findIndex(c=>String(c?.id||'')===id);if(idx>=0)state.history[idx]=incoming;else state.history.push(incoming);return true;
    }
    if(type==='catalog_upsert'){const product=clone(payload.product);if(!product?.id)return false;const idx=(state.catalog||[]).findIndex(p=>String(p?.id||'')===String(product.id));if(idx>=0)state.catalog[idx]=product;else state.catalog.push(product);return true;}
    if(type==='catalog_delete'){state.catalog=(state.catalog||[]).filter(p=>String(p?.id||'')!==id);return true;}
    if(type==='categories_replace'){state.categories=clone(Array.isArray(payload.categories)?payload.categories:[]);state.categoryStatus=clone(payload.categoryStatus&&typeof payload.categoryStatus==='object'?payload.categoryStatus:{});return true;}
    return false;
  }
  async function syncApiWithClaim(claim,body){
    const response=await fetch(claim.syncUrl,{method:'POST',headers:{'content-type':'application/json','x-rota27-device-token':claim.deviceToken},body:JSON.stringify({...body,storeId:claim.storeId,deviceId:claim.deviceId,deviceName:claim.deviceName||defaultDeviceName(),appVersion:releaseVersion()})});
    const data=await response.json().catch(()=>({}));if(!response.ok||data?.ok!==true)throw new Error(clean(data?.error||`Falha HTTP ${response.status}`,320));return data;
  }
  async function bootstrapClaimedDevice(claim){
    if(!claim?.syncUrl||!claim?.deviceId||String(claim?.deviceToken||'').length<16)throw new Error('Credencial do novo aparelho incompleta.');
    try{localStorage.setItem(PRE_ADOPT_BACKUP_KEY,JSON.stringify({savedAt:new Date().toISOString(),version:releaseVersion(),state:clone(typeof state!=='undefined'?state:{})}));}catch{throw new Error('Não foi possível guardar a cópia de segurança local. Libere espaço e tente novamente.');}
    let cursor=0,latest=0,sawSnapshot=false,changed=false;
    for(let page=0;page<30;page++){
      const requested=cursor;
      const data=await syncApiWithClaim(claim,{action:'pull',afterSeq:requested,limit:300,preferSnapshot:page===0});
      const events=Array.isArray(data.events)?data.events:[];
      for(const event of events){if(String(event?.event_type||'')==='state_snapshot'&&String(event?.payload?.reason||'')==='initial-publish')sawSnapshot=true;if(applyCoreEvent(event))changed=true;}
      const next=Math.max(requested,Number(data.cursor||requested));latest=Math.max(latest,Number(data.latestSeq||next));cursor=next;
      if(!data.hasMore)break;
      if(!events.length&&next<=requested)break;
    }
    if(!sawSnapshot)throw new Error('A loja ainda não possui uma base inicial confiável para adoção.');
    if(changed){try{typeof save==='function'&&save();}catch(error){throw new Error('Falha ao salvar a base compartilhada neste aparelho.');}}
    const old=syncConfig();
    const next={...old,enabled:true,initialized:true,functionUrl:claim.syncUrl,deviceToken:claim.deviceToken,storeId:claim.storeId||'rota27-bodega',deviceId:claim.deviceId,deviceName:claim.deviceName||defaultDeviceName(),cursor,outbox:[],conflicts:[],lastSyncAt:Date.now(),lastError:'',latestServerSeq:latest,latestSnapshotSeq:Number(claim.latestSnapshotSeq||0),devices:[]};
    if(!writeJson(SYNC_KEY,next))throw new Error('Não foi possível salvar a credencial neste aparelho.');
    if(claim.access)writeJson(ACCESS_CACHE_KEY,{deviceId:claim.deviceId,profile:claim.access,fetchedAt:Date.now()});else localStorage.removeItem(ACCESS_CACHE_KEY);
  }

  function observe(){
    const observer=new MutationObserver(()=>{if(byId('v02585DeviceWrap'))decorateDeviceSheet();});
    observer.observe(document.body,{childList:true,subtree:true});
    document.addEventListener('click',e=>{if(e.target.closest?.('#v02585OpenDevices'))setTimeout(decorateDeviceSheet,80);},true);
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){setTimeout(decorateDeviceSheet,100);if(!syncReady())showGate(true);}});
  }

  function start(){
    ensureOwnerSheet();ensureJoinGate();observe();
    const hashInvite=captureHashInvite(),pending=hashInvite||readJson(PENDING_KEY,null);
    if(syncReady()){showGate(false);setTimeout(decorateDeviceSheet,500);return;}
    showGate(true);
    if(pending?.enrollmentId&&pending?.qrSecret)setTimeout(()=>claimEnrollment(pending),120);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
  window.Rota27V025211Enrollment={version:VERSION,open:openOwnerSheet,claim:claimEnrollment,refresh:decorateDeviceSheet};
})();
