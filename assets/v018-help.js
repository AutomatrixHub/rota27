/* Rota 27 v0.18.0 — Ajuda do Resumo do Turno */
(function(){
  'use strict';
  const OVERLAY_ID='r27HelpOverlay';

  function add(){
    const overlay=document.getElementById(OVERLAY_ID);
    if(!overlay||overlay.dataset.r27V018Help==='1')return false;
    const history=overlay.querySelector('#r27-help-historico, #r27-help-history');
    if(!history)return false;
    overlay.dataset.r27V018Help='1';

    const details=document.createElement('details');
    details.className='r27-help-section';
    details.id='r27-help-resumo-turno';
    details.dataset.search='resumo turno faturamento comandas abertas fechadas ticket medio itens vendidos produtos pagamento alertas sincronizacao whatsapp';
    details.innerHTML=`
      <summary>
        <span class="r27-help-section-icon" aria-hidden="true">▤</span>
        <span><strong>Resumo do turno</strong><small>Faturamento, comandas, produtos, pagamentos e alertas do dia.</small></span>
        <span class="r27-help-chevron" aria-hidden="true">⌄</span>
      </summary>
      <div class="r27-help-section-body">
        <p>Na tela <strong>Histórico</strong>, a v0.18 mostra primeiro uma visão rápida do turno atual.</p>
        <ul>
          <li>faturamento e comandas fechadas hoje;</li>
          <li>quantidade e valor das comandas ainda abertas;</li>
          <li>ticket médio e itens vendidos;</li>
          <li>produtos mais vendidos do dia;</li>
          <li>formas de pagamento registradas.</li>
        </ul>
        <h4>Alertas somente quando precisam de ação</h4>
        <p>O resumo não ocupa espaço com estados saudáveis. Ele chama atenção somente para situações como aparelho offline, erro de sincronização ou fila de WhatsApp com falha.</p>
        <div class="r27-help-warn"><strong>Cancelamentos:</strong> a primeira entrega da v0.18 não exibe um contador de cancelamentos porque a versão anterior não mantém um histórico consolidado desse evento. O sistema não inventa esse número.</div>
      </div>`;
    history.insertAdjacentElement('beforebegin',details);

    const chips=overlay.querySelector('.r27-help-chips');
    if(chips&&!chips.querySelector('[data-help-target="resumo-turno"]')){
      const btn=document.createElement('button');btn.type='button';btn.className='r27-help-chip';btn.dataset.helpTarget='resumo-turno';btn.textContent='Resumo';
      btn.addEventListener('click',()=>{details.hidden=false;details.open=true;details.scrollIntoView({behavior:'smooth',block:'start'});});
      chips.appendChild(btn);
    }
    const footer=overlay.querySelector('.r27-help-footer span');
    if(footer)footer.textContent='Ajuda v4 • produção v0.18.0';
    return true;
  }

  function start(){
    if(add())return;
    const observer=new MutationObserver(()=>{if(add())observer.disconnect();});
    observer.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(add,300);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
