# Rota 27 Bodega — v0.25.44

## Cartões de clientes com mais informações

### Objetivo
A tela de **Clientes** tinha espaço útil disponível nos cartões individuais. A v0.25.44 aproveita essa área para apresentar informações importantes sem exigir que o usuário abra cada cadastro.

### O que mudou
Cada cartão passa a exibir, quando disponível:

- data de nascimento;
- data da última compra;
- data de referência de relacionamento ("Cliente desde");
- quantidade de compras;
- valor total comprado;
- tempo desde a última visita;
- indicação compacta de presença ou ausência de WhatsApp cadastrado.

### Ícones e linguagem visual
- não foram introduzidos emojis nos novos cartões;
- os indicadores usam SVGs vetoriais monocromáticos no mesmo padrão visual já adotado nos ícones profissionais do Rota 27;
- os cartões mantêm a paleta bege/terracota, bordas, raios e hierarquia já consolidados no aplicativo;
- informações ausentes aparecem de forma explícita, sem inventar dados.

### Fonte dos dados
- aniversário: integração existente da v0.25.17, inclusive o armazenamento auxiliar usado para reidratar datas sincronizadas;
- compras e última compra: histórico local de comandas fechadas associado ao cliente;
- "Cliente desde": menor data conhecida entre o cadastro do cliente e a primeira compra associada;
- última visita: calculada a partir da última compra fechada.

### Compatibilidade e segurança
- nenhuma alteração de schema no Supabase;
- nenhuma alteração nos fluxos de WhatsApp, campanhas de aniversário ou Eventos & Convites;
- nenhuma alteração no fechamento de turno, estoque, recebíveis ou consumo interno;
- Sandbox continua sem sincronização e sem envio real;
- não foi adicionado `MutationObserver` nem polling visual contínuo; a atualização usa apenas eventos já existentes e pequenos ciclos finitos de renderização após ações relevantes.

### Arquivos principais
- `assets/v02544-client-card-details.css`
- `assets/v02544-client-card-details.js`
- `assets/v0256-release.js`
- `index.html`
- `sw.js`
- `VERSION`

### Cache PWA
`rota27-comandas-v0.25.44-r1`

### Rollback
Voltar para v0.25.43 / HEAD `5702021426842189b9fafc815deba5bdacdbea4c`.
