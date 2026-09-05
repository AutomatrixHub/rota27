/* Rota 27 v0.25.192 — guarda de transição da reconciliação */
(function(){
  'use strict';
  if(window.Rota27V025190ReconcileGuard)return;

  const VERSION='0.25.192';
  const SYNC_KEY='rota27_sync_config_v1';
  const MARKER_KEY='rota27_v025189_reconcile_cursor_v1';
  const GUARD_CURSOR_KEY='rota27_v025190_reconcile_guard_cursor_v1';
  const previousSetItem=Storage.prototype.setItem;

  const parse=raw=>{try{const v=JSON.parse(raw||'{}');return v&&typeof v==='object'&&!Array.isArray(v)?v:{};}catch{return {};}};
  const ready=c=>c?.enabled===true&&c?.initialized===true&&/^https:\/\/.+\/functions\/v1\/rota27-sync\/?$/i.test(String(c?.functionUrl||''))&&String(c?.deviceToken||'').length>=16&&!!c?.deviceId;
  const identity=c=>[
    String(c?.functionUrl||'').replace(/\/+$/,'').toLowerCase(),
    String(c?.storeId||'rota27-bodega'),
    String(c?.deviceId||'')
  ].join('|');
  const raw=k=>{try{return localStorage.getItem(k);}catch{return null;}};

  function scheduleOneTimeReconcile(){
    try{
      if(!ready(parse(raw(SYNC_KEY))))return;
      if(raw(GUARD_CURSOR_KEY)===VERSION)return;
      setTimeout(async()=>{
        try{
          const api=window.Rota27V025189SyncReconcile;
          if(!api?.run)return;
          const ok=await api.run();
          if(ok===true)previousSetItem.call(localStorage,GUARD_CURSOR_KEY,VERSION);
        }catch{}
      },350);
    }catch{}
  }

  Storage.prototype.setItem=function(key,value){
    const k=String(key),isLocal=this===localStorage;
    const beforeCfg=isLocal&&k===SYNC_KEY?parse(raw(SYNC_KEY)):null;
    const result=previousSetItem.call(this,key,value);
    if(!isLocal)return result;

    if(k===SYNC_KEY){
      const afterCfg=parse(raw(SYNC_KEY));
      const wasReady=ready(beforeCfg),isReady=ready(afterCfg);
      const identityChanged=identity(beforeCfg)!==identity(afterCfg);
      if(!isReady||!wasReady||identityChanged){
        try{localStorage.removeItem(MARKER_KEY);}catch{}
        try{localStorage.removeItem(GUARD_CURSOR_KEY);}catch{}
      }
      if(isReady&&(!wasReady||identityChanged))scheduleOneTimeReconcile();
    }
    return result;
  };

  if(!ready(parse(raw(SYNC_KEY)))){
    try{localStorage.removeItem(MARKER_KEY);}catch{}
    try{localStorage.removeItem(GUARD_CURSOR_KEY);}catch{}
  }else scheduleOneTimeReconcile();

  window.Rota27V025190ReconcileGuard={version:VERSION};
  console.info(`[Rota27] guarda de reconciliação v${VERSION} carregada.`);
})();
