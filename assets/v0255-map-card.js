/* Rota 27 v0.25.5 — hierarquia dos cards compactos do Mapa */
(function(){
  'use strict';

  const VERSION='0.25.5';
  let baseRenderCommands=null;

  function byId(id){return document.getElementById(id);}
  function clean(v,max=160){return String(v??'').replace(/[\u0000-\u001f\u007f]/g,' ').trim().replace(/\s+/g,' ').slice(0,max);}
  function commands(){try{return Array.isArray(state?.commands)?state.commands:[];}catch{return [];}}
  function findCommand(id){return commands().find(c=>String(c?.id)===String(id));}
  function zoneOf(btn){
    if(btn.classList.contains('v0252-zone-tables'))return 'tables';
    if(btn.classList.contains('v0252-zone-counter'))return 'counter';
    if(btn.classList.contains('v0252-zone-parklet'))return 'parklet';
    if(btn.classList.contains('v0252-zone-clients'))return 'clients';
    return 'other';
  }
  function numberIn(v){const m=clean(v,80).match(/(\d+)/);return m?Number(m[1]):null;}
  function compactLocation(c,zone){
    const location=clean(c?.table||'',100);
    if(zone==='tables'){
      const n=numberIn(location);return n!=null?`M${n}`:(location||'Mesa');
    }
    if(zone==='parklet'){
      const n=numberIn(location);return n!=null?`P${n}`:(location||'Parklet');
    }
    if(zone==='counter')return location||'Balcão';
    return location;
  }
  function zoneLabel(zone){
    return ({tables:'Mesa',counter:'Balcão',parklet:'Parklet',clients:'Cliente',other:'Outro local'})[zone]||'Comanda';
  }

  function enhanceCard(btn){
    const id=btn?.dataset?.v0252Command||'';
    const c=findCommand(id);if(!btn||!c)return;
    const zone=zoneOf(btn);
    const customer=clean(c.customer||'',100);
    const location=compactLocation(c,zone);
    const titleEl=btn.querySelector('.v0252-slot-top strong');
    const secondaryEl=btn.querySelector('.v0252-slot-secondary');
    if(!titleEl||!secondaryEl)return;

    let title='Comanda',secondary='',role='customer';
    if(zone==='counter'){
      title=customer||location||'Balcão';
      secondary=customer?'Balcão':'Comanda no balcão';
      role='zone';
    }else if(zone==='tables'){
      title=location||'Mesa';
      secondary=customer||'Mesa';
      role=customer?'customer':'zone';
    }else if(zone==='parklet'){
      title=location||'Parklet';
      secondary=customer||'Parklet';
      role=customer?'customer':'zone';
    }else if(zone==='clients'){
      title=customer||'Cliente';
      secondary='Cliente';
      role='zone';
    }else{
      title=location||customer||'Comanda';
      secondary=customer&&customer!==title?customer:zoneLabel(zone);
      role=customer&&customer!==title?'customer':'zone';
    }

    titleEl.textContent=title;
    secondaryEl.textContent=secondary;
    secondaryEl.dataset.v0255Role=role;
    btn.setAttribute('aria-label',`Abrir ${title}${secondary?` • ${secondary}`:''}`);
    btn.dataset.v0255Enhanced='1';
  }

  function enhanceAll(){
    byId('v0252CommandMap')?.querySelectorAll('[data-v0252-command]').forEach(enhanceCard);
  }

  function patchRenderCommands(){
    const current=window.renderCommands;
    if(typeof current!=='function'||current.__r27v0255Map)return false;
    baseRenderCommands=current;
    const patched=function(){
      const result=baseRenderCommands.apply(this,arguments);
      try{enhanceAll();}catch(err){console.warn('[Rota27 v0.25.5] Falha ao refinar Mapa:',err);}
      return result;
    };
    patched.__r27v0255Map=true;
    try{window.renderCommands=patched;}catch{}
    try{renderCommands=patched;}catch{}
    return true;
  }

  function patchMapApi(){
    const api=window.Rota27V0252;
    if(!api||typeof api.renderMap!=='function'||api.renderMap.__r27v0255Map)return false;
    const base=api.renderMap;
    const patched=function(){
      const result=base.apply(this,arguments);
      try{enhanceAll();}catch{}
      return result;
    };
    patched.__r27v0255Map=true;
    api.renderMap=patched;
    return true;
  }

  function handleClick(e){
    if(e.target.closest?.('#navCommands,[data-v0252-view="map"]'))setTimeout(enhanceAll,0);
  }

  function start(){
    patchRenderCommands();
    patchMapApi();
    enhanceAll();
    setTimeout(()=>{patchRenderCommands();patchMapApi();enhanceAll();},120);
    document.addEventListener('click',handleClick);
    window.addEventListener('rota27:v017-domain-updated',enhanceAll);
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')enhanceAll();});
    window.Rota27V0255Map={version:VERSION,enhanceAll};
    console.info('[Rota27] v0.25.5 hierarquia visual do Mapa carregada.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
