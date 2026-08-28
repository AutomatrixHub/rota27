# Rota 27 v0.25.39 — Hotfix do Consumo interno

## Problema observado
Ao marcar **Consumo interno / próprio** na folha **Nova comanda**, a folha desaparecia e permanecia apenas o overlay escuro.

## Causa raiz
A v0.25.37 marca campos exclusivos de cliente com a classe `v02537-client-only` para escondê-los no modo interno. No caso do checkbox `newWhatsappOptIn`, a rotina subia um nível além do label e acabava marcando acidentalmente a própria `.sheet` da nova comanda.

Como o CSS do modo interno usa `display:none` para `.v02537-client-only`, ao ativar o checkbox toda a folha era ocultada, deixando visível apenas o fundo escurecido do `sheet-wrap`.

## Correção
A v0.25.39 adiciona `assets/v02539-internal-toggle-hotfix.js`, carregado depois da v0.25.37, que:
- remove a marca `v02537-client-only` da própria `.sheet`;
- aplica a marca somente aos campos de cliente corretos: nome, WhatsApp, consentimento, aniversário e estado de configuração WhatsApp;
- repara a marcação sempre que a folha Nova comanda é aberta;
- intercepta a mudança do checkbox em fase de captura, antes do handler legado da v0.25.37;
- inclui uma regra defensiva que impede a folha principal de desaparecer mesmo se alguma camada anterior voltar a marcá-la indevidamente.

## Escopo
Nenhuma alteração em faturamento, estoque, fechamento, histórico, Supabase, Edge Functions, event types ou regras do Sandbox.

## Sandbox
O Modo Sandbox da v0.25.38 permanece preservado e é o ambiente recomendado para validar o fluxo de Consumo interno.

## Service Worker
`rota27-comandas-v0.25.39-r1`

## Rollback
Baseline anterior: v0.25.38 / commit `cc98f04275a92f8b78ab76ee8f0025a9ecec7b43`.
