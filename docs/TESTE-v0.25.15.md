# Teste — v0.25.15

## Gates obrigatórios

1. **Atravessa meia-noite**
   - abrir comanda em 26/08;
   - fechar em 27/08 às 01h/02h;
   - esperado: `businessDate = 26/08`, mantendo `closedAt` real de 27/08.

2. **Comanda aberta bloqueia turno de origem**
   - deixar uma comanda de 26/08 aberta após 00:00;
   - esperado: fechamento aponta o turno operacional 26/08 e bloqueia enquanto ela estiver aberta.

3. **Dois turnos no mesmo dia**
   - fechar um turno;
   - abrir nova comanda depois desse fechamento ainda na mesma data;
   - esperado: a nova comanda entra somente no turno seguinte.

4. **Histórico antigo**
   - manter histórico de datas antigas sem comandos abertos;
   - esperado: ele não assume o turno corrente.

5. **A receber**
   - fechar como A receber após meia-noite uma comanda aberta no dia anterior;
   - esperado: pendência e histórico recebem a data da abertura; horário real de fechamento não é reescrito.

6. **Cliente rápido**
   - seletor pesquisável da v0.25.13 permanece funcional na nova comanda.

7. **Estabilidade**
   - sem novo `setInterval` ou `MutationObserver` nos módulos da release;
   - sintaxe JS validada com `node --check`.
