/* Rota 27 v0.20.0 — Modo Demonstração da Visão Gerencial
 * Recurso de produção, desligado por padrão e restrito à visualização gerencial.
 * Os dados simulados vivem somente em memória: não usam localStorage, não entram no sync
 * e não alteram comandas, histórico, fechamentos reais ou WhatsApp.
 */
(function(){
  'use strict';

  const VERSION='0.20.0';
  let demoMode=false;
  let originalGetClosures=null;
  let helpObserver=null;

  function byId(id){return document.getElementById(id);}
  function ownVersion(){return String(document.querySelector('meta[name="rota27-version"]')?.getAttribute('content')||'')===VERSION;}
  function clone(v){return JSON.parse(JSON.stringify(v==null?null:v));}
  function localDateKey(d=new Date()){const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`;}
  function shiftDate(days){const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()+days);return d;}
  function toast(msg){try{if(typeof showToast==='function')showToast(msg,false);}catch{}}

  function simulatedClosures(){
    const products=[
      ['Cerveja artesanal IPA',18.9],['Cerveja artesanal Pilsen',16.9],['Queijo artesanal',29.9],
      ['Torresmo artesanal',24.9],['Linguiça artesanal',27.9],['Biscoito capixaba',14.9],
      ['Castanhas',19.9],['Doce artesanal',17.9]
    ];
    const rows=[];
    for(let offset=-199;offset<=0;offset++){
      const d=shiftDate(offset);
      const dow=d.getDay();
      if(dow===1)continue; // segunda sem turno, para a amostra parecer uma operação realista
      const date=localDateKey(d);
      const weekend=(dow===5||dow===6)?1.28:(dow===0?1.12:1);
      const trend=1+((offset+199)/199)*0.16;
      const wave=1+Math.sin((offset+17)*0.41)*0.10+Math.cos((offset+5)*0.17)*0.05;
      const revenue=Math.round((980+((offset+200)%11)*47)*weekend*trend*wave*100)/100;
      const avgTicket=42+((offset+200)%7)*2.7+(weekend>1?5:0);
      const commands=Math.max(8,Math.round(revenue/avgTicket));
      const units=Math.max(commands,Math.round(commands*(2.15+((offset+200)%5)*0.12)));
      const cancelled=((offset+200)%13===0)?1:0;

      const productRows=products.map((p,i)=>{
        const weight=1+((offset+200+i*3)%9)/10;
        const qty=Math.max(1,Math.round((units/(products.length+4))*weight));
        return {name:p[0],qty,revenue:Math.round(qty*p[1]*100)/100};
      }).sort((a,b)=>b.qty-a.qty||b.revenue-a.revenue).slice(0,7);

      const pix=Math.round(revenue*(0.41+(((offset+200)%5)-2)*0.01)*100)/100;
      const credit=Math.round(revenue*(0.31+(((offset+200)%3)-1)*0.01)*100)/100;
      const debit=Math.round(revenue*0.18*100)/100;
      const cash=Math.round((revenue-pix-credit-debit)*100)/100;

      rows.push({
        id:`demo_turn_${date}`,
        businessDate:date,
        closedAt:d.getTime(),
        closedAtIso:d.toISOString(),
        deviceId:'demo',deviceName:'Modo demonstração',storeId:'rota27-demo',
        appVersion:VERSION,schemaVersion:1,demo:true,
        summary:{
          revenue,closedCount:commands,cancelled,units,
          avgTicket:commands?revenue/commands:0,openCount:0,openValue:0,
          products:productRows,
          payments:[
            {name:'Pix',value:pix},{name:'Crédito',value:credit},
            {name:'Débito',value:debit},{name:'Dinheiro',value:cash}
          ]
        }
      });
    }
    return rows;
  }

  const DEMO_ROWS=simulatedClosures();

  function installClosureProxy(){
    if(!window.Rota27V019||typeof window.Rota27V019.getClosures!=='function')return false;
    if(originalGetClosures)return true;
    originalGetClosures=window.Rota27V019.getClosures.bind(window.Rota27V019);
    window.Rota27V019.getClosures=function(){
      if(demoMode)return clone(DEMO_ROWS);
      return originalGetClosures();
    };
    return true;
  }

  function rerenderManager(){
    const active=document.querySelector('#v020Periods [data-period].active');
    if(active){active.click();return;}
    try{window.Rota27V020?.openManager?.();}catch{}
  }

  function updateToggle(){
    const wrap=byId('v020ManagerWrap'),button=byId('v020DemoButton'),copy=byId('v020DemoCopy');
    if(wrap)wrap.classList.toggle('v020-demo-active',demoMode);
    if(button){
      button.textContent=demoMode?'Voltar aos dados reais':'Ver dados de demonstração';
      button.setAttribute('aria-pressed',demoMode?'true':'false');
    }
    if(copy)copy.textContent=demoMode
      ?'Demonstração ativa: amostra simulada em memória. Nada é salvo ou sincronizado.'
      :'Opcional: visualize uma base simulada completa sem mexer nos dados reais.';
  }

  function ensureUi(){
    const wrap=byId('v020ManagerWrap'),periods=byId('v020Periods');
    if(!wrap||!periods||byId('v020DemoMode'))return false;
    const box=document.createElement('div');
    box.id='v020DemoMode';box.className='v020-demo-mode';
    box.innerHTML='<div><strong>Modo demonstração</strong><span id="v020DemoCopy"></span></div><button type="button" id="v020DemoButton" aria-pressed="false"></button>';
    periods.insertAdjacentElement('afterend',box);
    byId('v020DemoButton').addEventListener('click',()=>{
      demoMode=!demoMode;updateToggle();rerenderManager();
      toast(demoMode?'Modo demonstração ativado. Dados reais permanecem intactos.':'Dados reais restaurados.');
    });
    updateToggle();return true;
  }

  function enhanceHelp(){
    const section=byId('r27-help-visao-gerencial');
    if(!section||byId('r27-help-demo-gerencial'))return false;
    const body=section.querySelector('.r27-help-section-body');if(!body)return false;
    const tip=document.createElement('div');tip.id='r27-help-demo-gerencial';tip.className='r27-help-tip';
    tip.innerHTML='<b>Modo demonstração:</b> na Visão Gerencial, use <b>Ver dados de demonstração</b> para explorar gráficos e comparações com uma amostra simulada. Esse modo começa desligado, não grava nada, não sincroniza e não altera os números reais.';
    body.appendChild(tip);return true;
  }

  function start(){
    if(!ownVersion())return;
    installClosureProxy();ensureUi();enhanceHelp();
    setTimeout(()=>{installClosureProxy();ensureUi();enhanceHelp();},180);
    setTimeout(()=>{installClosureProxy();ensureUi();enhanceHelp();},700);

    // A Ajuda pode ser construída depois do carregamento; observa apenas até inserir a nota e desconecta.
    helpObserver=new MutationObserver(()=>{
      if(enhanceHelp()&&helpObserver){helpObserver.disconnect();helpObserver=null;}
    });
    helpObserver.observe(document.body,{childList:true,subtree:true});

    document.addEventListener('click',e=>{
      if(!demoMode)return;
      const exportBtn=e.target?.closest?.('#v020Export');
      if(exportBtn){
        e.preventDefault();e.stopImmediatePropagation();
        toast('Exportação desativada no modo demonstração. Volte aos dados reais para gerar CSV.');
      }
    },true);

    window.Rota27V020Demo={
      version:VERSION,
      isActive:()=>demoMode,
      enable:()=>{demoMode=true;updateToggle();rerenderManager();},
      disable:()=>{demoMode=false;updateToggle();rerenderManager();}
    };
    console.info('[Rota27] v0.20.0 Modo Demonstração disponível (desligado por padrão).');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
