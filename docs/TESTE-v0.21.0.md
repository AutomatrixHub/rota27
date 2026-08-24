# Rota 27 v0.21.0 — teste da candidata

## Estado
**CANDIDATA — produção permanece na v0.20.0 até aprovação.**

## Abrir a preview
```powershell
cd "C:\Users\marco\OneDrive\Documentos\Rota27\mvp\Rota27-comandas-git"
git fetch origin
git switch feature/v0.21.0-essential-stock
git pull --ff-only
Get-Content .\VERSION
powershell -ExecutionPolicy Bypass -File ".\scripts\testar-v0210.ps1"
```

Esperado:
- `VERSION` = `0.21.0`;
- PC em `http://localhost:3024/?preview=v0210`;
- endereço `CELULAR:` exibido no PowerShell;
- sem travamento ou uso anormal de CPU.

## Regressão crítica — Painel estável
1. abra `Painel` e permaneça nele por pelo menos 15 segundos;
2. observe os cards `Visão Gerencial` e `Estoque Essencial`;
3. navegue para outra tela e volte ao Painel;
4. abra e feche a Ajuda.

Esperado:
- `Visão Gerencial` não desaparece nem pisca periodicamente;
- `Estoque Essencial` permanece estável no mesmo lugar;
- tela continua responsiva;
- botões e navegação respondem imediatamente;
- Ajuda abre sem aumento anormal de CPU ou travamento;
- nenhum card é recriado de forma visível durante o refresh legado do Painel.

## Cenário A — ativar controle
1. abra `Painel → Estoque Essencial`;
2. altere o filtro para `Todos`;
3. escolha um produto;
4. toque `Configurar`;
5. marque `Controlar estoque deste produto`;
6. informe estoque inicial `10` e mínimo `3`.

Esperado:
- produto passa a mostrar estoque 10;
- comprometido 0;
- disponível projetado 10;
- sem alerta enquanto estiver acima do mínimo.

## Cenário B — projeção em comanda aberta
1. abra uma comanda;
2. lance 2 unidades do produto controlado;
3. volte ao Estoque.

Esperado:
- Estoque = 10;
- Comprometido = 2;
- Disponível projetado = 8;
- o saldo definitivo ainda não baixa.

Remova 1 unidade da comanda.
Esperado: comprometido 1 e disponível projetado 9.

## Cenário C — baixa no fechamento
Feche a comanda normalmente, com pagamento confirmado.

Esperado:
- saldo definitivo reduz somente após o fechamento;
- comprometido volta a zero para aquela comanda;
- histórico do estoque registra movimento `Venda`;
- reabrir/navegar/sincronizar não duplica a baixa.

## Cenário D — movimentos manuais
No produto controlado, teste:
- Entrada +5;
- Perda -1;
- Consumo interno -1;
- Ajuste de saldo para outro valor válido.

Esperado:
- cada movimento altera o saldo corretamente;
- todos aparecem em `Histórico`;
- tentativa de perda/consumo maior que o estoque é bloqueada.

## Cenário E — mínimo e indisponibilidade
Leve o produto até saldo/disponível projetado menor ou igual ao mínimo.

Esperado:
- Painel passa a chamar atenção;
- filtro `Atenção` lista o produto;
- ao chegar a zero disponível projetado, novo lançamento desse produto é bloqueado;
- produtos sem controle de estoque continuam sem bloqueio.

## Cenário F — offline
1. fique offline;
2. registre uma Entrada;
3. confira o saldo;
4. volte online.

Esperado:
- movimento é salvo e aplicado localmente mesmo offline;
- fila de sync aparece enquanto pendente;
- ao voltar online, a pendência zera após sincronização.

## Cenário G — multidispositivo
Com dois aparelhos sincronizados:
1. ative/configure produto no aparelho A;
2. aguarde o B receber configuração;
3. registre uma entrada no A;
4. confira o B;
5. faça uma venda no B;
6. confira convergência no A.

Esperado:
- configurações convergem;
- movimentos são aditivos e idempotentes;
- baixa de venda não duplica.

## Cenário H — Visão Gerencial e demonstração
1. abra `Painel → Visão Gerencial`;
2. confirme que a tela da v0.20.0 continua disponível;
3. teste `Ver dados de demonstração` e `Voltar aos dados reais`.

Esperado:
- Visão Gerencial preservada;
- demonstração continua somente em memória;
- CSV continua bloqueado na demonstração;
- dados reais não são alterados.

## Cenário I — Ajuda
Esperado:
- seção `Visão Gerencial` preservada;
- nova seção `Estoque Essencial`;
- rodapé `Ajuda v4.5 • v0.21.0`;
- cabeçalho mobile sem sobreposição;
- nenhum loop de MutationObserver ao atualizar o rodapé da Ajuda.

## Regressão mínima
- abrir/editar/fechar/cancelar comanda;
- lançar/remover itens sem estoque controlado;
- Fechamento do Turno;
- Histórico e Auditoria;
- Visão Gerencial;
- WhatsApp cliente/gerente;
- sync normal de comandas, clientes e cardápio.

Não limpar `localStorage` e não reinstalar a PWA para testar.
