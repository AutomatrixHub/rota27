/* Rota 27 v0.25.2 R4 — ordem e acabamento do Painel */
(function(){
  'use strict';

  const VERSION='0.25.2';

  function byId(id){return document.getElementById(id);}
  function esc(v){
    if(typeof escapeHtml==='function')return escapeHtml(String(v??''));
    return String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }
  function clientsCount(){
    try{return Array.isArray(state?.clients)?state.clients.length:0;}catch{return 0;}
  }

  function buildRelationship(){
    const section=document.createElement('section');
    section.id='v0252RelationshipSection';
    section.className='v15d4-section v0251-section';
    section.innerHTML=`
      <div class="v15d4-section-title"><strong>Relacionamento</strong><span>Clientes, recorrência e fidelização</span></div>
      <div class="v0251-card-list">
        <button type="button" class="v0251-card" data-v0251-action="clients">
          <span class="v0251-icon" aria-hidden="true">👥</span>
          <span class="v0251-copy"><strong>Clientes & Fidelização</strong><small id="v0251-clients-summary"></small></span>
          <span class="v0251-chevron" aria-hidden="true">›</span>
        </button>
      </div>`;
    return section;
  }

  function updateClientSummary(){
    const el=byId('v0251-clients-summary');
    if(!el)return;
    const count=clientsCount();
    el.innerHTML=`<span class="v0251-dot ${count?'ok':'neutral'}"></span>${esc(`${count} cadastrado${count===1?'':'s'} • relacionamento e recorrência`)}`;
  }

  function ensureRelationshipOrder(){
    const panel=byId('screenPanel');
    const purchases=byId('v022PurchasesEntry');
    if(!panel||!purchases)return false;

    let section=byId('v0252RelationshipSection');
    if(!section){
      const extras=byId('v0251PanelExtras');
      const original=[...(extras?.querySelectorAll('.v0251-section')||[])].find(node=>node.querySelector('[data-v0251-action="clients"]'));
      if(original){
        section=original;
        section.id='v0252RelationshipSection';
      }else{
        section=buildRelationship();
      }
    }

    if(section.parentElement!==panel||section.previousElementSibling!==purchases){
      purchases.insertAdjacentElement('afterend',section);
    }
    updateClientSummary();
    return true;
  }

  /*
   * O Painel legado ainda redesenha screenPanel usando innerHTML. Em vez de
   * criar outro MutationObserver ou polling, a R4 intercepta somente a escrita
   * de innerHTML deste elemento. Depois do render nativo, agenda uma única
   * recomposição da posição do Relacionamento. O observer legado único da
   * compatibilidade v0.22 restaura primeiro Visão/Estoque/Compras; se necessário,
   * um requestAnimationFrame único cobre apenas a ordem de microtasks.
   */
  function scheduleRelationshipRepair(){
    const repair=()=>{
      if(ensureRelationshipOrder())return;
      requestAnimationFrame(()=>ensureRelationshipOrder());
    };
    if(typeof queueMicrotask==='function')queueMicrotask(repair);
    else Promise.resolve().then(repair);
  }

  function installPanelRenderBridge(){
    const panel=byId('screenPanel');
    if(!panel)return false;
    if(panel.dataset.v0252RelationshipBridge==='1')return true;
    const descriptor=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');
    if(!descriptor?.get||!descriptor?.set)return false;
    try{
      Object.defineProperty(panel,'innerHTML',{
        configurable:true,
        enumerable:descriptor.enumerable,
        get:function(){return descriptor.get.call(this);},
        set:function(value){
          descriptor.set.call(this,value);
          scheduleRelationshipRepair();
        }
      });
      panel.dataset.v0252RelationshipBridge='1';
      return true;
    }catch(err){
      console.warn('[Rota27 v0.25.2] Não foi possível instalar a ponte de render do Painel:',err);
      return false;
    }
  }

  function refresh(){
    installPanelRenderBridge();
    ensureRelationshipOrder();
    try{window.Rota27V0251?.refresh?.();}catch{}
    updateClientSummary();
  }

  function handleClick(e){
    if(e.target.closest?.('#navPanel'))setTimeout(refresh,0);
    if(e.target.closest?.('[data-v0251-action="clients"]'))setTimeout(updateClientSummary,120);
  }

  function start(){
    installPanelRenderBridge();
    setTimeout(refresh,260);
    document.addEventListener('click',handleClick);
    window.addEventListener('storage',refresh);
    window.addEventListener('online',refresh);
    window.addEventListener('offline',refresh);
    window.addEventListener('rota27:v017-domain-updated',refresh);
    window.addEventListener('rota27:v021-stock-updated',refresh);
    window.addEventListener('rota27:v022-purchases-updated',refresh);
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refresh();});
    window.Rota27V0252Panel={version:VERSION,refresh,ensureRelationshipOrder};
    console.info('[Rota27] v0.25.2 R4 refinamento estável do Painel carregado.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
