# Rota 27 v0.25.11 — Produtos mais vendidos por nome atual

## Estado
Produção.

## Correção
O quadro **Histórico & resultados → Produtos mais vendidos** passa a consolidar vendas pelo **ID/código do produto**, exibir o **nome atual do cadastro** e preservar a receita calculada com o preço histórico registrado em cada comanda.

Isso elimina divergências após correções de cadastro, como:
- `Cerveja IPA 500ml - Rochi Beer`
- passando a aparecer automaticamente como `Cerveja IPA 500ml - Ronchi Beer`.

## Regras
- chave de consolidação: ID do produto;
- nome exibido: cadastro atual, quando o produto ainda existe;
- fallback: nome histórico da comanda, se o produto não existir mais;
- quantidade: histórico real;
- receita: preço histórico de cada venda;
- não reescreve comandas fechadas;
- não altera Supabase, Edge Functions, migrations ou sincronização.

## Release
- `VERSION = 0.25.11`
- Service Worker: `rota27-comandas-v0.25.11-r1`
- Ajuda: v6.2
- rollback de código: v0.25.10
