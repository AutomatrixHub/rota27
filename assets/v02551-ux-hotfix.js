/* Rota 27 v0.25.51 — UX e estabilidade sem concorrência de render */
(function(){
  'use strict';
  if(window.Rota27V02551UX)return;

  const VERSION='0.25.51';
  const QUICK_ID='v02551QuickProducts';
  const MAX_QUICK=3;
  const ATTENTION_ID='v02546Attention';
  let baseRenderProducts=null;

  const byId=id=>document.getElementById(id);
  const esc=v=>typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLocaleLowerCase('pt-BR');
  const moneyValue=v=>{try{return typeof money==='function'?money(Number(v||0)):Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}catch{return 'R$ 0,00';}};

  function stateRef(){try{return typeof state!=='undefined'&&state?state:null;}catch{return null;}}
  function activeProducts(){return (Array.isArray(stateRef()?.catalog)?stateRef().catalog:[]).filter(p=>p&&p.active!==false);}
  function productByIdLocal(id){return activeProducts().find(p=>String(p.id)===String(id))||null;}
  function resolveProduct(command,id){
    const direct=productByIdLocal(id);if(direct)return direct;
    const meta=command?.itemMeta?.[id]&&typeof command.itemMeta[id]==='object'?command.itemMeta[id]:null;
    const name=norm(meta?.name||'');if(!name)return null;
    return activeProducts().find(p=>norm(p?.name||'')===name)||null;
  }
  function dateKey(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
  function todayKey(){return dateKey(new Date());}
  function commandDate(c){
    const explicit=String(c?.businessDate||c?.operationalDate||'').trim();
    if(/^\d{4}-\d{2}-\d{2}$/.test(explicit))return explicit;
    const ts=Number(c?.createdAt||c?.openedAt||c?.closedAt||c?.updatedAt||0);
    return ts?dateKey(new Date(ts)):'';
  }
  function validRevenueCommand(c){return c&&c.cancelled!==true&&c.internalConsumption!==true&&c.nonRevenue!==true;}
  function addCommand(counts,c){
    Object.entries(c?.items||{}).forEach(([id,qty])=>{
      const q=Number(qty||0);if(!(q>0))return;
      const p=resolveProduct(c,id);if(!p)return;
      const key=String(p.id),old=counts.get(key)||{product:p,qty:0};old.qty+=q;counts.set(key,old);
    });
  }
  function todayRanking(limit=MAX_QUICK){
    const s=stateRef(),counts=new Map(),seen=new Set();
    [...(Array.isArray(s?.commands)?s.commands:[]),...(Array.isArray(s?.history)?s.history:[])].forEach((c,index)=>{
      if(!validRevenueCommand(c)||commandDate(c)!==todayKey())return;
      const key=String(c?.id||`${commandDate(c)}:${c?.createdAt||c?.openedAt||index}`);if(seen.has(key))return;
      seen.add(key);addCommand(counts,c);
    });
    return [...counts.values()].sort((a,b)=>b.qty-a.qty||String(a.product?.name||'').localeCompare(String(b.product?.name||''),'pt-BR')).slice(0,limit);
  }
  function recentRanking(limit=MAX_QUICK){
    const s=stateRef(),counts=new Map();
    [...(Array.isArray(s?.history)?s.history:[])].filter(validRevenueCommand)
      .sort((a,b)=>Number(b?.closedAt||b?.updatedAt||0)-Number(a?.closedAt||a?.updatedAt||0))
      .slice(0,30).forEach(c=>addCommand(counts,c));
    return [...counts.values()].sort((a,b)=>b.qty-a.qty||String(a.product?.name||'').localeCompare(String(b.product?.name||''),'pt-BR')).slice(0,limit);
  }
  function searchActive(){return !!String(byId('searchProduct')?.value||'').trim();}
  function removeLegacyQuick(){
    byId('v14QuickProducts')?.remove();
    byId('v02550QuickProducts')?.remove();
    document.querySelectorAll('.v02547-turn-favorites,.v02549-quick-products').forEach(node=>node.remove());
  }
  function ensureQuickBox(){
    const screen=byId('screenSale');if(!screen)return null;
    removeLegacyQuick();
    let box=byId(QUICK_ID);if(!box){box=document.createElement('section');box.id=QUICK_ID;}
    const chips=byId('categoryChips');
    const grid=byId('productGrid');
    if(chips){
      if(box.parentElement!==chips.parentElement||box.previousElementSibling!==chips)chips.insertAdjacentElement('afterend',box);
    }else if(grid){
      if(box.parentElement!==grid.parentElement||box.nextElementSibling!==grid)grid.insertAdjacentElement('beforebegin',box);
    }
    return box;
  }
  function addProductById(id){
    try{
      if(typeof window.addProduct==='function')window.addProduct(id);
      else if(typeof addProduct==='function')addProduct(id);
    }catch{}
    queueMicrotask(()=>renderQuick());
  }
  function renderQuick(){
    const box=ensureQuickBox();if(!box)return false;
    if(searchActive()){box.hidden=true;box.innerHTML='';return true;}
    let rows=todayRanking(),today=true;if(!rows.length){rows=recentRanking();today=false;}
    if(!rows.length){box.hidden=true;box.innerHTML='';return true;}
    box.hidden=false;
    box.innerHTML=`<div class="v02551-quick-head"><strong>${today?'Mais usados hoje':'Mais usados recentemente'}</strong><small>Top ${rows.length}</small></div><div class="v02551-quick-grid"></div>`;
    const grid=box.querySelector('.v02551-quick-grid');
    rows.forEach(item=>{
      const p=item.product,button=document.createElement('button');
      button.type='button';button.className='v02551-quick-item';button.setAttribute('aria-label',`Lançar ${String(p?.name||'produto')}`);
      button.innerHTML=`<span class="v02551-quick-name">${esc(p?.name||'Produto')}</span><span class="v02551-quick-foot"><strong class="v02551-quick-price">${esc(moneyValue(p?.price))}</strong><small class="v02551-quick-count">${Number(item.qty||0)}x</small></span>`;
      button.addEventListener('click',()=>addProductById(p.id));grid.appendChild(button);
    });
    return true;
  }
  function installProductBridge(){
    const current=window.renderProducts;
    if(typeof current!=='function'||current.__v02551Quick===true)return;
    baseRenderProducts=current;
    const wrapped=function(){
      const result=baseRenderProducts.apply(this,arguments);
      queueMicrotask(()=>renderQuick());
      return result;
    };
    wrapped.__v02551Quick=true;wrapped.__v02551Base=baseRenderProducts;
    try{window.renderProducts=wrapped;}catch{}
    try{renderProducts=wrapped;}catch{}
  }

  function normalizeCartbar(){
    const bar=byId('cartbar');if(!bar)return false;
    let summary=bar.querySelector('.cart-summary');
    const itemsText=byId('cartbarItems')?.textContent||'0 itens';
    const totalText=byId('cartbarTotal')?.textContent||'R$ 0,00';
    if(summary&&(summary.querySelector('.v15items-view')||summary.dataset.v15ItemsMarkup==='1')){
      const fresh=document.createElement('div');
      fresh.className='cart-summary';
      fresh.innerHTML=`<small id="cartbarItems">${esc(itemsText)}</small><strong id="cartbarTotal">${esc(totalText)}</strong>`;
      fresh.dataset.v15ItemsMarkup='1';
      fresh.dataset.v15ItemsReady='1';
      summary.replaceWith(fresh);
      summary=fresh;
    }
    if(summary){
      summary.dataset.v15ItemsMarkup='1';
      summary.dataset.v15ItemsReady='1';
      summary.removeAttribute('role');summary.removeAttribute('tabindex');summary.removeAttribute('aria-label');summary.removeAttribute('aria-controls');summary.removeAttribute('aria-expanded');summary.removeAttribute('title');
    }
    byId('v15ItemsSummaryWrap')?.remove();
    const itemsBtn=bar.querySelector('.items-btn');
    if(itemsBtn){itemsBtn.textContent='Ver/Editar itens';itemsBtn.setAttribute('aria-label','Ver ou editar itens da comanda');}
    try{window.openItemsSummary=function(){if(typeof openCartSheet==='function')openCartSheet();};}catch{}
    return true;
  }

  function attentionIcon(kind){
    const paths={
      receive:'<path d="M3 7h18v11H3z"/><path d="M7 11h4"/><path d="M16 10v5m-2.5-2.5h5"/>',
      stock:'<path d="M4 7l8-4 8 4-8 4z"/><path d="M4 7v10l8 4 8-4V7"/><path d="M12 11v10"/>',
      purchase:'<path d="M4 5h2l2 10h9l2-7H7"/><circle cx="10" cy="19" r="1"/><circle cx="17" cy="19" r="1"/>',
      client:'<circle cx="9" cy="8" r="3"/><path d="M3 20c0-4 2.5-6 6-6s6 2 6 6"/><path d="M16 11h5m-2.5-2.5v5"/>'
    };
    return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[kind]||paths.client}</svg>`;
  }
  function receivableSignal(){try{const rows=window.Rota27V02512?.getOpenReceivables?.()||[];if(!rows.length)return null;const balance=rows.reduce((sum,row)=>sum+Math.max(0,Number(row?.balance||0)),0);return{key:'receive',title:`${rows.length} pendência${rows.length===1?'':'s'} a receber`,detail:`${moneyValue(balance)} ainda não recebido`,action:'receivables'};}catch{return null;}}
  function stockSignal(){try{const api=window.Rota27V021;if(!api?.getConfigs||!api?.statusFor)return null;const cfg=api.getConfigs()||{},ids=Object.keys(cfg).filter(id=>cfg[id]?.enabled===true),attention=ids.filter(id=>{const s=api.statusFor(id);return s==='low'||s==='zero';});if(!attention.length)return null;const zero=attention.filter(id=>api.statusFor(id)==='zero').length;return{key:'stock',title:`${attention.length} produto${attention.length===1?'':'s'} precisa${attention.length===1?'':'m'} de atenção`,detail:zero?`${zero} sem estoque disponível ou zerado`:'Estoque no mínimo ou abaixo dele',action:'stock'};}catch{return null;}}
  function purchaseSignal(){try{const orders=window.Rota27V022?.getOrders?.()||[],pending=orders.filter(o=>o?.status==='draft'||o?.status==='sent');if(!pending.length)return null;const sent=pending.filter(o=>o.status==='sent').length;return{key:'purchase',title:`${pending.length} pedido${pending.length===1?'':'s'} em andamento`,detail:sent?`${sent} aguardando recebimento`:'Há pedido em rascunho para revisar',action:'purchases'};}catch{return null;}}
  function relationshipSignal(){try{const data=window.Rota27V025?.dataset?.(),missing=Array.isArray(data?.missing)?data.missing:[];if(!missing.length)return null;return{key:'client',title:`${missing.length} cliente${missing.length===1?'':'s'} sem voltar há 30+ dias`,detail:'Abra a Fidelização apenas se quiser agir',action:'relationship'};}catch{return null;}}
  function attentionSignals(){return[receivableSignal(),stockSignal(),purchaseSignal(),relationshipSignal()].filter(Boolean);}
  function buildAttention(){
    const section=document.createElement('section');section.id=ATTENTION_ID;section.hidden=true;
    section.innerHTML='<div class="v02546-attention-head"><div><span class="v02546-attention-kicker">Operação</span><strong>Hoje precisa de atenção</strong><small>Só aparece quando existe algo que merece ação.</small></div><span class="v02546-attention-count" id="v02546AttentionCount">0</span></div><div class="v02546-attention-list" id="v02546AttentionList"></div>';
    return section;
  }
  function renderAttention(){
    const panel=byId('screenPanel');if(!panel)return false;
    let section=byId(ATTENTION_ID);if(!section)section=buildAttention();
    const head=panel.querySelector('.v15d4-head');
    if(head){if(section.parentElement!==panel||section.previousElementSibling!==head)head.insertAdjacentElement('afterend',section);}
    else if(section.parentElement!==panel)panel.insertAdjacentElement('afterbegin',section);
    const rows=attentionSignals(),list=byId('v02546AttentionList'),count=byId('v02546AttentionCount');
    section.hidden=rows.length===0;if(count)count.textContent=String(rows.length);
    const signature=JSON.stringify(rows.map(r=>[r.key,r.title,r.detail,r.action]));
    if(list&&list.dataset.signature!==signature){
      list.dataset.signature=signature;
      list.innerHTML=rows.map(r=>`<button type="button" class="v02546-attention-item" data-v02546-action="${esc(r.action)}"><span class="v02546-attention-icon">${attentionIcon(r.key)}</span><span class="v02546-attention-copy"><strong>${esc(r.title)}</strong><small>${esc(r.detail)}</small></span><span class="v02546-attention-arrow">›</span></button>`).join('');
    }
    return true;
  }
  function openAttentionAction(action){
    if(action==='receivables'){try{window.Rota27V02512?.open?.();}catch{}return;}
    if(action==='stock'){try{window.Rota27V021?.openStock?.();}catch{}return;}
    if(action==='purchases'){try{window.Rota27V022?.open?.();}catch{}return;}
    if(action==='relationship'){try{window.Rota27V025?.openRelationship?.();}catch{}}
  }

  function handleClick(e){
    const attention=e.target.closest?.('[data-v02546-action]');if(attention){openAttentionAction(attention.dataset.v02546Action);return;}
    if(e.target.closest?.('#navPanel'))requestAnimationFrame(()=>{try{window.Rota27V0252Panel?.refresh?.();}catch{}renderAttention();});
    if(e.target.closest?.('#navMenu,#screenSale .chip,#screenSale [data-category]'))requestAnimationFrame(renderQuick);
  }
  function handleInput(e){if(e.target?.id==='searchProduct')requestAnimationFrame(renderQuick);}
  function refresh(){installProductBridge();removeLegacyQuick();normalizeCartbar();renderQuick();renderAttention();}
  function start(){
    installProductBridge();normalizeCartbar();removeLegacyQuick();renderQuick();renderAttention();
    document.addEventListener('click',handleClick);document.addEventListener('input',handleInput);
    ['rota27:v02512-receivables-updated','rota27:v021-stock-updated','rota27:v022-purchases-updated','rota27:v017-domain-updated'].forEach(name=>window.addEventListener(name,()=>{renderAttention();renderQuick();}));
    window.addEventListener('storage',()=>{renderAttention();renderQuick();});
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')requestAnimationFrame(refresh);});
    const api={version:VERSION,renderQuick,todayRanking,recentRanking,renderAttention,attentionSignals,normalizeCartbar,refresh};
    window.Rota27V02551UX=api;
    window.Rota27V02550UI=api;
    console.info('[Rota27] v0.25.51 — UX estabilizada sem render concorrente.');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
