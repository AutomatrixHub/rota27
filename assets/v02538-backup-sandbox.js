/* Rota 27 v0.25.38 — backup completo e modo Sandbox */
(function(){
  'use strict';

  const VERSION='0.25.38';
  const APP='rota27-comandas';
  const SCHEMA=2;
  const CORE_KEY='rota27_comandas_v01';
  const SYNC_KEY='rota27_sync_config_v1';
  const WA_KEY='rota27_whatsapp_config_v1';
  const SANDBOX_KEY='rota27_v02538_sandbox_v1';
  const RUNTIME_PATTERNS=[
    /(?:^|_)outbox(?:_|$)/i,
    /(?:^|_)cursor(?:_|$)/i,
    /sync_config/i,
    /whatsapp_config/i,
    /pre_adopt/i,
    /pre_restore/i,
    /sandbox/i
  ];
  const SECRET_FIELDS=/^(?:deviceToken|token|secret|authorization|accessToken|refreshToken|apiKey|apikey|password)$/i;
  let fetchPatched=false;
  let restoreMode='normal';

  const byId=id=>document.getElementById(id);
  const isLocalhost=()=>/^(localhost|127\.0\.0\.1|\[::1\])$/i.test(location.hostname||'');
  const nowStamp=()=>{
    const d=new Date(),p=n=>String(n).padStart(2,'0');
    return `${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
  };
  const clone=v=>JSON.parse(JSON.stringify(v==null?null:v));
  const toast=msg=>{try{if(typeof showToast==='function')showToast(msg,false);else console.info('[Rota27]',msg);}catch{}};

  function isRotaKey(key){return /^rota27_/i.test(String(key||''));}
  function isRuntimeKey(key){return RUNTIME_PATTERNS.some(rx=>rx.test(String(key||'')));}
  function isDataKey(key){return isRotaKey(key)&&!isRuntimeKey(key);}

  function scrubSecrets(value){
    if(Array.isArray(value))return value.map(scrubSecrets);
    if(!value||typeof value!=='object')return value;
    const out={};
    Object.entries(value).forEach(([k,v])=>{
      if(SECRET_FIELDS.test(k))return;
      out[k]=scrubSecrets(v);
    });
    return out;
  }

  function sanitizeStoredValue(raw){
    const text=String(raw??'');
    try{return JSON.stringify(scrubSecrets(JSON.parse(text)));}catch{return text;}
  }

  function snapshotLocalStorage(){
    const data={},excluded=[];
    for(let i=0;i<localStorage.length;i++){
      const key=localStorage.key(i);
      if(!isRotaKey(key))continue;
      if(!isDataKey(key)){excluded.push(key);continue;}
      data[key]=sanitizeStoredValue(localStorage.getItem(key));
    }
    if(!Object.prototype.hasOwnProperty.call(data,CORE_KEY)){
      try{if(typeof state!=='undefined'&&state)data[CORE_KEY]=JSON.stringify(scrubSecrets(clone(state)));}catch{}
    }
    return {data,excluded:excluded.sort()};
  }

  function buildPackage(reason='manual'){
    const snap=snapshotLocalStorage();
    let summary={commands:0,history:0,catalog:0,clients:0,stores:Object.keys(snap.data).length};
    try{
      const core=JSON.parse(snap.data[CORE_KEY]||'{}');
      summary={
        commands:Array.isArray(core.commands)?core.commands.length:0,
        history:Array.isArray(core.history)?core.history.length:0,
        catalog:Array.isArray(core.catalog)?core.catalog.length:0,
        clients:Array.isArray(core.clients)?core.clients.length:0,
        stores:Object.keys(snap.data).length
      };
    }catch{}
    return {
      app:APP,
      schema:SCHEMA,
      kind:'full-backup',
      release:VERSION,
      exportedAt:new Date().toISOString(),
      reason,
      summary,
      security:{deviceTokenIncluded:false,runtimeQueuesIncluded:false,excludedKeys:snap.excluded},
      storage:{localStorage:snap.data}
    };
  }

  function downloadJson(filename,obj){
    const blob=new Blob([JSON.stringify(obj,null,2)],{type:'application/json;charset=utf-8'});
    const url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }

  function downloadBackup(reason='manual'){
    const pkg=buildPackage(reason);
    downloadJson(`rota27-backup-completo-v${VERSION}-${nowStamp()}.json`,pkg);
    setStatus(`Backup completo gerado: ${pkg.summary.stores} áreas locais, ${pkg.summary.history} registros no histórico e ${pkg.summary.catalog} produtos.`,'ok');
    toast('Backup completo gerado com sucesso.');
    return pkg;
  }

  function normalizePackage(data){
    if(!data||typeof data!=='object')throw new Error('Arquivo JSON inválido.');
    if(data.app!==APP)throw new Error('Este arquivo não é um backup do Rota 27.');
    if(Number(data.schema)===1&&data.state&&typeof data.state==='object'){
      if(!Array.isArray(data.state.commands)||!Array.isArray(data.state.history)||!Array.isArray(data.state.catalog))throw new Error('Backup legado incompleto.');
      return {
        app:APP,schema:1,kind:'legacy-core-backup',release:String(data.version||'0.14'),exportedAt:data.exportedAt||null,
        legacy:true,
        storage:{localStorage:{[CORE_KEY]:JSON.stringify(scrubSecrets(data.state))}},
        summary:{commands:data.state.commands.length,history:data.state.history.length,catalog:data.state.catalog.length,clients:Array.isArray(data.state.clients)?data.state.clients.length:0,stores:1}
      };
    }
    if(Number(data.schema)>=2&&data.storage?.localStorage&&typeof data.storage.localStorage==='object'){
      const stores={};
      Object.entries(data.storage.localStorage).forEach(([k,v])=>{if(isDataKey(k))stores[k]=sanitizeStoredValue(v);});
      if(!stores[CORE_KEY])throw new Error('Backup completo sem o estado principal do Rota 27.');
      return {...data,legacy:false,storage:{localStorage:stores}};
    }
    throw new Error('Formato de backup não reconhecido por esta versão.');
  }

  function pauseRuntimeForRestore(){
    try{
      const cfg=JSON.parse(localStorage.getItem(SYNC_KEY)||'{}')||{};
      if(Object.keys(cfg).length){cfg.enabled=false;cfg.initialized=false;cfg.lastError='Sincronização pausada após restauração local.';localStorage.setItem(SYNC_KEY,JSON.stringify(cfg));}
    }catch{localStorage.removeItem(SYNC_KEY);}
    localStorage.removeItem(WA_KEY);
    [...Array(localStorage.length)].forEach(()=>{});
    const keys=[];for(let i=0;i<localStorage.length;i++)keys.push(localStorage.key(i));
    keys.filter(k=>isRotaKey(k)&&isRuntimeKey(k)&&k!==SYNC_KEY).forEach(k=>localStorage.removeItem(k));
  }

  function clearCurrentData(){
    const keys=[];for(let i=0;i<localStorage.length;i++)keys.push(localStorage.key(i));
    keys.filter(isDataKey).forEach(k=>localStorage.removeItem(k));
  }

  function applyStores(pkg,{sandbox=false}={}){
    if(sandbox){
      localStorage.clear();
      Object.entries(pkg.storage.localStorage).forEach(([k,v])=>{if(isDataKey(k))localStorage.setItem(k,String(v));});
      localStorage.setItem(SANDBOX_KEY,JSON.stringify({enabled:true,createdAt:Date.now(),sourceRelease:String(pkg.release||pkg.version||'desconhecida'),sourceExportedAt:pkg.exportedAt||null,legacy:pkg.legacy===true}));
      localStorage.removeItem(SYNC_KEY);localStorage.removeItem(WA_KEY);
      return;
    }
    clearCurrentData();
    Object.entries(pkg.storage.localStorage).forEach(([k,v])=>{if(isDataKey(k))localStorage.setItem(k,String(v));});
    pauseRuntimeForRestore();
  }

  async function readBackupFile(file){
    if(!file)throw new Error('Nenhum arquivo selecionado.');
    if(file.size>20*1024*1024)throw new Error('Arquivo maior que 20 MB.');
    return normalizePackage(JSON.parse(await file.text()));
  }

  function packageLabel(pkg){
    const s=pkg.summary||{};
    return `${pkg.legacy?'Backup legado':'Backup completo'} • ${Number(s.commands||0)} comandas abertas • ${Number(s.history||0)} histórico • ${Number(s.catalog||0)} produtos • ${Number(s.clients||0)} clientes`;
  }

  async function handleRestoreFile(event){
    const file=event.target.files?.[0];event.target.value='';if(!file)return;
    try{
      const pkg=await readBackupFile(file);
      if(restoreMode==='sandbox'){
        if(!isLocalhost())throw new Error('O Modo Sandbox só pode ser restaurado em localhost/127.0.0.1.');
        const suffix=pkg.legacy?'\n\nEste é um backup legado: ele contém o núcleo do app, mas não todas as áreas modulares mais novas.':'\n\nO pacote completo inclui as áreas locais do Rota 27, sem tokens, cursores ou filas de sincronização.';
        if(!confirm(`Importar como SANDBOX?\n\n${packageLabel(pkg)}${suffix}\n\nO armazenamento deste localhost será substituído e qualquer conexão com produção será removida.`))return;
        applyStores(pkg,{sandbox:true});
        setStatus('Sandbox carregado. Reabrindo o aplicativo local sem sincronização e sem WhatsApp...','ok');
        setTimeout(()=>location.href='./?sandbox=1',350);
        return;
      }
      const legacyWarning=pkg.legacy?'\n\nAtenção: backup legado restaura apenas o núcleo histórico do aplicativo.':'\n\nA restauração completa substituirá os dados locais do Rota 27 neste aparelho.';
      if(!confirm(`Restaurar este backup?\n\n${packageLabel(pkg)}${legacyWarning}\n\nAntes de aplicar, será baixado automaticamente um backup completo do estado atual. A sincronização ficará pausada após a restauração para impedir replay acidental.`))return;
      downloadBackup('pre-restore');
      applyStores(pkg,{sandbox:false});
      setStatus('Restauração concluída. A sincronização foi pausada por segurança. Recarregando...','ok');
      setTimeout(()=>location.reload(),500);
    }catch(err){
      setStatus(`Não foi possível restaurar: ${err?.message||'arquivo inválido'}`,'error');
      toast('Não foi possível restaurar este backup.');
    }
  }

  function setStatus(text,type=''){
    const el=byId('v02538BackupStatus');if(!el)return;el.className=`v02538-status ${type}`.trim();el.textContent=text;
  }

  function ensureSheet(){
    if(byId('v02538BackupWrap'))return;
    const wrap=document.createElement('div');wrap.id='v02538BackupWrap';wrap.className='sheet-wrap';
    wrap.innerHTML=`<div class="sheet"><div class="handle"></div><div class="v02538-backup-head"><div><h3>Backup completo & Sandbox</h3><p class="desc">Proteção atualizada para o Rota 27 multidispositivo.</p></div></div>
      <div class="v02538-backup-grid">
        <section class="v02538-backup-card"><strong>Backup completo</strong><p>Exporta o estado principal e as áreas locais do Rota 27. Tokens, filas e cursores de sincronização não são incluídos.</p><button class="primary" id="v02538DownloadBackup">⇩ Baixar backup completo</button></section>
        <section class="v02538-backup-card"><strong>Restaurar neste aparelho</strong><p>Aceita o novo backup completo e também backups legados v0.14. A sincronização é pausada automaticamente após restaurar, evitando replay acidental para produção.</p><button class="secondary" id="v02538RestoreBackup">⇧ Restaurar backup</button></section>
        <section class="v02538-backup-card sandbox"><strong>Modo Sandbox / Testes</strong><p>Em localhost, cria uma cópia isolada dos dados. Sincronização e WhatsApp ficam bloqueados, permitindo testar comandas, estoque e relatórios sem tocar na produção.</p><button class="secondary" id="v02538SandboxImport">▣ Importar como Sandbox</button><span class="v02538-mini">Para preparar o ambiente local, use <b>http://localhost:8787/sandbox.html</b>.</span></section>
      </div>
      <input id="v02538BackupFile" type="file" accept="application/json,.json" hidden>
      <div id="v02538BackupStatus" class="v02538-status">Pronto. O backup antigo v0.14 continua aceito para compatibilidade.</div>
      <div class="sheet-actions"><button class="secondary" style="grid-column:1/-1" id="v02538BackupClose">Fechar</button></div></div>`;
    document.body.appendChild(wrap);
    wrap.addEventListener('click',e=>{if(e.target===wrap)wrap.classList.remove('open');});
    byId('v02538BackupClose').onclick=()=>wrap.classList.remove('open');
    byId('v02538DownloadBackup').onclick=()=>downloadBackup('manual');
    byId('v02538RestoreBackup').onclick=()=>{restoreMode='normal';byId('v02538BackupFile').click();};
    byId('v02538SandboxImport').onclick=()=>{
      if(!isLocalhost()){
        setStatus('Modo Sandbox não altera a produção. Clone/atualize o repositório, rode o servidor local e abra http://localhost:8787/sandbox.html.','warn');
        return;
      }
      restoreMode='sandbox';byId('v02538BackupFile').click();
    };
    byId('v02538BackupFile').addEventListener('change',handleRestoreFile);
  }

  function openSheet(){ensureSheet();setStatus(isLocalhost()?'Ambiente local detectado. Backup completo e importação Sandbox disponíveis.':'Produção detectada. O Sandbox só pode ser importado em localhost.','');byId('v02538BackupWrap').classList.add('open');}

  function isSandbox(){try{return JSON.parse(localStorage.getItem(SANDBOX_KEY)||'{}')?.enabled===true;}catch{return false;}}

  function blockSandboxNetwork(){
    if(!isSandbox()||fetchPatched)return;
    fetchPatched=true;
    localStorage.removeItem(SYNC_KEY);localStorage.removeItem(WA_KEY);
    const nativeFetch=window.fetch.bind(window);
    window.fetch=function(input,init){
      const url=String(typeof input==='string'?input:input?.url||'');
      if(/\/functions\/v1\/rota27-/i.test(url)||/owkvwsiblbzlpxjwybrt\.supabase\.co/i.test(url)){
        console.warn('[Rota27 Sandbox] chamada externa bloqueada:',url);
        return Promise.reject(new Error('Modo Sandbox: conexão com produção bloqueada.'));
      }
      return nativeFetch(input,init);
    };
  }

  function renderSandboxBanner(){
    if(!isSandbox())return;
    document.body.classList.add('v02538-sandbox');
    if(byId('v02538SandboxBanner'))return;
    const bar=document.createElement('div');bar.id='v02538SandboxBanner';bar.innerHTML='SANDBOX <span>dados de teste • sincronização e WhatsApp bloqueados</span>';
    document.body.insertAdjacentElement('afterbegin',bar);
  }

  function installOverrides(){
    window.v14OpenBackupSheet=openSheet;
    window.v14DownloadBackup=()=>downloadBackup('manual');
    window.Rota27V02538BackupSandbox={version:VERSION,open:openSheet,downloadBackup,normalizePackage,isSandbox,buildPackage};
  }

  function start(){
    blockSandboxNetwork();renderSandboxBanner();ensureSheet();installOverrides();
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){blockSandboxNetwork();renderSandboxBanner();installOverrides();}});
    console.info(`[Rota27] v${VERSION} — backup completo e Sandbox carregados${isSandbox()?' (SANDBOX)':''}.`);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
