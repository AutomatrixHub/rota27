# Rota 27 Bodega — Comandas

Aplicativo mobile-first, offline-first e multidispositivo para controle rápido de comandas da **Rota 27 Bodega**.

## Produção

**Versão: v0.25.6 — Paridade Visual Lista / Mapa**  
Branch: `main`  
GitHub Pages: `https://automatrixhub.github.io/rota27/`  
Service Worker: `rota27-comandas-v0.25.6-r1`

## Navegação
- **Comandas = atender**;
- **Cardápio = o que é vendido**;
- **Painel = administrar o negócio**;
- **Histórico = o que aconteceu**.

## Comandas — Lista + Mapa
A v0.25.6 corrige o Mapa usando a própria estrutura visual da Lista.

Os cards do Mapa agora reutilizam:
- `command-card` / `v017-command-card`;
- título, local, subtotal, rodapé e divisor da Lista;
- faixa oficial de 6 px com laranja 68% + preto 32%;
- mesma hierarquia cliente/local da Lista.

O Mapa mantém somente uma compactação de escala e continua com o card inteiro clicável.

## WhatsApp — segunda cópia fixa
Permanece ativo o envio adicional dos lançamentos para:

`+55 27 99776-9279` (`5527997769279`)

A cópia usa fila própria, retry e o mesmo backend/template operacional. Há proteção contra duplicidade quando gerente ou cliente já usam o mesmo número.

## Painel e módulos preservados
Permanecem Visão Gerencial, Estoque Essencial, Compras & Reposição, Clientes & Fidelização, Inventário & Conferência, Custos & Margem e sincronização multidispositivo.

## Backend
A v0.25.6 não cria Edge Function, tabela, migration ou evento novo.

## Ajuda
Ajuda **v5.7** identifica a release v0.25.6.

## Atualização da PWA
Não limpar dados nem reinstalar. Abra a PWA online, aguarde 20–30 segundos, feche completamente e abra novamente.

## Documentos
- `docs/RELEASE-v0.25.6.md`
- `docs/VALIDACAO-v0.25.6.md`
- `docs/STATUS-PRODUCAO.md`

Baseline de rollback: **v0.25.5**.

## Versão
Produção: **0.25.6**
