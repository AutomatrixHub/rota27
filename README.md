# Rota 27 Bodega — Comandas

Aplicativo mobile-first, offline-first e multidispositivo para controle rápido de comandas da **Rota 27 Bodega**.

## Produção
- **Versão:** v0.25.68 — Recontato de cadastro
- **Branch:** `main`
- **GitHub Pages:** `https://automatrixhub.github.io/rota27/`
- **Service Worker:** `rota27-comandas-v0.25.68-r1`
- **Baseline anterior:** v0.25.67

## v0.25.68 — Recontato de data de nascimento

A rotina **Solicitar data de nascimento pelo WhatsApp** deixa de ser envio único e passa a permitir até **3 solicitações bem-sucedidas por cliente**, com intervalo mínimo de **7 dias** entre elas.

### Regras
- cliente com data de nascimento válida sai imediatamente da audiência;
- máximo de 3 solicitações bem-sucedidas;
- mínimo de 7 dias entre uma solicitação e a próxima;
- falha técnica não consome uma das três tentativas;
- primeira solicitação continua exigindo evidência anterior de contato autorizado no Rota 27;
- clientes sem essa evidência não entram no disparo;
- clientes sem WhatsApp válido são apenas sinalizados para atualização manual do cadastro;
- o disparo continua **manual pelo operador**, não há reenvio automático em segundo plano.

### Resposta do cliente
Quando o cliente responde com uma data válida em `DD/MM/AAAA`:
- `birthDate` é salva no `client_upsert`;
- `relationshipMarketingOptIn=true` é gravado no mesmo evento, conforme regra aprovada;
- `eventMarketingOptIn=true` é mantido por compatibilidade;
- o cliente deixa de aparecer nas próximas solicitações;
- uma confirmação de atualização continua sendo enviada dentro da sessão de WhatsApp.

### Backend
- `rota27-birthday-campaign`: v3, com histórico por tentativa e cooldown de 7 dias;
- `rota27-whatsapp-inbound`: v4, consolidando data + autorização na resposta;
- template existente `solicitar_aniversario_rota27_v1` é reutilizado, sem nova submissão à Meta;
- nenhum disparo foi executado durante a implantação.

### Interface
O card de solicitação passa a mostrar:
- clientes com WhatsApp sem aniversário;
- clientes com histórico autorizado;
- quantos já receberam pelo menos uma solicitação;
- quantos aguardam o intervalo de 7 dias;
- quantos já atingiram o limite de 3;
- quantos estão prontos para envio agora;
- separação entre primeira solicitação e recontato.

## Aniversários automáticos
A v0.25.65–67 permanece responsável pelo cumprimento automático às 09:30, template MARKETING aprovado, elegibilidade e estado visual.

## Atualização da PWA
Não limpar `localStorage`, não reinstalar a PWA e não apagar dados de produção. Abra online, aguarde a atualização, feche completamente e abra novamente.

## Documentação
- `docs/STATUS-PRODUCAO.md`
- `docs/RELEASE-v0.25.68.md`
- `docs/RELEASE-v0.25.67.md`

## Versão
Produção: **0.25.68**
