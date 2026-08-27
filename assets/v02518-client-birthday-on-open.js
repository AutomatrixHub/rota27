/* Rota 27 v0.25.18 — nascimento no cadastro rápido da nova comanda */
(function(){
  'use strict';

  const VERSION='0.25.18';
  const STORE_KEY='rota27_v02517_birthdays_v1';
  let baseCreateCommand=null;
  let bound=false;

  const byId=id=>document.getElementById(id);
  const api=()=>window.Rota27V017||null;
  const bdayApi=()=>window.Rota27V02517Birthday||null;
  const clean=(v,max=240)=>api()?.clean?.(v,max)||String(v??'').trim().replace(/\s+/g,' ').slice(0,max);
  const norm=v=>api()?.norm?.(v)||clean(v,500).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');
  const phone=v=>api()?.normalizePhone?.(v)||String(v||'').replace(/\D/g,'');
  const toast=msg=>{try{api()?.toast?.(msg)}catch{}};

  function todayIso(){
    const d=new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  function normalizeBirthDate(value){
    const fn=bdayApi()?.normalizeBirthDate;
    if(typeof fn==='function')return fn(value);
    const raw=String(value??'').trim();
    if(!raw)return '';
    const m=raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);if(!m)return null;
    const y=Number(m[1]),mo=Number(m[2]),d=Number(m[3]);
    const dt=new Date(Date.UTC(y,mo-1,d));
    if(y<1900||dt.getUTCFullYear()!==y||dt.getUTCMonth()!==mo-1||dt.getUTCDate()!==d||raw>todayIso())return null;
    return raw;
  }

  function clients(){
    try{return Array.isArray(api()?.clients?.())?api().clients():Array.isArray(state?.clients)?state.clients:[];}catch{return [];}
  }

  function findClient(name,rawPhone){
    const p=phone(rawPhone||'');
    if(p){const c=clients().find(x=>phone(x?.whatsappPhone||'')===p);if(c)return c;}
    const n=norm(name||'');
    return n?clients().find(x=>norm(x?.name||'')===n)||null:null;
  }

  function readStore(){
    try{
      const raw=JSON.parse(localStorage.getItem(STORE_KEY)||'{}');
      return raw&&typeof raw==='object'&&raw.records&&typeof raw.records==='object'?raw:{version:1,records:{}};
    }catch{return {version:1,records:{}};}
  }

  function saveBirthDate(client,value){
    if(!client)return false;
    const birthDate=normalizeBirthDate(value);if(birthDate===null)return false;
    const current=bdayApi()?.getBirthDate?.(client.id)||client.birthDate||'';
    if(!birthDate){
      return false;
    }
    if(normalizeBirthDate(current)===birthDate)return false;

    const updatedAt=Date.now();
    const store=readStore();
    const record={clientId:clean(client.id,160),whatsappPhone:phone(client.whatsappPhone||''),birthDate,updatedAt,seq:0};
    const keys=[];
    if(record.clientId)keys.push(`i:${record.clientId}`);
    if(record.whatsappPhone)keys.push(`p:${record.whatsappPhone}`);
    keys.forEach(k=>{
      const old=store.records[k];
      record.seq=Math.max(record.seq,Number(old?.seq||0));
    });
    keys.forEach(k=>{store.records[k]={...record};});
    try{localStorage.setItem(STORE_KEY,JSON.stringify(store));}catch{}

    client.birthDate=birthDate;
    try{if(typeof save==='function')save();}catch{}
    const payload={...JSON.parse(JSON.stringify(client)),birthDate,birthDateUpdatedAt:updatedAt};
    try{api()?.queueDomainEvent?.('client_upsert',client.id,{client:payload});}catch{}
    try{setTimeout(()=>api()?.syncDomainNow?.(),50);}catch{}
    window.dispatchEvent(new CustomEvent('rota27:v02517-birthday-updated',{detail:{clientId:client.id,birthDate,source:'new-command'}}));
    return true;
  }

  function ensureField(){
    const wa=byId('newWhatsapp');if(!wa)return false;
    const anchor=wa.closest('.field')||wa.parentElement;if(!anchor)return false;
    let field=byId('v02518NewBirthField');
    if(!field){
      field=document.createElement('div');field.className='field';field.id='v02518NewBirthField';
      field.innerHTML=`<label>Data de nascimento <small style="font-weight:500;opacity:.72">(opcional)</small></label><input id="newBirthDate" type="date" autocomplete="bday" min="1900-01-01" max="${todayIso()}"><small style="display:block;margin-top:6px;color:var(--muted);font-size:11px">Para cliente novo, o dado já fica salvo no cadastro. Cliente existente é preenchido automaticamente.</small>`;
      anchor.insertAdjacentElement('afterend',field);
    }
    const input=byId('newBirthDate');if(input)input.max=todayIso();
    return true;
  }

  function fillFromExisting(){
    if(!ensureField())return;
    const name=byId('newCustomer')?.value||'',rawPhone=byId('newWhatsapp')?.value||'',input=byId('newBirthDate');if(!input)return;
    const client=findClient(name,rawPhone);
    if(!client){
      if(input.dataset.clientId){input.value='';delete input.dataset.clientId;}
      return;
    }
    const value=bdayApi()?.getBirthDate?.(client.id)||client.birthDate||'';
    input.value=normalizeBirthDate(value)||'';
    input.dataset.clientId=String(client.id||'');
  }

  function resetForNewCommand(){
    if(!ensureField())return;
    const input=byId('newBirthDate');if(!input)return;
    delete input.dataset.clientId;
    input.value='';
    setTimeout(fillFromExisting,60);
  }

  function bindFields(){
    if(bound||!ensureField())return;
    const name=byId('newCustomer'),wa=byId('newWhatsapp'),input=byId('newBirthDate');
    if(!name||!wa||!input)return;
    bound=true;
    const refresh=()=>setTimeout(fillFromExisting,0);
    name.addEventListener('change',refresh);
    name.addEventListener('blur',refresh);
    name.addEventListener('input',()=>{
      const c=findClient(name.value,wa.value);
      if(c)fillFromExisting();
      else if(input.dataset.clientId){input.value='';delete input.dataset.clientId;}
    });
    wa.addEventListener('change',refresh);
    wa.addEventListener('blur',refresh);
    document.addEventListener('pointerdown',e=>{
      if(e.target.closest?.('[data-v02513-client]'))setTimeout(fillFromExisting,60);
    });
    document.addEventListener('click',e=>{
      if(e.target.closest?.('.fab,#v0252MapAddMesa,#v0252MapAddCounter,#v0252MapAddParklet,#v0252MapAddClient'))setTimeout(resetForNewCommand,60);
    });
  }

  function applyPendingBirthday(pending,attempt=0){
    const client=findClient(pending.name,pending.rawPhone);
    if(client){saveBirthDate(client,pending.birthDate);return;}
    if(attempt<8)setTimeout(()=>applyPendingBirthday(pending,attempt+1),80);
  }

  function patchCreateCommand(){
    if(baseCreateCommand||typeof window.createCommand!=='function')return;
    baseCreateCommand=window.createCommand;
    window.createCommand=function(){
      ensureField();
      const input=byId('newBirthDate');
      const birthDate=normalizeBirthDate(input?.value||'');
      if(birthDate===null){toast('Informe uma data de nascimento válida ou deixe o campo em branco.');return;}
      const pending={name:byId('newCustomer')?.value?.trim()||'',rawPhone:byId('newWhatsapp')?.value?.trim()||'',birthDate};
      const result=baseCreateCommand.apply(this,arguments);
      if(pending.birthDate)setTimeout(()=>applyPendingBirthday(pending),40);
      return result;
    };
    try{createCommand=window.createCommand;}catch{}
  }

  function updateHelp(){
    const section=byId('r27-help-clientes');if(!section||section.querySelector('[data-v02518-help]'))return;
    const body=section.querySelector('.r27-help-section-body');if(!body)return;
    const box=document.createElement('div');box.dataset.v02518Help='1';box.className='r27-help-tip';
    box.innerHTML='<strong>Cadastro rápido na nova comanda:</strong> além do WhatsApp, você pode informar a data de nascimento. Para cliente já cadastrado, o aniversário é preenchido automaticamente. Deixar o campo vazio nunca apaga uma data já salva.';
    body.appendChild(box);
  }

  function start(){
    ensureField();bindFields();patchCreateCommand();updateHelp();
    setTimeout(()=>{ensureField();bindFields();patchCreateCommand();updateHelp();},250);
    window.addEventListener('rota27:v017-domain-updated',()=>setTimeout(fillFromExisting,30));
    window.addEventListener('rota27:v02517-birthday-updated',()=>setTimeout(fillFromExisting,30));
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){ensureField();bindFields();patchCreateCommand();updateHelp();}});
    window.Rota27V02518ClientBirthday={version:VERSION,refresh:fillFromExisting};
    console.info('[Rota27] v0.25.18 — nascimento no cadastro rápido da nova comanda carregado.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
