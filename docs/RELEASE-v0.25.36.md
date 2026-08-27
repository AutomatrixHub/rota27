# Rota 27 v0.25.36 — A receber padronizado no Painel

Data: 27/08/2026

## Objetivo
Padronizar visualmente o bloco **A receber** no Painel, alinhando-o aos cards de **Visão Gerencial** e **Clientes & Fidelização**.

## Alterações
- `A receber` passa a ficar dentro de um card completo;
- mantém resumo de pendências e valor a receber;
- mantém o botão `Ver N pendências` dentro do próprio card;
- adiciona ícone discreto no mesmo padrão dos cards de gestão;
- usa borda suave, fundo claro, cantos arredondados e sombra leve;
- layout mobile mantém botão em largura total dentro do card.

## Compatibilidade
Nenhuma regra funcional foi alterada. Permanecem intactos:
- cálculo de pendências;
- valores a receber;
- baixa de recebimentos;
- sincronização;
- histórico;
- comandas;
- Supabase e Edge Functions.

## Arquivos
- `assets/v02536-receivables-card.css`;
- `assets/v0256-release.js`;
- `VERSION`;
- `sw.js`.

## PWA
Service Worker: `rota27-comandas-v0.25.36-r1`.

## Rollback
Baseline de rollback: **v0.25.35** / HEAD `66a0f69e9841b431f3895a03fac7f184226dca7e`.
