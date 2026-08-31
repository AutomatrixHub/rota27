/* Rota 27 v0.25.89 — data/hora e forma de quitação explícitas */
(function(){
  'use strict';
  if(window.Rota27V02589ReceivableSettlement)return;

  const VERSION='0.25.89';
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[ch]));
  const money=value=>Number(value||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  let observer=null;
  let applying=false;
  let timer=null;

  function rows(){
    try{
      const api=window.Rota27V02512;
      const value=api?.getReceivables?.();
      return Array.isArray(value)?value:[];
    }catch{return [];}
  }
  function payments(row){return Array.isArray(row?.payments)?row.payments.filter(p=>p&&Number(p.amount)>0):[];}
  function lastPayment(row){return payments(row).slice().sort((a,b)=>Number(b.paidAt||0)-Number(a.paidAt||0))[0]||null;}
  function paymentTime(row){return Number(lastPayment(row)?.paidAt||0);}
  function formatDate(value){
    const d=new Date(Number(value||0));if(Number.isNaN(d.getTime()))return '—';
    return d.toLocaleDateString('pt-BR');
  }
  function formatDateTime(value){
    const d=new Date(Number(value||0));if(Number.isNaN(d.getTime()))return '—';
    return `${d.toLocaleDateString('pt-BR')} às ${d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}`;
  }
  function rowHtml(row){
    const paid=row?.status==='paid';
    const last=lastPayment(row);
    const received=Math.max(0,Number(row?.paidAmount||0));
    let detail='Nenhum recebimento registrado';
    if(received>0&&last){
      const method=String(last.method||'Forma não informada').trim()||'Forma não informada';
      detail=paid
        ?`${money(received)} recebido · <b>Quitado em ${esc(formatDateTime(last.paidAt))}</b> · ${esc(method)}`
        :`${money(received)} recebido · <b>Último recebimento em ${esc(formatDateTime(last.paidAt))}</b> · ${esc(method)}`;
    }
    return `<div class="v02512-row ${paid?'paid':''}">
      <div class="v02512-row-copy">
        <strong>${esc(row?.customer||'Cliente')}</strong>
        <span>${esc(row?.table||'Sem local')} • origem ${esc(formatDate(row?.openedAt))}</span>
        <small class="v02589-settlement-detail">${detail}</small>
      </div>
      <div class="v02512-row-balance">
        <b>${paid?'Quitado':esc(money(row?.balance||0))}</b>
        ${paid?'':`<button type="button" data-v02512-pay="${esc(row?.id||'')}">Registrar recebimento</button>`}
      </div>
    </div>`;
  }
  function signature(list){
    return list.map(row=>`${row?.id||''}:${row?.status||''}:${Number(row?.paidAmount||0).toFixed(2)}:${paymentTime(row)}`).join('|');
  }
  function findSection(body,title){
    const sections=[...body.querySelectorAll('.v02512-section-title')];
    return sections.find(section=>String(section.querySelector('h4')?.textContent||'').trim()===title)||null;
  }
  function reapplyDueDates(){
    try{window.Rota27V02558ReceivableDue?.refresh?.();}catch{}
  }
  function apply(){
    const body=document.getElementById('v02512ReceivablesBody');
    if(!body||!document.getElementById('v02512ReceivablesWrap')?.classList.contains('open'))return;
    const all=rows();if(!all.length&&body.querySelector('.v02512-row'))return;
    const open=all.filter(row=>row?.status==='open').sort((a,b)=>Number(b.openedAt||0)-Number(a.openedAt||0));
    const paid=all.filter(row=>row?.status==='paid').sort((a,b)=>paymentTime(b)-paymentTime(a)).slice(0,8);
    const openSection=findSection(body,'Em aberto');
    const paidSection=findSection(body,'Quitadas recentemente');
    const openList=openSection?.nextElementSibling?.classList?.contains('v02512-list')?openSection.nextElementSibling:null;
    const paidList=paidSection?.nextElementSibling?.classList?.contains('v02512-list')?paidSection.nextElementSibling:null;
    let rebuilt=false;

    applying=true;
    try{
      if(openList){
        const sig=signature(open);
        if(openList.dataset.v02589Settlement!==sig){
          openList.innerHTML=open.length?open.map(rowHtml).join(''):'<div class="v02512-empty">Nenhuma pendência em aberto.</div>';
          openList.dataset.v02589Settlement=sig;
          rebuilt=true;
        }
      }
      if(paidSection){
        const hint=paidSection.querySelector('small');
        if(hint&&hint.textContent!=='por data de quitação')hint.textContent='por data de quitação';
      }
      if(paidList){
        const sig=signature(paid);
        if(paidList.dataset.v02589Settlement!==sig){
          paidList.innerHTML=paid.map(rowHtml).join('');
          paidList.dataset.v02589Settlement=sig;
          rebuilt=true;
        }
      }
    }finally{applying=false;}
    if(rebuilt)setTimeout(reapplyDueDates,0);
  }
  function schedule(delay=50){clearTimeout(timer);timer=setTimeout(apply,delay);}
  function watch(){
    const body=document.getElementById('v02512ReceivablesBody');if(!body||observer)return;
    observer=new MutationObserver(()=>{if(!applying)schedule(20);});
    observer.observe(body,{childList:true,subtree:true,characterData:true});
  }
  function start(){
    setTimeout(()=>{watch();schedule(100);},500);
    document.addEventListener('click',event=>{
      if(event.target.closest?.('#v02512Open,#v02512Sync'))setTimeout(()=>{watch();schedule(80);},120);
    },true);
    window.addEventListener('rota27:v02512-receivables-updated',()=>schedule(30));
    window.addEventListener('rota27:v017-domain-updated',()=>schedule(50));
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')setTimeout(()=>{watch();schedule(80);},250);});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

  window.Rota27V02589ReceivableSettlement={version:VERSION,apply};
})();
