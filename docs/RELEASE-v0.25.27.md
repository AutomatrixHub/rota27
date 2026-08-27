# Rota 27 — Release v0.25.27

## Ícones profissionais no Cardápio

Release visual focada exclusivamente na apresentação dos produtos da aba **Cardápio**.

### O que mudou
- os emojis dos cards de produtos foram substituídos por ícones vetoriais monocromáticos;
- o conjunto segue uma linguagem visual única, com traço, escala, alinhamento e contraste consistentes;
- a escolha do ícone considera categoria e nome do produto, cobrindo famílias como cervejas, vinhos, bebidas, café, queijos, frios/embutidos, molhos/temperos, castanhas, biscoitos, doces, pães e petiscos;
- produtos sem correspondência específica usam um ícone neutro de produto/embalagem;
- produtos inativos mantêm diferenciação visual e recebem versão neutra do mesmo padrão;
- os emojis originais continuam preservados nos dados do catálogo; a substituição é somente de apresentação na aba Cardápio.

### Implementação
- novo `assets/v02527-product-icons.css`;
- novo `assets/v02527-product-icons.js`;
- o módulo decora a saída existente de `renderMenu()` e reaplica os ícones após interações finitas relevantes;
- sem `MutationObserver`;
- sem polling contínuo;
- Service Worker `rota27-comandas-v0.25.27-r1`.

### Preservado
- cadastro e edição de produto;
- categoria e status ativo/inativo;
- preço e histórico de preço;
- busca do Cardápio;
- gerenciamento de categorias;
- dados de emoji já armazenados no catálogo;
- sincronização multidispositivo;
- funcionamento offline-first.

### Backend
Nenhuma alteração em Supabase, Edge Functions, event log, constraints ou tipos de evento de sincronização.

## Rollback
Baseline anterior: **v0.25.26**, HEAD `ff64c3f8003d326e71ce3225ff3c66469ccebe51`.
