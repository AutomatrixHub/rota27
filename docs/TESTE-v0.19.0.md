# Rota 27 v0.19.0 — teste da candidata

## Estado

**CANDIDATA — produção permanece na v0.18.3 até aprovação.**

## Abrir a preview

```powershell
cd "C:\Users\marco\OneDrive\Documentos\Rota27\mvp\Rota27-comandas-git"
git fetch origin
git switch feature/v0.19.0-turn-close
git pull --ff-only
Get-Content .\VERSION
powershell -ExecutionPolicy Bypass -File ".\scripts\testar-v0190.ps1"
```

Esperado:

- `VERSION` = `0.19.0`;
- preview PC em `http://localhost:3022/?preview=v0190`;
- endereço `CELULAR:` exibido no PowerShell;
- badge e título mostram v0.19.0 sem alternância com v0.18.3;
- sem travamento ou aumento anormal de CPU.

## Cenário A — bloqueio por comanda aberta

1. deixe pelo menos uma comanda aberta;
2. abra `Histórico`;
3. no Resumo do Turno, toque `Fechar turno`.

Esperado:

- a conferência mostra a quantidade/valor em aberto;
- `Fechar turno agora` fica indisponível;
- nenhuma informação é apagada ou modificada.

## Cenário B — fechamento válido

1. feche/cancele as comandas de teste até não restar nenhuma aberta;
2. confira o Resumo do Turno;
3. toque `Fechar turno`;
4. confira faturamento, fechadas, canceladas, ticket, itens e formas de pagamento;
5. confirme o fechamento final.

Esperado:

- mensagem de sucesso;
- Resumo do Turno passa a mostrar `Turno fechado`;
- aparece horário do fechamento e o valor congelado;
- `Fechamentos` lista o registro do dia;
- o mesmo dia não pode ser fechado novamente.

## Cenário C — bloqueio de nova comanda após fechamento

Depois do Cenário B, toque no botão de nova comanda.

Esperado:

- a folha de nova comanda não abre;
- aparece aviso de que o turno já foi fechado;
- nenhuma comanda nova é criada.

## Cenário D — offline

Este cenário deve ser executado somente se ainda não houver fechamento do dia no aparelho de teste.

1. fique offline;
2. mantenha zero comandas abertas e zero cancelamentos pendentes;
3. feche o turno.

Esperado:

- o fechamento é permitido com aviso de que está offline;
- o registro fica salvo localmente;
- `Fechamentos` indica pendência de sincronização;
- ao voltar online, a pendência desaparece depois do sync.

## Cenário E — multidispositivo

Em dois aparelhos com sincronização configurada:

1. faça o fechamento em um aparelho;
2. aguarde sincronização no segundo;
3. abra `Histórico → Fechamentos` no segundo.

Esperado:

- o registro aparece no segundo aparelho;
- novas comandas também ficam bloqueadas no segundo aparelho naquele dia;
- não há duplicação do fechamento.

## Cenário F — Ajuda

Abra `? Ajuda`.

Esperado:

- Tema Capixaba preservado;
- nova seção `Fechamento do turno`;
- rodapé `Ajuda v4.3 • v0.19.0`;
- no celular, cabeçalho continua sem sobreposição.

## Smoke de regressão

Além dos testes acima:

- abrir/editar/fechar comanda antes do fechamento do turno;
- lançar e remover item;
- navegar por Comandas, Cardápio, Painel e Histórico;
- abrir Auditoria;
- conferir Resumo do Turno;
- confirmar que WhatsApp e sync continuam sem mudanças de fluxo.

Não limpar localStorage e não reinstalar a PWA para testar esta candidata.
