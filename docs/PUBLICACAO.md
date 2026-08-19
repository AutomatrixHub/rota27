# Publicação no GitHub Pages

## 1. Repositório

Repositório atual:

`AutomatrixHub/rota27`

## 2. Enviar os arquivos

Todo o conteúdo da PWA deve ficar na **raiz da branch `main`**.

## 3. Ativar GitHub Pages

1. **Settings**
2. **Pages**
3. **Deploy from a branch**
4. Branch: `main`
5. Folder: `/(root)`
6. **Save**

## 4. Instalar no iPhone

Abra o endereço HTTPS no Safari:

**Compartilhar → Adicionar à Tela de Início → Abrir como App da Web → Adicionar**

## 5. Atualizações futuras

Quando houver alteração nos arquivos que compõem a PWA offline, altere também `CACHE_NAME` em `sw.js`.

Exemplo para a versão atual:

`rota27-comandas-v0.13`

Isso força a atualização dos arquivos em cache nos dispositivos instalados.

## 6. Backend WhatsApp

A publicação do GitHub Pages não faz deploy automático da Edge Function do Supabase.

Quando `supabase/functions/rota27-whatsapp/index.ts` for alterado, mantenha o código do GitHub sincronizado com a versão efetivamente publicada no Supabase.

A função usa autenticação própria por `x-rota27-device-token` e permanece com `verify_jwt=false`.

Nunca publique credenciais reais da Meta ou Secrets do Supabase no repositório.
