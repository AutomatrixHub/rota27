# Rota 27 v0.18.3 — teste visual da candidata

## Objetivo
Validar duas mudanças exclusivamente visuais sobre a candidata anterior:

1. refinamento da faixa colorida dos cards de comandas;
2. nova identidade capixaba da seção Ajuda.

A produção permanece na v0.18.1 até aprovação final.

## Abrir a preview

```powershell
cd "C:\Users\marco\OneDrive\Documentos\Rota27\mvp\Rota27-comandas-git"
git fetch origin
git switch feature/v0.18.3-capixaba-help
git pull --ff-only
Get-Content .\VERSION
powershell -ExecutionPolicy Bypass -File ".\scripts\testar-v0183.ps1"
```

Esperado:
- `VERSION` = `0.18.3`;
- preview em `http://localhost:3021/?preview=v0183`;
- sem travamento ou aumento anormal de CPU.

## Gate visual — cards
- canto superior esquerdo com curva fina, leve e gradual;
- faixa vertical laranja/preta mais estreita;
- o traço superior laranja deve afinar até desaparecer, sem bloco pesado;
- curvatura externa continua coerente com a TOPBAR;
- textos, valores, botão Abrir e área clicável permanecem intactos.

## Gate visual — Ajuda Tema Capixaba
- cabeçalho usa azul, branco e rosa de forma suave;
- busca e chips permanecem legíveis;
- atalhos e ícones usam variações azul/rosa/laranja/verde sem excesso;
- conteúdo longo continua confortável para leitura;
- alertas funcionais preservam semântica: verde=ok, amarelo=atenção, vermelho=erro;
- mapa da navegação mostra `Comandas → Cardápio → Painel → Histórico`;
- rodapé mostra `Ajuda v4.2 • v0.18.3`.

## Smoke funcional mínimo
- abrir uma comanda;
- lançar e remover um item;
- voltar à lista;
- navegar por Comandas, Cardápio, Painel e Histórico;
- abrir e fechar Ajuda;
- conferir Resumo do Turno e Auditoria.

Nenhum fluxo operacional deve mudar nesta versão.
