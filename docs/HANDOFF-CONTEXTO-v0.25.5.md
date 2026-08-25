# Handoff — Rota 27 v0.25.5

## Baseline
Produção promovida a partir da v0.25.4.

## Alterações da release
### Mapa
- novo acabamento compacto em `v0255-map-card.css`;
- nova hierarquia de conteúdo em `v0255-map-card.js`;
- Balcão usa cliente como título principal;
- Mesas/Parklet mantêm identificador espacial;
- sem faixa preta pesada.

### WhatsApp fixo
- destino: `5527997769279`;
- declarado no `index.html` em `meta[name=rota27-fixed-copy-whatsapp]`;
- lógica em `v0255-fixed-whatsapp-copy.js`;
- fila própria local;
- usa `rota27-whatsapp` existente;
- proteção contra duplicidade com gerente/cliente.

## Backend
Nenhuma mudança.

## Estabilidade
Não adicionar polling visual nem `MutationObserver` para manter o Mapa. A camada v0.25.5 se integra aos renders/eventos já existentes.

## Rollback
v0.25.4.
