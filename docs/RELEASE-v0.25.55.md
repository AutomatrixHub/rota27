# Rota 27 v0.25.55 — correção raiz do foco na Nova comanda

## Objetivo

Ao abrir **Nova comanda**, nenhum campo deve receber foco automaticamente. O usuário escolhe livremente qual campo preencher primeiro.

## Causa raiz

A função-base `openNewCommandSheet()` ainda executava, 120 ms após abrir o modal:

```js
setTimeout(()=>document.getElementById('newTable').focus(),120);
```

A v0.25.54 removia foco imediato, mas esse `focus()` tardio da base voltava a colocar o cursor em **Mesa/Local**.

## Correção

A v0.25.55 intercepta somente chamadas programáticas a `focus()` destinadas a `#newTable` durante a janela inicial de abertura do modal.

Isso significa:

- nenhum foco automático em Mesa/Local;
- nenhum foco é transferido para outro campo;
- o teclado virtual não é aberto pelo `focus()` programático da base;
- o toque real do usuário em qualquer campo continua funcionando normalmente;
- os wrappers anteriores de Consumo interno e do hotfix v0.25.54 não voltam a reembrulhar a função ao retornar ao app.

## Escopo preservado

Sem alterações em:

- criação e validação da comanda;
- Mesa/Local e atalhos;
- Consumo interno;
- clientes e WhatsApp;
- data de nascimento;
- Lista/Mapa;
- fechamento;
- Supabase e sincronização;
- dados de produção.

## PWA

- `VERSION`: `0.25.55`
- cache: `rota27-comandas-v0.25.55-r1`

## Rollback

Baseline anterior: v0.25.54, merge `40fc7bc231fdb630bdb80e1830e778e3f9c9f2fe`.
