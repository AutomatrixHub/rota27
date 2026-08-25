# Rota 27 v0.25.1 — Navegação & Configurações

Data de promoção: **25/08/2026**

## Resumo
A v0.25.1 é um refinamento de UX sobre a v0.25.0. Não adiciona nova regra de negócio nem altera backend. O objetivo é alinhar a navegação à expectativa do usuário.

## Regra de navegação
- **Comandas = atender**;
- **Cardápio = o que é vendido**;
- **Painel = administrar o negócio**;
- **Histórico = o que aconteceu**.

## Entregas
### Cardápio
Removidos visualmente:
- Clientes;
- WhatsApp do gerente;
- WhatsApp da comanda;
- Sincronização entre aparelhos.

O Cardápio permanece dedicado a:
- produtos;
- categorias;
- preços;
- importação/exportação;
- busca e edição.

### Painel
Novo bloco **Relacionamento**:
- Clientes & Fidelização.

Novo bloco **Configurações & Integrações**:
- WhatsApp da comanda;
- WhatsApp do gerente;
- Sincronização entre aparelhos.

Os novos cards reutilizam os fluxos anteriores. Os componentes antigos permanecem internamente apenas para compatibilidade.

### Acessos rápidos
- atalho duplicado de Sincronização removido visualmente;
- Cardápio descrito como `Produtos e categorias`;
- mensagens de configuração não remetem mais ao Cardápio.

## Ajuda
Ajuda elevada para **v5.2**, incluindo a seção `Onde ficam Clientes e configurações`.

## Implementação
- `VERSION = 0.25.1`;
- Service Worker: `rota27-comandas-v0.25.1-r1`;
- novos assets:
  - `assets/v0251-navigation.js`;
  - `assets/v0251-navigation.css`.

A camada é carregada por último para consolidar a organização visual sem reescrever fluxos legados.

## Estabilidade
A v0.25.1 não adiciona:
- `setInterval`;
- `MutationObserver`;
- novo evento de sync;
- tabela/migration;
- Edge Function.

A regra de estabilidade do Painel continua obrigatória: evitar polling visual frequente e observers concorrentes.

## Backend
Sem alteração.

Permanece:
- `rota27-sync` versão 7 ACTIVE (`rota27-sync-v0.23.0`);
- demais Edge Functions e migrations inalteradas.

## Validação
A candidata foi testada e aprovada pelo proprietário em 25/08/2026 com a confirmação **“APROVADO!”**.

Foram considerados aprovados:
- nova organização do Cardápio;
- blocos Relacionamento e Configurações & Integrações no Painel;
- abertura correta dos quatro fluxos movidos;
- preservação das configurações existentes;
- mobile;
- ausência de regressão crítica relatada.

Como não há mudança de dados/sync/backend, não foi exigido novo gate A→B específico para esta revisão.

## Rollback
Baseline anterior segura: **v0.25.0 — Clientes & Fidelização**.

## Atualização da PWA
Não reinstalar nem limpar dados. Abrir a PWA com internet por 10–20 segundos, fechar completamente e abrir novamente até confirmar `v0.25.1`.
