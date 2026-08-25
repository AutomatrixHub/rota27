# Rota 27 Bodega — Comandas

Aplicativo mobile-first, offline-first e multidispositivo para controle rápido de comandas da **Rota 27 Bodega**.

## Produção

**Versão: v0.25.1 — Navegação & Configurações**  
Branch: `main`  
GitHub Pages: `https://automatrixhub.github.io/rota27/`  
Service Worker: `rota27-comandas-v0.25.1-r1`

A v0.25.1 preserva integralmente a funcionalidade da v0.25.0 e reorganiza a arquitetura de navegação para separar melhor operação, cardápio, administração e histórico.

## Arquitetura de navegação

Regra mental da interface:
- **Comandas = atender**;
- **Cardápio = o que é vendido**;
- **Painel = administrar o negócio**;
- **Histórico = o que aconteceu**.

### Cardápio
Fica dedicado a:
- produtos;
- categorias;
- preços;
- importação/exportação;
- busca e edição.

Clientes, WhatsApps e Sincronização não aparecem mais nessa tela.

### Painel
Passa a concentrar administração e integrações.

Bloco **Relacionamento**:
- Clientes & Fidelização.

Bloco **Configurações & Integrações**:
- WhatsApp da comanda;
- WhatsApp do gerente;
- Sincronização entre aparelhos.

Os novos acessos reutilizam os fluxos/configuradores existentes. Nenhum cadastro, token ou configuração foi duplicado.

## Clientes & Fidelização — v0.25
Acesso em `Painel → Relacionamento → Clientes & Fidelização`.

A Central possui:
- Visão geral;
- Clientes;
- Para lembrar.

Métricas e sinais derivados:
- visitas, total identificado, ticket médio e itens;
- primeira e última visita;
- ritmo médio;
- produtos/categorias preferidos;
- níveis Novo / Recorrente / Frequente / Cliente da casa;
- Sumido;
- marcos de 5/10 visitas;
- cadastro frequente sem WhatsApp;
- oportunidade `Preferido chegou recentemente`.

O WhatsApp de relacionamento permanece exclusivamente manual: o sistema apenas monta um rascunho contextual para o proprietário revisar e decidir se envia.

## Estoque, Compras, Inventário e Custos
Permanecem preservados:
- Estoque Essencial;
- Compras & Reposição;
- edição de pedidos em rascunho;
- recebimento parcial/total;
- Inventário & Conferência;
- Custos & Margem;
- histórico e CSVs.

Regra financeira preservada: **preço de venda nunca substitui custo de aquisição**.

## Sincronização e backend
O Rota 27 permanece local-first e multidispositivo.

A v0.25.1 não cria:
- novo evento de sincronização;
- tabela ou migration;
- nova Edge Function.

Backend preservado:
- `rota27-sync`: versão 7 ACTIVE (`rota27-sync-v0.23.0`);
- `rota27-audit`: versão 1 ACTIVE;
- `rota27-whatsapp`: versão 23 ACTIVE (`rota27-whatsapp-v6-mini2`);
- `rota27-whatsapp-inbound`: versão 1 ACTIVE.

## Estabilidade
A reorganização foi implementada como camada final de UI.

Preservar a regra consolidada desde a v0.21:
- não adicionar polling visual frequente;
- não adicionar `MutationObserver` concorrente ao Painel.

A camada v0.25.1 não adiciona `setInterval` nem `MutationObserver`.

## Validação da v0.25.1
A candidata foi testada e aprovada pelo proprietário em 25/08/2026.

Foram validados:
- Cardápio sem os quatro blocos administrativos;
- Painel com Relacionamento e Configurações & Integrações;
- Clientes & Fidelização abrindo pelo novo local;
- WhatsApp da comanda abrindo o configurador existente;
- WhatsApp do gerente abrindo o fluxo existente;
- Sincronização abrindo o configurador existente;
- configurações previamente salvas preservadas;
- layout mobile;
- ausência de regressão crítica relatada no teste.

Baseline de rollback: **v0.25.0 — Clientes & Fidelização**.

## Tema e Ajuda
- operação em laranja, preto e creme/marfim;
- verde/amarelo/vermelho reservados a estados funcionais;
- Ajuda **v5.2** inclui a nova localização de Clientes e configurações.

## Atualização da PWA
Quem já possui o Rota 27 instalado não precisa reinstalar:
1. manter internet ativa;
2. abrir a PWA e aguardar 10–20 segundos;
3. fechar completamente;
4. abrir novamente;
5. confirmar `v0.25.1` e sincronização saudável.

**Não limpar dados do navegador e não remover a PWA para atualizar.**

## Documentos principais
- `docs/RELEASE-v0.25.1.md`
- `docs/STATUS-PRODUCAO.md`
- `docs/HANDOFF-CONTEXTO-v0.25.1.md`
- `docs/TESTE-v0.25.1.md`
- `docs/ESPEC-v0.25.1.md`
- `docs/RELEASE-v0.25.0.md`
- `docs/HANDOFF-CONTEXTO-v0.25.0.md`
- `docs/PRODUCT-PRINCIPLES.md`

## Versão
Produção: **0.25.1**
