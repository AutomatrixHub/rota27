# Rota 27 v0.18.3 — validação final

Data: 24/08/2026

## Estado

**VALIDADA — PRONTA PARA PRODUÇÃO**

## Objetivo

Validar o pacote visual final da v0.18.3:

1. Tema Operação Rota 27;
2. refinamento dos cards de comandas;
3. ordem `Comandas → Cardápio → Painel → Histórico`;
4. topbar/logo refinados;
5. Ajuda v4.2 com Tema Capixaba;
6. comportamento correto no celular.

## Validação executada

### Desktop
- versão `0.18.3` carregada corretamente;
- sem travamento ou aumento anormal de CPU;
- cards refinados e aprovados;
- logo/topbar aprovados;
- navegação inferior na ordem final;
- Ajuda Capixaba aprovada.

### Celular
A preview foi servida pela rede local na porta `3021` e validada em aparelho real.

Foram conferidos:
- topbar;
- logo;
- cards das comandas;
- barra inferior;
- Ajuda Tema Capixaba;
- fluidez geral;
- correção da sobreposição inicial da Ajuda com a barra do navegador;
- abertura da Ajuda no topo do conteúdo usando viewport dinâmico.

## Smoke funcional

Durante o ciclo da candidata foram preservados e conferidos:
- abrir comanda;
- lançar/remover item;
- voltar à lista;
- navegar por Comandas, Cardápio, Painel e Histórico;
- abrir/fechar Ajuda;
- Resumo do Turno;
- Auditoria.

Nenhuma lógica de total, fechamento, cancelamento, sincronização, WhatsApp ou backend foi alterada por este pacote visual.

## Resultado

Validação final do usuário: **“PERFEITO! Funcionou tudo.”**

A v0.18.3 está autorizada para promoção à `main` e publicação oficial.
