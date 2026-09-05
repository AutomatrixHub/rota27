/* Rota 27 v0.25.201 — preservação de registros históricos locais */
(function(){
  'use strict';
  if(window.Rota27V025188BusinessStoreRetention)return;

  const VERSION='0.25.201';
  const CLOSURES_KEY='rota27_v019_turn_closures_v1';
  const TARGETS=new Map([
    [CLOSURES_KEY,{limit:900,mode:'head',immutable:true,label:'fechamentos'}],
    ['rota27_v021_stock_mov_v1',{limit:6000,mode:'tail',immutable:true,label:'movimentos de estoque'}],
    ['rota27_v022_suppliers_v1',{limit:400,mode:'tail',label:'fornecedores'}],
    ['rota27_v022_purchase_orders_v1',{limit:3000,mode:'tail',label:'pedidos de compra'}],
    ['rota27_v022_purchase_receipts_v1',{limit:6000,mode:'tail',immutable:true,label:'recebimentos de compra'}],
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
  const sameRow=(a,b)=>{try{return JSON.stringify(a)===JSON.stringify(b);}catch{return false;}};
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
  function immutableValue(key,target,previous,next,storage){
    const superseded=key===CLOSURES_KEY?supersededClosureIds(storage):new Set();
    const oldById=new Map();
    previous.forEach(row=>{const id=idOf(row);if(id&&!superseded.has(id)&&!oldById.has(id))oldById.set(id,row);});
    const out=[],seen=new Set();let frozen=0,blockedSuperseded=0;
    const addNext=row=>{
      const id=idOf(row);if(!id||seen.has(id))return;
      if(superseded.has(id)){blockedSuperseded++;return;}
      const old=oldById.get(id);
      if(old){if(!sameRow(old,row))frozen++;out.push(old);}else out.push(row);
      seen.add(id);
    };
    const addOld=row=>{
      const id=idOf(row);if(!id||seen.has(id)||superseded.has(id))return;
      out.push(row);seen.add(id);
    };
    if(target.mode==='head'){
      next.forEach(addNext);
      previous.forEach(addOld);
    }else{
      previous.forEach(addOld);
      next.forEach(addNext);
    }
    let changed=false;
    try{changed=JSON.stringify(out)!==JSON.stringify(next);}catch{changed=true;}
    if(!changed)return null;
    const preserved=Math.max(0,out.length-next.length+blockedSuperseded);
    if(!warned.has(key)){
      warned.add(key);
      console.warn(`[Rota27 ${VERSION}] livro imutável protegido para ${target.label}: ${preserved} registro(s) preservado(s), ${frozen} mutação(ões) bloqueada(s), ${blockedSuperseded} superseded ignorado(s).`);
    }
    try{window.dispatchEvent(new CustomEvent('rota27:business-store-preserved',{detail:{key,label:target.label,preserved,frozen,blockedSuperseded,size:out.length,immutable:true}}));}catch{}
    return JSON.stringify(out);
  }
  function protectedValue(key,rawValue,storage){
    const target=TARGETS.get(key);if(!target)return null;
    const previous=parseRows(storage.getItem(key)),next=parseRows(String(rawValue));
    if(!previous||!next||!previous.length)return null;

    if(target.immutable===true)return immutableValue(key,target,previous,next,storage);

    const nextIds=new Set(next.map(idOf));
    const removed=previous.filter(row=>!nextIds.has(idOf(row)));
    if(!removed.length||previous.length<target.limit||next.length!==target.limit)return null;

    const restoreIds=removed.map(idOf);
    const merged=target.mode==='head'?mergeHead(previous,next,restoreIds):mergeTail(previous,next,restoreIds);
    if(merged.length<=next.length)return null;
    if(!warned.has(key)){
      warned.add(key);
      console.warn(`[Rota27 ${VERSION}] retenção histórica ativada para ${target.label}: ${merged.length-next.length} registro(s) preservado(s).`);
    }
    try{window.dispatchEvent(new CustomEvent('rota27:business-store-preserved',{detail:{key,label:target.label,preserved:merged.length-next.length,size:merged.length,immutable:false}}));}catch{}
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
