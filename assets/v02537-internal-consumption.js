/* Rota 27 v0.25.37 — consumo interno / próprio sem faturamento */
(function(){
  'use strict';
  const VERSION='0.25.37';
  const INTERNAL_DATE_SENTINEL='0000-00-00';
  let baseOpenNewCommandSheet=null;
  let baseCreateCommand=null;
  let baseOpenCloseSheet=null;
  let baseRenderPaymentConfirmation=null;
  let baseFinalizeCommand=null;
  let baseRenderHistory=null;
  let baseRenderCommands=null;
  let baseRenderSale=null;

  const byId=id=>document.getElementById(id);
  const clone=v=>JSON.parse(JSON.stringify(v==null?null:v));
  const esc=v=>typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]||ch));
  const moneyValue=v=>{try{return typeof money==='function'?money(Number(v||0)):Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}catch{return 'R$ 0,00';}};
  const toast=msg=>{try{typeof showToast==='function'?showToast(msg,false):window.Rota27V017?.toast?.(msg);}catch{}};

  function dateKey(d=new Date()){
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }
  function dateLabel(key){const [y,m,d]=String(key||'').split('-');return y&&m&&d?`${d}/${m}/${y}`:String(key||'');}
  function startOfToday(){const d=new Date();d.setHours(0,0,0,0);return d.getTime();}
  function shiftDays(ts,days){const d=new Date(ts);d.setDate(d.getDate()+Number(days||0));return d.getTime();}
  function isInternal(c){return c?.internalConsumption===true||c?.nonRevenue===true||String(c?.paymentMethod||'')==='Consumo interno';}
  function activeCommand(){
    try{return (state?.commands||[]).find(c=>String(c?.id||'')===String(activeCommandId||''))||null;}catch{return null;}
  }
  function refTotal(c){
    if(Number.isFinite(Number(c?.internalReferenceTotal)))return Number(c.internalReferenceTotal);
    if(Number.isFinite(Number(c?.referenceTotal)))return Number(c.referenceTotal);
    try{if(typeof commandTotal==='function')return Number(commandTotal(c)||0);}catch{}
    return Object.entries(c?.items||{}).reduce((sum,[id,qty])=>{
      const meta=c?.itemMeta?.[id]||state?.catalog?.find?.(p=>String(p?.id||'')===String(id))||{};
      return sum+Number(qty||0)*Number(meta.price||0);
    },0);
  }
  function units(c){return Object.values(c?.items||{}).reduce((s,q)=>s+Math.max(0,Number(q||0)),0);}

  function ensureToggle(){
    const wrap=byId('newCommandWrap'),quick=wrap?.querySelector('.table-quick');
    if(!wrap||!quick)return false;
    let box=byId('v02537InternalToggle');
    if(!box){
      box=document.createElement('div');box.id='v02537InternalToggle';
      box.innerHTML='<label><input id="v02537InternalCheck" type="checkbox"><span><strong>Consumo interno / próprio</strong><small>Use para itens consumidos pela própria operação. O valor fica registrado como referência, mas não entra no faturamento, ticket médio ou formas de pagamento.</small></span></label>';
      quick.insertAdjacentElement('afterend',box);
      byId('v02537InternalCheck')?.addEventListener('change',e=>setInternalMode(e.target.checked));
    }
    markClientOnlyFields();
    return true;
  }
  function markClientOnlyFields(){
    const ids=['newCustomer','newWhatsapp','newWhatsappOptIn','v02518NewBirthField'];
    ids.forEach(id=>{
      const el=byId(id);if(!el)return;
      const field=id==='newWhatsappOptIn'?(el.closest('label')?.parentElement||el.parentElement):(el.closest('.field')||el);
      if(field)field.classList.add('v02537-client-only');
    });
    const waReady=byId('newWhatsapp')?.closest('.field')?.nextElementSibling;
    if(waReady&&waReady.id!=='v02518NewBirthField'&&/WhatsApp/i.test(waReady.textContent||''))waReady.classList.add('v02537-client-only');
  }
  function setInternalMode(on){
    const wrap=byId('newCommandWrap'),table=byId('newTable'),customer=byId('newCustomer'),phone=byId('newWhatsapp'),opt=byId('newWhatsappOptIn'),birth=byId('newBirthDate');
    wrap?.classList.toggle('v02537-internal-mode',!!on);
    if(on){
      if(table){table.dataset.v02537Previous=table.value||'';table.value='Consumo interno';}
      if(customer)customer.value='';if(phone)phone.value='';if(opt)opt.checked=false;if(birth)birth.value='';
    }else if(table&&table.value==='Consumo interno'){
      table.value=table.dataset.v02537Previous||'';delete table.dataset.v02537Previous;
    }
  }
  function resetInternalMode(){ensureToggle();const check=byId('v02537InternalCheck');if(check)check.checked=false;setInternalMode(false);}

  function patchNewCommand(){
    if(!baseOpenNewCommandSheet&&typeof window.openNewCommandSheet==='function'){
      baseOpenNewCommandSheet=window.openNewCommandSheet;
      window.openNewCommandSheet=function(){const r=baseOpenNewCommandSheet.apply(this,arguments);setTimeout(resetInternalMode,0);return r;};
      try{openNewCommandSheet=window.openNewCommandSheet;}catch{}
    }
    if(!baseCreateCommand&&typeof window.createCommand==='function'){
      baseCreateCommand=window.createCommand;
      window.createCommand=function(){
        ensureToggle();const internal=byId('v02537InternalCheck')?.checked===true;
        if(!internal)return baseCreateCommand.apply(this,arguments);
        setInternalMode(true);
        const before=new Set((state?.commands||[]).map(c=>String(c?.id||'')));
        const result=baseCreateCommand.apply(this,arguments);
        const created=(state?.commands||[]).find(c=>!before.has(String(c?.id||'')))||activeCommand();
        if(created){
          created.internalConsumption=true;
          created.nonRevenue=true;
          created.internalType='own_consumption';
          created.businessDate=dateKey(new Date(Number(created.createdAt||Date.now())));
          created.customer='';created.whatsappPhone='';created.whatsappOptIn=false;
          created.updatedAt=Date.now();
          try{if(typeof save==='function')save();}catch{}
          setTimeout(()=>{try{typeof renderCommands==='function'&&renderCommands();typeof renderSale==='function'&&renderSale();}catch{}},0);
          toast('Consumo interno aberto. Não será contabilizado como faturamento.');
        }
        return result;
      };
      try{createCommand=window.createCommand;}catch{}
    }
  }

  function decorateCommands(){
    const internalOpen=(state?.commands||[]).filter(isInternal);
    document.querySelectorAll('.command-card').forEach(card=>{
      const title=card.querySelector('.command-title');if(!title)return;
      const match=internalOpen.some(c=>String(c.table||'')===String(title.childNodes?.[0]?.textContent||title.textContent||'').trim()||String(title.textContent||'').includes('Consumo interno'));
      card.classList.toggle('v02537-internal-card',match);
      if(match&&!title.querySelector('.v02537-internal-badge'))title.insertAdjacentHTML('beforeend','<span class="v02537-internal-badge">Interno</span>');
    });
  }
  function decorateSale(){
    const c=activeCommand(),head=document.querySelector('#screenSale .detail-title h2,#screenCommand .detail-title h2,.detail-title h2');
    if(!head)return;
    head.querySelector('.v02537-internal-badge')?.remove();
    if(isInternal(c))head.insertAdjacentHTML('beforeend','<span class="v02537-internal-badge">Interno</span>');
  }
  function patchRenderers(){
    if(!baseRenderCommands&&typeof window.renderCommands==='function'){
      baseRenderCommands=window.renderCommands;window.renderCommands=function(){const r=baseRenderCommands.apply(this,arguments);decorateCommands();return r;};try{renderCommands=window.renderCommands;}catch{}
    }
    if(!baseRenderSale&&typeof window.renderSale==='function'){
      baseRenderSale=window.renderSale;window.renderSale=function(){const r=baseRenderSale.apply(this,arguments);decorateSale();return r;};try{renderSale=window.renderSale;}catch{}
    }
  }

  function syncCloseUi(){
    const wrap=byId('closeWrap'),c=activeCommand(),internal=isInternal(c);if(!wrap)return;
    wrap.classList.toggle('v02537-internal-close',internal);
    const finalBtn=byId('finalizeBtn');
    if(finalBtn&&!finalBtn.dataset.v02537NormalText)finalBtn.dataset.v02537NormalText=finalBtn.textContent||'Fechar conta';
    if(!internal){byId('v02537CloseBanner')?.remove();if(finalBtn&&finalBtn.dataset.v02537NormalText)finalBtn.textContent=finalBtn.dataset.v02537NormalText;return;}
    let banner=byId('v02537CloseBanner');
    if(!banner){banner=document.createElement('div');banner.id='v02537CloseBanner';const anchor=wrap.querySelector('.closed-note')||byId('paymentConfirmBtn');anchor?.insertAdjacentElement('beforebegin',banner);}
    if(banner)banner.innerHTML=`<strong>Consumo interno</strong>Valor de referência: ${esc(moneyValue(refTotal(c)))}. Este fechamento não gera venda nem pagamento.`;
    if(finalBtn){finalBtn.disabled=false;finalBtn.textContent='Finalizar consumo interno';}
    const note=wrap.querySelector('.closed-note');if(note)note.textContent='Os itens permanecem registrados para controle e estoque, mas não entram em faturamento, ticket médio, formas de pagamento ou A receber.';
  }
  function closeInternal(){
    const c=activeCommand();if(!c)return;
    if(units(c)<=0){toast('Lance ao menos um produto antes de finalizar o consumo interno.');return;}
    const idx=(state?.commands||[]).findIndex(x=>String(x?.id||'')===String(c.id));if(idx<0)return;
    const now=Date.now(),reference=refTotal(c),operationalDate=String(c.businessDate||dateKey(new Date(Number(c.createdAt||now))));
    const record={...clone(c),internalConsumption:true,nonRevenue:true,internalType:'own_consumption',internalClosedAt:now,internalBusinessDate:operationalDate,internalReferenceTotal:reference,referenceTotal:reference,operationalClosedAt:now,closedAt:0,businessDate:INTERNAL_DATE_SENTINEL,paymentMethod:'Consumo interno',paymentConfirmedAt:null,total:reference,updatedAt:now,whatsappOptIn:false,whatsappPhone:'',customer:''};
    state.history.unshift(record);state.commands.splice(idx,1);
    try{if(typeof save==='function')save();}catch{}
    try{typeof closeSheet==='function'&&closeSheet('closeWrap');}catch{byId('closeWrap')?.classList?.remove('open');}
    try{activeCommandId=null;}catch{}
    try{typeof showScreen==='function'&&showScreen('commands');}catch{}
    toast(`Consumo interno finalizado: ${moneyValue(reference)} em valor de referência, sem faturamento.`);
    window.dispatchEvent(new CustomEvent('rota27:v02537-internal-updated',{detail:{commandId:c.id,referenceTotal:reference}}));
    setTimeout(()=>{try{typeof renderCommands==='function'&&renderCommands();typeof renderHistory==='function'&&renderHistory();}catch{}},0);
  }
  function patchCloseFlow(){
    if(!baseOpenCloseSheet&&typeof window.openCloseSheet==='function'){
      baseOpenCloseSheet=window.openCloseSheet;window.openCloseSheet=function(){const r=baseOpenCloseSheet.apply(this,arguments);syncCloseUi();return r;};try{openCloseSheet=window.openCloseSheet;}catch{}
    }
    if(!baseRenderPaymentConfirmation&&typeof window.renderPaymentConfirmation==='function'){
      baseRenderPaymentConfirmation=window.renderPaymentConfirmation;window.renderPaymentConfirmation=function(){const r=baseRenderPaymentConfirmation.apply(this,arguments);syncCloseUi();return r;};try{renderPaymentConfirmation=window.renderPaymentConfirmation;}catch{}
    }
    if(!baseFinalizeCommand&&typeof window.finalizeCommand==='function'){
      baseFinalizeCommand=window.finalizeCommand;window.finalizeCommand=function(){if(isInternal(activeCommand())){closeInternal();return;}return baseFinalizeCommand.apply(this,arguments);};try{finalizeCommand=window.finalizeCommand;}catch{}
    }
  }

  function internalRows(){return (Array.isArray(state?.history)?state.history:[]).filter(isInternal).sort((a,b)=>Number(b.internalClosedAt||0)-Number(a.internalClosedAt||0));}
  function currentHistoryRange(){
    if(byId('v02521YesterdayBtn')?.classList.contains('active')){const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-1);return {start:d.getTime(),end:d.getTime()+86400000,label:'Ontem'};}
    const active=document.querySelector('#v14HistoryToolbar [data-period].active')?.dataset?.period||'today';
    if(active==='all')return {start:0,end:Infinity,label:'Todos'};
    const today=startOfToday();if(active==='today')return {start:today,end:today+86400000,label:'Hoje'};
    const days=active==='7d'?7:30;return {start:shiftDays(today,-(days-1)),end:today+86400000,label:active==='7d'?'7 dias':'30 dias'};
  }
  function itemMeta(c,id){return c?.itemMeta?.[id]||state?.catalog?.find?.(p=>String(p?.id||'')===String(id))||{};}
  function internalItems(c){return Object.entries(c?.items||{}).filter(([,q])=>Number(q)>0).map(([id,q])=>{const m=itemMeta(c,id);return{name:String(m.name||'Produto'),qty:Number(q),price:Number(m.price||0)};});}
  function matchesHistorySearch(c,q){
    const s=String(q||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').trim();if(!s)return true;
    const hay=['consumo interno','interno',c.table,...internalItems(c).map(x=>x.name)].join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');return hay.includes(s);
  }
  function ensureInternalDetail(){
    if(byId('v02537InternalDetailWrap'))return;
    const wrap=document.createElement('div');wrap.id='v02537InternalDetailWrap';wrap.className='sheet-wrap';wrap.innerHTML='<div class="sheet"><div class="handle"></div><h3>Consumo interno</h3><p class="desc" id="v02537InternalDetailSub"></p><div id="v02537InternalDetailBody"></div><div class="sheet-actions"><button type="button" class="primary" id="v02537InternalDetailDone" style="grid-column:1/-1">Concluir</button></div></div>';document.body.appendChild(wrap);wrap.addEventListener('click',e=>{if(e.target===wrap)wrap.classList.remove('open');});byId('v02537InternalDetailDone').onclick=()=>wrap.classList.remove('open');
  }
  function openInternalDetail(id){
    const c=internalRows().find(x=>String(x.id)===String(id));if(!c)return;ensureInternalDetail();const when=new Date(Number(c.internalClosedAt||0)),items=internalItems(c);
    byId('v02537InternalDetailSub').textContent=`${dateLabel(c.internalBusinessDate)} • ${when.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})} • não faturado`;
    byId('v02537InternalDetailBody').innerHTML=`<div class="v02537-detail-summary"><small>Valor de referência</small><strong>${esc(moneyValue(refTotal(c)))}</strong></div><div class="v02537-detail-list">${items.map(x=>`<div class="v02537-detail-row"><span>${esc(`${x.qty}x ${x.name}`)}</span><span>${esc(moneyValue(x.qty*x.price))}</span></div>`).join('')||'<div class="v02537-history-note">Nenhum item registrado.</div>'}</div><div class="v02537-history-note">Registro operacional de consumo próprio. Não compõe faturamento, ticket médio, formas de pagamento ou contas a receber.</div>`;
    byId('v02537InternalDetailWrap').classList.add('open');
  }
  function renderInternalHistory(){
    const screen=byId('screenHistory'),listHead=screen?.querySelector('.v14-list-head');if(!screen||!listHead)return false;
    let section=byId('v02537InternalHistory');if(!section){section=document.createElement('section');section.id='v02537InternalHistory';listHead.insertAdjacentElement('beforebegin',section);}
    const range=currentHistoryRange(),q=byId('v14HistorySearch')?.value||'';
    const rows=internalRows().filter(c=>{const t=Number(c.internalClosedAt||0);return t>=range.start&&t<range.end&&matchesHistorySearch(c,q);});
    section.hidden=!rows.length;if(!rows.length)return true;
    const total=rows.reduce((s,c)=>s+refTotal(c),0);
    section.innerHTML=`<div class="v02537-history-head"><div><strong>Consumo interno</strong><small>${rows.length} ${rows.length===1?'registro':'registros'} • ${esc(moneyValue(total))} em valor de referência</small></div><span class="v02537-history-chip">Não faturado</span></div><div class="v02537-history-list">${rows.map(c=>{const d=new Date(Number(c.internalClosedAt||0)),u=units(c);return `<button type="button" class="v02537-history-row" data-v02537-id="${esc(c.id)}"><span><strong>Consumo interno</strong><small>${esc(`${u} ${u===1?'item':'itens'} • ${dateLabel(c.internalBusinessDate)} às ${d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}`)}</small></span><b>${esc(moneyValue(refTotal(c)))}</b></button>`;}).join('')}</div><div class="v02537-history-note">Esses valores são apenas referência de consumo e não entram nos resultados de vendas.</div>`;
    section.querySelectorAll('[data-v02537-id]').forEach(btn=>btn.addEventListener('click',()=>openInternalDetail(btn.dataset.v02537Id)));
    return true;
  }
  function patchHistory(){
    if(baseRenderHistory||typeof window.renderHistory!=='function')return;
    baseRenderHistory=window.renderHistory;window.renderHistory=function(){const r=baseRenderHistory.apply(this,arguments);renderInternalHistory();setTimeout(renderInternalHistory,160);return r;};try{renderHistory=window.renderHistory;}catch{}
  }

  function injectHelp(){
    const content=document.querySelector('#r27HelpOverlay .r27-help-content');if(!content||byId('r27-help-consumo-interno'))return false;
    const section=document.createElement('details');section.id='r27-help-consumo-interno';section.className='r27-help-section';section.innerHTML='<summary><span class="r27-help-section-icon">◫</span><span><strong>Consumo interno</strong><small>Registrar consumo próprio sem gerar faturamento.</small></span></summary><div class="r27-help-section-body"><div class="r27-help-lead">Ao abrir uma nova comanda, marque <b>Consumo interno / próprio</b>. Lance os produtos normalmente e finalize sem escolher forma de pagamento.</div><div class="r27-help-tip"><strong>O que acontece:</strong> os itens permanecem registrados para controle operacional e estoque, mas o fechamento não entra em faturamento, ticket médio, formas de pagamento, A receber ou relacionamento com clientes.</div><div class="r27-help-tip"><strong>Onde consultar:</strong> no Histórico existe um bloco separado <b>Consumo interno</b>, com valor de referência e detalhes dos itens.</div></div>';
    content.appendChild(section);return true;
  }

  function bindEvents(){
    document.addEventListener('click',e=>{
      if(e.target.closest?.('#r27HelpBtn,[data-help]'))setTimeout(injectHelp,100);
      if(e.target.closest?.('#v14HistoryToolbar [data-period],#v02521YesterdayBtn,#navHistory'))setTimeout(renderInternalHistory,180);
    });
    document.addEventListener('input',e=>{if(e.target?.id==='v14HistorySearch')setTimeout(renderInternalHistory,0);});
    window.addEventListener('rota27:v02537-internal-updated',()=>setTimeout(()=>{decorateCommands();decorateSale();renderInternalHistory();},0));
  }

  function start(){
    ensureToggle();patchNewCommand();patchRenderers();patchCloseFlow();patchHistory();injectHelp();bindEvents();decorateCommands();decorateSale();renderInternalHistory();
    setTimeout(()=>{ensureToggle();patchNewCommand();patchRenderers();patchCloseFlow();patchHistory();injectHelp();decorateCommands();decorateSale();renderInternalHistory();},350);
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){ensureToggle();patchNewCommand();patchRenderers();patchCloseFlow();patchHistory();decorateCommands();decorateSale();renderInternalHistory();}});
    window.Rota27V02537InternalConsumption={version:VERSION,isInternal,renderHistory:renderInternalHistory};
    console.info('[Rota27] v0.25.37 — consumo interno sem faturamento carregado.');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
