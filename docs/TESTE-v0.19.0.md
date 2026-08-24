# Rota 27 v0.19.0 — validação final

## Estado

**VALIDADA — autorizada para produção.**

A v0.19.0 foi testada no fluxo definido e aprovada para promoção sobre a v0.18.3.

## Preview utilizada

```powershell
cd "C:\Users\marco\OneDrive\Documentos\Rota27\mvp\Rota27-comandas-git"
git fetch origin
git switch feature/v0.19.0-turn-close
git pull --ff-only
Get-Content .\VERSION
powershell -ExecutionPolicy Bypass -File ".\scripts\testar-v0190.ps1"
```

Validado:

- `VERSION` = `0.19.0`;
- preview PC/celular funcional;
- badge e título estáveis em v0.19.0;
- sem alternância com v0.18.3;
- sem travamento ou aumento anormal de CPU.

## Cenários aprovados

### Bloqueio por comanda aberta
- fechamento bloqueado enquanto existem comandas abertas;
- quantidade e valor em aberto exibidos;
- nenhum dado operacional alterado pelo bloqueio.

### Fechamento válido
- conferência final exibida;
- faturamento, fechadas, canceladas, ticket, itens, produtos e pagamentos conferidos;
- fechamento registrado com sucesso;
- Resumo do Turno passa a mostrar `Turno fechado`;
- horário e valor ficam congelados;
- registro aparece em `Fechamentos`;
- mesmo dia não pode ser encerrado novamente.

### Nova comanda após fechamento
- criação bloqueada após encerramento do dia;
- aviso operacional exibido;
- nenhuma nova comanda criada.

### Offline / sincronização
- arquitetura local-first preservada;
- fechamento possui outbox própria;
- sincronização usa evento `turn_closed` sem compartilhar filas de WhatsApp.

### Multidispositivo
- contrato preparado para convergência do fechamento por data;
- proteção contra duplicação e divergência do mesmo fechamento.

### Ajuda
- Tema Capixaba preservado;
- seção `Fechamento do turno` presente;
- rodapé `Ajuda v4.3 • v0.19.0`;
- comportamento mobile preservado.

## Regressão

Também foram preservados:

- abrir/editar/fechar comanda antes do fechamento do turno;
- lançar e remover item;
- navegação `Comandas → Cardápio → Painel → Histórico`;
- Auditoria;
- Resumo do Turno;
- WhatsApp;
- sincronização existente;
- identidade visual oficial da v0.18.3.

Resultado reportado em 24/08/2026: **tudo testado e validado**.
