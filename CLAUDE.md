# Encantim — project guide

Loja web de caixinhas artesanais personalizadas (presentes: dia das mães, aniversários). Checkout via WhatsApp (sem gateway de pagamento). Pacotes internos permanecem no namespace `@caixa/*` — só a marca pública mudou.

## Stack

- **Monorepo**: pnpm workspaces + Turborepo
- **Web**: Next.js 16 (App Router), React 19, Tailwind v4, shadcn/ui
- **API**: tRPC v11 (`@trpc/tanstack-react-query`)
- **DB**: Postgres + Drizzle ORM (`postgres-js` driver)
- **Carrinho**: zustand persistido em `localStorage`
- **Admin**: senha única + cookie HMAC (placeholder → migrar para better-auth)

## Estrutura

```
apps/web/                    # storefront + admin
packages/
├── api/                     # tRPC routers (productRouter)
├── db/                      # Drizzle schema + client postgres-js
├── ui/                      # shadcn/ui compartilhado
└── validators/              # zod compartilhado
tooling/{eslint,prettier,tailwind,typescript}
```

Namespace: `@caixa/*`.

## Modelo

Tabela única `product` com auto-relação:

- `parentId` → compõe caixas (ex.: sabonete é filho de "caixa das mães")
- `priceCents` opcional (integer centavos)
- `hidden` remove do catálogo público
- `paymentMethods: text[]` (pix | credito | debito | ted)
- Dimensões em mm (widthMm, heightMm, depthMm)
- Mídia em tabela separada `product_media` (kind image|video)

**Tudo é produto.** Não crie tabelas separadas por tipo.

## Padrões

- UI em PT-BR, código/commits em inglês
- Preços sempre em `priceCents` (integer)
- Slugs `[a-z0-9-]+`
- Commits: Conventional Commits, sem emojis, sem co-author
- `adminProcedure` para mutations protegidas; middleware Next valida cookie HMAC
- Componentes shadcn via path granular (`@caixa/ui/button`, não do índice)
- tRPC client: `useTRPC() + useQuery(trpc.x.queryOptions(...))`

## Não faça

- Não duplique product em tabelas por tipo
- Não exponha `hidden: true` em procedures públicas
- Não coloque lógica de negócio em componentes React
- Não importe `@caixa/db/client` em client components
- Não adicione gateway de pagamento — checkout é WhatsApp

## Comandos

```bash
pnpm dev:web       # 3000
pnpm db:push       # aplica schema (dev)
pnpm db:seed       # popula demo
pnpm typecheck     # todos pacotes
```

Detalhes completos em `.claude/skills/caixa-e-encantos/SKILL.md`.
