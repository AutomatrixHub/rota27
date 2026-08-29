/* Rota 27 v0.25.60 — classificação e ordenação inteligente de Clientes */
(function(){
  'use strict';
  const VERSION='0.25.60';
  let sortMode='name';
  const byId=id=>document.getElementById(id);
  const api=()=>window.Rota27V017||null;
  const rel=()=>window.Rota27V025||null;
  const clean=(v,max=240)=>api()?.clean?.(v,max)||String(v??'').replace(/[\u0000-\u001F\u007F]/g,' ').trim().replace(/\s+/g,' ').slice(0,max);
  const norm=v=>api()?.norm?.(v)||clean(v,500).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');
  const phone=v=>api()?.normalizePhone?.(v)||String(v||'').replace(/\D/g,'');
  const clients=()=>{try{return Array.isArray(api()?.clients?.())?api().clients():[];}catch{return[];}};

  function clientForRow(row){
    const copy=row.querySelector('.v017-client-copy'),name=clean(copy?.querySelector('strong')?.childNodes?.[0]?.textContent||copy?.querySelector('strong')?.textContent||'',120),rawPhone=copy?.querySelector('small')?.textContent||'';
    let client=null;try{if(phone(rawPhone))client=api()?.findClientByPhone?.(rawPhone)||null;}catch{}
    try{if(!client&&name)client=api()?.findClientByName?.(name)||null;}catch{}
    if(client)return client;const p=phone(rawPhone),n=norm(name);return clients().find(c=>(p&&phone(c?.whatsappPhone||'')===p)||(!p&&n&&norm(c?.name||'')===n))||null;
  }
  function profile(client){
    try{return rel()?.profileFor?.(client)||null;}catch{return null;}
  }
  function rawBirthDate(client){try{return window.Rota27V02517Birthday?.getBirthDate?.(client?.id)||client?.birthDate||'';}catch{return client?.birthDate||'';}}
  function birthParts(value){const raw=String(value||'').trim();let m=raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);if(m)return{m:+m[2],d:+m[3]};m=raw.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/);return m?{m:+m[2],d:+m[1]}:null;}
  function nextBirthdayDays(client){
    const p=birthParts(rawBirthDate(client));if(!p)return 9999;const now=new Date(),today=Date.UTC(now.getFullYear(),now.getMonth(),now.getDate());
    for(let y=now.getFullYear();y<=now.getFullYear()+2;y++){const d=new Date(Date.UTC(y,p.m-1,p.d));if(d.getUTCMonth()!==p.m-1||d.getUTCDate()!==p.d)continue;const ts=d.getTime();if(ts>=today)return Math.round((ts-today)/86400000);}return 9999;
  }
  function badgeHtml(p){
    if(!p)return'';const level=p.level||{key:'new',label:'Novo'};return `<span class="v02560-tier ${level.key}">${clean(level.label,40)}</span>${p.missing?'<span class="v02560-tier missing">Sumido</span>':''}`;
  }
  function decorateRow(row){
    const client=clientForRow(row);if(!client)return null;const p=profile(client);row.dataset.v02560ClientId=String(client.id||'');row.dataset.v02560Name=clean(client.name||'',180);row.dataset.v02560Visits=String(Number(p?.visits||0));row.dataset.v02560Total=String(Number(p?.total||0));row.dataset.v02560Last=String(Number(p?.lastVisit||0));row.dataset.v02560Birthday=String(nextBirthdayDays(client));
    const copy=row.querySelector('.v017-client-copy'),strong=copy?.querySelector('strong');if(strong){let badges=copy.querySelector('.v02560-levels');if(!badges){badges=document.createElement('span');badges.className='v02560-levels';strong.insertAdjacentElement('afterend',badges);}badges.innerHTML=badgeHtml(p);}
    return {row,client,p};
  }
  function compareRows(a,b){
    const A=a.dataset,B=b.dataset;
    if(sortMode==='last')return Number(B.v02560Last||0)-Number(A.v02560Last||0)||String(A.v02560Name||'').localeCompare(String(B.v02560Name||''),'pt-BR');
    if(sortMode==='frequency')return Number(B.v02560Visits||0)-Number(A.v02560Visits||0)||Number(B.v02560Total||0)-Number(A.v02560Total||0)||String(A.v02560Name||'').localeCompare(String(B.v02560Name||''),'pt-BR');
    if(sortMode==='birthday')return Number(A.v02560Birthday||9999)-Number(B.v02560Birthday||9999)||String(A.v02560Name||'').localeCompare(String(B.v02560Name||''),'pt-BR');
    return String(A.v02560Name||'').localeCompare(String(B.v02560Name||''),'pt-BR');
  }
  function ensureSortBar(){
    const wrap=byId('v017ClientsWrap'),toolbar=wrap?.querySelector('.v017-client-toolbar');if(!wrap||!toolbar)return null;let bar=byId('v02560ClientSortBar');
    if(!bar){bar=document.createElement('div');bar.id='v02560ClientSortBar';bar.className='v02560-sortbar';bar.innerHTML='<label><span>Ordenar clientes</span><select id="v02560ClientSort"><option value="name">Nome</option><option value="last">Última visita</option><option value="frequency">Mais frequentes</option><option value="birthday">Aniversário próximo</option></select></label>';toolbar.insertAdjacentElement('afterend',bar);byId('v02560ClientSort')?.addEventListener('change',e=>{sortMode=e.target.value||'name';refresh();});}
    const select=byId('v02560ClientSort');if(select&&select.value!==sortMode)select.value=sortMode;return bar;
  }
  function refresh(){
    ensureSortBar();const list=byId('v017ClientList');if(!list)return false;const rows=Array.from(list.querySelectorAll('.v017-client-row'));rows.forEach(decorateRow);rows.sort(compareRows).forEach(row=>list.appendChild(row));return true;
  }
  function settle(){[0,70,180,400].forEach(ms=>setTimeout(refresh,ms));}
  function start(){
    settle();document.addEventListener('click',e=>{if(e.target.closest?.('#v017ClientsBtn,#v017ClientsWrap button'))settle();});document.addEventListener('input',e=>{if(e.target?.id==='v017ClientSearch')settle();});
    window.addEventListener('rota27:v017-domain-updated',settle);window.addEventListener('rota27:v02517-birthday-updated',settle);window.addEventListener('storage',settle);
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&byId('v017ClientsWrap')?.classList.contains('open'))settle();});
    window.Rota27V02560ClientIntelligence={version:VERSION,refresh,setSort:mode=>{sortMode=mode||'name';refresh();},getSort:()=>sortMode};console.info('[Rota27] v0.25.60 — inteligência de Clientes ativa.');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
