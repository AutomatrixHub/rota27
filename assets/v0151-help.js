/* Rota 27 — Ajuda do usuário v2 (candidata pós-piloto, sobre baseline v0.15.1) */
(function(){
  'use strict';

  const HELP_ID='r27HelpOverlay';
  const BUTTON_ID='r27HelpButton';
  let lastFocus=null;

  const sections=[
    {
      id:'primeiros-minutos',
      icon:'▶',
      title:'Primeiros 3 minutos',
      summary:'O essencial para usar o Rota 27 sem treinamento.',
      body:`
        <div class="r27-help-lead">
          <strong>Se você nunca usou o Rota 27, comece por aqui.</strong>
          <p>O aplicativo existe para registrar rapidamente o que cada cliente consumiu e fechar a conta com segurança.</p>
        </div>

        <div class="r27-help-flow" aria-label="Fluxo principal">
          <span><b>1</b>Abrir</span><i>→</i><span><b>2</b>Lançar</span><i>→</i><span><b>3</b>Conferir</span><i>→</i><span><b>4</b>Fechar</span>
        </div>

        <h4>O que você faz durante o atendimento</h4>
        <ol class="r27-help-steps">
          <li><span>1</span><div><strong>Abra uma comanda</strong><p>Toque em <b>+</b>, escolha Balcão, Mesa ou Parklet e, se ajudar, informe o nome do cliente.</p></div></li>
          <li><span>2</span><div><strong>Lance os produtos</strong><p>Abra a comanda e toque nos produtos consumidos. Cada toque acrescenta uma unidade.</p></div></li>
          <li><span>3</span><div><strong>Confira quando precisar</strong><p>Use <b>Ver itens</b> para conferir tudo sem iniciar o fechamento.</p></div></li>
          <li><span>4</span><div><strong>Feche quando o cliente pagar</strong><p>Confira o total, toque em <b>Fechar</b>, escolha a forma de pagamento e confirme.</p></div></li>
        </ol>

        <div class="r27-help-example">
          <span class="r27-help-example-label">Exemplo real</span>
          <strong>Cliente sentou na Mesa 2 e pediu 2 cervejas e 1 queijo.</strong>
          <p>Abra <b>Mesa 2</b> → toque duas vezes na cerveja → toque uma vez no queijo → quando pedir a conta, confira em <b>Ver itens</b> → toque em <b>Fechar</b> → escolha o pagamento.</p>
        </div>

        <div class="r27-help-tip"><strong>Regra simples:</strong> se você lembrar de <b>abrir → lançar → conferir → fechar</b>, já consegue operar o fluxo principal.</div>
      `
    },
    {
      id:'mapa-app',
      icon:'⌂',
      title:'Mapa rápido do aplicativo',
      summary:'Onde fica cada função e quando usar cada área.',
      body:`
        <p>A barra inferior tem quatro áreas. Você não precisa entrar em todas durante um atendimento comum.</p>

        <div class="r27-help-nav-demo" aria-label="Exemplo visual da navegação">
          <div><span>▤</span><strong>Comandas</strong><small>atender</small></div>
          <div><span>▥</span><strong>Painel</strong><small>acompanhar</small></div>
          <div><span>☰</span><strong>Cardápio</strong><small>administrar</small></div>
          <div><span>◷</span><strong>Histórico</strong><small>consultar</small></div>
        </div>

        <div class="r27-help-compare">
          <div><strong>Comandas</strong><p>É a tela principal do atendente. Mostra o que ainda está em aberto.</p></div>
          <div><strong>Painel</strong><p>Resumo rápido da operação do dia e do estado dos serviços.</p></div>
          <div><strong>Cardápio</strong><p>Produtos, categorias e configurações administrativas.</p></div>
          <div><strong>Histórico</strong><p>Vendas já fechadas, filtros, indicadores e exportação.</p></div>
        </div>

        <h4>E o botão +?</h4>
        <p>O botão flutuante <b>+</b> serve apenas para <strong>Nova comanda</strong>. Ele fica visível nas áreas principais para que você não precise procurar onde começar um atendimento.</p>

        <div class="r27-help-tip"><strong>Durante o atendimento:</strong> você normalmente alterna apenas entre <b>Comandas</b> e a comanda que está atendendo.</div>
      `
    },
    {
      id:'abrir-comanda',
      icon:'＋',
      title:'Abrir uma nova comanda',
      summary:'Como escolher local e identificar o cliente sem criar duplicidade.',
      body:`
        <h4>Quando usar</h4>
        <p>Use sempre que começar um novo atendimento que ainda não possui comanda aberta.</p>

        <ol class="r27-help-steps">
          <li><span>1</span><div><strong>Toque em +</strong><p>O painel de Nova comanda será aberto.</p></div></li>
          <li><span>2</span><div><strong>Escolha o local</strong><p>Há atalhos para <b>Balcão</b>, <b>Mesa 1–5</b> e <b>Parklet 1–6</b>.</p></div></li>
          <li><span>3</span><div><strong>Informe o cliente, se ajudar</strong><p>O nome é opcional, mas facilita quando existem comandas parecidas.</p></div></li>
          <li><span>4</span><div><strong>Confirme</strong><p>A comanda passa a aparecer na lista de abertas.</p></div></li>
        </ol>

        <div class="r27-help-example">
          <span class="r27-help-example-label">Exemplo</span>
          <strong>João está no Parklet 3.</strong>
          <p>Toque em <b>+</b> → escolha <b>Parklet 3</b> → digite <b>João</b> → abra a comanda. Na lista você verá o local e o nome, facilitando encontrar o atendimento depois.</p>
        </div>

        <h4>Se aparecer aviso de possível duplicidade</h4>
        <p>Confira a lista antes de criar outra. O sistema tenta evitar que a mesma mesa/cliente seja aberto duas vezes por engano.</p>

        <div class="r27-help-warn"><strong>Não crie outra comanda só para corrigir nome ou mesa.</strong> Se a comanda já existe, edite os dados dela.</div>
      `
    },
    {
      id:'lancar-produtos',
      icon:'▦',
      title:'Lançar produtos',
      summary:'Toque rápido, busca, categorias, Mais lançados e quantidade.',
      body:`
        <h4>O jeito mais rápido</h4>
        <p>Abra a comanda correta e toque no produto consumido. Cada toque acrescenta uma unidade daquele item.</p>

        <div class="r27-help-mini-screen">
          <div class="r27-help-mini-head"><strong>Mesa 2 • João</strong><span>R$ 46,00</span></div>
          <div class="r27-help-mini-search">⌕ Buscar produto…</div>
          <div class="r27-help-mini-products">
            <span>🍺 Cerveja<small>R$ 12,00</small><b>2</b></span>
            <span>🧀 Queijo<small>R$ 22,00</small><b>1</b></span>
          </div>
          <div class="r27-help-mini-bar"><span>3 itens</span><b>Ver itens</b><strong>Fechar</strong></div>
        </div>

        <ul>
          <li><strong>Busca:</strong> use quando souber o nome do item.</li>
          <li><strong>Categorias:</strong> ajudam a reduzir a lista visível.</li>
          <li><strong>Mais lançados:</strong> reúne itens frequentes para diminuir rolagem.</li>
          <li><strong>Quantidade no card:</strong> mostra quantas unidades daquele produto já estão na comanda.</li>
        </ul>

        <div class="r27-help-example">
          <span class="r27-help-example-label">Exemplo</span>
          <strong>O cliente pediu 3 cervejas ao longo do atendimento.</strong>
          <p>Você pode tocar uma vez a cada pedido. O contador do produto mostrará <b>3</b>. Se lançou uma a mais por engano, corrija em <b>Editar itens</b>.</p>
        </div>

        <div class="r27-help-warn"><strong>Antes de lançar:</strong> confirme o nome/mesa no topo. Isso evita registrar um produto na comanda errada.</div>
      `
    },
    {
      id:'ver-editar-fechar',
      icon:'✓',
      title:'Ver itens, Editar itens ou Fechar?',
      summary:'A diferença mais importante da tela de comanda.',
      body:`
        <p>Os três comandos ficam próximos, mas servem para coisas diferentes.</p>

        <div class="r27-help-action-compare">
          <div class="view"><span>👁</span><strong>Ver itens</strong><p>Quero <b>conferir</b> o que já foi lançado.</p><small>Não altera nada e não fecha a venda.</small></div>
          <div class="edit"><span>✎</span><strong>Editar itens</strong><p>Quero <b>corrigir</b> quantidade ou remover um produto.</p><small>Use para consertar a comanda.</small></div>
          <div class="close"><span>✓</span><strong>Fechar</strong><p>O cliente <b>terminou e vai pagar</b>.</p><small>Transforma a comanda em venda.</small></div>
        </div>

        <div class="r27-help-example">
          <span class="r27-help-example-label">Exemplo 1</span>
          <strong>“Quanto já consumimos?”</strong>
          <p>Use <b>Ver itens</b>. Você mostra a lista sem iniciar cobrança.</p>
        </div>
        <div class="r27-help-example">
          <span class="r27-help-example-label">Exemplo 2</span>
          <strong>“Você colocou 3 cervejas, mas foram 2.”</strong>
          <p>Use <b>Editar itens</b> e ajuste a quantidade para 2.</p>
        </div>
        <div class="r27-help-example">
          <span class="r27-help-example-label">Exemplo 3</span>
          <strong>“Pode fechar. Vou pagar no Pix.”</strong>
          <p>Confira a comanda e use <b>Fechar</b>.</p>
        </div>

        <div class="r27-help-tip"><strong>Atalho mental:</strong> conferir = Ver itens • corrigir = Editar itens • cobrar = Fechar.</div>
      `
    },
    {
      id:'editar-comanda',
      icon:'✎',
      title:'Corrigir mesa, local ou cliente',
      summary:'Como corrigir identificação sem perder lançamentos.',
      body:`
        <p>Se a comanda foi aberta com o local ou nome incorreto, edite a própria comanda. Os produtos já lançados permanecem nela.</p>
        <ol>
          <li>Abra a comanda.</li>
          <li>Entre em <strong>Editar comanda</strong>.</li>
          <li>Corrija local/mesa ou cliente.</li>
          <li>Salve e volte ao atendimento.</li>
        </ol>

        <div class="r27-help-example">
          <span class="r27-help-example-label">Exemplo</span>
          <strong>Ana estava no Balcão e mudou para a Mesa 4.</strong>
          <p>Não abra uma comanda nova. Edite a comanda atual e troque o local para <b>Mesa 4</b>. Assim os itens já lançados continuam juntos.</p>
        </div>

        <div class="r27-help-tip">Na tela de edição, <b>Voltar</b> apenas retorna. <b>Cancelar comanda</b> é uma ação diferente e exige confirmação.</div>
      `
    },
    {
      id:'fechar-comanda',
      icon:'$',
      title:'Fechar uma comanda e receber',
      summary:'Conferência final, forma de pagamento e registro da venda.',
      body:`
        <h4>Quando usar</h4>
        <p>Somente quando o atendimento terminou e o cliente vai pagar.</p>

        <ol class="r27-help-steps">
          <li><span>1</span><div><strong>Confira</strong><p>Abra <b>Ver itens</b> se houver qualquer dúvida sobre o consumo.</p></div></li>
          <li><span>2</span><div><strong>Toque em Fechar</strong><p>O sistema apresenta o fechamento da comanda.</p></div></li>
          <li><span>3</span><div><strong>Escolha o pagamento</strong><p>Pix, Dinheiro, Crédito, Débito ou Outro.</p></div></li>
          <li><span>4</span><div><strong>Confirme</strong><p>A comanda deixa de estar aberta e vira uma venda no Histórico.</p></div></li>
        </ol>

        <div class="r27-help-example">
          <span class="r27-help-example-label">Exemplo</span>
          <strong>Total: R$ 68,00. Cliente pagou no débito.</strong>
          <p>Confira R$ 68,00 → toque em <b>Fechar</b> → escolha <b>Débito</b> → confirme. A venda será registrada no Histórico com essa forma de pagamento.</p>
        </div>

        <div class="r27-help-warn"><strong>Se o total parecer errado, não confirme o fechamento.</strong> Volte, confira itens e quantidades e corrija antes de cobrar.</div>
      `
    },
    {
      id:'cancelar-comanda',
      icon:'×',
      title:'Cancelar uma comanda',
      summary:'Quando cancelar, quando não cancelar e o que acontece depois.',
      body:`
        <div class="r27-help-action-compare two">
          <div class="close"><span>✓</span><strong>Fechar</strong><p>Houve consumo e pagamento.</p><small>Registra venda e faturamento.</small></div>
          <div class="cancel"><span>×</span><strong>Cancelar</strong><p>A comanda não deve virar venda.</p><small>Não entra no faturamento.</small></div>
        </div>

        <h4>Use Cancelar quando</h4>
        <ul>
          <li>a comanda foi aberta por engano;</li>
          <li>o atendimento não aconteceu e ela não deve ser registrada como venda;</li>
          <li>você precisa removê-la da lista de abertas sem gerar faturamento.</li>
        </ul>

        <p>Caminho: <strong>Editar comanda → Cancelar comanda → confirmar</strong>.</p>

        <h4>O que acontece</h4>
        <ul>
          <li>sai das comandas abertas;</li>
          <li>não registra venda;</li>
          <li>não entra no faturamento;</li>
          <li>não entra no Histórico de vendas;</li>
          <li>remove envios pendentes de WhatsApp daquela comanda;</li>
          <li>o sistema tenta propagar o cancelamento aos demais aparelhos.</li>
        </ul>

        <div class="r27-help-example">
          <span class="r27-help-example-label">Exemplo</span>
          <strong>Você abriu “Mesa 5” por engano e percebeu logo depois.</strong>
          <p>Edite essa comanda → <b>Cancelar comanda</b> → confirme. Não use <b>Fechar</b>, pois isso registraria uma venda.</p>
        </div>

        <div class="r27-help-warn"><strong>Se o cliente consumiu e pagou, não cancele.</strong> Feche com a forma de pagamento correta.</div>
      `
    },
    {
      id:'whatsapp',
      icon:'◉',
      title:'WhatsApp para o cliente',
      summary:'Quando usar, consentimento, envio e mensagens pendentes.',
      body:`
        <h4>Para que serve</h4>
        <p>O WhatsApp permite enviar atualizações da comanda ao cliente quando ele concordar em receber.</p>

        <h4>O que o atendente precisa saber</h4>
        <ul>
          <li>o recurso é <strong>opcional</strong>;</li>
          <li>use somente com consentimento do cliente;</li>
          <li>apenas aparelhos autorizados precisam ter WhatsApp configurado;</li>
          <li>se não houver internet, mensagens podem ficar pendentes e ser retomadas depois;</li>
          <li>a fila de WhatsApp fica separada por aparelho para evitar duplicidade.</li>
        </ul>

        <div class="r27-help-example">
          <span class="r27-help-example-label">Exemplo</span>
          <strong>Cliente quer acompanhar a comanda no próprio celular.</strong>
          <p>Com autorização, use o envio do WhatsApp. Se a internet cair no momento, não fique repetindo a ação várias vezes; verifique se o envio ficou pendente.</p>
        </div>

        <div class="r27-help-warn"><strong>Não tente “consertar” WhatsApp apagando dados do navegador.</strong> Isso pode afetar dados locais do aplicativo.</div>
      `
    },
    {
      id:'painel',
      icon:'▥',
      title:'Entender o Painel',
      summary:'O que olhar e quando você pode simplesmente ignorá-lo.',
      body:`
        <p>O Painel é um resumo da operação. Ele não é obrigatório para lançar ou fechar comandas.</p>

        <div class="r27-help-metric-demo">
          <div><small>Em aberto</small><strong>R$ 184,00</strong><span>4 comandas</span></div>
          <div><small>Faturamento</small><strong>R$ 620,00</strong><span>12 fechadas</span></div>
          <div><small>Ticket médio</small><strong>R$ 51,67</strong><span>por comanda</span></div>
          <div><small>Sync</small><strong>Ativa</strong><span>sem pendências</span></div>
        </div>

        <h4>Quando está tudo normal</h4>
        <p>Você não precisa ficar monitorando o Painel. O Rota 27 foi desenhado para ser silencioso quando está saudável.</p>

        <h4>Quando olhar com atenção</h4>
        <p>Quando aparecer aviso de nuvem indisponível, fila persistente, conflito ou outro estado que peça ação.</p>

        <div class="r27-help-tip"><strong>Para o atendente:</strong> prioridade é a comanda. O Painel serve para acompanhamento, não para interromper o atendimento.</div>
      `
    },
    {
      id:'historico',
      icon:'◷',
      title:'Encontrar uma venda no Histórico',
      summary:'Filtros, busca, detalhes, indicadores e CSV.',
      body:`
        <p>O Histórico contém vendas já <strong>fechadas</strong>. É onde você procura o que aconteceu depois que uma comanda deixou de estar aberta.</p>

        <h4>Você pode buscar por</h4>
        <ul>
          <li>cliente;</li>
          <li>mesa ou local;</li>
          <li>produto;</li>
          <li>forma de pagamento.</li>
        </ul>

        <h4>Filtros de período</h4>
        <p><b>Hoje</b>, <b>7 dias</b>, <b>30 dias</b> e <b>Todos</b>.</p>

        <div class="r27-help-example">
          <span class="r27-help-example-label">Exemplo</span>
          <strong>“Qual foi a venda da Mesa 3 que pagou no Pix?”</strong>
          <p>Abra <b>Histórico</b> → escolha o período adequado → pesquise por <b>Mesa 3</b> ou <b>Pix</b> → abra os detalhes da venda encontrada.</p>
        </div>

        <p>O Histórico também mostra faturamento, quantidade de comandas, ticket médio, unidades vendidas, rankings e permite exportar CSV.</p>

        <div class="r27-help-tip">Comandas <b>canceladas</b> não aparecem como vendas e não entram no faturamento.</div>
      `
    },
    {
      id:'cardapio',
      icon:'☰',
      title:'Produtos, preços e categorias',
      summary:'O que pode ser alterado no Cardápio e cuidados no meio do turno.',
      body:`
        <p>O Cardápio é a área administrativa dos itens vendidos.</p>

        <h4>O que pode ser feito</h4>
        <ul>
          <li>criar e editar categorias;</li>
          <li>criar e editar produtos;</li>
          <li>ajustar preços e informações;</li>
          <li>importar e exportar em CSV/TXT;</li>
          <li>validar uma importação antes de adotar os dados;</li>
          <li>normalizar e unificar categorias semelhantes de forma reversível.</li>
        </ul>

        <div class="r27-help-example">
          <span class="r27-help-example-label">Exemplo</span>
          <strong>O preço de uma cerveja mudou de R$ 12 para R$ 13.</strong>
          <p>Abra <b>Cardápio</b> → localize o produto → edite o preço → salve. Faça isso com atenção para que os próximos lançamentos usem a informação correta.</p>
        </div>

        <div class="r27-help-warn"><strong>Evite reorganizações grandes durante o atendimento.</strong> Alterações administrativas podem esperar quando não são necessárias para a próxima venda.</div>
      `
    },
    {
      id:'sync',
      icon:'↻',
      title:'Sincronização entre aparelhos',
      summary:'Explicação sem termos técnicos: o que acontece e quando intervir.',
      body:`
        <div class="r27-help-lead">
          <strong>Pense assim:</strong>
          <p>Cada aparelho trabalha sozinho primeiro e, quando existe conexão, troca as novidades com os outros aparelhos.</p>
        </div>

        <div class="r27-help-sync-demo">
          <span>📱 Atendente A</span><i>⇄</i><strong>Nuvem</strong><i>⇄</i><span>📱 Atendente B</span>
        </div>

        <h4>Durante o uso normal</h4>
        <ul>
          <li>você não precisa tocar em “Sincronizar” a cada lançamento;</li>
          <li>as alterações sobem automaticamente;</li>
          <li>se a internet cair, o aparelho continua trabalhando localmente;</li>
          <li>quando a conexão volta, as pendências são enviadas e as mudanças dos outros aparelhos chegam.</li>
        </ul>

        <div class="r27-help-example">
          <span class="r27-help-example-label">Exemplo</span>
          <strong>Android lançou 1 cerveja e o iPhone lançou 1 queijo na mesma comanda.</strong>
          <p>Com a sincronização funcionando, as duas alterações devem convergir e a comanda deve terminar com os dois lançamentos.</p>
        </div>

        <h4>Publicar base x Adotar base</h4>
        <div class="r27-help-compare">
          <div><strong>Publicar base</strong><p>Usado apenas na implantação inicial, pelo aparelho que contém os dados de referência.</p></div>
          <div><strong>Adotar base</strong><p>Usado por um aparelho novo quando a base compartilhada já existe.</p></div>
        </div>

        <div class="r27-help-warn"><strong>Depois de configurado, não repita publicar/adotar por rotina.</strong> A operação normal é automática.</div>
      `
    },
    {
      id:'offline',
      icon:'⌁',
      title:'O que fazer se a internet cair',
      summary:'O que continua funcionando, o que fica pendente e o que não fazer.',
      body:`
        <div class="r27-help-lead">
          <strong>Primeiro: continue atendendo.</strong>
          <p>O Rota 27 foi feito para funcionar localmente mesmo quando a nuvem fica temporariamente indisponível.</p>
        </div>

        <h4>Continua funcionando no aparelho</h4>
        <ul>
          <li>abrir comandas;</li>
          <li>lançar produtos;</li>
          <li>editar itens;</li>
          <li>conferir;</li>
          <li>fechar comandas localmente.</li>
        </ul>

        <h4>O que fica esperando conexão</h4>
        <ul>
          <li>sincronizar mudanças com outros aparelhos;</li>
          <li>receber alterações feitas nos outros aparelhos;</li>
          <li>enviar mensagens de WhatsApp.</li>
        </ul>

        <div class="r27-help-example">
          <span class="r27-help-example-label">Exemplo</span>
          <strong>A internet caiu por 5 minutos no meio do atendimento.</strong>
          <p>Continue lançando no aparelho. Quando a conexão voltar, aguarde a sincronização convergir antes de concluir que houve perda de dados.</p>
        </div>

        <div class="r27-help-warn"><strong>Não limpe Safari/Chrome e não reinstale a PWA.</strong> Essas ações podem remover dados locais e não são o procedimento normal para falta de internet.</div>
      `
    },
    {
      id:'backup',
      icon:'⇩',
      title:'Backup e restauração',
      summary:'Quando fazer backup e por que restaurar exige cuidado.',
      body:`
        <h4>Backup</h4>
        <p>Cria um arquivo JSON com uma cópia dos dados operacionais do aparelho, como comandas, cardápio, categorias e histórico. O token do dispositivo não é exportado.</p>

        <h4>Quando vale fazer</h4>
        <ul>
          <li>antes de uma intervenção importante;</li>
          <li>quando houver qualquer dúvida sobre integridade;</li>
          <li>quando você quiser guardar uma cópia adicional dos dados.</li>
        </ul>

        <h4>Restauração</h4>
        <p>Substitui os dados locais pelo conteúdo do arquivo escolhido. Por isso deve ser usada com atenção.</p>

        <div class="r27-help-example">
          <span class="r27-help-example-label">Exemplo</span>
          <strong>Você recebeu um arquivo de backup antigo.</strong>
          <p>Não restaure “só para testar” no aparelho de operação. Primeiro confirme que o arquivo é realmente o desejado e que a restauração é necessária.</p>
        </div>

        <div class="r27-help-warn"><strong>Evite restaurar durante atendimento real sem necessidade.</strong></div>
      `
    },
    {
      id:'atualizacao',
      icon:'↑',
      title:'Atualizar o aplicativo',
      summary:'Como receber uma nova versão sem reinstalar e sem apagar dados.',
      body:`
        <p>Quem já possui a PWA instalada normalmente <strong>não precisa reinstalar</strong>.</p>

        <ol class="r27-help-steps">
          <li><span>1</span><div><strong>Conecte à internet</strong><p>O aparelho precisa alcançar a versão publicada.</p></div></li>
          <li><span>2</span><div><strong>Abra a PWA</strong><p>Aguarde alguns segundos para permitir a atualização do cache.</p></div></li>
          <li><span>3</span><div><strong>Feche completamente</strong><p>Não apenas minimize.</p></div></li>
          <li><span>4</span><div><strong>Abra novamente</strong><p>Confira o selo da versão e a situação da sincronização.</p></div></li>
        </ol>

        <div class="r27-help-warn"><strong>Nunca apague os dados do navegador para “forçar” atualização.</strong> Dados importantes da operação ficam armazenados localmente.</div>
      `
    },
    {
      id:'se-acontecer',
      icon:'?',
      title:'Se acontecer isso…',
      summary:'Respostas rápidas para situações comuns do dia a dia.',
      body:`
        <div class="r27-help-scenarios">
          <details open><summary>Preciso conferir o que já foi lançado.</summary><p>Abra a comanda e toque em <b>Ver itens</b>. Isso não fecha nem altera a comanda.</p></details>
          <details><summary>Lancei um produto a mais.</summary><p>Use <b>Editar itens</b> e corrija a quantidade ou remova o item.</p></details>
          <details><summary>Abri a comanda na mesa errada.</summary><p>Edite os dados da própria comanda. Não crie outra só para corrigir o local.</p></details>
          <details><summary>Abri uma comanda por engano.</summary><p>Use <b>Editar comanda → Cancelar comanda</b>. Assim ela não vira venda.</p></details>
          <details><summary>Uma comanda não apareceu no outro aparelho.</summary><p>Confirme conexão e aguarde tempo razoável para convergência. Se continuar divergente após reconexão, trate como problema de sincronização.</p></details>
          <details><summary>O WhatsApp não enviou.</summary><p>Confira internet e configuração do aparelho autorizado. Verifique se o envio ficou pendente antes de repetir.</p></details>
          <details><summary>Apareceu “Sem conexão com a nuvem”.</summary><p>Continue a operação local. Aguarde a conexão voltar e a sincronização convergir.</p></details>
          <details><summary>O total parece errado.</summary><p><b>Não feche.</b> Confira itens e quantidades. Total incorreto deve ser resolvido antes da cobrança.</p></details>
          <details><summary>Quero encontrar uma venda antiga.</summary><p>Use <b>Histórico</b>, escolha o período e pesquise por cliente, local, produto ou pagamento.</p></details>
          <details><summary>O aplicativo parece desatualizado.</summary><p>Siga o procedimento normal de atualização da PWA. Não reinstale nem apague dados como primeira tentativa.</p></details>
        </div>
      `
    },
    {
      id:'problemas',
      icon:'!',
      title:'Quando parar e pedir ajuda',
      summary:'Como reconhecer problemas críticos e evitar piorar a situação.',
      body:`
        <p>Alguns problemas merecem atenção imediata porque podem afetar cobrança ou integridade dos dados.</p>

        <div class="r27-help-critical">
          <strong>Pare antes de confirmar a venda se houver:</strong>
          <ul>
            <li>total ou cobrança incorreta;</li>
            <li>itens desaparecendo ou duplicando de forma grave;</li>
            <li>fechamento registrando informação errada;</li>
            <li>dúvida real sobre qual comanda está sendo cobrada.</li>
          </ul>
        </div>

        <h4>Problemas de sincronização</h4>
        <p>Se uma divergência não desaparecer depois que a conexão voltou e houve tempo razoável para sincronizar, registre aparelho, horário, comanda envolvida e o que aconteceu.</p>

        <h4>O que não fazer por impulso</h4>
        <ul>
          <li>não apagar dados do navegador;</li>
          <li>não reinstalar a PWA como primeira tentativa;</li>
          <li>não restaurar backup sem saber o impacto;</li>
          <li>não repetir ações de WhatsApp várias vezes sem verificar a fila;</li>
          <li>não criar outra comanda para “compensar” um erro que pode ser editado.</li>
        </ul>
      `
    },
    {
      id:'boas-praticas',
      icon:'★',
      title:'Boas práticas para atender mais rápido',
      summary:'Pequenos hábitos que evitam erro, retrabalho e perda de tempo.',
      body:`
        <ul class="r27-help-checklist">
          <li><span>✓</span><div><strong>Confirme a comanda antes de lançar.</strong><p>Olhe mesa/local e cliente no topo.</p></div></li>
          <li><span>✓</span><div><strong>Use Mais lançados para itens frequentes.</strong><p>Evite procurar toda hora o que já está acessível no início.</p></div></li>
          <li><span>✓</span><div><strong>Use Ver itens para conferência.</strong><p>Não navegue categoria por categoria para lembrar o consumo.</p></div></li>
          <li><span>✓</span><div><strong>Corrija pelo Editar itens.</strong><p>Não “compense” um lançamento errado com outra operação.</p></div></li>
          <li><span>✓</span><div><strong>Confira antes de fechar.</strong><p>Itens, total e forma de pagamento.</p></div></li>
          <li><span>✓</span><div><strong>Deixe o sistema saudável em silêncio.</strong><p>Não abra telas técnicas se não existe problema.</p></div></li>
          <li><span>✓</span><div><strong>Se ficar offline, continue trabalhando.</strong><p>Depois aguarde a sincronização convergir.</p></div></li>
        </ul>
      `
    },
    {
      id:'glossario',
      icon:'i',
      title:'Palavras que aparecem no sistema',
      summary:'Um pequeno glossário para quem está usando pela primeira vez.',
      body:`
        <div class="r27-help-glossary">
          <div><strong>Comanda aberta</strong><p>Atendimento ainda em andamento.</p></div>
          <div><strong>Fechar</strong><p>Finalizar o atendimento e registrar a venda.</p></div>
          <div><strong>Cancelar</strong><p>Remover uma comanda que não deve virar venda.</p></div>
          <div><strong>Histórico</strong><p>Vendas que já foram fechadas.</p></div>
          <div><strong>Sincronização</strong><p>Troca de alterações entre os aparelhos.</p></div>
          <div><strong>Fila pendente</strong><p>Alterações que ainda aguardam envio para a nuvem ou WhatsApp.</p></div>
          <div><strong>Conflito</strong><p>Situação em que alterações de aparelhos diferentes precisam ser revisadas.</p></div>
          <div><strong>PWA</strong><p>O Rota 27 instalado no celular como aplicativo a partir do navegador.</p></div>
          <div><strong>Backup</strong><p>Cópia de segurança dos dados locais.</p></div>
        </div>
      `
    }
  ];

  const quickActions=[
    {id:'primeiros-minutos',icon:'▶',label:'Começar agora',hint:'Nunca usei o sistema'},
    {id:'abrir-comanda',icon:'＋',label:'Abrir comanda',hint:'Iniciar atendimento'},
    {id:'lancar-produtos',icon:'▦',label:'Lançar item',hint:'Registrar consumo'},
    {id:'ver-editar-fechar',icon:'✓',label:'Conferir/corrigir',hint:'Ver ou editar itens'},
    {id:'fechar-comanda',icon:'$',label:'Fechar conta',hint:'Registrar pagamento'},
    {id:'se-acontecer',icon:'?',label:'Algo deu errado',hint:'Respostas rápidas'}
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
    return ['primeiros-minutos','abrir-comanda','lancar-produtos','ver-editar-fechar','fechar-comanda','cancelar-comanda','sync','se-acontecer']
      .map(id=>sections.find(section=>section.id===id))
      .filter(Boolean)
      .map(section=>`<button type="button" class="r27-help-chip" data-help-target="${section.id}">${section.title}</button>`)
      .join('');
  }

  function renderQuickActions(){
    return quickActions.map(action=>`
      <button type="button" class="r27-help-quick" data-help-target="${action.id}">
        <span aria-hidden="true">${action.icon}</span>
        <div><strong>${action.label}</strong><small>${action.hint}</small></div>
        <b aria-hidden="true">›</b>
      </button>
    `).join('');
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
            <p>Explicações simples, exemplos e respostas rápidas.</p>
          </div>
          <button type="button" class="r27-help-close" aria-label="Fechar ajuda">×</button>
        </header>

        <div class="r27-help-toolbar">
          <label class="r27-help-search">
            <span aria-hidden="true">⌕</span>
            <input type="search" id="r27HelpSearch" placeholder="O que você quer fazer?" autocomplete="off" />
            <button type="button" class="r27-help-clear" aria-label="Limpar busca">×</button>
          </label>
          <div class="r27-help-chips" aria-label="Atalhos da ajuda">${renderChips()}</div>
        </div>

        <div class="r27-help-content">
          <div class="r27-help-intro">
            <strong>Escolha o que você precisa agora</strong>
            <p>Você pode usar os atalhos abaixo ou pesquisar palavras como “cancelar”, “Pix”, “internet”, “WhatsApp” ou “backup”.</p>
          </div>

          <div class="r27-help-quick-grid" aria-label="Ações rápidas">${renderQuickActions()}</div>

          <div class="r27-help-controls">
            <button type="button" data-help-expand="all">Abrir todos</button>
            <button type="button" data-help-expand="none">Fechar todos</button>
          </div>

          <div id="r27HelpResults" class="r27-help-results" hidden></div>
          ${renderSections()}

          <footer class="r27-help-footer">
            <strong>Rota 27 Bodega — Comandas</strong>
            <span>Ajuda v2 • baseada na produção v0.15.1</span>
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
    overlay.querySelector('[data-help-expand="all"]')?.addEventListener('click',()=>setAllSections(true));
    overlay.querySelector('[data-help-expand="none"]')?.addEventListener('click',()=>setAllSections(false));
    return overlay;
  }

  function createButton(){
    let button=document.getElementById(BUTTON_ID);
    if(!button){
      const brand=document.querySelector('.brand');
      if(!brand)return;
      button=document.createElement('button');
      button.id=BUTTON_ID;
      button.type='button';
      button.className='r27-help-button';
      button.setAttribute('aria-label','Abrir ajuda do Rota 27');
      button.setAttribute('title','Ajuda');
      button.innerHTML='<span aria-hidden="true">?</span><small>Ajuda</small>';
      brand.appendChild(button);
    }
    if(button.dataset.r27HelpBound==='1')return;
    button.dataset.r27HelpBound='1';
    button.addEventListener('click',openHelp);
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
    const input=overlay.querySelector('#r27HelpSearch');
    if(input?.value){input.value='';filterHelp('');}
    const section=overlay.querySelector('#r27-help-'+id);
    if(!section)return;
    section.hidden=false;
    section.open=true;
    section.scrollIntoView({behavior:'smooth',block:'start'});
  }

  function setAllSections(open){
    const overlay=createOverlay();
    overlay.querySelectorAll('.r27-help-section:not([hidden])').forEach(section=>{section.open=open;});
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
    overlay.querySelector('.r27-help-quick-grid')?.toggleAttribute('hidden',Boolean(query));
    overlay.querySelector('.r27-help-controls')?.toggleAttribute('hidden',Boolean(query));
    const results=overlay.querySelector('#r27HelpResults');
    if(results){
      if(query){
        results.hidden=false;
        results.innerHTML=visible
          ? `<strong>${visible}</strong> tópico${visible===1?'':'s'} encontrado${visible===1?'':'s'} para “${escapeText(value.trim())}”.`
          : `Nenhum tópico encontrado para “${escapeText(value.trim())}”. Tente outra palavra.`;
      }else{
        results.hidden=true;
        results.textContent='';
      }
    }
  }

  function escapeText(value){
    return String(value||'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }

  function start(){
    createButton();
    createOverlay();
    document.addEventListener('keydown',event=>{
      if(event.key==='Escape'&&document.getElementById(HELP_ID)?.classList.contains('open'))closeHelp();
    });
    console.info('[Rota27] ajuda do usuário v2 carregada (candidata pós-piloto).');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
