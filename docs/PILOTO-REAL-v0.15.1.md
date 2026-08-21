# Rota 27 — Piloto real v0.15.1

## Objetivo

Usar a v0.15.1 em ambiente real para observar velocidade, clareza, estabilidade e integridade sem alterar a baseline durante o turno.

## Antes de começar o turno

Confirmação rápida em cada aparelho que será usado:

- selo `v0.15.1`;
- internet disponível quando necessário;
- Sincronização inicializada;
- fila local de sync em `0` após convergência;
- nenhum conflito não entendido;
- WhatsApp configurado apenas nos aparelhos autorizados a enviar;
- comandas abertas existentes coerentes entre os aparelhos.

Não reinstalar PWA e não limpar dados do navegador.

## Durante a operação

O atendente deve trabalhar normalmente. Não é necessário abrir telas técnicas se tudo estiver saudável.

Observar apenas situações que realmente atrapalhem a próxima ação:

- quantidade de toques excessiva;
- dificuldade para localizar uma comanda;
- dificuldade para conferir itens lançados;
- lançamento duplicado ou perdido;
- divergência entre aparelhos;
- comanda que reaparece depois de fechar/cancelar;
- WhatsApp duplicado, atrasado ou não enviado;
- erro ao editar quantidade;
- erro no total;
- dúvida entre fechar e cancelar;
- necessidade frequente de alguma informação que não esteja acessível no fluxo atual.

## Quando NÃO interromper a operação

Não interromper o turno por:

- preferência estética;
- pedido de nova métrica;
- mudança de cor/tamanho sem impacto de uso;
- ideia de relatório que pode esperar;
- conveniência que não bloqueie a operação.

Esses pontos entram no pós-piloto.

## Quando tratar como incidente

### P0 — parar e corrigir

- perda/corrupção de dados;
- cobrança ou total incorreto;
- fechamento registrando venda errada;
- duplicação grave de comanda/venda;
- sistema impedindo a operação em todos os aparelhos.

### P1 — registrar imediatamente e avaliar correção rápida

- sync que não converge após reconexão;
- cancelamento que não propaga;
- WhatsApp duplicando mensagens;
- comanda não aparecendo em outro aparelho após tempo razoável;
- ação frequente ficando impraticável.

### P2/P3 — registrar para depois do turno

- melhoria de layout;
- novo atalho;
- nova métrica;
- novo relatório;
- conveniência de baixa frequência.

## Encerramento do turno

Antes de considerar o piloto encerrado:

- aguardar sincronização convergir;
- conferir fila local de sync em `0` nos aparelhos principais;
- revisar conflitos existentes antes de simplesmente limpá-los;
- conferir se todas as vendas fechadas esperadas aparecem no Histórico;
- conferir se comandas canceladas não entraram no faturamento;
- verificar se há mensagens de WhatsApp pendentes/falhadas relevantes;
- exportar backup JSON se houver qualquer dúvida sobre integridade ou se o turno produziu dados relevantes para análise.

## Registro de observações

Para cada problema real, registrar:

- aparelho;
- horário aproximado;
- comanda/mesa/cliente envolvido;
- o que o usuário tentou fazer;
- o que aconteceu;
- se houve impacto financeiro ou retrabalho;
- screenshot quando útil.

Evitar registrar apenas “não gostei”. O que interessa é a tarefa, a fricção e o impacto.

## Critério de sucesso do piloto

A v0.15.1 é considerada adequada para continuar em operação se:

- nenhuma venda for perdida ou duplicada;
- totais permanecerem corretos;
- sync convergir após uso simultâneo e reconexões;
- WhatsApp não duplicar mensagens;
- cancelamentos não entrarem no faturamento;
- atendente conseguir operar sem depender de telas técnicas;
- o fluxo principal for mais rápido que o processo anterior ou, no mínimo, não criar retrabalho adicional.
