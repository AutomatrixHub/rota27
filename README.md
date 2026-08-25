# Rota 27 Bodega — Comandas

Aplicativo mobile-first, offline-first e multidispositivo para controle rápido de comandas da **Rota 27 Bodega**.

## Produção

**Versão: v0.25.2 — Mapa Rápido de Comandas & Painel Padronizado**  
Branch: `main`  
GitHub Pages: `https://automatrixhub.github.io/rota27/`  
Service Worker: `rota27-comandas-v0.25.2-r7`

## Navegação
- **Comandas = atender**;
- **Cardápio = o que é vendido**;
- **Painel = administrar o negócio**;
- **Histórico = o que aconteceu**.

## Comandas — Lista + Mapa
A v0.25.2 acrescenta um segundo modo de visualização sem substituir a Lista.

### Mapa Rápido
Organiza as mesmas comandas abertas em:
- Mesas;
- Balcão;
- Parklet;
- Clientes;
- Outros locais.

Cada card compacto exibe identificação, valor, cliente/local, itens e tempos. Um toque abre a comanda existente.

Atalhos rápidos:
- `+ Mesa`;
- `+ Balcão`;
- `+ Parklet`;
- `+ Cliente`.

A preferência Lista/Mapa é local ao aparelho.

## Painel
Os quatro acessos principais seguem o mesmo padrão visual:
1. Visão Gerencial;
2. Estoque Essencial;
3. Compras & Reposição;
4. Clientes & Fidelização.

R7 normaliza moldura, altura-base, padding, tipografia, ícones e ações. O badge visual legado `v0.22.0` de Compras não aparece mais.

Os ícones são lineares e monocromáticos via CSS, evitando desaparecimento nos renders legados.

## Clientes & Fidelização
A funcionalidade da v0.25 permanece preservada:
- Visão geral / Clientes / Para lembrar;
- visitas, ticket, preferências e ritmo;
- níveis Novo / Recorrente / Frequente / Cliente da casa;
- Sumido;
- marcos de 5/10 visitas;
- WhatsApp contextual manual;
- `Preferido chegou recentemente`.

## Estoque, Compras, Inventário e Custos
Permanecem preservados:
- Estoque Essencial;
- Compras & Reposição;
- recebimento parcial/total;
- Inventário & Conferência;
- Custos & Margem;
- históricos e CSVs.

Regra financeira: **preço de venda nunca substitui custo de aquisição**.

## Sincronização e backend
A v0.25.2 não cria evento, tabela, migration ou Edge Function nova.

Backend preservado:
- `rota27-sync`: versão 7 ACTIVE (`rota27-sync-v0.23.0`);
- `rota27-audit`: versão 1 ACTIVE;
- `rota27-whatsapp`: versão 23 ACTIVE (`rota27-whatsapp-v6-mini2`);
- `rota27-whatsapp-inbound`: versão 1 ACTIVE.

## Estabilidade
Preservar:
- sem polling visual frequente novo;
- sem `MutationObserver` concorrente no Painel.

A v0.25.2 usa uma ponte específica do `innerHTML` de `screenPanel` apenas para restaurar o quarto card após renders legados. Os ícones são CSS e não dependem de reinjeção de DOM.

## Ajuda
Ajuda **v5.3** inclui o Mapa Rápido de Comandas.

## Atualização da PWA
Quem já possui o Rota 27 instalado não precisa reinstalar:
1. manter internet ativa;
2. abrir a PWA e aguardar 10–20 segundos;
3. fechar completamente;
4. abrir novamente;
5. confirmar `v0.25.2` e sincronização saudável.

**Não limpar dados do navegador e não remover a PWA para atualizar.**

## Documentos principais
- `docs/RELEASE-v0.25.2.md`
- `docs/STATUS-PRODUCAO.md`
- `docs/HANDOFF-CONTEXTO-v0.25.2.md`
- `docs/VALIDACAO-v0.25.2.md`
- `docs/TESTE-v0.25.2.md`
- `docs/ESPEC-v0.25.2.md`
- `docs/PRODUCT-PRINCIPLES.md`

Baseline de rollback: **v0.25.1 — Navegação & Configurações**.

## Versão
Produção: **0.25.2**
