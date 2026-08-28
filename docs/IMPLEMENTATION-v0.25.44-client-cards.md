# Implementação v0.25.44 — Cartões de clientes

Validação de implementação:

- os dados exibidos são derivados do cadastro e do histórico já existentes;
- nascimento usa a API da v0.25.17 quando disponível;
- última compra e total usam somente comandas do histórico não canceladas;
- `Cliente desde` usa a menor data conhecida entre cadastro e primeira compra;
- última visita é derivada da última compra fechada;
- telefone não é tratado como prova de entrega de WhatsApp: o selo informa apenas presença de WhatsApp cadastrado;
- ícones novos são SVG vetoriais, sem emojis;
- sem `MutationObserver` e sem polling visual contínuo;
- atualização visual ocorre após abertura da tela, pesquisa, ações no cadastro, sincronização de domínio, atualização de aniversário e retorno de visibilidade.

Compatibilidade:

- nenhuma migration;
- nenhuma Edge Function alterada;
- nenhuma alteração no Sandbox;
- nenhuma alteração em campanhas, fechamento, estoque, recebíveis ou consumo interno.
