# Rota 27 v0.25.1 — Plano de teste

## Estado
**CANDIDATA — NÃO PUBLICADA EM PRODUÇÃO.**

Produção preservada: **v0.25.0 — Clientes & Fidelização**.

## A — versão e estabilidade
1. Abrir a candidata.
2. Confirmar badge `v0.25.1` estável por pelo menos 15 segundos.
3. Navegar entre Comandas, Cardápio, Painel e Histórico.

Esperado:
- sem cintilação/travamento;
- nenhuma rolagem horizontal;
- nenhum módulo anterior desaparece.

## B — Cardápio limpo
Abrir **Cardápio**.

Esperado:
- não aparecem mais Clientes;
- não aparece WhatsApp do gerente;
- não aparece WhatsApp da comanda;
- não aparece Sincronização entre aparelhos;
- permanecem Gestão do cardápio, Importar/Exportar, busca, produtos e categorias.

## C — Painel / Relacionamento
Abrir **Painel** e localizar **Relacionamento**.

Esperado:
- card `Clientes & Fidelização`;
- resumo com quantidade de cadastrados;
- toque abre o fluxo de Clientes já existente;
- Central `Relacionamento & Fidelização` continua acessível;
- cadastrar/editar/importar/exportar clientes continua funcionando.

## D — Configurações & Integrações
No Painel, localizar **Configurações & Integrações**.

### D1. WhatsApp da comanda
Tocar no card.

Esperado:
- abre o mesmo configurador já existente;
- URL/token atuais permanecem preenchidos quando já configurados;
- salvar continua funcionando;
- status do Painel reflete configurado/não configurado.

### D2. WhatsApp do gerente
Tocar no card.

Esperado:
- abre o mesmo configurador do gerente;
- nome/telefone/status atuais preservados;
- nenhuma configuração é duplicada.

### D3. Sincronização entre aparelhos
Tocar no card.

Esperado:
- abre a mesma tela de Sincronização já validada;
- deviceId, cursor, URL/token, nome do aparelho e estado atual permanecem intactos;
- `Sincronizar agora` continua funcionando;
- não publicar nova base por engano.

## E — Acessos rápidos do Painel
Esperado:
- atalho duplicado de Sincronização não aparece;
- Cardápio aparece como `Produtos e categorias`;
- se WhatsApp/Sync estiverem desativados, os cards de Operação orientam configurar no próprio Painel.

## F — Ajuda
Abrir Ajuda.

Esperado:
- rodapé `Ajuda v5.2 • Rota 27 v0.25.1`;
- seção `Onde ficam Clientes e configurações`;
- explicação da regra Comandas/Cardápio/Painel/Histórico.

## G — mobile
Validar em aparelho real.

Esperado:
- cards confortáveis para toque;
- títulos e resumos sem overflow;
- Configurações & Integrações em uma coluna;
- navegação inferior preservada.

## H — regressão rápida
Confirmar:
- abrir/editar/fechar comanda;
- Cardápio e edição de produto;
- Clientes & Fidelização;
- WhatsApp da comanda;
- WhatsApp do gerente;
- Sincronização;
- Estoque Essencial;
- Compras & Reposição;
- Inventário;
- Custos & Margem;
- Histórico.

## Gate
Somente promover após:
- teste local aprovado;
- nenhuma regressão P0/P1;
- autorização explícita para publicação.
