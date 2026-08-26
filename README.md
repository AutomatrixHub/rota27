# Rota 27 Bodega — Comandas

Aplicativo mobile-first, offline-first e multidispositivo para controle rápido de comandas da **Rota 27 Bodega**.

## Produção

**Versão: v0.25.8 — Replay Hibernado**  
Branch: `main`  
GitHub Pages: `https://automatrixhub.github.io/rota27/`  
Service Worker: `rota27-comandas-v0.25.8-r1`

## Navegação
- **Comandas = atender**;
- **Cardápio = o que é vendido**;
- **Painel = administrar o negócio**;
- **Histórico = o que aconteceu**.

## Comandas — Lista + Mapa
Permanece a paridade visual implementada na v0.25.6, com o Mapa reutilizando a estrutura visual da Lista e mantendo o card inteiro clicável.

## WhatsApp — cópia fixa contínua
Novos lançamentos continuam sendo enviados adicionalmente para:

`+55 27 99776-9279` (`5527997769279`)

A cópia usa fila própria, batching, retry e o mesmo backend/template operacional.

## v0.25.8 — replay histórico hibernado
A ferramenta excepcional **Reenviar histórico de 25/08** foi retirada da interface e da execução normal.

Os arquivos:
- `assets/v0257-history-replay.js`;
- `assets/v0257-history-replay.css`;

continuam preservados no repositório, mas não são carregados pela produção nem incluídos no APP_SHELL da PWA.

O estado local e os IDs do replay não são apagados, permitindo reativação futura sem perder a idempotência do histórico já processado.

## Painel e módulos preservados
Permanecem Visão Gerencial, Estoque Essencial, Compras & Reposição, Clientes & Fidelização, Inventário & Conferência, Custos & Margem e sincronização multidispositivo.

## Backend
A v0.25.8 não cria Edge Function, tabela, migration ou evento novo.

## Ajuda
Ajuda **v5.9** identifica a release v0.25.8.

## Atualização da PWA
Não limpar dados nem reinstalar. Abra a PWA online, aguarde 20–30 segundos, feche completamente e abra novamente.

## Documentos
- `docs/RELEASE-v0.25.8.md`
- `docs/STATUS-PRODUCAO.md`

Baseline de rollback: **v0.25.7**.

## Versão
Produção: **0.25.8**
