/* Rota 27 v0.25.185 — durabilidade das filas de domínio */
(function(){
  'use strict';
  if(window.Rota27V025184DurableDomainOutbox)return;

  const VERSION='0.25.185';
  const TARGETS=new Map([
    ['rota27_v017_domain_outbox_v1',{maxBatch:100,label:'clientes/configuração gerencial'}],
    ['rota27_v019_turn_outbox_v1',{maxBatch:50,label:'fechamento de turno'}],
    ['rota27_v021_stock_outbox_v1',{maxBatch:80,label:'estoque'}],
    ['rota27_v022_purchase_outbox_v1',{maxBatch:80,label:'compras'}],
    ['rota27_v023_inventory_outbox_v1',{maxBatch:80,label:'inventário'}],
    ['rota27_v02512_receivable_outbox_v1',{maxBatch:100,label:'a receber'}],
    ['rota27_v02537_internal_marker_outbox_v1',{maxBatch:20,label:'consumo interno'}]
  ]);

  const originalSetItem=Storage.prototype.setItem;
  const warned=new Set();

  function parseEvents(raw){
    if(typeof raw!=='string')return null;
    try{
      const rows=JSON.parse(raw);
      if(!Array.isArray(rows))return null;
      if(rows.some(row=>!row||typeof row!=='object'||!String(row.eventId||row.event_id||'')))return null;
      return rows;
    }catch{return null;}
  }
  function idOf(row){return String(row?.eventId||row?.event_id||'');}
  function mergeKeepingOldOrder(previous,next,restoreIds){
    const nextById=new Map(next.map(row=>[idOf(row),row]));
    const restore=new Set(restoreIds);
    const out=[],seen=new Set();
    previous.forEach(row=>{
      const id=idOf(row);
      if(!id||seen.has(id))return;
      if(nextById.has(id)){out.push(nextById.get(id));seen.add(id);return;}
      if(restore.has(id)){out.push(row);seen.add(id);}
    });
    next.forEach(row=>{const id=idOf(row);if(id&&!seen.has(id)){out.push(row);seen.add(id);}});
    return out;
  }
  function protectedValue(key,rawValue,storage){
    const target=TARGETS.get(key);
    if(!target)return null;
    const previous=parseEvents(storage.getItem(key));
    const next=parseEvents(String(rawValue));
    if(!previous||!next||!previous.length||!next.length)return null;

    const prevIds=new Set(previous.map(idOf));
    const nextIds=new Set(next.map(idOf));
    const added=next.filter(row=>!prevIds.has(idOf(row)));
    const removed=previous.filter(row=>!nextIds.has(idOf(row)));
    if(!removed.length)return null;

    let restore=[];
    if(added.length){
      // Enfileiramento + corte por slice(-MAX): nenhum pendente antigo pode sumir.
      restore=removed;
    }else if(removed.length>target.maxBatch){
      // Após um push legítimo, no máximo maxBatch eventos saem por gravação.
      // O excedente removido é efeito do limite legado e precisa voltar à fila.
      restore=removed.slice(target.maxBatch);
    }
    if(!restore.length)return null;

    const merged=mergeKeepingOldOrder(previous,next,restore.map(idOf));
    if(merged.length<=next.length)return null;
    if(!warned.has(key)){
      warned.add(key);
      console.warn(`[Rota27 ${VERSION}] retenção segura ativada para ${target.label}: ${merged.length-next.length} evento(s) pendente(s) preservado(s).`);
    }
    try{window.dispatchEvent(new CustomEvent('rota27:durable-outbox-preserved',{detail:{key,label:target.label,preserved:merged.length-next.length,size:merged.length}}));}catch{}
    return JSON.stringify(merged);
  }

  Storage.prototype.setItem=function(key,value){
    const k=String(key);
    if(this===localStorage&&TARGETS.has(k)){
      const safe=protectedValue(k,value,this);
      if(safe!==null)return originalSetItem.call(this,k,safe);
    }
    return originalSetItem.call(this,key,value);
  };

  window.Rota27V025184DurableDomainOutbox={version:VERSION,keys:[...TARGETS.keys()]};
  console.info(`[Rota27] proteção de filas de domínio v${VERSION} carregada.`);
})();