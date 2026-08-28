/* Rota 27 v0.25.50 — hotfix de estabilidade visual e operacional */
(function(){
  'use strict';
  if(window.Rota27V02550UI)return;

  const VERSION='0.25.50';
  const QUICK_ID='v02550QuickProducts';
  const QUICK_STYLE_ID='v02550QuickProductsStyle';
  const ATTENTION_ID='v02546Attention';
  const MAX_QUICK=6;
  let attentionBridgeInstalled=false;
  let attentionTimer=null;
  let quickTimer=null;

  const byId=id=>document.getElementById(id);
  const esc=v=>typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLocaleLowerCase('pt-BR');
  const moneyValue=v=>{try{return typeof money==='function'?money(Number(v||0)):Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}catch{return 'R$ 0,00';}};

  const ICONS={
    beer:'<path d="M6 3h9v14a3 3 0 0 1-3 3H6V3Z"/><path d="M15 7h2a3 3 0 0 1 3 3v3a3 3 0 0 1-3 3h-2"/><path d="M8 7h5M9 10v5M12 10v5"/>',
    wine:'<path d="M6 3h12l-1 6a5 5 0 0 1-10 0L6 3Z"/><path d="M12 14v7M8.5 21h7"/><path d="M7 8h10"/>',
    drink:'<path d="M9 3h6M10 3v4l-2 2v10a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V9l-2-2V3"/><path d="M8 12h8"/>',
    coffee:'<path d="M5 8h11v6a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5V8Z"/><path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16M8 4c0 1 1 1 1 2M12 4c0 1 1 1 1 2"/>',
    cheese:'<path d="M4 9 15 4l5 5-2 11H4V9Z"/><path d="M4 9h16M9 13h.01M14 16h.01M8 18h.01"/>',
    charcuterie:'<path d="M6.5 16.5c-2.8-2.8-2.8-7.2 0-10s7.2-2.8 10 0 2.8 7.2 0 10-7.2 2.8-10 0Z"/><path d="M5 5 3.5 3.5M20.5 20.5 19 19M9 8h.01M14.5 10.5h.01M10.5 14h.01"/>',
    sauce:'<path d="M9 3h6v3l1.5 2v11a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2V8L9 6V3Z"/><path d="M9 6h6M8 12h8M10 15h4"/>',
    nuts:'<path d="M8.5 6.5c3-3 7-2.5 8.5.5s.5 7-2.5 9.5-7 2.5-8.5-.5-.5-7 2.5-9.5Z"/><path d="M7 17c-1.5 2-3 2.5-4 2M11 7c1.5 1.5 2.5 3 3 5"/>',
    cookie:'<circle cx="12" cy="12" r="8"/><path d="M9 8h.01M14.5 9.5h.01M8.5 14h.01M13 15.5h.01M16 13h.01"/>',
    sweet:'<path d="m7 8-4-2 2 4-2 4 4-2M17 8l4-2-2 4 2 4-4-2"/><rect x="7" y="7" width="10" height="10" rx="3"/>',
    bread:'<path d="M5 10c0-3 2.5-5 7-5s7 2 7 5v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7Z"/><path d="M9 8v3M12 7v3M15 8v3"/>',
    snack:'<path d="M4 10h16l-2 8a3 3 0 0 1-3 2H9a3 3 0 0 1-3-2l-2-8Z"/><path d="M7 10c0-2 1-3 3-3M11 10c0-3 2-5 5-5"/>',
    product:'<path d="m4 7 8-4 8 4-8 4-8-4Z"/><path d="M4 7v10l8 4 8-4V7M12 11v10"/>'
  };

  function installQuickStyle(){
    if(byId(QUICK_STYLE_ID))return;
    const style=document.createElement('style');style.id=QUICK_STYLE_ID;
    style.textContent=`
#${QUICK_ID}{display:block;margin:8px 0 12px;padding:10px;border:1px solid #dfc9a9;border-radius:16px;background:linear-gradient(160deg,#f7ead8,#f2e2cb);overflow:hidden}
#${QUICK_ID}[hidden]{display:none!important}
#${QUICK_ID} .v02550-quick-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:0 0 8px}
#${QUICK_ID} .v02550-quick-head strong{font-size:13px;line-height:1.15;font-weight:950;color:var(--ink,#1b1816)}
#${QUICK_ID} .v02550-quick-head small{font-size:9px;line-height:1.15;color:var(--muted,#6f6257);white-space:nowrap}
#${QUICK_ID} .v02550-quick-row{display:flex;gap:7px;overflow-x:auto;overscroll-behavior-x:contain;-webkit-overflow-scrolling:touch;padding:0 0 2px;scrollbar-width:none}
#${QUICK_ID} .v02550-quick-row::-webkit-scrollbar{display:none}
#${QUICK_ID} .v02550-quick-item{box-sizing:border-box;flex:0 0 108px;width:108px;min-width:108px;max-width:108px;min-height:76px;margin:0;padding:8px;border:1px solid var(--line,#dccbb8);border-radius:13px;background:var(--surface,#fbf6ee);color:var(--ink,#1b1816);display:grid;grid-template-columns:26px minmax(0,1fr);grid-template-rows:auto auto;column-gap:6px;row-gap:5px;text-align:left;align-items:center;position:relative;box-shadow:0 3px 9px rgba(42,36,26,.035);overflow:hidden}
#${QUICK_ID} .v02550-quick-item:active{transform:scale(.985)}
#${QUICK_ID} .v02550-quick-icon{grid-column:1;grid-row:1;width:26px;height:26px;display:grid;place-items:center;border-radius:8px;background:#efe0ca;color:#8e512d;overflow:hidden}
#${QUICK_ID} .v02550-quick-icon svg{display:block!important;width:16px!important;height:16px!important;min-width:16px!important;min-height:16px!important;max-width:16px!important;max-height:16px!important;fill:none!important;stroke:currentColor!important;stroke-width:1.9!important;stroke-linecap:round!important;stroke-linejoin:round!important}
#${QUICK_ID} .v02550-quick-name{grid-column:2;grid-row:1;min-width:0;font-size:10px;line-height:1.15;font-weight:900;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
#${QUICK_ID} .v02550-quick-price{grid-column:1 / 3;grid-row:2;min-width:0;font-size:10px;line-height:1.1;color:var(--brand-2,#c86d3c);font-weight:950;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding-right:28px}
#${QUICK_ID} .v02550-quick-count{position:absolute;right:6px;bottom:6px;min-width:22px;height:18px;padding:0 5px;box-sizing:border-box;border-radius:999px;display:grid;place-items:center;background:#f6ead8;border:1px solid #dfc9aa;color:#7e624c;font-size:8px;line-height:1;font-weight:900}
html body #screenCommands[data-v0252-view="list"] #commandList .command-card.v017-command-card .v017-command-primary .v017-command-location{color:var(--brand-2,#c86d3c)!important}
@media(max-width:380px){#${QUICK_ID}{padding:9px}#${QUICK_ID} .v02550-quick-item{flex-basis:102px;width:102px;min-width:102px;max-width:102px}#${QUICK_ID} .v02550-quick-head small{display:none}}
`;
    document.head.appendChild(style);
  }

  function stateRef(){try{return typeof state!=='undefined'&&state?state:null;}catch{return null;}}
  function activeProducts(){return (Array.isArray(stateRef()?.catalog)?stateRef().catalog:[]).filter(p=>p&&p.active!==false);}
  function productById(id){return activeProducts().find(p=>String(p.id)===String(id))||null;}
  function resolveProduct(command,id){
    const direct=productById(id);if(direct)return direct;
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
      const key=String(c?.id||`${commandDate(c)}:${c?.createdAt||c?.openedAt||index}`);if(seen.has(key))return;seen.add(key);addCommand(counts,c);
    });
    return [...counts.values()].sort((a,b)=>b.qty-a.qty||String(a.product?.name||'').localeCompare(String(b.product?.name||''),'pt-BR')).slice(0,limit);
  }
  function recentRanking(limit=MAX_QUICK){
    const s=stateRef(),counts=new Map();
    [...(Array.isArray(s?.history)?s.history:[])].filter(validRevenueCommand).sort((a,b)=>Number(b?.closedAt||b?.updatedAt||0)-Number(a?.closedAt||a?.updatedAt||0)).slice(0,30).forEach(c=>addCommand(counts,c));
    return [...counts.values()].sort((a,b)=>b.qty-a.qty||String(a.product?.name||'').localeCompare(String(b.product?.name||''),'pt-BR')).slice(0,limit);
  }
  function iconKey(p){
    const text=norm(`${p?.cat||p?.category||''} ${p?.name||''}`);
    if(/cervej|chopp|chope|ipa|lager|pilsen|stout/.test(text))return'beer';
    if(/vinho|espumante|prosecco/.test(text))return'wine';
    if(/cafe|cappuccino|espresso/.test(text))return'coffee';
    if(/agua|refrigerante|refri|suco|bebida|guarana|energetico|kombucha|mate/.test(text))return'drink';
    if(/queijo|requeij|parmesao|mussarela|muçarela|provolone/.test(text))return'cheese';
    if(/linguic|salame|presunto|frios|embutid|torresmo|carne|lombo|copa/.test(text))return'charcuterie';
    if(/molho|pimenta|tempero|azeite|vinagre|conserva|antepasto/.test(text))return'sauce';
    if(/castanha|amendoim|noz|nozes|amendoa|pistache|macadamia/.test(text))return'nuts';
    if(/biscoit|cookie|cracker/.test(text))return'cookie';
    if(/doce|chocolate|brigadeiro|goiabada|cocada|bala|trufa|bombom/.test(text))return'sweet';
    if(/pao|torrada|broa|padaria/.test(text))return'bread';
    if(/petisco|snack|salgad|chips|porcao|porção/.test(text))return'snack';
    return'product';
  }
  function svg(p){return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[iconKey(p)]||ICONS.product}</svg>`;}
  function searchActive(){const el=byId('searchMenu')||byId('searchProduct');return !!String(el?.value||'').trim();}
  function removeLegacyQuick(){
    byId('v14QuickProducts')?.remove();
    document.querySelectorAll('.v02547-turn-favorites').forEach(node=>{if(node.id!==QUICK_ID)node.remove();});
  }
  function ensureQuickBox(){
    const screen=byId('screenMenu');if(!screen)return null;
    removeLegacyQuick();
    let box=byId(QUICK_ID);if(!box){box=document.createElement('section');box.id=QUICK_ID;}
    const chips=screen.querySelector('.chips');
    const grid=byId('productGrid')||screen.querySelector('.product-grid');
    if(chips){if(box.parentElement!==chips.parentElement||box.previousElementSibling!==chips)chips.insertAdjacentElement('afterend',box);}
    else if(grid){if(box.parentElement!==grid.parentElement||box.nextElementSibling!==grid)grid.insertAdjacentElement('beforebegin',box);}
    else if(box.parentElement!==screen)screen.appendChild(box);
    return box;
  }
  function addProductById(id){
    let fn=null;try{if(typeof window.addProduct==='function')fn=window.addProduct;else if(typeof addProduct==='function')fn=addProduct;}catch{}
    if(typeof fn==='function'){fn(id);scheduleQuick(0);}
  }
  function renderQuick(){
    installQuickStyle();const box=ensureQuickBox();if(!box)return false;
    if(searchActive()){box.hidden=true;box.innerHTML='';return true;}
    let rows=todayRanking(),today=true;if(!rows.length){rows=recentRanking();today=false;}
    if(!rows.length){box.hidden=true;box.innerHTML='';return true;}
    box.hidden=false;
    box.innerHTML=`<div class="v02550-quick-head"><strong>${today?'Mais usados hoje':'Mais usados recentemente'}</strong><small>${today?'Atalhos automáticos':'Hoje ainda sem movimento'}</small></div><div class="v02550-quick-row"></div>`;
    const row=box.querySelector('.v02550-quick-row');
    rows.forEach(item=>{
      const p=item.product,button=document.createElement('button');button.type='button';button.className='v02550-quick-item';button.setAttribute('aria-label',`Lançar ${String(p?.name||'produto')}`);
      button.innerHTML=`<span class="v02550-quick-icon">${svg(p)}</span><span class="v02550-quick-name">${esc(p?.name||'Produto')}</span><span class="v02550-quick-price">${esc(moneyValue(p?.price))}</span><span class="v02550-quick-count">${Number(item.qty||0)}x</span>`;
      button.addEventListener('click',()=>addProductById(p.id));row.appendChild(button);
    });
    return true;
  }
  function scheduleQuick(delay=40){clearTimeout(quickTimer);quickTimer=setTimeout(renderQuick,Math.max(0,delay));}

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
  function buildAttention(){const section=document.createElement('section');section.id=ATTENTION_ID;section.hidden=true;section.innerHTML='<div class="v02546-attention-head"><div><span class="v02546-attention-kicker">Operação</span><strong>Hoje precisa de atenção</strong><small>Só aparece quando existe algo que merece ação.</small></div><span class="v02546-attention-count" id="v02546AttentionCount">0</span></div><div class="v02546-attention-list" id="v02546AttentionList"></div>';return section;}
  function ensureAttentionPlacement(){
    const panel=byId('screenPanel');if(!panel)return null;
    let section=byId(ATTENTION_ID);if(!section)section=buildAttention();
    const head=panel.querySelector('.v15d4-head');
    if(head){if(section.parentElement!==panel||section.previousElementSibling!==head)head.insertAdjacentElement('afterend',section);}
    else if(section.parentElement!==panel)panel.insertAdjacentElement('afterbegin',section);
    return section;
  }
  function renderAttention(){
    const section=ensureAttentionPlacement();if(!section)return false;
    const rows=attentionSignals(),list=byId('v02546AttentionList'),count=byId('v02546AttentionCount');
    section.hidden=rows.length===0;if(count)count.textContent=String(rows.length);
    const signature=JSON.stringify(rows.map(r=>[r.key,r.title,r.detail,r.action]));
    if(list&&list.dataset.signature!==signature){list.dataset.signature=signature;list.innerHTML=rows.map(r=>`<button type="button" class="v02546-attention-item" data-v02546-action="${esc(r.action)}"><span class="v02546-attention-icon">${attentionIcon(r.key)}</span><span class="v02546-attention-copy"><strong>${esc(r.title)}</strong><small>${esc(r.detail)}</small></span><span class="v02546-attention-arrow">›</span></button>`).join('');}
    return true;
  }
  function scheduleAttention(delay=40){clearTimeout(attentionTimer);attentionTimer=setTimeout(()=>{renderAttention();setTimeout(renderAttention,80);},Math.max(0,delay));}
  function installAttentionBridge(){
    const panel=byId('screenPanel');if(!panel||attentionBridgeInstalled||panel.dataset.v02550AttentionBridge==='1')return false;
    const own=Object.getOwnPropertyDescriptor(panel,'innerHTML');
    const proto=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');
    const desc=own?.get&&own?.set?own:proto;
    if(!desc?.get||!desc?.set)return false;
    try{
      Object.defineProperty(panel,'innerHTML',{
        configurable:true,enumerable:desc.enumerable,
        get:function(){return desc.get.call(this);},
        set:function(value){desc.set.call(this,value);try{renderAttention();}catch{}setTimeout(renderAttention,60);}
      });
      panel.dataset.v02550AttentionBridge='1';attentionBridgeInstalled=true;return true;
    }catch(err){console.warn('[Rota27 v0.25.50] Falha ao estabilizar Painel:',err);return false;}
  }
  function openAttentionAction(action){if(action==='receivables'){try{window.Rota27V02512?.open?.();}catch{}return;}if(action==='stock'){try{window.Rota27V021?.openStock?.();}catch{}return;}if(action==='purchases'){try{window.Rota27V022?.open?.();}catch{}return;}if(action==='relationship'){try{window.Rota27V025?.openRelationship?.();}catch{}}}

  function handleClick(e){
    const attention=e.target.closest?.('[data-v02546-action]');if(attention){openAttentionAction(attention.dataset.v02546Action);return;}
    if(e.target.closest?.('#navPanel')){installAttentionBridge();scheduleAttention(0);}
    if(e.target.closest?.('#navMenu,#screenMenu .chip,#screenMenu [data-category]'))scheduleQuick(0);
  }
  function handleInput(e){if(e.target?.id==='searchMenu'||e.target?.id==='searchProduct')scheduleQuick(0);}
  function start(){
    installQuickStyle();removeLegacyQuick();installAttentionBridge();renderAttention();scheduleQuick(0);
    document.addEventListener('click',handleClick);document.addEventListener('input',handleInput);
    ['rota27:v02512-receivables-updated','rota27:v021-stock-updated','rota27:v022-purchases-updated','rota27:v017-domain-updated'].forEach(name=>window.addEventListener(name,()=>{scheduleAttention();scheduleQuick();}));
    window.addEventListener('storage',()=>{scheduleAttention();scheduleQuick();});
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){installAttentionBridge();scheduleAttention(0);scheduleQuick(0);}});
    window.Rota27V02550UI={version:VERSION,renderQuick,todayRanking,recentRanking,renderAttention,attentionSignals,refresh(){installAttentionBridge();renderAttention();renderQuick();}};
    console.info('[Rota27] v0.25.50 — UI estabilizada: atalhos, Painel e local da comanda.');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
