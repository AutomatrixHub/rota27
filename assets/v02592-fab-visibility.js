/* Rota 27 v0.25.101 — padrão global de fechar X; FAB corrigido na origem */
(function(){
  'use strict';
  if(window.Rota27V02592FabVisibility)return;
  const VERSION='0.25.101';
  const CLOSE_GLYPHS=new Set(['×','✕','✖','✗']);
  let raf=0;

  function isCloseX(btn){
    if(!(btn instanceof HTMLButtonElement))return false;
    const text=String(btn.textContent||'').trim();
    const aria=String(btn.getAttribute('aria-label')||'').toLocaleLowerCase('pt-BR');
    const title=String(btn.getAttribute('title')||'').toLocaleLowerCase('pt-BR');
    const id=String(btn.id||'').toLocaleLowerCase('pt-BR');
    const classes=String(btn.className||'').toLocaleLowerCase('pt-BR');

    /* Símbolos X usados como botão são fechamentos no Rota 27. */
    if(CLOSE_GLYPHS.has(text))return true;

    /* X literal só entra quando a semântica confirma fechamento. */
    if((text==='X'||text==='x')&&(
      aria.includes('fechar')||aria.includes('close')||
      title.includes('fechar')||title.includes('close')||
      id.includes('close')||classes.includes('close')
    ))return true;

    /* Também cobre botões de ícone/SVG com aria-label explícito de fechar. */
    if((aria.startsWith('fechar')||aria.startsWith('close'))&&text.length<=1)return true;
    return false;
  }

  function normalizeCloseButtons(root=document){
    const scope=root&&typeof root.querySelectorAll==='function'?root:document;
    scope.querySelectorAll('button').forEach(btn=>{
      if(isCloseX(btn))btn.classList.add('r27-close-x-standard');
    });
  }

  function schedule(){
    if(raf)return;
    raf=requestAnimationFrame(()=>{raf=0;normalizeCloseButtons(document);});
  }

  function onClick(event){
    /* Muitos sheets são criados sob demanda no próprio clique. O pós-clique
       padroniza os novos X sem MutationObserver e sem polling. */
    if(typeof queueMicrotask==='function')queueMicrotask(()=>normalizeCloseButtons(document));
    else Promise.resolve().then(()=>normalizeCloseButtons(document));
    requestAnimationFrame(()=>normalizeCloseButtons(document));

  }

  function settle(){normalizeCloseButtons(document);}
  function start(){
    settle();
    document.addEventListener('click',onClick,true);
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')schedule();});
    window.addEventListener('pageshow',schedule);
    window.addEventListener('rota27:test-mode-changed',schedule);
    [120,500,1200].forEach(ms=>setTimeout(settle,ms));
    window.Rota27V02592FabVisibility={version:VERSION,refresh:settle,normalizeCloseButtons};
    console.info('[Rota27] v0.25.101 — botões X padronizados; FAB corrigido na navegação de origem.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
