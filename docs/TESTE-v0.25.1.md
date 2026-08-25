# Rota 27 v0.25.1 — Plano e resultado de teste

## Estado
**APROVADO PARA PRODUÇÃO EM 25/08/2026.**

Baseline anterior preservada durante o teste: **v0.25.0 — Clientes & Fidelização**.

## A — versão e estabilidade
Validado:
- badge `v0.25.1`;
- navegação entre Comandas, Cardápio, Painel e Histórico;
- sem regressão crítica relatada.

## B — Cardápio limpo
Validado:
- Clientes não aparece mais;
- WhatsApp do gerente não aparece mais;
- WhatsApp da comanda não aparece mais;
- Sincronização entre aparelhos não aparece mais;
- permanecem Gestão do cardápio, Importar/Exportar, busca, produtos e categorias.

## C — Painel / Relacionamento
Validado:
- bloco `Relacionamento`;
- card `Clientes & Fidelização`;
- acesso ao fluxo de Clientes existente;
- Central `Relacionamento & Fidelização` preservada.

## D — Configurações & Integrações
Validado:
- WhatsApp da comanda abre o mesmo configurador existente;
- WhatsApp do gerente abre o mesmo fluxo existente;
- Sincronização entre aparelhos abre a mesma tela já validada;
- configurações previamente salvas permanecem preservadas.

## E — Acessos rápidos do Painel
Validado:
- atalho duplicado de Sincronização removido visualmente;
- Cardápio descrito como `Produtos e categorias`;
- orientação de configuração passa a apontar para o Painel.

## F — Ajuda
Validado como parte da candidata:
- Ajuda v5.2;
- seção `Onde ficam Clientes e configurações`;
- nova regra de navegação documentada.

## G — mobile
A candidata foi aprovada pelo proprietário após teste em uso real/mobile.

## H — regressão rápida
Nenhuma regressão P0/P1 foi relatada durante o gate.

## Gate final
Em 25/08/2026 o proprietário confirmou **“APROVADO!”** após testar a reorganização.

A promoção está autorizada.

Como a v0.25.1 não altera dados, persistência, eventos de sincronização ou backend, não foi criado novo gate A→B específico para esta revisão.
