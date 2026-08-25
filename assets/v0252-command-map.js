/* Rota 27 v0.25.2 — Mapa Rápido de Comandas */
(function(){
  'use strict';

  const VERSION='0.25.2';
  const VIEW_KEY='rota27_command_view_v0252';
  const ZONES=[
    {key:'tables',label:'Mesas',icon:'▦'},
    {key:'counter',label:'Balcão',icon:'▰'},
    {key:'parklet',label:'Parklet',icon:'▱'},
    {key:'clients',label:'Clientes',icon:'●'},
    {key:'other',label:'Outros locais',icon:'◇'}
  ];

  let baseRenderCommands=null;

  function byId(id){return document.getElementById(id);}
  function clean(v,max=180){return String(v??'').replace(/[\u0000-\u001f\u007f]/g,' ').trim().replace(/\s+/g,' ').slice(0,max);}
  function norm(v){return clean(v,300).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');}
  function esc(v){
    if(typeof escapeHtml==='function')return escapeHtml(String(v??''));
    return String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }
  function moneyValue(v){
    try{return typeof money==='function'?money(Number(v||0)):Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}catch{return 'R$ 0,00';}
  }
  function itemCount(c){
    try{return typeof commandItems==='function'?Number(commandItems(c)||0):Object.values(c?.items||{}).reduce((s,q)=>s+Math.max(0,Number(q||0)),0);}catch{return 0;}
  }
  function totalValue(c){
    try{return typeof commandTotal==='function'?Number(commandTotal(c)||0):0;}catch{return 0;}
  }
  function elapsedValue(ts){
    try{return typeof elapsed==='function'?elapsed(Number(ts||0)):'';}catch{return '';}
  }
  function toast(message){try{if(typeof window.showToast==='function')window.showToast(message,false);}catch{}}
  function commands(){
    try{return Array.isArray(state?.commands)?state.commands.filter(c=>c?.cancelled!==true):[];}catch{return [];}
  }
  function getView(){
    try{return localStorage.getItem(VIEW_KEY)==='map'?'map':'list';}catch{return 'list';}
  }
  function setView(view){
    const next=view==='map'?'map':'list';
    try{localStorage.setItem(VIEW_KEY,next);}catch{}
    applyView(next);
    if(next==='map')renderMap();
  }

  function zoneKey(c){
    const location=clean(c?.table||'',120);
    const n=norm(location);
    if(/^mesa\b/.test(n)||/^m\s*\d+\b/.test(n))return 'tables';
    if(/^balcao\b/.test(n)||n==='bar'||/^bar\b/.test(n))return 'counter';
    if(/^parklet\b/.test(n)||/^p\s*\d+\b/.test(n))return 'parklet';
    if(!location&&clean(c?.customer||'',120))return 'clients';
    return location?'other':'clients';
  }
  function numberIn(v){
    const m=clean(v,80).match(/(\d+)/);return m?Number(m[1]):9999;
  }
  function sortZoneRows(a,b){
    const za=zoneKey(a),zb=zoneKey(b);
    if((za==='tables'&&zb==='tables')||(za==='parklet'&&zb==='parklet')){
      const d=numberIn(a?.table)-numberIn(b?.table);if(d)return d;
    }
    const la=clean(a?.table||a?.customer||'',120),lb=clean(b?.table||b?.customer||'',120);
    return la.localeCompare(lb,'pt-BR',{numeric:true,sensitivity:'base'});
  }
  function shortLocation(c,zone){
    const location=clean(c?.table||'',100);
    if(zone==='tables'){
      const n=numberIn(location);return Number.isFinite(n)&&n<9999?`M${n}`:(location||'Mesa');
    }
    if(zone==='parklet'){
      const n=numberIn(location);return Number.isFinite(n)&&n<9999?`P${n}`:(location||'Parklet');
    }
    if(zone==='counter')return location||'Balcão';
    if(zone==='clients')return clean(c?.customer||'Cliente',80)||'Cliente';
    return location||clean(c?.customer||'Comanda',80)||'Comanda';
  }
  function secondaryLine(c,zone){
    const customer=clean(c?.customer||'',100),location=clean(c?.table||'',100);
    if(zone==='tables'||zone==='parklet'||zone==='counter')return customer||location;
    if(zone==='clients')return location||'Sem mesa/local';
    return customer||'Comanda aberta';
  }

  function ensureUi(){
    const screen=byId('screenCommands');if(!screen)return false;
    if(!byId('v0252ViewSwitch')){
      const quick=screen.querySelector('.quick-stats');
      const wrap=document.createElement('div');
      wrap.id='v0252ViewSwitch';
      wrap.className='v0252-view-switch';
      wrap.setAttribute('aria-label','Modo de visualização das comandas');
      wrap.innerHTML='<button type="button" data-v0252-view="list" aria-pressed="false"><span>☷</span> Lista</button><button type="button" data-v0252-view="map" aria-pressed="false"><span>▦</span> Mapa</button>';
      if(quick)quick.insertAdjacentElement('afterend',wrap);else screen.prepend(wrap);
    }
    if(!byId('v0252CommandMap')){
      const map=document.createElement('div');
      map.id='v0252CommandMap';
      map.className='v0252-command-map';
      const list=byId('commandList');
      if(list)list.insertAdjacentElement('beforebegin',map);else screen.appendChild(map);
    }
    applyView(getView());
    return true;
  }

  function applyView(view=getView()){
    const screen=byId('screenCommands');if(!screen)return;
    screen.dataset.v0252View=view;
    byId('v0252ViewSwitch')?.querySelectorAll('[data-v0252-view]').forEach(btn=>{
      const active=btn.dataset.v0252View===view;
      btn.classList.toggle('active',active);
      btn.setAttribute('aria-pressed',active?'true':'false');
    });
  }

  function quickNewHtml(){
    return `<div class="v0252-quick-new" aria-label="Abertura rápida">
      <button type="button" data-v0252-new-zone="tables"><span>＋</span>Mesa</button>
      <button type="button" data-v0252-new-zone="counter"><span>＋</span>Balcão</button>
      <button type="button" data-v0252-new-zone="parklet"><span>＋</span>Parklet</button>
      <button type="button" data-v0252-new-zone="clients"><span>＋</span>Cliente</button>
    </div>`;
  }

  function cardHtml(c,zone){
    const title=shortLocation(c,zone);
    const secondary=secondaryLine(c,zone);
    const count=itemCount(c);
    const openFor=elapsedValue(c?.createdAt);
    const updated=elapsedValue(c?.updatedAt);
    const id=clean(c?.id,160);
    return `<button type="button" class="v0252-slot v0252-zone-${esc(zone)}" data-v0252-command="${esc(id)}" aria-label="Abrir ${esc(title)}">
      <span class="v0252-slot-top"><strong>${esc(title)}</strong><b>${esc(moneyValue(totalValue(c)))}</b></span>
      <span class="v0252-slot-secondary">${esc(secondary)}</span>
      <span class="v0252-slot-meta"><i></i>${esc(`${count} ${count===1?'item':'itens'}`)}${openFor?` • ${esc(openFor)}`:''}</span>
      <span class="v0252-slot-updated">${updated?`Último: ${esc(updated)}`:'Toque para abrir'}</span>
    </button>`;
  }

  function zoneHtml(zone,rows){
    if(!rows.length)return '';
    return `<section class="v0252-zone" data-zone="${esc(zone.key)}">
      <div class="v0252-zone-head"><div><span>${zone.icon}</span><strong>${esc(zone.label)}</strong></div><small>${rows.length}</small></div>
      <div class="v0252-zone-grid">${rows.map(c=>cardHtml(c,zone.key)).join('')}</div>
    </section>`;
  }

  function openCommandById(id){
    const wanted=clean(id,180);
    if(!wanted)return false;
    const exists=commands().some(c=>String(c?.id)===String(wanted));
    if(!exists){
      toast('Esta comanda não está mais aberta. Atualizei o mapa.');
      renderMap();
      return false;
    }
    try{
      if(typeof window.openCommand==='function'){
        window.openCommand(wanted);
        return true;
      }
    }catch(err){
      console.error('[Rota27 v0.25.2] Falha ao abrir comanda pelo mapa:',err);
    }
    toast('Não foi possível abrir esta comanda. Tente pela Lista.');
    return false;
  }

  function bindMapButtons(host){
    if(!host)return;
    host.querySelectorAll('[data-v0252-command]').forEach(btn=>{
      btn.addEventListener('click',event=>{
        event.preventDefault();
        event.stopPropagation();
        openCommandById(btn.dataset.v0252Command||'');
      });
    });
    host.querySelectorAll('[data-v0252-new-zone]').forEach(btn=>{
      btn.addEventListener('click',event=>{
        event.preventDefault();
        event.stopPropagation();
        openNewFor(btn.dataset.v0252NewZone||'');
      });
    });
  }

  function renderMap(){
    if(!ensureUi())return;
    const host=byId('v0252CommandMap');if(!host)return;
    const rows=commands().slice().sort(sortZoneRows);
    const grouped=Object.fromEntries(ZONES.map(z=>[z.key,[]]));
    rows.forEach(c=>(grouped[zoneKey(c)]||grouped.other).push(c));
    const zones=ZONES.map(z=>zoneHtml(z,grouped[z.key])).join('');
    host.innerHTML=`
      <div class="v0252-map-intro"><div><strong>Mapa rápido</strong><small>Encontre a comanda pela mesa, balcão, parklet ou cliente.</small></div><span>${rows.length} aberta${rows.length===1?'':'s'}</span></div>
      ${quickNewHtml()}
      ${rows.length?zones:'<div class="v0252-map-empty"><strong>Nenhuma comanda aberta</strong><span>Use um dos atalhos acima para abrir a primeira.</span></div>'}`;
    bindMapButtons(host);
  }

  function openNewFor(zone){
    try{if(typeof window.openNewCommandSheet!=='function')return;window.openNewCommandSheet();}catch{return;}
    setTimeout(()=>{
      const table=byId('newTable'),customer=byId('newCustomer');
      if(!table||!customer)return;
      if(zone==='counter'){table.value='Balcão';customer.focus();return;}
      if(zone==='tables'){table.value='Mesa ';table.focus();try{table.setSelectionRange(table.value.length,table.value.length);}catch{}return;}
      if(zone==='parklet'){table.value='Parklet ';table.focus();try{table.setSelectionRange(table.value.length,table.value.length);}catch{}return;}
      table.value='';customer.focus();
    },130);
  }

  function patchRender(){
    if(baseRenderCommands||typeof window.renderCommands!=='function')return false;
    baseRenderCommands=window.renderCommands;
    const patched=function(){
      const result=baseRenderCommands.apply(this,arguments);
      try{ensureUi();renderMap();applyView(getView());}catch(err){console.warn('[Rota27 v0.25.2] Falha ao atualizar mapa:',err);}
      return result;
    };
    try{window.renderCommands=patched;}catch{}
    try{renderCommands=patched;}catch{}
    return true;
  }

  function injectHelp(){
    const overlay=byId('r27HelpOverlay');
    const content=overlay?.querySelector('.r27-help-content');
    if(!content)return false;
    if(!byId('r27-help-mapa-comandas-v0252')){
      const section=document.createElement('details');
      section.id='r27-help-mapa-comandas-v0252';
      section.className='r27-help-section';
      section.innerHTML='<summary><span class="r27-help-section-icon">▦</span><span><strong>Mapa rápido de comandas</strong><small>Outra forma de encontrar uma mesa, balcão, parklet ou cliente sem rolar a lista.</small></span><span class="r27-help-chevron">⌄</span></summary><div class="r27-help-section-body"><p>Na tela <strong>Comandas</strong>, use o seletor <strong>Lista / Mapa</strong>. A Lista continua igual à versão anterior; o Mapa organiza apenas as comandas abertas em grupos compactos.</p><h4>Como o mapa organiza</h4><p><strong>Mesas</strong>, <strong>Balcão</strong>, <strong>Parklet</strong>, <strong>Clientes</strong> sem mesa/local e <strong>Outros locais</strong>. Basta tocar em um bloco para abrir a comanda.</p><h4>Abertura rápida</h4><p>No topo do Mapa existem atalhos <strong>+ Mesa</strong>, <strong>+ Balcão</strong>, <strong>+ Parklet</strong> e <strong>+ Cliente</strong>. Eles abrem a mesma tela segura de Nova comanda, apenas adiantando o contexto.</p><div class="r27-help-tip"><strong>Importante:</strong> o Mapa não cria uma segunda comanda nem altera a sincronização. É somente outra visualização dos mesmos dados.</div></div>';
      content.appendChild(section);
    }
    const footer=overlay.querySelector('.r27-help-footer span');
    if(footer)footer.textContent='Ajuda v5.3 • Rota 27 v0.25.2';
    return true;
  }

  function handleClick(e){
    const view=e.target.closest?.('[data-v0252-view]');
    if(view){setView(view.dataset.v0252View);return;}
    const command=e.target.closest?.('[data-v0252-command]');
    if(command){openCommandById(command.dataset.v0252Command||'');return;}
    const add=e.target.closest?.('[data-v0252-new-zone]');
    if(add){openNewFor(add.dataset.v0252NewZone);return;}
    if(e.target.closest?.('#navCommands'))setTimeout(()=>{ensureUi();renderMap();applyView(getView());},0);
    if(e.target.closest?.('#r27HelpBtn,[data-help]'))setTimeout(injectHelp,80);
  }

  function start(){
    ensureUi();
    patchRender();
    renderMap();
    applyView(getView());
    injectHelp();
    document.addEventListener('click',handleClick);
    window.addEventListener('rota27:v017-domain-updated',()=>{renderMap();});
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){renderMap();injectHelp();}});
    window.Rota27V0252={version:VERSION,renderMap,setView,getView,openCommandById};
    console.info('[Rota27] v0.25.2 Mapa Rápido de Comandas carregado (r2).');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
