/* Rota 27 v0.18.2 — selo final + refinamento visual aprovado */
(function(){
  'use strict';

  const VERSION='0.18.2';
  const LABEL='v0.18.2';
  const TITLE='Rota 27 Bodega • Comandas v0.18.2';
  const OFFICIAL_LOGO='./assets/brand/rota27-logo-oficial.png';
  const STYLE_ID='r27-v0182-final-refine';

  let badgeObserver=null;
  let titleObserver=null;

  function injectRefinementStyles(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      :root{--r27-brand-radius:28px}

      /* A TOPBAR é a referência de curvatura das comandas. */
      .brand,.command-card{border-radius:var(--r27-brand-radius)!important}
      .command-card{overflow:hidden}
      .command-card:before{width:7px}
      .logo-image{filter:drop-shadow(0 4px 6px rgba(0,0,0,.10))}

      /* Laranja = ação; preto = autoridade visual. */
      .v15ops-exception:not(.danger) button{
        background:var(--brand-2)!important;
        color:#fff!important;
        box-shadow:0 7px 14px rgba(223,101,54,.20)
      }
      .v15ops-exception.danger button{background:var(--danger)!important}
      .open-btn{
        color:#7D3519!important;
        background:#FAE9DC!important;
        box-shadow:inset 0 0 0 1px #DF9C78!important
      }

      /* Controles menores mantêm hierarquia própria. */
      .quick-stats .stat,.product,.v018-turn-metric,.v018-turn-panel,.v0181-audit-row{
        border-radius:16px
      }

      @media(max-width:520px){
        :root{--r27-brand-radius:25px}
      }
    `;
    document.head.appendChild(style);
  }

  function normalize(value){
    return String(value||'')
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .toLowerCase().trim();
  }

  function applyOfficialLogo(){
    const img=document.querySelector('.logo-image');
    if(!img)return;
    if(!img.dataset.r27OriginalSrc)img.dataset.r27OriginalSrc=img.getAttribute('src')||'';
    if(img.getAttribute('src')!==OFFICIAL_LOGO){
      img.setAttribute('src',OFFICIAL_LOGO);
      img.setAttribute('alt','Rota 27 Bodega');
    }
  }

  function reorderBottomNavigation(){
    const nav=document.querySelector('.bottomnav');
    if(!nav||nav.dataset.r27V0182Order==='1')return;
    const buttons=Array.from(nav.querySelectorAll('.navbtn'));
    if(buttons.length<4)return;

    const byLabel=new Map();
    buttons.forEach(btn=>{
      const label=normalize(btn.querySelector('.navlabel')?.textContent||btn.textContent);
      if(label)byLabel.set(label,btn);
    });

    const ordered=['comandas','cardapio','painel','historico']
      .map(label=>byLabel.get(label))
      .filter(Boolean);

    if(ordered.length!==4)return;
    ordered.forEach(btn=>nav.appendChild(btn));
    nav.dataset.r27V0182Order='1';
  }

  function applyVersion(){
    const badge=document.getElementById('v14VersionBadge');
    if(badge&&badge.textContent!==LABEL)badge.textContent=LABEL;
    if(document.title!==TITLE)document.title=TITLE;
    try{window.ROTA27_SYNC_DEV_VERSION=VERSION;}catch{}
  }

  function applyVisualRefinements(){
    injectRefinementStyles();
    applyOfficialLogo();
    reorderBottomNavigation();
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
    applyVisualRefinements();
  }

  function start(){
    apply();
    setTimeout(applyVisualRefinements,80);
    setTimeout(applyVisualRefinements,500);
    window.addEventListener('online',()=>setTimeout(applyVersion,0));
    window.addEventListener('offline',()=>setTimeout(applyVersion,0));
    window.addEventListener('pageshow',()=>setTimeout(apply,0));
    setTimeout(applyVersion,3500);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
