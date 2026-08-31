/* Rota 27 v0.25.81 — Visão Gerencial usa o Modo Teste Global */
(function(){
  'use strict';
  if(window.Rota27V02581ManagerBridge)return;
  const byId=id=>document.getElementById(id);
  function api(){return window.Rota27V02581TestMode||null;}
  function ensure(){
    const periods=byId('v020Periods');if(!periods)return false;
    let box=byId('v02581ManagerTestMode');
    if(!box){
      box=document.createElement('div');box.id='v02581ManagerTestMode';box.className='v020-demo-mode v02581-manager-test-mode';
      const legacy=byId('v020DemoMode');
      if(legacy)legacy.insertAdjacentElement('afterend',box);else periods.insertAdjacentElement('afterend',box);
    }
    const on=api()?.isActive?.()===true;
    box.innerHTML=`<div><strong>Modo Teste Global</strong><span>${on?'Ativo em todo o aplicativo. Dados reais preservados; sync e WhatsApp bloqueados.':'Use dados fictícios em todo o aplicativo, mantendo a operação real intacta.'}</span></div><button type="button" data-v02581-manager-toggle>${on?'Voltar aos dados reais':'Ativar Modo Teste'}</button>`;
    return true;
  }
  document.addEventListener('click',event=>{
    const toggle=event.target.closest?.('[data-v02581-manager-toggle]');
    if(toggle){event.preventDefault();const a=api();if(!a)return;if(a.isActive())a.disable(true);else a.enable();setTimeout(ensure,0);return;}
    if(event.target.closest?.('[data-manager],#v020OpenManager,#v020ManagerWrap'))setTimeout(ensure,50);
  });
  window.addEventListener('rota27:test-mode-changed',()=>setTimeout(ensure,0));
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')setTimeout(ensure,50);});
  setTimeout(ensure,180);setTimeout(ensure,700);
  window.Rota27V02581ManagerBridge={version:'0.25.81',refresh:ensure};
})();
