/* Rota 27 v0.25.93 — padronização global dos botões de fechar X */
(function(){
  'use strict';
  if(window.Rota27V02593CloseStandard)return;

  const VERSION='0.25.93';
  const GLYPHS=new Set(['×','✕','✖','✗']);

  function isCloseButton(btn){
    if(!(btn instanceof HTMLButtonElement))return false;
    const text=String(btn.textContent||'').trim();
    const aria=String(btn.getAttribute('aria-label')||'').toLocaleLowerCase('pt-BR');
    const title=String(btn.getAttribute('title')||'').toLocaleLowerCase('pt-BR');
    const id=String(btn.id||'').toLocaleLowerCase('pt-BR');
    const classes=String(btn.className||'').toLocaleLowerCase('pt-BR');

    if(GLYPHS.has(text))return true;
    if((text==='X'||text==='x')&&(aria.includes('fechar')||title.includes('fechar')||id.includes('close')||classes.includes('close')))return true;
    if((aria.startsWith('fechar')||aria.startsWith('close'))&&!text.replace(/[×✕✖✗Xx]/g,''))return true;
    return false;
  }

  function normalize(root=document){
    const scope=root&&typeof root.querySelectorAll==='function'?root:document;
    scope.querySelectorAll('button').forEach(btn=>{
      if(isCloseButton(btn))btn.classList.add('r27-close-x-standard');
    });
  }

  function schedule(){
    if(typeof queueMicrotask==='function')queueMicrotask(()=>normalize(document));
    else Promise.resolve().then(()=>normalize(document));
    requestAnimationFrame(()=>normalize(document));
  }

  function start(){
    normalize(document);
    /* Sheets e overlays são criados sob demanda após cliques. O scan pós-clique
       cobre esses componentes sem MutationObserver e sem polling. */
    document.addEventListener('click',schedule,true);
    window.addEventListener('pageshow',schedule);
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')schedule();});
    window.addEventListener('rota27:test-mode-changed',schedule);
    [150,600,1400].forEach(ms=>setTimeout(()=>normalize(document),ms));
    window.Rota27V02593CloseStandard={version:VERSION,refresh:()=>normalize(document)};
    console.info('[Rota27] v0.25.93 — padrão único dos botões X ativo.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
