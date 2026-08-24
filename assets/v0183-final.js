/* Rota 27 v0.18.3 — selo final + navegação + Ajuda Tema Capixaba */
(function(){
  'use strict';

  const VERSION='0.18.3';
  const LABEL='v0.18.3';
  const TITLE='Rota 27 Bodega • Comandas v0.18.3';
  const CARD_STYLE_ID='r27-v0183-card-refine';
  let badgeObserver=null;
  let titleObserver=null;

  function normalize(value){
    return String(value||'')
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .toLowerCase().trim();
  }

  function applyVersion(){
    const badge=document.getElementById('v14VersionBadge');
    if(badge&&badge.textContent!==LABEL)badge.textContent=LABEL;
    if(document.title!==TITLE)document.title=TITLE;
    try{window.ROTA27_SYNC_DEV_VERSION=VERSION;}catch{}
  }

  /*
   * O logo original da base é um data URI já validado nos aparelhos.
   * Não reescrevemos mais o src: isso evita o quadro vazio observado na candidata.
   */
  function preserveBaseLogo(){
    const img=document.querySelector('.logo-image');
    if(!img)return;
    img.setAttribute('alt','Rota 27 Bodega');
  }

  /*
   * Acento lateral das comandas:
   * - uma única curva natural, produzida pelo inset-shadow e recortada pelo raio do card;
   * - laranja fino na parte superior;
   * - preto somente no trecho inferior;
   * - remove o antigo fragmento horizontal no canto superior esquerdo.
   */
  function injectCardRefinementStyles(){
    if(document.getElementById(CARD_STYLE_ID))return;
    const style=document.createElement('style');
    style.id=CARD_STYLE_ID;
    style.textContent=`
      .command-card{
        border-radius:var(--r27-card-radius,28px)!important;
        overflow:hidden!important;
        box-shadow:
          inset 4px 0 0 var(--brand-2),
          0 5px 16px rgba(17,17,17,.05)!important;
      }
      .command-card:before{
        content:""!important;
        position:absolute!important;
        left:0!important;
        top:auto!important;
        bottom:0!important;
        width:4px!important;
        height:31%!important;
        border:0!important;
        border-radius:0!important;
        background:var(--brand)!important;
        box-shadow:none!important;
        transform:none!important;
        pointer-events:none!important;
      }
      .command-card:after{
        content:none!important;
        display:none!important;
        border:0!important;
        box-shadow:none!important;
      }
      @media(max-width:520px){
        .command-card{border-radius:var(--r27-card-radius,25px)!important}
      }
    `;
    document.head.appendChild(style);
  }

  function reorderChildrenByLabel(container,selector,order){
    if(!container)return false;
    const items=Array.from(container.querySelectorAll(selector));
    if(items.length<order.length)return false;
    const map=new Map();
    items.forEach(item=>{
      const label=normalize(item.querySelector('strong,.navlabel')?.textContent||item.textContent);
      if(label)map.set(label,item);
    });
    const ordered=order.map(key=>map.get(key)).filter(Boolean);
    if(ordered.length!==order.length)return false;
    ordered.forEach(item=>container.appendChild(item));
    return true;
  }

  function reorderBottomNavigation(){
    const nav=document.querySelector('.bottomnav');
    if(!nav||nav.dataset.r27V0183Order==='1')return;
    if(reorderChildrenByLabel(nav,'.navbtn',['comandas','cardapio','painel','historico'])){
      nav.dataset.r27V0183Order='1';
    }
  }

  function refineHelp(){
    const overlay=document.getElementById('r27HelpOverlay');
    if(!overlay)return false;

    if(overlay.dataset.r27V0183Help!=='1'){
      const header=overlay.querySelector('.r27-help-header');
      const copy=header?.querySelector('div');
      if(copy&&!copy.querySelector('.r27-help-capixaba-badge')){
        const badge=document.createElement('span');
        badge.className='r27-help-capixaba-badge';
        badge.textContent='Identidade Capixaba';
        const h2=copy.querySelector('h2');
        if(h2)copy.insertBefore(badge,h2);
        else copy.appendChild(badge);
      }

      const demo=overlay.querySelector('.r27-help-nav-demo');
      reorderChildrenByLabel(demo,':scope > div',['comandas','cardapio','painel','historico']);

      const compare=overlay.querySelector('#r27-help-mapa-app .r27-help-compare');
      reorderChildrenByLabel(compare,':scope > div',['comandas','cardapio','painel','historico']);

      const footer=overlay.querySelector('.r27-help-footer span');
      if(footer)footer.textContent='Ajuda v4.2 • v0.18.3';

      overlay.dataset.r27V0183Help='1';
    }
    return true;
  }

  function protectVersion(){
    applyVersion();
    const badge=document.getElementById('v14VersionBadge');
    const title=document.querySelector('title');
    if(badge&&!badgeObserver){
      badgeObserver=new MutationObserver(applyVersion);
      badgeObserver.observe(badge,{childList:true,characterData:true,subtree:true});
    }
    if(title&&!titleObserver){
      titleObserver=new MutationObserver(applyVersion);
      titleObserver.observe(title,{childList:true,characterData:true,subtree:true});
    }
  }

  function apply(){
    protectVersion();
    preserveBaseLogo();
    injectCardRefinementStyles();
    reorderBottomNavigation();
    refineHelp();
  }

  function start(){
    apply();
    const observer=new MutationObserver(()=>{
      preserveBaseLogo();
      injectCardRefinementStyles();
      reorderBottomNavigation();
      if(refineHelp()){
        const overlay=document.getElementById('r27HelpOverlay');
        if(overlay?.dataset.r27V0183Help==='1')observer.disconnect();
      }
    });
    observer.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(apply,80);
    setTimeout(apply,500);
    setTimeout(applyVersion,3500);
    window.addEventListener('pageshow',()=>setTimeout(apply,0));
    window.addEventListener('online',()=>setTimeout(applyVersion,0));
    window.addEventListener('offline',()=>setTimeout(applyVersion,0));
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
