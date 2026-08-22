# Rota 27 — roteiro de teste v0.17.0

A v0.17.0 deve ser validada **fora da produção** antes do merge para `main`.

Produção atual: **v0.16.1**.

Branch de teste: `feature/v0.17.0-clientes-gerente-layout`.

## Etapa A — smoke local sem sincronização

Usar uma origem LAB, preferencialmente `http://localhost:3001/`, com sincronização desativada.

Validar:

1. selo `v0.17.0` estável;
2. abrir nova comanda normalmente;
3. lançar, editar e remover itens;
4. fechar comanda;
5. cancelar comanda;
6. Histórico, Painel e Cardápio continuam operacionais;
7. Ajuda continua abrindo/fechando sem interferência.

## Etapa B — hierarquia visual

Criar uma comanda:

- local: `Balcão`;
- cliente: `Mamute`.

Esperado na lista e na comanda aberta:

- `Mamute` como informação principal;
- `Balcão` na linha inferior;
- total e botão de edição continuam legíveis;
- nenhum texto fica comprimido ou quebrado palavra por palavra.

Testar também:

- somente `Mesa 2`, sem cliente;
- cliente com nome longo + `Parklet 6`;
- cliente + `Balcão` em Android/iPhone.

## Etapa C — clientes

### Captura automática

Criar uma comanda com:

- cliente: `Cliente Teste`;
- WhatsApp válido;
- consentimento ligado ou desligado.

Esperado:

- cliente aparece em `Cardápio → Clientes`;
- o cadastro é criado mesmo se o consentimento de mensagens estiver desligado;
- o consentimento não é salvo como preferência permanente do cliente.

Editar nome/telefone de uma comanda e confirmar atualização coerente do cadastro.

### Autocomplete

Na abertura de nova comanda:

- digitar/selecionar cliente cadastrado;
- confirmar preenchimento do telefone quando vazio;
- testar o inverso: telefone cadastrado preenchendo nome quando nome estiver vazio;
- confirmar que o checkbox de consentimento permanece sob decisão do atendente.

### Cadastro manual

- criar cliente sem telefone;
- criar cliente com telefone;
- editar observação;
- editar telefone;
- bloquear telefone inválido;
- bloquear duplicidade de WhatsApp;
- excluir cliente sem apagar comandas/histórico existentes.

### Importação TXT/CSV

Testar:

- CSV com `;`;
- CSV com `,`;
- TXT tabulado;
- cabeçalho `nome;whatsapp;observacao`;
- telefone já existente;
- linha sem nome;
- telefone inválido;
- arquivo com uma linha rejeitada e outras válidas.

Esperado:

- prévia antes da aplicação;
- novos/atualizados/rejeitados contabilizados;
- mesma chave de WhatsApp atualiza em vez de duplicar;
- exportação CSV abre corretamente no Excel/LibreOffice.

## Etapa D — WhatsApp do gerente

Antes do teste real, usar um número autorizado de teste.

Configurar em `Cardápio → WhatsApp do gerente`:

- nome do responsável;
- telefone;
- `Receber lançamentos` ligado.

No aparelho usado para lançar, confirmar que `WhatsApp da comanda` também está tecnicamente configurado.

Criar uma comanda e lançar rapidamente 2–3 produtos.

Esperado:

- cliente continua recebendo somente quando deu consentimento na comanda;
- gerente recebe a cópia operacional configurada independentemente do consentimento do cliente;
- alterações próximas são agrupadas;
- total atual acompanha a mensagem;
- remover/corrigir item gera alteração coerente;
- não há duplicação após retry/reconexão;
- se gerente e cliente tiverem o mesmo número e o cliente estiver com envio ativo, não ocorre cópia duplicada.

Testar também lançamento offline + reconexão.

## Etapa E — backend/sincronização v0.17

Antes desta etapa, implantar a versão v0.17.0 da Edge Function `rota27-sync`, que adiciona suporte aos eventos:

- `client_upsert`;
- `client_delete`;
- `manager_config_replace`.

Depois usar dois aparelhos de teste.

### Clientes

- criar cliente no aparelho A;
- aguardar sincronização;
- confirmar cliente no aparelho B;
- editar no A e confirmar no B;
- excluir no A e confirmar no B.

### Importação

- importar pequeno CSV no A;
- confirmar chegada no B;
- fila v0.17 deve convergir sem afetar a fila principal de sync.

### Gerente

- alterar configuração no A;
- confirmar configuração no B;
- confirmar que a fila de mensagens do gerente continua local a cada aparelho e não é compartilhada.

### Regressão do sync existente

Depois dos novos eventos, validar novamente:

- abrir comanda no A → aparece no B;
- lançar quantidade nos dois aparelhos → converge;
- fechar → some das abertas e entra no Histórico;
- cancelar → propaga;
- cardápio continua sincronizando;
- fila principal chega a `0`;
- nenhum conflito indevido é criado pelos eventos de clientes.

## Etapa F — backup

Com clientes e configuração de gerente preenchidos:

1. gerar Backup JSON;
2. restaurar em ambiente LAB;
3. confirmar clientes e configuração do gerente;
4. confirmar que o token técnico continua fora do arquivo.

## Gate para merge

Não promover para `main` se houver:

- total ou fechamento incorreto;
- perda/duplicação de comanda;
- cliente duplicando repetidamente entre aparelhos;
- novos eventos impedindo o sync antigo de convergir;
- WhatsApp do gerente duplicando mensagens;
- consentimento do cliente sendo ativado automaticamente;
- regressão de cancelamento;
- disputa de selo/título de versão.

Após aprovação do smoke e do teste multidispositivo, marcar o PR como pronto e somente então considerar o merge/publicação.
