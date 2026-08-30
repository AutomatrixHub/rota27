/* Rota 27 v0.25.74 — consentimento persistente para atualizações de comanda no WhatsApp */
(function(){
  'use strict';

  const VERSION='0.25.74';
  const STORE_KEY='rota27_v02574_whatsapp_consent_v1';
  const CURSOR_KEY='rota27_v02574_whatsapp_consent_cursor_v1';
  const SYNC_CONFIG_KEY='rota27_sync_config_v1';
  const MAX_PAGES=30;
  let syncing=false;
  let baseCreateCommand=null;
  let bound=false;

  const byId=id=>document.getElementById(id);
  const api=()=>window.Rota27V017||null;
  const clone=v=>JSON.parse(JSON.stringify(v==null?null:v));
  const clean=(v,max=240)=>api()?.clean?.(v,max)||String(v??'').replace(/[\u0000-\u001F\u007F]/g,' ').trim().replace(/\s+/g,' ').slice(0,max);
  const norm=v=>api()?.norm?.(v)||clean(v,500).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');
  const phone=v=>api()?.normalizePhone?.(v)||String(v||'').replace(/\D/g,'');
  const validPhone=v=>{const p=phone(v);return p.length>=12&&p.length<=15;};
  const toast=msg=>{try{api()?.toast?.(msg)}catch{try{showToast(msg,false)}catch{}}};

  function identity(){
    document.title=`Rota 27 Bodega • Comandas v${VERSION}`;
    const meta=document.querySelector('meta[name="rota27-release-version"]');if(meta)meta.content=VERSION;
    let style=byId('v02574ReleaseIdentity');
    if(!style){style=document.createElement('style');style.id='v02574ReleaseIdentity';document.head.appendChild(style);}
    style.textContent=`#v14VersionBadge::after{content:"v${VERSION}"!important}`;
  }

  function clients(){
    try{return Array.isArray(api()?.clients?.())?api().clients():Array.isArray(state?.clients)?state.clients:[];}catch{return [];}
  }
  function findClient(name,rawPhone,id=''){
    if(id){const hit=clients().find(c=>String(c?.id||'')===String(id));if(hit)return hit;}
    const p=phone(rawPhone||'');
    if(p)return clients().find(c=>phone(c?.whatsappPhone||'')===p)||null;
    const n=norm(name||'');
    if(!n)return null;
    const matches=clients().filter(c=>norm(c?.name||'')===n);
    return matches.length===1?matches[0]:null;
  }

  function readStore(){
    try{
      const raw=JSON.parse(localStorage.getItem(STORE_KEY)||'{}');
      return raw&&typeof raw==='object'&&raw.records&&typeof raw.records==='object'?raw:{version:1,records:{}};
    }catch{return {version:1,records:{}};}
  }
  function writeStore(store){try{localStorage.setItem(STORE_KEY,JSON.stringify(store));}catch{}}
  function keysFor(client){
    const out=[];
    const id=clean(client?.id,160);if(id)out.push(`i:${id}`);
    const p=phone(client?.whatsappPhone||client?.phone||'');if(p)out.push(`p:${p}`);
    return out;
  }
  function normalizeStatus(value){return value==='granted'||value==='revoked'?value:'unknown';}
  function statusRank(value){return normalizeStatus(value)==='revoked'?2:normalizeStatus(value)==='granted'?1:0;}
  function compareRecord(a,b){
    if(!b)return 1;if(!a)return -1;
    const at=Number(a.updatedAt||0),bt=Number(b.updatedAt||0);
    if(at!==bt)return at>bt?1:-1;
    const as=Number(a.seq||0),bs=Number(b.seq||0);
    if(as!==bs)return as>bs?1:-1;
    const ar=statusRank(a.status),br=statusRank(b.status);
    return ar===br?0:(ar>br?1:-1);
  }
  function bestRecord(client){
    const store=readStore();let best=null;
    keysFor(client).forEach(k=>{const r=store.records[k];if(r&&typeof r==='object'&&compareRecord(r,best)>0)best=r;});
    return best;
  }
  function recordLabel(record){
    const ts=Number(record?.updatedAt||0);if(!ts)return '';
    try{return new Date(ts).toLocaleDateString('pt-BR');}catch{return '';}
  }
  function writeRecord(client,status,meta={}){
    if(!client)return false;
    status=normalizeStatus(status);if(status==='unknown')return false;
    const store=readStore();
    const record={
      clientId:clean(client.id,160),
      whatsappPhone:phone(client.whatsappPhone||''),
      status,
      scope:'command_updates',
      version:1,
      source:clean(meta.source||'operator',80)||'operator',
      updatedAt:Math.max(0,Number(meta.updatedAt||Date.now())),
      seq:Math.max(0,Number(meta.seq||0))
    };
    let changed=false;
    keysFor(client).forEach(k=>{
      const old=store.records[k];
      if(!old||compareRecord(record,old)>=0){
        if(JSON.stringify(old)!==JSON.stringify(record)){store.records[k]=record;changed=true;}
      }
    });
    if(changed)writeStore(store);
    return changed;
  }

  function readSyncConfig(){try{return JSON.parse(localStorage.getItem(SYNC_CONFIG_KEY)||'{}')||{};}catch{return {};}}
  function syncReady(){
    const cfg=readSyncConfig();
    return cfg.enabled===true&&cfg.initialized===true&&/^https:\/\/.+\/functions\/v1\/rota27-sync\/?$/i.test(String(cfg.functionUrl||''))&&String(cfg.deviceToken||'').length>=16&&!!cfg.deviceId;
  }
  function getCursor(){return Math.max(0,Number(localStorage.getItem(CURSOR_KEY)||0));}
  function setCursor(v){try{localStorage.setItem(CURSOR_KEY,String(Math.max(0,Number(v||0))));}catch{}}
  async function syncApi(body){
    const cfg=readSyncConfig();if(!syncReady())throw new Error('Sincronização indisponível neste aparelho.');
    const ctrl=new AbortController(),timeout=setTimeout(()=>ctrl.abort(),12000);
    try{
      const r=await fetch(String(cfg.functionUrl).replace(/\/+$/,''),{
        method:'POST',headers:{'content-type':'application/json','x-rota27-device-token':cfg.deviceToken},
        body:JSON.stringify({...body,deviceId:cfg.deviceId,deviceName:cfg.deviceName||'Aparelho',storeId:cfg.storeId||'rota27-bodega',appVersion:VERSION}),signal:ctrl.signal
      });
      const data=await r.json().catch(()=>({}));
      if(!r.ok||data.ok!==true)throw new Error(data.error||`HTTP ${r.status}`);
      return data;
    }finally{clearTimeout(timeout);}
  }

  function applyRemoteConsent(event){
    if(String(event?.event_type||event?.eventType||'')!=='client_upsert')return false;
    const raw=event?.payload?.client;
    if(!raw||typeof raw!=='object'||!Object.prototype.hasOwnProperty.call(raw,'whatsappCommandConsent'))return false;
    const status=normalizeStatus(raw.whatsappCommandConsent);if(status==='unknown')return false;
    const seq=Math.max(0,Number(event?.seq||0));
    const updatedAt=Number(raw.whatsappCommandConsentUpdatedAt||raw.whatsappCommandConsentAt||0)||Date.parse(event?.created_at||event?.createdAt||'')||Date.now();
    const c=findClient(raw.name,raw.whatsappPhone||raw.phone,raw.id||event?.entity_id||event?.entityId);
    if(c)return writeRecord(c,status,{seq,updatedAt,source:raw.whatsappCommandConsentSource||'sync'});

    const store=readStore();
    const shadow={id:clean(raw.id||event?.entity_id||event?.entityId,160),whatsappPhone:phone(raw.whatsappPhone||raw.phone||'')};
    const record={clientId:shadow.id,whatsappPhone:shadow.whatsappPhone,status,scope:'command_updates',version:1,source:clean(raw.whatsappCommandConsentSource||'sync',80),updatedAt,seq};
    let changed=false;
    keysFor(shadow).forEach(k=>{
      const old=store.records[k];
      if(!old||compareRecord(record,old)>=0){
        if(JSON.stringify(old)!==JSON.stringify(record)){store.records[k]=record;changed=true;}
      }
    });
    if(changed)writeStore(store);
    return changed;
  }

  async function syncConsents(){
    if(syncing||!navigator.onLine||!syncReady())return false;
    syncing=true;let cursor=getCursor(),changed=false;
    try{
      for(let page=0;page<MAX_PAGES;page++){
        const data=await syncApi({action:'pull',afterSeq:cursor,limit:300,preferSnapshot:false});
        const events=Array.isArray(data.events)?data.events:[];
        for(const event of events){cursor=Math.max(cursor,Number(event?.seq||0));if(applyRemoteConsent(event))changed=true;}
        setCursor(Math.max(cursor,Number(data.cursor||cursor)));
        if(!data.hasMore||!events.length)break;
      }
      if(changed){refreshNewCommandConsent();decorateClientEditor();window.dispatchEvent(new CustomEvent('rota27:v02574-whatsapp-consent-updated'));}
      return changed;
    }catch(err){console.warn('[Rota27 v0.25.74] Falha ao sincronizar consentimentos:',err?.message||err);return false;}
    finally{syncing=false;}
  }

  function queueConsent(client,status,source,updatedAt=Date.now()){
    if(!client)return false;
    const current=bestRecord(client);
    const candidate={status,updatedAt,seq:Number(current?.seq||0)};
    if(current&&compareRecord(candidate,current)<=0&&normalizeStatus(current.status)===status)return false;
    writeRecord(client,status,{source,updatedAt,seq:Number(current?.seq||0)});
    const payload={...clone(client),whatsappCommandConsent:status,whatsappCommandConsentAt:updatedAt,whatsappCommandConsentUpdatedAt:updatedAt,whatsappCommandConsentSource:source,whatsappCommandConsentVersion:1};
    try{api()?.queueDomainEvent?.('client_upsert',client.id,{client:payload});}catch{}
    try{setTimeout(()=>api()?.syncDomainNow?.(),50);}catch{}
    setTimeout(syncConsents,900);
    window.dispatchEvent(new CustomEvent('rota27:v02574-whatsapp-consent-updated',{detail:{clientId:client.id,status,source}}));
    return true;
  }

  function legacyGrantFor(client){
    const p=phone(client?.whatsappPhone||''),n=norm(client?.name||'');
    const rows=[...(Array.isArray(state?.history)?state.history:[]),...(Array.isArray(state?.commands)?state.commands:[])];
    const matches=rows.filter(c=>c?.whatsappOptIn===true&&((p&&phone(c?.whatsappPhone||'')===p)||(!p&&n&&norm(c?.customer||'')===n)));
    if(!matches.length)return null;
    matches.sort((a,b)=>Number(b?.createdAt||b?.updatedAt||0)-Number(a?.createdAt||a?.updatedAt||0));
    return matches[0];
  }
  function migrateLegacyConsents(){
    let migrated=0;
    clients().forEach(client=>{
      if(bestRecord(client))return;
      const cmd=legacyGrantFor(client);if(!cmd)return;
      const at=Math.max(1,Number(cmd.createdAt||cmd.updatedAt||Date.now()));
      if(writeRecord(client,'granted',{source:'legacy-command-optin',updatedAt:at,seq:0})){
        migrated++;
        const payload={...clone(client),whatsappCommandConsent:'granted',whatsappCommandConsentAt:at,whatsappCommandConsentUpdatedAt:at,whatsappCommandConsentSource:'legacy-command-optin',whatsappCommandConsentVersion:1};
        try{api()?.queueDomainEvent?.('client_upsert',client.id,{client:payload});}catch{}
      }
    });
    if(migrated){try{setTimeout(()=>api()?.syncDomainNow?.(),80);}catch{}setTimeout(syncConsents,1000);}
    return migrated;
  }

  function ensureHint(){
    const opt=byId('newWhatsappOptIn');if(!opt)return null;
    const consent=opt.closest('.wa-consent')||opt.parentElement;
    if(!consent)return null;
    let hint=byId('v02574ConsentHint');
    if(!hint){
      hint=document.createElement('div');hint.id='v02574ConsentHint';hint.className='v02574-consent-hint';
      consent.insertAdjacentElement('afterend',hint);
    }
    return hint;
  }
  function baseConsentCopy(text){const small=byId('newWhatsappOptIn')?.closest('.wa-consent')?.querySelector('small');if(small)small.textContent=text;}
  function selectedClient(){return findClient(byId('newCustomer')?.value||'',byId('newWhatsapp')?.value||'',byId('newWhatsappOptIn')?.dataset?.v02574ClientId||'');}
  function renderHint(client,record,manualOff=false){
    const hint=ensureHint();if(!hint)return;
    const status=normalizeStatus(record?.status);
    hint.className='v02574-consent-hint '+status;
    if(!client){baseConsentCopy('Marque somente após o cliente autorizar o recebimento das atualizações desta comanda.');hint.innerHTML='Para cliente novo, marque somente após autorização. A permissão ficará salva no cadastro.';return;}
    const when=recordLabel(record);
    if(status==='granted'){
      baseConsentCopy(manualOff?'Autorização salva; esta comanda foi deixada sem atualizações.':'Autorização já registrada para atualizações operacionais da comanda.');
      hint.innerHTML=manualOff
        ? `Autorização salva${when?` em ${when}`:''}, mas <strong>esta comanda ficará sem atualizações</strong>. <button type="button" data-v02574-revoke>Revogar autorização salva</button>`
        : `Autorização já registrada${when?` em ${when}`:''}. As atualizações desta comanda estão habilitadas automaticamente. <button type="button" data-v02574-revoke>Revogar autorização salva</button>`;
      return;
    }
    if(status==='revoked'){
      baseConsentCopy('Autorização revogada. Marque somente após o cliente autorizar novamente.');
      hint.innerHTML=`Autorização revogada${when?` em ${when}`:''}. Se o cliente autorizar novamente, marque a opção para registrar uma nova autorização.`;
      return;
    }
    baseConsentCopy('Marque somente após o cliente autorizar o recebimento das atualizações desta comanda.');
    hint.innerHTML='Cliente cadastrado sem autorização registrada. Marque somente após o cliente autorizar.';
  }

  function refreshNewCommandConsent(){
    const opt=byId('newWhatsappOptIn');if(!opt)return;
    ensureHint();
    const client=findClient(byId('newCustomer')?.value||'',byId('newWhatsapp')?.value||'');
    const clientId=String(client?.id||'');
    if(String(opt.dataset.v02574ClientId||'')!==clientId){delete opt.dataset.v02574ManualOff;delete opt.dataset.v02574PendingGrant;opt.dataset.v02574ClientId=clientId;}
    const record=client?bestRecord(client):null;
    const status=normalizeStatus(record?.status);
    const manualOff=opt.dataset.v02574ManualOff==='1';
    if(status==='granted'&&!manualOff)opt.checked=true;
    else if(status==='revoked')opt.checked=false;
    renderHint(client,record,manualOff);
  }

  function onCheckboxChange(){
    const opt=byId('newWhatsappOptIn');if(!opt)return;
    const client=findClient(byId('newCustomer')?.value||'',byId('newWhatsapp')?.value||'');
    if(opt.checked){
      delete opt.dataset.v02574ManualOff;
      if(client&&validPhone(client.whatsappPhone||byId('newWhatsapp')?.value||'')){
        const current=bestRecord(client);
        if(normalizeStatus(current?.status)!=='granted')queueConsent(client,'granted','new-command-checkbox');
      }else opt.dataset.v02574PendingGrant='1';
    }else{
      delete opt.dataset.v02574PendingGrant;
      if(client&&normalizeStatus(bestRecord(client)?.status)==='granted')opt.dataset.v02574ManualOff='1';
    }
    refreshNewCommandConsent();
  }

  function revokeSelected(){
    const client=selectedClient();if(!client)return;
    const name=clean(client.name||'cliente',120)||'cliente';
    if(!window.confirm(`Revogar a autorização de WhatsApp de ${name}?\n\nNovas comandas não serão marcadas automaticamente até o cliente autorizar novamente.`))return;
    queueConsent(client,'revoked','operator-revoke');
    const opt=byId('newWhatsappOptIn');if(opt){opt.checked=false;delete opt.dataset.v02574ManualOff;}
    refreshNewCommandConsent();
    decorateClientEditor();
    toast('Autorização de WhatsApp revogada.');
  }

  function resetForNewCommand(){
    const opt=byId('newWhatsappOptIn');
    if(opt){opt.checked=false;delete opt.dataset.v02574ClientId;delete opt.dataset.v02574ManualOff;delete opt.dataset.v02574PendingGrant;}
    baseConsentCopy('Marque somente após o cliente autorizar o recebimento das atualizações desta comanda.');
    const hint=ensureHint();if(hint){hint.className='v02574-consent-hint';hint.textContent='Selecione um cliente para verificar se já existe autorização de WhatsApp.';}
  }
  function isNewCommandTrigger(target){return !!target?.closest?.('#fabNew,#commandsEmpty [onclick*="openNewCommandSheet"],[data-v02570-new-command],#v0252MapAddMesa,#v0252MapAddCounter,#v0252MapAddParklet,#v0252MapAddClient');}

  function applyPendingGrant(pending,attempt=0){
    const client=findClient(pending.name,pending.rawPhone);
    if(client){
      const current=bestRecord(client);
      if(pending.checked&&normalizeStatus(current?.status)!=='granted')queueConsent(client,'granted','new-command-open');
      return;
    }
    if(attempt<8)setTimeout(()=>applyPendingGrant(pending,attempt+1),80);
  }
  function patchCreateCommand(){
    const current=window.createCommand;
    if(typeof current!=='function'||current.__v02574Consent)return;
    baseCreateCommand=current;
    const wrapped=function(){
      const pending={name:byId('newCustomer')?.value?.trim()||'',rawPhone:byId('newWhatsapp')?.value?.trim()||'',checked:byId('newWhatsappOptIn')?.checked===true};
      const result=baseCreateCommand.apply(this,arguments);
      if(pending.checked)setTimeout(()=>applyPendingGrant(pending),40);
      return result;
    };
    wrapped.__v02574Consent=true;
    try{window.createCommand=wrapped;createCommand=wrapped;}catch{window.createCommand=wrapped;}
  }

  function ensureClientEditorConsent(){
    const editor=byId('v017ClientEditWrap');if(!editor)return false;
    const desc=editor.querySelector('.v017-editor .desc')||editor.querySelector('.desc');
    if(desc)desc.textContent='A autorização para atualizações da comanda fica salva no cadastro e pode ser revogada aqui.';
    let box=byId('v02574ClientConsentBox');
    if(!box){
      const phoneField=byId('v017ClientPhone')?.closest('.field');
      const birthdayField=byId('v02517BirthField');
      const anchor=birthdayField||phoneField;if(!anchor)return false;
      box=document.createElement('div');box.id='v02574ClientConsentBox';box.className='v02574-client-consent';
      anchor.insertAdjacentElement('afterend',box);
    }
    return true;
  }
  function editorClient(){return findClient(byId('v017ClientName')?.value||'',byId('v017ClientPhone')?.value||'',byId('v017ClientId')?.value||'');}
  function decorateClientEditor(){
    if(!ensureClientEditorConsent())return;
    const box=byId('v02574ClientConsentBox'),client=editorClient();if(!box)return;
    if(!client){box.className='v02574-client-consent';box.innerHTML='<div><small>Atualizações da comanda por WhatsApp</small><strong>Será registrado após salvar um cliente com WhatsApp</strong></div>';return;}
    const record=bestRecord(client),status=normalizeStatus(record?.status),when=recordLabel(record);
    const label=status==='granted'?'Autorizado':status==='revoked'?'Revogado':'Não registrado';
    box.className=`v02574-client-consent ${status}`;
    box.innerHTML=`<div><small>Atualizações da comanda por WhatsApp</small><strong>${label}${when?` • ${when}`:''}</strong></div><button type="button" data-v02574-editor-action="${status==='granted'?'revoke':'grant'}">${status==='granted'?'Revogar autorização':'Registrar autorização'}</button>`;
  }
  function editorAction(action){
    const client=editorClient();if(!client)return;
    if(action==='revoke'){
      if(!window.confirm(`Revogar a autorização de WhatsApp de ${clean(client.name,120)}?`))return;
      queueConsent(client,'revoked','client-editor-revoke');toast('Autorização de WhatsApp revogada.');
    }else{
      if(!validPhone(client.whatsappPhone||'')){toast('Informe um WhatsApp válido no cadastro antes de registrar a autorização.');return;}
      if(!window.confirm(`Registrar que ${clean(client.name,120)} autorizou atualizações operacionais da comanda por WhatsApp?`))return;
      queueConsent(client,'granted','client-editor-grant');toast('Autorização de WhatsApp registrada.');
    }
    decorateClientEditor();refreshNewCommandConsent();
  }

  function bind(){
    if(bound)return;bound=true;
    ensureHint();
    const refresh=()=>setTimeout(refreshNewCommandConsent,0);
    byId('newCustomer')?.addEventListener('change',refresh);
    byId('newCustomer')?.addEventListener('blur',refresh);
    byId('newCustomer')?.addEventListener('input',()=>setTimeout(refreshNewCommandConsent,0));
    byId('newWhatsapp')?.addEventListener('change',refresh);
    byId('newWhatsapp')?.addEventListener('blur',refresh);
    byId('newWhatsappOptIn')?.addEventListener('change',onCheckboxChange);
    window.addEventListener('click',e=>{if(isNewCommandTrigger(e.target))resetForNewCommand();},true);
    document.addEventListener('click',e=>{
      if(e.target.closest?.('[data-v02574-revoke]')){e.preventDefault();revokeSelected();return;}
      const action=e.target.closest?.('[data-v02574-editor-action]')?.dataset?.v02574EditorAction;if(action){e.preventDefault();editorAction(action);return;}
      if(e.target.closest?.('[data-v02571-client],[data-v02513-client]'))setTimeout(()=>{refreshNewCommandConsent();syncConsents().then(refreshNewCommandConsent);},70);
      if(e.target.closest?.('.v017-client-row,#v017NewClient'))setTimeout(decorateClientEditor,30);
      if(e.target.closest?.('#v017ClientEditWrap'))setTimeout(decorateClientEditor,0);
    });
  }

  async function start(){
    identity();ensureHint();bind();patchCreateCommand();ensureClientEditorConsent();
    await syncConsents();
    migrateLegacyConsents();
    refreshNewCommandConsent();decorateClientEditor();
    window.addEventListener('online',()=>syncConsents().then(()=>{migrateLegacyConsents();refreshNewCommandConsent();decorateClientEditor();}));
    window.addEventListener('pageshow',()=>setTimeout(()=>syncConsents().then(()=>{refreshNewCommandConsent();decorateClientEditor();}),250));
    window.addEventListener('rota27:v017-domain-updated',()=>setTimeout(()=>syncConsents().then(()=>{migrateLegacyConsents();refreshNewCommandConsent();decorateClientEditor();}),50));
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){identity();patchCreateCommand();syncConsents().then(()=>{refreshNewCommandConsent();decorateClientEditor();});}});
    window.Rota27V02574WhatsappConsent={version:VERSION,get:client=>bestRecord(client),sync:syncConsents,refresh:refreshNewCommandConsent,migrate:migrateLegacyConsents};
    console.info('[Rota27] v0.25.74 — consentimento persistente de WhatsApp ativo.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
