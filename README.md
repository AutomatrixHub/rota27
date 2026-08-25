# Rota 27 Bodega — Comandas

Aplicativo mobile-first, offline-first e multidispositivo para controle rápido de comandas da **Rota 27 Bodega**.

## Produção

**Versão: v0.25.4 — Mapa Refinado**  
Branch: `main`  
GitHub Pages: `https://automatrixhub.github.io/rota27/`  
Service Worker: `rota27-comandas-v0.25.4-r1`

## Navegação
- **Comandas = atender**;
- **Cardápio = o que é vendido**;
- **Painel = administrar o negócio**;
- **Histórico = o que aconteceu**.

## Comandas — Lista + Mapa
O Mapa organiza as mesmas comandas abertas em Mesas, Balcão, Parklet, Clientes e Outros locais. Um toque abre a comanda existente e os atalhos `+ Mesa`, `+ Balcão`, `+ Parklet` e `+ Cliente` permanecem disponíveis.

### v0.25.4 — acento lateral refinado
A faixa lateral mantém a linguagem laranja + preto da Lista, mas foi adaptada ao card compacto do Mapa:
- 4 px de largura;
- respiro superior e inferior;
- laranja predominante;
- pequeno acabamento preto na base;
- transição suavizada;
- cantos internos arredondados.

## Painel e módulos preservados
Permanecem Visão Gerencial, Estoque Essencial, Compras & Reposição, Clientes & Fidelização, Inventário & Conferência, Custos & Margem, WhatsApp e sincronização multidispositivo.

## Backend
A v0.25.4 não cria evento, tabela, migration ou Edge Function nova.

## Ajuda
Ajuda **v5.5** identifica a release v0.25.4.

## Atualização da PWA
Não limpar dados nem reinstalar. Abra a PWA online, aguarde 10–20 segundos, feche completamente e abra novamente.

## Documentos
- `docs/RELEASE-v0.25.4.md`
- `docs/HANDOFF-CONTEXTO-v0.25.4.md`
- `docs/VALIDACAO-v0.25.4.md`
- `docs/STATUS-PRODUCAO.md`

Baseline de rollback: **v0.25.3**.

## Versão
Produção: **0.25.4**
