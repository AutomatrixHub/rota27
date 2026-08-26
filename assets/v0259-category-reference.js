/* Rota 27 v0.25.9 — lista somente leitura dos produtos na edição de categoria */
(function(){
  'use strict';

  const VERSION='0.25.9';
  let baseOpenCategorySheet=null;

  function byId(id){return document.getElementById(id);}
  function esc(v){try{return typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[ch]));}catch{return String(v??'');}}
  function moneyValue(v){try{return typeof money==='function'?money(Number(v||0)):Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}catch{return 'R$ 0,00';}}
  function catalog(){try{return typeof state!=='undefined'&&Array.isArray(state?.catalog)?state.catalog:[];}catch{return [];}}

  function ensureBlock(){
    const info=byId('categoryInfo');
    if(!info)return null;
    let block=byId('v0259CategoryProducts');
    if(block)return block;
    block=document.createElement('section');
    block.id='v0259CategoryProducts';
    block.hidden=true;
    block.setAttribute('aria-live','polite');
    info.insertAdjacentElement('afterend',block);
    return block;
  }

  function productsFor(category){
    return catalog().filter(p=>String(p?.cat||'')===String(category||''))
      .slice()
      .sort((a,b)=>String(a?.name||'').localeCompare(String(b?.name||''),'pt-BR'));
  }

  function renderReference(category,mode){
    const block=ensureBlock();if(!block)return;
    if(mode!=='edit'||!category){block.hidden=true;block.innerHTML='';return;}
    const rows=productsFor(category);
    const list=rows.length?rows.map(p=>{
      const active=p?.active!==false;
      return `<div class="v0259-catref-row">
        <div class="v0259-catref-main">
          <div class="v0259-catref-name">${esc(p?.name||'Produto')}</div>
          <div class="v0259-catref-meta"><span class="v0259-catref-status${active?'':' off'}">${active?'Ativo':'Inativo'}</span></div>
        </div>
        <div class="v0259-catref-price">${esc(moneyValue(p?.price||0))}</div>
      </div>`;
    }).join(''):'<div class="v0259-catref-empty">Nenhum produto cadastrado nesta categoria.</div>';
    block.innerHTML=`<div class="v0259-catref-head"><strong>Produtos nesta categoria</strong><span class="v0259-catref-count">${rows.length} ${rows.length===1?'produto':'produtos'}</span></div><div class="v0259-catref-list">${list}</div><p class="v0259-catref-note">Somente para referência. Para alterar um produto, use a edição normal do Cardápio.</p>`;
    block.hidden=false;
  }

  function patch(){
    const current=window.openCategorySheet;
    if(typeof current!=='function'||current.__r27v0259CategoryReference)return false;
    baseOpenCategorySheet=current;
    const patched=function(mode='new',source='product',explicitCategory=''){
      const selected=String(explicitCategory||byId('menuItemCat')?.value||'').trim();
      const result=baseOpenCategorySheet.apply(this,arguments);
      const oldName=String(byId('categoryOldName')?.value||selected).trim();
      renderReference(oldName,mode);
      return result;
    };
    patched.__r27v0259CategoryReference=true;
    try{window.openCategorySheet=patched;}catch{}
    try{openCategorySheet=patched;}catch{}
    return true;
  }

  function start(){
    ensureBlock();
    patch();
    setTimeout(patch,180);
    window.Rota27V0259CategoryReference={version:VERSION,renderReference,patch};
    console.info('[Rota27] v0.25.9 referência de produtos por categoria ativa.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
