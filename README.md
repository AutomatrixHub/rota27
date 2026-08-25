# Rota 27 Bodega — Comandas

Aplicativo mobile-first, offline-first e multidispositivo para controle rápido de comandas da **Rota 27 Bodega**.

## Produção

**Versão: v0.25.5 — Mapa Refinado & Cópia Fixa de WhatsApp**  
Branch: `main`  
GitHub Pages: `https://automatrixhub.github.io/rota27/`  
Service Worker: `rota27-comandas-v0.25.5-r1`

## Navegação
- **Comandas = atender**;
- **Cardápio = o que é vendido**;
- **Painel = administrar o negócio**;
- **Histórico = o que aconteceu**.

## Comandas — Lista + Mapa
O Mapa continua organizando as mesmas comandas abertas em Mesas, Balcão, Parklet, Clientes e Outros locais.

### v0.25.5 — card compacto refinado
- Balcão: o cliente passa a ser o título principal; `Balcão` vira contexto secundário;
- Mesas/Parklet: o identificador espacial continua em primeiro plano;
- faixa preta pesada removida do card compacto;
- acento lateral reduzido a um traço laranja de 3 px;
- fundo, moldura, sombra e tipografia continuam coerentes com a Lista;
- cards permanecem compactos e clicáveis.

## WhatsApp — segunda cópia fixa
Além do WhatsApp do gerente, os lançamentos de comanda também são enviados para o número fixo:

`+55 27 99776-9279` (`5527997769279`)

Regras:
- usa o mesmo backend/template operacional já existente;
- fila e retry próprios;
- sem campo de configuração;
- se o gerente estiver configurado com o mesmo número, não envia duplicado;
- se o próprio cliente da comanda usar esse mesmo número com opt-in, também evita duplicidade.

O aparelho onde o lançamento ocorre precisa continuar com a integração de WhatsApp configurada.

## Painel e módulos preservados
Permanecem Visão Gerencial, Estoque Essencial, Compras & Reposição, Clientes & Fidelização, Inventário & Conferência, Custos & Margem e sincronização multidispositivo.

## Backend
A v0.25.5 não cria Edge Function, tabela, migration ou tipo de evento novo. A nova cópia reutiliza `rota27-whatsapp` já existente.

## Ajuda
Ajuda **v5.6** identifica a release v0.25.5 e explica a cópia fixa.

## Atualização da PWA
Não limpar dados nem reinstalar. Abra a PWA online, aguarde 20–30 segundos, feche completamente e abra novamente.

## Documentos
- `docs/RELEASE-v0.25.5.md`
- `docs/HANDOFF-CONTEXTO-v0.25.5.md`
- `docs/VALIDACAO-v0.25.5.md`
- `docs/STATUS-PRODUCAO.md`

Baseline de rollback: **v0.25.4**.

## Versão
Produção: **0.25.5**
