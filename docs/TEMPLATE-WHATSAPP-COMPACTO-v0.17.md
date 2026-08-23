# WhatsApp compacto — proposta v0.17

Motivação: no teste real, o cliente considerou as mensagens atuais longas. A família de templates v3 aprovada hoje possui dois parágrafos explicativos extensos, portanto a redução relevante do tamanho exige uma nova família de templates aprovada pela Meta.

## Objetivo

Manter a mesma função operacional — identificação, alterações e total atual — com leitura rápida no celular.

## Texto-base sugerido

```text
Atualização da comanda

Olá, {{1}}!
📍 {{2}}

{{3}}
{{4}}
...

💰 Total: {{N}}

Rota 27 Bodega
```

A quantidade de linhas de itens varia de 1 a 5, como na família atual.

## Formato dos itens

Adição:

```text
+ 1x Red Ale Artesanal 500ml - R$ 23,00
```

Remoção/correção negativa:

```text
- 1x REMOVIDO: Biscoito de Polvilho 120g - R$ 12,00
```

O termo `REMOVIDO` é proposital para não depender apenas do sinal `-`, que pode passar despercebido em leitura rápida.

## Identificação compacta

Para o cliente, quando houver mesa/local, a identificação deve evitar repetir o nome já usado na saudação:

```text
Parklet 6
```

Para a gerência:

```text
Parklet 6 • André Curintiano
```

## Família sugerida para aprovação na Meta

- `atualizacao_comanda_rota27_curta_1`
- `atualizacao_comanda_rota27_curta_2`
- `atualizacao_comanda_rota27_curta_3`
- `atualizacao_comanda_rota27_curta_4`
- `atualizacao_comanda_rota27_curta_5`

Categoria: Utility / Utilidade.
Idioma: `pt_BR`.

## Regra de implantação

Enquanto essa nova família não estiver aprovada na WABA, a v0.17 continua usando os templates v3 já aprovados. O hardening da v0.17 já reduz a identificação dinâmica, explicita remoções e protege contra duplicação concorrente do envio ao gerente.

A troca para a família compacta deve ocorrer somente depois de confirmar que os cinco templates estão aprovados e disponíveis no mesmo número remetente.
