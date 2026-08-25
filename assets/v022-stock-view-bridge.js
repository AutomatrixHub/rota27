/* Rota 27 v0.22.0 — reaplica a camada gerencial após busca/filtros nativos do estoque */
(function(){
  'use strict';
  function pulse(){setTimeout(()=>{try{window.dispatchEvent(new CustomEvent('rota27:v021-stock-updated'));}catch{}},0);}
  document.addEventListener('click',e=>{if(e.target.closest?.('#v021StockWrap [data-filter]'))pulse();},true);
  document.addEventListener('input',e=>{if(e.target?.matches?.('#v021StockSearch'))pulse();},true);
})();
