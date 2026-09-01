# Release v0.25.91 — Fechamento fixo em listas longas

## Objetivo

Evitar que o usuário precise rolar listas longas até o topo apenas para sair da tela.

## Alterações

### Clientes
- mantém o botão `X` original no cabeçalho;
- quando esse botão sai da área visível durante a rolagem, surge um botão flutuante fixo `×`;
- o botão flutuante executa exatamente o mesmo fechamento de `#v017ClientsWrap`;
- ao voltar ao topo, o botão flutuante some para evitar duplicidade visual.

### Cardápio / Produtos
- adiciona um botão flutuante fixo `×` enquanto `#screenMenu` estiver ativo;
- o controle fica acima da navegação inferior e não acompanha a rolagem;
- ao tocar, retorna para `Comandas`, que é a tela principal operacional;
- o botão é ocultado quando existe um modal/sheet por cima do Cardápio, evitando fechar a tela errada.

## Visual e acessibilidade
- área de toque de aproximadamente 50–52 px;
- respeita `safe-area-inset-bottom`;
- não cobre a barra de navegação inferior;
- possui `aria-label` e `title` descritivos;
- acompanha automaticamente a paleta do Modo Teste Global.

## Segurança operacional
- nenhuma alteração em Supabase;
- nenhuma migration;
- nenhuma mudança em Edge Functions;
- nenhuma mudança em sync, WhatsApp, comandas, clientes, produtos ou estoque;
- recurso exclusivamente de navegação/interface.

## PWA
- release: `0.25.91`;
- cache: `rota27-comandas-v0.25.91-r1`;
- novos assets no App Shell:
  - `assets/v02591-floating-close.css`;
  - `assets/v02591-floating-close.js`.

## Baseline anterior
- v0.25.90;
- merge: `b3e0c3ba63a5e801e67ae6e23fa75f1c728c27a8`.
