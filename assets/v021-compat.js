/* Rota 27 v0.21.0 — compatibilidade gerencial, histórico de estoque e estabilidade do Painel */
(function(){
  'use strict';
  const VERSION='0.21.0';
  let demo=false, originalGetClosures=null, panelObserver=null;

  function byId(id){return document.getElementById(id);}
  function own(){return String(document.querySelector('meta[name="rota27-version"]')?.getAttribute('content')||'')===VERSION;}
  function esc(v){return String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
  function key(d){const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`;}
  function clone(v){return JSON.parse(JSON.stringify(v));}
  function toast(msg){try{showToast(msg,false);}catch{}}
  function shortDate(value){const p=String(value||'').split('-');return p.length===3?`${p[2]}/${p[1]}`:String(value||'');}

  function managerHint(){
    try{
      const rows=Array.isArray(window.Rota27V019?.getClosures?.())?window.Rota27V019.getClosures():[];
      const last=rows.slice().sort((a,b)=>String(b.businessDate||'').localeCompare(String(a.businessDate||'')))[0]||null;
      return rows.length?`${rows.length} fechamento${rows.length===1?'':'s'} disponíve${rows.length===1?'l':'is'}${last?' • último '+shortDate(last.businessDate):''} • compare períodos, faturamento, ticket, produtos e pagamentos.`:'Feche o primeiro turno para iniciar o histórico confiável.';
    }catch{return 'Compare faturamento, ticket, produtos e pagamentos usando fechamentos imutáveis.';}
  }

  function ensureManagerEntry(){
    const screen=byId('screenPanel');
    if(!screen||byId('v020ManagerEntry')||!window.Rota27V020?.openManager)return;
    const e=document.createElement('section');
    e.id='v020ManagerEntry';e.className='v020-manager-entry';
    e.innerHTML=`<div class="v020-manager-entry-head"><div><strong>Visão Gerencial</strong><small>${esc(managerHint())}</small></div><button type="button" class="v020-manager-open">Abrir visão gerencial</button></div>`;
    const head=screen.querySelector('.v15d4-head');
    if(head)head.insertAdjacentElement('afterend',e);else screen.prepend(e);
    e.querySelector('button').onclick=()=>window.Rota27V020.openManager();
  }

  function stockStats(){
    try{
      const cfg=window.Rota27V021?.getConfigs?.()||{};
      const catalog=Array.isArray(state?.catalog)?state.catalog:[];
      const ids=catalog.map(p=>String(p.id)).filter(id=>cfg[id]?.enabled===true);
      const attention=ids.filter(id=>{const s=window.Rota27V021.statusFor(id);return s==='low'||s==='zero';});
      const zero=attention.some(id=>window.Rota27V021.statusFor(id)==='zero');
      return {enabled:ids.length,attention:attention.length,zero};
    }catch{return {enabled:0,attention:0,zero:false};}
  }

  function ensureStockEntry(){
    const screen=byId('screenPanel');
    if(!screen||byId('v021StockEntry')||!window.Rota27V021?.openStock)return;
    const s=stockStats();
    const cls=s.attention?(s.zero?'danger':'warn'):'ok';
    const hint=s.enabled?(s.attention?`${s.attention} produto${s.attention===1?'':'s'} precisa${s.attention===1?'':'m'} de atenção.`:'Estoque controlado sem alerta agora.'):'Ative o controle apenas nos produtos que desejar.';
    const e=document.createElement('section');e.id='v021StockEntry';e.className='v021-stock-entry';
    e.innerHTML=`<div class="v021-stock-entry-head"><div><strong>Estoque Essencial</strong><small>${esc(hint)} Estoque projetado desconta itens já lançados em comandas abertas.</small></div><button class="v021-stock-open ${cls}" type="button">${s.attention?`Ver ${s.attention} alerta${s.attention===1?'':'s'}`:'Abrir estoque'}</button></div>`;
    const manager=byId('v020ManagerEntry');
    if(manager)manager.insertAdjacentElement('afterend',e);else{const head=screen.querySelector('.v15d4-head');if(head)head.insertAdjacentElement('afterend',e);else screen.prepend(e);}
    e.querySelector('button').onclick=()=>window.Rota27V021.openStock();
  }

  function repairPanel(){
    if(!own())return;
    ensureManagerEntry();
    ensureStockEntry();
  }

  function watchPanel(){
    if(panelObserver)return;
    const screen=byId('screenPanel');if(!screen)return;
    panelObserver=new MutationObserver(()=>repairPanel());
    /* Observa somente filhos diretos. O render legado do Painel substitui o innerHTML
       periodicamente; repondo as extensões na mesma microtask evitamos qualquer frame
       visível sem os cards, sem observar subárvores nem criar loop de mutações. */
    panelObserver.observe(screen,{childList:true});
  }

  function demoRows(){const names=[['Cerveja IPA',18.9],['Pilsen artesanal',16.9],['Queijo artesanal',29.9],['Torresmo',24.9],['Linguiça artesanal',27.9],['Biscoito capixaba',14.9]];const rows=[];for(let off=-179;off<=0;off++){const d=new Date();d.setHours(21,0,0,0);d.setDate(d.getDate()+off);if(d.getDay()===1)continue;const weekend=(d.getDay()===5||d.getDay()===6)?1.3:1;const trend=1+(off+179)/179*.14;const wave=1+Math.sin((off+19)*.37)*.09;const revenue=Math.round((900+((off+180)%13)*43)*weekend*trend*wave*100)/100;const commands=Math.max(8,Math.round(revenue/(44+((off+180)%6)*2.4)));const units=Math.round(commands*(2.1+((off+180)%4)*.18));const pix=Math.round(revenue*.42*100)/100,credit=Math.round(revenue*.31*100)/100,debit=Math.round(revenue*.17*100)/100,cash=Math.round((revenue-pix-credit-debit)*100)/100;rows.push({id:`demo_${key(d)}`,businessDate:key(d),closedAt:d.getTime(),deviceName:'Modo demonstração',demo:true,summary:{revenue,closedCount:commands,cancelled:(off+180)%17===0?1:0,units,avgTicket:revenue/commands,products:names.map((p,i)=>({name:p[0],qty:Math.max(1,Math.round(units/(i+5))),revenue:Math.round(Math.max(1,Math.round(units/(i+5)))*p[1]*100)/100})),payments:[{name:'Pix',value:pix},{name:'Crédito',value:credit},{name:'Débito',value:debit},{name:'Dinheiro',value:cash}]}});}return rows;}
  const DEMO=demoRows();
  function installDemoProxy(){if(originalGetClosures||!window.Rota27V019?.getClosures)return;originalGetClosures=window.Rota27V019.getClosures.bind(window.Rota27V019);window.Rota27V019.getClosures=()=>demo?clone(DEMO):originalGetClosures();}
  function rerenderManager(){const active=document.querySelector('#v020Periods [data-period].active');if(active)active.click();}
  function ensureDemoUi(){const periods=byId('v020Periods');if(!periods||byId('v021DemoBox'))return;const box=document.createElement('div');box.id='v021DemoBox';box.className='v020-source';box.style.marginTop='10px';box.innerHTML='<strong>Modo demonstração</strong><br><span id="v021DemoText">Opcional: use uma base simulada sem alterar dados reais.</span><br><button type="button" id="v021DemoBtn" style="margin-top:8px;border:0;border-radius:12px;padding:9px 12px;font-weight:800;cursor:pointer;background:#111;color:#fff">Ver dados de demonstração</button>';periods.insertAdjacentElement('afterend',box);byId('v021DemoBtn').onclick=()=>{demo=!demo;byId('v021DemoBtn').textContent=demo?'Voltar aos dados reais':'Ver dados de demonstração';byId('v021DemoText').textContent=demo?'DEMONSTRAÇÃO ATIVA — dados simulados somente em memória. Nada é salvo ou sincronizado.':'Opcional: use uma base simulada sem alterar dados reais.';box.style.background=demo?'#fff5df':'';rerenderManager();toast(demo?'Modo demonstração ativado.':'Dados reais restaurados.');};document.addEventListener('click',e=>{if(demo&&e.target?.closest?.('#v020Export')){e.preventDefault();e.stopImmediatePropagation();toast('Exportação bloqueada no modo demonstração. Volte aos dados reais para gerar CSV.');}},true);}

  function ensureHistorySheet(){if(byId('v021HistoryWrap'))return;const w=document.createElement('div');w.id='v021HistoryWrap';w.className='sheet-wrap';w.innerHTML='<div class="sheet"><div class="handle"></div><div class="v021-head"><div><h3>Histórico do estoque</h3><p class="desc">Entradas, vendas, perdas, consumo interno e ajustes.</p></div><button id="v021HistoryX" class="v021-x" type="button">×</button></div><div id="v021HistoryBody" class="v021-history"></div></div>';document.body.appendChild(w);w.addEventListener('click',e=>{if(e.target===w)w.classList.remove('open');});byId('v021HistoryX').onclick=()=>w.classList.remove('open');}
  function openHistory(){ensureHistorySheet();const rows=window.Rota27V021?.getMovements?.()||[];rows.sort((a,b)=>Number(b.createdAt)-Number(a.createdAt));byId('v021HistoryBody').innerHTML=rows.length?rows.slice(0,300).map(m=>`<div class="v021-history-row"><small>${esc(new Date(Number(m.createdAt||0)).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}))}</small><div><strong>${esc(m.productName||'Produto')}</strong><small>${esc(({entry:'Entrada',loss:'Perda',internal:'Consumo interno',adjust:'Ajuste',sale:'Venda'})[m.type]||m.type)}${m.reason?' • '+esc(m.reason):''}</small></div><b class="${Number(m.delta)>=0?'v021-pos':'v021-neg'}">${Number(m.delta)>0?'+':''}${Number(m.delta).toLocaleString('pt-BR',{maximumFractionDigits:3})}</b></div>`).join(''):'<div class="v021-empty">Nenhuma movimentação registrada.</div>';byId('v021HistoryWrap').classList.add('open');}
  function ensureHistoryButton(){const toolbar=document.querySelector('#v021StockWrap .v021-toolbar');if(!toolbar||byId('v021HistoryBtn'))return;const b=document.createElement('button');b.id='v021HistoryBtn';b.type='button';b.textContent='◷ Histórico';b.onclick=openHistory;toolbar.appendChild(b);}

  function tick(){if(!own())return;repairPanel();watchPanel();installDemoProxy();ensureDemoUi();ensureHistorySheet();ensureHistoryButton();}
  function start(){if(!own())return;tick();setTimeout(tick,250);setTimeout(tick,900);window.addEventListener('rota27:v021-stock-updated',tick);window.addEventListener('rota27:v019-turn-updated',repairPanel);window.addEventListener('pageshow',repairPanel);console.info('[Rota27] v0.21.0 compatibilidade gerencial, histórico e estabilidade do Painel carregados.');}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
