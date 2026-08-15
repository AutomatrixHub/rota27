# Rota 27 Bodega — Comandas

Aplicativo mobile-first para controle rápido de comandas da **Rota 27 Bodega**.

## Estado atual

**PWA v0.11**

Funciona como aplicativo instalável no iPhone/Android e mantém os dados localmente no aparelho.

## Estrutura do repositório

```text
rota27-comandas/
├── index.html
├── manifest.webmanifest
├── sw.js
├── .nojekyll
├── .gitignore
├── README.md
├── VERSION
├── assets/
│   └── logo-rota27.png
├── icons/
│   ├── apple-touch-icon.png
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── icon-192-maskable.png
│   ├── icon-512-maskable.png
│   └── favicon-32.png
└── docs/
    └── PUBLICACAO.md
```

## GitHub Pages

1. **Settings → Pages**
2. **Build and deployment → Deploy from a branch**
3. Branch: `main`
4. Pasta: `/(root)`
5. **Save**

## Instalar no iPhone

1. Abra o endereço HTTPS no **Safari**.
2. Toque em **Compartilhar**.
3. Escolha **Adicionar à Tela de Início**.
4. Ative **Abrir como App da Web**, se a opção aparecer.
5. Toque em **Adicionar**.

## Dados

Comandas, cardápio, categorias e histórico são armazenados localmente no dispositivo nesta versão.

**Ainda não há sincronização entre celulares.**
