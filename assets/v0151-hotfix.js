/* Rota 27 v0.25.196 — corrige endpoint do WhatsApp e adiciona cancelamento seguro de comanda */
(function(){
  'use strict';

  const VERSION='0.25.196';
  const WA_KEY='rota27_whatsapp_config_v1';
  const SYNC_KEY='rota27_sync_config_v1';
  const CORE_KEY='rota27_comandas_v01';
  const CANCEL_QUEUE_KEY='rota27_cancel_outbox_v0151';
  const CANCEL_FLUSH_BATCH=25;
  const STAGE_PREPARED='prepared';
  const STAGE_COMMITTED='committed';
  let baseRenderCommands=null;
  let baseOpenCommand=null;
  let baseRenderSale=null;
  let baseSaveWhatsappConfig=null;
  let cancelFlushing=false;

  function byId(id){return document.getElementById(id);}
  function now(){return Date.now();}
  function appState(){try{return typeof state!=='undefined'?state:null;}catch{return null;}}
  function current(){try{return typeof currentCommand==='function'?currentCommand():null;}catch{return null;}}
  function label(c){try{return typeof commandLabel==='function'?commandLabel(c):[c?.table,c?.customer].filter(Boolean).join(' • ');}catch{return 'Comanda';}}
  function itemCount(c){try{return typeof commandItems==='function'?commandItems(c):Object.values(c?.items||{}).reduce((s,q)=>s+Number(q||0),0);}catch{return 0;}}
  function total(c){try{return typeof commandTotal==='function'?commandTotal(c):0;}catch{return 0;}}
  function moneyValue(v){try{return typeof money==='function'?money(v):Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}catch{return 'R$ 0,00';}}
  function clone(v){return JSON.parse(JSON.stringify(v==null?null:v));}

  function readJson(key,fallback={}){try{return JSON.parse(localStorage.getItem(key)||'')||fallback;}catch{return fallback;}}
  function writeJson(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}}

  function correctWhatsappEndpoint(showFeedback=false){
    try{
      if(typeof waConfig==='undefined'||!waConfig)return false;
      const currentUrl=String(waConfig.functionUrl||'').trim().replace(/\/+$/,'');
      if(!currentUrl)return false;
      let next=currentUrl;
      if(/\/rota27-sync$/i.test(currentUrl)) next=currentUrl.replace(/\/rota27-sync$/i,'/rota27-whatsapp');
      if(next!==currentUrl){
        waConfig={...waConfig,functionUrl:next};
        writeJson(WA_KEY,{functionUrl:next,deviceToken:String(waConfig.deviceToken||'').trim()});
        try{if(typeof updateWhatsappConfigUI==='function')updateWhatsappConfigUI();}catch{}
        try{if(typeof resumeWhatsappOutbox==='function')setTimeout(resumeWhatsappOutbox,300);}catch{}
        if(showFeedback)try{showToast('WhatsApp corrigido neste aparelho.',false);}catch{}
        return true;
      }
    }catch{}
    return false;
  }

  function patchWhatsappConfig(){
    correctWhatsappEndpoint(false);
    if(baseSaveWhatsappConfig||typeof saveWhatsappConfig!=='function')return;
    baseSaveWhatsappConfig=saveWhatsappConfig;
    const patched=function(){
      const input=byId('waFunctionUrl');
      if(input){
        let url=String(input.value||'').trim().replace(/\/+$/,'');
        if(/\/rota27-sync$/i.test(url)){
          url=url.replace(/\/rota27-sync$/i,'/rota27-whatsapp');
          input.value=url;
        }
        if(url&&!/\/functions\/v1\/rota27-whatsapp$/i.test(url)){
          try{showToast('Use a URL da função rota27-whatsapp.',false);}catch{}
          return;
        }
      }
      const result=baseSaveWhatsappConfig.apply(this,arguments);
      setTimeout(()=>correctWhatsappEndpoint(false),0);
      return result;
    };
    try{saveWhatsappConfig=patched;}catch{}
    try{window.saveWhatsappConfig=patched;}catch{}
  }

  function wrapOperationalViews(){
    if(!baseRenderCommands&&typeof renderCommands==='function'){
      baseRenderCommands=renderCommands;
      const patched=function(){
        const s=appState();
        if(!s||!Array.isArray(s.commands))return baseRenderCommands.apply(this,arguments);
        const all=s.commands;
        s.commands=all.filter(c=>c?.cancelled!==true);
        try{return baseRenderCommands.apply(this,arguments);}finally{s.commands=all;}
      };
      try{renderCommands=patched;}catch{}
      try{window.renderCommands=patched;}catch{}
    }
    if(!baseOpenCommand&&typeof openCommand==='function'){
      baseOpenCommand=openCommand;
      const patched=function(id){
        const c=appState()?.commands?.find(x=>String(x?.id)===String(id));
        if(c?.cancelled===true){try{showToast('Esta comanda foi cancelada.',false);}catch{};return;}
        return baseOpenCommand.apply(this,arguments);
      };
      try{openCommand=patched;}catch{}
      try{window.openCommand=patched;}catch{}
    }
    if(!baseRenderSale&&typeof renderSale==='function'){
      baseRenderSale=renderSale;
      const patched=function(){
        const c=current();
        if(c?.cancelled===true){
          try{activeCommandId=null;}catch{}
          try{showScreen('commands');}catch{}
          try{showToast('Esta comanda foi cancelada em outro aparelho.',false);}catch{}
          return;
        }
        return baseRenderSale.apply(this,arguments);
      };
      try{renderSale=patched;}catch{}
      try{window.renderSale=patched;}catch{}
    }
  }

  function ensureCancelConfirm(){
    let wrap=byId('v0151CancelConfirm');
    if(wrap)return wrap;
    wrap=document.createElement('div');
    wrap.id='v0151CancelConfirm';
    wrap.className='sheet-wrap';
    wrap.innerHTML='<div class="sheet"><div class="handle"></div><h3>Cancelar comanda?</h3><p class="desc">Use somente para comandas abertas por engano ou que não devem virar venda.</p><div class="v0151-confirm-copy" id="v0151CancelSummary"></div><div class="sheet-actions"><button type="button" class="secondary" id="v0151KeepCommand">Manter comanda</button><button type="button" class="v0151-confirm-danger" id="v0151ConfirmCancel">Cancelar comanda</button></div></div>';
    document.body.appendChild(wrap);
    wrap.addEventListener('click',e=>{if(e.target===wrap)wrap.classList.remove('open');});
    byId('v0151KeepCommand').addEventListener('click',()=>wrap.classList.remove('open'));
    byId('v0151ConfirmCancel').addEventListener('click',confirmCancel);
    return wrap;
  }

  function ensureCancelButton(){
    const sheet=byId('editCommandWrap')?.querySelector('.sheet');
    if(!sheet||byId('v0151CancelCommandBtn'))return;
    const actions=sheet.querySelector('.sheet-actions');
    if(!actions)return;
    const closeBtn=actions.querySelector('.secondary');
    if(closeBtn&&closeBtn.textContent.trim()==='Cancelar')closeBtn.textContent='Voltar';
    const btn=document.createElement('button');
    btn.type='button';btn.id='v0151CancelCommandBtn';btn.className='v0151-cancel-command';btn.textContent='Cancelar comanda';
    btn.addEventListener('click',openCancelConfirm);
    actions.insertAdjacentElement('beforebegin',btn);
  }

  function openCancelConfirm(){
    const c=current();if(!c)return;
    const wrap=ensureCancelConfirm();
    byId('v0151CancelSummary').innerHTML='<strong>'+String(label(c)||'Comanda')+'</strong>'+itemCount(c)+' '+(itemCount(c)===1?'item':'itens')+' • '+moneyValue(total(c))+'<br><br>Ela sairá das comandas abertas, não entrará no faturamento e nenhum envio pendente de WhatsApp desta comanda será tentado.';
    wrap.classList.add('open');
  }

  function clearWhatsappForCommand(commandId){
    const s=appState();if(!s)return;
    const doomed=(s.whatsappOutbox||[]).filter(b=>String(b?.commandId)===String(commandId));
    doomed.forEach(b=>{try{if(typeof waTimers!=='undefined'){const t=waTimers.get(b.id);if(t)clearTimeout(t);waTimers.delete(b.id);}}catch{}});
    s.whatsappOutbox=(s.whatsappOutbox||[]).filter(b=>String(b?.commandId)!==String(commandId));
  }

  function cancelQueue(){const rows=readJson(CANCEL_QUEUE_KEY,[]);return Array.isArray(rows)?rows:[];}
  function saveCancelQueue(rows){return writeJson(CANCEL_QUEUE_KEY,Array.isArray(rows)?rows:[]);}
  function removeCancelQueueRow(rowId){
    const rows=cancelQueue();
    return saveCancelQueue(rows.filter(row=>String(row?.id||'')!==String(rowId||'')));
  }
  function rowStage(row){
    const stage=String(row?.stage||'');
    if(stage===STAGE_PREPARED||stage===STAGE_COMMITTED)return stage;
    return '';
  }
  function coreCancellationState(commandId){
    const raw=localStorage.getItem(CORE_KEY);
    if(raw==null)return {known:false,committed:false};
    try{
      const core=JSON.parse(raw);
      if(!core||!Array.isArray(core.commands))return {known:false,committed:false};
      const command=core.commands.find(item=>String(item?.id||'')===String(commandId||''));
      return {known:true,committed:!command||command?.cancelled===true};
    }catch{return {known:false,committed:false};}
  }
  function queueCancelPrepared(command,cancelledAt=now()){
    const commandId=String(command?.id||'');
    if(!commandId)return {ok:false,row:null,created:false};
    const rows=cancelQueue();
    const existingIndex=rows.findIndex(row=>String(row?.commandId||'')===commandId);
    if(existingIndex>=0){
      const currentRow=rows[existingIndex];
      if(rowStage(currentRow)===STAGE_COMMITTED)return {ok:true,row:currentRow,created:false};
      const at=Math.max(1,Number(currentRow?.patch?.cancelledAt||cancelledAt||now()));
      const refreshed={
        ...currentRow,
        id:String(currentRow?.id||`cancel_command_${commandId}`),
        commandId,
        stage:STAGE_PREPARED,
        preparedAt:Number(currentRow?.preparedAt||at),
        createdAt:String(currentRow?.createdAt||new Date(at).toISOString()),
        patch:{cancelled:true,cancelledAt:at,updatedAt:at},
        commandSnapshot:clone(currentRow?.commandSnapshot||command)
      };
      rows[existingIndex]=refreshed;
      if(!saveCancelQueue(rows))return {ok:false,row:null,created:false};
      return {ok:true,row:refreshed,created:false};
    }
    const at=Math.max(1,Number(cancelledAt||now()));
    const row={
      id:`cancel_command_${commandId}`,
      commandId,
      stage:STAGE_PREPARED,
      preparedAt:at,
      committedAt:0,
      createdAt:new Date(at).toISOString(),
      patch:{cancelled:true,cancelledAt:at,updatedAt:at},
      commandSnapshot:clone(command)
    };
    if(!saveCancelQueue([...rows,row]))return {ok:false,row:null,created:false};
    return {ok:true,row,created:true};
  }
  function commitCancelRow(rowId,command,cancelledAt){
    const rows=cancelQueue(),idx=rows.findIndex(row=>String(row?.id||'')===String(rowId||''));
    if(idx<0)return false;
    const currentRow=rows[idx],at=Math.max(1,Number(cancelledAt||currentRow?.patch?.cancelledAt||now()));
    rows[idx]={
      ...currentRow,
      stage:STAGE_COMMITTED,
      committedAt:Number(currentRow?.committedAt||now()),
      patch:{cancelled:true,cancelledAt:at,updatedAt:at},
      commandSnapshot:clone(currentRow?.commandSnapshot||command||null)
    };
    return saveCancelQueue(rows);
  }

  function emitDurableCancellation(command,cancelledAt){
    if(!command)return;
    try{window.dispatchEvent(new CustomEvent('rota27:command-cancelled-durable',{detail:{command:clone(command),cancelledAt:Number(cancelledAt||0)}}));}catch{}
  }

  function reconcileCancelQueue(emitRecovered=false){
    const rows=cancelQueue();
    if(!rows.length)return [];
    const next=[],recover=[];
    let changed=false;
    for(const row of rows){
      const commandId=String(row?.commandId||'');
      if(!commandId){changed=true;continue;}
      const state=coreCancellationState(commandId);
      if(!state.known){next.push(row);continue;}
      if(!state.committed){
        changed=true;
        continue;
      }
      const stage=rowStage(row);
      const committed=stage===STAGE_COMMITTED?row:{
        ...row,
        id:String(row?.id||`cancel_command_${commandId}`),
        stage:STAGE_COMMITTED,
        committedAt:Number(row?.committedAt||now())
      };
      if(stage!==STAGE_COMMITTED)changed=true;
      next.push(committed);
      if(emitRecovered&&committed?.commandSnapshot)recover.push(committed);
    }
    if(changed&&!saveCancelQueue(next))return [];
    return recover;
  }

  async function pushCancel(row){
    if(rowStage(row)!==STAGE_COMMITTED)return false;
    const cfg=readJson(SYNC_KEY,{});
    if(cfg.enabled!==true||cfg.initialized!==true)return false;
    if(!/^https:\/\/.+\/functions\/v1\/rota27-sync\/?$/i.test(String(cfg.functionUrl||'')))return false;
    if(String(cfg.deviceToken||'').length<16||!cfg.deviceId)return false;
    const event={eventId:row.id,eventType:'command_patch',entityId:row.commandId,payload:{patch:row.patch},deviceId:cfg.deviceId,createdAt:row.createdAt,appVersion:VERSION};
    const ctrl=new AbortController();const timeout=setTimeout(()=>ctrl.abort(),12000);
    try{
      const response=await fetch(cfg.functionUrl,{method:'POST',headers:{'content-type':'application/json','x-rota27-device-token':cfg.deviceToken},body:JSON.stringify({action:'push',events:[event],afterSeq:Number(cfg.cursor||0),deviceId:cfg.deviceId,deviceName:cfg.deviceName||'Aparelho',storeId:cfg.storeId||'rota27-bodega',appVersion:VERSION}),signal:ctrl.signal});
      const data=await response.json().catch(()=>({}));
      return response.ok&&data.ok===true;
    }catch{return false;}finally{clearTimeout(timeout);}
  }

  async function flushCancelQueue(){
    if(cancelFlushing||!navigator.onLine)return false;
    reconcileCancelQueue(false);
    const initial=cancelQueue().filter(row=>rowStage(row)===STAGE_COMMITTED);
    if(!initial.length)return true;
    cancelFlushing=true;
    try{
      const batch=initial.slice(0,CANCEL_FLUSH_BATCH),sent=new Set();
      for(const row of batch){if(await pushCancel(row))sent.add(String(row?.id||''));}
      if(sent.size){
        const currentRows=cancelQueue();
        if(!saveCancelQueue(currentRows.filter(row=>!sent.has(String(row?.id||''))))){
          console.warn('[Rota27 v0.25.196] Não foi possível confirmar a remoção de cancelamentos já enviados; os eventos serão repetidos de forma idempotente.');
          return false;
        }
      }
      const remaining=cancelQueue().filter(row=>rowStage(row)===STAGE_COMMITTED);
      if(remaining.length&&navigator.onLine&&sent.size===batch.length)setTimeout(flushCancelQueue,350);
      return remaining.length===0;
    }finally{cancelFlushing=false;}
  }

  function purgeCancelled(){
    const s=appState();if(!s||!Array.isArray(s.commands))return;
    const before=s.commands.length;
    s.commands=s.commands.filter(c=>c?.cancelled!==true);
    if(s.commands.length!==before){
      try{if(typeof save==='function')save();}catch{}
      try{if(typeof renderCommands==='function')renderCommands();}catch{}
    }
  }

  function confirmCancel(){
    const c=current();if(!c)return;
    const s=appState();if(!s||!Array.isArray(s.commands))return;
    const id=String(c.id),cancelledAt=now(),originalCommand=clone(c);
    const queued=queueCancelPrepared(originalCommand,cancelledAt);
    if(!queued.ok){
      try{showToast('Não foi possível registrar o cancelamento com segurança. Libere espaço no aparelho e tente novamente.',true);}catch{}
      return;
    }

    const previousCommands=clone(s.commands),previousWhatsappOutbox=clone(Array.isArray(s.whatsappOutbox)?s.whatsappOutbox:[]);
    clearWhatsappForCommand(id);
    s.commands=(s.commands||[]).filter(x=>String(x?.id||'')!==id);

    let persisted=false;
    try{
      if(typeof save==='function')save();
      const state=coreCancellationState(id);
      persisted=state.known&&state.committed;
    }catch{}

    if(!persisted){
      s.commands=previousCommands;
      s.whatsappOutbox=previousWhatsappOutbox;
      try{if(typeof save==='function')save();}catch{}
      if(rowStage(queued.row)!==STAGE_COMMITTED)removeCancelQueueRow(queued.row?.id);
      try{if(typeof resumeWhatsappOutbox==='function')setTimeout(resumeWhatsappOutbox,100);}catch{}
      try{showToast('O cancelamento não foi confirmado porque o estado local não pôde ser salvo.',true);}catch{}
      return;
    }

    const committed=commitCancelRow(queued.row?.id,originalCommand,cancelledAt);
    if(!committed)console.warn('[Rota27 v0.25.196] Cancelamento persistido localmente; promoção da fila será retomada na próxima reconciliação.');
    emitDurableCancellation(originalCommand,cancelledAt);
    setTimeout(()=>{reconcileCancelQueue(false);flushCancelQueue();},0);
    try{activeCommandId=null;}catch{}
    byId('v0151CancelConfirm')?.classList.remove('open');
    byId('editCommandWrap')?.classList.remove('open');
    try{showScreen('commands');}catch{}
    try{renderCommands();}catch{}
    try{showToast('Comanda cancelada.',false);}catch{}
  }

  function recoverAndFlush(){
    const recovered=reconcileCancelQueue(true);
    if(recovered.length)setTimeout(()=>recovered.forEach(row=>emitDurableCancellation(row.commandSnapshot,row?.patch?.cancelledAt||row?.committedAt)),0);
    setTimeout(flushCancelQueue,0);
  }

  function start(){
    patchWhatsappConfig();wrapOperationalViews();ensureCancelConfirm();ensureCancelButton();purgeCancelled();recoverAndFlush();
    setInterval(()=>{patchWhatsappConfig();wrapOperationalViews();ensureCancelButton();purgeCancelled();recoverAndFlush();},4000);
    window.addEventListener('online',()=>{correctWhatsappEndpoint(false);recoverAndFlush();setTimeout(()=>{try{resumeWhatsappOutbox();}catch{}},400);});
    window.addEventListener('pageshow',()=>{correctWhatsappEndpoint(false);recoverAndFlush();});
    console.info('[Rota27] hotfix v0.25.196 carregado.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
