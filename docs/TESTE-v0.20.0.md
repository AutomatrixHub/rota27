# Rota 27 v0.20.0 — validação final

## Estado

**VALIDADA — autorizada para produção em 24/08/2026.**

A candidata foi testada e aprovada, incluindo a Visão Gerencial, períodos, comparações, gráfico, rankings, exportação e regressão da operação anterior.

## Preview utilizada na validação

```powershell
cd "C:\Users\marco\OneDrive\Documentos\Rota27\mvp\Rota27-comandas-git"
git fetch origin
git switch feature/v0.20.0-manager-dashboard
git pull --ff-only
Get-Content .\VERSION
powershell -ExecutionPolicy Bypass -File ".\scripts\testar-v0200.ps1"
```

Esperado/validado:
- `VERSION` = `0.20.0`;
- preview PC em `http://localhost:3023/?preview=v0200`;
- endereço `CELULAR:` exibido no PowerShell;
- badge e título em v0.20.0 sem alternância;
- sem travamento ou uso anormal de CPU.

## Histórico simulado da preview

Quando a URL contém `?preview=v0200`, a candidata injeta em memória uma amostra de fechamentos passados para permitir testar gráficos e comparações sem esperar semanas de operação real.

Essa amostra:
- não grava em `localStorage`;
- não altera fechamentos reais;
- não entra no sync;
- é identificada por aviso visível.

## Modo demonstração de produção

Após a aprovação da Visão Gerencial, foi consolidado um recurso seguro equivalente para produção: **Modo demonstração**.

Regras:
- começa desligado;
- ativação manual dentro da Visão Gerencial;
- dados simulados somente em memória;
- não grava `localStorage`;
- não sincroniza;
- não altera comandas, histórico ou fechamentos reais;
- não interfere em WhatsApp;
- exportação CSV é bloqueada enquanto o modo está ativo;
- recarregar o app retorna automaticamente aos dados reais;
- a tela exibe identificação explícita de demonstração.

A implementação do Modo demonstração é isolada da fonte persistente e, por padrão, não muda nenhuma leitura real da aplicação.

## Cenários validados

### A — acesso pelo Painel
- `Painel → Visão Gerencial` abre a folha gerencial;
- a tela operacional permanece preservada.

### B — períodos
- `7 dias`, `30 dias`, `90 dias` e `Todos`;
- métricas variam conforme os fechamentos do período;
- dias sem fechamento não viram zero artificialmente.

### C — comparação
- faturamento;
- ticket médio;
- comandas;
- itens vendidos;
- percentual só aparece quando existe base anterior suficiente.

### D — gráfico e rankings
- gráfico por turno fechado;
- melhor dia coerente;
- mais vendidos e formas de pagamento derivados dos snapshots.

### E — exportação
- CSV com uma linha por fechamento real;
- data, faturamento, comandas, canceladas, ticket, itens e formas de pagamento.

### F — multidispositivo
- fechamentos reais continuam convergindo pela infraestrutura da v0.19.0;
- a v0.20.0 não cria tabela, migration, Edge Function ou novo contrato de sync.

### G — Ajuda
- Tema Capixaba preservado;
- seção `Visão Gerencial`;
- nota sobre `Modo demonstração`;
- rodapé `Ajuda v4.4 • v0.20.0`;
- cabeçalho mobile preservado.

## Regressão

- abrir/lançar/editar/fechar comanda;
- Fechamento do Turno;
- Histórico;
- Auditoria;
- WhatsApp cliente/gerente;
- sincronização.

Resultado final da candidata principal: **APROVADA PARA PRODUÇÃO**.
