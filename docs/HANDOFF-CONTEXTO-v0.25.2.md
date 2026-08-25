# Handoff — Rota 27 v0.25.2

## Baseline oficial
Versão: **v0.25.2 — Mapa Rápido de Comandas & Painel Padronizado**  
Branch de produção após promoção: `main`  
Service Worker: `rota27-comandas-v0.25.2-r7`  
Rollback: **v0.25.1 — Navegação & Configurações**.

## Comandas
A tela possui dois modos:
- Lista;
- Mapa.

O Mapa organiza as comandas abertas em Mesas, Balcão, Parklet, Clientes e Outros locais. Usa os mesmos `state.commands` da Lista e não cria estado paralelo.

Preferência local: `rota27_command_view_v0252` (`list` ou `map`).

## Painel
Sequência principal:
1. Visão Gerencial;
2. Estoque Essencial;
3. Compras & Reposição;
4. Clientes & Fidelização.

Os quatro cards compartilham padrão visual comum na R7. O badge `v0.22.0` de Compras é ocultado pela camada final.

### Estabilidade crítica
O Painel legado reescreve `screenPanel` via `innerHTML`. Não adicionar polling visual frequente nem `MutationObserver` concorrente.

`assets/v0252-panel-polish.js` instala uma ponte específica no setter `innerHTML` apenas para restaurar o quarto card após renders legados.

Os ícones são pseudo-elementos CSS; não reinjetar ícones via JavaScript.

## Arquivos principais da v0.25.2
- `assets/v0252-command-map.js`;
- `assets/v0252-command-map.css`;
- `assets/v0252-panel-polish.js`;
- `assets/v0252-panel-polish.css`;
- `docs/ESPEC-v0.25.2.md`;
- `docs/TESTE-v0.25.2.md`;
- `docs/RELEASE-v0.25.2.md`.

## Backend
Sem alteração.

Supabase permanece com:
- `rota27-sync` versão 7 ACTIVE (`rota27-sync-v0.23.0`);
- migration `20260825012842_expand_rota27_sync_event_types_v023` aplicada;
- nenhuma tabela, migration, evento ou Edge Function nova na v0.25.2.

## Módulos preservados
- Comandas;
- Clientes & Fidelização;
- WhatsApp;
- Fechamento do Turno;
- Auditoria;
- Visão Gerencial;
- Estoque Essencial;
- Compras & Reposição;
- Inventário & Conferência;
- Custos & Margem.

## Ajuda
Ajuda v5.3 inclui Mapa Rápido de Comandas.

## Próximos passos
Priorizar uso real, refinamentos operacionais e Fidelização R2 somente quando houver evidência clara de valor. Evitar criar módulo grande por inércia.
