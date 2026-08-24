/* Rota 27 v0.21.0 — preserva Ajuda da Visão Gerencial sem loop de mutações */
(function(){
  'use strict';
  function byId(id){return document.getElementById(id);}
  function own(){return String(document.querySelector('meta[name="rota27-version"]')?.getAttribute('content')||'')==='0.21.0';}

  function apply(){
    if(!own())return false;
    const overlay=byId('r27HelpOverlay'),content=overlay?.querySelector('.r27-help-content');
    if(!content)return false;
    if(!byId('r27-help-visao-gerencial')){
      const d=document.createElement('details');
      d.id='r27-help-visao-gerencial';d.className='r27-help-section';
      d.innerHTML='<summary><span class="r27-help-section-icon">▦</span><span><strong>Visão Gerencial</strong><small>Comparar períodos usando fechamentos confiáveis.</small></span></summary><div class="r27-help-section-body"><div class="r27-help-lead">No <b>Painel</b>, abra <b>Visão Gerencial</b> para acompanhar faturamento, média por turno, ticket, comandas, itens, produtos e formas de pagamento.</div><ol class="r27-help-steps"><li><span>1</span><div><b>Escolha o período</b><br>Use 7, 30, 90 dias ou todo o histórico.</div></li><li><span>2</span><div><b>Compare</b><br>Quando há base anterior, o app mostra a variação percentual.</div></li><li><span>3</span><div><b>Leia a tendência</b><br>O gráfico usa apenas turnos realmente fechados; dias sem fechamento não viram zero.</div></li><li><span>4</span><div><b>Demonstre sem contaminar</b><br>O Modo demonstração usa dados simulados em memória, não salva nem sincroniza.</div></li></ol></div>';
      content.appendChild(d);
    }
    const footer=overlay.querySelector('.r27-help-footer span');
    if(footer&&footer.textContent!=='Ajuda v4.5 • v0.21.0')footer.textContent='Ajuda v4.5 • v0.21.0';
    return !!byId('r27-help-visao-gerencial');
  }

  function start(){
    if(apply())return;
    let observer=null;
    observer=new MutationObserver(()=>{
      if(apply()&&observer){observer.disconnect();observer=null;}
    });
    observer.observe(document.body,{childList:true,subtree:true});
    setTimeout(()=>{if(observer){observer.disconnect();observer=null;}apply();},12000);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
