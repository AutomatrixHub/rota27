# Rota 27 v0.25.54 — Nova comanda sem foco automático

Data: 2026-08-28

## Objetivo

Ao abrir `Nova comanda`, nenhum campo deve receber foco automaticamente. O usuário escolhe livremente se começa por Mesa/Local, cliente, WhatsApp, data de nascimento ou outra ação disponível no formulário.

## Alteração

- remove qualquer atributo `autofocus` existente dentro de `#newCommandWrap`;
- envolve `openNewCommandSheet` sem alterar sua regra de negócio;
- após a abertura, desfaz apenas foco programático que tenha sido colocado em um campo do próprio modal;
- não foca outro campo em substituição;
- evita abertura automática do teclado virtual no Android/iPhone;
- preserva completamente os atalhos Mesa/Balcão/Parklet, Consumo interno, cliente, WhatsApp, aniversário e criação da comanda.

## Escopo

Frontend somente.

Não altera:
- dados ou localStorage;
- Supabase;
- sincronização;
- WhatsApp;
- Lista/Mapa;
- estoque;
- fechamento;
- regras de criação de comandas.

## PWA

- `VERSION`: `0.25.54`
- cache: `rota27-comandas-v0.25.54-r1`

## Rollback

Baseline anterior: v0.25.53 / merge `4270874661a9cb86cf54392cccb021876862bf72`.
