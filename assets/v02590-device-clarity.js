/* Rota 27 v0.25.90 — clareza da gestão de aparelhos */
(function(){
  'use strict';
  if(window.Rota27V02590DeviceClarity)return;
  const VERSION='0.25.90';
  const clean=(v,max=180)=>String(v??'').trim().replace(/\s+/g,' ').slice(0,max);
  let observer=null;
  let timer=null;

  function ensureLegend(){
    const sheet=document.querySelector('#v02585DeviceWrap .v02585-device-sheet');
    const info=document.querySelector('#v02585DeviceWrap .v02585-device-info');
    if(!sheet||!info||document.getElementById('v02590DeviceLegend'))return;
    const box=document.createElement('div');
    box.id='v02590DeviceLegend';
    box.className='v02585-device-info';
    box.innerHTML='<strong>Como ler:</strong> “Versão do Rota 27” é a release oficial carregada no aparelho. “Última atividade” é o último contato com a sincronização. “Diagnóstico” é a última telemetria do WhatsApp. O código <code>dev_…</code> é apenas o identificador técnico do aparelho.';
    info.insertAdjacentElement('afterend',box);
  }
  function normalize(){
    const wrap=document.getElementById('v02585DeviceWrap');
    if(!wrap?.classList.contains('open'))return;
    ensureLegend();
    const list=document.getElementById('v02585DeviceList');if(!list)return;
    list.querySelectorAll('.v02585-device-row[data-device-row]').forEach(row=>{
      const main=row.querySelector('.v02585-device-main');if(!main)return;
      const small=main.querySelector(':scope > small');
      if(small&&!/^Última atividade:/i.test(clean(small.textContent,200))){
        const raw=clean(small.textContent,200).split('·')[0].trim();
        small.textContent=`Última atividade: ${raw||'aguardando atualização'}`;
      }
      const code=main.querySelector(':scope > code');
      if(code&&!code.previousElementSibling?.classList?.contains('v02590-device-id-label')){
        const label=document.createElement('span');
        label.className='v02590-device-id-label';
        label.textContent='ID técnico';
        label.style.cssText='display:block;margin-top:6px;font-size:12px;font-weight:700;opacity:.65';
        code.insertAdjacentElement('beforebegin',label);
      }
      const legacy=[...main.querySelectorAll('.v02587-version-line')];
      if(legacy.length>1)legacy.slice(0,-1).forEach(n=>n.remove());
    });
    try{window.Rota27V02589DeviceRelease?.refresh?.();}catch{}
    try{window.Rota27V02590UpdateCoordinator?.refresh?.();}catch{}
  }
  function schedule(delay=80){clearTimeout(timer);timer=setTimeout(normalize,delay);}
  function watch(){
    const list=document.getElementById('v02585DeviceList');
    if(!list||observer)return;
    observer=new MutationObserver(()=>schedule(60));
    observer.observe(list,{childList:true,subtree:true});
  }
  function start(){
    ensureLegend();watch();
    document.addEventListener('click',event=>{
      if(event.target.closest?.('#v02585OpenDevices,#v02585RefreshDevices'))setTimeout(()=>{ensureLegend();watch();schedule(100);},150);
    },true);
    document.addEventListener('change',event=>{if(event.target?.id==='v02585ShowRemoved')setTimeout(()=>schedule(100),150);});
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')setTimeout(()=>{ensureLegend();watch();schedule(100);},250);});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
  window.Rota27V02590DeviceClarity={version:VERSION,refresh:normalize};
})();
