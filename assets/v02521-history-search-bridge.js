/* Rota 27 v0.25.21 — mantém a busca do Histórico consistente ao sair de Ontem */
(function(){
  'use strict';
  function syncSearchToBaseHistory(){
    const input=document.getElementById('v14HistorySearch');
    if(!input)return;
    input.dispatchEvent(new Event('input',{bubbles:true}));
  }
  document.addEventListener('click',e=>{
    if(!e.target.closest?.('#v14HistoryToolbar [data-period]'))return;
    setTimeout(syncSearchToBaseHistory,0);
  });
})();
