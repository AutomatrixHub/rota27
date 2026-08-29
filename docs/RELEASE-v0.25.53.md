# Rota 27 Bodega — v0.25.53

## Ajuste visual do botão Ver/Editar itens

Release curta de refinamento da barra inferior da comanda.

### Alteração

O botão `Ver/Editar itens` volta a ter a mesma presença visual do botão `Fechar`:

- mesma referência de tamanho de fonte (`16px`);
- mesmo padding vertical da ação `Fechar` (`11px`);
- texto permanece em uma única linha;
- largura ampliada para acomodar `Ver/Editar itens` sem quebra;
- mantém a mesma ação já validada de abrir o editor de itens.

### Largura

- padrão: `148px`;
- telas de até 360px: `144px`;
- sem redução de fonte no breakpoint estreito.

### Escopo

Frontend somente.

Não altera:

- comandas e itens;
- botão `Fechar`;
- Lista / Mapa;
- Mapa rápido desabilitado na v0.25.52;
- sincronização;
- WhatsApp;
- Supabase;
- estoque;
- fechamento de turno;
- dados de produção.

### PWA

- `VERSION`: `0.25.53`;
- cache: `rota27-comandas-v0.25.53-r1`;
- asset: `assets/v02553-cartbar-button.css`.

### Rollback

Baseline anterior: v0.25.52 / merge `de3eafc9df8de798e4d725486d20dd7373a41538`.
