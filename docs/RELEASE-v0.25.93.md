# Rota 27 v0.25.93 — Ajuda do Sistema v11.0

Data: 31/08/2026

## Objetivo

Consolidar a Ajuda do Rota 27 em um manual único, atualizado e coerente com o estado real do aplicativo, substituindo instruções antigas acumuladas por camadas incrementais desde as releases v0.15–v0.25.

## Problema encontrado na varredura

A Ajuda original continuava correta em muitos fundamentos, mas continha instruções superadas por mudanças posteriores. Exemplos:

- a Ajuda-base ainda dizia que o botão `+` ficava visível nas áreas principais; desde v0.25.92 ele aparece somente em **Comandas**;
- a ordem antiga da navegação não correspondia mais à barra inferior atual;
- recursos recentes de Modo Teste, aparelhos, atualização automática e telemetria ainda não estavam consolidados num único manual;
- funcionalidades de Clientes, WhatsApp, A receber, Estoque e turnos estavam distribuídas entre várias camadas de Ajuda, dificultando leitura e manutenção.

## Ajuda v11.0

A nova camada `assets/v02593-help-v11.js` torna-se a apresentação autoritativa do conteúdo ao abrir a Ajuda.

Ela preserva:

- overlay e botão Ajuda existentes;
- busca textual;
- chips/atalhos;
- estilo visual Capixaba;
- componentes de exemplo, aviso e dica;
- fechamento pelo `X` padronizado.

Ao mesmo tempo, reconstrói o conteúdo para evitar duplicidade e instruções contraditórias provenientes das camadas históricas.

## Conteúdo consolidado

A Ajuda v11.0 cobre:

1. Primeiros 3 minutos;
2. mapa atual do aplicativo;
3. Comandas em Lista e Mapa;
4. Nova comanda e Editar comanda sem foco automático;
5. lançamento e correção de produtos;
6. WhatsApp transacional da comanda e consentimento persistente;
7. WhatsApp do gerente e diagnóstico de fila;
8. fechamento da conta e A receber;
9. turno operacional e Histórico;
10. Painel operacional;
11. Visão Gerencial;
12. Clientes & Fidelização;
13. Cardápio, produtos e categorias;
14. Estoque, Compras, Inventário, Custos e Consumo interno;
15. sincronização entre aparelhos;
16. gestão de aparelhos sincronizados;
17. solicitações remotas de sync, diagnóstico e atualização;
18. Modo Teste Global;
19. atualização automática da PWA;
20. diagnóstico rápido de problemas comuns.

## Recursos recentes incorporados

### Modo Teste Global
- cenário fictício de aproximadamente 40 dias;
- domingos ignorados;
- reutilização de produtos, categorias e clientes reais como referência;
- dados fictícios de comandas, turnos, estoque, compras e custos;
- tema azul/violeta;
- WhatsApp, sync e Edge Functions reais bloqueados;
- controles de ativar, regenerar e voltar aos dados reais também disponíveis dentro da Ajuda.

### Aparelhos sincronizados
- Ativo / Desativar / Reativar / Remover / Mostrar removidos;
- preservação de eventos históricos;
- Versão do Rota 27 separada de versões internas legadas;
- Última atividade, Diagnóstico e ID técnico explicados;
- solicitações remotas de sincronização, diagnóstico e atualização;
- limitação explícita de PWA/iPhone fechado ou suspenso.

### A receber
- diferença entre origem e vencimento;
- pagamento parcial;
- saldo remanescente;
- data/hora e forma do último recebimento;
- data/hora e forma da quitação;
- Quitadas recentemente por data real de quitação.

### Clientes e relacionamento
- cadastro compartilhado;
- importação/exportação;
- classificação Novo/Recorrente/Frequente/Cliente da casa/Sumido;
- ordenação por Nome, Última visita, frequência e aniversário;
- Aniversários próximos;
- solicitação de data de nascimento;
- parabéns automático às 09:30 quando elegível;
- Eventos & Convites e consentimento específico.

### Estoque e gestão
- cobertura estimada em dias;
- Compras & Reposição;
- Inventário & Conferência;
- Custos & Margem;
- alerta de margem negativa e aumento relevante de custo;
- Consumo interno separado de faturamento.

### Turno e operação
- data operacional separada do horário físico de fechamento;
- pré-fechamento por exceção;
- snapshot imutável do último turno fechado;
- Visão Gerencial por 7/30/90 dias ou todo o histórico.

### Navegação
- barra inferior documentada como Comandas → Cardápio → Painel → Histórico;
- `+ Nova comanda` somente em Comandas;
- `X` padronizado para fechamento;
- `X` flutuante em listas longas de Clientes e Cardápio.

## Arquivos

- `assets/v02593-help-v11.css` — acabamento complementar da Ajuda consolidada;
- `assets/v02593-help-v11.js` — conteúdo autoritativo e controles;
- `assets/roadmap-loader.js` — release `0.25.93`, Ajuda `11.0` e carregamento dos novos assets;
- `sw.js` — cache `rota27-comandas-v0.25.93-r1` e inclusão dos novos assets;
- `VERSION` — `0.25.93`.

## Segurança operacional

A release altera documentação/interface da Ajuda e identidade/cache PWA. Não altera:

- comandas;
- clientes;
- produtos;
- estoque;
- recebíveis;
- pagamentos;
- sync;
- Edge Functions;
- Supabase;
- WhatsApp real.

A única ação operacional exposta na Ajuda é o controle já existente do **Modo Teste Global**, reutilizando a API pública `Rota27V02581TestMode` e mantendo todas as proteções do sandbox.

## PWA

- versão: `0.25.93`;
- Ajuda: `11.0`;
- cache: `rota27-comandas-v0.25.93-r1`;
- baseline anterior: `v0.25.92-r2`.
