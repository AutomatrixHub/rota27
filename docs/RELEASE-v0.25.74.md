# Rota 27 — Release v0.25.74

Data: 30/08/2026

## Título
**Consentimento persistente de WhatsApp**

## Problema
Até a v0.25.73, a autorização para receber atualizações da comanda era armazenada apenas em `command.whatsappOptIn`. Toda nova comanda começava com o checkbox desmarcado, mesmo para um cliente que já havia autorizado o mesmo tipo de atualização em uma visita anterior.

## Objetivo
Transformar a autorização de **atualizações operacionais da comanda** em uma preferência persistente do cliente, preservando rastreabilidade, revogação e o princípio de escopo específico.

## Nova regra
O consentimento possui três estados:
- `granted`: autorização registrada;
- `revoked`: autorização explicitamente revogada;
- ausência de registro: ainda não há autorização persistente.

Escopo: `command_updates`.

Esse consentimento cobre apenas mensagens operacionais ligadas à comanda: lançamentos, remoções, total e cancelamento. Não autoriza automaticamente marketing, eventos, promoções ou outras campanhas.

## Nova comanda
Ao selecionar um cliente cadastrado:
- se `granted`, o checkbox é marcado automaticamente;
- a tela informa que a autorização já estava registrada;
- desmarcar o checkbox significa apenas **não enviar nesta comanda**;
- desmarcar não revoga a autorização global;
- se `revoked`, o checkbox fica desmarcado e só volta a ser persistido como autorizado depois de nova autorização explícita;
- cliente sem registro continua exigindo marcação manual após autorização.

## Cliente novo
Quando o operador marca o checkbox para um cliente novo e abre a comanda, a autorização é registrada no cadastro criado para aquele cliente.

## Migração das autorizações existentes
Para não exigir nova autorização de clientes que já passaram pelo fluxo atual:
- somente clientes sem registro persistente são avaliados;
- se existir comanda histórica com `whatsappOptIn=true`, o consentimento é migrado para `granted`;
- a data da comanda histórica é usada como data do registro migrado;
- uma revogação posterior, com timestamp mais novo, sempre prevalece.

## Revogação
A revogação é uma ação separada e explícita:
- link **Revogar autorização salva** na Nova comanda quando o cliente está autorizado;
- estado e ação também aparecem no editor do cadastro de clientes.

No editor, o operador pode registrar novamente uma autorização após confirmação do cliente.

## Identidade do cliente
O consentimento prioriza identificação canônica por ID/WhatsApp. Quando não há telefone informado, o nome só é usado se houver exatamente um cliente com aquele nome, evitando reutilizar autorização de homônimos.

## Sincronização
- armazenamento local dedicado: `rota27_v02574_whatsapp_consent_v1`;
- cursor dedicado: `rota27_v02574_whatsapp_consent_cursor_v1`;
- sincronização reutiliza `client_upsert` existente;
- campos adicionais no payload: `whatsappCommandConsent`, `whatsappCommandConsentAt`, `whatsappCommandConsentUpdatedAt`, `whatsappCommandConsentSource` e `whatsappCommandConsentVersion`;
- camada própria lê esses campos do event log e os reidrata localmente;
- não foi criado novo tipo de evento.

## Backend
Nenhuma alteração:
- sem migration;
- sem nova tabela;
- sem alteração de Edge Function;
- `rota27-sync` existente é reutilizado.

## Segurança e estabilidade
- sem `MutationObserver`;
- sem polling contínuo;
- sincronização acionada por abertura/retomada, eventos de domínio e conectividade;
- nenhuma limpeza de `localStorage`;
- nenhum reenvio retroativo de WhatsApp.

## PWA
- `VERSION`: `0.25.74`;
- release meta do shell: `0.25.74`;
- assets carregados diretamente pelo shell e também pelo roadmap loader;
- Service Worker: `rota27-comandas-v0.25.74-r1`.

## Arquivos principais
- `assets/v02574-whatsapp-consent.js`;
- `assets/v02574-whatsapp-consent.css`;
- `assets/roadmap-loader.js`;
- `index.html`;
- `sw.js`;
- `VERSION`;
- `README.md`;
- `docs/STATUS-PRODUCAO.md`.

## Rollback
Baseline: **v0.25.73** / merge `ca64b52e7197c332e5f9f12022a6b94784d7e8e6`.
