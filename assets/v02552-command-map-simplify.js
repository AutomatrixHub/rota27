/* Rota 27 v0.25.52 — compatibilidade do Mapa sem Mapa rápido */
(function(){
  'use strict';
  if(window.Rota27V02552MapSimplify)return;

  const VERSION='0.25.52';
  const HELP_SECTION='r27-help-mapa-comandas-v0252';

  function byId(id){return document.getElementById(id);}

  function simplifyHelp(){
    const section=byId(HELP_SECTION);
    if(!section)return false;
    const summary=section.querySelector('summary');
    const strong=summary?.querySelector('strong');
    const small=summary?.querySelector('small');
    const body=section.querySelector('.r27-help-section-body');
    if(strong)strong.textContent='Mapa de comandas';
    if(small)small.textContent='Outra forma de visualizar as mesmas comandas abertas.';
    if(body){
      body.innerHTML='<p>Na tela <strong>Comandas</strong>, você pode alternar entre <strong>Lista</strong> e <strong>Mapa</strong>. As duas visualizações usam exatamente as mesmas comandas abertas.</p><p>O <strong>Mapa</strong> organiza as comandas por local, como mesa, balcão, parklet ou cliente. Toque em um bloco para abrir a comanda normalmente.</p><div class="r27-help-tip"><strong>Importante:</strong> o antigo bloco <strong>Mapa rápido</strong> e seus atalhos de abertura foram desativados. A visualização Mapa continua disponível.</div>';
    }
    return true;
  }

  function refresh(){
    simplifyHelp();
    const meta=document.querySelector('meta[name="rota27-release-version"]');
    if(meta)meta.content=VERSION;
  }

  function start(){
    refresh();
    document.addEventListener('click',event=>{
      if(event.target.closest?.('#r27HelpBtn,[data-help]'))setTimeout(simplifyHelp,80);
    });
    document.addEventListener('visibilitychange',()=>{
      if(document.visibilityState==='visible')refresh();
    });
    window.Rota27V02552MapSimplify={version:VERSION,refresh,simplifyHelp};
    console.info('[Rota27] v0.25.52 — Lista e Mapa preservados; Mapa rápido desabilitado.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
