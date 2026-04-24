---
name: caixa-e-encantos
description: Orienta qualquer edição no monorepo da loja "Caixa e Encantos" — Next.js 16 + tRPC v11 + Drizzle + Postgres. Use ao tocar produtos, carrinho, admin, checkout por WhatsApp, ou qualquer coisa em apps/web ou packages/{api,db,ui,validators}.
---

# Caixa e Encantos — guia de contribuição

## Visão geral

Loja web de caixas artesanais personalizadas. Não processa pagamento — todo checkout é encaminhado para WhatsApp.

**Stack**: pnpm + turbo + Next.js 16 (App Router) + React 19 + Tailwind v4 + tRPC v11 (via `@trpc/tanstack-react-query`) + Drizzle ORM + Postgres.

## Estrutura

```
apps/web/              # storefront (público) + admin (/admin)
packages/
├── api/               # tRPC routers — `productRouter` + `createTRPCContext`
├── db/                # Drizzle schema (Product, ProductMedia) + client postgres-js
├── ui/                # shadcn/ui components (radix + cva)
└── validators/        # zod schemas compartilhados (cartItem, checkout)
tooling/{eslint,prettier,tailwind,typescript}
```

Packages usam namespace `@caixa/*` (ex.: `@caixa/api`, `@caixa/db/schema`, `@caixa/ui/button`).

## Modelo de dados — regras de ouro

Tabela única `product` com **auto-relação**:

- `parentId` → outro `product.id`. Um "sabonete" pode ser filho de uma "caixa das mães". Uma caixa não tem parent (parentId = NULL).
- `priceCents` é **opcional**: item pode ser "sob consulta" ou parte de uma caixa composta.
- `hidden: boolean` — não aparece no catálogo público quando `true`. Admin vê tudo.
- `paymentMethods: PaymentMethod[]` (array Postgres `text[]`) — `pix | credito | debito | ted`. Default aceita todos.
- Dimensões em **mm** (`widthMm`, `heightMm`, `depthMm`) — formatadas para exibição pela `formatDimensions()` em `apps/web/src/lib/format.ts`.
- Mídia em tabela separada `product_media` (kind = `image | video`, url, alt, sortOrder).

**NUNCA** crie tabelas separadas para "caixa" vs "item". É tudo `product`. Diferencie pelo `parentId` + querys.

## Router tRPC (packages/api/src/router/product.ts)

- `catalog` (pública): top-level (parentId null) e não-hidden, ordenado por createdAt desc, inclui primeira mídia.
- `bySlug` (pública): produto + mídia + filhos não-hidden. 404 se hidden.
- `byIds` (pública): usada pelo carrinho para resync (nunca exponha produtos hidden).
- `adminAll`, `adminById`, `create`, `update`, `delete`, `toggleHidden`, `addMedia`, `removeMedia` → `adminProcedure`.

**`adminProcedure`** só checa presença do cookie `admin-session`. Middleware Next (`apps/web/src/middleware.ts`) valida o HMAC antes; a tRPC context só reflete a presença do cookie. Se adicionar nova mutation de admin, use `adminProcedure` — nunca `publicProcedure`.

## Carrinho (apps/web/src/lib/cart-store.ts)

- **zustand** com `persist` em `localStorage` (`caixa-cart-v1`).
- Cada `CartEntry` tem `lineId` (uuid client-gen), `productId`, `quantity`, `childIds[]` (ids dos filhos escolhidos para compor a caixinha), `imageUrl` snapshot.
- `totalCents()` retorna `null` se algum item não tiver preço — nesse caso o UI mostra "sob consulta".
- Não persista `title` do filho ou metadata do produto — sempre re-consulte via `trpc.product.byIds` para manter sincronizado.

## Checkout WhatsApp (apps/web/src/lib/whatsapp.ts)

Duas funções:
- `buildWhatsAppUrl({entries, paymentMethod, notes, storeName, phone})` — usa todo o carrinho.
- `buildSingleProductUrl({title, priceCents, storeName, phone})` — CTA direto no produto.

Número vem de `env.NEXT_PUBLIC_WHATSAPP_NUMBER` (só dígitos, DDI+DDD+número).

## Admin

- Login em `/admin/login` — POST `/api/admin/login` compara com `ADMIN_PASSWORD`, grava cookie HMAC (assinado com `ADMIN_SESSION_SECRET`).
- Middleware protege `/admin/*` (exceto `/admin/login`).
- Logout: POST `/api/admin/logout` apaga o cookie.
- **Placeholder**: trocar por `better-auth` quando quiser múltiplos admins / recuperação de senha. Mantenha a mesma forma do cookie para não quebrar tRPC.

## Convenções

- **Linguagem**: UI em **português do Brasil**. Código, commits, nomes de identificadores em **inglês**. Labels, toasts, copy visível = PT-BR.
- **Preços**: sempre armazene em `priceCents` (integer). Nunca salve decimal.
- **Slugs**: `[a-z0-9-]+`. Validado no schema Zod (`CreateProductSchema`).
- **Mídia**: sempre **1:1 (formato Instagram feed)**. Todos os `<Image>` e `aspect-*` de cartão/galeria devem usar `aspect-square`. A loja reutiliza conteúdo do Instagram da marca — nunca crie cards 4:5, 16:9, etc. Ao receber mídia de admin, avisar no form que 1:1 é o padrão (`media-manager.tsx`).
- **Fontes**: `Cormorant Garamond` (serif, títulos delicados) + `Inter` (sans, corpo). Variáveis `--font-serif` e `--font-sans` em `styles.css`.
- **Tema**: palette rose/pink (oklch) em `tooling/tailwind/theme.css`. Light-first.
- **Hero** (`apps/web/src/components/hero.tsx`): RSC-prefetchado via `trpc.product.catalog`, usa 1º produto com mídia como destaque grande (1:1) + thumbnails menores. Gradient rose + SVG `DecorSwirl` decorativo. Sempre que mexer na home, passar pelo hero antes de alterar o catálogo.
- **shadcn components**: importe direto do path granular (`@caixa/ui/button`, `@caixa/ui/input`), não do índice.
- **tRPC no cliente**: use `useTRPC()` hook + `useQuery(trpc.foo.queryOptions({...}))`. Invalide via `qc.invalidateQueries({ queryKey: trpc.foo.queryKey({...}) })`.
- **Commits**: Conventional Commits em inglês (`feat:`, `fix:`, `refactor:`, `chore:`). Sem emojis. Sem co-author.

## O que NÃO fazer

- Não adicione gateway de pagamento — estratégia atual é WhatsApp-only.
- Não duplique "product" em tabelas separadas por tipo (caixa vs item). Parent/child é o padrão.
- Não exponha produtos `hidden` em procedures públicas (`catalog`, `bySlug`, `byIds`).
- Não coloque lógica de negócio em componentes React — deixa em tRPC procedures ou em `apps/web/src/lib/*`.
- Não use `better-auth` ainda — middleware+cookie HMAC é o padrão atual. Ao migrar, atualize `adminProcedure` junto.
- Não importe `@caixa/db/client` em client components — só em server (RSC, route handlers, tRPC).

## Comandos úteis

```bash
pnpm dev:web              # web com hot reload
pnpm db:push              # aplica schema sem migrations (dev)
pnpm db:generate          # gera SQL migrations
pnpm db:migrate           # aplica migrations (prod)
pnpm db:seed              # popula com demo
pnpm db:studio            # Drizzle Studio
pnpm typecheck            # todos os pacotes
pnpm lint                 # todos os pacotes
```

## Arquivos críticos para mudanças comuns

- Novo campo em Product → `packages/db/src/schema.ts` + update Zod schemas no mesmo arquivo + `pnpm db:push` + ajustar form `apps/web/src/components/admin/product-form.tsx`.
- Novo filtro no catálogo → `packages/api/src/router/product.ts` (router), depois `apps/web/src/components/catalog.tsx`.
- Novo método de pagamento → constante `PAYMENT_METHODS` em `packages/db/src/schema.ts` + `paymentLabel()` em `apps/web/src/lib/format.ts`.
