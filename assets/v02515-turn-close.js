/* Rota 27 v0.25.15 — data operacional do turno pela abertura da comanda | integridade v0.25.181 */
(function(){
  'use strict';
  const MODULE_VERSION='0.25.15';
  const RELEASE_FALLBACK='0.25.181';
  const STORE_KEY='rota27_v019_turn_closures_v1';
  const OUTBOX_KEY='rota27_v019_turn_outbox_v1';
  const CURSOR_KEY='rota27_v019_turn_cursor_v1';
  const META_KEY='rota27_v019_turn_meta_v1';
  const CANCEL_OUTBOX_KEY='rota27_cancel_outbox_v0151';
  const SYNC_CONFIG_KEY='rota27_sync_config_v1';
  const RECENT_WINDOW_MS=36*60*60*1000;
  let syncing=false,closing=false,renderTimer=null;

  const byId=id=>document.getElementById(id);
  const clone=v=>JSON.parse(JSON.stringify(v==null?null:v));
  const clean=(v,max=200)=>String(v??'').replace(/[\u0000-\u001F\u007F]/g,' ').trim().replace(/\s+/g,' ').slice(0,max);
  const esc=v=>typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]||ch));
  const moneyValue=v=>{try{return typeof money==='function'?money(Number(v||0)):Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}catch{return 'R$ 0,00';}};

  function localDateKey(d=new Date()){
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }
  function dateLabel(key){const [y,m,d]=String(key||'').split('-');return y&&m&&d?`${d}/${m}/${y}`:String(key||'');}
  function startOfDay(key=localDateKey()){const [y,m,d]=key.split('-').map(Number);return new Date(y,m-1,d,0,0,0,0).getTime();}
  function validDateKey(v){return /^\d{4}-\d{2}-\d{2}$/.test(String(v||''));}
  function readJson(key,fallback){try{const v=JSON.parse(localStorage.getItem(key)||'null');return v==null?fallback:v;}catch{return fallback;}}
  function writeJson(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}}
  function readArray(key){const v=readJson(key,[]);return Array.isArray(v)?v:[];}
  function notify(msg){try{typeof showToast==='function'?showToast(msg,false):console.info('[Rota27]',msg);}catch{}}
  function releaseVersion(){
    const roadmap=clean(window.Rota27Roadmap?.version||'',40);
    if(roadmap)return roadmap;
    const meta=clean(document.querySelector('meta[name="rota27-release-version"]')?.content||'',40);
    return meta||RELEASE_FALLBACK;
  }
  function closureShiftStartedAt(c){
    const raw=Number(c?.shiftStartedAt||c?.summary?.firstOpenedAt||c?.summary?.shiftStart||0);
    return Number.isFinite(raw)&&raw>0?Math.trunc(raw):0;
  }
  function closureKey(c){
    const businessDate=String(c?.businessDate||'').trim();
    const shiftStartedAt=closureShiftStartedAt(c);
    return validDateKey(businessDate)&&shiftStartedAt>0?`${businessDate}_${shiftStartedAt}`:'';
  }
  function canonicalClosureId(c){const key=closureKey(c);return key?`turn_${key}`:String(c?.id||'');}
  function sameClosureWindow(a,b){
    const ak=closureKey(a),bk=closureKey(b);
    if(ak&&bk)return ak===bk;
    return !!a?.id&&!!b?.id&&String(a.id)===String(b.id);
  }

  function readClosures(){
    const rows=readArray(STORE_KEY).filter(x=>x&&x.id&&x.businessDate).sort((a,b)=>Number(b.closedAt||0)-Number(a.closedAt||0));
    const seen=new Set();
    return rows.filter(row=>{
      const key=closureKey(row)||`id:${row.id}`;
      if(seen.has(key))return false;
      seen.add(key);return true;
    });
  }
  function writeClosures(rows){return writeJson(STORE_KEY,(Array.isArray(rows)?rows:[]).slice(0,900));}
  function closuresForDate(key=localDateKey()){return readClosures().filter(x=>String(x.businessDate)===String(key));}
  function lastClosure(key=localDateKey()){return closuresForDate(key)[0]||null;}
  function shiftCutoff(key){const last=lastClosure(key);return last?Number(last.closedAt||0):startOfDay(key)-1;}
  function addClosure(row){
    const incoming=clone(row);
    const canonicalId=canonicalClosureId(incoming);
    if(canonicalId)incoming.id=canonicalId;
    const rows=readClosures();
    if(rows.some(x=>sameClosureWindow(x,incoming)))return false;
    rows.push(incoming);rows.sort((a,b)=>Number(b.closedAt||0)-Number(a.closedAt||0));return writeClosures(rows);
  }

  function openedAt(c){
    const t=Number(c?.createdAt||c?.openedAt||0);
    if(Number.isFinite(t)&&t>0)return t;
    const fallback=Number(c?.closedAt||c?.updatedAt||0);
    return Number.isFinite(fallback)&&fallback>0?fallback:0;
  }
  function activityAt(c){return Math.max(Number(c?.closedAt||0),Number(c?.updatedAt||0),openedAt(c));}
  function commandBusinessDate(c){
    const explicit=String(c?.businessDate||c?.operationalDate||'').trim();
    if(validDateKey(explicit))return explicit;
    const t=openedAt(c);
    return t?localDateKey(new Date(t)):localDateKey();
  }
  function belongsToShift(c,key){
    if(commandBusinessDate(c)!==key)return false;
    const opened=openedAt(c);
    return opened>shiftCutoff(key);
  }

  function itemSnapshot(c,id){
    const meta=c?.itemMeta?.[id];
    if(meta)return{name:String(meta.name||'Produto'),price:Number(meta.price||0)};
    const p=Array.isArray(state?.catalog)?state.catalog.find(x=>String(x.id)===String(id)):null;
    return p?{name:String(p.name||'Produto'),price:Number(p.price||0)}:{name:'Produto',price:0};
  }
  function recordTotal(c){
    if(Number.isFinite(Number(c?.total)))return Number(c.total);
    try{if(typeof commandTotal==='function')return Number(commandTotal(c)||0);}catch{}
    return Object.entries(c?.items||{}).reduce((s,[id,q])=>s+Number(q||0)*Number(itemSnapshot(c,id).price||0),0);
  }
  function recordItems(c){return Object.entries(c?.items||{}).filter(([,q])=>Number(q)>0).map(([id,q])=>({product:itemSnapshot(c,id),qty:Number(q)}));}

  function buildSummaryForDate(key){
    const closed=(Array.isArray(state?.history)?state.history:[]).filter(c=>belongsToShift(c,key));
    const open=(Array.isArray(state?.commands)?state.commands:[]).filter(c=>c?.cancelled!==true&&belongsToShift(c,key));
    const included=[...closed,...open];
    const firstOpenedAt=included.reduce((min,c)=>{const t=openedAt(c);return t>0&&(!min||t<min)?t:min;},0);
    let revenue=0,units=0,openValue=0;
    const products=new Map(),payments=new Map();
    closed.forEach(c=>{
      const total=recordTotal(c);revenue+=total;
      const payment=String(c?.paymentMethod||'').trim()||'Não informado';
      payments.set(payment,(payments.get(payment)||0)+total);
      recordItems(c).forEach(({product,qty})=>{units+=qty;const k=product.name||'Produto',r=products.get(k)||{name:k,qty:0,revenue:0};r.qty+=qty;r.revenue+=qty*Number(product.price||0);products.set(k,r);});
    });
    open.forEach(c=>openValue+=recordTotal(c));
    let cancelled=0,auditEvents=0,auditServerSynced=false;
    if(!lastClosure(key)&&key===localDateKey()){
      try{const a=window.Rota27V0181?.todayStats?.()||{};cancelled=Number(a.cancelled||0);auditEvents=Number(a.events||0);auditServerSynced=a.serverSynced===true;}catch{}
    }
    return {
      businessDate:key,
      revenue:Number(revenue||0),closedCount:closed.length,openCount:open.length,openValue:Number(openValue||0),
      avgTicket:closed.length?revenue/closed.length:0,units,cancelled,auditEvents,auditServerSynced,
      products:[...products.values()].sort((a,b)=>b.qty-a.qty||b.revenue-a.revenue).slice(0,10),
      payments:[...payments.entries()].map(([name,value])=>({name,value:Number(value||0)})).sort((a,b)=>b.value-a.value),
      shiftStart:firstOpenedAt||Math.max(startOfDay(key),shiftCutoff(key)+1),firstOpenedAt
    };
  }
  function openMovementDates(){
    const set=new Set();
    (Array.isArray(state?.commands)?state.commands:[]).filter(c=>c?.cancelled!==true).forEach(c=>set.add(commandBusinessDate(c)));
    return [...set].filter(validDateKey).sort();
  }
  function recentMovementDates(){
    const limit=Date.now()-RECENT_WINDOW_MS,set=new Set();
    (Array.isArray(state?.history)?state.history:[]).forEach(c=>{if(activityAt(c)>=limit)set.add(commandBusinessDate(c));});
    set.add(localDateKey());
    return [...set].filter(validDateKey).sort();
  }
  function currentBusinessDate(){
    for(const key of openMovementDates()){
      const s=buildSummaryForDate(key);
      if(s.openCount>0)return key;
    }
    for(const key of recentMovementDates()){
      const s=buildSummaryForDate(key);
      if(s.closedCount>0)return key;
    }
    return localDateKey();
  }
  function buildSummary(key=currentBusinessDate()){return buildSummaryForDate(validDateKey(key)?key:currentBusinessDate());}

  function blockers(summary=buildSummary()){
    const rows=[];
    if(summary.openCount>0)rows.push(`${summary.openCount} ${summary.openCount===1?'comanda aberta':'comandas abertas'} (${moneyValue(summary.openValue)}).`);
    const cancels=readArray(CANCEL_OUTBOX_KEY).length;
    if(cancels>0)rows.push(`${cancels} ${cancels===1?'cancelamento ainda aguarda':'cancelamentos ainda aguardam'} confirmação da sincronização.`);
    return rows;
  }

  function syncConfig(){const c=readJson(SYNC_CONFIG_KEY,{});return c&&typeof c==='object'?c:{};}
  function syncReady(){const c=syncConfig();return c.enabled===true&&c.initialized===true&&/^https:\/\/.+\/functions\/v1\/rota27-sync\/?$/i.test(String(c.functionUrl||''))&&String(c.deviceToken||'').length>=16&&!!c.deviceId;}
  function deviceMeta(){const c=syncConfig();return{deviceId:clean(c.deviceId||'local',120)||'local',deviceName:clean(c.deviceName||'Este aparelho',80)||'Este aparelho',storeId:clean(c.storeId||'rota27-bodega',80)||'rota27-bodega'};}
  function readOutbox(){return readArray(OUTBOX_KEY);}
  function writeOutbox(rows){writeJson(OUTBOX_KEY,(Array.isArray(rows)?rows:[]).slice(-180));}
  function eventForClosure(c){
    const dm=deviceMeta(),normalized=clone(c),canonicalId=canonicalClosureId(c)||String(c?.id||'');
    normalized.id=canonicalId;
    return{eventId:`turn_closed_${canonicalId}`,eventType:'turn_closed',entityId:canonicalId,payload:{closure:normalized},deviceId:dm.deviceId,createdAt:new Date(Number(c.closedAt||Date.now())).toISOString(),appVersion:releaseVersion()};
  }
  function queueClosure(c){const evt=eventForClosure(c),rows=readOutbox().filter(x=>String(x.eventId)!==evt.eventId);rows.push(evt);writeOutbox(rows);}
  function getCursor(){return Math.max(0,Number(localStorage.getItem(CURSOR_KEY)||0));}
  function setCursor(v){localStorage.setItem(CURSOR_KEY,String(Math.max(0,Number(v||0))));}
  async function syncApi(body){
    const c=syncConfig();if(!syncReady())throw new Error('Sincronização não configurada neste aparelho.');
    const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),12000);
    try{
      const r=await fetch(String(c.functionUrl).replace(/\/+$/,''),{method:'POST',headers:{'content-type':'application/json','x-rota27-device-token':String(c.deviceToken)},body:JSON.stringify({...body,deviceId:c.deviceId,deviceName:c.deviceName||'Aparelho',storeId:c.storeId||'rota27-bodega',appVersion:releaseVersion()}),signal:ctrl.signal});
      const data=await r.json().catch(()=>({}));if(!r.ok||data.ok!==true)throw new Error(data.error||`HTTP ${r.status}`);return data;
    }finally{clearTimeout(timer);}
  }
  async function pushOutbox(){let rows=readOutbox();while(rows.length){const batch=rows.slice(0,50);await syncApi({action:'push',events:batch});const sent=new Set(batch.map(x=>String(x.eventId)));rows=readOutbox().filter(x=>!sent.has(String(x.eventId)));writeOutbox(rows);}}
  function applyRemote(evt){
    const raw=evt?.payload?.closure;if(!raw||typeof raw!=='object'||!raw.businessDate)return false;
    const incoming={...clone(raw),businessDate:String(raw.businessDate)};
    incoming.id=canonicalClosureId(incoming)||String(raw.id||`turn_${raw.businessDate}_${raw.closedAt||evt.seq}`);
    return addClosure(incoming);
  }
  async function pullEvents(){let cursor=getCursor(),changed=false;for(let page=0;page<40;page++){const data=await syncApi({action:'pull',afterSeq:cursor,limit:500,preferSnapshot:false}),events=Array.isArray(data.events)?data.events:[];for(const evt of events){cursor=Math.max(cursor,Number(evt.seq||0));if(String(evt.event_type||evt.eventType)==='turn_closed'&&applyRemote(evt))changed=true;}cursor=Math.max(cursor,Number(data.cursor||cursor));setCursor(cursor);if(!data.hasMore||!events.length)break;}return changed;}
  async function syncTurnNow(){if(syncing||!navigator.onLine||!syncReady())return false;syncing=true;try{await pushOutbox();const changed=await pullEvents();writeJson(META_KEY,{...readJson(META_KEY,{}),lastSyncAt:Date.now(),lastError:''});if(changed)refresh();return true;}catch(err){writeJson(META_KEY,{...readJson(META_KEY,{}),lastError:clean(err?.message||'Falha ao sincronizar fechamento.',260)});return false;}finally{syncing=false;renderTurnCard();renderOpenSheets();}}

  function metric(label,value){return `<div class="v019-preview-metric"><small>${esc(label)}</small><strong>${esc(value)}</strong></div>`;}
  function paymentsHtml(rows){return rows?.length?rows.map(p=>`<div class="v019-preview-row"><span>${esc(p.name)}</span><span>${esc(moneyValue(p.value))}</span></div>`).join(''):'<div class="v019-preview-empty">Nenhum pagamento registrado.</div>';}
  function productsHtml(rows){return rows?.length?rows.slice(0,5).map(p=>`<div class="v019-preview-row"><span>${esc(p.name)}</span><span>${esc(`${p.qty} un.`)}</span></div>`).join(''):'<div class="v019-preview-empty">Nenhum item vendido.</div>';}
  function ensureCloseSheet(){
    if(byId('v019CloseWrap'))return;
    const w=document.createElement('div');w.id='v019CloseWrap';w.className='sheet-wrap';
    w.innerHTML=`<div class="sheet v019-sheet"><div class="handle"></div><div class="v019-head"><div><h3>Fechar turno</h3><p class="desc">A data operacional vem da abertura da comanda, mesmo quando o fechamento ocorre depois da meia-noite.</p></div><button type="button" class="v019-x" id="v019CloseX">×</button></div><div id="v019CloseGate" class="v019-gate"></div><div id="v019CloseBody"></div><div class="sheet-actions"><button type="button" class="secondary" id="v019CloseCancel">Voltar</button><button type="button" class="primary" id="v019CloseConfirm">Fechar turno agora</button></div></div>`;
    document.body.appendChild(w);w.addEventListener('click',e=>{if(e.target===w)w.classList.remove('open');});byId('v019CloseX').onclick=()=>w.classList.remove('open');byId('v019CloseCancel').onclick=()=>w.classList.remove('open');byId('v019CloseConfirm').onclick=finalizeClose;
  }
  function ensureHistorySheet(){
    if(byId('v019HistoryWrap'))return;
    const w=document.createElement('div');w.id='v019HistoryWrap';w.className='sheet-wrap';
    w.innerHTML=`<div class="sheet v019-sheet"><div class="handle"></div><div class="v019-head"><div><h3>Fechamentos</h3><p class="desc">A data exibida é a data operacional do turno; o horário é o fechamento real.</p></div><button type="button" class="v019-x" id="v019HistoryX">×</button></div><div id="v019HistoryStatus" class="v019-gate"></div><div id="v019HistoryList" class="v019-history-list"></div><div class="sheet-actions"><button type="button" class="secondary" id="v019HistorySync">Sincronizar</button><button type="button" class="primary" id="v019HistoryDone">Concluir</button></div></div>`;
    document.body.appendChild(w);w.addEventListener('click',e=>{if(e.target===w)w.classList.remove('open');});byId('v019HistoryX').onclick=()=>w.classList.remove('open');byId('v019HistoryDone').onclick=()=>w.classList.remove('open');byId('v019HistorySync').onclick=async()=>{await syncTurnNow();renderHistorySheet();};
  }
  function renderCloseSheet(){
    ensureCloseSheet();
    const gate=byId('v019CloseGate'),body=byId('v019CloseBody'),confirm=byId('v019CloseConfirm'),summary=buildSummary(),blocked=blockers(summary),last=lastClosure(summary.businessDate);
    if(!gate||!body||!confirm)return;
    const hasMovement=summary.closedCount>0||summary.openCount>0;
    const dateText=`Turno operacional ${dateLabel(summary.businessDate)} • definido pela abertura da comanda.`;
    if(blocked.length){gate.className='v019-gate block';gate.innerHTML=`<strong>Não é possível fechar ainda.</strong><br>${esc(dateText)}<br>${blocked.map(esc).join('<br>')}`;confirm.disabled=true;confirm.textContent='Resolver pendências';}
    else if(!hasMovement){gate.className='v019-gate ok';gate.textContent=last?`${dateText} Último turno desta data fechado às ${new Date(Number(last.closedAt)).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}.`:`${dateText} Ainda não há movimento para fechar.`;confirm.disabled=true;confirm.textContent='Sem movimento';}
    else{gate.className='v019-gate ok';gate.textContent=`${dateText} ${last?'Novo turno desta data conferido.':'Conferência concluída.'}`;confirm.disabled=false;confirm.textContent='Fechar turno agora';}
    if(closing){confirm.disabled=true;confirm.textContent='Conferindo…';}
    body.innerHTML=`<div class="v019-preview-metrics">${metric('Faturamento',moneyValue(summary.revenue))}${metric('Fechadas',String(summary.closedCount))}${metric('Canceladas',String(summary.cancelled))}${metric('Ticket médio',moneyValue(summary.avgTicket))}${metric('Itens vendidos',String(summary.units))}${metric('Em aberto',`${summary.openCount} • ${moneyValue(summary.openValue)}`)}</div><div class="v019-preview-grid"><div class="v019-preview-panel"><h4>Formas de pagamento</h4>${paymentsHtml(summary.payments)}</div><div class="v019-preview-panel"><h4>Mais vendidos</h4>${productsHtml(summary.products)}</div></div><div class="v019-final-note">Uma comanda aberta antes da meia-noite continua no turno daquela data mesmo que seja fechada às 01h ou 02h. Se houver novo turno no mesmo dia, apenas comandas abertas depois do fechamento anterior entram nele.</div>`;
  }
  async function openCloseSheet(){ensureCloseSheet();byId('v019CloseWrap').classList.add('open');byId('v019CloseGate').textContent='Conferindo o turno…';if(navigator.onLine&&syncReady()){try{if(typeof window.v15SyncNow==='function')await window.v15SyncNow();await syncTurnNow();}catch{}}renderCloseSheet();}
  async function finalizeClose(){
    if(closing)return;
    closing=true;renderCloseSheet();
    try{
      if(navigator.onLine&&syncReady()){
        try{if(typeof window.v15SyncNow==='function')await window.v15SyncNow();await syncTurnNow();}catch{}
      }
      const summary=buildSummary(),blocked=blockers(summary);
      if(blocked.length||summary.closedCount===0){renderCloseSheet();return;}
      const businessDate=summary.businessDate;
      const shiftStartedAt=Number(summary.firstOpenedAt||summary.shiftStart||startOfDay(businessDate));
      const candidate={businessDate,shiftStartedAt};
      if(readClosures().some(x=>sameClosureWindow(x,candidate))){notify('Este turno já foi fechado em outro aparelho.');renderCloseSheet();return;}
      if(!window.confirm(`Fechar o turno operacional de ${dateLabel(summary.businessDate)}?\n\nFaturamento: ${moneyValue(summary.revenue)}\nComandas fechadas: ${summary.closedCount}\n\nA data do turno é definida pela abertura das comandas.`))return;
      const dm=deviceMeta(),closedAt=Date.now(),id=canonicalClosureId(candidate)||`turn_${businessDate}_${shiftStartedAt}`;
      const closure={id,businessDate,shiftStartedAt,closedAt,closedAtIso:new Date(closedAt).toISOString(),timezoneOffsetMinutes:new Date().getTimezoneOffset(),deviceId:dm.deviceId,deviceName:dm.deviceName,storeId:dm.storeId,appVersion:releaseVersion(),schemaVersion:3,summary:clone(summary)};
      if(!addClosure(closure)){notify('Este turno já foi registrado.');renderCloseSheet();return;}
      queueClosure(closure);byId('v019CloseWrap')?.classList.remove('open');notify(`Turno de ${dateLabel(businessDate)} fechado.`);renderTurnCard();renderHistorySheet();if(navigator.onLine&&syncReady())syncTurnNow();window.dispatchEvent(new CustomEvent('rota27:v019-turn-updated',{detail:{closure:clone(closure)}}));
    }finally{
      closing=false;
      if(byId('v019CloseWrap')?.classList.contains('open'))renderCloseSheet();
    }
  }
  function renderHistorySheet(){
    ensureHistorySheet();const status=byId('v019HistoryStatus'),list=byId('v019HistoryList'),rows=readClosures(),outbox=readOutbox(),meta=readJson(META_KEY,{});if(!status||!list)return;
    if(syncing){status.className='v019-gate';status.textContent='Sincronizando fechamentos…';}
    else if(outbox.length){status.className='v019-gate warn';status.textContent=`${outbox.length} fechamento${outbox.length===1?'':'s'} aguardando sincronização.`;}
    else{status.className='v019-gate ok';status.textContent=Number(meta.lastSyncAt||0)?`Fechamentos sincronizados. Última conferência ${new Date(Number(meta.lastSyncAt)).toLocaleString('pt-BR')}.`:'Fechamentos armazenados neste aparelho.';}
    list.innerHTML=rows.length?rows.map(c=>{const s=c.summary||{};return `<div class="v019-history-row"><div class="v019-history-row-head"><strong>${esc(dateLabel(c.businessDate))}</strong><span>${esc(new Date(Number(c.closedAt||0)).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}))}</span></div><div class="v019-history-row-metrics"><div class="v019-history-mini"><small>Faturamento</small><b>${esc(moneyValue(s.revenue))}</b></div><div class="v019-history-mini"><small>Fechadas</small><b>${esc(String(s.closedCount||0))}</b></div><div class="v019-history-mini"><small>Canceladas</small><b>${esc(String(s.cancelled||0))}</b></div><div class="v019-history-mini"><small>Ticket médio</small><b>${esc(moneyValue(s.avgTicket))}</b></div><div class="v019-history-mini"><small>Itens</small><b>${esc(String(s.units||0))}</b></div><div class="v019-history-mini"><small>Formas pgto.</small><b>${esc(String(Array.isArray(s.payments)?s.payments.length:0))}</b></div></div><div class="v019-history-meta">Data operacional pela abertura • fechado em ${esc(c.deviceName||'Aparelho')} • ${esc(c.id)}</div></div>`;}).join(''):'<div class="v019-preview-empty">Nenhum turno fechado ainda.</div>';
  }
  function openHistorySheet(){ensureHistorySheet();renderHistorySheet();byId('v019HistoryWrap').classList.add('open');if(navigator.onLine&&syncReady())syncTurnNow();}
  function renderOpenSheets(){if(byId('v019CloseWrap')?.classList.contains('open'))renderCloseSheet();if(byId('v019HistoryWrap')?.classList.contains('open'))renderHistorySheet();}
  function ensureTurnCard(){const host=byId('v018TurnSummary');if(!host)return null;let card=byId('v019TurnCloseCard');if(!card){card=document.createElement('div');card.id='v019TurnCloseCard';host.appendChild(card);}return card;}
  function renderTurnCard(){
    clearTimeout(renderTimer);renderTimer=setTimeout(()=>{
      const card=ensureTurnCard();if(!card)return;
      const summary=buildSummary(),blocked=blockers(summary),last=lastClosure(summary.businessDate),hasMovement=summary.closedCount>0||summary.openCount>0,outbox=readOutbox();
      if(last&&!hasMovement){const time=new Date(Number(last.closedAt)).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});card.className='v019-turn-close-card v019-turn-closed';card.innerHTML=`<div class="v019-turn-close-copy"><strong>✓ Último turno de ${esc(dateLabel(summary.businessDate))} fechado às ${esc(time)}</strong><span>Novo turno liberado${outbox.length?' • aguardando sync':''}</span></div><div class="v019-turn-close-actions"><button type="button" class="v019-turn-btn" id="v019ViewAll">Fechamentos</button></div>`;byId('v019ViewAll').onclick=openHistorySheet;}
      else{const hint=blocked.length?blocked[0]:`Turno operacional ${dateLabel(summary.businessDate)} • data definida pela abertura das comandas.`;card.className='v019-turn-close-card';card.innerHTML=`<div class="v019-turn-close-copy"><strong>Fechamento do turno</strong><span>${esc(hint)}</span></div><div class="v019-turn-close-actions"><button type="button" class="v019-turn-btn" id="v019ViewAll">Fechamentos</button><button type="button" class="v019-turn-btn primary" id="v019CloseTurn">Fechar turno</button></div>`;byId('v019ViewAll').onclick=openHistorySheet;byId('v019CloseTurn').onclick=openCloseSheet;}
    },60);
  }
  function injectHelp(){
    const content=byId('r27HelpOverlay')?.querySelector('.r27-help-content');if(!content)return;
    byId('r27-help-fechamento-turno-v02514')?.remove();
    if(byId('r27-help-fechamento-turno-v02515'))return;
    const s=document.createElement('details');s.id='r27-help-fechamento-turno-v02515';s.className='r27-help-section';
    s.innerHTML='<summary><span class="r27-help-section-icon">✓</span><span><strong>Data operacional do turno</strong><small>A abertura da comanda define a qual turno ela pertence.</small></span></summary><div class="r27-help-section-body"><p>Se uma comanda é aberta em 26/08 e fechada às 01h ou 02h de 27/08, ela continua pertencendo ao turno operacional de 26/08.</p><p>Quando houver mais de um turno no mesmo dia, o fechamento anterior continua sendo o corte: só comandas abertas depois dele entram no turno seguinte.</p></div>';
    content.appendChild(s);
  }
  function refresh(){renderTurnCard();renderOpenSheets();injectHelp();}
  function start(){
    ensureCloseSheet();ensureHistorySheet();setTimeout(refresh,120);
    window.addEventListener('online',()=>{syncTurnNow();refresh();});window.addEventListener('offline',refresh);window.addEventListener('storage',refresh);window.addEventListener('rota27:v017-domain-updated',refresh);window.addEventListener('rota27:v0181-audit-updated',refresh);window.addEventListener('rota27:v02512-receivables-updated',refresh);
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){refresh();if(navigator.onLine)syncTurnNow();}});
    if(navigator.onLine)syncTurnNow();
    window.Rota27V019={version:MODULE_VERSION,releaseVersion:releaseVersion(),openCloseTurn:openCloseSheet,openTurnHistory:openHistorySheet,syncTurnClosures:syncTurnNow,getClosures:()=>clone(readClosures()),todayClosure:()=>clone(lastClosure(localDateKey())),isTodayClosed:()=>false,buildSummary,currentBusinessDate,commandBusinessDate};
    console.info(`[Rota27] módulo de fechamento v${MODULE_VERSION} • integridade da release ${releaseVersion()} carregada.`);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();