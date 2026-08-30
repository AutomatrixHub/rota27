# Rota 27 — Status de produção

Última revisão: 30/08/2026

## Produção
- versão: **v0.25.74 — Consentimento persistente de WhatsApp**;
- branch: `main`;
- GitHub Pages: `https://automatrixhub.github.io/rota27/`;
- Service Worker: `rota27-comandas-v0.25.74-r1`;
- baseline anterior: **v0.25.73**, merge `ca64b52e7197c332e5f9f12022a6b94784d7e8e6`.

## Consentimento de atualizações da comanda
Até a v0.25.73, `whatsappOptIn` existia somente na comanda. Mesmo quando o cliente já havia autorizado em uma visita anterior, toda nova comanda começava com o checkbox desmarcado.

A v0.25.74 cria uma camada de consentimento persistente, vinculada ao cadastro canônico do cliente por ID/WhatsApp:
- estados: `granted`, `revoked` e ausência de registro;
- escopo exclusivo: `command_updates`;
- data, origem e versão do registro ficam preservadas;
- sincronização usa `client_upsert` já existente, sem novo tipo de evento e sem migration;
- uma camada própria lê os eventos `client_upsert` e evidências históricas `command_opened` para preservar/reconstruir o consentimento;
- nenhum consentimento de comanda é convertido em autorização de marketing, eventos ou campanhas.

## Nova comanda
Ao selecionar um cliente cadastrado:
- consentimento `granted`: checkbox é marcado automaticamente;
- a interface informa que a autorização já estava registrada e exibe a data disponível;
- se o operador desmarcar o checkbox, somente a comanda atual fica sem mensagens; a autorização global permanece;
- consentimento `revoked`: checkbox permanece desmarcado e a tela pede nova autorização antes de registrar novamente;
- cliente sem registro: comportamento conservador, checkbox desmarcado até autorização explícita.

Para cliente novo, marcar o checkbox continua significando que o cliente autorizou. Depois da criação do cadastro, essa autorização é gravada também no consentimento persistente.

## Migração do histórico existente
Clientes ainda sem registro persistente podem ter a autorização reconstruída de duas fontes:
- comandas locais preservadas com `whatsappOptIn=true`;
- eventos compartilhados `command_opened` cujo snapshot original registra `whatsappOptIn=true`, inclusive quando a comanda foi depois cancelada e deixou de existir localmente.

A identificação prioriza o WhatsApp canônico. A data original da comanda é usada como `updatedAt`. A comparação entre registros prioriza `updatedAt`, depois `seq`; em empate completo, `revoked` prevalece sobre `granted`. Assim, autorização histórica não substitui revogação mais recente.

A migração apenas registra a permissão: **não envia nenhuma mensagem retroativa ao cliente**.

## Revogação explícita
A autorização global pode ser revogada de forma separada:
- na própria Nova comanda, pelo link **Revogar autorização salva**;
- no editor do cadastro do cliente, que passa a mostrar **Autorizado / Revogado / Não registrado**.

Revogar é diferente de apenas desmarcar o checkbox de uma comanda. O texto antigo do editor, que dizia que o consentimento era definido em cada comanda, também é substituído pela regra persistente atual.

## Cancelamento de comanda — WhatsApp
A v0.25.73 permanece ativa:
- cancelamento captura a comanda antes da limpeza legada;
- cliente autorizado recebe a comanda como **CANCELADA**;
- itens aparecem como **REMOVIDO**;
- total final é **R$ 0,00**;
- envio mantém fila persistente, retry e `eventId` idempotente.

## Backend preservado
- `rota27-whatsapp`: v23 ACTIVE;
- `rota27-sync`: v9 ACTIVE;
- `rota27-whatsapp-inbound`: v4 ACTIVE;
- `rota27-birthday-campaign`: v3 ACTIVE.

A v0.25.74 **não altera Edge Functions**, schemas ou tabelas. A sincronização de consentimento reutiliza a infraestrutura de domínio existente.

## Preservação
- nenhuma migration;
- nenhuma Edge Function alterada;
- nenhum reset ou exclusão de dados;
- preços, produtos, estoque, comandas, clientes, recebíveis e histórico preservados;
- sem polling contínuo e sem `MutationObserver` novo.

## Atualização PWA
- shell declara `rota27-release-version=0.25.74`;
- `v02574-whatsapp-consent.css/js` são carregados diretamente pelo shell e pelo roadmap loader;
- cache `rota27-comandas-v0.25.74-r1`;
- não limpar `localStorage` de produção.

## Regras de operação
- não reinstalar PWA como atualização normal;
- não resetar Supabase;
- Sandbox não envia WhatsApp real nem sincroniza produção;
- mudanças usam branch curta + PR + merge + confirmação do Pages.

## Rollback
Baseline anterior: **v0.25.73** / merge `ca64b52e7197c332e5f9f12022a6b94784d7e8e6`.
