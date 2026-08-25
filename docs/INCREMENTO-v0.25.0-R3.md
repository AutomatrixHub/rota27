# Rota 27 v0.25.0 — Incremento R3

## Tema
**Relacionamento oportuno: preferido chegou recentemente**

## Estado
CANDIDATA. Não publicada em produção.

PR principal: **#31 — Rota 27 v0.25.0 — Clientes & Fidelização**.

## Motivação
A v0.25 já identifica frequência, ausência, preferências e marcos de relacionamento. O R3 acrescenta um sinal comercial de maior valor para um negócio pequeno: aproveitar um recebimento real para lembrar, de forma pessoal, clientes que costumam comprar aquele produto.

A regra continua sendo: **o sistema sugere contexto; o proprietário decide se fala com o cliente**.

Não existe campanha automática.

## Fonte dos dados
O R3 reaproveita exclusivamente estruturas já existentes:

- `window.Rota27V025.dataset()` — perfil e preferência calculados;
- `window.Rota27V022.getReceipts()` — recebimentos de compras;
- `window.Rota27V021.getConfigs()` — produtos com estoque controlado;
- `window.Rota27V021.availableQty(productId)` — disponibilidade atual.

Não há persistência nova.

## Regra da oportunidade
Um cliente aparece em **Preferido chegou recentemente** somente quando TODOS os critérios abaixo são verdadeiros:

1. possui pelo menos 2 visitas identificadas;
2. possui WhatsApp cadastrado;
3. o produto é o primeiro produto preferido calculado para o cliente;
4. existe recebimento positivo desse produto nos últimos 7 dias;
5. o produto está com Estoque Essencial ativado;
6. a disponibilidade atual é maior que zero;
7. a última visita do cliente ocorreu antes do recebimento.

A combinação reduz falsos positivos.

### Consequências
- se o produto não tiver estoque controlado, o Rota 27 não afirma disponibilidade;
- se o estoque chegar a zero, a oportunidade desaparece;
- se o cliente voltar depois do recebimento, a oportunidade desaparece;
- recebimentos com mais de 7 dias deixam de gerar a oportunidade;
- cliente com uma única visita não entra nesse sinal;
- cliente sem WhatsApp pode continuar aparecendo na conveniência `Cadastro a completar`, mas não recebe ação de mensagem desse R3.

## Interface
Quando existem oportunidades, a Central pode mostrar o bloco:

**NOVIDADE ÚTIL — Preferido chegou recentemente**

Cada linha informa:
- cliente;
- produto;
- há quanto tempo houve o recebimento;
- número de visitas;
- estoque disponível atual;
- `Ver perfil`;
- `WhatsApp`.

No perfil do cliente, quando aplicável, aparece também:

**NOVIDADE RELEVANTE — [Produto] chegou recentemente**

## WhatsApp
O botão monta uma mensagem contextual específica para o produto, por exemplo:

> Oi, Ana! Tudo bem? Recebemos Cerveja IPA novamente na Rota 27 e lembrei de você, porque costuma escolher esse produto...

Regras:
- abre `wa.me` somente após toque do usuário;
- nunca envia automaticamente;
- usuário pode editar ou fechar sem enviar;
- não inclui desconto, promoção, brinde ou reserva automática;
- em modo demonstração, nenhum número real é aberto: a mensagem aparece somente em uma caixa de teste.

## Modo demonstração
Em `?preview=v0250`, o R3 gera oportunidades fictícias somente em memória a partir dos perfis demonstrativos.

Não consulta nem altera a base real para montar as oportunidades demonstrativas.

## Estabilidade
O R3 não adiciona:
- `setInterval`;
- `MutationObserver`;
- polling visual;
- evento de sincronização;
- migration;
- Edge Function.

A atualização ocorre por eventos já existentes e por renderização após interação do usuário:
- `rota27:v022-purchases-updated`;
- `rota27:v021-stock-updated`;
- `rota27:v017-domain-updated`;
- `storage`;
- retorno da aba ao estado visível.

## Teste local — dados reais
### Cenário R3-A — oportunidade válida
Pré-condições:
1. cliente com 2+ visitas e WhatsApp;
2. produto preferido desse cliente identificado no histórico;
3. produto com Estoque Essencial ativo;
4. cliente ainda não visitou depois do recebimento.

Procedimento:
1. crie/receba um pedido desse produto;
2. confirme que o estoque ficou positivo;
3. abra `Clientes → Relacionamento & Fidelização`;
4. observe Visão geral e Para lembrar.

Esperado:
- bloco `Preferido chegou recentemente` aparece;
- cliente e produto corretos;
- disponibilidade coerente com Estoque Essencial;
- perfil mostra `NOVIDADE RELEVANTE`;
- WhatsApp abre somente por ação manual.

### Cenário R3-B — estoque zerou
Depois do R3-A, zere o estoque por venda/perda/ajuste.

Esperado:
- oportunidade deixa de aparecer.

### Cenário R3-C — cliente voltou
Após o recebimento, feche uma nova comanda associada ao cliente.

Esperado:
- oportunidade deixa de aparecer para esse recebimento.

### Cenário R3-D — produto sem controle
Desative o Estoque Essencial para o produto.

Esperado:
- Rota 27 não usa o recebimento para afirmar disponibilidade e não mostra a oportunidade R3.

## Teste demonstrativo
Abra:

`http://localhost:8000/?preview=v0250`

Depois:
`Clientes → Relacionamento & Fidelização`.

Esperado:
- aparecem oportunidades fictícias de `Preferido chegou recentemente`;
- `Ver perfil` abre perfil fictício;
- o perfil mostra a novidade relevante;
- `WhatsApp` mostra apenas a mensagem em modo demonstração;
- nada é salvo ou sincronizado.

## Backend
Nenhuma alteração necessária.

A v0.25 continua usando somente dados sincronizados pelas versões anteriores. O R3 é uma leitura derivada da base local convergente.
