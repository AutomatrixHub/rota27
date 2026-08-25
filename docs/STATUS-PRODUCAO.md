# Rota 27 — Status de produção

Última revisão: 25/08/2026

## Produção
- versão: **v0.25.1 — Navegação & Configurações**;
- branch: `main`;
- GitHub Pages: `https://automatrixhub.github.io/rota27/`;
- Service Worker: `rota27-comandas-v0.25.1-r1`;
- `rota27-whatsapp`: versão 23 ACTIVE (`rota27-whatsapp-v6-mini2`);
- `rota27-sync`: **versão 7 ACTIVE** (`rota27-sync-v0.23.0`);
- `rota27-whatsapp-inbound`: versão 1 ACTIVE;
- `rota27-audit`: versão 1 ACTIVE, somente leitura.

A v0.25.1 preserva a baseline funcional da v0.25.0 e reorganiza a navegação para deixar cada área coerente com sua função.

Baseline de rollback: **v0.25.0 — Clientes & Fidelização**.

## Navegação oficial
- **Comandas = atender**;
- **Cardápio = o que é vendido**;
- **Painel = administrar o negócio**;
- **Histórico = o que aconteceu**.

### Cardápio
Exibe apenas funções ligadas ao catálogo:
- produtos;
- categorias;
- preços;
- importação/exportação;
- busca e edição.

Não exibe mais:
- Clientes;
- WhatsApp do gerente;
- WhatsApp da comanda;
- Sincronização entre aparelhos.

### Painel
Novo bloco **Relacionamento**:
- Clientes & Fidelização.

Novo bloco **Configurações & Integrações**:
- WhatsApp da comanda;
- WhatsApp do gerente;
- Sincronização entre aparelhos.

Os acessos reutilizam os configuradores e dados existentes. Nenhuma configuração foi duplicada.

## Validação da v0.25.1
Em 25/08/2026 a candidata foi testada e aprovada pelo proprietário com a confirmação **“APROVADO!”**.

Foram validados:
- identidade visual v0.25.1;
- Cardápio sem os quatro blocos administrativos;
- Painel com os novos agrupamentos;
- Clientes & Fidelização abrindo corretamente;
- WhatsApp da comanda abrindo o configurador existente;
- WhatsApp do gerente abrindo o fluxo existente;
- Sincronização entre aparelhos abrindo o configurador existente;
- configurações previamente salvas preservadas;
- apresentação mobile;
- ausência de regressão P0/P1 relatada no gate.

Como a v0.25.1 é apenas uma reorganização visual/navegacional e não altera dados, eventos ou backend, não foi criado novo gate A→B específico para esta correção.

## Clientes & Fidelização
Acesso oficial passa a ser:
`Painel → Relacionamento → Clientes & Fidelização`.

Toda a funcionalidade da v0.25.0 permanece preservada:
- Visão geral / Clientes / Para lembrar;
- níveis Novo / Recorrente / Frequente / Cliente da casa;
- Sumido;
- ritmo médio;
- preferências;
- marcos de 5/10 visitas;
- WhatsApp contextual manual;
- `Preferido chegou recentemente`.

## Backend e sincronização
A v0.25.1 **não exige nova Edge Function, evento, tabela ou migration**.

A Edge Function `rota27-sync` permanece na versão 7 ACTIVE, `EDGE_VERSION = rota27-sync-v0.23.0`, com autenticação própria por `x-rota27-device-token`.

Permanece aplicada a migration:
`20260825012842_expand_rota27_sync_event_types_v023`.

## Módulos preservados
Continuam válidos:
- Comandas;
- Clientes & Fidelização;
- WhatsApp transacional/inbound;
- Fechamento do Turno;
- Auditoria;
- Visão Gerencial;
- Estoque Essencial;
- Compras & Reposição;
- Inventário & Conferência;
- Custos & Margem.

A regra financeira permanece: **custo nunca é inferido do preço de venda**.

## Estabilidade do Painel
Preservar:
- sem polling visual frequente novo;
- sem `MutationObserver` concorrente;
- preferir eventos existentes e renderização sob demanda.

A camada v0.25.1 não adiciona `setInterval` nem `MutationObserver`.

## Ajuda v5.2
Inclui a nova organização:
- Cardápio focado em produtos;
- Clientes & Fidelização no Painel;
- WhatsApps e Sincronização em Configurações & Integrações.

## Atualização da PWA
Não reinstalar e não limpar dados:
1. manter internet ativa;
2. abrir a PWA por 10–20 segundos;
3. fechar completamente;
4. abrir novamente;
5. confirmar `v0.25.1` e sincronização saudável.

## Segurança
- nenhum token/App Secret versionado;
- nenhuma migration nova na v0.25.1;
- operação local-first preservada;
- nenhuma alteração de regra de negócio ou backend nesta revisão.

Ver `docs/RELEASE-v0.25.1.md`.
