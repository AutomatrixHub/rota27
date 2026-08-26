# Rota 27 v0.25.13 — Seleção de cliente na nova comanda

Objetivo: ao abrir uma nova comanda, o campo Cliente deve oferecer clientes já cadastrados em uma lista pesquisável compatível com iPhone/PWA.

Regras:
- pesquisar por nome e WhatsApp enquanto digita;
- seleção preenche nome e WhatsApp cadastrados;
- continuar permitindo digitar cliente novo livremente;
- evitar depender apenas de `<datalist>`, que tem comportamento inconsistente em iOS/PWA;
- sem alteração de backend ou Supabase.
