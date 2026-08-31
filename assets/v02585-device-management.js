/* Rota 27 v0.25.85 — gestão controlada de aparelhos sincronizados */
(function(){
  'use strict';
  if(window.Rota27V02585DeviceManagement)return;

  const VERSION='0.25.85';
  const CONFIG_KEY='rota27_sync_config_v1';
  let showRemoved=false;
  let loading=false;
  let lastDevices=[];

  const byId=id=>document.getElementById(id);
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const clean=(value,max=160)=>String(value??'').trim().replace(/\s+/g,' ').slice(0,max);

  function toast(message,error=false){
    try{if(typeof showToast==='function'){showToast(message,error);return;}}catch{}
    console[error?'error':'info']('[Rota27 devices]',message);
  }

  function syncConfig(){
    try{
      const raw=JSON.parse(localStorage.getItem(CONFIG_KEY)||'{}')||{};
      return {
        enabled:raw.enabled===true,
        initialized:raw.initialized===true,
        functionUrl:clean(raw.functionUrl,500),
        deviceToken:clean(raw.deviceToken,500),
        storeId:clean(raw.storeId||'rota27-bodega',80)||'rota27-bodega',
        deviceId:clean(raw.deviceId,120),
        deviceName:clean(raw.deviceName||'Aparelho',80),
        cursor:Math.max(0,Number(raw.cursor||0))
      };
    }catch{return null;}
  }

  function currentAppVersion(){
    return clean(document.querySelector('meta[name="rota27-release-version"]')?.content||VERSION,40)||VERSION;
  }

  function validConfig(cfg){
    return !!(cfg?.deviceId&&cfg?.deviceToken?.length>=16&&/^https:\/\/.+\/functions\/v1\/rota27-sync\/?$/i.test(cfg.functionUrl||''));
  }

  function inTestMode(){return document.body.classList.contains('v02581-test-mode');}

  async function api(action,extra={}){
    if(inTestMode())throw new Error('Gerenciamento de aparelhos fica indisponível no Modo Teste. Volte aos dados reais para continuar.');
    const cfg=syncConfig();
    if(!validConfig(cfg))throw new Error('Sincronização ainda não está configurada neste aparelho.');
    const response=await fetch(cfg.functionUrl,{
      method:'POST',
      headers:{'content-type':'application/json','x-rota27-device-token':cfg.deviceToken},
      body:JSON.stringify({
        action,
        storeId:cfg.storeId,
        deviceId:cfg.deviceId,
        deviceName:cfg.deviceName||'Aparelho',
        appVersion:currentAppVersion(),
        afterSeq:cfg.cursor||0,
        ...extra
      })
    });
    let data={};
    try{data=await response.json();}catch{}
    if(!response.ok||data?.ok===false){
      const error=new Error(clean(data?.error||`Falha HTTP ${response.status}`,300));
      error.code=clean(data?.code,60);
      error.deviceStatus=clean(data?.deviceStatus,30);
      throw error;
    }
    return data||{};
  }

  function formatSeen(value){
    if(!value)return 'Nunca';
    const d=new Date(value);
    if(Number.isNaN(d.getTime()))return '—';
    const now=new Date();
    const sameDay=d.getFullYear()===now.getFullYear()&&d.getMonth()===now.getMonth()&&d.getDate()===now.getDate();
    return sameDay
      ?`Hoje, ${d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}`
      :d.toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',year:'2-digit',hour:'2-digit',minute:'2-digit'});
  }

  function statusMeta(status){
    if(status==='retired')return {label:'Desativado',cls:'retired'};
    if(status==='removed')return {label:'Removido',cls:'removed'};
    return {label:'Ativo',cls:'active'};
  }

  function ensureEntry(){
    const screen=byId('screenPanel');if(!screen)return false;
    const sections=[...screen.querySelectorAll('.v15d4-section')];
    const operation=sections.find(section=>clean(section.querySelector('.v15d4-section-title strong')?.textContent,40).toLowerCase()==='operação');
    if(!operation)return false;
    let entry=byId('v02585DeviceEntry');
    if(!entry){
      entry=document.createElement('div');
      entry.id='v02585DeviceEntry';
      entry.className='v02585-device-entry';
      entry.innerHTML='<button type="button" id="v02585OpenDevices"><span class="v02585-device-entry-icon">▣</span><span><strong>Aparelhos sincronizados</strong><small>Desativar, reativar ou remover aparelhos</small></span><b>›</b></button>';
      operation.appendChild(entry);
    }
    return true;
  }

  function ensureSheet(){
    if(byId('v02585DeviceWrap'))return;
    const wrap=document.createElement('div');
    wrap.id='v02585DeviceWrap';
    wrap.className='v02585-device-wrap';
    wrap.setAttribute('aria-hidden','true');
    wrap.innerHTML=`
      <section class="v02585-device-sheet" role="dialog" aria-modal="true" aria-labelledby="v02585DeviceTitle">
        <div class="v02585-device-handle"></div>
        <header class="v02585-device-head">
          <div><h3 id="v02585DeviceTitle">Aparelhos sincronizados</h3><p>Controle quais aparelhos podem participar da sincronização do Rota 27.</p></div>
          <button type="button" class="v02585-device-close" aria-label="Fechar">×</button>
        </header>
        <div class="v02585-device-info"><strong>Remover é seguro:</strong> o aparelho some da lista operacional e fica bloqueado, mas os eventos históricos de sincronização são preservados.</div>
        <div class="v02585-device-toolbar">
          <label><input type="checkbox" id="v02585ShowRemoved"> <span>Mostrar removidos</span></label>
          <button type="button" id="v02585RefreshDevices">↻ Atualizar</button>
        </div>
        <div id="v02585DeviceList" class="v02585-device-list"></div>
      </section>`;
    document.body.appendChild(wrap);
    wrap.addEventListener('click',event=>{if(event.target===wrap)closeSheet();});
  }

  function openSheet(){
    ensureSheet();
    if(inTestMode()){
      toast('Volte aos dados reais para gerenciar aparelhos.',true);
      return;
    }
    const cfg=syncConfig();
    if(!validConfig(cfg)){
      toast('Sincronização não configurada neste aparelho.',true);
      return;
    }
    const wrap=byId('v02585DeviceWrap');
    wrap?.classList.add('open');
    wrap?.setAttribute('aria-hidden','false');
    loadDevices();
  }

  function closeSheet(){
    const wrap=byId('v02585DeviceWrap');
    wrap?.classList.remove('open');
    wrap?.setAttribute('aria-hidden','true');
  }

  function rowActions(device,currentId){
    const id=clean(device?.device_id,120);
    const status=clean(device?.status||'active',20)||'active';
    if(id===currentId)return '<span class="v02585-current">Este aparelho</span>';
    if(status==='removed'){
      return `<div class="v02585-action-menu"><button type="button" class="v02585-more" data-device-menu="${esc(id)}" aria-label="Ações">⋮</button><div class="v02585-menu-pop"><button type="button" data-device-action="reactivate" data-device-id="${esc(id)}">Restaurar aparelho</button></div></div>`;
    }
    if(status==='retired'){
      return `<div class="v02585-action-menu"><button type="button" class="v02585-more" data-device-menu="${esc(id)}" aria-label="Ações">⋮</button><div class="v02585-menu-pop"><button type="button" data-device-action="reactivate" data-device-id="${esc(id)}">Reativar</button><button type="button" class="danger" data-device-action="remove" data-device-id="${esc(id)}">Remover</button></div></div>`;
    }
    return `<div class="v02585-action-menu"><button type="button" class="v02585-more" data-device-menu="${esc(id)}" aria-label="Ações">⋮</button><div class="v02585-menu-pop"><button type="button" data-device-action="retire" data-device-id="${esc(id)}">Desativar</button><button type="button" class="danger" data-device-action="remove" data-device-id="${esc(id)}">Remover</button></div></div>`;
  }

  function renderDevices(devices,currentId){
    const list=byId('v02585DeviceList');if(!list)return;
    const rows=Array.isArray(devices)?devices:[];
    lastDevices=rows;
    if(!rows.length){
      list.innerHTML='<div class="v02585-device-empty">Nenhum aparelho encontrado.</div>';
      return;
    }
    list.innerHTML=rows.map(device=>{
      const id=clean(device?.device_id,120);
      const name=clean(device?.device_name||'Aparelho',80)||'Aparelho';
      const status=clean(device?.status||'active',20)||'active';
      const meta=statusMeta(status);
      const isCurrent=id===currentId;
      const version=clean(device?.app_version,40)||'versão não informada';
      return `<article class="v02585-device-row ${esc(meta.cls)}${isCurrent?' current':''}" data-device-row="${esc(id)}">
        <div class="v02585-device-main">
          <div class="v02585-device-name"><strong>${esc(name)}</strong><span class="v02585-status ${esc(meta.cls)}">${esc(meta.label)}</span></div>
          <small>${esc(formatSeen(device?.last_seen_at))} · ${esc(version)}</small>
          <code title="${esc(id)}">${esc(id)}</code>
          ${status!=='active'&&device?.retired_reason?`<p>${esc(device.retired_reason)}</p>`:''}
        </div>
        <div class="v02585-device-actions">${rowActions(device,currentId)}</div>
      </article>`;
    }).join('');
  }

  async function loadDevices(){
    if(loading)return;
    const list=byId('v02585DeviceList');
    loading=true;
    if(list)list.innerHTML='<div class="v02585-device-empty">Carregando aparelhos…</div>';
    try{
      const data=await api('devices_list',{includeRemoved:showRemoved});
      const cfg=syncConfig();
      renderDevices(data.devices||[],clean(data.currentDeviceId||cfg?.deviceId,120));
    }catch(error){
      if(list)list.innerHTML=`<div class="v02585-device-error"><strong>Não foi possível carregar os aparelhos.</strong><span>${esc(error?.message||'Falha desconhecida.')}</span></div>`;
    }finally{loading=false;}
  }

  function deviceById(id){return lastDevices.find(device=>String(device?.device_id||'')===String(id||''))||null;}

  async function runAction(action,id){
    const device=deviceById(id);
    const name=clean(device?.device_name||'Aparelho',80)||'Aparelho';
    let apiAction='';let question='';let success='';
    if(action==='retire'){
      apiAction='device_retire';
      question=`Desativar “${name}”?\n\nEsse aparelho deixará de sincronizar até ser reativado.`;
      success=`${name} foi desativado.`;
    }else if(action==='reactivate'){
      apiAction='device_reactivate';
      question=`Reativar “${name}”?\n\nO aparelho poderá voltar a sincronizar quando for aberto novamente.`;
      success=`${name} foi reativado.`;
    }else if(action==='remove'){
      apiAction='device_remove';
      question=`Remover “${name}” da lista?\n\nO aparelho ficará bloqueado e oculto. Os eventos históricos NÃO serão apagados.`;
      success=`${name} foi removido da lista e bloqueado.`;
    }else return;
    if(!window.confirm(question))return;
    try{
      await api(apiAction,{targetDeviceId:id,reason:action==='remove'?'Removido pelo Painel do Rota 27':'Desativado pelo Painel do Rota 27'});
      toast(success,false);
      await loadDevices();
    }catch(error){toast(error?.message||'Não foi possível concluir a ação.',true);}
  }

  document.addEventListener('click',event=>{
    const open=event.target.closest?.('#v02585OpenDevices');
    if(open){event.preventDefault();openSheet();return;}
    if(event.target.closest?.('.v02585-device-close')){closeSheet();return;}
    if(event.target.closest?.('#v02585RefreshDevices')){loadDevices();return;}

    const menuBtn=event.target.closest?.('[data-device-menu]');
    if(menuBtn){
      const row=menuBtn.closest('.v02585-device-row');
      document.querySelectorAll('.v02585-device-row.menu-open').forEach(other=>{if(other!==row)other.classList.remove('menu-open');});
      row?.classList.toggle('menu-open');
      return;
    }

    const actionBtn=event.target.closest?.('[data-device-action]');
    if(actionBtn){
      const action=clean(actionBtn.dataset.deviceAction,30);
      const id=clean(actionBtn.dataset.deviceId,120);
      actionBtn.closest('.v02585-device-row')?.classList.remove('menu-open');
      runAction(action,id);
      return;
    }

    if(!event.target.closest?.('.v02585-action-menu'))document.querySelectorAll('.v02585-device-row.menu-open').forEach(row=>row.classList.remove('menu-open'));
    if(event.target.closest?.('.navbtn,[data-screen]'))setTimeout(ensureEntry,70);
  });

  document.addEventListener('change',event=>{
    if(event.target?.id==='v02585ShowRemoved'){
      showRemoved=event.target.checked===true;
      loadDevices();
    }
  });

  window.addEventListener('rota27:test-mode-changed',()=>{
    if(inTestMode())closeSheet();
    setTimeout(ensureEntry,50);
  });
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')setTimeout(ensureEntry,80);});

  function start(){ensureSheet();ensureEntry();setTimeout(ensureEntry,350);setTimeout(ensureEntry,1200);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

  window.Rota27V02585DeviceManagement={version:VERSION,open:openSheet,refresh:loadDevices,ensure:ensureEntry};
})();
