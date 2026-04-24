# Mimo

Loja de caixinhas artesanais personalizadas. Monorepo T3 Turbo (pnpm + turbo + Next 16 + tRPC v11 + Drizzle + Postgres).

## Stack

- **Web**: Next.js 16, React 19, Tailwind v4, shadcn/ui (via `@caixa/ui`)
- **API**: tRPC v11 (em `packages/api`), consumida pelo web via `@trpc/tanstack-react-query`
- **DB**: Postgres + Drizzle ORM (em `packages/db`), `postgres-js` driver
- **Carrinho**: zustand persistido em localStorage
- **Checkout**: WhatsApp (link `wa.me` com texto pré-montado — sem gateway de pagamento)
- **Admin**: senha única + cookie HMAC (placeholder — migrar para better-auth depois)

## Estrutura

```
apps/
└── web/                # Next.js app (storefront + admin)
packages/
├── api/                # tRPC routers
├── db/                 # schema Drizzle + client
├── ui/                 # componentes shadcn compartilhados
└── validators/         # schemas Zod compartilhados
tooling/
├── eslint/ prettier/ tailwind/ typescript/
```

## Modelo

**Produto polimórfico** (tabela única `product`):

- `parentId` aponta para outro produto → permite compor ("sabonete" filho de "caixa das mães")
- `priceCents` opcional (itens só expositivos ou compostos podem não ter preço individual)
- `hidden` esconde do catálogo público
- `paymentMethods` array: `pix`, `credito`, `debito`, `ted`
- Dimensões em mm: `widthMm`, `heightMm`, `depthMm`
- Mídia em tabela separada (`product_media`, suporta imagem e vídeo)

## Rodando localmente

```bash
pnpm install
cp .env.example .env            # preencha DATABASE_URL + ADMIN_PASSWORD
pnpm db:push                    # aplica schema
pnpm db:seed                    # popula com demo
pnpm dev:web                    # http://localhost:3000
```

Admin: `http://localhost:3000/admin` → login com `ADMIN_PASSWORD`.

## Fluxo de compra

1. Usuário navega pelo catálogo (`/`)
2. Entra no produto (`/produto/<slug>`), monta a caixinha selecionando filhos
3. Adiciona ao carrinho, ajusta quantidade, escolhe forma de pagamento
4. Botão "encomendar no WhatsApp" abre `wa.me` com a mensagem pronta

Não processamos pagamento na interface — tudo fecha no WhatsApp.
