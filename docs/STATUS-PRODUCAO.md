# Rota 27 — Status de produção

Última revisão: 27/08/2026

## Produção
- versão: **v0.25.23 — Acabamento visual dos Fechamentos**;
- branch: `main`;
- GitHub Pages: `https://automatrixhub.github.io/rota27/`;
- Service Worker: `rota27-comandas-v0.25.23-r1`;
- `rota27-whatsapp`: versão **23 ACTIVE** (`rota27-whatsapp-v6-mini2`);
- `rota27-sync`: versão **9 ACTIVE** (`rota27-sync-v0.25.16`);
- `rota27-whatsapp-inbound`: versão **2 ACTIVE** (`rota27-whatsapp-inbound-v2-birthday`);
- `rota27-birthday-campaign`: versão **2 ACTIVE** (`rota27-birthday-campaign-v2`);
- `rota27-audit`: versão 1 ACTIVE, somente leitura.

Baseline de rollback do código: **v0.25.22-r4**.

## v0.25.23 — Acabamento visual dos Fechamentos
Refinamento final da tela **Fechamentos**, validada em aparelho real após a correção da disputa de renderização da v0.25.22-r4.

### Acabamento
- data operacional permanece como informação dominante;
- **Fechado: DD/MM HH:MM** passa a ter menor peso visual;
- valores dos indicadores ficam mais destacados;
- rótulos ficam mais suaves;
- cards internos, status verde e espaçamentos verticais ficam ligeiramente mais compactos;
- rodapé operacional fica menor e mais discreto;
- o fechamento mais recente recebe o marcador **Último fechamento**;
- o fechamento histórico reparado passa a ser apresentado como **ajuste administrativo** na interface, sem modificar o registro técnico original.

### Preservado
- ordem: **Faturamento | Ticket médio** / **Comandas fechadas | Comandas canceladas** / **Itens vendidos | Formas de pagamento**;
- proteção visual contra reaparecimento do ID técnico `turn_...`;
- status `Sincronizado • data/hora`;
- botões **Sincronizar** e **Concluir**;
- estabilização curta e finita do renderer;
- sem `MutationObserver` e sem polling contínuo;
- sem alteração de Supabase, Edge Functions, event log ou cálculo do turno.

Ver `docs/RELEASE-v0.25.23.md`.

## v0.25.22 — Refinamento dos Fechamentos
Mudança exclusivamente visual na tela **Fechamentos**, sem alteração de domínio, sincronização, banco ou Edge Functions.

### Hierarquia dos indicadores
A grade passa a ser exibida na ordem:
- **Faturamento | Ticket médio**;
- **Comandas fechadas | Comandas canceladas**;
- **Itens vendidos | Formas de pagamento**.

Os rótulos abreviados foram substituídos por textos completos para reduzir ambiguidade operacional.

### Cabeçalho e metadados
- o horário no canto superior direito passa a aparecer como **Fechado: DD/MM HH:MM**;
- a data grande à esquerda continua sendo a **data operacional** do turno;
- o ID técnico `turn_...` deixa de ser mostrado na visão operacional;
- o identificador permanece preservado no armazenamento/event log;
- a linha inferior fica em **Data operacional pela abertura • fechado em <aparelho>**.

### Sincronização e rolagem
- o status verde passa a usar **Sincronizado • DD/MM/AAAA HH:MM:SS**;
- estados de sincronização em andamento ou pendente permanecem inalterados;
- a lista recebeu espaço inferior adicional para o último fechamento poder subir totalmente acima dos botões fixos **Sincronizar / Concluir**.

### Hotfix r2
A validação por captura real mostrou que a primeira publicação da v0.25.22 mantinha a nova ordem dos cards, porém o renderer-base podia restaurar textos antigos ao terminar a sincronização assíncrona.

O r2 passa a renderizar a sheet de Fechamentos de forma determinística:
- intercepta a abertura pelo botão `v019ViewAll` antes do handler legado;
- reaproveita a mesma sheet e os mesmos dados imutáveis de fechamento;
- executa `Rota27V019.syncTurnClosures()` normalmente e redesenha uma única vez após a conclusão;
- o botão **Sincronizar** segue o mesmo fluxo;
- CSS garante rótulos completos e o prefixo **Fechado:** mesmo durante redesenhos internos;
- não usa `MutationObserver` nem polling visual frequente;
- não altera `turn_closed`, Supabase, event log, localStorage de domínio ou cálculo do turno.

### Hotfix r3
A captura seguinte confirmou que os rótulos e o cabeçalho estavam corretos, mas o **rodapé** e o **status de sincronização** ainda podiam permanecer no formato legado.

O r3 usa um novo asset (`assets/v02522r3-closure-render.js`) e assume de forma canônica a abertura/sincronização dessa sheet:
- rodapé em **Data operacional pela abertura • fechado em <aparelho>**;
- ID técnico `turn_...` não deveria aparecer na visão operacional;
- status ao fim da sincronização em **Sincronizado • DD/MM/AAAA HH:MM:SS**;
- mesma lógica de dados e mesma API `Rota27V019.syncTurnClosures()`;
- sem `MutationObserver`, sem polling visual frequente e sem alteração do backend.

### Hotfix r4
A validação real mostrou a causa residual: listeners internos do módulo-base ainda podiam chamar `refresh()` / `renderOpenSheets()` **depois** do renderer r3, restaurando o HTML legado aproximadamente 0,1 s depois.

O r4 elimina essa corrida na camada visual:
- o conteúdo bruto do rodapé é ocultado por CSS; assim, mesmo que o legado reinsira `turn_...`, o ID técnico não volta a aparecer;
- quando disponível, o nome do aparelho é mostrado por `data-r27-device`;
- o texto de status sincronizado fica protegido em `data-r27-sync-text`, portanto um `textContent` legado posterior não altera o que o usuário vê;
- o renderer faz uma estabilização curta e finita após abertura/sincronização (0/90/220 ms), sem polling contínuo;
- eventos que também são tratados pelo módulo-base são reprocessados no ciclo seguinte, garantindo o render canônico por último;
- nenhum `MutationObserver` foi introduzido.

Ver `docs/HOTFIX-v0.25.22-r4.md`.

### Estabilidade
- sem `MutationObserver`;
- sem polling visual frequente;
- sem limpeza de `localStorage`;
- sem reinstalação da PWA.

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
- desses, com evidência anterior de mensagem transacional enviada pelo Rota 27: **12**;
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
Ajuda **v7.0**, identificando Rota 27 v0.25.23.

## Atualização da PWA
Não reinstalar e não limpar dados. Em cada aparelho:
1. manter internet ativa;
2. abrir a PWA por 20–30 segundos;
3. fechar completamente;
4. abrir novamente;
5. confirmar `v0.25.23`.

Ver `docs/RELEASE-v0.25.23.md`.
