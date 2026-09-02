/* Rota 27 v0.25.93 — Ajuda do Sistema v11.0
 * Camada autoritativa: consolida o manual do usuário e remove contradições
 * acumuladas pelas ajudas incrementais das releases anteriores.
 */
(function(){
  'use strict';
  if(window.Rota27V02593HelpV11)return;

  const VERSION='11.0';
  const byId=id=>document.getElementById(id);
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const normalize=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();

  function releaseVersion(){
    return String(window.Rota27Roadmap?.version||document.querySelector('meta[name="rota27-release-version"]')?.content||'0.25.93').replace(/^v/i,'');
  }
  function testApi(){return window.Rota27V02581TestMode||null;}
  function testActive(){try{return testApi()?.isActive?.()===true}catch{return false}}

  const sections=[
    {
      id:'primeiros-minutos',icon:'▶',title:'Primeiros 3 minutos',summary:'O fluxo essencial: abrir, lançar, conferir e fechar.',
      search:'inicio treinamento atendente primeira comanda fluxo abrir lançar conferir fechar',
      body:`
        <div class="r27-help-lead"><strong>Para operar o básico, lembre de quatro verbos.</strong><p><b>Abrir → Lançar → Conferir → Fechar.</b> O restante do sistema ajuda o gerente a acompanhar, organizar e corrigir exceções.</p></div>
        <ol class="r27-help-steps">
          <li><span>1</span><div><strong>Abra a comanda</strong><p>Na tela <b>Comandas</b>, toque em <b>+</b>, escolha Balcão/Mesa/Parklet e identifique o cliente quando for útil.</p></div></li>
          <li><span>2</span><div><strong>Lance os produtos</strong><p>Abra a comanda e toque nos produtos consumidos. Cada toque acrescenta uma unidade.</p></div></li>
          <li><span>3</span><div><strong>Confira ou corrija</strong><p>Use <b>Editar lançamentos</b> para aumentar, diminuir ou remover itens antes de cobrar.</p></div></li>
          <li><span>4</span><div><strong>Feche a conta</strong><p>Confira o total, escolha a forma de pagamento e confirme. Se for pagar depois, use <b>A receber</b>.</p></div></li>
        </ol>
        <div class="r27-help-example"><span class="r27-help-example-label">Exemplo</span><strong>Mesa 2 pediu duas cervejas e um queijo.</strong><p>Abra Mesa 2 → lance os três itens → confira → feche a conta → escolha Pix, Dinheiro, Crédito, Débito ou A receber.</p></div>
      `
    },
    {
      id:'navegacao-atual',icon:'⌂',title:'Mapa atual do aplicativo',summary:'Onde fica cada área e quais botões permanecem fixos.',
      search:'menu barra inferior comandas cardapio painel historico ajuda x fechar flutuante mais nova comanda navegação',
      body:`
        <div class="r27-help-v11-map">
          <div><strong>Comandas</strong><small>Atender, abrir e continuar vendas.</small></div>
          <div><strong>Cardápio</strong><small>Produtos, categorias e administração do catálogo.</small></div>
          <div><strong>Painel</strong><small>Operação, gerência, clientes, estoque e configurações.</small></div>
          <div><strong>Histórico</strong><small>Vendas e resultados já consolidados.</small></div>
        </div>
        <ul>
          <li><strong>Botão +:</strong> aparece somente em <b>Comandas</b> e serve exclusivamente para abrir uma nova comanda.</li>
          <li><strong>Ajuda:</strong> fica na topbar e abre este manual em qualquer área principal.</li>
          <li><strong>X preto:</strong> é o padrão de fechamento de sheets e telas auxiliares.</li>
          <li><strong>X flutuante:</strong> em listas longas de Clientes e Cardápio, continua acessível mesmo no fim da rolagem.</li>
          <li><strong>Versão:</strong> o selo da topbar mostra a release do Rota 27 em execução.</li>
        </ul>
        <div class="r27-help-tip"><strong>Importante:</strong> se estiver no Painel, Cardápio ou Histórico e aparecer um botão <b>+</b> de Nova comanda, isso não é o comportamento esperado.</div>
      `
    },
    {
      id:'comandas-lista-mapa',icon:'▤',title:'Comandas: Lista e Mapa',summary:'Duas formas de enxergar as mesmas comandas abertas.',
      search:'comandas abertas lista mapa fila nenhuma comanda aberta card abrir tempo ultimo lançamento mesa parklet balcão',
      body:`
        <p>As visualizações <b>Lista</b> e <b>Mapa</b> usam a mesma base de comandas abertas. Trocar a visualização não cria, fecha ou altera comandas.</p>
        <ul>
          <li><strong>Lista:</strong> prioriza leitura rápida de cliente/local, total, quantidade de itens e tempo do atendimento.</li>
          <li><strong>Mapa:</strong> organiza as comandas por local para localizar Mesa, Parklet e Balcão visualmente.</li>
          <li><strong>Abrir:</strong> toque no card da comanda para continuar lançando.</li>
          <li><strong>Estado vazio:</strong> “Nenhuma comanda aberta” só deve aparecer quando realmente não houver comanda aberta.</li>
        </ul>
        <div class="r27-help-example"><span class="r27-help-example-label">Exemplo</span><strong>Há uma comanda “Haddad • Balcão”.</strong><p>Ela deve aparecer tanto na Lista quanto no Mapa. Se for fechada, sai das abertas e passa para o Histórico.</p></div>
      `
    },
    {
      id:'nova-editar-comanda',icon:'＋',title:'Nova comanda e Editar comanda',summary:'Abrir ou corrigir a identificação sem perder os itens.',
      search:'nova comanda editar comanda foco teclado cliente mesa parklet balcão autocomplete whatsapp data nascimento aniversário',
      body:`
        <h4>Nova comanda</h4><p>A tela abre <b>sem foco automático</b>. O teclado só aparece quando você escolher tocar em um campo.</p>
        <ol><li>Escolha Balcão, Mesa ou Parklet.</li><li>Selecione um cliente cadastrado ou informe um nome, se necessário.</li><li>Quando houver WhatsApp e autorização para atualizações da comanda, o estado do consentimento pode ser reaproveitado do cadastro.</li><li>Confirme para começar os lançamentos.</li></ol>
        <h4>Editar comanda</h4><p>Use para corrigir local, mesa ou cliente. Os produtos já lançados permanecem na mesma comanda. Essa tela também abre sem foco/teclado automático.</p>
        <div class="r27-help-warn"><strong>Não abra outra comanda para corrigir uma comanda existente.</strong> Edite a própria comanda.</div>
      `
    },
    {
      id:'lancamentos',icon:'▦',title:'Lançar e corrigir produtos',summary:'Busca, categorias, mais usados e edição de quantidades.',
      search:'produto lançamento lançar item quantidade mais usados hoje top busca categorias preço editar lançamentos remover lixeira',
      body:`
        <p>A tela de lançamento foi simplificada para velocidade: os produtos aparecem sem ícones decorativos, com nome, preço e quantidade já lançada.</p>
        <ul>
          <li><strong>Buscar produto:</strong> digite parte do nome.</li>
          <li><strong>Categorias:</strong> toque em uma categoria para reduzir a grade.</li>
          <li><strong>Mais usados hoje/recentemente:</strong> oferece atalhos para os itens mais frequentes do turno.</li>
          <li><strong>Quantidade:</strong> o badge no card informa quantas unidades daquele produto já estão na comanda.</li>
          <li><strong>Editar lançamentos:</strong> use <b>−</b> e <b>+</b> para ajustar ou a lixeira para remover.</li>
        </ul>
        <div class="r27-help-tip"><strong>Antes de tocar no produto:</strong> confira o cliente/local no topo. Essa checagem evita lançamento na comanda errada.</div>
      `
    },
    {
      id:'whatsapp-comanda',icon:'↗',title:'WhatsApp da comanda',summary:'Atualizações operacionais, consentimento e cancelamento.',
      search:'whatsapp comanda consentimento autorização cliente atualizações lançamento cancelamento removido fila envio configurado',
      body:`
        <div class="r27-help-v11-path"><b>Onde configurar:</b> Painel → Configurações & Integrações → WhatsApp da comanda.</div>
        <p>O WhatsApp da comanda é transacional: serve para informar o cliente sobre os lançamentos da própria comanda.</p>
        <ul>
          <li>A autorização para atualizações da comanda fica vinculada ao cadastro do cliente e pode ser reutilizada em atendimentos futuros.</li>
          <li>Desmarcar na comanda atual não revoga automaticamente a autorização global; revogação é uma ação explícita.</li>
          <li>Lançamentos podem ser agrupados antes do envio para evitar excesso de mensagens.</li>
          <li>Quando uma comanda autorizada é cancelada, a mensagem indica <b>CANCELADA</b>, itens removidos e total final R$ 0,00.</li>
          <li>A integração é configurada por aparelho; por isso um aparelho pode estar configurado e outro não.</li>
        </ul>
        <div class="r27-help-warn"><strong>Consentimentos são separados:</strong> autorização de atualização da comanda não significa autorização para eventos, novidades ou aniversário.</div>
      `
    },
    {
      id:'whatsapp-gerente',icon:'◆',title:'WhatsApp do gerente',summary:'Cópia dos lançamentos e diagnóstico da fila local.',
      search:'whatsapp gerente responsável cópia lançamentos número fixo fila pendente falha diagnóstico aparelho',
      body:`
        <div class="r27-help-v11-path"><b>Onde configurar:</b> Painel → Configurações & Integrações → WhatsApp do gerente.</div>
        <p>Quando ativado, o aparelho que fez o lançamento envia ao responsável uma cópia agrupada das alterações da comanda.</p>
        <ul>
          <li>Cadastre nome e WhatsApp do gerente/responsável.</li>
          <li>Ative <b>Receber lançamentos</b>.</li>
          <li>O aparelho onde o lançamento ocorreu precisa ter a integração de WhatsApp configurada.</li>
          <li>A tela de aparelhos mostra fila agregada: pendências e falhas/retry.</li>
          <li>Existe também uma cópia fixa adicional da operação, em <b>+55 27 99776-9279</b>. Ela não aparece como campo editável; se coincidir com o WhatsApp do gerente, o sistema evita duplicidade.</li>
        </ul>
        <div class="r27-help-tip"><strong>Importante:</strong> a cópia fixa usa o mesmo envio agrupado. O aparelho que fez o lançamento precisa estar com a integração de WhatsApp configurada e com internet.</div>
        <div class="r27-help-example"><span class="r27-help-example-label">Se não chegou</span><p>Confira se o aparelho do lançamento está online, se mostra <b>WhatsApp: configurado</b> e se a fila possui pendência ou falha.</p></div>
      `
    },
    {
      id:'fechar-receber',icon:'$',title:'Fechar conta e A receber',summary:'Pagamento imediato, pagamento posterior, vencimento e quitação.',
      search:'fechar conta pagamento pix dinheiro credito debito a receber pendencia vencimento receber quitação quitado parcial',
      body:`
        <h4>Pagamento imediato</h4><p>Confira os itens, toque em <b>Fechar conta</b>, selecione a forma de pagamento e confirme. A comanda sai das abertas e entra no Histórico.</p>
        <h4>A receber</h4><p>Use quando o cliente vai pagar depois. O recebimento posterior <b>não cria uma nova venda</b>; ele apenas reduz o saldo daquela pendência.</p>
        <ul>
          <li><strong>Origem:</strong> data em que a dívida nasceu.</li>
          <li><strong>Vencimento:</strong> pode aparecer como Sem vencimento, Vence hoje ou Vencida há N dias.</li>
          <li><strong>Pagamento parcial:</strong> mostra quanto já foi recebido, saldo e data/hora/forma do último recebimento.</li>
          <li><strong>Quitação:</strong> mostra explicitamente <b>Quitado em DD/MM/AAAA às HH:MM</b> e a forma de pagamento que concluiu a quitação.</li>
          <li><strong>Quitadas recentemente:</strong> ordenadas pela data real da quitação.</li>
        </ul>
        <div class="r27-help-v11-path"><b>Onde abrir:</b> Painel → Hoje precisa de atenção → pendências a receber, quando houver; ou pelo acesso de A receber disponível na gestão.</div>
      `
    },
    {
      id:'turno-historico',icon:'◷',title:'Turno operacional e Histórico',summary:'Data operacional, fechamento, último turno e vendas consolidadas.',
      search:'turno operacional fechamento fechar turno histórico resultados data operacional ultimo turno auditoria cancelamentos',
      body:`
        <p>O Rota 27 separa a <b>data operacional</b> do horário físico em que uma venda ou turno foi fechado. Isso evita distorções quando a operação atravessa a meia-noite.</p>
        <ul>
          <li><strong>Turno atual:</strong> usa a data operacional das comandas e o último fechamento como corte.</li>
          <li><strong>Último turno fechado:</strong> mostra o snapshot imutável do fechamento anterior.</li>
          <li><strong>Pré-fechamento:</strong> avisa por exceção se há comandas abertas, cancelamentos pendentes, fechamento anterior aguardando sync ou ausência de movimento.</li>
          <li><strong>Histórico:</strong> mostra vendas fechadas, períodos, rankings e formas de pagamento com a mesma linguagem visual do Painel.</li>
          <li><strong>Auditoria:</strong> preserva rastreabilidade de ações operacionais relevantes.</li>
        </ul>
        <div class="r27-help-warn"><strong>Não use o relógio da madrugada para decidir a qual turno uma venda pertence.</strong> O sistema usa a data operacional da comanda.</div>
      `
    },
    {
      id:'painel',icon:'▥',title:'Painel operacional',summary:'O que precisa de atenção e os acessos de gestão.',
      search:'painel agora turno atual atenção operação internet sincronização whatsapp conflitos visão gerencial clientes estoque',
      body:`
        <p>O Painel concentra o que o gerente precisa acompanhar sem transformar a operação em uma lista de tarefas.</p>
        <ul>
          <li><strong>Hoje precisa de atenção:</strong> aparece somente quando existe uma exceção útil, como pendência a receber ou alerta de custo.</li>
          <li><strong>Visão Gerencial:</strong> comparação de períodos e indicadores baseados em fechamentos confiáveis.</li>
          <li><strong>Clientes & Fidelização:</strong> cadastro, recorrência, aniversários e relacionamento.</li>
          <li><strong>Agora:</strong> valor e itens das comandas abertas.</li>
          <li><strong>Turno atual:</strong> faturamento, ticket, comandas fechadas e itens vendidos no recorte operacional.</li>
          <li><strong>Operação:</strong> internet, sincronização, WhatsApp, conflitos e aparelhos sincronizados.</li>
          <li><strong>Gestão:</strong> Estoque Essencial, Compras, Inventário e Custos & Margem.</li>
          <li><strong>Configurações & Integrações:</strong> WhatsApp da comanda, WhatsApp do gerente e sincronização entre aparelhos.</li>
        </ul>
      `
    },
    {
      id:'visao-gerencial',icon:'▥',title:'Visão Gerencial',summary:'Períodos ou um mês de fechamento, com base confiável.',
      search:'visão gerencial 7 dias 30 dias 90 dias todos mês fechamento faturamento ticket media comandas itens comparação periodo melhor dia formas pagamento',
      body:`
        <div class="r27-help-v11-path"><b>Onde abrir:</b> Painel → Visão Gerencial.</div>
        <p>Os indicadores gerenciais usam os <b>fechamentos imutáveis de turno</b> como base confiável. Dias sem fechamento não são inventados como faturamento zero.</p>
        <ul>
          <li>Escolha <b>7 dias, 30 dias, 90 dias, Todos ou Mês</b>. Em <b>Mês</b>, o calendário reúne somente os fechamentos daquele mês.</li>
          <li>Veja faturamento, média por turno fechado, ticket médio, comandas, itens e cancelamentos.</li>
          <li>Compare com o período anterior quando houver base suficiente; em <b>Mês</b>, a referência é o mês calendário anterior.</li>
          <li>Consulte faturamento por turno, produtos mais vendidos e formas de pagamento.</li>
          <li>É também o ponto principal para ativar/desativar o <b>Modo Teste Global</b>.</li>
        </ul>
        <div class="r27-help-tip"><strong>Se “sem base anterior” aparecer:</strong> significa que ainda não há fechamentos suficientes para uma comparação confiável naquele recorte.</div>
      `
    },
    {
      id:'clientes-fidelizacao',icon:'☺',title:'Clientes & Fidelização',summary:'Cadastro, recorrência, preferências, aniversários e eventos.',
      search:'clientes fidelização cadastro importar exportar csv ordenar recorrente frequente cliente da casa sumido aniversário eventos convites data nascimento whatsapp',
      body:`
        <div class="r27-help-v11-path"><b>Onde abrir:</b> Painel → Clientes & Fidelização → Abrir clientes.</div>
        <ul>
          <li><strong>Cadastro compartilhado:</strong> nome, WhatsApp, observações, data de nascimento e autorizações.</li>
          <li><strong>Importar/Exportar:</strong> TXT/CSV para manutenção do cadastro.</li>
          <li><strong>Ordenação:</strong> Nome, Última visita, Mais frequentes e Aniversário próximo.</li>
          <li><strong>Classificação:</strong> Novo, Recorrente, Frequente, Cliente da casa e Sumido com base no histórico.</li>
          <li><strong>Relacionamento & Fidelização:</strong> frequência, ausência, produtos preferidos e contexto para abordagem — sem prometer desconto automático.</li>
          <li><strong>Aniversários próximos:</strong> hoje e próximos 7 dias, com estado de autorização/WhatsApp.</li>
          <li><strong>Solicitar data de nascimento:</strong> campanha controlada, com intervalo e limite por cliente.</li>
          <li><strong>Parabéns automático:</strong> quando elegível, é programado para 09:30 no dia do aniversário e possui estados de entrega.</li>
          <li><strong>Eventos & Convites:</strong> cadastro de evento, segmentação e disparo somente para clientes com consentimento apropriado e template aprovado.</li>
        </ul>
        <div class="r27-help-warn"><strong>Privacidade:</strong> consentimento de mensagens de relacionamento/eventos é diferente do consentimento transacional da comanda.</div>
      `
    },
    {
      id:'cardapio',icon:'▦',title:'Cardápio, produtos e categorias',summary:'Administrar catálogo sem interferir no atendimento em aberto.',
      search:'cardapio produtos categorias preço ativo inativo editar novo importar exportar csv ícone foco ordem categoria estoque',
      body:`
        <p>A aba <b>Cardápio</b> é administrativa. Ela mostra os produtos em cards compactos, sem ícones decorativos, com categoria, estado, preço e botão Editar.</p>
        <ul>
          <li>Crie ou edite produtos e categorias.</li>
          <li>Ative/inative produtos conforme disponibilidade.</li>
          <li>Importe ou exporte o catálogo quando precisar de manutenção em lote.</li>
          <li>O campo antigo <b>Ícone</b> foi removido do cadastro de produtos.</li>
          <li><b>Novo produto, Editar produto, Nova categoria e Editar categoria</b> abrem sem foco automático; o teclado só aparece quando você tocar no campo.</li>
          <li>Em listas longas, o <b>X flutuante</b> permite sair sem voltar ao topo.</li>
        </ul>
        <div class="r27-help-tip"><strong>Durante o atendimento:</strong> alterações no cadastro devem ser feitas com cuidado para não confundir preço/estado do item que o operador está procurando.</div>
      `
    },
    {
      id:'estoque-gestao',icon:'◇',title:'Estoque, Compras, Inventário e Custos',summary:'Do saldo físico à reposição e margem.',
      search:'estoque essencial cobertura dias compras reposição fornecedores recebimento inventário conferência custos margem alerta consumo interno',
      body:`
        <h4>Estoque Essencial</h4><p>Controle o saldo dos produtos escolhidos. Quando há consumo recente, o sistema estima <b>dias de cobertura</b> usando os dias operacionais mais recentes.</p>
        <h4>Compras & Reposição</h4><p>Organize itens para comprar, pedidos a fornecedores e recebimentos. A tela pode indicar a cobertura atual e uma referência aproximada para chegar a cerca de 7 dias, sem alterar automaticamente a quantidade que você decidiu comprar.</p>
        <h4>Inventário & Conferência</h4><p>Compare o saldo registrado com a contagem física e aplique ajustes somente após revisão.</p>
        <h4>Custos & Margem</h4><p>Usa custos reais de aquisição quando conhecidos. Pode alertar para <b>margem negativa</b> e aumento relevante de custo (10% ou mais) sem inventar custo onde não existe.</p>
        <h4>Consumo interno</h4><p>Consumo próprio/interno fica separado das vendas e não entra em faturamento/ticket do turno.</p>
      `
    },
    {
      id:'sincronizacao',icon:'⇄',title:'Sincronização entre aparelhos',summary:'Base compartilhada, offline-first e controle de dispositivos.',
      search:'sincronização sync aparelhos base compartilhada publicar adotar sincronizar agora conflitos offline device ativo removido desativar reativar diagnostico versão atualização remota',
      body:`
        <div class="r27-help-v11-path"><b>Configuração:</b> Painel → Configurações & Integrações → Sincronização entre aparelhos.<br><b>Aparelhos:</b> Painel → Operação → Aparelhos sincronizados.</div>
        <p>O Rota 27 é <b>offline-first</b>: o aparelho continua operando localmente e converge quando a conexão volta.</p>
        <h4>Base compartilhada</h4><ul><li><b>Sincronizar agora</b> executa o fluxo normal de convergência.</li><li><b>Publicar/Adotar base</b> são ações especiais de implantação e ficam bloqueadas quando o aparelho já participa da base compartilhada, evitando substituição acidental.</li></ul>
        <h4>Aparelhos sincronizados</h4><ul><li><b>Ativo:</b> pode participar do sync.</li><li><b>Desativar/Reativar:</b> bloqueia ou devolve acesso sem apagar histórico.</li><li><b>Remover:</b> tira da lista operacional e bloqueia o ID; os eventos históricos são preservados.</li><li><b>Mostrar removidos:</b> permite auditoria e restauração quando aplicável.</li><li><b>Versão do Rota 27:</b> é a release oficial confirmada pelo próprio aparelho; números internos antigos não devem ser tratados como versão instalada.</li><li><b>Última atividade/Diagnóstico:</b> indicam quando o aparelho e sua telemetria foram vistos.</li></ul>
        <h4>Solicitações remotas</h4><p>No menu ⋮ de outro aparelho ativo, o gerente pode solicitar <b>sincronização, diagnóstico ou atualização</b>. O pedido fica pendente até aquele aparelho estar aberto e online.</p>
        <div class="r27-help-warn"><strong>Limite do iPhone/PWA:</strong> o servidor não consegue acordar um aplicativo que o iOS deixou fechado/suspenso. A solicitação será atendida quando o Rota 27 voltar a executar.</div>
      `
    },
    {
      id:'modo-teste',icon:'⚗',title:'Modo Teste Global',summary:'Treinar com cerca de 40 dias fictícios sem tocar nos dados reais.',
      search:'modo teste global sandbox demonstração fictício 40 dias domingo regenerar dados reais roxo violeta treinamento',
      newFeature:true,
      body:`
        <div class="r27-help-v11-path"><b>Onde ativar:</b> Painel → Visão Gerencial → Modo Teste Global. Também é possível controlar o modo por esta seção da Ajuda.</div>
        <p>O Modo Teste troca temporariamente a operação por um cenário fictício completo para treinamento e demonstração.</p>
        <ul>
          <li>Reaproveita os <b>clientes, produtos e categorias atuais</b> para manter familiaridade e acrescenta registros de teste quando necessário.</li>
          <li>Gera aproximadamente <b>40 dias</b> de movimento; domingos são ignorados e sextas/sábados têm mais volume.</li>
          <li>Inclui comandas abertas/fechadas, pagamentos, turnos, estoque, compras, fornecedores, recebimentos e custos.</li>
          <li>O tema muda para azul/violeta e exibe indicador de Modo Teste.</li>
          <li>WhatsApp real, Edge Functions e sincronização de produção ficam bloqueados.</li>
          <li><b>Regenerar cenário</b> descarta as alterações feitas no teste e cria novamente a base fictícia.</li>
          <li><b>Voltar aos dados reais</b> restaura imediatamente o estado real preservado.</li>
        </ul>
        <div id="r27HelpV11TestControls"></div>
        <div class="r27-help-warn"><strong>Segurança:</strong> o teste não deve ser usado para lançar uma venda real. Uma recarga completa volta aos dados reais por segurança.</div>
      `
    },
    {
      id:'atualizacao-pwa',icon:'↻',title:'Atualizações do aplicativo',summary:'Como novas versões chegam sem interromper uma operação em andamento.',
      search:'atualização automática versão pwa service worker recarregar reload iphone fechar abrir atualização pronta localstorage',
      newFeature:true,
      body:`
        <p>O Rota 27 verifica novas releases automaticamente quando inicia, volta ao primeiro plano, recupera internet e em verificações periódicas.</p>
        <ul>
          <li>Uma atualização só recarrega a interface em <b>janela segura</b>: sem sheet/dialog realmente visível e sem campo em edição.</li>
          <li>Se houver operação em andamento, pode aparecer aviso de que a atualização está pronta e será aplicada depois.</li>
          <li>O coordenador evita repetir reload para a mesma versão.</li>
          <li>Pedidos remotos de atualização também aguardam o aparelho voltar a executar.</li>
          <li>O Modo Teste não dispara atualização automática.</li>
        </ul>
        <div class="r27-help-tip"><strong>Atualização normal:</strong> não limpe <code>localStorage</code> e não reinstale a PWA. Esses procedimentos são reservados para diagnóstico específico.</div>
      `
    },
    {
      id:'diagnostico',icon:'?',title:'Se alguma coisa parecer errada',summary:'Checagens rápidas antes de apagar, reinstalar ou resetar algo.',
      search:'problema erro não aparece whatsapp não chegou sync travou atualização comanda divergente diagnóstico ajuda suporte',
      body:`
        <div class="r27-help-v11-checks">
          <div><b>Comanda sumiu das abertas</b>Confira o Histórico: ela pode ter sido fechada em outro aparelho e sincronizada.</div>
          <div><b>WhatsApp não chegou</b>Veja o aparelho que fez o lançamento, o estado “WhatsApp: configurado” e a fila de pendências/falhas.</div>
          <div><b>Outro aparelho não atualizou</b>Abra Aparelhos sincronizados e solicite sync/diagnóstico. Lembre que um iPhone fechado não pode ser acordado remotamente.</div>
          <div><b>Versão parece antiga</b>Compare o selo da topbar e a “Versão do Rota 27” confirmada pelo aparelho. Evite interpretar versões internas legadas.</div>
          <div><b>Pendência quitada</b>Em A receber, confira “Quitado em” com data/hora e forma; “origem” é a data da dívida.</div>
          <div><b>Tela muito longa</b>Use o X fixo/flutuante disponível em Clientes e Cardápio; não é necessário voltar ao topo.</div>
        </div>
        <div class="r27-help-warn"><strong>Antes de qualquer ação destrutiva:</strong> não limpe localStorage, não apague registros no Supabase e não reinstale a PWA sem diagnóstico específico.</div>
      `
    }
  ];

  const chips=[
    ['primeiros-minutos','Começar'],['comandas-lista-mapa','Comandas'],['cardapio','Cardápio'],['painel','Painel'],['clientes-fidelizacao','Clientes'],['whatsapp-comanda','WhatsApp'],['fechar-receber','A receber'],['sincronizacao','Sync'],['modo-teste','Modo Teste'],['diagnostico','Problemas']
  ];

  function sectionHtml(section){
    const search=normalize([section.title,section.summary,section.search,section.body].join(' '));
    return `<details class="r27-help-section" id="r27-help-${section.id}" data-search="${esc(search)}"${section.newFeature?' data-v11-feature="new"':''}>
      <summary><span class="r27-help-section-icon" aria-hidden="true">${section.icon}</span><span><strong>${section.title}${section.newFeature?' <span class="r27-help-v11-new">NOVO</span>':''}</strong><small>${section.summary}</small></span><span class="r27-help-chevron">⌄</span></summary>
      <div class="r27-help-section-body">${section.body}</div>
    </details>`;
  }

  function chipsHtml(){return chips.map(([id,label])=>`<button type="button" class="r27-help-chip" data-v11-target="${id}">${label}</button>`).join('');}

  function testControlsHtml(){
    const api=testApi();
    if(!api)return '<div class="r27-help-v11-status">Modo Teste carregando…</div>';
    if(testActive())return `<div class="r27-help-v11-status test">🧪 MODO TESTE ATIVO — dados reais preservados.</div><div class="r27-help-v11-actions"><button type="button" data-v11-test="regenerate">Regenerar cenário</button><button type="button" class="primary" data-v11-test="disable">Voltar aos dados reais</button></div>`;
    return `<div class="r27-help-v11-status">Dados reais em uso.</div><div class="r27-help-v11-actions"><button type="button" class="primary" data-v11-test="enable">Ativar Modo Teste</button></div>`;
  }

  function updateTestControls(){const box=byId('r27HelpV11TestControls');if(box)box.innerHTML=testControlsHtml();}

  function apply(){
    const overlay=byId('r27HelpOverlay');
    const content=overlay?.querySelector('.r27-help-content');
    if(!overlay||!content)return false;
    overlay.dataset.helpV11='1';
    const currentRelease=releaseVersion();
    content.innerHTML=`<div class="r27-help-v11-banner"><span class="r27-help-v11-kicker">Ajuda v${VERSION}</span><strong>Manual atualizado do Rota 27</strong><p>Conteúdo consolidado para a operação atual. Use a busca ou os atalhos acima para ir direto ao assunto.</p></div>${sections.map(sectionHtml).join('')}`;
    const chipBox=overlay.querySelector('.r27-help-chips');if(chipBox)chipBox.innerHTML=chipsHtml();
    const footer=overlay.querySelector('.r27-help-footer span');if(footer)footer.textContent=`Ajuda v${VERSION} • Rota 27 v${currentRelease}`;
    updateTestControls();
    const input=byId('r27HelpSearch');if(input&&input.value)input.dispatchEvent(new Event('input',{bubbles:true}));
    return true;
  }

  function scheduleApply(){[0,90,240,600].forEach(ms=>setTimeout(apply,ms));}

  function handleClick(event){
    const chip=event.target.closest?.('[data-v11-target]');
    if(chip){
      const input=byId('r27HelpSearch');if(input){input.value='';input.dispatchEvent(new Event('input',{bubbles:true}));}
      const section=byId(`r27-help-${chip.dataset.v11Target}`);if(section){section.hidden=false;section.open=true;section.scrollIntoView({behavior:'smooth',block:'start'});}return;
    }
    const action=event.target.closest?.('[data-v11-test]');
    if(action){
      const api=testApi();if(!api)return;
      try{
        if(action.dataset.v11Test==='enable')api.enable?.();
        if(action.dataset.v11Test==='disable')api.disable?.();
        if(action.dataset.v11Test==='regenerate')api.regenerate?.();
      }catch(err){console.warn('[Rota27 Ajuda v11] ação Modo Teste:',err);}
      setTimeout(()=>{apply();const s=byId('r27-help-modo-teste');if(s)s.open=true;},100);return;
    }
    if(event.target.closest?.('#r27HelpButton,#r27HelpBtn,[data-help]'))scheduleApply();
  }

  function start(){
    apply();
    document.addEventListener('click',handleClick,true);
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')setTimeout(apply,80);});
    window.addEventListener('rota27:test-mode-changed',()=>setTimeout(()=>{apply();const s=byId('r27-help-modo-teste');if(s)s.open=true;},60));
    window.addEventListener('pageshow',()=>setTimeout(apply,80));
    [250,900,1800].forEach(ms=>setTimeout(apply,ms));
    window.Rota27V02593HelpV11={version:VERSION,refresh:apply,sections:sections.map(s=>s.id)};
    console.info(`[Rota27] Ajuda do Sistema v${VERSION} consolidada.`);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
