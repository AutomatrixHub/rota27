/* Rota 27 v0.22.0 — reaplica a camada gerencial após busca/filtros nativos do estoque */
(function(){
  'use strict';

  function injectMobileCompactStyle(){
    if(document.getElementById('v022StockMobileCompactStyle'))return;
    const style=document.createElement('style');
    style.id='v022StockMobileCompactStyle';
    style.textContent=`
@media(max-width:760px){
  /* Lista operacional: menos altura por produto e nenhuma rolagem horizontal. */
  #v021StockWrap #v021StockList{gap:7px}
  #v021StockWrap #v021StockList .v021-row{box-sizing:border-box;padding:10px;gap:5px 6px;border-radius:15px}
  #v021StockWrap #v021StockList .v021-product{margin-bottom:1px}
  #v021StockWrap #v021StockList .v021-product strong{font-size:15px;line-height:1.18}
  #v021StockWrap #v021StockList .v021-product>small{font-size:11px;line-height:1.2;margin-top:2px}

  /* A camada v0.22 já informa a saúde; esconde o chip legado redundante (ok + saudável). */
  #v021StockWrap #v021StockList .v021-stock-chip{display:none!important}
  #v021StockWrap #v021StockList .v022s-row-flag{margin-left:5px;padding:2px 6px;font-size:8px;vertical-align:middle}

  /* Produto controlado: cinco números em uma grade compacta 3 + 2. */
  #v021StockWrap #v021StockList .v021-row:not(.off){grid-template-columns:repeat(3,minmax(0,1fr))}
  #v021StockWrap #v021StockList .v021-row:not(.off) .v021-product{grid-column:1/-1}
  #v021StockWrap #v021StockList .v021-row:not(.off) .v021-num,
  #v021StockWrap #v021StockList .v021-row:not(.off) .v022s-row-num{
    display:block!important;
    min-width:0;
    min-height:42px;
    box-sizing:border-box;
    padding:5px 7px;
    border-radius:9px;
    background:#f5ecdf;
  }
  #v021StockWrap #v021StockList .v021-row:not(.off) .v021-num small,
  #v021StockWrap #v021StockList .v021-row:not(.off) .v022s-row-num small{
    display:block;
    font-size:9px;
    line-height:1.05;
    white-space:normal;
    overflow-wrap:anywhere;
  }
  #v021StockWrap #v021StockList .v021-row:not(.off) .v021-num b,
  #v021StockWrap #v021StockList .v021-row:not(.off) .v022s-row-num b{
    display:block;
    margin-top:2px;
    font-size:14px;
    line-height:1.05;
  }

  /* Mínimo e Em pedido já aparecem nos blocos; mantém na linha auxiliar apenas o fornecedor. */
  #v021StockWrap #v021StockList .v022s-row-meta{grid-column:1/-1;margin-top:1px;gap:0;font-size:10px;line-height:1.15}
  #v021StockWrap #v021StockList .v022s-row-meta span:nth-child(1),
  #v021StockWrap #v021StockList .v022s-row-meta span:nth-child(2){display:none!important}
  #v021StockWrap #v021StockList .v022s-row-meta span:nth-child(3){display:flex;gap:4px;align-items:center}

  /* Ações continuam fáceis de tocar, porém ocupam menos altura. */
  #v021StockWrap #v021StockList .v021-actions{grid-column:1/-1;width:100%;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:5px;margin-top:2px}
  #v021StockWrap #v021StockList .v021-actions button{min-height:40px;padding:7px 8px;border-radius:10px;font-size:13px;line-height:1.1}

  /* Sem controle: não renderiza visualmente três cartões vazios com travessão. */
  #v021StockWrap #v021StockList .v021-row.off{grid-template-columns:1fr!important;padding:9px 10px;gap:5px;opacity:.82}
  #v021StockWrap #v021StockList .v021-row.off .v021-product{grid-column:1}
  #v021StockWrap #v021StockList .v021-row.off .v021-num,
  #v021StockWrap #v021StockList .v021-row.off .v022s-row-num{display:none!important}
  #v021StockWrap #v021StockList .v021-row.off .v021-actions{grid-column:1;display:block;margin-top:3px}
  #v021StockWrap #v021StockList .v021-row.off .v021-actions button{width:100%;min-height:38px}
}

@media(max-width:350px){
  /* Em celulares muito estreitos prioriza legibilidade em vez de três colunas. */
  #v021StockWrap #v021StockList .v021-row:not(.off){grid-template-columns:repeat(2,minmax(0,1fr))}
}
`;
    document.head.appendChild(style);
  }

  function pulse(){setTimeout(()=>{try{window.dispatchEvent(new CustomEvent('rota27:v021-stock-updated'));}catch{}},0);}

  injectMobileCompactStyle();
  document.addEventListener('click',e=>{if(e.target.closest?.('#v021StockWrap [data-filter]'))pulse();},true);
  document.addEventListener('input',e=>{if(e.target?.matches?.('#v021StockSearch'))pulse();},true);
})();
