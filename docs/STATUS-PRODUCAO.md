# Rota 27 — Status de produção

Última revisão: 25/08/2026

## Produção
- versão: **v0.25.0 — Clientes & Fidelização**;
- branch: `main`;
- GitHub Pages: `https://automatrixhub.github.io/rota27/`;
- Service Worker: `rota27-comandas-v0.25.0-r3`;
- `rota27-whatsapp`: versão 23 ACTIVE (`rota27-whatsapp-v6-mini2`);
- `rota27-sync`: **versão 7 ACTIVE** (`rota27-sync-v0.23.0`);
- `rota27-whatsapp-inbound`: versão 1 ACTIVE;
- `rota27-audit`: versão 1 ACTIVE, somente leitura.

A v0.25.0 preserva a baseline funcional da v0.24.0 e acrescenta **Clientes & Fidelização** com inteligência derivada dos dados já existentes, sem CRM pesado e sem automação de marketing.

Baseline de rollback: **v0.24.0 — Custos & Margem**.

## Validação da v0.25.0
Em 25/08/2026 a candidata foi testada e aprovada localmente e em dois aparelhos com sincronização A→B.

Confirmações do proprietário:
- `Perfeito. Testado e aprovado.`;
- `Dados totalmente sincronizados. A -> B passou. Pode publicar. APROVADO.`

Foram validados:
- identidade visual v0.25.0;
- Central `Relacionamento & Fidelização`;
- Visão geral / Clientes / Para lembrar;
- níveis Novo / Recorrente / Frequente / Cliente da casa;
- sinal Sumido;
- ritmo médio e Leitura do momento;
- produtos e categorias preferidos;
- marcos recentes de 5/10 visitas;
- cadastro frequente sem WhatsApp;
- perfil e histórico do cliente;
- WhatsApp contextual apenas manual;
- modo demonstração seguro `?preview=v0250`;
- oportunidade R3 `Preferido chegou recentemente`;
- desktop/mobile;
- convergência A→B;
- nenhuma regressão P0/P1 relatada no gate.

## Clientes & Fidelização
Acesso em `Cardápio/Menu → Clientes → Relacionamento & Fidelização`.

Métricas derivadas por cliente:
- visitas;
- total identificado;
- ticket médio;
- itens;
- primeira/última visita;
- ritmo médio entre visitas;
- produtos/categorias preferidos.

Classificação automática:
- Novo: 0–1 visita;
- Recorrente: 2–4 visitas;
- Frequente: 5–9 visitas;
- Cliente da casa: 10+ visitas;
- Sumido: 2+ visitas e 30+ dias sem retorno.

Não há pontos, cashback, cupom automático, recompensa obrigatória ou configuração de fidelidade pelo atendente.

## Para lembrar
Sinais disponíveis:
- cliente recorrente há 30+ dias sem voltar;
- marco recente de 5 ou 10 visitas;
- cliente frequente ainda sem WhatsApp;
- `Preferido chegou recentemente`.

Cada sinal deve ter motivo claro e ação simples. Nenhum deles gera envio automático.

## Preferido chegou recentemente
A oportunidade só aparece quando TODOS os critérios forem verdadeiros:
1. cliente com 2+ visitas;
2. WhatsApp cadastrado;
3. produto é o primeiro preferido calculado;
4. recebimento positivo nos últimos 7 dias;
5. Estoque Essencial ativo;
6. disponibilidade atual maior que zero;
7. cliente ainda não voltou depois do recebimento.

Proteções:
- estoque zero remove a oportunidade;
- nova visita após o recebimento remove a oportunidade;
- produto sem controle de estoque não gera afirmação de disponibilidade;
- contato sempre manual;
- nenhum disparo em massa;
- nenhuma promessa automática de desconto/brinde.

## WhatsApp de relacionamento
A v0.25 usa `wa.me` apenas para abrir um rascunho contextual por ação do proprietário.

O Rota 27 não envia automaticamente mensagens comerciais e não cria campanha em massa.

O WhatsApp transacional existente da operação permanece preservado.

## Modo demonstração seguro
`?preview=v0250` cria apenas em memória exemplos de:
- cliente Sumido;
- marco de 5 visitas;
- marco de 10 visitas;
- cliente frequente sem WhatsApp;
- oportunidade `Preferido chegou recentemente`.

Os dados de preview não são persistidos nem sincronizados, e o WhatsApp real não é aberto para clientes fictícios.

## Backend e sincronização
A v0.25 **não exige nova Edge Function, evento, tabela ou migration**.

As informações de fidelização são derivadas de fontes já existentes e sincronizadas:
- clientes;
- histórico de comandas;
- catálogo/itemMeta;
- recebimentos de Compras & Reposição;
- estoque.

A Edge Function `rota27-sync` permanece na **versão 7 ACTIVE**, `EDGE_VERSION = rota27-sync-v0.23.0`, `verify_jwt=false`, com autenticação própria por `x-rota27-device-token`.

Permanece aplicada a migration:
`20260825012842_expand_rota27_sync_event_types_v023`.

## Módulos preservados
Continuam válidos os fluxos de:
- Comandas;
- cadastro de Clientes;
- WhatsApp transacional/inbound;
- Fechamento do Turno;
- Auditoria;
- Visão Gerencial;
- Estoque Essencial;
- Compras & Reposição;
- Inventário & Conferência;
- Custos & Margem.

A regra financeira da v0.24 permanece: **custo nunca é inferido do preço de venda**.

## Estabilidade do Painel
Preservar:
- sem polling visual frequente novo;
- sem `MutationObserver` concorrente;
- preferir eventos existentes e renderização sob demanda.

As novas camadas da v0.25 não adicionam `setInterval` nem `MutationObserver`.

## Ajuda v5.1
Inclui:
- Clientes & Fidelização;
- níveis e Sumido;
- ritmo;
- preferências;
- marcos;
- WhatsApp manual;
- preview seguro;
- `Preferido chegou recentemente`.

## Atualização da PWA
Não reinstalar e não limpar dados:
1. manter internet ativa;
2. abrir a PWA por 10–20 segundos;
3. fechar completamente;
4. abrir novamente;
5. confirmar `v0.25.0` e sincronização saudável.

## Segurança
- nenhum token/App Secret versionado;
- nenhuma migration nova na v0.25;
- operação local-first preservada;
- nenhum disparo de marketing automático;
- nenhuma campanha em massa;
- outbox transacional do WhatsApp permanece local por aparelho.

## Próxima etapa
Gestão avançada de estoque/giro permanece adiada. A próxima evolução deve nascer do uso real da v0.25 e continuar respeitando a regra de simplicidade operacional.

Ver `docs/RELEASE-v0.25.0.md`.
