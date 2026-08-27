# Rota 27 Bodega — Comandas

Aplicativo mobile-first, offline-first e multidispositivo para controle rápido de comandas da **Rota 27 Bodega**.

## Produção

**Versão: v0.25.19 — Cards compactos de comandas**  
Branch: `main`  
GitHub Pages: `https://automatrixhub.github.io/rota27/`  
Service Worker: `rota27-comandas-v0.25.19-r1`

## Navegação
- **Comandas = atender**;
- **Cardápio = o que é vendido**;
- **Painel = administrar o negócio**;
- **Histórico = o que aconteceu**.

## v0.25.19 — Cards compactos de comandas
A tela **Comandas** foi refinada para ganhar densidade sem perder legibilidade ou área de toque.

Ajustes:
- visualização **Lista** com cards aproximadamente 20–30% mais baixos;
- paddings, espaçamentos, rodapé, valor e botão **Abrir** compactados;
- visualização **Mapa** limitada a **2 cards por linha no celular**;
- cards do Mapa também compactados verticalmente, aproveitando melhor a largura disponível;
- fallback para 1 coluna apenas em telas excepcionalmente estreitas;
- nenhuma alteração na lógica de comandas, sincronização ou backend.

## v0.25.18 — Cadastro completo na abertura da comanda
A nova comanda aceita **Data de nascimento** opcional junto com Cliente e WhatsApp. Cliente cadastrado preenche WhatsApp/nascimento quando disponíveis; cliente novo pode ter o nascimento salvo já na abertura. O campo vazio nunca apaga nascimento existente.

## v0.25.17 — Aniversário no cadastro de clientes
Adicionou Data de nascimento opcional ao cadastro compartilhado, Relacionamento & Fidelização e CSV de clientes, sincronizado via `client_upsert`.

## v0.25.16 — Reparo histórico de fechamento
Mantém o reparo administrativo rastreável do fechamento histórico ligado à comanda `c1787690191876` (Fred / Balcão / R$ 145,00), com estado canônico de 25/08 em R$ 448,00 / 8 comandas / 33 unidades.

## Regra operacional preservada
A data de abertura da comanda define a qual turno a venda pertence. Múltiplos turnos no mesmo dia continuam suportados; o fechamento anterior funciona como corte.

## Preservado
- seletor pesquisável de clientes na nova comanda;
- data de nascimento no cadastro e na abertura da comanda;
- A receber / Paga depois, inclusive recebimentos parciais;
- rankings por ID/código com nome atual do produto;
- referência de produtos ao editar categorias;
- Lista + Mapa;
- cópia fixa de WhatsApp para `+55 27 99776-9279` (`5527997769279`);
- replay histórico hibernado;
- estoque, compras, inventário, custos e relacionamento/fidelização.

## Backend
- `rota27-sync`: versão **9 ACTIVE**;
- `EDGE_VERSION = rota27-sync-v0.25.16`;
- nenhuma migration nem alteração de Edge Function na v0.25.19.

## Ajuda
Ajuda **v6.9** permanece ativa, agora identificando a release v0.25.19.

## Atualização da PWA
Não limpar dados nem reinstalar. Abra a PWA online, aguarde 20–30 segundos, feche completamente e abra novamente em cada aparelho.

## Documentos
- `docs/RELEASE-v0.25.19.md`
- `docs/RELEASE-v0.25.18.md`
- `docs/RELEASE-v0.25.17.md`
- `docs/RELEASE-v0.25.16.md`
- `docs/STATUS-PRODUCAO.md`

Baseline de rollback do código: **v0.25.18**.

## Versão
Produção: **0.25.19**
