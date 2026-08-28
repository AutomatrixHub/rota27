/* Rota 27 v0.25.40 — Eventos & Convites */
(function(){
  'use strict';
  const VERSION='0.25.40';
  const EVENTS_KEY='rota27_v02540_events_v1';
  const CONSENT_KEY='rota27_v02540_event_marketing_consents_v1';
  const SYNC_CONFIG_KEY='rota27_sync_config_v1';
  const SANDBOX_KEY='rota27_v02538_sandbox_v1';
  let activeEventId='',selectedClients=new Set(),lastStatus=null,loading=false;

  const byId=id=>document.getElementById(id);
  const api=()=>window.Rota27V017||null;
  const clean=(v,max=500)=>api()?.clean?.(v,max)||String(v??'').trim().replace(/\s+/g,' ').slice(0,max);
  const norm=v=>api()?.norm?.(v)||clean(v,500).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');
  const esc=v=>api()?.esc?.(v)||String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const phone=v=>api()?.normalizePhone?.(v)||String(v||'').replace(/\D/g,'');
  const validPhone=v=>api()?.validPhone?.(v)||phone(v).length>=12;
  const fmtPhone=v=>api()?.formatPhone?.(v)||String(v||'');
  const toast=msg=>{try{api()?.toast?.(msg);}catch{}};
  const now=()=>Date.now();
  const uid=()=>globalThis.crypto?.randomUUID?`evt_${crypto.randomUUID()}`:`evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,9)}`;
  function readJson(key,fallback){try{const v=JSON.parse(localStorage.getItem(key)||'null');return v==null?fallback:v;}catch{return fallback;}}
  function writeJson(key,value){localStorage.setItem(key,JSON.stringify(value));}
  function events(){const v=readJson(EVENTS_KEY,[]);return Array.isArray(v)?v:[];}
  function saveEvents(rows){writeJson(EVENTS_KEY,Array.isArray(rows)?rows:[]);updateEntrySummary();}
  function consentStore(){const v=readJson(CONSENT_KEY,{});return v&&typeof v==='object'&&!Array.isArray(v)?v:{};}
  function saveConsentStore(v){writeJson(CONSENT_KEY,v||{});updateEntrySummary();}
  function sandbox(){
    if(new URLSearchParams(location.search).get('sandbox')==='1')return true;
    const s=readJson(SANDBOX_KEY,{});return s?.enabled===true;
  }
  function cfg(){return readJson(SYNC_CONFIG_KEY,{});}
  function campaignUrl(){const c=cfg(),u=String(c.functionUrl||'').replace(/\/+$/,'');return /\/rota27-sync$/i.test(u)?u.replace(/\/rota27-sync$/i,'/rota27-event-campaign'):'';}
  function ready(){const c=cfg();return !sandbox()&&c.enabled===true&&c.initialized===true&&String(c.deviceToken||'').length>=16&&!!campaignUrl();}
  async function call(action,extra={}){
    if(sandbox())throw new Error('Sandbox ativo: campanhas e WhatsApp estão bloqueados.');
    if(!ready())throw new Error('Sincronização não está pronta neste aparelho.');
    const c=cfg(),ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),20000);
    try{
      const r=await fetch(campaignUrl(),{method:'POST',headers:{'content-type':'application/json','x-rota27-device-token':c.deviceToken},body:JSON.stringify({action,storeId:c.storeId||'rota27-bodega',deviceId:c.deviceId||'',appVersion:VERSION,...extra}),signal:ctrl.signal});
      const data=await r.json().catch(()=>({}));if(!r.ok||data.ok!==true)throw new Error(data.error||`HTTP ${r.status}`);return data;
    }finally{clearTimeout(timer);}
  }

  function clients(){try{return Array.isArray(api()?.clients?.())?api().clients():Array.isArray(state?.clients)?state.clients:[];}catch{return [];}}
  function history(){try{return (Array.isArray(state?.history)?state.history:[]).filter(c=>c?.cancelled!==true&&c?.internalConsumption!==true&&c?.nonRevenue!==true);}catch{return [];}}
  function clientRows(client){const p=phone(client?.whatsappPhone||''),n=norm(client?.name||'');return history().filter(c=>p?phone(c?.whatsappPhone||'')===p:(!p&&n&&norm(c?.customer||'')===n));}
  function profile(client){const rows=clientRows(client),dates=rows.map(c=>Number(c.closedAt||c.updatedAt||c.createdAt||0)).filter(Boolean).sort((a,b)=>a-b),last=dates.length?dates[dates.length-1]:0;let absent=null;if(last){const a=new Date(last),b=new Date();a.setHours(0,0,0,0);b.setHours(0,0,0,0);absent=Math.max(0,Math.floor((b-a)/86400000));}return{client,visits:rows.length,last,absent};}
  function consentFor(client){const m=consentStore(),row=m[String(client?.id||'')];return row?.enabled===true;}
  function eligibleProfiles(segment='all'){
    let rows=clients().filter(c=>validPhone(c?.whatsappPhone)&&consentFor(c)).map(profile);
    if(segment==='recurring')rows=rows.filter(p=>p.visits>=2);
    if(segment==='frequent')rows=rows.filter(p=>p.visits>=5);
    if(segment==='inactive30')rows=rows.filter(p=>p.absent!==null&&p.absent>=30);
    return rows.sort((a,b)=>String(a.client.name||'').localeCompare(String(b.client.name||''),'pt-BR'));
  }

  async function refreshConsents(){
    if(!ready())return;
    try{
      const data=await call('consents'),map=consentStore();
      (Array.isArray(data.consents)?data.consents:[]).forEach(r=>{if(!r?.clientId)return;map[String(r.clientId)]={enabled:r.enabled===true,optInAt:Number(r.optInAt||0),optOutAt:Number(r.optOutAt||0),source:'backend'};});
      saveConsentStore(map);fillConsentEditor();renderAudience();
    }catch(err){console.warn('[Rota27 v0.25.40] Consentimentos:',err?.message||err);}
  }

  function ensureConsentField(){
    const editor=byId('v017ClientEditWrap')?.querySelector('.sheet');if(!editor||byId('v02540MarketingConsent'))return false;
    const deleteBtn=byId('v017DeleteClient');if(!deleteBtn)return false;
    const label=document.createElement('label');label.id='v02540MarketingConsent';label.className='v02540-consent';
    label.innerHTML='<input type="checkbox" id="v02540MarketingOptIn"><span><strong>Autoriza convites e novidades pelo WhatsApp</strong><small>Consentimento separado das mensagens da comanda. Marque somente se o cliente autorizou receber divulgação de eventos e novidades do Rota 27.</small></span>';
    deleteBtn.insertAdjacentElement('beforebegin',label);return true;
  }
  function editorClient(){
    const id=byId('v017ClientId')?.value||'';if(id)return api()?.findClient?.(id)||clients().find(c=>String(c.id)===String(id));
    const p=byId('v017ClientPhone')?.value||'',n=byId('v017ClientName')?.value||'';return (p&&api()?.findClientByPhone?.(p))||(n&&api()?.findClientByName?.(n))||null;
  }
  function fillConsentEditor(){ensureConsentField();const box=byId('v02540MarketingOptIn');if(!box)return;const c=editorClient();box.checked=!!(c&&consentFor(c));}
  function persistConsentFromEditor(){
    const box=byId('v02540MarketingOptIn');if(!box)return;const enabled=box.checked===true,idBefore=byId('v017ClientId')?.value||'',name=byId('v017ClientName')?.value||'',rawPhone=byId('v017ClientPhone')?.value||'';
    setTimeout(()=>{
      const c=(idBefore&&api()?.findClient?.(idBefore))||(rawPhone&&api()?.findClientByPhone?.(rawPhone))||(name&&api()?.findClientByName?.(name));if(!c)return;
      const map=consentStore(),old=map[String(c.id)]||{},ts=now();map[String(c.id)]={enabled,optInAt:enabled?Number(old.optInAt||ts):Number(old.optInAt||0),optOutAt:enabled?0:ts,source:'client_editor'};saveConsentStore(map);
      if(!sandbox()){
        const extra={...c,eventMarketingOptIn:enabled,eventMarketingOptInAt:enabled?Number(old.optInAt||ts):Number(old.optInAt||0),eventMarketingOptOutAt:enabled?0:ts,eventMarketingConsentSource:'client_editor'};
        try{api()?.queueDomainEvent?.('client_upsert',c.id,{client:extra});}catch{}
      }
      updateEntrySummary();
    },20);
  }
  function bindConsentEditor(){
    ensureConsentField();const save=byId('v017ClientSave');if(save&&save.dataset.v02540Bound!=='1'){save.dataset.v02540Bound='1';save.addEventListener('click',persistConsentFromEditor);}
    document.addEventListener('click',e=>{if(e.target.closest?.('#v017NewClient,.v017-client-row')){setTimeout(fillConsentEditor,0);setTimeout(fillConsentEditor,90);}});
  }

  function ensureEntry(){
    const wrap=byId('v017ClientsWrap');if(!wrap)return false;if(byId('v02540EventsEntry')){updateEntrySummary();return true;}
    const card=document.createElement('section');card.id='v02540EventsEntry';card.innerHTML='<div class="copy"><span class="kicker">RELACIONAMENTO</span><strong>Eventos & Convites</strong><small id="v02540EventsSummary">Divulgue eventos para clientes que autorizaram convites.</small></div><button type="button" id="v02540OpenEvents">Abrir eventos</button>';
    const anchor=byId('v02520BirthdayCampaign')||byId('v025RelationshipEntry')||wrap.querySelector('.v017-client-actions')||wrap.firstElementChild;anchor?.insertAdjacentElement('afterend',card);byId('v02540OpenEvents')?.addEventListener('click',openEvents);updateEntrySummary();return true;
  }
  function updateEntrySummary(){const el=byId('v02540EventsSummary');if(!el)return;const n=clients().filter(c=>validPhone(c?.whatsappPhone)&&consentFor(c)).length,e=events().length;el.textContent=`${n} cliente${n===1?'':'s'} autorizado${n===1?'':'s'} • ${e} evento${e===1?'':'s'} cadastrado${e===1?'':'s'}.`;}

  function ensureSheet(){
    if(byId('v02540EventsWrap'))return;
    const wrap=document.createElement('div');wrap.id='v02540EventsWrap';wrap.className='sheet-wrap';wrap.innerHTML='<div class="sheet v02540-sheet"><div class="handle"></div><div class="v02540-head"><div><h3>Eventos & Convites</h3><span class="sub">Crie o evento, escolha o público e envie pelo WhatsApp com consentimento.</span></div><button type="button" class="v02540-iconbtn" id="v02540Close">×</button></div><div id="v02540Body"></div></div>';
    document.body.appendChild(wrap);wrap.addEventListener('click',e=>{if(e.target===wrap)wrap.classList.remove('open');});byId('v02540Close').onclick=()=>wrap.classList.remove('open');
  }
  function openEvents(){ensureSheet();activeEventId='';renderEventList();byId('v02540EventsWrap').classList.add('open');if(ready())refreshConsents();}
  function eventDateLabel(e){if(!e?.eventDate)return 'Data não informada';const [y,m,d]=String(e.eventDate).split('-');return y&&m&&d?`${d}/${m}/${y}${e.eventTime?` • ${e.eventTime}`:''}`:String(e.eventDate);}
  function renderEventList(){
    ensureSheet();const body=byId('v02540Body'),rows=events().slice().sort((a,b)=>String(b.eventDate||'').localeCompare(String(a.eventDate||''))||Number(b.updatedAt||0)-Number(a.updatedAt||0));
    body.innerHTML=`<div class="v02540-toolbar"><button type="button" id="v02540RefreshConsent">Atualizar autorizações</button><button type="button" class="primary" id="v02540NewEvent">+ Novo evento</button></div><div id="v02540EventList" class="v02540-list"></div>${sandbox()?'<div class="v02540-status warn">SANDBOX: criação e prévia estão liberadas, mas qualquer envio pelo WhatsApp permanece bloqueado.</div>':''}`;
    byId('v02540NewEvent').onclick=()=>editEvent();byId('v02540RefreshConsent').onclick=()=>refreshConsents();const list=byId('v02540EventList');
    if(!rows.length){list.innerHTML='<div class="v02540-empty">Nenhum evento cadastrado. Crie o primeiro convite para começar.</div>';return;}
    rows.forEach(e=>{const card=document.createElement('article');card.className='v02540-event-card';const sent=Number(e?.lastCampaign?.sent||0),failed=Number(e?.lastCampaign?.failed||0);card.innerHTML=`<div class="v02540-thumb">${e.imageDataUrl?`<img src="${e.imageDataUrl}" alt="">`:'🎉'}</div><div><strong>${esc(e.title||'Evento')}</strong><small>${esc(eventDateLabel(e))}</small><small>${sent||failed?`${sent} enviado${sent===1?'':'s'}${failed?` • ${failed} falha${failed===1?'':'s'}`:''}`:'Ainda não divulgado'}</small></div><button type="button" class="open">Abrir</button>`;card.querySelector('.open').onclick=()=>openEvent(e.id);list.appendChild(card);});
  }

  async function fileToCompressedDataUrl(file){
    if(!file)return'';if(!/^image\//i.test(file.type||''))throw new Error('Selecione uma imagem válida.');if(file.size>8*1024*1024)throw new Error('Imagem maior que 8 MB.');
    const raw=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result||''));r.onerror=()=>reject(new Error('Falha ao ler imagem.'));r.readAsDataURL(file);});
    const img=await new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(new Error('Imagem inválida.'));i.src=raw;});
    const maxW=900,maxH=1200,scale=Math.min(1,maxW/img.width,maxH/img.height),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.width*scale));canvas.height=Math.max(1,Math.round(img.height*scale));canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);
    let out='';for(const q of [.82,.72,.62,.52]){out=canvas.toDataURL('image/jpeg',q);if(out.length<900000)break;}if(out.length>1400000)throw new Error('Não foi possível compactar a imagem o suficiente.');return out;
  }
  function editEvent(id=''){
    const old=id?events().find(x=>String(x.id)===String(id)):null;activeEventId=id||'';const body=byId('v02540Body');
    body.innerHTML=`<div class="v02540-grid"><div class="v02540-field"><label>Título do evento</label><input id="v02540Title" maxlength="120" placeholder="Ex.: Degustação de Costela com Aipim"></div><div class="v02540-field"><label>Data</label><input id="v02540Date" type="date"></div><div class="v02540-field"><label>Horário</label><input id="v02540Time" type="time"></div><div class="v02540-field"><label>Chamada curta</label><input id="v02540Call" maxlength="180" placeholder="Ex.: Vem para o Rota 27!"></div></div><div class="v02540-field"><label>Descrição</label><textarea id="v02540Description" maxlength="500" placeholder="Conte em poucas palavras o que vai acontecer."></textarea></div><div class="v02540-image-pick"><strong>Imagem do convite — prévia</strong><input id="v02540Image" type="file" accept="image/*"><small class="v02540-footnote">A imagem é compactada e fica salva localmente para prévia. Nesta primeira versão, o template do WhatsApp é textual.</small><div class="v02540-preview ${old?.imageDataUrl?'show':''}" id="v02540ImagePreview">${old?.imageDataUrl?`<img src="${old.imageDataUrl}" alt="Prévia">`:''}</div></div><div class="v02540-actions"><button type="button" id="v02540BackList">Voltar</button><button type="button" class="primary" id="v02540SaveEvent">Salvar evento</button>${old?'<button type="button" class="danger" id="v02540DeleteEvent">Excluir evento</button><button type="button" id="v02540GoCampaign">Preparar divulgação</button>':''}</div>`;
    byId('v02540Title').value=old?.title||'';byId('v02540Date').value=old?.eventDate||'';byId('v02540Time').value=old?.eventTime||'';byId('v02540Call').value=old?.callToAction||'';byId('v02540Description').value=old?.description||'';
    let imageData=old?.imageDataUrl||'',imageName=old?.imageName||'';byId('v02540Image').onchange=async e=>{try{const f=e.target.files?.[0];if(!f)return;imageData=await fileToCompressedDataUrl(f);imageName=f.name||'convite.jpg';byId('v02540ImagePreview').classList.add('show');byId('v02540ImagePreview').innerHTML=`<img src="${imageData}" alt="Prévia">`;}catch(err){toast(err?.message||'Falha ao preparar imagem.');e.target.value='';}};
    byId('v02540BackList').onclick=renderEventList;byId('v02540SaveEvent').onclick=()=>{const title=clean(byId('v02540Title').value,120),eventDate=byId('v02540Date').value,eventTime=byId('v02540Time').value,callToAction=clean(byId('v02540Call').value,180),description=clean(byId('v02540Description').value,500);if(!title||!eventDate||!eventTime){toast('Informe título, data e horário do evento.');return;}const rows=events(),idx=old?rows.findIndex(x=>String(x.id)===String(old.id)):-1,next={...(old||{}),id:old?.id||uid(),title,eventDate,eventTime,callToAction,description,imageDataUrl:imageData,imageName,createdAt:Number(old?.createdAt||now()),updatedAt:now()};if(idx>=0)rows[idx]=next;else rows.unshift(next);saveEvents(rows);activeEventId=next.id;toast('Evento salvo.');openEvent(next.id);};
    if(old){byId('v02540DeleteEvent').onclick=()=>{if(!confirm(`Excluir o evento “${old.title}”?`))return;saveEvents(events().filter(x=>String(x.id)!==String(old.id)));renderEventList();};byId('v02540GoCampaign').onclick=()=>openEvent(old.id);}
  }

  function openEvent(id){const e=events().find(x=>String(x.id)===String(id));if(!e){renderEventList();return;}activeEventId=e.id;selectedClients=new Set(eligibleProfiles('all').map(p=>String(p.client.id)));lastStatus=null;renderCampaign(e);if(ready())refreshCampaignStatus();}
  function statusBadge(s){s=String(s||'').toUpperCase();if(s==='APPROVED')return'<span class="v02540-badge ok">Template aprovado</span>';if(s==='PENDING'||s==='IN_APPEAL')return'<span class="v02540-badge wait">Aguardando Meta</span>';if(s==='REJECTED'||s==='PAUSED'||s==='DISABLED'||s==='ERROR')return`<span class="v02540-badge bad">${esc(s)}</span>`;return'<span class="v02540-badge neutral">Template não enviado</span>';}
  function renderCampaign(e){
    const body=byId('v02540Body');body.innerHTML=`${e.imageDataUrl?`<div class="v02540-preview show"><img src="${e.imageDataUrl}" alt="Convite"></div>`:''}<div class="v02540-field"><label>Evento</label><div class="v02540-status"><strong>${esc(e.title)}</strong><br>${esc(eventDateLabel(e))}${e.description?`<br>${esc(e.description)}`:''}${e.callToAction?`<br><b>${esc(e.callToAction)}</b>`:''}</div></div><div class="v02540-segment"><div class="v02540-field"><label>Público</label><select id="v02540Segment"><option value="all">Todos autorizados</option><option value="recurring">Recorrentes — 2+ compras</option><option value="frequent">Frequentes — 5+ compras</option><option value="inactive30">Sem voltar há 30+ dias</option></select></div><button type="button" id="v02540RefreshStatus">Atualizar</button></div><div class="v02540-audience-actions"><button type="button" id="v02540SelectAll">Selecionar todos</button><button type="button" id="v02540SelectNone">Nenhum</button></div><div id="v02540Audience" class="v02540-audience"></div><div id="v02540TemplateStatus" class="v02540-status">Consultando situação do template…</div><div id="v02540CampaignStats" class="v02540-campaign-summary"></div>${sandbox()?'<div class="v02540-status warn">SANDBOX ativo: nenhuma campanha pode ser enviada.</div>':''}<small class="v02540-footnote">Somente clientes com autorização específica para convites/eventos podem ser selecionados. O consentimento transacional da comanda não é reutilizado.</small><div class="v02540-actions"><button type="button" id="v02540BackEvents">Voltar</button><button type="button" id="v02540EditEvent">Editar evento</button><button type="button" id="v02540SubmitTemplate">Solicitar template</button><button type="button" class="primary" id="v02540SendCampaign">Enviar convites</button></div>`;
    byId('v02540Segment').onchange=()=>{selectedClients=new Set(eligibleProfiles(byId('v02540Segment').value).map(p=>String(p.client.id)));renderAudience();refreshCampaignStatus();};byId('v02540SelectAll').onclick=()=>{selectedClients=new Set(eligibleProfiles(byId('v02540Segment').value).map(p=>String(p.client.id)));renderAudience();};byId('v02540SelectNone').onclick=()=>{selectedClients.clear();renderAudience();};byId('v02540RefreshStatus').onclick=refreshCampaignStatus;byId('v02540BackEvents').onclick=renderEventList;byId('v02540EditEvent').onclick=()=>editEvent(e.id);byId('v02540SubmitTemplate').onclick=submitTemplate;byId('v02540SendCampaign').onclick=sendCampaign;renderAudience();renderStatus();
  }
  function renderAudience(){const box=byId('v02540Audience');if(!box)return;const segment=byId('v02540Segment')?.value||'all',rows=eligibleProfiles(segment);if(!rows.length){box.innerHTML='<div class="v02540-empty">Nenhum cliente autorizado neste segmento.</div>';renderStatus();return;}box.innerHTML='';rows.forEach(p=>{const c=p.client,row=document.createElement('label');row.className='v02540-person';row.innerHTML=`<input type="checkbox" ${selectedClients.has(String(c.id))?'checked':''}><div><strong>${esc(c.name)}</strong><small>${esc(fmtPhone(c.whatsappPhone))} • ${p.visits} compra${p.visits===1?'':'s'}</small></div><span>autorizado</span>`;row.querySelector('input').onchange=ev=>{ev.target.checked?selectedClients.add(String(c.id)):selectedClients.delete(String(c.id));renderStatus();};box.appendChild(row);});renderStatus();}
  function renderStatus(){
    const stateEl=byId('v02540TemplateStatus'),stats=byId('v02540CampaignStats'),send=byId('v02540SendCampaign'),tpl=byId('v02540SubmitTemplate');if(!stateEl)return;const t=lastStatus?.template||{},c=lastStatus?.campaign||{};if(sandbox())stateEl.innerHTML='Sandbox ativo — consulta e envio ao WhatsApp estão bloqueados.';else if(!ready())stateEl.innerHTML='Sincronização ainda não está pronta neste aparelho.';else stateEl.innerHTML=`${statusBadge(t.status)}${lastStatus?.templateError?`<br>${esc(lastStatus.templateError)}`:''}`;
    if(stats)stats.innerHTML=`<div><b>${selectedClients.size}</b><span>selecionados</span></div><div><b>${Number(c.sent||0)}</b><span>enviados</span></div><div><b>${Number(c.failed||0)}</b><span>falhas</span></div>`;
    const approved=String(t.status||'').toUpperCase()==='APPROVED';if(send){send.disabled=sandbox()||!ready()||!approved||selectedClients.size===0||loading;send.textContent=approved?'Enviar convites':'Aguardar template';}if(tpl){tpl.disabled=sandbox()||!ready()||loading||approved||['PENDING','IN_APPEAL'].includes(String(t.status||'').toUpperCase());tpl.textContent=approved?'Template aprovado':String(t.status||'').toUpperCase()==='PENDING'?'Aguardando Meta':'Solicitar template';}
  }
  async function refreshCampaignStatus(){if(!activeEventId||sandbox()||!ready())return renderStatus();loading=true;renderStatus();try{lastStatus=await call('status',{eventId:activeEventId,targetClientIds:[...selectedClients]});}catch(err){lastStatus={template:{status:'ERROR'},templateError:err?.message||'Falha ao consultar campanha.',campaign:{}};}finally{loading=false;renderStatus();}}
  async function submitTemplate(){if(loading||sandbox())return;loading=true;renderStatus();try{const data=await call('submit_template');toast(data?.template?.existing?'Template de eventos já cadastrado na Meta.':'Template de eventos enviado para aprovação da Meta.');await refreshCampaignStatus();}catch(err){toast(err?.message||'Falha ao solicitar template.');}finally{loading=false;renderStatus();}}
  async function sendCampaign(){
    if(loading||sandbox()||!activeEventId)return;const e=events().find(x=>String(x.id)===String(activeEventId));if(!e||!selectedClients.size)return;if(!confirm(`Enviar agora o convite de “${e.title}” para ${selectedClients.size} cliente${selectedClients.size===1?'':'s'} autorizado${selectedClients.size===1?'':'s'}?\n\nO sistema não repetirá o mesmo convite para quem já recebeu.`))return;
    loading=true;renderStatus();try{const data=await call('send_campaign',{event:{id:e.id,title:e.title,eventDate:e.eventDate,eventTime:e.eventTime,description:e.description||'',callToAction:e.callToAction||''},targetClientIds:[...selectedClients],confirmMarketingConsent:true});const rows=events(),idx=rows.findIndex(x=>String(x.id)===String(e.id));if(idx>=0){rows[idx]={...rows[idx],lastCampaign:{sent:Number(data.sent||0),failed:Number(data.failed||0),skipped:Number(data.skipped||0),sentAt:now()},updatedAt:now()};saveEvents(rows);}toast(`${Number(data.sent||0)} convite(s) enviado(s)${Number(data.failed||0)?` • ${Number(data.failed)} falha(s)`:''}.`);await refreshCampaignStatus();}catch(err){toast(err?.message||'Falha no envio dos convites.');}finally{loading=false;renderStatus();}
  }

  function injectHelp(){const overlay=byId('r27HelpOverlay');if(!overlay||byId('v02540HelpTip'))return;const host=overlay.querySelector('.r27-help-body')||overlay.querySelector('.r27-help-content');if(!host)return;const tip=document.createElement('section');tip.id='v02540HelpTip';tip.innerHTML='<h3>Eventos & Convites</h3><p>Em Clientes, abra Eventos & Convites para cadastrar data, horário, chamada e imagem de prévia. Antes do envio, selecione apenas clientes que autorizaram especificamente receber convites e novidades. O consentimento da comanda não vale automaticamente para campanhas.</p>';host.appendChild(tip);}
  function start(){
    ensureConsentField();bindConsentEditor();ensureEntry();setTimeout(()=>{ensureEntry();ensureConsentField();fillConsentEditor();injectHelp();},350);document.addEventListener('click',e=>{if(e.target.closest?.('#v017ClientsBtn,[data-clients]'))setTimeout(()=>{ensureEntry();ensureConsentField();updateEntrySummary();},120);if(e.target.closest?.('#r27HelpBtn,[data-help]'))setTimeout(injectHelp,140);});if(ready())setTimeout(refreshConsents,1100);window.Rota27V02540Events={version:VERSION,open:openEvents,refreshConsents};console.info('[Rota27] v0.25.40 — Eventos & Convites carregado.');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
