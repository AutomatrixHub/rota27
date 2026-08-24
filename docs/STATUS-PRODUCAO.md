# Rota 27 — Status de produção

Última revisão: 24/08/2026

## Produção
- versão: **v0.21.0**;
- branch: `main`;
- GitHub Pages: `https://automatrixhub.github.io/rota27/`;
- Service Worker: `rota27-comandas-v0.21.0`;
- `rota27-whatsapp`: versão 23 ACTIVE (`rota27-whatsapp-v6-mini2`);
- `rota27-sync`: **versão 5 ACTIVE** (`rota27-sync-v0.21.0`);
- `rota27-whatsapp-inbound`: versão 1 ACTIVE;
- `rota27-audit`: versão 1 ACTIVE, somente leitura.

A v0.21.0 preserva a operação validada da v0.20.0 e acrescenta o **Estoque Essencial**, sem alterar cálculo financeiro, pagamento, cancelamento, Fechamento do Turno, WhatsApp ou a fonte de verdade da Visão Gerencial.

## Validação da v0.21.0
Em 24/08/2026 a candidata foi testada e aprovada para produção.

Foram validados:
- ativação opcional de estoque por produto;
- estoque inicial e mínimo;
- saldo atual, comprometido e disponível projetado;
- projeção correta com itens em comandas abertas;
- baixa definitiva apenas no fechamento;
- prevenção de baixa duplicada;
- Entrada, Perda, Consumo interno e Ajuste;
- bloqueio de movimento manual que causaria saldo negativo;
- alerta de baixo estoque/indisponibilidade;
- bloqueio de lançamento sem disponível projetado;
- histórico e CSV;
- operação offline e sincronização posterior;
- convergência multidispositivo;
- Visão Gerencial e Modo demonstração preservados;
- Ajuda v4.5;
- regressão de comandas, Histórico, Auditoria, Fechamento do Turno e WhatsApp.

### Correção de estabilidade durante a candidata
No primeiro teste foram relatados:
1. cintilação do card `Visão Gerencial` no Painel;
2. tela travada após tentativa de executar a v0.21.0.

A causa estava em interações com o render legado do Painel e em risco de loop de `MutationObserver` na camada de compatibilidade da Ajuda.

A correção final:
- removeu polling visual da compatibilidade do Painel;
- restaura `Visão Gerencial` e `Estoque Essencial` usando observer restrito aos filhos diretos de `screenPanel`;
- evita observação de subárvore que possa autoalimentar mutações;
- altera o rodapé da Ajuda somente quando necessário;
- desconecta o observer da Ajuda depois da inserção esperada.

Após essas correções, a versão foi novamente testada e **aprovada integralmente**.

Baseline anterior de rollback: **v0.20.0**.

## Estoque Essencial
Disponível em `Painel → Estoque Essencial`.

Regras principais:
- controle é opcional por produto;
- produtos não controlados continuam sem bloqueio de estoque;
- saldo contabilizado = estoque inicial + movimentos imutáveis;
- itens em comandas abertas entram apenas em `Comprometido`;
- `Disponível projetado = Estoque - Comprometido`;
- baixa de venda ocorre somente quando a comanda realmente fecha;
- ID determinístico `comanda + produto` evita baixa duplicada;
- movimentos manuais suportados: Entrada, Perda, Consumo interno e Ajuste;
- saldo negativo por movimento manual é bloqueado;
- lançamento de produto controlado é bloqueado quando o disponível projetado chega a zero;
- estado saudável é silencioso;
- filtro `Atenção` mostra apenas itens que exigem ação.

## Sincronização do estoque
A v0.21.0 reutiliza a infraestrutura `rota27_sync_events` e acrescenta somente dois tipos de evento:
- `stock_config_upsert`;
- `stock_movement`.

A Edge Function `rota27-sync` está na **versão 5 ACTIVE** com `EDGE_VERSION = rota27-sync-v0.21.0`.

Não houve migration, tabela nova nem alteração destrutiva.

## Visão Gerencial
Permanece ativa e validada:
- 7, 30, 90 dias e todo o histórico;
- faturamento, média por turno e ticket;
- comandas, itens e cancelamentos;
- comparação com período anterior;
- gráfico, melhor dia, produtos e formas de pagamento;
- CSV dos dados reais;
- Modo demonstração somente em memória e desligado por padrão.

## Fechamento do Turno e Auditoria
Permanecem ativos:
- conferência final;
- bloqueio com comandas abertas/pendências;
- snapshot imutável por data;
- histórico de fechamentos;
- bloqueio de novas comandas após fechamento do dia;
- sincronização por `turn_closed`;
- linha do tempo operacional da Auditoria.

## WhatsApp
Sem mudança na v0.21.0:
- templates `atualizacao_comanda_rota27_mini2_1` a `_5`;
- template `resposta_cliente_rota27_gerente_v1`;
- inbound ativo;
- outbox de WhatsApp permanece local por aparelho e nunca é sincronizada.

## Ajuda v4.5 — Tema Capixaba
Preserva a identidade azul, branco e rosa e inclui agora:
- Fechamento do Turno;
- Visão Gerencial;
- Modo demonstração;
- Estoque Essencial;
- offline, sincronização, backup/restauração e atualização da PWA.

## Atualização da PWA
Não reinstalar e não limpar dados:
1. internet ativa;
2. abrir a PWA por 10–20 segundos;
3. fechar completamente;
4. abrir novamente;
5. confirmar `v0.21.0` e sincronização saudável.

## Segurança
- nenhum token/App Secret versionado;
- nenhuma migration destrutiva;
- operação local-first preservada;
- outbox do WhatsApp separada e local;
- Modo demonstração não persiste dados simulados.

## Próxima etapa planejada — v0.22.0
**Compras & Reposição**.

Objetivo: transformar os alertas do Estoque Essencial em uma rotina simples de compra e recebimento, sem introduzir um ERP pesado.

Direção inicial:
- lista de reposição derivada de estoque mínimo/disponível projetado;
- quantidade sugerida de compra;
- fornecedor opcional por produto;
- pedido de compra simples com estados `Rascunho`, `Enviado`, `Recebido` e `Cancelado`;
- recebimento que gera Entrada de estoque idempotente;
- histórico de compras;
- filtro por fornecedor/pendência;
- exportação/compartilhamento simples da lista;
- offline-first e multidispositivo;
- nenhuma integração fiscal/contábil nesta etapa.

Ver `docs/PLANEJAMENTO-v0.22.0.md`.
