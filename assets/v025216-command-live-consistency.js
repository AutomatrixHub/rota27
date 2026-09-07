/* Rota 27 v0.25.216 — consistência ao vivo de itens de comanda
 * Canonicaliza add/editar/remover/desfazer para que persistência, item_delta,
 * WhatsApp e UI aconteçam na mesma mutação e reduz a latência de pull visível.
 */
(function(){
  'use strict';
  if(window.Rota27V025216CommandLiveConsistency)return;

  const VERSION='0.25.216';
  const DOMAIN_CURSOR_KEY='rota27_v017_domain_cursor_v1';
  const DOMAIN_REPLAY_KEY='rota27_v025216_domain_replay_v1';
  const LIVE_PULL_MS=2800;
  const DOMAIN_PULL_MS=5600;
  let fastSyncTimer=null;
  let lastDomainPull=0;

  const byId=id=>document.getElementById(id);

  function command(){try{return typeof currentCommand==='function'?currentCommand():null;}catch{return null;}}
  function productFor(c,id){
    try{if(c&&typeof lineProduct==='function'){const p=lineProduct(c,id);if(p)return p;}}catch{}
    try{if(typeof productById==='function')return productById(id)||null;}catch{}
    return null;
  }
  function product(id){return productFor(command(),id);}
  function testMode(){
    try{return window.Rota27V02581TestMode?.isActive?.()===true||document.body?.classList.contains('v02581-test-mode');}catch{return false;}
  }
  function persist(reason){
    let committed=false;
    if(!testMode()&&typeof window.v15CommitCoreMutation==='function'){
      try{committed=window.v15CommitCoreMutation(reason)===true;}catch(err){console.warn('[Rota27 v0.25.216] commit central:',err);}
    }
    try{if(typeof save==='function')save();}catch(err){console.warn('[Rota27 v0.25.216] save:',err);}
    return committed;
  }
  function whatsappDelta(c,p,delta){
    if(!c||!p||!delta)return;
    try{if(typeof window.queueWhatsappDelta==='function')window.queueWhatsappDelta(c,p,delta);else if(typeof queueWhatsappDelta==='function')queueWhatsappDelta(c,p,delta);}catch(err){console.warn('[Rota27 v0.25.216] WhatsApp delta:',err);}
  }
  function renderNow(){
    try{if(typeof renderSale==='function')renderSale();}catch{}
    try{if(typeof renderCart==='function'&&byId('cartWrap')?.classList.contains('open'))renderCart();}catch{}
    try{if(typeof renderCommands==='function')renderCommands();}catch{}
  }
  function scheduleFastSync(){
    clearTimeout(fastSyncTimer);
    fastSyncTimer=setTimeout(()=>{
      try{window.v15SyncNow?.();}catch{}
      try{window.Rota27V017?.syncDomainNow?.();}catch{}
    },140);
  }
  function announce(c,id,delta){
    try{window.dispatchEvent(new CustomEvent('rota27:command-item-mutated',{detail:{commandId:String(c?.id||''),productId:String(id||''),delta:Number(delta||0),at:Date.now()}}));}catch{}
  }
  function afterMutation(c,id,p,delta,reason){
    if(!c||!p||!delta)return;
    persist(reason);
    whatsappDelta(c,{...p,id},delta);
    renderNow();
    announce(c,id,delta);
    scheduleFastSync();
  }

  function canonicalAddProduct(id){
    const c=command();if(!c)return;
    let p=null;try{p=typeof productById==='function'?productById(id):null;}catch{}
    if(!p||p.active===false)return;
    c.items=c.items&&typeof c.items==='object'?c.items:{};
    c.itemMeta=c.itemMeta&&typeof c.itemMeta==='object'?c.itemMeta:{};
    if(!Number(c.items[id]||0))c.itemMeta[id]={name:p.name,cat:p.cat,price:p.price,emoji:p.emoji||'🍽️'};
    c.items[id]=Number(c.items[id]||0)+1;
    c.updatedAt=Date.now();
    afterMutation(c,id,p,1,'command-item-add');
    try{lastUndo={commandId:c.id,productId:id};}catch{}
    try{if(typeof showToast==='function')showToast(`${p.name} adicionado`,true);}catch{}
  }

  function canonicalChangeQty(id,delta){
    const c=command();if(!c)return;
    const p=product(id);if(!p)return;
    c.items=c.items&&typeof c.items==='object'?c.items:{};
    c.itemMeta=c.itemMeta&&typeof c.itemMeta==='object'?c.itemMeta:{};
    const before=Number(c.items[id]||0),after=Math.max(0,before+Number(delta||0)),actual=after-before;
    if(!actual)return;
    if(after>0)c.items[id]=after;else{delete c.items[id];delete c.itemMeta[id];}
    c.updatedAt=Date.now();
    afterMutation(c,id,p,actual,'command-item-qty');
  }

  function canonicalRemoveItem(id){
    const c=command();if(!c)return;
    const p=product(id),qty=Math.max(0,Number(c.items?.[id]||0));if(!p||!qty)return;
    delete c.items[id];if(c.itemMeta)delete c.itemMeta[id];
    c.updatedAt=Date.now();
    afterMutation(c,id,p,-qty,'command-item-remove');
    try{if(typeof showToast==='function')showToast(`${p.name||'Produto'} removido da comanda.`,false);}catch{}
  }

  function canonicalUndoLast(){
    let ref=null;try{ref=lastUndo;}catch{}
    if(!ref)return;
    let c=null;try{c=(state?.commands||[]).find(x=>String(x.id)===String(ref.commandId));}catch{}
    if(c&&Number(c.items?.[ref.productId]||0)>0){
      const id=String(ref.productId),p=productFor(c,id);
      if(p){
        const next=Number(c.items[id]||0)-1;
        if(next>0)c.items[id]=next;else{delete c.items[id];if(c.itemMeta)delete c.itemMeta[id];}
        c.updatedAt=Date.now();
        afterMutation(c,id,p,-1,'command-item-undo');
        try{if(typeof showToast==='function')showToast('Último lançamento desfeito',false);}catch{}
      }
    }
    try{lastUndo=null;}catch{}
  }

  function installCanonicalMutations(){
    canonicalAddProduct.__r27v025216=true;
    canonicalChangeQty.__r27v025216=true;
    canonicalRemoveItem.__r27v025216=true;
    canonicalUndoLast.__r27v025216=true;
    try{window.addProduct=canonicalAddProduct;addProduct=canonicalAddProduct;}catch{try{window.addProduct=canonicalAddProduct;}catch{}}
    try{window.changeQty=canonicalChangeQty;changeQty=canonicalChangeQty;}catch{try{window.changeQty=canonicalChangeQty;}catch{}}
    try{window.removeItem=canonicalRemoveItem;removeItem=canonicalRemoveItem;}catch{try{window.removeItem=canonicalRemoveItem;}catch{}}
    try{window.undoLast=canonicalUndoLast;undoLast=canonicalUndoLast;}catch{try{window.undoLast=canonicalUndoLast;}catch{}}
  }

  function repairDomainReplayOnce(){
    try{
      if(localStorage.getItem(DOMAIN_REPLAY_KEY)===VERSION)return;
      const old=Math.max(0,Number(localStorage.getItem(DOMAIN_CURSOR_KEY)||0));
      localStorage.setItem('rota27_v025216_domain_cursor_backup_v1',String(old));
      localStorage.setItem(DOMAIN_CURSOR_KEY,'0');
      localStorage.setItem(DOMAIN_REPLAY_KEY,VERSION);
    }catch{}
  }

  function livePull(){
    if(document.visibilityState!=='visible'||!navigator.onLine)return;
    const active=byId('screenSale')?.classList.contains('active')||byId('screenCommands')?.classList.contains('active')||byId('screenPanel')?.classList.contains('active');
    if(!active)return;
    try{window.v15SyncNow?.({pullOnly:true});}catch{}
    const now=Date.now();
    if(now-lastDomainPull>=DOMAIN_PULL_MS){lastDomainPull=now;try{window.Rota27V017?.syncDomainNow?.();}catch{}}
  }

  function start(){
    repairDomainReplayOnce();
    installCanonicalMutations();
    setTimeout(()=>{installCanonicalMutations();livePull();},350);
    setInterval(livePull,LIVE_PULL_MS);
    window.addEventListener('online',()=>{installCanonicalMutations();scheduleFastSync();setTimeout(livePull,180);});
    window.addEventListener('focus',()=>setTimeout(livePull,80));
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){installCanonicalMutations();setTimeout(livePull,80);}});
    window.Rota27V025216CommandLiveConsistency={version:VERSION,refresh:installCanonicalMutations,sync:livePull};
    console.info('[Rota27] v0.25.216 consistência ao vivo de itens ativa.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
