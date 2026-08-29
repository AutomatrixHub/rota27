/* Rota 27 v0.25.64 — estabilidade mobile, FAB e consumo interno */
(function(){
  'use strict';
  const VERSION='0.25.64';
  const INTERNAL_DATE_SENTINEL='0000-00-00';
  let panelScheduled=false;

  const byId=id=>document.getElementById(id);
  const clone=v=>JSON.parse(JSON.stringify(v==null?null:v));
  const moneyValue=v=>{try{return typeof money==='function'?money(Number(v||0)):Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}catch{return 'R$ 0,00';}};
  const toast=msg=>{try{typeof showToast==='function'?showToast(msg,false):window.Rota27V017?.toast?.(msg);}catch{}};

  function dateKey(d=new Date()){
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }
  function validDateKey(v){return /^\d{4}-\d{2}-\d{2}$/.test(String(v||''));}
  function openedAt(c){const t=Number(c?.createdAt||c?.openedAt||0);return Number.isFinite(t)&&t>0?t:Date.now();}
  function isInternal(c){return !!c&&(c.internalConsumption===true||c.nonRevenue===true||String(c.paymentMethod||'')==='Consumo interno'||String(c.internalType||'')==='own_consumption'||String(c.table||'').trim()==='Consumo interno');}
  function activeCommand(){
    try{return (state?.commands||[]).find(c=>String(c?.id||'')===String(activeCommandId||''))||null;}catch{return null;}
  }
  function refTotal(c){
    if(Number.isFinite(Number(c?.internalReferenceTotal)))return Number(c.internalReferenceTotal);
    if(Number.isFinite(Number(c?.referenceTotal)))return Number(c.referenceTotal);
    try{if(typeof commandTotal==='function')return Number(commandTotal(c)||0);}catch{}
    return Object.entries(c?.items||{}).reduce((sum,[id,qty])=>{
      const meta=c?.itemMeta?.[id]||state?.catalog?.find?.(p=>String(p?.id||'')===String(id))||{};
      return sum+Number(qty||0)*Number(meta.price||0);
    },0);
  }
  function units(c){return Object.values(c?.items||{}).reduce((s,q)=>s+Math.max(0,Number(q||0)),0);}

  /*
   * A v0.25.63 normalizava commands + history em todo save(). Em aparelhos
   * móveis com histórico grande isso cria custo repetitivo. Aqui removemos
   * somente aquele wrapper e mantemos a garantia necessária nos comandos
   * abertos, que são poucos e são os únicos que precisam receber businessDate
   * antes do diff/sync.
   */
  function normalizeOpenCommands(){
    let changed=false;
    (Array.isArray(state?.commands)?state.commands:[]).forEach(c=>{
      if(!c||typeof c!=='object')return;
      if(!validDateKey(c.businessDate)){
        const key=dateKey(new Date(openedAt(c)));
        c.businessDate=key;c.operationalDate=key;changed=true;
      }else if(!validDateKey(c.operationalDate)){
        c.operationalDate=c.businessDate;changed=true;
      }
      if(isInternal(c)){
        if(c.internalConsumption!==true){c.internalConsumption=true;changed=true;}
        if(c.nonRevenue!==true){c.nonRevenue=true;changed=true;}
        if(String(c.internalType||'')!=='own_consumption'){c.internalType='own_consumption';changed=true;}
        c.customer='';c.whatsappPhone='';c.whatsappOptIn=false;
      }
    });
    return changed;
  }
  function installLightSave(){
    const current=window.save;
    if(typeof current!=='function')return false;
    if(current.__v02564LightSave===true)return true;
    let base=current;
    if(current.__v02563Operational===true&&typeof current.__v02563Base==='function')base=current.__v02563Base;
    const wrapped=function(){normalizeOpenCommands();return base.apply(this,arguments);};
    wrapped.__v02564LightSave=true;
    wrapped.__v02563Operational=true;
    wrapped.__v02563Base=base;
    try{window.save=wrapped;save=wrapped;}catch{}
    return true;
  }

  /* Reaproveita a ponte estável existente do Painel; não cria outra ponte. */
  function schedulePanelRepair(){
    if(panelScheduled)return;panelScheduled=true;
    const run=()=>{
      panelScheduled=false;
      try{window.Rota27V0252Panel?.normalizePanel?.();}catch{}
      try{window.Rota27V02563Operational?.decoratePanel?.();}catch{}
    };
    if(typeof queueMicrotask==='function')queueMicrotask(run);else Promise.resolve().then(run);
  }
  /* FAB: Lista e Mapa usam a mesma ação real de Nova comanda. */
  function repairCommandsChrome(){
    const commands=byId('screenCommands')?.classList.contains('active');
    const sale=byId('screenSale')?.classList.contains('active');
    const fab=byId('fabNew'),bar=byId('cartbar');
    if(commands){
      bar?.classList.remove('show');
      if(fab){fab.style.display='block';fab.style.pointerEvents='auto';fab.disabled=false;}
    }else if(sale&&fab){fab.style.display='none';}
  }
  function bindFab(){
    const fab=byId('fabNew');if(!fab)return false;
    if(fab.dataset.v02564Bound==='1')return true;
    fab.removeAttribute('onclick');
    fab.addEventListener('click',e=>{
      e.preventDefault();e.stopPropagation();
      repairCommandsChrome();
      const open=window.openNewCommandSheet;
      if(typeof open!=='function'){toast('Não foi possível abrir Nova comanda.');return;}
      try{open();}catch(err){console.error('[Rota27 v0.25.64] Nova comanda:',err);toast('Não foi possível abrir Nova comanda.');}
    });
    fab.dataset.v02564Bound='1';
    return true;
  }

  /* Finalização canônica de consumo interno, independente da ordem dos wrappers. */
  function finalizeInternal(){
    const c=activeCommand();if(!isInternal(c))return false;
    if(units(c)<=0){toast('Lance ao menos um produto antes de finalizar o consumo interno.');return true;}
    const idx=(state?.commands||[]).findIndex(x=>String(x?.id||'')===String(c.id));if(idx<0)return true;
    const now=Date.now(),reference=refTotal(c),operationalDate=validDateKey(c.businessDate)?c.businessDate:dateKey(new Date(openedAt(c)));
    const record={...clone(c),internalConsumption:true,nonRevenue:true,internalType:'own_consumption',internalClosedAt:now,internalBusinessDate:operationalDate,internalReferenceTotal:reference,referenceTotal:reference,operationalClosedAt:now,closedAt:0,businessDate:INTERNAL_DATE_SENTINEL,paymentMethod:'Consumo interno',paymentConfirmedAt:null,total:reference,updatedAt:now,whatsappOptIn:false,whatsappPhone:'',customer:''};
    state.history.unshift(record);state.commands.splice(idx,1);
    try{if(typeof save==='function')save();}catch(err){console.error('[Rota27 v0.25.64] save consumo interno:',err);}
    try{typeof closeSheet==='function'?closeSheet('closeWrap'):byId('closeWrap')?.classList.remove('open');}catch{byId('closeWrap')?.classList.remove('open');}
    try{activeCommandId=null;}catch{}
    try{typeof showScreen==='function'&&showScreen('commands');}catch{}
    repairCommandsChrome();
    toast(`Consumo interno finalizado: ${moneyValue(reference)} em valor de referência, sem faturamento.`);
    try{window.dispatchEvent(new CustomEvent('rota27:v02537-internal-updated',{detail:{commandId:c.id,referenceTotal:reference}}));}catch{}
    const redraw=()=>{try{typeof renderCommands==='function'&&renderCommands();typeof renderHistory==='function'&&renderHistory();}catch{}repairCommandsChrome();};
    if(typeof queueMicrotask==='function')queueMicrotask(redraw);else Promise.resolve().then(redraw);
    return true;
  }
  function installFinalizeRoot(){
    const current=window.finalizeCommand;
    if(typeof current!=='function')return false;
    if(current.__v02564InternalRoot===true)return true;
    const base=current;
    const wrapped=function(){if(isInternal(activeCommand()))return finalizeInternal();return base.apply(this,arguments);};
    wrapped.__v02564InternalRoot=true;wrapped.__v02564Base=base;
    try{window.finalizeCommand=wrapped;finalizeCommand=wrapped;}catch{}
    return true;
  }

  function settle(){
    installLightSave();bindFab();installFinalizeRoot();normalizeOpenCommands();repairCommandsChrome();schedulePanelRepair();
  }
  function delayedSettle(){[0,420,1050].forEach(ms=>setTimeout(settle,ms));}
  function handleClick(e){
    if(e.target.closest?.('#navCommands,[data-v0252-view]'))requestAnimationFrame(repairCommandsChrome);
    if(e.target.closest?.('#navPanel'))requestAnimationFrame(schedulePanelRepair);
  }
  function start(){
    settle();delayedSettle();
    document.addEventListener('click',handleClick);
    ['rota27:v02537-internal-updated','rota27:v017-domain-updated'].forEach(name=>window.addEventListener(name,()=>requestAnimationFrame(()=>{settle();})));
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')requestAnimationFrame(settle);});
    window.Rota27V02564Runtime={version:VERSION,refresh:settle,repairCommandsChrome,finalizeInternal};
    console.info('[Rota27] v0.25.64 — estabilidade mobile, FAB e consumo interno ativos.');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
