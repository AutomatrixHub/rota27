/* Rota 27 v0.15 DEV.4 — Painel operacional e navegação sem redundância */
(function(){
  'use strict';

  const VERSION='0.15-dev.4';
  const SYNC_CONFIG_KEY='rota27_sync_config_v1';
  let baseShowScreen=null;
  let refreshTimer=null;

  function byId(id){return document.getElementById(id);}
  function esc(value){
    if(typeof escapeHtml==='function')return escapeHtml(String(value??''));
    return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }
  function moneyValue(value){
    if(typeof money==='function')return money(Number(value||0));
    return Number(value||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  }
  function commandTotalValue(command){
    if(typeof commandTotal==='function')return Number(commandTotal(command)||0);
    const catalog=new Map((state?.catalog||[]).map(p=>[String(p.id),p]));
    return Object.entries(command?.items||{}).reduce((sum,[id,qty])=>{
      const meta=command?.itemMeta?.[id]||catalog.get(String(id))||{};
      return sum+Number(qty||0)*Number(meta.price||0);
    },0);
  }
  function commandUnits(command){
    return Object.values(command?.items||{}).reduce((sum,qty)=>sum+Math.max(0,Number(qty||0)),0);
  }
  function startOfToday(){const d=new Date();d.setHours(0,0,0,0);return d.getTime();}
  function todayHistory(){return (state?.history||[]).filter(h=>Number(h.closedAt||0)>=startOfToday());}
  function readSync(){
    try{return JSON.parse(localStorage.getItem(SYNC_CONFIG_KEY)||'{}')||{};}catch{return {};}
  }
  function fmtSyncTime(ts){
    if(!Number(ts))return 'Nunca';
    const d=new Date(Number(ts));
    if(Number.isNaN(d.getTime()))return '—';
    return d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
  }
  function metric(label,value,hint){
    return '<div class="v15d4-metric"><small>'+esc(label)+'</small><strong>'+esc(value)+'</strong><span>'+esc(hint||'')+'</span></div>';
  }
  function statusCard(cls,title,value,detail){
    return '<div class="v15d4-status '+cls+'"><div class="v15d4-status-dot"></div><div><small>'+esc(title)+'</small><strong>'+esc(value)+'</strong><span>'+esc(detail)+'</span></div></div>';
  }

  function ensurePanel(){
    let screen=byId('screenPanel');
    if(screen)return screen;
    const main=document.querySelector('main');
    if(!main)return null;
    screen=document.createElement('section');
    screen.id='screenPanel';
    screen.className='screen v15d4-panel';
    main.appendChild(screen);
    return screen;
  }

  function configureNav(){
    const nav=byId('navNew');
    if(!nav)return null;
    nav.id='navPanel';
    nav.removeAttribute('onclick');
    nav.setAttribute('aria-label','Painel');
    nav.innerHTML='<span class="navicon" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></svg></span><span class="navlabel">Painel</span>';
    nav.addEventListener('click',()=>showPanel());
    return nav;
  }

  function renderPanel(){
    const screen=ensurePanel();
    if(!screen)return;
    const commands=Array.isArray(state?.commands)?state.commands:[];
    const openTotal=commands.reduce((sum,c)=>sum+commandTotalValue(c),0);
    const openUnits=commands.reduce((sum,c)=>sum+commandUnits(c),0);
    const closed=todayHistory();
    const revenue=closed.reduce((sum,c)=>sum+commandTotalValue(c),0);
    const soldUnits=closed.reduce((sum,c)=>sum+commandUnits(c),0);
    const avg=closed.length?revenue/closed.length:0;
    const sync=readSync();
    const syncReady=sync.enabled===true&&sync.initialized===true;
    const pending=Array.isArray(sync.outbox)?sync.outbox.length:0;
    const conflicts=Array.isArray(sync.conflicts)?sync.conflicts.length:0;
    const devices=Array.isArray(sync.devices)?sync.devices.length:0;
    const waReady=typeof isWhatsappConfigured==='function'?Boolean(isWhatsappConfigured()):false;
    const online=navigator.onLine;

    screen.innerHTML=`
      <div class="section-head v15d4-head">
        <div><h2>Painel</h2><p>Visão rápida da operação de hoje.</p></div>
        <span class="badge">${esc(new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'}))}</span>
      </div>

      <section class="v15d4-section">
        <div class="v15d4-section-title"><strong>Agora</strong><span>Comandas em andamento</span></div>
        <div class="v15d4-metrics">
          ${metric('Em aberto',moneyValue(openTotal),commands.length+' '+(commands.length===1?'comanda':'comandas'))}
          ${metric('Itens lançados',String(openUnits),'nas comandas abertas')}
        </div>
      </section>

      <section class="v15d4-section">
        <div class="v15d4-section-title"><strong>Hoje</strong><span>Resultados das comandas fechadas</span></div>
        <div class="v15d4-metrics v15d4-metrics-four">
          ${metric('Faturamento',moneyValue(revenue),closed.length+' fechada'+(closed.length===1?'':'s'))}
          ${metric('Ticket médio',moneyValue(avg),'por comanda')}
          ${metric('Comandas',String(closed.length),'fechadas hoje')}
          ${metric('Itens vendidos',String(soldUnits),'unidades')}
        </div>
      </section>

      <section class="v15d4-section">
        <div class="v15d4-section-title"><strong>Operação</strong><span>Serviços deste aparelho</span></div>
        <div class="v15d4-status-grid">
          ${statusCard(online?'ok':'warn','Internet',online?'Online':'Offline',online?'Conectado à rede':'Operação local disponível')}
          ${statusCard(syncReady?(pending?'warn':'ok'):'off','Sincronização',syncReady?(pending?pending+' pendente'+(pending===1?'':'s'):'Ativa'):'Não inicializada',syncReady?('Última: '+fmtSyncTime(sync.lastSyncAt)+(devices?' • '+devices+' aparelho'+(devices===1?'':'s'):'')):'Configure em Cardápio')}
          ${statusCard(waReady?'ok':'off','WhatsApp',waReady?'Configurado':'Não configurado',waReady?'Integração disponível':'Configure em Cardápio')}
          ${statusCard(conflicts?'warn':'ok','Conflitos de sync',conflicts?String(conflicts):'Nenhum',conflicts?'Verifique em Sincronização':'Tudo convergente')}
        </div>
      </section>

      <section class="v15d4-section">
        <div class="v15d4-section-title"><strong>Acessos rápidos</strong><span>Gestão e acompanhamento</span></div>
        <div class="v15d4-actions">
          <button type="button" data-go="commands"><span>▤</span><div><strong>Comandas</strong><small>Ver operação em aberto</small></div><b>›</b></button>
          <button type="button" data-go="history"><span>◷</span><div><strong>Histórico</strong><small>Resultados e vendas</small></div><b>›</b></button>
          <button type="button" data-go="menu"><span>♨</span><div><strong>Cardápio</strong><small>Produtos e configurações</small></div><b>›</b></button>
          <button type="button" data-go="sync"><span>↻</span><div><strong>Sincronização</strong><small>${esc(syncReady?(pending?pending+' alteração(ões) na fila':'Aparelhos conectados'):'Configurar este aparelho')}</small></div><b>›</b></button>
        </div>
      </section>`;

    screen.querySelectorAll('[data-go]').forEach(btn=>btn.addEventListener('click',()=>{
      const target=btn.dataset.go;
      if(target==='sync'){
        goBaseScreen('menu');
        setTimeout(()=>byId('v15SyncConfigBtn')?.click(),60);
        return;
      }
      goBaseScreen(target);
    }));
  }

  function hideSaleChrome(){
    document.querySelector('.cartbar')?.classList.remove('show');
  }
  function showPanel(){
    const screen=ensurePanel();
    const nav=byId('navPanel');
    if(!screen||!nav)return;
    document.querySelectorAll('.screen').forEach(el=>el.classList.toggle('active',el===screen));
    document.querySelectorAll('.navbtn').forEach(el=>el.classList.toggle('active',el===nav));
    hideSaleChrome();
    const fab=byId('fabNew');
    if(fab)fab.style.display='none';
    renderPanel();
    window.scrollTo({top:0,behavior:'auto'});
  }
  function goBaseScreen(name){
    const panel=byId('screenPanel');
    if(panel)panel.classList.remove('active');
    byId('navPanel')?.classList.remove('active');
    if(typeof baseShowScreen==='function')baseShowScreen(name);
  }

  function patchShowScreen(){
    if(baseShowScreen)return;
    baseShowScreen=typeof window.showScreen==='function'?window.showScreen:null;
    window.showScreen=function(name){
      if(name==='panel'){showPanel();return;}
      goBaseScreen(name);
    };
    try{showScreen=window.showScreen;}catch{}
  }

  function refreshWhenVisible(){
    clearInterval(refreshTimer);
    refreshTimer=setInterval(()=>{
      if(byId('screenPanel')?.classList.contains('active'))renderPanel();
    },3000);
  }

  function applyVersion(){
    const badge=byId('v14VersionBadge');
    if(badge)badge.textContent='v0.15 DEV.4';
    document.title='Rota 27 Bodega • Comandas v0.15 DEV.4';
    window.ROTA27_SYNC_DEV_VERSION=VERSION;
  }

  function start(){
    ensurePanel();
    configureNav();
    patchShowScreen();
    applyVersion();
    refreshWhenVisible();
    window.addEventListener('online',()=>{if(byId('screenPanel')?.classList.contains('active'))renderPanel();});
    window.addEventListener('offline',()=>{if(byId('screenPanel')?.classList.contains('active'))renderPanel();});
    window.addEventListener('focus',()=>{if(byId('screenPanel')?.classList.contains('active'))renderPanel();});
    console.info('[Rota27] Painel operacional carregado (v0.15 DEV.4).');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
