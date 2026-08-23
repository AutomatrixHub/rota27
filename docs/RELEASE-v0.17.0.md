# Rota 27 — v0.17.0

Status: **em validação na branch `feature/v0.17.0-clientes-gerente-layout`**.

A produção permanece na **v0.16.1** até conclusão dos testes e autorização explícita para merge/publicação.

## Objetivo

A v0.17.0 concentra melhorias operacionais observadas antes do piloto real, sem alterar a identidade visual geral do aplicativo. A troca de cores e logo fica para uma atualização posterior.

## 1. Cadastro de clientes

A nova versão adiciona um cadastro compartilhado de clientes com:

- nome;
- WhatsApp;
- observação opcional;
- primeira e última ocorrência conhecidas;
- origem do cadastro (`comanda`, `manual` ou `import`).

### Captura automática

Quando uma comanda possui **nome do cliente + WhatsApp válido**, o cliente é criado ou atualizado automaticamente no cadastro.

O consentimento para receber mensagens **não é transformado em consentimento permanente do cadastro**. A autorização continua sendo definida em cada comanda.

### Autocomplete

Nos formulários **Nova comanda** e **Editar comanda**:

- ao escolher/digitar um cliente já cadastrado, o WhatsApp pode ser preenchido automaticamente quando o campo estiver vazio;
- ao informar um WhatsApp já cadastrado, o nome pode ser preenchido quando estiver vazio;
- o checkbox de consentimento de WhatsApp não é marcado automaticamente.

### Importação e exportação

O cadastro aceita TXT/CSV com:

- delimitador `;`, `,` ou tabulação;
- cabeçalhos equivalentes para nome, telefone/WhatsApp e observação;
- limite de 2 MB;
- até 3.000 linhas por importação;
- validação de WhatsApp;
- prévia com novos, atualizados e rejeitados;
- deduplicação prioritária por WhatsApp.

Também é possível exportar o cadastro atual para CSV.

## 2. Sincronização de clientes

Clientes e configuração do gerente usam eventos próprios no mesmo log remoto do `rota27-sync`:

- `client_upsert`;
- `client_delete`;
- `manager_config_replace`.

A camada v0.17 usa cursor e outbox próprios no aparelho para não interferir no mecanismo já validado de comandas, histórico e cardápio.

O `rota27-sync` da v0.17 precisa ser implantado antes de validar a sincronização multidispositivo desses novos dados.

Nenhuma alteração de tabela ou schema do banco é necessária: os novos eventos usam o log remoto já existente.

## 3. WhatsApp do gerente

Em **Cardápio** passa a existir a configuração **WhatsApp do gerente** com:

- nome do gerente/responsável;
- número de WhatsApp;
- opção `Receber lançamentos`.

Quando ativado, o aparelho que realiza um lançamento cria uma cópia agrupada para o gerente, preservando o envio opcional ao cliente.

Características:

- agrupamento de alterações próximas antes do envio;
- item adicionado, removido ou quantidade corrigida entra no mesmo mecanismo;
- total atual da comanda acompanha a mensagem;
- retry automático em falha/offline;
- eventId próprio e idempotente para reduzir risco de duplicidade;
- a fila do gerente permanece **local por aparelho**, assim como a fila do WhatsApp do cliente;
- se gerente e cliente tiverem o mesmo telefone e o cliente estiver com envio ativo, a cópia duplicada para o gerente é evitada.

O envio reutiliza a Edge Function `rota27-whatsapp` e os templates já aprovados. Não exige mudança no backend do WhatsApp.

**Importante:** o aparelho que lança o item precisa ter a integração do WhatsApp configurada para enviar a cópia ao gerente.

## 4. Hierarquia visual da comanda

A identificação foi refinada para facilitar leitura em celular:

- nome do cliente passa a ser o destaque principal;
- mesa/local (`Balcão`, `Mesa`, `Parklet`) fica na linha abaixo quando há cliente;
- se não houver cliente, a localização continua como título principal;
- o mesmo princípio é aplicado à lista de comandas e ao cabeçalho da comanda aberta.

Exemplo:

`Mamute`

`Balcão`

em vez de `Balcão • Mamute`.

## 5. Backup

O backup JSON existente já serializa o objeto `state` completo. Assim, `clients` e `managerWhatsapp` passam a ser incluídos automaticamente nos backups/restaurações, mantendo a regra atual de não exportar o token do dispositivo.

## 6. PWA / versão

- versão candidata: `0.17.0`;
- novo cache: `rota27-comandas-v0.17.0`;
- protetor final: `assets/v017-final.js`;
- `assets/v0161-final.js` deixa de ser carregado ativamente nesta versão para evitar disputa de observadores.

## Fora do escopo

Não faz parte da v0.17.0:

- mudança de logo;
- nova paleta de cores;
- redesign global;
- novo backend de WhatsApp;
- fechamento/cancelamento enviado ao gerente;
- CRM completo ou campanhas de marketing.

Esses itens devem ser avaliados em versões posteriores.
