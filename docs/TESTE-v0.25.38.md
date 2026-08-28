# Teste v0.25.38 — Backup completo e Sandbox

## 1. Compatibilidade com backup legado
Usar um arquivo `rota27-backup-0.14-*.json` válido.

Esperado:
- arquivo aceito;
- resumo mostra comandas/histórico/produtos/clientes disponíveis;
- aviso de que o formato legado não contém todas as stores modulares;
- restauração no localhost conclui sem erro.

## 2. Backup completo
Na produção ou em ambiente local:
- abrir Histórico → Backup / Restaurar;
- clicar **Baixar backup completo**.

Validar JSON:
- `app = rota27-comandas`;
- `schema = 2`;
- `kind = full-backup`;
- `release = 0.25.38`;
- existe `storage.localStorage.rota27_comandas_v01`;
- não existem `rota27_sync_config_v1` e `rota27_whatsapp_config_v1` em `storage.localStorage`;
- chaves com `outbox` ou `cursor` não são exportadas.

## 3. Sandbox local
Executar:
```powershell
py -m http.server 8787
```
Abrir `http://localhost:8787/sandbox.html`.

Esperado:
- importação habilitada somente em localhost;
- backup legado e schema 2 aceitos;
- após importar, app abre com banner SANDBOX;
- `rota27_sync_config_v1` ausente;
- `rota27_whatsapp_config_v1` ausente;
- chamadas às Edge Functions Rota 27 ficam bloqueadas.

## 4. Consumo interno
No Sandbox:
- abrir Consumo interno / próprio;
- lançar produtos;
- finalizar consumo interno.

Esperado:
- registro em histórico interno;
- sem faturamento;
- sem forma de pagamento;
- sem A receber;
- sem WhatsApp;
- estoque controlado recebe movimento de Consumo interno.

## 5. Restauração normal
Em ambiente de teste:
- gerar backup completo A;
- alterar dados locais;
- restaurar A.

Esperado:
- antes de restaurar, download automático de backup `pre-restore`;
- dados voltam ao estado A;
- sincronização fica pausada;
- WhatsApp autenticado não é restaurado;
- nenhuma fila/cursor antigo é reativado.

## 6. PWA
Confirmar:
- badge `v0.25.38`;
- Service Worker `rota27-comandas-v0.25.38-r1`;
- `sandbox.html`, CSS e JS v0.25.38 presentes no APP_SHELL.
