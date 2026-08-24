# Rota 27 — Teste v0.18.2

## Objetivo

Validar o novo Tema Operação Rota 27 sem regressão funcional.

## Prévia

Branch: `feature/v0.18.2-brand-theme`

Executar:

```powershell
powershell -ExecutionPolicy Bypass -File ".\scripts\testar-v0182.ps1"
```

URL dedicada: `http://localhost:3020/?preview=v0182`

## Checklist visual

1. Confirmar selo `v0.18.2`.
2. Cabeçalho: logo oficial preservado, fundo creme/marfim e acento laranja discreto.
3. Comandas: cards claros, texto preto, filete lateral laranja/preto.
4. Botões primários e FAB: laranja oficial.
5. Cardápio: categoria ativa e quantidades em laranja, sem perda de contraste.
6. Comanda aberta: barra inferior preta e ação principal laranja.
7. Navegação inferior: fundo claro, ícone ativo laranja, rótulo ativo preto.
8. Histórico / Resumo do turno: hierarquia preto + laranja, cards legíveis.
9. Auditoria: linha do tempo preservada e botão `Ver auditoria` preto.
10. Ajuda: cabeçalho claro e faixa institucional azul/branco/rosa discreta.

## Smoke funcional obrigatório

- abrir uma comanda;
- lançar pelo menos 2 produtos;
- remover 1 item;
- editar cliente/local;
- fechar uma comanda com forma de pagamento;
- abrir outra e cancelar;
- conferir Resumo do Turno e Auditoria;
- confirmar que sync e WhatsApp continuam sem mudança de comportamento.

## Critério de aprovação

Aprovar somente se o app estiver visualmente mais alinhado à marca e nenhum fluxo operacional tiver ficado mais lento, ambíguo ou com contraste inferior à v0.18.1.
