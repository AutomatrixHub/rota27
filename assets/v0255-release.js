/* Rota 27 v0.25.5 — identidade de release e Ajuda */
(function(){
  'use strict';
  const VERSION='0.25.5';

  function byId(id){return document.getElementById(id);}
  function ensureHelpSection(){
    const overlay=byId('r27HelpOverlay');
    const content=overlay?.querySelector('.r27-help-content');
    if(!content)return false;
    if(!byId('r27-help-whatsapp-fixo-v0255')){
      const section=document.createElement('details');
      section.id='r27-help-whatsapp-fixo-v0255';
      section.className='r27-help-section';
      section.innerHTML='<summary><span class="r27-help-section-icon">↗</span><span><strong>Cópia fixa dos lançamentos</strong><small>Além do gerente, um segundo número recebe os mesmos lançamentos da comanda.</small></span><span class="r27-help-chevron">⌄</span></summary><div class="r27-help-section-body"><p>Na v0.25.5, os lançamentos feitos nas comandas também são enviados para o número fixo <strong>+55 27 99776-9279</strong>, usando o mesmo template operacional do WhatsApp.</p><p>O número não aparece como campo editável. Ele é definido pela própria release. Se o WhatsApp do gerente estiver configurado com esse mesmo número, o Rota 27 evita o envio duplicado.</p><div class="r27-help-tip"><strong>Importante:</strong> o aparelho onde o lançamento é feito continua precisando estar com a integração de WhatsApp configurada e com internet para transmitir a cópia.</div></div>';
      content.appendChild(section);
    }
    const footer=overlay.querySelector('.r27-help-footer span');
    if(footer)footer.textContent='Ajuda v5.6 • Rota 27 v0.25.5';
    return true;
  }

  function refreshIdentity(){
    ensureHelpSection();
  }

  function handleClick(e){
    if(e.target.closest?.('#r27HelpBtn,[data-help]'))setTimeout(refreshIdentity,240);
  }

  function start(){
    refreshIdentity();
    document.addEventListener('click',handleClick);
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refreshIdentity();});
    window.Rota27V0255={version:VERSION,refreshIdentity};
    console.info('[Rota27] v0.25.5 release carregada.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
