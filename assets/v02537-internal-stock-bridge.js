/* Rota 27 v0.25.37 — baixa de estoque para consumo interno */
(function(){
  'use strict';
  const VERSION='0.25.37';
  const CFG_KEY='rota27_v021_stock_cfg_v1';
  const MOV_KEY='rota27_v021_stock_mov_v1';
  const OUTBOX_KEY='rota27_v021_stock_outbox_v1';
  const SYNC_KEY='rota27_sync_config_v1';
  const MAX_MOV=6000,MAX_OUTBOX=900;

  const clone=v=>JSON.parse(JSON.stringify(v==null?null:v));
  const readJson=(k,f)=>{try{const v=JSON.parse(localStorage.getItem(k)||'null');return v==null?f:v;}catch{return f;}};
  const writeJson=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true;}catch{return false;}};
  const isInternal=c=>c?.internalConsumption===true||c?.nonRevenue===true||String(c?.paymentMethod||'')==='Consumo interno';

  function device(){
    const c=readJson(SYNC_KEY,{})||{};
    return {id:String(c.deviceId||'local').slice(0,120)||'local',name:String(c.deviceName||'Este aparelho').slice(0,80)||'Este aparelho'};
  }
  function configs(){const v=readJson(CFG_KEY,{});return v&&typeof v==='object'&&!Array.isArray(v)?v:{};}
  function movements(){const v=readJson(MOV_KEY,[]);return Array.isArray(v)?v:[];}
  function outbox(){const v=readJson(OUTBOX_KEY,[]);return Array.isArray(v)?v:[];}
  function productName(record,id){
    const meta=record?.itemMeta?.[id];if(meta?.name)return String(meta.name);
    try{return String((state?.catalog||[]).find(p=>String(p?.id||'')===String(id))?.name||'Produto');}catch{return 'Produto';}
  }
  function appendMovement(record,id,qty){
    const cfg=configs()[id];if(cfg?.enabled!==true||!(Number(qty)>0))return false;
    const movementId=`stock_internal_${String(record.id)}_${String(id)}`;
    const rows=movements();if(rows.some(m=>String(m?.id||'')===movementId))return false;
    const at=Number(record.internalClosedAt||record.operationalClosedAt||Date.now()),d=device();
    const movement={
      id:movementId,
      productId:String(id),
      productName:productName(record,id),
      delta:-Number(qty),
      type:'internal',
      reason:'Consumo interno / próprio',
      createdAt:at,
      createdAtIso:new Date(at).toISOString(),
      deviceId:d.id,
      deviceName:d.name,
      commandId:String(record.id),
      appVersion:VERSION
    };
    rows.push(clone(movement));writeJson(MOV_KEY,rows.slice(-MAX_MOV));
    const queued=outbox().filter(e=>String(e?.eventId||'')!==movementId);
    queued.push({eventId:movementId,eventType:'stock_movement',entityId:String(id),payload:{movement:clone(movement)},deviceId:d.id,createdAt:new Date(at).toISOString(),appVersion:VERSION});
    writeJson(OUTBOX_KEY,queued.slice(-MAX_OUTBOX));
    return true;
  }
  function ensureForRecord(record){
    if(!record?.id||!isInternal(record))return 0;
    let changed=0;Object.entries(record.items||{}).forEach(([id,qty])=>{if(appendMovement(record,id,qty))changed++;});
    if(changed){
      window.dispatchEvent(new CustomEvent('rota27:v021-stock-updated'));
      setTimeout(()=>{try{window.Rota27V021?.syncStock?.();}catch{}},80);
    }
    return changed;
  }
  function findRecord(id){try{return (state?.history||[]).find(c=>String(c?.id||'')===String(id)&&isInternal(c))||null;}catch{return null;}}
  function reconcileRecent(){
    try{
      const cutoff=Date.now()-14*86400000;
      (state?.history||[]).filter(isInternal).filter(c=>Number(c?.internalClosedAt||c?.operationalClosedAt||0)>=cutoff).forEach(ensureForRecord);
    }catch{}
  }
  function start(){
    window.addEventListener('rota27:v02537-internal-updated',e=>{const id=e?.detail?.commandId;const record=findRecord(id);if(record)ensureForRecord(record);});
    window.addEventListener('rota27:v017-domain-updated',()=>setTimeout(reconcileRecent,120));
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')setTimeout(reconcileRecent,180);});
    setTimeout(reconcileRecent,700);
    window.Rota27V02537InternalStock={version:VERSION,reconcile:reconcileRecent};
    console.info('[Rota27] v0.25.37 — estoque do consumo interno carregado.');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
