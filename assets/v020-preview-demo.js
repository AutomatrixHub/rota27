/* Rota 27 v0.20.0 — dados gerenciais simulados somente na preview */
(function(){
  'use strict';
  if(new URLSearchParams(location.search).get('preview')!=='v0200')return;

  function key(d){const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`;}
  function buildDemo(){
    const products=['Cerveja Artesanal','Queijo Meia Cura','Torresmo','Linguiça Artesanal','Castanhas','Biscoito Caseiro'];
    const rows=[];
    for(let i=1;i<=42;i+=2){
      const d=new Date();d.setHours(21,30,0,0);d.setDate(d.getDate()-i);
      const revenue=420+((i*97)%780);const commands=7+((i*3)%12);const units=commands*2+((i*5)%16);const pix=Math.round(revenue*(0.38+((i%4)*0.04))*100)/100;const card=Math.round(revenue*0.36*100)/100;const cash=Math.round((revenue-pix-card)*100)/100;
      rows.push({
        id:`preview_turn_${key(d)}`,businessDate:key(d),closedAt:d.getTime(),closedAtIso:d.toISOString(),deviceId:'preview',deviceName:'Amostra de teste',storeId:'rota27-bodega',appVersion:'0.20.0-preview',schemaVersion:1,
        summary:{revenue,closedCount:commands,openCount:0,openValue:0,avgTicket:revenue/commands,units,cancelled:i%7===0?1:0,auditEvents:commands*4,auditServerSynced:true,
          products:products.map((name,p)=>({name,qty:Math.max(1,Math.round((units/(p+4))+((i+p)%4))),revenue:Math.round((revenue/(p+3))*100)/100})).slice(0,6),
          payments:[{name:'Pix',value:pix},{name:'Cartão',value:card},{name:'Dinheiro',value:cash}]
        }
      });
    }
    return rows;
  }

  function install(){
    const api=window.Rota27V019;if(!api||typeof api.getClosures!=='function')return false;
    if(api.__v020PreviewWrapped)return true;
    const original=api.getClosures.bind(api),demo=buildDemo();
    api.getClosures=function(){
      const real=Array.isArray(original())?original():[];const map=new Map(demo.map(c=>[String(c.businessDate),c]));
      real.forEach(c=>map.set(String(c.businessDate),c));return [...map.values()].sort((a,b)=>Number(b.closedAt||0)-Number(a.closedAt||0));
    };
    api.__v020PreviewWrapped=true;
    window.ROTA27_V020_PREVIEW_DEMO=true;
    window.dispatchEvent(new CustomEvent('rota27:v019-turn-updated'));
    return true;
  }
  function banner(){
    const periods=document.getElementById('v020Periods');if(!periods||document.getElementById('v020PreviewDemoBanner'))return;
    const el=document.createElement('div');el.id='v020PreviewDemoBanner';el.className='v020-source warn';el.innerHTML='<strong>Preview com histórico simulado</strong><br>Os dias anteriores exibidos nesta preview são dados fictícios mantidos apenas em memória para validar gráficos e comparações. Seus fechamentos reais não são alterados, gravados ou sincronizados.';periods.insertAdjacentElement('afterend',el);
  }

  let tries=0;const timer=setInterval(()=>{tries++;const ok=install();banner();if(ok&&document.getElementById('v020PreviewDemoBanner'))clearInterval(timer);if(tries>40)clearInterval(timer);},150);
})();
