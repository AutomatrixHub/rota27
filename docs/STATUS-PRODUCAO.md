# Rota 27 — Status de produção

Última revisão: 30/08/2026

## Produção
- versão: **v0.25.70 — Abertura canônica de Nova comanda**;
- branch: `main`;
- GitHub Pages: `https://automatrixhub.github.io/rota27/`;
- Service Worker: `rota27-comandas-v0.25.70-r1`;
- baseline anterior: **v0.25.69**, merge `e3f7b941574bdfdc65137914994e5fd2e580e11a`.

## Hotfix Nova comanda
A v0.25.64 havia removido o `onclick` original do FAB e passado a depender de `window.openNewCommandSheet`. Em alguns ciclos de bootstrap/PWA essa referência global pode não estar exposta mesmo com o formulário `#newCommandWrap` presente no DOM, causando a mensagem **“Não foi possível abrir Nova comanda.”**.

A v0.25.70 introduz `v02570-new-command-root.js`:
- captura o FAB `#fabNew` antes dos listeners antigos;
- protege também **Abrir primeira comanda**;
- usa a função legada quando ela existe e funciona;
- possui fallback canônico que reinicia os campos e abre `#newCommandWrap` diretamente;
- remove qualquer `autofocus` e não chama `.focus()`;
- reinicia o modo de Consumo interno antes de uma nova comanda;
- reinstala a referência raiz em `visibilitychange` sem polling.

## Cardápio preservado
A v0.25.69 permanece responsável por:
- Cardápio administrativo em ordem alfabética;
- filtros **Todos → Cervejas → Bebidas → demais categorias**;
- categorias de lançamento após as três primeiras ordenadas por consumo histórico faturável;
- exclusão de Consumo interno/non-revenue do ranking.

## Backend de relacionamento preservado
- `rota27-birthday-campaign`: v3 ACTIVE;
- `rota27-whatsapp-inbound`: v4 ACTIVE;
- parabéns automático às 09:30 preservado;
- solicitação de data de nascimento em até 3 tentativas / 7 dias preservada.

## Preservação
- nenhuma migration;
- nenhuma Edge Function alterada;
- nenhum reset ou alteração de dados;
- preços, produtos, estoque, comandas e histórico preservados;
- nenhum polling ou `MutationObserver` novo.

## Atualização PWA
- shell declara `rota27-release-version=0.25.70`;
- `v02570-new-command-root.js` é carregado diretamente pelo shell e pelo roadmap loader;
- cache `rota27-comandas-v0.25.70-r1`;
- não limpar `localStorage` de produção.

## Regras de operação
- não reinstalar PWA como atualização normal;
- não resetar Supabase;
- Sandbox não envia WhatsApp real nem sincroniza produção;
- mudanças usam branch curta + PR + merge + confirmação do Pages.

## Rollback
Baseline anterior: **v0.25.69** / merge `e3f7b941574bdfdc65137914994e5fd2e580e11a`.
