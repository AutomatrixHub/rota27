# Rota 27 — Release v0.25.24

## Acabamento visual do Histórico & resultados

Data: 27/08/2026

Release exclusivamente visual da tela principal **Histórico & resultados**, aplicando o mesmo padrão de hierarquia e densidade validado na tela **Fechamentos**.

### Refinamentos
- cabeçalho com título dominante, subtítulo e contador mais discretos;
- períodos **Hoje / Ontem / 7 dias / 30 dias / Todos** e campo de busca mais compactos;
- bloco da aba **Ontem** com marcador visual discreto de **Último fechamento**;
- cards de métricas mais densos, valores maiores e rótulos/hints mais suaves;
- rótulo visual **Comandas fechadas** para alinhar a linguagem com a tela Fechamentos;
- botões **Exportar vendas CSV** e **Backup / Restaurar** preservam área confortável de toque com menor peso visual;
- painéis **Produtos mais vendidos** e **Vendas por categoria** mais compactos;
- rankings com tipografia e barras refinadas para leitura rápida;
- lista de comandas fechadas mais densa, mantendo valor e acesso a detalhes legíveis.

### Escopo técnico
- novo asset: `assets/v02524-history-finish.css`;
- `VERSION`: `0.25.24`;
- Service Worker: `rota27-comandas-v0.25.24-r1`;
- sem novo JavaScript de domínio;
- sem `MutationObserver`;
- sem polling visual frequente.

### Backend
Nenhuma alteração em:
- Supabase;
- Edge Functions;
- `rota27_sync_events`;
- regras de fechamento;
- cálculo de períodos;
- A receber;
- sincronização multidispositivo.

### Preservado
- aba **Ontem** baseada no fechamento operacional;
- **Hoje / 7 dias / 30 dias / Todos**;
- busca por cliente, mesa e produto;
- rankings por ID/código usando nome atual;
- exportação CSV e backup/restauração;
- lista e detalhes de comandas fechadas.

## Rollback
Baseline anterior: **v0.25.23**, HEAD `167d7d3029a9fa58dcac2cfed1446e18547eb012`.
