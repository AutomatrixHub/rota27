# Rota 27 v0.25.0 — Plano de teste e resultado final

## Estado
**APROVADA PARA PRODUÇÃO em 25/08/2026.**

Produção anterior durante o gate: **v0.24.0 — Custos & Margem**.

PR: **#31 — Rota 27 v0.25.0 — Clientes & Fidelização**.

## Objetivo
Validar que a nova camada ajuda o proprietário a reconhecer clientes e decidir contatos úteis sem criar CRM pesado, dados inventados ou envio automático.

## Resultado consolidado
O proprietário aprovou o gate local e, em seguida, confirmou a convergência entre os aparelhos A e B.

Confirmações registradas:
- `Perfeito. Testado e aprovado.`
- `Dados totalmente sincronizados. A -> B passou. Pode publicar. APROVADO.`

## Itens validados
- versão `v0.25.0` visível e estável;
- acesso em `Cardápio/Menu → Clientes → Relacionamento & Fidelização`;
- Visão geral / Clientes / Para lembrar;
- associação segura cliente ↔ comanda;
- níveis Novo / Recorrente / Frequente / Cliente da casa;
- sinal Sumido;
- ritmo médio entre visitas;
- Leitura do momento;
- produtos e categorias preferidos;
- marcos recentes de 5/10 visitas;
- cliente frequente sem WhatsApp;
- perfil completo e histórico recente;
- reuso do cadastro existente;
- WhatsApp contextual somente manual;
- cliente sem WhatsApp sem URL inválida;
- modo demonstração seguro `?preview=v0250`;
- R3 `Preferido chegou recentemente`;
- layout desktop/mobile;
- operação offline com dados locais já disponíveis;
- convergência A→B;
- ausência de regressão P0/P1 relatada no gate.

## Associação segura
Regra validada:
1. cliente com WhatsApp associa apenas comandas com o mesmo telefone normalizado;
2. fallback por nome somente quando cliente e comanda estão sem telefone.

## Classificação
- Novo: 0–1 visita;
- Recorrente: 2–4 visitas;
- Frequente: 5–9 visitas;
- Cliente da casa: 10+ visitas;
- Sumido: 2+ visitas e 30+ dias sem retorno.

## Ritmo
Quando existem 2+ visitas:
- até 7 dias: Quase semanal;
- 8–15 dias: A cada 1–2 semanas;
- 16–31 dias: Quase mensal;
- acima de 31 dias: Mais espaçado.

## Para lembrar
Sinais aprovados:
- cliente recorrente há 30+ dias sem voltar;
- marco recente de 5/10 visitas;
- cliente frequente sem WhatsApp;
- `Preferido chegou recentemente`.

## Preferido chegou recentemente
A oportunidade exige simultaneamente:
1. 2+ visitas;
2. WhatsApp cadastrado;
3. produto é o primeiro preferido calculado;
4. recebimento positivo nos últimos 7 dias;
5. Estoque Essencial ativo;
6. disponível atual > 0;
7. cliente ainda não voltou depois do recebimento.

Proteções:
- estoque zero remove a oportunidade;
- nova visita após o recebimento remove a oportunidade;
- produto sem controle de estoque não gera afirmação de disponibilidade;
- WhatsApp abre somente por ação humana.

## Modo demonstração
`http://localhost:8000/?preview=v0250`

Validado para apresentar cenários raros sem alterar a base real:
- Sumido;
- marco 5;
- marco 10;
- frequente sem WhatsApp;
- ritmo;
- R3.

Dados fictícios ficam apenas em memória, não sincronizam e não abrem WhatsApp real.

## Multidispositivo
A v0.25 não persiste um domínio de fidelização separado.

Com clientes, histórico, recebimentos e estoque sincronizados, os cálculos convergem localmente entre aparelhos.

O gate A→B foi aprovado pelo proprietário com dados totalmente sincronizados.

## Backend
Nenhuma alteração de backend foi necessária:
- sem evento novo;
- sem tabela nova;
- sem migration nova;
- sem nova Edge Function.

`rota27-sync` permanece versão 7 ACTIVE (`rota27-sync-v0.23.0`).

## Regressão crítica
Durante o gate não foi relatada regressão P0/P1 em:
- Comandas;
- Clientes;
- WhatsApp transacional;
- sincronização;
- Estoque Essencial;
- Compras & Reposição;
- Inventário & Conferência;
- Custos & Margem;
- Fechamento do Turno;
- Visão Gerencial.

## Gate de produção
**PASSOU.**

Condições atendidas:
- gate local aprovado;
- A→B aprovado;
- documentação final atualizada;
- autorização explícita para merge/publicação recebida.

Baseline de rollback: **v0.24.0 — Custos & Margem**.
