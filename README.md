# Rota 27 Bodega — Comandas

Aplicativo mobile-first, offline-first e multidispositivo para controle rápido de comandas da **Rota 27 Bodega**.

## Produção

**Versão: v0.21.0**  
Branch: `main`  
GitHub Pages: `https://automatrixhub.github.io/rota27/`  
Service Worker: `rota27-comandas-v0.21.0`

A v0.21.0 preserva a operação, o Fechamento do Turno e a Visão Gerencial das versões anteriores e acrescenta o **Estoque Essencial**, opcional por produto, com saldo real, comprometido em comandas abertas, disponível projetado, movimentos manuais e sincronização multidispositivo.

## Recursos principais

### Comandas
- abertura por Balcão, Mesa 1–5, Parklet 1–6 e nome do cliente;
- lançamento rápido por toque, busca, categorias e Mais lançados;
- consulta `Ver itens`, correção em `Editar itens`, fechamento com forma de pagamento e cancelamento seguro;
- proteção contra duplicidade acidental;
- produtos sem controle de estoque continuam operando exatamente como antes.

### Estoque Essencial — v0.21.0
Acesso em `Painel → Estoque Essencial`.

- controle opcional por produto;
- estoque inicial e estoque mínimo;
- `Estoque`, `Comprometido` e `Disponível projetado`;
- itens em comandas abertas reduzem somente o disponível projetado;
- baixa definitiva somente no fechamento da comanda;
- baixa de venda idempotente por `comanda + produto`;
- movimentos manuais: Entrada, Perda, Consumo interno e Ajuste;
- bloqueio de movimento manual que deixaria saldo negativo;
- bloqueio de novo lançamento quando o disponível projetado chega a zero;
- alertas somente quando há baixo estoque, indisponibilidade ou erro de sincronização;
- filtro `Atenção` como lista rápida de reposição;
- histórico de movimentos;
- exportação CSV;
- operação offline e sincronização posterior.

A fórmula do saldo é `estoque inicial + soma dos movimentos imutáveis`.

### Resumo do Turno, Auditoria e Fechamento
Na tela Histórico:
- faturamento fechado hoje;
- comandas fechadas e abertas;
- valor em aberto;
- ticket médio;
- itens vendidos;
- produtos mais vendidos;
- formas de pagamento;
- cancelamentos do turno;
- `Ver auditoria` com linha do tempo operacional;
- `Fechar turno` com conferência e bloqueios;
- snapshot imutável por data;
- consulta em `Fechamentos`;
- bloqueio de nova comanda após o encerramento do dia.

### Visão Gerencial
No `Painel`, a **Visão Gerencial** usa os fechamentos imutáveis como fonte de verdade e oferece:
- períodos de 7, 30, 90 dias e todo o histórico;
- faturamento acumulado, média por turno e ticket médio;
- comandas, itens e cancelamentos;
- comparação com período anterior equivalente;
- gráfico por turno fechado e melhor dia;
- consolidação de produtos e formas de pagamento;
- exportação CSV dos dados reais.

Dias sem fechamento não são inventados como faturamento zero.

### Modo demonstração
A Visão Gerencial possui um modo opcional de apresentação e treinamento:
- desligado por padrão;
- dados simulados somente em memória;
- não grava em `localStorage`;
- não sincroniza;
- não altera comandas, histórico, estoque ou fechamentos reais;
- não interfere em WhatsApp;
- exportação CSV bloqueada durante a demonstração;
- recarregar o app restaura os dados reais.

### Clientes
- cadastro manual;
- captura automática quando a comanda contém nome + WhatsApp válido;
- importação TXT/CSV com prévia e validação;
- exportação CSV;
- autocomplete de nome/telefone;
- sincronização multidispositivo.

### WhatsApp
- envio opcional ao cliente mediante consentimento;
- templates UTILITY `atualizacao_comanda_rota27_mini2_1` a `_5`;
- envio incremental e agrupado;
- outbox local por aparelho com retry e idempotência;
- configuração sincronizada do WhatsApp do gerente;
- respostas dos clientes encaminhadas ao gerente pelo template `resposta_cliente_rota27_gerente_v1`;
- webhook inbound com correlação, idempotência e bloqueio de loop.

### Sincronização e offline
- gravação local-first;
- sincronização multidispositivo de comandas, histórico, cardápio, categorias, clientes, configuração do gerente, fechamentos de turno e estoque;
- `item_delta` para lançamentos concorrentes;
- eventos de estoque `stock_config_upsert` e `stock_movement`;
- outbox/cursor/log remoto idempotente;
- operação local continua disponível sem internet;
- filas de WhatsApp nunca são sincronizadas entre aparelhos.

## Estabilidade do Painel
Durante o primeiro teste da v0.21.0 foi corrigida uma cintilação do card `Visão Gerencial` e um risco de loop de `MutationObserver` na Ajuda. A correção final usa observer restrito aos filhos diretos do Painel, sem polling visual, e observers da Ajuda que se desconectam após concluir a inserção necessária.

## Tema oficial da marca
- operação: laranja, preto e creme/marfim;
- verde/amarelo/vermelho reservados a estados funcionais;
- Ajuda v4.5 preserva o Tema Capixaba em azul, branco e rosa e inclui **Visão Gerencial**, **Modo demonstração** e **Estoque Essencial**.

## Backend Supabase
Projeto: `owkvwsiblbzlpxjwybrt`

- `rota27-sync`: **versão 5 ACTIVE** (`rota27-sync-v0.21.0`), com `turn_closed`, `stock_config_upsert` e `stock_movement`;
- `rota27-audit`: versão 1 ACTIVE, somente leitura;
- `rota27-whatsapp`: versão 23 ACTIVE (`rota27-whatsapp-v6-mini2`);
- `rota27-whatsapp-inbound`: versão 1 ACTIVE.

A v0.21.0 não exigiu migration nem tabela nova. O backend de sync foi ampliado apenas no allowlist de eventos, mantendo compatibilidade com os contratos anteriores.

## Atualização da PWA
Quem já possui o Rota 27 instalado **não precisa reinstalar**:
1. manter internet ativa;
2. abrir a PWA e aguardar cerca de 10–20 segundos;
3. fechar completamente;
4. abrir novamente;
5. confirmar `v0.21.0` e sincronização saudável.

Não limpar dados do navegador e não remover a PWA para atualizar.

## Segurança
- nenhum token/App Secret é versionado;
- credenciais reais não devem ser gravadas no GitHub;
- o fluxo continua local-first;
- outbox do WhatsApp permanece local por aparelho;
- nenhuma migração destrutiva foi necessária para a v0.21.0.

## Próxima versão planejada
**v0.22.0 — Compras & Reposição**: transformar alertas do Estoque Essencial em uma fila simples de compra/reposição, sem criar um ERP pesado. Ver `docs/PLANEJAMENTO-v0.22.0.md`.

## Documentos principais
- `docs/RELEASE-v0.21.0.md`
- `docs/STATUS-PRODUCAO.md`
- `docs/TESTE-v0.21.0.md`
- `docs/ESPEC-v0.21.0.md`
- `docs/HANDOFF-CONTEXTO-v0.21.0.md`
- `docs/PROMPT-NOVO-CHAT-v0.21.0.md`
- `docs/PLANEJAMENTO-v0.22.0.md`
- `docs/PRODUCT-PRINCIPLES.md`

## Versão
Produção: **0.21.0**
