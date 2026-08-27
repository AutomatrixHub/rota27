/* Rota 27 v0.25.27 — ícones vetoriais profissionais no Cardápio */
(function(){
  'use strict';

  const VERSION='0.25.27';

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

  function normalize(value){
    return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  }

  function pickIconKey(category,name){
    const text=normalize(`${category} ${name}`);
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

  function svg(iconKey){
    const paths=ICONS[iconKey]||ICONS.product;
    return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${paths}</svg>`;
  }

  function decorateMenuIcons(){
    const rows=document.querySelectorAll('#screenMenu .menu-item');
    rows.forEach(row=>{
      const box=row.querySelector('.menu-emoji');
      if(!box)return;
      const category=row.querySelector('.menu-meta > span:first-child')?.textContent||'';
      const name=row.querySelector('.menu-info h4')?.textContent||'';
      const key=pickIconKey(category,name);
      if(box.dataset.r27Icon===key&&box.classList.contains('v02527-product-icon'))return;
      box.innerHTML=svg(key);
      box.dataset.r27Icon=key;
      box.classList.add('v02527-product-icon');
      box.setAttribute('aria-hidden','true');
    });
  }

  function scheduleDecorate(){
    [0,80,220].forEach(ms=>setTimeout(decorateMenuIcons,ms));
  }

  function installRenderHook(){
    const current=window.renderMenu;
    if(typeof current!=='function'||current.__v02527ProductIcons)return;
    const wrapped=function(){
      const result=current.apply(this,arguments);
      decorateMenuIcons();
      return result;
    };
    wrapped.__v02527ProductIcons=true;
    wrapped.__v02527Original=current;
    window.renderMenu=wrapped;
  }

  function bindFiniteRefreshes(){
    const search=document.getElementById('searchMenu');
    if(search&&!search.dataset.v02527IconsBound){
      search.dataset.v02527IconsBound='1';
      search.addEventListener('input',()=>setTimeout(decorateMenuIcons,0));
      search.addEventListener('search',()=>setTimeout(decorateMenuIcons,0));
    }
    document.addEventListener('click',event=>{
      if(event.target.closest?.('#navMenu,#screenMenu button,#screenCategories button'))scheduleDecorate();
    });
    document.addEventListener('visibilitychange',()=>{
      if(document.visibilityState==='visible')scheduleDecorate();
    });
  }

  function start(){
    installRenderHook();
    bindFiniteRefreshes();
    scheduleDecorate();
    window.Rota27V02527ProductIcons={version:VERSION,decorate:decorateMenuIcons,pickIconKey};
    console.info('[Rota27] v0.25.27 — ícones profissionais do Cardápio carregados.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
