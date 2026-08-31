/* Rota 27 v0.25.81 — Modo Teste Global
 * Sandbox reversível em memória. Reutiliza catálogo, categorias e clientes reais
 * como referência, mas nunca persiste alterações de teste nem chama integrações externas.
 */
(function(){
  'use strict';
  if(window.Rota27V02581TestMode)return;

  const VERSION='0.25.81';
  const DAY=86400000;
  const TEST_CLASS='v02581-test-mode';
  const STORAGE_PREFIX=/^(rota27_|r27_)/i;
  const sandbox=new Map();
  let active=false;
  let realStateSnapshot=null;
  let generated=null;
  let originalSave=null;
  let saveGuard=null;
  let originalFetch=window.fetch?.bind(window)||null;
  let originalOpen=window.open?.bind(window)||null;

  const storageProto=window.Storage?.prototype;
  const nativeStorage={
    get:storageProto?.getItem,
    set:storageProto?.setItem,
    remove:storageProto?.removeItem,
    clear:storageProto?.clear
  };

  const byId=id=>document.getElementById(id);
  const clone=v=>JSON.parse(JSON.stringify(v==null?null:v));
  const clean=(v,max=180)=>String(v??'').replace(/[\u0000-\u001f\u007f]/g,' ').trim().replace(/\s+/g,' ').slice(0,max);
  const round2=v=>Math.round(Number(v||0)*100)/100;
  const localDateKey=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const realGet=key=>nativeStorage.get?nativeStorage.get.call(localStorage,String(key)):null;

  function toast(message){
    try{if(typeof showToast==='function')showToast(message,false);else console.info('[Rota27]',message);}catch{}
  }

  function shouldVirtualize(storage,key){
    return active&&storage===localStorage&&STORAGE_PREFIX.test(String(key||''));
  }

  function installStorageVirtualization(){
    if(!storageProto||storageProto.__v02581TestVirtualized)return;
    const baseGet=nativeStorage.get,baseSet=nativeStorage.set,baseRemove=nativeStorage.remove,baseClear=nativeStorage.clear;
    storageProto.getItem=function(key){
      if(shouldVirtualize(this,key)){
        const k=String(key);
        if(sandbox.has(k))return sandbox.get(k);
        const value=baseGet.call(this,k);
        sandbox.set(k,value);
        return value;
      }
      return baseGet.call(this,key);
    };
    storageProto.setItem=function(key,value){
      if(shouldVirtualize(this,key)){sandbox.set(String(key),String(value));return;}
      return baseSet.call(this,key,value);
    };
    storageProto.removeItem=function(key){
      if(shouldVirtualize(this,key)){sandbox.delete(String(key));return;}
      return baseRemove.call(this,key);
    };
    storageProto.clear=function(){
      if(active&&this===localStorage){
        Array.from(sandbox.keys()).forEach(k=>{if(STORAGE_PREFIX.test(k))sandbox.delete(k);});
        return;
      }
      return baseClear.call(this);
    };
    storageProto.__v02581TestVirtualized=true;
  }

  function blockedExternalUrl(value){
    const url=String(typeof value==='string'?value:(value?.url||value?.href||''));
    return /\/functions\/v1\//i.test(url)||/wa\.me|api\.whatsapp\.com|web\.whatsapp\.com/i.test(url);
  }

  function installNetworkGuard(){
    if(originalFetch&&!window.fetch?.__v02581Guard){
      const guardedFetch=function(input,init){
        if(active&&blockedExternalUrl(input)){
          console.info('[Rota27 v0.25.81] Integração externa bloqueada no Modo Teste:',String(input?.url||input||''));
          return Promise.reject(new Error('Integração externa bloqueada no Modo Teste.'));
        }
        return originalFetch(input,init);
      };
      guardedFetch.__v02581Guard=true;
      window.fetch=guardedFetch;
    }
    if(originalOpen&&!window.open?.__v02581Guard){
      const guardedOpen=function(url){
        if(active&&blockedExternalUrl(url)){toast('WhatsApp e integrações externas estão desativados no Modo Teste.');return null;}
        return originalOpen.apply(window,arguments);
      };
      guardedOpen.__v02581Guard=true;
      window.open=guardedOpen;
    }
    document.addEventListener('click',event=>{
      if(!active)return;
      const a=event.target.closest?.('a[href]');
      if(a&&blockedExternalUrl(a.href)){
        event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
        toast('WhatsApp está desativado no Modo Teste.');
      }
    },true);
  }

  function installSaveGuard(){
    let current=null;
    try{current=window.save||save;}catch{current=window.save;}
    if(typeof current!=='function'||current.__v02581SaveGuard)return;
    originalSave=current;
    saveGuard=function(){
      if(active)return true;
      return originalSave.apply(this,arguments);
    };
    saveGuard.__v02581SaveGuard=true;
    saveGuard.__v02581Base=originalSave;
    try{window.save=saveGuard;}catch{}
    try{save=saveGuard;}catch{}
  }

  function realCatalog(){try{return clone(Array.isArray(state?.catalog)?state.catalog:[]);}catch{return [];}}
  function realCategories(){try{return clone(Array.isArray(state?.categories)?state.categories:[]);}catch{return [];}}
  function realClients(){try{return clone(Array.isArray(state?.clients)?state.clients:[]);}catch{return [];}}

  function ensureCatalog(rows,categories){
    const products=(Array.isArray(rows)?rows:[]).filter(p=>p&&p.id&&p.name).map(p=>({...clone(p),price:Number(p.price||0)}));
    const cats=(Array.isArray(categories)?categories:[]).map(x=>typeof x==='string'?x:(x?.name||x?.label||'')).filter(Boolean);
    const fallbackCats=cats.length?cats:['Cervejas','Queijos','Petiscos','Mercearia'];
    const additions=[
      ['teste_cerveja_lager','Cerveja Lager Teste',18.9],['teste_queijo_canastra','Queijo Artesanal Teste',32.9],
      ['teste_torresmo','Torresmo Crocante Teste',24.9],['teste_biscoito','Biscoito Capixaba Teste',14.9],
      ['teste_castanhas','Mix de Castanhas Teste',21.9],['teste_doce','Doce Artesanal Teste',16.9]
    ];
    let i=0;
    while(products.length<14&&i<additions.length){
      const [id,name,price]=additions[i];
      products.push({id,name,price,cat:fallbackCats[i%fallbackCats.length],active:true,emoji:'🍽️'});i++;
    }
    return products;
  }

  function ensureClients(rows){
    const clients=(Array.isArray(rows)?rows:[]).filter(c=>c&&c.id&&c.name).map(clone);
    const names=['Cliente Teste Ana','Cliente Teste Bruno','Cliente Teste Carla','Cliente Teste Diego','Cliente Teste Elisa','Cliente Teste Felipe','Cliente Teste Gabriela','Cliente Teste Hugo'];
    let i=0;
    while(clients.length<14&&i<names.length){
      const now=Date.now();
      clients.push({id:`test_cli_${i+1}`,name:names[i],whatsappPhone:'',notes:'Cadastro fictício do Modo Teste',firstSeenAt:now-35*DAY,lastSeenAt:now-(i+1)*DAY,source:'test'});i++;
    }
    return clients;
  }

  function productCategory(p){return clean(p?.cat||p?.category||'Outros',80)||'Outros';}
  function productPrice(p){const n=Number(p?.price||0);return n>0?n:10;}

  function pickItems(products,seed,count){
    const items={},itemMeta={};
    const len=Math.max(products.length,1);
    for(let j=0;j<count;j++){
      const p=products[(seed*3+j*5)%len];if(!p)continue;
      const qty=1+((seed+j*2)%3);
      items[String(p.id)]=(items[String(p.id)]||0)+qty;
      itemMeta[String(p.id)]={id:String(p.id),name:p.name,cat:productCategory(p),price:productPrice(p),emoji:p.emoji||'🍽️'};
    }
    return {items,itemMeta};
  }

  function calcTotal(items,itemMeta){
    return round2(Object.entries(items||{}).reduce((sum,[id,qty])=>sum+Number(qty||0)*Number(itemMeta?.[id]?.price||0),0));
  }

  function generateHistory(products,clients){
    const history=[];
    const now=new Date();now.setHours(12,0,0,0);
    const payments=['Pix','Crédito','Débito','Dinheiro'];
    let seq=1;
    for(let offset=-40;offset<=-1;offset++){
      const d=new Date(now);d.setDate(d.getDate()+offset);
      if(d.getDay()===0)continue;
      const friday=d.getDay()===5,saturday=d.getDay()===6;
      const count=(friday||saturday)?6+(seq%3):3+(seq%3);
      for(let k=0;k<count;k++){
        const opened=new Date(d);opened.setHours(17+(k%5),10+(k*7)%45,0,0);
        const closed=new Date(opened);closed.setMinutes(closed.getMinutes()+35+((seq*13)%90));
        const client=clients.length&&((seq+k)%4!==0)?clients[(seq*2+k*3)%clients.length]:null;
        const pair=pickItems(products,seq+k,1+((seq+k)%4));
        const total=calcTotal(pair.items,pair.itemMeta);
        const location=(k%5===0)?'Balcão':(k%4===0?`Parklet ${1+(k%3)}`:`Mesa ${1+(k%12)}`);
        history.push({
          id:`test_hist_${localDateKey(d)}_${k+1}`,
          table:location,
          customer:client?.name||'',
          whatsappPhone:client?.whatsappPhone||'',
          whatsappOptIn:client?.whatsappPhone?true:false,
          items:pair.items,itemMeta:pair.itemMeta,
          createdAt:opened.getTime(),openedAt:opened.getTime(),updatedAt:closed.getTime(),closedAt:closed.getTime(),
          businessDate:localDateKey(d),paymentMethod:payments[(seq+k)%payments.length],total,cancelled:false,testMode:true
        });
      }
      seq++;
    }
    return history.sort((a,b)=>Number(b.closedAt)-Number(a.closedAt));
  }

  function generateOpenCommands(products,clients){
    const d=new Date();
    if(d.getDay()===0)return [];
    const rows=[];
    for(let i=0;i<4;i++){
      const client=clients.length?clients[(i*3+1)%clients.length]:null;
      const pair=pickItems(products,80+i,1+(i%3));
      const opened=Date.now()-(18+i*11)*60000;
      rows.push({
        id:`test_open_${i+1}`,table:i===0?'Balcão':(i===3?'Parklet 2':`Mesa ${i+2}`),
        customer:client?.name||'',whatsappPhone:client?.whatsappPhone||'',whatsappOptIn:!!client?.whatsappPhone,
        items:pair.items,itemMeta:pair.itemMeta,createdAt:opened,openedAt:opened,updatedAt:opened,businessDate:localDateKey(new Date()),cancelled:false,testMode:true
      });
    }
    return rows;
  }

  function closureFromDay(date,rows){
    const products=new Map(),payments=new Map();let revenue=0,units=0;
    rows.forEach(c=>{
      revenue+=Number(c.total||0);payments.set(c.paymentMethod,(payments.get(c.paymentMethod)||0)+Number(c.total||0));
      Object.entries(c.items||{}).forEach(([id,qty])=>{
        const meta=c.itemMeta?.[id]||{};units+=Number(qty||0);
        const old=products.get(id)||{name:meta.name||'Produto',qty:0,revenue:0};old.qty+=Number(qty||0);old.revenue+=Number(qty||0)*Number(meta.price||0);products.set(id,old);
      });
    });
    const closedAt=Math.max(...rows.map(r=>Number(r.closedAt||0)),0);
    return {
      id:`test_turn_${date}`,businessDate:date,closedAt,closedAtIso:new Date(closedAt).toISOString(),
      deviceId:'test',deviceName:'Modo Teste',storeId:'rota27-test',appVersion:VERSION,schemaVersion:1,testMode:true,
      summary:{revenue:round2(revenue),closedCount:rows.length,cancelled:0,units,avgTicket:rows.length?round2(revenue/rows.length):0,openCount:0,openValue:0,
        products:[...products.values()].sort((a,b)=>b.qty-a.qty).slice(0,10),
        payments:[...payments.entries()].map(([name,value])=>({name,value:round2(value)}))}
    };
  }

  function generateClosures(history){
    const grouped={};history.forEach(c=>(grouped[c.businessDate]||(grouped[c.businessDate]=[])).push(c));
    return Object.entries(grouped).map(([date,rows])=>closureFromDay(date,rows)).sort((a,b)=>b.closedAt-a.closedAt);
  }

  function salesByProduct(history){
    const totals={};history.forEach(c=>Object.entries(c.items||{}).forEach(([id,q])=>totals[id]=(totals[id]||0)+Number(q||0)));return totals;
  }

  function seedOperationalStorage(products,history,closures){
    sandbox.clear();
    const controlled=products.slice(0,Math.min(12,products.length));
    const sold=salesByProduct(history);
    const cfg={},mov=[];
    controlled.forEach((p,i)=>{
      const soldQty=Number(sold[p.id]||0);const initial=Math.ceil(soldQty+18+(i%5)*4);
      cfg[p.id]={productId:String(p.id),name:p.name,enabled:true,minQty:4+(i%5),initialQty:initial,createdAt:Date.now()-40*DAY,updatedAt:Date.now()-3*DAY,testMode:true};
      history.forEach(c=>{const qty=Number(c.items?.[p.id]||0);if(qty>0)mov.push({id:`test_stock_${c.id}_${p.id}`,productId:String(p.id),productName:p.name,delta:-qty,type:'sale',reason:`Venda simulada ${c.table||c.customer||''}`,createdAt:Number(c.closedAt||0),createdAtIso:new Date(Number(c.closedAt||0)).toISOString(),deviceId:'test',deviceName:'Modo Teste',commandId:c.id,appVersion:VERSION,testMode:true});});
    });

    const suppliers=[
      {id:'test_sup_1',name:'Distribuidora Capixaba Teste',phone:'',active:true,productIds:controlled.slice(0,4).map(p=>String(p.id)),testMode:true},
      {id:'test_sup_2',name:'Artesanais do ES Teste',phone:'',active:true,productIds:controlled.slice(4,8).map(p=>String(p.id)),testMode:true},
      {id:'test_sup_3',name:'Empório Regional Teste',phone:'',active:true,productIds:controlled.slice(8).map(p=>String(p.id)),testMode:true}
    ];
    const receipts=[];
    [31,22,13,6].forEach((daysAgo,r)=>{
      const createdAt=Date.now()-daysAgo*DAY;
      const subset=controlled.filter((_,i)=>i%4===r%4).slice(0,5);
      const items=subset.map((p,i)=>{const qty=10+((r+i)%4)*4,unitCost=round2(productPrice(p)*(.48+((i%3)*.04)));return {productId:String(p.id),productName:p.name,qty,unitCost,lineCost:round2(qty*unitCost)};});
      const supplier=suppliers[r%suppliers.length];
      receipts.push({id:`test_receipt_${r+1}`,supplierId:supplier.id,supplierName:supplier.name,createdAt,receivedAt:createdAt,status:'received',items,freightCost:12+r*3,testMode:true});
      items.forEach(item=>mov.push({id:`test_entry_${r+1}_${item.productId}`,productId:item.productId,productName:item.productName,delta:Number(item.qty),type:'entry',reason:`Recebimento simulado ${supplier.name}`,createdAt,createdAtIso:new Date(createdAt).toISOString(),deviceId:'test',deviceName:'Modo Teste',appVersion:VERSION,testMode:true}));
    });
    const orders=receipts.map((r,i)=>({id:`test_order_${i+1}`,supplierId:r.supplierId,supplierName:r.supplierName,createdAt:r.createdAt-2*DAY,updatedAt:r.createdAt,status:'received',items:clone(r.items),testMode:true}));
    orders.push({id:'test_order_pending',supplierId:suppliers[0].id,supplierName:suppliers[0].name,createdAt:Date.now()-DAY,status:'pending',items:controlled.slice(0,3).map(p=>({productId:String(p.id),productName:p.name,qty:8})),testMode:true});

    const put=(k,v)=>sandbox.set(k,JSON.stringify(v));
    put('rota27_v021_stock_cfg_v1',cfg);put('rota27_v021_stock_mov_v1',mov);put('rota27_v021_stock_outbox_v1',[]);put('rota27_v021_stock_meta_v1',{testMode:true});
    put('rota27_v022_suppliers_v1',suppliers);put('rota27_v022_purchase_orders_v1',orders);put('rota27_v022_purchase_receipts_v1',receipts);put('rota27_v022_purchase_outbox_v1',[]);put('rota27_v022_purchase_meta_v1',{testMode:true});
    put('rota27_v023_inventories_v1',[]);put('rota27_v023_inventory_outbox_v1',[]);put('rota27_v023_inventory_meta_v1',{testMode:true});
    put('rota27_v024_cost_meta_v1',{testMode:true});
    put('rota27_v019_turn_closures_v1',closures);put('rota27_v019_turn_outbox_v1',[]);put('rota27_v019_turn_meta_v1',{testMode:true});
    put('rota27_v017_domain_outbox_v1',[]);
    const syncRaw=realGet('rota27_sync_config_v1');
    let sync={};try{sync=JSON.parse(syncRaw||'{}')||{};}catch{}
    put('rota27_sync_config_v1',{...sync,enabled:false,testMode:true,lastError:'Modo Teste: sincronização desativada.'});
  }

  function buildScenario(){
    const baseCatalog=realCatalog(),baseCategories=realCategories(),baseClients=realClients();
    const catalog=ensureCatalog(baseCatalog,baseCategories);const clients=ensureClients(baseClients);
    const categories=baseCategories.length?baseCategories:([...new Set(catalog.map(productCategory))]);
    const history=generateHistory(catalog,clients);const commands=generateOpenCommands(catalog,clients);const closures=generateClosures(history);
    generated={catalog,categories,clients,history,commands,closures,generatedAt:Date.now()};
    seedOperationalStorage(catalog,history,closures);
    return generated;
  }

  function applyScenario(){
    if(!generated)buildScenario();
    try{
      const base=realStateSnapshot?clone(realStateSnapshot):{};
      const next={...base,catalog:clone(generated.catalog),categories:clone(generated.categories),clients:clone(generated.clients),history:clone(generated.history),commands:clone(generated.commands)};
      if(typeof state!=='undefined')state=next;
      window.state=next;
      try{activeCommandId=null;}catch{}
    }catch(err){console.error('[Rota27 v0.25.81] Falha ao aplicar cenário:',err);}
  }

  function refreshScreens(){
    const calls=['renderCommands','renderMenu','renderHistory','renderCart','renderSale'];
    calls.forEach(name=>{try{if(typeof window[name]==='function')window[name]();else if(typeof globalThis[name]==='function')globalThis[name]();}catch{}});
    try{window.Rota27V021?.refresh?.();}catch{}
    try{window.Rota27V022?.refresh?.();}catch{}
    try{window.Rota27V023?.refresh?.();}catch{}
    try{window.Rota27V024?.refresh?.();}catch{}
    try{window.Rota27V025?.refresh?.();}catch{}
    window.dispatchEvent(new CustomEvent('rota27:test-mode-changed',{detail:{active,version:VERSION}}));
    window.dispatchEvent(new CustomEvent('rota27:v017-domain-updated'));
  }

  function closeHelp(){try{byId('r27HelpOverlay')?.classList.remove('open');}catch{}}

  function setVisualState(){
    document.body.classList.toggle(TEST_CLASS,active);
    let badge=byId('v02581TestBadge');
    if(active&&!badge){badge=document.createElement('button');badge.id='v02581TestBadge';badge.type='button';badge.innerHTML='<span>🧪</span><strong>MODO TESTE</strong><small>Sair</small>';document.body.appendChild(badge);badge.addEventListener('click',()=>disable(true));}
    if(badge)badge.hidden=!active;
    const theme=document.querySelector('meta[name="theme-color"]');if(theme)theme.content=active?'#4f46a5':'#F5E9D5';
    updateHelpSection();
  }

  function enable(){
    if(active)return true;
    if(!window.confirm('Ativar o Modo Teste?\n\nO aplicativo usará dados fictícios por cerca de 40 dias. Seus dados reais permanecerão preservados; sincronização e WhatsApp ficarão bloqueados até você sair do teste.'))return false;
    try{realStateSnapshot=clone(typeof state!=='undefined'?state:(window.state||{}));}catch{realStateSnapshot=clone(window.state||{});}
    buildScenario();active=true;applyScenario();setVisualState();refreshScreens();closeHelp();
    toast('Modo Teste ativado. Dados reais permanecem intactos.');return true;
  }

  function regenerate(){
    if(!active)return enable();
    if(!window.confirm('Regenerar o cenário fictício?\n\nAs alterações feitas durante este teste serão descartadas. Os dados reais continuam intactos.'))return false;
    buildScenario();applyScenario();setVisualState();refreshScreens();toast('Cenário de teste regenerado.');return true;
  }

  function disable(ask=false){
    if(!active)return true;
    if(ask&&!window.confirm('Sair do Modo Teste e voltar aos dados reais?'))return false;
    active=false;sandbox.clear();
    try{const restored=clone(realStateSnapshot||{});if(typeof state!=='undefined')state=restored;window.state=restored;try{activeCommandId=null;}catch{}}catch{}
    generated=null;realStateSnapshot=null;setVisualState();refreshScreens();toast('Dados reais restaurados.');return true;
  }

  function updateHelpSection(){
    const content=document.querySelector('#r27HelpOverlay .r27-help-content');if(!content)return false;
    let section=byId('r27-help-global-test-v02581');
    if(!section){section=document.createElement('details');section.id='r27-help-global-test-v02581';section.className='r27-help-section v02581-help-test';content.appendChild(section);}
    section.innerHTML=`<summary><span class="r27-help-section-icon">🧪</span><span><strong>Modo Teste Global</strong><small>Explore todo o Rota 27 com dados fictícios sem alterar a operação real.</small></span><span class="r27-help-chevron">⌄</span></summary><div class="r27-help-section-body"><p>O cenário de teste usa os <strong>clientes, produtos e categorias atuais</strong> como base e completa a amostra quando necessário. São gerados cerca de <strong>40 dias corridos</strong> de movimento, sem vendas aos domingos.</p><div class="r27-help-tip"><strong>Proteção:</strong> dados de teste ficam isolados em memória. Sincronização, Edge Functions e WhatsApp real ficam bloqueados enquanto o modo estiver ativo.</div><div class="v02581-help-actions">${active?'<button type="button" data-v02581-regenerate>↻ Regenerar cenário</button><button type="button" class="danger" data-v02581-disable>Sair do Modo Teste</button>':'<button type="button" class="primary" data-v02581-enable>🧪 Ativar Modo Teste</button>'}</div></div>`;
    return true;
  }

  function clickHandler(event){
    if(event.target.closest?.('[data-v02581-enable]')){event.preventDefault();enable();return;}
    if(event.target.closest?.('[data-v02581-regenerate]')){event.preventDefault();regenerate();return;}
    if(event.target.closest?.('[data-v02581-disable]')){event.preventDefault();disable(true);return;}
    if(event.target.closest?.('#r27HelpBtn,[data-help]'))setTimeout(updateHelpSection,80);
  }

  function start(){
    installStorageVirtualization();installNetworkGuard();installSaveGuard();setVisualState();updateHelpSection();
    document.addEventListener('click',clickHandler);
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){installSaveGuard();setVisualState();updateHelpSection();}});
    window.addEventListener('beforeunload',()=>{if(active){active=false;sandbox.clear();}});
    window.Rota27V02581TestMode={version:VERSION,isActive:()=>active,enable,disable,regenerate,scenario:()=>clone(generated),refresh:()=>{installSaveGuard();setVisualState();updateHelpSection();}};
    console.info('[Rota27] v0.25.81 — Modo Teste Global disponível (desligado por padrão).');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
