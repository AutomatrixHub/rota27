/* Rota 27 v0.18.1 — auditoria operacional */
(function(){
  'use strict';

  const VERSION='0.18.1';
  const STORE_KEY='rota27_audit_v0181';
  const SYNC_KEY='rota27_sync_config_v1';
  const MAX_EVENTS=2500;
  const RECONCILE_MS=20000;
  let baseSave=null;
  let baseRenderCommands=null;
  let baseRenderHistory=null;
  let previous=null;
  let reconciling=false;

  function iso(v=Date.now()){const d=new Date(v);return Number.isNaN(d.getTime())?new Date().toISOString():d.toISOString();}
  function clone(v){return JSON.parse(JSON.stringify(v==null?null:v));}
  function clean(v,max=180){return String(v??'').trim().replace(/\s+/g,' ').slice(0,max);}
  function esc(v){if(typeof escapeHtml==='function')return escapeHtml(String(v??''));return String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
  function moneyValue(v){try{return typeof money==='function'?money(Number(v||0)):Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}catch{return 'R$ 0,00';}}
  function uid(){return globalThis.crypto?.randomUUID?`audit_${crypto.randomUUID()}`:`audit_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,9)}`;}

  function loadStore(){
    try{
      const raw=JSON.parse(localStorage.getItem(STORE_KEY)||'{}')||{};
      return {
        events:Array.isArray(raw.events)?raw.events.slice(-MAX_EVENTS):[],
        lastServerAt:Number(raw.lastServerAt||0),
        lastServerError:clean(raw.lastServerError||'',240),
        serverVersion:clean(raw.serverVersion||'',80)
      };
    }catch{return {events:[],lastServerAt:0,lastServerError:'',serverVersion:''};}
  }
  let store=loadStore();
  function persist(){
    store.events=(Array.isArray(store.events)?store.events:[]).slice(-MAX_EVENTS);
    try{localStorage.setItem(STORE_KEY,JSON.stringify(store));}catch{}
  }

  function syncConfig(){
    try{const c=JSON.parse(localStorage.getItem(SYNC_KEY)||'{}')||{};return c;}catch{return {};}
  }
  function deviceMeta(){
    const c=syncConfig();
    return {
      deviceId:clean(c.deviceId||'local',120)||'local',
      deviceName:clean(c.deviceName||'Este aparelho',80)||'Este aparelho'
    };
  }
  function auditUrl(){
    const c=syncConfig();
    const url=String(c.functionUrl||'').trim().replace(/\/+$/,'');
    if(!/\/functions\/v1\/rota27-sync$/i.test(url))return '';
    return url.replace(/\/rota27-sync$/i,'/rota27-audit');
  }
  function canReconcile(){const c=syncConfig();return navigator.onLine&&c.enabled===true&&c.initialized===true&&String(c.deviceToken||'').length>=16&&!!auditUrl();}

  function commandMap(rows){return new Map((Array.isArray(rows)?rows:[]).filter(Boolean).map(c=>[String(c.id||''),clone(c)]).filter(([id])=>id));}
  function snap(){
    let commands=[],history=[];
    try{commands=Array.isArray(state?.commands)?state.commands:[];history=Array.isArray(state?.history)?state.history:[];}catch{}
    return {commands:commandMap(commands),history:commandMap(history)};
  }
  function label(c){
    try{if(typeof commandLabel==='function')return clean(commandLabel(c),180)||'Comanda';}catch{}
    const customer=clean(c?.customer,120),table=clean(c?.table,120);
    return [customer,table].filter(Boolean).join(' • ')||'Comanda';
  }
  function total(c){
    try{if(typeof commandTotal==='function')return Number(commandTotal(c)||0);}catch{}
    if(Number.isFinite(Number(c?.total)))return Number(c.total);
    const items=c?.items&&typeof c.items==='object'?c.items:{};
    const meta=c?.itemMeta&&typeof c.itemMeta==='object'?c.itemMeta:{};
    return Object.entries(items).reduce((s,[id,q])=>s+Number(q||0)*Number(meta?.[id]?.price||0),0);
  }
  function eventAt(type,c,fallback=Date.now()){
    if(type==='opened')return Number(c?.createdAt||c?.openedAt||fallback);
    if(type==='closed')return Number(c?.closedAt||c?.updatedAt||fallback);
    if(type==='cancelled')return Number(c?.cancelledAt||c?.updatedAt||fallback);
    return Number(c?.updatedAt||fallback);
  }
  function productName(c,id){return clean(c?.itemMeta?.[id]?.name||state?.catalog?.find?.(p=>String(p.id)===String(id))?.name||'Produto',160);}

  function sameFingerprint(a,b){return a&&b&&a.fingerprint&&a.fingerprint===b.fingerprint;}
  function addLocal(type,command,extra={}){
    const commandId=String(command?.id||extra.commandId||'');if(!commandId)return;
    const atMs=Number(extra.atMs||eventAt(type,command,Date.now()));
    const productId=String(extra.productId||'');
    const delta=Number(extra.delta||0);
    const fingerprint=clean(extra.fingerprint||`${type}|${commandId}|${productId}|${delta}|${atMs}`,300);
    if(store.events.some(e=>sameFingerprint(e,{fingerprint})))return;
    const dm=deviceMeta();
    const eventTotal=extra.total!==undefined&&extra.total!==null?Number(extra.total):Number(total(command)||0);
    store.events.push({
      id:uid(),source:'local',type,commandId,label:clean(extra.label||label(command),180),
      total:Number.isFinite(eventTotal)?eventTotal:0,productId,delta,detail:clean(extra.detail||'',180),
      deviceId:dm.deviceId,deviceName:dm.deviceName,appVersion:VERSION,at:iso(atMs),fingerprint
    });
    persist();notifyChanged();
  }

  function diffItems(before,after){
    const b=before?.items&&typeof before.items==='object'?before.items:{};
    const a=after?.items&&typeof after.items==='object'?after.items:{};
    const ids=new Set([...Object.keys(b),...Object.keys(a)]);
    ids.forEach(id=>{
      const d=Number(a[id]||0)-Number(b[id]||0);if(!d)return;
      addLocal(d>0?'item_added':'item_removed',after||before,{
        productId:id,delta:d,detail:`${d>0?'+':''}${d}x ${productName(after||before,id)}`,
        atMs:Number(after?.updatedAt||Date.now())
      });
    });
  }

  function capture(before,after){
    if(!before||!after)return;
    const ids=new Set([...before.commands.keys(),...after.commands.keys(),...before.history.keys(),...after.history.keys()]);
    ids.forEach(id=>{
      const bo=before.commands.get(id),ao=after.commands.get(id),bh=before.history.get(id),ah=after.history.get(id);
      if(!bo&&ao&&!ao.cancelled){addLocal('opened',ao,{detail:'Comanda aberta',atMs:eventAt('opened',ao)});return;}
      if(bo&&!ao){
        if(!bh&&ah){addLocal('closed',ah,{detail:'Comanda fechada',atMs:eventAt('closed',ah)});return;}
        if(!bo.cancelled){addLocal('cancelled',bo,{detail:'Comanda cancelada',atMs:Date.now(),fingerprint:`cancelled|${id}`});return;}
      }
      if(bo&&ao){
        if(!bo.cancelled&&ao.cancelled){addLocal('cancelled',ao,{detail:'Comanda cancelada',atMs:eventAt('cancelled',ao),fingerprint:`cancelled|${id}`});return;}
        diffItems(bo,ao);
        const fields=['table','customer'];
        if(fields.some(k=>JSON.stringify(bo?.[k])!==JSON.stringify(ao?.[k]))){
          addLocal('edited',ao,{detail:'Dados da comanda alterados',atMs:Number(ao.updatedAt||Date.now())});
        }
      }
      if(!bh&&ah&&!bo){addLocal('closed',ah,{detail:'Comanda fechada',atMs:eventAt('closed',ah)});}
    });
  }

  function captureCurrent(){const next=snap();capture(previous,next);previous=next;}

  function wrapSave(){
    if(baseSave||typeof save!=='function')return;
    baseSave=save;
    const patched=function(){const result=baseSave.apply(this,arguments);try{captureCurrent();}catch(err){console.warn('[Rota27 v0.18.1] auditoria save:',err);}return result;};
    try{save=patched;}catch{} try{window.save=patched;}catch{}
  }
  function wrapRenderers(){
    if(!baseRenderCommands&&typeof renderCommands==='function'){
      baseRenderCommands=renderCommands;
      const patched=function(){try{captureCurrent();}catch{}return baseRenderCommands.apply(this,arguments);};
      try{renderCommands=patched;}catch{} try{window.renderCommands=patched;}catch{}
    }
    if(!baseRenderHistory&&typeof renderHistory==='function'){
      baseRenderHistory=renderHistory;
      const patched=function(){try{captureCurrent();}catch{}return baseRenderHistory.apply(this,arguments);};
      try{renderHistory=patched;}catch{} try{window.renderHistory=patched;}catch{}
    }
  }

  function startOfDay(d=new Date()){const x=new Date(d);x.setHours(0,0,0,0);return x;}
  function endOfDay(d=new Date()){const x=startOfDay(d);x.setDate(x.getDate()+1);return x;}
  function isToday(at){const t=new Date(at).getTime();return Number.isFinite(t)&&t>=startOfDay().getTime()&&t<endOfDay().getTime();}
  function semanticKey(e){
    if(['opened','closed','cancelled'].includes(e.type))return `${e.type}|${e.commandId}`;
    if(['item_added','item_removed'].includes(e.type))return `${e.type}|${e.commandId}|${e.productId}|${Number(e.delta||0)}|${Math.floor(new Date(e.at).getTime()/120000)}`;
    return `${e.type}|${e.commandId}|${Math.floor(new Date(e.at).getTime()/120000)}`;
  }
  function todayEvents(){
    const rows=store.events.filter(e=>isToday(e.at)).sort((a,b)=>new Date(b.at)-new Date(a.at));
    const seen=new Set(),out=[];
    rows.sort((a,b)=>((a.source==='server'?0:1)-(b.source==='server'?0:1))||new Date(b.at)-new Date(a.at));
    rows.forEach(e=>{const k=semanticKey(e);if(seen.has(k))return;seen.add(k);out.push(e);});
    return out.sort((a,b)=>new Date(b.at)-new Date(a.at));
  }
  function todayStats(){
    const rows=todayEvents();
    return {
      cancelled:rows.filter(e=>e.type==='cancelled').length,
      opened:rows.filter(e=>e.type==='opened').length,
      closed:rows.filter(e=>e.type==='closed').length,
      events:rows.length,
      serverSynced:store.lastServerAt>0&&!store.lastServerError,
      lastServerAt:store.lastServerAt,
      lastServerError:store.lastServerError
    };
  }

  function localMatchesServer(local,server){
    if(local.source!=='local')return false;
    if(local.type!==server.type||String(local.commandId)!==String(server.commandId))return false;
    if(['opened','closed','cancelled'].includes(server.type))return true;
    if(['item_added','item_removed'].includes(server.type)&&String(local.productId)!==String(server.productId))return false;
    if(Number(local.delta||0)!==Number(server.delta||0))return false;
    return Math.abs(new Date(local.at).getTime()-new Date(server.at).getTime())<=180000;
  }

  async function reconcile(){
    if(reconciling||!canReconcile())return false;
    reconciling=true;
    const cfg=syncConfig(),url=auditUrl(),ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),12000);
    try{
      const start=startOfDay(),end=endOfDay();
      const response=await fetch(url,{method:'POST',headers:{'content-type':'application/json','x-rota27-device-token':String(cfg.deviceToken||'')},body:JSON.stringify({startIso:start.toISOString(),endIso:end.toISOString()}),signal:ctrl.signal});
      const data=await response.json().catch(()=>({}));
      if(!response.ok||data.ok!==true)throw new Error(data.error||`HTTP ${response.status}`);
      const serverRows=Array.isArray(data.events)?data.events:[];
      const serverIds=new Set(serverRows.map(e=>String(e.id||'')));
      let kept=store.events.filter(e=>!(e.source==='server'&&isToday(e.at)&&!serverIds.has(String(e.id||''))));
      for(const row of serverRows){
        const s={...row,source:'server',deviceName:deviceNameFor(row.deviceId),fingerprint:`server|${row.id}`};
        kept=kept.filter(e=>!localMatchesServer(e,s));
        const idx=kept.findIndex(e=>String(e.id)===String(s.id));
        if(idx>=0)kept[idx]=s;else kept.push(s);
      }
      store.events=kept.slice(-MAX_EVENTS);store.lastServerAt=Date.now();store.lastServerError='';store.serverVersion=clean(data.edgeVersion||'',80);persist();notifyChanged();return true;
    }catch(err){store.lastServerError=clean(err?.name==='AbortError'?'Tempo esgotado ao consultar auditoria.':(err?.message||'Falha ao consultar auditoria.'),240);persist();renderAuditSheet();return false;}
    finally{clearTimeout(timer);reconciling=false;}
  }

  function deviceNameFor(id){
    const cfg=syncConfig();
    const found=Array.isArray(cfg.devices)?cfg.devices.find(d=>String(d?.device_id)===String(id)):null;
    return clean(found?.device_name||((String(id)===String(cfg.deviceId))?cfg.deviceName:'Outro aparelho'),80)||'Aparelho';
  }

  function ensureSheet(){
    if(document.getElementById('v0181AuditWrap'))return;
    const wrap=document.createElement('div');wrap.id='v0181AuditWrap';wrap.className='sheet-wrap';
    wrap.innerHTML=`<div class="sheet v0181-audit-sheet"><div class="handle"></div><div class="v0181-audit-head"><div><h3>Auditoria do turno</h3><p class="desc">Registro de abertura, fechamento, cancelamento, alterações e lançamentos.</p></div><button type="button" id="v0181AuditClose" class="v0181-audit-x" aria-label="Fechar">×</button></div><div id="v0181AuditStatus" class="v0181-audit-status"></div><div id="v0181AuditList" class="v0181-audit-list"></div><div class="sheet-actions"><button type="button" class="secondary" id="v0181AuditRefresh">Atualizar</button><button type="button" class="primary" id="v0181AuditDone">Concluir</button></div></div>`;
    document.body.appendChild(wrap);
    wrap.addEventListener('click',e=>{if(e.target===wrap)wrap.classList.remove('open');});
    document.getElementById('v0181AuditClose').addEventListener('click',()=>wrap.classList.remove('open'));
    document.getElementById('v0181AuditDone').addEventListener('click',()=>wrap.classList.remove('open'));
    document.getElementById('v0181AuditRefresh').addEventListener('click',async()=>{await reconcile();renderAuditSheet();});
  }

  function typeMeta(type){return ({opened:['＋','Aberta'],closed:['✓','Fechada'],cancelled:['×','Cancelada'],item_added:['+','Item adicionado'],item_removed:['−','Item removido'],edited:['✎','Alterada']})[type]||['•','Evento'];}
  function renderAuditSheet(){
    const list=document.getElementById('v0181AuditList'),status=document.getElementById('v0181AuditStatus');if(!list||!status)return;
    const rows=todayEvents(),stats=todayStats();
    status.className='v0181-audit-status'+(store.lastServerError?' warn':stats.serverSynced?' ok':'');
    if(store.lastServerError)status.textContent=`Auditoria local ativa. Servidor: ${store.lastServerError}`;
    else if(stats.serverSynced)status.textContent=`${rows.length} evento${rows.length===1?'':'s'} hoje • reconciliada com a sincronização.`;
    else if(canReconcile())status.textContent=`${rows.length} evento${rows.length===1?'':'s'} hoje • aguardando reconciliação.`;
    else status.textContent=`${rows.length} evento${rows.length===1?'':'s'} hoje • registro local neste aparelho.`;
    if(!rows.length){list.innerHTML='<div class="v0181-audit-empty">Nenhuma ocorrência registrada neste turno ainda.</div>';return;}
    list.innerHTML=rows.slice(0,120).map(e=>{
      const [icon,name]=typeMeta(e.type),time=new Date(e.at).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
      const detail=e.detail||name;
      const extra=(e.type==='closed'&&Number(e.total)>0)?` • ${moneyValue(e.total)}`:'';
      return `<div class="v0181-audit-row"><div class="v0181-audit-icon ${esc(e.type)}">${esc(icon)}</div><div class="v0181-audit-copy"><div><strong>${esc(e.label||'Comanda')}</strong><time>${esc(time)}</time></div><span>${esc(detail+extra)}</span><small>${esc(e.deviceName||deviceNameFor(e.deviceId))}${e.source==='server'?' • sincronizado':' • local'}</small></div></div>`;
    }).join('');
  }

  function openAudit(){ensureSheet();renderAuditSheet();document.getElementById('v0181AuditWrap').classList.add('open');reconcile().then(renderAuditSheet);}

  function notifyChanged(){
    try{window.dispatchEvent(new CustomEvent('rota27:v0181-audit-updated',{detail:todayStats()}));}catch{}
    try{setTimeout(()=>window.Rota27V018?.refreshTurnSummary?.(),20);}catch{}
    if(document.getElementById('v0181AuditWrap')?.classList.contains('open'))renderAuditSheet();
  }

  function start(){
    previous=snap();wrapSave();wrapRenderers();ensureSheet();
    reconcile();
    window.addEventListener('online',()=>setTimeout(reconcile,500));
    window.addEventListener('storage',e=>{if(e.key===SYNC_KEY||e.key===STORE_KEY){store=loadStore();renderAuditSheet();notifyChanged();}});
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){captureCurrent();reconcile();}});
    setInterval(()=>{wrapSave();wrapRenderers();captureCurrent();reconcile();},RECONCILE_MS);
    console.info('[Rota27] v0.18.1 auditoria operacional carregada.');
  }

  window.Rota27V0181={version:VERSION,openAudit,reconcile,todayStats,todayEvents,refreshAudit:()=>{captureCurrent();return reconcile();}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
