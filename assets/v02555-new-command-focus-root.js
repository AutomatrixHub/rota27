/* Rota 27 v0.25.55 — remove foco automático pela raiz na Nova comanda */
(function(){
  'use strict';

  const VERSION='0.25.55';
  const GUARD_MS=240;

  function patchOpenNewCommand(){
    const current=window.openNewCommandSheet;
    if(typeof current!=='function'||current.__v02555FocusRoot)return;

    const base=current;
    const patched=function(){
      const proto=window.HTMLElement?.prototype;
      const nativeFocus=proto?.focus;
      let guardedFocus=null;

      if(proto&&typeof nativeFocus==='function'){
        guardedFocus=function(){
          const wrap=document.getElementById('newCommandWrap');
          if(this?.id==='newTable'&&wrap?.classList?.contains('open'))return;
          return nativeFocus.apply(this,arguments);
        };
        try{proto.focus=guardedFocus;}catch{}
      }

      let result;
      try{
        result=base.apply(this,arguments);
      }finally{
        if(proto&&guardedFocus){
          window.setTimeout(()=>{
            try{if(proto.focus===guardedFocus)proto.focus=nativeFocus;}catch{}
          },GUARD_MS);
        }
      }
      return result;
    };

    patched.__v02555FocusRoot=true;
    // Preserva os marcadores das camadas anteriores para impedir que elas
    // voltem a embrulhar esta função em visibilitychange.
    patched.__v02554NoAutofocus=true;
    patched.__v02539Hotfix=true;

    try{window.openNewCommandSheet=patched;}catch{}
    try{openNewCommandSheet=patched;}catch{}
  }

  function start(){
    patchOpenNewCommand();
    window.Rota27V02555FocusRoot={version:VERSION,refresh:patchOpenNewCommand};
    console.info('[Rota27] v0.25.55 — foco automático tardio da Nova comanda bloqueado na origem.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
