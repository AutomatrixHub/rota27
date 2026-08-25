# Rota 27 v0.25.0 — Plano de teste da candidata

## Estado
**CANDIDATA — NÃO PUBLICADA EM PRODUÇÃO.**

Produção preservada: **v0.24.0 — Custos & Margem**.

PR: **#31 — Rota 27 v0.25.0 — Clientes & Fidelização**.

## Objetivo
Validar que a nova camada ajuda o proprietário a reconhecer clientes e decidir contatos úteis sem criar CRM pesado, dados inventados ou envio automático.

---

## A — carregamento e acesso
### A1. Abrir candidata
Esperado:
- versão visível `v0.25.0` e estável;
- Painel sem cintilação/travamento;
- fluxos anteriores preservados.

### A2. Acesso
Ir a `Cardápio/Menu → Clientes`.

Esperado:
- aparece o bloco `Relacionamento & Fidelização`;
- botão `Abrir` abre a Central;
- cadastro/importação/exportação de clientes antigos continuam disponíveis.

---

## B — visão geral
Esperado:
- indicadores Clientes, Recorrentes, Frequentes, Clientes da casa e Para lembrar;
- `Quem mais volta` ordenado pela quantidade de visitas;
- clientes sem compra identificada não recebem visita/valor inventado;
- explicação dos níveis é curta e compreensível.

## C — associação segura
### C1. Cliente com WhatsApp
Escolher cliente com histórico ligado ao mesmo telefone.

Esperado:
- somente comandas com o mesmo WhatsApp entram nas métricas.

### C2. Cliente sem WhatsApp
Esperado:
- fallback por nome funciona apenas para comandas também sem WhatsApp;
- não misturar uma comanda com telefone de outra pessoa apenas porque o nome é igual.

---

## D — níveis de fidelização
Validar exemplos disponíveis na base:
- 0–1 visita → Novo;
- 2–4 → Recorrente;
- 5–9 → Frequente;
- 10+ → Cliente da casa.

Os níveis não exigem cadastro manual.

---

## E — cliente sumido
Cliente precisa ter:
- pelo menos 2 visitas;
- 30 dias ou mais desde a última visita.

Esperado:
- recebe chip `Sumido`;
- continua exibindo também o nível de recorrência;
- aparece em `Para lembrar`;
- motivo informa dias sem voltar + visitas + preferência quando conhecida.

Cliente com 1 visita antiga NÃO entra em Para lembrar nesta versão.

---

## F — perfil do cliente
Abrir `Ver perfil`.

Esperado:
- nome/WhatsApp corretos;
- visitas;
- total identificado;
- ticket médio;
- itens;
- primeira/última visita;
- até 5 produtos preferidos;
- categorias preferidas quando o dado existir;
- observação já cadastrada;
- últimas visitas com itens e total.

Produto sem categoria conhecida deve continuar aparecendo sem categoria inventada.

---

## G — preferências
Escolher cliente com mais de uma compra.

Esperado:
- produto preferido é o de maior quantidade acumulada;
- desempate usa valor identificado;
- histórico antigo permanece intacto;
- alterar catálogo atual não deve reescrever comandas históricas que possuam `itemMeta` próprio.

---

## H — cadastro existente
No perfil tocar `Abrir cadastro do cliente`.

Esperado:
- Central fecha;
- tela Clientes existente abre;
- cliente correto é localizado;
- editor antigo é reutilizado;
- salvar observação/nome/telefone continua usando o fluxo existente e seu sync atual.

---

## I — WhatsApp manual
No perfil de cliente com WhatsApp, testar:
- `Faz tempo que não vem`;
- `Agradecer frequência`;
- `Contar novidades`.

Esperado:
- WhatsApp abre com rascunho preenchido;
- nenhum envio ocorre sozinho;
- texto pode ser editado antes de enviar;
- fechar sem enviar não altera o Rota 27;
- não existe botão de enviar para todos/campanha em massa;
- nenhuma promessa de desconto/brinde é inventada.

## J — cliente sem WhatsApp
Esperado:
- perfil funciona normalmente;
- contato manual informa que é necessário cadastrar WhatsApp;
- nenhuma URL inválida é aberta.

---

## K — mobile
Validar em aparelho real:
- Central ocupa a tela sem rolagem horizontal;
- abas legíveis;
- KPIs em duas colunas quando necessário;
- cards e perfil confortáveis para toque;
- botões de WhatsApp não ficam espremidos;
- retorno ao cadastro funciona.

---

## L — offline
Desconectar internet e abrir a Central.

Esperado:
- métricas continuam calculadas com a base local;
- filtros/perfil/preferências funcionam;
- não existe erro por ausência de backend;
- WhatsApp naturalmente depende do navegador/conectividade, mas nenhum dado é perdido.

---

## M — multidispositivo
A v0.25 não cria dado de fidelização separado; as métricas são derivadas.

Após sincronizar A e B, esperado:
- mesmo cadastro e histórico → mesmas visitas, totais, níveis e preferências;
- uma nova comanda fechada identificada no A, depois de sincronizada, altera as métricas no B sem evento novo de fidelização.

Não há migration, tabela ou tipo de evento novo para este teste.

---

## N — regressão crítica
Validar que continuam funcionando:
- abrir/editar/fechar/cancelar comandas;
- autocomplete de clientes;
- edição/importação/exportação de clientes;
- WhatsApp transacional da comanda;
- WhatsApp do gerente;
- sincronização multidispositivo;
- Estoque Essencial;
- Compras & Reposição;
- Inventário & Conferência;
- Custos & Margem;
- Fechamento do Turno;
- Visão Gerencial.

## Gate local
Avançar somente se:
- acesso e UI aprovados;
- métricas coerentes;
- preferências coerentes;
- `Sumido` coerente;
- WhatsApp comprovadamente manual;
- desktop/mobile aprovados;
- nenhuma regressão P0/P1.

## Gate de produção
Somente promover após:
- gate local aprovado;
- convergência A→B observada;
- documentação final atualizada;
- autorização explícita de merge.
