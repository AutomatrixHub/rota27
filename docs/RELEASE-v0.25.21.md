# RELEASE v0.25.21 — Ontem no Histórico + leitura dos fechamentos

Data: 27/08/2026

## Objetivo
Melhorar a leitura operacional do Histórico e dos Fechamentos com base no uso real no celular.

## Histórico — aba Ontem
A barra de períodos passa a ter cinco opções:

- Hoje
- Ontem
- 7 dias
- 30 dias
- Todos

A opção **Ontem** é vinculada ao fechamento efetivo do dia operacional anterior.

### Regra
- procura os fechamentos efetivos armazenados em `rota27_v019_turn_closures_v1`;
- seleciona o fechamento mais recente cuja `businessDate` seja o dia anterior;
- se houver mais de um turno nesse dia, usa o fechamento anterior como corte e mostra somente as comandas pertencentes ao último turno fechado;
- respeita `businessDate`/`operationalDate` quando presentes e usa a abertura da comanda como fallback;
- não altera nenhum dado de produção.

### Exibição
A aba mostra:
- faturamento;
- comandas fechadas;
- ticket médio;
- itens vendidos;
- produtos mais vendidos;
- vendas por categoria;
- comandas do fechamento, com acesso ao detalhe individual.

A busca por cliente, mesa ou produto permanece disponível dentro do recorte de Ontem. Ao sair da aba Ontem, a busca é sincronizada novamente com o filtro base do Histórico para evitar divergência visual.

## Fechamentos — refinamento visual
Os cards da tela **Fechamentos** foram mantidos em duas colunas no mobile, mas ganharam:
- data operacional maior;
- horário mais legível;
- rótulos maiores;
- valores maiores;
- menor área ociosa;
- padding mais eficiente;
- metadados preservados.

## Arquivos
- `assets/v02521-history-ux.js`
- `assets/v02521-history-ux.css`
- `assets/v02521-history-search-bridge.js`
- `assets/v0256-release.js`
- `sw.js`
- `VERSION`
- `README.md`
- `docs/STATUS-PRODUCAO.md`

## Backend
Nenhuma alteração no Supabase ou nas Edge Functions.

Permanecem:
- `rota27-sync` v9 ACTIVE;
- `rota27-whatsapp` v23 ACTIVE;
- `rota27-whatsapp-inbound` v2 ACTIVE;
- `rota27-birthday-campaign` v2 ACTIVE.

Nenhum novo tipo de evento foi criado.

## Segurança e estabilidade
- sem `MutationObserver`;
- sem polling visual frequente;
- sem limpeza de localStorage;
- sem reinstalação da PWA;
- fechamento imutável continua sendo somente leitura para essa funcionalidade;
- reparos históricos da v0.25.16 permanecem preservados.

## Service Worker
`rota27-comandas-v0.25.21-r1`

## Rollback
Baseline anterior: **v0.25.20 — Campanha de aniversários**.
