/* Rota 27 v0.25.57 — aniversários próximos */
(function(){
  'use strict';
  const VERSION='0.25.57';
  const byId=id=>document.getElementById(id);
  const api=()=>window.Rota27V017||null;
  const clean=(v,max=240)=>api()?.clean?.(v,max)||String(v??'').replace(/[\u0000-\u001F\u007F]/g,' ').trim().replace(/\s+/g,' ').slice(0,max);
  const esc=v=>api()?.esc?.(v)||String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const clients=()=>{try{return Array.isArray(api()?.clients?.())?api().clients():[];}catch{return [];}};
  const icon='<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="4" y="5" width="16" height="15" rx="3"/><path d="M8 3v4M16 3v4M4 10h16"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01"/></svg>';

  function rawBirthDate(client){
    try{return window.Rota27V02517Birthday?.getBirthDate?.(client?.id)||client?.birthDate||'';}catch{return client?.birthDate||'';}
  }
  function parseBirth(value){
    const raw=String(value||'').trim();
    let m=raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if(m)return {month:Number(m[2]),day:Number(m[3]),year:Number(m[1])};
    m=raw.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/);
    if(m)return {month:Number(m[2]),day:Number(m[1]),year:Number(m[3])};
    return null;
  }
  function validDate(y,m,d){
    const x=new Date(Date.UTC(y,m-1,d));
    return x.getUTCFullYear()===y&&x.getUTCMonth()===m-1&&x.getUTCDate()===d;
  }
  function nextBirthday(client){
    const b=parseBirth(rawBirthDate(client));if(!b)return null;
    const now=new Date(),today=Date.UTC(now.getFullYear(),now.getMonth(),now.getDate());
    for(let add=0;add<=4;add++){
      const year=now.getFullYear()+add;
      if(!validDate(year,b.month,b.day))continue;
      const ts=Date.UTC(year,b.month-1,b.day);
      if(ts<today)continue;
      const days=Math.round((ts-today)/86400000);
      return {days,month:b.month,day:b.day,ts};
    }
    return null;
  }
  function labelDays(days){if(days===0)return'Hoje';if(days===1)return'Amanhã';return`Em ${days} dias`;}
  function dateLabel(item){return `${String(item.day).padStart(2,'0')}/${String(item.month).padStart(2,'0')}`;}
  function upcoming(){
    return clients().map(client=>({client,next:nextBirthday(client)})).filter(x=>x.next&&x.next.days<=7).sort((a,b)=>a.next.days-b.next.days||clean(a.client?.name).localeCompare(clean(b.client?.name),'pt-BR'));
  }
  function anchorFor(card){
    const campaign=byId('v02520BirthdayCampaign');if(campaign)return campaign;
    const relationship=byId('v025RelationshipEntry');if(relationship)return relationship;
    const wrap=byId('v017ClientsWrap');return wrap?.querySelector('.v017-client-actions')||wrap?.firstElementChild||null;
  }
  function ensureCard(){
    const wrap=byId('v017ClientsWrap');if(!wrap)return null;
    let card=byId('v02557UpcomingBirthdays');
    if(!card){card=document.createElement('section');card.id='v02557UpcomingBirthdays';}
    const anchor=anchorFor(card);
    if(anchor&&card.previousElementSibling!==anchor)anchor.insertAdjacentElement('afterend',card);
    return card;
  }
  function render(){
    const card=ensureCard();if(!card)return false;
    const rows=upcoming(),today=rows.filter(x=>x.next.days===0),next7=rows.filter(x=>x.next.days>0&&x.next.days<=7);
    const shown=rows.slice(0,5);
    card.innerHTML=`<div class="v02557-head"><div class="v02557-head-copy"><span class="v02557-kicker">RELACIONAMENTO</span><strong class="v02557-title">Aniversários próximos</strong><small class="v02557-subtitle">Usa as datas já cadastradas. Nenhuma mensagem é enviada automaticamente.</small></div><span class="v02557-icon">${icon}</span></div><div class="v02557-counts"><div class="v02557-count"><b>${today.length}</b><span>aniversário${today.length===1?'':'s'} hoje</span></div><div class="v02557-count"><b>${next7.length}</b><span>nos próximos 7 dias</span></div></div>${shown.length?`<div class="v02557-list">${shown.map(({client,next})=>`<button type="button" class="v02557-person" data-client-name="${esc(clean(client?.name,120))}"><span class="v02557-person-copy"><strong>${esc(clean(client?.name||'Cliente',120))}</strong><small>${dateLabel(next)}</small></span><span class="v02557-when">${labelDays(next.days)}</span></button>`).join('')}</div>`:`<div class="v02557-empty">Nenhum aniversário cadastrado para hoje ou para os próximos 7 dias.</div>`}`;
    return true;
  }
  function focusClient(name){
    const input=byId('v017ClientSearch');if(!input)return;
    input.value=clean(name,120);input.dispatchEvent(new Event('input',{bubbles:true}));
    setTimeout(()=>byId('v017ClientList')?.querySelector('.v017-client-row')?.scrollIntoView({behavior:'smooth',block:'center'}),90);
  }
  function settle(){[0,90,260].forEach(ms=>setTimeout(render,ms));}
  function start(){
    settle();
    document.addEventListener('click',event=>{
      const person=event.target.closest?.('#v02557UpcomingBirthdays .v02557-person');
      if(person){focusClient(person.dataset.clientName||'');return;}
      if(event.target.closest?.('#v017ClientsBtn,[data-clients],#v017ClientsWrap button'))settle();
    });
    window.addEventListener('rota27:v017-domain-updated',settle);
    window.addEventListener('rota27:v02517-birthday-updated',settle);
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&byId('v017ClientsWrap')?.classList.contains('open'))settle();});
    window.Rota27V02557UpcomingBirthdays={version:VERSION,refresh:render,getUpcoming:upcoming};
    console.info('[Rota27] v0.25.57 — aniversários próximos ativo.');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
