/* Rota 27 v0.25.69 — organização do Cardápio e categorias por consumo */
(function(){
  'use strict';
  const VERSION='0.25.69';
  const collator=new Intl.Collator('pt-BR',{sensitivity:'base',numeric:true});
  let menuCategory='Todos';
  let usageCache={signature:'',map:new Map()};

  function text(v){return String(v??'').trim();}
  function key(v){return text(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');}
  function same(a,b){return key(a)===key(b);}
  function identity(){
    document.title=`Rota 27 Bodega • Comandas v${VERSION}`;
    const meta=document.querySelector('meta[name="rota27-release-version"]');if(meta)meta.content=VERSION;
    let style=document.getElementById('v02569ReleaseIdentity');
    if(!style){style=document.createElement('style');style.id='v02569ReleaseIdentity';document.head.appendChild(style);}
    style.textContent=`#v14VersionBadge::after{content:"v${VERSION}"!important}`;
  }

  function historySignature(){
    const rows=Array.isArray(state?.history)?state.history:[];
    const first=rows[0]||{},last=rows[rows.length-1]||{};
    return `${rows.length}|${first.id||''}|${first.closedAt||''}|${first.updatedAt||''}|${last.id||''}|${last.closedAt||''}`;
  }

  function usageByCategory(){
    const signature=historySignature();
    if(usageCache.signature===signature)return usageCache.map;
    const usage=new Map();
    const rows=Array.isArray(state?.history)?state.history:[];
    for(const command of rows){
      if(!command||command.internalConsumption===true||command.nonRevenue===true)continue;
      for(const [productId,rawQty] of Object.entries(command.items||{})){
        const qty=Number(rawQty||0);if(!(qty>0))continue;
        const snapshot=command.itemMeta?.[productId]||productById(productId)||null;
        const cat=text(snapshot?.cat);if(!cat)continue;
        const k=key(cat);usage.set(k,(usage.get(k)||0)+qty);
      }
    }
    usageCache={signature,map:usage};
    return usage;
  }

  function orderedCategories(source,{consumptionOrder=true}={}){
    const raw=[...new Set((source||[]).map(text).filter(Boolean))];
    const beer=raw.find(c=>same(c,'Cervejas'))||null;
    const drinks=raw.find(c=>same(c,'Bebidas'))||null;
    const fixed=[beer,drinks].filter(Boolean);
    const scores=consumptionOrder?usageByCategory():null;
    const rest=raw.filter(c=>!fixed.some(f=>same(c,f)));
    rest.sort((a,b)=>{
      if(consumptionOrder){
        const delta=(scores?.get(key(b))||0)-(scores?.get(key(a))||0);
        if(delta)return delta;
      }
      return collator.compare(a,b);
    });
    return ['Todos',...fixed,...rest];
  }

  function saleCategories(){return orderedCategories(activeCatalog().map(p=>p.cat),{consumptionOrder:true});}
  function menuCategories(){return orderedCategories(allCategories(),{consumptionOrder:false});}

  function ensureMenuChips(){
    const screen=document.getElementById('screenMenu');
    const list=document.getElementById('menuList');
    if(!screen||!list)return null;
    let chips=document.getElementById('v02569MenuCategoryChips');
    if(!chips){
      chips=document.createElement('div');
      chips.id='v02569MenuCategoryChips';
      chips.className='chips v02569-menu-chips';
      list.insertAdjacentElement('beforebegin',chips);
    }
    return chips;
  }

  function renderMenuChips(cats){
    const chips=ensureMenuChips();if(!chips)return;
    if(!cats.includes(menuCategory))menuCategory='Todos';
    chips.innerHTML='';
    cats.forEach(cat=>{
      const b=document.createElement('button');b.type='button';b.className='chip'+(same(cat,menuCategory)?' active':'');b.textContent=cat;
      b.onclick=()=>{menuCategory=cat;renderMenu();};chips.appendChild(b);
    });
  }

  function renderMenuV02569(){
    updateWhatsappConfigUI();
    const q=key(document.getElementById('searchMenu')?.value||'');
    const cats=menuCategories();renderMenuChips(cats);
    const all=[...state.catalog].sort((a,b)=>collator.compare(text(a.name),text(b.name))||collator.compare(text(a.cat),text(b.cat)));
    const rows=all.filter(p=>{
      const categoryOk=same(menuCategory,'Todos')||same(p.cat,menuCategory);
      const searchOk=!q||key(p.name).includes(q)||key(p.cat).includes(q);
      return categoryOk&&searchOk;
    });
    const count=document.getElementById('menuCount');if(count)count.textContent=`${state.catalog.filter(p=>p.active!==false).length}/${state.catalog.length}`;
    const empty=document.getElementById('menuEmpty');if(empty)empty.style.display=rows.length?'none':'block';
    const list=document.getElementById('menuList');if(!list)return;list.innerHTML='';
    rows.forEach(p=>{
      const el=document.createElement('div');el.className='menu-item'+(p.active===false?' inactive':'');
      const catInactive=!isCategoryActive(p.cat);
      el.innerHTML=`<div class="menu-emoji">${escapeHtml(p.emoji||'🍽️')}</div><div class="menu-info"><h4>${escapeHtml(p.name)}</h4><div class="menu-meta"><span>${escapeHtml(p.cat)}</span><span class="status-dot ${p.active===false?'off':''}">${p.active===false?'○ Produto inativo':'● Produto ativo'}</span>${catInactive?'<span class="category-status-pill off">Categoria inativa</span>':''}</div></div><div class="menu-right"><strong>${money(p.price)}</strong><button class="menu-edit" onclick="event.stopPropagation();openMenuItemSheet('${p.id}')">Editar</button></div>`;
      el.onclick=()=>openMenuItemSheet(p.id);list.appendChild(el);
    });
  }

  function patch(){
    if(typeof categories==='function'&&categories.__v02569!==true){const next=function(){return saleCategories();};next.__v02569=true;categories=next;}
    if(typeof renderMenu==='function'&&renderMenu.__v02569!==true){renderMenuV02569.__v02569=true;renderMenu=renderMenuV02569;}
  }

  function refresh(){
    identity();patch();
    if(document.getElementById('screenMenu')?.classList.contains('active'))renderMenuV02569();
    if(document.getElementById('screenSale')?.classList.contains('active')&&typeof renderSale==='function')renderSale();
  }

  function start(){
    identity();patch();
    const search=document.getElementById('searchMenu');
    if(search&&!search.dataset.v02569){search.dataset.v02569='1';search.addEventListener('input',()=>renderMenuV02569());}
    document.addEventListener('click',e=>{if(e.target.closest?.('#navMenu'))setTimeout(()=>{identity();patch();renderMenuV02569();},0);});
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')identity();});
    window.Rota27V02569MenuCategoryOrder={version:VERSION,refresh,usageByCategory,saleCategories,menuCategories};
    console.info('[Rota27] v0.25.69 — Cardápio alfabético e categorias ordenadas.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
