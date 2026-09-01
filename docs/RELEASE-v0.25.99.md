# Rota 27 v0.25.99 — centralização do estado vazio da Lista

## Estado
Candidata para homologação. Produção permanece em v0.25.98.

## Correção
O componente canônico introduzido na v0.25.98 deixou de usar a classe legada `.empty`. Com isso, deixou também de herdar o alinhamento central daquela classe.

A v0.25.99 adiciona `text-align:center` diretamente à regra canônica `#commandsEmpty.commands-empty-list` em `base-v013.html`.

## Escopo
- nenhuma camada ou asset novo;
- nenhuma alteração no estado vazio do Mapa;
- nenhuma alteração em JavaScript funcional;
- nenhuma alteração em dados, Supabase, WhatsApp ou Modo Teste.

## Teste
Com zero comandas, abrir Lista e confirmar que título e subtítulo estão centralizados como no Mapa. Alternar Lista/Mapa e confirmar que continua existindo apenas um quadro por visualização.

## Rollback
Produção anterior: v0.25.98 / PR #142 / merge `751a5e263218608b207356383f2bdae3cfd6061d`.
