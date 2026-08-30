/* Rota 27 v0.25.66 — elegibilidade clara de aniversário */
(function(){
  'use strict';
  const VERSION='0.25.66';
  let pendingSave=null;

  const byId=id=>document.getElementById(id);
  const api=()=>window.Rota27V017||null;
  const clean=(v,max=240)=>api()?.clean?.(v,max)||String(v??'').replace(/[\u0000-\u001F\u007F]/g,' ').trim().replace(/\s+/g,' ').slice(0,max);
  const phone=v=>api()?.normalizePhone?.(v)||String(v||'').replace(/\D/g,'');
  const clients=()=>{try{return Array.isArray(api()?.clients?.())?api().clients():[];}catch{return[];}};
  const consentApi=()=>window.Rota27V02565BirthdayGreeting||null;
  const birthdayApi=()=>window.Rota27V02517Birthday||null;

  function validBirth(value){
    const raw=String(value||'').trim();
    const m=raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);if(!m)return'';
    const y=Number(m[1]),mo=Number(m[2]),d=Number(m[3]),dt=new Date(Date.UTC(y,mo-1,d));
    if(y<1900||dt.getUTCFullYear()!==y||dt.getUTCMonth()!==mo-1||dt.getUTCDate()!==d)return'';
    return raw;
  }
  function clientBirth(client){
    if(!client)return'';
    try{return validBirth(birthdayApi()?.getBirthDate?.(client.id)||client.birthDate||'');}catch{return validBirth(client.birthDate||'');}
  }
  function findClient(id,rawPhone,name){
    if(id){const c=clients().find(x=>String(x?.id||'')===String(id));if(c)return c;}
    const p=phone(rawPhone);if(p){const c=clients().find(x=>phone(x?.whatsappPhone||x?.phone||'')===p);if(c)return c;}
    const n=clean(name,160).toLocaleLowerCase('pt-BR');if(n)return clients().find(x=>clean(x?.name,160).toLocaleLowerCase('pt-BR')===n)||null;
    return null;
  }
  function editorClient(){return findClient(byId('v017ClientId')?.value||'',byId('v017ClientPhone')?.value||'',byId('v017ClientName')?.value||'');}
  function authorized(client){
    if(!client)return false;
    try{return consentApi()?.consentFor?.(client)===true||client.relationshipMarketingOptIn===true;}catch{return client.relationshipMarketingOptIn===true;}
  }
  function hasValidPhone(client){return phone(client?.whatsappPhone||client?.phone||'').length>=12;}

  /*
   * Quando a data é fornecida pela primeira vez (ou alterada), a autorização
   * aprovada para relacionamento acompanha o mesmo save. Se houver opt-out
   * explícito posterior com a data inalterada, ele continua sendo respeitado.
   */
  function captureClientSave(event){
    const save=event.target.closest?.('#v017ClientSave');if(!save)return;
    const input=byId('v02517ClientBirthDate');if(!input)return;
    const birthDate=validBirth(input.value);if(!birthDate)return;
    const before=editorClient();
    const oldBirth=clientBirth(before);
    const changed=oldBirth!==birthDate;
    if(!changed)return;
    const consentBox=byId('v02540MarketingOptIn');if(consentBox)consentBox.checked=true;
    pendingSave={
      id:byId('v017ClientId')?.value||'',
      name:byId('v017ClientName')?.value||'',
      rawPhone:byId('v017ClientPhone')?.value||'',
      birthDate,
      startedAt:Date.now()
    };
    [70,180,420].forEach(ms=>setTimeout(()=>flushPendingSave(),ms));
  }
  function flushPendingSave(){
    const p=pendingSave;if(!p)return false;
    const client=findClient(p.id,p.rawPhone,p.name);if(!client)return false;
    const ts=Date.now(),id=String(client.id||'');if(!id)return false;
    const next={...client,
      birthDate:p.birthDate,
      birthDateUpdatedAt:ts,
      relationshipMarketingOptIn:true,
      relationshipMarketingOptInAt:Number(client.relationshipMarketingOptInAt||ts),
      relationshipMarketingOptOutAt:0,
      relationshipMarketingConsentSource:'birth_date_provided_v02566',
      eventMarketingOptIn:true,
      eventMarketingOptInAt:Number(client.eventMarketingOptInAt||client.relationshipMarketingOptInAt||ts),
      eventMarketingOptOutAt:0,
      eventMarketingConsentSource:'birth_date_provided_v02566'
    };
    try{Object.assign(client,next);}catch{}
    try{api()?.queueDomainEvent?.('client_upsert',id,{client:next});}catch(err){console.warn('[Rota27 v0.25.66] client_upsert aniversário:',err?.message||err);}
    try{setTimeout(()=>api()?.syncDomainNow?.(),60);}catch{}
    pendingSave=null;
    try{window.dispatchEvent(new CustomEvent('rota27:v02517-birthday-updated',{detail:{clientId:id,birthDate:p.birthDate}}));}catch{}
    try{window.dispatchEvent(new CustomEvent('rota27:v02565-marketing-consent-updated',{detail:{clientId:id,enabled:true}}));}catch{}
    scheduleDecorate();
    return true;
  }

  /* Evita checkbox aparentemente desligado enquanto o backfill ainda está chegando ao aparelho. */
  function primeEditor(){
    const client=editorClient(),box=byId('v02540MarketingOptIn');if(!client||!box)return false;
    if(client.relationshipMarketingOptIn===false)return false;
    if(clientBirth(client)&&client.relationshipMarketingOptIn!==false)box.checked=authorized(client)||client.relationshipMarketingOptIn===undefined;
    return true;
  }

  function eligibilityText(client,next){
    if(!hasValidPhone(client))return{label:'Sem WhatsApp',kind:'off'};
    if(!authorized(client))return{label:'Sem autorização',kind:'off'};
    if(Number(next?.days||0)===0)return{label:'Autorizado • envio 09h30',kind:'ok'};
    return{label:'Autorizado • 09h30 no dia',kind:'ok'};
  }
  function decorateCard(){
    const card=byId('v02557UpcomingBirthdays');if(!card)return false;
    const subtitle=card.querySelector('.v02557-subtitle');
    if(subtitle)subtitle.textContent='Parabéns automático às 09:30 no dia do aniversário para clientes autorizados.';
    const upcoming=window.Rota27V02557UpcomingBirthdays?.getUpcoming?.()||[];
    const shown=upcoming.slice(0,5);
    card.querySelectorAll('.v02557-person').forEach((button,index)=>{
      const item=shown[index],client=item?.client,next=item?.next;if(!client||!next)return;
      let badge=button.querySelector('.v02566-eligibility');
      if(!badge){badge=document.createElement('small');badge.className='v02566-eligibility';button.appendChild(badge);}
      const status=eligibilityText(client,next);
      badge.textContent=status.label;
      badge.classList.toggle('ok',status.kind==='ok');
      badge.classList.toggle('off',status.kind==='off');
    });
    return true;
  }
  function scheduleDecorate(){[0,100,280].forEach(ms=>setTimeout(decorateCard,ms));}

  function start(){
    document.addEventListener('click',captureClientSave,true);
    document.addEventListener('click',event=>{
      if(event.target.closest?.('#v017NewClient,.v017-client-row'))[20,140].forEach(ms=>setTimeout(primeEditor,ms));
      if(event.target.closest?.('#v017ClientsBtn,[data-clients],#v02565RefreshBirthday'))scheduleDecorate();
    });
    ['rota27:v017-domain-updated','rota27:v02517-birthday-updated','rota27:v02565-marketing-consent-updated'].forEach(name=>window.addEventListener(name,scheduleDecorate));
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&byId('v017ClientsWrap')?.classList.contains('open'))scheduleDecorate();});
    scheduleDecorate();
    window.Rota27V02566BirthdayEligibility={version:VERSION,refresh:decorateCard,authorized,flushPendingSave};
    console.info('[Rota27] v0.25.66 — elegibilidade de aniversário ativa.');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
