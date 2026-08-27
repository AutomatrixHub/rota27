/* Rota 27 v0.25.17 — data de nascimento/aniversário no cadastro de clientes */
(function(){
  'use strict';

  const VERSION='0.25.17';
  const STORE_KEY='rota27_v02517_birthdays_v1';
  const CURSOR_KEY='rota27_v02517_birthdays_cursor_v1';
  const SYNC_CONFIG_KEY='rota27_sync_config_v1';
  const MAX_PAGES=30;
  let syncing=false;
  let activeProfileId='';
  let pendingImportBirthdays=[];
  let intervalId=null;

  const byId=id=>document.getElementById(id);
  const api=()=>window.Rota27V017||null;
  const clone=v=>JSON.parse(JSON.stringify(v==null?null:v));
  const clean=(v,max=240)=>api()?.clean?.(v,max)||String(v??'').replace(/[\u0000-\u001F\u007F]/g,' ').trim().replace(/\s+/g,' ').slice(0,max);
  const norm=v=>api()?.norm?.(v)||clean(v,500).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');
  const phone=v=>api()?.normalizePhone?.(v)||String(v||'').replace(/\D/g,'');
  const toast=msg=>{try{api()?.toast?.(msg)}catch{}};

  function todayIso(){
    const d=new Date(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');
    return `${d.getFullYear()}-${m}-${day}`;
  }

  function normalizeBirthDate(value){
    const raw=String(value??'').trim();
    if(!raw)return '';
    let y,m,d;
    let hit=raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if(hit){y=Number(hit[1]);m=Number(hit[2]);d=Number(hit[3]);}
    else{
      hit=raw.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/);
      if(!hit)return null;
      d=Number(hit[1]);m=Number(hit[2]);y=Number(hit[3]);
    }
    if(y<1900||m<1||m>12||d<1||d>31)return null;
    const dt=new Date(Date.UTC(y,m-1,d));
    if(dt.getUTCFullYear()!==y||dt.getUTCMonth()!==m-1||dt.getUTCDate()!==d)return null;
    const iso=`${String(y).padStart(4,'0')}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    if(iso>todayIso())return null;
    return iso;
  }

  function formatBirthDate(value){
    const iso=normalizeBirthDate(value);
    if(!iso)return '';
    const [y,m,d]=iso.split('-');
    return `${d}/${m}/${y}`;
  }

  function readStore(){
    try{
      const raw=JSON.parse(localStorage.getItem(STORE_KEY)||'{}');
      return raw&&typeof raw==='object'&&raw.records&&typeof raw.records==='object'?raw:{version:1,records:{}};
    }catch{return {version:1,records:{}};}
  }

  function writeStore(store){
    try{localStorage.setItem(STORE_KEY,JSON.stringify(store));}catch{}
  }

  function keysForClient(client){
    const out=[];
    const id=clean(client?.id,160);if(id)out.push(`i:${id}`);
    const p=phone(client?.whatsappPhone||'');if(p)out.push(`p:${p}`);
    return out;
  }

  function bestRecordForClient(client){
    const store=readStore();let best=null;
    keysForClient(client).forEach(k=>{
      const r=store.records[k];if(!r||typeof r!=='object')return;
      if(!best||Number(r.seq||0)>Number(best.seq||0)||(Number(r.seq||0)===Number(best.seq||0)&&Number(r.updatedAt||0)>Number(best.updatedAt||0)))best=r;
    });
    return best;
  }

  function writeClientRecord(client,birthDate,meta={}){
    if(!client)return false;
    const normalized=normalizeBirthDate(birthDate);
    if(normalized===null)return false;
    const store=readStore();
    const record={
      clientId:clean(client.id,160),
      whatsappPhone:phone(client.whatsappPhone||''),
      birthDate:normalized,
      updatedAt:Math.max(0,Number(meta.updatedAt||Date.now())),
      seq:Math.max(0,Number(meta.seq||0))
    };
    let changed=false;
    keysForClient(client).forEach(k=>{
      const old=store.records[k];
      if(!old||Number(record.seq||0)>Number(old.seq||0)||(Number(record.seq||0)===Number(old.seq||0)&&Number(record.updatedAt||0)>=Number(old.updatedAt||0))){
        store.records[k]=record;changed=true;
      }
    });
    if(changed)writeStore(store);
    return changed;
  }

  function safeSaveState(){
    try{if(typeof save==='function')save();}catch{}
  }

  function clients(){
    try{return Array.isArray(api()?.clients?.())?api().clients():[];}catch{return [];}
  }

  function findClient(id,rawPhone,name){
    if(id){const c=clients().find(x=>String(x?.id||'')===String(id));if(c)return c;}
    const p=phone(rawPhone||'');if(p){const c=clients().find(x=>phone(x?.whatsappPhone||'')===p);if(c)return c;}
    const n=norm(name||'');if(n)return clients().find(x=>norm(x?.name||'')===n)||null;
    return null;
  }

  function applyBirthdaysToClients(saveState=false){
    let changed=false;
    clients().forEach(client=>{
      const record=bestRecordForClient(client);if(!record)return;
      const next=normalizeBirthDate(record.birthDate);
      if(next===null)return;
      const old=normalizeBirthDate(client.birthDate);
      if(next){if(old!==next){client.birthDate=next;changed=true;}}
      else if(Object.prototype.hasOwnProperty.call(client,'birthDate')){delete client.birthDate;changed=true;}
    });
    if(changed&&saveState)safeSaveState();
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

  function applyRemoteBirthdayEvent(event){
    if(String(event?.event_type||event?.eventType||'')!=='client_upsert')return false;
    const payload=event?.payload&&typeof event.payload==='object'?event.payload:{};
    const raw=payload.client&&typeof payload.client==='object'?payload.client:null;
    if(!raw||!Object.prototype.hasOwnProperty.call(raw,'birthDate'))return false;
    const birthDate=normalizeBirthDate(raw.birthDate);
    if(birthDate===null)return false;
    const client=findClient(raw.id||event?.entity_id||event?.entityId,raw.whatsappPhone||raw.phone,raw.name);
    if(!client)return false;
    return writeClientRecord(client,birthDate,{seq:Number(event?.seq||0),updatedAt:Number(raw.birthDateUpdatedAt||0)||Date.parse(event?.created_at||event?.createdAt||'')||Date.now()});
  }

  async function syncBirthdays(){
    if(syncing||!navigator.onLine||!syncReady())return;
    syncing=true;let cursor=getCursor(),changed=false;
    try{
      for(let page=0;page<MAX_PAGES;page++){
        const data=await syncApi({action:'pull',afterSeq:cursor,limit:300,preferSnapshot:false});
        const events=Array.isArray(data.events)?data.events:[];
        for(const event of events){
          cursor=Math.max(cursor,Number(event?.seq||0));
          if(applyRemoteBirthdayEvent(event))changed=true;
        }
        setCursor(Math.max(cursor,Number(data.cursor||cursor)));
        if(!data.hasMore||!events.length)break;
      }
      if(changed){applyBirthdaysToClients(true);decorateRelationshipProfile();window.dispatchEvent(new CustomEvent('rota27:v02517-birthday-updated'));}
    }catch(err){console.warn('[Rota27 v0.25.17] Falha ao sincronizar aniversários:',err?.message||err);}
    finally{syncing=false;}
  }

  function queueBirthdayUpsert(client,birthDate){
    const normalized=normalizeBirthDate(birthDate);if(normalized===null||!client)return false;
    const current=bestRecordForClient(client);const currentDate=normalizeBirthDate(current?.birthDate||client.birthDate||'')||'';
    if(currentDate===normalized){applyBirthdaysToClients(true);return false;}
    const updatedAt=Date.now();
    writeClientRecord(client,normalized,{updatedAt,seq:Number(current?.seq||0)});
    if(normalized)client.birthDate=normalized;else delete client.birthDate;
    safeSaveState();
    const payload={...clone(client),birthDate:normalized,birthDateUpdatedAt:updatedAt};
    try{api()?.queueDomainEvent?.('client_upsert',client.id,{client:payload});}catch{}
    try{setTimeout(()=>api()?.syncDomainNow?.(),50);}catch{}
    setTimeout(syncBirthdays,900);
    window.dispatchEvent(new CustomEvent('rota27:v02517-birthday-updated',{detail:{clientId:client.id,birthDate:normalized}}));
    return true;
  }

  function ensureEditorField(){
    const editor=byId('v017ClientEditWrap');if(!editor||byId('v02517ClientBirthDate'))return false;
    const phoneInput=byId('v017ClientPhone');const anchor=phoneInput?.closest('.field');if(!anchor)return false;
    const field=document.createElement('div');field.className='field';field.id='v02517BirthField';
    field.innerHTML=`<label>Data de nascimento <small style="font-weight:500;opacity:.72">(opcional)</small></label><input id="v02517ClientBirthDate" type="date" autocomplete="bday" min="1900-01-01" max="${todayIso()}"><small style="display:block;margin-top:6px;opacity:.72">Usada apenas no cadastro e relacionamento com o cliente.</small>`;
    anchor.insertAdjacentElement('afterend',field);return true;
  }

  function loadEditorValue(){
    ensureEditorField();const input=byId('v02517ClientBirthDate');if(!input)return;
    const id=byId('v017ClientId')?.value||'',client=findClient(id,'','');
    const record=client?bestRecordForClient(client):null;
    input.max=todayIso();input.value=client?(normalizeBirthDate(record?.birthDate||client.birthDate||'')||''):'';
  }

  function handleSaveCapture(event){
    const button=event.target.closest?.('#v017ClientSave');if(!button)return;
    ensureEditorField();const input=byId('v02517ClientBirthDate');if(!input)return;
    const birthDate=normalizeBirthDate(input.value);
    if(birthDate===null){event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();toast('Informe uma data de nascimento válida.');return;}
    const pending={
      id:byId('v017ClientId')?.value?.trim()||'',
      name:byId('v017ClientName')?.value||'',
      rawPhone:byId('v017ClientPhone')?.value||'',
      birthDate
    };
    const apply=attempt=>{
      const client=findClient(pending.id,pending.rawPhone,pending.name);
      if(client){queueBirthdayUpsert(client,pending.birthDate);return;}
      if(attempt<5)setTimeout(()=>apply(attempt+1),90);
    };
    setTimeout(()=>apply(0),40);
  }

  function parseDelimited(text,delimiter){
    const rows=[];let row=[],field='',quoted=false;
    for(let i=0;i<text.length;i++){
      const ch=text[i];
      if(quoted){if(ch==='"'&&text[i+1]==='"'){field+='"';i++;}else if(ch==='"')quoted=false;else field+=ch;}
      else if(ch==='"')quoted=true;
      else if(ch===delimiter){row.push(field);field='';}
      else if(ch==='\n'){row.push(field.replace(/\r$/,''));rows.push(row);row=[];field='';}
      else field+=ch;
    }
    if(field.length||row.length){row.push(field.replace(/\r$/,''));rows.push(row);}return rows.filter(r=>r.some(v=>String(v).trim()));
  }

  function headerKind(v){
    const k=norm(v).replace(/[\s_-]+/g,'');
    if(['nome','name','cliente'].includes(k))return'name';
    if(['whatsapp','telefone','celular','phone','fone'].includes(k))return'phone';
    if(['datanascimento','nascimento','aniversario','birthdate','birthday'].includes(k))return'birthDate';
    return'';
  }

  function detectDelimiter(text){
    const first=String(text||'').replace(/^\uFEFF/,'').split(/\r?\n/).find(x=>x.trim())||'';
    const candidates=[';',',','\t'];let best=';',score=-1;
    candidates.forEach(d=>{const row=parseDelimited(first,d)[0]||[];const s=row.reduce((n,x)=>n+(headerKind(x)?10:0),0)+row.length;if(s>score){score=s;best=d;}});return best;
  }

  async function captureImportBirthdays(file){
    pendingImportBirthdays=[];if(!file)return;
    try{
      const text=String(await file.text()).replace(/^\uFEFF/,'');const delimiter=detectDelimiter(text),rows=parseDelimited(text,delimiter);if(!rows.length)return;
      const mapped=rows[0].map(headerKind),hasHeader=mapped.includes('name'),pos={};
      if(hasHeader)mapped.forEach((k,i)=>{if(k&&pos[k]===undefined)pos[k]=i;});
      if(!hasHeader||pos.birthDate===undefined)return;
      let invalid=0;
      for(let i=1;i<rows.length;i++){
        const row=rows[i],raw=clean(row[pos.birthDate]||'',40),birthDate=normalizeBirthDate(raw);
        if(raw&&birthDate===null){invalid++;continue;}
        if(!raw)continue;
        pendingImportBirthdays.push({name:clean(row[pos.name]||'',120),rawPhone:pos.phone===undefined?'':clean(row[pos.phone]||'',40),birthDate});
      }
      if(invalid)toast(`${invalid} data${invalid===1?'':'s'} de nascimento inválida${invalid===1?'':'s'} será${invalid===1?'':'ão'} ignorada${invalid===1?'':'s'}.`);
    }catch(err){console.warn('[Rota27 v0.25.17] Falha ao ler aniversários da importação:',err?.message||err);}
  }

  function applyPendingImportBirthdays(){
    if(!pendingImportBirthdays.length)return;
    const rows=pendingImportBirthdays.slice();pendingImportBirthdays=[];let changed=0;
    rows.forEach(r=>{const client=findClient('',r.rawPhone,r.name);if(client&&queueBirthdayUpsert(client,r.birthDate))changed++;});
    if(changed)toast(`${changed} data${changed===1?'':'s'} de nascimento importada${changed===1?'':'s'}.`);
  }

  function csvEscape(v){const s=String(v??'');return /[;"\r\n]/.test(s)?`"${s.replace(/"/g,'""')}"`:s;}
  function exportClientsWithBirthday(){
    const rows=clients().slice().sort((a,b)=>String(a?.name||'').localeCompare(String(b?.name||''),'pt-BR'));
    const lines=['nome;whatsapp;data_nascimento;observacao'];
    rows.forEach(c=>{const record=bestRecordForClient(c),birthDate=normalizeBirthDate(record?.birthDate||c.birthDate||'')||'';lines.push([c.name,c.whatsappPhone?api()?.formatPhone?.(c.whatsappPhone)||c.whatsappPhone:'',birthDate,c.notes||''].map(csvEscape).join(';'));});
    const blob=new Blob(['\uFEFF'+lines.join('\r\n')],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download=`rota27-clientes-${new Date().toISOString().slice(0,10)}.csv`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
    toast('CSV de clientes exportado com data de nascimento.');
  }

  function decorateRelationshipProfile(){
    const wrap=byId('v025RelationshipWrap');if(!wrap?.classList.contains('open')||!activeProfileId)return;
    const client=findClient(activeProfileId,'','');if(!client)return;
    const hero=wrap.querySelector('.v025-profile-hero .v025-profile-copy');if(!hero)return;
    let line=byId('v02517ProfileBirthday');if(!line){line=document.createElement('p');line.id='v02517ProfileBirthday';line.style.margin='6px 0 0';line.style.fontWeight='650';line.style.color='#756656';const phoneLine=hero.querySelector('p');if(phoneLine)phoneLine.insertAdjacentElement('afterend',line);else hero.appendChild(line);}
    const record=bestRecordForClient(client),birthDate=normalizeBirthDate(record?.birthDate||client.birthDate||'')||'';
    line.textContent=birthDate?`🎂 Nascimento: ${formatBirthDate(birthDate)}`:'🎂 Nascimento não informado';
  }

  function updateHelp(){
    const section=byId('r27-help-clientes')||byId('r27-help-fidelizacao');if(!section||byId('v02517HelpBirthday'))return;
    const body=section.querySelector('.r27-help-section-body');if(!body)return;
    const box=document.createElement('div');box.id='v02517HelpBirthday';box.className='r27-help-tip';box.innerHTML='<strong>Data de nascimento:</strong> é opcional e pode ser cadastrada ou alterada em <b>Clientes</b>. O campo é sincronizado entre os aparelhos e também aparece no perfil de relacionamento.';
    body.appendChild(box);
  }

  function onDocumentClick(event){
    const target=event.target;
    if(target.closest?.('#v017ClientSave')){handleSaveCapture(event);return;}
    if(target.closest?.('#v017ExportClients')){event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();exportClientsWithBirthday();return;}
    if(target.closest?.('#v017NewClient,.v017-client-row,[data-edit]'))setTimeout(loadEditorValue,100);
    const profile=target.closest?.('[data-profile]');if(profile){activeProfileId=profile.dataset.profile||'';setTimeout(decorateRelationshipProfile,30);}
    if(target.closest?.('[data-back]'))activeProfileId='';
    if(target.closest?.('#r27HelpBtn,[data-help]'))setTimeout(updateHelp,120);
    if(target.closest?.('#v017ApplyImport'))setTimeout(applyPendingImportBirthdays,120);
  }

  function bindImportCapture(){
    const input=byId('v017ClientFile');if(!input||input.dataset.v02517BirthdayBound==='1')return;
    input.dataset.v02517BirthdayBound='1';input.addEventListener('change',e=>captureImportBirthdays(e.target.files?.[0]));
  }

  function start(){
    ensureEditorField();bindImportCapture();applyBirthdaysToClients(true);updateHelp();
    document.addEventListener('click',onDocumentClick,true);
    window.addEventListener('online',()=>setTimeout(syncBirthdays,250));
    window.addEventListener('rota27:v017-domain-updated',()=>{applyBirthdaysToClients(true);setTimeout(syncBirthdays,150);setTimeout(()=>{ensureEditorField();bindImportCapture();decorateRelationshipProfile();},30);});
    window.addEventListener('rota27:v02517-birthday-updated',()=>{applyBirthdaysToClients(true);decorateRelationshipProfile();});
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){ensureEditorField();bindImportCapture();applyBirthdaysToClients(true);updateHelp();decorateRelationshipProfile();setTimeout(syncBirthdays,300);}});
    clearInterval(intervalId);intervalId=setInterval(()=>{if(document.visibilityState==='visible'&&navigator.onLine)syncBirthdays();},60000);
    if(navigator.onLine)setTimeout(syncBirthdays,900);
    window.Rota27V02517Birthday={version:VERSION,normalizeBirthDate,formatBirthDate,sync:syncBirthdays,getBirthDate(clientId){const client=findClient(clientId,'','');return client?(normalizeBirthDate(bestRecordForClient(client)?.birthDate||client.birthDate||'')||''):'';}};
    console.info('[Rota27] v0.25.17 — data de nascimento de clientes carregada.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
