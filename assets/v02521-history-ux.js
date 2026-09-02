/* Rota 27 v0.25.21 — aba Ontem baseada no último fechamento do dia anterior */
(function(){
  'use strict';

  const VERSION='0.25.21';
  const CLOSURE_STORE_KEY='rota27_v019_turn_closures_v1';
  let yesterdayMode=false;
  let baseRenderHistory=null;
  let rerenderTimer=null;

  const byId=id=>document.getElementById(id);
  const esc=v=>typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]||ch));
  const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLocaleLowerCase('pt-BR');
  const moneyValue=v=>{try{return typeof money==='function'?money(Number(v||0)):Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}catch{return 'R$ 0,00';}};

  function dateKey(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
  function yesterdayKey(){const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-1);return dateKey(d);}
  function dateLabel(key){const [y,m,d]=String(key||'').split('-');return y&&m&&d?`${d}/${m}/${y}`:String(key||'');}
  function startOfDay(key){const [y,m,d]=String(key||'').split('-').map(Number);return new Date(y,m-1,d,0,0,0,0).getTime();}
  function readJson(key,fallback){try{const v=JSON.parse(localStorage.getItem(key)||'null');return v==null?fallback:v;}catch{return fallback;}}

  function closures(){
    try{
      const viaApi=window.Rota27V019?.getClosures?.();
      if(Array.isArray(viaApi))return viaApi.slice().sort((a,b)=>Number(b?.closedAt||0)-Number(a?.closedAt||0));
    }catch{}
    const rows=readJson(CLOSURE_STORE_KEY,[]);
    return (Array.isArray(rows)?rows:[]).slice().sort((a,b)=>Number(b?.closedAt||0)-Number(a?.closedAt||0));
  }

  function yesterdayClosure(){
    const key=yesterdayKey();
    return closures().filter(c=>String(c?.businessDate||'')===key).sort((a,b)=>Number(b?.closedAt||0)-Number(a?.closedAt||0))[0]||null;
  }

  function openedAt(c){
    const t=Number(c?.createdAt||c?.openedAt||0);
    if(Number.isFinite(t)&&t>0)return t;
    const f=Number(c?.closedAt||c?.updatedAt||0);
    return Number.isFinite(f)&&f>0?f:0;
  }

  function commandBusinessDate(c){
    const explicit=String(c?.businessDate||c?.operationalDate||'').trim();
    if(/^\d{4}-\d{2}-\d{2}$/.test(explicit))return explicit;
    const t=openedAt(c);return t?dateKey(new Date(t)):'';
  }

  function cutoffForClosure(target){
    if(!target)return 0;
    const rows=closures().filter(c=>String(c?.businessDate||'')===String(target.businessDate)&&Number(c?.closedAt||0)<Number(target.closedAt||0));
    const previous=rows.sort((a,b)=>Number(b.closedAt||0)-Number(a.closedAt||0))[0];
    return previous?Number(previous.closedAt||0):startOfDay(target.businessDate)-1;
  }

  function currentProduct(id){return Array.isArray(state?.catalog)?state.catalog.find(p=>String(p?.id||'')===String(id)):null;}
  function itemSnapshot(command,id){
    const current=currentProduct(id),meta=command?.itemMeta?.[id]&&typeof command.itemMeta[id]==='object'?command.itemMeta[id]:{};
    return {
      id:String(id),
      name:String(current?.name||meta?.name||'Produto removido'),
      category:String(meta?.categoryName||meta?.cat||meta?.category||current?.cat||current?.category||'Outros'),
      price:Number(meta?.price??current?.price??0)||0
    };
  }
  function recordTotal(c){
    if(Number.isFinite(Number(c?.total)))return Number(c.total);
    try{if(typeof commandTotal==='function')return Number(commandTotal(c)||0);}catch{}
    return Object.entries(c?.items||{}).reduce((sum,[id,q])=>sum+Number(q||0)*itemSnapshot(c,id).price,0);
  }
  function recordItems(c){return Object.entries(c?.items||{}).filter(([,q])=>Number(q)>0).map(([id,q])=>({product:itemSnapshot(c,id),qty:Number(q)}));}
  function commandDisplay(c){try{if(typeof commandLabel==='function')return commandLabel(c);}catch{}return [c?.table,c?.customer].filter(Boolean).join(' • ')||'Comanda';}

  function rawRowsForClosure(closure){
    if(!closure)return [];
    const cutoff=cutoffForClosure(closure),end=Number(closure.closedAt||0),key=String(closure.businessDate||'');
    return (Array.isArray(state?.history)?state.history:[])
      .filter(c=>c?.cancelled!==true)
      .filter(c=>commandBusinessDate(c)===key)
      .filter(c=>{const t=openedAt(c);return t>cutoff&&(!end||t<=end);})
      .sort((a,b)=>Number(b?.closedAt||0)-Number(a?.closedAt||0));
  }

  function matchesSearch(c,q){
    if(!q)return true;
    const products=Object.keys(c?.items||{}).flatMap(id=>{
      const current=currentProduct(id),meta=c?.itemMeta?.[id]||{};
      return [current?.name,meta?.name].filter(Boolean);
    }).join(' ');
    return norm([commandDisplay(c),c?.table,c?.customer,c?.paymentMethod,products].filter(Boolean).join(' ')).includes(q);
  }

  function analytics(rows){
    const out={revenue:0,commands:rows.length,units:0,avgTicket:0,products:new Map(),categories:new Map()};
    rows.forEach(c=>{
      out.revenue+=recordTotal(c);
      recordItems(c).forEach(({product,qty})=>{
        out.units+=qty;
        const pk=product.id||product.name,p=out.products.get(pk)||{id:pk,name:product.name,qty:0,revenue:0};
        p.name=product.name;p.qty+=qty;p.revenue+=qty*product.price;out.products.set(pk,p);
        const ck=norm(product.category||'Outros'),cat=out.categories.get(ck)||{name:product.category||'Outros',qty:0,revenue:0};
        cat.qty+=qty;cat.revenue+=qty*product.price;out.categories.set(ck,cat);
      });
    });
    out.avgTicket=out.commands?out.revenue/out.commands:0;
    return out;
  }

  function metric(label,value,hint){return `<div class="v14-metric"><small>${esc(label)}</small><strong>${esc(value)}</strong>${hint?`<span>${esc(hint)}</span>`:''}</div>`;}
  function renderRank(targetId,rows,valueKey,formatter,emptyText){
    const target=byId(targetId);if(!target)return;
    if(!rows.length){target.innerHTML=`<div class="v14-mini-empty">${esc(emptyText)}</div>`;return;}
    const max=Math.max(...rows.map(r=>Number(r[valueKey]||0)),1);
    target.innerHTML=rows.map((r,i)=>`<div class="v14-rank-row"><div class="v14-rank-line"><strong>${i+1}. ${esc(r.name)}</strong><span>${esc(formatter(r))}</span></div><div class="v14-bar"><i style="width:${Math.max(6,Math.round(Number(r[valueKey]||0)/max*100))}%"></i></div></div>`).join('');
  }

  function ensureNote(){
    const toolbar=byId('v14HistoryToolbar');if(!toolbar)return null;
    let note=byId('v02521LastCloseNote');
    if(!note){note=document.createElement('div');note.id='v02521LastCloseNote';note.className='v02521-last-close-note';note.hidden=true;toolbar.insertAdjacentElement('afterend',note);}
    return note;
  }

  function ensureYesterdayTab(){
    const periods=document.querySelector('#v14HistoryToolbar .v14-periods');if(!periods)return false;
    let btn=byId('v02521YesterdayBtn');
    if(!btn){
      btn=document.createElement('button');btn.type='button';btn.id='v02521YesterdayBtn';btn.className='v02521-yesterday';btn.textContent='Ontem';
      const today=periods.querySelector('[data-period="today"]');today?.insertAdjacentElement('afterend',btn);
      btn.addEventListener('click',()=>{yesterdayMode=true;periods.querySelectorAll('[data-period]').forEach(x=>x.classList.remove('active'));btn.classList.add('active');renderYesterday();});
    }
    return true;
  }

  function renderEmptyYesterday(){
    const note=ensureNote();if(note){note.hidden=false;note.innerHTML=`<div><strong>Nenhum fechamento de ontem</strong><span>Não há turno fechado para ${esc(dateLabel(yesterdayKey()))} neste aparelho.</span></div>`;}
    const metrics=byId('v14Metrics');if(metrics)metrics.innerHTML=[metric('Faturamento',moneyValue(0),'Ontem'),metric('Comandas','0','contas fechadas'),metric('Ticket médio',moneyValue(0),'por comanda'),metric('Itens vendidos','0','unidades')].join('');
    if(byId('historyCount'))byId('historyCount').textContent='0';
    if(byId('v14HistoryResultText'))byId('v14HistoryResultText').textContent=`0 resultados • Ontem (${dateLabel(yesterdayKey())})`;
    if(byId('v14ProductsPeriod'))byId('v14ProductsPeriod').textContent='Ontem';
    if(byId('v14CategoriesPeriod'))byId('v14CategoriesPeriod').textContent='Ontem';
    renderRank('v14TopProducts',[],'qty',()=>'', 'Sem itens vendidos no fechamento de ontem.');
    renderRank('v14TopCategories',[],'revenue',()=>'', 'Sem categorias vendidas no fechamento de ontem.');
    const list=byId('historyList');if(list)list.innerHTML='';
    const empty=byId('historyEmpty');if(empty){empty.style.display='block';const p=empty.querySelector('p');if(p)p.textContent='Ainda não existe fechamento operacional para ontem.';}
  }

  function renderYesterday(){
    if(!yesterdayMode)return;
    ensureYesterdayTab();
    const btn=byId('v02521YesterdayBtn');document.querySelectorAll('#v14HistoryToolbar [data-period]').forEach(x=>x.classList.remove('active'));btn?.classList.add('active');
    const closure=yesterdayClosure();if(!closure){renderEmptyYesterday();return;}
    const search=norm(byId('v14HistorySearch')?.value||''),allRows=rawRowsForClosure(closure),rows=allRows.filter(c=>matchesSearch(c,search));
    const a=analytics(rows),summary=closure.summary||{},usingSearch=!!search;
    const revenue=usingSearch?a.revenue:Number(summary.revenue??a.revenue)||0;
    const commands=usingSearch?a.commands:Number(summary.closedCount??a.commands)||0;
    const units=usingSearch?a.units:Number(summary.units??a.units)||0;
    const avgTicket=usingSearch?a.avgTicket:Number(summary.avgTicket??(commands?revenue/commands:0))||0;
    const label=`Ontem • ${dateLabel(closure.businessDate)}`;

    const note=ensureNote();if(note){
      const closed=new Date(Number(closure.closedAt||0));
      note.hidden=false;note.innerHTML=`<div><strong>Último fechamento de ontem</strong><span>Turno operacional ${esc(dateLabel(closure.businessDate))} • fechado em ${esc(closure.deviceName||'Aparelho')}</span></div><span>${esc(closed.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}))}</span>`;
    }

    const metrics=byId('v14Metrics');if(metrics)metrics.innerHTML=[metric('Faturamento',moneyValue(revenue),label),metric('Comandas',String(commands),commands===1?'conta fechada':'contas fechadas'),metric('Ticket médio',moneyValue(avgTicket),'por comanda'),metric('Itens vendidos',String(units),'unidades')].join('');
    if(byId('historyCount'))byId('historyCount').textContent=String(usingSearch?rows.length:commands);
    if(byId('v14HistoryResultText'))byId('v14HistoryResultText').textContent=`${usingSearch?rows.length:commands} ${((usingSearch?rows.length:commands)===1)?'resultado':'resultados'} • ${label}`;
    if(byId('v14ProductsPeriod'))byId('v14ProductsPeriod').textContent=label;
    if(byId('v14CategoriesPeriod'))byId('v14CategoriesPeriod').textContent=label;

    const products=[...a.products.values()].sort((x,y)=>y.qty-x.qty||y.revenue-x.revenue).slice(0,7);
    const categories=[...a.categories.values()].sort((x,y)=>y.revenue-x.revenue||y.qty-x.qty).slice(0,7);
    renderRank('v14TopProducts',products,'qty',r=>`${r.qty} un. • ${moneyValue(r.revenue)}`,'Sem itens vendidos neste fechamento.');
    renderRank('v14TopCategories',categories,'revenue',r=>`${moneyValue(r.revenue)} • ${r.qty} un.`,'Sem categorias vendidas neste fechamento.');

    const list=byId('historyList');if(list){
      list.innerHTML='';rows.forEach(h=>{
        const d=new Date(Number(h.closedAt||0)),itemCount=recordItems(h).reduce((s,x)=>s+x.qty,0),method=h.paymentMethod?` • ${h.paymentMethod}`:'';
        const el=document.createElement('button');el.type='button';el.className='history-item v14-history-item';el.onclick=()=>window.v14OpenHistoryDetail?.(h.id,h.closedAt);
        el.innerHTML=`<div class="history-top"><div><h4>${esc(commandDisplay(h))}</h4><p>${itemCount} ${itemCount===1?'item':'itens'} • ${esc(d.toLocaleDateString('pt-BR'))} às ${esc(d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}))}${esc(method)}</p></div><div class="money">${esc(moneyValue(recordTotal(h)))}</div></div><div class="v14-history-open">Ver detalhes ›</div>`;
        list.appendChild(el);
      });
    }
    const empty=byId('historyEmpty');if(empty)empty.style.display=rows.length?'none':'block';
  }

  function scheduleYesterday(delay=0){if(!yesterdayMode)return;clearTimeout(rerenderTimer);rerenderTimer=setTimeout(renderYesterday,delay);}

  function syncSearchToBaseHistory(){
    const input=byId('v14HistorySearch');
    if(!input)return;
    const empty=byId('historyEmpty')?.querySelector('p');
    if(empty)empty.textContent='Altere o período ou a busca para ver outros resultados.';
    input.dispatchEvent(new Event('input',{bubbles:true}));
  }

  function wrapRenderHistory(){
    if(baseRenderHistory||typeof window.renderHistory!=='function')return;
    baseRenderHistory=window.renderHistory;
    const patched=function(){const result=baseRenderHistory.apply(this,arguments);ensureYesterdayTab();if(yesterdayMode){renderYesterday();scheduleYesterday(100);}else{const note=ensureNote();if(note)note.hidden=true;}return result;};
    patched.__v02521=true;
    try{window.renderHistory=patched;}catch{}
    try{renderHistory=patched;}catch{}
  }

  function bindEvents(){
    document.addEventListener('click',e=>{
      if(e.target.closest?.('#v14HistoryToolbar [data-period]')){
        yesterdayMode=false;byId('v02521YesterdayBtn')?.classList.remove('active');const note=ensureNote();if(note)note.hidden=true;
        setTimeout(syncSearchToBaseHistory,0);
      }
      if(yesterdayMode&&e.target.closest?.('[data-screen="history"],[data-target="history"],#navHistory'))scheduleYesterday(130);
    });
    document.addEventListener('input',e=>{
      if(!yesterdayMode||e.target?.id!=='v14HistorySearch')return;
      e.stopPropagation();e.stopImmediatePropagation();renderYesterday();
    },true);
    window.addEventListener('storage',()=>scheduleYesterday(130));
    window.addEventListener('rota27:v019-turn-updated',()=>scheduleYesterday(130));
    window.addEventListener('rota27:v017-domain-updated',()=>scheduleYesterday(150));
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')scheduleYesterday(160);});
  }

  function start(){
    ensureYesterdayTab();wrapRenderHistory();bindEvents();
    setTimeout(()=>{ensureYesterdayTab();wrapRenderHistory();},500);
    window.Rota27V02521History={version:VERSION,isYesterdayMode:()=>yesterdayMode,renderYesterday,getYesterdayClosure:()=>JSON.parse(JSON.stringify(yesterdayClosure()||null))};
    console.info('[Rota27] v0.25.21 — aba Ontem e refinamento dos fechamentos carregados.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
