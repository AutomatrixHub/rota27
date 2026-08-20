/* Rota 27 v0.15 DEV.3 — guardas de bootstrap e status operacional
 * Hotfix Android preservado: remove loop de MutationObserver provocado por alterações de class/disabled feitas pela própria guarda.
 */
(function(){
  'use strict';
  const CONFIG_KEY='rota27_sync_config_v1';
  const VERSION='0.15-dev.3';
  let applying=false;
  let pendingTimer=null;

  function byId(id){return document.getElementById(id);}
  function readCfg(){
    try{return JSON.parse(localStorage.getItem(CONFIG_KEY)||'{}')||{};}catch{return {};}
  }
  function ensureGuard(){
    const actions=document.querySelector('#v15SyncWrap .v15-sync-actions');
    if(!actions)return null;
    let guard=byId('v15Dev2Guard');
    if(!guard){
      guard=document.createElement('div');
      guard.id='v15Dev2Guard';
      guard.className='v15d2-guard';
      actions.insertAdjacentElement('beforebegin',guard);
    }
    let runtime=byId('v15Dev2Runtime');
    if(!runtime){
      runtime=document.createElement('div');
      runtime.id='v15Dev2Runtime';
      runtime.className='v15d2-runtime';
      guard.insertAdjacentElement('afterend',runtime);
    }
    return guard;
  }
  function setDisabled(button,value,title){
    if(!button)return;
    const next=Boolean(value);
    if(button.disabled!==next)button.disabled=next;
    if(title!==undefined && button.title!==title)button.title=title;
  }
  function setFocus(button,value){
    if(!button)return;
    const has=button.classList.contains('v15d2-focus');
    if(value&&!has)button.classList.add('v15d2-focus');
    if(!value&&has)button.classList.remove('v15d2-focus');
  }
  function applyGuard(){
    if(applying)return;
    const wrap=byId('v15SyncWrap');
    if(!wrap)return;
    applying=true;
    try{
      const cfg=readCfg();
      const guard=ensureGuard();
      if(!guard)return;
      const publish=byId('v15PublishBtn');
      const adopt=byId('v15AdoptBtn');
      const initialized=cfg.initialized===true;
      const hasRemoteBase=Number(cfg.latestSnapshotSeq||0)>0;
      const configured=Boolean(cfg.functionUrl)&&String(cfg.deviceToken||'').length>=16;

      setFocus(publish,false); setFocus(adopt,false);

      if(initialized){
        guard.className='v15d2-guard ready';
        guard.innerHTML='<strong>Este aparelho já participa da base compartilhada.</strong>Publicar ou adotar novamente fica bloqueado para evitar substituir a referência por engano. Use “Sincronizar agora” para operação normal.';
        setDisabled(publish,true,'Este aparelho já participa da base compartilhada.');
        setDisabled(adopt,true,'Este aparelho já participa da base compartilhada.');
      }else if(hasRemoteBase){
        guard.className='v15d2-guard adopt';
        guard.innerHTML='<strong>Base compartilhada detectada no servidor.</strong>Este é um aparelho novo: adote a base existente. A publicação de uma nova base foi bloqueada para proteger os dados atuais.';
        setDisabled(publish,true,'Já existe uma base compartilhada no servidor.');
        setDisabled(adopt,!configured,'Adotar a base já existente');
        setFocus(adopt,true);
      }else{
        guard.className='v15d2-guard publish';
        guard.innerHTML='<strong>Nenhuma base compartilhada foi detectada ainda.</strong>Somente o aparelho que contém os dados de referência deve publicar a base inicial.';
        setDisabled(publish,!configured,'Publicar este aparelho como base inicial');
        setDisabled(adopt,true,'Ainda não existe base compartilhada para adotar.');
        setFocus(publish,true);
      }

      const runtime=byId('v15Dev2Runtime');
      if(runtime){
        const online=navigator.onLine;
        const next='<span class="v15d2-net '+(online?'':'off')+'">'+(online?'Online':'Offline')+'</span><span>Após alteração: <b>~1,4 s</b> · verificação automática: <b>~15 s</b></span>';
        if(runtime.innerHTML!==next)runtime.innerHTML=next;
      }

      const badge=byId('v14VersionBadge');
      if(badge&&badge.textContent!=='v0.15 DEV.3')badge.textContent='v0.15 DEV.3';
      document.title='Rota 27 Bodega • Comandas v0.15 DEV.3';
      window.ROTA27_SYNC_DEV_VERSION=VERSION;
    } finally { applying=false; }
  }
  function scheduleApply(delay=0){
    clearTimeout(pendingTimer);
    pendingTimer=setTimeout(applyGuard,delay);
  }
  function start(){
    applyGuard();
    // Não observamos class/disabled: isso causava um ciclo de mutações em alguns Androids.
    // Atualizamos em eventos relevantes e em intervalo leve apenas enquanto o sheet está aberto.
    document.addEventListener('click',event=>{
      const t=event.target;
      if(t&&((t.id==='v15SyncConfigBtn')||(t.closest&&t.closest('#v15SyncCard'))||(t.closest&&t.closest('#v15SyncWrap'))))scheduleApply(0);
    },{passive:true});
    window.addEventListener('online',()=>scheduleApply(0));
    window.addEventListener('offline',()=>scheduleApply(0));
    window.addEventListener('storage',event=>{if(event.key===CONFIG_KEY)scheduleApply(0);});
    setInterval(()=>{if(byId('v15SyncWrap')?.classList.contains('open'))applyGuard();},1200);
    console.info('[Rota27] proteção de bootstrap carregada (v0.15 DEV.3).');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
