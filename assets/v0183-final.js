/* Rota 27 v0.18.3 — selo final + navegação + Ajuda Tema Capixaba */
(function(){
  'use strict';

  const VERSION='0.18.3';
  const CARD_STYLE_ID='r27-v0183-card-refine';
  const LOGO_BG='#C3B59B';

  function normalize(value){
    return String(value||'')
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .toLowerCase().trim();
  }

  function preserveBaseLogo(){
    const img=document.querySelector('.logo-image');
    if(!img)return;
    img.setAttribute('alt','Rota 27 Bodega');
    img.style.borderRadius='12px';
    img.style.clipPath='inset(0 round 12px)';
    img.style.backgroundColor=LOGO_BG;

    const shell=img.closest('.logo-shell');
    if(shell){
      shell.style.backgroundColor=LOGO_BG;
      shell.style.boxShadow='inset 0 0 0 1px rgba(17,17,17,.08),0 8px 18px rgba(17,17,17,.08)';
    }
  }

  function injectCardRefinementStyles(){
    if(document.getElementById(CARD_STYLE_ID))return;
    const style=document.createElement('style');
    style.id=CARD_STYLE_ID;
    style.textContent=`
      .logo-shell{background:${LOGO_BG}!important;}
      .logo-image{background:${LOGO_BG}!important;}
      .command-card{
        border-radius:var(--r27-card-radius,28px)!important;
        overflow:hidden!important;
        box-shadow:inset 4px 0 0 var(--brand-2),0 5px 16px rgba(17,17,17,.05)!important;
      }
      .command-card:before{
        content:""!important;position:absolute!important;left:0!important;top:auto!important;bottom:0!important;
        width:4px!important;height:31%!important;border:0!important;border-radius:0!important;background:var(--brand)!important;
        box-shadow:none!important;transform:none!important;pointer-events:none!important;
      }
      .command-card:after{content:none!important;display:none!important;border:0!important;box-shadow:none!important;}
      @media(max-width:720px){
        .r27-help-overlay.open{align-items:stretch!important;height:100dvh!important;min-height:100dvh!important;}
        .r27-help-panel{height:100dvh!important;max-height:100dvh!important;min-height:0!important;border-radius:0!important;}
        .r27-help-header{padding-top:calc(18px + env(safe-area-inset-top))!important;}
        .r27-help-content{overscroll-behavior:contain;}
      }
      @supports not (height:100dvh){
        @media(max-width:720px){.r27-help-overlay.open,.r27-help-panel{height:100vh!important;max-height:100vh!important;}}
      }
      @media(max-width:520px){.command-card{border-radius:var(--r27-card-radius,25px)!important}}
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
    if(reorderChildrenByLabel(nav,'.navbtn',['comandas','cardapio','painel','historico']))nav.dataset.r27V0183Order='1';
  }

  function refineHelp(){
    const overlay=document.getElementById('r27HelpOverlay');
    if(!overlay)return false;
    if(overlay.dataset.r27V0183Help!=='1'){
      const header=overlay.querySelector('.r27-help-header');
      const copy=header?.querySelector('div');
      if(copy&&!copy.querySelector('.r27-help-capixaba-badge')){
        const badge=document.createElement('span');badge.className='r27-help-capixaba-badge';badge.textContent='Identidade Capixaba';
        const h2=copy.querySelector('h2');if(h2)copy.insertBefore(badge,h2);else copy.appendChild(badge);
      }
      const demo=overlay.querySelector('.r27-help-nav-demo');
      reorderChildrenByLabel(demo,':scope > div',['comandas','cardapio','painel','historico']);
      const compare=overlay.querySelector('#r27-help-mapa-app .r27-help-compare');
      reorderChildrenByLabel(compare,':scope > div',['comandas','cardapio','painel','historico']);
      const content=overlay.querySelector('.r27-help-content');if(content)content.scrollTop=0;
      overlay.dataset.r27V0183Help='1';
    }
    return true;
  }

  function apply(){preserveBaseLogo();injectCardRefinementStyles();reorderBottomNavigation();refineHelp();}

  function start(){
    apply();
    const observer=new MutationObserver(()=>{
      preserveBaseLogo();injectCardRefinementStyles();reorderBottomNavigation();
      if(refineHelp()){
        const overlay=document.getElementById('r27HelpOverlay');
        if(overlay?.dataset.r27V0183Help==='1')observer.disconnect();
      }
    });
    observer.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(apply,80);setTimeout(apply,500);
    window.addEventListener('pageshow',()=>setTimeout(apply,0));
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
