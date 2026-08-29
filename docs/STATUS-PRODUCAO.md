# Rota 27 — Status de produção

Última revisão: 29/08/2026

## Produção

- versão: **v0.25.57 — Aniversários próximos**;
- branch: `main`;
- GitHub Pages: `https://automatrixhub.github.io/rota27/`;
- Service Worker: `rota27-comandas-v0.25.57-r1`;
- baseline anterior: **v0.25.56**, merge `ae010727766e57ff315d2cbe29ac85017427f08a`.

## Estado operacional do frontend

### Comandas
- Lista e Mapa ativos;
- Mapa rápido desabilitado, preservando a visualização Mapa normal;
- Lista compacta com local ao lado do nome do cliente;
- abertura, edição, cancelamento e fechamento preservados;
- consumo interno/próprio preservado;
- `A receber / Paga depois` preservado;
- barra da comanda com `Ver/Editar itens` e `Fechar`;
- FAB `+` oculto enquanto a barra da comanda está ativa;
- Nova comanda sem foco automático obrigatório em `Mesa/Local`.

### Cardápio
- catálogo completo, categorias e busca preservados;
- gestão de produtos/categorias e histórico de preços preservados;
- **Mais usados hoje** em Top 3, sem rolagem horizontal e sem a faixa legada `Mais lançados`.

### Painel
- `Hoje precisa de atenção` por exceção;
- sem polling contínuo;
- acessos gerenciais existentes preservados.

### Clientes & Fidelização
- cadastro compartilhado e sincronizado;
- data de nascimento preservada via `client_upsert`;
- cards enriquecidos com nascimento, última compra, cliente desde e histórico;
- novo bloco **Aniversários próximos** mostra quantidade de aniversários hoje e nos próximos 7 dias;
- lista compacta de até 5 aniversariantes ordenada por proximidade;
- toque no aniversariante usa a busca existente para localizar o cliente;
- nenhuma mensagem é enviada automaticamente por esse recurso.

### Eventos & Convites
- consentimento específico de marketing preservado;
- proteção contra duplicidade preservada;
- funil real: Registrados / Aceitos Meta / Enviados / Entregues / Lidos / Falharam;
- erro real da Meta disponível quando houver callback `failed`.

## Backend Supabase

Projeto: `owkvwsiblbzlpxjwybrt`.

Edge Functions principais confirmadas em 29/08/2026:

- `rota27-whatsapp` — **v23 ACTIVE**, `verify_jwt=false`;
- `rota27-sync` — **v9 ACTIVE**, `verify_jwt=false`;
- `rota27-whatsapp-inbound` — **v3 ACTIVE**, `verify_jwt=false`;
- `rota27-birthday-campaign` — **v2 ACTIVE**, `verify_jwt=false`;
- `rota27-event-campaign` — **v4 ACTIVE**, `verify_jwt=false`;
- `rota27-event-delivery-status` — **v1 ACTIVE**, `verify_jwt=false`, somente leitura com autenticação própria do aparelho;
- `rota27-audit` — **v1 ACTIVE**, somente leitura.

### Funções administrativas temporárias

As funções abaixo continuam listadas como `ACTIVE` porque o Supabase mantém um deployment publicado, mas estão **encerradas operacionalmente**:

- `rota27-admin-replay-beto-20260827` — v3, `verify_jwt=true`, responde HTTP 410;
- `rota27-admin-resend-mamute-20260828` — v5, `verify_jwt=true`, responde HTTP 410 / `disabled`;
- `rota27-admin-retry-mamute-20260828` — v13, `verify_jwt=true`, responde HTTP 410 / `disabled`.

Nenhuma dessas três funções executa replay, envio, retry ou alteração de dados na versão atualmente publicada.

## Marcos recentes

- **v0.25.43** — inbound passa a armazenar callbacks `sent/delivered/read/failed`;
- **v0.25.44** — cards de clientes enriquecidos;
- **v0.25.45** — Lista de comandas compactada;
- **v0.25.46** — `Hoje precisa de atenção`;
- **v0.25.47** — `Mais usados hoje`;
- **v0.25.48** — funil real de entrega dos Eventos;
- **v0.25.49–v0.25.55** — hotfixes mobile e estabilização de UX;
- **v0.25.55-r2** — shell/PWA republicado com cache-busters corretos;
- **v0.25.56** — baseline/documentação reconciliadas com produção;
- **v0.25.57** — Aniversários próximos.

## Roadmap retomado

Concluído:

0. compactação de Comandas/Lista;
1. Hoje precisa de atenção;
2. Mais usados hoje;
3. funil real de Eventos;
4. Aniversários próximos.

Próximo item funcional:

5. **Vencimento rápido em A Receber**.

Depois:

6. Receber tudo em Compras;
7. dias de cobertura do Estoque;
8. inteligência de Clientes;
9. pré-fechamento por exceção;
10. alertas de custo/margem.

## Regras de preservação

- não limpar `localStorage` de produção;
- não reinstalar PWA como mecanismo normal de atualização;
- não resetar Supabase;
- não recriar clientes;
- Sandbox não envia WhatsApp real nem sincroniza produção;
- não confundir `Aceito Meta` com `Entregue`;
- novas alterações usam branch curta + PR + merge + confirmação do GitHub Pages.

## Rollback

Para rollback funcional imediato, usar a baseline **v0.25.56** / merge `ae010727766e57ff315d2cbe29ac85017427f08a`.
