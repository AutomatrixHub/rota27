/* Rota 27 v0.25.70 — abertura canônica de Nova comanda */
(function(){
  'use strict';
  const VERSION='0.25.70';
  const byId=id=>document.getElementById(id);
  let previousOpen=null;

  function identity(){
    document.title=`Rota 27 Bodega • Comandas v${VERSION}`;
    const meta=document.querySelector('meta[name="rota27-release-version"]');if(meta)meta.content=VERSION;
    let style=byId('v02570ReleaseIdentity');
    if(!style){style=document.createElement('style');style.id='v02570ReleaseIdentity';document.head.appendChild(style);}
    style.textContent=`#v14VersionBadge::after{content:"v${VERSION}"!important}`;
  }

  function resetInternalMode(){
    const wrap=byId('newCommandWrap'),check=byId('v02537InternalCheck'),table=byId('newTable');
    if(check)check.checked=false;
    wrap?.classList.remove('v02537-internal-mode');
    if(table)delete table.dataset.v02537Previous;
  }

  function canonicalOpen(){
    const wrap=byId('newCommandWrap');
    if(!wrap)return false;
    const table=byId('newTable'),customer=byId('newCustomer'),phone=byId('newWhatsapp'),opt=byId('newWhatsappOptIn'),birth=byId('newBirthDate');
    if(table)table.value='';
    if(customer)customer.value='';
    if(phone)phone.value='';
    if(opt)opt.checked=false;
    if(birth)birth.value='';
    resetInternalMode();
    wrap.querySelectorAll('[autofocus]').forEach(el=>el.removeAttribute('autofocus'));
    try{if(typeof updateWhatsappConfigUI==='function')updateWhatsappConfigUI();}catch(err){console.warn('[Rota27 v0.25.70] WhatsApp UI:',err);}
    wrap.classList.add('open');
    const active=document.activeElement;
    if(active&&active!==document.body&&wrap.contains(active)&&typeof active.blur==='function')active.blur();
    return true;
  }

  function rootedOpen(){
    const wrap=byId('newCommandWrap');
    let opened=false;
    if(typeof previousOpen==='function'){
      try{previousOpen.apply(this,arguments);opened=!!wrap?.classList.contains('open');}
      catch(err){console.warn('[Rota27 v0.25.70] opener legado falhou; usando abertura canônica.',err);}
    }
    if(!opened)opened=canonicalOpen();
    if(opened){
      const active=document.activeElement;
      if(active&&active!==document.body&&wrap?.contains(active)&&typeof active.blur==='function')active.blur();
    }
    return opened;
  }
  rootedOpen.__v02570Root=true;
  rootedOpen.__v02555FocusRoot=true;
  rootedOpen.__v02554NoAutofocus=true;
  rootedOpen.__v02539Hotfix=true;

  function install(){
    const current=window.openNewCommandSheet;
    if(current===rootedOpen)return true;
    if(typeof current==='function'&&current.__v02570Root!==true)previousOpen=current;
    try{window.openNewCommandSheet=rootedOpen;}catch{}
    try{openNewCommandSheet=rootedOpen;}catch{}
    return true;
  }

  function isTrigger(target){
    return !!target?.closest?.('#fabNew,#commandsEmpty [onclick*="openNewCommandSheet"],[data-v02570-new-command]');
  }

  function capture(e){
    if(!isTrigger(e.target))return;
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
    install();
    if(!rootedOpen()){
      try{typeof showToast==='function'&&showToast('Não foi possível abrir Nova comanda.',false);}catch{}
    }
  }

  function start(){
    identity();install();
    document.addEventListener('click',capture,true);
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){identity();install();}});
    window.Rota27V02570NewCommand={version:VERSION,refresh:install,open:rootedOpen,canonicalOpen};
    console.info('[Rota27] v0.25.70 — abertura canônica de Nova comanda ativa.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
