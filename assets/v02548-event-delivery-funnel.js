/* Rota 27 v0.25.48 — funil real de entrega dos convites */
(function(){
  'use strict';
  const VERSION='0.25.48';
  const EVENTS_KEY='rota27_v02540_events_v1';
  const SYNC_CONFIG_KEY='rota27_sync_config_v1';
  const SANDBOX_KEY='rota27_v02538_sandbox_v1';
  let activeEventId='',detailsOpen=false,loading=false,lastData=null;
  const byId=id=>document.getElementById(id);
  const esc=v=>typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  function readJson(key,fallback){try{const v=JSON.parse(localStorage.getItem(key)||'null');return v==null?fallback:v;}catch{return fallback;}}
  function events(){const v=readJson(EVENTS_KEY,[]);return Array.isArray(v)?v:[];}
  function cfg(){return readJson(SYNC_CONFIG_KEY,{});}
  function sandbox(){if(new URLSearchParams(location.search).get('sandbox')==='1')return true;return readJson(SANDBOX_KEY,{})?.enabled===true;}
  function url(){const c=cfg(),u=String(c.functionUrl||'').replace(/\/+$/,'');return /\/rota27-sync$/i.test(u)?u.replace(/\/rota27-sync$/i,'/rota27-event-delivery-status'):'';}
  function ready(){const c=cfg();return !sandbox()&&c.enabled===true&&c.initialized===true&&String(c.deviceToken||'').length>=16&&!!url();}
  function sortedEvents(){return events().slice().sort((a,b)=>String(b.eventDate||'').localeCompare(String(a.eventDate||''))||Number(b.updatedAt||0)-Number(a.updatedAt||0));}
  async function call(eventId){
    if(!ready())throw new Error(sandbox()?'Sandbox ativo: status real não consulta produção.':'Sincronização não está pronta neste aparelho.');
    const c=cfg(),ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),15000);
    try{
      const r=await fetch(url(),{method:'POST',headers:{'content-type':'application/json','x-rota27-device-token':c.deviceToken},body:JSON.stringify({eventId}),signal:ctrl.signal});
      const data=await r.json().catch(()=>({}));if(!r.ok||data.ok!==true)throw new Error(data.error||`HTTP ${r.status}`);return data;
    }finally{clearTimeout(timer);}
  }
  function decorateCards(){
    const cards=[...document.querySelectorAll('#v02540EventList .v02540-event-card')],rows=sortedEvents();
    cards.forEach((card,i)=>{if(rows[i]?.id)card.dataset.v02548EventId=String(rows[i].id);const thumb=card.querySelector('.v02540-thumb');if(thumb&&!thumb.querySelector('img')&&!thumb.querySelector('svg'))thumb.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" style="width:25px;height:25px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round"><path d="M4 9h16v11H4z"/><path d="M7 9V6h10v3M8 3v4M16 3v4M4 13h16"/></svg>';});
  }
  function deriveActiveId(){
    if(activeEventId&&events().some(e=>String(e.id)===String(activeEventId)))return activeEventId;
    const strong=document.querySelector('#v02540Body .v02540-field .v02540-status strong');
    const title=String(strong?.textContent||'').trim();if(!title)return'';
    const matches=events().filter(e=>String(e.title||'').trim()===title);if(matches.length===1){activeEventId=String(matches[0].id);return activeEventId;}return'';
  }
  function ensure(){
    const stats=byId('v02540CampaignStats');if(!stats)return null;
    let host=byId('v02548DeliveryFunnel');
    if(!host){host=document.createElement('section');host.id='v02548DeliveryFunnel';stats.insertAdjacentElement('afterend',host);}
    return host;
  }
  function labelStatus(s){return({read:'Lido',delivered:'Entregue',sent:'Enviado',accepted_meta:'Aceito Meta',failed:'Falhou',processing:'Processando'})[s]||'Pendente';}
  function renderRows(rows){
    if(!detailsOpen)return'';
    return `<div class="v02548-details">${(rows||[]).map(r=>{const status=String(r.deliveryStatus||'').toLowerCase(),err=r.error||{},msg=[err.code?`Código ${err.code}`:'',err.title||'',err.message||r.lastError||'',err.details||''].filter(Boolean).join(' • ');return `<div class="v02548-recipient"><div><strong>${esc(r.customerName||'Cliente')}</strong><small>${esc(r.phone||'')}${msg?`<br>${esc(msg)}`:''}</small></div><span class="v02548-status ${esc(status)}">${esc(labelStatus(status))}</span></div>`;}).join('')}</div>`;
  }
  function render(data=lastData,error=''){
    const host=ensure();if(!host)return false;host.hidden=false;
    if(sandbox()){host.innerHTML='<div class="v02548-head"><div><strong>Entrega dos convites</strong><small>Sandbox não consulta mensagens reais.</small></div></div>';return true;}
    if(error){host.innerHTML=`<div class="v02548-head"><div><strong>Entrega dos convites</strong><small>Não foi possível atualizar agora.</small></div><button type="button" class="v02548-refresh" id="v02548RefreshDelivery">Tentar novamente</button></div><div class="v02548-note bad">${esc(error)}</div>`;bindHost();return true;}
    if(!data){host.innerHTML='<div class="v02548-head"><div><strong>Entrega dos convites</strong><small>Carregando status real da Meta…</small></div></div>';return true;}
    const c=data.counts||{},rows=Array.isArray(data.rows)?data.rows:[],failed=Number(c.failed||0),awaiting=Number(c.awaitingCallback||0);
    const metrics=[['Registrados',c.registered,''],['Aceitos Meta',c.acceptedMeta,''],['Enviados',c.sent,''],['Entregues',c.delivered,'good'],['Lidos',c.read,'good'],['Falharam',c.failed,failed?'bad':'']];
    let note='';if(failed)note=`<div class="v02548-note bad">${failed} convite${failed===1?'':'s'} com falha confirmada. Abra os detalhes para ver o motivo retornado.</div>`;else if(awaiting)note=`<div class="v02548-note">${awaiting} convite${awaiting===1?'':'s'} aceito${awaiting===1?'':'s'} pela Meta ainda sem callback de envio. Aceite não comprova entrega.</div>`;else if(Number(c.read||0))note='<div class="v02548-note">Leitura confirmada implica que a mensagem também foi entregue.</div>';
    host.innerHTML=`<div class="v02548-head"><div><strong>Entrega dos convites</strong><small>Status real dos callbacks da Meta. “Aceito Meta” não significa entregue.</small></div><button type="button" class="v02548-refresh" id="v02548RefreshDelivery" ${loading?'disabled':''}>${loading?'Atualizando…':'Atualizar entrega'}</button></div><div class="v02548-grid">${metrics.map(([label,value,cls])=>`<div class="v02548-metric ${cls}"><b>${Number(value||0)}</b><span>${esc(label)}</span></div>`).join('')}</div>${note}${rows.length?`<button type="button" class="v02548-details-toggle" id="v02548ToggleDetails">${detailsOpen?'Ocultar detalhes':'Ver detalhes por cliente'}</button>${renderRows(rows)}`:''}`;
    bindHost();return true;
  }
  function bindHost(){byId('v02548RefreshDelivery')?.addEventListener('click',()=>refresh(true),{once:true});byId('v02548ToggleDetails')?.addEventListener('click',()=>{detailsOpen=!detailsOpen;render();},{once:true});}
  async function refresh(force=false){
    const id=deriveActiveId();if(!id)return false;if(loading&&!force)return false;loading=true;render(lastData);
    try{lastData=await call(id);render(lastData);}catch(err){render(lastData,err?.message||'Falha ao consultar entrega.');}finally{loading=false;if(lastData)render(lastData);}return true;
  }
  function settleList(){[0,80,180].forEach(ms=>setTimeout(decorateCards,ms));}
  function settleCampaign(refreshRemote=true){[0,80,180].forEach(ms=>setTimeout(()=>{if(ensure()&&refreshRemote&&ms===80)refresh();else if(ensure()&&lastData)render(lastData);},ms));}
  function handleClick(e){
    const card=e.target.closest?.('.v02540-event-card');if(card?.dataset.v02548EventId&&e.target.closest?.('.open')){activeEventId=card.dataset.v02548EventId;lastData=null;detailsOpen=false;settleCampaign(true);return;}
    if(e.target.closest?.('#v02540OpenEvents,#v02540BackEvents,#v02540BackList')){settleList();return;}
    if(e.target.closest?.('#v02540RefreshStatus'))setTimeout(()=>refresh(true),150);
    if(e.target.closest?.('#v02540SendCampaign')){setTimeout(()=>refresh(true),1800);setTimeout(()=>refresh(true),5500);}
  }
  function start(){document.addEventListener('click',handleClick);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){settleList();if(ensure())refresh();}});settleList();window.Rota27V02548Delivery={version:VERSION,refresh,decorateCards};console.info('[Rota27] v0.25.48 — funil real de entrega dos eventos carregado.');}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
