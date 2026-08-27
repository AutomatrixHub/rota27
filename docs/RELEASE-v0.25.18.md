# Rota 27 v0.25.18 — Cadastro completo na abertura da comanda

Data: 26/08/2026

## Objetivo
Permitir que a abertura de uma nova comanda também capture a **Data de nascimento** do cliente, além de nome e WhatsApp, sem tornar o atendimento mais lento e sem criar uma nova trilha de sincronização.

## Implementação
- novo campo opcional `Data de nascimento` na folha de nova comanda;
- campo inserido logo após WhatsApp;
- formato canônico `AAAA-MM-DD`;
- datas inválidas e futuras são rejeitadas;
- cliente cadastrado selecionado pelo seletor da v0.25.13 recebe preenchimento automático de WhatsApp e nascimento quando disponíveis;
- cliente existente sem nascimento pode ser complementado diretamente durante a abertura da comanda;
- cliente novo com cadastro automático via comanda recebe também a data de nascimento informada;
- campo vazio na abertura nunca remove uma data de nascimento já cadastrada;
- o dado continua sincronizado por `client_upsert`, com `birthDate` e `birthDateUpdatedAt`;
- armazenamento local compatível com a trilha criada na v0.25.17;
- Help atualizado para v6.9.

## Arquivos principais
- `assets/v02518-client-birthday-on-open.js`;
- `assets/v0256-release.js`;
- `sw.js`;
- `VERSION`;
- `README.md`;
- `docs/STATUS-PRODUCAO.md`.

## Backend
Nenhuma migration e nenhuma alteração de Edge Function foram necessárias. O evento `client_upsert` já é aceito pelo backend e transporta o complemento de nascimento.

## Segurança de dados
- preencher nascimento atualiza apenas o cadastro do cliente correspondente;
- deixar o campo vazio não apaga nascimento anterior;
- o dado é associado primeiro por WhatsApp e depois por nome exato normalizado;
- nenhuma limpeza de `localStorage`;
- nenhuma reinstalação da PWA;
- nenhum `MutationObserver`;
- nenhum polling visual frequente.

## Compatibilidade preservada
- v0.25.17: cadastro/edição de nascimento, CSV e Relacionamento & Fidelização;
- v0.25.16: reparo histórico de fechamento;
- v0.25.15: data operacional pela abertura;
- v0.25.14: múltiplos turnos no mesmo dia;
- v0.25.13: seletor pesquisável de clientes;
- A receber / Paga depois;
- estoque, compras, inventário, custos, rankings e WhatsApp fixo.

## Atualização PWA
Service Worker: `rota27-comandas-v0.25.18-r1`.

Não limpar dados nem reinstalar. Abrir a PWA online, aguardar 20–30 segundos, fechar completamente e abrir novamente.

## Rollback
Baseline de rollback de código: **v0.25.17**.
