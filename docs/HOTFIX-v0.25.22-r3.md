# HOTFIX v0.25.22-r3 — Rodapé e status de Fechamentos

Data: 27/08/2026

Correção visual derivada de validação real no celular.

## Corrigido
- rodapé sem o ID técnico `turn_...`;
- rodapé em `Data operacional pela abertura • fechado em <aparelho>`;
- status pós-sincronização em `Sincronizado • DD/MM/AAAA HH:MM:SS`;
- novo asset JavaScript com caminho exclusivo para evitar reaproveitamento de instância anterior no PWA;
- abertura e botão Sincronizar usam o mesmo renderer canônico.

## Preservado
- versão funcional 0.25.22;
- regras de fechamento;
- Supabase e Edge Functions;
- event log;
- dados locais;
- sem MutationObserver e sem polling frequente.

## PWA
Service Worker: `rota27-comandas-v0.25.22-r3`.
