# Rota 27 v0.25.81 — Modo Teste Global

## Objetivo
Disponibilizar um sandbox operacional reversível para treinamento, demonstração e validação do Rota 27 inteiro, sem misturar dados fictícios com a operação real.

## Experiência
- ativação pela **Visão Gerencial** ou pela **Ajuda**;
- indicador permanente `🧪 MODO TESTE` enquanto ativo;
- identidade visual azul/violeta para diferenciar claramente o sandbox da produção;
- saída reversível por botão, com restauração imediata do estado real;
- ação **Regenerar cenário** para descartar as alterações feitas durante a sessão de teste.

## Base fictícia
O gerador utiliza primeiro os dados já conhecidos pelo estabelecimento:
- todos os produtos atuais;
- todas as categorias atuais;
- todos os clientes atuais.

Somente quando necessário para dar variedade ao cenário são acrescentados produtos/clientes identificados como `Teste`.

O histórico cobre aproximadamente **40 dias corridos** relativos à data corrente. **Domingos são ignorados**, refletindo a rotina habitual informada para a Rota 27. Sextas e sábados recebem maior volume de comandas.

São gerados de forma coerente:
- comandas fechadas e comandas abertas;
- itens e snapshots de produto;
- pagamentos;
- fechamentos de turno;
- estoque controlado e movimentos;
- fornecedores, pedidos e recebimentos;
- custos derivados dos recebimentos.

## Isolamento
Durante o Modo Teste:
1. o `state` real é clonado e mantido em memória para restauração;
2. o aplicativo recebe um `state` fictício independente;
3. chaves operacionais `rota27_*`/`r27_*` do `localStorage` são virtualizadas em memória;
4. o `save()` global não persiste o sandbox;
5. chamadas a `/functions/v1/` são bloqueadas;
6. abertura de WhatsApp (`wa.me`, WhatsApp Web/API) é bloqueada;
7. a configuração de sincronização vista pelo sandbox é marcada como desativada.

Ao sair, o estado real em memória é restaurado e a camada virtual de armazenamento é descartada. Não há limpeza do `localStorage` real.

## Visão Gerencial
O controle antigo de demonstração isolada fica oculto e é substituído por **Modo Teste Global**, evitando duas fontes de dados fictícios concorrentes.

## PWA
Cache de release: `rota27-comandas-v0.25.81-r1`.

## Backend
Nenhuma migration, Edge Function ou tabela nova. O backend real não participa do Modo Teste.

## Restrições
- Modo Teste começa desligado por padrão.
- Não persiste entre recargas completas da página; uma recarga volta à operação real, por segurança.
- Nenhum disparo real de WhatsApp é permitido no sandbox.
