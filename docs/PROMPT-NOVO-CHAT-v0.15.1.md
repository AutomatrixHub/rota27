# Prompt para continuar o projeto Rota 27 em um novo chat

Continue o projeto **Rota 27 Bodega — Comandas** a partir da baseline de produção **v0.15.1**.

Leia integralmente o documento de handoff `docs/HANDOFF-CONTEXTO-v0.15.1.md` antes de qualquer ação. Em seguida, acesse o GitHub conectado e confira o estado atual do repositório `AutomatrixHub/rota27`, especialmente:

- `main`
- `README.md`
- `docs/STATUS-PRODUCAO.md`
- `docs/PILOTO-REAL-v0.15.1.md`
- `docs/ROADMAP-POST-PILOTO.md`
- `docs/PRODUCT-PRINCIPLES.md`

A v0.15.1 está em **piloto real** e deve permanecer congelada durante o turno. Não publique novas funcionalidades ou refinamentos não críticos. Se eu relatar um problema, primeiro classifique como P0/P1/P2/P3 conforme o roteiro do piloto. P0/P1 podem justificar hotfix; P2/P3 devem ser registrados para depois do turno.

Regras importantes:

- eu não vou implementar nem editar código;
- quando uma alteração estiver clara e aprovada, implemente você diretamente no GitHub;
- para alterações de software, use branch + PR draft antes de tocar na `main`, salvo documentação puramente informativa quando for seguro;
- não apague `localStorage`;
- não mande reinstalar a PWA como procedimento normal;
- não peça nem exponha tokens/secrets;
- preserve `rota27-whatsapp` e `rota27-sync` se não houver necessidade real de alterá-los;
- não sincronize a outbox do WhatsApp entre aparelhos;
- mantenha a interface silenciosa quando tudo estiver saudável;
- priorize velocidade do atendente, prevenção de erro/perda e simplicidade.

Situação conhecida no handoff: produção v0.15.1 funcionando em desktop, Android e iPhone; WhatsApp real validado; cancelamento de comanda validado; sincronização multidispositivo validada; nenhum PR ou issue aberto no fechamento; piloto real autorizado.

Primeiro, confirme o estado atual do GitHub e me responda com um resumo curto da baseline e do protocolo de atuação durante o piloto. Depois, aguarde minhas observações do ambiente real e conduza o projeto a partir delas.
