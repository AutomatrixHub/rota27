/* Rota 27 v0.19.0 — Fechamento do Turno */
(function(){
  'use strict';

  const VERSION='0.19.0';
  const LABEL='v0.19.0';
  const TITLE='Rota 27 Bodega • Comandas v0.19.0';
  const STORE_KEY='rota27_v019_turn_closures_v1';
  const OUTBOX_KEY='rota27_v019_turn_outbox_v1';
  const CURSOR_KEY='rota27_v019_turn_cursor_v1';
  const META_KEY='rota27_v019_turn_meta_v1';
  const CANCEL_OUTBOX_KEY='rota27_cancel_outbox_v0151';
  const SYNC_CONFIG_KEY='rota27_sync_config_v1';
  const MAX_CLOSURES=730;
  const MAX_OUTBOX=120;
  let syncing=false;
  let renderTimer=null;
  let baseOpenNewCommandSheet=null;
  let baseCreateCommand=null;
  let versionObserver=null;

  function byId(id){return document.getElementById(id);}
  function clone(v){return JSON.parse(JSON.stringify(v==null?null:v));}
  function clean(v,max=200){return String(v??'').replace(/[\u0000-\u001F\u007F]/g,' ').trim().replace(/\s+/g,' ').slice(0,max);}
  function esc(v){if(typeof escapeHtml==='function')return escapeHtml(String(v??''));return String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
  function moneyValue(v){try{return typeof money==='function'?money(Number(v||0)):Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}catch{return 'R$ 0,00';}}
  function localDateKey(d=new Date()){const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`;}
  function dateLabel(key){const [y,m,d]=String(key||'').split('-');return y&&m&&d?`${d}/${m}/${y}`:String(key||'');}
  function startOfDay(key=localDateKey()){const [y,m,d]=key.split('-').map(Number);return new Date(y,m-1,d,0,0,0,0).getTime();}
  function endOfDay(key=localDateKey()){const x=new Date(startOfDay(key));x.setDate(x.getDate()+1);return x.getTime();}
  function readJson(key,fallback){try{const v=JSON.parse(localStorage.getItem(key)||'null');return v==null?fallback:v;}catch{return fallback;}}
  function writeJson(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}}
  function readArray(key){const v=readJson(key,[]);return Array.isArray(v)?v:[];}
  function uid(prefix='id'){return globalThis.crypto?.randomUUID?`${prefix}_${crypto.randomUUID()}`:`${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,10)}`;}
  function notify(msg){try{if(typeof showToast==='function')showToast(msg,false);else console.info('[Rota27]',msg);}catch{}}
  function showLockMessage(msg){const old=byId('v019LockToast');if(old)old.remove();const el=document.createElement('div');el.id='v019LockToast';el.className='v019-lock-toast';el.textContent=msg;document.body.appendChild(el);setTimeout(()=>el.remove(),3200);}

  function syncConfig(){const raw=readJson(SYNC_CONFIG_KEY,{});return raw&&typeof raw==='object'?raw:{};}
  function syncReady(){const c=syncConfig();return c.enabled===true&&c.initialized===true&&/^https:\/\/.+\/functions\/v1\/rota27-sync\/?$/i.test(String(c.functionUrl||''))&&String(c.deviceToken||'').length>=16&&!!c.deviceId;}
  function deviceMeta(){const c=syncConfig();return {deviceId:clean(c.deviceId||'local',120)||'local',deviceName:clean(c.deviceName||'Este aparelho',80)||'Este aparelho',storeId:clean(c.storeId||'rota27-bodega',80)||'rota27-bodega'};}
  function readMeta(){const m=readJson(META_KEY,{});return m&&typeof m==='object'?m:{};}
  function patchMeta(patch){writeJson(META_KEY,{...readMeta(),...patch});}

  function readClosures(){return readArray(STORE_KEY).filter(x=>x&&x.id&&x.businessDate).sort((a,b)=>Number(b.closedAt||0)-Number(a.closedAt||0));}
  function writeClosures(rows){return writeJson(STORE_KEY,(Array.isArray(rows)?rows:[]).slice(0,MAX_CLOSURES));}
  function closureForDate(key=localDateKey()){return readClosures().find(x=>String(x.businessDate)===String(key))||null;}
  function isTodayClosed(){return !!closureForDate(localDateKey());}
  function addClosureImmutable(row){
    const rows=readClosures();
    if(rows.some(x=>String(x.id)===String(row.id)||String(x.businessDate)===String(row.businessDate)))return false;
    rows.push(clone(row));rows.sort((a,b)=>Number(b.closedAt||0)-Number(a.closedAt||0));writeClosures(rows);return true;
  }

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
  function recordItems(command){return Object.entries(command?.items||{}).filter(([,qty])=>Number(qty)>0).map(([id,qty])=>({product:itemSnapshot(command,id),qty:Number(qty)}));}
  function buildSummary(key=localDateKey()){
    const start=startOfDay(key),end=endOfDay(key);
    const closed=(Array.isArray(state?.history)?state.history:[]).filter(c=>{const t=Number(c?.closedAt||0);return t>=start&&t<end;});
    const open=(Array.isArray(state?.commands)?state.commands:[]).filter(c=>c?.cancelled!==true);
    let revenue=0,units=0,openValue=0;
    const products=new Map(),payments=new Map();
    closed.forEach(c=>{
      const total=recordTotal(c);revenue+=total;
      const payment=String(c?.paymentMethod||'').trim()||'Não informado';payments.set(payment,(payments.get(payment)||0)+total);
      recordItems(c).forEach(({product,qty})=>{units+=qty;const keyName=product.name||'Produto';const row=products.get(keyName)||{name:keyName,qty:0,revenue:0};row.qty+=qty;row.revenue+=qty*Number(product.price||0);products.set(keyName,row);});
    });
    open.forEach(c=>{openValue+=recordTotal(c);});
    let audit={cancelled:0,events:0,serverSynced:false};
    try{if(key===localDateKey())audit=window.Rota27V0181?.todayStats?.()||audit;}catch{}
    return {
      revenue:Number(revenue||0),closedCount:closed.length,openCount:open.length,openValue:Number(openValue||0),avgTicket:closed.length?revenue/closed.length:0,units,
      cancelled:Number(audit.cancelled||0),auditEvents:Number(audit.events||0),auditServerSynced:audit.serverSynced===true,
      products:[...products.values()].sort((a,b)=>b.qty-a.qty||b.revenue-a.revenue).slice(0,10),
      payments:[...payments.entries()].map(([name,value])=>({name,value:Number(value||0)})).sort((a,b)=>b.value-a.value)
    };
  }

  function blockers(summary=buildSummary()){
    const rows=[];
    if(summary.openCount>0)rows.push(`${summary.openCount} ${summary.openCount===1?'comanda aberta':'comandas abertas'} (${moneyValue(summary.openValue)}).`);
    const cancelPending=readArray(CANCEL_OUTBOX_KEY).length;
    if(cancelPending>0)rows.push(`${cancelPending} ${cancelPending===1?'cancelamento ainda aguarda':'cancelamentos ainda aguardam'} confirmação da sincronização.`);
    return rows;
  }
  function warnings(summary=buildSummary()){
    const rows=[];const cfg=syncConfig();
    if(!navigator.onLine)rows.push('Aparelho offline: o fechamento será salvo localmente e sincronizado quando a conexão voltar.');
    if(cfg.enabled===true&&cfg.initialized===true&&String(window.ROTA27_V017_DOMAIN_ERROR||'').trim())rows.push('A sincronização geral reportou erro recente; o registro local do fechamento continua protegido.');
    if(summary.closedCount>0&&summary.payments.some(p=>p.name==='Não informado'))rows.push('Há comanda fechada sem forma de pagamento informada no histórico.');
    return rows;
  }

  function eventForClosure(c){const dm=deviceMeta();return {eventId:`turn_closed_${c.businessDate}`,eventType:'turn_closed',entityId:c.id,payload:{closure:clone(c)},deviceId:dm.deviceId,createdAt:new Date(Number(c.closedAt||Date.now())).toISOString(),appVersion:VERSION};}
  function readOutbox(){return readArray(OUTBOX_KEY);}
  function writeOutbox(rows){writeJson(OUTBOX_KEY,(Array.isArray(rows)?rows:[]).slice(-MAX_OUTBOX));}
  function queueClosure(c){const evt=eventForClosure(c),rows=readOutbox().filter(x=>String(x.eventId)!==evt.eventId);rows.push(evt);writeOutbox(rows);}
  function getCursor(){return Math.max(0,Number(localStorage.getItem(CURSOR_KEY)||0));}
  function setCursor(v){localStorage.setItem(CURSOR_KEY,String(Math.max(0,Number(v||0))));}
  async function syncApi(body){
    const c=syncConfig();if(!syncReady())throw new Error('Sincronização não configurada neste aparelho.');
    const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),12000);
    try{
      const r=await fetch(String(c.functionUrl).replace(/\/+$/,''),{method:'POST',headers:{'content-type':'application/json','x-rota27-device-token':String(c.deviceToken)},body:JSON.stringify({...body,deviceId:c.deviceId,deviceName:c.deviceName||'Aparelho',storeId:c.storeId||'rota27-bodega',appVersion:VERSION}),signal:ctrl.signal});
      const data=await r.json().catch(()=>({}));if(!r.ok||data.ok!==true)throw new Error(data.error||`HTTP ${r.status}`);return data;
    }finally{clearTimeout(timer);}
  }
  async function pushTurnOutbox(){
    let rows=readOutbox();
    while(rows.length){const batch=rows.slice(0,50);await syncApi({action:'push',events:batch});const sent=new Set(batch.map(x=>x.eventId));rows=readOutbox().filter(x=>!sent.has(x.eventId));writeOutbox(rows);}
  }
  function sameSummary(a,b){return JSON.stringify(a||{})===JSON.stringify(b||{});}
  function applyRemoteClosure(event){
    const raw=event?.payload?.closure;if(!raw||typeof raw!=='object'||!raw.businessDate)return false;
    const incoming={...clone(raw),id:String(raw.id||`turn_${raw.businessDate}`),businessDate:String(raw.businessDate)};
    const rows=readClosures(),idx=rows.findIndex(x=>String(x.id)===incoming.id||String(x.businessDate)===incoming.businessDate);
    if(idx<0){rows.push(incoming);rows.sort((a,b)=>Number(b.closedAt||0)-Number(a.closedAt||0));writeClosures(rows);return true;}
    const local=rows[idx];
    if(!sameSummary(local.summary,incoming.summary)){
      patchMeta({conflict:{businessDate:incoming.businessDate,at:Date.now(),message:'Foi recebido outro fechamento para a mesma data com totais diferentes. O registro local não foi alterado automaticamente.'}});
    }
    return false;
  }
  async function pullTurnEvents(){
    let cursor=getCursor(),changed=false;
    for(let page=0;page<40;page++){
      const data=await syncApi({action:'pull',afterSeq:cursor,limit:500,preferSnapshot:false});
      const events=Array.isArray(data.events)?data.events:[];
      for(const event of events){cursor=Math.max(cursor,Number(event.seq||0));if(String(event.event_type||event.eventType)==='turn_closed'&&applyRemoteClosure(event))changed=true;}
      setCursor(Math.max(cursor,Number(data.cursor||cursor)));if(!data.hasMore||!events.length)break;
    }
    return changed;
  }
  async function syncTurnNow(){
    if(syncing||!syncReady()||!navigator.onLine)return false;syncing=true;renderTurnCard();
    try{await pushTurnOutbox();const changed=await pullTurnEvents();patchMeta({lastSyncAt:Date.now(),lastError:''});if(changed)closeNewCommandIfLocked();window.dispatchEvent(new CustomEvent('rota27:v019-turn-updated'));return true;}
    catch(err){patchMeta({lastError:clean(err?.name==='AbortError'?'Tempo esgotado ao sincronizar fechamento.':(err?.message||'Falha ao sincronizar fechamento.'),260)});return false;}
    finally{syncing=false;renderTurnCard();renderOpenSheets();}
  }

  function closeNewCommandIfLocked(){if(!isTodayClosed())return;try{byId('newCommandWrap')?.classList.remove('open');}catch{}}
  function blockNewCommand(){showLockMessage('O turno de hoje já foi fechado. Novas comandas ficam bloqueadas até o próximo dia.');return false;}
  function wrapNewCommand(){
    if(!baseOpenNewCommandSheet&&typeof openNewCommandSheet==='function'){
      baseOpenNewCommandSheet=openNewCommandSheet;const patched=function(){if(isTodayClosed())return blockNewCommand();return baseOpenNewCommandSheet.apply(this,arguments);};try{openNewCommandSheet=patched;}catch{}try{window.openNewCommandSheet=patched;}catch{}
    }
    if(!baseCreateCommand&&typeof createCommand==='function'){
      baseCreateCommand=createCommand;const patched=function(){if(isTodayClosed())return blockNewCommand();return baseCreateCommand.apply(this,arguments);};try{createCommand=patched;}catch{}try{window.createCommand=patched;}catch{}
    }
  }

  function metric(label,value){return `<div class="v019-preview-metric"><small>${esc(label)}</small><strong>${esc(value)}</strong></div>`;}
  function paymentsHtml(rows){return rows?.length?rows.map(p=>`<div class="v019-preview-row"><span>${esc(p.name)}</span><span>${esc(moneyValue(p.value))}</span></div>`).join(''):'<div class="v019-preview-empty">Nenhum pagamento registrado.</div>';}
  function productsHtml(rows){return rows?.length?rows.slice(0,5).map(p=>`<div class="v019-preview-row"><span>${esc(p.name)}</span><span>${esc(`${p.qty} un.`)}</span></div>`).join(''):'<div class="v019-preview-empty">Nenhum item vendido.</div>';}

  function ensureCloseSheet(){
    if(byId('v019CloseWrap'))return;
    const wrap=document.createElement('div');wrap.id='v019CloseWrap';wrap.className='sheet-wrap';wrap.innerHTML=`<div class="sheet v019-sheet"><div class="handle"></div><div class="v019-head"><div><h3>Fechar turno</h3><p class="desc">Confere o dia e cria um registro imutável do fechamento.</p></div><button type="button" class="v019-x" id="v019CloseX" aria-label="Fechar">×</button></div><div id="v019CloseGate" class="v019-gate"></div><div id="v019CloseBody"></div><div class="sheet-actions"><button type="button" class="secondary" id="v019CloseCancel">Voltar</button><button type="button" class="primary" id="v019CloseConfirm">Fechar turno agora</button></div></div>`;document.body.appendChild(wrap);
    wrap.addEventListener('click',e=>{if(e.target===wrap)wrap.classList.remove('open');});byId('v019CloseX').addEventListener('click',()=>wrap.classList.remove('open'));byId('v019CloseCancel').addEventListener('click',()=>wrap.classList.remove('open'));byId('v019CloseConfirm').addEventListener('click',finalizeClose);
  }
  function ensureHistorySheet(){
    if(byId('v019HistoryWrap'))return;
    const wrap=document.createElement('div');wrap.id='v019HistoryWrap';wrap.className='sheet-wrap';wrap.innerHTML=`<div class="sheet v019-sheet"><div class="handle"></div><div class="v019-head"><div><h3>Fechamentos</h3><p class="desc">Registros imutáveis dos turnos encerrados.</p></div><button type="button" class="v019-x" id="v019HistoryX" aria-label="Fechar">×</button></div><div id="v019HistoryStatus" class="v019-gate"></div><div id="v019HistoryList" class="v019-history-list"></div><div class="sheet-actions"><button type="button" class="secondary" id="v019HistorySync">Sincronizar</button><button type="button" class="primary" id="v019HistoryDone">Concluir</button></div></div>`;document.body.appendChild(wrap);
    wrap.addEventListener('click',e=>{if(e.target===wrap)wrap.classList.remove('open');});byId('v019HistoryX').addEventListener('click',()=>wrap.classList.remove('open'));byId('v019HistoryDone').addEventListener('click',()=>wrap.classList.remove('open'));byId('v019HistorySync').addEventListener('click',async()=>{await syncTurnNow();renderHistorySheet();});
  }

  function renderCloseSheet(){
    ensureCloseSheet();const gate=byId('v019CloseGate'),body=byId('v019CloseBody'),confirm=byId('v019CloseConfirm');if(!gate||!body||!confirm)return;
    const existing=closureForDate(),summary=buildSummary(),blocked=blockers(summary),warn=warnings(summary);
    if(existing){gate.className='v019-gate ok';gate.textContent=`Turno de ${dateLabel(existing.businessDate)} já foi fechado às ${new Date(Number(existing.closedAt)).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}.`;confirm.disabled=true;confirm.textContent='Turno já fechado';}
    else if(blocked.length){gate.className='v019-gate block';gate.innerHTML=`<strong>Não é possível fechar ainda.</strong><br>${blocked.map(esc).join('<br>')}`;confirm.disabled=true;confirm.textContent='Resolver pendências';}
    else{gate.className=warn.length?'v019-gate warn':'v019-gate ok';gate.innerHTML=warn.length?`<strong>Pode fechar, com atenção:</strong><br>${warn.map(esc).join('<br>')}`:'Conferência concluída. Não há comanda aberta nem cancelamento aguardando confirmação.';confirm.disabled=false;confirm.textContent='Fechar turno agora';}
    body.innerHTML=`<div class="v019-preview-metrics">${metric('Faturamento',moneyValue(summary.revenue))}${metric('Fechadas',String(summary.closedCount))}${metric('Canceladas',String(summary.cancelled))}${metric('Ticket médio',moneyValue(summary.avgTicket))}${metric('Itens vendidos',String(summary.units))}${metric('Em aberto',`${summary.openCount} • ${moneyValue(summary.openValue)}`)}</div><div class="v019-preview-grid"><div class="v019-preview-panel"><h4>Formas de pagamento</h4>${paymentsHtml(summary.payments)}</div><div class="v019-preview-panel"><h4>Mais vendidos</h4>${productsHtml(summary.products)}</div></div><div class="v019-final-note">Depois de fechado, este resumo financeiro não é editado. O Rota 27 bloqueia a abertura de novas comandas neste dia. Se estiver offline, o registro permanece neste aparelho e entra na sincronização assim que a conexão voltar.</div>`;
  }
  async function openCloseSheet(){
    ensureCloseSheet();byId('v019CloseWrap').classList.add('open');byId('v019CloseGate').className='v019-gate';byId('v019CloseGate').textContent='Conferindo o turno…';
    if(navigator.onLine&&syncReady()){try{if(typeof window.v15SyncNow==='function')await window.v15SyncNow();await syncTurnNow();}catch{}}
    renderCloseSheet();
  }

  async function finalizeClose(){
    const existing=closureForDate();if(existing){renderCloseSheet();return;}
    if(navigator.onLine&&syncReady()){try{if(typeof window.v15SyncNow==='function')await window.v15SyncNow();}catch{}}
    const summary=buildSummary(),blocked=blockers(summary);if(blocked.length){renderCloseSheet();return;}
    if(!window.confirm(`Fechar o turno de hoje?\n\nFaturamento: ${moneyValue(summary.revenue)}\nComandas fechadas: ${summary.closedCount}\nCanceladas: ${summary.cancelled}\n\nO registro financeiro ficará imutável e novas comandas serão bloqueadas hoje.`))return;
    const businessDate=localDateKey(),dm=deviceMeta(),closedAt=Date.now();
    const closure={id:`turn_${businessDate}`,businessDate,closedAt,closedAtIso:new Date(closedAt).toISOString(),timezoneOffsetMinutes:new Date().getTimezoneOffset(),deviceId:dm.deviceId,deviceName:dm.deviceName,storeId:dm.storeId,appVersion:VERSION,schemaVersion:1,summary:clone(summary)};
    if(!addClosureImmutable(closure)){renderCloseSheet();return;}
    queueClosure(closure);closeNewCommandIfLocked();patchMeta({lastClosedAt:closedAt,lastError:''});
    byId('v019CloseWrap')?.classList.remove('open');notify('Turno fechado e registrado.');renderTurnCard();renderHistorySheet();injectHelp();
    if(navigator.onLine&&syncReady())syncTurnNow();window.dispatchEvent(new CustomEvent('rota27:v019-turn-updated',{detail:{closure:clone(closure)}}));
  }

  function renderHistorySheet(){
    ensureHistorySheet();const status=byId('v019HistoryStatus'),list=byId('v019HistoryList');if(!status||!list)return;const rows=readClosures(),outbox=readOutbox(),meta=readMeta();
    const conflict=meta.conflict&&typeof meta.conflict==='object'?meta.conflict:null;
    if(conflict){status.className='v019-gate block';status.textContent=conflict.message||'Conflito de fechamento detectado.';}
    else if(syncing){status.className='v019-gate';status.textContent='Sincronizando fechamentos…';}
    else if(outbox.length){status.className='v019-gate warn';status.textContent=`${outbox.length} fechamento${outbox.length===1?'':'s'} aguardando sincronização.`;}
    else if(syncReady()&&Number(meta.lastSyncAt||0)>0){status.className='v019-gate ok';status.textContent=`Fechamentos sincronizados. Última conferência ${new Date(Number(meta.lastSyncAt)).toLocaleString('pt-BR')}.`;}
    else{status.className='v019-gate';status.textContent='Fechamentos armazenados localmente neste aparelho.';}
    list.innerHTML=rows.length?rows.map(c=>{const s=c.summary||{};return `<div class="v019-history-row"><div class="v019-history-row-head"><strong>${esc(dateLabel(c.businessDate))}</strong><span>${esc(new Date(Number(c.closedAt||0)).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}))}</span></div><div class="v019-history-row-metrics"><div class="v019-history-mini"><small>Faturamento</small><b>${esc(moneyValue(s.revenue))}</b></div><div class="v019-history-mini"><small>Fechadas</small><b>${esc(String(s.closedCount||0))}</b></div><div class="v019-history-mini"><small>Canceladas</small><b>${esc(String(s.cancelled||0))}</b></div><div class="v019-history-mini"><small>Ticket médio</small><b>${esc(moneyValue(s.avgTicket))}</b></div><div class="v019-history-mini"><small>Itens</small><b>${esc(String(s.units||0))}</b></div><div class="v019-history-mini"><small>Formas pgto.</small><b>${esc(String(Array.isArray(s.payments)?s.payments.length:0))}</b></div></div><div class="v019-history-meta">Fechado em ${esc(c.deviceName||'Aparelho')} • registro ${esc(c.id)}</div></div>`;}).join(''):'<div class="v019-preview-empty">Nenhum turno fechado ainda.</div>';
  }
  function openHistorySheet(){ensureHistorySheet();renderHistorySheet();byId('v019HistoryWrap').classList.add('open');if(navigator.onLine&&syncReady())syncTurnNow();}
  function renderOpenSheets(){if(byId('v019CloseWrap')?.classList.contains('open'))renderCloseSheet();if(byId('v019HistoryWrap')?.classList.contains('open'))renderHistorySheet();}

  function ensureTurnCard(){const summary=byId('v018TurnSummary');if(!summary)return null;let card=byId('v019TurnCloseCard');if(card)return card;card=document.createElement('div');card.id='v019TurnCloseCard';summary.appendChild(card);return card;}
  function renderTurnCard(){
    clearTimeout(renderTimer);renderTimer=setTimeout(()=>{const card=ensureTurnCard();if(!card)return;const closed=closureForDate(),summary=buildSummary(),blocked=blockers(summary),outbox=readOutbox(),meta=readMeta();card.className=`v019-turn-close-card${closed?' v019-turn-closed':''}`;
      if(closed){const time=new Date(Number(closed.closedAt)).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});card.innerHTML=`<div class="v019-turn-close-copy"><strong>✓ Turno fechado às ${esc(time)}</strong><span>${esc(moneyValue(closed.summary?.revenue||0))} • ${esc(String(closed.summary?.closedCount||0))} fechadas • registro imutável${outbox.length?' • aguardando sync':''}</span></div><div class="v019-turn-close-actions"><button type="button" class="v019-turn-btn" id="v019ViewToday">Ver fechamento</button><button type="button" class="v019-turn-btn" id="v019ViewAll">Fechamentos</button></div>`;byId('v019ViewToday')?.addEventListener('click',openHistorySheet);byId('v019ViewAll')?.addEventListener('click',openHistorySheet);
      }else{const hint=blocked.length?blocked[0]:'Sem comandas abertas: pronto para a conferência final.';const syncHint=meta.lastError?` • sync: ${meta.lastError}`:'';card.innerHTML=`<div class="v019-turn-close-copy"><strong>Fechamento do turno</strong><span>${esc(hint+syncHint)}</span></div><div class="v019-turn-close-actions"><button type="button" class="v019-turn-btn" id="v019ViewAll">Fechamentos</button><button type="button" class="v019-turn-btn primary" id="v019CloseTurn">Fechar turno</button></div>`;byId('v019ViewAll')?.addEventListener('click',openHistorySheet);byId('v019CloseTurn')?.addEventListener('click',openCloseSheet);}
    },90);
  }

  function injectHelp(){
    const overlay=byId('r27HelpOverlay');if(!overlay)return false;const content=overlay.querySelector('.r27-help-content');if(!content)return false;
    if(!byId('r27-help-fechamento-turno')){const section=document.createElement('details');section.id='r27-help-fechamento-turno';section.className='r27-help-section';section.innerHTML=`<summary><span class="r27-help-section-icon">✓</span><span><strong>Fechamento do turno</strong><small>Conferir, bloquear pendências e encerrar o dia.</small></span></summary><div class="r27-help-section-body"><div class="r27-help-lead">No Histórico, use <b>Fechar turno</b> somente no fim da operação. O Rota 27 não permite fechar enquanto houver comanda aberta ou cancelamento aguardando confirmação.</div><ol class="r27-help-steps"><li><span>1</span><div><b>Confira</b><br>Revise faturamento, comandas, cancelamentos, itens e formas de pagamento.</div></li><li><span>2</span><div><b>Resolva pendências</b><br>Feche as comandas abertas e aguarde cancelamentos pendentes.</div></li><li><span>3</span><div><b>Feche</b><br>O app cria um registro imutável do dia e bloqueia novas comandas até o próximo dia.</div></li><li><span>4</span><div><b>Offline funciona</b><br>O fechamento fica salvo no aparelho e sincroniza quando a internet voltar.</div></li></ol><div class="r27-help-tip"><b>Consulta posterior:</b> toque em <b>Fechamentos</b> no Resumo do Turno para rever os registros encerrados.</div></div>`;content.appendChild(section);}
    const footer=overlay.querySelector('.r27-help-footer span');if(footer)footer.textContent='Ajuda v4.3 • v0.19.0';return true;
  }

  function ownVersion(){return String(document.querySelector('meta[name="rota27-version"]')?.getAttribute('content')||'')===VERSION;}
  function applyVersion(){if(!ownVersion())return;const badge=byId('v14VersionBadge');if(badge&&badge.textContent!==LABEL)badge.textContent=LABEL;if(document.title!==TITLE)document.title=TITLE;try{window.ROTA27_RELEASE_VERSION=VERSION;window.ROTA27_SYNC_DEV_VERSION=VERSION;}catch{}}
  function protectVersion(){applyVersion();if(versionObserver||!ownVersion())return;const badge=byId('v14VersionBadge'),title=document.querySelector('title');versionObserver=new MutationObserver(()=>applyVersion());if(badge)versionObserver.observe(badge,{childList:true,characterData:true,subtree:true});if(title)versionObserver.observe(title,{childList:true,characterData:true,subtree:true});}

  function scheduleRefresh(){renderTurnCard();setTimeout(renderTurnCard,250);setTimeout(injectHelp,350);}
  function start(){
    protectVersion();wrapNewCommand();ensureCloseSheet();ensureHistorySheet();scheduleRefresh();
    window.addEventListener('online',()=>{syncTurnNow();scheduleRefresh();});window.addEventListener('offline',scheduleRefresh);window.addEventListener('storage',scheduleRefresh);window.addEventListener('rota27:v017-domain-updated',scheduleRefresh);window.addEventListener('rota27:v0181-audit-updated',scheduleRefresh);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){syncTurnNow();scheduleRefresh();}});
    setInterval(()=>{wrapNewCommand();renderTurnCard();injectHelp();if(navigator.onLine)syncTurnNow();},15000);
    if(navigator.onLine)syncTurnNow();
    console.info('[Rota27] v0.19.0 Fechamento do Turno carregado.');
  }

  window.Rota27V019={version:VERSION,openCloseTurn:openCloseSheet,openTurnHistory:openHistorySheet,syncTurnClosures:syncTurnNow,getClosures:()=>clone(readClosures()),todayClosure:()=>clone(closureForDate()),isTodayClosed,buildSummary};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
