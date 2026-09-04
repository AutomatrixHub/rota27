/* Rota 27 v0.25.174 — integridade do editor de produtos */
(function(){
  'use strict';
  const VERSION='0.25.177';
  let saving=false;

  const byId=id=>document.getElementById(id);
  const clean=value=>String(value??'').trim().replace(/\s+/g,' ');
  const key=value=>clean(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');
  const notify=(message,undo=false)=>{try{showToast(message,undo);}catch{console.info('[Rota27]',message);}};
  function parseMoney(value){
    let text=String(value??'').trim().replace(/R\$/gi,'').replace(/\s/g,'');
    if(!text)return NaN;
    if(text.includes(',')&&text.includes('.'))text=text.replace(/\./g,'').replace(',','.');
    else if(text.includes(','))text=text.replace(',','.');
    const number=Number(text);return Number.isFinite(number)?Math.round(number*100)/100:NaN;
  }
  function product(id){return (Array.isArray(state?.catalog)?state.catalog:[]).find(row=>String(row?.id)===String(id))||null;}
  function editor(){return byId('menuItemWrap');}
  function setEditorProductId(id){
    const wrap=editor();if(wrap)wrap.dataset.v025174ProductId=id?String(id):'';
    const input=byId('menuItemId');if(input)input.value=id?String(id):'';
  }
  function openProduct(id=''){
    const isEditing=String(id||'').trim()!=='';
    const current=isEditing?product(id):null;
    if(isEditing&&!current){notify('Produto não encontrado. Atualize a lista e tente novamente.');return;}
    saving=false;
    /* O botão é o mesmo elemento reutilizado pelo modal. Após um salvamento
       bem-sucedido ele fica bloqueado; ao iniciar outra operação, libere-o. */
    const saveButton=editor()?.querySelector('button[onclick*="saveMenuItem"]');
    if(saveButton){saveButton.disabled=false;saveButton.removeAttribute('aria-disabled');}
    setEditorProductId(current?.id||'');
    byId('menuItemTitle').textContent=current?'Editar produto':'Novo produto';
    byId('menuItemName').value=current?.name||'';
    try{fillCategoryOptions(current?.cat||'');}catch{}
    byId('menuItemPrice').value=current?Number(current.price||0).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}):'';
    byId('menuItemEmoji').value=current?.emoji||'🍽️';
    byId('menuItemActive').checked=current?current.active!==false:true;
    editor()?.classList.add('open');
  }
  function saveProduct(){
    if(saving)return;
    const wrap=editor();
    const editingId=clean(wrap?.dataset.v025174ProductId||byId('menuItemId')?.value);
    const current=editingId?product(editingId):null;
    if(editingId&&!current){notify('Este produto não existe mais no cardápio. Nenhum novo item foi criado.');return;}
    const name=clean(byId('menuItemName')?.value);
    const category=clean(byId('menuItemCat')?.value);
    const price=parseMoney(byId('menuItemPrice')?.value);
    const emoji=clean(byId('menuItemEmoji')?.value)||'🍽️';
    const active=byId('menuItemActive')?.checked===true;
    if(!name){notify('Informe o nome do produto.');return;}
    if(!category){notify('Informe a categoria.');return;}
    if(!Number.isFinite(price)||price<0){notify('Informe um preço válido.');return;}
    const duplicate=(state.catalog||[]).find(row=>String(row?.id)!==String(editingId||'')&&key(row?.name)===key(name));
    if(duplicate){notify(`Já existe um produto cadastrado com este nome: “${duplicate.name}”.`);return;}
    saving=true;
    const button=wrap?.querySelector('button[onclick*="saveMenuItem"]');if(button)button.disabled=true;
    try{
      if(!Array.isArray(state.categories))state.categories=[];
      if(!state.categories.includes(category))state.categories.push(category);
      if(!state.categoryStatus||typeof state.categoryStatus!=='object')state.categoryStatus={};
      if(typeof state.categoryStatus[category]!=='boolean')state.categoryStatus[category]=true;
      if(current){
        Object.assign(current,{name,cat:category,price,emoji,active});
      }else{
        let id=`p${Date.now().toString(36)}`;while((state.catalog||[]).some(row=>String(row?.id)===id))id+='x';
        state.catalog.push({id,name,cat:category,price,emoji,active});
      }
      const committed=window.v15CommitCoreMutation?.('catalog-editor')===true;
      if(!committed)save();
      wrap?.classList.remove('open');
      try{showScreen('menu');}catch{}
      try{renderMenu();}catch{}
      notify(current?'Produto atualizado.':'Produto adicionado ao cardápio.');
    }catch(error){
      saving=false;if(button)button.disabled=false;
      console.error('[Rota27] Falha ao salvar produto:',error);
      notify('Não foi possível salvar o produto. Tente novamente.');
    }
  }
  function install(){
    try{openMenuItemSheet=openProduct;window.openMenuItemSheet=openProduct;}catch{}
    try{saveMenuItem=saveProduct;window.saveMenuItem=saveProduct;}catch{}
  }
  function start(){
    /* Instala por último: substitui quaisquer pontes legadas de edição. */
    setTimeout(()=>{install();window.Rota27V025174CatalogEditorIntegrity={version:VERSION,open:openProduct,save:saveProduct};},0);
    console.info('[Rota27] v0.25.174 — integridade do editor de Cardápio carregada.');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
