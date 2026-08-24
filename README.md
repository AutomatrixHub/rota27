# Rota 27 Bodega — Comandas

Aplicativo mobile-first, offline-first e multidispositivo para controle rápido de comandas da **Rota 27 Bodega**.

## Produção

**Versão: v0.18.3**  
Branch: `main`  
GitHub Pages: `https://automatrixhub.github.io/rota27/`  
Service Worker: `rota27-comandas-v0.18.3`

A v0.18.3 preserva toda a operação validada da v0.18.1 e consolida a identidade oficial do produto com o **Tema Operação Rota 27**, refinamento visual dos cards, ordem de navegação `Comandas → Cardápio → Painel → Histórico`, logo ajustado e **Ajuda v4.2 com Tema Capixaba**.

## Recursos principais

### Comandas
- abertura por Balcão, Mesa 1–5, Parklet 1–6 e nome do cliente;
- lançamento rápido por toque, busca, categorias e Mais lançados;
- consulta `Ver itens`, correção em `Editar itens`, fechamento com forma de pagamento e cancelamento seguro;
- proteção contra duplicidade acidental;
- nome do cliente como informação principal e local/mesa como informação secundária quando houver cliente;
- cards com identidade visual oficial em laranja, preto e creme.

### Resumo do Turno e Auditoria
Na tela Histórico:
- faturamento fechado hoje;
- comandas fechadas e abertas;
- valor em aberto;
- ticket médio;
- itens vendidos;
- produtos mais vendidos;
- formas de pagamento;
- cancelamentos do turno;
- botão **Ver auditoria** com linha do tempo de abertura, fechamento, cancelamento, adição/remoção de itens e alterações de cliente/local.

A auditoria funciona localmente offline e pode ser reconciliada com os eventos compartilhados pela Edge Function somente leitura `rota27-audit`.

### Clientes
- cadastro manual;
- criação/captura automática quando uma comanda contém nome + WhatsApp válido;
- importação TXT/CSV com prévia e validação;
- exportação CSV;
- autocomplete de nome/telefone;
- cadastro sincronizado entre aparelhos.

### WhatsApp
- envio opcional ao cliente mediante consentimento;
- templates UTILITY `atualizacao_comanda_rota27_mini2_1` a `_5`;
- envio incremental e agrupado;
- outbox local por aparelho com retry e idempotência;
- configuração sincronizada do WhatsApp do gerente;
- respostas dos clientes encaminhadas ao gerente pelo template `resposta_cliente_rota27_gerente_v1`;
- webhook inbound com correlação por `context.id`, idempotência e bloqueio de loop.

### Sincronização e offline
- gravação local-first;
- sincronização multidispositivo de comandas, histórico, cardápio, categorias, clientes e configuração do gerente;
- `item_delta` para preservar lançamentos concorrentes;
- outbox/cursor/log remoto idempotente;
- operação local continua disponível sem internet;
- filas de WhatsApp nunca são sincronizadas entre aparelhos.

## Tema oficial da marca

### Tema Operação Rota 27
Tema padrão da aplicação:
- laranja da marca para ação e destaque;
- preto para títulos, valores e hierarquia;
- creme/marfim para fundos e superfícies;
- verde/amarelo/vermelho reservados para estados funcionais.

### Ajuda v4.2 — Tema Capixaba
A seção `Ajuda` usa azul, branco e rosa inspirados na identidade capixaba, mantendo leitura e contraste. Inclui:
- Primeiros 3 minutos;
- mapa rápido do aplicativo;
- abrir, lançar, conferir, editar, fechar e cancelar;
- clientes e importação/exportação;
- WhatsApp do cliente e gerente;
- respostas dos clientes;
- Resumo do Turno;
- Auditoria operacional;
- sincronização, offline, backup/restauração e atualização da PWA;
- busca, atalhos e seção de problemas comuns.

No celular, a Ajuda usa viewport dinâmico para permanecer integralmente visível e não ficar sobreposta pela barra do navegador.

## Backend Supabase

Projeto: `owkvwsiblbzlpxjwybrt`

- `rota27-sync`: sincronização multidispositivo;
- `rota27-audit`: consulta somente leitura da trilha operacional;
- `rota27-whatsapp`: envio de templates;
- `rota27-whatsapp-inbound`: callback público das respostas;
- `whatsapp_message_log`: auditoria/idempotência outbound;
- `rota27_whatsapp_inbound`: auditoria/idempotência inbound.

## Atualização da PWA

Quem já possui o Rota 27 instalado **não precisa reinstalar**:
1. conectar à internet;
2. abrir a PWA e aguardar cerca de 10–20 segundos;
3. fechar completamente;
4. abrir novamente;
5. confirmar `v0.18.3` e sincronização saudável.

Não limpar dados do navegador e não remover a PWA para atualizar.

## Segurança

- nenhum token/App Secret é versionado;
- credenciais reais não devem ser gravadas no GitHub;
- o fluxo de operação continua local-first;
- nenhuma migração destrutiva foi necessária para a v0.18.3.

## Documentos principais

- `docs/RELEASE-v0.18.3.md`
- `docs/STATUS-PRODUCAO.md`
- `docs/TESTE-v0.18.3.md`
- `docs/MARCA-TEMA-v0.18.2.md`
- `docs/PILOTO-REAL-v0.17.1.md`
- `docs/PRODUCT-PRINCIPLES.md`
- `docs/V0.15-MULTIDEVICE.md`

## Versão

Produção: **0.18.3**
