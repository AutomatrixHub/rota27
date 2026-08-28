# Rota 27 v0.25.38 — Backup completo e Modo Sandbox

## Objetivo
Substituir o fluxo legado de backup/restauração da v0.14 por uma solução compatível com o aplicativo atual, multidispositivo e modular, e criar um ambiente Sandbox seguro para testes locais com cópia de dados reais.

## Correção do backup/restauração
O botão **Backup / Restaurar** continua no Histórico, mas passa a abrir a camada v0.25.38.

### Backup completo — schema 2
O novo pacote exporta todas as chaves locais do Rota 27 consideradas dados de domínio, incluindo o estado principal e stores modulares presentes no aparelho, como fechamentos, estoque, compras, inventário, custos, recebíveis e estados auxiliares quando existirem.

Não são exportados:
- token do dispositivo;
- configuração de sincronização;
- configuração autenticada do WhatsApp;
- filas/outboxes;
- cursores de sincronização;
- estados temporários de adoção/restauração;
- marcador de Sandbox.

Campos com nomes de segredo (`deviceToken`, `token`, `secret`, `authorization`, `accessToken`, `refreshToken`, `apiKey`, `password`) também são removidos recursivamente de valores JSON exportados.

### Compatibilidade com backup legado — schema 1
Backups antigos no formato v0.14 continuam aceitos quando contêm:
- `app: rota27-comandas`;
- `schema: 1`;
- `state.commands`;
- `state.history`;
- `state.catalog`.

O backup legado restaura apenas o núcleo disponível naquele formato. A restauração grava diretamente o armazenamento principal e recarrega o aplicativo, evitando o caminho antigo que reatribuía o estado em memória durante a execução das camadas modernas.

### Restauração segura no aparelho
Antes de aplicar uma restauração normal, a v0.25.38 baixa automaticamente um backup completo do estado atual. Após restaurar:
- a sincronização local é pausada (`enabled=false`, `initialized=false`);
- a configuração autenticada do WhatsApp é removida do aparelho;
- filas e cursores são limpos;
- a página é recarregada.

Isso evita replay involuntário dos dados restaurados para o backend.

## Modo Sandbox
Arquivo permanente: `sandbox.html`.

O Sandbox só permite importação quando a página está em:
- `localhost`;
- `127.0.0.1`;
- `::1`.

Ao importar:
1. o armazenamento do localhost é limpo;
2. os dados seguros do backup são gravados;
3. configurações de sincronização e WhatsApp são removidas;
4. é gravado `rota27_v02538_sandbox_v1`;
5. caches e Service Workers da origem local são limpos;
6. o app reabre com banner **SANDBOX**.

Enquanto o marcador Sandbox estiver ativo, a camada v0.25.38 também bloqueia chamadas `fetch` para as Edge Functions `rota27-*` / projeto Supabase de produção.

## Fluxo recomendado de teste
Na produção:
1. Histórico → **Backup / Restaurar**;
2. **Baixar backup completo**.

No computador:
```powershell
git clone https://github.com/AutomatrixHub/rota27.git
cd rota27
git switch main
git pull
py -m http.server 8787
```

Abrir:
`http://localhost:8787/sandbox.html`

Selecionar o backup completo e usar **Importar e abrir Sandbox**.

## Consumo interno
A v0.25.37 permanece integralmente preservada. O Sandbox foi criado especialmente para permitir validar esse tipo de fluxo mesmo quando o turno real de produção já estiver fechado.

## Backend
Nenhuma alteração em Supabase, Edge Functions, constraints ou tipos de evento.

## Service Worker
`rota27-comandas-v0.25.38-r1`

## Rollback
Baseline anterior: v0.25.37 / commit `a1b3e113924509a9e0cac4143c661ad2ac3e16c4`.
