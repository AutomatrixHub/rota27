# Rota 27 Bodega — Comandas

Aplicativo mobile-first, offline-first e multidispositivo para controle rápido de comandas da **Rota 27 Bodega**.

## Produção

**Versão: v0.25.7 — Replay de histórico WhatsApp**  
Branch: `main`  
GitHub Pages: `https://automatrixhub.github.io/rota27/`  
Service Worker: `rota27-comandas-v0.25.7-r1`

## Navegação
- **Comandas = atender**;
- **Cardápio = o que é vendido**;
- **Painel = administrar o negócio**;
- **Histórico = o que aconteceu**.

## Comandas — Lista + Mapa
Permanece a paridade visual da v0.25.6, com o Mapa reutilizando a estrutura visual da Lista e mantendo o card inteiro clicável.

## WhatsApp — cópia fixa
Novos lançamentos continuam sendo enviados adicionalmente para:

`+55 27 99776-9279` (`5527997769279`)

A cópia usa fila própria, retry e o mesmo backend/template operacional.

## v0.25.7 — replay de 25/08
Foi acrescentado um replay controlado de **23 mensagens históricas** de 25/08/2026 para o mesmo número fixo.

Em **WhatsApp do gerente** há o bloco **Reenviar histórico de 25/08**. O envio:
- exige ação explícita;
- preserva a ordem informada;
- inclui inclusões, remoções e totais históricos;
- usa IDs estáveis para evitar duplicidade;
- pode continuar do ponto em que parou;
- usa os mesmos templates do `rota27-whatsapp`.

O WhatsApp mostrará o horário real do reenvio; os horários originais ficam preservados internamente no replay.

## Painel e módulos preservados
Permanecem Visão Gerencial, Estoque Essencial, Compras & Reposição, Clientes & Fidelização, Inventário & Conferência, Custos & Margem e sincronização multidispositivo.

## Backend
A v0.25.7 não cria Edge Function, tabela, migration ou evento novo.

## Ajuda
Ajuda **v5.8** identifica a release v0.25.7.

## Atualização da PWA
Não limpar dados nem reinstalar. Abra a PWA online, aguarde 20–30 segundos, feche completamente e abra novamente.

## Documentos
- `docs/RELEASE-v0.25.7.md`
- `docs/STATUS-PRODUCAO.md`

Baseline de rollback: **v0.25.6**.

## Versão
Produção: **0.25.7**
