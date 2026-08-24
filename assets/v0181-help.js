/* Rota 27 v0.18.1 — Ajuda da auditoria operacional */
(function(){
  'use strict';
  const OVERLAY_ID='r27HelpOverlay';

  function add(){
    const overlay=document.getElementById(OVERLAY_ID);
    if(!overlay||overlay.dataset.r27V0181Help==='1')return false;
    const anchor=overlay.querySelector('#r27-help-resumo-turno')||overlay.querySelector('#r27-help-historico, #r27-help-history');
    if(!anchor)return false;
    overlay.dataset.r27V0181Help='1';

    const details=document.createElement('details');
    details.className='r27-help-section';
    details.id='r27-help-auditoria';
    details.dataset.search='auditoria turno cancelada cancelamento abertura fechamento alteracao item lancamento aparelho sincronizacao rastreabilidade';
    details.innerHTML=`
      <summary>
        <span class="r27-help-section-icon" aria-hidden="true">✓</span>
        <span><strong>Auditoria operacional</strong><small>Veja o que aconteceu no turno e em qual aparelho.</small></span>
        <span class="r27-help-chevron" aria-hidden="true">⌄</span>
      </summary>
      <div class="r27-help-section-body">
        <p>A v0.18.1 registra uma trilha operacional do turno sem acrescentar etapas ao atendimento.</p>
        <ul>
          <li>abertura e fechamento de comandas;</li>
          <li>cancelamentos;</li>
          <li>adições e remoções de itens;</li>
          <li>alterações de cliente/local da comanda;</li>
          <li>horário e aparelho que originou o evento quando a sincronização está configurada.</li>
        </ul>
        <h4>Onde consultar</h4>
        <p>Abra <strong>Histórico</strong> e toque em <strong>Ver auditoria</strong> no Resumo do turno. O indicador <strong>Canceladas</strong> também passa a usar essa trilha.</p>
        <h4>Offline e sincronização</h4>
        <p>O aparelho registra os eventos locais mesmo sem internet. Quando a sincronização está ativa e a conexão volta, a auditoria é reconciliada com o histórico de eventos compartilhados para reduzir divergências entre aparelhos.</p>
        <div class="r27-help-tip"><strong>Importante:</strong> auditoria não reabre, desfaz nem altera uma comanda. Ela é uma camada de conferência.</div>
      </div>`;
    anchor.insertAdjacentElement('afterend',details);

    const chips=overlay.querySelector('.r27-help-chips');
    if(chips&&!chips.querySelector('[data-help-target="auditoria"]')){
      const btn=document.createElement('button');btn.type='button';btn.className='r27-help-chip';btn.dataset.helpTarget='auditoria';btn.textContent='Auditoria';
      btn.addEventListener('click',()=>{details.hidden=false;details.open=true;details.scrollIntoView({behavior:'smooth',block:'start'});});
      chips.appendChild(btn);
    }
    const footer=overlay.querySelector('.r27-help-footer span');
    if(footer)footer.textContent='Ajuda v4.1 • candidata v0.18.1';
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
