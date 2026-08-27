# Rota 27 — Status de produção

Última revisão: 27/08/2026

## Produção
- versão: **v0.25.21 — Ontem no Histórico + leitura dos fechamentos**;
- branch: `main`;
- GitHub Pages: `https://automatrixhub.github.io/rota27/`;
- Service Worker: `rota27-comandas-v0.25.21-r1`;
- `rota27-whatsapp`: versão **23 ACTIVE** (`rota27-whatsapp-v6-mini2`);
- `rota27-sync`: versão **9 ACTIVE** (`rota27-sync-v0.25.16`);
- `rota27-whatsapp-inbound`: versão **2 ACTIVE** (`rota27-whatsapp-inbound-v2-birthday`);
- `rota27-birthday-campaign`: versão **2 ACTIVE** (`rota27-birthday-campaign-v2`);
- `rota27-audit`: versão 1 ACTIVE, somente leitura.

Baseline de rollback do código: **v0.25.20 — Campanha de aniversários**.

## v0.25.21 — Ontem no Histórico + leitura dos fechamentos
Mudança exclusivamente de interface/leitura, sem alteração de regras operacionais, event log, Edge Function ou banco.

### Histórico — novo período Ontem
- barra de períodos passa a ter **Hoje / Ontem / 7 dias / 30 dias / Todos**;
- **Ontem** usa como referência a data operacional do dia anterior;
- quando houver mais de um fechamento no mesmo dia, a aba detalha o **último fechamento daquele dia**, respeitando o fechamento anterior como corte;
- métricas exibidas: faturamento, comandas, ticket médio e itens vendidos;
- produtos e categorias são calculados sobre as comandas pertencentes ao fechamento selecionado;
- lista de comandas continua permitindo abrir o detalhe individual;
- pesquisa por cliente/mesa/produto continua funcionando dentro do recorte de Ontem;
- nenhum `MutationObserver` ou polling visual frequente foi introduzido.

### Fechamentos — densidade e legibilidade
- data do turno e horário de fechamento com tipografia maior;
- rótulos e valores dos mini-cards ampliados;
- padding ajustado para reduzir áreas vazias;
- grade mobile permanece em 2 colunas para preservar leitura;
- metadados de fechamento continuam visíveis.

### Backend
Nenhuma alteração. Permanecem:
- `rota27-sync` v9 ACTIVE;
- `rota27-whatsapp` v23 ACTIVE;
- `rota27-whatsapp-inbound` v2 ACTIVE;
- `rota27-birthday-campaign` v2 ACTIVE.

## v0.25.20 — Campanha de aniversários
Foi adicionada uma campanha administrativa para solicitar **Data de nascimento** dos clientes via WhatsApp Cloud API.

### Estado da base no momento da release
- clientes sincronizados: **17**;
- clientes com WhatsApp e sem data de nascimento: **13**;
- desses, com evidência de mensagem transacional anterior enviada pelo Rota 27: **12**;
- sem evidência anterior no sistema: **1**;
- solicitações da campanha enviadas durante a implantação: **0**.

### Template Meta
- nome: `solicitar_aniversario_rota27_v1`;
- idioma: `pt_BR`;
- categoria submetida: `UTILITY`;
- status confirmado após submissão: **PENDING**;
- o backend bloqueia o disparo enquanto o status não for `APPROVED`.

### Regras de segurança do disparo
- a audiência é calculada no servidor a partir dos `client_upsert` mais recentes;
- clientes que já possuem `birthDate` ficam fora;
- por padrão, somente clientes com evidência anterior de mensagem transacional bem-sucedida entram na fila;
- o cliente sem essa evidência permanece excluído do disparo padrão;
- cada solicitação usa `event_id` determinístico em `whatsapp_message_log`, evitando envio duplicado;
- a tela administrativa exige confirmação antes do disparo;
- nenhuma mensagem é enviada automaticamente só porque o template foi aprovado.

### Respostas dos clientes
`rota27-whatsapp-inbound` v2 reconhece respostas associadas à campanha:
- aceita `DD/MM/AAAA`, `DD-MM-AAAA`, `DD.MM.AAAA` e `AAAA-MM-DD`;
- rejeita datas inválidas, futuras ou anteriores a 1900;
- resposta válida cria `client_upsert` com `birthDate` e `birthDateUpdatedAt`;
- a alteração entra no event log normal e converge para os aparelhos;
- o cliente recebe uma confirmação após a gravação;
- se a data não puder ser identificada, recebe uma orientação para responder no formato correto;
- respostas que não pertencem à campanha continuam seguindo o fluxo normal para o gerente.

### Infraestrutura
- nova Edge Function `rota27-birthday-campaign` versão 2 ACTIVE;
- `rota27-whatsapp-inbound` promovida para versão 2 ACTIVE;
- `rota27-sync` não foi alterada;
- não foi criado novo tipo de evento: a gravação utiliza `client_upsert`, já aceito no Edge e no CHECK do PostgreSQL;
- um bootstrap temporário foi usado apenas para a submissão inicial do template e foi posteriormente desativado para responder HTTP 410;
- a extensão PostgreSQL `http`, habilitada somente durante esse bootstrap, foi removida após o uso.

## v0.25.19 — Cards compactos de comandas
Refinamento visual da tela **Comandas**: Lista mais compacta e Mapa com 2 cards por linha em celulares, sem mudança de domínio, sync ou backend.

## v0.25.18 — Cadastro completo na abertura da comanda
A abertura de nova comanda aceita Data de nascimento opcional junto com Cliente e WhatsApp. Cliente existente pode ter o nascimento preenchido/complementado, e cliente novo pode ser cadastrado já com o dado.

## v0.25.17 — Aniversário no cadastro de clientes
Data de nascimento opcional no cadastro compartilhado, Relacionamento & Fidelização e CSV, via `client_upsert`.

## v0.25.16 — Reparo histórico de fechamento
O reparo administrativo da comanda `c1787690191876` permanece ativo e rastreável. O fechamento canônico de 25/08 permanece em R$ 448,00 / 8 comandas / 33 unidades.

## Regra operacional preservada
A data operacional é definida pela **abertura da comanda**, não pelo instante do fechamento. Múltiplos turnos no mesmo dia continuam possíveis.

## A receber
`A receber / Paga depois` continua sem duplicar venda/faturamento em baixas totais ou parciais posteriores.

## Cliente cadastrado
O seletor pesquisável permanece ativo. A abertura da comanda também pode cadastrar/complementar a data de nascimento do cliente. A campanha de aniversário reutiliza o mesmo campo canônico.

## Preservado
- data operacional pela abertura da comanda;
- múltiplos turnos no mesmo dia;
- A receber / Paga depois;
- rankings por ID/código com nome atual;
- referência de produtos ao editar categorias;
- cópia fixa de WhatsApp para `+55 27 99776-9279` (`5527997769279`);
- replay histórico hibernado;
- Lista + Mapa;
- estoque, compras, inventário, custos e relacionamento/fidelização.

## Ajuda
Ajuda **v7.0**, identificando Rota 27 v0.25.21.

## Atualização da PWA
Não reinstalar e não limpar dados. Em cada aparelho:
1. manter internet ativa;
2. abrir a PWA por 20–30 segundos;
3. fechar completamente;
4. abrir novamente;
5. confirmar `v0.25.21`.

Ver `docs/RELEASE-v0.25.21.md`.
