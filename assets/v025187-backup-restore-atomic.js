/* Rota 27 v0.25.194 — restauração atômica de backup */
(function(){
  'use strict';
  if(window.Rota27V025187BackupRestoreAtomic)return;

  const VERSION='0.25.194';
  const CORE_KEY='rota27_comandas_v01';
  const SYNC_KEY='rota27_sync_config_v1';
  const WA_KEY='rota27_whatsapp_config_v1';
  const SANDBOX_KEY='rota27_v02538_sandbox_v1';
  const RUNTIME_PATTERNS=[/(?:^|_)outbox(?:_|$)/i,/(?:^|_)cursor(?:_|$)/i,/sync_config/i,/whatsapp_config/i,/pre_adopt/i,/pre_restore/i,/sandbox/i];
  let mode='normal';
  let boundInput=null;
  let bindObserver=null;
  let bindTimer=null;

  const byId=id=>document.getElementById(id);
  const isLocalhost=()=>/^(localhost|127\.0\.0\.1|\[::1\])$/i.test(location.hostname||'');
  const isRotaKey=key=>/^rota27_/i.test(String(key||''));
  const isRuntimeKey=key=>RUNTIME_PATTERNS.some(rx=>rx.test(String(key||'')));
  const isDataKey=key=>isRotaKey(key)&&!isRuntimeKey(key);
  const toast=msg=>{try{typeof showToast==='function'?showToast(msg,false):console.info('[Rota27]',msg);}catch{}};

  function allKeys(){const rows=[];for(let i=0;i<localStorage.length;i++)rows.push(localStorage.key(i));return rows.filter(Boolean);}
  function snapshotRotaStorage(){const out={};allKeys().filter(isRotaKey).forEach(k=>{out[k]=localStorage.getItem(k);});return out;}
  function restoreRawSnapshot(snapshot){
    allKeys().filter(isRotaKey).forEach(k=>localStorage.removeItem(k));
    Object.entries(snapshot||{}).forEach(([k,v])=>localStorage.setItem(k,String(v??'')));
  }
  function pauseRuntimeAfterRestore(){
    try{
      const cfg=JSON.parse(localStorage.getItem(SYNC_KEY)||'{}')||{};
      if(Object.keys(cfg).length){
        // Credenciais e identidade do aparelho permanecem para permitir reativação
        // consciente. Todo o estado transitório pertence à base anterior e não pode
        // atravessar a restauração, especialmente a outbox ainda não publicada.
        cfg.enabled=false;
        cfg.initialized=false;
        cfg.cursor=0;
        cfg.outbox=[];
        cfg.conflicts=[];
        cfg.lastSyncAt=0;
        cfg.latestServerSeq=0;
        cfg.latestSnapshotSeq=0;
        cfg.devices=[];
        cfg.lastError='Sincronização pausada após restauração local.';
        localStorage.setItem(SYNC_KEY,JSON.stringify(cfg));
      }
    }catch{localStorage.removeItem(SYNC_KEY);}
    localStorage.removeItem(WA_KEY);
    allKeys().filter(k=>isRotaKey(k)&&isRuntimeKey(k)&&k!==SYNC_KEY).forEach(k=>localStorage.removeItem(k));
  }
  function verifyPackageStores(pkg){
    const stores=pkg?.storage?.localStorage||{};
    if(!Object.prototype.hasOwnProperty.call(stores,CORE_KEY))throw new Error('Backup sem o estado principal do Rota 27.');
    for(const [k,v] of Object.entries(stores)){
      if(!isDataKey(k))continue;
      if(localStorage.getItem(k)!==String(v))throw new Error(`Falha ao confirmar a área local ${k}.`);
    }
  }
  function applyPackageAtomic(pkg,{sandbox=false}={}){
    const before=snapshotRotaStorage();
    try{
      allKeys().filter(k=>sandbox?isRotaKey(k):isDataKey(k)).forEach(k=>localStorage.removeItem(k));
      Object.entries(pkg.storage.localStorage||{}).forEach(([k,v])=>{if(isDataKey(k))localStorage.setItem(k,String(v));});
      verifyPackageStores(pkg);
      if(sandbox){
        localStorage.setItem(SANDBOX_KEY,JSON.stringify({enabled:true,createdAt:Date.now(),sourceRelease:String(pkg.release||pkg.version||'desconhecida'),sourceExportedAt:pkg.exportedAt||null,legacy:pkg.legacy===true}));
        localStorage.removeItem(SYNC_KEY);localStorage.removeItem(WA_KEY);
      }else pauseRuntimeAfterRestore();
      return true;
    }catch(err){
      try{restoreRawSnapshot(before);}catch(rollbackErr){console.error('[Rota27] rollback de restauração falhou:',rollbackErr);}
      throw err;
    }
  }
  function setStatus(text,type=''){
    const el=byId('v02538BackupStatus');if(!el)return;el.className=`v02538-status ${type}`.trim();el.textContent=text;
  }
  function packageLabel(pkg){
    const s=pkg?.summary||{};
    return `${pkg?.legacy?'Backup legado':'Backup completo'} • ${Number(s.commands||0)} comandas abertas • ${Number(s.history||0)} histórico • ${Number(s.catalog||0)} produtos • ${Number(s.clients||0)} clientes`;
  }
  async function readPackage(file){
    if(!file)throw new Error('Nenhum arquivo selecionado.');
    if(file.size>20*1024*1024)throw new Error('Arquivo maior que 20 MB.');
    const api=window.Rota27V02538BackupSandbox;
    if(typeof api?.normalizePackage!=='function')throw new Error('Módulo de backup ainda não está pronto.');
    return api.normalizePackage(JSON.parse(await file.text()));
  }
  async function handleFile(event){
    const file=event.target.files?.[0];event.target.value='';if(!file)return;
    try{
      const pkg=await readPackage(file);
      if(mode==='sandbox'){
        if(!isLocalhost())throw new Error('O Modo Sandbox só pode ser restaurado em localhost/127.0.0.1.');
        const suffix=pkg.legacy?'\n\nEste backup legado contém somente o núcleo histórico.':'\n\nO pacote inclui as áreas locais de dados, sem tokens, cursores ou filas de sincronização.';
        if(!confirm(`Importar como SANDBOX?\n\n${packageLabel(pkg)}${suffix}\n\nSomente as chaves do Rota 27 neste localhost serão substituídas.`))return;
        applyPackageAtomic(pkg,{sandbox:true});
        setStatus('Sandbox carregado e verificado. Reabrindo sem sincronização e sem WhatsApp...','ok');
        setTimeout(()=>location.href='./?sandbox=1',350);
        return;
      }

      const warning=pkg.legacy?'\n\nAtenção: backup legado restaura apenas o núcleo histórico do aplicativo.':'\n\nA restauração completa substituirá os dados locais do Rota 27 neste aparelho.';
      if(!confirm(`Restaurar este backup?\n\n${packageLabel(pkg)}${warning}\n\nSerá gerado um backup do estado atual. Se qualquer gravação falhar, o estado anterior será restaurado automaticamente. A sincronização ficará pausada após o sucesso.`))return;
      window.Rota27V02538BackupSandbox?.downloadBackup?.('pre-restore');
      applyPackageAtomic(pkg,{sandbox:false});
      setStatus('Restauração concluída e verificada. Sincronização pausada por segurança. Recarregando...','ok');
      setTimeout(()=>location.reload(),500);
    }catch(err){
      setStatus(`Não foi possível restaurar: ${err?.message||'arquivo inválido'}. O estado anterior foi preservado.`,'error');
      toast('Restauração cancelada sem substituir o estado anterior.');
    }
  }
  function bind(){
    const api=window.Rota27V02538BackupSandbox;
    const input=byId('v02538BackupFile'),restore=byId('v02538RestoreBackup'),sandbox=byId('v02538SandboxImport');
    if(!api||!input||!restore||!sandbox)return false;
    if(input===boundInput)return true;

    const fresh=input.cloneNode(true);
    input.replaceWith(fresh);
    boundInput=fresh;
    fresh.addEventListener('change',handleFile);
    restore.onclick=()=>{mode='normal';fresh.click();};
    sandbox.onclick=()=>{
      if(!isLocalhost()){setStatus('Modo Sandbox não altera a produção. Abra o ambiente local para importar uma cópia isolada.','warn');return;}
      mode='sandbox';fresh.click();
    };
    return true;
  }
  function watchUntilBound(){
    if(bind())return true;
    if(!bindTimer)bindTimer=setInterval(()=>{
      if(!bind())return;
      clearInterval(bindTimer);bindTimer=null;
      bindObserver?.disconnect();bindObserver=null;
    },250);
    if(!bindObserver&&document.body){
      bindObserver=new MutationObserver(()=>{
        if(!bind())return;
        bindObserver?.disconnect();bindObserver=null;
        if(bindTimer){clearInterval(bindTimer);bindTimer=null;}
      });
      bindObserver.observe(document.body,{childList:true,subtree:true});
    }
    return false;
  }
  function start(){
    watchUntilBound();
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')watchUntilBound();});
    window.Rota27V025187BackupRestoreAtomic={version:VERSION,applyPackageAtomic,snapshotRotaStorage,bind:watchUntilBound};
    console.info(`[Rota27] restauração atômica de backup v${VERSION} carregada.`);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
