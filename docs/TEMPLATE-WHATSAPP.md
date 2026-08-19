# Template WhatsApp recomendado

Crie no WhatsApp Manager um template do tipo **Utility / Utilidade**.

## Nome sugerido

`atualizacao_comanda_rota27`

## Idioma

Português (Brasil) — `pt_BR`

## Corpo sugerido

Olá {{1}}! Sua comanda {{2}} foi atualizada:

{{3}}

**Total atual: {{4}}**

Rota 27 Bodega

## Variáveis enviadas pela Edge Function

1. Nome do cliente
2. Identificação da comanda (mesa/local + cliente)
3. Itens agrupados no intervalo de aproximadamente 8 segundos
4. Total atual da comanda

Exemplo da variável 3:

+ 2× IPA Capixaba — R$ 48,00
+ 1× Torresmo Crocante — R$ 29,00

O template precisa estar aprovado e habilitado antes dos testes reais.
