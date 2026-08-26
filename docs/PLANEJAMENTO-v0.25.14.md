# Rota 27 v0.25.14 — Novo turno no mesmo dia

Hotfix operacional para permitir iniciar um novo turno no mesmo dia após um fechamento anterior, sem apagar nem alterar o fechamento já registrado.

Regras:
- um fechamento encerra somente o turno corrente, não o dia civil inteiro;
- novas comandas podem ser abertas depois de um fechamento anterior no mesmo dia;
- um novo fechamento considera somente vendas ocorridas após o fechamento anterior;
- múltiplos fechamentos no mesmo dia têm IDs/eventos únicos;
- registros antigos permanecem imutáveis;
- compatível com A receber / Paga depois e com o seletor de clientes da v0.25.13.
