# Rota 27 — Status de produção

Última revisão: 24/08/2026

## Produção

- versão: **v0.18.3**;
- branch: `main`;
- GitHub Pages: `https://automatrixhub.github.io/rota27/`;
- Service Worker: `rota27-comandas-v0.18.3`;
- backend `rota27-whatsapp`: versão 23 ACTIVE (`rota27-whatsapp-v6-mini2`);
- `rota27-sync`: versão 2 ACTIVE;
- `rota27-whatsapp-inbound`: versão 1 ACTIVE;
- `rota27-audit`: versão 1 ACTIVE, somente leitura e com autenticação própria por token de dispositivo.

A v0.18.3 preserva a operação validada da v0.18.1 e consolida a identidade oficial do aplicativo sem alterar total, lançamento, fechamento, cancelamento, sincronização ou WhatsApp.

## Validação da v0.18.3

Em 24/08/2026 a candidata foi validada em desktop e celular. Foram conferidos:

- fluidez e ausência do travamento/alto uso de CPU corrigido durante a candidata;
- cards de comandas com faixa lateral final aprovada;
- ordem `Comandas → Cardápio → Painel → Histórico`;
- topbar e logo com fundo integrado à arte;
- Ajuda v4.2 com Tema Capixaba;
- abertura da Ajuda no celular sem sobreposição da barra do navegador;
- navegação e fluxo operacional preservados.

Resultado final reportado: **PERFEITO — funcionou tudo**.

A v0.18.1 permanece como baseline anterior de rollback.

## Tema oficial

### Operação
- laranja, preto e creme como identidade principal;
- laranja reservado a ação/destaque;
- preto para títulos, valores e autoridade visual;
- superfícies claras para leitura e operação rápida;
- cores funcionais preservadas para sucesso, atenção e erro.

### Cards de comandas
- curvatura final validada;
- faixa lateral fina em laranja com trecho preto inferior;
- sem traço horizontal artificial no topo;
- área clicável, textos, valores e botão `Abrir` inalterados.

### Topbar e logo
- topbar mantém proporções aprovadas;
- logo da base preservado;
- moldura do logo usa o tom bege predominante da própria arte, eliminando o quadro branco;
- imagem interna permanece arredondada e centralizada.

## Ajuda v4.2 — Tema Capixaba

A Ajuda mantém todo o conteúdo operacional e recebe identidade institucional em azul, branco e rosa, com:

- busca;
- chips/atalhos;
- cards de acesso rápido;
- acordeons e blocos explicativos;
- Resumo do Turno e Auditoria;
- WhatsApp do cliente/gerente e respostas inbound;
- sincronização, offline, backup/restauração e atualização da PWA.

No celular, o painel usa viewport dinâmico (`100dvh`) e abre no topo, evitando sobreposição com as barras do navegador.

## Resumo do Turno e Auditoria

Permanecem ativos e validados:

- faturamento fechado hoje;
- comandas fechadas e abertas;
- valor em aberto;
- ticket médio;
- unidades vendidas;
- produtos mais vendidos;
- formas de pagamento;
- cancelamentos do turno;
- botão `Ver auditoria`;
- linha do tempo de abertura, fechamento, cancelamento, itens e alterações.

## WhatsApp e sincronização

Sem mudança de arquitetura na v0.18.3:

- família `atualizacao_comanda_rota27_mini2_1` a `_5` permanece em uso;
- template `resposta_cliente_rota27_gerente_v1` permanece aprovado e ativo;
- callback inbound permanece implantado;
- filas de WhatsApp continuam locais por aparelho e nunca são sincronizadas;
- sincronização multidispositivo continua local-first/idempotente.

## Segurança

- nenhum token/App Secret é versionado;
- nenhuma migration destrutiva foi aplicada;
- nenhuma alteração de backend foi necessária para a v0.18.3;
- a versão é predominantemente visual e preserva os contratos operacionais anteriores.

## Atualização da PWA

Não reinstalar e não limpar dados:

1. internet ativa;
2. abrir a PWA por 10–20 segundos;
3. fechar completamente;
4. abrir novamente;
5. confirmar `v0.18.3` e sync saudável.

## Próxima etapa

Com a identidade visual estabilizada, a próxima evolução funcional recomendada continua sendo o **Fechamento do Turno**, aproveitando a trilha de auditoria já consolidada.
