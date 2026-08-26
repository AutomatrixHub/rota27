# Rota 27 v0.25.13 — Seleção de cliente na nova comanda

## Objetivo
Eliminar retrabalho ao abrir uma comanda para um cliente já cadastrado.

## Nova experiência
Em **Nova comanda → Cliente**, ao tocar ou começar a digitar:
- aparece uma lista pesquisável dos clientes cadastrados;
- a pesquisa considera nome e WhatsApp;
- a seleção preenche o nome e, quando existente, o WhatsApp já cadastrado;
- o consentimento de envio de WhatsApp continua manual e não é marcado automaticamente;
- ainda é possível digitar livremente um cliente novo.

## Compatibilidade iPhone/PWA
O v0.17 já possuía um `<datalist>` nativo, mas esse componente tem comportamento inconsistente no Safari/iOS e em PWAs instaladas. A v0.25.13 adiciona um seletor visual próprio, mantendo o cadastro existente como fonte de dados.

## Backend
Sem alterações em Supabase, banco, Edge Functions ou eventos de sincronização.

## PWA
- `VERSION = 0.25.13`;
- cache `rota27-comandas-v0.25.13-r1`;
- Ajuda v6.4.

Baseline de rollback: v0.25.12.
