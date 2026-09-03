/* Rota 27 v0.15 DEV.3 — atalhos completos de mesa/local */
(function(){
  'use strict';

  const QUICK_LOCATIONS=[
    ['Balcão','Balcão'],
    ['Mesa 1','Mesa 1'],
    ['Mesa 2','Mesa 2'],
    ['Mesa 3','Mesa 3'],
    ['Mesa 4','Mesa 4'],
    ['Mesa 5','Mesa 5'],
    ['Parklet 1','Parklet 1'],
    ['Parklet 2','Parklet 2'],
    ['Parklet 3','Parklet 3'],
    ['Parklet 4','Parklet 4'],
    ['Parklet 5','Parklet 5'],
    ['Parklet 6','Parklet 6']
  ];

  function rebuildQuickButtons(wrapId,setterName){
    const wrap=document.getElementById(wrapId);
    const quick=wrap?.querySelector('.table-quick');
    if(!quick)return;

    quick.replaceChildren();
    for(const [value,label] of QUICK_LOCATIONS){
      const button=document.createElement('button');
      button.type='button';
      button.textContent=label;
      button.dataset.tableValue=value;
      button.addEventListener('click',()=>{
        const setter=window[setterName];
        if(typeof setter==='function')setter(value);
      });
      quick.appendChild(button);
    }
  }

  function apply(){
    rebuildQuickButtons('newCommandWrap','setQuickTable');
    rebuildQuickButtons('editCommandWrap','setEditQuickTable');

    console.info('[Rota27] atalhos completos de mesa/local carregados (v0.15 DEV.3).');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
})();
