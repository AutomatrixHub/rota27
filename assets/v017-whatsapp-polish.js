/* Rota 27 v0.17.0 — hardening do WhatsApp: deduplicação e clareza de correções */
(function(){
  'use strict';

  const VERSION='0.17.0';
  const nativeFetch=window.fetch.bind(window);
  const managerInflight=new Map();

  function clean(v,max=240){return String(v??'').replace(/[\u0000-\u001F\u007F]/g,' ').trim().replace(/\s+/g,' ').slice(0,max);}
  function isWhatsappUrl(input){
    try{
      const url=typeof input==='string'?input:(input&&input.url)||'';
      return /\/functions\/v1\/rota27-whatsapp\/?(?:\?.*)?$/i.test(String(url));
    }catch{return false;}
  }
  function parseBody(init){
    if(!init||typeof init.body!=='string')return null;
    try{return JSON.parse(init.body);}catch{return null;}
  }
  function findCommand(id){
    try{
      const sid=String(id||'');
      return (state?.commands||[]).find(c=>String(c?.id||'')===sid)||(state?.history||[]).find(c=>String(c?.id||'')===sid)||null;
    }catch{return null;}
  }
  function compactCommandLabel(payload){
    const c=findCommand(payload?.commandId);
    if(payload?.sentFrom==='rota27-pwa-manager-copy'){
      const parts=[clean(c?.table,80),clean(c?.customer,120)].filter(Boolean);
      return parts.join(' • ')||clean(String(payload?.commandLabel||'').replace(/^Gerência\s*•\s*/i,''),160)||'Comanda';
    }
    if(payload?.sentFrom==='rota27-pwa'){
      return clean(c?.table||c?.customer||payload?.commandLabel||'Comanda',160)||'Comanda';
    }
    return clean(payload?.commandLabel||'Comanda',160)||'Comanda';
  }
  function polishItems(items){
    return (Array.isArray(items)?items:[]).map(item=>{
      if(!item||typeof item!=='object')return item;
      const delta=Number(item.delta||0);
      const next={...item};
      if(delta<0){
        const name=clean(item.name||'Produto',160).replace(/^REMOVIDO:\s*/i,'');
        next.name=`REMOVIDO: ${name}`;
      }
      return next;
    });
  }
  function managerFingerprint(payload){
    try{
      return JSON.stringify({
        commandId:String(payload?.commandId||''),
        phone:String(payload?.phone||''),
        total:Number(payload?.total||0),
        items:(payload?.items||[]).map(x=>({name:x?.name,delta:Number(x?.delta||0),quantity:Number(x?.quantity||0),unitPrice:Number(x?.unitPrice||0)}))
      });
    }catch{return String(payload?.eventId||'manager');}
  }

  window.fetch=async function(input,init){
    if(!isWhatsappUrl(input)||String(init?.method||'GET').toUpperCase()!=='POST')return nativeFetch(input,init);

    const payload=parseBody(init);
    if(!payload||!['rota27-pwa','rota27-pwa-manager-copy'].includes(String(payload.sentFrom||'')))return nativeFetch(input,init);

    const polished={...payload};
    polished.commandLabel=compactCommandLabel(polished);
    polished.items=polishItems(polished.items);
    polished.clientVersion=VERSION;

    const nextInit={...init,body:JSON.stringify(polished)};

    if(polished.sentFrom!=='rota27-pwa-manager-copy')return nativeFetch(input,nextInit);

    const key=managerFingerprint(polished);
    const existing=managerInflight.get(key);
    if(existing){
      const response=await existing;
      return response.clone();
    }

    const request=nativeFetch(input,nextInit);
    managerInflight.set(key,request);
    try{
      const response=await request;
      setTimeout(()=>{if(managerInflight.get(key)===request)managerInflight.delete(key);},1800);
      return response.clone();
    }catch(err){
      if(managerInflight.get(key)===request)managerInflight.delete(key);
      throw err;
    }
  };

  console.info('[Rota27] v0.17.0 hardening WhatsApp carregado.');
})();
