# Rota 27 — Roadmap pós-piloto

Este documento registra hipóteses de melhoria. **Nada aqui entra automaticamente no produto.** Cada item precisa ser confirmado pelo uso real e pelos princípios de produto.

## P0 — Integridade e segurança operacional

### 1. Cancelamento como evento nativo + trilha de auditoria

Situação atual: a v0.15.1 propaga cancelamentos com segurança e impede que entrem no faturamento.

Evolução candidata:

- criar evento nativo `command_cancelled`/tombstone no protocolo de sync;
- registrar horário, aparelho e motivo do cancelamento;
- manter uma lista de canceladas separada das vendas, sem somar no faturamento;
- impedir qualquer reaparecimento por condição de corrida entre aparelhos.

Só priorizar se o piloto mostrar cancelamentos reais ou necessidade de auditoria.

### 2. Normalizar metadados internos de versão

A camada histórica de sincronização ainda carrega identificadores de desenvolvimento em alguns metadados internos, embora a interface e a release pública sejam v0.15.1.

Evolução candidata:

- alinhar `appVersion` enviado ao backend com a release real;
- remover textos DEV/RC restantes das camadas internas sem alterar comportamento;
- facilitar diagnóstico de aparelhos no servidor.

Baixo impacto para o atendente; fazer em janela controlada, não durante turno.

### 3. Saúde de sincronização orientada por exceção

Aprimorar apenas se houver problema real no piloto:

- diferenciar fila recente normal de fila realmente travada;
- mostrar tempo desde a última convergência somente quando houver risco;
- nunca transformar o Painel em console técnico.

## P1 — Velocidade do atendente

### 4. Busca rápida em Comandas abertas

Candidata se a operação tiver muitas comandas simultâneas.

Comportamento desejado:

- campo de busca só aparece quando o volume justificar;
- buscar mesa/local/cliente;
- não criar nova tela;
- resultado imediato.

Gate: só implementar se houver rolagem/tempo perdido para encontrar comandas.

### 5. Conferência ultrarrápida da comanda a partir da lista

Hoje o fluxo é abrir a comanda → **Ver itens**.

Candidata:

- permitir uma prévia curta dos itens sem entrar em modo de lançamento;
- não competir visualmente com **Abrir**;
- não adicionar botão se a conferência atual já for rápida no uso real.

### 6. Atalhos de lançamento baseados no turno

Já existem **Mais lançados**.

Candidata apenas se o piloto mostrar ganho claro:

- priorizar produtos mais usados naquele dia/turno;
- manter o cardápio completo abaixo;
- zero configuração manual para o atendente.

## P2 — Gestão sem atrapalhar a operação

### 7. Resumo de encerramento do turno

Candidata se o responsável realmente precisar dessa informação dentro do Rota 27.

Poderia consolidar:

- faturamento do turno;
- comandas fechadas;
- ticket médio;
- cancelamentos;
- formas de pagamento;
- conflitos/pendências antes do encerramento.

Não implementar se o estabelecimento já obtiver isso de forma melhor em outra ferramenta.

### 8. Proteção de ações administrativas

Candidata se vários atendentes usarem os mesmos aparelhos e houver risco de alteração acidental.

Possíveis ações protegidas:

- cancelar comanda com itens;
- alterar cardápio/preços;
- configurar sincronização;
- configurar WhatsApp;
- restaurar backup.

Preferência: PIN simples de gestão, sem sistema pesado de usuários, apenas se necessário.

### 9. Histórico de cancelamentos

Separado das vendas e do faturamento, útil para gestão e auditoria. Pode ser combinado com o item 1.

## P3 — Conveniência

### 10. Refinamentos visuais e microinterações

Somente após estabilização do piloto. Nenhuma mudança estética deve competir com velocidade, legibilidade ou área de toque.

## O que NÃO está recomendado agora

- criar módulo financeiro adicional;
- criar CRM;
- criar estoque completo sem demanda real;
- criar relatórios extensos que já existam em outras ferramentas da empresa;
- adicionar notificações permanentes para estados saudáveis;
- exigir login individual sem benefício operacional comprovado;
- aumentar o número de telas apenas para expor dados já disponíveis.

## Ordem de decisão após o piloto

1. corrigir qualquer P0 observado;
2. medir onde o atendente perdeu tempo;
3. escolher no máximo 1–2 melhorias P1 de maior impacto;
4. só depois avaliar gestão/P2;
5. manter a baseline estável enquanto cada novo lote é testado isoladamente.
