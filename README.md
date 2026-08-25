# Rota 27 Bodega — Comandas

Aplicativo mobile-first, offline-first e multidispositivo para controle rápido de comandas da **Rota 27 Bodega**.

## Produção

**Versão: v0.25.3 — Consistência Visual do Mapa**  
Branch: `main`  
GitHub Pages: `https://automatrixhub.github.io/rota27/`  
Service Worker: `rota27-comandas-v0.25.3-r1`

## Navegação
- **Comandas = atender**;
- **Cardápio = o que é vendido**;
- **Painel = administrar o negócio**;
- **Histórico = o que aconteceu**.

## Comandas — Lista + Mapa
A tela de Comandas mantém os dois modos da v0.25.2:
- **Lista**;
- **Mapa**.

O Mapa organiza as mesmas comandas abertas em Mesas, Balcão, Parklet, Clientes e Outros locais. Um toque abre a comanda existente e os atalhos `+ Mesa`, `+ Balcão`, `+ Parklet` e `+ Cliente` continuam disponíveis.

### v0.25.3 — identidade visual unificada
Os cards do Mapa passam a usar a mesma lógica visual dos cards da Lista:
- superfície creme;
- mesma moldura e sombra leve;
- faixa lateral de 6 px;
- laranja nos 68% superiores;
- preto nos 32% inferiores;
- mesma identidade visual independentemente da zona.

O Mapa continua compacto; a alteração é exclusivamente visual.

## Painel
Permanecem preservados os quatro acessos principais normalizados na v0.25.2:
1. Visão Gerencial;
2. Estoque Essencial;
3. Compras & Reposição;
4. Clientes & Fidelização.

## Clientes & Fidelização
Permanece preservada toda a funcionalidade da v0.25, incluindo recorrência, preferências, marcos, clientes sumidos, WhatsApp contextual manual e `Preferido chegou recentemente`.

## Estoque, Compras, Inventário e Custos
Permanecem preservados Estoque Essencial, Compras & Reposição, recebimentos, Inventário & Conferência e Custos & Margem.

Regra financeira: **preço de venda nunca substitui custo de aquisição**.

## Sincronização e backend
A v0.25.3 não cria evento, tabela, migration ou Edge Function nova.

Backend preservado:
- `rota27-sync`: versão 7 ACTIVE (`rota27-sync-v0.23.0`);
- `rota27-audit`: versão 1 ACTIVE;
- `rota27-whatsapp`: versão 23 ACTIVE (`rota27-whatsapp-v6-mini2`);
- `rota27-whatsapp-inbound`: versão 1 ACTIVE.

## Estabilidade
A v0.25.3 é uma camada visual final. Não adiciona polling, `MutationObserver`, estado paralelo ou lógica de negócio.

## Ajuda
Ajuda **v5.4** identifica a release v0.25.3.

## Atualização da PWA
Quem já possui o Rota 27 instalado não precisa reinstalar:
1. manter internet ativa;
2. abrir a PWA e aguardar 10–20 segundos;
3. fechar completamente;
4. abrir novamente;
5. confirmar `v0.25.3` e sincronização saudável.

**Não limpar dados do navegador e não remover a PWA para atualizar.**

## Documentos principais
- `docs/RELEASE-v0.25.3.md`
- `docs/STATUS-PRODUCAO.md`
- `docs/HANDOFF-CONTEXTO-v0.25.3.md`
- `docs/VALIDACAO-v0.25.3.md`
- `docs/PRODUCT-PRINCIPLES.md`

Baseline de rollback: **v0.25.2 — Mapa Rápido de Comandas & Painel Padronizado**.

## Versão
Produção: **0.25.3**
