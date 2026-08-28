/* Rota 27 v0.25.47 — produtos mais usados hoje */
(function(){
  'use strict';
  const VERSION='0.25.47';
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
  const esc=v=>typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const moneyValue=v=>{try{return typeof money==='function'?money(Number(v||0)):Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}catch{return 'R$ 0,00';}};
  const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLocaleLowerCase('pt-BR');
  function dateKey(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
  function todayKey(){return dateKey(new Date());}
  function commandDate(c){
    const explicit=String(c?.businessDate||c?.operationalDate||'').trim();
    if(/^\d{4}-\d{2}-\d{2}$/.test(explicit))return explicit;
    const ts=Number(c?.createdAt||c?.openedAt||c?.closedAt||c?.updatedAt||0);
    return ts?dateKey(new Date(ts)):'';
  }
  function activeProducts(){return (Array.isArray(state?.catalog)?state.catalog:[]).filter(p=>p&&p.active!==false);}
  function currentProduct(id){return activeProducts().find(p=>String(p.id)===String(id))||null;}
  function addRows(map,rows){
    (Array.isArray(rows)?rows:[]).forEach(c=>{
      if(c?.cancelled===true||commandDate(c)!==todayKey())return;
      Object.entries(c?.items||{}).forEach(([id,qty])=>{
        const p=currentProduct(id),q=Number(qty||0);if(!p||!(q>0))return;
        map.set(String(p.id),(map.get(String(p.id))||0)+q);
      });
    });
  }
  function todayRanking(limit=6){
    const counts=new Map();addRows(counts,state?.commands);addRows(counts,state?.history);
    return [...counts.entries()].sort((a,b)=>b[1]-a[1]).map(([id,qty])=>({product:currentProduct(id),qty})).filter(x=>x.product).slice(0,limit);
  }
  function recentFallback(limit=6){
    const counts=new Map();
    [...(Array.isArray(state?.history)?state.history:[])].filter(c=>c?.cancelled!==true).sort((a,b)=>Number(b?.closedAt||0)-Number(a?.closedAt||0)).slice(0,30).forEach(c=>{
      Object.entries(c?.items||{}).forEach(([id,qty])=>{const p=currentProduct(id),q=Number(qty||0);if(p&&q>0)counts.set(String(p.id),(counts.get(String(p.id))||0)+q);});
    });
    return [...counts.entries()].sort((a,b)=>b[1]-a[1]).map(([id,qty])=>({product:currentProduct(id),qty})).filter(x=>x.product).slice(0,limit);
  }
  function iconKey(p){
    const text=norm(`${p?.cat||p?.category||''} ${p?.name||''}`);
    if(/cervej|chopp|chope|ipa|lager|pilsen|stout/.test(text))return 'beer';
    if(/vinho|espumante|prosecco/.test(text))return 'wine';
    if(/cafe|cappuccino|espresso/.test(text))return 'coffee';
    if(/agua|refrigerante|refri|suco|bebida|guarana|energetico|kombucha|mate/.test(text))return 'drink';
    if(/queijo|requeij|parmesao|mussarela|muçarela|provolone/.test(text))return 'cheese';
    if(/linguic|salame|presunto|frios|embutid|torresmo|carne|lombo|copa/.test(text))return 'charcuterie';
    if(/molho|pimenta|tempero|azeite|vinagre|conserva|antepasto/.test(text))return 'sauce';
    if(/castanha|amendoim|noz|nozes|amendoa|pistache|macadamia/.test(text))return 'nuts';
    if(/biscoit|cookie|cracker/.test(text))return 'cookie';
    if(/doce|chocolate|brigadeiro|goiabada|cocada|bala|trufa|bombom/.test(text))return 'sweet';
    if(/pao|torrada|broa|padaria/.test(text))return 'bread';
    if(/petisco|snack|salgad|chips|porcao|porção/.test(text))return 'snack';
    return 'product';
  }
  function svg(p){return `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[iconKey(p)]||ICONS.product}</svg>`;}
  function defaultView(){
    const search=byId('searchMenu')||byId('searchProduct');if(search&&String(search.value||'').trim())return false;
    const active=document.querySelector('#screenMenu .chip.active,#screenMenu [data-category].active');
    if(!active)return true;
    return norm(active.textContent||'').includes('todos');
  }
  function ensureBox(){
    let box=byId('v14QuickProducts');if(box)return box;
    const grid=byId('productGrid')||document.querySelector('#screenMenu .menu-list,#screenMenu .product-grid');if(!grid)return null;
    box=document.createElement('div');box.id='v14QuickProducts';grid.insertAdjacentElement('beforebegin',box);return box;
  }
  function render(){
    const box=ensureBox();if(!box)return false;
    if(!defaultView()){box.style.display='none';return true;}
    let rows=todayRanking(),today=true;if(!rows.length){rows=recentFallback();today=false;}
    if(!rows.length){box.style.display='none';box.innerHTML='';return true;}
    box.style.display='block';box.classList.add('v02547-turn-favorites');
    box.innerHTML=`<div class="v02547-title"><strong>${today?'Mais usados hoje':'Mais lançados recentemente'}</strong><small>${today?'Atalhos automáticos deste dia':'Atalhos automáticos pelo histórico recente'}</small></div><div class="v02547-row">${rows.map((row,i)=>{const p=row.product,id=String(p.id).replace(/'/g,"\\'");return `<button type="button" class="v02547-product" data-v02547-product="${esc(p.id)}" onclick="addProduct('${id}')"><span class="v02547-icon">${svg(p)}</span><span class="v02547-rank">${esc(row.qty)}</span><b>${esc(p.name)}</b><small>${esc(moneyValue(p.price))}</small></button>`;}).join('')}</div>`;
    return true;
  }
  function patch(){
    const current=window.renderProducts;if(typeof current!=='function'||current.__v02547TurnFavorites)return;
    baseRenderProducts=current;const wrapped=function(){const result=baseRenderProducts.apply(this,arguments);render();return result;};wrapped.__v02547TurnFavorites=true;try{window.renderProducts=wrapped;}catch{}try{renderProducts=wrapped;}catch{}
  }
  function settle(){[0,70,180].forEach(ms=>setTimeout(render,ms));}
  function start(){
    patch();settle();document.addEventListener('click',e=>{if(e.target.closest?.('#navMenu,#screenMenu .chip,#screenMenu [data-category]'))settle();});
    document.addEventListener('input',e=>{if(e.target?.id==='searchMenu'||e.target?.id==='searchProduct')setTimeout(render,0);});
    window.addEventListener('rota27:v017-domain-updated',settle);window.addEventListener('storage',settle);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')settle();});
    window.Rota27V02547TurnFavorites={version:VERSION,render,todayRanking};console.info('[Rota27] v0.25.47 — atalhos automáticos do dia carregados.');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
