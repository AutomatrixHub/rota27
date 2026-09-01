/* Rota 27 v0.25.94 — Ajuda sem foco automático ao abrir */
(function(){
  'use strict';
  if(window.Rota27V02594HelpNoAutofocus)return;

  const HELP_TRIGGER='#r27HelpButton,#r27HelpBtn,[data-help]';

  function clearAutomaticFocus(){
    const overlay=document.getElementById('r27HelpOverlay');
    if(!overlay||!overlay.classList.contains('open'))return;
    const input=document.getElementById('r27HelpSearch');
    input?.removeAttribute('autofocus');
    const active=document.activeElement;
    if(active&&active!==document.body&&active!==document.documentElement&&typeof active.blur==='function')active.blur();
  }

  function clearOnOpen(){
    [0,45,90].forEach(ms=>setTimeout(clearAutomaticFocus,ms));
  }

  document.addEventListener('click',event=>{
    if(event.target.closest?.(HELP_TRIGGER))clearOnOpen();
  },true);

  window.Rota27V02594HelpNoAutofocus={version:'0.25.94',refresh:clearAutomaticFocus};
  console.info('[Rota27] v0.25.94 — Ajuda abre sem foco automático.');
})();
