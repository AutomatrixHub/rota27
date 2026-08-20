/* Rota 27 v0.15 RC.2 — melhorias operacionais de alto retorno
 * 1) evita comandas duplicadas acidentais;
 * 2) retoma a comanda ativa após recarga/reabertura;
 * 3) mantém sync/offline invisível quando saudável e avisa somente em exceções.
 */
(function(){
  'use strict';

  const VERSION='0.15-rc.2';
  const UI_KEY='rota27_ui_resume_v015';
  const SYNC_KEY='rota27_sync_config_v1';
  let baseCreateCommand=null;
  let baseOpenCommand=null;
  let baseShowScreen=null;
  let statusTimer=null;
  let restoring=false;

  function byId(id){return document.getElementById(id);}
  function norm(value){
    return String(value??'')
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .toLocaleLowerCase('pt-BR')
      .replace(/[^a-z0-9]+/g,' ')
      .trim().replace(/\s+/g,' ');
  }
  function readJson(key){try{return JSON.parse(localStorage.getItem(key)||'{}')||{};}catch{return {};}}
  function saveUi(route,commandId=''){
    try{localStorage.setItem(UI_KEY,JSON.stringify({route:String(route||''),commandId:String(commandId||''),savedAt:Date.now()}));}catch{}
  }
  function clearUi(){try{localStorage.removeItem(UI_KEY);}catch{}}

  function findDuplicateOpenCommand(table,customer){
    const t=norm(table), c=norm(customer);
    if(!t||!Array.isArray(window.state?.commands))return null;
    return window.state.commands.find(cmd=>norm(cmd?.table)===t && norm(cmd?.customer)===c)||null;
  }

  function patchCreateCommand(){
    if(baseCreateCommand||typeof window.createCommand!=='function')return;
    baseCreateCommand=window.createCommand;
    window.createCommand=function(){
      const table=byId('newTable')?.value?.trim()||'';
      const customer=byId('newCustomer')?.value?.trim()||'';
      const existing=findDuplicateOpenCommand(table,customer);
      if(existing){
        if(typeof window.closeSheet==='function')window.closeSheet('newCommandWrap');
        if(typeof window.openCommand==='function')window.openCommand(existing.id);
        if(typeof window.showToast==='function')window.showToast('Esta comanda já está aberta. Continuei na comanda existente.',false);
        return;
      }
      return baseCreateCommand.apply(this,arguments);
    };
    try{createCommand=window.createCommand;}catch{}
  }

  function patchNavigation(){
    if(!baseOpenCommand&&typeof window.openCommand==='function'){
      baseOpenCommand=window.openCommand;
      window.openCommand=function(id){
        const result=baseOpenCommand.apply(this,arguments);
        saveUi('sale',id);
        return result;
      };
      try{openCommand=window.openCommand;}catch{}
    }

    if(!baseShowScreen&&typeof window.showScreen==='function'){
      baseShowScreen=window.showScreen;
      window.showScreen=function(name){
        const result=baseShowScreen.apply(this,arguments);
        if(!restoring){
          if(name==='sale')saveUi('sale',window.activeCommandId||'');
          else saveUi(name,'');
        }
        return result;
      };
      try{showScreen=window.showScreen;}catch{}
    }
  }

  function restoreOperationalContext(){
    const saved=readJson(UI_KEY);
    if(saved.route!=='sale'||!saved.commandId)return;
    const exists=Array.isArray(window.state?.commands)&&window.state.commands.some(c=>String(c?.id)===String(saved.commandId));
    if(!exists){clearUi();return;}
    restoring=true;
    try{window.openCommand?.(saved.commandId);}finally{restoring=false;}
  }

  function ensureExceptionBanner(){
    let banner=byId('v15OpsException');
    if(banner)return banner;
    const screen=byId('screenCommands');
    if(!screen)return null;
    banner=document.createElement('div');
    banner.id='v15OpsException';
    banner.className='v15ops-exception';
    banner.hidden=true;
    const stats=screen.querySelector('.quick-stats');
    if(stats)stats.insertAdjacentElement('beforebegin',banner);
    else screen.querySelector('.section-head')?.insertAdjacentElement('afterend',banner);
    return banner;
  }

  function openSync(){
    try{window.showScreen?.('menu');}catch{}
    setTimeout(()=>byId('v15SyncConfigBtn')?.click(),80);
  }

  function renderExceptionBanner(){
    const banner=ensureExceptionBanner();
    if(!banner)return;
    const cfg=readJson(SYNC_KEY);
    const pending=Array.isArray(cfg.outbox)?cfg.outbox.length:0;
    const conflicts=Array.isArray(cfg.conflicts)?cfg.conflicts.length:0;
    const initialized=cfg.enabled===true&&cfg.initialized===true;
    const lastError=String(cfg.lastError||'').trim();
    const stalePending=pending>0 && (!Number(cfg.lastSyncAt)||Date.now()-Number(cfg.lastSyncAt)>30000);

    let kind='',title='',text='',action='';
    if(!navigator.onLine){
      kind='offline';
      title='Sem internet';
      text='Continue trabalhando. Os lançamentos ficam salvos neste aparelho e serão enviados automaticamente quando a conexão voltar.';
    }else if(conflicts>0){
      kind='danger';
      title=conflicts===1?'1 conflito de sincronização':conflicts+' conflitos de sincronização';
      text='Nenhum dado foi descartado silenciosamente. Abra a sincronização para revisar.';
      action='Revisar';
    }else if(initialized&&lastError){
      kind='warn';
      title='Sincronização precisa de atenção';
      text='Os dados locais estão preservados. O sistema continuará tentando enviar automaticamente.';
      action='Ver status';
    }else if(initialized&&stalePending){
      kind='warn';
      title=pending===1?'1 alteração aguardando envio':pending+' alterações aguardando envio';
      text='Os dados estão salvos neste aparelho e serão sincronizados automaticamente.';
      action='Ver status';
    }else if(!initialized){
      kind='warn';
      title='Sincronização não inicializada neste aparelho';
      text='Configure este aparelho antes de usá-lo na operação compartilhada.';
      action='Configurar';
    }

    if(!kind){banner.hidden=true;banner.replaceChildren();return;}
    banner.hidden=false;
    banner.className='v15ops-exception '+kind;
    banner.innerHTML='<div class="v15ops-exception-copy"><strong>'+title+'</strong><span>'+text+'</span></div>'+(action?'<button type="button">'+action+'</button>':'');
    const btn=banner.querySelector('button');
    if(btn)btn.addEventListener('click',openSync,{once:true});
  }

  function applyVersion(){
    const badge=byId('v14VersionBadge');
    if(badge)badge.textContent='v0.15 RC.2';
    document.title='Rota 27 Bodega • Comandas v0.15 RC.2';
    window.ROTA27_SYNC_DEV_VERSION=VERSION;
  }

  function start(){
    patchCreateCommand();
    patchNavigation();
    applyVersion();
    renderExceptionBanner();
    setTimeout(restoreOperationalContext,120);
    clearInterval(statusTimer);
    statusTimer=setInterval(renderExceptionBanner,3000);
    window.addEventListener('online',renderExceptionBanner);
    window.addEventListener('offline',renderExceptionBanner);
    window.addEventListener('storage',event=>{if(event.key===SYNC_KEY)renderExceptionBanner();});
    console.info('[Rota27] melhorias operacionais carregadas (v0.15 RC.2).');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
