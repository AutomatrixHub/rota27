/* Rota 27 v0.25.210 — vínculo de funcionário e permissões por aparelho */
(function(){
  'use strict';
  if(window.Rota27V025208Access)return;

  const VERSION='0.25.210';
  const SYNC_KEY='rota27_sync_config_v1';
  const CACHE_KEY='rota27_device_access_profile_v1';
  const KEYS=['commands','menu','panel','history','clients','receivables','stock','purchases','inventory','settings','devices'];
  const LABELS={
    commands:['Comandas','Ver lista/mapa ou operar comandas'],
    menu:['Cardápio','Consultar ou alterar produtos e categorias'],
    panel:['Painel','Acessar o painel operacional/gerencial'],
    history:['Histórico','Consultar vendas e movimentações anteriores'],
    clients:['Clientes & Fidelização','Consultar ou alterar cadastro de clientes'],
    receivables:['A receber','Consultar ou registrar recebimentos'],
    stock:['Estoque Essencial','Consultar ou ajustar estoque'],
    purchases:['Compras & Reposição','Consultar ou operar pedidos e recebimentos'],
    inventory:['Inventário & Conferência','Consultar ou executar conferências'],
    settings:['Configurações & Integrações','WhatsApp, sincronização e integrações'],
    devices:['Aparelhos','Consultar ou administrar aparelhos sincronizados']
  };
  const FULL=Object.fromEntries(KEYS.map(k=>[k,'edit']));
  const NONE=Object.fromEntries(KEYS.map(k=>[k,'none']));
  const MENU_MUTATION_FUNCTIONS=['openMenuItemSheet','saveMenuItem','openCategoryManager','openCategorySheet','saveCategory','v14OpenImportSheet','v14ApplyCatalogImport'];
  let profile=null;
  let accessDevices=new Map();
  let deviceObserver=null;
  let deviceObserverTarget=null;
  let deviceDecorateTimer=null;
  let bodyRefreshTimer=null;
  let originalShowScreen=null;

  const byId=id=>document.getElementById(id);
  const clean=(v,max=180)=>String(v??'').trim().replace(/\s+/g,' ').slice(0,max);
  const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  function toast(msg,error=false){try{if(typeof showToast==='function'){showToast(msg,error);return;}}catch{}console[error?'warn':'info']('[Rota27 acesso]',msg);}
  function readJson(key,fallback){try{const v=JSON.parse(localStorage.getItem(key)||'null');return v==null?fallback:v;}catch{return fallback;}}
  function writeJson(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}}

  function syncConfig(){
    const raw=readJson(SYNC_KEY,{});return raw&&typeof raw==='object'?raw:{};
  }
  function syncReady(cfg=syncConfig()){
    return cfg.enabled===true&&cfg.initialized===true&&/^https:\/\/.+\/functions\/v1\/rota27-sync\/?$/i.test(String(cfg.functionUrl||''))&&String(cfg.deviceToken||'').length>=16&&!!cfg.deviceId;
  }
  function endpoint(cfg=syncConfig()){
    return String(cfg.functionUrl||'').replace(/\/rota27-sync\/?$/i,'/rota27-access-control');
  }
  async function api(action,extra={}){
    const cfg=syncConfig();if(!syncReady(cfg))throw new Error('Sincronização ainda não configurada neste aparelho.');
    const url=endpoint(cfg);if(!url)throw new Error('Endpoint de acesso indisponível.');
    const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),12000);
    try{
      const response=await fetch(url,{method:'POST',headers:{'content-type':'application/json','x-rota27-device-token':String(cfg.deviceToken)},body:JSON.stringify({action,storeId:cfg.storeId||'rota27-bodega',deviceId:cfg.deviceId,deviceName:cfg.deviceName||'Aparelho',appVersion:VERSION,...extra}),signal:ctrl.signal});
      const data=await response.json().catch(()=>({}));if(!response.ok||data?.ok!==true)throw new Error(data?.error||`Falha HTTP ${response.status}`);return data;
    }finally{clearTimeout(timer);}
  }
  function normalizePermissions(value){
    const src=value&&typeof value==='object'&&!Array.isArray(value)?value:{};const out={...NONE};
    KEYS.forEach(k=>{const mode=String(src[k]||'none');out[k]=mode==='edit'||mode==='view'?mode:'none';});return out;
  }
  function normalizeProfile(value){
    const role=String(value?.role||'staff')==='owner'?'owner':'staff';
    return {role,employeeName:clean(value?.employeeName||'',120),permissions:role==='owner'?{...FULL}:normalizePermissions(value?.permissions),updatedAt:value?.updatedAt||null};
  }
  function restrictedProfile(){return {role:'staff',employeeName:'',permissions:{...NONE},updatedAt:null};}
  function isOwner(){return profile?profile.role==='owner':!syncReady();}
  function mode(area){return isOwner()?'edit':String(profile?.permissions?.[area]||'none');}
  function canView(area){return mode(area)==='view'||mode(area)==='edit';}
  function canEdit(area){return mode(area)==='edit';}
  function denyMenuEdit(){
    if(canEdit('menu'))return false;
    toast('Cardápio liberado somente para consulta neste aparelho.',true);
    return true;
  }

  function setVisible(node,visible){if(!node)return;node.classList.toggle('r27-access-hidden',!visible);node.setAttribute('aria-hidden',visible?'false':'true');}
  function firstAllowedScreen(){for(const area of ['commands','menu','panel','history'])if(canView(area))return area;return '';}
  function activeArea(){if(byId('screenCommands')?.classList.contains('active')||byId('screenSale')?.classList.contains('active'))return 'commands';if(byId('screenMenu')?.classList.contains('active'))return 'menu';if(byId('screenPanel')?.classList.contains('active'))return 'panel';if(byId('screenHistory')?.classList.contains('active'))return 'history';return '';}
  function safeShowScreen(name){
    const area=String(name||'');
    if(area==='categories'){
      if(canEdit('menu'))return true;
      toast('Gerenciamento de categorias não liberado neste aparelho.',true);return false;
    }
    if(!['commands','menu','panel','history'].includes(area))return true;
    if(canView(area))return true;toast('Este aparelho não tem permissão para abrir esta área.',true);return false;
  }
  function patchShowScreen(){
    if(originalShowScreen||typeof window.showScreen!=='function')return;
    originalShowScreen=window.showScreen;
    const wrapped=function(name){if(!safeShowScreen(name))return;return originalShowScreen.apply(this,arguments);};
    try{window.showScreen=wrapped;showScreen=wrapped;}catch{window.showScreen=wrapped;}
  }
  function patchMenuMutationFunction(name){
    const current=window[name];
    if(typeof current!=='function'||current.__r27AccessMenuGuard===true)return false;
    const wrapped=function(){if(denyMenuEdit())return false;return current.apply(this,arguments);};
    wrapped.__r27AccessMenuGuard=true;
    wrapped.__r27AccessBase=current;
    try{window[name]=wrapped;}catch{return false;}
    return true;
  }
  function patchMenuMutations(){MENU_MUTATION_FUNCTIONS.forEach(patchMenuMutationFunction);}
  function closeMenuMutationSurfaces(){
    if(isOwner()||canEdit('menu'))return;
    byId('menuItemWrap')?.classList.remove('open');
    byId('categoryWrap')?.classList.remove('open');
    byId('v14ImportWrap')?.classList.remove('open');
    if(byId('screenCategories')?.classList.contains('active')){
      const next=canView('menu')?'menu':firstAllowedScreen();
      if(next&&originalShowScreen)originalShowScreen(next);
    }
  }

  function applyAccess(){
    const body=document.body;if(!body)return;
    body.classList.toggle('r27-access-staff',!isOwner());
    KEYS.forEach(k=>body.classList.toggle(`r27-no-edit-${k}`,!isOwner()&&!canEdit(k)));
    setVisible(byId('navCommands'),canView('commands'));
    setVisible(byId('navMenu'),canView('menu'));
    setVisible(byId('navPanel'),canView('panel'));
    setVisible(byId('navHistory'),canView('history'));
    setVisible(byId('v0252RelationshipSection'),canView('clients'));
    setVisible(byId('v02512ReceivablesEntry'),canView('receivables'));
    setVisible(byId('v021StockEntry'),canView('stock'));
    setVisible(byId('v022PurchasesEntry'),canView('purchases'));
    setVisible(byId('v02585DeviceEntry'),canView('devices'));
    document.querySelectorAll('[data-v0251-action="clients"]').forEach(el=>setVisible(el,canView('clients')));
    document.querySelectorAll('[data-v0251-action="manager"],[data-v0251-action="wa-command"],[data-v0251-action="sync"]').forEach(el=>setVisible(el,canView('settings')));
    if(!isOwner()&&activeArea()&&!canView(activeArea())){
      const next=firstAllowedScreen();if(next&&originalShowScreen)originalShowScreen(next);
    }
    patchShowScreen();
    patchMenuMutations();
    closeMenuMutationSurfaces();
  }

  function loadCached(){
    const cfg=syncConfig(),cached=readJson(CACHE_KEY,null);
    if(cached&&String(cached.deviceId||'')===String(cfg.deviceId||'')&&cached.profile){profile=normalizeProfile(cached.profile);return true;}return false;
  }
  function saveCached(){const cfg=syncConfig();if(profile&&cfg.deviceId)writeJson(CACHE_KEY,{deviceId:cfg.deviceId,profile,fetchedAt:Date.now()});}
  async function refreshProfile(silent=true){
    const cfg=syncConfig();
    if(!syncReady(cfg)){profile={role:'owner',employeeName:'',permissions:{...FULL},updatedAt:null};applyAccess();return profile;}
    try{
      const data=await api('profile');profile=normalizeProfile(data.access);saveCached();applyAccess();return profile;
    }catch(err){if(!profile&&!loadCached())profile=restrictedProfile();applyAccess();if(!silent)toast(err?.message||'Não foi possível atualizar as permissões.',true);return profile;}
  }

  function closeControl(target){
    const btn=target.closest?.('button');if(!btn)return false;const id=String(btn.id||'').toLowerCase(),text=String(btn.textContent||'').trim().toLowerCase();return /close|fechar|cancel|done|concluir|voltar|\bx\b/.test(id)||text==='×'||text==='fechar'||text==='cancelar'||text==='concluir'||text==='voltar';
  }
  function readonlyBlock(event,containerId,area){
    if(canEdit(area))return false;const container=event.target.closest?.(`#${containerId}`);if(!container)return false;if(closeControl(event.target))return false;
    if(event.target.closest?.('input,select,textarea,button')){event.preventDefault();event.stopImmediatePropagation();toast('Este aparelho possui acesso somente para consulta nesta área.',true);return true;}return false;
  }
  function captureAccess(event){
    if(isOwner())return;
    const t=event.target;
    const nav=t.closest?.('#navCommands,#navMenu,#navPanel,#navHistory');if(nav){const map={navCommands:'commands',navMenu:'menu',navPanel:'panel',navHistory:'history'};const area=map[nav.id];if(area&&!canView(area)){event.preventDefault();event.stopImmediatePropagation();toast('Área não liberada para este funcionário.',true);return;}}
    if(!canEdit('commands')&&t.closest?.('#fabNew,#commandList .command-card,#v0252CommandMap [data-command-id]')){event.preventDefault();event.stopImmediatePropagation();toast('Comandas disponíveis somente para consulta neste aparelho.',true);return;}
    if(!canEdit('menu')&&t.closest?.('#screenMenu .menu-item,#screenMenu .menu-edit,#screenMenu .menu-add,#screenMenu .menu-categories,#screenMenu #menuEmpty .primary,#screenMenu #v14CatalogTools button[onclick*="v14OpenImportSheet"]')){event.preventDefault();event.stopImmediatePropagation();denyMenuEdit();return;}
    if(!canEdit('menu')&&t.closest?.('#menuItemWrap,#categoryWrap,#v14ImportWrap,#screenCategories')){
      if(closeControl(t)||t.closest?.('#screenCategories .category-back'))return;
      event.preventDefault();event.stopImmediatePropagation();denyMenuEdit();return;
    }
    if(!canView('clients')&&t.closest?.('[data-v0251-action="clients"],#v0252RelationshipSection')){event.preventDefault();event.stopImmediatePropagation();return;}
    if(!canView('receivables')&&t.closest?.('#v02512ReceivablesEntry,#v02512Open')){event.preventDefault();event.stopImmediatePropagation();return;}
    if(!canView('stock')&&t.closest?.('#v021StockEntry')){event.preventDefault();event.stopImmediatePropagation();return;}
    if(!canView('purchases')&&t.closest?.('#v022PurchasesEntry')){event.preventDefault();event.stopImmediatePropagation();return;}
    if(!canView('settings')&&t.closest?.('[data-v0251-action="manager"],[data-v0251-action="wa-command"],[data-v0251-action="sync"]')){event.preventDefault();event.stopImmediatePropagation();return;}
    if(!canView('devices')&&t.closest?.('#v02585OpenDevices')){event.preventDefault();event.stopImmediatePropagation();return;}
    if(!canEdit('devices')&&t.closest?.('[data-device-action],[data-v02586-remote],[data-v02589-update-device]')){event.preventDefault();event.stopImmediatePropagation();toast('Gerenciamento de aparelhos não liberado.',true);return;}
    if(readonlyBlock(event,'v017ClientsWrap','clients'))return;
    if(readonlyBlock(event,'v02512ReceivablesWrap','receivables'))return;
    if(readonlyBlock(event,'v02512PaymentWrap','receivables'))return;
    if(readonlyBlock(event,'v021StockWrap','stock'))return;
    if(readonlyBlock(event,'v022PurchasesWrap','purchases'))return;
    if(readonlyBlock(event,'v023InventoryWrap','inventory'))return;
  }

  function ensureEditor(){
    if(byId('v025208AccessWrap'))return;
    const wrap=document.createElement('div');wrap.id='v025208AccessWrap';wrap.innerHTML=`<section class="v025208-access-sheet" role="dialog" aria-modal="true"><header class="v025208-access-head"><div><h3>Funcionário e permissões</h3><p id="v025208AccessSubtitle"></p></div><button type="button" class="v025208-access-close" aria-label="Fechar">×</button></header><div class="v025208-access-fields"><label>Nome do funcionário<input id="v025208EmployeeName" maxlength="120" placeholder="Ex.: João — Balcão" /></label><label>Nível do aparelho<select id="v025208Role"><option value="staff">Funcionário</option><option value="owner">Proprietário</option></select></label></div><div class="v025208-access-note"><strong>Ver</strong> permite consultar a área. <strong>Editar</strong> libera as operações daquela área. Um aparelho novo começa bloqueado até você configurá-lo.</div><div id="v025208Permissions" class="v025208-permissions"></div><div class="v025208-access-actions"><button type="button" class="v025208-access-close">Cancelar</button><button type="button" class="primary" id="v025208SaveAccess">Salvar acesso</button></div></section>`;document.body.appendChild(wrap);
    wrap.addEventListener('click',e=>{if(e.target===wrap)closeEditor();});
    wrap.querySelectorAll('.v025208-access-close').forEach(btn=>btn.addEventListener('click',closeEditor));
    byId('v025208Role')?.addEventListener('change',syncEditorRole);
    byId('v025208SaveAccess')?.addEventListener('click',saveEditor);
  }
  function buildPermissionRows(){
    const host=byId('v025208Permissions');if(!host)return;
    host.innerHTML=KEYS.map(key=>`<div class="v025208-permission-row"><div><strong>${esc(LABELS[key][0])}</strong><small>${esc(LABELS[key][1])}</small></div><label><span class="sr-only">Permissão</span><select data-v025208-permission="${key}"><option value="none">Não ver</option><option value="view">Ver</option><option value="edit">Ver e editar</option></select></label></div>`).join('');
  }
  let editingDeviceId='';
  function syncEditorRole(){
    const owner=byId('v025208Role')?.value==='owner';document.querySelectorAll('[data-v025208-permission]').forEach(sel=>{if(owner)sel.value='edit';sel.disabled=owner;});
  }
  function openEditor(id){
    if(!isOwner()){toast('Somente um aparelho proprietário pode configurar funcionários.',true);return;}
    const device=accessDevices.get(String(id||''));if(!device)return;
    editingDeviceId=String(id);ensureEditor();buildPermissionRows();
    byId('v025208AccessSubtitle').textContent=`${clean(device.device_name||'Aparelho',80)} • ${editingDeviceId}`;
    byId('v025208EmployeeName').value=clean(device.access?.employeeName||device.employee_name||'',120);
    byId('v025208Role').value=device.access?.role==='owner'?'owner':'staff';
    const perms=device.access?.permissions||device.permissions||NONE;document.querySelectorAll('[data-v025208-permission]').forEach(sel=>{sel.value=normalizePermissions(perms)[sel.dataset.v025208Permission]||'none';});
    syncEditorRole();byId('v025208AccessWrap').classList.add('open');
  }
  function closeEditor(){byId('v025208AccessWrap')?.classList.remove('open');editingDeviceId='';}
  async function saveEditor(){
    if(!editingDeviceId)return;const role=byId('v025208Role')?.value==='owner'?'owner':'staff';const permissions={};document.querySelectorAll('[data-v025208-permission]').forEach(sel=>permissions[sel.dataset.v025208Permission]=sel.value);
    const btn=byId('v025208SaveAccess');if(btn)btn.disabled=true;
    try{await api('update',{targetDeviceId:editingDeviceId,employeeName:clean(byId('v025208EmployeeName')?.value||'',120),role,permissions});toast('Acesso do aparelho atualizado.');closeEditor();await loadAccessDevices();}
    catch(err){toast(err?.message||'Não foi possível salvar o acesso.',true);}finally{if(btn)btn.disabled=false;}
  }

  function scheduleDecorate(){clearTimeout(deviceDecorateTimer);deviceDecorateTimer=setTimeout(decorateDeviceRows,20);}
  function decorateDeviceRows(){
    const list=byId('v02585DeviceList');if(!list)return;
    const cfg=syncConfig(),observer=deviceObserver;observer?.disconnect();
    try{
      list.querySelectorAll('[data-device-row]').forEach(row=>{
        const id=String(row.dataset.deviceRow||''),device=accessDevices.get(id);if(!device)return;
        let summary=row.querySelector('.v025208-access-summary');
        if(!summary){summary=document.createElement('div');summary.className='v025208-access-summary';row.querySelector('.v02585-device-main')?.appendChild(summary);}
        const access=device.access||{},role=access.role==='owner'?'owner':'staff',employee=clean(access.employeeName||'',120);
        const summaryHtml=`<span class="v025208-access-badge ${role}">${role==='owner'?'Proprietário':'Funcionário'}</span>${employee?`<span class="v025208-access-badge">${esc(employee)}</span>`:'<span class="v025208-access-badge">Sem funcionário vinculado</span>'}`;
        if(summary.innerHTML!==summaryHtml)summary.innerHTML=summaryHtml;
        const actions=row.querySelector('.v02585-device-actions');let btn=row.querySelector('.v025208-access-button');
        const shouldShow=isOwner()&&id!==String(cfg.deviceId||'');
        if(shouldShow&&actions){
          if(!btn){btn=document.createElement('button');btn.type='button';btn.className='v025208-access-button';btn.textContent='Funcionário / acesso';actions.appendChild(btn);}
          if(btn.dataset.v025208Access!==id)btn.dataset.v025208Access=id;
        }else btn?.remove();
      });
    }finally{
      if(observer&&deviceObserverTarget===list&&list.isConnected)observer.observe(list,{childList:true,subtree:true});
    }
  }
  async function loadAccessDevices(){
    if(!isOwner()||!syncReady())return;
    try{const data=await api('list',{includeRemoved:true});accessDevices=new Map((data.devices||[]).map(d=>[String(d.device_id||''),d]));scheduleDecorate();}
    catch(err){console.warn('[Rota27 acesso] lista:',err?.message||err);}
  }
  function watchDeviceList(){
    const list=byId('v02585DeviceList');if(!list)return;
    if(deviceObserver&&deviceObserverTarget===list){scheduleDecorate();return;}
    deviceObserver?.disconnect();deviceObserverTarget=list;
    deviceObserver=new MutationObserver(scheduleDecorate);deviceObserver.observe(list,{childList:true,subtree:true});scheduleDecorate();
  }

  function ensureGate(){if(byId('v025208AccessGate'))return;const gate=document.createElement('div');gate.id='v025208AccessGate';gate.innerHTML='<div class="v025208-gate-card"><strong>Acesso não liberado</strong><span>Este aparelho está vinculado como funcionário, mas nenhuma área foi autorizada. Peça ao responsável para abrir Painel → Aparelhos sincronizados e configurar seu acesso.</span></div>';document.body.appendChild(gate);}
  function syncLockedGate(){ensureGate();document.body.classList.toggle('r27-access-pending',!isOwner()&&!KEYS.some(canView));}
  const baseApply=applyAccess;applyAccess=function(){baseApply();syncLockedGate();};

  function start(){
    ensureEditor();ensureGate();const cached=loadCached();if(!cached&&syncReady())profile=restrictedProfile();if(profile)applyAccess();refreshProfile(true);patchShowScreen();patchMenuMutations();
    document.addEventListener('click',captureAccess,true);
    document.addEventListener('click',event=>{const btn=event.target.closest?.('[data-v025208-access]');if(btn){event.preventDefault();openEditor(btn.dataset.v025208Access);return;}if(event.target.closest?.('#v02585OpenDevices'))setTimeout(()=>{watchDeviceList();loadAccessDevices();},180);},true);
    window.addEventListener('online',()=>refreshProfile(true));
    window.addEventListener('storage',()=>{loadCached();applyAccess();});
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){refreshProfile(true);setTimeout(()=>{applyAccess();watchDeviceList();if(isOwner())loadAccessDevices();},180);}});
    const observer=new MutationObserver(mutations=>{
      if(!mutations.some(m=>m.addedNodes.length||m.removedNodes.length))return;
      clearTimeout(bodyRefreshTimer);bodyRefreshTimer=setTimeout(()=>{applyAccess();if(byId('v02585DeviceList'))watchDeviceList();},40);
    });
    observer.observe(document.body,{childList:true,subtree:true});
    setTimeout(()=>{applyAccess();watchDeviceList();if(isOwner())loadAccessDevices();},700);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
  window.Rota27V025208Access={version:VERSION,refresh:refreshProfile,canView,canEdit,getProfile:()=>profile?JSON.parse(JSON.stringify(profile)):null,openDevice:openEditor};
})();
