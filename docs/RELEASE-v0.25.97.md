# Rota 27 v0.25.97 — candidata de estabilização

## Estado
Produção homologada no Android e promovida pelo PR #140.

## Problemas observados
1. A Topbar antiga ainda podia aparecer transitoriamente durante o carregamento.
2. Em Nova comanda, tocar em **Abrir comanda** podia não produzir efeito nem mensagem visível.

## Causa da Nova comanda
As camadas históricas v0.25.37, v0.25.39 e v0.25.54 encapsulam `openNewCommandSheet`. A raiz v0.25.70 ainda chamava a função anterior e, conforme a ordem das referências globais no navegador, essa cadeia podia voltar à própria raiz. O resultado era `RangeError: Maximum call stack size exceeded`, silencioso para o operador.

## Correções
- v0.25.70 passa a executar diretamente a abertura canônica da folha, sem percorrer novamente wrappers históricos;
- as camadas visuais v0.25.5/v0.25.6 passam a ser encapsuladas somente uma vez, impedindo um segundo ciclo em `renderCommands`;
- a Topbar permanece invisível enquanto a composição atual não estiver pronta;
- o badge de primeiro paint é fixado em v0.25.97;
- URLs dos recursos corrigidos recebem nova identidade de cache;
- Service Worker e VERSION avançam para v0.25.97.

## Preservações
- nenhuma migration ou alteração de schema;
- nenhuma alteração em Supabase ou Edge Functions;
- nenhum envio de WhatsApp adicionado;
- nenhum dado de produção excluído ou regravado;
- nenhuma remoção de código legado nesta candidata.

## Testes obrigatórios antes do merge
1. Recarregar várias vezes e confirmar que a Topbar antiga não aparece.
2. Abrir Nova comanda, preencher os campos mínimos e tocar em **Abrir comanda**.
3. Confirmar que a tela de lançamentos da comanda é exibida.
4. Repetir em Modo Teste, sem configurar sincronização.
5. Fechar e reabrir o PWA para verificar atualização e funcionamento offline do shell.
6. Confirmar que não há erro de recursão no console.

## Rollback
Produção congelada: v0.25.96, tag `production-v0.25.96-freeze`.
