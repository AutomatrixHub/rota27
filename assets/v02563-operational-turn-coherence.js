/* Rota 27 v0.25.63 — coerência operacional de turnos */
(function(){
  'use strict';

  const VERSION='0.25.63';
  const MODE_CURRENT='current';
  const MODE_LAST='last';
  const MODE_7D='7d';
  const MODE_30D='30d';
  const MODE_ALL='all';
  const MODE_DATE='date';
  let historyMode=MODE_CURRENT;
  let historyDate='';
  let historySearch='';
  let baseRenderHistory=null;
  let baseSave=null;
  let panelBridgeInstalled=false;

  const byId=id=>document.getElementById(id);
  const esc=v=>typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]||ch));
  const moneyValue=v=>{try{return typeof money==='function'?money(Number(v||0)):Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}catch{return 'R$ 0,00';}};
  const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLocaleLowerCase('pt-BR');

  function validDateKey(v){return /^\d{4}-\d{2}-\d{2}$/.test(String(v||''));}
  function dateKey(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
  function dateLabel(key){const [y,m,d]=String(key||'').split('-');return y&&m&&d?`${d}/${m}/${y}`:String(key||'');}
  function openedAt(c){const t=Number(c?.createdAt||c?.openedAt||0);if(Number.isFinite(t)&&t>0)return t;const f=Number(c?.closedAt||c?.updatedAt||0);return Number.isFinite(f)&&f>0?f:0;}
  function closedAt(c){return Number(c?.closedAt||c?.operationalClosedAt||0);}
  function isInternal(c){return c?.internalConsumption===true||c?.nonRevenue===true||String(c?.paymentMethod||'')==='Consumo interno'||String(c?.internalType||'')==='own_consumption';}
  function isRevenue(c){return !!c&&c.cancelled!==true&&!isInternal(c);}
  function commandBusinessDate(c){
    const explicit=String(c?.businessDate||c?.operationalDate||'').trim();
    if(validDateKey(explicit)&&explicit!=='0000-00-00')return explicit;
    const t=openedAt(c);return t?dateKey(new Date(t)):'';
  }
  function closures(){
    try{return (window.Rota27V019?.getClosures?.()||[]).slice().sort((a,b)=>Number(b?.closedAt||0)-Number(a?.closedAt||0));}catch{return[];}
  }
  function cutoffForDate(key){
    const c=closures().filter(x=>String(x?.businessDate||'')===String(key)).sort((a,b)=>Number(b?.closedAt||0)-Number(a?.closedAt||0))[0];
    if(c)return Number(c.closedAt||0);
    const [y,m,d]=String(key||'').split('-').map(Number);
    return y&&m&&d?new Date(y,m-1,d,0,0,0,0).getTime()-1:0;
  }
  function currentBusinessDate(){
    try{
      const key=window.Rota27V019?.currentBusinessDate?.();
      if(validDateKey(key))return key;
    }catch{}
    const open=(state?.commands||[]).filter(isRevenue).sort((a,b)=>openedAt(a)-openedAt(b));
    if(open.length){const k=commandBusinessDate(open[0]);if(validDateKey(k))return k;}
    const recent=(state?.history||[]).filter(isRevenue).sort((a,b)=>Math.max(closedAt(b),openedAt(b))-Math.max(closedAt(a),openedAt(a)));
    for(const c of recent){
      const k=commandBusinessDate(c);if(!validDateKey(k))continue;
      if(openedAt(c)>cutoffForDate(k))return k;
    }
    return dateKey();
  }

  function productMeta(c,id){
    const m=c?.itemMeta?.[id]||{};
    const p=(state?.catalog||[]).find(x=>String(x?.id||'')===String(id))||null;
    /* O catálogo fornece o nome atual; o snapshot da venda preserva preço e categoria históricos. */
    return {
      id:String(id),
      name:String(p?.name||m.name||'Produto'),
      category:String(m.cat||m.category||m.categoryName||p?.cat||p?.category||'Outros'),
      price:Number.isFinite(Number(m.price))?Number(m.price):Number(p?.price||0)
    };
  }
  function recordTotal(c){
    if(Number.isFinite(Number(c?.total)))return Number(c.total);
    try{if(typeof commandTotal==='function')return Number(commandTotal(c)||0);}catch{}
    return Object.entries(c?.items||{}).reduce((sum,[id,q])=>sum+Number(q||0)*productMeta(c,id).price,0);
  }
  function recordItems(c){return Object.entries(c?.items||{}).filter(([,q])=>Number(q)>0).map(([id,q])=>({product:productMeta(c,id),qty:Number(q)}));}
  function commandDisplay(c){try{if(typeof commandLabel==='function')return commandLabel(c);}catch{}return [c?.table,c?.customer].filter(Boolean).join(' • ')||'Comanda';}

  function rowsForCurrent(){
    const key=currentBusinessDate(),cutoff=cutoffForDate(key);
    return (state?.history||[]).filter(isRevenue).filter(c=>commandBusinessDate(c)===key&&openedAt(c)>cutoff).sort((a,b)=>closedAt(b)-closedAt(a));
  }
  function openRowsForCurrent(){
    const key=currentBusinessDate(),cutoff=cutoffForDate(key);
    return (state?.commands||[]).filter(isRevenue).filter(c=>commandBusinessDate(c)===key&&openedAt(c)>cutoff);
  }
  function latestClosure(){return closures()[0]||null;}
  function previousClosureSameDate(target){
    if(!target)return null;
    return closures().filter(c=>String(c?.businessDate||'')===String(target.businessDate)&&Number(c?.closedAt||0)<Number(target.closedAt||0)).sort((a,b)=>Number(b.closedAt||0)-Number(a.closedAt||0))[0]||null;
  }
  function rowsForClosure(target){
    if(!target)return [];
    const prev=previousClosureSameDate(target);
    const [y,m,d]=String(target.businessDate||'').split('-').map(Number);
    const start=prev?Number(prev.closedAt||0):(y&&m&&d?new Date(y,m-1,d,0,0,0,0).getTime()-1:0);
    const end=Number(target.closedAt||0);
    return (state?.history||[]).filter(isRevenue).filter(c=>commandBusinessDate(c)===String(target.businessDate||'')).filter(c=>openedAt(c)>start&&(!end||openedAt(c)<=end)).sort((a,b)=>closedAt(b)-closedAt(a));
  }
  function dateShift(key,days){const [y,m,d]=String(key||'').split('-').map(Number);const x=new Date(y,m-1,d,12,0,0,0);x.setDate(x.getDate()+days);return dateKey(x);}
  function rowsForRange(mode){
    const today=dateKey(),start=mode===MODE_7D?dateShift(today,-6):mode===MODE_30D?dateShift(today,-29):'0000-00-00';
    return (state?.history||[]).filter(isRevenue).filter(c=>{
      const k=commandBusinessDate(c);if(!validDateKey(k))return false;
      if(mode===MODE_ALL)return true;
      return k>=start&&k<=today;
    }).sort((a,b)=>closedAt(b)-closedAt(a));
  }
  function rowsForSpecificDate(key){
    if(!validDateKey(key))return [];
    return (state?.history||[]).filter(isRevenue).filter(c=>commandBusinessDate(c)===key).sort((a,b)=>closedAt(b)-closedAt(a));
  }

  function analytics(rows){
    const out={revenue:0,commands:rows.length,units:0,avgTicket:0,products:new Map(),categories:new Map(),payments:new Map()};
    rows.forEach(c=>{
      const total=recordTotal(c);out.revenue+=total;
      const payment=String(c?.paymentMethod||'').trim();if(payment)out.payments.set(payment,(out.payments.get(payment)||0)+total);
      recordItems(c).forEach(({product,qty})=>{
        out.units+=qty;
        const pk=String(product.id||product.name),p=out.products.get(pk)||{id:pk,name:product.name,qty:0,revenue:0};p.name=product.name;p.qty+=qty;p.revenue+=qty*product.price;out.products.set(pk,p);
        const ck=norm(product.category||'Outros'),cat=out.categories.get(ck)||{name:product.category||'Outros',qty:0,revenue:0};cat.qty+=qty;cat.revenue+=qty*product.price;out.categories.set(ck,cat);
      });
    });
    out.avgTicket=out.commands?out.revenue/out.commands:0;
    out.payments=[...out.payments.entries()].map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value);
    return out;
  }
  function currentSummary(){
    const closed=rowsForCurrent(),open=openRowsForCurrent(),a=analytics(closed);
    return {...a,businessDate:currentBusinessDate(),closedCount:closed.length,openCount:open.length,openValue:open.reduce((s,c)=>s+recordTotal(c),0),openUnits:open.reduce((s,c)=>s+recordItems(c).reduce((u,x)=>u+x.qty,0),0)};
  }

  function normalizeOperationalFields(){
    let changed=false;
    const all=[...(state?.commands||[]),...(state?.history||[])];
    all.forEach(c=>{
      if(!c||typeof c!=='object')return;
      if(String(c.businessDate||'')==='0000-00-00')return;
      if(!validDateKey(c.businessDate)){
        const k=commandBusinessDate(c);if(validDateKey(k)){c.businessDate=k;c.operationalDate=k;changed=true;}
      }
      if(String(c.table||'').trim()==='Consumo interno'||String(c.internalType||'')==='own_consumption'){
        if(c.internalConsumption!==true){c.internalConsumption=true;changed=true;}
        if(c.nonRevenue!==true){c.nonRevenue=true;changed=true;}
        if(!c.internalType){c.internalType='own_consumption';changed=true;}
      }
    });
    return changed;
  }
  function installSaveBridge(){
    const current=window.save;
    if(typeof current!=='function'||current.__v02563Operational===true)return;
    baseSave=current;
    const wrapped=function(){normalizeOperationalFields();return baseSave.apply(this,arguments);};
    wrapped.__v02563Operational=true;wrapped.__v02563Base=baseSave;
    try{window.save=wrapped;save=wrapped;}catch{}
  }

  function metric(label,value,hint){return `<div class="v018-turn-metric"><small>${esc(label)}</small><strong>${esc(value)}</strong>${hint?`<span>${esc(hint)}</span>`:''}</div>`;}
  function panelMetricSet(section,items){
    if(!section)return;
    const cards=[...section.querySelectorAll('.v15d4-metric')];
    items.forEach((x,i)=>{
      const card=cards[i];if(!card)return;
      const s=card.querySelector('small'),b=card.querySelector('strong'),h=card.querySelector('span');
      if(s)s.textContent=x[0];if(b)b.textContent=x[1];if(h)h.textContent=x[2]||'';
    });
  }
  function sectionByTitle(panel,title){
    return [...(panel?.querySelectorAll(':scope > .v15d4-section')||[])].find(sec=>String(sec.querySelector(':scope > .v15d4-section-title strong')?.textContent||'').trim()===title)||null;
  }
  function ensureLastTurnCard(panel,afterSection){
    if(!panel||!afterSection)return;
    const closure=latestClosure();let box=byId('v02563LastTurn');
    if(!closure){box?.remove();return;}
    if(!box){box=document.createElement('section');box.id='v02563LastTurn';box.className='v15d4-section v02563-last-turn';}
    const s=closure.summary||{},when=new Date(Number(closure.closedAt||0));
    box.innerHTML=`<div class="v02563-last-head"><div><span>ÚLTIMO TURNO FECHADO</span><strong>${esc(dateLabel(closure.businessDate))}</strong><small>Fechado ${esc(when.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'}))} às ${esc(when.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}))}</small></div><button type="button" id="v02563OpenLastTurn">Ver fechamento</button></div><div class="v02563-last-metrics"><div><small>Faturamento</small><strong>${esc(moneyValue(Number(s.revenue||0)))}</strong></div><div><small>Comandas</small><strong>${esc(String(Number(s.closedCount||0)))}</strong></div><div><small>Itens</small><strong>${esc(String(Number(s.units||0)))}</strong></div></div>`;
    if(box.parentElement!==panel||box.previousElementSibling!==afterSection)afterSection.insertAdjacentElement('afterend',box);
    byId('v02563OpenLastTurn')?.addEventListener('click',()=>{try{window.Rota27V019?.openTurnHistory?.();}catch{}});
  }
  function decorateReceivables(){
    const summary=byId('v02512PanelSummary');if(!summary)return;
    try{
      const rows=window.Rota27V02512?.getOpenReceivables?.()||[];
      const balance=rows.reduce((s,r)=>s+Math.max(0,Number(r?.balance||0)),0);
      summary.innerHTML=rows.length?`<span class="v02512-dot warn"></span>${esc(`${rows.length} pendência${rows.length===1?'':'s'} • ${moneyValue(balance)} em saldos não recebidos`)}`:`<span class="v02512-dot ok"></span>Nenhum saldo pendente`;
    }catch{}
  }
  function decoratePanel(){
    const panel=byId('screenPanel');if(!panel)return false;
    const s=currentSummary();
    const head=panel.querySelector('.v15d4-head');if(head){
      const p=head.querySelector('p');if(p)p.textContent='Visão rápida do turno operacional atual.';
      const badge=head.querySelector('.badge');if(badge)badge.textContent=dateLabel(s.businessDate).slice(0,5);
    }
    let now=sectionByTitle(panel,'Agora');
    if(now){
      const span=now.querySelector('.v15d4-section-title span');if(span)span.textContent=`Turno atual • ${dateLabel(s.businessDate)}`;
      panelMetricSet(now,[['Em aberto',moneyValue(s.openValue),`${s.openCount} ${s.openCount===1?'comanda':'comandas'}`],['Itens lançados',String(s.openUnits),'nas comandas abertas']]);
    }
    let results=sectionByTitle(panel,'Hoje')||sectionByTitle(panel,'Turno atual');
    if(results){
      const strong=results.querySelector('.v15d4-section-title strong');if(strong)strong.textContent='Turno atual';
      const span=results.querySelector('.v15d4-section-title span');if(span)span.textContent='Resultados desde o último fechamento';
      panelMetricSet(results,[['Faturamento',moneyValue(s.revenue),`${s.closedCount} fechada${s.closedCount===1?'':'s'}`],['Ticket médio',moneyValue(s.avgTicket),'por comanda'],['Comandas',String(s.closedCount),'fechadas no turno'],['Itens vendidos',String(s.units),'unidades no turno']]);
      ensureLastTurnCard(panel,results);
    }
    decorateReceivables();
    return true;
  }
  function installPanelBridge(){
    const panel=byId('screenPanel');if(!panel||panelBridgeInstalled||panel.dataset.v02563OperationalBridge==='1')return;
    const own=Object.getOwnPropertyDescriptor(panel,'innerHTML');const proto=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');const d=own?.get&&own?.set?own:proto;
    if(!d?.get||!d?.set)return;
    try{
      Object.defineProperty(panel,'innerHTML',{configurable:true,enumerable:d.enumerable,get:function(){return d.get.call(this);},set:function(v){d.set.call(this,v);if(typeof queueMicrotask==='function')queueMicrotask(decoratePanel);else Promise.resolve().then(decoratePanel);}});
      panel.dataset.v02563OperationalBridge='1';panelBridgeInstalled=true;
    }catch(err){console.warn('[Rota27 v0.25.63] ponte Painel:',err);}
  }

  function periodRows(){
    if(historyMode===MODE_CURRENT)return rowsForCurrent();
    if(historyMode===MODE_LAST)return rowsForClosure(latestClosure());
    if(historyMode===MODE_DATE)return rowsForSpecificDate(historyDate);
    return rowsForRange(historyMode);
  }
  function periodLabel(){
    if(historyMode===MODE_CURRENT)return `Turno atual • ${dateLabel(currentBusinessDate())}`;
    if(historyMode===MODE_LAST){const c=latestClosure();return c?`Último turno • ${dateLabel(c.businessDate)}`:'Último turno';}
    if(historyMode===MODE_DATE)return historyDate?`Data específica • ${dateLabel(historyDate)}`:'Data específica';
    return historyMode===MODE_7D?'Últimos 7 dias operacionais':historyMode===MODE_30D?'Últimos 30 dias operacionais':'Todo o histórico operacional';
  }
  function matchesSearch(c){
    const q=norm(historySearch);if(!q)return true;
    const products=recordItems(c).map(x=>x.product.name).join(' ');
    return norm([commandDisplay(c),c?.table,c?.customer,c?.paymentMethod,products].filter(Boolean).join(' ')).includes(q);
  }
  function renderRank(targetId,rows,valueKey,formatter,empty){
    const target=byId(targetId);if(!target)return;
    if(!rows.length){target.innerHTML=`<div class="v14-mini-empty">${esc(empty)}</div>`;return;}
    const max=Math.max(...rows.map(r=>Number(r[valueKey]||0)),1);
    target.innerHTML=rows.map((r,i)=>`<div class="v14-rank-row"><div class="v14-rank-line"><strong>${i+1}. ${esc(r.name)}</strong><span>${esc(formatter(r))}</span></div><div class="v14-bar"><i style="width:${Math.max(6,Math.round(Number(r[valueKey]||0)/max*100))}%"></i></div></div>`).join('');
  }
  function ensureHistoryControls(){
    const periods=document.querySelector('#v14HistoryToolbar .v14-periods');if(!periods)return;
    const today=periods.querySelector('[data-period="today"]');if(today){today.textContent='Turno atual';today.dataset.v02563Mode=MODE_CURRENT;}
    const d7=periods.querySelector('[data-period="7d"]');if(d7)d7.dataset.v02563Mode=MODE_7D;
    const d30=periods.querySelector('[data-period="30d"]');if(d30)d30.dataset.v02563Mode=MODE_30D;
    const all=periods.querySelector('[data-period="all"]');if(all)all.dataset.v02563Mode=MODE_ALL;
    const yesterday=byId('v02521YesterdayBtn');
    if(yesterday){yesterday.textContent='Último turno';yesterday.dataset.v02563Mode=MODE_LAST;}
    let dateButton=byId('v02563DateBtn');
    if(!dateButton){
      dateButton=document.createElement('button');dateButton.type='button';dateButton.id='v02563DateBtn';dateButton.dataset.v02563Mode=MODE_DATE;dateButton.textContent='Data';periods.appendChild(dateButton);
      const picker=document.createElement('label');picker.id='v02563DatePicker';picker.className='v02563-date-picker';picker.innerHTML='<span>Data específica</span><input id="v02563DateInput" type="date" aria-label="Escolher data específica" />';periods.insertAdjacentElement('afterend',picker);
    }
    const input=byId('v02563DateInput');if(input){input.value=historyDate;input.closest('.v02563-date-picker')?.toggleAttribute('hidden',historyMode!==MODE_DATE);}
    [...periods.querySelectorAll('button')].forEach(b=>b.classList.toggle('active',b.dataset.v02563Mode===historyMode));
  }
  function renderHistoryOperational(){
    if(!byId('v14HistoryToolbar'))return false;
    ensureHistoryControls();
    const rows=periodRows().filter(matchesSearch),a=analytics(rows),label=periodLabel();
    const metrics=byId('v14Metrics');
    if(metrics)metrics.innerHTML=[`<div class="v14-metric"><small>Faturamento</small><strong>${esc(moneyValue(a.revenue))}</strong><span>${esc(label)}</span></div>`,`<div class="v14-metric"><small>Comandas</small><strong>${a.commands}</strong><span>${a.commands===1?'conta fechada':'contas fechadas'}</span></div>`,`<div class="v14-metric"><small>Ticket médio</small><strong>${esc(moneyValue(a.avgTicket))}</strong><span>por comanda</span></div>`,`<div class="v14-metric"><small>Itens vendidos</small><strong>${a.units}</strong><span>unidades</span></div>`].join('');
    if(byId('historyCount'))byId('historyCount').textContent=String(rows.length);
    if(byId('v14HistoryResultText'))byId('v14HistoryResultText').textContent=`${rows.length} ${rows.length===1?'resultado':'resultados'} • ${label}`;
    if(byId('v14ProductsPeriod'))byId('v14ProductsPeriod').textContent=label;
    if(byId('v14CategoriesPeriod'))byId('v14CategoriesPeriod').textContent=label;
    const products=[...a.products.values()].sort((x,y)=>y.qty-x.qty||y.revenue-x.revenue).slice(0,7);
    const categories=[...a.categories.values()].sort((x,y)=>y.revenue-x.revenue||y.qty-x.qty).slice(0,7);
    renderRank('v14TopProducts',products,'qty',r=>`${r.qty} un. • ${moneyValue(r.revenue)}`,'Sem itens vendidos neste período.');
    renderRank('v14TopCategories',categories,'revenue',r=>`${moneyValue(r.revenue)} • ${r.qty} un.`,'Sem categorias vendidas neste período.');
    const list=byId('historyList');if(list){
      list.innerHTML='';
      rows.forEach(h=>{
        const physical=new Date(closedAt(h)),op=dateLabel(commandBusinessDate(h)),items=recordItems(h).reduce((s,x)=>s+x.qty,0),method=h?.paymentMethod?` • ${h.paymentMethod}`:'';
        const el=document.createElement('button');el.type='button';el.className='history-item v14-history-item';el.onclick=()=>window.v14OpenHistoryDetail?.(h.id,h.closedAt);
        el.innerHTML=`<div class="history-top"><div><h4>${esc(commandDisplay(h))}</h4><p>${items} ${items===1?'item':'itens'} • Turno ${esc(op)} • fechado ${esc(physical.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'}))} às ${esc(physical.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}))}${esc(method)}</p></div><div class="money">${esc(moneyValue(recordTotal(h)))}</div></div><div class="v14-history-open">Ver detalhes ›</div>`;
        list.appendChild(el);
      });
    }
    const empty=byId('historyEmpty');if(empty)empty.style.display=rows.length?'none':'block';
    renderTurnSummary();
    try{window.Rota27V02537InternalConsumption?.renderHistory?.();}catch{}
    return true;
  }

  function summaryForMode(){
    if(historyMode===MODE_CURRENT){
      const s=currentSummary();return {title:'Resumo do turno atual',subtitle:'Dados da data operacional desde o último fechamento.',date:s.businessDate,revenue:s.revenue,closedCount:s.closedCount,avgTicket:s.avgTicket,units:s.units,cancelled:0,payments:s.payments,products:[...s.products.values?.()||[]]};
    }
    if(historyMode===MODE_LAST){
      const c=latestClosure();if(!c)return {title:'Último turno fechado',subtitle:'Nenhum fechamento disponível.',date:'',revenue:0,closedCount:0,avgTicket:0,units:0,cancelled:0,payments:[],products:[]};
      const s=c.summary||{};return {title:'Último turno fechado',subtitle:`Turno operacional • fechado ${new Date(Number(c.closedAt||0)).toLocaleDateString('pt-BR')} às ${new Date(Number(c.closedAt||0)).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}`,date:c.businessDate,revenue:Number(s.revenue||0),closedCount:Number(s.closedCount||0),avgTicket:Number(s.avgTicket||0),units:Number(s.units||0),cancelled:Number(s.cancelled||0),payments:Array.isArray(s.payments)?s.payments:[],products:Array.isArray(s.products)?s.products:[]};
    }
    const rows=periodRows(),a=analytics(rows);return {title:historyMode===MODE_DATE?'Resumo da data específica':'Resumo operacional do período',subtitle:periodLabel(),date:historyMode===MODE_DATE?historyDate:'',revenue:a.revenue,closedCount:a.commands,avgTicket:a.avgTicket,units:a.units,cancelled:0,payments:a.payments,products:[...a.products.values()]};
  }
  function renderTurnSummary(){
    const box=byId('v018TurnSummary');if(!box)return false;
    const extension=byId('v019TurnCloseCard');const s=summaryForMode();
    const payHtml=s.payments?.length?s.payments.map(p=>`<div class="v018-turn-row"><strong>${esc(p.name)}</strong><span>${esc(moneyValue(p.value))}</span></div>`).join(''):'<div class="v018-turn-empty">Nenhuma forma de pagamento neste recorte.</div>';
    const products=(s.products||[]).slice(0,5);const topHtml=products.length?products.map(p=>`<div class="v018-turn-row"><strong>${esc(p.name)}</strong><span>${esc(`${Number(p.qty||0)} un. • ${moneyValue(Number(p.revenue||0))}`)}</span></div>`).join(''):'<div class="v018-turn-empty">Nenhum item vendido neste recorte.</div>';
    box.innerHTML=`<div class="v018-turn-head"><div><h3>${esc(s.title)}</h3><p>${esc(s.subtitle)}</p></div>${s.date?`<span class="v018-turn-date">${esc(dateLabel(s.date))}</span>`:''}</div><div class="v018-turn-metrics">${metric('Faturamento do turno',moneyValue(s.revenue),`${s.closedCount} ${s.closedCount===1?'comanda fechada':'comandas fechadas'}`)}${metric('Ticket médio',moneyValue(s.avgTicket),'por comanda')}${metric('Comandas fechadas',String(s.closedCount),'no recorte operacional')}${metric('Itens vendidos',String(s.units),'unidades faturadas')}${metric('Canceladas',String(s.cancelled||0),'não entram no faturamento')}</div><div class="v018-turn-grid"><div class="v018-turn-panel"><h4>Mais vendidos</h4><div class="v018-turn-list">${topHtml}</div></div><div class="v018-turn-panel"><h4>Formas de pagamento</h4><div class="v018-turn-list">${payHtml}</div></div></div><div class="v02563-summary-note">A data operacional vem da abertura da comanda. O horário físico de fechamento não muda o turno ao qual a venda pertence.</div>`;
    if(extension)box.appendChild(extension);
    return true;
  }

  function installHistoryBridge(){
    const current=window.renderHistory;
    if(typeof current!=='function'||current.__v02563Operational===true)return;
    baseRenderHistory=current;
    const wrapped=function(){const r=baseRenderHistory.apply(this,arguments);historySearch=byId('v14HistorySearch')?.value||historySearch;renderHistoryOperational();return r;};
    wrapped.__v02563Operational=true;wrapped.__v02563Base=baseRenderHistory;
    try{window.renderHistory=wrapped;renderHistory=wrapped;}catch{}
  }
  function handleCapture(e){
    const btn=e.target.closest?.('#v14HistoryToolbar [data-period],#v02521YesterdayBtn,#v02563DateBtn');
    if(btn){
      const mode=btn.dataset.v02563Mode||(btn.id==='v02521YesterdayBtn'?MODE_LAST:btn.dataset.period);
      if([MODE_CURRENT,MODE_LAST,MODE_7D,MODE_30D,MODE_ALL,MODE_DATE].includes(mode)){
        e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
        if(mode===MODE_DATE&&!validDateKey(historyDate))historyDate=currentBusinessDate();
        historyMode=mode;renderHistoryOperational();
        if(mode===MODE_DATE)setTimeout(()=>byId('v02563DateInput')?.focus(),0);
        return;
      }
    }
    if(e.type==='change'&&e.target?.id==='v02563DateInput'){
      const selected=String(e.target.value||'');
      if(validDateKey(selected)){e.stopPropagation();e.stopImmediatePropagation();historyDate=selected;historyMode=MODE_DATE;renderHistoryOperational();}
      return;
    }
    if(e.type==='input'&&e.target?.id==='v14HistorySearch'){
      e.stopPropagation();e.stopImmediatePropagation();historySearch=e.target.value||'';renderHistoryOperational();
    }
  }

  function refresh(){
    installSaveBridge();normalizeOperationalFields();installPanelBridge();decoratePanel();installHistoryBridge();ensureHistoryControls();
    if(byId('screenHistory')?.classList.contains('active'))renderHistoryOperational();
  }
  function start(){
    installSaveBridge();normalizeOperationalFields();installPanelBridge();installHistoryBridge();
    document.addEventListener('click',handleCapture,true);
    document.addEventListener('input',handleCapture,true);
    document.addEventListener('change',handleCapture,true);
    window.addEventListener('rota27:v018-summary-rendered',renderTurnSummary);
    ['rota27:v017-domain-updated','rota27:v02512-receivables-updated','rota27:v02537-internal-updated','rota27:v021-stock-updated','rota27:v022-purchases-updated'].forEach(name=>window.addEventListener(name,refresh));
    window.addEventListener('storage',refresh);window.addEventListener('online',refresh);window.addEventListener('offline',refresh);
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refresh();});
    document.addEventListener('click',e=>{if(e.target.closest?.('#navPanel'))requestAnimationFrame(decoratePanel);if(e.target.closest?.('#navHistory'))requestAnimationFrame(()=>{ensureHistoryControls();renderHistoryOperational();});});
    requestAnimationFrame(refresh);
    window.Rota27V02563Operational={version:VERSION,refresh,decoratePanel,renderHistory:renderHistoryOperational,currentBusinessDate,currentSummary,commandBusinessDate,filteredHistoryRows:()=>periodRows().filter(matchesSearch),historyLabel:periodLabel};
    console.info('[Rota27] v0.25.63 — coerência operacional de turnos ativa.');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
