# Rota 27 v0.25.1 — Navegação & Configurações

## Estado
**CANDIDATA — NÃO PUBLICADA EM PRODUÇÃO.**

Produção preservada: **v0.25.0 — Clientes & Fidelização**.

## Objetivo
Reorganizar a arquitetura de navegação sem alterar a lógica funcional dos módulos.

Regra mental desejada:
- **Comandas** = atender;
- **Cardápio** = o que é vendido;
- **Painel** = administrar o negócio;
- **Histórico** = o que aconteceu.

## Cardápio
A tela Cardápio passa a ficar dedicada a:
- produtos;
- categorias;
- preços;
- ativação/desativação de produtos;
- importação/exportação;
- busca e edição do catálogo.

Deixam de aparecer visualmente no Cardápio:
- Clientes;
- WhatsApp do gerente;
- WhatsApp da comanda;
- Sincronização entre aparelhos.

Os componentes legados permanecem no DOM somente como camada de compatibilidade para reutilizar os fluxos já validados. Não há duplicação de configuração nem novo armazenamento.

## Painel — Relacionamento
Novo bloco:
**Relacionamento**

Entrada:
**Clientes & Fidelização**

O acesso reutiliza o fluxo de Clientes já existente e mantém a Central de Relacionamento & Fidelização da v0.25.0.

Resumo exibido:
- quantidade de clientes cadastrados;
- indicação de relacionamento/recorrência.

## Painel — Configurações & Integrações
Novo bloco:
**Configurações & Integrações**

Entradas:
- WhatsApp da comanda;
- WhatsApp do gerente;
- Sincronização entre aparelhos.

Cada entrada reaproveita exatamente o configurador existente. Nenhuma credencial, token ou configuração é copiada para uma segunda estrutura.

## Acessos rápidos
O atalho duplicado de Sincronização no bloco Acessos rápidos do Painel deixa de ser exibido.

O atalho Cardápio passa a ser descrito como:
**Produtos e categorias**.

Quando WhatsApp ou Sincronização ainda não estiverem configurados, os cards de status do Painel orientam a configurar abaixo no próprio Painel, e não mais no Cardápio.

## Atualização de status
A nova camada atualiza os resumos por eventos já existentes:
- abertura do Painel;
- mudanças de storage entre abas/aparelhos;
- online/offline;
- atualização do domínio de clientes;
- interação com sheets de configuração;
- retorno de visibilidade.

Não há polling visual novo.

## Estabilidade
A v0.25.1 **não adiciona**:
- `setInterval`;
- `MutationObserver`;
- nova tabela;
- migration;
- evento de sincronização;
- Edge Function.

A camada extra do Painel é inserida como irmã de `screenPanel`, para não ser destruída pelas renderizações legadas do Painel.

## Ajuda
Ajuda candidata **v5.2** com seção:
**Onde ficam Clientes e configurações**.

## Versão e cache
- versão candidata: `0.25.1`;
- Service Worker candidato: `rota27-comandas-v0.25.1-r1`.

## Rollback
Baseline segura: **v0.25.0 — Clientes & Fidelização**.
