/* Rota 27 v0.25.225 — preflight local antes da troca de origem */
(function(){
  'use strict';
  if(window.Rota27MigrationPreflight)return;

  const VERSION='0.25.225';
  const SYNC_KEY='rota27_sync_config_v1';
  const KNOWN_OUTBOXES={
    rota27_cancel_outbox_v0151:'Cancelamentos',
    rota27_v017_domain_outbox_v1:'Clientes/configuração',
    rota27_v017_manager_outbox_v1:'WhatsApp gerente',
    rota27_v019_turn_outbox_v1:'Fechamento de turno',
    rota27_v021_stock_outbox_v1:'Estoque',
    rota27_v022_purchase_outbox_v1:'Compras',
    rota27_v023_inventory_outbox_v1:'Inventário',
    rota27_v0255_fixed_copy_outbox_v1:'Cópia fixa WhatsApp',
    rota27_v02512_receivable_outbox_v1:'A receber',
    rota27_v02537_internal_marker_outbox_v1:'Consumo interno',
    rota27_v02573_cancel_whatsapp_outbox_v1:'Cancelamento WhatsApp'
  };
  const NON_QUEUE_OUTBOX_KEYS=new Set([
    'rota27_v025197_command_cancel_scan_outbox_marker_v1'
  ]);

  const byId=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const clean=(v,max=300)=>String(v??'').trim().replace(/\s+/g,' ').slice(0,max);

  function readJson(key,fallback){
    try{const value=JSON.parse(localStorage.getItem(key)||'null');return value==null?fallback:value;}catch{return fallback;}
  }
  function syncConfig(){const value=readJson(SYNC_KEY,{});return value&&typeof value==='object'&&!Array.isArray(value)?value:{};}
  function currentRelease(){return clean(document.querySelector('meta[name="rota27-release-version"]')?.content||VERSION,40)||VERSION;}
  function validSyncConfig(cfg){
    return cfg?.enabled===true&&cfg?.initialized===true&&!!cfg?.deviceId&&String(cfg?.deviceToken||'').length>=16&&/^https:\/\/.+\/functions\/v1\/rota27-sync\/?$/i.test(String(cfg?.functionUrl||''));
  }
  function currentWhatsappOutbox(){
    try{return Array.isArray(state?.whatsappOutbox)?state.whatsappOutbox:[];}catch{return [];}
  }
  function localOutboxKeys(){
    const keys=new Set(Object.keys(KNOWN_OUTBOXES));
    for(let i=0;i<localStorage.length;i++){
      const key=localStorage.key(i);
      if(key&&/outbox/i.test(key)&&!NON_QUEUE_OUTBOX_KEYS.has(key))keys.add(key);
    }
    return [...keys].sort();
  }
  function inspectStoredOutbox(key){
    const raw=localStorage.getItem(key);
    if(raw==null)return {count:0,valid:true,present:false};
    try{
      const value=JSON.parse(raw);
      if(!Array.isArray(value))return {count:0,valid:false,present:true};
      return {count:value.length,valid:true,present:true};
    }catch{return {count:0,valid:false,present:true};}
  }
  function localOutboxes(){
    return localOutboxKeys().map(key=>{
      const state=inspectStoredOutbox(key);
      return {key,label:KNOWN_OUTBOXES[key]||key,count:state.count,valid:state.valid,present:state.present};
    });
  }
  function inspect(){
    const cfg=syncConfig();
    const primary=Array.isArray(cfg.outbox)?cfg.outbox.length:0;
    const whatsapp=currentWhatsappOutbox().length;
    const domain=localOutboxes();
    const domainPending=domain.reduce((sum,row)=>sum+Math.max(0,Number(row.count||0)),0);
    const invalidOutboxes=domain.filter(row=>row.present&&!row.valid);
    const cursor=Math.max(0,Number(cfg.cursor||0));
    const latest=Math.max(0,Number(cfg.latestServerSeq||0));
    const conflicts=Array.isArray(cfg.conflicts)?cfg.conflicts.length:0;
    const blockers=[];
    if(!navigator.onLine)blockers.push('Aparelho offline.');
    if(!validSyncConfig(cfg))blockers.push('Sincronização não está pronta neste aparelho.');
    if(clean(cfg.lastError||'',300))blockers.push(`Erro de sincronização: ${clean(cfg.lastError,220)}`);
    if(primary)blockers.push(`Fila principal possui ${primary} pendente(s).`);
    if(whatsapp)blockers.push(`Fila WhatsApp do cliente possui ${whatsapp} item(ns).`);
    if(domainPending)blockers.push(`Filas de domínio possuem ${domainPending} pendente(s).`);
    if(invalidOutboxes.length)blockers.push(`${invalidOutboxes.length} fila(s) local(is) não puderam ser interpretadas com segurança.`);
    if(latest>cursor)blockers.push(`Cursor local ${cursor} ainda está atrás do servidor ${latest}.`);
    if(conflicts)blockers.push(`Existem ${conflicts} aviso(s) de conflito para revisão.`);
    return {
      ready:blockers.length===0,
      checkedAt:new Date().toISOString(),
      release:currentRelease(),
      online:navigator.onLine,
      sync:{enabled:cfg.enabled===true,initialized:cfg.initialized===true,cursor,latestServerSeq:latest,lastSyncAt:Number(cfg.lastSyncAt||0),hasError:!!clean(cfg.lastError||'',300),conflicts},
      queues:{primary,whatsapp,domain,total:primary+whatsapp+domainPending,invalid:invalidOutboxes.length},
      blockers
    };
  }
  function formatTime(value){
    const d=new Date(Number(value||0));
    return Number.isNaN(d.getTime())||!Number(value)?'—':d.toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});
  }
  function render(result){
    const host=byId('v025225MigrationPreflightResult');if(!host)return;
    const rows=result.queues.domain.filter(row=>row.count>0||!row.valid);
    const queueDetails=rows.length
      ? `<div class="r27-migration-preflight-queues">${rows.map(row=>`<span><b>${esc(row.label)}</b><strong>${row.valid?row.count:'ERRO'}</strong></span>`).join('')}</div>`
      : '<div class="r27-migration-preflight-zero">Todas as filas de domínio estão zeradas e legíveis.</div>';
    const blockers=result.blockers.length
      ? `<ul>${result.blockers.map(item=>`<li>${esc(item)}</li>`).join('')}</ul>`
      : '<p>Nenhum bloqueio local detectado. Este aparelho pode seguir para o re-enrollment na nova origem.</p>';
    host.innerHTML=`
      <div class="r27-migration-preflight-head ${result.ready?'ready':'blocked'}"><strong>${result.ready?'APTO PARA MIGRAÇÃO':'NÃO MIGRAR AINDA'}</strong><span>Rota 27 ${esc(result.release)}</span></div>
      <div class="r27-migration-preflight-grid">
        <span>Fila principal<b>${result.queues.primary}</b></span>
        <span>Fila WhatsApp<b>${result.queues.whatsapp}</b></span>
        <span>Filas de domínio<b>${result.queues.domain.reduce((s,r)=>s+r.count,0)}</b></span>
        <span>Cursor<b>${result.sync.cursor}/${result.sync.latestServerSeq||result.sync.cursor}</b></span>
      </div>
      ${queueDetails}
      <div class="r27-migration-preflight-blockers">${blockers}</div>
      <small>Última sync: ${esc(formatTime(result.sync.lastSyncAt))}. O diagnóstico mostra apenas contagens; não lê nem exibe tokens ou conteúdo das filas.</small>`;
  }
  async function run(){
    const button=byId('v025225MigrationPreflightRun');
    if(button){button.disabled=true;button.textContent='Sincronizando e verificando…';}
    try{
      if(navigator.onLine&&typeof window.v15SyncNow==='function'){
        try{const task=window.v15SyncNow();if(task&&typeof task.then==='function')await task;}catch{}
      }
      await new Promise(resolve=>setTimeout(resolve,5200));
      const result=inspect();render(result);return result;
    }finally{
      if(button){button.disabled=false;button.textContent='Verificar novamente';}
    }
  }
  function ensureStyles(){
    if(byId('v025225MigrationPreflightStyle'))return;
    const style=document.createElement('style');style.id='v025225MigrationPreflightStyle';style.textContent=`
      .r27-migration-preflight{margin:12px 0;padding:12px;border:1px solid rgba(58,43,31,.16);border-radius:14px;background:#fffaf2}
      .r27-migration-preflight>button{width:100%;min-height:42px;border:0;border-radius:12px;font-weight:800;background:#5f4b35;color:#fff}
      .r27-migration-preflight>button:disabled{opacity:.65}
      .r27-migration-preflight-note{display:block;margin:7px 0 10px;color:#6f6257;font-size:12px;line-height:1.35}
      .r27-migration-preflight-head{display:flex;justify-content:space-between;gap:8px;align-items:center;margin-top:10px;padding:9px 10px;border-radius:10px;font-size:12px}
      .r27-migration-preflight-head.ready{background:#e6f4ea;color:#205c32}.r27-migration-preflight-head.blocked{background:#fff0e6;color:#8a3f16}
      .r27-migration-preflight-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:8px}.r27-migration-preflight-grid span{display:flex;justify-content:space-between;padding:7px 8px;border-radius:9px;background:#fff;border:1px solid rgba(58,43,31,.10);font-size:12px}
      .r27-migration-preflight-queues{margin-top:8px}.r27-migration-preflight-queues span{display:flex;justify-content:space-between;padding:5px 2px;font-size:12px}.r27-migration-preflight-zero{margin-top:8px;font-size:12px;color:#35643e}
      .r27-migration-preflight-blockers{font-size:12px;line-height:1.4}.r27-migration-preflight-blockers ul{margin:8px 0;padding-left:18px}.r27-migration-preflight-blockers p{margin:8px 0;color:#35643e}.r27-migration-preflight small{display:block;color:#75685c;line-height:1.35}
    `;document.head.appendChild(style);
  }
  function ensureUi(){
    const sheet=byId('v02585DeviceWrap')?.querySelector('.v02585-device-sheet');
    if(!sheet||byId('v025225MigrationPreflight'))return;
    ensureStyles();
    const box=document.createElement('section');box.id='v025225MigrationPreflight';box.className='r27-migration-preflight';
    box.innerHTML=`<strong>Pré-migração Azure</strong><span class="r27-migration-preflight-note">Antes de trocar este aparelho para o novo domínio, confirme que nenhuma alteração ficou somente nesta origem.</span><button type="button" id="v025225MigrationPreflightRun">Verificar aparelho</button><div id="v025225MigrationPreflightResult"></div>`;
    const info=sheet.querySelector('.v02585-device-info');
    if(info)info.insertAdjacentElement('afterend',box);else sheet.prepend(box);
    byId('v025225MigrationPreflightRun')?.addEventListener('click',run);
  }
  function observe(){
    const observer=new MutationObserver(()=>ensureUi());
    observer.observe(document.body,{childList:true,subtree:true});
    document.addEventListener('click',event=>{if(event.target.closest?.('#v02585OpenDevices'))setTimeout(ensureUi,100);},true);
    ensureUi();
  }
  function start(){observe();console.info(`[Rota27] preflight de migração ${VERSION} carregado.`);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
  window.Rota27MigrationPreflight={version:VERSION,inspect,run};
})();
