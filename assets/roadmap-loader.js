/* Rota 27 — carregador incremental do roadmap pós-v0.25.46 */
(function(){
  'use strict';
  const CURRENT='0.25.50';
  const HELP='8.2';
  const assets=[
    {type:'js',id:'v02550UiStabilityJs',src:'./assets/v02550-ui-stability.js?v=02550r1'},
    {type:'css',id:'v02548EventDeliveryFunnelCss',src:'./assets/v02548-event-delivery-funnel.css?v=02548r1'},
    {type:'js',id:'v02548EventDeliveryFunnelJs',src:'./assets/v02548-event-delivery-funnel.js?v=02548r1'}
  ];
  function identity(){
    document.title=`Rota 27 Bodega • Comandas v${CURRENT}`;
    const meta=document.querySelector('meta[name="rota27-release-version"]');if(meta)meta.content=CURRENT;
    let style=document.getElementById('rota27RoadmapReleaseIdentity');
    if(!style){style=document.createElement('style');style.id='rota27RoadmapReleaseIdentity';document.head.appendChild(style);}
    style.textContent=`#v14VersionBadge::after{content:"v${CURRENT}"!important}`;
    const footer=document.querySelector('#r27HelpOverlay .r27-help-footer span');if(footer)footer.textContent=`Ajuda v${HELP} • Rota 27 v${CURRENT}`;
  }
  function load(a){
    if(document.getElementById(a.id))return;
    if(a.type==='css'){const n=document.createElement('link');n.id=a.id;n.rel='stylesheet';n.href=a.src;document.head.appendChild(n);return;}
    const n=document.createElement('script');n.id=a.id;n.src=a.src;n.async=false;document.body.appendChild(n);
  }
  function refresh(){identity();assets.forEach(load);}
  function start(){refresh();document.addEventListener('click',e=>{if(e.target.closest?.('#r27HelpBtn,[data-help]'))setTimeout(identity,100);});document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refresh();});window.Rota27Roadmap={version:CURRENT,refresh,assets:assets.map(a=>a.id)};console.info(`[Rota27] roadmap loader v${CURRENT} carregado.`);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
