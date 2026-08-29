/* Rota 27 v0.25.62 — alertas de custo/margem por exceção */
(function(){
  'use strict';
  const VERSION='0.25.62';
  const COST_RISE_PCT=10;
  const RECENT_MS=30*86400000;
  const byId=id=>document.getElementById(id);
  const costs=()=>window.Rota27V024||null;
  const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const fmtPct=v=>Number(v||0).toLocaleString('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1})+'%';
  const fmtMoney=v=>Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  const icon='<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 19V9m6 10V5m6 14v-7m4 7H2"/><path d="M5 7l5-4 5 5 5-5"/></svg>';

  function negativeAlerts(){
    try{return (costs()?.getStats?.()?.negative||[]).map(r=>({kind:'negative',productId:String(r?.product?.id||''),name:String(r?.product?.name||'Produto'),marginPct:Number(r?.marginPct||0),price:Number(r?.price||0),cost:Number(r?.cost?.effectiveUnitCost||0)}));}catch{return[];}
  }
  function riseAlerts(){
    let records=[];try{records=costs()?.getCostRecords?.()||[];}catch{}
    const groups=new Map();records.forEach(r=>{const id=String(r?.productId||'');if(!id)return;const rows=groups.get(id)||[];rows.push(r);groups.set(id,rows);});
    const out=[];groups.forEach(rows=>{
      rows.sort((a,b)=>Number(b?.createdAt||0)-Number(a?.createdAt||0));const latest=rows[0],previous=rows[1];if(!latest||!previous)return;
      if(Date.now()-Number(latest.createdAt||0)>RECENT_MS)return;
      const now=Number(latest.effectiveUnitCost||0),before=Number(previous.effectiveUnitCost||0);if(!(now>0&&before>0&&now>before))return;
      const pct=((now-before)/before)*100;if(pct<COST_RISE_PCT)return;
      out.push({kind:'rise',productId:String(latest.productId||''),name:String(latest.productName||'Produto'),pct,now,before,createdAt:Number(latest.createdAt||0)});
    });return out.sort((a,b)=>b.pct-a.pct);
  }
  function alerts(){const negative=negativeAlerts(),rises=riseAlerts();return {negative,rises,total:negative.length+rises.length,coverage:Number(costs()?.getStats?.()?.coverage||0)};}
  function summaryText(data){const parts=[];if(data.negative.length)parts.push(`${data.negative.length} margem${data.negative.length===1?'':'ns'} negativa${data.negative.length===1?'':'s'}`);if(data.rises.length)parts.push(`${data.rises.length} aumento${data.rises.length===1?'':'s'} de custo ≥ ${COST_RISE_PCT}%`);return parts.join(' • ');}
  function ensureCostsAlert(){
    const wrap=byId('v024CostsWrap');if(!wrap)return null;let box=byId('v02562CostAlerts');if(!box){box=document.createElement('section');box.id='v02562CostAlerts';box.className='v02562-cost-alerts';const tabs=wrap.querySelector('.v024-tabs');tabs?.insertAdjacentElement('beforebegin',box);}return box;
  }
  function renderCostsAlert(){
    const box=ensureCostsAlert();if(!box)return false;const data=alerts();if(!data.total){box.hidden=true;box.innerHTML='';return true;}box.hidden=false;
    const rows=[...data.negative.map(a=>`<div class="v02562-alert-row danger"><span class="v02562-alert-icon">${icon}</span><span><strong>${esc(a.name)}</strong><small>Margem bruta estimada ${esc(fmtPct(a.marginPct))} • venda ${esc(fmtMoney(a.price))} • custo ${esc(fmtMoney(a.cost))}</small></span></div>`),...data.rises.slice(0,5).map(a=>`<div class="v02562-alert-row warn"><span class="v02562-alert-icon">${icon}</span><span><strong>${esc(a.name)}</strong><small>Custo efetivo subiu ${esc(fmtPct(a.pct))}: ${esc(fmtMoney(a.before))} → ${esc(fmtMoney(a.now))}</small></span></div>`)];
    box.innerHTML=`<div class="v02562-alert-head"><div><span>ATENÇÃO</span><strong>Custos & Margem</strong><small>${esc(summaryText(data))}</small></div><b>${data.total}</b></div><div class="v02562-alert-list">${rows.join('')}</div><div class="v02562-alert-foot">Cobertura de custos: ${Math.max(0,Math.min(100,data.coverage))}% dos produtos controlados. Produtos sem custo não entram nas estimativas de margem.</div>`;return true;
  }
  function ensurePanelSignal(){
    const section=byId('v02546Attention'),list=byId('v02546AttentionList');if(!section||!list)return false;const data=alerts();let row=byId('v02562PanelCostAlert');
    if(!data.total){row?.remove();const base=list.querySelectorAll('.v02546-attention-item:not(#v02562PanelCostAlert)').length,ct=byId('v02546AttentionCount');if(ct)ct.textContent=String(base);section.hidden=base===0;return true;}
    if(!row){row=document.createElement('button');row.type='button';row.id='v02562PanelCostAlert';row.className='v02546-attention-item';row.addEventListener('click',()=>{try{costs()?.open?.('overview');}catch{}});list.appendChild(row);}
    row.innerHTML=`<span class="v02546-attention-icon v02562-panel-icon">${icon}</span><span class="v02546-attention-copy"><strong>Custos & Margem precisam de atenção</strong><small>${esc(summaryText(data))}</small></span><span class="v02546-attention-arrow">›</span>`;
    const count=list.querySelectorAll('.v02546-attention-item').length,ct=byId('v02546AttentionCount');if(ct)ct.textContent=String(count);section.hidden=false;return true;
  }
  function refresh(){renderCostsAlert();ensurePanelSignal();}
  function settle(){[0,90,260,600].forEach(ms=>setTimeout(refresh,ms));}
  function start(){
    settle();document.addEventListener('click',e=>{if(e.target.closest?.('#v024PurchasesCostBtn,#v024StockCostBtn,#v024CostsWrap [data-mode],#navPanel'))settle();});
    ['rota27:v022-purchases-updated','rota27:v021-stock-updated','rota27:v023-inventory-updated','rota27:v017-domain-updated'].forEach(name=>window.addEventListener(name,settle));window.addEventListener('storage',settle);
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')settle();});
    window.Rota27V02562CostAlerts={version:VERSION,refresh,getAlerts:alerts};console.info('[Rota27] v0.25.62 — alertas de custo/margem ativos.');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
