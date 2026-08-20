/* Rota 27 v0.15 DEV.2 — guardas de bootstrap e status operacional */
(function(){
  'use strict';
  const CONFIG_KEY='rota27_sync_config_v1';
  const VERSION='0.15-dev.2';

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
  function applyGuard(){
    const wrap=byId('v15SyncWrap');
    if(!wrap)return;
    const cfg=readCfg();
    const guard=ensureGuard();
    if(!guard)return;
    const publish=byId('v15PublishBtn');
    const adopt=byId('v15AdoptBtn');
    const initialized=cfg.initialized===true;
    const hasRemoteBase=Number(cfg.latestSnapshotSeq||0)>0;
    const configured=Boolean(cfg.functionUrl)&&String(cfg.deviceToken||'').length>=16;

    [publish,adopt].forEach(b=>b&&b.classList.remove('v15d2-focus'));

    if(initialized){
      guard.className='v15d2-guard ready';
      guard.innerHTML='<strong>Este aparelho já participa da base compartilhada.</strong>Publicar ou adotar novamente fica bloqueado para evitar substituir a referência por engano. Use “Sincronizar agora” para operação normal.';
      if(publish){publish.disabled=true;publish.title='Este aparelho já participa da base compartilhada.';}
      if(adopt){adopt.disabled=true;adopt.title='Este aparelho já participa da base compartilhada.';}
    }else if(hasRemoteBase){
      guard.className='v15d2-guard adopt';
      guard.innerHTML='<strong>Base compartilhada detectada no servidor.</strong>Este é um aparelho novo: adote a base existente. A publicação de uma nova base foi bloqueada para proteger os dados atuais.';
      if(publish){publish.disabled=true;publish.title='Já existe uma base compartilhada no servidor.';}
      if(adopt){adopt.disabled=!configured;adopt.title='Adotar a base já existente';adopt.classList.add('v15d2-focus');}
    }else{
      guard.className='v15d2-guard publish';
      guard.innerHTML='<strong>Nenhuma base compartilhada foi detectada ainda.</strong>Somente o aparelho que contém os dados de referência deve publicar a base inicial.';
      if(publish){publish.disabled=!configured;publish.title='Publicar este aparelho como base inicial';publish.classList.add('v15d2-focus');}
      if(adopt){adopt.disabled=true;adopt.title='Ainda não existe base compartilhada para adotar.';}
    }

    const runtime=byId('v15Dev2Runtime');
    if(runtime){
      const online=navigator.onLine;
      runtime.innerHTML='<span class="v15d2-net '+(online?'':'off')+'">'+(online?'Online':'Offline')+'</span><span>Após alteração: <b>~1,4 s</b> · verificação automática: <b>~15 s</b></span>';
    }

    const badge=byId('v14VersionBadge');
    if(badge)badge.textContent='v0.15 DEV.2';
    document.title='Rota 27 Bodega • Comandas v0.15 DEV.2';
    window.ROTA27_SYNC_DEV_VERSION=VERSION;
  }

  function start(){
    applyGuard();
    const obs=new MutationObserver(()=>applyGuard());
    obs.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','disabled']});
    window.addEventListener('online',applyGuard);
    window.addEventListener('offline',applyGuard);
    setInterval(()=>{if(byId('v15SyncWrap')?.classList.contains('open'))applyGuard();},800);
    console.info('[Rota27] proteção de bootstrap carregada (v0.15 DEV.2).');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
