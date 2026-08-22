/* Rota 27 v0.16.0 — refinamento da Ajuda para piloto real */
(function(){
  'use strict';

  const SECTION_ID='r27-help-se-acontecer';

  const rules=[
    {match:/conferir/i,icon:'👁',tag:'Conferência',level:'normal'},
    {match:/produto a mais/i,icon:'✎',tag:'Correção',level:'normal'},
    {match:/mesa errada/i,icon:'⌂',tag:'Identificação',level:'normal'},
    {match:/por engano/i,icon:'×',tag:'Cancelamento',level:'attention'},
    {match:/outro aparelho/i,icon:'↻',tag:'Sincronização',level:'attention'},
    {match:/whatsapp/i,icon:'◉',tag:'WhatsApp',level:'attention'},
    {match:/nuvem/i,icon:'☁',tag:'Conectividade',level:'attention'},
    {match:/total parece errado/i,icon:'!',tag:'Pare antes de fechar',level:'critical'},
    {match:/venda antiga/i,icon:'◷',tag:'Histórico',level:'normal'},
    {match:/desatualizado/i,icon:'↑',tag:'Atualização',level:'normal'}
  ];

  function classify(text){
    return rules.find(rule=>rule.match.test(text))||{icon:'?',tag:'Resposta rápida',level:'normal'};
  }

  function makeScenarioSummary(summary,info,text){
    if(summary.dataset.r27Enhanced==='1')return;
    summary.dataset.r27Enhanced='1';
    summary.textContent='';

    const icon=document.createElement('span');
    icon.className='r27-scenario-icon';
    icon.setAttribute('aria-hidden','true');
    icon.textContent=info.icon;

    const copy=document.createElement('span');
    copy.className='r27-scenario-copy';

    const title=document.createElement('span');
    title.className='r27-scenario-title';
    title.textContent=text;

    const tag=document.createElement('span');
    tag.className='r27-scenario-tag';
    tag.textContent=info.tag;

    const chevron=document.createElement('span');
    chevron.className='r27-scenario-chevron';
    chevron.setAttribute('aria-hidden','true');
    chevron.textContent='›';

    copy.append(title,tag);
    summary.append(icon,copy,chevron);
  }

  function enhanceScenarios(){
    const section=document.getElementById(SECTION_ID);
    const list=section?.querySelector('.r27-help-scenarios');
    if(!section||!list||list.dataset.r27Enhanced==='1')return false;
    list.dataset.r27Enhanced='1';

    const intro=document.createElement('div');
    intro.className='r27-help-scenario-intro';
    intro.innerHTML='<strong>Encontre a situação mais parecida com o que aconteceu.</strong><p>Toque em uma pergunta para ver a primeira ação segura. Essas orientações evitam apagar dados ou repetir operações sem necessidade.</p>';
    list.insertAdjacentElement('beforebegin',intro);

    list.querySelectorAll(':scope > details').forEach(details=>{
      const summary=details.querySelector(':scope > summary');
      if(!summary)return;
      const text=summary.textContent.trim();
      const info=classify(text);
      details.dataset.level=info.level;
      makeScenarioSummary(summary,info,text);
    });

    const safety=document.createElement('div');
    safety.className='r27-help-scenario-safety';
    safety.innerHTML='<strong>Quando interromper antes de concluir a venda</strong>Se houver total incorreto, risco de venda duplicada, perda de dados ou divergência persistente entre aparelhos, não confirme o fechamento até entender o que aconteceu. Registre aparelho, horário e comanda para facilitar o diagnóstico.';
    list.insertAdjacentElement('afterend',safety);
    return true;
  }

  function refresh(){
    if(enhanceScenarios())return;
    setTimeout(enhanceScenarios,80);
    setTimeout(enhanceScenarios,350);
  }

  function start(){
    refresh();
    document.addEventListener('click',event=>{
      if(event.target?.closest?.('#r27HelpButton'))setTimeout(enhanceScenarios,0);
    },{passive:true});
    console.info('[Rota27] refinamento da Ajuda v0.16.0 carregado.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
