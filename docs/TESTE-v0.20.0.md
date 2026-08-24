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

### Dados históricos da preview
Quando a URL contém `?preview=v0200`, a candidata injeta em memória uma amostra de fechamentos passados para permitir testar gráficos e comparações agora, sem esperar semanas de operação real.

Essa amostra:
- não grava no localStorage;
- não altera seus fechamentos reais;
- não entra no sync;
- não aparece em produção;
- é identificada por um aviso visível dentro da Visão Gerencial.

## Cenário A — acesso pelo Painel
1. abra `Painel`;
2. localize `Visão Gerencial`;
3. toque `Abrir visão gerencial`.

Esperado:
- abre folha gerencial sem alterar a tela operacional;
- informa quantos fechamentos imutáveis existem na base;
- na preview, exibe aviso de histórico simulado para teste.

## Cenário B — períodos
Teste `7 dias`, `30 dias`, `90 dias` e `Todos`.

Esperado:
- métricas mudam conforme os fechamentos pertencentes ao período;
- dias sem fechamento não aparecem como faturamento zero;
- todo o histórico não inventa comparação anterior.

## Cenário C — comparação
Conferir:
- faturamento;
- ticket médio;
- comandas;
- itens vendidos.

Esperado:
- variação positiva/negativa aparece como percentual quando existe base anterior;
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
Para validar dados reais entre aparelhos, ignore a amostra visual da preview e confira primeiro `Histórico → Fechamentos` nos dois aparelhos.

Esperado:
- fechamentos reais continuam convergindo pela v0.19.0;
- a v0.20.0 não cria nova tabela/migration nem novo evento de sync.

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
