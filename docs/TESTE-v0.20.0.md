# Rota 27 v0.20.0 — teste da candidata

## Estado

**CANDIDATA — produção permanece na v0.19.0 até aprovação.**

## Abrir a preview

```powershell
cd "C:\Users\marco\OneDrive\Documentos\Rota27\mvp\Rota27-comandas-git"
git fetch origin
git switch feature/v0.20.0-manager-dashboard
git pull --ff-only
Get-Content .\VERSION
powershell -ExecutionPolicy Bypass -File ".\scripts\testar-v0200.ps1"
```

Esperado:
- `VERSION` = `0.20.0`;
- preview PC em `http://localhost:3023/?preview=v0200`;
- endereço `CELULAR:` exibido no PowerShell;
- badge e título mostram v0.20.0 sem alternância;
- sem travamento ou uso anormal de CPU.

## Cenário A — acesso pelo Painel
1. abra `Painel`;
2. localize `Visão Gerencial`;
3. toque `Abrir visão gerencial`.

Esperado:
- abre folha gerencial sem alterar a tela operacional;
- informa quantos fechamentos imutáveis existem na base.

## Cenário B — períodos
Teste `7 dias`, `30 dias`, `90 dias` e `Todos`.

Esperado:
- métricas mudam conforme os fechamentos pertencentes ao período;
- dias sem fechamento não aparecem como faturamento zero;
- todo o histórico não inventa comparação anterior.

## Cenário C — comparação
Quando houver base no período anterior, conferir:
- faturamento;
- ticket médio;
- comandas;
- itens vendidos.

Esperado:
- variação positiva/negativa aparece como percentual;
- sem base anterior, aparece mensagem de insuficiência em vez de percentual falso.

## Cenário D — gráfico e rankings
Esperado:
- gráfico mostra somente turnos efetivamente fechados;
- melhor dia é coerente com os fechamentos;
- mais vendidos e formas de pagamento refletem os snapshots do período.

## Cenário E — exportação
1. selecione um período com fechamento;
2. toque `Exportar CSV`.

Esperado:
- gera arquivo CSV com uma linha por fechamento;
- inclui data, faturamento, comandas, canceladas, ticket, itens e formas de pagamento.

## Cenário F — multidispositivo
Com dois aparelhos sincronizados:
1. confirme que os fechamentos já aparecem em ambos;
2. abra Visão Gerencial nos dois.

Esperado:
- indicadores convergem após a sincronização dos fechamentos da v0.19.0;
- nenhuma nova tabela/migration é necessária.

## Cenário G — Ajuda
Esperado:
- Tema Capixaba preservado;
- nova seção `Visão Gerencial`;
- rodapé `Ajuda v4.4 • v0.20.0`;
- cabeçalho mobile continua sem sobreposição.

## Regressão mínima
- abrir/lançar/editar/fechar comanda;
- Fechamento do Turno continua funcionando;
- Histórico e Auditoria continuam funcionando;
- WhatsApp cliente/gerente permanece inalterado;
- sync continua convergente.

Não limpar localStorage e não reinstalar a PWA para testar.
