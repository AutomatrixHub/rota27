/* Rota 27 v0.15 DEV.1 — sincronização multidispositivo
 * Offline-first: mudanças locais entram em uma outbox; o backend compartilha eventos idempotentes entre aparelhos.
 * A v0.14 em produção permanece intacta. Esta camada só é carregada no preview v0.15.
 */
(function () {
  'use strict';

  const VERSION = '0.15-dev.1';
  const CONFIG_KEY = 'rota27_sync_config_v1';
  const PRE_ADOPT_BACKUP_KEY = 'rota27_sync_pre_adopt_backup_v1';
  const DEFAULT_STORE_ID = 'rota27-bodega';
  const SYNC_INTERVAL_MS = 15000;
  const SYNC_DEBOUNCE_MS = 1400;
  const MAX_OUTBOX = 1200;
  const MAX_CONFLICTS = 30;

  let config = loadConfig();
  let applyingRemote = false;
  let syncing = false;
  let syncTimer = null;
  let intervalTimer = null;
  let baseSave = null;
  let previousState = cloneCoreState(typeof state !== 'undefined' ? state : {});

  function byId(id) { return document.getElementById(id); }
  function nowIso() { return new Date().toISOString(); }
  function clone(value) { return JSON.parse(JSON.stringify(value == null ? null : value)); }
  function safeHtml(value) {
    if (typeof escapeHtml === 'function') return escapeHtml(String(value ?? ''));
    return String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  }
  function newId(prefix='evt') {
    if (globalThis.crypto?.randomUUID) return `${prefix}_${crypto.randomUUID()}`;
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,12)}`;
  }
  function cleanText(v, max=160) { return String(v ?? '').trim().replace(/\s+/g, ' ').slice(0,max); }
  function validUrl(v) { return /^https:\/\/.+\/functions\/v1\/rota27-sync\/?$/i.test(String(v||'').trim()); }
  function statusText(ts) {
    if (!ts) return 'Nunca';
    const d = new Date(Number(ts));
    return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString('pt-BR', {day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});
  }

  function defaultDeviceName() {
    const ua = navigator.userAgent || '';
    if (/iphone/i.test(ua)) return 'iPhone';
    if (/ipad/i.test(ua)) return 'iPad';
    if (/android/i.test(ua)) return 'Android';
    if (/windows/i.test(ua)) return 'Windows';
    if (/macintosh|mac os/i.test(ua)) return 'Mac';
    return 'Aparelho';
  }

  function loadConfig() {
    let raw = {};
    try { raw = JSON.parse(localStorage.getItem(CONFIG_KEY) || '{}') || {}; } catch {}
    return {
      enabled: raw.enabled === true,
      initialized: raw.initialized === true,
      functionUrl: cleanText(raw.functionUrl, 500),
      deviceToken: cleanText(raw.deviceToken, 500),
      storeId: cleanText(raw.storeId || DEFAULT_STORE_ID, 80) || DEFAULT_STORE_ID,
      deviceId: cleanText(raw.deviceId || newId('dev'), 120),
      deviceName: cleanText(raw.deviceName || defaultDeviceName(), 80),
      cursor: Math.max(0, Number(raw.cursor || 0)),
      outbox: Array.isArray(raw.outbox) ? raw.outbox.slice(-MAX_OUTBOX) : [],
      conflicts: Array.isArray(raw.conflicts) ? raw.conflicts.slice(-MAX_CONFLICTS) : [],
      lastSyncAt: Number(raw.lastSyncAt || 0),
      lastError: cleanText(raw.lastError || '', 300),
      latestServerSeq: Math.max(0, Number(raw.latestServerSeq || 0)),
      latestSnapshotSeq: Math.max(0, Number(raw.latestSnapshotSeq || 0)),
      devices: Array.isArray(raw.devices) ? raw.devices.slice(0,20) : []
    };
  }

  function persistConfig() {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    renderSyncStatus();
  }

  function coreStateFrom(source) {
    const s = source && typeof source === 'object' ? source : {};
    return {
      commands: clone(Array.isArray(s.commands) ? s.commands : []),
      history: clone(Array.isArray(s.history) ? s.history : []),
      catalog: clone(Array.isArray(s.catalog) ? s.catalog : []),
      categories: clone(Array.isArray(s.categories) ? s.categories : []),
      categoryStatus: clone(s.categoryStatus && typeof s.categoryStatus === 'object' ? s.categoryStatus : {})
    };
  }
  function cloneCoreState(source) { return coreStateFrom(source); }
  function idMap(rows) { return new Map((Array.isArray(rows) ? rows : []).map(x => [String(x?.id || ''), x]).filter(([id]) => id)); }
  function sameJson(a,b) { return JSON.stringify(a) === JSON.stringify(b); }

  function sanitizeCommand(c) {
    if (!c || typeof c !== 'object') return null;
    const out = clone(c);
    delete out.whatsappLastError;
    return out;
  }
  function sanitizeSnapshot() {
    return coreStateFrom(typeof state !== 'undefined' ? state : {});
  }

  function queueEvent(eventType, entityId, payload) {
    if (!config.enabled || !config.initialized || applyingRemote) return;
    const event = {
      eventId: newId('sync'),
      eventType,
      entityId: String(entityId || ''),
      payload: clone(payload || {}),
      deviceId: config.deviceId,
      createdAt: nowIso(),
      appVersion: VERSION
    };
    config.outbox.push(event);
    if (config.outbox.length > MAX_OUTBOX) {
      config.outbox = [{
        eventId: newId('sync'), eventType:'state_snapshot', entityId:'state',
        payload:{ state:sanitizeSnapshot(), reason:'outbox-compacted' },
        deviceId:config.deviceId, createdAt:nowIso(), appVersion:VERSION
      }];
    }
    persistConfig();
    scheduleSyncSoon();
  }

  function scalarPatch(before, after) {
    const fields = ['table','customer','whatsappPhone','whatsappOptIn'];
    const patch = {};
    fields.forEach(k => { if (!sameJson(before?.[k], after?.[k])) patch[k] = clone(after?.[k]); });
    return patch;
  }

  function commandItemDeltas(before, after) {
    const b = before?.items && typeof before.items === 'object' ? before.items : {};
    const a = after?.items && typeof after.items === 'object' ? after.items : {};
    const ids = new Set([...Object.keys(b), ...Object.keys(a)]);
    const result = [];
    ids.forEach(id => {
      const delta = Number(a[id] || 0) - Number(b[id] || 0);
      if (!delta) return;
      const meta = after?.itemMeta?.[id] || before?.itemMeta?.[id] || null;
      result.push({ productId:id, delta, meta:clone(meta) });
    });
    return result;
  }

  function countChanges(before, after) {
    const maps = [['commands','commands'],['history','history'],['catalog','catalog']];
    let n = 0;
    maps.forEach(([bk,ak]) => {
      const b=idMap(before[bk]), a=idMap(after[ak]);
      const ids=new Set([...b.keys(),...a.keys()]);
      ids.forEach(id=>{ if(!sameJson(b.get(id),a.get(id))) n++; });
    });
    if (!sameJson(before.categories,after.categories) || !sameJson(before.categoryStatus,after.categoryStatus)) n++;
    return n;
  }

  function captureStateDiff(before, after) {
    if (!config.enabled || !config.initialized || applyingRemote) return;
    const changed = countChanges(before, after);
    if (!changed) return;
    if (changed > 40) {
      queueEvent('state_snapshot','state',{state:after,reason:'large-local-change'});
      return;
    }

    const bCommands = idMap(before.commands), aCommands = idMap(after.commands);
    const bHistory = idMap(before.history), aHistory = idMap(after.history);
    const commandIds = new Set([...bCommands.keys(), ...aCommands.keys(), ...bHistory.keys(), ...aHistory.keys()]);

    commandIds.forEach(id => {
      const bo = bCommands.get(id), ao = aCommands.get(id);
      const bh = bHistory.get(id), ah = aHistory.get(id);

      if (bo && !ao && ah && !bh) {
        queueEvent('command_closed', id, {command:sanitizeCommand(ah)});
        return;
      }
      if (!bo && ao) {
        queueEvent('command_opened', id, {command:sanitizeCommand(ao)});
        return;
      }
      if (bo && ao) {
        commandItemDeltas(bo,ao).forEach(d => queueEvent('item_delta',id,d));
        const patch = scalarPatch(bo,ao);
        if (Object.keys(patch).length) queueEvent('command_patch',id,{patch});
      }
      if (!bh && ah && !bo) queueEvent('history_upsert',id,{command:sanitizeCommand(ah)});
    });

    const bCatalog=idMap(before.catalog), aCatalog=idMap(after.catalog);
    new Set([...bCatalog.keys(),...aCatalog.keys()]).forEach(id=>{
      const bp=bCatalog.get(id), ap=aCatalog.get(id);
      if (!bp && ap) queueEvent('catalog_upsert',id,{product:clone(ap)});
      else if (bp && !ap) queueEvent('catalog_delete',id,{});
      else if (bp && ap && !sameJson(bp,ap)) queueEvent('catalog_upsert',id,{product:clone(ap)});
    });

    if (!sameJson(before.categories,after.categories) || !sameJson(before.categoryStatus,after.categoryStatus)) {
      queueEvent('categories_replace','categories',{categories:clone(after.categories),categoryStatus:clone(after.categoryStatus)});
    }
  }

  function patchSave() {
    if (baseSave || typeof save !== 'function') return;
    baseSave = save;
    const patched = function () {
      const before = previousState;
      baseSave();
      const after = cloneCoreState(typeof state !== 'undefined' ? state : {});
      if (!applyingRemote) captureStateDiff(before, after);
      previousState = after;
    };
    try { save = patched; } catch {}
    try { window.save = patched; } catch {}
  }

  function storeCoreState(snapshot) {
    if (!snapshot || typeof snapshot !== 'object') return false;
    const before = cloneCoreState(state);
    state.commands = clone(Array.isArray(snapshot.commands) ? snapshot.commands : []);
    state.history = clone(Array.isArray(snapshot.history) ? snapshot.history : []);
    state.catalog = clone(Array.isArray(snapshot.catalog) ? snapshot.catalog : []);
    state.categories = clone(Array.isArray(snapshot.categories) ? snapshot.categories : []);
    state.categoryStatus = clone(snapshot.categoryStatus && typeof snapshot.categoryStatus === 'object' ? snapshot.categoryStatus : {});
    if (typeof migrateState === 'function') state = migrateState(state);
    if (baseSave) baseSave(); else if (typeof save === 'function') save();
    previousState = cloneCoreState(state);
    return !sameJson(before, previousState);
  }

  function addConflict(event, message) {
    config.conflicts.push({
      id:newId('conflict'), seq:Number(event?.seq||0), eventType:String(event?.event_type||event?.eventType||''),
      entityId:String(event?.entity_id||event?.entityId||''), message:cleanText(message,260), at:Date.now()
    });
    config.conflicts = config.conflicts.slice(-MAX_CONFLICTS);
  }

  function findOpenCommand(id) { return state.commands?.find(c => String(c.id) === String(id)); }
  function findHistory(id) { return state.history?.find(c => String(c.id) === String(id)); }

  function applyRemoteEvent(event) {
    const type = String(event.event_type || event.eventType || '');
    const id = String(event.entity_id || event.entityId || '');
    const payload = event.payload && typeof event.payload === 'object' ? event.payload : {};

    if (type === 'state_snapshot') return storeCoreState(payload.state || {});

    if (type === 'command_opened') {
      if (findHistory(id)) return false;
      const incoming = sanitizeCommand(payload.command);
      if (!incoming) return false;
      const existing = findOpenCommand(id);
      if (existing) Object.assign(existing, incoming);
      else state.commands.push(incoming);
      return true;
    }

    if (type === 'command_patch') {
      const c = findOpenCommand(id);
      if (!c) { if (findHistory(id)) addConflict(event,'Alteração recebida para uma comanda já fechada.'); return false; }
      Object.assign(c, payload.patch || {}); c.updatedAt = Date.now(); return true;
    }

    if (type === 'item_delta') {
      const c = findOpenCommand(id);
      if (!c) { addConflict(event,'Lançamento recebido para comanda inexistente ou já fechada.'); return false; }
      const productId = String(payload.productId || '');
      const delta = Number(payload.delta || 0);
      if (!productId || !delta) return false;
      c.items = c.items && typeof c.items === 'object' ? c.items : {};
      c.itemMeta = c.itemMeta && typeof c.itemMeta === 'object' ? c.itemMeta : {};
      const next = Math.max(0, Number(c.items[productId] || 0) + delta);
      if (next > 0) {
        c.items[productId] = next;
        if (payload.meta && !c.itemMeta[productId]) c.itemMeta[productId] = clone(payload.meta);
      } else {
        delete c.items[productId]; delete c.itemMeta[productId];
      }
      c.updatedAt = Date.now(); return true;
    }

    if (type === 'command_closed' || type === 'history_upsert') {
      const incoming = sanitizeCommand(payload.command);
      if (!incoming) return false;
      state.commands = (state.commands || []).filter(c => String(c.id) !== id);
      const idx = (state.history || []).findIndex(c => String(c.id) === id);
      if (idx >= 0) state.history[idx] = incoming; else state.history.push(incoming);
      return true;
    }

    if (type === 'catalog_upsert') {
      const p = payload.product;
      if (!p?.id) return false;
      const idx = (state.catalog || []).findIndex(x => String(x.id) === String(p.id));
      if (idx >= 0) state.catalog[idx] = clone(p); else state.catalog.push(clone(p));
      return true;
    }
    if (type === 'catalog_delete') {
      state.catalog = (state.catalog || []).filter(p => String(p.id) !== id); return true;
    }
    if (type === 'categories_replace') {
      state.categories = clone(Array.isArray(payload.categories) ? payload.categories : []);
      state.categoryStatus = clone(payload.categoryStatus && typeof payload.categoryStatus === 'object' ? payload.categoryStatus : {});
      return true;
    }
    return false;
  }

  function renderAfterRemote() {
    try { if (typeof renderCommands === 'function') renderCommands(); } catch {}
    try { if (typeof renderMenu === 'function') renderMenu(); } catch {}
    try { if (typeof renderHistory === 'function') renderHistory(); } catch {}
    try { if (typeof activeCommandId !== 'undefined' && activeCommandId && typeof renderSale === 'function') renderSale(); } catch {}
    try { if (typeof renderCart === 'function' && byId('cartWrap')?.classList.contains('open')) renderCart(); } catch {}
  }

  async function api(body) {
    if (!validUrl(config.functionUrl)) throw new Error('URL da função de sincronização inválida.');
    if (config.deviceToken.length < 16) throw new Error('Token do dispositivo inválido.');
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 12000);
    try {
      const response = await fetch(config.functionUrl, {
        method:'POST', headers:{'content-type':'application/json','x-rota27-device-token':config.deviceToken},
        body:JSON.stringify({...body,deviceId:config.deviceId,deviceName:config.deviceName,storeId:config.storeId,appVersion:VERSION}),
        signal:ctrl.signal
      });
      const data = await response.json().catch(()=>({}));
      if (!response.ok || data.ok !== true) throw new Error(data.error || `HTTP ${response.status}`);
      return data;
    } finally { clearTimeout(timeout); }
  }

  async function refreshServerStatus() {
    if (!validUrl(config.functionUrl) || config.deviceToken.length < 16) return null;
    const data = await api({action:'status'});
    config.latestServerSeq = Number(data.latestSeq || 0);
    config.latestSnapshotSeq = Number(data.latestSnapshotSeq || 0);
    config.devices = Array.isArray(data.devices) ? data.devices.slice(0,20) : [];
    persistConfig();
    return data;
  }

  async function pushOutbox() {
    while (config.outbox.length) {
      const batch = config.outbox.slice(0,100);
      await api({action:'push',events:batch});
      const ids = new Set(batch.map(x=>x.eventId));
      config.outbox = config.outbox.filter(x=>!ids.has(x.eventId));
      persistConfig();
    }
  }

  async function pullEvents(options={}) {
    const afterSeq = options.fromZero ? 0 : Number(config.cursor || 0);
    let cursor = afterSeq;
    let changed = false;
    for (let page=0; page<20; page++) {
      const data = await api({action:'pull',afterSeq:cursor,limit:300,preferSnapshot:options.fromZero === true});
      const events = Array.isArray(data.events) ? data.events : [];
      applyingRemote = true;
      try {
        for (const event of events) {
          cursor = Math.max(cursor, Number(event.seq || 0));
          if (String(event.device_id || '') === config.deviceId) continue;
          if (applyRemoteEvent(event)) changed = true;
        }
        if (changed) {
          if (baseSave) baseSave(); else if (typeof save === 'function') save();
          previousState = cloneCoreState(state);
        }
      } finally { applyingRemote = false; }
      config.cursor = Math.max(config.cursor, cursor);
      config.latestServerSeq = Math.max(config.latestServerSeq, Number(data.latestSeq || cursor));
      persistConfig();
      if (!data.hasMore || !events.length) break;
    }
    if (changed) renderAfterRemote();
    return changed;
  }

  async function syncNow(options={}) {
    if (syncing) return;
    if (!config.enabled || !config.initialized) { renderSyncStatus(); return; }
    syncing = true; config.lastError=''; renderSyncStatus();
    try {
      if (!options.pullOnly) await pushOutbox();
      await pullEvents();
      config.lastSyncAt = Date.now(); config.lastError='';
      await refreshServerStatus().catch(()=>null);
    } catch (err) {
      config.lastError = cleanText(err?.name === 'AbortError' ? 'Tempo esgotado ao conectar com a sincronização.' : (err?.message || 'Falha de sincronização.'),300);
    } finally {
      syncing = false; persistConfig();
    }
  }

  function scheduleSyncSoon() {
    if (!config.enabled || !config.initialized || !navigator.onLine) return;
    clearTimeout(syncTimer);
    syncTimer = setTimeout(()=>syncNow(), SYNC_DEBOUNCE_MS);
  }

  function deriveFromWhatsapp() {
    try {
      if (typeof waConfig === 'undefined' || !waConfig) return false;
      const waUrl = String(waConfig.functionUrl || '').trim();
      const token = String(waConfig.deviceToken || '').trim();
      if (!waUrl || !token) return false;
      config.functionUrl = waUrl.replace(/rota27-whatsapp\/?$/i,'rota27-sync');
      config.deviceToken = token;
      return true;
    } catch { return false; }
  }

  function saveForm() {
    const url = cleanText(byId('v15SyncUrl')?.value || '',500).replace(/\/+$/,'');
    const token = cleanText(byId('v15SyncToken')?.value || '',500);
    const name = cleanText(byId('v15DeviceName')?.value || '',80);
    if (!validUrl(url)) { setSheetStatus('Informe a URL HTTPS terminando em /functions/v1/rota27-sync.','error'); return; }
    if (token.length < 16) { setSheetStatus('O token do dispositivo parece inválido.','error'); return; }
    if (!name) { setSheetStatus('Informe um nome para identificar este aparelho.','error'); return; }
    config.functionUrl=url; config.deviceToken=token; config.deviceName=name; config.enabled=true;
    persistConfig(); setSheetStatus('Configuração salva. Agora publique uma base inicial ou adote a base compartilhada.','ok');
    refreshServerStatus().catch(err=>{config.lastError=cleanText(err.message,300);persistConfig();renderSyncSheet();});
  }

  async function publishThisDevice() {
    if (!window.confirm('Publicar ESTE aparelho como base inicial compartilhada?\n\nUse esta opção somente no aparelho que contém o conjunto de dados que deve virar a referência inicial.')) return;
    config.enabled=true; config.initialized=true; config.cursor=Math.max(0,config.cursor);
    config.outbox.push({eventId:newId('sync'),eventType:'state_snapshot',entityId:'state',payload:{state:sanitizeSnapshot(),reason:'initial-publish'},deviceId:config.deviceId,createdAt:nowIso(),appVersion:VERSION});
    persistConfig();
    await syncNow();
    if (!config.lastError) setSheetStatus('Base deste aparelho publicada. Outros aparelhos já podem adotar a base compartilhada.','ok');
    renderSyncSheet();
  }

  async function adoptSharedBase() {
    if (!window.confirm('Adotar a base compartilhada neste aparelho?\n\nAntes de substituir os dados operacionais locais, o Rota 27 guardará uma cópia de segurança no navegador.')) return;
    try {
      const status = await refreshServerStatus();
      if (!Number(status?.latestSnapshotSeq || 0)) { setSheetStatus('Ainda não existe uma base compartilhada publicada. Publique primeiro o aparelho principal.','warn'); return; }
      localStorage.setItem(PRE_ADOPT_BACKUP_KEY, JSON.stringify({savedAt:nowIso(),version:VERSION,state:clone(state)}));
      config.enabled=true; config.initialized=true; config.cursor=0; config.outbox=[]; config.conflicts=[];
      persistConfig();
      await pullEvents({fromZero:true});
      config.lastSyncAt=Date.now(); config.lastError=''; persistConfig();
      setSheetStatus('Base compartilhada adotada. Este aparelho agora participa da sincronização.','ok');
      renderSyncSheet();
    } catch (err) { config.lastError=cleanText(err.message,300);persistConfig();setSheetStatus(config.lastError,'error'); }
  }

  function disableSync() {
    if (!window.confirm('Desativar a sincronização neste aparelho?\n\nOs dados locais não serão apagados.')) return;
    config.enabled=false; config.initialized=false; config.outbox=[]; config.lastError=''; persistConfig(); renderSyncSheet();
  }

  function clearConflicts() { config.conflicts=[]; persistConfig(); renderSyncSheet(); }

  function setSheetStatus(text, kind='') {
    const el=byId('v15SyncSheetStatus'); if (!el) return;
    el.className='v15-sync-status'+(kind?` ${kind}`:''); el.textContent=text;
  }

  function currentStatus() {
    if (!config.enabled) return {kind:'off',label:'Desativada neste aparelho'};
    if (!validUrl(config.functionUrl) || config.deviceToken.length < 16) return {kind:'error',label:'Configuração incompleta'};
    if (!config.initialized) return {kind:'wait',label:'Aguardando base inicial'};
    if (config.lastError) return {kind:'error',label:config.lastError};
    if (syncing) return {kind:'wait',label:'Sincronizando agora…'};
    if (config.outbox.length) return {kind:'wait',label:`${config.outbox.length} alteração(ões) aguardando envio`};
    return {kind:'ready',label:`Sincronizada • ${statusText(config.lastSyncAt)}`};
  }

  function renderSyncStatus() {
    const card=byId('v15SyncCard'); if (!card) return;
    const st=currentStatus();
    const small=byId('v15SyncCardStatus');
    if (small) small.innerHTML=`<span class="v15-sync-dot ${safeHtml(st.kind)}"></span>${safeHtml(st.label)}${config.outbox.length?`<span class="v15-sync-pending">${config.outbox.length} pendente(s)</span>`:''}`;
  }

  function renderDevices() {
    const list=byId('v15DeviceList'); if(!list) return;
    const rows=Array.isArray(config.devices)?config.devices:[];
    if(!rows.length){list.innerHTML='<small>Nenhum aparelho listado pelo servidor ainda.</small>';return;}
    list.innerHTML=rows.map(d=>`<div class="v15-device"><span><b>${safeHtml(d.device_name||d.device_id||'Aparelho')}</b><small>${safeHtml(d.device_id===config.deviceId?'Este aparelho':'Outro aparelho')}</small></span><small>${safeHtml(d.last_seen_at?new Date(d.last_seen_at).toLocaleString('pt-BR'):'—')}</small></div>`).join('');
  }

  function renderSyncSheet() {
    const wrap=byId('v15SyncWrap'); if(!wrap) return;
    const url=byId('v15SyncUrl'), token=byId('v15SyncToken'), name=byId('v15DeviceName');
    if(url)url.value=config.functionUrl||''; if(token)token.value=config.deviceToken||''; if(name)name.value=config.deviceName||'';
    const st=currentStatus();
    const status=byId('v15SyncSheetStatus');
    if(status){status.className='v15-sync-status'+(st.kind==='ready'?' ok':st.kind==='error'?' error':st.kind==='wait'?' warn':'');status.textContent=st.label;}
    const fields={v15StateDevice:config.deviceId,v15StateCursor:String(config.cursor||0),v15StatePending:String(config.outbox.length),v15StateLast:statusText(config.lastSyncAt)};
    Object.entries(fields).forEach(([id,val])=>{const el=byId(id);if(el)el.textContent=val;});
    const init=byId('v15InitState'); if(init)init.textContent=config.initialized?'Participando da base compartilhada':'Ainda não inicializado';
    const publish=byId('v15PublishBtn'),adopt=byId('v15AdoptBtn'),sync=byId('v15SyncNowBtn'),disable=byId('v15DisableBtn');
    const configured=validUrl(config.functionUrl)&&config.deviceToken.length>=16;
    if(publish)publish.disabled=!configured||syncing; if(adopt)adopt.disabled=!configured||syncing; if(sync)sync.disabled=!configured||!config.initialized||syncing; if(disable)disable.disabled=!config.enabled;
    const conf=byId('v15ConflictBox');
    if(conf){conf.style.display=config.conflicts.length?'block':'none';conf.innerHTML=config.conflicts.length?`<strong>⚠ ${config.conflicts.length} conflito(s) preservado(s)</strong><small>${safeHtml(config.conflicts.slice(-3).map(x=>x.message).join(' • '))}</small><button type="button" class="secondary" id="v15ClearConflicts" style="margin-top:8px">Limpar avisos</button>`:'';byId('v15ClearConflicts')?.addEventListener('click',clearConflicts);}
    renderDevices();
  }

  function ensureSheet() {
    if(byId('v15SyncWrap'))return;
    const wrap=document.createElement('div');
    wrap.id='v15SyncWrap';wrap.className='sheet-wrap';
    wrap.innerHTML=`<div class="sheet"><div class="handle"></div><h3>Sincronização entre aparelhos</h3><p class="desc">Compartilhe comandas, histórico e cardápio mantendo o funcionamento offline.</p>
      <div class="v15-sync-sheet-note"><strong>DEV.1 — implantação segura.</strong> Primeiro publique um aparelho como base. Nos demais, use “Adotar base compartilhada”. Alterações locais ficam em fila quando não houver internet.</div>
      <div class="field"><label>URL da Edge Function de sincronização</label><input id="v15SyncUrl" type="url" placeholder="https://...supabase.co/functions/v1/rota27-sync" autocomplete="off"><small class="field-help">A função de sincronização é separada da função do WhatsApp.</small></div>
      <div class="field"><label>Token do dispositivo</label><input id="v15SyncToken" type="password" autocomplete="off" placeholder="Token compartilhado com a Edge Function"></div>
      <div class="field"><label>Nome deste aparelho</label><input id="v15DeviceName" type="text" maxlength="80" placeholder="Ex.: iPhone Balcão"></div>
      <button type="button" class="secondary" id="v15UseWaBtn" style="width:100%;margin-bottom:10px">Usar URL/token já configurados no WhatsApp</button>
      <button type="button" class="primary" id="v15SaveConfigBtn" style="width:100%">Salvar configuração</button>
      <div id="v15SyncSheetStatus" class="v15-sync-status"></div>
      <div class="v15-sync-state"><div><small>Identificador</small><b id="v15StateDevice"></b></div><div><small>Cursor remoto</small><b id="v15StateCursor"></b></div><div><small>Fila local</small><b id="v15StatePending"></b></div><div><small>Última sync</small><b id="v15StateLast"></b></div></div>
      <div class="v15-sync-sheet-note"><strong id="v15InitState"></strong><br>Se este for o primeiro aparelho, publique a base. Em um aparelho novo, adote a base compartilhada; uma cópia local é criada antes da substituição.</div>
      <div class="v15-sync-actions"><button type="button" id="v15PublishBtn">Publicar este aparelho como base</button><button type="button" id="v15AdoptBtn">Adotar base compartilhada</button><button type="button" id="v15SyncNowBtn" class="primary">Sincronizar agora</button><button type="button" id="v15DisableBtn" class="danger">Desativar neste aparelho</button></div>
      <div id="v15ConflictBox" class="v15-sync-conflict" style="display:none"></div>
      <div class="v15-device-list" id="v15DeviceList"></div>
      <div class="sheet-actions"><button type="button" class="secondary" id="v15CloseSyncBtn">Fechar</button><button type="button" class="primary" id="v15RefreshStatusBtn">Atualizar status</button></div>
    </div>`;
    document.body.appendChild(wrap);
    byId('v15CloseSyncBtn').addEventListener('click',()=>wrap.classList.remove('open'));
    byId('v15UseWaBtn').addEventListener('click',()=>{if(deriveFromWhatsapp()){persistConfig();renderSyncSheet();setSheetStatus('URL e token copiados da configuração do WhatsApp.','ok');}else setSheetStatus('WhatsApp ainda não possui URL/token utilizáveis neste aparelho.','warn');});
    byId('v15SaveConfigBtn').addEventListener('click',saveForm);
    byId('v15PublishBtn').addEventListener('click',publishThisDevice);
    byId('v15AdoptBtn').addEventListener('click',adoptSharedBase);
    byId('v15SyncNowBtn').addEventListener('click',()=>syncNow().then(renderSyncSheet));
    byId('v15DisableBtn').addEventListener('click',disableSync);
    byId('v15RefreshStatusBtn').addEventListener('click',()=>refreshServerStatus().then(()=>{renderSyncSheet();setSheetStatus('Status atualizado.','ok');}).catch(err=>setSheetStatus(err.message,'error')));
  }

  function openSheet() { ensureSheet(); renderSyncSheet(); byId('v15SyncWrap').classList.add('open'); }

  function insertCard() {
    const screen=byId('screenMenu'); if(!screen||byId('v15SyncCard'))return;
    const card=document.createElement('div');card.id='v15SyncCard';card.className='v15-sync-card';
    card.innerHTML=`<div><strong>Sincronização entre aparelhos</strong><small id="v15SyncCardStatus"><span class="v15-sync-dot"></span>Desativada neste aparelho</small></div><button type="button" id="v15SyncConfigBtn">Configurar</button>`;
    const wa=screen.querySelector('.wa-admin-card');
    if(wa)wa.insertAdjacentElement('afterend',card);else screen.querySelector('.section-head')?.insertAdjacentElement('afterend',card);
    byId('v15SyncConfigBtn').addEventListener('click',openSheet);renderSyncStatus();
  }

  function updateIdentity() {
    const badge=byId('v14VersionBadge'); if(badge)badge.textContent='v0.15 DEV.1';
    document.title='Rota 27 Bodega • Comandas v0.15 DEV.1';
    window.ROTA27_RELEASE_VERSION=VERSION;
  }

  function startSchedulers() {
    window.addEventListener('online',()=>scheduleSyncSoon());
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')scheduleSyncSoon();});
    clearInterval(intervalTimer); intervalTimer=setInterval(()=>{if(config.enabled&&config.initialized&&navigator.onLine)syncNow();},SYNC_INTERVAL_MS);
  }

  function expose() {
    window.v15OpenSyncSheet=openSheet;
    window.v15SyncNow=syncNow;
    window.v15PublishSyncBase=publishThisDevice;
    window.v15AdoptSharedBase=adoptSharedBase;
    window.ROTA27_SYNC_DEV_VERSION=VERSION;
  }

  function init() {
    try {
      patchSave(); insertCard(); ensureSheet(); updateIdentity(); startSchedulers(); expose();
      previousState=cloneCoreState(state);
      if(config.enabled&&config.initialized&&navigator.onLine)setTimeout(()=>syncNow(),1200);
      console.info(`[Rota27] sincronização multidispositivo carregada (${VERSION}).`);
    } catch(err) { console.error('[Rota27 v0.15] Falha ao inicializar sincronização:',err); }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
