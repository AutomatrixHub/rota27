# Rota 27 v0.25.103 — shell visual canônico

## Problema

Durante o carregamento ainda podiam aparecer:

- barra inferior antiga com o item **Nova**;
- TOPBAR com logo grande, botão Ajuda quadrado e cores antigas;
- título/versão internos antigos escritos pelo módulo do Painel.

## Causa

O arquivo-base ainda continha estrutura e estilos históricos. A barra inferior era reconstruída por JavaScript e a geometria atual da TOPBAR dependia de uma folha externa posterior.

## Correção estrutural

- barra inferior final incorporada ao HTML inicial;
- estilos atuais essenciais incorporados ao CSS do shell;
- módulo do Painel liga o botão já existente e só converte `navNew` como fallback defensivo;
- removidas escritas antigas de título e versão;
- geometria duplicada da TOPBAR removida de `v0182-brand-theme.css`.

## Critérios de promoção

- primeiro DOM já deve conter `navPanel` e não `navNew`;
- TOPBAR e barra inferior devem manter a mesma geometria antes e depois dos módulos;
- Painel, Comandas, Cardápio e Histórico devem navegar normalmente;
- Nova comanda continua disponível pelo FAB;
- versão visual deve permanecer atual;
- nenhum erro no navegador.

Não há alteração em dados, Supabase, sincronização, WhatsApp ou regras operacionais. Rollback: v0.25.102.
