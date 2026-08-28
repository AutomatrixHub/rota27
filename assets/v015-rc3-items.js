/* Rota 27 v0.15 RC.3.1 / v0.25.51 — compatibilidade sem consulta rápida redundante */
(function(){
  'use strict';

  function byId(id){return document.getElementById(id);}
  function esc(value){
    if(typeof escapeHtml==='function')return escapeHtml(String(value??''));
    return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }

  function normalizeCartSummary(){
    const bar=byId('cartbar');if(!bar)return false;
    let summary=bar.querySelector('.cart-summary');
    const itemsText=byId('cartbarItems')?.textContent||'0 itens';
    const totalText=byId('cartbarTotal')?.textContent||'R$ 0,00';

    if(summary&&(summary.querySelector('.v15items-view')||summary.dataset.v15ItemsMarkup==='1')){
      const fresh=document.createElement('div');
      fresh.className='cart-summary';
      fresh.innerHTML=`<small id="cartbarItems">${esc(itemsText)}</small><strong id="cartbarTotal">${esc(totalText)}</strong>`;
      summary.replaceWith(fresh);
      summary=fresh;
    }

    if(summary){
      /*
       * Estes marcadores também neutralizam uma cópia antiga da RC.3 que ainda
       * possa estar viva na mesma sessão antes da troca do Service Worker.
       */
      summary.dataset.v15ItemsMarkup='1';
      summary.dataset.v15ItemsReady='1';
      summary.classList.remove('v15items-summary-trigger','is-open','v15items-pop');
      summary.removeAttribute('role');
      summary.removeAttribute('tabindex');
      summary.removeAttribute('aria-label');
      summary.removeAttribute('aria-controls');
      summary.removeAttribute('aria-expanded');
      summary.removeAttribute('title');
    }

    byId('v15ItemsSummaryWrap')?.remove();
    const itemsBtn=bar.querySelector('.items-btn');
    if(itemsBtn){
      itemsBtn.textContent='Ver/Editar itens';
      itemsBtn.setAttribute('aria-label','Ver ou editar itens da comanda');
    }
    return true;
  }

  function openEditor(){
    try{if(typeof openCartSheet==='function')openCartSheet();}catch{}
  }

  function start(){
    normalizeCartSummary();
    window.openItemsSummary=openEditor;
    window.Rota27V015Rc3Items={retired:true,normalizeCartSummary,openEditor};
    console.info('[Rota27] v0.25.51 — consulta rápida redundante aposentada; sem polling legado.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
