# Rota 27 v0.25.2 — Plano de teste e gate

## Estado
**PUBLICAÇÃO AUTORIZADA EM 25/08/2026.**

Baseline anterior: **v0.25.1 — Navegação & Configurações**.

## Gates iterativos
### R2 — Mapa
- toque em qualquer ponto do card abre a comanda;
- seletor Lista/Mapa com destaque claro.

### R3/R4 — Painel
- botões principais padronizados;
- Relacionamento logo após Compras;
- correção do desaparecimento do Relacionamento após renders legados.

### R6 — ícones
- emojis descartados;
- ícones lineares CSS para Visão, Estoque e Compras;
- correção do texto espremido após atualização interna dos cards.

### R7 — normalização final
Solicitação final aprovada para publicação:
- quatro cards principais no mesmo padrão visual;
- Visão Gerencial;
- Estoque Essencial;
- Compras & Reposição;
- Clientes & Fidelização;
- remoção visual de `v0.22.0` em Compras;
- título, descrição, ícone, padding, altura e ação normalizados;
- Clientes deixa de usar emoji/card visual diferente;
- cache final `rota27-comandas-v0.25.2-r7`.

## A — Comandas
Validar Lista e Mapa apontando para o mesmo conjunto de comandas abertas.

Esperado:
- nenhuma duplicação;
- nenhuma comanda perdida;
- um toque abre a comanda correta;
- fechamento remove a comanda das duas visões.

## B — zonas
Testar Mesa, Balcão, Parklet, cliente sem local e Outro local.

Esperado: cada comanda aparece uma única vez na zona correta.

## C — abertura rápida
Testar `+ Mesa`, `+ Balcão`, `+ Parklet` e `+ Cliente`.

Esperado: reutilizam `Nova comanda`; cancelar não cria nada.

## D — Painel R7
Conferir os quatro cards iniciais.

Esperado:
- mesma altura/padding/moldura;
- títulos com mesmo tamanho/peso;
- descrições com mesmo tamanho/line-height;
- ícones lineares coerentes;
- `v0.22.0` ausente;
- ações com mesma caixa;
- Clientes & Fidelização no mesmo padrão dos três anteriores;
- Relacionamento não aparece como seção visual separada;
- nenhum card desaparece após atualização do Painel.

## E — mobile
Esperado:
- sem overflow horizontal;
- ícone + texto alinhados;
- botão em largura total abaixo;
- nenhum texto comprimido em coluna estreita.

## F — regressão
Confirmar rapidamente:
- abrir/editar/fechar/cancelar comanda;
- lançar itens;
- Cardápio;
- Histórico;
- Clientes & Fidelização;
- WhatsApp;
- Sincronização;
- Estoque;
- Compras;
- Inventário;
- Custos & Margem.

## G — multidispositivo
A v0.25.2 não cria domínio novo de sync. Lista e Mapa usam `state.commands`; A→B continua dependendo do mecanismo existente. A preferência Lista/Mapa é local ao aparelho.

## Gate de produção
Promoção autorizada pelo proprietário em 25/08/2026 com a instrução explícita para implementar a R7, publicar no GitHub e colocar a nova versão em produção.
