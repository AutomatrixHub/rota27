/* Rota 27 v0.25.44 — cartões de clientes com informações úteis */
(function(){
  'use strict';

  const VERSION='0.25.44';
  const DAY=86400000;
  const byId=id=>document.getElementById(id);
  const api=()=>window.Rota27V017||null;

  const ICONS={
    calendar:'<rect x="4" y="5" width="16" height="15" rx="3"/><path d="M8 3v4M16 3v4M4 10h16"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01"/>',
    bag:'<path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    user:'<circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/>',
    message:'<path d="M5 6.5A8 8 0 0 1 19 12a7.7 7.7 0 0 1-7.7 7.5A8.5 8.5 0 0 1 7 18.4L3.5 20l1.2-3.7A7.2 7.2 0 0 1 5 6.5Z"/><path d="M8.5 9.5c.7 2.6 2.4 4.3 5 5"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'
  };

  function svg(key){return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONS[key]||ICONS.calendar}</svg>`;}
  function clean(v,max=240){return api()?.clean?.(v,max)||String(v??'').replace(/[\u0000-\u001F\u007F]/g,' ').trim().replace(/\s+/g,' ').slice(0,max);}
  function norm(v){return api()?.norm?.(v)||clean(v,500).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');}
  function esc(v){return api()?.esc?.(v)||String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
  function phone(v){return api()?.normalizePhone?.(v)||String(v||'').replace(/\D/g,'');}
  function validPhone(v){try{return api()?.validPhone?.(v)===true;}catch{return phone(v).length>=12&&phone(v).length<=15;}}
  function moneyValue(v){try{return typeof money==='function'?money(Number(v||0)):Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}catch{return 'R$ 0,00';}}
  function appState(){try{return typeof state!=='undefined'&&state?state:null;}catch{return null;}}
  function history(){return (Array.isArray(appState()?.history)?appState().history:[]).filter(c=>c?.cancelled!==true);}
  function dateTs(c){return Number(c?.closedAt||c?.updatedAt||c?.createdAt||0);}
  function dateText(ts){
    if(!Number(ts))return '—';
    const d=new Date(Number(ts));
    if(Number.isNaN(d.getTime()))return '—';
    return d.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric'});
  }
  function isoDateText(value){
    const raw=String(value||'').trim(),m=raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return m?`${m[3]}/${m[2]}/${m[1]}`:'';
  }
  function daysSince(ts){
    if(!Number(ts))return null;
    const a=new Date(Number(ts)),b=new Date();
    if(Number.isNaN(a.getTime()))return null;
    a.setHours(0,0,0,0);b.setHours(0,0,0,0);
    return Math.max(0,Math.floor((b-a)/DAY));
  }
  function relativeVisit(ts){
    const d=daysSince(ts);
    if(d===null)return 'Sem visita registrada';
    if(d===0)return 'Última visita: hoje';
    if(d===1)return 'Última visita: ontem';
    if(d<30)return `Última visita: há ${d} dias`;
    if(d<60)return 'Última visita: há cerca de 1 mês';
    return `Última visita: há cerca de ${Math.floor(d/30)} meses`;
  }
  function commandTotalValue(c){
    if(c?.total!==undefined&&c?.total!==null&&Number.isFinite(Number(c.total)))return Number(c.total);
    try{if(typeof commandTotal==='function')return Number(commandTotal(c)||0);}catch{}
    return 0;
  }
  function matchesClient(command,client){
    const p=phone(client?.whatsappPhone||''),cp=phone(command?.whatsappPhone||'');
    if(p)return cp===p;
    const n=norm(client?.name||'');
    return !!n&&!cp&&norm(command?.customer||'')===n;
  }
  function statsFor(client){
    const rows=history().filter(c=>matchesClient(c,client)).sort((a,b)=>dateTs(a)-dateTs(b));
    const total=rows.reduce((sum,c)=>sum+commandTotalValue(c),0);
    const firstPurchase=rows.length?dateTs(rows[0]):0;
    const lastPurchase=rows.length?dateTs(rows[rows.length-1]):0;
    const firstSeen=Number(client?.firstSeenAt||0);
    const knownDates=[firstSeen,firstPurchase].filter(n=>Number(n)>0);
    const clientSince=knownDates.length?Math.min(...knownDates):0;
    return {closed:rows.length,total,lastPurchase,clientSince};
  }
  function birthdayFor(client){
    let raw='';
    try{raw=window.Rota27V02517Birthday?.getBirthDate?.(client?.id)||client?.birthDate||'';}catch{raw=client?.birthDate||'';}
    let formatted='';
    try{formatted=window.Rota27V02517Birthday?.formatBirthDate?.(raw)||'';}catch{}
    return formatted||isoDateText(raw)||'';
  }
  function clientFromRow(row){
    const copy=row.querySelector('.v017-client-copy');
    const name=clean(copy?.querySelector('strong')?.textContent||'',120);
    const rawPhone=copy?.querySelector('small')?.textContent||'';
    let client=null;
    try{client=phone(rawPhone)?api()?.findClientByPhone?.(rawPhone):null;}catch{}
    try{if(!client&&name)client=api()?.findClientByName?.(name)||null;}catch{}
    if(client)return client;
    const rows=Array.isArray(api()?.clients?.())?api().clients():[];
    const p=phone(rawPhone),n=norm(name);
    return rows.find(c=>(p&&phone(c?.whatsappPhone||'')===p)||(!p&&n&&norm(c?.name||'')===n))||null;
  }
  function info(icon,label,value,missing=false){
    return `<div class="v02544-client-info${missing?' is-missing':''}"><span class="v02544-client-info-icon">${svg(icon)}</span><span class="v02544-client-info-copy"><small>${esc(label)}</small><strong>${esc(value)}</strong></span></div>`;
  }
  function whatsappBadge(client){
    const ok=validPhone(client?.whatsappPhone||'');
    const badge=document.createElement('span');
    badge.className=`v02544-wa-badge${ok?' is-ok':' is-missing'}`;
    badge.innerHTML=`${svg('message')}<span>${ok?'WhatsApp':'Sem WhatsApp'}</span>`;
    return badge;
  }
  function decorateRow(row){
    const client=clientFromRow(row);if(!client)return false;
    const copy=row.querySelector('.v017-client-copy');if(!copy)return false;
    row.classList.add('v02544-client-row');
    const phoneLine=copy.querySelector('small');
    const originalSummary=Array.from(copy.children).find(el=>el.tagName==='SPAN'&&!el.classList.contains('v02544-wa-badge'));
    if(originalSummary)originalSummary.classList.add('v02544-original-summary');
    copy.querySelector('.v02544-wa-badge')?.remove();
    if(phoneLine)phoneLine.insertAdjacentElement('afterend',whatsappBadge(client));
    row.querySelector('.v02544-client-details')?.remove();

    const st=statsFor(client);
    const birth=birthdayFor(client);
    const details=document.createElement('div');
    details.className='v02544-client-details';
    details.innerHTML=`<div class="v02544-client-info-grid">${info('calendar','Nascimento',birth||'Não informado',!birth)}${info('bag','Última compra',st.lastPurchase?dateText(st.lastPurchase):'Sem compra',!st.lastPurchase)}${info('user','Cliente desde',st.clientSince?dateText(st.clientSince):'Sem data',!st.clientSince)}</div><div class="v02544-client-footer"><span class="v02544-client-purchases">${st.closed} compra${st.closed===1?'':'s'} <i>•</i> ${esc(moneyValue(st.total))}</span><span class="v02544-last-visit">${svg('clock')}<span>${esc(relativeVisit(st.lastPurchase))}</span></span></div>`;
    row.appendChild(details);
    return true;
  }
  function decorateRows(){
    const list=byId('v017ClientList');if(!list)return false;
    let changed=false;
    list.querySelectorAll('.v017-client-row').forEach(row=>{if(decorateRow(row))changed=true;});
    return changed;
  }
  function settle(){[0,70,180,420].forEach(ms=>setTimeout(decorateRows,ms));}
  function start(){
    settle();
    document.addEventListener('click',event=>{
      if(event.target.closest?.('#v017ClientsBtn,#v017ClientsWrap button'))settle();
    });
    document.addEventListener('input',event=>{if(event.target?.id==='v017ClientSearch')settle();});
    window.addEventListener('rota27:v017-domain-updated',settle);
    window.addEventListener('rota27:v02517-birthday-updated',settle);
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&byId('v017ClientsWrap')?.classList.contains('open'))settle();});
    window.Rota27V02544ClientCards={version:VERSION,refresh:decorateRows};
    console.info('[Rota27] v0.25.44 — cartões de clientes enriquecidos.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
