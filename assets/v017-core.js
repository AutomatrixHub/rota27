/* Rota 27 v0.17.0 — clientes, sincronização de domínio e leitura das comandas */
(function(){
  'use strict';

  const VERSION='0.17.0';
  const DOMAIN_OUTBOX_KEY='rota27_v017_domain_outbox_v1';
  const DOMAIN_CURSOR_KEY='rota27_v017_domain_cursor_v1';
  const MAX_DOMAIN_OUTBOX=3000;
  const MAX_IMPORT_BYTES=2*1024*1024;
  const MAX_IMPORT_ROWS=3000;
  const DOMAIN_TYPES=new Set(['client_upsert','client_delete','manager_config_replace']);

  let domainTimer=null;
  let domainInterval=null;
  let domainSyncing=false;
  let clientSearch='';
  let pendingImport=null;
  let originalCreateCommand=null;
  let originalSaveCommandEdits=null;
  let originalRenderCommands=null;
  let originalRenderMenu=null;

  function byId(id){return document.getElementById(id);}
  function clone(v){return JSON.parse(JSON.stringify(v==null?null:v));}
  function clean(v,max=240){return String(v??'').replace(/[\u0000-\u001F\u007F]/g,' ').trim().replace(/\s+/g,' ').slice(0,max);}
  function norm(v){return clean(v,500).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');}
  function esc(v){
    if(typeof escapeHtml==='function')return escapeHtml(String(v??''));
    return String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }
  function now(){return Date.now();}
  function uid(prefix='id'){
    if(globalThis.crypto?.randomUUID)return `${prefix}_${crypto.randomUUID()}`;
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,10)}`;
  }
  function moneyValue(v){
    try{return typeof money==='function'?money(Number(v||0)):Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}catch{return 'R$ 0,00';}
  }
  function normalizePhone(v){
    try{if(typeof normalizeWhatsappPhone==='function')return normalizeWhatsappPhone(v);}catch{}
    let d=String(v||'').replace(/\D/g,'').replace(/^0+/,'');
    if(d.length===10||d.length===11)d='55'+d;
    return d;
  }
  function validPhone(v){
    try{if(typeof isValidWhatsappPhone==='function')return isValidWhatsappPhone(v);}catch{}
    const d=normalizePhone(v);return d.length>=12&&d.length<=15;
  }
  function formatPhone(v){
    try{if(typeof formatWhatsappPhone==='function')return formatWhatsappPhone(v);}catch{}
    const d=normalizePhone(v);return d?`+${d}`:'';
  }
  function safeSave(){try{if(typeof save==='function')save();}catch{}}
  function toast(msg){try{if(typeof showToast==='function')showToast(msg,false);}catch{}}

  function sanitizeClient(raw){
    if(!raw||typeof raw!=='object')return null;
    const name=clean(raw.name||raw.nome,120);
    const phone=normalizePhone(raw.whatsappPhone||raw.whatsapp||raw.phone||'');
    if(!name)return null;
    if(phone&&!validPhone(phone))return null;
    return {
      id:clean(raw.id,140)||uid('cli'),
      name,
      whatsappPhone:phone,
      notes:clean(raw.notes||raw.observacao||raw.obs,500),
      firstSeenAt:Math.max(0,Number(raw.firstSeenAt||raw.createdAt||now())),
      lastSeenAt:Math.max(0,Number(raw.lastSeenAt||raw.updatedAt||now())),
      source:clean(raw.source||'manual',40)||'manual'
    };
  }

  function sanitizeManager(raw){
    const r=raw&&typeof raw==='object'?raw:{};
    const phone=normalizePhone(r.phone||r.whatsappPhone||'');
    return {
      name:clean(r.name||'Gerente',120)||'Gerente',
      phone:phone&&validPhone(phone)?phone:'',
      enabled:r.enabled===true && !!phone && validPhone(phone),
      updatedAt:Math.max(0,Number(r.updatedAt||0))
    };
  }

  function ensureState(){
    if(typeof state==='undefined'||!state)return;
    const clients=Array.isArray(state.clients)?state.clients:[];
    const seen=new Map();
    clients.map(sanitizeClient).filter(Boolean).forEach(c=>{
      const key=c.whatsappPhone?`p:${c.whatsappPhone}`:`n:${norm(c.name)}`;
      const old=seen.get(key);
      if(!old)seen.set(key,c);
      else seen.set(key,{...old,...c,id:old.id,firstSeenAt:Math.min(old.firstSeenAt,c.firstSeenAt),lastSeenAt:Math.max(old.lastSeenAt,c.lastSeenAt)});
    });
    state.clients=[...seen.values()];
    state.managerWhatsapp=sanitizeManager(state.managerWhatsapp);
    safeSave();
  }

  function clients(){return Array.isArray(state?.clients)?state.clients:[];}
  function findClientByPhone(phone){const p=normalizePhone(phone);return p?clients().find(c=>normalizePhone(c.whatsappPhone)===p):null;}
  function findClientByName(name){const n=norm(name);return n?clients().find(c=>norm(c.name)===n):null;}
  function findClient(id){return clients().find(c=>String(c.id)===String(id));}

  function clientStats(client){
    const phone=normalizePhone(client?.whatsappPhone||'');
    const name=norm(client?.name||'');
    const match=c=>{
      if(phone&&normalizePhone(c?.whatsappPhone||'')===phone)return true;
      return !phone&&name&&norm(c?.customer||'')===name;
    };
    const history=(state?.history||[]).filter(match);
    const open=(state?.commands||[]).filter(c=>c?.cancelled!==true&&match(c));
    let total=0;
    history.forEach(c=>{try{total+=Number(c.total??(typeof commandTotal==='function'?commandTotal(c):0))||0;}catch{}});
    const latest=[...history,...open].reduce((m,c)=>Math.max(m,Number(c.closedAt||c.updatedAt||c.createdAt||0)),Number(client?.lastSeenAt||0));
    return {closed:history.length,open:open.length,total,latest};
  }

  function readSyncConfig(){
    try{return JSON.parse(localStorage.getItem('rota27_sync_config_v1')||'{}')||{};}catch{return {};}
  }
  function domainReady(){
    const cfg=readSyncConfig();
    return cfg.enabled===true&&cfg.initialized===true&&/^https:\/\/.+\/functions\/v1\/rota27-sync\/?$/i.test(String(cfg.functionUrl||''))&&String(cfg.deviceToken||'').length>=16&&!!cfg.deviceId;
  }
  function readDomainOutbox(){try{const v=JSON.parse(localStorage.getItem(DOMAIN_OUTBOX_KEY)||'[]');return Array.isArray(v)?v:[];}catch{return [];}}
  function writeDomainOutbox(rows){localStorage.setItem(DOMAIN_OUTBOX_KEY,JSON.stringify((Array.isArray(rows)?rows:[]).slice(-MAX_DOMAIN_OUTBOX)));updateAdminCards();}
  function getDomainCursor(){return Math.max(0,Number(localStorage.getItem(DOMAIN_CURSOR_KEY)||0));}
  function setDomainCursor(v){localStorage.setItem(DOMAIN_CURSOR_KEY,String(Math.max(0,Number(v||0))));}

  function queueDomainEvent(type,entityId,payload){
    if(!DOMAIN_TYPES.has(type)||!domainReady())return;
    const cfg=readSyncConfig();
    const rows=readDomainOutbox();
    rows.push({
      eventId:uid('v017'),eventType:type,entityId:String(entityId||''),payload:clone(payload||{}),
      deviceId:cfg.deviceId,createdAt:new Date().toISOString(),appVersion:VERSION
    });
    writeDomainOutbox(rows);
    scheduleDomainSync();
  }

  async function syncApi(body){
    const cfg=readSyncConfig();
    if(!domainReady())throw new Error('Sincronização principal não está pronta neste aparelho.');
    const ctrl=new AbortController();const timeout=setTimeout(()=>ctrl.abort(),12000);
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

  async function pushDomainOutbox(){
    let rows=readDomainOutbox();
    while(rows.length){
      const batch=rows.slice(0,100);
      await syncApi({action:'push',events:batch});
      const sent=new Set(batch.map(x=>x.eventId));
      rows=readDomainOutbox().filter(x=>!sent.has(x.eventId));
      writeDomainOutbox(rows);
    }
  }

  function applyRemoteClient(raw){
    const incoming=sanitizeClient(raw);if(!incoming)return false;
    const idx=clients().findIndex(c=>String(c.id)===String(incoming.id)|| (incoming.whatsappPhone&&normalizePhone(c.whatsappPhone)===incoming.whatsappPhone));
    if(idx>=0){
      const old=state.clients[idx];
      const next={...old,...incoming,id:old.id,firstSeenAt:Math.min(Number(old.firstSeenAt||incoming.firstSeenAt),incoming.firstSeenAt),lastSeenAt:Math.max(Number(old.lastSeenAt||0),incoming.lastSeenAt)};
      if(JSON.stringify(old)===JSON.stringify(next))return false;
      state.clients[idx]=next;return true;
    }
    state.clients.push(incoming);return true;
  }

  function applyDomainEvent(event){
    const type=String(event?.event_type||event?.eventType||'');
    const id=String(event?.entity_id||event?.entityId||'');
    const payload=event?.payload&&typeof event.payload==='object'?event.payload:{};
    if(type==='client_upsert')return applyRemoteClient(payload.client);
    if(type==='client_delete'){
      const before=clients().length;state.clients=clients().filter(c=>String(c.id)!==id);return state.clients.length!==before;
    }
    if(type==='manager_config_replace'){
      const next=sanitizeManager(payload.config);const before=JSON.stringify(state.managerWhatsapp||{});
      state.managerWhatsapp=next;return JSON.stringify(next)!==before;
    }
    return false;
  }

  async function pullDomainEvents(){
    let cursor=getDomainCursor(),changed=false;
    const cfg=readSyncConfig();
    for(let page=0;page<30;page++){
      const data=await syncApi({action:'pull',afterSeq:cursor,limit:300,preferSnapshot:false});
      const events=Array.isArray(data.events)?data.events:[];
      for(const event of events){
        cursor=Math.max(cursor,Number(event.seq||0));
        if(String(event.device_id||'')===String(cfg.deviceId||''))continue;
        if(applyDomainEvent(event))changed=true;
      }
      setDomainCursor(Math.max(cursor,Number(data.cursor||cursor)));
      if(!data.hasMore||!events.length)break;
    }
    if(changed){safeSave();refreshClientDatalist();renderClients();updateAdminCards();window.dispatchEvent(new CustomEvent('rota27:v017-domain-updated'));}
  }

  async function syncDomainNow(){
    if(domainSyncing||!domainReady()||!navigator.onLine)return;
    domainSyncing=true;updateAdminCards();
    try{await pushDomainOutbox();await pullDomainEvents();window.ROTA27_V017_DOMAIN_ERROR='';}
    catch(err){window.ROTA27_V017_DOMAIN_ERROR=clean(err?.message||'Falha na sincronização de clientes.',300);}
    finally{domainSyncing=false;updateAdminCards();}
  }
  function scheduleDomainSync(delay=900){clearTimeout(domainTimer);domainTimer=setTimeout(syncDomainNow,delay);}

  function upsertClient(data,options={}){
    const row=sanitizeClient(data);if(!row)return {client:null,changed:false};
    const phone=row.whatsappPhone;
    const idx=clients().findIndex(c=>phone?normalizePhone(c.whatsappPhone)===phone:(!c.whatsappPhone&&norm(c.name)===norm(row.name)));
    let result,changed=false;
    if(idx>=0){
      const old=state.clients[idx];
      result={...old,...row,id:old.id,firstSeenAt:Math.min(Number(old.firstSeenAt||row.firstSeenAt),row.firstSeenAt),lastSeenAt:Math.max(Number(old.lastSeenAt||0),row.lastSeenAt)};
      changed=JSON.stringify(old)!==JSON.stringify(result);state.clients[idx]=result;
    }else{result=row;state.clients.push(result);changed=true;}
    if(changed&&!options.silent){safeSave();if(options.sync!==false)queueDomainEvent('client_upsert',result.id,{client:result});refreshClientDatalist();renderClients();updateAdminCards();}
    return {client:result,changed};
  }

  function captureClientFromCommand(c){
    if(!c?.customer||!c?.whatsappPhone||!validPhone(c.whatsappPhone))return;
    upsertClient({name:c.customer,whatsappPhone:c.whatsappPhone,notes:'',firstSeenAt:Number(c.createdAt||now()),lastSeenAt:now(),source:'comanda'});
  }

  function migrateClientsFromCommands(){
    const rows=[...(state?.history||[]),...(state?.commands||[])].filter(c=>c?.customer&&c?.whatsappPhone&&validPhone(c.whatsappPhone));
    const changed=[];
    rows.sort((a,b)=>Number(a.createdAt||0)-Number(b.createdAt||0)).forEach(c=>{
      const seenAt=Number(c.closedAt||c.updatedAt||c.createdAt||now());
      const res=upsertClient({name:c.customer,whatsappPhone:c.whatsappPhone,notes:'',firstSeenAt:Number(c.createdAt||seenAt),lastSeenAt:seenAt,source:'comanda'}, {silent:true});
      if(res.changed&&res.client&&!changed.some(x=>x.id===res.client.id))changed.push(res.client);
    });
    if(changed.length){safeSave();changed.forEach(c=>queueDomainEvent('client_upsert',c.id,{client:clone(c)}));}
  }

  function deleteClient(id){
    const c=findClient(id);if(!c)return;
    if(!window.confirm(`Excluir “${c.name}” do cadastro de clientes?\n\nAs vendas e comandas existentes não serão apagadas.`))return;
    state.clients=clients().filter(x=>String(x.id)!==String(id));safeSave();queueDomainEvent('client_delete',id,{});renderClients();refreshClientDatalist();updateAdminCards();toast('Cliente removido do cadastro.');
  }

  function refreshClientDatalist(){
    let dl=byId('v017ClientSuggestions');
    if(!dl){dl=document.createElement('datalist');dl.id='v017ClientSuggestions';document.body.appendChild(dl);}
    dl.innerHTML=clients().slice().sort((a,b)=>a.name.localeCompare(b.name,'pt-BR')).map(c=>`<option value="${esc(c.name)}">${esc(c.whatsappPhone?formatPhone(c.whatsappPhone):'Sem WhatsApp')}</option>`).join('');
    ['newCustomer','editCustomer'].forEach(id=>{const el=byId(id);if(el)el.setAttribute('list','v017ClientSuggestions');});
  }

  function bindAutocomplete(){
    refreshClientDatalist();
    const bind=(nameId,phoneId)=>{
      const name=byId(nameId),phone=byId(phoneId);if(!name||!phone||name.dataset.v017Bound==='1')return;
      name.dataset.v017Bound='1';
      const fromName=()=>{const c=findClientByName(name.value);if(c?.whatsappPhone&&!phone.value.trim())phone.value=formatPhone(c.whatsappPhone);};
      const fromPhone=()=>{const c=findClientByPhone(phone.value);if(c&&!name.value.trim())name.value=c.name;};
      name.addEventListener('change',fromName);name.addEventListener('blur',fromName);phone.addEventListener('change',fromPhone);phone.addEventListener('blur',fromPhone);
    };
    bind('newCustomer','newWhatsapp');bind('editCustomer','editWhatsapp');
  }

  function patchCommandPersistence(){
    if(!originalCreateCommand&&typeof createCommand==='function'){
      originalCreateCommand=createCommand;
      const patched=function(){const r=originalCreateCommand.apply(this,arguments);setTimeout(()=>{try{captureClientFromCommand(typeof currentCommand==='function'?currentCommand():null);}catch{}},0);return r;};
      try{createCommand=patched;}catch{} try{window.createCommand=patched;}catch{}
    }
    if(!originalSaveCommandEdits&&typeof saveCommandEdits==='function'){
      originalSaveCommandEdits=saveCommandEdits;
      const patched=function(){const c=typeof currentCommand==='function'?currentCommand():null;const r=originalSaveCommandEdits.apply(this,arguments);setTimeout(()=>captureClientFromCommand(c),0);return r;};
      try{saveCommandEdits=patched;}catch{} try{window.saveCommandEdits=patched;}catch{}
    }
  }

  function renderCommandCardsV017(){
    if(typeof state==='undefined')return;
    const rows=[...(state.commands||[])].filter(c=>c?.cancelled!==true).sort((a,b)=>Number(b.updatedAt||0)-Number(a.updatedAt||0));
    const openCount=byId('openCount'),openTotal=byId('openTotal'),openItems=byId('openItems'),empty=byId('commandsEmpty'),list=byId('commandList');
    if(!list)return;
    if(openCount)openCount.textContent=rows.length;
    if(openTotal)openTotal.textContent=moneyValue(rows.reduce((s,c)=>s+Number(typeof commandTotal==='function'?commandTotal(c):0),0));
    if(openItems)openItems.textContent=rows.reduce((s,c)=>s+Number(typeof commandItems==='function'?commandItems(c):0),0);
    if(empty)empty.style.display=rows.length?'none':'block';
    list.innerHTML='';
    rows.forEach(c=>{
      const customer=clean(c.customer,120),location=clean(c.table,120);
      const primary=customer||location||'Comanda';
      const itemCount=Number(typeof commandItems==='function'?commandItems(c):0);
      const el=document.createElement('article');el.className='command-card v017-command-card';
      el.innerHTML=`<div class="v017-command-primary"><h3 class="command-title">${esc(primary)}</h3></div><div class="v017-command-info"><div class="v017-command-copy">${customer&&location?`<div class="v017-command-location">${esc(location)}</div>`:''}<div class="command-sub">${itemCount} ${itemCount===1?'item':'itens'} • aberta há ${esc(typeof elapsed==='function'?elapsed(c.createdAt):'')}</div></div><div class="money">${esc(moneyValue(typeof commandTotal==='function'?commandTotal(c):0))}</div></div><div class="command-bottom"><span class="meta">Último lançamento: ${esc(typeof elapsed==='function'?elapsed(c.updatedAt):'')}</span><button class="open-btn" type="button">Abrir →</button></div>`;
      el.addEventListener('click',()=>{try{openCommand(c.id);}catch{}});list.appendChild(el);
    });
  }

  function patchRenderCommands(){
    if(originalRenderCommands||typeof renderCommands!=='function')return;
    originalRenderCommands=renderCommands;
    const patched=function(){return renderCommandCardsV017();};
    try{renderCommands=patched;}catch{} try{window.renderCommands=patched;}catch{}
    renderCommandCardsV017();
  }

  function ensureAdminCards(){
    const screen=byId('screenMenu');if(!screen)return;
    let tools=byId('v017AdminTools');
    if(!tools){
      tools=document.createElement('div');tools.id='v017AdminTools';tools.className='v017-admin-tools';
      tools.innerHTML='<button type="button" id="v017ClientsBtn"><span>👥</span><div><strong>Clientes</strong><small id="v017ClientsSummary"></small></div><b>›</b></button><button type="button" id="v017ManagerBtn"><span>💬</span><div><strong>WhatsApp do gerente</strong><small id="v017ManagerSummary"></small></div><b>›</b></button>';
      const head=screen.querySelector('.section-head');if(head)head.insertAdjacentElement('afterend',tools);else screen.insertAdjacentElement('afterbegin',tools);
      byId('v017ClientsBtn')?.addEventListener('click',openClients);
      byId('v017ManagerBtn')?.addEventListener('click',()=>window.dispatchEvent(new CustomEvent('rota27:v017-open-manager')));
    }
    updateAdminCards();
  }

  function updateAdminCards(){
    const cs=byId('v017ClientsSummary');if(cs)cs.textContent=`${clients().length} cadastrado${clients().length===1?'':'s'}`;
    const ms=byId('v017ManagerSummary');if(ms){const m=sanitizeManager(state?.managerWhatsapp);ms.textContent=m.enabled?`${m.name} • ativo`:'Desativado';}
    const btn=byId('v017ClientsBtn');if(btn)btn.dataset.pending=String(readDomainOutbox().length);
  }

  function patchRenderMenu(){
    if(originalRenderMenu||typeof renderMenu!=='function')return;
    originalRenderMenu=renderMenu;
    const patched=function(){const r=originalRenderMenu.apply(this,arguments);ensureAdminCards();return r;};
    try{renderMenu=patched;}catch{} try{window.renderMenu=patched;}catch{}
    ensureAdminCards();
  }

  function ensureClientsUi(){
    if(byId('v017ClientsWrap'))return;
    const wrap=document.createElement('div');wrap.id='v017ClientsWrap';wrap.className='sheet-wrap';
    wrap.innerHTML=`<div class="sheet v017-sheet"><div class="handle"></div><div class="v017-sheet-head"><div><h3>Clientes</h3><p class="desc">Cadastro compartilhado para agilizar novas comandas.</p></div><button type="button" class="v017-icon-btn" id="v017ClientsClose" aria-label="Fechar">×</button></div><div class="v017-client-toolbar"><label class="v017-search"><span>⌕</span><input id="v017ClientSearch" type="search" placeholder="Nome ou WhatsApp"></label><button type="button" class="primary" id="v017NewClient">+ Cliente</button></div><div class="v017-client-actions"><button type="button" class="secondary" id="v017ImportClients">Importar TXT/CSV</button><button type="button" class="secondary" id="v017ExportClients">Exportar CSV</button><input id="v017ClientFile" type="file" accept=".csv,.txt,text/csv,text/plain" hidden></div><div id="v017ImportPreview" class="v017-import-preview" hidden></div><div class="v017-client-summary" id="v017ClientCount"></div><div id="v017ClientList" class="v017-client-list"></div></div>`;
    document.body.appendChild(wrap);
    wrap.addEventListener('click',e=>{if(e.target===wrap)wrap.classList.remove('open');});
    byId('v017ClientsClose').addEventListener('click',()=>wrap.classList.remove('open'));
    byId('v017ClientSearch').addEventListener('input',e=>{clientSearch=e.target.value||'';renderClients();});
    byId('v017NewClient').addEventListener('click',()=>openClientEditor());
    byId('v017ImportClients').addEventListener('click',()=>byId('v017ClientFile').click());
    byId('v017ExportClients').addEventListener('click',exportClients);
    byId('v017ClientFile').addEventListener('change',handleClientFile);

    const editor=document.createElement('div');editor.id='v017ClientEditWrap';editor.className='sheet-wrap';
    editor.innerHTML=`<div class="sheet v017-sheet v017-editor"><div class="handle"></div><h3 id="v017ClientEditTitle">Novo cliente</h3><p class="desc">O consentimento para mensagens continua sendo definido em cada comanda.</p><input type="hidden" id="v017ClientId"><div class="field"><label>Nome</label><input id="v017ClientName" maxlength="120" autocomplete="off"></div><div class="field"><label>WhatsApp</label><input id="v017ClientPhone" inputmode="tel" maxlength="30" placeholder="(27) 99999-9999"></div><div class="field"><label>Observação</label><input id="v017ClientNotes" maxlength="500" placeholder="Ex.: prefere mesa externa"></div><button type="button" class="v017-delete-client" id="v017DeleteClient">Excluir cliente</button><div class="sheet-actions"><button type="button" class="secondary" id="v017ClientCancel">Voltar</button><button type="button" class="primary" id="v017ClientSave">Salvar cliente</button></div></div>`;
    document.body.appendChild(editor);
    editor.addEventListener('click',e=>{if(e.target===editor)editor.classList.remove('open');});
    byId('v017ClientCancel').addEventListener('click',()=>editor.classList.remove('open'));
    byId('v017ClientSave').addEventListener('click',saveClientEditor);
    byId('v017DeleteClient').addEventListener('click',()=>{const id=byId('v017ClientId').value;if(id){editor.classList.remove('open');deleteClient(id);}});
  }

  function openClients(){ensureClientsUi();pendingImport=null;byId('v017ImportPreview').hidden=true;byId('v017ClientFile').value='';clientSearch='';byId('v017ClientSearch').value='';renderClients();byId('v017ClientsWrap').classList.add('open');}

  function renderClients(){
    const list=byId('v017ClientList');if(!list)return;
    const q=norm(clientSearch);
    const rows=clients().filter(c=>!q||norm(c.name).includes(q)||normalizePhone(c.whatsappPhone).includes(q.replace(/\D/g,''))).sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));
    const count=byId('v017ClientCount');if(count)count.textContent=`${rows.length} de ${clients().length} cliente${clients().length===1?'':'s'}`;
    if(!rows.length){list.innerHTML='<div class="v017-empty">Nenhum cliente encontrado.</div>';return;}
    list.innerHTML='';
    rows.forEach(c=>{
      const st=clientStats(c),row=document.createElement('button');row.type='button';row.className='v017-client-row';
      row.innerHTML=`<div class="v017-client-avatar">${esc((c.name||'?').slice(0,1).toLocaleUpperCase('pt-BR'))}</div><div class="v017-client-copy"><strong>${esc(c.name)}</strong><small>${esc(c.whatsappPhone?formatPhone(c.whatsappPhone):'Sem WhatsApp')}</small><span>${st.closed} compra${st.closed===1?'':'s'} • ${esc(moneyValue(st.total))}</span></div><b>›</b>`;
      row.addEventListener('click',()=>openClientEditor(c.id));list.appendChild(row);
    });
  }

  function openClientEditor(id=''){
    ensureClientsUi();const c=id?findClient(id):null;
    byId('v017ClientEditTitle').textContent=c?'Editar cliente':'Novo cliente';byId('v017ClientId').value=c?.id||'';byId('v017ClientName').value=c?.name||'';byId('v017ClientPhone').value=c?.whatsappPhone?formatPhone(c.whatsappPhone):'';byId('v017ClientNotes').value=c?.notes||'';byId('v017DeleteClient').style.display=c?'block':'none';byId('v017ClientEditWrap').classList.add('open');
  }

  function saveClientEditor(){
    const id=byId('v017ClientId').value.trim(),name=clean(byId('v017ClientName').value,120),rawPhone=byId('v017ClientPhone').value.trim(),notes=clean(byId('v017ClientNotes').value,500);
    if(!name){toast('Informe o nome do cliente.');return;}
    if(rawPhone&&!validPhone(rawPhone)){toast('Informe um WhatsApp válido ou deixe em branco.');return;}
    const old=id?findClient(id):null;
    const duplicate=rawPhone?findClientByPhone(rawPhone):null;
    if(duplicate&&String(duplicate.id)!==String(id)){toast('Já existe um cliente com este WhatsApp.');return;}
    if(old){Object.assign(old,{name,whatsappPhone:rawPhone?normalizePhone(rawPhone):'',notes,lastSeenAt:now(),source:'manual'});safeSave();queueDomainEvent('client_upsert',old.id,{client:clone(old)});}
    else upsertClient({name,whatsappPhone:rawPhone,notes,firstSeenAt:now(),lastSeenAt:now(),source:'manual'});
    byId('v017ClientEditWrap').classList.remove('open');renderClients();refreshClientDatalist();updateAdminCards();toast('Cliente salvo.');
  }

  function parseDelimited(text,delimiter){
    const rows=[];let row=[],field='',quoted=false;
    for(let i=0;i<text.length;i++){
      const ch=text[i];
      if(quoted){if(ch==='"'&&text[i+1]==='"'){field+='"';i++;}else if(ch==='"')quoted=false;else field+=ch;}
      else{if(ch==='"')quoted=true;else if(ch===delimiter){row.push(field);field='';}else if(ch==='\n'){row.push(field.replace(/\r$/,''));rows.push(row);row=[];field='';}else field+=ch;}
      if(rows.length>MAX_IMPORT_ROWS+1)throw new Error(`Limite de ${MAX_IMPORT_ROWS} clientes por importação.`);
    }
    if(field.length||row.length){row.push(field.replace(/\r$/,''));rows.push(row);}return rows.filter(r=>r.some(v=>String(v).trim()));
  }
  function headerKey(v){const n=norm(v).replace(/\s+/g,'');if(['nome','name','cliente'].includes(n))return'name';if(['whatsapp','telefone','celular','phone','fone'].includes(n))return'phone';if(['observacao','observacoes','obs','notes','nota'].includes(n))return'notes';return'';}
  function detectDelimiter(text){const first=String(text||'').replace(/^\uFEFF/,'').split(/\r?\n/).find(x=>x.trim())||'';const candidates=[';',',','\t'];let best=';',score=-1;candidates.forEach(d=>{const row=parseDelimited(first,d)[0]||[];const s=row.reduce((n,x)=>n+(headerKey(x)?10:0),0)+row.length;if(s>score){score=s;best=d;}});return best;}
  function parseClientImport(text){
    const cleanText=String(text||'').replace(/^\uFEFF/,'');const delimiter=detectDelimiter(cleanText),rows=parseDelimited(cleanText,delimiter);if(!rows.length)return {valid:[],rejected:[{line:1,reason:'Arquivo vazio'}]};
    const mapped=rows[0].map(headerKey),hasHeader=mapped.includes('name');const pos={};if(hasHeader)mapped.forEach((k,i)=>{if(k&&pos[k]===undefined)pos[k]=i;});else Object.assign(pos,{name:0,phone:1,notes:2});
    if(pos.name===undefined)return {valid:[],rejected:[{line:1,reason:'Cabeçalho precisa conter nome/cliente'}]};
    const valid=[],rejected=[];for(let i=hasHeader?1:0;i<rows.length;i++){
      const r=rows[i],line=i+1,name=clean(r[pos.name]||'',120),rawPhone=clean(r[pos.phone]||'',40),notes=clean(r[pos.notes]||'',500);
      if(!name){rejected.push({line,reason:'Nome vazio'});continue;}if(rawPhone&&!validPhone(rawPhone)){rejected.push({line,reason:'WhatsApp inválido'});continue;}
      valid.push({name,whatsappPhone:rawPhone?normalizePhone(rawPhone):'',notes,line});
    }return {valid,rejected};
  }

  async function handleClientFile(e){
    const file=e.target.files?.[0];pendingImport=null;if(!file)return;
    if(file.size>MAX_IMPORT_BYTES){toast('Arquivo acima do limite de 2 MB.');e.target.value='';return;}
    if(!/\.(csv|txt)$/i.test(file.name||'')){toast('Use um arquivo CSV ou TXT.');e.target.value='';return;}
    try{pendingImport=parseClientImport(await file.text());renderImportPreview();}catch(err){toast(err?.message||'Não foi possível ler o arquivo.');}
  }

  function renderImportPreview(){
    const el=byId('v017ImportPreview');if(!el||!pendingImport){if(el)el.hidden=true;return;}
    let created=0,updated=0;pendingImport.valid.forEach(r=>{const exists=r.whatsappPhone?findClientByPhone(r.whatsappPhone):findClientByName(r.name);exists?updated++:created++;});
    el.hidden=false;el.innerHTML=`<div><strong>Prévia da importação</strong><small>${pendingImport.valid.length} válida${pendingImport.valid.length===1?'':'s'} • ${created} nova${created===1?'':'s'} • ${updated} atualização${updated===1?'':'ões'} • ${pendingImport.rejected.length} rejeitada${pendingImport.rejected.length===1?'':'s'}</small></div><button type="button" class="primary" id="v017ApplyImport" ${pendingImport.valid.length?'':'disabled'}>Aplicar</button>`;
    byId('v017ApplyImport')?.addEventListener('click',applyClientImport);
  }

  function applyClientImport(){
    if(!pendingImport?.valid?.length)return;
    if(!window.confirm(`Importar ${pendingImport.valid.length} clientes válidos?\n\nRegistros com o mesmo WhatsApp serão atualizados.`))return;
    const changed=[];pendingImport.valid.forEach(r=>{const res=upsertClient({...r,firstSeenAt:now(),lastSeenAt:now(),source:'import'}, {silent:true});if(res.changed&&res.client)changed.push(res.client);});safeSave();changed.forEach(c=>queueDomainEvent('client_upsert',c.id,{client:clone(c)}));pendingImport=null;byId('v017ClientFile').value='';byId('v017ImportPreview').hidden=true;renderClients();refreshClientDatalist();updateAdminCards();toast(`${changed.length} cliente${changed.length===1?'':'s'} incluído${changed.length===1?'':'s'}/atualizado${changed.length===1?'':'s'}.`);
  }

  function csvEscape(v){const s=String(v??'');return /[;"\r\n]/.test(s)?`"${s.replace(/"/g,'""')}"`:s;}
  function exportClients(){
    const lines=['nome;whatsapp;observacao'];clients().slice().sort((a,b)=>a.name.localeCompare(b.name,'pt-BR')).forEach(c=>lines.push([c.name,c.whatsappPhone?formatPhone(c.whatsappPhone):'',c.notes||''].map(csvEscape).join(';')));
    const blob=new Blob(['\uFEFF'+lines.join('\r\n')],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`rota27-clientes-${new Date().toISOString().slice(0,10)}.csv`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }

  function startDomainSchedulers(){
    window.addEventListener('online',()=>scheduleDomainSync(250));
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')scheduleDomainSync(450);});
    clearInterval(domainInterval);domainInterval=setInterval(()=>{if(domainReady()&&navigator.onLine)syncDomainNow();},15000);
    if(domainReady()&&navigator.onLine)setTimeout(syncDomainNow,1800);
  }

  function expose(){
    window.Rota27V017={VERSION,normalizePhone,validPhone,formatPhone,clean,norm,esc,clients,findClient,findClientByName,findClientByPhone,upsertClient,queueDomainEvent,syncDomainNow,sanitizeManager,updateAdminCards,toast};
  }

  function start(){
    try{ensureState();migrateClientsFromCommands();ensureClientsUi();bindAutocomplete();patchCommandPersistence();patchRenderCommands();patchRenderMenu();refreshClientDatalist();startDomainSchedulers();expose();updateAdminCards();window.addEventListener('rota27:v017-domain-updated',()=>{refreshClientDatalist();renderClients();updateAdminCards();});console.info('[Rota27] v0.17.0 core carregado.');}
    catch(err){console.error('[Rota27 v0.17.0] Falha no core:',err);}
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
