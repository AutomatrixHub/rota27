/* Rota 27 v0.25.1 — Navegação & Configurações */
(function(){
  'use strict';

  const VERSION='0.25.1';
  const SYNC_KEY='rota27_sync_config_v1';

  function byId(id){return document.getElementById(id);}
  function clean(v,max=180){return String(v??'').replace(/[\u0000-\u001f\u007f]/g,' ').trim().replace(/\s+/g,' ').slice(0,max);}
  function esc(v){
    if(typeof escapeHtml==='function')return escapeHtml(String(v??''));
    return String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }
  function readSync(){try{return JSON.parse(localStorage.getItem(SYNC_KEY)||'{}')||{};}catch{return {};}}
  function fmtSync(ts){
    if(!Number(ts))return 'Ainda não sincronizou';
    const d=new Date(Number(ts));
    if(Number.isNaN(d.getTime()))return 'Horário indisponível';
    return `Sincronizada • ${d.toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}`;
  }
  function clientsCount(){
    try{return Array.isArray(state?.clients)?state.clients.length:0;}catch{return 0;}
  }
  function manager(){
    try{
      if(window.Rota27V017?.sanitizeManager)return window.Rota27V017.sanitizeManager(state?.managerWhatsapp);
      const raw=state?.managerWhatsapp||{};
      return {name:clean(raw.name||'Gerente',120)||'Gerente',enabled:raw.enabled===true};
    }catch{return {name:'Gerente',enabled:false};}
  }
  function waReady(){try{return typeof isWhatsappConfigured==='function'&&isWhatsappConfigured();}catch{return false;}}

  function statusHtml(id,label,icon){
    return `<button type="button" class="v0251-card" data-v0251-action="${esc(id)}">
      <span class="v0251-icon" aria-hidden="true">${icon}</span>
      <span class="v0251-copy"><strong>${esc(label)}</strong><small id="v0251-${esc(id)}-summary"></small></span>
      <span class="v0251-chevron" aria-hidden="true">›</span>
    </button>`;
  }

  function ensureExtras(){
    if(byId('v0251PanelExtras'))return true;
    const panel=byId('screenPanel');
    if(!panel)return false;
    const wrap=document.createElement('div');
    wrap.id='v0251PanelExtras';
    wrap.className='v0251-panel-extras';
    wrap.innerHTML=`
      <section class="v15d4-section v0251-section">
        <div class="v15d4-section-title"><strong>Relacionamento</strong><span>Clientes, recorrência e fidelização</span></div>
        <div class="v0251-card-list">
          ${statusHtml('clients','Clientes & Fidelização','👥')}
        </div>
      </section>
      <section class="v15d4-section v0251-section">
        <div class="v15d4-section-title"><strong>Configurações & Integrações</strong><span>Serviços e conexões deste aparelho</span></div>
        <div class="v0251-card-list">
          ${statusHtml('wa-command','WhatsApp da comanda','💬')}
          ${statusHtml('manager','WhatsApp do gerente','◌')}
          ${statusHtml('sync','Sincronização entre aparelhos','↻')}
        </div>
      </section>`;
    panel.insertAdjacentElement('afterend',wrap);
    refresh();
    return true;
  }

  function setSummary(id,text,stateName='neutral'){
    const el=byId(`v0251-${id}-summary`);if(!el)return;
    el.innerHTML=`<span class="v0251-dot ${esc(stateName)}"></span>${esc(text)}`;
  }

  function refresh(){
    if(!ensureExtras())return;
    const count=clientsCount();
    setSummary('clients',`${count} cadastrado${count===1?'':'s'} • relacionamento e recorrência`,count?'ok':'neutral');

    const m=manager();
    setSummary('manager',m.enabled?`${m.name} • ativo`:'Desativado',m.enabled?'ok':'neutral');

    const ready=waReady();
    setSummary('wa-command',ready?'Configurado neste aparelho':'Ainda não configurado',ready?'ok':'neutral');

    const sync=readSync();
    const syncReady=sync.enabled===true&&sync.initialized===true;
    if(syncReady&&sync.lastError)setSummary('sync',`Atenção • ${clean(sync.lastError,90)}`,'warn');
    else if(syncReady)setSummary('sync',fmtSync(sync.lastSyncAt),'ok');
    else setSummary('sync','Ainda não inicializada','neutral');
  }

  function clickLegacy(id){const btn=byId(id);if(!btn)return false;btn.click();return true;}
  function openAction(action){
    if(action==='clients'){
      if(!clickLegacy('v017ClientsBtn'))window.Rota27V025?.openRelationship?.();
      return;
    }
    if(action==='manager'){
      if(!clickLegacy('v017ManagerBtn'))window.dispatchEvent(new CustomEvent('rota27:v017-open-manager'));
      return;
    }
    if(action==='wa-command'){
      try{if(typeof openWhatsappConfigSheet==='function')openWhatsappConfigSheet();}catch{}
      return;
    }
    if(action==='sync')clickLegacy('v15SyncConfigBtn');
  }

  function injectHelp(){
    const overlay=byId('r27HelpOverlay');
    const content=overlay?.querySelector('.r27-help-content');
    if(!content)return false;
    if(!byId('r27-help-navegacao-v0251')){
      const section=document.createElement('details');
      section.id='r27-help-navegacao-v0251';
      section.className='r27-help-section';
      section.innerHTML='<summary><span class="r27-help-section-icon">⚙</span><span><strong>Onde ficam Clientes e configurações</strong><small>Cardápio para produtos; Painel para administrar o negócio.</small></span><span class="r27-help-chevron">⌄</span></summary><div class="r27-help-section-body"><p>Na v0.25.1, o <strong>Cardápio</strong> ficou dedicado a produtos, categorias, preços, importação e exportação.</p><h4>Clientes & Fidelização</h4><p>Abra <strong>Painel → Relacionamento → Clientes & Fidelização</strong>. O cadastro de clientes e a Central de relacionamento continuam no mesmo fluxo, apenas em um local mais coerente.</p><h4>Configurações & Integrações</h4><p>Abra <strong>Painel → Configurações & Integrações</strong> para configurar <strong>WhatsApp da comanda</strong>, <strong>WhatsApp do gerente</strong> e <strong>Sincronização entre aparelhos</strong>.</p><div class="r27-help-tip"><strong>Regra simples:</strong> Comandas = atender; Cardápio = o que é vendido; Painel = administrar; Histórico = o que aconteceu.</div></div>';
      content.appendChild(section);
    }
    const footer=overlay.querySelector('.r27-help-footer span');
    if(footer)footer.textContent='Ajuda v5.2 • Rota 27 v0.25.1';
    return true;
  }

  function handleClick(e){
    const action=e.target.closest?.('[data-v0251-action]');
    if(action){openAction(action.dataset.v0251Action||'');setTimeout(refresh,120);return;}
    if(e.target.closest?.('#navPanel'))setTimeout(refresh,0);
    if(e.target.closest?.('.sheet-wrap'))setTimeout(refresh,120);
    if(e.target.closest?.('#r27HelpBtn,[data-help]'))setTimeout(injectHelp,80);
  }

  function start(){
    ensureExtras();
    refresh();
    injectHelp();
    document.addEventListener('click',handleClick);
    window.addEventListener('storage',refresh);
    window.addEventListener('online',refresh);
    window.addEventListener('offline',refresh);
    window.addEventListener('rota27:v017-domain-updated',refresh);
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){refresh();injectHelp();}});
    setTimeout(()=>{ensureExtras();refresh();injectHelp();},220);
    window.Rota27V0251={version:VERSION,refresh};
    console.info('[Rota27] v0.25.1 Navegação & Configurações carregado.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
