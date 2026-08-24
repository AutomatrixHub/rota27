# HANDOFF — Rota 27 Bodega — Comandas

Data: 24/08/2026

## 1. Baseline oficial

Produção oficial: **v0.21.0 — Estoque Essencial**  
Branch de produção: `main`  
Repositório: `AutomatrixHub/rota27`  
GitHub Pages: `https://automatrixhub.github.io/rota27/`  
Service Worker: `rota27-comandas-v0.21.0`  
Merge funcional da release: `3d556917802cf24495f2f17c3a03cf517039ba92`

O merge funcional acima pode ser seguido por commits **exclusivamente documentais** deste handoff/prompt. A fonte de verdade para a versão funcional continua sendo v0.21.0.

No fechamento deste handoff:
- PR #26 foi aprovado, marcado ready e mesclado;
- não havia PR aberto;
- não havia issue aberta;
- documentação de release/status/teste foi atualizada;
- planejamento inicial da v0.22.0 foi registrado.

## 2. Forma de trabalho com o usuário

- O usuário não implementa nem edita código.
- Quando uma alteração estiver clara e aprovada, executar diretamente no GitHub conectado.
- Para software não trivial: branch curta → PR draft → implementação → teste dirigido → ready/merge após validação.
- Não pedir ao usuário para editar arquivos manualmente.
- Não apagar `localStorage`.
- Não recomendar reinstalação da PWA como procedimento normal.
- Não solicitar, repetir ou expor tokens/secrets.
- Não sincronizar outbox do WhatsApp entre aparelhos.
- Estado saudável deve ser silencioso; alertas somente quando exigem ação.
- Prioridades: velocidade do atendente, prevenção de cobrança/perda/erro e simplicidade.
- Evitar refatorações de backend “por limpeza” quando o fluxo está estável.

Clone local usado no Windows:
`C:\Users\marco\OneDrive\Documentos\Rota27\mvp\Rota27-comandas-git`

OneDrive já causou locks em `.git/objects` no passado. Nunca fazer limpeza destrutiva de `.git/objects`. Evitar `git reset --hard` sem necessidade e sem antes proteger dados locais.

## 3. Evolução consolidada até v0.21.0

### Comandas
- abertura rápida por Balcão, mesas, parklet e nome do cliente;
- lançamento rápido de produtos;
- busca, categorias e mais lançados;
- edição de itens;
- fechamento com forma de pagamento e confirmação;
- cancelamento seguro;
- histórico de vendas;
- proteção contra duplicidade acidental.

### Clientes
- cadastro manual;
- captura automática por nome + WhatsApp válido;
- importação TXT/CSV;
- exportação CSV;
- autocomplete;
- sincronização multidispositivo.

### WhatsApp
- envio opcional ao cliente mediante consentimento;
- templates `atualizacao_comanda_rota27_mini2_1` a `_5`;
- respostas de clientes encaminhadas ao gerente pelo template `resposta_cliente_rota27_gerente_v1`;
- webhook inbound com correlação e idempotência;
- outbox local por aparelho, nunca sincronizada.

### Fechamento do Turno — v0.19.0
- botão `Fechar turno` em Histórico/Resumo do Turno;
- bloqueio com comandas abertas/pendências;
- conferência final;
- snapshot imutável por data;
- histórico de fechamentos;
- bloqueio de novas comandas após fechamento do dia;
- offline-first;
- sincronização por evento `turn_closed`.

### Visão Gerencial — v0.20.0
- acesso pelo Painel;
- períodos de 7, 30, 90 dias e todo o histórico;
- faturamento, média por turno, ticket médio;
- comandas, itens, cancelamentos;
- comparação com período anterior;
- gráfico por turno fechado;
- melhor dia;
- produtos mais vendidos;
- formas de pagamento;
- CSV;
- usa fechamentos imutáveis como fonte de verdade;
- dias sem fechamento não viram zero artificial.

### Modo demonstração
- recurso oficial de produção dentro da Visão Gerencial;
- desligado por padrão;
- dados simulados apenas em memória;
- não grava `localStorage`;
- não sincroniza;
- não altera comandas, histórico, fechamentos ou estoque;
- CSV bloqueado durante demonstração;
- recarregar volta aos dados reais.

### Estoque Essencial — v0.21.0
- acesso `Painel → Estoque Essencial`;
- controle opcional por produto;
- estoque inicial e mínimo;
- estoque atual;
- comprometido em comandas abertas;
- disponível projetado;
- baixa definitiva somente ao fechar a comanda;
- ID determinístico por `comanda + produto` para impedir baixa duplicada;
- movimentos: Entrada, Venda, Perda, Consumo interno, Ajuste;
- bloqueio de movimento manual que deixaria saldo negativo;
- bloqueio de lançamento quando o disponível projetado chega a zero;
- filtro `Atenção`;
- histórico de movimentos;
- CSV;
- offline-first;
- multidispositivo.

## 4. Incidente importante da v0.21.0

No primeiro teste da candidata foram relatados:
1. o card `Visão Gerencial` desaparecia e reaparecia, causando cintilação no Painel;
2. a tela ficou travada após tentativa de rodar a v0.21.0.

Causa/correção:
- o render legado do Painel substitui periodicamente o `innerHTML` de `screenPanel`;
- a compatibilidade anterior tentava restaurar cards por polling;
- a Ajuda tinha risco de ciclo de `MutationObserver` ao reescrever o rodapé.

Correção final validada:
- sem polling visual;
- observer limitado a `childList` dos filhos diretos de `screenPanel`;
- restauração de `Visão Gerencial` e `Estoque Essencial` na mesma microtask;
- nada de observer de subárvore que possa autoalimentar o próprio DOM;
- rodapé da Ajuda só muda se o texto realmente mudou;
- observer da Ajuda se desconecta após inserir a seção necessária.

**Não reintroduzir polling frequente nem MutationObservers concorrentes sobre os mesmos elementos.** Já houve outro incidente semelhante na família v0.18.x com observers competindo por título/badge e alto uso de CPU.

## 5. Backend Supabase

Projeto: `owkvwsiblbzlpxjwybrt`

Estado conhecido:
- `rota27-sync`: **versão 5 ACTIVE**, `EDGE_VERSION = rota27-sync-v0.21.0`, `verify_jwt=false` porque usa autenticação própria por token de dispositivo;
- `rota27-audit`: versão 1 ACTIVE, somente leitura;
- `rota27-whatsapp`: versão 23 ACTIVE, família mini2;
- `rota27-whatsapp-inbound`: versão 1 ACTIVE.

Eventos de sync consolidados incluem:
- `state_snapshot`;
- `command_opened`;
- `command_patch`;
- `item_delta`;
- `command_closed`;
- `history_upsert`;
- `catalog_upsert`;
- `catalog_delete`;
- `categories_replace`;
- `client_upsert`;
- `client_delete`;
- `manager_config_replace`;
- `turn_closed`;
- `stock_config_upsert`;
- `stock_movement`.

A v0.21.0 **não criou migration nem tabela nova**. Estoque reutiliza `rota27_sync_events` e IDs idempotentes.

## 6. Identidade visual

Operação:
- laranja + preto + creme/marfim;
- verde/amarelo/vermelho somente para estados funcionais;
- logo oficial preservado.

Ajuda:
- Tema Capixaba em azul, branco e rosa;
- Ajuda v4.5;
- viewport mobile protegido contra sobreposição de barra do navegador.

## 7. Regras de severidade

- **P0**: perda/corrupção de dados, cobrança/total errado, fechamento errado, duplicação grave, indisponibilidade geral.
- **P1**: sync não converge, cancelamento não propaga, WhatsApp duplica, ação frequente torna-se impraticável.
- **P2/P3**: refinamento, UX secundária, melhoria não bloqueante.

P0/P1 podem justificar hotfix imediato: branch → PR draft → teste direcionado → merge após validação.

## 8. Próxima versão planejada — v0.22.0

Tema: **Compras & Reposição**.

Documento: `docs/PLANEJAMENTO-v0.22.0.md`.

Direção aprovada para iniciar no próximo chat:
- fila de reposição derivada do Estoque Essencial;
- quantidade sugerida e editável;
- fornecedor opcional por produto;
- cadastro leve de fornecedor;
- pedidos `Rascunho`, `Enviado`, `Recebido`, `Cancelado`;
- recebimento parcial/total;
- recebimento gera Entrada no Estoque Essencial com idempotência;
- histórico de compras/recebimentos;
- agrupamento/filtro por fornecedor e pendência;
- exportação ou texto simples para compartilhar lista;
- offline-first e multidispositivo;
- sem fiscal, contas a pagar, contabilidade ou ERP pesado nesta etapa.

Arquitetura preliminar a revisar antes de implementar:
- `supplier_upsert`;
- `supplier_delete`;
- `purchase_order_upsert`;
- `purchase_receipt`.

Usar o menor conjunto de eventos necessário e evitar migrations se a infraestrutura atual for suficiente.

## 9. Primeiro procedimento no próximo chat

Antes de escrever código:
1. ler este handoff integralmente;
2. conferir GitHub conectado: `main`, `VERSION`, `README.md`, `docs/STATUS-PRODUCAO.md`, `docs/RELEASE-v0.21.0.md`, `docs/PLANEJAMENTO-v0.22.0.md`;
3. confirmar `VERSION = 0.21.0` e `sw.js = rota27-comandas-v0.21.0`;
4. confirmar que não existem PRs/issues abertos;
5. só então iniciar a v0.22.0 em nova branch e PR draft.

Não alterar a produção v0.21.0 antes da primeira candidata da v0.22.0 estar isolada e testável.
