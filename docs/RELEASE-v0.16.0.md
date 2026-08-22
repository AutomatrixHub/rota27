# Rota 27 — Release v0.16.0

Data de preparação: 21/08/2026

## Objetivo da release

A v0.16.0 preserva a baseline operacional validada da v0.15.1 e adiciona uma Ajuda completa dentro do aplicativo para reduzir dependência de treinamento e facilitar uso por atendentes e responsáveis que não participaram do desenvolvimento.

## O que mudou

### Ajuda integrada

- botão `? Ajuda` no cabeçalho;
- painel responsivo sem criar nova aba na navegação principal;
- busca por intenção com placeholder **O que você quer fazer?**;
- atalhos rápidos para começar, abrir comanda, lançar, conferir/corrigir, fechar e resolver problema;
- seção **Primeiros 3 minutos**;
- mapa rápido do aplicativo;
- exemplos reais de atendimento;
- mini-representações visuais da interface feitas com HTML/CSS;
- comparação entre **Ver itens**, **Editar itens** e **Fechar**;
- comparação entre **Fechar** e **Cancelar**;
- explicações de Painel, Histórico, Cardápio, sincronização, offline, WhatsApp, backup e atualização;
- seção **Se acontecer isso…** com respostas rápidas;
- glossário e boas práticas;
- botões **Abrir todos / Fechar todos**;
- Ajuda disponível offline pelo Service Worker.

### Refinamento da seção “Se acontecer isso…”

A revisão final corrige a quebra de texto observada em teste visual. O problema era causado pelo estilo do `summary` da seção principal atingindo também os `summary` internos dos cenários.

A v0.16.0 passa a usar cartões de cenário em largura normal, com:

- título legível sem quebra palavra por palavra;
- ícone por tipo de situação;
- etiqueta curta de contexto;
- resposta organizada como **O que fazer**;
- destaque especial para situação de total incorreto;
- aviso final sobre quando interromper antes de concluir a venda.

## O que NÃO mudou

- lógica de abertura de comanda;
- lançamento de itens;
- cálculo de total;
- fechamento;
- cancelamento;
- `localStorage`;
- protocolo de sincronização;
- `rota27-sync`;
- `rota27-whatsapp`;
- fila local do WhatsApp;
- secrets/tokens;
- arquitetura Supabase já validada.

## Versão e cache

- versão pública: **v0.16.0**;
- `VERSION`: `0.16.0`;
- Service Worker: `rota27-comandas-v0.16.0`;
- novos assets:
  - `assets/v0151-help.css`;
  - `assets/v0151-help.js`;
  - `assets/v016-help-polish.css`;
  - `assets/v016-help-polish.js`;
  - `assets/v016-final.js`.

## Atualização de aparelhos

Não reinstalar a PWA e não limpar dados.

Procedimento:

1. conectar o aparelho à internet;
2. abrir a PWA e aguardar alguns segundos;
3. fechar completamente;
4. abrir novamente;
5. confirmar o selo `v0.16.0`;
6. confirmar sincronização saudável antes do início do turno.

## Gate para piloto real

A v0.16.0 está preparada para o piloto real de 22/08/2026. Durante o turno, a baseline volta a ficar congelada.

P0/P1 podem justificar hotfix. P2/P3 devem ser registrados para depois do turno.
