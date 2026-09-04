/* Rota 27 v0.25.186 — avanço consistente de cursor nas camadas de sincronização */
(function(){
  'use strict';
  if(window.Rota27V025186SyncPaginationGuard)return;

  const VERSION='0.25.186';
  const nativeFetch=window.fetch.bind(window);

  function requestUrl(input){
    try{return String(typeof input==='string'?input:input?.url||'');}catch{return '';}
  }
  function requestMethod(input,init){
    return String(init?.method||input?.method||'GET').toUpperCase();
  }
  async function requestBody(input,init){
    try{
      if(typeof init?.body==='string')return JSON.parse(init.body);
      if(input&&typeof input.clone==='function'){
        const copy=input.clone();
        const text=await copy.text();
        return text?JSON.parse(text):null;
      }
    }catch{}
    return null;
  }
  function isSyncUrl(url){return /\/functions\/v1\/rota27-sync\/?(?:\?|$)/i.test(String(url||''));}
  function seqOf(row){return Math.max(0,Number(row?.seq||0));}

  window.fetch=async function(input,init){
    const url=requestUrl(input);
    const candidate=isSyncUrl(url)&&requestMethod(input,init)==='POST';
    const bodyPromise=candidate?requestBody(input,init):Promise.resolve(null);
    const response=await nativeFetch(input,init);
    if(!candidate||!response?.ok)return response;

    const body=await bodyPromise;
    if(String(body?.action||'')!=='pull')return response;

    let data;
    try{data=await response.clone().json();}catch{return response;}
    if(data?.ok!==true||data?.hasMore!==true||!Array.isArray(data.events))return response;

    const requestedAfter=Math.max(0,Number(body?.afterSeq||0));
    const serverCursor=Math.max(requestedAfter,Number(data.cursor||requestedAfter));
    const maxEventSeq=data.events.reduce((max,row)=>Math.max(max,seqOf(row)),requestedAfter);
    if(serverCursor<=maxEventSeq)return response;

    data.events.push({
      seq:serverCursor,
      event_id:`__rota27_cursor_${serverCursor}`,
      device_id:'__rota27_cursor__',
      event_type:'__cursor_advance__',
      entity_id:'',
      payload:{},
      app_version:VERSION,
      client_created_at:null,
      created_at:new Date().toISOString()
    });

    const headers=new Headers(response.headers);
    headers.set('content-type','application/json; charset=utf-8');
    headers.delete('content-length');
    return new Response(JSON.stringify(data),{
      status:response.status,
      statusText:response.statusText,
      headers
    });
  };

  window.Rota27V025186SyncPaginationGuard={version:VERSION};
  console.info(`[Rota27] proteção de paginação do sync v${VERSION} carregada.`);
})();
