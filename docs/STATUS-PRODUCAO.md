# Rota 27 — Status de produção

Última revisão: 30/08/2026

## Produção
- versão: **v0.25.78 — Bordas vermelhas refinadas no Cardápio**;
- branch: `main`;
- GitHub Pages: `https://automatrixhub.github.io/rota27/`;
- Service Worker: `rota27-comandas-v0.25.78-r1`;
- baseline anterior: **v0.25.77**, PR #113, merge `e7bba0fc7a91bfe6de08e9fbb53aaaad56ec6522`.

## Refinamento visual do Cardápio — v0.25.78
Após comparação direta entre a proposta visual aprovada e a tela v0.25.77 em produção:
- o acento vertical dos cards passa de gradiente alaranjado para vermelho-terra sólido `#da693d`;
- o contorno do botão **Editar** passa a usar a mesma referência `#da693d`;
- o layout Opção B permanece inalterado;
- dimensões, altura, nome, preço, categoria, status e responsividade permanecem iguais à v0.25.77.

A correção é exclusivamente CSS, sem JavaScript novo e sem alteração funcional.

## Cardápio — Opção B aprovada — v0.25.77
A lista administrativa de produtos foi redesenhada sem alterar a lógica do Cardápio:
- ícones dos produtos ocultados integralmente na tela **Cardápio**;
- cada card passa de três colunas para duas áreas: conteúdo à esquerda e preço/ação à direita;
- barra vertical de destaque cria a hierarquia visual aprovada sem desperdiçar largura;
- nome permanece como elemento principal;
- categoria e status permanecem na segunda linha;
- preço recebe pill suave terracota;
- botão **Editar** fica abaixo do preço;
- cards mantêm altura compacta e responsividade em telas estreitas;
- produtos inativos preservam diferenciação visual própria.

A implementação é exclusivamente CSS, carregada depois das camadas antigas de ícones. Nenhum JavaScript novo foi necessário; os elementos de ícone existentes continuam no DOM apenas por compatibilidade e ficam `display:none` no `#screenMenu`.

## Correções de UX — v0.25.76
### Editar comanda sem foco automático
A abertura da tela **Editar comanda** passa a neutralizar o foco inicial exatamente como já ocorre na **Nova comanda**:
- nenhum campo recebe foco automaticamente ao abrir;
- teclado virtual não deve abrir sozinho;
- `autofocus` dentro do modal é removido;
- foco inicial dentro da área de edição é removido imediatamente, em microtask e no próximo frame;
- depois da abertura, o operador pode tocar e editar qualquer campo normalmente.

A implementação é finita e idempotente, sem `MutationObserver` e sem polling.

### Preço dos produtos
Nos cards de produtos da tela de lançamento, o preço volta para vermelho/terracota `#d85f2c`, preservando integralmente a compactação da v0.25.75, os cards sem ícones, o texto aumentado em 1px e o badge no canto inferior direito.

## Refinamento do lançamento de produtos — v0.25.75
A tela de lançamento foi compactada para reduzir rolagem sem perder legibilidade:
- ícones dos produtos removidos somente dos cards de lançamento da comanda;
- descrição dos produtos aumentada de 14px para 15px;
- badge de quantidade já lançada movida para o canto inferior direito;
- cards normais reduzidos para 96px de altura mínima, com ajuste adicional em telas estreitas;
- `Mais usados hoje/recentemente` mantém Top 3, ganha texto maior e contraste discreto em borda/fundo;
- cards do Top 3 usam a mesma referência de altura dos cards normais compactos.

## Editar comanda — v0.25.75
O botão de edição no cabeçalho da comanda deixa de ser apenas um lápis discreto e passa a exibir **Editar comanda** em um botão laranja de maior contraste. A ação continua chamando o fluxo existente `openEditCommandSheet()`; não há mudança de dados ou regra de negócio.

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

A v0.25.78 **não altera Edge Functions**, schemas ou tabelas. É uma release estritamente de UI/CSS do Cardápio.

## Preservação
- nenhuma migration;
- nenhuma Edge Function alterada;
- nenhum reset ou exclusão de dados;
- preços, produtos, estoque, comandas, clientes, recebíveis e histórico preservados;
- Lista e Mapa de comandas preservados;
- sem polling contínuo e sem `MutationObserver` novo.

## Atualização PWA
- shell declara `rota27-release-version=0.25.78`;
- `v02577-menu-option-b.css` é carregado com revisão `02578r1` pelo shell e pelo roadmap loader;
- cache `rota27-comandas-v0.25.78-r1`;
- não limpar `localStorage` de produção.

## Regras de operação
- não reinstalar PWA como atualização normal;
- não resetar Supabase;
- Sandbox não envia WhatsApp real nem sincroniza produção;
- mudanças usam branch curta + PR + merge + confirmação do Pages.

## Rollback
Baseline anterior: **v0.25.77** / PR #113 / merge `e7bba0fc7a91bfe6de08e9fbb53aaaad56ec6522`.
