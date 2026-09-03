/* Rota 27 v0.20.0 — Visão Gerencial histórica e comparativa */
(function(){
  'use strict';

  const VERSION='0.20.0';
  let period='30';
  let selectedMonth='';

  function byId(id){return document.getElementById(id);}
  function esc(v){if(typeof escapeHtml==='function')return escapeHtml(String(v??''));return String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
  function moneyValue(v){try{return typeof money==='function'?money(Number(v||0)):Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}catch{return 'R$ 0,00';}}
  function clone(v){return JSON.parse(JSON.stringify(v==null?null:v));}
  function localDateKey(d=new Date()){const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`;}
  function shiftKey(key,days){const [y,m,d]=String(key).split('-').map(Number);const x=new Date(y,m-1,d);x.setDate(x.getDate()+Number(days||0));return localDateKey(x);}
  function shortDate(key){const p=String(key||'').split('-');return p.length===3?`${p[2]}/${p[1]}`:String(key||'');}
  function validMonthKey(key){return /^\d{4}-(0[1-9]|1[0-2])$/.test(String(key||''));}
  function monthBounds(key){const [y,m]=String(key||'').split('-').map(Number);const end=localDateKey(new Date(y,m,0));return {start:`${key}-01`,end};}
  function previousMonth(key){const [y,m]=String(key||'').split('-').map(Number);const d=new Date(y,m-2,1);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;}
  function monthLabel(key){if(!validMonthKey(key))return 'Mês específico';const [y,m]=key.split('-').map(Number);return new Date(y,m-1,1).toLocaleDateString('pt-BR',{month:'long',year:'numeric'});}
  function percentDelta(current,previous){
    const c=Number(current||0),p=Number(previous||0);
    if(!Number.isFinite(c)||!Number.isFinite(p))return null;
    if(p===0)return c===0?0:null;
    return ((c-p)/Math.abs(p))*100;
  }
  function deltaMeta(delta){
    if(delta===null||delta===undefined||!Number.isFinite(delta))return {cls:'flat',text:'sem base anterior'};
    if(Math.abs(delta)<0.05)return {cls:'flat',text:'0,0%'};
    const text=`${delta>0?'+':''}${delta.toLocaleString('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1})}%`;
    return {cls:delta>0?'up':'down',text};
  }

  function closures(){
    try{return Array.isArray(window.Rota27V019?.getClosures?.())?window.Rota27V019.getClosures():[];}catch{return [];}
  }
  function ranges(){
    const today=localDateKey();
    if(period==='month'&&validMonthKey(selectedMonth)){const current=monthBounds(selectedMonth),previous=monthBounds(previousMonth(selectedMonth));return {currentStart:current.start,currentEnd:current.end,previousStart:previous.start,previousEnd:previous.end,label:'Mês específico'};}
    if(period==='all')return {currentStart:'0000-00-00',currentEnd:today,previousStart:null,previousEnd:null,label:'Todo o histórico'};
    const days=Math.max(1,Number(period||30));
    const currentStart=shiftKey(today,-(days-1));
    const previousEnd=shiftKey(currentStart,-1);
    const previousStart=shiftKey(previousEnd,-(days-1));
    return {currentStart,currentEnd:today,previousStart,previousEnd,label:`Últimos ${days} dias`};
  }
  function between(rows,start,end){return rows.filter(c=>String(c.businessDate)>=String(start)&&String(c.businessDate)<=String(end));}

  function aggregate(rows){
    let revenue=0,commands=0,cancelled=0,units=0;
    const products=new Map(),payments=new Map();
    rows.forEach(c=>{
      const s=c?.summary||{};
      revenue+=Number(s.revenue||0);commands+=Number(s.closedCount||0);cancelled+=Number(s.cancelled||0);units+=Number(s.units||0);
      (Array.isArray(s.products)?s.products:[]).forEach(p=>{
        const name=String(p?.name||'Produto');const old=products.get(name)||{name,qty:0,revenue:0};old.qty+=Number(p?.qty||0);old.revenue+=Number(p?.revenue||0);products.set(name,old);
      });
      (Array.isArray(s.payments)?s.payments:[]).forEach(p=>{
        const name=String(p?.name||'Não informado');payments.set(name,(payments.get(name)||0)+Number(p?.value||0));
      });
    });
    const best=rows.slice().sort((a,b)=>Number(b?.summary?.revenue||0)-Number(a?.summary?.revenue||0))[0]||null;
    return {
      revenue,commands,cancelled,units,turns:rows.length,
      dailyAvg:rows.length?revenue/rows.length:0,
      avgTicket:commands?revenue/commands:0,
      best,
      products:[...products.values()].sort((a,b)=>b.qty-a.qty||b.revenue-a.revenue),
      payments:[...payments.entries()].map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value)
    };
  }
  function dataset(){
    const all=closures().slice().sort((a,b)=>String(a.businessDate).localeCompare(String(b.businessDate)));
    const r=ranges();const current=between(all,r.currentStart,r.currentEnd);const previous=r.previousStart?between(all,r.previousStart,r.previousEnd):[];
    return {all,r,current,previous,a:aggregate(current),p:aggregate(previous)};
  }

  function metric(label,value,hint=''){return `<div class="v020-metric"><small>${esc(label)}</small><strong>${esc(value)}</strong>${hint?`<span>${esc(hint)}</span>`:''}</div>`;}
  function listHtml(rows,kind){
    if(!rows.length)return '<div class="v020-empty">Ainda não há dados suficientes neste período.</div>';
    if(kind==='product')return `<div class="v020-list">${rows.slice(0,7).map(r=>`<div class="v020-row"><strong>${esc(r.name)}</strong><span>${esc(`${r.qty} un. • ${moneyValue(r.revenue)}`)}</span></div>`).join('')}</div>`;
    return `<div class="v020-list">${rows.map(r=>`<div class="v020-row"><strong>${esc(r.name)}</strong><span>${esc(moneyValue(r.value))}</span></div>`).join('')}</div>`;
  }
  function compareCard(label,current,previous,formatter){const d=deltaMeta(percentDelta(current,previous));return `<div class="v020-compare-card"><small>${esc(label)}</small><strong>${esc(formatter(current))}</strong><span class="v020-delta ${d.cls}">${esc(d.text)}</span></div>`;}
  function chartHtml(rows){
    if(!rows.length)return '<div class="v020-empty">O gráfico aparecerá quando houver pelo menos um turno fechado no período.</div>';
    const max=Math.max(...rows.map(c=>Number(c?.summary?.revenue||0)),1);
    return rows.map(c=>{const value=Number(c?.summary?.revenue||0),height=Math.max(3,Math.round((value/max)*92));return `<div class="v020-bar-col" title="${esc(shortDate(c.businessDate)+' • '+moneyValue(value))}"><b>${esc(moneyValue(value).replace('R$ ','').replace('R$ ',''))}</b><div class="v020-bar" style="height:${height}px"></div><small>${esc(shortDate(c.businessDate))}</small></div>`;}).join('');
  }

  function ensureSheet(){
    if(byId('v020ManagerWrap'))return;
    const wrap=document.createElement('div');wrap.id='v020ManagerWrap';wrap.className='sheet-wrap';
    wrap.innerHTML=`<div class="sheet v020-sheet"><div class="handle"></div><div class="v020-head"><div><h3>Visão Gerencial</h3><p class="desc">Histórico e comparação com base nos fechamentos imutáveis.</p></div><button type="button" id="v020ManagerX" class="v020-x" aria-label="Fechar">×</button></div><div class="v020-periods" id="v020Periods"><button data-period="7">7 dias</button><button data-period="30" class="active">30 dias</button><button data-period="90">90 dias</button><button data-period="all">Todos</button><button data-period="month">Mês</button><label id="v020MonthPicker" class="v020-month-picker" hidden><span>Mês de fechamento</span><span class="v020-month-control"><b id="v020MonthDisplay">Selecionar mês</b><input id="v020MonthInput" type="month" aria-label="Escolher mês de fechamento" /></span></label></div><div id="v020ManagerBody"></div></div>`;
    document.body.appendChild(wrap);
    wrap.addEventListener('click',e=>{if(e.target===wrap)wrap.classList.remove('open');});
    byId('v020ManagerX').addEventListener('click',()=>wrap.classList.remove('open'));
    const periods=byId('v020Periods'),monthInput=byId('v020MonthInput');
    const syncControls=()=>{periods.querySelectorAll('[data-period]').forEach(x=>x.classList.toggle('active',x.dataset.period===period));byId('v020MonthPicker')?.toggleAttribute('hidden',period!=='month');if(monthInput)monthInput.value=selectedMonth;const display=byId('v020MonthDisplay');if(display)display.textContent=validMonthKey(selectedMonth)?monthLabel(selectedMonth):'Selecionar mês';};
    periods.querySelectorAll('[data-period]').forEach(btn=>btn.addEventListener('click',()=>{const next=btn.dataset.period||'30';if(next==='month'&&!validMonthKey(selectedMonth)){const latest=closures().slice().sort((a,b)=>String(b?.businessDate||'').localeCompare(String(a?.businessDate||'')))[0];selectedMonth=validMonthKey(String(latest?.businessDate||'').slice(0,7))?String(latest.businessDate).slice(0,7):localDateKey().slice(0,7);}period=next;syncControls();renderManager();if(next==='month')setTimeout(()=>monthInput?.focus(),0);}));
    monthInput?.addEventListener('change',()=>{const next=String(monthInput.value||'');if(!validMonthKey(next))return;selectedMonth=next;period='month';syncControls();renderManager();});
  }

  function renderManager(){
    ensureSheet();const body=byId('v020ManagerBody');if(!body)return;const d=dataset(),a=d.a,p=d.p;
    const baseText=a.turns?`Base confiável: ${a.turns} ${a.turns===1?'fechamento imutável':'fechamentos imutáveis'} no período selecionado.`:'Ainda não existe fechamento imutável dentro do período selecionado.';
    const best=a.best?`${shortDate(a.best.businessDate)} • ${moneyValue(a.best.summary?.revenue||0)}`:'—';
    const currentRange=period==='all'?d.r.label:period==='month'?monthLabel(selectedMonth):`${shortDate(d.r.currentStart)} a ${shortDate(d.r.currentEnd)}`;
    const previousAvailable=d.previous.length>0;
    body.innerHTML=`
      <div class="v020-source ${a.turns?'ok':'warn'}"><strong>${esc(d.r.label)}</strong> • ${esc(currentRange)}<br>${esc(baseText)} Os valores vêm dos snapshots salvos no Fechamento do Turno; dias sem fechamento não são inventados como zero.</div>
      <div class="v020-metrics">
        ${metric('Faturamento',moneyValue(a.revenue),`${a.turns} turno${a.turns===1?'':'s'}`)}
        ${metric('Média por dia',moneyValue(a.dailyAvg),'por turno fechado')}
        ${metric('Ticket médio',moneyValue(a.avgTicket),`${a.commands} comandas`)}
        ${metric('Comandas',String(a.commands),'fechadas')}
        ${metric('Itens vendidos',String(a.units),'unidades')}
        ${metric('Canceladas',String(a.cancelled),'registradas')}
      </div>
      <section class="v020-compare"><h4>Comparação com período anterior</h4><div class="v020-compare-grid">
        ${compareCard('Faturamento',a.revenue,p.revenue,moneyValue)}
        ${compareCard('Ticket médio',a.avgTicket,p.avgTicket,moneyValue)}
        ${compareCard('Comandas',a.commands,p.commands,v=>String(Number(v||0)))}
        ${compareCard('Itens vendidos',a.units,p.units,v=>String(Number(v||0)))}
      </div>${previousAvailable?'':`<div class="v020-empty">Ainda não há fechamentos suficientes no mês/período anterior para uma comparação completa.</div>`}</section>
      <section class="v020-chart-wrap"><div class="v020-chart-head"><h4>Faturamento por turno fechado</h4><small>Melhor dia: ${esc(best)}</small></div><div class="v020-chart">${chartHtml(d.current)}</div></section>
      <div class="v020-grid">
        <section class="v020-panel"><h4>Mais vendidos</h4>${listHtml(a.products,'product')}</section>
        <section class="v020-panel"><h4>Formas de pagamento</h4>${listHtml(a.payments,'payment')}</section>
      </div>
      <div class="v020-actions"><button type="button" id="v020Refresh">↻ Atualizar dados</button><button type="button" class="primary" id="v020Export">⇩ Exportar CSV</button></div>
      <div class="v020-source" style="margin-top:10px">Produtos são consolidados a partir da lista de mais vendidos salva em cada fechamento. Formas de pagamento e totais financeiros usam o snapshot integral de cada turno.</div>`;
    byId('v020Refresh')?.addEventListener('click',async()=>{try{if(navigator.onLine&&window.Rota27V019?.syncTurnClosures)await window.Rota27V019.syncTurnClosures();}catch{}renderManager();renderEntry();});
    byId('v020Export')?.addEventListener('click',exportCsv);
  }

  function downloadText(filename,content,type='text/csv;charset=utf-8'){const blob=new Blob([content],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  function csvCell(v){const s=String(v??'');return /[;"\r\n]/.test(s)?`"${s.replace(/"/g,'""')}"`:s;}
  function exportCsv(){
    const d=dataset();if(!d.current.length){try{showToast('Não há fechamentos para exportar neste período.',false);}catch{}return;}
    const lines=['Data;Faturamento;Comandas;Canceladas;Ticket Medio;Itens;Formas de Pagamento'];
    d.current.forEach(c=>{const s=c.summary||{};const payments=(Array.isArray(s.payments)?s.payments:[]).map(p=>`${p.name}: ${Number(p.value||0).toFixed(2)}`).join(' | ');lines.push([c.businessDate,Number(s.revenue||0).toFixed(2),Number(s.closedCount||0),Number(s.cancelled||0),Number(s.avgTicket||0).toFixed(2),Number(s.units||0),payments].map(csvCell).join(';'));});
    const filter=period==='month'&&validMonthKey(selectedMonth)?`mes-${selectedMonth}`:period;
    downloadText(`rota27-visao-gerencial-${filter}-${localDateKey()}.csv`,'\uFEFF'+lines.join('\r\n'));try{showToast('CSV gerencial gerado.',false);}catch{}
  }

  async function openManager(){ensureSheet();byId('v020ManagerWrap').classList.add('open');renderManager();if(navigator.onLine&&window.Rota27V019?.syncTurnClosures){try{await window.Rota27V019.syncTurnClosures();renderManager();renderEntry();}catch{}}}

  function renderEntry(){
    const screen=byId('screenPanel');if(!screen)return;
    let entry=byId('v020ManagerEntry');if(!entry){entry=document.createElement('section');entry.id='v020ManagerEntry';entry.className='v020-manager-entry';const head=screen.querySelector('.v15d4-head');if(head)head.insertAdjacentElement('afterend',entry);else screen.prepend(entry);}
    const rows=closures(),last=rows.slice().sort((a,b)=>String(b.businessDate).localeCompare(String(a.businessDate)))[0]||null;
    const hint=rows.length?`${rows.length} fechamento${rows.length===1?'':'s'} disponível${rows.length===1?'':'is'}${last?' • último '+shortDate(last.businessDate):''}`:'Feche o primeiro turno para iniciar o histórico confiável.';
    entry.innerHTML=`<div class="v020-manager-entry-head"><div><strong>Visão Gerencial</strong><small>${esc(hint)} • compare períodos, faturamento, ticket, produtos e pagamentos.</small></div><button type="button" class="v020-manager-open">Abrir visão gerencial</button></div>`;
    entry.querySelector('button')?.addEventListener('click',openManager);
  }

  function injectHelp(){
    const overlay=byId('r27HelpOverlay');if(!overlay)return false;const content=overlay.querySelector('.r27-help-content');if(!content)return false;
    if(!byId('r27-help-visao-gerencial')){const section=document.createElement('details');section.id='r27-help-visao-gerencial';section.className='r27-help-section';section.innerHTML=`<summary><span class="r27-help-section-icon">▦</span><span><strong>Visão Gerencial</strong><small>Comparar períodos usando fechamentos confiáveis.</small></span></summary><div class="r27-help-section-body"><div class="r27-help-lead">No <b>Painel</b>, abra <b>Visão Gerencial</b> para acompanhar faturamento, média por dia, ticket, comandas, itens e cancelamentos usando os registros imutáveis do Fechamento do Turno.</div><ol class="r27-help-steps"><li><span>1</span><div><b>Escolha o período</b><br>Use 7, 30, 90 dias, todo o histórico ou um mês específico.</div></li><li><span>2</span><div><b>Compare</b><br>O app confronta faturamento, ticket, comandas e itens com o período anterior equivalente; no filtro Mês, a referência é o mês calendário anterior.</div></li><li><span>3</span><div><b>Leia tendências</b><br>Veja faturamento por turno, mais vendidos e formas de pagamento.</div></li><li><span>4</span><div><b>Exporte</b><br>Gere CSV dos fechamentos do período selecionado para análise externa.</div></li></ol><div class="r27-help-tip"><b>Importante:</b> dias sem fechamento não são tratados como faturamento zero. A visão só usa registros efetivamente encerrados.</div></div>`;content.appendChild(section);}
    return true;
  }
  function tick(){ensureSheet();if(byId('screenPanel')?.classList.contains('active'))renderEntry();injectHelp();if(byId('v020ManagerWrap')?.classList.contains('open'))renderManager();}
  function start(){ensureSheet();setTimeout(tick,120);setTimeout(tick,650);setInterval(tick,1500);window.addEventListener('rota27:v019-turn-updated',()=>{renderEntry();if(byId('v020ManagerWrap')?.classList.contains('open'))renderManager();});window.addEventListener('online',tick);window.addEventListener('storage',tick);console.info('[Rota27] v0.20.0 Visão Gerencial carregada.');}

  window.Rota27V020={version:VERSION,openManager,getDataset:()=>clone(dataset()),getSelectedMonth:()=>selectedMonth};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
