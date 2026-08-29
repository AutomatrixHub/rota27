/* Rota 27 v0.25.58 — vencimento rápido em A Receber */
(function(){
  'use strict';
  const VERSION='0.25.58';
  const STORE_KEY='rota27_v02512_receivables_v1';
  const OUTBOX_KEY='rota27_v02512_receivable_outbox_v1';
  const SYNC_CONFIG_KEY='rota27_sync_config_v1';
  let selectedDueDate='';
  let lastCommandId='';
  let activeDueReceivableId='';
  let baseFinalize=null;
  let baseRenderPayment=null;

  const byId=id=>document.getElementById(id);
  const api=()=>window.Rota27V02512||null;
  const clean=(v,max=180)=>String(v??'').replace(/[\u0000-\u001f\u007f]/g,' ').trim().replace(/\s+/g,' ').slice(0,max);
  const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const money=v=>{try{return typeof window.money==='function'?window.money(Number(v||0)):Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}catch{return 'R$ 0,00';}};
  const clone=v=>JSON.parse(JSON.stringify(v==null?null:v));
  function readJson(key,fallback){try{const v=JSON.parse(localStorage.getItem(key)||'null');return v==null?fallback:v;}catch{return fallback;}}
  function writeJson(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}}
  function todayIso(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
  function addDaysIso(days){const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()+Number(days||0));return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
  function dateParts(iso){const m=String(iso||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?{y:+m[1],m:+m[2],d:+m[3]}:null;}
  function daysFromToday(iso){const p=dateParts(iso);if(!p)return null;const now=new Date();const a=Date.UTC(now.getFullYear(),now.getMonth(),now.getDate());const b=Date.UTC(p.y,p.m-1,p.d);return Math.round((b-a)/86400000);}
  function dueLabel(iso){
    if(!iso)return'Sem vencimento';const d=daysFromToday(iso);if(d===null)return'Sem vencimento';
    if(d<0)return d===-1?'Vencida ontem':`Vencida há ${Math.abs(d)} dias`;
    if(d===0)return'Vence hoje';if(d===1)return'Vence amanhã';
    const p=dateParts(iso);return `Vence em ${String(p.d).padStart(2,'0')}/${String(p.m).padStart(2,'0')}`;
  }
  function dueClass(iso){const d=daysFromToday(iso);if(d===null)return'none';if(d<0)return'overdue';if(d===0)return'today';return'future';}
  function quickValue(offset){if(offset==='none')return'';return addDaysIso(Number(offset||0));}
  function currentCommandId(){try{return String(activeCommandId||'');}catch{return'';}}

  function ensureCloseQuickDue(){
    const select=byId('v14PaymentMethod');if(!select)return null;
    const commandId=currentCommandId();if(commandId!==lastCommandId){lastCommandId=commandId;selectedDueDate='';}
    let box=byId('v02558CloseDue');
    if(!box){
      box=document.createElement('div');box.id='v02558CloseDue';box.className='v02558-close-due';
      box.innerHTML='<div class="v02558-close-due-head"><strong>Quando pretende receber?</strong><small>Opcional</small></div><div class="v02558-chip-row"><button type="button" data-v02558-close-offset="none">Sem data</button><button type="button" data-v02558-close-offset="0">Hoje</button><button type="button" data-v02558-close-offset="1">Amanhã</button><button type="button" data-v02558-close-offset="7">7 dias</button></div>';
      const field=select.closest('.field')||select.parentElement;field?.insertAdjacentElement('afterend',box);
    }
    const visible=select.value==='A receber';box.hidden=!visible;
    box.querySelectorAll('[data-v02558-close-offset]').forEach(btn=>btn.classList.toggle('active',quickValue(btn.dataset.v02558CloseOffset||'')===selectedDueDate));
    return box;
  }

  function rows(){try{return Array.isArray(api()?.getReceivables?.())?api().getReceivables():[];}catch{return[];}}
  function openRows(){try{return Array.isArray(api()?.getOpenReceivables?.())?api().getOpenReceivables():[];}catch{return[];}}
  function syncConfig(){const c=readJson(SYNC_CONFIG_KEY,{});return c&&typeof c==='object'?c:{};}
  function queueDueUpsert(row){
    const c=syncConfig(),out=readJson(OUTBOX_KEY,[]);if(!Array.isArray(out))return;
    const payload=clone(row);delete payload.payments;
    const stamp=Date.now();out.push({eventId:`receivable_due_${clean(row.id,140)}_${stamp}`,eventType:'receivable_upsert',entityId:String(row.id||''),payload:{receivable:payload},deviceId:c.deviceId||'local',createdAt:new Date(stamp).toISOString(),appVersion:VERSION});
    writeJson(OUTBOX_KEY,out.slice(-500));
  }
  function persistDueDate(receivableId,dueDate){
    const list=readJson(STORE_KEY,[]);if(!Array.isArray(list))return false;
    const idx=list.findIndex(x=>String(x?.id||'')===String(receivableId||''));if(idx<0)return false;
    const stamp=Date.now();list[idx]={...list[idx],dueDate:String(dueDate||''),dueDateUpdatedAt:stamp,updatedAt:Math.max(Number(list[idx]?.updatedAt||0),stamp)};
    if(!writeJson(STORE_KEY,list))return false;
    queueDueUpsert(list[idx]);
    window.dispatchEvent(new CustomEvent('rota27:v02512-receivables-updated',{detail:{receivableId,dueDate:String(dueDate||'')}}));
    try{api()?.refresh?.();}catch{}
    setTimeout(()=>{try{api()?.sync?.();}catch{}},80);
    setTimeout(()=>{try{api()?.sync?.();}catch{}},850);
    return true;
  }
  function applyDueForCommand(commandId,dueDate){
    if(!dueDate)return false;
    const row=rows().find(x=>String(x?.commandId||'')===String(commandId||''));if(!row)return false;
    return persistDueDate(row.id,dueDate);
  }

  function installPaymentHooks(){
    if(typeof window.renderPaymentConfirmation==='function'&&window.renderPaymentConfirmation!==baseRenderPayment&&window.renderPaymentConfirmation.__v02558!==true){
      baseRenderPayment=window.renderPaymentConfirmation;
      const fn=function(){const result=baseRenderPayment.apply(this,arguments);queueMicrotask(ensureCloseQuickDue);return result;};fn.__v02558=true;
      try{window.renderPaymentConfirmation=fn;renderPaymentConfirmation=fn;}catch{}
    }
    if(typeof window.finalizeCommand==='function'&&window.finalizeCommand!==baseFinalize&&window.finalizeCommand.__v02558!==true){
      baseFinalize=window.finalizeCommand;
      const fn=function(){
        const onAccount=byId('v14PaymentMethod')?.value==='A receber',commandId=currentCommandId(),due=selectedDueDate;
        const result=baseFinalize.apply(this,arguments);
        if(onAccount&&commandId&&due)setTimeout(()=>applyDueForCommand(commandId,due),20);
        if(onAccount){selectedDueDate='';lastCommandId='';}
        return result;
      };fn.__v02558=true;
      try{window.finalizeCommand=fn;finalizeCommand=fn;}catch{}
    }
    ensureCloseQuickDue();
  }

  function ensureDueSheet(){
    if(byId('v02558DueWrap'))return;
    const wrap=document.createElement('div');wrap.id='v02558DueWrap';wrap.className='sheet-wrap';
    wrap.innerHTML='<div class="sheet v02558-due-sheet"><div class="handle"></div><div class="v019-head"><div><h3>Vencimento</h3><p class="desc" id="v02558DueSubtitle"></p></div><button type="button" class="v019-x" id="v02558DueX">×</button></div><div class="v02558-due-options"><button type="button" data-v02558-due-offset="none">Sem data</button><button type="button" data-v02558-due-offset="0">Hoje</button><button type="button" data-v02558-due-offset="1">Amanhã</button><button type="button" data-v02558-due-offset="7">7 dias</button></div><small class="v02558-due-note">A data serve apenas como lembrete operacional. Não gera cobrança automática.</small></div>';
    document.body.appendChild(wrap);wrap.addEventListener('click',e=>{if(e.target===wrap)wrap.classList.remove('open');});byId('v02558DueX')?.addEventListener('click',()=>wrap.classList.remove('open'));
  }
  function openDueSheet(id){
    const row=rows().find(x=>String(x?.id||'')===String(id||''));if(!row)return;
    activeDueReceivableId=row.id;ensureDueSheet();byId('v02558DueSubtitle').textContent=`${row.customer||'Cliente'} • ${money(row.balance)}`;
    byId('v02558DueWrap').querySelectorAll('[data-v02558-due-offset]').forEach(btn=>btn.classList.toggle('active',quickValue(btn.dataset.v02558DueOffset||'')===String(row.dueDate||'')));
    byId('v02558DueWrap').classList.add('open');
  }

  function rowPriority(row){const d=daysFromToday(row?.dueDate||'');if(d===null)return[3,999999];if(d<0)return[0,d];if(d===0)return[1,0];return[2,d];}
  function decorateReceivables(){
    const body=byId('v02512ReceivablesBody');if(!body)return false;
    const open=openRows(),map=new Map(open.map(r=>[String(r.id),r]));const list=body.querySelector('.v02512-list');if(!list)return false;
    const domRows=Array.from(list.querySelectorAll('.v02512-row'));
    domRows.forEach(node=>{
      const id=node.querySelector('[data-v02512-pay]')?.getAttribute('data-v02512-pay')||'';const row=map.get(String(id));if(!row)return;
      node.classList.remove('v02558-overdue','v02558-due-today');const cls=dueClass(row.dueDate||'');if(cls==='overdue')node.classList.add('v02558-overdue');if(cls==='today')node.classList.add('v02558-due-today');
      let due=node.querySelector('.v02558-row-due');if(!due){due=document.createElement('button');due.type='button';due.className='v02558-row-due';node.querySelector('.v02512-row-copy')?.appendChild(due);}
      due.dataset.v02558DueId=row.id;due.className=`v02558-row-due ${cls}`;due.textContent=dueLabel(row.dueDate||'');
    });
    domRows.sort((a,b)=>{const ra=map.get(a.querySelector('[data-v02512-pay]')?.getAttribute('data-v02512-pay')||''),rb=map.get(b.querySelector('[data-v02512-pay]')?.getAttribute('data-v02512-pay')||'');const pa=rowPriority(ra),pb=rowPriority(rb);return pa[0]-pb[0]||pa[1]-pb[1]||Number(ra?.openedAt||0)-Number(rb?.openedAt||0);}).forEach(node=>list.appendChild(node));
    return true;
  }
  function decoratePanel(){
    const open=openRows(),overdue=open.filter(r=>daysFromToday(r.dueDate||'')<0),today=open.filter(r=>daysFromToday(r.dueDate||'')===0);const summary=byId('v02512PanelSummary'),btn=byId('v02512Open');if(!summary)return false;
    if(overdue.length){const amount=overdue.reduce((s,r)=>s+Number(r.balance||0),0);summary.innerHTML=`<span class="v02512-dot warn"></span>${esc(`${overdue.length} vencida${overdue.length===1?'':'s'} • ${money(amount)} atrasado`)}`;if(btn)btn.textContent=`Ver ${overdue.length} vencida${overdue.length===1?'':'s'}`;}
    else if(today.length){const amount=today.reduce((s,r)=>s+Number(r.balance||0),0);summary.innerHTML=`<span class="v02512-dot warn"></span>${esc(`${today.length} vence${today.length===1?'':'m'} hoje • ${money(amount)}`)}`;if(btn)btn.textContent=today.length===1?'Ver vencimento':'Ver vencimentos';}
    return true;
  }
  function refresh(){ensureCloseQuickDue();decoratePanel();decorateReceivables();}
  function settle(){[0,80,220].forEach(ms=>setTimeout(refresh,ms));}

  function start(){
    ensureDueSheet();installPaymentHooks();settle();
    document.addEventListener('change',e=>{if(e.target?.id==='v14PaymentMethod'){selectedDueDate='';ensureCloseQuickDue();}});
    document.addEventListener('click',e=>{
      const closeChip=e.target.closest?.('[data-v02558-close-offset]');if(closeChip){selectedDueDate=quickValue(closeChip.dataset.v02558CloseOffset||'');ensureCloseQuickDue();return;}
      const dueBtn=e.target.closest?.('[data-v02558-due-id]');if(dueBtn){openDueSheet(dueBtn.dataset.v02558DueId||'');return;}
      const dueChoice=e.target.closest?.('[data-v02558-due-offset]');if(dueChoice&&activeDueReceivableId){const value=quickValue(dueChoice.dataset.v02558DueOffset||'');persistDueDate(activeDueReceivableId,value);byId('v02558DueWrap')?.classList.remove('open');activeDueReceivableId='';settle();return;}
      if(e.target.closest?.('#v02512Open,#v02512Sync,#v02512Done,[data-v02512-pay]'))settle();
    });
    window.addEventListener('rota27:v02512-receivables-updated',settle);window.addEventListener('storage',settle);
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){installPaymentHooks();settle();}});
    setTimeout(installPaymentHooks,320);
    window.Rota27V02558ReceivableDue={version:VERSION,refresh,getDueDate:id=>rows().find(r=>String(r.id)===String(id))?.dueDate||'',setDueDate:persistDueDate};
    console.info('[Rota27] v0.25.58 — vencimento rápido em A Receber ativo.');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
