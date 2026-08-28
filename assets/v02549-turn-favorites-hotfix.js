/* Rota 27 v0.25.49 — hotfix compacto de Mais usados hoje */
(function(){
  'use strict';

  const VERSION='0.25.49';
  const STYLE_ID='v02549TurnFavoritesStyle';
  const BOX_ID='v14QuickProducts';
  const MAX_ITEMS=6;
  let baseRenderProducts=null;

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

  const byId=id=>document.getElementById(id);
  const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLocaleLowerCase('pt-BR');
  const esc=v=>typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const moneyValue=v=>{try{return typeof money==='function'?money(Number(v||0)):Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}catch{return 'R$ 0,00';}};

  function installStyle(){
    let style=byId(STYLE_ID);
    if(style)return style;
    style=document.createElement('style');style.id=STYLE_ID;
    style.textContent=`
#screenMenu #${BOX_ID}.v02549-quick-products{display:block;margin:8px 0 12px;padding:10px;border:1px solid #dfc9a9;border-radius:16px;background:linear-gradient(160deg,#f7ead8,#f2e2cb);overflow:hidden}
#screenMenu #${BOX_ID}.v02549-quick-products .v02549-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:0 0 8px}
#screenMenu #${BOX_ID}.v02549-quick-products .v02549-head strong{font-size:13px;line-height:1.15;font-weight:950;color:var(--ink)}
#screenMenu #${BOX_ID}.v02549-quick-products .v02549-head small{font-size:9px;line-height:1.2;color:var(--muted);text-align:right;white-space:nowrap}
#screenMenu #${BOX_ID}.v02549-quick-products .v02549-row{display:flex;gap:7px;overflow-x:auto;overscroll-behavior-x:contain;-webkit-overflow-scrolling:touch;padding:0 0 2px;scrollbar-width:none}
#screenMenu #${BOX_ID}.v02549-quick-products .v02549-row::-webkit-scrollbar{display:none}
#screenMenu #${BOX_ID}.v02549-quick-products .v02549-product{box-sizing:border-box;flex:0 0 112px;width:112px;min-width:112px;max-width:112px;min-height:72px;margin:0;padding:7px 8px;border:1px solid var(--line);border-radius:13px;background:var(--surface);color:var(--ink);display:grid;grid-template-columns:24px minmax(0,1fr);grid-template-rows:auto auto;column-gap:6px;row-gap:4px;text-align:left;align-items:center;position:relative;box-shadow:none;overflow:hidden}
#screenMenu #${BOX_ID}.v02549-quick-products .v02549-product:active{transform:scale(.985)}
#screenMenu #${BOX_ID}.v02549-quick-products .v02549-icon{grid-column:1;grid-row:1;width:24px;height:24px;min-width:24px;max-width:24px;display:grid;place-items:center;border-radius:8px;background:#efe0ca;color:#8e512d;overflow:hidden}
#screenMenu #${BOX_ID}.v02549-quick-products .v02549-icon svg{display:block!important;width:16px!important;height:16px!important;min-width:16px!important;max-width:16px!important;min-height:16px!important;max-height:16px!important;fill:none!important;stroke:currentColor!important;stroke-width:1.9!important;stroke-linecap:round;stroke-linejoin:round}
#screenMenu #${BOX_ID}.v02549-quick-products .v02549-name{grid-column:2;grid-row:1;min-width:0;font-size:10px;line-height:1.15;font-weight:900;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
#screenMenu #${BOX_ID}.v02549-quick-products .v02549-price{grid-column:1 / 3;grid-row:2;font-size:10px;line-height:1.1;color:var(--brand-2);font-weight:950;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#screenMenu #${BOX_ID}.v02549-quick-products .v02549-count{position:absolute;right:6px;bottom:6px;min-width:18px;height:18px;padding:0 4px;box-sizing:border-box;border-radius:999px;display:grid;place-items:center;background:#f6ead8;border:1px solid #dfc9aa;color:#7e624c;font-size:8px;line-height:1;font-weight:900}
@media(max-width:380px){#screenMenu #${BOX_ID}.v02549-quick-products{padding:9px}#screenMenu #${BOX_ID}.v02549-quick-products .v02549-product{flex-basis:104px;width:104px;min-width:104px;max-width:104px}#screenMenu #${BOX_ID}.v02549-quick-products .v02549-head small{display:none}}
`;
    document.head.appendChild(style);return style;
  }

  function dateKey(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
  function todayKey(){return dateKey(new Date());}
  function commandDate(c){
    const explicit=String(c?.businessDate||c?.operationalDate||'').trim();
    if(/^\d{4}-\d{2}-\d{2}$/.test(explicit))return explicit;
    const ts=Number(c?.createdAt||c?.openedAt||c?.closedAt||c?.updatedAt||0);
    return ts?dateKey(new Date(ts)):'';
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
  function validCommand(c){return c&&c.cancelled!==true&&c.internalConsumption!==true&&c.nonRevenue!==true;}
  function addCommandToCounts(counts,command){
    Object.entries(command?.items||{}).forEach(([id,qty])=>{
      const q=Number(qty||0);if(!(q>0))return;
      const p=resolveProduct(command,id);if(!p)return;
      const key=String(p.id);const old=counts.get(key)||{product:p,qty:0};old.qty+=q;counts.set(key,old);
    });
  }
  function todayRanking(limit=MAX_ITEMS){
    const s=stateRef(),counts=new Map(),seen=new Set();
    [...(Array.isArray(s?.commands)?s.commands:[]),...(Array.isArray(s?.history)?s.history:[])].forEach((c,index)=>{
      if(!validCommand(c)||commandDate(c)!==todayKey())return;
      const key=String(c?.id||`${commandDate(c)}:${c?.createdAt||c?.openedAt||index}`);if(seen.has(key))return;seen.add(key);addCommandToCounts(counts,c);
    });
    return [...counts.values()].sort((a,b)=>b.qty-a.qty||String(a.product?.name||'').localeCompare(String(b.product?.name||''),'pt-BR')).slice(0,limit);
  }
  function recentRanking(limit=MAX_ITEMS){
    const s=stateRef(),counts=new Map();
    [...(Array.isArray(s?.history)?s.history:[])].filter(validCommand).sort((a,b)=>Number(b?.closedAt||b?.updatedAt||0)-Number(a?.closedAt||a?.updatedAt||0)).slice(0,30).forEach(c=>addCommandToCounts(counts,c));
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
  function ensureBox(){
    let box=byId(BOX_ID);
    if(!box){const grid=byId('productGrid')||document.querySelector('#screenMenu .menu-list,#screenMenu .product-grid');if(!grid)return null;box=document.createElement('div');box.id=BOX_ID;grid.insertAdjacentElement('beforebegin',box);}
    box.classList.remove('v14-quick-products','v02547-turn-favorites');box.classList.add('v02549-quick-products');return box;
  }
  function launchProduct(id){
    let fn=null;try{if(typeof window.addProduct==='function')fn=window.addProduct;else if(typeof addProduct==='function')fn=addProduct;}catch{}
    if(typeof fn!=='function')return;
    fn(id);setTimeout(render,0);
  }
  function render(){
    installStyle();const box=ensureBox();if(!box)return false;
    if(searchActive()){box.style.display='none';box.innerHTML='';return true;}
    let rows=todayRanking(),today=true;if(!rows.length){rows=recentRanking();today=false;}
    if(!rows.length){box.style.display='none';box.innerHTML='';return true;}
    box.style.display='block';
    box.innerHTML=`<div class="v02549-head"><strong>${today?'Mais usados hoje':'Mais usados recentemente'}</strong><small>${today?'Atalhos automáticos do dia':'Hoje ainda sem histórico'}</small></div><div class="v02549-row"></div>`;
    const row=box.querySelector('.v02549-row');
    rows.forEach(item=>{
      const p=item.product,button=document.createElement('button');button.type='button';button.className='v02549-product';button.setAttribute('aria-label',`Lançar ${String(p?.name||'produto')}`);
      button.innerHTML=`<span class="v02549-icon">${svg(p)}</span><span class="v02549-name">${esc(p?.name||'Produto')}</span><span class="v02549-price">${esc(moneyValue(p?.price))}</span><span class="v02549-count">${Number(item.qty||0)}</span>`;
      button.addEventListener('click',()=>launchProduct(p.id));row.appendChild(button);
    });
    return true;
  }
  function patch(){
    const current=window.renderProducts;
    if(typeof current!=='function'||current.__v02549TurnFavorites)return;
    baseRenderProducts=current;
    const wrapped=function(){const result=baseRenderProducts.apply(this,arguments);render();return result;};wrapped.__v02549TurnFavorites=true;wrapped.__v02549Base=baseRenderProducts;
    try{window.renderProducts=wrapped;}catch{}try{renderProducts=wrapped;}catch{}
  }
  function settle(){[0,60,160].forEach(ms=>setTimeout(()=>{patch();render();},ms));}
  function handleClick(e){if(e.target.closest?.('#navMenu,#screenMenu .chip,#screenMenu [data-category]'))settle();}
  function handleInput(e){if(e.target?.id==='searchMenu'||e.target?.id==='searchProduct')setTimeout(render,0);}
  function start(){
    window.ROTA27_V02549_TURN_FAVORITES_ACTIVE=true;installStyle();patch();settle();document.addEventListener('click',handleClick);document.addEventListener('input',handleInput);window.addEventListener('rota27:v017-domain-updated',settle);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')settle();});
    window.Rota27V02549TurnFavorites={version:VERSION,render,todayRanking,recentRanking};console.info('[Rota27] v0.25.49 — Mais usados hoje compacto carregado.');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
