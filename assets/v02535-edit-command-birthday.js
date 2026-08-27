/* Rota 27 v0.25.35 — data de nascimento também na edição da comanda */
(function(){
  'use strict';

  const VERSION='0.25.35';
  const STORE_KEY='rota27_v02517_birthdays_v1';
  let baseOpenEdit=null;
  let baseSaveEdit=null;
  let bound=false;

  const byId=id=>document.getElementById(id);
  const api=()=>window.Rota27V017||null;
  const bdayApi=()=>window.Rota27V02517Birthday||null;
  const clean=(v,max=240)=>api()?.clean?.(v,max)||String(v??'').trim().replace(/\s+/g,' ').slice(0,max);
  const norm=v=>api()?.norm?.(v)||clean(v,500).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');
  const phone=v=>api()?.normalizePhone?.(v)||String(v||'').replace(/\D/g,'');
  const toast=msg=>{try{api()?.toast?.(msg)}catch{try{showToast(msg,false)}catch{}}};

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

  function current(){
    try{return typeof currentCommand==='function'?currentCommand():null;}catch{return null;}
  }

  function readStore(){
    try{
      const raw=JSON.parse(localStorage.getItem(STORE_KEY)||'{}');
      return raw&&typeof raw==='object'&&raw.records&&typeof raw.records==='object'?raw:{version:1,records:{}};
    }catch{return {version:1,records:{}};}
  }

  function saveBirthDate(client,value){
    if(!client)return false;
    const birthDate=normalizeBirthDate(value);if(birthDate===null||!birthDate)return false;
    const currentDate=bdayApi()?.getBirthDate?.(client.id)||client.birthDate||'';
    if(normalizeBirthDate(currentDate)===birthDate)return false;

    const updatedAt=Date.now();
    const store=readStore();
    const record={clientId:clean(client.id,160),whatsappPhone:phone(client.whatsappPhone||''),birthDate,updatedAt,seq:0};
    const keys=[];
    if(record.clientId)keys.push(`i:${record.clientId}`);
    if(record.whatsappPhone)keys.push(`p:${record.whatsappPhone}`);
    keys.forEach(k=>{const old=store.records[k];record.seq=Math.max(record.seq,Number(old?.seq||0));});
    keys.forEach(k=>{store.records[k]={...record};});
    try{localStorage.setItem(STORE_KEY,JSON.stringify(store));}catch{}

    client.birthDate=birthDate;
    try{if(typeof save==='function')save();}catch{}
    const payload={...JSON.parse(JSON.stringify(client)),birthDate,birthDateUpdatedAt:updatedAt};
    try{api()?.queueDomainEvent?.('client_upsert',client.id,{client:payload});}catch{}
    try{setTimeout(()=>api()?.syncDomainNow?.(),50);}catch{}
    window.dispatchEvent(new CustomEvent('rota27:v02517-birthday-updated',{detail:{clientId:client.id,birthDate,source:'edit-command'}}));
    return true;
  }

  function ensureField(){
    const wa=byId('editWhatsapp');if(!wa)return false;
    const anchor=wa.closest('.field')||wa.parentElement;if(!anchor)return false;
    let field=byId('v02535EditBirthField');
    if(!field){
      field=document.createElement('div');
      field.className='field';field.id='v02535EditBirthField';
      field.innerHTML=`<label>Data de nascimento <small style="font-weight:500;opacity:.72">(opcional)</small></label><input id="editBirthDate" type="date" autocomplete="bday" min="1900-01-01" max="${todayIso()}"><small style="display:block;margin-top:6px;color:var(--muted);font-size:11px">Cliente cadastrado é preenchido automaticamente. Deixar vazio não apaga uma data já salva.</small>`;
      anchor.insertAdjacentElement('afterend',field);
    }
    const input=byId('editBirthDate');if(input)input.max=todayIso();
    return true;
  }

  function fillFromFields(){
    if(!ensureField())return;
    const input=byId('editBirthDate');if(!input)return;
    const client=findClient(byId('editCustomer')?.value||'',byId('editWhatsapp')?.value||'');
    if(!client){
      if(input.dataset.clientId){input.value='';delete input.dataset.clientId;}
      return;
    }
    input.value=normalizeBirthDate(bdayApi()?.getBirthDate?.(client.id)||client.birthDate||'')||'';
    input.dataset.clientId=String(client.id||'');
  }

  function fillFromCurrent(){
    if(!ensureField())return;
    const c=current(),input=byId('editBirthDate');if(!input)return;
    const client=findClient(byId('editCustomer')?.value||c?.customer||'',byId('editWhatsapp')?.value||c?.whatsappPhone||'');
    input.max=todayIso();
    input.value=client?(normalizeBirthDate(bdayApi()?.getBirthDate?.(client.id)||client.birthDate||'')||''):'';
    if(client)input.dataset.clientId=String(client.id||'');else delete input.dataset.clientId;
  }

  function bindFields(){
    if(bound||!ensureField())return;
    const name=byId('editCustomer'),wa=byId('editWhatsapp'),input=byId('editBirthDate');
    if(!name||!wa||!input)return;
    bound=true;
    const refresh=()=>setTimeout(fillFromFields,0);
    name.addEventListener('change',refresh);name.addEventListener('blur',refresh);
    wa.addEventListener('change',refresh);wa.addEventListener('blur',refresh);
  }

  function applyPendingBirthday(pending,attempt=0){
    const client=findClient(pending.name,pending.rawPhone);
    if(client){saveBirthDate(client,pending.birthDate);return;}
    if(attempt<8)setTimeout(()=>applyPendingBirthday(pending,attempt+1),90);
  }

  function patchOpenEdit(){
    if(baseOpenEdit||typeof window.openEditCommandSheet!=='function')return;
    baseOpenEdit=window.openEditCommandSheet;
    const patched=function(){
      const result=baseOpenEdit.apply(this,arguments);
      [0,80].forEach(delay=>setTimeout(fillFromCurrent,delay));
      return result;
    };
    try{window.openEditCommandSheet=patched;openEditCommandSheet=patched;}catch{}
  }

  function patchSaveEdit(){
    if(baseSaveEdit||typeof window.saveCommandEdits!=='function')return;
    baseSaveEdit=window.saveCommandEdits;
    const patched=function(){
      ensureField();
      const input=byId('editBirthDate');
      const birthDate=normalizeBirthDate(input?.value||'');
      if(birthDate===null){toast('Informe uma data de nascimento válida ou deixe o campo em branco.');return;}
      const pending={name:byId('editCustomer')?.value?.trim()||'',rawPhone:byId('editWhatsapp')?.value?.trim()||'',birthDate};
      const result=baseSaveEdit.apply(this,arguments);
      if(pending.birthDate)setTimeout(()=>applyPendingBirthday(pending),40);
      return result;
    };
    try{window.saveCommandEdits=patched;saveCommandEdits=patched;}catch{}
  }

  function updateHelp(){
    const section=byId('r27-help-clientes');if(!section||section.querySelector('[data-v02535-help]'))return;
    const body=section.querySelector('.r27-help-section-body');if(!body)return;
    const box=document.createElement('div');box.dataset.v02535Help='1';box.className='r27-help-tip';
    box.innerHTML='<strong>Editar comanda:</strong> a data de nascimento também fica disponível ao editar uma comanda. Quando o cliente já está cadastrado, o campo é preenchido automaticamente; deixar vazio não apaga uma data existente.';
    body.appendChild(box);
  }

  function start(){
    ensureField();bindFields();patchOpenEdit();patchSaveEdit();updateHelp();
    [120,300].forEach(delay=>setTimeout(()=>{ensureField();bindFields();patchOpenEdit();patchSaveEdit();updateHelp();},delay));
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){ensureField();patchOpenEdit();patchSaveEdit();updateHelp();}});
    window.Rota27V02535EditCommandBirthday={version:VERSION,refresh:fillFromCurrent};
    console.info('[Rota27] v0.25.35 — nascimento disponível na edição da comanda.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
