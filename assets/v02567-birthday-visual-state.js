/* Rota 27 v0.25.67 — estado visual consistente da automação de aniversário */
(function(){
  'use strict';
  const VERSION='0.25.67';
  const byId=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

  function restoreAutomation(){
    const card=byId('v02557UpcomingBirthdays');
    const api65=window.Rota27V02565BirthdayGreeting;
    if(!card||!api65)return false;
    let automation=byId('v02565BirthdayAutomation');
    if(!automation){
      automation=document.createElement('div');
      automation.id='v02565BirthdayAutomation';
      const counts=card.querySelector('.v02557-counts');
      counts?.insertAdjacentElement('afterend',automation);
    }
    const last=api65.getStatus?.()||null;
    if(!last){
      automation.innerHTML='<strong>Automação de aniversário • 09:30</strong><span>Conferindo elegibilidade e status dos envios.</span><button type="button" id="v02565RefreshBirthday">Atualizar</button>';
      return true;
    }
    const templateStatus=String(last?.template?.status||'').toUpperCase();
    const approved=templateStatus==='APPROVED';
    const count=Number(last?.counts?.authorized||0);
    const sent=Number(last?.counts?.sent||0);
    const failed=Number(last?.counts?.failed||0);
    const summary=approved
      ? `${count} autorizado${count===1?'':'s'} hoje${sent?` • ${sent} enviado${sent===1?'':'s'}`:''}${failed?` • ${failed} falha${failed===1?'':'s'}`:''}`
      : `Template Meta: ${esc(templateStatus||'PENDENTE')}`;
    automation.innerHTML=`<strong>Automação de aniversário • 09:30</strong><span>${summary}</span><button type="button" id="v02565RefreshBirthday">Atualizar</button>`;
    return true;
  }

  function reconcile(){
    const card=byId('v02557UpcomingBirthdays');if(!card)return false;
    const subtitle=card.querySelector('.v02557-subtitle');
    if(subtitle)subtitle.textContent='Parabéns automático às 09:30 no dia do aniversário para clientes autorizados.';
    try{window.Rota27V02566BirthdayEligibility?.refresh?.();}catch{}
    restoreAutomation();
    return true;
  }

  function start(){
    window.addEventListener('rota27:v02557-rendered',reconcile);
    window.addEventListener('rota27:v02565-marketing-consent-updated',()=>requestAnimationFrame(reconcile));
    window.addEventListener('rota27:v02517-birthday-updated',()=>requestAnimationFrame(reconcile));
    document.addEventListener('click',event=>{
      if(event.target.closest?.('#v017ClientsBtn,[data-clients],#v02565RefreshBirthday'))requestAnimationFrame(reconcile);
    });
    document.addEventListener('visibilitychange',()=>{
      if(document.visibilityState==='visible'&&byId('v017ClientsWrap')?.classList.contains('open'))requestAnimationFrame(reconcile);
    });
    requestAnimationFrame(reconcile);
    window.Rota27V02567BirthdayVisualState={version:VERSION,refresh:reconcile};
    console.info('[Rota27] v0.25.67 — estado visual de aniversários ativo.');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
