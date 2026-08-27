# Rota 27 v0.25.20 — Campanha de aniversários

Data: 26/08/2026

## Objetivo
Solicitar de forma controlada a data de nascimento dos clientes que possuem WhatsApp cadastrado e ainda não têm aniversário registrado, usando template oficial da WhatsApp Cloud API e reaproveitando o cadastro sincronizado já existente.

## Frontend
Na área **Clientes** foi adicionado o card **Solicitar aniversários pelo WhatsApp**.

O card mostra:
- status do template na Meta;
- quantidade de clientes com WhatsApp e sem aniversário;
- quantidade com evidência anterior de mensagem transacional bem-sucedida;
- quantidade já solicitada;
- quantidade pronta para o próximo envio.

Ações disponíveis:
- atualizar status;
- solicitar/submeter o template;
- enviar a campanha após aprovação.

O envio exige confirmação do usuário e permanece bloqueado enquanto o template não estiver `APPROVED`.

## Template
- nome: `solicitar_aniversario_rota27_v1`;
- idioma: `pt_BR`;
- categoria submetida: `UTILITY`;
- status confirmado logo após a implantação: **PENDING**.

Texto submetido:

> Olá, {{1}}! Aqui é da Rota 27 Bodega. Estamos atualizando nosso cadastro de clientes. Se desejar, responda a esta mensagem com sua data de nascimento no formato DD/MM/AAAA. Esse dado é opcional e será usado apenas para manter seu cadastro atualizado.

Rodapé: `Rota 27 Bodega • Jardim Camburi`.

## Audiência na implantação
- clientes sincronizados: 17;
- com WhatsApp e sem `birthDate`: 13;
- com evidência de mensagem transacional anterior no Rota 27: 12;
- sem essa evidência: 1;
- mensagens da campanha enviadas durante a implantação: **0**.

A campanha padrão considera os 12 clientes com evidência anterior. O cliente sem essa evidência não entra automaticamente.

## Backend de campanha
Nova Edge Function:
- slug: `rota27-birthday-campaign`;
- versão: **2 ACTIVE**;
- `EDGE_VERSION = rota27-birthday-campaign-v2`.

Funções:
- `status`: consulta template e audiência;
- `submit_template`: cria o template caso ainda não exista;
- `send_campaign`: envia somente se o template estiver aprovado.

Proteções:
- autenticação pelo mesmo `x-rota27-device-token` usado pelo app;
- `event_id = birthday_request_v1::<clientId>` para idempotência;
- `whatsapp_message_log` registra processamento, sucesso ou falha;
- nenhum envio automático ao detectar aprovação;
- opção de incluir cliente sem evidência anterior exige confirmação administrativa explícita no payload do backend e não é usada pelo fluxo padrão da interface.

## Respostas do WhatsApp
`rota27-whatsapp-inbound` foi promovida para:
- versão **2 ACTIVE**;
- `EDGE_VERSION = rota27-whatsapp-inbound-v2-birthday`.

A resposta do cliente passa por este fluxo:
1. identifica a mensagem da campanha pelo log outbound;
2. tenta extrair a data em `DD/MM/AAAA`, `DD-MM-AAAA`, `DD.MM.AAAA` ou `AAAA-MM-DD`;
3. valida calendário, ano mínimo 1900 e data não futura;
4. grava um `client_upsert` com `birthDate` e `birthDateUpdatedAt`;
5. a alteração converge para os aparelhos pelo sync já existente;
6. envia confirmação ao cliente dentro da janela de conversa;
7. se a resposta for inválida, pede novamente o formato correto.

Não foi necessário criar novo `event_type` nem alterar `rota27_sync_events_type_ck`.

## Bootstrap da Meta
Para a submissão inicial do template foi usada uma Edge Function temporária de bootstrap. Ela permitiu resolver o WABA associado ao número da Rota 27 e confirmou que o template foi criado na Meta.

Após a submissão:
- o bootstrap foi desativado para responder HTTP 410;
- a extensão PostgreSQL `http`, instalada somente para essa etapa, foi removida.

## Preservado
- v0.25.19: cards compactos Lista/Mapa;
- v0.25.18: nascimento na abertura da comanda;
- v0.25.17: nascimento no cadastro, Relacionamento e CSV;
- v0.25.16: reparo histórico de fechamento;
- data operacional pela abertura da comanda;
- múltiplos turnos;
- A receber / Paga depois;
- estoque, compras, inventário, custos e relacionamento/fidelização.

## Service Worker
`rota27-comandas-v0.25.20-r1`

## Rollback
Baseline de rollback do frontend: **v0.25.19**.

O rollback do frontend não remove mensagens já registradas nem eventos de cliente que eventualmente venham a ser criados posteriormente por respostas válidas à campanha.
