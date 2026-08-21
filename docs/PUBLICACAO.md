# Publicação no GitHub Pages

## 1. Repositório

Repositório atual:

`AutomatrixHub/rota27`

## 2. Branch de produção

A produção é publicada a partir da **branch `main`**, pasta `/(root)`.

A **v0.15.1 está publicada na `main`** e é a versão atual de produção.

## 3. Estrutura da v0.15.1

A entrada pública é `index.html`. A base histórica permanece em `base-v013.html`, e o loader final injeta as camadas consolidadas da v0.14, v0.15 e hotfix v0.15.1.

Arquivos essenciais para a PWA final:

- `index.html`
- `base-v013.html`
- `manifest.webmanifest`
- `sw.js`
- `assets/v014.css`
- `assets/v014.js`
- `assets/v014-dev3.css`
- `assets/v014-dev3.js`
- `assets/v014-rc2-category-fix.js`
- `assets/v014-final.js`
- `assets/v015.css`
- `assets/v015-sync.js`
- `assets/v015-dev2.css`
- `assets/v015-dev2.js`
- `assets/v015-dev3.css`
- `assets/v015-dev3.js`
- `assets/v015-dev4.css`
- `assets/v015-dev4.js`
- `assets/v015-rc2-ops.css`
- `assets/v015-rc2-ops.js`
- `assets/v015-rc3-items.css`
- `assets/v015-rc3-items.js`
- `assets/v0151-hotfix.css`
- `assets/v0151-hotfix.js`
- `assets/v015-final.js`
- ícones em `icons/`

## 4. GitHub Pages

Configuração esperada:

1. **Settings**
2. **Pages**
3. **Deploy from a branch**
4. Branch: `main`
5. Folder: `/(root)`

URL pública:

`https://automatrixhub.github.io/rota27/`

## 5. Atualização dos aparelhos existentes

O Service Worker da produção usa:

`rota27-comandas-v0.15.1`

Quem já possui a PWA instalada não precisa reinstalar.

Após a publicação:

1. abrir o Rota 27 conectado à internet;
2. aguardar alguns segundos;
3. fechar completamente o app;
4. abrir novamente;
5. confirmar o selo `v0.15.1` e a sincronização saudável.

Não limpar dados do Safari/Chrome nem remover a PWA, pois comandas, configurações e filas operacionais são locais.

## 6. Smoke test pós-publicação

Após qualquer promoção para `main`, confirmar na URL pública real:

- selo da versão atual;
- comandas existentes preservadas;
- Painel abrindo normalmente;
- Histórico e Cardápio acessíveis;
- uma comanda abrindo e aceitando lançamento;
- **Ver itens** exibindo todos os itens da comanda;
- sincronização com fila local zerada após convergência;
- uma atualização simples chegando a outro aparelho;
- WhatsApp enviando uma atualização sem duplicidade;
- cancelamento de uma comanda de teste removendo-a da operação sem registrar venda;
- recarregamento e segunda abertura funcionando;
- PWA continuando funcional offline para a operação local.

## 7. Backend WhatsApp

A publicação do GitHub Pages não faz deploy automático da Edge Function do Supabase.

A Edge Function validada `rota27-whatsapp` permanece separada do pacote PWA. Se `supabase/functions/rota27-whatsapp/index.ts` for alterado no futuro, o arquivo do GitHub deve continuar refletindo a versão efetivamente publicada no Supabase.

A função usa autenticação própria por `x-rota27-device-token` e permanece com `verify_jwt=false`.

## 8. Backend de sincronização

A Edge Function `rota27-sync` também permanece separada da publicação da PWA. Alterações nessa função exigem teste específico antes de produção porque podem afetar todos os aparelhos simultaneamente.

## 9. Disciplina durante operação real

Durante um turno real, não publicar melhorias cosméticas ou experimentais. Uma alteração em produção durante a operação só se justifica quando houver:

- risco de perda de dados;
- cobrança incorreta;
- indisponibilidade relevante;
- falha de sincronização que impeça a operação;
- falha de WhatsApp com impacto operacional importante.

Demais observações devem ser registradas para o próximo ciclo, sem modificar a baseline durante o turno.

## 10. Segurança

Nunca publicar credenciais reais da Meta, tokens de dispositivo ou Secrets do Supabase no repositório.
