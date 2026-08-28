/* Rota 27 v0.25.39 — hotfix do toggle Consumo interno */
(function(){
  'use strict';
  const VERSION='0.25.39';
  let baseOpen=null;

  const byId=id=>document.getElementById(id);

  function installDefensiveStyle(){
    if(byId('v02539InternalToggleHotfixStyle'))return;
    const style=document.createElement('style');
    style.id='v02539InternalToggleHotfixStyle';
    style.textContent='#newCommandWrap.v02537-internal-mode > .sheet.v02537-client-only{display:block!important}';
    document.head.appendChild(style);
  }

  function repairClientOnlyMarkers(){
    const wrap=byId('newCommandWrap');
    if(!wrap)return;

    const sheet=wrap.querySelector(':scope > .sheet')||wrap.querySelector('.sheet');
    sheet?.classList.remove('v02537-client-only');

    const customer=byId('newCustomer')?.closest('.field');
    const whatsapp=byId('newWhatsapp')?.closest('.field');
    const consent=byId('newWhatsappOptIn')?.closest('.wa-consent')||byId('newWhatsappOptIn')?.closest('label');
    const birthday=byId('newBirthDate')?.closest('.field')||byId('v02518NewBirthField');
    const waState=byId('newWaConfigState');

    customer?.classList.add('v02537-client-only');
    whatsapp?.classList.add('v02537-client-only');
    consent?.classList.add('v02537-client-only');
    birthday?.classList.add('v02537-client-only');
    waState?.classList.add('v02537-client-only');

    sheet?.classList.remove('v02537-client-only');
  }

  function patchOpenNewCommand(){
    const current=window.openNewCommandSheet;
    if(typeof current!=='function'||current.__v02539Hotfix)return;
    baseOpen=current;
    const patched=function(){
      const r=baseOpen.apply(this,arguments);
      repairClientOnlyMarkers();
      setTimeout(repairClientOnlyMarkers,0);
      setTimeout(repairClientOnlyMarkers,90);
      return r;
    };
    patched.__v02539Hotfix=true;
    try{window.openNewCommandSheet=patched;}catch{}
    try{openNewCommandSheet=patched;}catch{}
  }

  function onChangeCapture(e){
    if(e?.target?.id==='v02537InternalCheck')repairClientOnlyMarkers();
  }

  function start(){
    installDefensiveStyle();
    repairClientOnlyMarkers();
    patchOpenNewCommand();
    document.addEventListener('change',onChangeCapture,true);
    document.addEventListener('visibilitychange',()=>{
      if(document.visibilityState==='visible'){
        installDefensiveStyle();
        repairClientOnlyMarkers();
        patchOpenNewCommand();
      }
    });
    window.Rota27V02539InternalToggleHotfix={version:VERSION,repair:repairClientOnlyMarkers};
    console.info('[Rota27] v0.25.39 — hotfix Consumo interno: sheet preservada.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
