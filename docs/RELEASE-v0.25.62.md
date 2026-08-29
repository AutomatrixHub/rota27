# Rota 27 — Release v0.25.62

## Alertas de custo/margem

Esta release encerra o item 10 do roadmap original com alertas financeiros orientados a exceção, sem exigir configuração adicional e sem inventar custos ausentes.

## Regras

- **Margem bruta negativa:** gera alerta sempre que houver custo real conhecido e a margem estimada ficar abaixo de zero.
- **Aumento relevante de custo:** gera alerta quando o último custo efetivo de aquisição subir **10% ou mais** em relação ao custo efetivo anterior e o registro mais recente tiver ocorrido nos últimos 30 dias.
- Produtos sem custo real conhecido continuam fora das estimativas de margem.
- Não há alerta por pequenas oscilações abaixo de 10%.

## Interface

### Custos & Margem
Quando existem exceções, a Central mostra um bloco compacto acima das abas com:
- produto;
- tipo de exceção;
- margem negativa ou percentual de aumento do custo;
- preço de venda e custo efetivo quando aplicável;
- cobertura de custos dos produtos controlados.

Quando não há exceções, o bloco fica oculto e não ocupa espaço.

### Painel
O bloco **Hoje precisa de atenção** recebe apenas uma linha consolidada de Custos & Margem, independentemente da quantidade de produtos em alerta. O toque abre a Central de Custos & Margem.

## Estabilidade

- refresh orientado aos eventos já existentes de compras, estoque, inventário e domínio;
- nenhum polling contínuo novo;
- nenhum `MutationObserver` novo;
- o refresh do Painel ocorre depois do renderer autoritativo já existente, evitando concorrência visual.

## Backend e dados

A v0.25.62 não cria nem altera:
- Edge Functions;
- migrations;
- schema do Supabase;
- tipos de evento de sincronização;
- dados de produção.

Os cálculos reutilizam `Rota27V024.getStats()` e `Rota27V024.getCostRecords()`.

## Roadmap

Com esta release, os itens 0–10 do planejamento original ficam concluídos.

## Cache

Service Worker: `rota27-comandas-v0.25.62-r1`.
