/* Rota 27 v0.25.22-r3 — render canônico da tela Fechamentos */
(function(){
  'use strict';
  const VERSION='0.25.22-r3';
  const CLOSURE_KEY='rota27_v019_turn_closures_v1';
  const META_KEY='rota27_v019_turn_meta_v1';
  const OUTBOX_KEY='rota27_v019_turn_outbox_v1';
  let syncingUi=false;

  const byId=id=>document.getElementById(id);
  const esc=v=>typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]||ch));
  function readJson(key,fallback){try{const v=JSON.parse(localStorage.getItem(key)||'null');return v==null?fallback:v;}catch{return fallback;}}
  function moneyValue(v){try{return typeof money==='function'?money(Number(v||0)):Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}catch{return 'R$ 0,00';}}
  function dateLabel(key){const [y,m,d]=String(key||'').split('-');return y&&m&&d?`${d}/${m}/${y}`:String(key||'');}
  function shortDateTime(ts){const d=new Date(Number(ts||0));if(Number.isNaN(d.getTime()))return '—';return `${d.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'})} ${d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}`;}
  function fullDateTime(ts){const d=new Date(Number(ts||0));if(Number.isNaN(d.getTime()))return '—';return `${d.toLocaleDateString('pt-BR')} ${d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}`;}

  function closures(){
    try{const rows=window.Rota27V019?.getClosures?.();if(Array.isArray(rows))return rows.slice().sort((a,b)=>Number(b?.closedAt||0)-Number(a?.closedAt||0));}catch{}
    const rows=readJson(CLOSURE_KEY,[]);
    return (Array.isArray(rows)?rows:[]).slice().sort((a,b)=>Number(b?.closedAt||0)-Number(a?.closedAt||0));
  }

  function metric(label,value){return `<div class="v019-history-mini"><small>${esc(label)}</small><b>${esc(value)}</b></div>`;}

  function renderStatus(syncing=false){
    const status=byId('v019HistoryStatus');if(!status)return;
    const outbox=readJson(OUTBOX_KEY,[]),meta=readJson(META_KEY,{});
    if(syncing){status.className='v019-gate';status.textContent='Sincronizando fechamentos…';return;}
    if(Array.isArray(outbox)&&outbox.length){status.className='v019-gate warn';status.textContent=`${outbox.length} fechamento${outbox.length===1?'':'s'} aguardando sincronização.`;return;}
    status.className='v019-gate ok';
    const last=Number(meta?.lastSyncAt||0);
    status.textContent=last?`Sincronizado • ${fullDateTime(last)}`:'Fechamentos armazenados neste aparelho.';
  }

  function renderRows(){
    const list=byId('v019HistoryList');if(!list)return;
    const rows=closures();
    list.innerHTML=rows.length?rows.map(c=>{
      const s=c?.summary||{},payments=Array.isArray(s.payments)?s.payments:[];
      return `<div class="v019-history-row"><div class="v019-history-row-head"><strong>${esc(dateLabel(c.businessDate))}</strong><span>${esc(shortDateTime(c.closedAt))}</span></div><div class="v019-history-row-metrics">${metric('Faturamento',moneyValue(s.revenue))}${metric('Comandas fechadas',String(s.closedCount||0))}${metric('Comandas canceladas',String(s.cancelled||0))}${metric('Ticket médio',moneyValue(s.avgTicket))}${metric('Itens vendidos',String(s.units||0))}${metric('Formas de pagamento',String(payments.length))}</div><div class="v019-history-meta">Data operacional pela abertura • fechado em ${esc(c.deviceName||'Aparelho')}</div></div>`;
    }).join(''):'<div class="v019-preview-empty">Nenhum turno fechado ainda.</div>';
  }

  function renderCanonical(syncing=false){if(!byId('v019HistoryWrap'))return false;renderStatus(syncing);renderRows();return true;}

  async function syncAndRender(){
    if(syncingUi)return;
    syncingUi=true;renderCanonical(true);
    try{await window.Rota27V019?.syncTurnClosures?.();}catch{}
    finally{syncingUi=false;renderCanonical(false);}
  }

  function openHistory(){
    const wrap=byId('v019HistoryWrap');
    if(!wrap){try{window.Rota27V019?.openTurnHistory?.();}catch{}setTimeout(()=>renderCanonical(false),0);return;}
    wrap.classList.add('open');renderCanonical(false);
    if(navigator.onLine)syncAndRender();
  }

  function bindCapture(){
    document.addEventListener('click',e=>{
      if(e.target.closest?.('#v019ViewAll')){e.preventDefault();e.stopImmediatePropagation();openHistory();return;}
      if(e.target.closest?.('#v019HistorySync')){e.preventDefault();e.stopImmediatePropagation();syncAndRender();return;}
    },true);
  }

  function refreshIfOpen(){if(byId('v019HistoryWrap')?.classList.contains('open')&&!syncingUi)renderCanonical(false);}

  function start(){
    bindCapture();
    window.addEventListener('rota27:v019-turn-updated',refreshIfOpen);
    window.addEventListener('rota27:v017-domain-updated',refreshIfOpen);
    window.addEventListener('storage',refreshIfOpen);
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refreshIfOpen();});
    refreshIfOpen();
    window.Rota27V02522R3ClosureRender={version:VERSION,render:renderCanonical,openHistory,syncAndRender};
    console.info('[Rota27] v0.25.22-r3 — render canônico de Fechamentos carregado.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
