# Rota 27 v0.25.2 — Validação candidata R5

Estado: **CANDIDATA — NÃO PUBLICADA**.

## Origem
Após aprovação da R4, foi solicitado acrescentar ícones aos três cards principais do Painel para harmonizá-los com `Clientes & Fidelização`.

## R5 implementada
- Visão Gerencial: `📊`;
- Estoque Essencial: `📦`;
- Compras & Reposição: `🛒`;
- ícones em blocos arredondados claros;
- grid desktop: ícone + texto + botão;
- grid mobile: ícone + texto, botão em largura total abaixo;
- cores dos botões preservadas;
- mesma ponte de render da R4 recompõe os ícones após redesenhos legados do Painel;
- sem novo polling;
- sem novo `MutationObserver`;
- sem backend/Supabase.

## Gate pendente
Validação visual em desktop/mobile e confirmação de que os ícones permanecem estáveis após o Painel ficar aberto e após navegação de ida/volta.

Somente promover após aprovação explícita.
