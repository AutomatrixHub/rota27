# Rota 27 — Hotfix v0.25.80-r4

Data: 31/08/2026

## Título
**Paridade real do estado vazio Lista / Mapa**

## Problema observado em produção
Na revisão v0.25.80-r3, o modo Lista recebeu apenas uma apresentação visual sobre o elemento legado `#commandsEmpty`. O conteúdo interno anterior permaneceu no DOM e continuou sujeito a regras legadas de altura e decoração, causando:
- quadro da Lista mais alto que o quadro do Mapa;
- elemento circular laranja residual no centro;
- espaçamentos diferentes entre Lista e Mapa.

## Correção de causa raiz
O modo Lista passa a reutilizar a mesma estrutura do estado vazio canônico do Mapa:

```html
<strong>Nenhuma comanda aberta</strong>
<span>Use um dos atalhos acima para abrir a primeira.</span>
```

O `#commandsEmpty` recebe a mesma classe `.v0252-map-empty` usada pelo Mapa e uma classe operacional específica `v02580r4-list-empty`.

A folha `assets/v02580-r4-list-empty-parity.css` neutraliza somente resíduos do componente legado e os pseudo-elementos introduzidos pela r3. Dimensões, borda, fundo, título e subtítulo passam a usar a mesma referência visual do Mapa.

## Atualização durante o uso
A sincronização do empty state é executada:
- na inicialização/refresh da camada v0.25.80;
- após o evento de domínio já existente `rota27:v017-domain-updated`;
- ao retornar para Lista/Comandas.

Não há `MutationObserver`, polling contínuo ou varredura em `save()`.

## Preservação
- baseline funcional visível permanece **v0.25.80**;
- topbar compacta da r3 preservada;
- Lista e Mapa preservados funcionalmente;
- nenhum dado real alterado;
- nenhuma alteração de Supabase, Edge Functions ou WhatsApp;
- sem limpeza de `localStorage`.
