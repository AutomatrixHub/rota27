/* Rota 27 v0.25.214 — acabamento do vínculo e convergência de WhatsApp */
(function(){
  'use strict';
  if(window.Rota27V025213EnrollmentCloseWhatsapp)return;

  const VERSION='0.25.214';
  const SYNC_KEY='rota27_sync_config_v1';
  const WA_KEY='rota27_whatsapp_config_v1';
  let observer=null;
  let decorateTimer=null;
  let baseRenderSaleWhatsappStatus=null;
  let patchedRenderSaleWhatsappStatus=null;

  const byId=id=>document.getElementById(id);
  function readJson(key,fallback){try{const value=JSON.parse(localStorage.getItem(key)||'null');return value==null?fallback:value;}catch{return fallback;}}
  function writeJson(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}}
  function syncConfig(){const raw=readJson(SYNC_KEY,{});return raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{};}
  function syncReady(cfg=syncConfig()){
    return cfg.enabled===true&&cfg.initialized===true&&/^https:\/\/.+\/functions\/v1\/rota27-sync\/?$/i.test(String(cfg.functionUrl||''))&&String(cfg.deviceToken||'').length>=16&&!!cfg.deviceId;
  }
  function whatsappUrl(syncUrl){return String(syncUrl||'').replace(/\/rota27-sync\/?$/i,'/rota27-whatsapp');}
  function whatsappReady(value){
    return /^https:\/\/.+\/functions\/v1\/rota27-whatsapp\/?$/i.test(String(value?.functionUrl||''))&&String(value?.deviceToken||'').length>=16;
  }
  function sameWhatsappConfig(a,b){
    return String(a?.functionUrl||'').replace(/\/+$/,'')===String(b?.functionUrl||'').replace(/\/+$/,'')&&String(a?.deviceToken||'')===String(b?.deviceToken||'');
  }

  function refreshWhatsappRuntime(next){
    try{
      if(typeof waConfig!=='undefined'&&!sameWhatsappConfig(waConfig,next))waConfig={functionUrl:next.functionUrl,deviceToken:next.deviceToken};
    }catch{}
    try{if(typeof updateWhatsappConfigUI==='function')updateWhatsappConfigUI();}catch{}
    try{if(typeof renderSale==='function')renderSale();}catch{}
    try{if(typeof renderPanel==='function')renderPanel();}catch{}
  }

  function bootstrapWhatsapp(){
    const sync=syncConfig();if(!syncReady(sync))return false;
    const next={functionUrl:whatsappUrl(sync.functionUrl),deviceToken:String(sync.deviceToken||'')};
    if(!whatsappReady(next))return false;
    const current=readJson(WA_KEY,{}),changed=!sameWhatsappConfig(current,next);
    if(changed&&!writeJson(WA_KEY,next))return false;
    refreshWhatsappRuntime(next);
    if(changed){
      try{if(typeof resumeWhatsappOutbox==='function')resumeWhatsappOutbox();}catch{}
      console.info('[Rota27] WhatsApp convergiu para a credencial ativa deste aparelho.');
    }
    return true;
  }

  function hasCommandItems(c){return Object.values(c?.items||{}).some(value=>Number(value)>0);}
  function hasLocalCustomerRetry(commandId){
    try{return (Array.isArray(state?.whatsappOutbox)?state.whatsappOutbox:[]).some(row=>String(row?.commandId||'')===String(commandId||'')&&['pending','failed','sending'].includes(String(row?.status||'pending')));}catch{return false;}
  }
  function falsePreSendFailure(c){
    if(!c?.whatsappOptIn||String(c.whatsappLastStatus||'')!=='failed'||hasCommandItems(c)||hasLocalCustomerRetry(c.id))return false;
    const error=String(c.whatsappLastError||'').trim();
    return !error||/integra[cç][aã]o(?: whatsapp)? n[aã]o configurada/i.test(error);
  }
  function patchSaleWhatsappStatus(){
    try{
      if(typeof renderSaleWhatsappStatus!=='function')return false;
      if(renderSaleWhatsappStatus===patchedRenderSaleWhatsappStatus)return true;
      baseRenderSaleWhatsappStatus=renderSaleWhatsappStatus;
      patchedRenderSaleWhatsappStatus=function(){
        const result=baseRenderSaleWhatsappStatus.apply(this,arguments);
        try{
          const c=typeof currentCommand==='function'?currentCommand():null;
          if(falsePreSendFailure(c)&&whatsappReady(readJson(WA_KEY,{}))){
            const el=byId('saleWhatsappStatus');
            if(el){el.className='wa-sale-status show off';el.textContent='💬 WhatsApp ativo • aguardando o primeiro lançamento.';}
          }
        }catch{}
        return result;
      };
      try{renderSaleWhatsappStatus=patchedRenderSaleWhatsappStatus;}catch{}
      try{window.renderSaleWhatsappStatus=patchedRenderSaleWhatsappStatus;}catch{}
      return true;
    }catch{return false;}
  }

  function closeJoinGate(){
    const gate=byId('v025211JoinGate');
    if(syncReady()){
      gate?.classList.remove('open');
      return;
    }
    if(history.length>1){history.back();return;}
    try{window.close();}catch{}
    setTimeout(()=>{
      if(document.visibilityState==='visible'){
        const status=byId('v025211JoinStatus');
        if(status){status.className='v025211-status';status.textContent='Este aparelho ainda não está vinculado. Use Voltar do navegador para sair desta tela.';}
      }
    },180);
  }

  function decorateJoinGate(){
    const card=byId('v025211JoinGate')?.querySelector('.v025211-join-card');if(!card)return false;
    if(!byId('v025213JoinClose')){
      const button=document.createElement('button');
      button.type='button';button.id='v025213JoinClose';button.className='v025213-join-close';button.textContent='Fechar';button.setAttribute('aria-label','Fechar vínculo');
      button.addEventListener('click',closeJoinGate);
      card.prepend(button);
    }
    return true;
  }
  function scheduleDecorate(){clearTimeout(decorateTimer);decorateTimer=setTimeout(()=>{decorateJoinGate();patchSaleWhatsappStatus();},20);}

  function refresh(){patchSaleWhatsappStatus();bootstrapWhatsapp();decorateJoinGate();}
  function start(){
    refresh();
    observer=new MutationObserver(scheduleDecorate);observer.observe(document.body,{childList:true,subtree:true});
    window.addEventListener('online',refresh);
    window.addEventListener('storage',event=>{if(!event.key||event.key===SYNC_KEY||event.key===WA_KEY)refresh();});
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refresh();});
    [500,1500,4000].forEach(ms=>setTimeout(refresh,ms));
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
  window.Rota27V025213EnrollmentCloseWhatsapp={version:VERSION,refresh,bootstrapWhatsapp,close:closeJoinGate};
})();
