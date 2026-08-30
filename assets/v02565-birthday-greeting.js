/* Rota 27 v0.25.65 — parabéns automático de aniversário */
(function(){
  'use strict';
  const VERSION='0.25.65';
  const CONSENT_KEY='rota27_v02565_relationship_consents_v1';
  const EVENT_CONSENT_KEY='rota27_v02540_event_marketing_consents_v1';
  const SYNC_CONFIG_KEY='rota27_sync_config_v1';
  const SANDBOX_KEY='rota27_v02538_sandbox_v1';
  let lastStatus=null,loading=false;

  const byId=id=>document.getElementById(id);
  const api=()=>window.Rota27V017||null;
  const clean=(v,max=240)=>api()?.clean?.(v,max)||String(v??'').replace(/[\u0000-\u001F\u007F]/g,' ').trim().replace(/\s+/g,' ').slice(0,max);
  const esc=v=>api()?.esc?.(v)||String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  function readJson(key,fallback){try{const v=JSON.parse(localStorage.getItem(key)||'null');return v==null?fallback:v;}catch{return fallback;}}
  function writeJson(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}}
  function clients(){try{return Array.isArray(api()?.clients?.())?api().clients():[];}catch{return[];}}
  function cfg(){return readJson(SYNC_CONFIG_KEY,{});}
  function sandbox(){if(new URLSearchParams(location.search).get('sandbox')==='1')return true;return readJson(SANDBOX_KEY,{})?.enabled===true;}
  function greetingUrl(){const c=cfg(),u=String(c.functionUrl||'').replace(/\/+$/,'');return /\/rota27-sync$/i.test(u)?u.replace(/\/rota27-sync$/i,'/rota27-birthday-greeting'):'';}
  function ready(){const c=cfg();return !sandbox()&&c.enabled===true&&c.initialized===true&&String(c.deviceToken||'').length>=16&&!!greetingUrl();}
  function consentStore(){const v=readJson(CONSENT_KEY,{});return v&&typeof v==='object'&&!Array.isArray(v)?v:{};}
  function genericConsentFor(client){const id=String(client?.id||''),local=consentStore()[id];if(local&&typeof local.enabled==='boolean')return local.enabled===true;return client?.relationshipMarketingOptIn===true;}
  function editorClient(){const id=byId('v017ClientId')?.value||'';if(id)return api()?.findClient?.(id)||clients().find(c=>String(c.id)===String(id));const p=byId('v017ClientPhone')?.value||'',n=byId('v017ClientName')?.value||'';return (p&&api()?.findClientByPhone?.(p))||(n&&api()?.findClientByName?.(n))||null;}

  function updateConsentCopy(){
    const label=byId('v02540MarketingConsent');if(!label)return false;
    const strong=label.querySelector('strong'),small=label.querySelector('small');
    if(strong)strong.textContent='Receber mensagens da Rota 27 pelo WhatsApp';
    if(small)small.textContent='Aniversário, eventos e relacionamento. Consentimento separado das atualizações da comanda.';
    return true;
  }
  function fillGenericEditor(){
    updateConsentCopy();const box=byId('v02540MarketingOptIn');if(!box)return false;const c=editorClient();if(c)box.checked=genericConsentFor(c);return true;
  }
  function persistGenericConsent(){
    const box=byId('v02540MarketingOptIn');if(!box)return;const enabled=box.checked===true,idBefore=byId('v017ClientId')?.value||'',name=byId('v017ClientName')?.value||'',rawPhone=byId('v017ClientPhone')?.value||'';
    setTimeout(()=>{
      const c=(idBefore&&api()?.findClient?.(idBefore))||(rawPhone&&api()?.findClientByPhone?.(rawPhone))||(name&&api()?.findClientByName?.(name));if(!c)return;
      const id=String(c.id||'');if(!id)return;const store=consentStore(),old=store[id]||{},ts=Date.now(),optInAt=enabled?Number(old.optInAt||c.relationshipMarketingOptInAt||ts):Number(old.optInAt||c.relationshipMarketingOptInAt||0);
      store[id]={enabled,optInAt,optOutAt:enabled?0:ts,source:'client_editor_v02565'};writeJson(CONSENT_KEY,store);
      const eventStore=readJson(EVENT_CONSENT_KEY,{});eventStore[id]={enabled,optInAt,optOutAt:enabled?0:ts,source:'relationship_consent_v02565'};writeJson(EVENT_CONSENT_KEY,eventStore);
      const next={...c,relationshipMarketingOptIn:enabled,relationshipMarketingOptInAt:optInAt,relationshipMarketingOptOutAt:enabled?0:ts,relationshipMarketingConsentSource:'client_editor_v02565',eventMarketingOptIn:enabled,eventMarketingOptInAt:optInAt,eventMarketingOptOutAt:enabled?0:ts,eventMarketingConsentSource:'relationship_consent_v02565'};
      try{api()?.queueDomainEvent?.('client_upsert',id,{client:next});}catch{}
      try{Object.assign(c,next);}catch{}
      window.dispatchEvent(new CustomEvent('rota27:v02565-marketing-consent-updated',{detail:{clientId:id,enabled}}));
      refreshCard(false);
    },35);
  }
  function bindConsent(){
    updateConsentCopy();const save=byId('v017ClientSave');if(save&&save.dataset.v02565ConsentBound!=='1'){save.dataset.v02565ConsentBound='1';save.addEventListener('click',persistGenericConsent);}
  }

  async function call(action,extra={}){
    if(!ready())throw new Error(sandbox()?'Sandbox ativo: WhatsApp bloqueado.':'Sincronização não está pronta neste aparelho.');
    const c=cfg(),ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),18000);
    try{const r=await fetch(greetingUrl(),{method:'POST',headers:{'content-type':'application/json','x-rota27-device-token':c.deviceToken},body:JSON.stringify({action,storeId:c.storeId||'rota27-bodega',appVersion:VERSION,...extra}),signal:ctrl.signal});const data=await r.json().catch(()=>({}));if(!r.ok||data.ok!==true)throw new Error(data.error||`HTTP ${r.status}`);return data;}finally{clearTimeout(timer);}
  }
  function statusLabel(value){const s=String(value||'').toLowerCase();return({read:'Lido',delivered:'Entregue',sent:'Enviado',accepted_meta:'Aceito pela Meta',processing:'Enviando',failed:'Falhou',scheduled:'Agendado 09:30',not_eligible:'Sem autorização'}[s]||'Agendado 09:30');}
  function statusClass(value){const s=String(value||'').toLowerCase();if(s==='read'||s==='delivered'||s==='sent')return'ok';if(s==='failed')return'fail';if(s==='not_eligible')return'off';return'wait';}
  function decorateCard(){
    const card=byId('v02557UpcomingBirthdays');if(!card)return false;
    const subtitle=card.querySelector('.v02557-subtitle');if(subtitle)subtitle.textContent='Parabéns automático às 09:30 para clientes que autorizaram mensagens de relacionamento.';
    let automation=byId('v02565BirthdayAutomation');if(!automation){automation=document.createElement('div');automation.id='v02565BirthdayAutomation';const counts=card.querySelector('.v02557-counts');counts?.insertAdjacentElement('afterend',automation);}
    const templateStatus=String(lastStatus?.template?.status||'').toUpperCase();
    const approved=templateStatus==='APPROVED';
    const count=Number(lastStatus?.counts?.authorized||0),sent=Number(lastStatus?.counts?.sent||0),failed=Number(lastStatus?.counts?.failed||0);
    if(sandbox())automation.innerHTML='<strong>Automação de aniversário</strong><span>Sandbox ativo • nenhum WhatsApp será enviado.</span>';
    else if(!ready())automation.innerHTML='<strong>Automação de aniversário • 09:30</strong><span>Status disponível quando a sincronização estiver pronta.</span>';
    else if(loading)automation.innerHTML='<strong>Automação de aniversário • 09:30</strong><span>Atualizando status…</span>';
    else if(!lastStatus)automation.innerHTML='<strong>Automação de aniversário • 09:30</strong><span>Toque em Atualizar para conferir o template e os envios.</span><button type="button" id="v02565RefreshBirthday">Atualizar</button>';
    else automation.innerHTML=`<strong>Automação de aniversário • 09:30</strong><span>${approved?`${count} autorizado${count===1?'':'s'} hoje${sent?` • ${sent} enviado${sent===1?'':'s'}`:''}${failed?` • ${failed} falha${failed===1?'':'s'}`:''}`:`Template Meta: ${esc(templateStatus||'PENDENTE')}`}</span><button type="button" id="v02565RefreshBirthday">Atualizar</button>`;
    const upcoming=window.Rota27V02557UpcomingBirthdays?.getUpcoming?.()||[],shown=upcoming.slice(0,5),backend=new Map((lastStatus?.rows||[]).map(r=>[String(r.clientId||''),r]));
    card.querySelectorAll('.v02557-person').forEach((button,index)=>{
      const item=shown[index],client=item?.client,next=item?.next;if(!client||!next)return;button.dataset.v02565ClientId=String(client.id||'');const badge=button.querySelector('.v02557-when');
      if(next.days!==0){if(badge)badge.textContent=next.days===1?'Amanhã':`Em ${next.days} dias`;return;}
      const row=backend.get(String(client.id||''));let status=row?.status||'';
      if(!row){const hasPhone=String(client.whatsappPhone||'').replace(/\D/g,'').length>=10,statusEligible=genericConsentFor(client)&&hasPhone;status=statusEligible?'scheduled':'not_eligible';}
      if(badge){badge.textContent=statusLabel(status);badge.classList.remove('v02565-ok','v02565-wait','v02565-fail','v02565-off');badge.classList.add(`v02565-${statusClass(status)}`);}
    });
    return true;
  }
  async function refreshStatus(){
    if(!ready()){lastStatus=null;decorateCard();return;}
    loading=true;decorateCard();
    try{lastStatus=await call('status');}catch(err){console.warn('[Rota27 v0.25.65] status aniversário:',err?.message||err);lastStatus=null;}finally{loading=false;decorateCard();}
  }
  function refreshCard(fetchStatus=true){bindConsent();fillGenericEditor();requestAnimationFrame(decorateCard);if(fetchStatus&&byId('v017ClientsWrap')?.classList.contains('open'))refreshStatus();}

  function start(){
    bindConsent();setTimeout(fillGenericEditor,120);setTimeout(decorateCard,260);
    document.addEventListener('click',e=>{
      if(e.target.closest?.('#v017NewClient,.v017-client-row')){setTimeout(fillGenericEditor,20);setTimeout(fillGenericEditor,160);}
      if(e.target.closest?.('#v017ClientsBtn,[data-clients]'))setTimeout(()=>refreshCard(true),220);
      if(e.target.closest?.('#v02565RefreshBirthday'))refreshStatus();
    });
    ['rota27:v017-domain-updated','rota27:v02517-birthday-updated','rota27:v02565-marketing-consent-updated'].forEach(name=>window.addEventListener(name,()=>setTimeout(()=>refreshCard(false),40)));
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&byId('v017ClientsWrap')?.classList.contains('open'))refreshCard(true);});
    window.Rota27V02565BirthdayGreeting={version:VERSION,refresh:refreshStatus,consentFor:genericConsentFor,getStatus:()=>lastStatus};
    console.info('[Rota27] v0.25.65 — parabéns automático de aniversário ativo.');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
