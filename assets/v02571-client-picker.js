/* Rota 27 v0.25.71 — seletor real/rolável de clientes na Nova comanda */
(function(){
  'use strict';
  const VERSION='0.25.71';
  const byId=id=>document.getElementById(id);
  const api=()=>window.Rota27V017||null;
  const clean=v=>String(v??'').trim().replace(/\s+/g,' ');
  const norm=v=>api()?.norm?.(v)||clean(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');
  const phone=v=>api()?.normalizePhone?.(v)||String(v||'').replace(/\D/g,'');
  const formatPhone=v=>api()?.formatPhone?.(v)||(phone(v)?`+${phone(v)}`:'');
  const esc=v=>api()?.esc?.(v)||String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]||ch));
  let opened=false;
  let syncing=false;

 function sourceClients(){
    let rows=[];
    try{rows=Array.isArray(api()?.clients?.())?api().clients():Array.isArray(state?.clients)?state.clients:[];}catch{}
    const map=new Map();
    for(const raw of rows){
      if(!raw||!clean(raw.name))continue;
      const p=phone(raw.whatsappPhone||'');
      const id=clean(raw.id||'');
      const k=p?`p:${p}`:id?`i:${id}`:`n:${norm(raw.name)}`;
      const old=map.get(k);
      if(!old){map.set(k,raw);continue;}
      const oldSeen=Number(old.lastSeenAt||old.updatedAt||0),newSeen=Number(raw.lastSeenAt||raw.updatedAt||0);
      if(newSeen>=oldSeen)map.set(k,{...old,...raw,id:old.id||raw.id});
    }
    return [...map.values()].sort((a,b)=>String(a.name||'').localeCompare(String(b.name||''),'pt-BR',{sensitivity:'base'}));
  }

  function suppressNative(){
    const input=byId('newCustomer');if(!input)return;
    input.removeAttribute('list');
    input.setAttribute('autocomplete','off');
    input.setAttribute('autocorrect','off');
    input.setAttribute('autocapitalize','words');
    input.setAttribute('spellcheck','false');
    input.setAttribute('aria-autocomplete','list');
    input.setAttribute('aria-controls','v02513ClientPicker');
    input.setAttribute('aria-expanded',opened?'true':'false');
  }

  function ensurePicker(){
    const input=byId('newCustomer');if(!input)return null;
    const field=input.closest('.field')||input.parentElement;if(!field)return null;
    field.classList.add('v02513-client-field','v02571-client-field');
    let picker=byId('v02513ClientPicker');
    if(!picker){
      picker=document.createElement('div');picker.id='v02513ClientPicker';field.appendChild(picker);
    }
    if(picker.dataset.v02571Rebuilt!=='1'){
      const fresh=picker.cloneNode(false);
      fresh.id='v02513ClientPicker';
      fresh.className='v02513-client-picker v02571-client-picker';
      fresh.setAttribute('role','listbox');
      fresh.dataset.v02571Rebuilt='1';
      picker.replaceWith(fresh);picker=fresh;
      picker.addEventListener('click',e=>{
        const btn=e.target.closest?.('[data-v02571-client]');
        if(!btn)return;
        selectClient(btn.dataset.v02571Client);
      });
      picker.addEventListener('touchmove',()=>{}, {passive:true});
    }else picker.classList.add('v02571-client-picker');
    suppressNative();
    return picker;
  }

  function setOpen(value){
    opened=!!value;
    const picker=ensurePicker(),input=byId('newCustomer');
    picker?.classList.toggle('open',opened);
    input?.setAttribute('aria-expanded',opened?'true':'false');
  }

  function matches(c,q){
    const s=clean(q);if(!s)return true;
    const nq=norm(s),digits=s.replace(/\D/g,'');
    return norm(c?.name||'').includes(nq)||(digits&&phone(c?.whatsappPhone||'').includes(digits));
  }

  function render(query){
    const picker=ensurePicker();if(!picker)return;
    const rows=sourceClients().filter(c=>matches(c,query));
    if(syncing){
      picker.innerHTML='<div class="v02571-client-state">Atualizando clientes sincronizados…</div>';
      return;
    }
    if(!sourceClients().length){
      picker.innerHTML='<div class="v02571-client-state">Nenhum cliente cadastrado.</div>';
      return;
    }
    if(!rows.length){
      picker.innerHTML='<div class="v02571-client-state">Nenhum cliente encontrado. Continue digitando para usar um nome novo.</div>';
      return;
    }
    picker.innerHTML=rows.map(c=>`<button type="button" class="v02513-client-option v02571-client-option" role="option" data-v02571-client="${esc(String(c.id||''))}" data-v02571-phone="${esc(phone(c.whatsappPhone||''))}"><span><strong>${esc(c.name||'Cliente')}</strong><small>${esc(c.whatsappPhone?formatPhone(c.whatsappPhone):'Sem WhatsApp cadastrado')}</small></span><span class="v02513-client-badge">Cadastrado</span></button>`).join('');
  }

  function findBySelector(id,phoneValue){
    const rows=sourceClients();
    return rows.find(c=>String(c.id||'')===String(id||''))||rows.find(c=>phoneValue&&phone(c.whatsappPhone||'')===phoneValue)||null;
  }

  function selectClient(id){
    const picker=byId('v02513ClientPicker');
    const btn=picker?.querySelector(`[data-v02571-client="${CSS?.escape?CSS.escape(String(id)):String(id).replace(/"/g,'\\"')}"]`);
    const c=findBySelector(id,btn?.dataset?.v02571Phone||'');if(!c)return;
    const name=byId('newCustomer'),wa=byId('newWhatsapp'),hint=byId('v02513ClientHint');
    if(name){name.value=c.name||'';name.dispatchEvent(new Event('change',{bubbles:true}));}
    if(wa){wa.value=c.whatsappPhone?formatPhone(c.whatsappPhone):'';wa.dispatchEvent(new Event('change',{bubbles:true}));}
    if(hint){hint.textContent=`Cliente cadastrado selecionado${c.whatsappPhone?' • WhatsApp preenchido':''}.`;hint.classList.add('show');}
    setOpen(false);
    try{byId('newCustomer')?.blur();}catch{}
  }

  async function syncThenRender(){
    if(syncing)return;
    syncing=true;render(byId('newCustomer')?.value||'');
    try{const p=api()?.syncDomainNow?.();if(p&&typeof p.then==='function')await p;}catch(err){console.warn('[Rota27 v0.25.71] atualização de clientes:',err);}
    finally{syncing=false;suppressNative();if(opened)render(byId('newCustomer')?.value||'');}
  }

  function bind(){
    const input=byId('newCustomer');if(!input)return false;
    ensurePicker();suppressNative();
    if(input.dataset.v02571Bound==='1')return true;
    input.dataset.v02571Bound='1';
    input.addEventListener('focus',()=>{suppressNative();setOpen(true);render(input.value);syncThenRender();});
    input.addEventListener('input',()=>{suppressNative();setOpen(true);render(input.value);});
    input.addEventListener('click',()=>{suppressNative();setOpen(true);render(input.value);});
    input.addEventListener('keydown',e=>{if(e.key==='Escape')setOpen(false);});
    document.addEventListener('click',e=>{
      if(e.target.closest?.('#newCustomer,#v02513ClientPicker'))return;
      if(!e.target.closest?.('.v02571-client-field'))setOpen(false);
    });
    return true;
  }

  function refresh(){
    bind();suppressNative();
    if(opened)render(byId('newCustomer')?.value||'');
  }

  function start(){
    bind();suppressNative();
    window.addEventListener('rota27:v017-domain-updated',()=>{suppressNative();if(opened)render(byId('newCustomer')?.value||'');});
    window.addEventListener('storage',()=>{suppressNative();if(opened)render(byId('newCustomer')?.value||'');});
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refresh();});
    document.addEventListener('click',e=>{if(e.target.closest?.('#fabNew,#commandsEmpty [onclick*="openNewCommandSheet"]'))setTimeout(()=>{bind();suppressNative();},0);});
    window.Rota27V02571ClientPicker={version:VERSION,refresh,render,clients:sourceClients};
    console.info('[Rota27] v0.25.71 — seletor rolável de clientes sincronizados ativo.');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
