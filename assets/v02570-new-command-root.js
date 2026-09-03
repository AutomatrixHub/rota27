/* Rota 27 v0.25.70 — abertura canônica de Nova comanda */
(function(){
  'use strict';
  const VERSION='0.25.70';
  const FOCUS_GUARD_MS=260;
  const byId=id=>document.getElementById(id);
  let previousOpen=null;

 function resetInternalMode(){
    const wrap=byId('newCommandWrap'),check=byId('v02537InternalCheck'),table=byId('newTable');
    if(check)check.checked=false;
    wrap?.classList.remove('v02537-internal-mode');
    if(table)delete table.dataset.v02537Previous;
  }

  /*
   * A camada de consumo interno esconde estes campos por classe. Mantemos os
   * marcadores junto da abertura canônica, após a interface do WhatsApp ser
   * atualizada, para não depender do antigo hotfix v0.25.39.
   */
  function markInternalClientFields(){
    const customer=byId('newCustomer')?.closest('.field');
    const whatsapp=byId('newWhatsapp')?.closest('.field');
    const consent=byId('newWhatsappOptIn')?.closest('.wa-consent')||byId('newWhatsappOptIn')?.closest('label');
    const birthday=byId('newBirthDate')?.closest('.field')||byId('v02518NewBirthField');
    const waState=byId('newWaConfigState');
    [customer,whatsapp,consent,birthday,waState].forEach(node=>node?.classList.add('v02537-client-only'));
    (byId('newCommandWrap')?.querySelector(':scope > .sheet')||byId('newCommandWrap')?.querySelector('.sheet'))?.classList.remove('v02537-client-only');
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
    markInternalClientFields();
    wrap.classList.add('open');
    const active=document.activeElement;
    if(active&&active!==document.body&&wrap.contains(active)&&typeof active.blur==='function')active.blur();
    return true;
  }

  function withFocusGuard(fn){
    const proto=window.HTMLElement?.prototype,nativeFocus=proto?.focus;
    if(!proto||typeof nativeFocus!=='function')return fn();
    const guarded=function(){
      const wrap=byId('newCommandWrap');
      if(this?.id==='newTable'&&wrap?.classList.contains('open'))return;
      return nativeFocus.apply(this,arguments);
    };
    try{proto.focus=guarded;}catch{return fn();}
    try{return fn();}
    finally{window.setTimeout(()=>{try{if(proto.focus===guarded)proto.focus=nativeFocus;}catch{}},FOCUS_GUARD_MS);}
  }

  function rootedOpen(){
    const wrap=byId('newCommandWrap');
    let opened=false;
    withFocusGuard(()=>{
      /* A abertura v0.25.70 já incorpora os resets necessários. Não volte a
         chamar a cadeia histórica: wrappers v0.25.37/v0.25.39/v0.25.54 podem
         apontar novamente para rootedOpen e formar recursão no Android. */
      opened=canonicalOpen();
    });
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
    install();
    document.addEventListener('click',capture,true);
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){install();}});
    window.Rota27V02570NewCommand={version:VERSION,refresh:install,open:rootedOpen,canonicalOpen,markInternalClientFields};
    console.info('[Rota27] v0.25.70 — abertura canônica de Nova comanda ativa.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
