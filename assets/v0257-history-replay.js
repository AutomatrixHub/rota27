/* Rota 27 v0.25.7 — replay controlado do histórico de WhatsApp de 25/08/2026 */
(function(){
  'use strict';

  const VERSION='0.25.7';
  const TARGET_PHONE='5527997769279';
  const GREETING_NAME='Rony';
  const STATE_KEY='rota27_v0257_replay_20260825_v1';
  const EVENTS=[{"id":"r27_replay_20260825_01_1740","commandId":"r27_replay_20260825_fred","time":"2026-08-25T17:40:00-03:00","label":"Balcão • Fred","items":[{"name":"Chope Brahma 300ml","delta":1,"quantity":1,"unitPrice":10}],"total":10},{"id":"r27_replay_20260825_02_1754","commandId":"r27_replay_20260825_haddad","time":"2026-08-25T17:54:00-03:00","label":"Balcão • Haddad","items":[{"name":"Água Pedra Azul 1L","delta":1,"quantity":1,"unitPrice":10}],"total":10},{"id":"r27_replay_20260825_03_1804","commandId":"r27_replay_20260825_marcinho_martimo","time":"2026-08-25T18:04:00-03:00","label":"Balcão • Marcinho Marítimo","items":[{"name":"Chope Brahma 300ml","delta":1,"quantity":1,"unitPrice":10}],"total":10},{"id":"r27_replay_20260825_04_1809","commandId":"r27_replay_20260825_rodriginho","time":"2026-08-25T18:09:00-03:00","label":"Balcão • Rodriginho","items":[{"name":"Chope Brahma 300ml","delta":1,"quantity":1,"unitPrice":10}],"total":10},{"id":"r27_replay_20260825_05_1813","commandId":"r27_replay_20260825_marcinho_martimo","time":"2026-08-25T18:13:00-03:00","label":"Balcão • Marcinho Marítimo","items":[{"name":"Cerveja Original 300ml","delta":1,"quantity":1,"unitPrice":6}],"total":16},{"id":"r27_replay_20260825_06_1815","commandId":"r27_replay_20260825_fred","time":"2026-08-25T18:15:00-03:00","label":"Balcão • Fred","items":[{"name":"Chope Brahma 300ml","delta":1,"quantity":1,"unitPrice":10}],"total":20},{"id":"r27_replay_20260825_07_1816","commandId":"r27_replay_20260825_fred","time":"2026-08-25T18:16:00-03:00","label":"Balcão • Fred","items":[{"name":"Cachaça Pratinha 750ml","delta":1,"quantity":1,"unitPrice":65}],"total":85},{"id":"r27_replay_20260825_08_1821","commandId":"r27_replay_20260825_marcinho_martimo","time":"2026-08-25T18:21:00-03:00","label":"Balcão • Marcinho Marítimo","items":[{"name":"Cerveja Original 300ml","delta":1,"quantity":1,"unitPrice":6}],"total":22},{"id":"r27_replay_20260825_09_1826","commandId":"r27_replay_20260825_marcinho_martimo","time":"2026-08-25T18:26:00-03:00","label":"Balcão • Marcinho Marítimo","items":[{"name":"Chope Brahma 300ml","delta":-1,"quantity":1,"unitPrice":10}],"total":12},{"id":"r27_replay_20260825_10_1828","commandId":"r27_replay_20260825_rodriginho","time":"2026-08-25T18:28:00-03:00","label":"Balcão • Rodriginho","items":[{"name":"Cerveja Original 300ml","delta":1,"quantity":1,"unitPrice":6}],"total":16},{"id":"r27_replay_20260825_11_1836","commandId":"r27_replay_20260825_paulo_paulista","time":"2026-08-25T18:36:00-03:00","label":"Balcão • Paulo Paulista","items":[{"name":"Coca 220ml","delta":1,"quantity":1,"unitPrice":6}],"total":6},{"id":"r27_replay_20260825_12_1846","commandId":"r27_replay_20260825_rodriginho","time":"2026-08-25T18:46:00-03:00","label":"Balcão • Rodriginho","items":[{"name":"Cerveja Original 300ml","delta":-1,"quantity":1,"unitPrice":6},{"name":"Chope Brahma 300ml","delta":1,"quantity":1,"unitPrice":10}],"total":20},{"id":"r27_replay_20260825_13_1852a","commandId":"r27_replay_20260825_rodriginho","time":"2026-08-25T18:52:00-03:00","label":"Balcão • Rodriginho","items":[{"name":"Chope Brahma 300ml","delta":1,"quantity":1,"unitPrice":10}],"total":30},{"id":"r27_replay_20260825_14_1852b","commandId":"r27_replay_20260825_paulo_paulista","time":"2026-08-25T18:52:00-03:00","label":"Balcão • Paulo Paulista","items":[{"name":"Chope Brahma 300ml","delta":1,"quantity":1,"unitPrice":10}],"total":16},{"id":"r27_replay_20260825_15_1852c","commandId":"r27_replay_20260825_marcinho_martimo","time":"2026-08-25T18:52:00-03:00","label":"Balcão • Marcinho Marítimo","items":[{"name":"Cerveja Original 300ml","delta":1,"quantity":1,"unitPrice":6}],"total":18},{"id":"r27_replay_20260825_16_1853","commandId":"r27_replay_20260825_fred","time":"2026-08-25T18:53:00-03:00","label":"Balcão • Fred","items":[{"name":"Chope Brahma 300ml","delta":1,"quantity":1,"unitPrice":10}],"total":95},{"id":"r27_replay_20260825_17_1910a","commandId":"r27_replay_20260825_fred","time":"2026-08-25T19:10:00-03:00","label":"Balcão • Fred","items":[{"name":"Lombo Defumado","delta":1,"quantity":1,"unitPrice":30}],"total":125},{"id":"r27_replay_20260825_18_1910b","commandId":"r27_replay_20260825_paulo_paulista","time":"2026-08-25T19:10:00-03:00","label":"Balcão • Paulo Paulista","items":[{"name":"Chope Brahma 300ml","delta":1,"quantity":1,"unitPrice":10}],"total":26},{"id":"r27_replay_20260825_19_1921","commandId":"r27_replay_20260825_marcinho_martimo","time":"2026-08-25T19:21:00-03:00","label":"Balcão • Marcinho Marítimo","items":[{"name":"Cerveja Original 300ml","delta":1,"quantity":1,"unitPrice":6}],"total":24},{"id":"r27_replay_20260825_20_1925","commandId":"r27_replay_20260825_eloy","time":"2026-08-25T19:25:00-03:00","label":"Balcão • Eloy","items":[{"name":"Chope Brahma 300ml","delta":1,"quantity":1,"unitPrice":10}],"total":10},{"id":"r27_replay_20260825_21_1931","commandId":"r27_replay_20260825_marcinho_martimo","time":"2026-08-25T19:31:00-03:00","label":"Balcão • Marcinho Marítimo","items":[{"name":"Lombo Defumado","delta":1,"quantity":1,"unitPrice":30}],"total":54},{"id":"r27_replay_20260825_22_1942a","commandId":"r27_replay_20260825_fred","time":"2026-08-25T19:42:00-03:00","label":"Balcão • Fred","items":[{"name":"Chope Brahma 300ml","delta":1,"quantity":1,"unitPrice":10}],"total":135},{"id":"r27_replay_20260825_23_1942b","commandId":"r27_replay_20260825_eloy","time":"2026-08-25T19:42:00-03:00","label":"Balcão • Eloy","items":[{"name":"Chope Brahma 300ml","delta":1,"quantity":1,"unitPrice":10}],"total":20}];
  let running=false;

  function byId(id){return document.getElementById(id);}
  function api(){return window.Rota27V017||null;}
  function clean(v,max=240){return api()?.clean?.(v,max)||String(v??'').trim().slice(0,max);}
  function configured(){try{return typeof isWhatsappConfigured==='function'&&isWhatsappConfigured();}catch{return false;}}
  function config(){try{return typeof waConfig==='object'&&waConfig?waConfig:null;}catch{return null;}}
  function readState(){
    try{
      const v=JSON.parse(localStorage.getItem(STATE_KEY)||'{}');
      return {done:Array.isArray(v.done)?v.done:[],startedAt:v.startedAt||'',completedAt:v.completedAt||'',lastError:v.lastError||''};
    }catch{return {done:[],startedAt:'',completedAt:'',lastError:''};}
  }
  function writeState(v){localStorage.setItem(STATE_KEY,JSON.stringify(v));render();}
  function sleep(ms){return new Promise(r=>setTimeout(r,ms));}

  function ensureUi(){
    const sheet=byId('v017ManagerWrap')?.querySelector('.sheet');
    if(!sheet||byId('v0257ReplayCard'))return !!sheet;
    const card=document.createElement('section');
    card.id='v0257ReplayCard';
    card.innerHTML=`<strong>Reenviar histórico de 25/08</strong>
      <p>23 mensagens antigas para o número fixo +55 27 99776-9279, usando os mesmos templates operacionais.</p>
      <div id="v0257ReplayProgress"><span></span></div>
      <div id="v0257ReplayStatus"></div>
      <button type="button" id="v0257ReplaySend">Enviar 23 mensagens agora</button>`;
    const anchor=byId('v0255FixedCopyNote')||sheet.querySelector('.v017-manager-note');
    if(anchor)anchor.insertAdjacentElement('afterend',card);else sheet.appendChild(card);
    byId('v0257ReplaySend')?.addEventListener('click',startReplay);
    render();
    return true;
  }

  function render(){
    ensureUi();
    const st=readState(),done=new Set(st.done),count=EVENTS.filter(e=>done.has(e.id)).length;
    const pct=Math.round((count/EVENTS.length)*100);
    const bar=byId('v0257ReplayProgress')?.querySelector('span');
    if(bar)bar.style.width=`${pct}%`;
    const status=byId('v0257ReplayStatus'),btn=byId('v0257ReplaySend');
    if(!status||!btn)return;
    status.className='';
    if(count===EVENTS.length){
      status.className='ok';
      status.textContent='Concluído: 23/23 mensagens aceitas pelo backend.';
      btn.textContent='Histórico já reenviado';
      btn.disabled=true;
      return;
    }
    if(running){
      status.textContent=`Enviando ${count}/23… mantenha o aplicativo aberto e com internet.`;
      btn.textContent='Enviando…';
      btn.disabled=true;
      return;
    }
    if(st.lastError){
      status.className='warn';
      status.textContent=`Enviadas ${count}/23. Última falha: ${st.lastError}`;
      btn.textContent='Continuar envio';
    }else{
      status.textContent=`Pendente: ${23-count} mensagem${23-count===1?'':'s'}.`;
      btn.textContent=count?'Continuar envio':'Enviar 23 mensagens agora';
    }
    btn.disabled=false;
  }

  async function sendOne(ev){
    const cfg=config();
    if(!configured()||!cfg?.functionUrl||!cfg?.deviceToken)throw new Error('WhatsApp não configurado neste aparelho.');
    const payload={
      eventId:ev.id,
      commandId:ev.commandId,
      commandLabel:ev.label,
      customerName:GREETING_NAME,
      phone:TARGET_PHONE,
      consent:true,
      items:ev.items,
      total:ev.total,
      currency:'BRL',
      audience:'manager-fixed-history-replay',
      sentFrom:'rota27-pwa-history-replay-20260825',
      clientTimestamp:ev.time
    };
    const ctrl=new AbortController();
    const timeout=setTimeout(()=>ctrl.abort(),15000);
    try{
      const response=await fetch(String(cfg.functionUrl).replace(/\/+$/,''),{
        method:'POST',
        headers:{'Content-Type':'application/json','x-rota27-device-token':cfg.deviceToken},
        body:JSON.stringify(payload),
        signal:ctrl.signal
      });
      const data=await response.json().catch(()=>({}));
      if(!response.ok||data.ok!==true)throw new Error(data.error||`HTTP ${response.status}`);
      return data;
    }finally{clearTimeout(timeout);}
  }

  async function startReplay(){
    if(running)return;
    if(!configured()){
      window.alert('Configure o WhatsApp neste aparelho antes de reenviar o histórico.');
      return;
    }
    const st=readState(),done=new Set(st.done),remaining=EVENTS.filter(e=>!done.has(e.id)).length;
    if(!remaining)return;
    if(!window.confirm(`Enviar agora ${remaining} mensagem${remaining===1?'':'s'} do histórico de 25/08 para +55 27 99776-9279?\n\nO WhatsApp mostrará o horário do reenvio atual; os horários originais ficam registrados internamente no replay.`))return;
    running=true;
    st.startedAt=st.startedAt||new Date().toISOString();
    st.lastError='';
    writeState(st);
    try{
      for(const ev of EVENTS){
        if(done.has(ev.id))continue;
        await sendOne(ev);
        done.add(ev.id);
        st.done=[...done];
        st.lastError='';
        writeState(st);
        await sleep(900);
      }
      st.completedAt=new Date().toISOString();
      writeState(st);
    }catch(err){
      st.lastError=clean(err?.message||'Falha no envio',220);
      writeState(st);
    }finally{
      running=false;
      render();
    }
  }

  function start(){
    ensureUi();
    render();
    window.addEventListener('rota27:v017-open-manager',()=>setTimeout(()=>{ensureUi();render();},0));
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')render();});
    window.Rota27V0257Replay={version:VERSION,total:EVENTS.length,targetPhone:TARGET_PHONE,startReplay,state:readState};
    console.info('[Rota27] v0.25.7 replay histórico 25/08 disponível.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
