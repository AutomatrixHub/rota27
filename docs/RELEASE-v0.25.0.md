# Rota 27 v0.25.0 — Clientes & Fidelização

Data de promoção: **25/08/2026**

## Resumo
A v0.25.0 acrescenta uma camada simples de relacionamento baseada nos dados que o Rota 27 já possui. O objetivo é ajudar o proprietário a reconhecer frequência, ausência e preferências e transformar isso em contato pessoal útil, sem CRM pesado, campanha em massa ou automação de marketing.

A release preserva integralmente a operação da v0.24.0 — Custos & Margem.

## Entregas
- Central `Relacionamento & Fidelização` dentro de Clientes;
- abas `Visão geral`, `Clientes` e `Para lembrar`;
- visitas, total identificado, ticket médio e itens por cliente;
- primeira/última visita;
- ritmo médio entre visitas;
- produtos e categorias preferidos;
- níveis Novo / Recorrente / Frequente / Cliente da casa;
- sinal Sumido;
- marcos recentes de 5/10 visitas;
- cadastro frequente sem WhatsApp;
- perfil com histórico recente e observações existentes;
- WhatsApp contextual sempre manual;
- Ajuda v5.1;
- layout desktop/mobile;
- modo demonstração seguro `?preview=v0250`;
- oportunidade R3 `Preferido chegou recentemente`.

## Classificação
- Novo: 0–1 visita;
- Recorrente: 2–4 visitas;
- Frequente: 5–9 visitas;
- Cliente da casa: 10+ visitas;
- Sumido: 2+ visitas e 30+ dias sem retorno.

Os rótulos são apoio operacional, não status comercial rígido.

## Ritmo
Quando existem pelo menos duas visitas associadas, o sistema calcula o intervalo médio e traduz para uma leitura simples:
- até 7 dias: Quase semanal;
- 8 a 15 dias: A cada 1–2 semanas;
- 16 a 31 dias: Quase mensal;
- acima de 31 dias: Mais espaçado.

O ritmo não é previsão garantida nem agenda automática.

## Para lembrar
A Central destaca apenas sinais com ação compreensível:
- cliente recorrente há 30+ dias sem retorno;
- marco recente de 5 ou 10 visitas;
- cliente frequente sem WhatsApp cadastrado;
- produto preferido recebido recentemente e ainda disponível.

## Preferido chegou recentemente
A oportunidade só aparece quando TODOS os critérios forem verdadeiros:
1. cliente com 2+ visitas;
2. WhatsApp cadastrado;
3. produto é o primeiro preferido calculado;
4. recebimento positivo nos últimos 7 dias;
5. Estoque Essencial ativo;
6. disponibilidade atual > 0;
7. cliente ainda não voltou depois do recebimento.

Se o estoque acabar ou o cliente voltar depois do recebimento, a oportunidade desaparece.

## WhatsApp
A v0.25 não envia relacionamento pelo backend.

O sistema somente abre `wa.me` com um rascunho contextual. O proprietário revisa, edita, envia ou fecha.

Não existem:
- envio automático;
- disparo em massa;
- campanha agendada;
- promessa automática de desconto/brinde;
- pontos, cashback ou milhas;
- CRM, lead, pipeline ou funil.

## Matching de cliente
Prioridade:
1. WhatsApp normalizado quando o cliente possui telefone;
2. fallback por nome normalizado somente quando cliente e comanda estão sem telefone.

Isso reduz risco de misturar pessoas com nomes iguais.

## Modo demonstração seguro
`?preview=v0250` cria clientes/comandas fictícios somente em memória para testar:
- Sumido;
- marcos de 5/10 visitas;
- cliente frequente sem WhatsApp;
- ritmo;
- `Preferido chegou recentemente`.

Nada é gravado ou sincronizado. Clientes fictícios não abrem WhatsApp real nem podem ser editados.

## Sincronização e backend
A v0.25 não adiciona:
- evento novo;
- tabela nova;
- migration nova;
- Edge Function nova.

A inteligência é derivada de:
- `state.clients`;
- `state.history`;
- `state.catalog` / `itemMeta`;
- recebimentos de Compras & Reposição;
- Estoque Essencial.

Quando essas fontes convergem A→B, a fidelização converge por cálculo local.

Backend preservado:
- `rota27-sync` versão 7 ACTIVE;
- `EDGE_VERSION = rota27-sync-v0.23.0`;
- `verify_jwt=false`;
- autenticação por `x-rota27-device-token`.

## Validação
Em 25/08/2026:
- gate local aprovado;
- desktop/mobile aprovados;
- preview seguro aprovado;
- R3 aprovado;
- dados A→B totalmente sincronizados;
- proprietário autorizou explicitamente a publicação.

Registro: `docs/VALIDACAO-v0.25.0.md`.

## Estabilidade
A v0.25 não adiciona `setInterval` nem `MutationObserver` em suas novas camadas.

Preservar a regra consolidada desde a v0.21:
- não adicionar polling visual frequente;
- não criar observers concorrentes no Painel.

## Cache/PWA
Service Worker da release:
`rota27-comandas-v0.25.0-r3`.

Atualização sem reinstalação e sem limpar dados.

## Rollback
Baseline anterior segura: **v0.24.0 — Custos & Margem**.

## Próximo passo
Gestão avançada de estoque/giro permanece adiada. O próximo incremento deve nascer do uso real do relacionamento e manter a filosofia: simples por fora, inteligente por dentro.
