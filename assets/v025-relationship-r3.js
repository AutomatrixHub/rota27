/* Rota 27 v0.25.0 — Relacionamento R3: preferido chegou */
(function(){
  'use strict';

  const VERSION='0.25.0';
  const RECENT_DAYS=7;
  const DAY=86400000;
  const PREVIEW_MODE=new URLSearchParams(location.search).get('preview')==='v0250';

  const byId=id=>document.getElementById(id);
  const base=()=>window.Rota27V025||null;
  const clientApi=()=>window.Rota27V017||null;

  function clean(v,max=180){return clientApi()?.clean?.(v,max)||String(v??'').trim().replace(/\s+/g,' ').slice(0,max)}
  function esc(v){return clientApi()?.esc?.(v)||String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))}
  function phone(v){return clientApi()?.normalizePhone?.(v)||String(v||'').replace(/\D/g,'')}
  function fmtQty(v){return Number(v||0).toLocaleString('pt-BR',{maximumFractionDigits:3})}
  function ageDays(ts){return Math.max(0,Math.floor((Date.now()-Number(ts||0))/DAY))}
  function ageText(ts){const d=ageDays(ts);return d===0?'hoje':d===1?'ontem':`há ${d} dias`}

  function realReceipts(){
    try{return Array.isArray(window.Rota27V022?.getReceipts?.())?window.Rota27V022.getReceipts():[]}catch{return []}
  }
  function stockConfig(productId){
    try{return window.Rota27V021?.getConfigs?.()?.[productId]||null}catch{return null}
  }
  function availableQty(productId){
    try{return Number(window.Rota27V021?.availableQty?.(productId)||0)}catch{return 0}
  }

  function demoArrivals(profiles){
    if(!PREVIEW_MODE)return [];
    const picks=profiles.filter(p=>p.visits>=2&&p.favoriteProducts?.[0]?.id&&phone(p.client?.whatsappPhone||'')).slice(0,3);
    return picks.map((p,i)=>({
      clientId:String(p.client.id),
      clientName:p.client.name,
      phone:phone(p.client.whatsappPhone),
      productId:String(p.favoriteProducts[0].id),
      productName:p.favoriteProducts[0].name,
      receiptId:`v025_demo_arrival_${i+1}`,
      receiptAt:Date.now()-(i+1)*DAY,
      available:8-i,
      visits:p.visits,
      lastVisit:p.lastVisit,
      preview:true
    }));
  }

  function latestReceiptItems(){
    const cutoff=Date.now()-RECENT_DAYS*DAY;
    const latest=new Map();
    realReceipts().forEach(r=>{
      const ts=Number(r?.createdAt||0);
      if(!ts||ts<cutoff)return;
      (Array.isArray(r?.items)?r.items:[]).forEach(item=>{
        const productId=String(item?.productId||'');
        const qty=Number(item?.qty||0);
        if(!productId||!(qty>0))return;
        const old=latest.get(productId);
        if(!old||ts>old.receiptAt)latest.set(productId,{
          productId,
          productName:clean(item?.productName||'',160),
          receiptId:String(r.id||''),
          receiptAt:ts,
          qtyReceived:qty,
          supplierName:clean(r?.supplierName||'',120)
        });
      });
    });
    return latest;
  }

  function opportunities(){
    const data=base()?.dataset?.();
    const profiles=Array.isArray(data?.profiles)?data.profiles:[];
    if(PREVIEW_MODE)return demoArrivals(profiles);
    const arrivals=latestReceiptItems();
    if(!arrivals.size)return [];
    const rows=[];
    profiles.forEach(p=>{
      if(Number(p?.visits||0)<2)return;
      const fav=p?.favoriteProducts?.[0];
      if(!fav?.id)return;
      const arrival=arrivals.get(String(fav.id));
      if(!arrival)return;
      if(Number(p.lastVisit||0)>=Number(arrival.receiptAt||0))return;
      const number=phone(p?.client?.whatsappPhone||'');
      if(!number)return;
      const cfg=stockConfig(arrival.productId);
      if(cfg?.enabled!==true)return;
      const available=availableQty(arrival.productId);
      if(!(available>0))return;
      rows.push({
        clientId:String(p.client.id),clientName:p.client.name,phone:number,
        productId:arrival.productId,productName:arrival.productName||fav.name,
        receiptId:arrival.receiptId,receiptAt:arrival.receiptAt,available,
        qtyReceived:arrival.qtyReceived,supplierName:arrival.supplierName,
        visits:Number(p.visits||0),lastVisit:Number(p.lastVisit||0),preview:false
      });
    });
    const seen=new Set();
    return rows.sort((a,b)=>b.receiptAt-a.receiptAt||b.visits-a.visits||String(a.clientName).localeCompare(String(b.clientName),'pt-BR')).filter(x=>{
      const key=`${x.clientId}|${x.productId}`;
      if(seen.has(key))return false;seen.add(key);return true;
    }).slice(0,20);
  }

  function messageFor(o){
    const first=clean(String(o.clientName||'Cliente').split(/\s+/)[0],70)||'Cliente';
    return `Oi, ${first}! Tudo bem? Recebemos ${o.productName} novamente na Rota 27 e lembrei de você, porque costuma escolher esse produto. Se fizer sentido, passa por aqui para dar uma olhada. Vai ser um prazer te receber!`;
  }

  function openWhatsapp(o){
    const message=messageFor(o);
    if(PREVIEW_MODE||o.preview){
      window.alert(`Modo demonstração — nenhum WhatsApp será aberto.\n\nMensagem sugerida:\n\n${message}`);
      return;
    }
    if(!o.phone)return;
    const a=document.createElement('a');
    a.href=`https://wa.me/${encodeURIComponent(o.phone)}?text=${encodeURIComponent(message)}`;
    a.target='_blank';a.rel='noopener noreferrer';document.body.appendChild(a);a.click();a.remove();
  }

  function rowHtml(o){
    const stock=`${fmtQty(o.available)} un. disponíveis`;
    return `<div class="v025-r3-row">
      <div class="v025-avatar">${esc(String(o.clientName||'?').slice(0,1).toLocaleUpperCase('pt-BR'))}</div>
      <div class="v025-r3-copy"><strong>${esc(o.clientName)}</strong><span>${esc(o.productName)}</span><small>Recebido ${esc(ageText(o.receiptAt))} • ${o.visits} visita${o.visits===1?'':'s'} • ${esc(stock)}</small></div>
      <div class="v025-r3-actions"><button type="button" data-profile="${esc(o.clientId)}">Ver perfil</button><button type="button" class="primary" data-r3-wa="${esc(o.clientId)}" data-r3-product="${esc(o.productId)}">WhatsApp</button></div>
    </div>`;
  }

  function panelHtml(rows,compact=false){
    const visible=compact?rows.slice(0,4):rows;
    return `<section class="v025-panel v025-r3-panel" id="v025R3Arrivals">
      <div class="v025-panel-head"><div><small>NOVIDADE ÚTIL</small><h4>Preferido chegou recentemente</h4></div><span class="v025-r3-count">${rows.length}</span></div>
      <p class="v025-r3-intro">O Rota 27 cruza recebimento real, preferência do cliente e estoque disponível. Só sugere quem ainda não voltou depois da chegada do produto.</p>
      <div class="v025-r3-list">${visible.map(rowHtml).join('')}</div>
      ${compact&&rows.length>visible.length?`<button type="button" class="v025-r3-more" data-r3-open-remember>Ver ${rows.length-visible.length} oportunidade${rows.length-visible.length===1?'':'s'} a mais</button>`:''}
      <div class="v025-r3-foot">Sugestão comercial, nunca envio automático. Confira o contexto antes de falar com o cliente.</div>
    </section>`;
  }

  function profileArrival(rows,clientId){return rows.find(x=>String(x.clientId)===String(clientId))||null}

  function augment(){
    const wrap=byId('v025RelationshipWrap');
    if(!wrap?.classList.contains('open'))return;
    const body=byId('v025Body');if(!body)return;
    body.querySelector('#v025R3Arrivals')?.remove();
    body.querySelector('#v025R3ProfileArrival')?.remove();
    const rows=opportunities();
    if(!rows.length)return;

    const profileButton=body.querySelector('[data-edit]');
    if(profileButton){
      const o=profileArrival(rows,profileButton.dataset.edit||'');
      if(!o)return;
      const contact=body.querySelector('.v025-contact');
      const section=document.createElement('section');
      section.id='v025R3ProfileArrival';section.className='v025-r3-profile';
      section.innerHTML=`<div><small>NOVIDADE RELEVANTE</small><strong>${esc(o.productName)} chegou recentemente</strong><p>Recebido ${esc(ageText(o.receiptAt))} • ${esc(fmtQty(o.available))} un. disponíveis. Este é o produto preferido identificado deste cliente e ele ainda não voltou depois do recebimento.</p></div><button type="button" data-r3-wa="${esc(o.clientId)}" data-r3-product="${esc(o.productId)}">Sugerir mensagem</button>`;
      if(contact)contact.insertAdjacentElement('beforebegin',section);else body.appendChild(section);
      return;
    }

    if(body.querySelector('.v025-remember-intro')){
      body.insertAdjacentHTML('beforeend',panelHtml(rows,false));
      return;
    }

    if(body.querySelector('.v025-metrics')&&body.querySelector('.v025-grid')){
      const grid=body.querySelector('.v025-grid');
      grid.insertAdjacentHTML('afterend',panelHtml(rows,true));
    }
  }

  function resolveOpportunity(btn){
    const cid=String(btn?.dataset?.r3Wa||''),pid=String(btn?.dataset?.r3Product||'');
    return opportunities().find(x=>String(x.clientId)===cid&&String(x.productId)===pid)||null;
  }

  function injectHelp(){
    const section=byId('r27-help-fidelizacao');
    const body=section?.querySelector('.r27-help-section-body');
    if(!body||body.querySelector('[data-v025-r3-help]'))return false;
    const box=document.createElement('div');box.dataset.v025R3Help='1';
    box.innerHTML='<h4>Quando um preferido chega novamente</h4><p>Se um produto foi recebido nos últimos 7 dias, ainda tem estoque controlado disponível e é o preferido de um cliente recorrente que ainda não voltou depois do recebimento, ele pode aparecer como <strong>Preferido chegou recentemente</strong>.</p><p>Esse sinal não cria campanha: o proprietário escolhe cliente por cliente. Se o estoque acabar, a oportunidade deixa de aparecer.</p><div class="r27-help-tip"><strong>Por que isso é útil:</strong> transforma um recebimento real em uma lembrança pessoal, sem disparo em massa e sem prometer promoção.</div>';
    body.appendChild(box);
    return true;
  }

  function schedule(){setTimeout(()=>{augment();injectHelp()},0)}

  function onClick(e){
    const wa=e.target.closest?.('[data-r3-wa]');
    if(wa){e.preventDefault();e.stopPropagation();const o=resolveOpportunity(wa);if(o)openWhatsapp(o);return;}
    if(e.target.closest?.('[data-r3-open-remember]')){
      e.preventDefault();const tab=byId('v025Tabs')?.querySelector('[data-view="remember"]');tab?.click();schedule();return;
    }
    if(e.target.closest?.('#v025OpenRelationship')||e.target.closest?.('#v025RelationshipWrap'))schedule();
    if(e.target.closest?.('[data-help]')||e.target.closest?.('#r27HelpBtn'))setTimeout(injectHelp,50);
  }

  function start(){
    document.addEventListener('click',onClick);
    window.addEventListener('rota27:v022-purchases-updated',schedule);
    window.addEventListener('rota27:v021-stock-updated',schedule);
    window.addEventListener('rota27:v017-domain-updated',schedule);
    window.addEventListener('storage',schedule);
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')schedule()});
    setTimeout(()=>{augment();injectHelp()},220);
    window.Rota27V025R3={version:VERSION,opportunities,refresh:schedule};
    console.info('[Rota27] v0.25.0 Relacionamento R3 carregado.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
