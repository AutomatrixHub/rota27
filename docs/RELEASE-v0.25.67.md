# Release v0.25.67 — Estado visual de aniversários

Data: 29/08/2026

## Objetivo
Corrigir a divergência entre o backend real da automação de aniversário e o card **Aniversários próximos**, que ainda podia exibir a frase antiga de que nenhuma mensagem era automática e ocultar os estados de elegibilidade.

## Causa raiz
`v02557-upcoming-birthdays.js` é o renderer autoritativo do card e recria seu `innerHTML` em vários momentos. As camadas v0.25.65 e v0.25.66 decoravam o card depois, mas uma renderização posterior da v0.25.57 podia apagar essas extensões.

Havia, portanto, uma corrida visual entre:
1. renderer base v0.25.57;
2. automação/status v0.25.65;
3. elegibilidade v0.25.66.

O backend de envio não dependia dessa interface e permaneceu correto.

## Correção
- o renderer v0.25.57 passa a mostrar diretamente a cópia atual: `Parabéns automático às 09:30 no dia do aniversário para clientes autorizados.`;
- ao final de cada render, emite `rota27:v02557-rendered`;
- a nova camada `v02567-birthday-visual-state.js` escuta esse evento;
- a elegibilidade da v0.25.66 é reaplicada imediatamente;
- o bloco da automação da v0.25.65 é restaurado usando `getStatus()` já disponível;
- o shell carrega `v02567-birthday-visual-state.js` diretamente antes do roadmap loader;
- roadmap loader atualiza as camadas de aniversário com cache-buster `02567r1`;
- cache PWA: `rota27-comandas-v0.25.67-r1`.

## Comportamento esperado
Em **Clientes & Fidelização → Aniversários próximos**:
- o subtítulo nunca mais deve voltar à frase antiga;
- aniversariantes elegíveis futuros mostram `Autorizado • 09h30 no dia`;
- clientes sem consentimento mostram `Sem autorização`;
- clientes sem WhatsApp válido mostram `Sem WhatsApp`;
- no dia do aniversário, a camada v0.25.65 continua mostrando Agendado, Aceito pela Meta, Enviado, Entregue, Lido ou Falhou;
- o bloco `Automação de aniversário • 09:30` permanece visível mesmo após rerenders do card.

## Backend preservado
Nenhuma alteração em:
- `rota27-birthday-greeting`;
- cron `rota27-birthday-greeting-0930`;
- template Meta `aniversario_cliente_rota27_v1`;
- `whatsapp_message_log`;
- dados de clientes.

O template continua **APPROVED** e o cron continua ativo às 09:30 em `America/Sao_Paulo`.

## Performance
A correção é orientada a eventos:
- sem polling contínuo;
- sem `MutationObserver`;
- sem nova varredura periódica;
- sem requisição extra automática a cada render: a v0.25.67 reaproveita o último status já obtido pela v0.25.65.

## Arquivos principais
- `assets/v02557-upcoming-birthdays.js`
- `assets/v02567-birthday-visual-state.js`
- `assets/roadmap-loader.js`
- `index.html`
- `sw.js`
