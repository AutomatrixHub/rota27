# Rota 27 v0.23.0 — Plano de teste da candidata

## Estado
**CANDIDATA EM DESENVOLVIMENTO — NÃO PUBLICADA EM PRODUÇÃO.**

Produção preservada: **v0.22.0 — Compras & Reposição**.

PR: **#28 — Rota 27 v0.23.0 — Inventário & Conferência**.

## Objetivo
Validar uma conferência física segura e rápida, principalmente no celular, garantindo que nenhum saldo mude antes da confirmação final e que cada divergência produza no máximo um ajuste.

---

## A — carregamento e regressão visual

### A1. Abrir candidata
Esperado:
- versão visível `v0.23.0`;
- Painel estável;
- Visão Gerencial, Estoque Essencial e Compras & Reposição preservados;
- nenhuma cintilação/travamento.

### A2. Estoque Essencial
Esperado:
- Central gerencial v0.22 preservada;
- botão `Inventário` disponível no Estoque;
- bloco de situação da última conferência/andamento;
- layout mobile compacto preservado.

---

## B — início da conferência

### B1. Sem produto controlado
Esperado:
- inventário não inicia;
- orientação para ativar controle de estoque.

### B2. Com produtos controlados
Esperado:
- cria uma única conferência em estado `open`;
- lista somente produtos com controle ativo;
- captura saldo físico do sistema como `Esperado`;
- estoque não muda.

### B3. Segunda conferência simultânea
Esperado:
- não cria outra;
- direciona para continuar a existente.

---

## C — contagem

### C1. Digitar quantidade igual ao esperado
Esperado:
- diferença `0` / `OK`;
- progresso aumenta;
- saldo do Estoque Essencial continua inalterado.

### C2. Quantidade menor
Esperado:
- diferença negativa destacada como falta.

### C3. Quantidade maior
Esperado:
- diferença positiva destacada como sobra.

### C4. Atalhos
Testar:
- `Igual ao sistema`;
- `Sem unidade`;
- Anterior;
- Salvar e próximo.

Esperado:
- navegação rápida no celular;
- cada valor persiste ao voltar ao produto.

### C5. Busca/filtros
Validar:
- busca por produto;
- categoria;
- Todos;
- Pendentes;
- Divergentes.

---

## D — pausar e continuar

### D1. Pausar
Esperado:
- conferência continua salva;
- nenhum ajuste de estoque é criado.

### D2. Fechar/reabrir candidata
Esperado:
- botão `Continuar conferência`;
- progresso e quantidades já contadas permanecem.

---

## E — proteção contra estoque em movimento

### E1. Iniciar inventário e depois registrar movimento no Estoque
Pode ser Entrada, Perda, venda por fechamento de comanda ou recebimento de compra.

Esperado:
- revisão detecta movimento posterior ao início;
- finalização fica bloqueada;
- orientação para cancelar/reiniciar a conferência em período sem movimentações.

Essa regra existe para impedir que uma contagem antiga produza ajuste incorreto.

---

## F — revisão e finalização

### F1. Produtos pendentes
Esperado:
- revisão mostra quantidade não conferida;
- botão de finalização desabilitado.

### F2. Todos conferidos, sem movimento conflitante
Esperado:
- resumo mostra corretos, faltas, sobras e unidades divergentes;
- confirmação explícita antes de aplicar ajustes.

### F3. Finalizar sem divergência
Esperado:
- inventário é finalizado;
- nenhum movimento de estoque desnecessário é criado.

### F4. Finalizar com divergência
Para cada item divergente, esperado:
- um movimento de tipo `adjust`;
- motivo `Ajuste de inventário <código>`;
- ID determinístico `inventory_adjust_<inventoryId>_<productId>`;
- saldo passa exatamente para a quantidade física contada.

### F5. Idempotência
Esperado:
- reprocessar/receber novamente a mesma finalização não duplica ajuste;
- existe no máximo um movimento daquele inventário/produto.

---

## G — histórico e CSV

Esperado:
- conferências abertas, finalizadas e canceladas aparecem no histórico;
- detalhes preservam esperado, contado e diferença;
- CSV contém inventário, status, data, produto, categoria, esperado, contado e diferença.

---

## H — mobile

Validar em aparelho real:
- sem rolagem horizontal;
- campo `Quantidade contada` confortável com teclado numérico;
- Esperado e Diferença legíveis sem girar a tela;
- atalhos acessíveis ao polegar;
- Anterior / Próximo não exigem rolagens exageradas;
- lista de itens permite salto rápido para um produto;
- resumo final legível.

---

## I — offline local

### I1. Iniciar e contar offline
Esperado:
- funciona normalmente;
- persiste localmente.

### I2. Finalizar offline
Esperado:
- ajustes entram localmente uma única vez;
- eventos de estoque ficam na outbox já existente quando sync estiver configurado;
- sessão de inventário permanece salva.

---

## J — multidispositivo

**Executar somente depois de ampliar o backend para v0.23.**

Novo evento:
- `inventory_upsert`.

Ajustes físicos continuam sincronizando por:
- `stock_movement`.

### J1. Pausar no aparelho A e continuar no B
Esperado:
- sessão e contagens convergem.

### J2. Finalizar no A
Esperado:
- B recebe sessão finalizada;
- movimentos de ajuste convergem uma única vez;
- saldo final igual nos dois aparelhos.

### J3. Offline → online
Esperado:
- outbox converge sem duplicar sessões ou ajustes.

---

## K — regressão crítica

Validar:
- abrir/editar/fechar/cancelar comandas;
- pagamento e totais;
- baixa de venda no estoque;
- Entrada/Perda/Consumo/Ajuste manual;
- Compras & Reposição e recebimentos;
- Fechamento do Turno;
- Visão Gerencial;
- Modo demonstração;
- WhatsApp e inbound;
- atualização PWA sem limpar dados.

## Gate do backend
Antes de ampliar a allowlist do `rota27-sync`, aprovar pelo menos A–I.

## Gate de produção
Somente promover após:
- desktop aprovado;
- celular aprovado;
- finalização/idempotência aprovadas;
- backend v0.23 e teste A→B aprovados;
- regressões críticas sem P0/P1;
- autorização explícita para merge.
