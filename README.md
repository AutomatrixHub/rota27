# Rota 27 Bodega — Comandas

Aplicativo mobile-first, offline-first e multidispositivo para controle rápido de comandas da **Rota 27 Bodega**.

## Produção

**Versão: v0.25.0 — Clientes & Fidelização**  
Branch: `main`  
GitHub Pages: `https://automatrixhub.github.io/rota27/`  
Service Worker: `rota27-comandas-v0.25.0-r3`

A v0.25.0 preserva Comandas, Estoque Essencial, Compras & Reposição, Inventário & Conferência e Custos & Margem e acrescenta uma camada leve de **Relacionamento & Fidelização**, sem transformar o produto em CRM ou plataforma de marketing.

## Recursos principais

### Comandas
- abertura rápida por balcão, mesa, parklet e cliente;
- lançamento por toque, busca, categorias e Mais lançados;
- edição de itens, fechamento, pagamento e cancelamento seguro;
- proteção contra duplicidade acidental.

### Estoque Essencial
Acesso em `Painel → Estoque Essencial`.

- controle opcional por produto;
- estoque inicial e mínimo;
- Estoque, Comprometido e Disponível projetado;
- baixa definitiva no fechamento da comanda;
- Entrada, Perda, Consumo interno e Ajuste;
- integração com Compras & Reposição, Inventário e Custos & Margem;
- histórico, CSV, operação offline e multidispositivo.

### Compras, Inventário e Custos
Permanecem preservados da v0.24.0:
- fornecedores e pedidos;
- edição de rascunho;
- recebimento parcial/total;
- inventário com snapshot e ajuste idempotente;
- custo previsto e real;
- frete e custo efetivo;
- histórico de custos;
- margem bruta estimada;
- valor estimado de estoque somente quando existe custo real conhecido.

Regra financeira preservada: **preço de venda nunca substitui custo de aquisição**.

### Clientes & Fidelização — v0.25.0
Acesso em `Cardápio/Menu → Clientes → Relacionamento & Fidelização`.

A Central possui:
- `Visão geral`;
- `Clientes`;
- `Para lembrar`.

Para cada cliente, quando existe histórico suficiente, o sistema deriva:
- número de visitas;
- total identificado;
- ticket médio;
- itens;
- primeira e última visita;
- ritmo médio de retorno;
- produtos e categorias preferidos;
- últimas compras.

Classificação automática:
- **Novo:** 0–1 visita;
- **Recorrente:** 2–4 visitas;
- **Frequente:** 5–9 visitas;
- **Cliente da casa:** 10+ visitas;
- **Sumido:** 2+ visitas e 30+ dias sem retorno.

`Para lembrar` reúne sinais com ação clara:
- cliente recorrente há 30+ dias sem voltar;
- marco recente de 5 ou 10 visitas;
- cliente frequente ainda sem WhatsApp cadastrado;
- oportunidade `Preferido chegou recentemente` quando existe evidência real.

### Preferido chegou recentemente
A v0.25 cruza dados já existentes de clientes, histórico, recebimentos e estoque.

A oportunidade só aparece quando:
1. cliente tem 2+ visitas;
2. possui WhatsApp;
3. o produto recebido é seu primeiro preferido calculado;
4. houve recebimento positivo nos últimos 7 dias;
5. o Estoque Essencial está ativo no produto;
6. existe disponibilidade atual maior que zero;
7. o cliente ainda não voltou depois do recebimento.

Se o estoque zerar ou o cliente voltar após o recebimento, a oportunidade desaparece.

### WhatsApp de relacionamento
O Rota 27 somente monta um rascunho contextual e abre o WhatsApp por ação do proprietário.

Não existe na v0.25:
- envio automático;
- disparo em massa;
- campanha automática;
- desconto/brinde inventado;
- pontos, cashback ou milhas;
- CRM, lead, funil ou pipeline.

### Modo demonstração seguro
Na candidata/testes pode ser usado `?preview=v0250` para visualizar cenários raros sem adulterar a base real.

Os dados demonstrativos existem somente em memória, não são gravados nem sincronizados, e não abrem WhatsApp real.

### Fechamento do Turno, Auditoria e Visão Gerencial
Permanecem preservados, incluindo snapshots de fechamento, histórico, comparações, produtos, pagamentos e CSV.

## Sincronização e offline
O Rota 27 permanece local-first e continua operando sem internet.

A v0.25 **não cria novo tipo de evento, tabela, migration ou Edge Function**. As métricas de relacionamento são derivadas dos dados que já sincronizam:
- clientes;
- histórico de comandas;
- catálogo/itemMeta;
- recebimentos;
- estoque.

Quando essas fontes convergem entre aparelhos, a fidelização converge por cálculo local.

## Backend Supabase
Projeto: `owkvwsiblbzlpxjwybrt`

- `rota27-sync`: **versão 7 ACTIVE** (`rota27-sync-v0.23.0`);
- `rota27-audit`: versão 1 ACTIVE;
- `rota27-whatsapp`: versão 23 ACTIVE (`rota27-whatsapp-v6-mini2`);
- `rota27-whatsapp-inbound`: versão 1 ACTIVE.

Permanece aplicada a migration de segurança de schema da v0.23:
`20260825012842_expand_rota27_sync_event_types_v023`.

## Validação da v0.25.0
A candidata foi aprovada em desktop, celular e A→B em 25/08/2026.

Foram validados:
- Central de Relacionamento & Fidelização;
- níveis e sinal Sumido;
- ritmo médio e Leitura do momento;
- preferências;
- marcos de 5/10 visitas;
- cadastro a completar;
- perfil/histórico do cliente;
- WhatsApp exclusivamente manual;
- preview seguro;
- `Preferido chegou recentemente`;
- convergência dos dados A→B;
- ausência de regressão P0/P1 relatada no gate.

Baseline de rollback: **v0.24.0 — Custos & Margem**.

## Estabilidade
Preservar a regra consolidada desde a v0.21: não adicionar polling visual frequente nem `MutationObserver` concorrente ao Painel.

As novas camadas da v0.25 não introduzem `setInterval` nem `MutationObserver`.

## Tema e Ajuda
- operação em laranja, preto e creme/marfim;
- verde/amarelo/vermelho reservados a estados funcionais;
- Ajuda **v5.1** inclui Relacionamento & Fidelização e `Preferido chegou recentemente`.

## Atualização da PWA
Quem já possui o Rota 27 instalado não precisa reinstalar:
1. manter internet ativa;
2. abrir a PWA e aguardar 10–20 segundos;
3. fechar completamente;
4. abrir novamente;
5. confirmar `v0.25.0` e sincronização saudável.

**Não limpar dados do navegador e não remover a PWA para atualizar.**

## Próxima etapa
Aprofundamento de estoque/giro fica deliberadamente adiado. Após uso real da v0.25, a próxima evolução de relacionamento deve ser escolhida apenas se trouxer ação simples e benefício claro ao proprietário.

## Documentos principais
- `docs/RELEASE-v0.25.0.md`
- `docs/STATUS-PRODUCAO.md`
- `docs/VALIDACAO-v0.25.0.md`
- `docs/TESTE-v0.25.0.md`
- `docs/ESPEC-v0.25.0.md`
- `docs/HANDOFF-CONTEXTO-v0.25.0.md`
- `docs/INCREMENTO-v0.25.0-R3.md`
- `docs/PRODUCT-PRINCIPLES.md`

## Versão
Produção: **0.25.0**
