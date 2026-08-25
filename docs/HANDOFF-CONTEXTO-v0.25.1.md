# Handoff — Rota 27 v0.25.1

## Baseline oficial
Versão: **v0.25.1 — Navegação & Configurações**  
Branch de produção após promoção: `main`  
Service Worker: `rota27-comandas-v0.25.1-r1`  
Rollback: **v0.25.0 — Clientes & Fidelização**.

## O que mudou
A v0.25.1 é exclusivamente uma reorganização de navegação/UX.

Arquitetura mental oficial:
- Comandas = atender;
- Cardápio = o que é vendido;
- Painel = administrar o negócio;
- Histórico = o que aconteceu.

### Cardápio
Não exibe mais:
- Clientes;
- WhatsApp do gerente;
- WhatsApp da comanda;
- Sincronização entre aparelhos.

Permanece com produtos, categorias, preços, importação/exportação, busca e edição.

### Painel
Novo bloco `Relacionamento`:
- Clientes & Fidelização.

Novo bloco `Configurações & Integrações`:
- WhatsApp da comanda;
- WhatsApp do gerente;
- Sincronização entre aparelhos.

Os cards novos acionam os fluxos antigos; não existe segunda configuração nem duplicação de dados.

## Implementação
Arquivos novos:
- `assets/v0251-navigation.js`;
- `assets/v0251-navigation.css`.

A camada final:
- oculta os cards administrativos antigos no Cardápio;
- acrescenta os novos acessos no Painel;
- reutiliza os botões/configuradores existentes;
- atualiza a Ajuda para v5.2;
- estabiliza a identidade visual em v0.25.1.

## Cuidado crítico de estabilidade
O Painel já sofreu travamento/cintilação por renderizações concorrentes.

Preservar:
- sem novo polling visual frequente;
- sem `MutationObserver` concorrente;
- preferir eventos existentes e atualizações pontuais.

A v0.25.1 não adiciona `setInterval` nem `MutationObserver`.

## Backend
Sem alteração.

Supabase permanece com:
- `rota27-sync` versão 7 ACTIVE (`rota27-sync-v0.23.0`);
- migration `20260825012842_expand_rota27_sync_event_types_v023` aplicada;
- nenhuma nova tabela, migration ou Edge Function para v0.25.1.

## Clientes & Fidelização
Toda a v0.25.0 permanece funcional. O único ajuste é o caminho de acesso, agora:
`Painel → Relacionamento → Clientes & Fidelização`.

## Validação
A candidata foi testada e aprovada pelo proprietário em 25/08/2026.

Validado:
- Cardápio limpo dos quatro blocos administrativos;
- Painel com os agrupamentos novos;
- quatro acessos abrindo os fluxos antigos corretos;
- configurações salvas preservadas;
- layout mobile;
- sem regressão crítica relatada.

Não houve gate A→B específico porque a revisão não altera persistência, eventos, dados nem backend.

## Próximos desenvolvimentos
Não assumir nova funcionalidade grande automaticamente. A v0.25.1 fecha uma dívida de organização de interface; a próxima evolução deve continuar orientada ao uso real e à simplicidade do negócio.
