# Rota 27 Bodega — v0.25.52

## Simplificação de Comandas

Release de refinamento visual e operacional baseada em teste real no celular.

### Lista e Mapa

As duas visualizações continuam disponíveis:

- Lista;
- Mapa.

A v0.25.52 **não remove o Mapa** e não força a Lista como modo único.

Foi desabilitado somente o bloco adicional **Mapa rápido**, incluindo:

- cabeçalho explicativo "Mapa rápido";
- atalhos `+ Mesa`, `+ Balcão`, `+ Parklet` e `+ Cliente`.

A organização das comandas dentro da visualização Mapa permanece disponível e continua abrindo as mesmas comandas reais.

### Barra da comanda

O botão `Ver/Editar itens` ganhou mais largura e passa a permanecer em uma única linha nos tamanhos usuais de tela mobile.

A ação continua abrindo o editor de itens já validado; nenhuma regra de edição foi alterada.

### Botão flutuante de nova comanda

Quando a barra preta da comanda atual estiver visível, o botão flutuante `+` fica oculto.

Objetivo:

- evitar sobreposição com `Fechar`;
- não oferecer a ação de nova comanda enquanto o usuário está operando uma comanda ativa;
- preservar o botão normalmente quando a barra da comanda não está ativa.

### Ajuda

A seção antiga `Mapa rápido de comandas` foi ajustada para `Mapa de comandas` e não orienta mais sobre os atalhos desativados.

### PWA

- versão: `0.25.52`;
- cache: `rota27-comandas-v0.25.52-r1`.

### Escopo e segurança

Frontend somente.

Não houve alteração em:

- Supabase;
- WhatsApp;
- sincronização;
- fechamento de turno;
- estoque;
- compras;
- dados de produção;
- regras de faturamento.

Rollback de referência: v0.25.51 / merge `ce46be449f6c827aa0f1990622bdbf8e7e25646a`.
