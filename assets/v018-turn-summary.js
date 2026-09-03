/* Rota 27 v0.18.1 — Resumo do Turno com auditoria */
(function(){
  'use strict';

  const VERSION='0.18.1';
  const MANAGER_OUTBOX_KEY='rota27_v017_manager_outbox_v1';
  const CANCEL_OUTBOX_KEY='rota27_cancel_outbox_v0151';
  let baseRenderHistory=null;
  let baseRenderCommands=null;
  let refreshTimer=null;

  function byId(id){return document.getElementById(id);}
  function esc(v){
    if(typeof escapeHtml==='function')return escapeHtml(String(v??''));
    return String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }
  function moneyValue(v){
    try{return typeof money==='function'?money(Number(v||0)):Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}catch{return 'R$ 0,00';}
  }
  function startOfToday(){const d=new Date();d.setHours(0,0,0,0);return d.getTime();}
  function readArray(key){try{const v=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(v)?v:[];}catch{return [];}}
  function activeCommands(){return (Array.isArray(state?.commands)?state.commands:[]).filter(c=>c?.cancelled!==true);}
  function closedToday(){const start=startOfToday();return (Array.isArray(state?.history)?state.history:[]).filter(c=>Number(c?.closedAt||0)>=start);}

  function itemSnapshot(command,id){
    const meta=command?.itemMeta?.[id];
    if(meta)return {name:String(meta.name||'Produto'),price:Number(meta.price||0)};
    const current=Array.isArray(state?.catalog)?state.catalog.find(p=>String(p.id)===String(id)):null;
    return current?{name:String(current.name||'Produto'),price:Number(current.price||0)}:{name:'Produto',price:0};
  }
  function recordTotal(command){
    if(Number.isFinite(Number(command?.total)))return Number(command.total);
    try{if(typeof commandTotal==='function')return Number(commandTotal(command)||0);}catch{}
    return Object.entries(command?.items||{}).reduce((sum,[id,qty])=>sum+Number(qty||0)*Number(itemSnapshot(command,id).price||0),0);
  }
  function recordItems(command){
    return Object.entries(command?.items||{}).filter(([,qty])=>Number(qty)>0).map(([id,qty])=>({product:itemSnapshot(command,id),qty:Number(qty)}));
  }

  function buildSummary(){
    const closed=closedToday(),open=activeCommands();
    let revenue=0,units=0,openValue=0;
    const products=new Map(),payments=new Map();

    closed.forEach(c=>{
      revenue+=recordTotal(c);
      const payment=String(c?.paymentMethod||'').trim();
      if(payment)payments.set(payment,(payments.get(payment)||0)+recordTotal(c));
      recordItems(c).forEach(({product,qty})=>{
        units+=qty;
        const key=product.name||'Produto';
        const row=products.get(key)||{name:key,qty:0,revenue:0};
        row.qty+=qty;row.revenue+=qty*Number(product.price||0);products.set(key,row);
      });
    });
    open.forEach(c=>{openValue+=recordTotal(c);});

    let audit={cancelled:0,events:0,serverSynced:false};
    try{audit=window.Rota27V0181?.todayStats?.()||audit;}catch{}

    return {
      revenue,
      closedCount:closed.length,
      openCount:open.length,
      openValue,
      avgTicket:closed.length?revenue/closed.length:0,
      units,
      cancelled:Number(audit.cancelled||0),
      auditEvents:Number(audit.events||0),
      auditServerSynced:audit.serverSynced===true,
      products:[...products.values()].sort((a,b)=>b.qty-a.qty||b.revenue-a.revenue).slice(0,5),
      payments:[...payments.entries()].map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value)
    };
  }

  function operationalAlerts(){
    const alerts=[];
    if(!navigator.onLine)alerts.push({title:'Aparelho offline',text:'Os dados locais continuam disponíveis, mas sincronização e WhatsApp aguardam conexão.'});

    const domainError=String(window.ROTA27_V017_DOMAIN_ERROR||'').trim();
    if(domainError)alerts.push({title:'Sincronização requer atenção',text:domainError});

    const clientFailed=(Array.isArray(state?.whatsappOutbox)?state.whatsappOutbox:[]).filter(x=>x?.status==='failed');
    if(clientFailed.length)alerts.push({title:'WhatsApp de cliente pendente',text:`${clientFailed.length} envio${clientFailed.length===1?'':'s'} com nova tentativa pendente neste aparelho.`});

    const managerRows=readArray(MANAGER_OUTBOX_KEY),managerFailed=managerRows.filter(x=>x?.status==='failed');
    if(managerFailed.length)alerts.push({title:'WhatsApp do gerente pendente',text:`${managerFailed.length} envio${managerFailed.length===1?'':'s'} com nova tentativa pendente neste aparelho.`});

    const cancelRows=readArray(CANCEL_OUTBOX_KEY);
    if(cancelRows.length)alerts.push({title:'Cancelamento aguardando sincronização',text:`${cancelRows.length} cancelamento${cancelRows.length===1?'':'s'} ainda aguardando confirmação da sincronização.`});

    return alerts;
  }

  function metric(label,value,hint){return `<div class="v018-turn-metric"><small>${esc(label)}</small><strong>${esc(value)}</strong>${hint?`<span>${esc(hint)}</span>`:''}</div>`;}

  function ensureSummary(){
    const screen=byId('screenHistory');
    if(!screen)return null;
    let box=byId('v018TurnSummary');
    if(box)return box;

    const toolbar=byId('v14HistoryToolbar');
    if(!toolbar)return null;

    box=document.createElement('section');
    box.id='v018TurnSummary';
    box.className='v018-turn-summary';
    box.setAttribute('aria-label','Resumo do turno');
    toolbar.insertAdjacentElement('beforebegin',box);
    return box;
  }

  function render(){
    const box=ensureSummary();if(!box)return;
    const extension=byId('v019TurnCloseCard');
    const s=buildSummary(),alerts=operationalAlerts();
    const date=new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric'});

    const alertHtml=alerts.length?`<div class="v018-turn-alerts">${alerts.map(a=>`<div class="v018-turn-alert"><i>!</i><div><strong>${esc(a.title)}</strong><span>${esc(a.text)}</span></div></div>`).join('')}</div>`:'';
    const topHtml=s.products.length?s.products.map(p=>`<div class="v018-turn-row"><strong>${esc(p.name)}</strong><span>${esc(`${p.qty} un. • ${moneyValue(p.revenue)}`)}</span></div>`).join(''):'<div class="v018-turn-empty">Nenhum item vendido hoje.</div>';
    const payHtml=s.payments.length?s.payments.map(p=>`<div class="v018-turn-row"><strong>${esc(p.name)}</strong><span>${esc(moneyValue(p.value))}</span></div>`).join(''):'<div class="v018-turn-empty">Nenhuma forma de pagamento registrada hoje.</div>';
    const auditHint=s.auditServerSynced?'auditoria sincronizada':'auditoria local';

    box.innerHTML=`
      <div class="v018-turn-head">
        <div><h3>Resumo do turno</h3><p>Visão rápida do dia sem alterar o fluxo de atendimento.</p></div>
        <span class="v018-turn-date">${esc(date)}</span>
      </div>
      ${alertHtml}
      <div class="v018-turn-metrics">
        ${metric('Faturamento hoje',moneyValue(s.revenue),`${s.closedCount} ${s.closedCount===1?'comanda fechada':'comandas fechadas'}`)}
        ${metric('Em aberto',String(s.openCount),moneyValue(s.openValue))}
        ${metric('Ticket médio',moneyValue(s.avgTicket),'comandas fechadas')}
        ${metric('Itens vendidos',String(s.units),'unidades hoje')}
        ${metric('Fechadas',String(s.closedCount),'hoje')}
        ${metric('Canceladas',String(s.cancelled),auditHint)}
      </div>
      <div class="v018-turn-grid">
        <div class="v018-turn-panel"><h4>Mais vendidos hoje</h4><div class="v018-turn-list">${topHtml}</div></div>
        <div class="v018-turn-panel"><h4>Formas de pagamento</h4><div class="v018-turn-list">${payHtml}</div></div>
      </div>
      <div class="v0181-turn-foot">
        <div class="v018-turn-foot">Resumo calculado com os dados operacionais do aparelho e a nova trilha de auditoria. A auditoria registra aberturas, fechamentos, cancelamentos, alterações e lançamentos do turno.</div>
        <button type="button" class="v0181-audit-open" onclick="window.Rota27V0181&&window.Rota27V0181.openAudit()">Ver auditoria</button>
      </div>`;
    if(extension)box.appendChild(extension);
    try{window.dispatchEvent(new CustomEvent('rota27:v018-summary-rendered'));}catch{}
  }

  function schedule(delay=60){clearTimeout(refreshTimer);refreshTimer=setTimeout(render,delay);}
  function wrapRenders(){
    if(!baseRenderHistory&&typeof renderHistory==='function'){
      baseRenderHistory=renderHistory;
      const patched=function(){const result=baseRenderHistory.apply(this,arguments);schedule();return result;};
      try{renderHistory=patched;}catch{} try{window.renderHistory=patched;}catch{}
    }
    if(!baseRenderCommands&&typeof renderCommands==='function'){
      baseRenderCommands=renderCommands;
      const patched=function(){const result=baseRenderCommands.apply(this,arguments);schedule();return result;};
      try{renderCommands=patched;}catch{} try{window.renderCommands=patched;}catch{}
    }
  }

  function start(){
    wrapRenders();
    schedule(250);
    window.addEventListener('online',()=>schedule());
    window.addEventListener('offline',()=>schedule());
    window.addEventListener('storage',()=>schedule());
    window.addEventListener('rota27:v017-domain-updated',()=>schedule());
    window.addEventListener('rota27:v0181-audit-updated',()=>schedule());
    window.addEventListener('rota27:v019-turn-updated',()=>schedule());
    window.addEventListener('pageshow',()=>schedule());
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')schedule();});
    setTimeout(()=>{wrapRenders();render();},1200);
    console.info('[Rota27] v0.18.1 Resumo do Turno com auditoria carregado.');
  }

  window.Rota27V018={version:VERSION,refreshTurnSummary:render};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
