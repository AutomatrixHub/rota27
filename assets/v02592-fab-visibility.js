/* Rota 27 v0.25.92 — FAB Nova comanda somente em Comandas + padrão global de fechar X */
(function(){
  'use strict';
  if(window.Rota27V02592FabVisibility)return;
  const VERSION='0.25.92-r2';
  const CLOSE_GLYPHS=new Set(['×','✕','✖','✗']);
  let raf=0;

  const byId=id=>document.getElementById(id);

  function syncFab(){
    raf=0;
    const fab=byId('fabNew');
    if(!fab)return;
    const commands=byId('screenCommands')?.classList.contains('active')===true;
    if(commands){
      fab.style.display='block';
      fab.style.pointerEvents='auto';
      fab.disabled=false;
    }else{
      fab.style.display='none';
      fab.style.pointerEvents='none';
    }
  }

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
    raf=requestAnimationFrame(()=>{syncFab();normalizeCloseButtons(document);});
  }

  function wrapShowScreen(){
    const current=window.showScreen;
    if(typeof current!=='function')return false;
    if(current.__v02592FabVisibility===true)return true;
    const wrapped=function(){
      const result=current.apply(this,arguments);
      if(typeof queueMicrotask==='function')queueMicrotask(()=>{syncFab();normalizeCloseButtons(document);});
      else Promise.resolve().then(()=>{syncFab();normalizeCloseButtons(document);});
      requestAnimationFrame(()=>{syncFab();normalizeCloseButtons(document);});
      return result;
    };
    wrapped.__v02592FabVisibility=true;
    wrapped.__v02592Base=current;
    try{window.showScreen=wrapped;showScreen=wrapped;}catch{window.showScreen=wrapped;}
    return true;
  }

  function onClick(event){
    /* Muitos sheets são criados sob demanda no próprio clique. O pós-clique
       padroniza os novos X sem MutationObserver e sem polling. */
    if(typeof queueMicrotask==='function')queueMicrotask(()=>normalizeCloseButtons(document));
    else Promise.resolve().then(()=>normalizeCloseButtons(document));
    requestAnimationFrame(()=>normalizeCloseButtons(document));

    if(event.target.closest?.('.navbtn,[data-go],[data-screen],#v02591MenuClose')){
      if(typeof queueMicrotask==='function')queueMicrotask(syncFab);else Promise.resolve().then(syncFab);
      requestAnimationFrame(syncFab);
    }
  }

  function settle(){wrapShowScreen();syncFab();normalizeCloseButtons(document);}
  function start(){
    settle();
    document.addEventListener('click',onClick,true);
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')schedule();});
    window.addEventListener('pageshow',schedule);
    window.addEventListener('rota27:test-mode-changed',schedule);
    [120,500,1200].forEach(ms=>setTimeout(settle,ms));
    window.Rota27V02592FabVisibility={version:VERSION,refresh:settle,normalizeCloseButtons};
    console.info('[Rota27] v0.25.92-r2 — FAB restrito a Comandas e botões X padronizados.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
