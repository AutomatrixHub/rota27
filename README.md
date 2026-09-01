# Rota 27 Bodega — Comandas

Aplicativo mobile-first, offline-first e multidispositivo para controle rápido de comandas da **Rota 27 Bodega**.

## Produção
- **Versão candidata:** v0.25.103 — shell visual canônico no primeiro carregamento
- **Branch:** `main`
- **GitHub Pages:** `https://automatrixhub.github.io/rota27/`
- **Service Worker candidato:** `rota27-comandas-v0.25.103-r1`
- **Baseline de produção:** v0.25.102

## v0.25.103 — shell visual canônico

A TOPBAR e a barra inferior passam a nascer com estrutura, cores e geometria atuais no próprio arquivo-base. A barra inferior já contém **Painel**, sem reconstruir o antigo botão **Nova**; o módulo antigo apenas liga o comportamento. O estilo compacto da TOPBAR foi transferido da folha tardia para o shell, e o Painel deixou de escrever título e versão antigos durante o carregamento.

## v0.25.102 — Ajuda sem foco na origem

A Ajuda-base deixa de focar automaticamente a busca ao abrir. Com isso, foi excluída a camada v0.25.94 que interceptava o clique e agendava três neutralizações de foco. O foco manual da busca e a restauração de foco ao fechar permanecem inalterados. Promovida pelo PR #150.

## v0.25.101 — FAB corrigido na origem

O Painel deixa de forçar a exibição do botão flutuante **Nova comanda**. Com a causa removida, a camada v0.25.92 deixa de interceptar `showScreen()` e de sincronizar o FAB após cada navegação; ela permanece responsável apenas pela padronização dos botões de fechar. A regra CSS defensiva continua ativa. Promovida pelo PR #148.

## v0.25.100 — TOPBAR canônica

A TOPBAR completa passa a existir diretamente no HTML inicial: subtítulo em duas linhas, versão e botão Ajuda. Foi removida a montagem tardia que escondia o componente, carregava CSS adicional e transformava seu conteúdo depois dos demais scripts. O asset redundante `v02580-r3-list-empty-topbar.css` também foi eliminado. A versão foi promovida pelo PR #146 e publicada no GitHub Pages.

## v0.25.99 — centralização aprovada

A versão corrige diretamente no estilo canônico de `base-v013.html` o alinhamento do quadro vazio da Lista, sem criar novo asset ou camada de compatibilidade. Foi homologada no Android e promovida pelo PR #144.

## v0.25.98 — estado vazio canônico aprovado

A v0.25.98 elimina a reconstrução tardia do quadro **Nenhuma comanda aberta**, remove os antigos assets v0.25.80-r4/v0.25.88 responsáveis pela sobreposição e estabelece componentes independentes para Lista e Mapa. Foi homologada no Android e promovida pelo PR #142.

## v0.25.97 — estabilização aprovada

Esta candidata não altera dados, Supabase, WhatsApp ou regras operacionais. Ela corrige dois problemas encontrados durante a homologação:
- impede que a Topbar legada apareça enquanto a interface atual ainda está sendo montada;
- elimina a recursão entre wrappers históricos de `openNewCommandSheet`, usando diretamente a abertura canônica da Nova comanda.

A v0.25.97 foi homologada no Android, inclusive em Modo Teste, e promovida pelo PR #140.

## v0.25.80 — Edição sem foco + campo Ícone removido

### Editar produto e Editar categoria
As telas de edição passam a abrir sem foco inicial automático, seguindo o padrão já aprovado para **Nova comanda** e **Editar comanda**:
- **Editar produto** não coloca foco automático em `NOME DO PRODUTO`;
- **Editar categoria** não coloca foco/seleção automática em `NOME DA CATEGORIA`;
- o teclado virtual não deve abrir sozinho;
- o operador escolhe explicitamente o campo que deseja editar;
- o bloqueio é finito e atua somente na abertura dos modos de edição.

### Cadastro de produtos — campo Ícone
O campo visual **Ícone** foi removido do cadastro/edição de produtos. Para preservar compatibilidade com dados históricos e com a função legada de salvamento, o identificador `menuItemEmoji` permanece apenas como input oculto interno. Nenhum dado existente é apagado e a categoria passa a ocupar toda a largura disponível nessa linha.

A release não altera regras de produto, preços, estoque, backend ou integrações.

## v0.25.79 — Borda vermelha real com cantos arredondados

A faixa vermelha interna da Opção B foi substituída por uma **borda esquerda real do próprio card**:
- o vermelho agora acompanha o `border-radius` nos cantos superior e inferior;
- a pseudo-faixa `::before` foi desativada;
- a espessura permanece em 4px e o tom permanece `#da693d`;
- o padding esquerdo foi compensado para manter o texto na mesma posição visual;
- altura, largura, preço, botão Editar, tipografia, categoria e status permanecem inalterados.

A correção é estritamente CSS e resolve a diferença de formato observada entre a proposta aprovada e a tela real.

## v0.25.78 — Bordas vermelhas refinadas no Cardápio

A Opção B do Cardápio permanece integralmente preservada, com um refinamento visual solicitado após comparação entre a proposta aprovada e a tela real em produção:
- o acento vertical dos cards deixa o gradiente alaranjado da v0.25.77 e passa a usar vermelho-terra sólido `#da693d`;
- o contorno do botão **Editar** usa o mesmo vermelho-terra, aproximando a produção da proposta visual aprovada;
- dimensões, altura, tipografia, preço, categoria, status e organização dos cards não mudam.

A alteração é estritamente CSS. Nenhum dado, regra de produto, backend ou integração foi alterado.

## v0.25.77 — Cardápio sem ícones + cards Opção B

### Cardápio
A lista administrativa de produtos adota a **Opção B** aprovada:
- ícones removidos de todos os produtos da tela **Cardápio**;
- cards reorganizados em duas áreas: informações do produto à esquerda e preço/ação à direita;
- barra vertical de destaque identifica visualmente cada card sem consumir largura útil;
- preço aparece em pill terracota suave de alto contraste;
- botão **Editar** fica logo abaixo do preço;
- categoria e estado do produto permanecem visíveis na segunda linha;
- altura permanece compacta para reduzir rolagem.

A mudança é somente visual. Cadastro, edição, filtros, categorias, importação/exportação e regras de produto permanecem inalterados.

## v0.25.76 — Editar comanda sem foco automático + preço vermelho

### Editar comanda
A tela **Editar comanda** passa a abrir sem foco inicial em qualquer campo ou elemento interativo, seguindo o mesmo comportamento já adotado na **Nova comanda**. O teclado virtual não deve abrir sozinho; o usuário escolhe explicitamente qual campo deseja editar.

### Preço dos produtos
Nos cards da tela de lançamento da comanda, o preço volta para o vermelho/terracota utilizado no design, mantendo todos os refinamentos compactos da v0.25.75.

## v0.25.75 — Cardápio compacto e edição de comanda em destaque

### Lançamento de produtos
- ícones removidos dos botões de produtos no lançamento da comanda;
- descrição dos produtos aumentada em 1px;
- badge da quantidade já lançada movida para o canto inferior direito;
- cards normais reduzidos para uma altura mais compacta, diminuindo rolagem;
- `Mais usados recentemente/hoje` mantém Top 3, recebe tipografia maior e destaque discreto de cor;
- atalhos do Top 3 passam a ter altura equivalente aos cards compactos da grade normal.

### Editar comanda
O antigo botão de lápis discreto no cabeçalho da comanda passa a ser uma ação laranja com texto **Editar comanda**, mantendo o mesmo fluxo funcional de edição.

## v0.25.74 — Consentimento persistente de WhatsApp

### Regra operacional
A autorização para **atualizações operacionais da comanda** passa a pertencer ao cadastro do cliente, e não apenas à comanda atual.

- ao selecionar um cliente que já autorizou, o checkbox de WhatsApp é marcado automaticamente;
- a tela informa que a autorização já estava registrada e mostra a data disponível;
- desmarcar o checkbox afeta somente a comanda atual e não revoga a autorização global;
- a revogação global é uma ação separada e explícita;
- se o cliente autorizar novamente após uma revogação, marcar o checkbox registra uma nova autorização;
- clientes antigos com alguma comanda histórica `whatsappOptIn=true` são migrados como autorização já existente;
- o consentimento é sincronizado entre aparelhos usando `client_upsert`, com armazenamento local próprio e cursor independente;
- autorização de comanda não é reutilizada como autorização para marketing, eventos ou outras campanhas.

### Cadastro de clientes
O editor de cliente passa a exibir o estado **Autorizado / Revogado / Não registrado** para atualizações da comanda e permite registrar ou revogar a autorização de forma explícita.

## v0.25.73 — Cancelamento + WhatsApp
- cancelamento captura a comanda antes da limpeza legada da fila;
- cliente autorizado recebe a comanda como **CANCELADA**;
- itens aparecem como **REMOVIDO**;
- total final do cancelamento é **R$ 0,00**;
- envio possui fila persistente, retry e `eventId` idempotente.

## Aniversários e relacionamento
- parabéns automático às 09:30 permanece ativo;
- solicitação de data de nascimento permanece limitada a 3 envios bem-sucedidos com 7 dias entre eles;
- consentimento de atualização da comanda não altera as regras de aniversário ou eventos.

## Preservação
- nenhuma migration;
- nenhuma Edge Function alterada nesta release;
- nenhum reset ou exclusão de dados;
- preços, produtos, estoque, comandas, clientes, recebíveis e histórico preservados;
- sem `MutationObserver` e sem polling contínuo novo.

## Atualização da PWA
Não limpar `localStorage`, não reinstalar a PWA e não apagar dados de produção. Abra online, aguarde a atualização, feche completamente e abra novamente.

## Documentação
- `docs/STATUS-PRODUCAO.md`
- `docs/RELEASE-v0.25.80.md`
- `docs/RELEASE-v0.25.79.md`
- `docs/RELEASE-v0.25.78.md`
- `docs/RELEASE-v0.25.77.md`
- `docs/RELEASE-v0.25.76.md`
- `docs/RELEASE-v0.25.75.md`
- `docs/RELEASE-v0.25.74.md`

## Versão
Produção: **0.25.80**
