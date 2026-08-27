# Rota 27 Bodega — Comandas

Aplicativo mobile-first, offline-first e multidispositivo para controle rápido de comandas da **Rota 27 Bodega**.

## Produção

**Versão: v0.25.21 — Ontem no Histórico + leitura dos fechamentos**  
Branch: `main`  
GitHub Pages: `https://automatrixhub.github.io/rota27/`  
Service Worker: `rota27-comandas-v0.25.21-r1`

## Navegação
- **Comandas = atender**;
- **Cardápio = o que é vendido**;
- **Painel = administrar o negócio**;
- **Histórico = o que aconteceu**.

## v0.25.21 — Ontem no Histórico + leitura dos fechamentos
A tela **Histórico** passa a ter cinco períodos: **Hoje, Ontem, 7 dias, 30 dias e Todos**.

A aba **Ontem** usa o fechamento imutável do dia operacional anterior como referência. Quando houver mais de um turno no mesmo dia, detalha o **último fechamento de ontem**, respeitando o corte do fechamento anterior. Exibe faturamento, comandas, ticket médio, itens vendidos, produtos/categorias e as comandas pertencentes àquele fechamento.

A tela **Fechamentos** também foi refinada para uso no celular:
- data do turno e horário mais legíveis;
- rótulos e valores maiores;
- menos espaço ocioso dentro dos quadros;
- cartões continuam em 2 colunas no mobile para preservar leitura.

Nenhuma regra de domínio, sincronização ou Supabase foi alterada.

## v0.25.20 — Campanha de aniversários
A área de clientes passa a ter uma campanha controlada para solicitar **Data de nascimento** por WhatsApp usando template oficial da Meta.

Fluxo:
- identifica clientes com WhatsApp e sem `birthDate`;
- por segurança, o disparo padrão considera somente telefones com evidência anterior de mensagem transacional autorizada no Rota 27;
- template: `solicitar_aniversario_rota27_v1`;
- o painel mostra status do template, quantidade elegível, já solicitados e prontos para envio;
- mensagens usam `whatsapp_message_log` com `event_id` determinístico, evitando duplicidade;
- respostas em `DD/MM/AAAA` ou `AAAA-MM-DD` são reconhecidas automaticamente;
- resposta válida gera `client_upsert` com `birthDate` e `birthDateUpdatedAt`, convergindo para os aparelhos;
- o cliente recebe confirmação após gravação;
- resposta inválida recebe orientação para reenviar no formato correto;
- não foi criado novo tipo de evento de sincronização.

Backend:
- nova Edge Function `rota27-birthday-campaign`;
- `rota27-whatsapp-inbound` processa respostas da campanha antes do encaminhamento comum ao gerente;
- `rota27-sync` permanece inalterado.

## v0.25.19 — Cards compactos de comandas
A tela **Comandas** ganhou cards mais baixos na Lista e duas colunas no Mapa mobile, sem alterar lógica operacional.

## v0.25.18 — Cadastro completo na abertura da comanda
A nova comanda aceita **Data de nascimento** opcional junto com Cliente e WhatsApp. Cliente cadastrado preenche WhatsApp/nascimento quando disponíveis; cliente novo pode ter o nascimento salvo já na abertura. O campo vazio nunca apaga nascimento existente.

## v0.25.17 — Aniversário no cadastro de clientes
Adicionou Data de nascimento opcional ao cadastro compartilhado, Relacionamento & Fidelização e CSV de clientes, sincronizado via `client_upsert`.

## v0.25.16 — Reparo histórico de fechamento
Mantém o reparo administrativo rastreável do fechamento histórico ligado à comanda `c1787690191876` (Fred / Balcão / R$ 145,00), com estado canônico de 25/08 em R$ 448,00 / 8 comandas / 33 unidades.

## Regra operacional preservada
A data de abertura da comanda define a qual turno a venda pertence. Múltiplos turnos no mesmo dia continuam suportados; o fechamento anterior funciona como corte.

## Preservado
- seletor pesquisável de clientes na nova comanda;
- data de nascimento no cadastro e na abertura da comanda;
- A receber / Paga depois, inclusive recebimentos parciais;
- rankings por ID/código com nome atual do produto;
- referência de produtos ao editar categorias;
- Lista + Mapa;
- cópia fixa de WhatsApp para `+55 27 99776-9279` (`5527997769279`);
- replay histórico hibernado;
- estoque, compras, inventário, custos e relacionamento/fidelização.

## Backend
- `rota27-sync`: versão **9 ACTIVE** (`rota27-sync-v0.25.16`);
- `rota27-whatsapp`: versão **23 ACTIVE**;
- `rota27-birthday-campaign`: versão **2 ACTIVE**;
- `rota27-whatsapp-inbound`: versão **2 ACTIVE**;
- sem novo tipo de evento de sync e sem alteração de `rota27_sync_events_type_ck` na v0.25.21.

## Ajuda
Ajuda **v7.0** permanece ativa, identificando a release v0.25.21.

## Atualização da PWA
Não limpar dados nem reinstalar. Abra a PWA online, aguarde 20–30 segundos, feche completamente e abra novamente em cada aparelho.

## Documentos
- `docs/RELEASE-v0.25.21.md`
- `docs/RELEASE-v0.25.20.md`
- `docs/RELEASE-v0.25.19.md`
- `docs/RELEASE-v0.25.18.md`
- `docs/RELEASE-v0.25.17.md`
- `docs/RELEASE-v0.25.16.md`
- `docs/STATUS-PRODUCAO.md`

Baseline de rollback do código: **v0.25.20**.

## Versão
Produção: **0.25.21**
