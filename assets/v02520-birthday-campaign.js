/* Rota 27 v0.25.20 — campanha controlada para coleta de data de nascimento */
(function(){
  'use strict';
  const VERSION='0.25.20';
  const SYNC_CONFIG_KEY='rota27_sync_config_v1';
  const AUTO_SUBMIT_KEY='rota27_v02520_birthday_template_submit_attempt_v1';
  let loading=false,lastStatus=null;
  const byId=id=>document.getElementById(id);
  const api=()=>window.Rota27V017||null;
  const toast=msg=>{try{api()?.toast?.(msg)}catch{}};
  function cfg(){try{return JSON.parse(localStorage.getItem(SYNC_CONFIG_KEY)||'{}')||{};}catch{return {};}}
  function campaignUrl(){const c=cfg();const u=String(c.functionUrl||'').replace(/\/+$/,'');return /\/rota27-sync$/i.test(u)?u.replace(/\/rota27-sync$/i,'/rota27-birthday-campaign'):'';}
  function ready(){const c=cfg();return c.enabled===true&&c.initialized===true&&String(c.deviceToken||'').length>=16&&!!campaignUrl();}
  async function call(action,extra={}){
    if(!ready())throw new Error('Sincronização não está pronta neste aparelho.');
    const c=cfg(),ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),20000);
    try{
      const r=await fetch(campaignUrl(),{method:'POST',headers:{'content-type':'application/json','x-rota27-device-token':c.deviceToken},body:JSON.stringify({action,storeId:c.storeId||'rota27-bodega',deviceId:c.deviceId||'',appVersion:VERSION,...extra}),signal:ctrl.signal});
      const data=await r.json().catch(()=>({}));
      if(!r.ok||data.ok!==true)throw new Error(data.error||`HTTP ${r.status}`);
      return data;
    }finally{clearTimeout(timer);}
  }
  function badge(status){const s=String(status||'').toUpperCase();if(s==='APPROVED')return '<span class="v02520-campaign-badge ok">Template aprovado</span>';if(s==='PENDING'||s==='IN_APPEAL')return '<span class="v02520-campaign-badge wait">Aguardando Meta</span>';if(s==='REJECTED'||s==='DISABLED'||s==='PAUSED')return `<span class="v02520-campaign-badge bad">${s}</span>`;if(s==='NOT_SUBMITTED')return '<span class="v02520-campaign-badge neutral">Template ainda não enviado</span>';return `<span class="v02520-campaign-badge neutral">${s||'Status indisponível'}</span>`;}
  function ensureCard(){
    const wrap=byId('v017ClientsWrap');if(!wrap||byId('v02520BirthdayCampaign'))return false;
    const card=document.createElement('section');card.id='v02520BirthdayCampaign';card.className='v02520-campaign-card';
    card.innerHTML=`<div class="v02520-campaign-head"><div><span class="v02520-campaign-kicker">CADASTRO</span><strong>Solicitar aniversários pelo WhatsApp</strong><small>Envia uma mensagem oficial para clientes com WhatsApp e sem data de nascimento.</small></div><span>🎂</span></div><div id="v02520CampaignState" class="v02520-campaign-state">Carregando situação da campanha…</div><div class="v02520-campaign-actions"><button type="button" id="v02520CampaignRefresh">Atualizar status</button><button type="button" id="v02520CampaignTemplate">Solicitar template</button><button type="button" id="v02520CampaignSend" class="primary">Enviar solicitações</button></div><small class="v02520-campaign-note">Por segurança, o envio automático considera somente clientes com evidência anterior de mensagem transacional autorizada no Rota 27. Respostas válidas em DD/MM/AAAA atualizam o cadastro automaticamente.</small>`;
    const anchor=byId('v025RelationshipEntry')||wrap.querySelector('.v017-client-actions')||wrap.firstElementChild;anchor?.insertAdjacentElement('afterend',card);
    byId('v02520CampaignRefresh')?.addEventListener('click',refresh);
    byId('v02520CampaignTemplate')?.addEventListener('click',submitTemplate);
    byId('v02520CampaignSend')?.addEventListener('click',sendCampaign);
    return true;
  }
  function render(data){
    lastStatus=data;const state=byId('v02520CampaignState'),send=byId('v02520CampaignSend'),tpl=byId('v02520CampaignTemplate');if(!state)return;
    const c=data?.counts||{},t=data?.template||{};
    state.innerHTML=`<div class="v02520-campaign-line">${badge(t.status)}</div><div class="v02520-campaign-grid"><div><b>${Number(c.withWhatsAppMissingBirthDate||0)}</b><span>com WhatsApp sem aniversário</span></div><div><b>${Number(c.withPriorConsentEvidence||0)}</b><span>com histórico autorizado</span></div><div><b>${Number(c.alreadyRequested||0)}</b><span>já solicitados</span></div><div><b>${Number(c.readyToSend||0)}</b><span>prontos para envio</span></div></div>${Number(c.withoutPriorConsentEvidence||0)>0?`<div class="v02520-campaign-warning">${Number(c.withoutPriorConsentEvidence)} cliente(s) com telefone ficaram fora do disparo por não haver evidência anterior de consentimento no sistema.</div>`:''}${data.templateError?`<div class="v02520-campaign-warning">${String(data.templateError)}</div>`:''}`;
    const approved=String(t.status||'').toUpperCase()==='APPROVED';if(send){send.disabled=!approved||Number(c.readyToSend||0)<=0;send.textContent=approved?`Enviar ${Number(c.readyToSend||0)} solicitações`:'Aguardar aprovação';}
    if(tpl){tpl.disabled=approved||String(t.status||'').toUpperCase()==='PENDING';tpl.textContent=t.found?'Template já enviado':'Solicitar template';}
  }
  async function refresh(){if(loading)return;loading=true;toggle(true);try{const data=await call('status');render(data);await maybeAutoSubmit(data);}catch(err){const state=byId('v02520CampaignState');if(state)state.textContent=err?.message||'Falha ao consultar campanha.';}finally{loading=false;toggle(false);}}
  async function maybeAutoSubmit(data){
    if(sessionStorage.getItem(AUTO_SUBMIT_KEY)==='1')return;const status=String(data?.template?.status||'').toUpperCase();if(status!=='NOT_SUBMITTED'||data?.wabaResolved!==true)return;
    sessionStorage.setItem(AUTO_SUBMIT_KEY,'1');try{const result=await call('submit_template');toast('Template de aniversário enviado para aprovação da Meta.');render({...data,template:result.template});}catch(err){console.warn('[Rota27 v0.25.20] Não foi possível submeter template automaticamente:',err?.message||err);}
  }
  async function submitTemplate(){if(loading)return;loading=true;toggle(true);try{const data=await call('submit_template');toast(data?.template?.existing?'Template já cadastrado na Meta.':'Template enviado para aprovação da Meta.');await refreshAfter();}catch(err){toast(err?.message||'Falha ao solicitar template.');}finally{loading=false;toggle(false);}}
  async function sendCampaign(){
    if(loading)return;const n=Number(lastStatus?.counts?.readyToSend||0);if(!n)return;
    if(!confirm(`Enviar agora a solicitação de data de nascimento para ${n} cliente${n===1?'':'s'}?\n\nO sistema não repetirá mensagens já enviadas.`))return;
    loading=true;toggle(true);try{const data=await call('send_campaign');toast(`${Number(data.sent||0)} solicitação(ões) enviada(s).`);await refreshAfter();}catch(err){toast(err?.message||'Falha no disparo.');}finally{loading=false;toggle(false);}
  }
  function toggle(busy){['v02520CampaignRefresh','v02520CampaignTemplate','v02520CampaignSend'].forEach(id=>{const b=byId(id);if(b)b.disabled=busy||(id==='v02520CampaignSend'&&String(lastStatus?.template?.status||'').toUpperCase()!=='APPROVED');});}
  async function refreshAfter(){try{const data=await call('status');render(data);}catch{}}
  function start(){ensureCard();setTimeout(()=>{ensureCard();refresh();},500);document.addEventListener('click',e=>{if(e.target.closest?.('#v017ClientsBtn,[data-clients]'))setTimeout(()=>{ensureCard();refresh();},150);});window.addEventListener('rota27:v02517-birthday-updated',()=>setTimeout(refresh,300));window.Rota27V02520BirthdayCampaign={version:VERSION,refresh,submitTemplate,sendCampaign};}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
