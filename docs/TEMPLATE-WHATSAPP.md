# Templates WhatsApp — Rota 27 v0.13

Categoria: **Utility / Utilidade**  
Idioma: **Português (Brasil) — `pt_BR`**

A partir da v0.13, a integração usa uma família de templates para manter **um item por linha** sem criar espaços vazios artificiais.

## Templates aprovados

### 1 item

`atualizacao_comanda_rota27_v3_1`

Parâmetros do BODY:

1. nome do cliente;
2. identificação da comanda;
3. item 1;
4. total acumulado.

### 2 itens

`atualizacao_comanda_rota27_v3_2`

Parâmetros do BODY:

1. nome do cliente;
2. identificação da comanda;
3. item 1;
4. item 2;
5. total acumulado.

### 3 itens

`atualizacao_comanda_rota27_v3_3`

Parâmetros do BODY:

1. nome do cliente;
2. identificação da comanda;
3. item 1;
4. item 2;
5. item 3;
6. total acumulado.

### 4 itens

`atualizacao_comanda_rota27_v3_4`

Parâmetros do BODY:

1. nome do cliente;
2. identificação da comanda;
3. item 1;
4. item 2;
5. item 3;
6. item 4;
7. total acumulado.

### 5 itens

`atualizacao_comanda_rota27_v3`

Parâmetros do BODY:

1. nome do cliente;
2. identificação da comanda;
3. item 1;
4. item 2;
5. item 3;
6. item 4;
7. item 5;
8. total acumulado.

## Texto-base

Os templates usam a mesma estrutura visual, variando apenas a quantidade de linhas de itens:

```text
Atualização da sua comanda

🧾 Olá, {{1}}! 👋

📍 Comanda: {{2}}

Para facilitar sua conferência, estes são os itens registrados nesta atualização:
{{3}}
{{4}}
...

💰 Total acumulado até agora: {{N}}

Este total considera todos os lançamentos registrados na sua comanda até este momento. Se houver novos lançamentos, você receberá outra atualização por aqui.

Rota 27 Bodega
```

O cabeçalho textual deve permanecer sem emojis. Os emojis ficam no BODY.

## Formato dos itens

Cada item é enviado como parâmetro de texto independente:

```text
+ 1x IPA Capixaba 500ml - R$ 24,00
```

Correções ou retiradas podem usar sinal negativo:

```text
- 1x IPA Capixaba 500ml - R$ 24,00
```

## Total

O último parâmetro de cada template representa o **total acumulado da comanda** no momento do envio.

Ele não representa somente o subtotal dos itens presentes naquela atualização.

## Lotes com mais de 5 itens

A Edge Function divide automaticamente o agrupamento em blocos de até 5 itens e escolhe o template adequado para cada bloco.

A idempotência é preservada por bloco para evitar duplicações durante retries parciais.

## Importante

Todos os cinco templates devem permanecer aprovados e disponíveis na mesma WABA usada pelo número remetente da Rota 27.
