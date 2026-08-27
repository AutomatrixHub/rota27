# Rota 27 v0.25.28 — Novo estilo dos ícones do Cardápio

Data: 27/08/2026

## Objetivo
Responder ao feedback visual da v0.25.27 e substituir o acabamento monocromático/bege dos ícones por uma linguagem mais leve, moderna e adequada a um app de operação no celular.

## Alterações visuais
- ícones passam a usar badges circulares em vez de caixas bege;
- cada família recebe uma cor terrosa suave e consistente;
- pictogramas ficam brancos, com traço um pouco mais firme e leitura mais rápida;
- cervejas, vinhos, bebidas, café, queijos, frios, molhos, castanhas, biscoitos, doces, pães, petiscos e fallback genérico continuam diferenciados;
- produtos inativos usam acabamento neutro/desaturado;
- espaçamento entre ícone e conteúdo foi refinado.

## Implementação
- novo asset visual: `assets/v02528-product-icons-soft.css`;
- o mapeamento funcional da v0.25.27 continua sendo usado;
- nenhum dado `emoji` foi removido ou alterado;
- sem novo JavaScript de domínio;
- sem `MutationObserver`;
- sem polling contínuo.

## Backend
Nenhuma alteração em:
- Supabase;
- Edge Functions;
- event log;
- constraints;
- tipos de evento;
- catálogo;
- preços;
- categorias;
- sincronização.

## PWA
- versão: `0.25.28`;
- Service Worker: `rota27-comandas-v0.25.28-r1`.

## Rollback
- v0.25.27;
- HEAD anterior: `d9bfbc0283b6f798d85b46579af3212643162710`.
