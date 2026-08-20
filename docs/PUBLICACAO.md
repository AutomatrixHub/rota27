# Publicação no GitHub Pages

## 1. Repositório

Repositório atual:

`AutomatrixHub/rota27`

## 2. Branch de produção

A produção é publicada a partir da **branch `main`**, pasta `/(root)`.

A **v0.14 está publicada na `main`** e é a versão atual de produção.

## 3. Estrutura da v0.14

A entrada pública é `index.html`. A base estável da v0.13 fica preservada em `base-v013.html`, e o loader final injeta as camadas da v0.14.

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
- ícones em `icons/`

## 4. GitHub Pages

1. **Settings**
2. **Pages**
3. **Deploy from a branch**
4. Branch: `main`
5. Folder: `/(root)`
6. **Save**

## 5. Atualização dos aparelhos existentes

O Service Worker da produção usa:

`rota27-comandas-v0.14`

Quem já possui a PWA instalada não precisa reinstalar.

Após a publicação:

1. abrir o Rota 27 conectado à internet;
2. aguardar o carregamento;
3. fechar completamente o app;
4. abrir novamente.

Não limpar dados do Safari nem remover a PWA, pois as comandas e configurações operacionais são locais.

## 6. Smoke test pós-publicação

Após qualquer promoção para a `main`, abrir a URL pública real do GitHub Pages e confirmar:

- badge da versão atual;
- comandas existentes preservadas;
- Histórico & resultados;
- Cardápio e importação;
- Backup / Restaurar;
- configuração WhatsApp preservada no aparelho;
- pelo menos um lançamento simples sem erro;
- recarregamento e segunda abertura funcionando.

## 7. Backend WhatsApp

A publicação do GitHub Pages não faz deploy automático da Edge Function do Supabase.

A Edge Function já validada permanece separada do pacote PWA. Quando `supabase/functions/rota27-whatsapp/index.ts` for alterado no futuro, mantenha o GitHub sincronizado com a versão efetivamente publicada no Supabase.

A função usa autenticação própria por `x-rota27-device-token` e permanece com `verify_jwt=false`.

Nunca publique credenciais reais da Meta ou Secrets do Supabase no repositório.
