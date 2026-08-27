# RELEASE v0.25.19 — Cards compactos de comandas

Data: 26/08/2026

## Objetivo
Melhorar a densidade visual da tela **Comandas** no celular, reduzindo a altura dos cards em Lista e evitando cards excessivamente estreitos no Mapa.

## Alterações

### Visualização Lista
- cards mais baixos, com redução de padding e espaçamento vertical;
- nome do cliente continua prioritário;
- local, itens/tempo, valor e último lançamento permanecem visíveis;
- botão **Abrir** compactado;
- menor distância entre cards.

### Visualização Mapa
- até 520 CSS px: **2 cards por linha**;
- abaixo de 310 CSS px: fallback para 1 coluna;
- cards mais compactos em padding e tipografia secundária;
- melhor aproveitamento horizontal sem quebrar excessivamente nomes, valores e metadados.

## Arquivos principais
- `assets/v02519-command-cards.css`;
- `assets/v0256-release.js`;
- `sw.js`;
- `VERSION`;
- `README.md`;
- `docs/STATUS-PRODUCAO.md`.

## Backend
Nenhuma alteração. Sem migration, sem novo tipo de evento e sem mudança de Edge Function.

## Preservado
- v0.25.18: nascimento na abertura da comanda;
- v0.25.17: nascimento no cadastro/Relacionamento/CSV;
- v0.25.16: reparo histórico de fechamento;
- data operacional pela abertura da comanda;
- múltiplos turnos no mesmo dia;
- A receber / Paga depois;
- sincronização offline-first/multidispositivo;
- estoque, compras, inventário, custos, relacionamento e rankings.

## Atualização PWA
Service Worker: `rota27-comandas-v0.25.19-r1`.

Não limpar dados e não reinstalar a PWA. Abrir online, aguardar 20–30 segundos, fechar completamente e abrir novamente.

## Rollback
Baseline de rollback de código: **v0.25.18**.
