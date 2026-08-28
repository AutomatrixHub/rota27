/* Rota 27 v0.25.46 — Hoje precisa de atenção */
(function(){
  'use strict';
  const VERSION='0.25.46';
  const byId=id=>document.getElementById(id);
  const esc=v=>typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const moneyValue=v=>{try{return typeof money==='function'?money(Number(v||0)):Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}catch{return 'R$ 0,00';}};

  function icon(kind){
    const paths={
      receive:'<path d="M3 7h18v11H3z"/><path d="M7 11h4"/><path d="M16 10v5m-2.5-2.5h5"/>',
      stock:'<path d="M4 7l8-4 8 4-8 4z"/><path d="M4 7v10l8 4 8-4V7"/><path d="M12 11v10"/>',
      purchase:'<path d="M4 5h2l2 10h9l2-7H7"/><circle cx="10" cy="19" r="1"/><circle cx="17" cy="19" r="1"/>',
      client:'<circle cx="9" cy="8" r="3"/><path d="M3 20c0-4 2.5-6 6-6s6 2 6 6"/><path d="M16 11h5m-2.5-2.5v5"/>'
    };
    return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[kind]||paths.client}</svg>`;
  }

  function receivableSignal(){
    try{
      const rows=window.Rota27V02512?.getOpenReceivables?.()||[];
      if(!rows.length)return null;
      const balance=rows.reduce((sum,row)=>sum+Math.max(0,Number(row?.balance||0)),0);
      return {key:'receive',title:`${rows.length} pendência${rows.length===1?'':'s'} a receber`,detail:`${moneyValue(balance)} ainda não recebido`,action:'receivables'};
    }catch{return null;}
  }

  function stockSignal(){
    try{
      const api=window.Rota27V021;if(!api?.getConfigs||!api?.statusFor)return null;
      const cfg=api.getConfigs()||{};
      const ids=Object.keys(cfg).filter(id=>cfg[id]?.enabled===true);
      const attention=ids.filter(id=>{const s=api.statusFor(id);return s==='low'||s==='zero';});
      if(!attention.length)return null;
      const zero=attention.filter(id=>api.statusFor(id)==='zero').length;
      return {key:'stock',title:`${attention.length} produto${attention.length===1?'':'s'} precisa${attention.length===1?'':'m'} de atenção`,detail:zero?`${zero} sem estoque disponível ou zerado`:'Estoque no mínimo ou abaixo dele',action:'stock'};
    }catch{return null;}
  }

  function purchaseSignal(){
    try{
      const orders=window.Rota27V022?.getOrders?.()||[];
      const pending=orders.filter(o=>o?.status==='draft'||o?.status==='sent');
      if(!pending.length)return null;
      const sent=pending.filter(o=>o.status==='sent').length;
      return {key:'purchase',title:`${pending.length} pedido${pending.length===1?'':'s'} em andamento`,detail:sent?`${sent} aguardando recebimento`:'Há pedido em rascunho para revisar',action:'purchases'};
    }catch{return null;}
  }

  function relationshipSignal(){
    try{
      const data=window.Rota27V025?.dataset?.();
      const missing=Array.isArray(data?.missing)?data.missing:[];
      if(!missing.length)return null;
      return {key:'client',title:`${missing.length} cliente${missing.length===1?'':'s'} sem voltar há 30+ dias`,detail:'Abra a Fidelização apenas se quiser agir',action:'relationship'};
    }catch{return null;}
  }

  function signals(){return [receivableSignal(),stockSignal(),purchaseSignal(),relationshipSignal()].filter(Boolean);}

  function build(){
    const section=document.createElement('section');section.id='v02546Attention';section.hidden=true;
    section.innerHTML='<div class="v02546-attention-head"><div><span class="v02546-attention-kicker">Operação</span><strong>Hoje precisa de atenção</strong><small>Só aparece quando existe algo que merece ação.</small></div><span class="v02546-attention-count" id="v02546AttentionCount">0</span></div><div class="v02546-attention-list" id="v02546AttentionList"></div>';
    return section;
  }

  function ensurePlacement(){
    const panel=byId('screenPanel');if(!panel)return null;
    let section=byId('v02546Attention');if(!section)section=build();
    const head=panel.querySelector('.v15d4-head');
    if(head){if(section.parentElement!==panel||section.previousElementSibling!==head)head.insertAdjacentElement('afterend',section);}
    else if(section.parentElement!==panel)panel.insertAdjacentElement('afterbegin',section);
    return section;
  }

  function render(){
    const section=ensurePlacement();if(!section)return false;
    const rows=signals(),list=byId('v02546AttentionList'),count=byId('v02546AttentionCount');
    section.hidden=rows.length===0;
    if(count)count.textContent=String(rows.length);
    if(list)list.innerHTML=rows.map(r=>`<button type="button" class="v02546-attention-item" data-v02546-action="${esc(r.action)}"><span class="v02546-attention-icon">${icon(r.key)}</span><span class="v02546-attention-copy"><strong>${esc(r.title)}</strong><small>${esc(r.detail)}</small></span><span class="v02546-attention-arrow">›</span></button>`).join('');
    return true;
  }

  function schedule(){
    const run=()=>{render();requestAnimationFrame(()=>render());setTimeout(render,90);};
    if(typeof queueMicrotask==='function')queueMicrotask(run);else Promise.resolve().then(run);
  }

  function openAction(action){
    if(action==='receivables'){try{window.Rota27V02512?.open?.();}catch{}return;}
    if(action==='stock'){try{window.Rota27V021?.openStock?.();}catch{}return;}
    if(action==='purchases'){try{window.Rota27V022?.open?.();}catch{}return;}
    if(action==='relationship'){try{window.Rota27V025?.openRelationship?.();}catch{}return;}
  }

  function handleClick(e){
    const action=e.target.closest?.('[data-v02546-action]');if(action){openAction(action.dataset.v02546Action);return;}
    if(e.target.closest?.('#navPanel'))schedule();
  }

  function start(){
    schedule();document.addEventListener('click',handleClick);window.addEventListener('storage',schedule);
    ['rota27:v02512-receivables-updated','rota27:v021-stock-updated','rota27:v022-purchases-updated','rota27:v017-domain-updated'].forEach(name=>window.addEventListener(name,schedule));
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')schedule();});
    window.Rota27V02546Attention={version:VERSION,render,signals,refresh:schedule};
    console.info('[Rota27] v0.25.46 — Hoje precisa de atenção carregado.');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
