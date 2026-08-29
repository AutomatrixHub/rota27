/* Rota 27 v0.25.61 — pré-fechamento por exceção */
(function(){
  'use strict';
  const VERSION='0.25.61';
  const CANCEL_OUTBOX_KEY='rota27_cancel_outbox_v0151';
  const TURN_OUTBOX_KEY='rota27_v019_turn_outbox_v1';
  const byId=id=>document.getElementById(id);
  function readArray(key){try{const v=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(v)?v:[];}catch{return[];}}
  function summary(){try{return window.Rota27V019?.buildSummary?.()||null;}catch{return null;}}
  function stateFor(){
    const s=summary();if(!s)return null;
    const open=Math.max(0,Number(s.openCount||0)),cancelSync=readArray(CANCEL_OUTBOX_KEY).length,turnSync=readArray(TURN_OUTBOX_KEY).length,hasMovement=Number(s.closedCount||0)>0||open>0;
    if(open>0)return {tone:'block',title:`${open} ${open===1?'comanda aberta':'comandas abertas'}`,text:'Feche ou cancele as comandas antes de encerrar o turno.'};
    if(cancelSync>0)return {tone:'block',title:`${cancelSync} ${cancelSync===1?'cancelamento pendente':'cancelamentos pendentes'}`,text:'Aguarde a confirmação da sincronização antes de fechar o turno.'};
    if(!hasMovement)return {tone:'neutral',title:'Sem movimento para fechar',text:'Quando houver comandas fechadas, o sistema libera o encerramento do turno.'};
    if(turnSync>0)return {tone:'warn',title:`${turnSync} ${turnSync===1?'fechamento aguarda':'fechamentos aguardam'} sincronização`,text:'O turno atual pode ser conferido; a sincronização pendente continua sendo reenviada automaticamente.'};
    return {tone:'ok',title:'Tudo certo para fechar',text:'Não há comandas abertas nem cancelamentos aguardando confirmação.'};
  }
  function render(){
    const card=byId('v019TurnCloseCard');if(!card)return false;const st=stateFor();if(!st)return false;let box=card.querySelector('.v02561-preflight');
    if(!box){box=document.createElement('div');box.className='v02561-preflight';const copy=card.querySelector('.v019-turn-close-copy');copy?.appendChild(box);}
    box.className=`v02561-preflight ${st.tone}`;box.innerHTML=`<strong>${st.title}</strong><span>${st.text}</span>`;card.dataset.v02561Preflight=st.tone;return true;
  }
  function settle(){[0,70,180,420].forEach(ms=>setTimeout(render,ms));}
  function start(){
    settle();document.addEventListener('click',e=>{if(e.target.closest?.('#v019CloseTurn,#v019CloseConfirm,#v019CloseCancel,#v019HistorySync,#v019ViewAll'))settle();});
    window.addEventListener('rota27:v017-domain-updated',settle);window.addEventListener('rota27:v0181-audit-updated',settle);window.addEventListener('storage',settle);window.addEventListener('online',settle);window.addEventListener('offline',settle);
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')settle();});
    window.Rota27V02561TurnPreflight={version:VERSION,refresh:render,getState:stateFor};console.info('[Rota27] v0.25.61 — pré-fechamento por exceção ativo.');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
