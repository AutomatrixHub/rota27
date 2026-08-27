/* Rota 27 v0.25.31 — ordem, estabilidade e simplificação do Painel */
(function(){
  'use strict';

  const VERSION='0.25.31';

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
    section.className='v0252-standard-entry v0252-relationship-entry';
    section.innerHTML=`
      <div class="v0252-relationship-entry-head">
        <div class="v0252-relationship-copy">
          <strong>Clientes & Fidelização</strong>
          <small id="v0251-clients-summary"></small>
        </div>
        <button type="button" class="v0252-relationship-open" data-v0251-action="clients">Abrir clientes</button>
      </div>`;
    return section;
  }

  function updateClientSummary(){
    const el=byId('v0251-clients-summary');
    if(!el)return;
    const count=clientsCount();
    el.innerHTML=`<span class="v0251-dot ${count?'ok':'neutral'}"></span>${esc(`${count} cadastrado${count===1?'':'s'} • relacionamento e recorrência`)}`;
  }

  function removeLegacyRelationship(){
    const extras=byId('v0251PanelExtras');
    if(!extras)return;
    [...extras.querySelectorAll('.v0251-section')].forEach(node=>{
      if(node.querySelector('[data-v0251-action="clients"]'))node.remove();
    });
  }

  function sectionByTitle(panel,title){
    return [...panel.querySelectorAll(':scope > .v15d4-section')].find(section=>{
      const strong=section.querySelector(':scope > .v15d4-section-title strong');
      return String(strong?.textContent||'').trim()===title;
    })||null;
  }

  function removeQuickAccess(){
    const panel=byId('screenPanel');
    if(!panel)return false;
    const quick=sectionByTitle(panel,'Acessos rápidos');
    if(quick)quick.remove();
    return true;
  }

  function ensureRelationshipOrder(){
    const panel=byId('screenPanel');
    const manager=byId('v020ManagerEntry');
    if(!panel||!manager)return false;

    removeLegacyRelationship();

    let section=byId('v0252RelationshipSection');
    if(section&&!section.classList.contains('v0252-standard-entry')){
      const replacement=buildRelationship();
      section.replaceWith(replacement);
      section=replacement;
    }
    if(!section)section=buildRelationship();

    /* Topo gerencial: Visão Gerencial e, logo abaixo, Clientes & Fidelização. */
    if(section.parentElement!==panel||section.previousElementSibling!==manager){
      manager.insertAdjacentElement('afterend',section);
    }
    updateClientSummary();
    return true;
  }

  function ensureOperationalCardsPlacement(){
    const panel=byId('screenPanel');
    if(!panel)return false;

    removeQuickAccess();

    const operation=sectionByTitle(panel,'Operação');
    const stock=byId('v021StockEntry');
    const purchases=byId('v022PurchasesEntry');
    if(!operation||!stock||!purchases)return false;

    /*
     * A área antes ocupada por Acessos rápidos passa a receber os dois atalhos
     * administrativos realmente úteis neste ponto do fluxo:
     * Estoque Essencial e Compras & Reposição.
     */
    if(stock.parentElement!==panel||stock.previousElementSibling!==operation){
      operation.insertAdjacentElement('afterend',stock);
    }
    if(purchases.parentElement!==panel||purchases.previousElementSibling!==stock){
      stock.insertAdjacentElement('afterend',purchases);
    }
    return true;
  }

  function normalizePanel(){
    removeQuickAccess();
    const relationshipOk=ensureRelationshipOrder();
    const operationalOk=ensureOperationalCardsPlacement();
    return relationshipOk&&operationalOk;
  }

  /*
   * O Painel legado ainda redesenha screenPanel usando innerHTML. A ponte
   * recoloca os cards após cada render sem criar MutationObserver adicional.
   * O assentamento é curto e finito para conviver com os módulos legados que
   * recriam Visão Gerencial, Estoque e Compras logo após o redraw.
   */
  function schedulePanelRepair(){
    const repair=()=>{
      if(normalizePanel())return;
      requestAnimationFrame(()=>normalizePanel());
      setTimeout(normalizePanel,90);
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
          schedulePanelRepair();
        }
      });
      panel.dataset.v0252RelationshipBridge='1';
      return true;
    }catch(err){
      console.warn('[Rota27 v0.25.31] Não foi possível instalar a ponte de render do Painel:',err);
      return false;
    }
  }

  function refresh(){
    installPanelRenderBridge();
    normalizePanel();
    try{window.Rota27V0251?.refresh?.();}catch{}
    removeLegacyRelationship();
    normalizePanel();
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
    window.Rota27V0252Panel={version:VERSION,refresh,normalizePanel,ensureRelationshipOrder,ensureOperationalCardsPlacement};
    console.info('[Rota27] v0.25.31 Painel simplificado: sem Acessos rápidos; Estoque e Compras após Operação.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
