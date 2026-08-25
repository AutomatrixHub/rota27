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
- `Para lembrar` soma clientes Sumidos + marcos recentes de 5/10 visitas;
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
- aparece em `Para lembrar → Faz tempo que não vem`;
- motivo informa dias sem voltar + visitas + preferência quando conhecida.

Cliente com 1 visita antiga NÃO entra em Para lembrar nesta versão.

---

## F — marcos de relacionamento
Testar cliente que acabou de atingir exatamente:
- 5 visitas; ou
- 10 visitas;
- com última visita há no máximo 14 dias.

Esperado:
- aparece em `Para lembrar → Marcos recentes`;
- a linha explica `marco de 5 visitas` ou `marco de 10 visitas`;
- ação principal é `Agradecer` quando existe WhatsApp;
- nenhuma recompensa/desconto é criada automaticamente.

Cliente com 6 ou 11 visitas não permanece indefinidamente como marco pendente.

---

## G — cadastro a completar
Cliente precisa ter:
- 5 ou mais visitas;
- nenhum WhatsApp cadastrado.

Esperado:
- aparece em `Para lembrar → Cadastro a completar`;
- é tratado como conveniência, não alerta crítico;
- botão `Cadastrar WhatsApp` reutiliza o editor existente;
- não tenta abrir URL de WhatsApp inválida.

---

## H — perfil do cliente
Abrir `Ver perfil`.

Esperado:
- nome/WhatsApp corretos;
- visitas;
- total identificado;
- ticket médio;
- itens;
- primeira/última visita;
- ritmo de visitas;
- leitura do momento;
- até 5 produtos preferidos;
- categorias preferidas quando o dado existir;
- observação já cadastrada;
- últimas visitas com itens e total.

Produto sem categoria conhecida deve continuar aparecendo sem categoria inventada.

### H1. Ritmo
Com pelo menos duas visitas, conferir o intervalo médio aproximado.

Esperado:
- até 7 dias → `Quase semanal`;
- 8–15 → `A cada 1–2 semanas`;
- 16–31 → `Quase mensal`;
- acima de 31 → `Mais espaçado`;
- com menos de 2 visitas → `Sem base`.

Ritmo é leitura histórica, não previsão garantida.

### H2. Leitura do momento
Prioridade esperada:
1. Sumido;
2. marco recente de 5/10 visitas;
3. ritmo médio;
4. histórico insuficiente.

---

## I — preferências
Escolher cliente com mais de uma compra.

Esperado:
- produto preferido é o de maior quantidade acumulada;
- desempate usa valor identificado;
- histórico antigo permanece intacto;
- alterar catálogo atual não deve reescrever comandas históricas que possuam `itemMeta` próprio.

---

## J — cadastro existente
No perfil tocar `Abrir cadastro do cliente`.

Esperado:
- Central fecha;
- tela Clientes existente abre;
- cliente correto é localizado;
- editor antigo é reutilizado;
- salvar observação/nome/telefone continua usando o fluxo existente e seu sync atual.

---

## K — WhatsApp manual
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

## L — cliente sem WhatsApp
Esperado:
- perfil funciona normalmente;
- contato manual informa que é necessário cadastrar WhatsApp;
- nenhuma URL inválida é aberta.

---

## M — modo demonstração seguro
Abrir:
`http://localhost:8000/?preview=v0250`

Depois ir a `Clientes → Relacionamento & Fidelização`.

Esperado:
- banner `Modo demonstração de fidelização`;
- aparecem clientes fictícios suficientes para validar Sumido, 5 visitas, 10 visitas e cadastro sem WhatsApp;
- os dados reais não aparecem misturados na amostra;
- nenhum dado fictício entra em `localStorage`;
- nenhum dado é sincronizado;
- `Abrir cadastro` de cliente fictício apenas informa que a amostra não é editável;
- ação de WhatsApp mostra a mensagem sugerida em tela e NÃO abre número real.

Remover `?preview=v0250` e recarregar.

Esperado:
- base real volta imediatamente;
- nenhum cliente fictício permanece.

---

## N — mobile
Validar em aparelho real:
- Central ocupa a tela sem rolagem horizontal;
- abas legíveis;
- KPIs em duas colunas quando necessário;
- cards e perfil confortáveis para toque;
- leitura do momento não estoura largura;
- três blocos de Para lembrar continuam legíveis;
- botões de WhatsApp não ficam espremidos;
- retorno ao cadastro funciona.

---

## O — offline
Desconectar internet e abrir a Central.

Esperado:
- métricas continuam calculadas com a base local;
- filtros/perfil/preferências/ritmo funcionam;
- não existe erro por ausência de backend;
- WhatsApp naturalmente depende do navegador/conectividade, mas nenhum dado é perdido.

---

## P — multidispositivo
A v0.25 não cria dado de fidelização separado; as métricas são derivadas.

Após sincronizar A e B, esperado:
- mesmo cadastro e histórico → mesmas visitas, totais, níveis, preferências, ritmo e sinais;
- uma nova comanda fechada identificada no A, depois de sincronizada, altera as métricas no B sem evento novo de fidelização.

Não há migration, tabela ou tipo de evento novo para este teste.

---

## Q — estabilidade estrutural
Esperado na camada v0.25:
- nenhum `setInterval` novo;
- nenhum `MutationObserver` novo;
- nenhuma fila automática de marketing;
- renderização sob demanda e por eventos existentes.

---

## R — regressão crítica
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
- marcos 5/10 coerentes;
- ritmo coerente;
- preview comprovadamente não persistente;
- WhatsApp comprovadamente manual;
- desktop/mobile aprovados;
- nenhuma regressão P0/P1.

## Gate de produção
Somente promover após:
- gate local aprovado;
- convergência A→B observada;
- documentação final atualizada;
- autorização explícita de merge.
