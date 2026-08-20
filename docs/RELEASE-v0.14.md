# Rota 27 v0.14 — Release final

## Status

Pacote final preparado na branch `release/v0.14-final` a partir da RC.2 validada manualmente.

**Ainda não publicar/mesclar na `main` antes do smoke test da entrada final `index.html`.**

## Base de validação

A regressão manual das candidatas aprovou:

- criação, edição e fechamento de comandas;
- forma de pagamento;
- Histórico & resultados;
- filtros, busca, métricas e rankings;
- exportação de vendas CSV;
- backup/restauração e diagnóstico local;
- importação/exportação de cardápio CSV/TXT;
- detecção e unificação reversível de categorias;
- WhatsApp real ponta a ponta com envio agrupado.

O último caso pendente, `Peticso → Petiscos`, foi validado na RC.2 junto com `Cervejs → Cervejas`, mantendo a revisão manual antes da aplicação.

## Novidades da v0.14

### Gestão

- filtros Hoje / 7 dias / 30 dias / Todos;
- busca no histórico;
- faturamento, comandas, ticket médio e itens vendidos;
- produtos mais vendidos;
- vendas por categoria;
- detalhe das comandas fechadas.

### Operação

- forma de pagamento no fechamento;
- atalhos de produtos mais lançados.

### Cardápio

- importação CSV/TXT;
- prévia e validação antes da gravação;
- adicionar, atualizar ou substituir;
- exportação e modelos CSV/TXT;
- arquivo de linhas rejeitadas;
- proteção contra arquivos malformados;
- detecção de categorias semelhantes por normalização, singular/plural e distância de edição;
- unificação reversível sem reescrever comandas antigas.

### Segurança dos dados

- backup JSON completo dos dados operacionais;
- token do dispositivo não é exportado;
- restauração validada antes de substituir o estado;
- backup automático antes de operações destrutivas;
- diagnóstico local de integridade.

### WhatsApp

A integração estável da v0.13 foi preservada e passou por regressão real na v0.14.

## Empacotamento final

A v0.14 usa `index.html` como loader de produção e preserva a base anterior em `base-v013.html`. As funcionalidades novas ficam em camadas versionadas, reduzindo o risco de alterar diretamente a base histórica já validada.

Service Worker final:

`rota27-comandas-v0.14`

## Último gate antes da publicação

Servir `release/v0.14-final` por HTTP e abrir:

`http://localhost:3000/`

O teste deve confirmar que a entrada pública real mostra `v0.14`, preserva os dados locais e carrega os módulos principais. Após essa aprovação, o PR final pode ser mesclado na `main`.
