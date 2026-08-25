/* Rota 27 v0.25.2 R7 — ordem, estabilidade e normalização do Painel */
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

  function ensureRelationshipOrder(){
    const panel=byId('screenPanel');
    const purchases=byId('v022PurchasesEntry');
    if(!panel||!purchases)return false;

    removeLegacyRelationship();

    let section=byId('v0252RelationshipSection');
    if(section&&!section.classList.contains('v0252-standard-entry')){
      const replacement=buildRelationship();
      section.replaceWith(replacement);
      section=replacement;
    }
    if(!section)section=buildRelationship();

    if(section.parentElement!==panel||section.previousElementSibling!==purchases){
      purchases.insertAdjacentElement('afterend',section);
    }
    updateClientSummary();
    return true;
  }

  /*
   * O Painel legado ainda redesenha screenPanel usando innerHTML. A ponte
   * criada na R4 permanece exclusivamente para recolocar o quarto card após
   * cada render. Os ícones dos quatro cards são CSS e não dependem de DOM extra.
   */
  function schedulePanelRepair(){
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
          schedulePanelRepair();
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
    removeLegacyRelationship();
    ensureRelationshipOrder();
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
    console.info('[Rota27] v0.25.2 R7 Painel normalizado carregado.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
