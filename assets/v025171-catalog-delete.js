/* Rota 27 v0.25.171 — exclusão segura de produto do Cardápio */
(function(){
  'use strict';

  const VERSION='0.25.171';

  function byId(id){return document.getElementById(id);}
  function clean(value){return String(value??'').trim();}
  function currentProduct(){
    const id=clean(byId('menuItemId')?.value);
    return id?(Array.isArray(state?.catalog)?state.catalog:[]).find(p=>String(p?.id)===id)||null:null;
  }
  function activeReferencesWithoutSnapshot(id){
    const commands=Array.isArray(state?.commands)?state.commands:[];
    return commands.filter(command=>Number(command?.items?.[id]||0)>0&&!command?.itemMeta?.[id]);
  }
  function refresh(){
    try{renderMenu?.();}catch{}
    try{renderSale?.();}catch{}
    window.dispatchEvent(new CustomEvent('rota27:catalog-product-deleted'));
  }
  function removeProduct(){
    const product=currentProduct();
    if(!product)return;
    const unsafe=activeReferencesWithoutSnapshot(product.id);
    if(unsafe.length){
      showToast?.('Este produto aparece em comanda aberta antiga sem cópia do item. Remova-o da comanda ou apenas desative-o.',false);
      return;
    }
    const message=[
      `Excluir “${product.name}” permanentemente do cardápio?`,
      '',
      'Ele deixará de aparecer em novos lançamentos.',
      'Vendas, fechamentos e itens já lançados em comandas abertas serão preservados.',
      'Registros de estoque, compras e custos também permanecem para auditoria.'
    ].join('\n');
    if(!window.confirm(message))return;
    state.catalog=state.catalog.filter(item=>String(item?.id)!==String(product.id));
    save?.();
    byId('menuItemWrap')?.classList.remove('open');
    refresh();
    showToast?.(`“${product.name}” foi excluído do cardápio.`,false);
  }
  function syncButton(){
    const wrap=byId('menuItemWrap');
    const actions=wrap?.querySelector('.sheet-actions');
    if(!actions)return;
    let button=byId('v025171DeleteProduct');
    if(!button){
      button=document.createElement('button');
      button.id='v025171DeleteProduct';
      button.className='v025171-delete-product';
      button.type='button';
      button.textContent='Excluir produto';
      button.addEventListener('click',removeProduct);
      actions.prepend(button);
    }
    button.hidden=!currentProduct();
  }
  function start(){
    const wrap=byId('menuItemWrap');
    if(!wrap)return;
    new MutationObserver(syncButton).observe(wrap,{attributes:true,attributeFilter:['class']});
    document.addEventListener('click',event=>{
      if(event.target.closest?.('#screenMenu .menu-item,.menu-edit,.menu-add'))setTimeout(syncButton,0);
    });
    syncButton();
    window.Rota27V025171CatalogDelete={version:VERSION,removeCurrent:removeProduct};
    console.info('[Rota27] v0.25.171 — exclusão segura de produto carregada.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
