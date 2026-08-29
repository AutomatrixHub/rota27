/* Rota 27 v0.25.59 — dias de cobertura do estoque */
(function(){
  'use strict';
  const VERSION='0.25.59';
  const SAMPLE_DAYS=7;
  const byId=id=>document.getElementById(id);
  const stock=()=>window.Rota27V021||null;
  const fmt=v=>Number(v||0).toLocaleString('pt-BR',{maximumFractionDigits:1});
  const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

  function stateRef(){try{return typeof state!=='undefined'&&state?state:window.state||null;}catch{return window.state||null;}}
  function isRevenue(c){return !!c&&c.cancelled!==true&&c.internalConsumption!==true&&c.nonRevenue!==true&&String(c.paymentMethod||'')!=='Consumo interno';}
  function dateKeyFromTs(ts){const d=new Date(Number(ts||0));if(Number.isNaN(d.getTime()))return'';return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
  function operationalDate(c){const raw=String(c?.businessDate||'');if(/^\d{4}-\d{2}-\d{2}$/.test(raw)&&raw!=='0000-00-00')return raw;return dateKeyFromTs(c?.openedAt||c?.createdAt||c?.closedAt||0);}
  function history(){return (Array.isArray(stateRef()?.history)?stateRef().history:[]).filter(isRevenue);}
  function sampleDates(){
    const dates=[];
    history().slice().sort((a,b)=>Number(b?.openedAt||b?.createdAt||b?.closedAt||0)-Number(a?.openedAt||a?.createdAt||a?.closedAt||0)).forEach(c=>{const k=operationalDate(c);if(k&&!dates.includes(k))dates.push(k);});
    return dates.slice(0,SAMPLE_DAYS);
  }
  function soldOnDate(productId,date){return history().filter(c=>operationalDate(c)===date).reduce((sum,c)=>sum+Math.max(0,Number(c?.items?.[productId]||0)),0);}
  function coverageFor(productId){
    const dates=sampleDates(),available=Number(stock()?.availableQty?.(productId)||0);
    if(!dates.length)return {available,avg:0,days:null,sampleDays:0,target7:null};
    const sold=dates.reduce((sum,date)=>sum+soldOnDate(productId,date),0),avg=sold/dates.length;
    if(!(avg>0))return {available,avg:0,days:null,sampleDays:dates.length,target7:null};
    const days=Math.max(0,available)/avg;
    const target7=Math.max(0,Math.ceil((avg*7)-Math.max(0,available)));
    return {available,avg,days,sampleDays:dates.length,target7};
  }
  function coverageLabel(c){
    if(!c||c.days===null)return'Sem consumo recente';
    if(c.available<=0)return'Sem cobertura';
    if(c.days>=30)return'Cobertura 30+ dias';
    if(c.days<1)return'Cobertura < 1 dia';
    return `Cobertura ≈ ${fmt(c.days)} dia${c.days<1.5?'':'s'}`;
  }
  function coverageClass(c){if(!c||c.days===null)return'neutral';if(c.available<=0||c.days<=2)return'danger';if(c.days<=5)return'warn';return'ok';}
  function productIdFromStockRow(row){const onclick=row.querySelector('.v021-actions button')?.getAttribute('onclick')||'';const m=onclick.match(/openConfig\(['"]([^'"]+)/);return m?m[1]:'';}

  function decorateStock(){
    const list=byId('v021StockList');if(!list)return false;
    list.querySelectorAll('.v021-row').forEach(row=>{
      const id=productIdFromStockRow(row);if(!id)return;
      let line=row.querySelector('.v02559-coverage');if(!line){line=document.createElement('small');line.className='v02559-coverage';row.querySelector('.v021-product')?.appendChild(line);}
      const c=coverageFor(id);line.className=`v02559-coverage ${coverageClass(c)}`;line.textContent=c.days===null?coverageLabel(c):`${coverageLabel(c)} • média ${fmt(c.avg)}/dia`;
    });
    return true;
  }
  function decorateRestock(){
    document.querySelectorAll('.v022-restock-row[data-product-id]').forEach(row=>{
      const id=row.dataset.productId||'';if(!id)return;const c=coverageFor(id);let line=row.querySelector('.v02559-restock-coverage');if(!line){line=document.createElement('small');line.className='v02559-restock-coverage';row.querySelector('.v022-product')?.appendChild(line);}
      line.className=`v02559-restock-coverage ${coverageClass(c)}`;
      if(c.days===null)line.textContent='Cobertura: sem consumo recente';
      else line.textContent=`${coverageLabel(c)} • para ~7 dias: comprar ${fmt(c.target7)} unid.`;
    });
    return true;
  }
  function refresh(){decorateStock();decorateRestock();}
  function settle(){[0,90,260].forEach(ms=>setTimeout(refresh,ms));}
  function start(){
    settle();
    document.addEventListener('click',e=>{if(e.target.closest?.('#v021StockEntry,#v021StockWrap button,#v022PurchasesEntry,#v022PurchasesWrap button,[data-action="receive"]'))settle();});
    document.addEventListener('input',e=>{if(e.target?.id==='v021StockSearch')setTimeout(decorateStock,20);});
    window.addEventListener('rota27:v021-stock-updated',settle);window.addEventListener('rota27:v017-domain-updated',settle);window.addEventListener('storage',settle);
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')settle();});
    window.Rota27V02559StockCoverage={version:VERSION,refresh,getCoverage:coverageFor,sampleDates};
    console.info('[Rota27] v0.25.59 — dias de cobertura do estoque ativo.');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
