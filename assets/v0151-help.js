/* Rota 27 — Ajuda do usuário (candidata pós-piloto, sobre baseline v0.15.1) */
(function(){
  'use strict';

  const HELP_ID='r27HelpOverlay';
  const BUTTON_ID='r27HelpButton';
  let lastFocus=null;

  const sections=[
    {
      id:'inicio',
      icon:'◎',
      title:'Comece aqui',
      summary:'O fluxo principal do Rota 27 em poucos passos.',
      body:`
        <p>O Rota 27 foi feito para lançar e fechar comandas com o mínimo de passos possível. O fluxo normal é:</p>
        <ol>
          <li><strong>Abrir uma comanda</strong> pelo botão <strong>+</strong>.</li>
          <li>Escolher o local/mesa e identificar o cliente quando isso ajudar a operação.</li>
          <li><strong>Lançar os produtos</strong> tocando nos itens do cardápio.</li>
          <li>Usar <strong>Ver itens</strong> para conferir rapidamente o que já foi lançado.</li>
          <li>Usar <strong>Editar itens</strong> quando precisar alterar quantidade ou remover algum item.</li>
          <li>Usar <strong>Fechar</strong> quando o cliente pedir a conta e informar a forma de pagamento.</li>
        </ol>
        <div class="r27-help-tip"><strong>Regra simples:</strong> abrir → lançar → conferir → fechar. O sistema não cobra taxa de 10% e não imprime comandas.</div>
      `
    },
    {
      id:'navegacao',
      icon:'⌂',
      title:'Navegação do aplicativo',
      summary:'O que existe em cada área da barra inferior e no botão +.',
      body:`
        <h4>Comandas</h4>
        <p>Mostra as comandas que ainda estão abertas. É a área principal durante o atendimento.</p>
        <h4>Painel</h4>
        <p>Resume a operação do dia e mostra informações rápidas sobre comandas em aberto, vendas fechadas e serviços do aparelho. Se tudo estiver saudável, você não precisa ficar consultando telas técnicas.</p>
        <h4>Cardápio</h4>
        <p>Permite administrar produtos e categorias e dá acesso às configurações operacionais, como sincronização, WhatsApp e recursos de dados.</p>
        <h4>Histórico</h4>
        <p>Mostra as comandas já fechadas, resultados e filtros de consulta.</p>
        <h4>Botão +</h4>
        <p>É a ação única para <strong>Nova comanda</strong>. Use-o sempre que iniciar um novo atendimento.</p>
      `
    },
    {
      id:'abrir-comanda',
      icon:'＋',
      title:'Abrir uma nova comanda',
      summary:'Mesa, balcão, parklet e identificação do cliente.',
      body:`
        <ol>
          <li>Na tela de Comandas, toque no botão flutuante <strong>+</strong>.</li>
          <li>Escolha o local. Existem atalhos para <strong>Balcão</strong>, <strong>Mesa 1–5</strong> e <strong>Parklet 1–6</strong>.</li>
          <li>Informe o nome do cliente quando isso facilitar a identificação.</li>
          <li>Confirme a abertura.</li>
        </ol>
        <p>O sistema possui proteção contra abertura duplicada acidental. Se uma comanda já existente parecer ser a mesma que você está tentando criar, confira antes de seguir.</p>
        <div class="r27-help-tip"><strong>Dica:</strong> use o nome do cliente quando houver mais de uma comanda parecida ou quando o local sozinho não for suficiente para identificar rapidamente quem está sendo atendido.</div>
      `
    },
    {
      id:'lancar-produtos',
      icon:'▦',
      title:'Lançar produtos',
      summary:'Busca, categorias, Mais lançados e quantidade.',
      body:`
        <p>Depois de abrir uma comanda, o cardápio aparece para lançamento rápido.</p>
        <ul>
          <li><strong>Toque em um produto</strong> para lançá-lo na comanda.</li>
          <li>Use a <strong>busca</strong> quando souber o nome do item.</li>
          <li>Use as <strong>categorias</strong> para reduzir a lista visível.</li>
          <li>A seção <strong>Mais lançados</strong> ajuda a acessar rapidamente os produtos usados com mais frequência.</li>
          <li>O indicador de quantidade mostra quantas unidades daquele produto já estão na comanda.</li>
        </ul>
        <p>O lançamento deve ser feito por toque simples. Para corrigir uma quantidade ou excluir um item, use <strong>Editar itens</strong> em vez de tentar compensar com lançamentos adicionais.</p>
      `
    },
    {
      id:'conferir-itens',
      icon:'✓',
      title:'Conferir e editar itens',
      summary:'Diferença entre Ver itens e Editar itens.',
      body:`
        <h4>Ver itens</h4>
        <p>Abre a lista completa dos itens já lançados <strong>sem iniciar o fechamento</strong>. Use para responder rapidamente “o que já foi lançado nesta comanda?”.</p>
        <h4>Editar itens</h4>
        <p>Use quando precisar alterar quantidades ou remover produtos. Essa ação é para correção da comanda.</p>
        <h4>Fechar</h4>
        <p>Use somente quando o atendimento terminou e o cliente vai pagar. O fechamento exige forma de pagamento.</p>
        <div class="r27-help-tip"><strong>Atalho mental:</strong> conferir = Ver itens; corrigir = Editar itens; terminar a venda = Fechar.</div>
      `
    },
    {
      id:'editar-comanda',
      icon:'✎',
      title:'Editar dados da comanda',
      summary:'Corrigir local, mesa ou cliente sem abrir outra comanda.',
      body:`
        <p>Se a comanda foi aberta com mesa/local ou cliente incorreto, use a edição da própria comanda. Não abra uma segunda comanda apenas para corrigir identificação.</p>
        <p>Na edição, o botão de retorno é identificado como <strong>Voltar</strong>. A opção <strong>Cancelar comanda</strong> é separada e exige confirmação, justamente para reduzir enganos.</p>
      `
    },
    {
      id:'fechar-comanda',
      icon:'$',
      title:'Fechar uma comanda',
      summary:'Conferência final, pagamento e registro da venda.',
      body:`
        <ol>
          <li>Confira os itens e o total.</li>
          <li>Toque em <strong>Fechar</strong>.</li>
          <li>Escolha a forma de pagamento.</li>
          <li>Confirme o fechamento.</li>
        </ol>
        <p>Formas de pagamento disponíveis: <strong>Pix, Dinheiro, Crédito, Débito e Outro</strong>.</p>
        <p>Uma comanda fechada vira venda: entra no <strong>Histórico</strong>, no faturamento e nos indicadores correspondentes.</p>
        <div class="r27-help-warn"><strong>Atenção:</strong> antes de confirmar, confira o total e a forma de pagamento. Se a comanda foi apenas aberta por engano e não houve venda, use <strong>Cancelar comanda</strong>, não Fechar.</div>
      `
    },
    {
      id:'cancelar-comanda',
      icon:'×',
      title:'Cancelar uma comanda aberta por engano',
      summary:'Quando cancelar e o que acontece depois.',
      body:`
        <p>O cancelamento existe para uma comanda que foi aberta por engano ou que não deve virar venda.</p>
        <p>Caminho: <strong>Editar comanda → Cancelar comanda → confirmar</strong>.</p>
        <p>Ao cancelar:</p>
        <ul>
          <li>a comanda sai da lista de abertas;</li>
          <li><strong>não</strong> registra venda;</li>
          <li><strong>não</strong> entra no faturamento;</li>
          <li><strong>não</strong> entra no Histórico de vendas;</li>
          <li>envios pendentes de WhatsApp daquela comanda são removidos;</li>
          <li>o sistema tenta propagar o cancelamento aos demais aparelhos.</li>
        </ul>
        <div class="r27-help-warn"><strong>Se o cliente pagou, não cancele.</strong> Feche a comanda normalmente com a forma de pagamento correta.</div>
      `
    },
    {
      id:'whatsapp',
      icon:'◉',
      title:'WhatsApp',
      summary:'Atualizações opcionais, consentimento e fila por aparelho.',
      body:`
        <p>O envio por WhatsApp é <strong>opcional</strong> e deve ser usado com consentimento do cliente.</p>
        <ul>
          <li>Somente aparelhos autorizados precisam ter o WhatsApp configurado.</li>
          <li>As mensagens podem ficar pendentes localmente quando não houver conexão e serão retomadas quando possível.</li>
          <li>A fila de WhatsApp é <strong>separada em cada aparelho</strong> para evitar mensagens duplicadas.</li>
          <li>Não é necessário configurar WhatsApp em todos os dispositivos que usam as comandas.</li>
        </ul>
        <p>Se houver uma falha persistente, verifique a configuração em Cardápio e a conectividade. Não limpe os dados do navegador para tentar corrigir WhatsApp.</p>
      `
    },
    {
      id:'painel',
      icon:'▥',
      title:'Painel',
      summary:'Resumo operacional e estados que realmente merecem atenção.',
      body:`
        <p>O Painel foi pensado para responder rapidamente “como está a operação agora?”. Ele reúne:</p>
        <ul>
          <li>valor e quantidade de comandas em aberto;</li>
          <li>itens lançados nas comandas abertas;</li>
          <li>faturamento, ticket médio, comandas fechadas e itens vendidos no dia;</li>
          <li>situação de internet, sincronização, WhatsApp e conflitos.</li>
        </ul>
        <p>Quando tudo está saudável, a interface deve permanecer silenciosa. Alertas são importantes quando existe algo que exige ação, como falta de nuvem, conflito ou fila persistente.</p>
      `
    },
    {
      id:'historico',
      icon:'◷',
      title:'Histórico de vendas',
      summary:'Consultar vendas, buscar informações e exportar CSV.',
      body:`
        <p>O Histórico contém as comandas <strong>fechadas como venda</strong>. Você pode:</p>
        <ul>
          <li>filtrar por <strong>Hoje, 7 dias, 30 dias ou Todos</strong>;</li>
          <li>buscar por cliente, mesa/local, produto ou forma de pagamento;</li>
          <li>consultar faturamento, quantidade de comandas, ticket médio e unidades vendidas;</li>
          <li>ver rankings e os detalhes de uma venda;</li>
          <li>exportar os dados em <strong>CSV</strong>.</li>
        </ul>
        <p>Comandas canceladas não fazem parte do Histórico de vendas e não entram no faturamento.</p>
      `
    },
    {
      id:'cardapio',
      icon:'☰',
      title:'Cardápio e categorias',
      summary:'Produtos, preços, categorias e importação/exportação.',
      body:`
        <p>Na área Cardápio é possível manter os itens usados no atendimento.</p>
        <ul>
          <li>criar e editar categorias;</li>
          <li>criar e editar produtos;</li>
          <li>ajustar informações e preços dos itens;</li>
          <li>importar e exportar cardápio em <strong>CSV/TXT</strong>;</li>
          <li>validar a importação antes de adotar os dados;</li>
          <li>normalizar e, quando necessário, unificar categorias semelhantes de forma reversível.</li>
        </ul>
        <div class="r27-help-warn"><strong>Durante um turno:</strong> evite alterações administrativas desnecessárias no cardápio. Se precisar corrigir preço ou produto, confira o impacto antes de continuar os lançamentos.</div>
      `
    },
    {
      id:'sync',
      icon:'↻',
      title:'Sincronização entre aparelhos',
      summary:'Como funciona, o que fazer offline e quando intervir.',
      body:`
        <p>O Rota 27 é <strong>local-first</strong>: cada aparelho registra primeiro os dados localmente. Quando há conexão, a sincronização envia alterações pendentes e recebe mudanças dos outros aparelhos.</p>
        <h4>Operação normal</h4>
        <ul>
          <li>Você não precisa abrir a tela de sincronização a cada lançamento.</li>
          <li>As alterações são sincronizadas automaticamente.</li>
          <li>Se a internet cair, continue trabalhando: os dados permanecem locais e sobem quando a conexão voltar.</li>
          <li>Em uso simultâneo, alterações de quantidade são tratadas como deltas para preservar lançamentos concorrentes.</li>
        </ul>
        <h4>Primeira configuração de um aparelho</h4>
        <p>Somente o aparelho que contém os dados de referência deve <strong>publicar a base inicial</strong>. Um aparelho novo, quando a base compartilhada já existe, deve <strong>adotar a base existente</strong>.</p>
        <div class="r27-help-warn"><strong>Não repita publicar/adotar por rotina.</strong> Depois que o aparelho participa da base compartilhada, a operação normal é sincronizar.</div>
        <h4>Quando merece atenção</h4>
        <p>Verifique se a fila continua pendente por muito tempo depois da reconexão, se uma comanda não aparece em outro aparelho após tempo razoável ou se houver conflito indicado pelo sistema.</p>
      `
    },
    {
      id:'offline',
      icon:'⌁',
      title:'Uso sem internet',
      summary:'O que continua funcionando e o que fica pendente.',
      body:`
        <p>O aplicativo foi projetado para continuar o atendimento mesmo com perda temporária de conexão.</p>
        <ul>
          <li>Continue abrindo, lançando, editando e fechando comandas localmente.</li>
          <li>Alterações destinadas a outros aparelhos ficam pendentes até a conexão voltar.</li>
          <li>Mensagens de WhatsApp também dependem de conexão para serem enviadas.</li>
        </ul>
        <p>Quando a internet voltar, dê tempo para as filas convergirem. Se o sistema mostrar um alerta de nuvem indisponível, isso não significa que os dados locais foram apagados.</p>
        <div class="r27-help-warn"><strong>Não limpe dados do Safari/Chrome e não reinstale a PWA</strong> como tentativa normal de correção.</div>
      `
    },
    {
      id:'backup',
      icon:'⇩',
      title:'Backup e restauração',
      summary:'Proteção dos dados locais e cuidados antes de restaurar.',
      body:`
        <p>O sistema permite exportar e restaurar backup em <strong>JSON</strong> e possui diagnóstico de integridade.</p>
        <ul>
          <li>Use backup quando quiser guardar uma cópia dos dados do aparelho ou quando houver qualquer dúvida de integridade.</li>
          <li>O backup protege dados operacionais como comandas, cardápio, categorias e histórico.</li>
          <li>O token do dispositivo não é exportado no backup.</li>
        </ul>
        <div class="r27-help-warn"><strong>Restaurar substitui dados locais.</strong> Antes de restaurar, confira se o arquivo é o correto e evite fazer isso durante atendimento sem necessidade real.</div>
      `
    },
    {
      id:'atualizacao',
      icon:'↑',
      title:'Atualizar a PWA',
      summary:'Como receber uma nova versão sem apagar dados.',
      body:`
        <p>Quem já possui a PWA instalada <strong>não precisa reinstalar</strong> para receber uma atualização.</p>
        <ol>
          <li>Conecte o aparelho à internet.</li>
          <li>Abra a PWA instalada e aguarde alguns segundos.</li>
          <li>Feche completamente o aplicativo.</li>
          <li>Abra novamente.</li>
          <li>Confira o selo da versão e a situação da sincronização.</li>
        </ol>
        <div class="r27-help-warn"><strong>Nunca limpe os dados do navegador para forçar atualização.</strong> Isso pode remover dados locais importantes.</div>
      `
    },
    {
      id:'problemas',
      icon:'!',
      title:'Se algo parecer errado',
      summary:'Passos seguros antes de tentar ações destrutivas.',
      body:`
        <h4>Uma comanda não apareceu em outro aparelho</h4>
        <p>Confirme que os dois aparelhos estão conectados e dê um tempo razoável para a sincronização convergir. Se continuar divergente após reconexão, trate como falha de sincronização.</p>
        <h4>Apareceu “Sem conexão com a nuvem”</h4>
        <p>Continue a operação local. O aviso indica que a nuvem não está acessível naquele momento; os dados locais continuam disponíveis.</p>
        <h4>WhatsApp não enviou</h4>
        <p>Confira internet e configuração no aparelho autorizado. Uma mensagem pode permanecer pendente e ser retomada depois.</p>
        <h4>O total parece errado</h4>
        <p><strong>Não feche a comanda.</strong> Confira os itens e quantidades. Divergência de total ou cobrança é situação crítica e deve ser tratada antes de registrar a venda.</p>
        <h4>O aplicativo parece desatualizado</h4>
        <p>Use o procedimento normal de atualização da PWA. Não reinstale e não apague dados como primeira tentativa.</p>
      `
    },
    {
      id:'boas-praticas',
      icon:'★',
      title:'Boas práticas no atendimento',
      summary:'Hábitos simples para reduzir erro e retrabalho.',
      body:`
        <ul>
          <li>Antes de lançar, confirme que você está na comanda correta.</li>
          <li>Use <strong>Ver itens</strong> para conferência rápida em vez de procurar produto por produto.</li>
          <li>Corrija quantidades por <strong>Editar itens</strong>.</li>
          <li>Antes de fechar, confira itens, total e forma de pagamento.</li>
          <li>Use <strong>Cancelar comanda</strong> somente quando ela não deve virar venda.</li>
          <li>Se estiver offline, continue trabalhando e aguarde a sincronização depois.</li>
          <li>Evite telas técnicas quando tudo estiver funcionando normalmente.</li>
          <li>Não limpe dados locais e não reinstale a PWA sem uma razão específica.</li>
        </ul>
      `
    }
  ];

  function normalize(text){
    return String(text||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  }

  function renderSections(){
    return sections.map(section=>`
      <details class="r27-help-section" id="r27-help-${section.id}" data-search="${normalize(section.title+' '+section.summary+' '+section.body.replace(/<[^>]*>/g,' '))}">
        <summary>
          <span class="r27-help-section-icon" aria-hidden="true">${section.icon}</span>
          <span><strong>${section.title}</strong><small>${section.summary}</small></span>
          <span class="r27-help-chevron" aria-hidden="true">⌄</span>
        </summary>
        <div class="r27-help-section-body">${section.body}</div>
      </details>
    `).join('');
  }

  function renderChips(){
    return sections.slice(0,10).map(section=>`<button type="button" class="r27-help-chip" data-help-target="${section.id}">${section.title}</button>`).join('');
  }

  function createOverlay(){
    if(document.getElementById(HELP_ID))return document.getElementById(HELP_ID);
    const overlay=document.createElement('div');
    overlay.id=HELP_ID;
    overlay.className='r27-help-overlay';
    overlay.setAttribute('aria-hidden','true');
    overlay.innerHTML=`
      <section class="r27-help-panel" role="dialog" aria-modal="true" aria-labelledby="r27HelpTitle">
        <header class="r27-help-header">
          <div>
            <small>Rota 27 Bodega</small>
            <h2 id="r27HelpTitle">Ajuda do sistema</h2>
            <p>Guia completo para atendimento e operação.</p>
          </div>
          <button type="button" class="r27-help-close" aria-label="Fechar ajuda">×</button>
        </header>
        <div class="r27-help-toolbar">
          <label class="r27-help-search">
            <span aria-hidden="true">⌕</span>
            <input type="search" id="r27HelpSearch" placeholder="Buscar na ajuda…" autocomplete="off" />
            <button type="button" class="r27-help-clear" aria-label="Limpar busca">×</button>
          </label>
          <div class="r27-help-chips" aria-label="Atalhos da ajuda">${renderChips()}</div>
        </div>
        <div class="r27-help-content">
          <div class="r27-help-intro">
            <strong>Precisa resolver algo rápido?</strong>
            <p>Use a busca acima ou abra um tópico. Esta ajuda não altera dados, comandas ou configurações.</p>
          </div>
          <div id="r27HelpResults" class="r27-help-results" hidden></div>
          ${renderSections()}
          <footer class="r27-help-footer">
            <strong>Rota 27 Bodega — Comandas</strong>
            <span>Ajuda baseada na produção v0.15.1</span>
          </footer>
        </div>
      </section>`;
    document.body.appendChild(overlay);

    overlay.querySelector('.r27-help-close')?.addEventListener('click',closeHelp);
    overlay.addEventListener('click',event=>{if(event.target===overlay)closeHelp();});
    overlay.querySelector('.r27-help-clear')?.addEventListener('click',()=>{
      const input=overlay.querySelector('#r27HelpSearch');
      if(input){input.value='';filterHelp('');input.focus();}
    });
    overlay.querySelector('#r27HelpSearch')?.addEventListener('input',event=>filterHelp(event.target.value));
    overlay.querySelectorAll('[data-help-target]').forEach(button=>button.addEventListener('click',()=>openSection(button.dataset.helpTarget)));
    return overlay;
  }

  function createButton(){
    if(document.getElementById(BUTTON_ID))return;
    const brand=document.querySelector('.brand');
    if(!brand)return;
    const button=document.createElement('button');
    button.id=BUTTON_ID;
    button.type='button';
    button.className='r27-help-button';
    button.setAttribute('aria-label','Abrir ajuda do Rota 27');
    button.setAttribute('title','Ajuda');
    button.innerHTML='<span aria-hidden="true">?</span><small>Ajuda</small>';
    button.addEventListener('click',openHelp);
    brand.appendChild(button);
  }

  function openHelp(){
    const overlay=createOverlay();
    lastFocus=document.activeElement;
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden','false');
    document.body.classList.add('r27-help-open');
    const input=overlay.querySelector('#r27HelpSearch');
    setTimeout(()=>input?.focus({preventScroll:true}),30);
  }

  function closeHelp(){
    const overlay=document.getElementById(HELP_ID);
    if(!overlay)return;
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden','true');
    document.body.classList.remove('r27-help-open');
    if(lastFocus&&typeof lastFocus.focus==='function')lastFocus.focus({preventScroll:true});
  }

  function openSection(id){
    const overlay=createOverlay();
    const section=overlay.querySelector('#r27-help-'+id);
    if(!section)return;
    section.hidden=false;
    section.open=true;
    section.scrollIntoView({behavior:'smooth',block:'start'});
  }

  function filterHelp(value){
    const overlay=createOverlay();
    const query=normalize(value.trim());
    let visible=0;
    overlay.querySelectorAll('.r27-help-section').forEach(section=>{
      const matches=!query||String(section.dataset.search||'').includes(query);
      section.hidden=!matches;
      if(matches){visible+=1;if(query)section.open=true;}
      else section.open=false;
    });
    const results=overlay.querySelector('#r27HelpResults');
    if(results){
      if(query){
        results.hidden=false;
        results.textContent=visible?`${visible} tópico${visible===1?'':'s'} encontrado${visible===1?'':'s'}.`:'Nenhum tópico encontrado. Tente outra palavra.';
      }else{
        results.hidden=true;
        results.textContent='';
      }
    }
  }

  function start(){
    createButton();
    createOverlay();
    document.addEventListener('keydown',event=>{
      if(event.key==='Escape'&&document.getElementById(HELP_ID)?.classList.contains('open'))closeHelp();
    });
    console.info('[Rota27] ajuda do usuário carregada (candidata pós-piloto).');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
