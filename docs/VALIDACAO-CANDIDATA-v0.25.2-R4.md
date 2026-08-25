# Rota 27 v0.25.2 — Validação da candidata R4

## Motivo
No reteste da candidata R3, o bloco **Relacionamento — Clientes & Fidelização** aparecia no Painel e desaparecia cerca de um segundo depois.

## Causa confirmada
O Painel legado ainda executa uma rotina interna que redesenha `screenPanel` por atribuição de `innerHTML`. Como o bloco Relacionamento havia sido movido para dentro de `screenPanel`, esse redesenho removia o bloco do DOM.

## Correção R4
A camada `assets/v0252-panel-polish.js` passou a instalar uma ponte específica no setter `innerHTML` do elemento `screenPanel`.

Após cada redesenho nativo do Painel:
1. o render legado conclui normalmente;
2. as camadas já existentes restauram Visão Gerencial, Estoque e Compras;
3. a R4 recoloca **Relacionamento** imediatamente depois de **Compras & Reposição**;
4. a contagem de clientes é atualizada.

A correção não adiciona `setInterval` nem um novo `MutationObserver`.

## Cache
Candidata R4: `rota27-comandas-v0.25.2-r4`.

## Gate obrigatório
No reteste:
- abrir Painel;
- confirmar a ordem Visão Gerencial → Estoque → Compras → Relacionamento;
- permanecer no Painel por pelo menos 10 segundos;
- o bloco Relacionamento não pode desaparecer, piscar ou mudar de posição;
- alternar para outra aba e voltar ao Painel;
- minimizar/retomar o navegador e voltar ao Painel;
- `Clientes & Fidelização` deve continuar abrindo o fluxo existente;
- os três botões principais devem permanecer padronizados;
- o clique nos cards do Mapa continua sendo gate crítico da R2.

**CANDIDATA — NÃO PUBLICAR até aprovação explícita.**
