# Release v0.25.92-r2 — Padrão global dos botões de fechar X

## Objetivo
Padronizar todos os botões de fechar `X` do Rota 27 pelo mesmo desenho visual usado em **Clientes & Fidelização**.

## Fonte visual
O padrão canônico vem de `.v025-x`:
- 42 × 42 px em telas maiores;
- 40 × 40 px no mobile;
- fundo `#111`;
- `X` branco;
- raio de 14 px;
- fonte de 25 px;
- sem borda ou sombra ornamental.

## Abrangência
A revisão normaliza os `X` de fechamento presentes em sheets, overlays e módulos do aplicativo, incluindo, entre outros:
- Clientes;
- Clientes & Fidelização;
- WhatsApp do gerente;
- Ajuda;
- Auditoria;
- Visão Gerencial;
- Compras & Reposição;
- Histórico/estoque;
- Custos & Margem;
- Pedidos em rascunho;
- Fechamentos/turno;
- A receber;
- vencimentos;
- Aparelhos sincronizados;
- botões flutuantes de Clientes e Cardápio.

## Segurança
- somente apresentação visual;
- nenhuma mudança na ação/callback de fechamento;
- botões textuais como `Fechar conta`, `Fechar turno`, `Cancelar` e semelhantes não são convertidos em X;
- sem Supabase, migration ou Edge Function;
- sem alteração em comandas, clientes, produtos, estoque, pagamentos, sync ou WhatsApp;
- sem MutationObserver e sem polling.

## Implementação
A revisão foi incorporada aos assets já carregados da v0.25.92:
- `assets/v02592-fab-visibility.css`;
- `assets/v02592-fab-visibility.js`.

A identificação contempla símbolos `×`, `✕`, `✖`, `✗` e X literal quando a semântica do botão confirma fechamento.

## Baseline
- versão funcional: `0.25.92`;
- revisão: `r2`;
- baseline anterior: `v0.25.92-r1`.
