# Rota 27 — Release v0.25.23

Data: 27/08/2026

## Título
**Acabamento visual dos Fechamentos**

## Objetivo
Aplicar o refinamento final da tela **Fechamentos** após a validação real da v0.25.22-r4 no celular, sem alterar domínio, sincronização ou backend.

## Alterações visuais
- data operacional permanece como informação dominante no cabeçalho;
- texto **Fechado: DD/MM HH:MM** fica mais discreto;
- valores dos indicadores ganham maior destaque;
- rótulos ficam visualmente mais suaves;
- cards internos e espaçamentos verticais ficam ligeiramente mais compactos;
- status verde de sincronização fica mais baixo;
- rodapé operacional fica menor e com menor contraste;
- fechamento mais recente recebe o marcador discreto **Último fechamento**;
- o fechamento histórico reparado passa a aparecer como **ajuste administrativo** na interface, preservando os dados técnicos originais na auditoria.

## Preservado
- ordem: **Faturamento | Ticket médio / Comandas fechadas | Comandas canceladas / Itens vendidos | Formas de pagamento**;
- proteção contra reaparecimento do ID técnico `turn_...`;
- status `Sincronizado • data/hora`;
- estabilização curta do renderer, sem `MutationObserver` e sem polling contínuo;
- botões **Sincronizar** e **Concluir** sem alteração;
- event log, fechamentos imutáveis, Supabase e Edge Functions sem alteração.

## PWA
- versão: `0.25.23`;
- Service Worker: `rota27-comandas-v0.25.23-r1`;
- atualização assistida normal, sem limpar dados e sem reinstalar a PWA.

## Backend
Nenhuma alteração.

## Rollback
`v0.25.22-r4` / HEAD de produção anterior `6ad11bdf5d4f274a8c5bc143575974a84afe2074`.
