# RELEASE v0.25.25 — Acabamento visual do Painel

Data: 27/08/2026

## Objetivo
Aplicar à aba **Painel** o mesmo padrão de refinamento visual já validado em **Fechamentos** e **Histórico & resultados**, sem alterar regras operacionais, sincronização ou backend.

## Refinamentos
- cabeçalho do Painel mais compacto e hierárquico;
- bloco **A receber** com menor altura e botão preservando boa área de toque;
- seções **Agora**, **Hoje** e **Operação** mais densas;
- valores dos indicadores com maior destaque e rótulos mais suaves;
- rótulo **Comandas** apresentado visualmente como **Comandas fechadas** no bloco Hoje;
- cartões de Internet, Sincronização, WhatsApp e Conflitos mais compactos e legíveis;
- **Acessos rápidos** com menor peso visual, sem reduzir a usabilidade;
- cards **Visão Gerencial**, **Estoque Essencial**, **Compras & Reposição** e **Clientes & Fidelização** compactados e normalizados;
- espaçamentos verticais e sombras suavizados para exibir mais informação por tela.

## Implementação
- novo asset: `assets/v02525-panel-finish.css`;
- nenhuma nova lógica JavaScript de domínio;
- nenhuma mudança nos cálculos do Painel;
- nenhum `MutationObserver` novo;
- nenhum polling visual adicional.

## Backend
Sem alterações em:
- Supabase;
- Edge Functions;
- `rota27_sync_events`;
- tipos de evento;
- fechamento de turno;
- A receber;
- sincronização multidispositivo.

## PWA
- VERSION: `0.25.25`;
- Service Worker: `rota27-comandas-v0.25.25-r1`.

## Rollback
Baseline de rollback: **v0.25.24**, HEAD `b163235f2ab3e6900fa805ca571581df90313307`.
