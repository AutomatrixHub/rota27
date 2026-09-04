/* Rota 27 v0.25.188 — preservação de registros históricos locais */
(function(){
  'use strict';
  if(window.Rota27V025188BusinessStoreRetention)return;

  const VERSION='0.25.188';
  const TARGETS=new Map([
    ['rota27_v019_turn_closures_v1',{limit:900,mode:'head',label:'fechamentos'}],
    ['rota27_v021_stock_mov_v1',{limit:6000,mode:'tail',label:'movimentos de estoque'}],
    ['rota27_v022_suppliers_v1',{limit:400,mode:'tail',label:'fornecedores'}],
    ['rota27_v022_purchase_orders_v1',{limit:3000,mode:'tail',label:'pedidos de compra'}],
    ['rota27_v022_purchase_receipts_v1',{limit:6000,mode:'tail',label:'recebimentos de compra'}],
    ['rota27_v023_inventories_v1',{limit:300,mode:'tail',label:'inventários'}]
  ]);
  const REPAIR_KEY='rota27_v02516_turn_repair_state_v1';
  const previousSetItem=Storage.prototype.setItem;
  const warned=new Set();

  function parseRows(raw){
    if(typeof raw!=='string')return null;
    try{
      const rows=JSON.parse(raw);
      if(!Array.isArray(rows))return null;
      if(rows.some(row=>!row||typeof row!=='object'||!String(row.id||'')))return null;
      return rows;
    }catch{return null;}
  }
  const idOf=row=>String(row?.id||'');
  function supersededClosureIds(storage){
    try{
      const raw=JSON.parse(storage.getItem(REPAIR_KEY)||'{}')||{};
      const ids=new Set();
      Object.values(raw.repairs||{}).forEach(repair=>{
        (Array.isArray(repair?.supersededClosureIds)?repair.supersededClosureIds:[]).forEach(id=>ids.add(String(id||'')));
      });
      return ids;
    }catch{return new Set();}
  }
  function mergeTail(previous,next,restoreIds){
    const nextById=new Map(next.map(row=>[idOf(row),row]));
    const restore=new Set(restoreIds),out=[],seen=new Set();
    previous.forEach(row=>{
      const id=idOf(row);if(!id||seen.has(id))return;
      if(nextById.has(id)){out.push(nextById.get(id));seen.add(id);return;}
      if(restore.has(id)){out.push(row);seen.add(id);}
    });
    next.forEach(row=>{const id=idOf(row);if(id&&!seen.has(id)){out.push(row);seen.add(id);}});
    return out;
  }
  function mergeHead(previous,next,restoreIds){
    const restore=new Set(restoreIds),out=[],seen=new Set();
    next.forEach(row=>{const id=idOf(row);if(id&&!seen.has(id)){out.push(row);seen.add(id);}});
    previous.forEach(row=>{const id=idOf(row);if(id&&restore.has(id)&&!seen.has(id)){out.push(row);seen.add(id);}});
    return out;
  }
  function protectedValue(key,rawValue,storage){
    const target=TARGETS.get(key);if(!target)return null;
    const previous=parseRows(storage.getItem(key)),next=parseRows(String(rawValue));
    if(!previous||!next||previous.length<target.limit||next.length!==target.limit)return null;

    const nextIds=new Set(next.map(idOf));
    let removed=previous.filter(row=>!nextIds.has(idOf(row)));
    if(!removed.length)return null;
    if(key==='rota27_v019_turn_closures_v1'){
      const superseded=supersededClosureIds(storage);
      removed=removed.filter(row=>!superseded.has(idOf(row)));
    }
    if(!removed.length)return null;

    const restoreIds=removed.map(idOf);
    const merged=target.mode==='head'?mergeHead(previous,next,restoreIds):mergeTail(previous,next,restoreIds);
    if(merged.length<=next.length)return null;
    if(!warned.has(key)){
      warned.add(key);
      console.warn(`[Rota27 ${VERSION}] retenção histórica ativada para ${target.label}: ${merged.length-next.length} registro(s) preservado(s).`);
    }
    try{window.dispatchEvent(new CustomEvent('rota27:business-store-preserved',{detail:{key,label:target.label,preserved:merged.length-next.length,size:merged.length}}));}catch{}
    return JSON.stringify(merged);
  }

  Storage.prototype.setItem=function(key,value){
    const k=String(key);
    if(this===localStorage&&TARGETS.has(k)){
      const safe=protectedValue(k,value,this);
      if(safe!==null)return previousSetItem.call(this,k,safe);
    }
    return previousSetItem.call(this,key,value);
  };

  window.Rota27V025188BusinessStoreRetention={version:VERSION,keys:[...TARGETS.keys()]};
  console.info(`[Rota27] retenção histórica v${VERSION} carregada.`);
})();
