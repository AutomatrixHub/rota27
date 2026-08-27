# Rota 27 v0.25.35 — Data de nascimento na edição da comanda

Data: 27/08/2026

## Diagnóstico
A v0.25.18 adicionou `Data de nascimento` apenas na folha **Nova comanda**. O fluxo **Editar comanda** permaneceu usando o formulário legado sem esse campo. Portanto, o dado não foi removido da abertura da comanda; ele nunca havia sido espelhado na edição.

## Objetivo
Disponibilizar o mesmo dado de nascimento também ao editar uma comanda aberta, mantendo as regras de segurança e sincronização já adotadas em v0.25.17/v0.25.18.

## Implementação
- novo campo opcional `Data de nascimento` logo após o WhatsApp em **Editar comanda**;
- preenchimento automático quando o cliente já está cadastrado;
- ao alterar nome/WhatsApp para outro cliente conhecido, o aniversário acompanha o cadastro correspondente;
- datas inválidas ou futuras são rejeitadas;
- deixar o campo vazio não apaga uma data já salva;
- ao salvar uma nova data, o cadastro do cliente é atualizado via `client_upsert` com `birthDate` e `birthDateUpdatedAt`;
- usa a mesma trilha local `rota27_v02517_birthdays_v1` já existente;
- sem alteração da estrutura da comanda e sem migration.

## Arquivo principal
- `assets/v02535-edit-command-birthday.js`.

## PWA
- `VERSION`: `0.25.35`;
- Service Worker: `rota27-comandas-v0.25.35-r1`.

## Backend
Nenhuma alteração em Supabase, Edge Functions, eventos permitidos ou constraints.

## Compatibilidade
Preserva:
- captura de nascimento na **Nova comanda** da v0.25.18;
- editor de cliente e relacionamento da v0.25.17;
- seletor de clientes da v0.25.13;
- WhatsApp agrupado;
- comandas, histórico, fechamentos, estoque, compras e recebíveis.

## Rollback
Baseline: v0.25.34 / HEAD `872db9cd935d6e9291d4d78e76cd8a9509602ae8`.
