/* Rota 27 v0.25.13 — seletor pesquisável de cliente na nova comanda */
(function(){
  'use strict';
  const VERSION='0.25.13';
  const release=String(document.querySelector('meta[name="rota27-release-version"]')?.content||'');
  const parts=release.split('.').map(v=>Number(v)||0);
  const modern=(parts[0]>0)||(parts[1]>25)||(parts[1]===25&&parts[2]>=71);
  if(modern){
    const refresh=()=>window.Rota27V02571ClientPicker?.refresh?.()||window.Rota27V02572ClientPicker?.refresh?.();
    window.Rota27V02513ClientPicker={version:VERSION,legacyDisabled:true,refresh};
    console.info('[Rota27] v0.25.13 em modo compatibilidade — seletor legado desativado.');
    return;
  }
  const byId=id=>document.getElementById(id);
  const api=()=>window.Rota27V017||null;
  const clean=v=>String(v??'').trim().replace(/\s+/g,' ');
  const norm=v=>api()?.norm?.(v)||clean(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');
  const esc=v=>api()?.esc?.(v)||String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
  const phone=v=>api()?.normalizePhone?.(v)||String(v||'').replace(/\D/g,'');
  const formatPhone=v=>api()?.formatPhone?.(v)||(phone(v)?`+${phone(v)}`:'');
  let current=[];
  let open=false;

  function clients(){
    try{return Array.isArray(api()?.clients?.())?api().clients():Array.isArray(state?.clients)?state.clients:[];}catch{return [];}
  }
  function matches(c,q){
    if(!q)return true;
    const nq=norm(q),digits=String(q||'').replace(/\D/g,'');
    return norm(c?.name||'').includes(nq)||(digits&&phone(c?.whatsappPhone||'').includes(digits));
  }
  function ensureUi(){
    const input=byId('newCustomer');if(!input)return false;
    const field=input.closest('.field')||input.parentElement;if(!field)return false;
    field.classList.add('v02513-client-field');
    input.removeAttribute('list');
    input.setAttribute('autocomplete','off');
    input.setAttribute('aria-autocomplete','list');
    input.setAttribute('aria-controls','v02513ClientPicker');
    input.setAttribute('aria-expanded',open?'true':'false');
    let picker=byId('v02513ClientPicker');
    if(!picker){
      picker=document.createElement('div');picker.id='v02513ClientPicker';picker.className='v02513-client-picker';picker.setAttribute('role','listbox');field.appendChild(picker);
    }
    let hint=byId('v02513ClientHint');
    if(!hint){hint=document.createElement('div');hint.id='v02513ClientHint';hint.className='v02513-client-hint';field.appendChild(hint);}
    if(input.dataset.v02513Bound!=='1')bind(input,picker,hint);
    return true;
  }
  function setOpen(value){open=!!value;const picker=byId('v02513ClientPicker'),input=byId('newCustomer');picker?.classList.toggle('open',open);input?.setAttribute('aria-expanded',open?'true':'false');}
  function render(query=''){
    if(!ensureUi())return;
    const picker=byId('v02513ClientPicker');if(!picker)return;
    current=clients().slice().filter(c=>matches(c,query)).sort((a,b)=>String(a.name||'').localeCompare(String(b.name||''),'pt-BR')).slice(0,10);
    if(!clients().length){picker.innerHTML='<div class="v02513-client-empty">Nenhum cliente cadastrado ainda.</div>';return;}
    if(!current.length){picker.innerHTML='<div class="v02513-client-empty">Nenhum cliente encontrado. Continue digitando para criar uma comanda com um nome novo.</div>';return;}
    picker.innerHTML=current.map((c,i)=>`<button type="button" class="v02513-client-option" role="option" data-v02513-client="${esc(String(c.id||i))}"><span><strong>${esc(c.name||'Cliente')}</strong><small>${esc(c.whatsappPhone?formatPhone(c.whatsappPhone):'Sem WhatsApp cadastrado')}</small></span><span class="v02513-client-badge">Cadastrado</span></button>`).join('');
  }
  function selectClient(id){
    const c=clients().find(x=>String(x.id)===String(id));if(!c)return;
    const name=byId('newCustomer'),wa=byId('newWhatsapp'),hint=byId('v02513ClientHint');
    if(name){name.value=c.name||'';name.dispatchEvent(new Event('change',{bubbles:true}));}
    if(wa&&c.whatsappPhone){wa.value=formatPhone(c.whatsappPhone);wa.dispatchEvent(new Event('change',{bubbles:true}));}
    if(hint){hint.textContent=`Cliente cadastrado selecionado${c.whatsappPhone?' • WhatsApp preenchido':''}.`;hint.classList.add('show');}
    setOpen(false);
  }
  function clearHintIfChanged(){
    const input=byId('newCustomer'),hint=byId('v02513ClientHint');if(!input||!hint)return;
    const exact=clients().some(c=>norm(c.name)===norm(input.value));if(!exact)hint.classList.remove('show');
  }
  function bind(input,picker,hint){
    input.dataset.v02513Bound='1';
    input.addEventListener('focus',()=>{render(input.value);setOpen(true);});
    input.addEventListener('input',()=>{clearHintIfChanged();render(input.value);setOpen(true);});
    input.addEventListener('keydown',e=>{
      if(e.key==='Escape'){setOpen(false);return;}
      if(e.key==='Enter'&&open&&current.length===1){e.preventDefault();selectClient(current[0].id);}
    });
    picker.addEventListener('pointerdown',e=>{
      const btn=e.target.closest?.('[data-v02513-client]');if(!btn)return;e.preventDefault();selectClient(btn.dataset.v02513Client);
    });
    document.addEventListener('pointerdown',e=>{if(!e.target.closest?.('.v02513-client-field'))setOpen(false);});
    const wrap=byId('newCommandWrap');wrap?.addEventListener('click',e=>{if(e.target===wrap)setOpen(false);});
  }
  function refresh(){if(!ensureUi())return;const input=byId('newCustomer');if(open&&input)render(input.value);}
  function handleOpenClick(e){
    if(e.target.closest?.('.fab,#v0252MapAddMesa,#v0252MapAddCounter,#v0252MapAddParklet,#v0252MapAddClient'))setTimeout(refresh,80);
  }
  function start(){
    setTimeout(refresh,180);
    document.addEventListener('click',handleOpenClick);
    window.addEventListener('rota27:v017-domain-updated',refresh);
    window.addEventListener('storage',refresh);
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refresh();});
    window.Rota27V02513ClientPicker={version:VERSION,refresh};
    console.info('[Rota27] v0.25.13 — seletor de cliente carregado.');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
