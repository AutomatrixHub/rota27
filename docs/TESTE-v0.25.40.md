# Teste — v0.25.40 Eventos & Convites

1. Atualizar o app até o badge `v0.25.40`.
2. Abrir **Painel → Clientes & Fidelização → Clientes**.
3. Editar um cliente de teste com WhatsApp válido.
4. Marcar **Autoriza convites e novidades pelo WhatsApp** e salvar.
5. Voltar à lista de clientes e abrir **Eventos & Convites**.
6. Criar evento com título, data, horário, descrição/chamada e imagem.
7. Confirmar a prévia da imagem.
8. Abrir **Preparar divulgação**.
9. Testar os filtros: Todos autorizados, Recorrentes, Frequentes e Sem voltar há 30+ dias.
10. Confirmar seleção individual de clientes.
11. Consultar status do template `convite_evento_rota27_v1`.
12. Se `NOT_SUBMITTED`, usar **Solicitar template**.
13. Enquanto não estiver `APPROVED`, confirmar que **Enviar convites** fica bloqueado.
14. Quando aprovado, enviar primeiro para um cliente de teste autorizado.
15. Confirmar registro em `whatsapp_message_log` com `event_id` iniciado por `event_invite_v1::`.
16. Tentar reenviar o mesmo evento para o mesmo cliente e confirmar proteção contra duplicidade.

## Sandbox
No `?sandbox=1`, criar e editar eventos e selecionar público, mas confirmar que solicitar template e enviar convites permanecem bloqueados.

## Não regressão
- abrir/fechar comandas normais;
- consumo interno;
- Clientes & Fidelização;
- campanha de aniversário;
- Backup completo/Sandbox;
- Histórico e Painel.
