# Revisão técnica — v0.25.80-r4

- branch baseada diretamente no merge da v0.25.80-r3 (`72387eeeb5794a8a15843482ee963442ecee3f13`);
- `behind_by=0` antes do PR;
- mudança funcional limitada ao empty state de Comandas no modo Lista;
- `#commandsEmpty` recebe a mesma classe `.v0252-map-empty` do Mapa;
- conteúdo interno canônico idêntico ao Mapa (`strong` + `span`);
- pseudo-elementos da r3 desativados;
- altura/min-height e decorações legadas neutralizadas;
- topbar r3 preservada;
- sem alteração de Supabase, WhatsApp, dados reais, Lista/Mapa funcional ou localStorage;
- sem MutationObserver e sem polling contínuo.
