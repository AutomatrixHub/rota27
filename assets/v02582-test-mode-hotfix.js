/* Rota 27 v0.25.82 — hotfix Modo Teste: rolagem + Fila */
(function(){
  'use strict';
  if(window.Rota27V02582TestHotfix)return;

  const VERSION='0.25.82';
  const HTML_SCROLL_CLASS='v02582-test-scroll';

  const byId=id=>document.getElementById(id);
  const clean=(v,max=180)=>String(v??'').replace(/[\u0000-\u001f\u007f]/g,' ').trim().replace(/\s+/g,' ').slice(0,max);
  const esc=v=>typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const active=()=>window.Rota27V02581TestMode?.isActive?.()===true||document.body.classList.contains('v02581-test-mode');
  const commands=()=>{try{return Array.isArray(state?.commands)?state.commands.filter(c=>c?.cancelled!==true):[];}catch{return Array.isArray(window.state?.commands)?window.state.commands.filter(c=>c?.cancelled!==true):[];}};
  const itemCount=c=>{try{return Number(typeof commandItems==='function'?commandItems(c):Object.values(c?.items||{}).reduce((s,q)=>s+Math.max(0,Number(q||0)),0))||0;}catch{return 0;}};
  const total=c=>{try{return Number(typeof commandTotal==='function'?commandTotal(c):c?.total||0)||0;}catch{return Number(c?.total||0)||0;}};
  const moneyValue=v=>{try{return typeof money==='function'?money(Number(v||0)):Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}catch{return 'R$ 0,00';}};
  const elapsedValue=v=>{try{return typeof elapsed==='function'?elapsed(Number(v||0)):'';}catch{return '';}};

  function syncScrollClass(){
    document.documentElement.classList.toggle(HTML_SCROLL_CLASS,active());
  }

  function renderQueueFromState(){
    if(!active())return false;
    const list=byId('commandList');
    if(!list)return false;
    const rows=commands().slice().sort((a,b)=>Number(b.updatedAt||0)-Number(a.updatedAt||0));
    const openCount=byId('openCount'),openTotal=byId('openTotal'),openItems=byId('openItems'),empty=byId('commandsEmpty');
    if(openCount)openCount.textContent=String(rows.length);
    if(openTotal)openTotal.textContent=moneyValue(rows.reduce((s,c)=>s+total(c),0));
    if(openItems)openItems.textContent=String(rows.reduce((s,c)=>s+itemCount(c),0));
    if(empty)empty.style.display=rows.length?'none':'block';

    list.innerHTML='';
    rows.forEach(c=>{
      const customer=clean(c?.customer,120);
      const location=clean(c?.table,120);
      const primary=customer||location||'Comanda';
      const count=itemCount(c);
      const opened=elapsedValue(c?.createdAt||c?.openedAt);
      const updated=elapsedValue(c?.updatedAt||c?.createdAt);
      const card=document.createElement('article');
      card.className='command-card v017-command-card';
      card.dataset.v02582TestCommand=String(c?.id||'');
      card.innerHTML=`<div class="v017-command-primary"><h3 class="command-title">${esc(primary)}</h3></div><div class="v017-command-info"><div class="v017-command-copy">${customer&&location?`<div class="v017-command-location">${esc(location)}</div>`:''}<div class="command-sub">${count} ${count===1?'item':'itens'}${opened?` • aberta há ${esc(opened)}`:''}</div></div><div class="money">${esc(moneyValue(total(c)))}</div></div><div class="command-bottom"><span class="meta">${updated?`Último lançamento: ${esc(updated)}`:'Toque para abrir'}</span><button class="open-btn" type="button">Abrir →</button></div>`;
      card.addEventListener('click',()=>{try{if(typeof openCommand==='function')openCommand(c.id);else if(typeof window.openCommand==='function')window.openCommand(c.id);}catch{}});
      list.appendChild(card);
    });
    try{window.Rota27V02545CommandList?.compactListCards?.();}catch{}
    return true;
  }

  function repairQueue(){
    if(!active())return false;
    try{if(typeof window.renderCommands==='function')window.renderCommands();}catch(err){console.warn('[Rota27 v0.25.82] renderCommands legado:',err);}
    const expected=commands().length;
    const list=byId('commandList');
    const rendered=list?list.querySelectorAll('.command-card').length:0;
    if(expected!==rendered||expected&&rendered===0)renderQueueFromState();
    try{window.Rota27V0252?.renderMap?.();}catch{}
    return true;
  }

  function settle(){
    syncScrollClass();
    if(!active())return;
    repairQueue();
  }

  function schedule(){
    [0,60,220].forEach(ms=>setTimeout(settle,ms));
  }

  function handleClick(event){
    if(event.target.closest?.('#navCommands,[data-v0252-view="list"],[data-v0252-view="map"]'))schedule();
  }

  function start(){
    syncScrollClass();
    document.addEventListener('click',handleClick);
    window.addEventListener('rota27:test-mode-changed',schedule);
    window.addEventListener('rota27:v017-domain-updated',()=>{if(active())schedule();});
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')schedule();});
    schedule();
    window.Rota27V02582TestHotfix={version:VERSION,refresh:schedule,repairQueue,renderQueueFromState,syncScrollClass};
    console.info('[Rota27] v0.25.82 — hotfix de rolagem e Fila do Modo Teste carregada.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
