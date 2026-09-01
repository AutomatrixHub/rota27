/* Rota 27 v0.25.91 — fechamento fixo em Clientes e Cardápio */
(function(){
  'use strict';
  if(window.Rota27V02591FloatingClose)return;

  const VERSION='0.25.91';
  let clientSheet=null;
  let raf=0;

  function byId(id){return document.getElementById(id);}
  function visible(el){
    if(!el||!el.isConnected)return false;
    try{
      const style=getComputedStyle(el);
      if(style.display==='none'||style.visibility==='hidden'||Number(style.opacity)===0)return false;
      const r=el.getBoundingClientRect();
      return r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight;
    }catch{return false;}
  }
  function fullyVisible(el){
    if(!visible(el))return false;
    const r=el.getBoundingClientRect();
    return r.top>=8&&r.left>=0&&r.bottom<=innerHeight-8&&r.right<=innerWidth;
  }
  function blockingOverlayOpen(){
    return [...document.querySelectorAll('.sheet-wrap.open,[id$="Overlay"].open,[role="dialog"][aria-modal="true"]')]
      .some(el=>el.id!=='v017ClientsWrap'&&visible(el));
  }
  function ensureButtons(){
    if(!byId('v02591MenuClose')){
      const btn=document.createElement('button');
      btn.type='button';
      btn.id='v02591MenuClose';
      btn.className='v02591-floating-close';
      btn.setAttribute('aria-label','Fechar Cardápio e voltar para Comandas');
      btn.title='Fechar Cardápio';
      btn.textContent='×';
      document.body.appendChild(btn);
    }
    if(!byId('v02591ClientsClose')){
      const btn=document.createElement('button');
      btn.type='button';
      btn.id='v02591ClientsClose';
      btn.className='v02591-floating-close';
      btn.setAttribute('aria-label','Fechar Clientes');
      btn.title='Fechar Clientes';
      btn.textContent='×';
      document.body.appendChild(btn);
    }
  }
  function attachClientScroll(){
    const next=document.querySelector('#v017ClientsWrap .v017-sheet');
    if(next===clientSheet)return;
    if(clientSheet)clientSheet.removeEventListener('scroll',schedule);
    clientSheet=next||null;
    if(clientSheet)clientSheet.addEventListener('scroll',schedule,{passive:true});
  }
  function menuShouldShow(){
    const screen=byId('screenMenu');
    return !!screen?.classList.contains('active')&&!blockingOverlayOpen();
  }
  function clientsShouldShow(){
    const wrap=byId('v017ClientsWrap');
    if(!wrap?.classList.contains('open')||!visible(wrap))return false;
    const original=byId('v017ClientsClose');
    return !fullyVisible(original);
  }
  function update(){
    raf=0;
    ensureButtons();
    attachClientScroll();
    byId('v02591MenuClose')?.classList.toggle('show',menuShouldShow());
    byId('v02591ClientsClose')?.classList.toggle('show',clientsShouldShow());
  }
  function schedule(){
    if(raf)return;
    raf=requestAnimationFrame(update);
  }
  function closeMenu(){
    const nav=byId('navCommands');
    if(nav){nav.click();return;}
    try{if(typeof showScreen==='function')showScreen('commands');}catch{}
  }
  function closeClients(){
    const original=byId('v017ClientsClose');
    if(original){original.click();return;}
    byId('v017ClientsWrap')?.classList.remove('open');
  }

  document.addEventListener('click',event=>{
    if(event.target.closest?.('#v02591MenuClose')){
      event.preventDefault();event.stopPropagation();closeMenu();setTimeout(schedule,40);return;
    }
    if(event.target.closest?.('#v02591ClientsClose')){
      event.preventDefault();event.stopPropagation();closeClients();setTimeout(schedule,40);return;
    }
    if(event.target.closest?.('.navbtn,#v017ClientsBtn,#v017ClientsClose,.sheet-wrap,[data-screen]'))setTimeout(schedule,60);
  },true);
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule,{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')setTimeout(schedule,80);});
  window.addEventListener('rota27:test-mode-changed',()=>setTimeout(schedule,80));

  function start(){ensureButtons();attachClientScroll();update();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

  window.Rota27V02591FloatingClose={version:VERSION,refresh:update};
})();
