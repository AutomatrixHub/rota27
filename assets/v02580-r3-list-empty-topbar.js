/* Rota 27 v0.25.80-r3 — quebra determinística do subtítulo da topbar */
(function(){
  'use strict';
  if(window.Rota27V02580R3ListEmptyTopbar)return;

  const VERSION='0.25.80-r3';

  function splitSubtitle(){
    const subtitle=document.querySelector('.topbar .brand-copy > small');
    if(!subtitle||subtitle.dataset.v02580r3Split==='1')return;

    const first=document.createElement('span');
    const second=document.createElement('span');
    first.className='v02580r3-subline';
    second.className='v02580r3-subline';
    first.textContent='Das delícias capixabas •';
    second.textContent='Jardim Camburi';

    subtitle.replaceChildren(first,second);
    subtitle.dataset.v02580r3Split='1';
  }

  function start(){
    splitSubtitle();
    window.Rota27V02580R3ListEmptyTopbar={version:VERSION,refresh:splitSubtitle};
    console.info('[Rota27] v0.25.80-r3 — Lista vazia em paridade com Mapa e topbar compacta.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
